import { prisma } from './prisma'
import type { Ingredient } from './grocery-list'

export interface MealSuggestion {
    id: string
    name: string
    description: string | null
    tags: string[]
    pantryMatchCount: number
    ingredientOverlapCount: number
    reason: string
}

export async function getMealSuggestions(limit: number = 3): Promise<MealSuggestion[]> {
    // Get pantry items
    const pantryItems = await prisma.pantryItem.findMany({
        where: { alwaysOnHand: true },
    })
    const pantryNames = new Set(pantryItems.map(p => p.name.toLowerCase()))

    // Get current week's dinner events
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + 6)

    const dinnerEvents = await prisma.dinnerEvent.findMany({
        where: {
            date: {
                gte: today,
                lte: endDate,
            },
        },
        include: {
            mealTemplate: true,
        },
    })

    // Collect ingredients already on the shopping list this week
    const weekIngredients = new Set<string>()
    const weekMealIds = new Set<string>()

    for (const event of dinnerEvents) {
        if (event.mealTemplateId) {
            weekMealIds.add(event.mealTemplateId)
        }
        if (event.mealTemplate) {
            const ingredients = event.mealTemplate.ingredients as Ingredient[]
            for (const ing of ingredients) {
                weekIngredients.add(ing.name.toLowerCase())
            }
        }
    }

    // Get all meal templates not already scheduled this week
    const allMeals = await prisma.mealTemplate.findMany({
        where: {
            id: {
                notIn: Array.from(weekMealIds),
            },
        },
    })

    // Score each meal by pantry coverage and ingredient overlap
    const scored: MealSuggestion[] = allMeals.map(meal => {
        const ingredients = meal.ingredients as Ingredient[]
        let pantryMatchCount = 0
        let ingredientOverlapCount = 0

        for (const ing of ingredients) {
            const name = ing.name.toLowerCase()
            if (pantryNames.has(name)) {
                pantryMatchCount++
            }
            if (weekIngredients.has(name)) {
                ingredientOverlapCount++
            }
        }

        // Generate reason
        let reason = ''
        if (pantryMatchCount > 0 && ingredientOverlapCount > 0) {
            reason = `Uses ${pantryMatchCount} pantry item(s) and shares ${ingredientOverlapCount} ingredient(s) with this week's meals`
        } else if (pantryMatchCount > 0) {
            reason = `Uses ${pantryMatchCount} pantry item(s) you already have`
        } else if (ingredientOverlapCount > 0) {
            reason = `Shares ${ingredientOverlapCount} ingredient(s) with this week's meals`
        } else {
            reason = 'Good for variety'
        }

        return {
            id: meal.id,
            name: meal.name,
            description: meal.description,
            tags: meal.tags,
            pantryMatchCount,
            ingredientOverlapCount,
            reason,
        }
    })

    // Sort by combined score (prioritize pantry matches, then overlaps)
    scored.sort((a, b) => {
        const scoreA = a.pantryMatchCount * 2 + a.ingredientOverlapCount
        const scoreB = b.pantryMatchCount * 2 + b.ingredientOverlapCount
        return scoreB - scoreA
    })

    return scored.slice(0, limit)
}

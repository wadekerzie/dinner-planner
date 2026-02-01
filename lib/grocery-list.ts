import { prisma } from './prisma'

export interface Ingredient {
    name: string
    category: string
}

export async function regenerateGroceryList() {
    // Get today's date at midnight
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Calculate end date (6 days from today = 7 day window)
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + 6)

    // Query all dinner events in the 7-day window
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

    // Get all pantry items that are always on hand
    const pantryItems = await prisma.pantryItem.findMany({
        where: {
            alwaysOnHand: true,
        },
    })
    const pantryNames = new Set(pantryItems.map(p => p.name.toLowerCase()))

    // Collect all ingredients from meal templates
    const ingredientMap = new Map<string, {
        name: string
        category: string
        fromMeals: string[]
    }>()

    for (const event of dinnerEvents) {
        let ingredients: Ingredient[] = []

        if (event.mealTemplate) {
            ingredients = event.mealTemplate.ingredients as Ingredient[]
        } else {
            // Try to find a matching meal template by title
            const matchedTemplate = await prisma.mealTemplate.findFirst({
                where: {
                    name: {
                        equals: event.title,
                        mode: 'insensitive',
                    },
                },
            })

            if (matchedTemplate) {
                ingredients = matchedTemplate.ingredients as Ingredient[]
            }
        }

        const mealName = event.mealTemplate?.name || event.title

        for (const ingredient of ingredients) {
            const key = ingredient.name.toLowerCase()

            // Skip if it's a pantry staple
            if (pantryNames.has(key)) continue

            if (ingredientMap.has(key)) {
                const existing = ingredientMap.get(key)!
                if (!existing.fromMeals.includes(mealName)) {
                    existing.fromMeals.push(mealName)
                }
            } else {
                ingredientMap.set(key, {
                    name: ingredient.name,
                    category: ingredient.category,
                    fromMeals: [mealName],
                })
            }
        }
    }

    // Deactivate any existing active lists
    await prisma.groceryList.updateMany({
        where: { isActive: true },
        data: { isActive: false },
    })

    // Create new grocery list
    const groceryList = await prisma.groceryList.create({
        data: {
            startDate: today,
            endDate: endDate,
            isActive: true,
            items: {
                create: Array.from(ingredientMap.values()).map(item => ({
                    name: item.name,
                    category: item.category,
                    fromMeals: item.fromMeals,
                    isChecked: false,
                })),
            },
        },
        include: {
            items: true,
        },
    })

    return groceryList
}

export async function getActiveGroceryList() {
    return prisma.groceryList.findFirst({
        where: { isActive: true },
        include: {
            items: {
                orderBy: [
                    { category: 'asc' },
                    { name: 'asc' },
                ],
            },
        },
    })
}

export async function toggleGroceryItem(itemId: string) {
    const item = await prisma.groceryListItem.findUnique({
        where: { id: itemId },
    })

    if (!item) return null

    return prisma.groceryListItem.update({
        where: { id: itemId },
        data: { isChecked: !item.isChecked },
    })
}

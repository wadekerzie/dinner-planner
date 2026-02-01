import { PrismaClient } from '../app/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as fs from 'fs'
import * as path from 'path'
import 'dotenv/config'

// Create Prisma client with adapter
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
}
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Helper to guess ingredient category based on common patterns
function guessCategory(ingredient: string): string {
    const lower = ingredient.toLowerCase()

    // Meat & Seafood
    if (/fish|halibut|salmon|shrimp|chicken|beef|pork|sirloin|steak|bacon|sausage|turkey|cod|tilapia|mussels|ribs|andouille|pepperoni|ham|roast beef|deli meat|hot dog/.test(lower)) return 'meat'

    // Dairy
    if (/cheese|butter|cream|milk|sour cream|yogurt|ricotta|mozzarella|parmesan|feta|mascarpone|goat cheese|provolone|cheddar|asiago|romano|monterey/.test(lower)) return 'dairy'

    // Produce
    if (/tomato|onion|pepper|garlic|lime|lemon|avocado|cilantro|parsley|cucumber|jalapeño|cabbage|mushroom|zucchini|lettuce|spinach|broccoli|carrot|celery|basil|mint|dill|rosemary|thyme|asparagus|squash|potato|beet|peach|apple|strawberr|kale|snap peas|edamame|corn|brussels|ginger/.test(lower)) return 'produce'

    // Frozen
    if (/frozen|ice cream/.test(lower)) return 'frozen'

    // Bakery
    if (/bread|baguette|roll|bun|pita|flatbread|pizza dough|ciabatta/.test(lower)) return 'bakery'

    // Pantry staples
    return 'pantry'
}

// Simple CSV parser that handles quoted fields
function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
            inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim())
            current = ''
        } else {
            current += char
        }
    }
    result.push(current.trim())
    return result
}

async function main() {
    console.log('🌱 Seeding database from CSV...')

    // Read the CSV file
    const csvPath = path.join(__dirname, 'meals.csv')

    if (!fs.existsSync(csvPath)) {
        console.error('❌ CSV file not found at:', csvPath)
        console.log('Please save your meals CSV file as: prisma/meals.csv')
        process.exit(1)
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n').filter(line => line.trim())

    let mealCount = 0
    let startParsing = false

    for (const line of lines) {
        // Skip until we find the header row
        if (line.startsWith('Recipe Name,')) {
            startParsing = true
            continue // Skip the header row itself
        }

        if (!startParsing) continue

        // Parse CSV line
        const columns = parseCSVLine(line)

        if (columns.length < 4) continue // Skip malformed rows

        const name = columns[0]?.trim()
        const category = columns[1]?.trim() || 'Dinner Ideas'
        const recipeUrl = columns[2]?.trim() || null
        const ingredientsRaw = columns[3]?.trim() || ''
        const tagsRaw = columns[4]?.trim() || ''

        if (!name) continue // Skip rows without a name

        // Parse ingredients (pipe-separated)
        const ingredients = ingredientsRaw
            .split('|')
            .map(i => i.trim())
            .filter(i => i)
            .map(name => ({
                name,
                category: guessCategory(name)
            }))

        // Parse tags (pipe-separated)
        const tags = tagsRaw
            .split('|')
            .map(t => t.trim())
            .filter(t => t)

        // Build description from category and URL
        let description = category
        if (recipeUrl && recipeUrl !== '—') {
            description = `${category} - ${recipeUrl}`
        }

        // Upsert the meal
        await prisma.mealTemplate.upsert({
            where: { name },
            update: {
                description,
                tags,
                ingredients,
            },
            create: {
                name,
                description,
                tags,
                ingredients,
            },
        })

        mealCount++
        console.log(`  ✓ ${name} (${ingredients.length} ingredients, ${tags.length} tags)`)
    }

    console.log(`\n✅ Imported ${mealCount} meals from CSV`)

    // Create default pantry staples (always on hand)
    const pantryItems = [
        { name: 'Salt', category: 'pantry' },
        { name: 'Black Pepper', category: 'pantry' },
        { name: 'Olive Oil', category: 'pantry' },
        { name: 'Garlic', category: 'produce' },
        { name: 'Butter', category: 'dairy' },
    ]

    for (const item of pantryItems) {
        await prisma.pantryItem.upsert({
            where: { name: item.name },
            update: { ...item, alwaysOnHand: true },
            create: { ...item, alwaysOnHand: true },
        })
    }

    console.log(`✅ Created ${pantryItems.length} pantry staples`)
    console.log('🎉 Seeding complete!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await pool.end()
        await prisma.$disconnect()
    })

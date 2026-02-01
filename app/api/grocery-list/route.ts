import { NextResponse } from 'next/server'
import { getActiveGroceryList } from '@/lib/grocery-list'

export async function GET() {
    try {
        const groceryList = await getActiveGroceryList()

        if (!groceryList) {
            return NextResponse.json({
                groceryList: null,
                message: 'No active grocery list found',
            })
        }

        // Group items by category for easier UI rendering
        const groupedItems = groceryList.items.reduce((acc, item) => {
            const category = item.category || 'other'
            if (!acc[category]) {
                acc[category] = []
            }
            acc[category].push(item)
            return acc
        }, {} as Record<string, typeof groceryList.items>)

        return NextResponse.json({
            groceryList: {
                id: groceryList.id,
                startDate: groceryList.startDate,
                endDate: groceryList.endDate,
                isActive: groceryList.isActive,
                createdAt: groceryList.createdAt,
                items: groceryList.items,
                groupedItems,
            },
        })
    } catch (error) {
        console.error('Error fetching grocery list:', error)
        return NextResponse.json(
            { error: 'Failed to fetch grocery list' },
            { status: 500 }
        )
    }
}

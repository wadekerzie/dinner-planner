import { NextResponse } from 'next/server'
import { regenerateGroceryList } from '@/lib/grocery-list'

export async function POST() {
    try {
        const groceryList = await regenerateGroceryList()

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
            success: true,
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
        console.error('Error refreshing grocery list:', error)
        return NextResponse.json(
            { error: 'Failed to refresh grocery list' },
            { status: 500 }
        )
    }
}

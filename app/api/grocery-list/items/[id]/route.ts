import { NextRequest, NextResponse } from 'next/server'
import { toggleGroceryItem } from '@/lib/grocery-list'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const item = await toggleGroceryItem(id)

        if (!item) {
            return NextResponse.json(
                { error: 'Item not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ item })
    } catch (error) {
        console.error('Error toggling item:', error)
        return NextResponse.json(
            { error: 'Failed to toggle item' },
            { status: 500 }
        )
    }
}

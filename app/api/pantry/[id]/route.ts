import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { name, category, alwaysOnHand } = body

        const pantryItem = await prisma.pantryItem.update({
            where: { id },
            data: {
                name: name?.trim().toLowerCase(),
                category: category?.trim().toLowerCase(),
                alwaysOnHand: alwaysOnHand,
            },
        })

        return NextResponse.json({ pantryItem })
    } catch (error: unknown) {
        console.error('Error updating pantry item:', error)
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Pantry item not found' },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to update pantry item' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.pantryItem.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        console.error('Error deleting pantry item:', error)
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Pantry item not found' },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to delete pantry item' },
            { status: 500 }
        )
    }
}

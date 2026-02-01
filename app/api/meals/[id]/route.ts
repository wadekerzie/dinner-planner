import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const meal = await prisma.mealTemplate.findUnique({
            where: { id },
        })

        if (!meal) {
            return NextResponse.json(
                { error: 'Meal not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ meal })
    } catch (error) {
        console.error('Error fetching meal:', error)
        return NextResponse.json(
            { error: 'Failed to fetch meal' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { name, description, tags, ingredients } = body

        const meal = await prisma.mealTemplate.update({
            where: { id },
            data: {
                name: name?.trim(),
                description: description?.trim() || null,
                tags: tags || [],
                ingredients: ingredients || [],
            },
        })

        return NextResponse.json({ meal })
    } catch (error: unknown) {
        console.error('Error updating meal:', error)
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Meal not found' },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to update meal' },
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
        await prisma.mealTemplate.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        console.error('Error deleting meal:', error)
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Meal not found' },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to delete meal' },
            { status: 500 }
        )
    }
}

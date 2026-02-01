import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const meals = await prisma.mealTemplate.findMany({
            orderBy: { name: 'asc' },
        })

        return NextResponse.json({ meals })
    } catch (error) {
        console.error('Error fetching meals:', error)
        return NextResponse.json(
            { error: 'Failed to fetch meals' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, description, tags, ingredients } = body

        if (!name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            )
        }

        const meal = await prisma.mealTemplate.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                tags: tags || [],
                ingredients: ingredients || [],
            },
        })

        return NextResponse.json({ meal }, { status: 201 })
    } catch (error: unknown) {
        console.error('Error creating meal:', error)
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            return NextResponse.json(
                { error: 'A meal with this name already exists' },
                { status: 409 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to create meal' },
            { status: 500 }
        )
    }
}

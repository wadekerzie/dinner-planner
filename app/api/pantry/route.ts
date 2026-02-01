import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const pantryItems = await prisma.pantryItem.findMany({
            orderBy: [
                { category: 'asc' },
                { name: 'asc' },
            ],
        })

        return NextResponse.json({ pantryItems })
    } catch (error) {
        console.error('Error fetching pantry items:', error)
        return NextResponse.json(
            { error: 'Failed to fetch pantry items' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, category, alwaysOnHand } = body

        if (!name || !category) {
            return NextResponse.json(
                { error: 'Name and category are required' },
                { status: 400 }
            )
        }

        const pantryItem = await prisma.pantryItem.create({
            data: {
                name: name.trim().toLowerCase(),
                category: category.trim().toLowerCase(),
                alwaysOnHand: alwaysOnHand ?? true,
            },
        })

        return NextResponse.json({ pantryItem }, { status: 201 })
    } catch (error: unknown) {
        console.error('Error creating pantry item:', error)
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            return NextResponse.json(
                { error: 'A pantry item with this name already exists' },
                { status: 409 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to create pantry item' },
            { status: 500 }
        )
    }
}

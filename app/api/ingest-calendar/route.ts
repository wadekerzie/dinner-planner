import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { regenerateGroceryList } from '@/lib/grocery-list'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { secret, date, title, notes, externalId } = body

        // Validate webhook secret
        const webhookSecret = process.env.WEBHOOK_SECRET
        if (!webhookSecret || secret !== webhookSecret) {
            return NextResponse.json(
                { error: 'Invalid webhook secret' },
                { status: 401 }
            )
        }

        // Validate required fields
        if (!date || !title) {
            return NextResponse.json(
                { error: 'Missing required fields: date and title' },
                { status: 400 }
            )
        }

        // Parse and validate date
        const eventDate = new Date(date)
        if (isNaN(eventDate.getTime())) {
            return NextResponse.json(
                { error: 'Invalid date format' },
                { status: 400 }
            )
        }

        // Normalize title for matching
        const normalizedTitle = title.trim().toLowerCase()

        // Try to find matching meal template
        const mealTemplate = await prisma.mealTemplate.findFirst({
            where: {
                name: {
                    equals: normalizedTitle,
                    mode: 'insensitive',
                },
            },
        })

        // Upsert dinner event (one per date)
        const dinnerEvent = await prisma.dinnerEvent.upsert({
            where: {
                date: eventDate,
            },
            update: {
                title: title.trim(),
                notes: notes || null,
                externalId: externalId || null,
                mealTemplateId: mealTemplate?.id || null,
                source: 'webhook',
            },
            create: {
                date: eventDate,
                title: title.trim(),
                notes: notes || null,
                externalId: externalId || null,
                mealTemplateId: mealTemplate?.id || null,
                source: 'webhook',
            },
            include: {
                mealTemplate: true,
            },
        })

        // Regenerate the grocery list
        const groceryList = await regenerateGroceryList()

        return NextResponse.json({
            success: true,
            message: 'Dinner event processed',
            dinnerEvent: {
                id: dinnerEvent.id,
                date: dinnerEvent.date,
                title: dinnerEvent.title,
                matched: !!dinnerEvent.mealTemplateId,
                matchedMeal: dinnerEvent.mealTemplate?.name || null,
            },
            groceryListItemCount: groceryList.items.length,
        })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

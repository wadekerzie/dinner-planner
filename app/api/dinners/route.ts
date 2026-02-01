import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Get today's date at midnight
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Calculate end date (6 days from today = 7 day window)
        const endDate = new Date(today)
        endDate.setDate(endDate.getDate() + 6)

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
            orderBy: {
                date: 'asc',
            },
        })

        return NextResponse.json({
            dinners: dinnerEvents.map(event => ({
                id: event.id,
                date: event.date,
                title: event.title,
                notes: event.notes,
                source: event.source,
                mealTemplate: event.mealTemplate ? {
                    id: event.mealTemplate.id,
                    name: event.mealTemplate.name,
                    description: event.mealTemplate.description,
                    tags: event.mealTemplate.tags,
                } : null,
            })),
            dateRange: {
                start: today,
                end: endDate,
            },
        })
    } catch (error) {
        console.error('Error fetching dinners:', error)
        return NextResponse.json(
            { error: 'Failed to fetch dinners' },
            { status: 500 }
        )
    }
}

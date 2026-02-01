import { NextResponse } from 'next/server'
import { getMealSuggestions } from '@/lib/suggestions'

export async function GET() {
    try {
        const suggestions = await getMealSuggestions(3)

        return NextResponse.json({ suggestions })
    } catch (error) {
        console.error('Error fetching suggestions:', error)
        return NextResponse.json(
            { error: 'Failed to fetch suggestions' },
            { status: 500 }
        )
    }
}

'use server'

import { auth } from '@/auth'

export async function addToGoogleCalendar(event: {
    title: string
    description?: string
    startTime: string // ISO string
    endTime: string // ISO string
}) {
    const session = await auth()

    // @ts-ignore
    const accessToken = session?.accessToken

    if (!accessToken) {
        return { success: false, error: 'Not authenticated with Google' }
    }

    try {
        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                summary: event.title,
                description: event.description || 'Added via GravityLess Finance',
                start: {
                    dateTime: event.startTime,
                    timeZone: 'Asia/Kolkata', // Hardcoded for now, ideal to get from user
                },
                end: {
                    dateTime: event.endTime,
                    timeZone: 'Asia/Kolkata',
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 24 * 60 },
                        { method: 'popup', minutes: 10 },
                    ],
                },
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('Google Calendar API Error:', errorData)
            return { success: false, error: errorData.error?.message || 'Failed to add event' }
        }

        const data = await response.json()
        return { success: true, link: data.htmlLink }
    } catch (error) {
        console.error('Calendar Action Error:', error)
        return { success: false, error: 'Network or Server Error' }
    }
}

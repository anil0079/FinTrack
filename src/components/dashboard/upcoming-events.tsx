'use client'

import { Card } from '@/components/ui/core'
import { Calendar, Bell, ChevronRight, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/core'
import { addToGoogleCalendar } from '@/app/actions/calendar'
import { useState } from 'react'

export function UpcomingEvents({ events }: { events: any[] }) {
    const [loadingIds, setLoadingIds] = useState<string[]>([])
    const [successIds, setSuccessIds] = useState<string[]>([])

    const handleAddToCalendar = async (event: any, index: number) => {
        const id = `${event.title}-${index}`
        setLoadingIds(prev => [...prev, id])

        // Construct dates (Assume 1 hour duration)
        const startDate = new Date(event.date)
        const endDate = new Date(event.date)
        endDate.setHours(startDate.getHours() + 1)

        const result = await addToGoogleCalendar({
            title: `GravityLess: ${event.title}`,
            description: `Payout Amount: ${event.amount} | Type: ${event.type}`,
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString()
        })

        setLoadingIds(prev => prev.filter(i => i !== id))

        if (result.success) {
            setSuccessIds(prev => [...prev, id])
            // Remove success check after 3s
            setTimeout(() => {
                setSuccessIds(prev => prev.filter(i => i !== id))
            }, 3000)

            if (result.link) {
                window.open(result.link, '_blank')
            }
        } else {
            alert(`Failed: ${result.error}. Try signing out and signing in again to grant permissions.`)
        }
    }

    if (!events || events.length === 0) {
        return (
            <Card className="p-6 h-full flex flex-col justify-center items-center text-center space-y-2 text-slate-400">
                <Calendar className="w-8 h-8 opacity-50 mb-2" />
                <h3 className="font-medium text-slate-300">No Upcoming Events</h3>
                <p className="text-xs">Add Payout Dates or Maturity Dates to your income sources to see them here.</p>
            </Card>
        )
    }

    return (
        <Card className="p-6 h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    Upcoming Events
                </h3>
            </div>

            <div className="space-y-4">
                {events.map((event, i) => {
                    const id = `${event.title}-${i}`
                    const isLoading = loadingIds.includes(id)
                    const isSuccess = successIds.includes(id)

                    return (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg ${event.type === 'Maturity' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'} border border-white/5`}>
                                    <span className="text-xs font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="text-lg font-bold leading-none">{new Date(event.date).getDate()}</span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-200">{event.title}</h4>
                                    <p className="text-xs text-slate-400">
                                        <span className={`${event.type === 'Maturity' ? 'text-purple-400' : 'text-green-400'} font-medium`}>
                                            ₹{event.amount.toLocaleString()}
                                        </span>
                                        {event.investedAmount > 0 && (
                                            <span className="text-slate-500 font-normal ml-1">
                                                ({event.type === 'Maturity' ? 'Invested' : `from ₹${event.investedAmount.toLocaleString()}`})
                                            </span>
                                        )}
                                        {' • '}
                                        {event.daysUntil === 0 ? 'Today' : `in ${event.daysUntil} days`}
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                className={`text-slate-400 hover:text-white ${isSuccess ? 'text-green-400' : ''}`}
                                onClick={() => handleAddToCalendar(event, i)}
                                disabled={isLoading || isSuccess}
                                title="Add to Google Calendar"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isSuccess ? <Check className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                            </Button>
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}

'use client'

import React from 'react'
import { Card, Button } from '@/components/ui/core'
import { Bell, CheckCircle, Clock, Calendar } from 'lucide-react'

export default function NotificationsPage() {
    const tasks = [
        { id: 1, title: 'Check Monthly Payout from Bonds', date: 'Today, 10:00 AM', source: 'Google Tasks', status: 'Pending' },
        { id: 2, title: 'Review Portfolio Re-balancing', date: 'Tomorrow, 09:00 AM', source: 'System', status: 'Scheduled' },
        { id: 3, title: 'Emergency Fund Low Warning', date: 'Yesterday', source: 'System', status: 'Read' },
    ]

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans pb-24 md:pb-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Notifications</h1>
                        <p className="text-slate-400 text-sm">Syncing with Google Tasks</p>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-full border border-slate-800">
                        <Bell className="w-5 h-5 text-blue-400" />
                    </div>
                </header>

                <div className="space-y-4">
                    {tasks.map(task => (
                        <Card key={task.id} className="p-4 flex gap-4 items-start hover:bg-slate-900/50 transition-colors cursor-pointer">
                            <div className={`mt-1 p-2 rounded-full ${task.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-slate-800 text-slate-400'}`}>
                                {task.status === 'Pending' ? <Clock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-slate-200">{task.title}</h4>
                                <div className="flex gap-4 mt-2 text-xs text-slate-500">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {task.date}</span>
                                    <span>via {task.source}</span>
                                </div>
                            </div>
                            {task.status === 'Pending' && (
                                <Button variant="outline" className="text-xs h-8">Done</Button>
                            )}
                        </Card>
                    ))}
                </div>

                <div className="text-center pt-8">
                    <Button variant="ghost" className="text-slate-500 text-sm">
                        View Google Tasks History
                    </Button>
                </div>
            </div>
        </div>
    )
}

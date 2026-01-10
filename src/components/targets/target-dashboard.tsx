'use client'

import React, { useState } from 'react'
import { Card, Button, Input, Label } from '@/components/ui/core'
import { Target, TrendingUp } from 'lucide-react'

export default function TargetDashboard() {
    const [goals, setGoals] = useState([
        { id: 1, name: 'Model S', target: 8000000, current: 2500000, date: '2027-01-01' },
        { id: 2, name: 'Home Downpayment', target: 5000000, current: 1200000, date: '2026-06-01' }
    ])

    // Simple Future Value / SIP Calc logic (Client-side for demo)
    const calculateRequiredSIP = (goal: any) => {
        const targetDate = new Date(goal.date)
        const now = new Date()
        const months = (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth())

        if (months <= 0) return 0

        const remaining = goal.target - goal.current
        // Assuming 12% annual return
        const r = 0.12 / 12
        // PMT formula approximation for SIP
        // FV = P * ((1+r)^n - 1)/r * (1+r)
        // We need P.
        // Roughly: P = FV / ( ((1+r)^n - 1)/r * (1+r) )

        const factor = ((Math.pow(1 + r, months) - 1) / r) * (1 + r)
        return remaining / factor
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map(goal => {
                    const sip = calculateRequiredSIP(goal)
                    const progress = (goal.current / goal.target) * 100

                    return (
                        <Card key={goal.id} className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-white">{goal.name}</h3>
                                    <p className="text-sm text-slate-400">Target: {new Date(goal.date).toLocaleDateString()}</p>
                                </div>
                                <div className="p-2 bg-slate-800 rounded-full text-blue-400">
                                    <Target className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="mb-2 flex justify-between text-sm">
                                <span className="text-slate-400">Progress</span>
                                <span className="text-white font-medium">{progress.toFixed(1)}%</span>
                            </div>

                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${progress}%` }} />
                            </div>

                            <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 flex items-center gap-3">
                                <TrendingUp className="w-8 h-8 text-green-400" />
                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider">Required Monthly SIP</div>
                                    <div className="text-lg font-bold text-white">₹{sip.toFixed(0).toLocaleString()}</div>
                                    <div className="text-[10px] text-slate-600">Assuming 12% returns</div>
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>

            <div className="p-4 rounded-lg border border-dashed border-slate-700 text-center text-slate-500 hover:border-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                + Add New Goal
            </div>
        </div>
    )
}

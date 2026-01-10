'use client'

import React, { useState } from 'react'
import { Card, Button } from '@/components/ui/core'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts'
import { ALLOCATION_STRATEGIES } from '@/lib/optimization'

const COLORS = ['#ef4444', '#10b981', '#3b82f6', '#f59e0b'];

export default function AllocationDashboard() {
    const [selectedStrategy, setSelectedStrategy] = useState<keyof typeof ALLOCATION_STRATEGIES>('emergency_first')
    const strategy = ALLOCATION_STRATEGIES[selectedStrategy]

    const chartData = [
        { name: 'Emergency Fund', value: strategy.allocation.emergency },
        { name: 'Safe Investments', value: strategy.allocation.safe },
        { name: 'Growth/Market', value: strategy.allocation.growth },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-4">
                <h3 className="text-xl font-semibold mb-4 text-white">Select Strategy</h3>
                {Object.entries(ALLOCATION_STRATEGIES).map(([key, strat]) => (
                    <button
                        key={key}
                        onClick={() => setSelectedStrategy(key as any)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${selectedStrategy === key ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/50' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}`}
                    >
                        <div className="font-bold text-slate-100">{strat.name}</div>
                        <div className="text-xs text-slate-400 mt-1">{strat.description}</div>
                    </button>
                ))}
            </div>

            <div className="md:col-span-2 space-y-6">
                <Card className="p-6 h-[400px] flex flex-col justify-center items-center">
                    <h3 className="text-lg font-medium text-slate-300 mb-2">Projected Allocation</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} itemStyle={{ color: '#fff' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="p-6 bg-slate-900/50">
                    <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-purple-400 mb-2">
                        Why this works
                    </h4>
                    <p className="text-slate-300 italic leading-relaxed">
                        "{strategy.theory}"
                    </p>
                </Card>
            </div>
        </div>
    )
}

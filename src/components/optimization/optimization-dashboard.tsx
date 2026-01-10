'use client'

import React from 'react'
import { Card } from '@/components/ui/core'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts'
import { calculateMetrics, suggestOptimization } from '@/lib/optimization'

export default function OptimizationDashboard({ data }: { data: any[] }) {
    const metrics = data.map(calculateMetrics)
    const suggestions = suggestOptimization(metrics)

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 text-white">ROI per Hour</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics}>
                                <XAxis dataKey="item" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Bar dataKey="roiPerHour" fill="#3b82f6" radius={[4, 4, 0, 0]} name="₹/Hour" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-sm text-slate-400 mt-4">
                        Calculated as: Monthly Income ÷ (Weekly Hours × 4.33).
                        Higher bars indicate better time efficiency.
                    </p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-950">
                    <h3 className="text-xl font-semibold mb-4 text-white">AI Suggestion Engine</h3>
                    <div className="space-y-4">
                        {suggestions.warnings.length > 0 ? (
                            suggestions.warnings.map((warn, i) => (
                                <div key={i} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm">
                                    {warn}
                                </div>
                            ))
                        ) : (
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-200 text-sm">
                                Your portfolio is efficient. No critical leaks detected.
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-slate-800">
                            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">The Theory</h4>
                            <p className="text-xs text-slate-400 leading-relaxed italic">
                                "{suggestions.theory}"
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}

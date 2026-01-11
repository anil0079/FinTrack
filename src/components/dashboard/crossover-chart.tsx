'use client'

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'
import { Card } from '@/components/ui/core'
import { calculateIncomeMetrics } from '@/lib/financials'

export function CrossoverChart({ incomeSources, monthlyExpense }: { incomeSources: any[], monthlyExpense: number }) {
    // Projection Logic
    // We want to see when Passive Income > Expenses
    // And also Passive > Active

    const activeSources = incomeSources.filter(s => s.type !== 'Passive' && s.type !== 'Semi-Passive')
    const passiveSources = incomeSources.filter(s => s.type === 'Passive' || s.type === 'Semi-Passive')

    const currentActive = activeSources.reduce((acc: number, s: any) => acc + calculateIncomeMetrics(s).monthly, 0)
    const currentPassive = passiveSources.reduce((acc: number, s: any) => acc + calculateIncomeMetrics(s).monthly, 0)

    // Assumptions
    const passiveGrowthRate = 0.10 // 10% annual increase in passive income (reinvestment)
    const expenseInflation = 0.06 // 6% inflation
    const activeGrowthRate = 0.05 // 5% salary hike

    const years = 20
    const data = []

    let pIncome = currentPassive
    let aIncome = currentActive
    let expense = monthlyExpense === 0 ? currentActive * 0.5 : monthlyExpense // Fallback if no expenses recorded

    for (let i = 0; i <= years; i++) {
        data.push({
            year: `Y${i}`,
            Passive: Math.round(pIncome),
            Active: Math.round(aIncome),
            Expense: Math.round(expense),
            FreedomLine: Math.round(expense) // Duplicate for visualization preference if needed
        })

        pIncome = pIncome * (1 + passiveGrowthRate)
        aIncome = aIncome * (1 + activeGrowthRate)
        expense = expense * (1 + expenseInflation)
    }

    return (
        <Card className="p-6 bg-slate-900 border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-2">Financial Freedom Crossover</h3>
            <p className="text-sm text-slate-400 mb-6">Projecting when Passive Income exceeds Expenses (Inflation adjusted).</p>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPassive" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="year" stroke="#475569" fontSize={12} />
                        <YAxis stroke="#475569" fontSize={12} tickFormatter={(value: any) => `₹${value / 1000}k`} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                            itemStyle={{ color: '#e2e8f0' }}
                            formatter={(value: any) => [`₹${(value || 0).toLocaleString()}`, '']}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="Passive" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPassive)" strokeWidth={3} />
                        <Area type="monotone" dataKey="Expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} strokeDasharray="5 5" />
                        <Area type="monotone" dataKey="Active" stroke="#10b981" fill="none" strokeWidth={2} opacity={0.5} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 text-center text-xs text-slate-500">
                <div>*Assumed Start Investment: Current</div>
                <div>*Passive Growth: 10%</div>
                <div>*Inflation: 6%</div>
            </div>
        </Card>
    )
}

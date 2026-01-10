'use client'

import React, { useState } from 'react'
import { IncomeForm } from '@/components/income/income-form'
import { IncomeList } from '@/components/income/income-list'

export default function IncomePageClient({ initialSources }: { initialSources: any[] }) {
    const [editingSource, setEditingSource] = useState<any>(null)

    // Recalculate stats from props (since page is server component but we want fresh stats if we did client side optim update, 
    // though typically we rely on server refresh. For now, use initialSources as they come from server wrapper)
    const sources = initialSources

    const totalMonthly = sources.reduce((acc, s) => acc + s.monthlyIncome, 0)
    const totalAnnual = totalMonthly * 12

    // Passive Income Logic
    const passiveSources = sources.filter(s => s.type === 'Passive' || s.type === 'Semi-Passive')
    const passiveMonthly = passiveSources.reduce((acc, s) => acc + s.monthlyIncome, 0)
    const passivePercent = totalMonthly > 0 ? (passiveMonthly / totalMonthly) * 100 : 0

    // Total CAGR (Weighted by Investment)
    const totalInvested = sources.reduce((acc, s) => acc + s.amountInvested, 0)
    const weightedGrowthSum = sources.reduce((acc, s) => acc + (s.growthRate * s.amountInvested), 0)
    const totalCAGR = totalInvested > 0 ? weightedGrowthSum / totalInvested : 0

    const handleEdit = (source: any) => {
        setEditingSource(source)
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleCancelEdit = () => {
        setEditingSource(null)
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans pb-24 md:pb-8">
            <div className="max-w-6xl mx-auto space-y-8">

                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            Income Engine
                        </h1>
                        <p className="text-slate-400 mt-1">Manage bonds, jobs, and passive streams.</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg text-center backdrop-blur">
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Passive Income</div>
                            <div className="text-lg font-bold text-purple-400">{passivePercent.toFixed(1)}%</div>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg text-center backdrop-blur">
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Total CAGR</div>
                            <div className="text-lg font-bold text-blue-400">{totalCAGR.toFixed(1)}%</div>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg text-center backdrop-blur">
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Total Monthly</div>
                            <div className="text-lg font-bold text-emerald-400">₹{totalMonthly.toLocaleString()}</div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-1">
                        <IncomeForm editingSource={editingSource} onCancelEdit={handleCancelEdit} />
                    </div>

                    {/* Right Column: List */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-semibold mb-4 text-slate-200">Your Portfolio</h2>
                        <IncomeList sources={sources} onEdit={handleEdit} />
                    </div>
                </div>

            </div>
        </div>
    )
}

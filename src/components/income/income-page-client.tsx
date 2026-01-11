'use client'

import React, { useState, useEffect } from 'react'
import { IncomeForm } from '@/components/income/income-form'
import { IncomeList } from '@/components/income/income-list'
import { Modal } from '@/components/ui/modal'
import { calculateIncomeMetrics } from '@/lib/financials'

export default function IncomePageClient({ initialSources }: { initialSources: any[] }) {
    const [editingSource, setEditingSource] = useState<any>(null)
    const [showForm, setShowForm] = useState(false)

    // Recalculate stats from props (since page is server component but we want fresh stats if we did client side optim update, 
    // though typically we rely on server refresh. For now, use initialSources as they come from server wrapper)
    const sources = initialSources

    const calculatedMetrics = sources.map(s => calculateIncomeMetrics(s))
    const totalMonthly = Math.round(calculatedMetrics.reduce((acc, m) => acc + m.monthly, 0))
    const totalAnnual = totalMonthly * 12
    const inHandMonthly = sources.filter(s => s.inHand).reduce((acc, s) => acc + s.monthlyIncome, 0)
    const totalInvested = sources.reduce((acc, s) => acc + s.amountInvested, 0)
    const totalCurrentValue = Math.round(calculatedMetrics.reduce((acc, m) => acc + m.current, 0))
    const totalNetValue = Math.round(calculatedMetrics.reduce((acc, m) => acc + m.net, 0))
    const totalTDSCurrentFY = Math.round(calculatedMetrics.reduce((acc, m) => acc + m.tdsCurrentFY, 0))

    // Passive Income Metrics
    const passiveMonthly = Math.round(calculatedMetrics.filter(m => m.type === 'Passive' || m.type === 'Semi-Passive').reduce((acc, m) => acc + m.monthly, 0))
    const passivePercent = totalMonthly > 0 ? (passiveMonthly / totalMonthly) * 100 : 0

    // Average Realized CAGR (Weighted by Investment)
    const weightedCAGRSum = calculatedMetrics.reduce((acc, m) => acc + (m.cagr * m.invested), 0)
    const avgRealizedCAGR = totalInvested > 0 ? weightedCAGRSum / totalInvested : 0
    const netWorth = totalNetValue // Net Value reflects the true total portfolio worth

    const handleEdit = (source: any) => {
        setEditingSource(source)
        setShowForm(true)
    }

    const handleCancelEdit = () => {
        setEditingSource(null)
        setShowForm(false)
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans pb-24 md:pb-8">
            <div className="max-w-6xl mx-auto space-y-8">

                <header className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                Income Engine
                            </h1>
                            <p className="text-slate-400 mt-1">Manage bonds, jobs, and passive streams.</p>
                        </div>
                    </div>

                    {/* Top Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 p-4 rounded-lg backdrop-blur">
                            <div className="text-xs text-emerald-400 uppercase tracking-wider mb-1">Total Monthly</div>
                            <div className="text-2xl font-bold text-emerald-300">₹{totalMonthly.toLocaleString()}</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-4 rounded-lg backdrop-blur">
                            <div className="text-xs text-blue-400 uppercase tracking-wider mb-1">In-Hand</div>
                            <div className="text-2xl font-bold text-blue-300">₹{inHandMonthly.toLocaleString()}</div>
                        </div>
                        <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 p-4 rounded-lg backdrop-blur">
                            <div className="text-xs text-cyan-400 uppercase tracking-wider mb-1">Annual</div>
                            <div className="text-2xl font-bold text-cyan-300">₹{totalAnnual.toLocaleString()}</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 p-4 rounded-lg backdrop-blur">
                            <div className="text-xs text-purple-400 uppercase tracking-wider mb-1">Passive</div>
                            <div className="text-xl font-bold text-purple-300">₹{passiveMonthly.toLocaleString()}</div>
                            <div className="text-xs text-purple-400 mt-1">({passivePercent.toFixed(1)}%)</div>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20 p-4 rounded-lg backdrop-blur">
                            <div className="text-xs text-indigo-400 uppercase tracking-wider mb-1">Avg Realized CAGR</div>
                            <div className="text-2xl font-bold text-indigo-300">{avgRealizedCAGR.toFixed(1)}%</div>
                        </div>
                        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 p-4 rounded-lg backdrop-blur">
                            <div className="text-xs text-amber-400 uppercase tracking-wider mb-1">Current Assets</div>
                            <div className="text-2xl font-bold text-amber-300">₹{totalCurrentValue.toLocaleString()}</div>
                            <div className="text-[10px] text-amber-500 mt-0.5">Total Valuation</div>
                        </div>
                    </div>
                </header>

                {/* Modal Form */}
                <Modal
                    isOpen={showForm}
                    onClose={handleCancelEdit}
                    title={editingSource ? 'Edit Income Source' : 'Add New Income Source'}
                >
                    <IncomeForm editingSource={editingSource} onCancelEdit={handleCancelEdit} />
                </Modal>

                {/* Portfolio List */}
                <div>
                    <IncomeList sources={sources} onEdit={handleEdit} onShowForm={() => setShowForm(true)} />
                </div>

            </div>
        </div>
    )
}

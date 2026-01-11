'use client'

import { Card } from '@/components/ui/core'
import { TrendingUp, Wallet, CreditCard } from 'lucide-react'
import { calculateIncomeMetrics } from '@/lib/financials'

type NetWorthCardProps = {
    incomeSources: any[]
    expenses?: any[]
}

export function NetWorthCard({ incomeSources, expenses = [] }: NetWorthCardProps) {
    // Calculate metrics for all sources
    const calculatedMetrics = incomeSources.map(s => ({
        ...s,
        metrics: calculateIncomeMetrics(s)
    }))

    // Calculate Totals using centralized math
    const totalInvested = calculatedMetrics.reduce((acc, s) => acc + s.metrics.invested, 0)
    const totalAssets = calculatedMetrics.reduce((acc, s) => acc + s.metrics.current, 0)
    const totalNetValue = calculatedMetrics.reduce((acc, s) => acc + s.metrics.net, 0)

    // Calculate Total Liabilities (sum of expenses if tracked)
    const totalLiabilities = expenses.reduce((acc, expense) => acc + (expense.amount || 0), 0)

    // Net Worth = Total Portfolio Net Value - Liabilities
    // We use net value because it includes accrued interest
    const netWorth = totalNetValue - totalLiabilities

    // Liquid assets (in-hand or payout frequency is set usually means liquid flow)
    const liquidAssets = calculatedMetrics
        .filter(s => s.inHand)
        .reduce((acc, s) => acc + s.metrics.invested, 0)

    // Locked assets (current value of growth-based investments)
    const lockedAssets = calculatedMetrics
        .filter(s => !s.inHand)
        .reduce((acc, s) => acc + s.metrics.current, 0)

    return (
        <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-emerald-400" />
                    Net Worth
                </h3>
            </div>

            <div className="space-y-6">
                {/* Main Net Worth */}
                <div className="text-center p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-lg">
                    <div className="text-sm text-emerald-400 uppercase tracking-wider mb-2">Total Net Worth</div>
                    <div className="text-4xl font-bold text-emerald-300">₹{netWorth.toLocaleString()}</div>
                    <div className="text-xs text-emerald-500 mt-1">Invested: ₹{totalInvested.toLocaleString()}</div>
                    {totalAssets > totalInvested && (
                        <div className="text-xs text-green-400 mt-1">
                            +₹{(totalAssets - totalInvested).toLocaleString()} growth
                        </div>
                    )}
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-blue-400" />
                            <span className="text-xs text-blue-400 uppercase tracking-wider">Assets</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-300">₹{totalAssets.toLocaleString()}</div>
                        <div className="mt-2 text-xs text-slate-400">
                            <div>Liquid: ₹{liquidAssets.toLocaleString()}</div>
                            <div>Locked: ₹{lockedAssets.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="w-4 h-4 text-red-400" />
                            <span className="text-xs text-red-400 uppercase tracking-wider">Liabilities</span>
                        </div>
                        <div className="text-2xl font-bold text-red-300">₹{totalLiabilities.toLocaleString()}</div>
                        <div className="mt-2 text-xs text-slate-400">
                            {expenses.length} expense(s)
                        </div>
                    </div>
                </div>

                {/* Asset Allocation Bar */}
                <div className="space-y-2">
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Asset Allocation</div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex">
                        {liquidAssets > 0 && (
                            <div
                                className="bg-blue-500 h-full transition-all"
                                style={{ width: `${(liquidAssets / totalAssets) * 100}%` }}
                                title={`Liquid: ${((liquidAssets / totalAssets) * 100).toFixed(1)}%`}
                            />
                        )}
                        {lockedAssets > 0 && (
                            <div
                                className="bg-purple-500 h-full transition-all"
                                style={{ width: `${(lockedAssets / totalAssets) * 100}%` }}
                                title={`Locked: ${((lockedAssets / totalAssets) * 100).toFixed(1)}%`}
                            />
                        )}
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>💧 Liquid {((liquidAssets / totalAssets) * 100).toFixed(0)}%</span>
                        <span>🔒 Locked {((lockedAssets / totalAssets) * 100).toFixed(0)}%</span>
                    </div>
                </div>
            </div>
        </Card>
    )
}

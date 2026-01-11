import { auth } from '@/auth'
import { getDashboardData } from '@/app/actions/dashboard'
import { Card } from '@/components/ui/core'
import { Wallet, TrendingUp, ArrowDownRight, PiggyBank, ArrowUpRight } from 'lucide-react'
import { CrossoverChart } from '@/components/dashboard/crossover-chart'
import { UpcomingEvents } from '@/components/dashboard/upcoming-events'
import { NetWorthCard } from '@/components/dashboard/net-worth-card'

import { calculateIncomeMetrics } from '@/lib/financials'

export default async function DashboardPage() {
    const session = await auth()
    const data: any = await getDashboardData()

    const { totalMonthlyIncome, totalMonthlyExpense, savingsRate, incomeSources, upcomingEvents, monthlyExpenses } = data

    // Passive Check
    const passiveIncome = incomeSources
        .filter((s: any) => s.type === 'Passive' || s.type === 'Semi-Passive')
        .reduce((acc: number, s: any) => acc + calculateIncomeMetrics(s).monthly, 0)

    const freedomRatio = totalMonthlyExpense > 0 ? (passiveIncome / totalMonthlyExpense) * 100 : 0

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 font-sans pb-24 md:pb-8">
            <div className="max-w-7xl mx-auto space-y-8">

                <header>
                    <h1 className="text-3xl font-bold text-white leading-tight">Financial Dashboard <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full ml-2">Synced v1.1</span></h1>
                    <p className="text-slate-400">Your gravity-less journey at a glance.</p>
                </header>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4 bg-slate-900 border-slate-800 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Total Income</p>
                                <h3 className="text-2xl font-bold text-emerald-400">₹{totalMonthlyIncome.toLocaleString()}</h3>
                            </div>
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Wallet className="w-5 h-5" /></div>
                        </div>
                    </Card>

                    <Card className="p-4 bg-slate-900 border-slate-800 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Monthly Spend</p>
                                <h3 className="text-2xl font-bold text-red-400">₹{totalMonthlyExpense.toLocaleString()}</h3>
                            </div>
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><ArrowDownRight className="w-5 h-5" /></div>
                        </div>
                    </Card>

                    <Card className="p-4 bg-slate-900 border-slate-800 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Savings Rate</p>
                                <h3 className={`text-2xl font-bold ${savingsRate > 20 ? 'text-blue-400' : 'text-yellow-400'}`}>
                                    {savingsRate.toFixed(1)}%
                                </h3>
                            </div>
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><PiggyBank className="w-5 h-5" /></div>
                        </div>
                    </Card>

                    <Card className="p-4 bg-slate-900 border-slate-800 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/20 to-transparent blur-xl"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Freedom Ratio</p>
                                <h3 className="text-2xl font-bold text-purple-400">{freedomRatio.toFixed(1)}%</h3>
                                <p className="text-[10px] text-slate-500">Passive / Expense</p>
                            </div>
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><TrendingUp className="w-5 h-5" /></div>
                        </div>
                    </Card>
                </div>

                {/* Charts & Events Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chart */}
                    <div className="lg:col-span-2">
                        <CrossoverChart incomeSources={incomeSources} monthlyExpense={totalMonthlyExpense} />
                    </div>

                    {/* Right Column: Upcoming & Quick Actions */}
                    <div className="space-y-6 flex flex-col h-full">
                        {/* Upcoming Events */}
                        <div className="flex-1">
                            <UpcomingEvents events={upcomingEvents || []} />
                        </div>

                        <Card className="p-6 bg-slate-900 border-slate-800">
                            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <a href="/income" className="block p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors flex justify-between items-center group">
                                    <span className="text-sm font-medium text-slate-200">Add Income Source</span>
                                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                                </a>
                                <a href="/expenses" className="block p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors flex justify-between items-center group">
                                    <span className="text-sm font-medium text-slate-200">Log Expense</span>
                                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400" />
                                </a>
                                <a href="/targets" className="block p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors flex justify-between items-center group">
                                    <span className="text-sm font-medium text-slate-200">Check Targets</span>
                                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-red-400" />
                                </a>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Net Worth Card */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <NetWorthCard incomeSources={incomeSources} expenses={monthlyExpenses || []} />
                </div>

            </div>
        </div>
    )
}

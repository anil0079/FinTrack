'use client'

import React, { useState } from 'react'
import { Card, Button } from '@/components/ui/core'
import { Plus, CreditCard, Home, TrendingUp, AlertCircle, Calendar, Trash2 } from 'lucide-react'
import ExpenseForm from './expense-form'
import { deleteExpense } from '@/app/actions/expense'

export default function ExpenseDashboard({ initialExpenses, budgetData }: { initialExpenses: any[], budgetData: any }) {
    const [expenses, setExpenses] = useState(initialExpenses)
    const [showForm, setShowForm] = useState(false)

    const totalMonthlyIncome = budgetData?.totalMonthlyIncome || 0
    const recurringExpenses = expenses.filter(e => e.isRecurring)
    const oneOffExpenses = expenses.filter(e => !e.isRecurring)

    const totalRecurring = recurringExpenses.reduce((sum, e) => sum + e.amount, 0)
    const dtiRatio = totalMonthlyIncome > 0 ? (totalRecurring / totalMonthlyIncome) * 100 : 0

    const handleDelete = async (id: string) => {
        if (confirm('Delete this expense?')) {
            await deleteExpense(id)
            setExpenses(prev => prev.filter(e => e.id !== id))
        }
    }

    return (
        <div className="space-y-8">
            {/* Hero Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-slate-900 border-none relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                    <div className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-2 italic">Monthly Commitments</div>
                    <div className="text-3xl font-black text-white">₹{totalRecurring.toLocaleString()}</div>
                    <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                        <CreditCard className="w-3 h-3 text-red-400" /> Fixed Expenses
                    </div>
                </Card>

                <Card className="p-6 bg-slate-900 border-none relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                    <div className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-2 italic">Debt-to-Income (DTI)</div>
                    <div className={`text-3xl font-black ${dtiRatio > 40 ? 'text-red-400' : dtiRatio > 30 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                        {dtiRatio.toFixed(1)}%
                    </div>
                    <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                        <AlertCircle className="w-3 h-3" /> Safety Gauge
                    </div>
                </Card>

                <Card className="p-6 bg-slate-900 border-none relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                    <div className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-2 italic">Affordability Score</div>
                    <div className="text-3xl font-black text-white">
                        {dtiRatio < 20 ? 'Excellent' : dtiRatio < 40 ? 'Good' : 'Critical'}
                    </div>
                    <div className="mt-2 text-xs text-slate-400 font-bold uppercase tracking-wider">Based on monthly income</div>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Fixed Commitments (Loans & SIPs) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-400" /> Recurring Commitments
                        </h2>
                        <Button onClick={() => setShowForm(true)} size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" /> Add Commitment
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {recurringExpenses.length === 0 ? (
                            <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-slate-500">
                                No recurring expenses found.
                            </div>
                        ) : (
                            recurringExpenses.map(exp => (
                                <Card key={exp.id} className="p-5 bg-slate-900/60 border-slate-800 hover:border-blue-500/30 transition-all">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className={`p-3 rounded-xl ${exp.isLoan ? 'bg-orange-500/10 text-orange-400' : exp.isSIP ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                {exp.isLoan ? <Home className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-lg leading-none">{exp.title}</h3>
                                                <div className="flex gap-2 mt-2">
                                                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-slate-800 rounded text-slate-400">
                                                        {exp.isLoan ? 'Loan' : exp.isSIP ? 'Investment SIP' : 'Recurring'}
                                                    </span>
                                                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-blue-500/10 rounded text-blue-400">
                                                        Day {exp.recurringDay}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-white italic">₹{exp.amount.toLocaleString()}</div>
                                            <button onClick={() => handleDelete(exp.id)} className="text-slate-600 hover:text-red-400 transition-colors p-1 mt-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {exp.isLoan && exp.totalPrincipal && (
                                        <div className="mt-6 space-y-2">
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                                <span className="text-slate-500 italic">Loan Progress</span>
                                                <span className="text-white italic">
                                                    {(((exp.totalPrincipal - (exp.remainingPrincipal || 0)) / exp.totalPrincipal) * 100).toFixed(0)}% Repaid
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-1000"
                                                    style={{ width: `${((exp.totalPrincipal - (exp.remainingPrincipal || 0)) / exp.totalPrincipal) * 100}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px] text-slate-500 italic">
                                                <span>₹{(exp.totalPrincipal - (exp.remainingPrincipal || 0)).toLocaleString()} Paid</span>
                                                <span>₹{exp.remainingPrincipal?.toLocaleString()} Remaining</span>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar: One-off spends */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-rose-400" /> Latest Spends
                    </h2>
                    <div className="space-y-3">
                        {oneOffExpenses.map(exp => (
                            <div key={exp.id} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl hover:bg-slate-800/40 transition-colors group">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-white font-bold text-sm tracking-tight">{exp.title}</div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">{exp.category} • {new Date(exp.date).toLocaleDateString()}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-sm font-black text-rose-300 italic">-₹{exp.amount.toLocaleString()}</div>
                                        <button onClick={() => handleDelete(exp.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-400 transition-all">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showForm && (
                <ExpenseForm
                    onClose={() => setShowForm(false)}
                    onSuccess={(newExp: any) => {
                        setExpenses(prev => [newExp, ...prev])
                        setShowForm(false)
                    }}
                />
            )}
        </div>
    )
}

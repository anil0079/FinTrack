'use client'

import React, { useState } from 'react'
import { Card, Button, Input, Label } from '@/components/ui/core'
import { X, Plus, Home, TrendingUp, CreditCard } from 'lucide-react'
import { createExpense } from '@/app/actions/expense'

export default function ExpenseForm({ onClose, onSuccess }: { onClose: () => void, onSuccess: (expense: any) => void }) {
    const [mode, setMode] = useState<'spend' | 'loan' | 'sip'>('spend')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const amount = Number(formData.get('amount'))
        const title = formData.get('title') as string
        const category = formData.get('category') as string || (mode === 'loan' ? 'Debt' : mode === 'sip' ? 'Savings' : 'Needs')

        const data: any = {
            title,
            category,
            amount,
            date: formData.get('date') as string,
            description: formData.get('description') as string,
            isRecurring: mode !== 'spend',
            frequency: mode !== 'spend' ? 'Monthly' : null,
            recurringDay: Number(formData.get('recurringDay')) || 1,
        }

        if (mode === 'loan') {
            data.isLoan = true
            data.totalPrincipal = Number(formData.get('totalPrincipal'))
            data.remainingPrincipal = Number(formData.get('remainingPrincipal'))
            data.interestRate = Number(formData.get('interestRate'))
            data.tenureMonths = Number(formData.get('tenure'))
        }

        if (mode === 'sip') {
            data.isSIP = true
            data.assetType = formData.get('assetType') as string
        }

        const res = await createExpense(data)
        if (res.success) {
            onSuccess({ ...data, id: Math.random().toString() }) // Temporary ID for immediate UI update
        }
        setLoading(false)
    }

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <Card className="w-full max-w-lg bg-slate-900 border-slate-800 shadow-2xl relative overflow-hidden">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white p-1">
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 space-y-6">
                    <header>
                        <h2 className="text-2xl font-bold text-white">New Financial Entry</h2>
                        <p className="text-slate-500 text-sm">Select the type of expense to track.</p>
                    </header>

                    {/* Mode Selector */}
                    <div className="flex bg-slate-950 p-1 rounded-xl gap-1">
                        <button
                            onClick={() => setMode('spend')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'spend' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <CreditCard className="w-4 h-4" /> Spend
                        </button>
                        <button
                            onClick={() => setMode('loan')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'loan' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Home className="w-4 h-4" /> Loan EMI
                        </button>
                        <button
                            onClick={() => setMode('sip')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'sip' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <TrendingUp className="w-4 h-4" /> investment SIP
                        </button>
                    </div>

                    <form action={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1.5 block">Title / Institution</Label>
                                <Input name="title" placeholder={mode === 'loan' ? 'e.g. HDFC Home Loan' : mode === 'sip' ? 'e.g. Parag Parikh Flexicap' : 'e.g. Dinner at Taj'} required />
                            </div>

                            <div>
                                <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1.5 block">
                                    {mode === 'spend' ? 'Amount' : 'Monthly Payment'}
                                </Label>
                                <Input name="amount" type="number" placeholder="0.00" required />
                            </div>

                            {mode === 'spend' ? (
                                <div>
                                    <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1.5 block">Category</Label>
                                    <select name="category" className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option value="Needs">Needs (50%)</option>
                                        <option value="Wants">Wants (30%)</option>
                                        <option value="Savings">Savings (20%)</option>
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1.5 block">Due Day of Month</Label>
                                    <Input name="recurringDay" type="number" min="1" max="31" placeholder="1-31" defaultValue="1" required />
                                </div>
                            )}
                        </div>

                        {mode === 'loan' && (
                            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Home className="w-3 h-3" /> Amortization Details
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-[10px] text-slate-500">Total Loan Principal</Label>
                                        <Input name="totalPrincipal" type="number" placeholder="₹ Total" required />
                                    </div>
                                    <div>
                                        <Label className="text-[10px] text-slate-500">Current Remaining</Label>
                                        <Input name="remainingPrincipal" type="number" placeholder="₹ OS" required />
                                    </div>
                                    <div>
                                        <Label className="text-[10px] text-slate-500">Interest Rate (%)</Label>
                                        <Input name="interestRate" type="number" step="0.01" placeholder="8.5" required />
                                    </div>
                                    <div>
                                        <Label className="text-[10px] text-slate-500">Tenure (Months)</Label>
                                        <Input name="tenure" type="number" placeholder="240" required />
                                    </div>
                                </div>
                            </div>
                        )}

                        {mode === 'sip' && (
                            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 animate-in fade-in slide-in-from-top-2">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                    <TrendingUp className="w-3 h-3" /> Asset Mapping
                                </h3>
                                <Label className="text-[10px] text-slate-500">Asset Type</Label>
                                <select name="assetType" className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none mt-1">
                                    <option value="Mutual Fund">Mutual Fund</option>
                                    <option value="Stock (Direct)">Stock (Direct)</option>
                                    <option value="Crypto">Crypto</option>
                                    <option value="PPF/EPF">PPF/EPF</option>
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1.5 block">Date / Start Date</Label>
                                <Input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                            </div>
                            <div>
                                <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1.5 block">Description (Optional)</Label>
                                <Input name="description" placeholder="..." />
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-bold" disabled={loading}>
                            {loading ? 'Processing...' : (
                                <span className="flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    {mode === 'spend' ? 'Track Spend' : `Set up ${mode === 'loan' ? 'Loan' : 'SIP'} Tracking`}
                                </span>
                            )}
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    )
}

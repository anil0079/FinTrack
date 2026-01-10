'use client'

import React from 'react'
import { Card, Button, Input, Label } from '@/components/ui/core'
import { createExpense } from '@/app/actions/expense'
import { Plus } from 'lucide-react'

export default function BudgetDashboard({ data }: { data: any }) {
    if (!data) return <div className="text-white">Loading...</div>

    const { totalMonthlyIncome, totalSpent, breakdown, expenses } = data
    const remaining = totalMonthlyIncome - totalSpent

    // 50/30/20 Targets (Ideal)
    const targets = {
        Needs: totalMonthlyIncome * 0.5,
        Wants: totalMonthlyIncome * 0.3,
        Savings: totalMonthlyIncome * 0.2
    }

    async function handleAddExpense(formData: FormData) {
        const data = {
            category: formData.get('category') as string,
            amount: Number(formData.get('amount')),
            description: formData.get('description') as string,
            date: formData.get('date') as string
        }
        await createExpense(data)
        // Reset form or toast success
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-3 gap-4">
                    <Card className="p-4 bg-slate-900 border-none">
                        <div className="text-sm text-slate-500">Total Budget</div>
                        <div className="text-2xl font-bold text-white">₹{totalMonthlyIncome.toLocaleString()}</div>
                    </Card>
                    <Card className="p-4 bg-slate-900 border-none">
                        <div className="text-sm text-slate-500">Spent</div>
                        <div className="text-2xl font-bold text-red-400">₹{totalSpent.toLocaleString()}</div>
                    </Card>
                    <Card className="p-4 bg-slate-900 border-none">
                        <div className="text-sm text-slate-500">Remaining</div>
                        <div className="text-2xl font-bold text-green-400">₹{remaining.toLocaleString()}</div>
                    </Card>
                </div>

                {/* 50/30/20 Progress Bars */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">50/30/20 Rule Analysis</h3>
                    <div className="space-y-6">
                        {Object.entries(breakdown).map(([cat, amount]: [string, any]) => {
                            const target = targets[cat as keyof typeof targets] || 0
                            const percent = target > 0 ? (amount / target) * 100 : 0
                            const isOver = amount > target

                            return (
                                <div key={cat}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-300">{cat} (Target: ₹{target.toLocaleString()})</span>
                                        <span className={isOver ? 'text-red-400' : 'text-slate-400'}>
                                            ₹{amount.toLocaleString()} ({percent.toFixed(0)}%)
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${isOver ? 'bg-red-500' : 'bg-blue-500'}`}
                                            style={{ width: `${Math.min(percent, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card>

                {/* Recent Transactions List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
                    {expenses.map((exp: any) => (
                        <div key={exp.id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                            <div>
                                <div className="text-white font-medium">{exp.description || exp.category}</div>
                                <div className="text-xs text-slate-500">{new Date(exp.date).toLocaleDateString()}</div>
                            </div>
                            <div className="font-bold text-red-300">-₹{exp.amount.toLocaleString()}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Add Form */}
            <div>
                <Card className="p-6 sticky top-24">
                    <h3 className="text-lg font-semibold text-white mb-4">Add Expense</h3>
                    <form action={handleAddExpense} className="space-y-4">
                        <div>
                            <Label>Amount</Label>
                            <Input name="amount" type="number" placeholder="0.00" required />
                        </div>
                        <div>
                            <Label>Category</Label>
                            <select name="category" className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                <option value="Needs">Needs (50%)</option>
                                <option value="Wants">Wants (30%)</option>
                                <option value="Savings">Savings (20%)</option>
                            </select>
                        </div>
                        <div>
                            <Label>Date</Label>
                            <Input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input name="description" placeholder="e.g. Rent, Netflix" />
                        </div>
                        <Button type="submit" className="w-full">
                            <Plus className="w-4 h-4 mr-2" /> Track Expense
                        </Button>
                    </form>
                    <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-200">
                        💡 <strong>Tip:</strong> In a live environment, use the GPay integration deep link to auto-fetch these.
                    </div>
                </Card>
            </div>
        </div>
    )
}

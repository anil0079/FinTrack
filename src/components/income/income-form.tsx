'use client'

import { useState, useEffect } from 'react'
import { createIncomeSource, updateIncomeSource, type IncomeFormData } from '@/app/actions/income'
import { Button, Input, Label, Card } from '@/components/ui/core'
import { Plus, Save, Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

type IncomeSource = {
    id: string
    // ... match prisma model roughly
} & IncomeFormData

export function IncomeForm({ editingSource, onCancelEdit }: { editingSource?: any, onCancelEdit?: () => void }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // Auto-calculation logic state
    const [cagr, setCagr] = useState(0)
    const [investment, setInvestment] = useState(0)
    const [monthlyIncome, setMonthlyIncome] = useState(0)

    // Use effect to populate local state when editing
    useEffect(() => {
        if (editingSource) {
            setCagr(editingSource.growthRate)
            setInvestment(editingSource.amountInvested)
            setMonthlyIncome(editingSource.monthlyIncome)
        } else {
            // Reset
            setCagr(0)
            setInvestment(0)
            setMonthlyIncome(0)
        }
    }, [editingSource])

    // Auto-calc handler
    const handleCalc = () => {
        // Annual Return = Investment * (CAGR / 100)
        // Monthly = Annual / 12
        if (cagr && investment) {
            const annual = investment * (cagr / 100)
            setMonthlyIncome(parseFloat((annual / 12).toFixed(2)))
        }
    }

    useEffect(() => {
        handleCalc()
    }, [cagr, investment])


    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const data: IncomeFormData = {
            item: formData.get('item') as string,
            category: formData.get('category') as string,
            type: formData.get('type') as string,
            nature: formData.get('nature') as string,
            payoutFrequency: formData.get('payoutFrequency') as string,
            riskFactor: Number(formData.get('riskFactor')),
            growthRate: Number(formData.get('growthRate')),
            weeklyHours: Number(formData.get('weeklyHours')),
            amountInvested: Number(formData.get('amountInvested')),
            monthlyIncome: Number(formData.get('monthlyIncome')),
            // investedUntil: formData.get('investedUntil') as string,
            inHand: formData.get('inHand') === 'on',
        }

        if (editingSource) {
            await updateIncomeSource(editingSource.id, data)
            if (onCancelEdit) onCancelEdit()
        } else {
            await createIncomeSource(data)
            const form = document.getElementById('income-form') as HTMLFormElement
            form?.reset()
            // Reset local state
            setCagr(0)
            setInvestment(0)
            setMonthlyIncome(0)
        }
        setLoading(false)
        router.refresh()
    }

    return (
        <Card className={`p-6 ${editingSource ? 'border-blue-500 bg-slate-900' : ''}`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">{editingSource ? 'Edit Source' : 'Add Income Source'}</h3>
                {editingSource && (
                    <Button variant="ghost" type="button" onClick={onCancelEdit} size="sm"><X className="w-4 h-4" /></Button>
                )}
            </div>

            <form id="income-form" action={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                        <Label htmlFor="item">Source Name / Item</Label>
                        <Input name="item" id="item" placeholder="e.g. Govt Bond, Freelance" defaultValue={editingSource?.item} required />
                    </div>

                    <div>
                        <Label htmlFor="category">Category</Label>
                        <select name="category" defaultValue={editingSource?.category || 'Other'} className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            <option value="Job">Job / Salary</option>
                            <option value="Bonds">Bonds / FD</option>
                            <option value="Business">Business</option>
                            <option value="Rental">Rental</option>
                            <option value="Stocks">Stocks / Dividends</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <Label htmlFor="type">Type</Label>
                        <select name="type" defaultValue={editingSource?.type || 'Active'} className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            <option value="Active">Active</option>
                            <option value="Semi-Active">Semi-Active</option>
                            <option value="Semi-Passive">Semi-Passive</option>
                            <option value="Passive">Passive</option>
                        </select>
                    </div>

                    <div>
                        <Label htmlFor="nature">Nature</Label>
                        <select name="nature" defaultValue={editingSource?.nature || 'Fixed'} className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            <option value="Fixed">Fixed</option>
                            <option value="Variable">Variable</option>
                        </select>
                    </div>

                    <div>
                        <Label htmlFor="payoutFrequency">Payout Frequency</Label>
                        <select name="payoutFrequency" defaultValue={editingSource?.payoutFrequency || 'Monthly'} className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Yearly">Yearly</option>
                            <option value="Cumulative">Cumulative (On Maturity)</option>
                        </select>
                    </div>

                    <div className="col-span-1 md:col-span-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="amountInvested">Invested Amount (Principal)</Label>
                                <Input
                                    name="amountInvested"
                                    type="number"
                                    placeholder="0.00"
                                    value={investment}
                                    onChange={(e) => setInvestment(Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="growthRate">CAGR / Coupon Rate (%)</Label>
                                <Input
                                    name="growthRate"
                                    type="number"
                                    step="0.1"
                                    placeholder="0.0"
                                    value={cagr}
                                    onChange={(e) => setCagr(Number(e.target.value))}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 italic">Monthly Income is auto-calculated from Invested Amount * Rate if you edit fields above.</p>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <Label htmlFor="monthlyIncome">Monthly Income (Projected)</Label>
                        <Input
                            name="monthlyIncome"
                            type="number"
                            placeholder="0.00"
                            required
                            value={monthlyIncome}
                            onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                        />
                    </div>

                    <div>
                        <Label htmlFor="weeklyHours">Weekly Hours</Label>
                        <Input name="weeklyHours" type="number" step="0.5" placeholder="0" defaultValue={editingSource?.weeklyHours || 0} />
                    </div>

                    <div>
                        <Label htmlFor="riskFactor">Risk Factor (1-10)</Label>
                        <Input name="riskFactor" type="number" min="1" max="10" defaultValue={editingSource?.riskFactor || 1} />
                    </div>

                </div>

                <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" name="inHand" id="inHand" className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500" defaultChecked={editingSource?.inHand ?? true} />
                    <Label htmlFor="inHand" className="mb-0 cursor-pointer">In Hand (Liquid?)</Label>
                </div>

                <Button type="submit" className={`w-full mt-4 ${editingSource ? 'bg-green-600 hover:bg-green-700' : ''}`} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editingSource ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                    {editingSource ? 'Update Source' : 'Add Source'}
                </Button>
            </form>
        </Card>
    )
}

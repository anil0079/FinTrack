'use client'

import { useState, useEffect } from 'react'
import { createIncomeSource, updateIncomeSource, type IncomeFormData, type PayoutScheduleData } from '@/app/actions/income'
import { Button, Input, Label, Card } from '@/components/ui/core'
import { Plus, Save, Loader2, X, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function IncomeForm({ editingSource, onCancelEdit }: { editingSource?: any, onCancelEdit?: () => void }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // UI Toggles
    const [showAdvanced, setShowAdvanced] = useState(false)

    // Core Data State
    const [cagr, setCagr] = useState(0)
    const [investment, setInvestment] = useState(0)
    const [monthlyIncome, setMonthlyIncome] = useState(0)
    const [category, setCategory] = useState('Other')
    const [type, setType] = useState('Active')
    const [riskFactor, setRiskFactor] = useState(1)

    // Advanced Data State
    const [tdsDeducted, setTdsDeducted] = useState(false)
    const [payouts, setPayouts] = useState<PayoutScheduleData[]>([])
    const [maturityAmount, setMaturityAmount] = useState(0)
    const [investedUntil, setInvestedUntil] = useState('')
    const [investmentDate, setInvestmentDate] = useState('')
    const [recurringDay, setRecurringDay] = useState<number | ''>('')
    const [payoutFrequency, setPayoutFrequency] = useState('Monthly')
    const [isAutoCalculated, setIsAutoCalculated] = useState(false)

    // Bulk Generate State
    const [bulkStartDate, setBulkStartDate] = useState('')
    const [bulkAmount, setBulkAmount] = useState(0)
    const [bulkType, setBulkType] = useState('Interest')
    const [bulkFrequency, setBulkFrequency] = useState('Monthly')
    const [bulkOccurrences, setBulkOccurrences] = useState(1)
    const [showBulkGenerator, setShowBulkGenerator] = useState(false)
    const [currentValuation, setCurrentValuation] = useState(0)

    // Init Logic
    useEffect(() => {
        if (editingSource) {
            setCagr(editingSource.growthRate)
            setInvestment(editingSource.amountInvested)
            setMonthlyIncome(editingSource.monthlyIncome)
            setCategory(editingSource.category)
            setType(editingSource.type)
            setRiskFactor(editingSource.riskFactor)
            setTdsDeducted(editingSource.tdsDeducted || false)
            setMaturityAmount(editingSource.maturityAmount || 0)
            setInvestedUntil(editingSource.investedUntil ? new Date(editingSource.investedUntil).toISOString().split('T')[0] : '')
            setInvestmentDate(editingSource.investmentDate ? new Date(editingSource.investmentDate).toISOString().split('T')[0] : '')
            setRecurringDay(editingSource.recurringDay || '')
            setPayoutFrequency(editingSource.payoutFrequency || 'Monthly')

            // Format payouts if they exist (convert Date to string yyyy-mm-dd for input)
            if (editingSource.payouts) {
                const formattedPayouts = editingSource.payouts.map((p: any) => ({
                    ...p,
                    date: new Date(p.date).toISOString().split('T')[0]
                }))
                setPayouts(formattedPayouts)
            }
        } else {
            resetFormState()
        }
    }, [editingSource])

    // Auto-select type based on category
    useEffect(() => {
        if (!editingSource) {
            const categoryTypeMap: Record<string, string> = {
                'Job': 'Active',
                'Freelance': 'Semi-Active',
                'Business': 'Semi-Active',
                'Rental': 'Semi-Passive',
                'Dividend': 'Passive',
                'Interest': 'Passive',
                'FD/Bonds': 'Passive',
                'Stocks': 'Semi-Passive',
                'Crypto': 'Semi-Passive',
                'Other': 'Active'
            }
            setType(categoryTypeMap[category] || 'Active')
        }
    }, [category, editingSource])

    const resetFormState = () => {
        setCagr(0)
        setInvestment(0)
        setMonthlyIncome(0)
        setCategory('Other')
        setType('Active')
        setRiskFactor(1)
        setTdsDeducted(false)
        setPayouts([])
        setMaturityAmount(0)
        setInvestedUntil('')
        setInvestmentDate('')
        setRecurringDay('')
        setShowAdvanced(false)
        setIsAutoCalculated(false)
    }

    // Format number with separators
    const formatNumber = (value: number | string): string => {
        if (value === undefined || value === null || value === '') return ''
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

    // Parse formatted number
    const parseFormattedNumber = (value: any): number => {
        if (!value) return 0
        const str = value.toString()
        const parsed = parseFloat(str.replace(/,/g, ''))
        return isNaN(parsed) ? 0 : parsed
    }

    // Auto-calc logic
    const handleCalc = () => {
        setIsAutoCalculated(false)

        // Scenario 1: Investment + CAGR provided -> Calculate Monthly Income
        // For simple interest-bearing instruments
        if (cagr && investment && !maturityAmount) {
            const annual = investment * (cagr / 100)
            setMonthlyIncome(parseFloat((annual / 12).toFixed(2)))
        }

        // Scenario 2: Investment + Maturity/CurrentValue + Date Range provided -> Calculate CAGR
        // This is the CORRECT formula for assets with final/current valuations
        const targetValue = currentValuation > 0 ? currentValuation : maturityAmount

        if (investment > 0 && targetValue > 0 && investmentDate) {
            const start = new Date(investmentDate)
            const end = investedUntil ? new Date(investedUntil) : new Date()
            const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25)

            if (years > 0 && targetValue !== investment) {
                let derivedCagr = 0
                const diffDays = years * 365.25

                if (diffDays < 30) {
                    // Too short to annualize meaningfully. Use simple ROI.
                    derivedCagr = ((targetValue / investment) - 1) * 100
                } else if (years < 1) {
                    // For < 1 year, use linear annualization (ROI / years)
                    derivedCagr = ((targetValue / investment) - 1) * 100 * (1 / years)
                    if (derivedCagr > 300) derivedCagr = 300 // Absolute cap for linear
                } else {
                    // Standard CAGR for > 1 year
                    derivedCagr = (Math.pow(targetValue / investment, 1 / years) - 1) * 100
                }

                if (!isNaN(derivedCagr) && isFinite(derivedCagr)) {
                    const finalCagr = Math.max(-100, Math.min(1000, derivedCagr))
                    setCagr(parseFloat(finalCagr.toFixed(2)))
                    setIsAutoCalculated(true)
                }

                if (maturityAmount > 0 && years > 0) {
                    const totalProfit = maturityAmount - investment
                    const months = Math.max(1, years * 12)
                    setMonthlyIncome(parseFloat((totalProfit / months).toFixed(2)))
                }
            }
        }
    }

    useEffect(() => {
        // Debounce calculation slightly or just run on effect
        const timer = setTimeout(handleCalc, 500)
        return () => clearTimeout(timer)
    }, [investment, maturityAmount, currentValuation, investmentDate, investedUntil])
    // Note: We need separate effect for Cagr->Monthly if not using maturity logic.

    useEffect(() => {
        // Fallback: If user enters CAGR manually and NO maturity logic matches
        if (cagr && investment && !isAutoCalculated) {
            const annual = investment * (cagr / 100)
            setMonthlyIncome(parseFloat((annual / 12).toFixed(2)))
        }
    }, [cagr])

    // Auto-preset risk based on category
    useEffect(() => {
        if (editingSource) return // Don't override when editing

        const riskPresets: Record<string, number> = {
            'Job': 1,
            'Bonds': 2,
            'Rental': 3,
            'Business': 6,
            'Stocks': 7,
            'Other': 5
        }

        setRiskFactor(riskPresets[category] || 5)
    }, [category, editingSource])


    // Payout Helpers
    const addPayout = () => {
        setPayouts(prev => [...prev, { date: '', amount: 0, type: 'Interest', status: 'Scheduled' }])
    }

    const removePayout = (index: number) => {
        setPayouts(prev => prev.filter((_, i) => i !== index))
    }

    const updatePayout = (index: number, field: keyof PayoutScheduleData, value: string | number) => {
        setPayouts(prev => {
            const next = [...prev]
            next[index] = { ...next[index], [field]: value }
            return next
        })
    }

    const generateBulkPayouts = () => {
        if (!bulkStartDate || bulkOccurrences <= 0) {
            alert("Please fill Start Date and Occurrences correctly.")
            return
        }

        const newBulkPayouts: PayoutScheduleData[] = []
        let currentDate = new Date(bulkStartDate)

        for (let i = 0; i < bulkOccurrences; i++) {
            newBulkPayouts.push({
                date: currentDate.toISOString().split('T')[0],
                amount: bulkAmount,
                type: bulkType as any,
                status: 'Scheduled'
            })

            // Increment date based on frequency
            if (bulkFrequency === 'Monthly') currentDate.setMonth(currentDate.getMonth() + 1)
            else if (bulkFrequency === 'Quarterly') currentDate.setMonth(currentDate.getMonth() + 3)
            else if (bulkFrequency === 'Half-Yearly') currentDate.setMonth(currentDate.getMonth() + 6)
            else if (bulkFrequency === 'Yearly') currentDate.setFullYear(currentDate.getFullYear() + 1)
        }

        setPayouts(prev => {
            const combined = [...prev, ...newBulkPayouts]
            // Sort by date descending (latest first)
            return combined.sort((a, b) => {
                if (!a.date) return 1
                if (!b.date) return -1
                return new Date(b.date).getTime() - new Date(a.date).getTime()
            })
        })
        setShowBulkGenerator(false)
    }

    const clearPayouts = () => {
        if (confirm("Are you sure you want to clear all payouts?")) {
            setPayouts([])
        }
    }


    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(e.currentTarget)

            // Parse numbers explicitly
            const amountInvested = parseFormattedNumber(formData.get('amountInvested'))
            const monthlyIncomeVal = parseFormattedNumber(formData.get('monthlyIncome'))
            const maturityAmountVal = parseFormattedNumber(formData.get('maturityAmount'))

            const data: IncomeFormData = {
                item: formData.get('item') as string,
                category: formData.get('category') as string,
                type: formData.get('type') as string,
                nature: formData.get('nature') as string,
                payoutFrequency: formData.get('payoutFrequency') as string,
                riskFactor: Number(formData.get('riskFactor') || 0),
                growthRate: Number(formData.get('growthRate') || 0),
                weeklyHours: Number(formData.get('weeklyHours') || 0),
                amountInvested: amountInvested,
                monthlyIncome: monthlyIncomeVal,
                investedUntil: (formData.get('investedUntil') as string) || undefined,
                inHand: formData.get('inHand') === 'on',

                // Advanced
                tdsDeducted: formData.get('tdsDeducted') === 'on',
                tdsRate: Number(formData.get('tdsRate') || 0),
                maturityAmount: maturityAmountVal,
                nextPayoutDate: (formData.get('nextPayoutDate') as string) || undefined,
                investmentDate: (formData.get('investmentDate') as string) || undefined,
                recurringDay: Number(formData.get('recurringDay') || 0),
                payouts: payouts
                    .filter(p => p.date && p.amount >= 0)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            }

            if (editingSource) {
                const res = await updateIncomeSource(editingSource.id, data)
                if (!res.success) throw new Error(res.error as string || 'Failed to update')
            } else {
                const res = await createIncomeSource(data)
                if (!res.success) throw new Error(res.error as string || 'Failed to create')
                const form = document.getElementById('income-form') as HTMLFormElement
                form?.reset()
                resetFormState()
            }

            if (onCancelEdit) onCancelEdit()
            router.refresh()
        } catch (error) {
            console.error("Form Error:", error)
            alert(error instanceof Error ? error.message : "Something went wrong. Please check your inputs.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className={`p-6 ${editingSource ? 'border-blue-500 bg-slate-900' : ''}`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">{editingSource ? 'Edit Source' : 'Add Income Source'}</h3>
                {editingSource && (
                    <Button variant="ghost" type="button" onClick={onCancelEdit}><X className="w-4 h-4" /></Button>
                )}
            </div>

            <form id="income-form" onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                        <Label htmlFor="item">Source Name / Item</Label>
                        <Input name="item" id="item" placeholder="e.g. Govt Bond, Freelance" defaultValue={editingSource?.item} required />
                    </div>

                    <div>
                        <Label htmlFor="category">Category</Label>
                        <select
                            name="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none">
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
                        <select
                            name="type"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${type === 'Active' ? 'bg-red-500/20 border-red-500 text-red-300' :
                                type === 'Semi-Active' ? 'bg-orange-500/20 border-orange-500 text-orange-300' :
                                    type === 'Semi-Passive' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300' :
                                        'bg-green-500/20 border-green-500 text-green-300'
                                }`}
                        >
                            <option value="Active" className="bg-slate-900 text-red-300">🔴 Active</option>
                            <option value="Semi-Active" className="bg-slate-900 text-orange-300">🟠 Semi-Active</option>
                            <option value="Semi-Passive" className="bg-slate-900 text-yellow-300">🟡 Semi-Passive</option>
                            <option value="Passive" className="bg-slate-900 text-green-300">🟢 Passive</option>
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
                        <select
                            name="payoutFrequency"
                            value={payoutFrequency}
                            onChange={(e) => setPayoutFrequency(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Half-Yearly">Half-Yearly</option>
                            <option value="Yearly">Yearly</option>
                            <option value="Cumulative">Cumulative (On Maturity)</option>
                        </select>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <Label htmlFor="monthlyIncome">Monthly Income (Projected)</Label>
                        <Input
                            name="monthlyIncome"
                            type="text"
                            placeholder="0.00"
                            required
                            value={formatNumber(monthlyIncome)}
                            onChange={(e) => setMonthlyIncome(parseFormattedNumber(e.target.value))}
                        />
                    </div>
                </div>

                {/* Advanced Toggle */}
                <div className="pt-2 border-t border-slate-800">
                    <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {showAdvanced ? 'Hide Advanced Details' : 'Show Advanced Details (TDS, Dates, Payouts)'}
                    </button>
                </div>

                {/* Advanced Section */}
                {showAdvanced && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Investment Details */}
                        <div className="p-4 bg-slate-800/40 rounded-lg space-y-4 border border-slate-700/50">
                            <h4 className="flex items-center gap-2 text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">
                                Investment & Returns Config
                                {isAutoCalculated && <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20">Auto-calculated</span>}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="amountInvested">Invested Amount</Label>
                                    <Input
                                        name="amountInvested"
                                        type="text"
                                        value={formatNumber(investment)}
                                        onChange={(e) => setInvestment(parseFormattedNumber(e.target.value))}
                                        placeholder="e.g., 1,00,000"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="growthRate">CAGR / Coupon Rate (%)</Label>
                                    <Input
                                        name="growthRate"
                                        type="number"
                                        step="0.1"
                                        value={cagr}
                                        onChange={(e) => setCagr(Number(e.target.value))}
                                        className={isAutoCalculated ? 'border-green-500/50 text-green-400' : ''}
                                    />
                                </div>

                                <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="investmentDate">Investment Date</Label>
                                        <Input
                                            name="investmentDate"
                                            type="date"
                                            value={investmentDate}
                                            onChange={(e) => setInvestmentDate(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="investedUntil">Invested Until</Label>
                                        <Input
                                            name="investedUntil"
                                            type="date"
                                            value={investedUntil}
                                            onChange={(e) => setInvestedUntil(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="nextPayoutDate">Next Payout Date</Label>
                                        <Input name="nextPayoutDate" type="date" defaultValue={editingSource?.nextPayoutDate ? new Date(editingSource.nextPayoutDate).toISOString().split('T')[0] : ''} />
                                    </div>
                                </div>

                                <div className="col-span-2 grid grid-cols-2 gap-4">
                                    {(category === 'Bonds' || category === 'Stocks' || category === 'Crypto' || category === 'Other') && (
                                        <div>
                                            <Label htmlFor="currentValuation">Current Market Value (Optional)</Label>
                                            <Input
                                                name="currentValuation"
                                                id="currentValuation"
                                                type="text"
                                                placeholder="e.g. 1,05,000"
                                                value={formatNumber(currentValuation)}
                                                onChange={(e) => setCurrentValuation(parseFormattedNumber(e.target.value))}
                                            />
                                            <p className="text-[10px] text-slate-500 mt-1">Used to deduce CAGR from investment date</p>
                                        </div>
                                    )}
                                    <div>
                                        <Label htmlFor="maturityAmount">Maturity Amount</Label>
                                        <Input
                                            name="maturityAmount"
                                            type="text"
                                            value={formatNumber(maturityAmount)}
                                            onChange={(e) => setMaturityAmount(parseFormattedNumber(e.target.value))}
                                            placeholder="e.g. 1,12,000"
                                        />
                                    </div>
                                    <div className={!(category === 'Bonds' || category === 'Stocks' || category === 'Crypto' || category === 'Other') ? 'col-span-2' : ''}>
                                        <Label htmlFor="recurringDay">Recurring Day (1-31)</Label>
                                        <Input
                                            name="recurringDay"
                                            type="number"
                                            min="1"
                                            max="31"
                                            value={recurringDay}
                                            onChange={(e) => setRecurringDay(Number(e.target.value))}
                                            placeholder="e.g. 5"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TDS Section */}
                        <div className="p-4 bg-slate-800/40 rounded-lg space-y-4 border border-slate-700/50">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-slate-300">Tax Deducted at Source (TDS)</h4>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="tdsDeducted"
                                        id="tdsDeducted"
                                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600"
                                        checked={tdsDeducted}
                                        onChange={(e) => setTdsDeducted(e.target.checked)}
                                    />
                                    <Label htmlFor="tdsDeducted" className="mb-0 cursor-pointer">TDS Is Deducted</Label>
                                </div>
                            </div>

                            {tdsDeducted && (
                                <div>
                                    <Label htmlFor="tdsRate">TDS Rate (%)</Label>
                                    <Input name="tdsRate" type="number" step="0.1" defaultValue={editingSource?.tdsRate || 10} />
                                </div>
                            )}
                        </div>

                        {/* Payout Schedule */}
                        <div className="p-4 bg-slate-800/40 rounded-lg space-y-4 border border-slate-700/50">
                            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                                <h4 className="text-sm font-medium text-slate-300">Custom Payout Schedule</h4>
                                <div className="flex gap-2">
                                    <Button type="button" variant="ghost" onClick={() => setShowBulkGenerator(!showBulkGenerator)} className="text-yellow-400 hover:text-yellow-300 text-xs">
                                        {showBulkGenerator ? 'Cancel Bulk' : 'Bulk Generator'}
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={addPayout} className="text-blue-400 hover:text-blue-300 text-xs">
                                        <Plus className="w-4 h-4 mr-1" /> Add Date
                                    </Button>
                                    {payouts.length > 0 && (
                                        <Button type="button" variant="ghost" onClick={clearPayouts} className="text-red-400 hover:text-red-300 text-xs">
                                            Clear All
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Bulk Generator UI */}
                            {showBulkGenerator && (
                                <div className="p-3 bg-slate-900/60 rounded border border-yellow-500/20 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                    <h5 className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">Generate Recurring Schedule</h5>
                                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                        <div>
                                            <Label className="text-[10px]">Start Date</Label>
                                            <Input type="date" value={bulkStartDate} onChange={(e) => setBulkStartDate(e.target.value)} className="h-8 text-xs bg-slate-800" />
                                        </div>
                                        <div>
                                            <Label className="text-[10px]">Amount</Label>
                                            <Input type="text" value={formatNumber(bulkAmount)} onChange={(e) => setBulkAmount(parseFormattedNumber(e.target.value))} className="h-8 text-xs bg-slate-800" />
                                        </div>
                                        <div>
                                            <Label className="text-[10px]">Type</Label>
                                            <select value={bulkType} onChange={(e) => setBulkType(e.target.value)} className="flex h-8 w-full rounded-md border border-slate-700 bg-slate-800 px-2 text-xs text-slate-100">
                                                <option value="Interest">Interest</option>
                                                <option value="Principal">Principal</option>
                                                <option value="Dividend">Dividend</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label className="text-[10px]">Frequency</Label>
                                            <select value={bulkFrequency} onChange={(e) => setBulkFrequency(e.target.value)} className="flex h-8 w-full rounded-md border border-slate-700 bg-slate-800 px-2 text-xs text-slate-100">
                                                <option value="Monthly">Monthly</option>
                                                <option value="Quarterly">Quarterly</option>
                                                <option value="Half-Yearly">Half-Yearly</option>
                                                <option value="Yearly">Yearly</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label className="text-[10px]">Occurrences</Label>
                                            <Input type="number" min="1" value={bulkOccurrences} onChange={(e) => setBulkOccurrences(Number(e.target.value))} className="h-8 text-xs bg-slate-800" />
                                        </div>
                                    </div>
                                    <Button type="button" onClick={generateBulkPayouts} className="w-full h-8 text-xs bg-yellow-600 hover:bg-yellow-700 text-white">
                                        Generate {bulkOccurrences} Payouts
                                    </Button>
                                </div>
                            )}

                            {payouts.length === 0 ? (
                                <p className="text-xs text-slate-500 italic text-center py-2">No specific dates added. Using monthly/frequency default.</p>
                            ) : (
                                <div className="space-y-2">
                                    {payouts.map((p, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-2 items-end">
                                            <div className="col-span-4">
                                                <Label className="text-[10px]">Date</Label>
                                                <Input
                                                    type="date"
                                                    value={p.date}
                                                    onChange={(e) => updatePayout(index, 'date', e.target.value)}
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <Label className="text-[10px]">Type</Label>
                                                <select
                                                    value={p.type}
                                                    onChange={(e) => updatePayout(index, 'type', e.target.value)}
                                                    className="flex h-8 w-full rounded-md border border-slate-700 bg-slate-900 px-2 text-xs text-slate-100"
                                                >
                                                    <option value="Interest">Interest</option>
                                                    <option value="Principal">Principal</option>
                                                    <option value="Dividend">Dividend</option>
                                                    <option value="Bonus">Bonus</option>
                                                </select>
                                            </div>
                                            <div className="col-span-4">
                                                <Label className="text-[10px]">Amount</Label>
                                                <Input
                                                    type="text"
                                                    value={formatNumber(p.amount)}
                                                    onChange={(e) => updatePayout(index, 'amount', parseFormattedNumber(e.target.value))}
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <Button type="button" variant="ghost" onClick={() => removePayout(index)} className="h-8 w-8 p-0 text-red-400 hover:text-red-300">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Other Metadata */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="weeklyHours">Weekly Hours</Label>
                                <Input name="weeklyHours" type="number" step="0.5" defaultValue={editingSource?.weeklyHours || 0} />
                            </div>
                            <div>
                                <Label htmlFor="riskFactor">Risk Factor (1-10)</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="range"
                                            name="riskFactor"
                                            min="1"
                                            max="10"
                                            value={riskFactor}
                                            onChange={(e) => setRiskFactor(Number(e.target.value))}
                                            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                                            style={{
                                                background: `linear-gradient(to right, #10b981 0%, #10b981 ${(riskFactor - 1) * 11.11}%, #eab308 ${(riskFactor - 1) * 11.11}%, #eab308 ${(riskFactor - 1) * 11.11 + 33.33}%, #ef4444 ${(riskFactor - 1) * 11.11 + 33.33}%, #ef4444 100%)`
                                            }}
                                        />
                                        <span className={`text-lg font-bold w-8 ${riskFactor <= 3 ? 'text-green-400' : riskFactor <= 6 ? 'text-yellow-400' : 'text-red-400'
                                            }`}>{riskFactor}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-500">
                                        <span>Low</span>
                                        <span>Medium</span>
                                        <span>High</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hidden field for in-hand calculation based on payout frequency */}
                <input
                    type="hidden"
                    name="inHand"
                    value={(payoutFrequency === 'Monthly' || payoutFrequency === 'Weekly') ? 'on' : ''}
                />

                <Button type="submit" className={`w-full mt-4 ${editingSource ? 'bg-green-600 hover:bg-green-700' : ''}`} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editingSource ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                    {editingSource ? 'Update Source' : 'Add Source'}
                </Button>
            </form>
        </Card>
    )
}

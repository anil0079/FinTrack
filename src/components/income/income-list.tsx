'use client'

import { useState, useEffect } from 'react'
import { deleteIncomeSource, updateIncomeSourceOrder } from '@/app/actions/income'
import { Card, Button } from '@/components/ui/core'
import { Trash2, TrendingUp, Clock, AlertTriangle, Edit2, LayoutGrid, List, ArrowUpDown, Plus, Calendar, Bell } from 'lucide-react'
import { calculateIncomeMetrics } from '@/lib/financials'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type IncomeSource = {
    id: string
    item: string
    category: string
    type: string
    amountInvested: number
    monthlyIncome: number
    riskFactor: number
    weeklyHours: number
    growthRate: number
    payoutFrequency?: string | null
    sortOrder?: number
    investedUntil?: string | null
    investmentDate?: string | null
    nextPayoutDate?: string | null
    recurringDay?: number | null
    inHand?: boolean
    payouts?: any[]
    createdAt?: string
}

type SortField = 'item' | 'monthlyIncome' | 'growthRate' | 'riskFactor' | 'amountInvested' | 'weeklyHours' | 'netVal' | 'currentVal'
type SortDirection = 'asc' | 'desc'

const CATEGORY_COLORS: Record<string, { bg: string, text: string, border: string, accent: string }> = {
    'Job': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', accent: 'bg-blue-500' },
    'Stocks': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', accent: 'bg-indigo-500' },
    'Crypto': { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', accent: 'bg-violet-500' },
    'Bonds': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', accent: 'bg-cyan-500' },
    'FD/RD': { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20', accent: 'bg-sky-500' },
    'Real Estate': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', accent: 'bg-emerald-500' },
    'Mutual Funds': { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', accent: 'bg-rose-500' },
    'P2P Lending': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', accent: 'bg-amber-500' },
    'Savings': { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', accent: 'bg-slate-500' },
    'Unlisted Shares': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', accent: 'bg-orange-500' },
    'Business': { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20', accent: 'bg-pink-500' },
}

const getCategoryStyles = (category: string) => {
    return CATEGORY_COLORS[category] || { bg: 'bg-slate-800/20', text: 'text-slate-400', border: 'border-slate-700/20', accent: 'bg-slate-700' }
}


function SortableItem({ source, onEdit, onDelete, viewMode }: { source: any, onEdit: (s: any) => void, onDelete: (id: string) => void, viewMode: 'card' | 'list' }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: source.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const { invested, current, net, cagr, maturityDate, monthly, tdsCurrentFY } = calculateIncomeMetrics(source)

    const getRelevantDate = () => {
        const now = new Date()
        const payouts = source.payouts || []

        // 1. If explicit maturity is set and in the future, it's a strong candidate
        if (source.investedUntil && new Date(source.investedUntil) > now) {
            return {
                label: 'Maturity',
                date: new Date(source.investedUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                icon: <Calendar className="w-3 h-3 text-purple-400" />
            }
        }

        // 2. Check for the NEXT upcoming payout in the schedule
        const upcomingPayout = payouts
            .filter((p: any) => new Date(p.date) > now)
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

        if (upcomingPayout) {
            return {
                label: 'Next Payout',
                date: new Date(upcomingPayout.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                icon: <Bell className="w-3 h-3 text-blue-400" />
            }
        }

        // 3. Fallback to explicit nextPayoutDate field
        if (source.nextPayoutDate) {
            return {
                label: 'Next Payout',
                date: new Date(source.nextPayoutDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                icon: <Bell className="w-3 h-3 text-blue-400" />
            }
        }

        // 4. Fallback to maturity date if it's already passed (as historical)
        if (source.investedUntil) {
            return {
                label: 'Matured',
                date: new Date(source.investedUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                icon: <Calendar className="w-3 h-3 text-slate-500" />
            }
        }

        // 5. Monthly recurring day
        if (source.recurringDay) {
            return {
                label: 'Monthly Day',
                date: `Day ${source.recurringDay}`,
                icon: <Clock className="w-3 h-3 text-slate-400" />
            }
        }

        // 6. Final deduction from payouts (if none in future, show the very last one as maturity)
        if (payouts.length > 0) {
            const lastPayout = [...payouts].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
            return {
                label: 'Last Event',
                date: new Date(lastPayout.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                icon: <Calendar className="w-3 h-3 text-slate-500" />
            }
        }

        return null
    }

    const relevantEvent = getRelevantDate()

    if (viewMode === 'list') {
        return (
            <div ref={setNodeRef} style={style} className="bg-slate-900/40 border border-slate-700/50 rounded-lg hover:bg-slate-800/50 transition-colors">
                <div className="grid grid-cols-11 items-center gap-4 p-4">
                    {/* Drag Handle & Name */}
                    <div className="col-span-2 flex items-center gap-3">
                        <div {...attributes} {...listeners} className="cursor-move p-2 hover:bg-slate-800 rounded">
                            <div className="flex flex-col gap-0.5">
                                <div className="w-3 h-0.5 bg-slate-500 rounded"></div>
                                <div className="w-3 h-0.5 bg-slate-500 rounded"></div>
                                <div className="w-3 h-0.5 bg-slate-500 rounded"></div>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white text-sm truncate">{source.item}</h4>
                            <div className="flex gap-1.5 mt-0.5 overflow-hidden">
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${source.type === 'Active' ? 'bg-red-500/20 text-red-300' :
                                    source.type === 'Semi-Active' ? 'bg-orange-500/20 text-orange-300' :
                                        source.type === 'Semi-Passive' ? 'bg-yellow-500/20 text-yellow-300' :
                                            'bg-green-500/20 text-green-300'
                                    }`}>{source.type}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${getCategoryStyles(source.category).bg} ${getCategoryStyles(source.category).text} ${getCategoryStyles(source.category).border}`}>
                                    {source.category}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Values - Spaced Evenly */}
                    <div className="text-center font-medium text-slate-300 text-xs">₹{invested.toLocaleString()}</div>
                    <div className="text-center font-bold text-slate-100 text-sm">₹{current.toLocaleString()}</div>
                    <div className="text-center font-bold text-blue-400 text-sm">₹{net.toLocaleString()}</div>

                    {/* Monthly Income */}
                    <div className="text-center">
                        <div className={`font-bold text-sm ${source.inHand ? 'text-emerald-400' : 'text-amber-400'}`}>
                            ₹{monthly.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500">{source.payoutFrequency || 'Monthly'}</div>
                    </div>

                    {/* Relevant Date */}
                    <div className="text-center">
                        {relevantEvent ? (
                            <>
                                <div className="text-xs text-slate-300 flex items-center justify-center gap-1.5">
                                    {relevantEvent.icon}
                                    {relevantEvent.date}
                                </div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-tighter">{relevantEvent.label}</div>
                            </>
                        ) : (
                            <div className="text-xs text-slate-500">-</div>
                        )}
                    </div>

                    {/* Weekly Hours */}
                    <div className="text-center">
                        <div className="font-medium text-cyan-400 text-xs">{source.weeklyHours}h</div>
                    </div>

                    {/* Yield (CAGR) */}
                    <div className="text-center">
                        <div className="font-bold text-indigo-400 text-xs">{cagr}%</div>
                    </div>

                    {/* Risk */}
                    <div className="text-center">
                        <div className={`text-xs font-bold ${source.riskFactor > 7 ? 'text-red-400' : source.riskFactor > 4 ? 'text-yellow-400' : 'text-green-400'}`}>
                            R:{source.riskFactor}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-1 px-2">
                        <button
                            onClick={() => onEdit(source)}
                            className="p-1.5 text-slate-400 hover:text-blue-400 rounded-md hover:bg-slate-800 transition-colors"
                            title="Edit"
                        >
                            <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onDelete(source.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 rounded-md hover:bg-slate-800 transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Card view - Redesigned for visual appeal
    return (
        <div ref={setNodeRef} style={style}>
            <Card className="hover:border-blue-500/50 transition-all group relative bg-slate-900/40 overflow-hidden border-slate-800/60 p-0">
                {/* Visual Accent */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${source.type === 'Active' ? 'bg-red-500' :
                    source.type === 'Semi-Active' ? 'bg-orange-500' :
                        source.type === 'Semi-Passive' ? 'bg-yellow-500' :
                            'bg-green-500'
                    }`} />

                {/* Drag Handle */}
                <div {...attributes} {...listeners} className="absolute top-3 left-4 p-1 cursor-move opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 rounded">
                    <div className="flex flex-col gap-0.5">
                        <div className="w-3 h-0.5 bg-slate-500 rounded"></div>
                        <div className="w-3 h-0.5 bg-slate-500 rounded"></div>
                    </div>
                </div>

                {/* Actions */}
                <div className="absolute top-3 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(source)} className="p-1.5 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-800 transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => onDelete(source.id)} className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>

                <div className="p-5 pt-6 space-y-4">
                    {/* Header: Item & Type */}
                    <div className="flex justify-between items-start pl-4 pr-16">
                        <div>
                            <h4 className="font-bold text-lg text-white leading-tight truncate max-w-[180px]">{source.item}</h4>
                            <div className="flex gap-2 mt-1">
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${source.type === 'Active' ? 'bg-red-500/10 text-red-400' :
                                    source.type === 'Semi-Active' ? 'bg-orange-500/10 text-orange-400' :
                                        source.type === 'Semi-Passive' ? 'bg-yellow-500/10 text-yellow-400' :
                                            'bg-green-500/10 text-green-400'
                                    }`}>{source.type}</span>
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getCategoryStyles(source.category).bg} ${getCategoryStyles(source.category).text} ${getCategoryStyles(source.category).border}`}>
                                    {source.category}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Main Highlight: Effective Monthly Income */}
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30 text-center relative overflow-hidden group/val">
                        <div className={`absolute inset-0 ${source.inHand ? 'bg-emerald-500/5' : 'bg-amber-500/5'} opacity-0 group-hover/val:opacity-100 transition-opacity`} />
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-medium">Monthly cash flow</div>
                        <div className={`text-3xl font-black tracking-tighter ${source.inHand ? 'text-emerald-400' : 'text-amber-400'}`}>
                            ₹{monthly.toLocaleString()}
                            {source.inHand && <span className="ml-1 text-sm align-top">📦</span>}
                        </div>
                        <div className="mt-1 flex items-center justify-center gap-1.5">
                            <TrendingUp className="w-3 h-3 text-blue-400" />
                            <span className="text-xs font-bold text-blue-400">{cagr}% yield</span>
                            <span className="text-[10px] text-slate-600 font-medium">• {source.payoutFrequency || 'compounding'}</span>
                        </div>
                    </div>

                    {/* Secondary Metrics: Smaller & Tighter */}
                    <div className="grid grid-cols-2 gap-3 px-1">
                        <div className="space-y-0.5">
                            <div className="text-[9px] text-slate-600 uppercase tracking-wider font-bold">Valuation</div>
                            <div className="text-sm font-bold text-slate-300">₹{current.toLocaleString()}</div>
                        </div>
                        <div className="space-y-0.5 text-right">
                            <div className="text-[9px] text-slate-600 uppercase tracking-wider font-bold">Net Worth</div>
                            <div className="text-sm font-bold text-blue-400/80">₹{net.toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Footer: Date & Risk */}
                    <div className="pt-3 border-t border-slate-800/50 flex justify-between items-center text-[11px]">
                        {relevantEvent ? (
                            <div className="flex items-center gap-2 text-slate-300">
                                <div className="p-1 bg-slate-800 rounded">{relevantEvent.icon}</div>
                                <div>
                                    <span className="text-slate-500 font-medium mr-1">{relevantEvent.label}:</span>
                                    <span className="font-bold">{relevantEvent.date}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-slate-600 italic">No scheduled events</div>
                        )}
                        <div className={`flex items-center gap-1.5 font-bold ${source.riskFactor > 7 ? 'text-red-400' : source.riskFactor > 4 ? 'text-yellow-400' : 'text-green-400'}`}>
                            <AlertTriangle className="w-3 h-3" />
                            R:{source.riskFactor}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export function IncomeList({ sources: initialSources, onEdit, onShowForm }: { sources: IncomeSource[], onEdit: (source: IncomeSource) => void, onShowForm: () => void }) {
    const [sources, setSources] = useState(initialSources)
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
    const [sortField, setSortField] = useState<SortField>('item')
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

    // Load view mode from localStorage on mount
    useEffect(() => {
        const savedViewMode = localStorage.getItem('incomeViewMode')
        if (savedViewMode === 'card' || savedViewMode === 'list') {
            setViewMode(savedViewMode)
        }
    }, [])

    // Save view mode to localStorage when it changes
    const handleViewModeChange = (mode: 'card' | 'list') => {
        setViewMode(mode)
        localStorage.setItem('incomeViewMode', mode)
    }

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this income source?')) {
            await deleteIncomeSource(id)
            setSources(prevSources => prevSources.filter(s => s.id !== id))
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = sources.findIndex((s) => s.id === active.id)
            const newIndex = sources.findIndex((s) => s.id === over.id)

            const newSources = arrayMove(sources, oldIndex, newIndex)
            setSources(newSources)

            // Update sort order in database
            await updateIncomeSourceOrder(newSources.map((s, idx) => ({ id: s.id, sortOrder: idx })))
        }
    }

    const handleSort = (field: SortField) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc'
        setSortField(field)
        setSortDirection(newDirection)

        const sorted = [...sources].sort((a, b) => {
            let aVal: any = a[field as keyof IncomeSource]
            let bVal: any = b[field as keyof IncomeSource]

            // Handle derived fields
            if (field === 'netVal' || field === 'currentVal') {
                const metricsA = calculateIncomeMetrics(a)
                const metricsB = calculateIncomeMetrics(b)
                aVal = field === 'netVal' ? metricsA.net : metricsA.current
                bVal = field === 'netVal' ? metricsB.net : metricsB.current
            } else if (field === 'monthlyIncome') {
                // Sort by calculated monthly value instead of base input
                aVal = calculateIncomeMetrics(a).monthly
                bVal = calculateIncomeMetrics(b).monthly
            } else if (field === 'growthRate') {
                // Sort by calculated CAGR
                aVal = calculateIncomeMetrics(a).cagr
                bVal = calculateIncomeMetrics(b).cagr
            }

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return newDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
            }

            const aNum = Number(aVal) || 0
            const bNum = Number(bVal) || 0
            return newDirection === 'asc' ? aNum - bNum : bNum - aNum
        })

        setSources(sorted)
    }

    if (sources.length === 0) {
        return (
            <div className="text-center p-12 border-2 border-dashed border-slate-700 rounded-lg">
                <p className="text-slate-500 mb-4">No income sources added yet.</p>
                <button
                    onClick={onShowForm}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Your First Income Source
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* View Controls */}
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    {/* Compact sorting label or just removal of separate buttons as requested */}
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-800/30 rounded-lg border border-slate-700/50 text-[10px] text-slate-500 uppercase tracking-widest">
                        {sortField ? `Sorting by: ${sortField}` : 'Manual Order'}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onShowForm}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" />
                        Add Income
                    </button>
                    <button onClick={() => handleViewModeChange('card')} className={`p-2 rounded-lg transition-colors ${viewMode === 'card' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`} title="Card View">
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleViewModeChange('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`} title="List View">
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Draggable List */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sources.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    {viewMode === 'list' && (
                        <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-3 mb-2">
                            <div className="grid grid-cols-11 gap-4 items-center text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-16 pr-4">
                                <button onClick={() => handleSort('item')} className="col-span-2 flex items-center gap-1.5 hover:text-blue-400 transition-colors group">
                                    Name & Type <ArrowUpDown className={`w-3 h-3 ${sortField === 'item' ? 'text-blue-400' : 'opacity-0 group-hover:opacity-100'}`} />
                                </button>
                                <button onClick={() => handleSort('amountInvested')} className="flex items-center justify-center gap-1 hover:text-blue-400 transition-colors group">
                                    Invested <ArrowUpDown className={`w-3 h-3 ${sortField === 'amountInvested' ? 'text-blue-400' : 'opacity-0 group-hover:opacity-100'}`} />
                                </button>
                                <button onClick={() => handleSort('currentVal')} className="flex items-center justify-center gap-1 hover:text-blue-400 transition-colors group">
                                    Current <ArrowUpDown className={`w-3 h-3 ${sortField === 'currentVal' ? 'text-blue-400' : 'opacity-0 group-hover:opacity-100'}`} />
                                </button>
                                <button onClick={() => handleSort('netVal' as any)} className="flex items-center justify-center gap-1 hover:text-blue-400 transition-colors group">
                                    Net Worth <ArrowUpDown className={`w-3 h-3 ${sortField === 'netVal' ? 'text-blue-400' : 'opacity-0 group-hover:opacity-100'}`} />
                                </button>
                                <button onClick={() => handleSort('monthlyIncome')} className="flex items-center justify-center gap-1 hover:text-blue-400 transition-colors group">
                                    Monthly <ArrowUpDown className={`w-3 h-3 ${sortField === 'monthlyIncome' ? 'text-blue-400' : 'opacity-0 group-hover:opacity-100'}`} />
                                </button>
                                <button className="cursor-default text-center">Relevant Date</button>
                                <button onClick={() => handleSort('weeklyHours')} className="flex items-center justify-center gap-1 hover:text-blue-400 transition-colors group">
                                    Weekly <ArrowUpDown className={`w-3 h-3 ${sortField === 'weeklyHours' ? 'text-blue-400' : 'opacity-0 group-hover:opacity-100'}`} />
                                </button>
                                <button onClick={() => handleSort('growthRate')} className="flex items-center justify-center gap-1 hover:text-blue-400 transition-colors group">
                                    Yield <ArrowUpDown className={`w-3 h-3 ${sortField === 'growthRate' ? 'text-blue-400' : 'opacity-0 group-hover:opacity-100'}`} />
                                </button>
                                <button onClick={() => handleSort('riskFactor')} className="flex items-center justify-center gap-1 hover:text-blue-400 transition-colors group">
                                    Risk <ArrowUpDown className={`w-3 h-3 ${sortField === 'riskFactor' ? 'text-blue-400' : 'opacity-0 group-hover:opacity-100'}`} />
                                </button>
                                <div className="text-right">Actions</div>
                            </div>
                        </div>
                    )}
                    <div className={viewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
                        {sources.map((source) => (
                            <SortableItem key={source.id} source={source} onEdit={onEdit} onDelete={handleDelete} viewMode={viewMode} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    )
}

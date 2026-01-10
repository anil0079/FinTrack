'use client'

import { deleteIncomeSource } from '@/app/actions/income'
import { Card, Button } from '@/components/ui/core'
import { Trash2, TrendingUp, Clock, AlertTriangle, Edit2, Tag } from 'lucide-react'

type IncomeSource = {
    id: string
    item: string
    category: string
    type: string
    monthlyIncome: number
    riskFactor: number
    weeklyHours: number
    growthRate: number
    payoutFrequency?: string | null
    // ... other fields
}

export function IncomeList({ sources, onEdit }: { sources: any[], onEdit: (source: any) => void }) {
    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this income source?')) {
            await deleteIncomeSource(id)
        }
    }

    if (sources.length === 0) {
        return (
            <div className="text-center p-8 text-slate-500">
                No income sources added yet. Start by adding one above.
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {sources.map((source) => (
                <Card key={source.id} className="p-5 hover:border-blue-500/50 transition-colors group relative overflow-hidden bg-slate-900/40">
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/80 rounded-lg p-1">
                        <button onClick={() => onEdit(source)} className="p-2 text-slate-400 hover:text-blue-400 rounded-md hover:bg-slate-800 transition-colors" title="Edit">
                            <Edit2 className="h-3 w-3" />
                        </button>
                        <button onClick={() => handleDelete(source.id)} className="p-2 text-slate-400 hover:text-red-400 rounded-md hover:bg-slate-800 transition-colors" title="Delete">
                            <Trash2 className="h-3 w-3" />
                        </button>
                    </div>

                    <div className="flex justify-between items-start mb-2 pr-16">
                        <div>
                            <h4 className="font-semibold text-lg text-white truncate max-w-[150px]" title={source.item}>{source.item}</h4>
                            <div className="flex gap-2 mt-1">
                                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">{source.category}</span>
                                <span className="text-[10px] bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-800">{source.type}</span>
                            </div>
                        </div>
                    </div>

                    <div className="my-4 pt-4 border-t border-slate-800/50 flex justify-between items-end">
                        <div>
                            <div className="text-xs text-slate-500 mb-1">Monthly Income</div>
                            <div className="text-xl font-bold text-emerald-400">₹{source.monthlyIncome.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                            {source.payoutFrequency && (
                                <div className="text-[10px] text-slate-500 bg-slate-950 px-2 py-1 rounded inline-block mb-1">
                                    {source.payoutFrequency}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2 text-sm bg-slate-950/30 p-2 rounded-lg">
                        <div className="flex flex-col gap-1 items-center bg-slate-900/50 p-2 rounded">
                            <span className="text-slate-500 text-[10px] flex items-center gap-1"><Clock className="w-3 h-3" /> Hours</span>
                            <span className="font-medium text-slate-200">{source.weeklyHours}</span>
                        </div>
                        <div className="flex flex-col gap-1 items-center bg-slate-900/50 p-2 rounded">
                            <span className="text-slate-500 text-[10px] flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Risk</span>
                            <span className={`font-medium ${source.riskFactor > 7 ? 'text-red-400' : source.riskFactor > 4 ? 'text-yellow-400' : 'text-green-400'}`}>
                                {source.riskFactor}/10
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 items-center bg-slate-900/50 p-2 rounded">
                            <span className="text-slate-500 text-[10px] flex items-center gap-1"><TrendingUp className="w-3 h-3" /> CAGR</span>
                            <span className="font-medium text-blue-400">{source.growthRate}%</span>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

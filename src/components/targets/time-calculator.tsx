'use client'

import React, { useState, useEffect } from 'react'
import { Card, Button, Input, Label } from '@/components/ui/core'
import { Calculator, Calendar } from 'lucide-react'

export default function TimeToTargetCalculator() {
    const [currentCorpus, setCurrentCorpus] = useState(0)
    const [monthlyContribution, setMonthlyContribution] = useState(50000)
    const [expectedReturn, setExpectedReturn] = useState(12)
    const [targetAmount, setTargetAmount] = useState(10000000) // 1 Crore default

    const [yearsToGoal, setYearsToGoal] = useState<number | null>(null)
    const [chartData, setChartData] = useState<any[]>([])

    useEffect(() => {
        calculateTime()
    }, [currentCorpus, monthlyContribution, expectedReturn, targetAmount])

    const calculateTime = () => {
        if (targetAmount <= currentCorpus) {
            setYearsToGoal(0)
            return
        }

        // FV = P(1+r)^t + PMT * (((1+r)^t - 1) / r) * (1+r)
        // Solving for t is complex iteratively or with logs.
        // Iterative approach is robust enough for Client JS.

        let corpus = currentCorpus
        let months = 0
        const monthlyRate = expectedReturn / 12 / 100

        // Safety break
        while (corpus < targetAmount && months < 600) { // 50 years max
            corpus = corpus * (1 + monthlyRate) + monthlyContribution
            months++
        }

        setYearsToGoal(months / 12)
    }

    return (
        <Card className="p-6 border-indigo-500/50 bg-gradient-to-br from-slate-900 to-indigo-950/20">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <Calculator className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Time to Financial Freedom</h3>
                    <p className="text-sm text-slate-400">When will I reach my magic number?</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div>
                        <Label>Target Amount (₹)</Label>
                        <Input
                            type="number"
                            value={targetAmount}
                            onChange={(e) => setTargetAmount(Number(e.target.value))}
                            className="text-lg font-semibold text-green-400"
                        />
                    </div>
                    <div>
                        <Label>Current Investment Corpus (₹)</Label>
                        <Input
                            type="number"
                            value={currentCorpus}
                            onChange={(e) => setCurrentCorpus(Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <Label>Monthly SIP / Contribution (₹)</Label>
                        <Input
                            type="number"
                            value={monthlyContribution}
                            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <Label>Expected Returns (CAGR %)</Label>
                        <Input
                            type="number"
                            value={expectedReturn}
                            onChange={(e) => setExpectedReturn(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="flex flex-col justify-center items-center text-center p-6 bg-slate-950/50 rounded-xl border border-slate-800">
                    {yearsToGoal !== null && yearsToGoal < 50 ? (
                        <>
                            <div className="text-sm text-slate-400 mb-2">You will reach your target in</div>
                            <div className="text-5xl font-bold text-white mb-2">
                                {yearsToGoal.toFixed(1)} <span className="text-lg text-slate-500 font-normal">Years</span>
                            </div>

                            <div className="flex items-center gap-2 text-indigo-300 bg-indigo-900/30 px-3 py-1 rounded-full text-sm mt-4">
                                <Calendar className="w-4 h-4" />
                                {new Date(new Date().setMonth(new Date().getMonth() + Math.round(yearsToGoal * 12))).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                            </div>
                        </>
                    ) : (
                        <div className="text-slate-500">
                            Goal seems too far (&gt; 50 years). Try increasing SIP or Returns.
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}

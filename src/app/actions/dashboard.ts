'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { calculateIncomeMetrics } from '@/lib/financials'

export async function getDashboardData() {
    const session = await auth()
    const userId = session?.user?.id

    // If no user, return Random Demo Data
    if (!userId) {
        return generateRandomData()
    }

    return await fetchDataForUser(userId)
}

async function fetchDataForUser(userId: string) {
    const [incomeSources, expenses] = await Promise.all([
        prisma.incomeSource.findMany({
            where: { userId },
            include: { payouts: true }
        }),
        prisma.expense.findMany({ where: { userId } })
    ])

    const calculatedIncomeMetrics = incomeSources.map(s => calculateIncomeMetrics(s))
    const totalMonthlyIncome = calculatedIncomeMetrics.reduce((acc, m) => acc + m.monthly, 0)

    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)

    const monthlyExpenses = expenses.filter(e => e.date >= firstDay)
    const totalMonthlyExpense = monthlyExpenses.length > 0
        ? monthlyExpenses.reduce((acc, e) => acc + e.amount, 0)
        : 0

    // 4. Savings
    let savingsRate = 0
    if (totalMonthlyIncome > 0) {
        savingsRate = ((totalMonthlyIncome - totalMonthlyExpense) / totalMonthlyIncome) * 100
    }

    // 5. Upcoming Events (Next 30-60 days)
    const upcomingEvents: any[] = []

    // Helper to add event
    const addEvent = (date: Date, title: string, amount: number, type: string, investedAmount: number = 0) => {
        const now = new Date()
        const diffTime = date.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays >= 0 && diffDays <= 60) {
            upcomingEvents.push({
                date: date.toISOString(),
                title,
                amount,
                investedAmount,
                type,
                daysUntil: diffDays
            })
        }
    }

    incomeSources.forEach(source => {
        // Check Next Payout Date
        if (source.nextPayoutDate) {
            addEvent(new Date(source.nextPayoutDate), `${source.item} Payout`, source.monthlyIncome, 'Payout', source.amountInvested)
        }

        // Check Specific Payout Schedules
        if (source.payouts && (source.payouts as any[]).length > 0) {
            (source.payouts as any[]).forEach(p => {
                if (p.date) {
                    addEvent(new Date(p.date), `${source.item} ${p.type}`, p.amount, p.type, source.amountInvested)
                }
            })
        }

        // Check Maturity
        if (source.investedUntil && (source.category === 'Bonds' || source.category === 'Stocks' || source.item.includes('FD'))) {
            // User requested showing invested amount instead of current/maturity amount
            addEvent(new Date(source.investedUntil), `${source.item} Maturity`, source.amountInvested, 'Maturity', source.amountInvested)
        }
    })

    // Sort by date ascending
    upcomingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return {
        incomeSources,
        monthlyExpenses,
        totalMonthlyIncome,
        totalMonthlyExpense,
        savingsRate,
        upcomingEvents: upcomingEvents.slice(0, 5) // Top 5
    }
}

function generateRandomData() {
    // Generate realistic demo scenario
    const incomeSources = [
        { id: 'demo-1', item: 'Software Engineer', type: 'Active', monthlyIncome: 120000, category: 'Job', amountInvested: 0, growthRate: 5 },
        { id: 'demo-2', item: 'Dividend Stocks', type: 'Passive', monthlyIncome: 5000, category: 'Stocks', amountInvested: 1000000, growthRate: 12 },
        { id: 'demo-3', item: 'Rental Property', type: 'Passive', monthlyIncome: 25000, category: 'Real Estate', amountInvested: 5000000, growthRate: 8 },
        { id: 'demo-4', item: 'Tech Blog', type: 'Semi-Passive', monthlyIncome: 8000, category: 'Business', amountInvested: 50000, growthRate: 20 }
    ]

    const totalMonthlyIncome = 158000
    const totalMonthlyExpense = 65000 // Realistic spend

    const savingsWithDemo = totalMonthlyIncome - totalMonthlyExpense
    const savingsRate = (savingsWithDemo / totalMonthlyIncome) * 100

    return {
        incomeSources,
        expenses: [], // No need to mock detailed expenses list for the chart unless required
        totalMonthlyIncome,
        totalMonthlyExpense,
        savingsRate
    }
}

'use server'

import { PrismaClient } from '@prisma/client'
import { auth } from '@/auth'

const prisma = new PrismaClient()

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
        prisma.incomeSource.findMany({ where: { userId } }),
        prisma.expense.findMany({ where: { userId } })
    ])

    const totalMonthlyIncome = incomeSources.length > 0
        ? incomeSources.reduce((acc, s) => acc + s.monthlyIncome, 0)
        : 0 // Explicit 0 if empty

    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)

    const currentMonthExpenses = expenses.filter(e => e.date >= firstDay)
    const totalMonthlyExpense = currentMonthExpenses.length > 0
        ? currentMonthExpenses.reduce((acc, e) => acc + e.amount, 0)
        : 0

    const savings = totalMonthlyIncome - totalMonthlyExpense
    const savingsRate = totalMonthlyIncome > 0 ? (savings / totalMonthlyIncome) * 100 : 0

    return {
        incomeSources,
        expenses,
        totalMonthlyIncome,
        totalMonthlyExpense,
        savingsRate
    }
}

function generateRandomData() {
    // Generate realistic demo scenario
    const incomeSources = [
        { id: 'demo-1', item: 'Software Engineer', type: 'Active', monthlyIncome: 120000, category: 'Job' },
        { id: 'demo-2', item: 'Dividend Stocks', type: 'Passive', monthlyIncome: 5000, category: 'Stocks' },
        { id: 'demo-3', item: 'Rental Property', type: 'Passive', monthlyIncome: 25000, category: 'Real Estate' },
        { id: 'demo-4', item: 'Tech Blog', type: 'Semi-Passive', monthlyIncome: 8000, category: 'Business' }
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

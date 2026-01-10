'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export type ExpenseFormData = {
    category: string
    amount: number
    description?: string
    date: string
}

const CATEGORIES = ['Needs', 'Wants', 'Savings', 'Debt']

export async function createExpense(data: ExpenseFormData) {
    let user = await prisma.user.findFirst()
    if (!user) {
        // Fallback for dev if user somehow missing
        user = await prisma.user.create({ data: { email: 'demo@example.com' } })
    }

    await prisma.expense.create({
        data: {
            userId: user.id,
            category: data.category,
            amount: Number(data.amount),
            description: data.description,
            date: new Date(data.date),
        }
    })

    revalidatePath('/budget')
    return { success: true }
}

export async function getExpenses() {
    const user = await prisma.user.findFirst()
    if (!user) return []

    return await prisma.expense.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' }
    })
}

export async function getBudgetOverview() {
    const user = await prisma.user.findFirst()
    if (!user) return null

    // Get total income
    const incomeSources = await prisma.incomeSource.findMany({ where: { userId: user.id } })
    const totalMonthlyIncome = incomeSources.reduce((sum, src) => sum + src.monthlyIncome, 0)

    // Get current month expenses
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)

    const expenses = await prisma.expense.findMany({
        where: {
            userId: user.id,
            date: { gte: firstDay }
        }
    })

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)

    // Group by 50/30/20 Rule mapping (Simplified)
    // Needs: Rent, Food, Utilities
    // Wants: Shopping, Entertainment
    // Savings: Investments

    const breakdown = {
        Needs: expenses.filter(e => e.category === 'Needs').reduce((s, e) => s + e.amount, 0),
        Wants: expenses.filter(e => e.category === 'Wants').reduce((s, e) => s + e.amount, 0),
        Savings: expenses.filter(e => e.category === 'Savings').reduce((s, e) => s + e.amount, 0),
    }

    return {
        totalMonthlyIncome,
        totalSpent,
        breakdown,
        expenses
    }
}

'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export type ExpenseFormData = {
    title?: string
    category: string
    amount: number
    description?: string
    date: string
    isRecurring?: boolean
    frequency?: string
    recurringDay?: number
    isLoan?: boolean
    totalPrincipal?: number
    remainingPrincipal?: number
    interestRate?: number
    tenureMonths?: number
    isSIP?: boolean
    assetType?: string
}

export async function createExpense(data: ExpenseFormData) {
    const user = await prisma.user.findFirst()
    if (!user) return { success: false, error: 'User not found' }

    await prisma.expense.create({
        data: {
            userId: user.id,
            title: data.title || data.category,
            category: data.category,
            amount: Number(data.amount),
            description: data.description,
            date: new Date(data.date),
            isRecurring: !!data.isRecurring,
            frequency: data.frequency,
            recurringDay: data.recurringDay ? Number(data.recurringDay) : null,
            isLoan: !!data.isLoan,
            totalPrincipal: data.totalPrincipal ? Number(data.totalPrincipal) : null,
            remainingPrincipal: data.remainingPrincipal ? Number(data.remainingPrincipal) : null,
            interestRate: data.interestRate ? Number(data.interestRate) : null,
            tenureMonths: data.tenureMonths ? Number(data.tenureMonths) : null,
            isSIP: !!data.isSIP,
            assetType: data.assetType
        }
    })

    revalidatePath('/budget')
    revalidatePath('/expense')
    return { success: true }
}

export async function deleteExpense(id: string) {
    await prisma.expense.delete({ where: { id } })
    revalidatePath('/budget')
    revalidatePath('/expense')
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

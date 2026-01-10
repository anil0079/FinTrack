'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'

const prisma = new PrismaClient()

export type IncomeFormData = {
    item: string
    category: string
    type: string
    nature: string
    payoutFrequency?: string
    riskFactor: number
    growthRate: number
    weeklyHours: number
    amountInvested: number
    investedUntil?: string // ISO date string
    monthlyIncome: number
    inHand: boolean
}

export async function createIncomeSource(data: IncomeFormData) {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, error: 'Not authenticated' }
    }

    try {
        await prisma.incomeSource.create({
            data: {
                userId: session.user.id,
                item: data.item,
                category: data.category || 'Other',
                type: data.type,
                nature: data.nature,
                payoutFrequency: data.payoutFrequency,
                riskFactor: Number(data.riskFactor),
                growthRate: Number(data.growthRate),
                weeklyHours: Number(data.weeklyHours),
                amountInvested: Number(data.amountInvested),
                investedUntil: data.investedUntil ? new Date(data.investedUntil) : null,
                monthlyIncome: Number(data.monthlyIncome),
                inHand: data.inHand,
            },
        })

        revalidatePath('/income')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Database error' }
    }
}

export async function getIncomeSources() {
    const session = await auth()

    // If no user, return empty (UI should handle Demo Mode or show empty state if on /income)
    if (!session?.user?.id) {
        return []
    }

    return await prisma.incomeSource.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    })
}

export async function deleteIncomeSource(id: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    try {
        // Ensure user owns the resource
        const source = await prisma.incomeSource.findUnique({ where: { id } })
        if (source?.userId !== session.user.id) {
            return { success: false, error: 'Unauthorized' }
        }

        await prisma.incomeSource.delete({ where: { id } })
        revalidatePath('/income')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        return { success: false, error }
    }
}

export async function updateIncomeSource(id: string, data: IncomeFormData) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    try {
        // Ensure user owns the resource
        const source = await prisma.incomeSource.findUnique({ where: { id } })
        if (source?.userId !== session.user.id) {
            return { success: false, error: 'Unauthorized' }
        }

        await prisma.incomeSource.update({
            where: { id },
            data: {
                item: data.item,
                category: data.category || 'Other',
                type: data.type,
                nature: data.nature,
                payoutFrequency: data.payoutFrequency,
                riskFactor: Number(data.riskFactor),
                growthRate: Number(data.growthRate),
                weeklyHours: Number(data.weeklyHours),
                amountInvested: Number(data.amountInvested),
                investedUntil: data.investedUntil ? new Date(data.investedUntil) : null,
                monthlyIncome: Number(data.monthlyIncome),
                inHand: data.inHand,
            },
        })
        revalidatePath('/income')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        return { success: false, error }
    }
}

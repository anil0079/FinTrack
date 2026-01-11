'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'

const prisma = new PrismaClient()

export type PayoutScheduleData = {
    date: string
    amount: number
    type: string
    status: string
}

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

    // Advanced
    tdsDeducted: boolean
    tdsRate: number
    maturityAmount?: number
    nextPayoutDate?: string
    investmentDate?: string // ISO date string
    recurringDay?: number
    payouts: PayoutScheduleData[]
}

export async function createIncomeSource(data: IncomeFormData) {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, error: 'Not authenticated' }
    }

    try {
        console.log(`Creating source with ${data.payouts.length} payouts`)

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

                // Advanced
                tdsDeducted: data.tdsDeducted,
                tdsRate: Number(data.tdsRate),
                maturityAmount: data.maturityAmount ? Number(data.maturityAmount) : null,
                nextPayoutDate: data.nextPayoutDate ? new Date(data.nextPayoutDate) : null,
                investmentDate: data.investmentDate ? new Date(data.investmentDate) : null,
                recurringDay: data.recurringDay ? Number(data.recurringDay) : null,

                payouts: {
                    create: data.payouts
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(p => ({
                            date: new Date(p.date),
                            amount: Number(p.amount),
                            type: p.type,
                            status: p.status
                        }))
                }
            },
        })

        revalidatePath('/income')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error("Create Error:", error)
        return { success: false, error: 'Database error' }
    }
}

export async function getIncomeSources() {
    const session = await auth()

    if (!session?.user?.id) {
        return []
    }

    return await prisma.incomeSource.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            payouts: {
                orderBy: { date: 'desc' }
            }
        }
    })
}

export async function deleteIncomeSource(id: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    try {
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
        const source = await prisma.incomeSource.findUnique({ where: { id } })
        if (source?.userId !== session.user.id) {
            return { success: false, error: 'Unauthorized' }
        }

        await prisma.$transaction(async (tx) => {
            await tx.incomeSource.update({
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

                    tdsDeducted: data.tdsDeducted,
                    tdsRate: Number(data.tdsRate),
                    maturityAmount: data.maturityAmount ? Number(data.maturityAmount) : null,
                    nextPayoutDate: data.nextPayoutDate ? new Date(data.nextPayoutDate) : null,
                    investmentDate: data.investmentDate ? new Date(data.investmentDate) : null,
                    recurringDay: data.recurringDay ? Number(data.recurringDay) : null,
                },
            })

            // Simple replace strategy for payouts using sequential creation for robustness
            await tx.payoutSchedule.deleteMany({ where: { incomeSourceId: id } })

            if (data.payouts.length > 0) {
                console.log(`Updating source ${id} with ${data.payouts.length} payouts`)
                const sortedPayouts = [...data.payouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

                // Use individual creates for better error tracking and SQLite compatibility
                for (const p of sortedPayouts) {
                    await tx.payoutSchedule.create({
                        data: {
                            incomeSourceId: id,
                            date: new Date(p.date),
                            amount: Number(p.amount),
                            type: p.type,
                            status: p.status
                        }
                    })
                }
            }
        })

        revalidatePath('/income')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error("Update Error:", error)
        return { success: false, error }
    }
}

export async function updateIncomeSourceOrder(updates: { id: string, sortOrder: number }[]) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    try {
        await prisma.$transaction(
            updates.map(({ id, sortOrder }) =>
                prisma.incomeSource.update({
                    where: { id },
                    data: { sortOrder }
                })
            )
        )

        revalidatePath('/income')
        return { success: true }
    } catch (error) {
        console.error("Update Order Error:", error)
        return { success: false, error }
    }
}

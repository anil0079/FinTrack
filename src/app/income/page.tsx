import { getIncomeSources } from '@/app/actions/income'
import IncomePageClient from '@/components/income/income-page-client'
import { auth } from '@/auth'

export default async function IncomePage() {
    const session = await auth()
    let sources = await getIncomeSources()

    // Demo Mode if not logged in
    if (!session?.user && sources.length === 0) {
        sources = [
            {
                id: 'demo-1',
                item: 'Demo Salary',
                category: 'Job',
                type: 'Active',
                nature: 'Fixed',
                monthlyIncome: 85000,
                riskFactor: 1,
                growthRate: 5,
                weeklyHours: 40,
                amountInvested: 0,
                inHand: true,
                payoutFrequency: 'Monthly',
                payouts: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                userId: 'demo'
            } as any,
            {
                id: 'demo-2',
                item: 'Demo Dividends',
                category: 'Stocks',
                type: 'Passive',
                nature: 'Variable',
                monthlyIncome: 12000,
                riskFactor: 4,
                growthRate: 12,
                weeklyHours: 0,
                amountInvested: 1500000,
                inHand: false,
                payoutFrequency: 'Quarterly',
                payouts: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                userId: 'demo'
            } as any
        ]
    }

    return (
        <div className="relative">
            {!session?.user && (
                <div className="bg-indigo-600/20 border-b border-indigo-500/30 p-2 text-center text-xs text-indigo-200 font-medium">
                    You are viewing Demo Data. Sign In to save your own financial gravity.
                </div>
            )}
            <IncomePageClient initialSources={sources} />
        </div>
    )
}

import { getExpenses, getBudgetOverview } from '@/app/actions/expense'
import ExpenseDashboard from '@/components/expense/expense-dashboard'

export default async function ExpensePage() {
    const expenses = await getExpenses()
    const budgetData = await getBudgetOverview()

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans pb-24 md:pb-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                            Expense Management
                        </h1>
                        <p className="text-slate-400 mt-1">Track commitments, loans, and recurring SIPs.</p>
                    </div>
                </header>

                <ExpenseDashboard initialExpenses={expenses} budgetData={budgetData} />
            </div>
        </div>
    )
}

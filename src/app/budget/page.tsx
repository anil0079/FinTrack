import { getBudgetOverview } from '@/app/actions/expense'
import BudgetDashboard from '@/components/budget/budget-dashboard'

export default async function BudgetPage() {
    const data = await getBudgetOverview()

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans pb-24 md:pb-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                        Intelligent Budgeting
                    </h1>
                    <p className="text-slate-400 mt-1">Track your alignment with the 50/30/20 rule.</p>
                </header>

                <BudgetDashboard data={data} />
            </div>
        </div>
    )
}

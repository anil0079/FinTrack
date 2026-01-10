import { getIncomeSources } from '@/app/actions/income'
import OptimizationDashboard from '@/components/optimization/optimization-dashboard'

export default async function OptimizePage() {
    const rawData = await getIncomeSources()

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Time & Risk Optimization
                    </h1>
                    <p className="text-slate-400 mt-1">Analyze the efficiency of your capital and time.</p>
                </header>

                <OptimizationDashboard data={rawData} />
            </div>
        </div>
    )
}

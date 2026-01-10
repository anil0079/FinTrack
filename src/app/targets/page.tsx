import TargetDashboard from '@/components/targets/target-dashboard'
import TimeToTargetCalculator from '@/components/targets/time-calculator'

export default function TargetsPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans pb-24 md:pb-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
                        Target Planning
                    </h1>
                    <p className="text-slate-400 mt-1">Define your future. We calculate the path.</p>
                </header>

                <TimeToTargetCalculator />
                <TargetDashboard />
            </div>
        </div>
    )
}

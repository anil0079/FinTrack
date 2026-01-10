import AllocationDashboard from '@/components/allocation/allocation-dashboard'

export default function AllocationPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans pb-24 md:pb-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text text-transparent">
                        Smart Allocation
                    </h1>
                    <p className="text-slate-400 mt-1">Simulate portfolio strategies based on financial theory.</p>
                </header>

                <AllocationDashboard />
            </div>
        </div>
    )
}

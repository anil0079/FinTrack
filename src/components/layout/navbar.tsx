import Link from 'next/link'
import { LayoutDashboard, TrendingUp, PieChart, Coins, LogIn, LogOut } from 'lucide-react'
import { auth, signIn, signOut } from '@/auth'
import { Button } from '@/components/ui/core'

export async function NavBar() {
    const session = await auth()

    return (
        <nav className="fixed bottom-0 md:bottom-auto md:top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur border-t md:border-t-0 md:border-b border-slate-800 z-50 flex items-center justify-center md:justify-start px-8">
            <div className="flex gap-1 md:gap-8 items-center w-full max-w-6xl mx-auto justify-between md:justify-start">
                <Link href="/dashboard" className="flex flex-col md:flex-row items-center gap-2 text-slate-400 hover:text-white transition-colors p-2">
                    <img src="/favicon.ico" className="w-5 h-5 opacity-80" alt="" />
                    <span className="text-[10px] md:text-sm font-medium">Home</span>
                </Link>
                <Link href="/income" className="flex flex-col md:flex-row items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors p-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-[10px] md:text-sm font-medium">Income</span>
                </Link>
                <Link href="/optimize" className="flex flex-col md:flex-row items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors p-2">
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="text-[10px] md:text-sm font-medium">Optimize</span>
                </Link>
                <Link href="/allocation" className="flex flex-col md:flex-row items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors p-2">
                    <PieChart className="w-5 h-5" />
                    <span className="text-[10px] md:text-sm font-medium">Allocation</span>
                </Link>
                <Link href="/budget" className="flex flex-col md:flex-row items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors p-2">
                    <Coins className="w-5 h-5" />
                    <span className="text-[10px] md:text-sm font-medium">Budget</span>
                </Link>
                <Link href="/targets" className="flex flex-col md:flex-row items-center gap-2 text-slate-400 hover:text-red-400 transition-colors p-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-[10px] md:text-sm font-medium">Targets</span>
                </Link>
            </div>

            <div className="hidden md:ml-auto md:flex items-center gap-4">
                {session?.user ? (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400">Hi, {session.user.name?.split(' ')[0]}</span>
                        <form
                            action={async () => {
                                "use server"
                                await signOut()
                            }}
                        >
                            <button className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors">
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </form>
                    </div>
                ) : (
                    <Link href="/api/auth/signin">
                        <Button variant="ghost" className="text-slate-400 hover:text-white gap-2 h-9 px-3">
                            <LogIn className="w-4 h-4" />
                            Sign In
                        </Button>
                    </Link>
                )}
            </div>
        </nav>
    )
}

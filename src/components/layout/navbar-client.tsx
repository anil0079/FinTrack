'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, TrendingUp, PieChart, Coins, Target } from 'lucide-react'

const navItems = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard, color: 'white' },
    { href: '/income', label: 'Income', icon: TrendingUp, color: 'blue' },
    { href: '/expense', label: 'Expenses', icon: Coins, color: 'red' },
    { href: '/optimize', label: 'Optimize', icon: LayoutDashboard, color: 'purple' },
    { href: '/allocation', label: 'Allocation', icon: PieChart, color: 'emerald' },
    { href: '/budget', label: 'Budget', icon: Target, color: 'orange' },
    { href: '/targets', label: 'Targets', icon: Target, color: 'rose' },
]

export function NavBarClient() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 md:bottom-auto md:top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur border-t md:border-t-0 md:border-b border-slate-800 z-50 flex items-center justify-center md:justify-start px-8">
            <div className="flex gap-1 md:gap-8 items-center w-full max-w-6xl mx-auto justify-between md:justify-start">
                {navItems.map(item => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col md:flex-row items-center gap-2 transition-all p-2 rounded-lg ${isActive
                                ? `text-${item.color}-400 bg-${item.color}-500/10 border border-${item.color}-500/30`
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? `text-${item.color}-400` : ''}`} />
                            <span className={`text-[10px] md:text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}

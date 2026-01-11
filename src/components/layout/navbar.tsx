import Link from 'next/link'
import { LogIn, LogOut } from 'lucide-react'
import { auth, signOut } from '@/auth'
import { Button } from '@/components/ui/core'
import { NavBarClient } from './navbar-client'

export async function NavBar() {
    const session = await auth()

    return (
        <>
            <NavBarClient />
            <div className="fixed top-4 right-8 z-50 hidden md:flex items-center gap-4">
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
        </>
    )
}

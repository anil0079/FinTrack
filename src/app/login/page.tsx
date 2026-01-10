
import { SignIn } from "@/components/auth/sign-in"

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6">
            <div className="w-full max-w-sm rounded-lg border border-slate-800 bg-slate-900 p-8 shadow-lg text-center">
                <h1 className="mb-2 text-2xl font-bold text-white">Welcome Back</h1>
                <p className="mb-6 text-sm text-slate-400">Sign in to sync your financial gravity.</p>
                <SignIn />
            </div>
        </div>
    )
}

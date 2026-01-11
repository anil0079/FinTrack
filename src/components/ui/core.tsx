import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'danger'
    size?: 'default' | 'sm' | 'lg' | 'icon'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        const variants = {
            default: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30",
            outline: "border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-200",
            ghost: "hover:bg-slate-800 text-slate-300 hover:text-white",
            danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/30"
        }

        const sizes = {
            default: "px-4 py-2 text-sm",
            sm: "px-2 py-1 text-xs",
            lg: "px-6 py-3 text-base",
            icon: "p-2"
        }

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
    ({ className, ...props }, ref) => {
        return (
            <label
                ref={ref}
                className={cn(
                    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300 mb-2 block",
                    className
                )}
                {...props}
            />
        )
    }
)
Label.displayName = "Label"

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-xl border border-slate-800 bg-slate-950/50 text-slate-100 shadow-xl backdrop-blur-sm",
                    className
                )}
                {...props}
            />
        )
    }
)
Card.displayName = "Card"

'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { Coins, Stamp, LogOut, LayoutDashboard, Sparkles } from "lucide-react"

export function Navbar() {
    const { data: session } = useSession()

    return (
        <nav className="fixed top-4 left-0 right-0 z-50 flex justify-center">
            <div className="glass-card rounded-full px-6 py-3 flex items-center gap-8 shadow-2xl shadow-indigo-500/10">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="p-1.5 rounded-lg bg-indigo-500 text-white group-hover:scale-110 transition-transform">
                        <Stamp className="w-5 h-5" />
                    </div>
                    <span className="font-bold tracking-tight text-foreground">
                        StampIt
                    </span>
                </Link>

                <div className="h-4 w-px bg-border/50 hidden md:block" />

                <div className="flex items-center gap-4">
                    {session ? (
                        <>
                            <Link href="/create" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                <span className="hidden sm:inline">Create</span>
                            </Link>

                            <Link href="/stamper" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                                <Stamp className="w-4 h-4" />
                                <span className="hidden sm:inline">Stamper</span>
                            </Link>

                            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                                <LayoutDashboard className="w-4 h-4" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Link>

                            <div className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full">
                                <Coins className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-xs font-mono font-bold text-secondary-foreground">{session.user.coins}</span>
                            </div>

                            <button
                                onClick={() => signOut()}
                                className="text-muted-foreground hover:text-destructive transition-colors ml-2"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => signIn(undefined, { callbackUrl: '/dashboard' })}
                            className="bg-primary text-primary-foreground px-5 py-2 rounded-full font-medium hover:opacity-90 transition-all text-sm shadow-lg shadow-indigo-500/25"
                        >
                            Log In
                        </button>
                    )}
                </div>
            </div>
        </nav>
    )
}

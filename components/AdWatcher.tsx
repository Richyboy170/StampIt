'use client'

import { useState } from "react"
import { watchAdReward } from "@/app/actions/economy"
import { PlayCircle, Loader2, Coins } from "lucide-react"
import { useSession } from "next-auth/react"

export function AdWatcher() {
    const [viewing, setViewing] = useState(false)
    const [timeLeft, setTimeLeft] = useState(0)
    const { update } = useSession()

    const startAd = async () => {
        setViewing(true)
        setTimeLeft(5)

        // Simulate Ad Countdown
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        // Wait 5s then reward
        await new Promise(r => setTimeout(r, 5000))

        const res = await watchAdReward()
        if (res.success) {
            update() // Refresh coins
        }
        setViewing(false)
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-indigo-400" />
                Watch Ad
            </h3>
            <p className="text-slate-400 text-sm mb-4">Watch a short ad to earn <span className="text-amber-400 font-bold">+5 Coins</span>.</p>

            <button
                onClick={startAd}
                disabled={viewing}
                className="w-full bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 hover:border-indigo-500/50 text-white rounded-lg px-4 py-8 flex flex-col items-center justify-center gap-2 transition-all group-hover:bg-slate-800"
            >
                {viewing ? (
                    <>
                        <div className="relative">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{timeLeft}</span>
                        </div>
                        <span className="text-sm text-indigo-300">Watching Ad... (+5)</span>
                    </>
                ) : (
                    <>
                        <div className="bg-indigo-500/10 p-3 rounded-full group-hover:scale-110 transition-transform">
                            <Coins className="w-6 h-6 text-indigo-400" />
                        </div>
                        <span className="font-medium">Watch & Earn</span>
                    </>
                )}
            </button>
        </div>
    )
}

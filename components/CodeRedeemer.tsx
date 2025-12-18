'use client'
// hello world
import { useState } from "react"
import { redeemCode } from "@/app/actions/economy"
import { Loader2, CheckCircle2, Ticket } from "lucide-react"
import { useSession } from "next-auth/react"

export function CodeRedeemer() {
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const { update } = useSession()

    const handleRedeem = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!code.trim()) return

        setLoading(true)
        setMessage(null)

        const result = await redeemCode(code)

        if (result.success) {
            setMessage({ type: 'success', text: `+${result.coinsAdded} coins!` })
            setCode("")
            update() // Update session client side
        } else {
            setMessage({ type: 'error', text: result.error || "Failed" })
        }
        setLoading(false)
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Ticket className="w-24 h-24" />
            </div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-purple-400" />
                Redeem Code
            </h3>
            <p className="text-slate-400 text-sm mb-4">Enter a promo code to get instant coins.</p>

            <form onSubmit={handleRedeem} className="flex gap-2 relative z-10">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ex: WELCOME"
                    className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 flex-1 uppercase tracking-wider"
                />
                <button
                    disabled={loading}
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] flex items-center justify-center"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Redeem"}
                </button>
            </form>

            {message && (
                <div className={`mt-4 text-sm flex items-center gap-2 ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : null}
                    {message.text}
                </div>
            )}
        </div>
    )
}

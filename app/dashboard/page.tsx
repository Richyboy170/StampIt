import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { CodeRedeemer } from "@/components/CodeRedeemer"
import { AdWatcher } from "@/components/AdWatcher"
import { StampGallery } from "@/components/StampGallery"
import { getUserStamps } from "@/app/actions/stamps"
import Link from "next/link"
import { Plus, Coins, Image, FolderOpen } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/")

    const { stamps } = await getUserStamps()

    return (
        <main className="min-h-screen bg-slate-950">
            <Navbar />

            <div className="container mx-auto px-4 pt-32 pb-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
                            Dashboard
                        </h1>
                        <p className="text-slate-400 mt-1">Manage your coins and stamp collection.</p>
                    </div>

                    <Link
                        href="/create"
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-medium shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Stamp
                    </Link>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {/* Coin Balance */}
                    <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 border border-indigo-500/20 p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-amber-500/10 p-2 rounded-lg">
                                <Coins className="w-5 h-5 text-amber-400" />
                            </div>
                            <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Coin Balance</span>
                        </div>
                        <div className="text-4xl font-black text-white tracking-tight flex items-baseline gap-2">
                            {session.user.coins}
                            <span className="text-lg text-amber-400">coins</span>
                        </div>
                    </div>

                    {/* Stamp Count */}
                    <div className="bg-gradient-to-br from-purple-900/30 to-slate-900 border border-purple-500/20 p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-purple-500/10 p-2 rounded-lg">
                                <Image className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Saved Stamps</span>
                        </div>
                        <div className="text-4xl font-black text-white tracking-tight flex items-baseline gap-2">
                            {stamps.length}
                            <span className="text-lg text-purple-400">stamps</span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-green-500/10 p-2 rounded-lg">
                                <FolderOpen className="w-5 h-5 text-green-400" />
                            </div>
                            <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Quick Stats</span>
                        </div>
                        <div className="text-sm text-slate-400 space-y-1">
                            <p>Download cost: <span className="text-white font-medium">5 coins</span></p>
                            <p>Ad reward: <span className="text-green-400 font-medium">+5 coins</span></p>
                        </div>
                    </div>
                </div>

                {/* Earn Coins Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Coins className="w-5 h-5 text-amber-400" />
                        Earn Coins
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AdWatcher />
                        <CodeRedeemer />
                    </div>
                </div>

                {/* Stamp Gallery Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Image className="w-5 h-5 text-purple-400" />
                            My Stamps
                        </h2>
                        {stamps.length > 0 && (
                            <span className="text-sm text-slate-500">{stamps.length} stamp{stamps.length !== 1 ? 's' : ''}</span>
                        )}
                    </div>

                    <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
                        <StampGallery stamps={stamps} />
                    </div>
                </div>
            </div>
        </main>
    )
}

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { StampEditor } from "@/components/StampEditor"

export default async function CreatePage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/")

    return (
        <main className="min-h-screen bg-slate-950">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white">Stamp Studio</h1>
                    <p className="text-slate-400">Upload an image and tweak settings to create your custom stamp.</p>
                </div>

                <StampEditor userCoins={session.user.coins} userId={session.user.id} />
            </div>
        </main>
    )
}

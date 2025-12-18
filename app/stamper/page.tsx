import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { DocumentStamper } from "@/components/DocumentStamper"
import { getUserStamps } from "@/app/actions/stamps"

export const dynamic = 'force-dynamic'

export default async function StamperPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/")

    const { stamps } = await getUserStamps()

    return (
        <main className="min-h-screen bg-slate-950">
            <Navbar />

            <div className="container mx-auto px-4 pt-32 pb-20">
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                        Stamp Your Document
                    </h1>
                    <p className="text-lg text-slate-400">
                        Upload a contract, letter, or image and apply your custom stamps realistically.
                    </p>
                </div>

                <DocumentStamper userStamps={stamps} />
            </div>
        </main>
    )
}

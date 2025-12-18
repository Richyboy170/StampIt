import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Guest Login (Dev)",
            credentials: {},
            async authorize(credentials) {
                const email = "guest@example.com"
                let user = await prisma.user.findUnique({ where: { email } })
                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email,
                            name: "Guest User",
                            coins: 50,
                            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=guest"
                        }
                    })
                }
                return user
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user && session.user.email) {
                const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
                if (dbUser) {
                    session.user.id = dbUser.id
                    session.user.coins = dbUser.coins
                }
            }
            return session
        },
        async jwt({ token, user, trigger, session }) {
            if (trigger === "update" && session?.coins) {
                token.coins = session.coins
            }
            return token
        }
    },
    session: {
        strategy: "jwt"
    }
    // Default NextAuth sign-in page is used (shows all providers including Guest Login)
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

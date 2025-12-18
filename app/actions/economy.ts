'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// =============================================================================
// REDEMPTION CODES CONFIGURATION
// =============================================================================
// Add or modify codes here to give users free coins.
// Format: "CODE_NAME": coin_value
// Codes are case-insensitive (automatically converted to uppercase)
// Each code can only be redeemed ONCE per user
// =============================================================================
const REDEMPTION_CODES: Record<string, number> = {
    // === WELCOME CODES ===
    "WELCOME": 50,          // First-time users welcome bonus
    "NEWUSER": 30,          // Alternative welcome code

    // === PROMOTIONAL CODES ===
    "STAMP2024": 25,        // 2024 promotional campaign
    "HOLIDAY": 40,          // Holiday special
    "SUMMER25": 35,         // Summer 2025 promotion

    // === BASIC REWARD CODES ===
    "FREECOINS": 10,        // Basic reward code
    "BONUS10": 10,          // 10 coin bonus
    "BONUS20": 20,          // 20 coin bonus
    "BONUS50": 50,          // 50 coin bonus

    // === SPECIAL CODES ===
    "DESIGN": 15,           // Designer community code
    "VIP100": 100,          // VIP special (100 coins!)
    "CREATOR": 75,          // Content creator code

    // === EVENT CODES ===
    "LAUNCH": 100,          // Launch event special
    "BETA": 200,            // Beta tester reward

    // =============================================
    // ADD YOUR CUSTOM CODES BELOW THIS LINE ↓
    // =============================================

};

// Ad watching reward amount
const AD_WATCH_REWARD = 5;

/**
 * Redeem a code for coins
 * Each code can only be used once per user
 */
export async function redeemCode(code: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    const cleanCode = code.toUpperCase().trim();
    const value = REDEMPTION_CODES[cleanCode];

    if (!value) {
        return { success: false, error: "Invalid code" };
    }

    try {
        const userId = session.user.id;

        // Check if already redeemed
        const existing = await prisma.redeemedCode.findFirst({
            where: {
                userId,
                code: cleanCode
            }
        });

        if (existing) {
            return { success: false, error: "Code already redeemed" };
        }

        // Transaction: Add coins and record redemption
        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { coins: { increment: value } }
            }),
            prisma.redeemedCode.create({
                data: {
                    userId: userId,
                    code: cleanCode
                }
            })
        ]);

        revalidatePath("/dashboard");
        revalidatePath("/create");
        return { success: true, coinsAdded: value };
    } catch (e) {
        console.error("Error redeeming code:", e);
        return { success: false, error: "Something went wrong. Please try again." };
    }
}

/**
 * Reward coins for watching an ad
 */
export async function watchAdReward() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { coins: { increment: AD_WATCH_REWARD } }
        });

        revalidatePath("/dashboard");
        revalidatePath("/create");
        return { success: true, coinsAdded: AD_WATCH_REWARD };
    } catch (e) {
        console.error("Error rewarding ad watch:", e);
        return { success: false, error: "Failed to reward coins" };
    }
}

/**
 * Deduct coins from user account (for downloads/exports)
 */
export async function deductCoins(amount: number) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        // Get current balance
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { coins: true }
        });

        if (!user || user.coins < amount) {
            return { success: false, error: "Insufficient coins" };
        }

        // Deduct coins
        await prisma.user.update({
            where: { id: session.user.id },
            data: { coins: { decrement: amount } }
        });

        revalidatePath("/dashboard");
        revalidatePath("/create");
        return { success: true, newBalance: user.coins - amount };
    } catch (e) {
        console.error("Error deducting coins:", e);
        return { success: false, error: "Failed to process transaction" };
    }
}

/**
 * Get user's current coin balance
 */
export async function getCoinBalance() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return { success: false, coins: 0 };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { coins: true }
        });

        return { success: true, coins: user?.coins || 0 };
    } catch (e) {
        return { success: false, coins: 0 };
    }
}

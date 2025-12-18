'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Save a new stamp to the user's gallery
 */
export async function saveStamp(imageData: string, config: any, name?: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const stamp = await prisma.stamp.create({
            data: {
                userId: session.user.id,
                name: name || `Stamp ${new Date().toLocaleDateString()}`,
                imageData: imageData,
                config: JSON.stringify(config)
            }
        });

        revalidatePath("/dashboard");
        revalidatePath("/stamper");
        return { success: true, stampId: stamp.id };
    } catch (e) {
        console.error("Error saving stamp:", e);
        return { success: false, error: "Failed to save stamp" };
    }
}

/**
 * Get all stamps for the current user
 */
export async function getUserStamps() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return { success: false, stamps: [] };
    }

    try {
        const stamps = await prisma.stamp.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                imageData: true,
                config: true,
                createdAt: true,
            }
        });

        return {
            success: true,
            stamps: stamps.map(s => ({
                ...s,
                config: JSON.parse(s.config),
            }))
        };
    } catch (e) {
        console.error("Error fetching stamps:", e);
        return { success: false, stamps: [] };
    }
}

/**
 * Get a single stamp by ID
 */
export async function getStampById(stampId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return { success: false, stamp: null };
    }

    try {
        const stamp = await prisma.stamp.findFirst({
            where: {
                id: stampId,
                userId: session.user.id
            }
        });

        if (!stamp) {
            return { success: false, stamp: null, error: "Stamp not found" };
        }

        return {
            success: true,
            stamp: {
                ...stamp,
                config: JSON.parse(stamp.config),
            }
        };
    } catch (e) {
        return { success: false, stamp: null };
    }
}

/**
 * Update a stamp's name
 */
export async function updateStampName(stampId: string, newName: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        await prisma.stamp.updateMany({
            where: {
                id: stampId,
                userId: session.user.id
            },
            data: { name: newName }
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (e) {
        return { success: false, error: "Failed to update stamp" };
    }
}

/**
 * Delete a stamp
 */
export async function deleteStamp(stampId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        await prisma.stamp.deleteMany({
            where: {
                id: stampId,
                userId: session.user.id
            }
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (e) {
        console.error("Error deleting stamp:", e);
        return { success: false, error: "Failed to delete stamp" };
    }
}

/**
 * Get stamp count for user
 */
export async function getStampCount() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return { count: 0 };
    }

    try {
        const count = await prisma.stamp.count({
            where: { userId: session.user.id }
        });
        return { count };
    } catch (e) {
        return { count: 0 };
    }
}

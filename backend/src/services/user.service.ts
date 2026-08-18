import prisma from "../config/prisma";

export interface SyncUserData {
    clerkUserId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    }

    export interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    phone?: string;
    }

    export const findUserByClerkId = async (clerkUserId: string) => {
    return prisma.user.findUnique({
        where: {
        clerkUserId,
        },
    });
    };

    export const syncUserWithDb = async (data: SyncUserData) => {
    return prisma.user.upsert({
        where: {
        clerkUserId: data.clerkUserId,
        },
        update: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        },
        create: {
        clerkUserId: data.clerkUserId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: "customer",
        },
    });
    };

    export const updateUserProfile = async (clerkUserId: string, data: UpdateProfileData) => {
    return prisma.user.update({
        where: {
        clerkUserId,
        },
        data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.phone !== undefined && { phone: data.phone }),
        },
    });
    };
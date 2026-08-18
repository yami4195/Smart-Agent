import prisma from "../config/prisma";

interface CreateUserData {
    clerkUserId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
}

    export const findUserByClerkId = async (clerkUserId: string) => {
    return prisma.user.findUnique({
        where: {
        clerkUserId,
        },
    });
    };

export const createUser = async (data: CreateUserData) => {
    return prisma.user.create({
    data: {
        clerkUserId: data.clerkUserId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
    },
    });
};
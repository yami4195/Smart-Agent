import prisma from "../config/prisma";

export interface SyncUserData {
  clerkUserId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: "customer" | "employee" | "admin";
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
  const existingUser = await prisma.user.findUnique({
    where: { clerkUserId: data.clerkUserId },
  });

  if (existingUser) {
    // Only update fields that are provided and not empty, so we don't wipe existing DB data
    const updatePayload: Record<string, any> = {};
    if (data.firstName && data.firstName.trim() !== '') {
      updatePayload.firstName = data.firstName.trim();
    }
    if (data.lastName && data.lastName.trim() !== '') {
      updatePayload.lastName = data.lastName.trim();
    }
    if (data.email && data.email.trim() !== '') {
      updatePayload.email = data.email.trim();
    }
    if (data.phone && data.phone.trim() !== '') {
      updatePayload.phone = data.phone.trim();
    }
    // Note: Role is intentionally preserved for existing users to prevent privilege escalation via sync

    if (Object.keys(updatePayload).length > 0) {
      return prisma.user.update({
        where: { clerkUserId: data.clerkUserId },
        data: updatePayload,
      });
    }
    return existingUser;
  }

  // Create new user record
  return prisma.user.create({
    data: {
      clerkUserId: data.clerkUserId,
      firstName: data.firstName?.trim() || '',
      lastName: data.lastName?.trim() || '',
      email: data.email?.trim() || '',
      phone: data.phone?.trim() || '',
      role: data.role || "customer",
    },
  });
};

export const updateUserProfile = async (clerkUserId: string, data: UpdateProfileData) => {
  return prisma.user.update({
    where: {
      clerkUserId,
    },
    data: {
      ...(data.firstName !== undefined && { firstName: data.firstName.trim() }),
      ...(data.lastName !== undefined && { lastName: data.lastName.trim() }),
      ...(data.phone !== undefined && { phone: data.phone.trim() }),
    },
  });
};

export const updateUserRole = async (clerkUserId: string, role: "customer" | "employee" | "admin") => {
  return prisma.user.update({
    where: {
      clerkUserId,
    },
    data: {
      role,
    },
  });
};
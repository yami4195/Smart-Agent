import { Request, Response } from "express";
import {
    findUserByClerkId,
    syncUserWithDb,
    updateUserProfile,
    updateUserRole,
} from "../services/user.service";

export const syncUser = async (req: Request, res: Response) => {
    try {
        const clerkUserId = req.clerkUserId!;

        const { firstName, lastName, email, phone, role } = req.body;

        const user = await syncUserWithDb({
            clerkUserId,
            firstName,
            lastName,
            email,
            phone,
            role,
        });

        return res.status(200).json({
            success: true,
            message: "User synced successfully",
            user,
        });
    } catch (error) {
        console.error("Sync user error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while syncing user",
        });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const clerkUserId = req.clerkUserId!;

        const user = await findUserByClerkId(clerkUserId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found in database",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Get me error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const updateMe = async (req: Request, res: Response) => {
    try {
        const clerkUserId = req.clerkUserId!;

        const { firstName, lastName, phone } = req.body;

        const updatedUser = await updateUserProfile(clerkUserId, {
            firstName,
            lastName,
            phone,
        });

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while updating profile",
        });
    }
};

export const updateRole = async (req: Request, res: Response) => {
    try {
        const clerkUserId = req.clerkUserId!;
        const { role, targetClerkUserId } = req.body;

        if (!role || !["customer", "employee", "admin"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role. Allowed values: customer, employee, admin",
            });
        }

        // Verify the caller is an admin
        const caller = await findUserByClerkId(clerkUserId);
        if (!caller || caller.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Only administrators can update roles",
            });
        }

        const targetUserClerkId = targetClerkUserId || clerkUserId;
        const updatedUser = await updateUserRole(targetUserClerkId, role);

        return res.status(200).json({
            success: true,
            message: "Role updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Update role error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while updating role",
        });
    }
};
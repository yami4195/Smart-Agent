import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import {
    findUserByClerkId,
    syncUserWithDb,
    updateUserProfile,
    updateUserRole,
    } from "../services/user.service";

    export const syncUser = async (req: Request, res: Response) => {
    try {
        const clerkUserId = req.clerkUserId!; //middleware already authenticates

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
        message: "User synced successfully",
        user,
        });
    } catch (error) {
        console.error("Sync user error:", error);
        return res.status(500).json({
        message: "Internal server error while syncing user",
        });
    }
    };

    export const getMe = async (req: Request, res: Response) => {
    try {
       const clerkUserId = req.clerkUserId!; //middleware already authenticates

        const user = await findUserByClerkId(clerkUserId);

        if (!user) {
        return res.status(404).json({
            message: "User not found in database",
        });
        }

        return res.status(200).json({
        user,
        });
    } catch (error) {
        console.error("Get me error:", error);
        return res.status(500).json({
        message: "Internal server error",
        });
    }
    };

    export const updateMe = async (req: Request, res: Response) => {
    try {
        const clerkUserId = req.clerkUserId!; //middleware already authenticates

        const { firstName, lastName, phone } = req.body;

        const updatedUser = await updateUserProfile(clerkUserId, {
        firstName,
        lastName,
        phone,
        });

        return res.status(200).json({
        message: "Profile updated successfully",
        user: updatedUser,
        });
    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({
        message: "Internal server error while updating profile",
        });
    }
    };

    export const updateRole = async (req: Request, res: Response) => {
    try {
        const clerkUserId = req.clerkUserId!;
        const { role } = req.body;

        if (!role || !["customer", "employee", "admin"].includes(role)) {
        return res.status(400).json({
            message: "Invalid role. Allowed values: customer, employee, admin",
        });
        }

        const updatedUser = await updateUserRole(clerkUserId, role);

        return res.status(200).json({
        message: "Role updated successfully",
        user: updatedUser,
        });
    } catch (error) {
        console.error("Update role error:", error);
        return res.status(500).json({
        message: "Internal server error while updating role",
        });
    }
    };
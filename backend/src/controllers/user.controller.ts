import { Request, Response } from "express";
import {getAuth} from '@clerk/express';
import {
    createUser,
    findUserByClerkId,
    } from "../services/user.service";

    export const syncUser = async (req: Request, res: Response) => {
    try {
        const {userId: clerkUserId} = getAuth(req);

        if (!clerkUserId) {
        return res.status(401).json({
            message: "Unauthorized",
        });
        }

        const { fullName, email, phone } = req.body;

        const existingUser = await findUserByClerkId(clerkUserId);

        if (existingUser) {
        return res.status(200).json({
            message: "User already exists",
            user: existingUser,
        });
        }

        const user = await createUser({
        clerkUserId,
        fullName,
        email,
        phone,
        });

        return res.status(201).json({
        message: "User created successfully",
        user,
        });
    } catch (error) {
        console.error("Sync user error:", error);

        return res.status(500).json({
        message: "Internal server error",
        });
    }
    };

    export const getMe = async (req: Request, res: Response) => {
    try {
        const {userId:clerkUserId} = getAuth(req);

        if (!clerkUserId) {
        return res.status(401).json({
            message: "Unauthorized",
        });
        }

        const user = await findUserByClerkId(clerkUserId);

        if (!user) {
        return res.status(404).json({
            message: "User not found",
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
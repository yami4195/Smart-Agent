import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

export const requireUser = (req: Request, res: Response, next: NextFunction) => {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({
        message: "Unauthorized - User is not authenticated",
        });
    }
    req.clerkUserId = userId;

    next();
};
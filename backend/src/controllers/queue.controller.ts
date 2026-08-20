import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import {
    joinQueueService,
    getActiveTicketService,
    getUserQueueHistoryService,
    cancelTicketService,
    getBranchQueueSummaryService,
} from "../services/queue.service";

/**
 * POST /api/queues/join
 * Body: { branchId: string, serviceId?: string, serviceName?: string }
 */
export const joinQueue = async (req: Request, res: Response) => {
    try {
        const clerkUserId = req.clerkUserId;

        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - User is not authenticated",
            });
        }

        const { branchId, serviceId, serviceName } = req.body;

        if (!branchId) {
        return res.status(400).json({
            success: false,
            message: "Field 'branchId' is required.",
        });
        }

        const ticket = await joinQueueService({
        clerkUserId,
        branchId,
        serviceId,
        serviceName,
    });

    return res.status(201).json({
        success: true,
        message: "Successfully joined the queue",
        ticket,
        });
    } catch (error: any) {
        console.error("Error in joinQueue controller:", error);

        if (error.statusCode === 409) {
        return res.status(409).json({
            success: false,
            message: error.message,
            activeTicketId: error.activeTicketId,
            ticketNumber: error.ticketNumber,
        });
        }

        return res.status(400).json({
        success: false,
        message: error.message || "Failed to join queue",
        });
    }
};

/**
 * GET /api/queues/active
 */
export const getActiveTicket = async (req: Request, res: Response) => {
    try {
        const clerkUserId = req.clerkUserId!;

        const result = await getActiveTicketService(clerkUserId);

        return res.status(200).json({
        success: true,
        ...result,
        });
    } catch (error) {
    console.error("Error in getActiveTicket controller:", error);
    return res.status(500).json({
        success: false,
        message: "Internal server error while fetching active ticket",
        });
    }
};

/**
 * GET /api/queues/history
 */
export const getQueueHistory = async (req: Request, res: Response) => {
    try {
        const clerkUserId = req.clerkUserId!;
        const tickets = await getUserQueueHistoryService(clerkUserId);

        return res.status(200).json({
        success: true,
        count: tickets.length,
        tickets,
        });
    } catch (error) {
        console.error("Error in getQueueHistory controller:", error);
        return res.status(500).json({
        success: false,
        message: "Internal server error while fetching queue history",
        });
    }
};

/**
 * PATCH /api/queues/:id/cancel
 */
export const cancelTicket = async (req: Request, res: Response) => {
    try {
        const clerkUserId = req.clerkUserId!;
        const ticketId = req.params.id as string;

        if (!ticketId) {
        return res.status(400).json({
            success: false,
            message: "Ticket ID is required in URL parameter",
        });
        }

        const cancelled = await cancelTicketService(clerkUserId, ticketId);

        if (!cancelled) {
        return res.status(404).json({
            success: false,
            message: "Ticket not found or you do not have permission to cancel it.",
        });
        }

        return res.status(200).json({
        success: true,
        message: "Ticket cancelled successfully",
        });
    } catch (error: any) {
    console.error("Error in cancelTicket controller:", error);
    return res.status(400).json({
        success: false,
        message: error.message || "Failed to cancel ticket",
        });
    }
};

/**
 * GET /api/queues/branch/:branchId
 */
export const getBranchQueueSummary = async (req: Request, res: Response) => {
    try {
        const branchId = req.params.branchId as string;

        if (!branchId) {
        return res.status(400).json({
            success: false,
            message: "Branch ID is required",
        });
        }

        const summary = await getBranchQueueSummaryService(branchId);

        if (!summary) {
        return res.status(404).json({
            success: false,
            message: "Branch not found",
        });
        }

        return res.status(200).json({
        success: true,
        ...summary,
        });
    } catch (error) {
    console.error("Error in getBranchQueueSummary controller:", error);
    return res.status(500).json({
        success: false,
        message: "Internal server error while fetching branch queue summary",
        });
    }
};

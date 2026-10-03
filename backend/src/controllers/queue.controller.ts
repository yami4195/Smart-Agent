import { Request, Response } from "express";
import {
  joinQueueService,
  getActiveTicketService,
  getUserQueueHistoryService,
  cancelTicketService,
  getBranchQueueSummaryService,
  getBranchTicketsService,
  callNextTicketService,
  updateTicketStatusService,
  createWalkInTicketService,
  getEmployeeStatsService,
  getEmployeeQueueHistoryService,
  archiveEmployeeTicketService,
} from "../services/queue.service";

/**
 * POST /api/queues/join
 */
export const joinQueue = async (req: Request, res: Response) => {
  try {
    const clerkUserId = req.clerkUserId!;

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

    if (error.code === "BRANCH_CLOSED") {
      return res.status(400).json({
        success: false,
        code: "BRANCH_CLOSED",
        isClosed: true,
        message: error.message,
        nextOpenText: error.nextOpenText,
        branchName: error.branchName,
        hours: error.hours,
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
 * GET /api/queues/history (Customer Queue History)
 */
export const getQueueHistory = async (req: Request, res: Response) => {
  try {
    const clerkUserId = req.clerkUserId!;
    const tickets = await getUserQueueHistoryService(clerkUserId);

    return res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error("Error in getQueueHistory controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user queue history",
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

    const result = await cancelTicketService(clerkUserId, ticketId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Active ticket not found or does not belong to you.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Queue ticket cancelled successfully.",
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
    const summary = await getBranchQueueSummaryService(branchId);

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    return res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Error in getBranchQueueSummary controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch branch queue summary",
    });
  }
};

/**
 * GET /api/queues/branch/:branchId/tickets (Employee Live Queue)
 */
export const getBranchTickets = async (req: Request, res: Response) => {
  try {
    const branchId = req.params.branchId as string;
    const { status, serviceId } = req.query;

    const tickets = await getBranchTicketsService(
      branchId,
      status as string | undefined,
      serviceId as string | undefined
    );

    return res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error("Error in getBranchTickets controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch branch tickets",
    });
  }
};

/**
 * POST /api/queues/call-next
 */
export const callNextTicket = async (req: Request, res: Response) => {
  try {
    const { branchId, serviceId, counterNumber } = req.body;
    const employeeClerkUserId = req.clerkUserId;

    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: "Field 'branchId' is required.",
      });
    }

    const ticket = await callNextTicketService(
      branchId,
      serviceId,
      counterNumber,
      employeeClerkUserId
    );

    if (!ticket) {
      return res.status(200).json({
        success: true,
        hasTicket: false,
        ticket: null,
        message: "No waiting customers in the queue.",
      });
    }

    return res.status(200).json({
      success: true,
      hasTicket: true,
      ticket,
      message: `Now serving ticket ${ticket.ticketNumber}`,
    });
  } catch (error: any) {
    console.error("Error in callNextTicket controller:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to call next customer",
    });
  }
};

/**
 * PATCH /api/queues/:id/status
 */
export const updateTicketStatus = async (req: Request, res: Response) => {
  try {
    const ticketId = req.params.id as string;
    const { status } = req.body;
    const employeeClerkUserId = req.clerkUserId;

    if (!status || !["WAITING", "SERVING", "COMPLETED", "CANCELLED", "NO_SHOW"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status ('WAITING', 'SERVING', 'COMPLETED', 'CANCELLED', 'NO_SHOW') is required.",
      });
    }

    const ticket = await updateTicketStatusService(ticketId, status, employeeClerkUserId);

    return res.status(200).json({
      success: true,
      ticket,
      message: `Ticket status updated to ${status}`,
    });
  } catch (error: any) {
    console.error("Error in updateTicketStatus controller:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update ticket status",
    });
  }
};

/**
 * POST /api/queues/walk-in
 */
export const createWalkInTicket = async (req: Request, res: Response) => {
  try {
    const { branchId, serviceId, serviceName, customerName, phone } = req.body;

    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: "Field 'branchId' is required.",
      });
    }

    const ticket = await createWalkInTicketService({
      branchId,
      serviceId,
      serviceName,
      customerName,
      phone,
    });

    return res.status(201).json({
      success: true,
      ticket,
      message: "Walk-in ticket generated successfully.",
    });
  } catch (error: any) {
    console.error("Error in createWalkInTicket controller:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to issue walk-in ticket",
    });
  }
};

/**
 * GET /api/queues/employee/stats/:branchId
 */
export const getEmployeeStats = async (req: Request, res: Response) => {
  try {
    const branchId = req.params.branchId as string;
    const employeeClerkUserId = req.clerkUserId;

    const stats = await getEmployeeStatsService(branchId, employeeClerkUserId);

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error in getEmployeeStats controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employee shift stats",
    });
  }
};

/**
 * GET /api/queues/employee/history
 */
export const getEmployeeQueueHistory = async (req: Request, res: Response) => {
  try {
    const branchId = req.query.branchId as string | undefined;
    const employeeClerkUserId = req.clerkUserId;

    const history = await getEmployeeQueueHistoryService(branchId, employeeClerkUserId);

    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Error in getEmployeeQueueHistory controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employee queue history",
    });
  }
};

/**
 * DELETE /api/queues/employee/history/:id
 * Soft-archives from personal employee history without deleting global record
 */
export const archiveEmployeeTicket = async (req: Request, res: Response) => {
  try {
    const ticketId = req.params.id as string;
    await archiveEmployeeTicketService(ticketId);

    return res.status(200).json({
      success: true,
      message: "Record removed from personal history view.",
    });
  } catch (error) {
    console.error("Error in archiveEmployeeTicket controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove record from history view",
    });
  }
};

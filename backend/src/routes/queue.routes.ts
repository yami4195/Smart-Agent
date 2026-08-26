import { Router } from "express";
import { requireUser } from "../middlewares/auth.middlware";
import {
    joinQueue,
    getActiveTicket,
    getQueueHistory,
    cancelTicket,
    getBranchQueueSummary,
    getBranchTickets,
    callNextTicket,
    updateTicketStatus,
    createWalkInTicket,
    getEmployeeStats,
} from "../controllers/queue.controller";

const router = Router();

// User Queue Actions (Protected)
router.post("/join", requireUser, joinQueue);
router.get("/active", requireUser, getActiveTicket);
router.get("/history", requireUser, getQueueHistory);
router.patch("/:id/cancel", requireUser, cancelTicket);

// Branch Queue Summary (Public / Customer / Employee)
router.get("/branch/:branchId", getBranchQueueSummary);

// Employee / Teller Queue Actions
router.get("/branch/:branchId/tickets", getBranchTickets);
router.post("/call-next", callNextTicket);
router.patch("/:id/status", updateTicketStatus);
router.post("/walk-in", createWalkInTicket);
router.get("/employee/stats/:branchId", getEmployeeStats);

export default router;

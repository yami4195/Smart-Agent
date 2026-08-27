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
  getEmployeeQueueHistory,
  archiveEmployeeTicket,
} from "../controllers/queue.controller";

const router = Router();

// 1. Customer Queue Actions (Protected)
router.post("/join", requireUser, joinQueue);
router.get("/active", requireUser, getActiveTicket);
router.get("/history", requireUser, getQueueHistory);
router.patch("/:id/cancel", requireUser, cancelTicket);

// 2. Branch Queue Summary (Public / Customer / Employee)
router.get("/branch/:branchId", getBranchQueueSummary);

// 3. Employee / Teller Queue Actions
router.get("/branch/:branchId/tickets", getBranchTickets);
router.post("/call-next", callNextTicket);
router.patch("/:id/status", updateTicketStatus);
router.post("/walk-in", createWalkInTicket);
router.get("/employee/stats/:branchId", getEmployeeStats);
router.get("/employee/history", getEmployeeQueueHistory);
router.delete("/employee/history/:id", archiveEmployeeTicket);

export default router;

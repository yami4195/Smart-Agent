import { Router } from "express";
import { requireUser } from "../middlewares/auth.middlware";
import {
    joinQueue,
    getActiveTicket,
    getQueueHistory,
    cancelTicket,
    getBranchQueueSummary,
} from "../controllers/queue.controller";

const router = Router();

// User Queue Actions (Protected)
router.post("/join", requireUser, joinQueue);
router.get("/active", requireUser, getActiveTicket);
router.get("/history", requireUser, getQueueHistory);
router.patch("/:id/cancel", requireUser, cancelTicket);

// Branch Queue Summary
router.get("/branch/:branchId", getBranchQueueSummary);

export default router;

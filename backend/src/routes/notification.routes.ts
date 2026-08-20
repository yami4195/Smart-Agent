import { Router } from "express";
import { requireUser } from "../middlewares/auth.middlware";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notification.controller";

const router = Router();

// User Notifications (Protected)
router.get("/", requireUser, getNotifications);
router.patch("/read-all", requireUser, markAllAsRead);
router.patch("/:id/read", requireUser, markAsRead);
router.delete("/:id", requireUser, deleteNotification);

export default router;

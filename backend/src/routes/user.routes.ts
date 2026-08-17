import { Router } from "express";
import { syncUser, getMe } from "../controllers/user.controller";
import { requireUser } from "../middlewares/auth.middlware";

const router = Router();

router.post("/sync", requireUser, syncUser);
router.get("/me",requireUser, getMe)

export default router;
import { Router } from "express";
import {
    getBranches,
    getNearestBranch,
    getBranchById,
} from "../controllers/branch.controller";
import { requireUser } from "../middlewares/auth.middlware";


const router = Router();

router.get("/",requireUser, getBranches);
router.get("/nearest", getNearestBranch);
router.get("/:id", getBranchById);

export default router;
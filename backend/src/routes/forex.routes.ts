import { Router } from "express";
import { requireUser } from "../middlewares/auth.middlware";
import {
    getRates,
    getRateByCode,
    convertCurrency,
    getAlerts,
    createAlert,
    deleteAlert,
} from "../controllers/forex.controller";

const router = Router();

// Rates Directory & Lookup
router.get("/rates", getRates);
router.get("/rates/convert", convertCurrency);
router.get("/convert", convertCurrency);
router.get("/rates/:code", getRateByCode);

// User Rate Alerts (Protected)
router.get("/alerts", requireUser, getAlerts);
router.post("/alerts", requireUser, createAlert);
router.delete("/alerts/:id", requireUser, deleteAlert);

export default router;

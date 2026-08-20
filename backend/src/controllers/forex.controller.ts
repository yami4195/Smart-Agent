import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import {
    getAllRatesService,
    getRateByCodeService,
    convertCurrencyService,
    createAlertService,
    getUserAlertsService,
    deleteAlertService,
} from "../services/forex.service";

/**
 * GET /api/forex/rates
 * Query params: ?search=&filter=ALL|MAJOR
 */
export const getRates = async (req: Request, res: Response) => {
    try {
        const { search, filter } = req.query;

        const result = await getAllRatesService({
        search: typeof search === "string" ? search : undefined,
        filter: typeof filter === "string" ? filter : undefined,
        });

    return res.status(200).json({
        success: true,
        count: result.count,
        lastUpdated: result.lastUpdated,
        rates: result.rates,
    });
    } catch (error) {
        console.error("Error in getRates controller:", error);
        return res.status(500).json({
        success: false,
        message: "Internal server error while fetching exchange rates",
        });
    }
};

/**
 * GET /api/forex/rates/:code
 * URL param: :code (e.g. USD, EUR)
 */
export const getRateByCode = async (req: Request, res: Response) => {
    try {
        const code = req.params.code as string;

        if (!code) {
        return res.status(400).json({
            success: false,
            message: "Currency code is required",
        });
        }

        const rate = await getRateByCodeService(code);

        if (!rate) {
        return res.status(404).json({
            success: false,
            message: `Currency rate for code '${code}' not found`,
        });
    }

    return res.status(200).json({
        success: true,
        rate,
        });
    } catch (error) {
        console.error("Error in getRateByCode controller:", error);
        return res.status(500).json({
        success: false,
        message: "Internal server error while fetching currency rate",
        });
    }
};

/**
 * GET /api/forex/convert or /api/forex/rates/convert
 * Query params: ?from=USD&to=ETB&amount=100&type=CASH|TT
 */
export const convertCurrency = async (req: Request, res: Response) => {
    try {
        const { from, to, amount, type } = req.query;

        const parsedAmount = amount ? parseFloat(amount as string) : 1;

        if (isNaN(parsedAmount) || parsedAmount < 0) {
        return res.status(400).json({
            success: false,
            message: "Amount must be a positive number",
        });
        }

        const result = await convertCurrencyService({
        from: typeof from === "string" ? from : "USD",
        to: typeof to === "string" ? to : "ETB",
        amount: parsedAmount,
        type: type === "TT" ? "TT" : "CASH",
        });

    return res.status(200).json({
        success: true,
        ...result,
        });
    } catch (error: any) {
        console.error("Error in convertCurrency controller:", error);
        return res.status(400).json({
        success: false,
        message: error.message || "Failed to calculate currency conversion",
        });
    }
};

/**
 * POST /api/forex/alerts
 * Body: { currencyCode: "USD", targetRate: 127.00 }
 */
export const createAlert = async (req: Request, res: Response) => {
  try {
    const clerkUserId = req.clerkUserId!;
    const { currencyCode, targetRate } = req.body;

    if (!currencyCode || !targetRate) {
      return res.status(400).json({
        success: false,
        message: "Both 'currencyCode' and 'targetRate' are required.",
      });
    }

    const parsedRate = parseFloat(targetRate);
    if (isNaN(parsedRate) || parsedRate <= 0) {
      return res.status(400).json({
        success: false,
        message: "'targetRate' must be a positive number.",
      });
    }

    const alert = await createAlertService(
      clerkUserId,
      currencyCode,
      parsedRate
    );

    return res.status(201).json({
      success: true,
      message: "Rate alert created successfully",
      alert,
    });
  } catch (error: any) {
    console.error("Error in createAlert controller:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create rate alert",
    });
  }
};

/**
 * GET /api/forex/alerts
 */
export const getAlerts = async (req: Request, res: Response) => {
  try {
    const clerkUserId = req.clerkUserId!;
    const alerts = await getUserAlertsService(clerkUserId);

    return res.status(200).json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error("Error in getAlerts controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching alerts",
    });
  }
};

/**
 * DELETE /api/forex/alerts/:id
 */
export const deleteAlert = async (req: Request, res: Response) => {
  try {
    const clerkUserId = req.clerkUserId!;
    const alertId = req.params.id as string;

    const deleted = await deleteAlertService(clerkUserId, alertId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Alert not found or does not belong to you",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rate alert deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteAlert controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting rate alert",
    });
  }
};

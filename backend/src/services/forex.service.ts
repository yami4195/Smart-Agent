import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";

export interface GetRatesQuery {
    search?: string;
    filter?: "ALL" | "MAJOR" | string;
}

export interface ConvertCurrencyParams {
    from?: string;
    to?: string;
    amount: number;
    type?: "CASH" | "TT";
}

export interface FormattedRate {
    id: string;
    currencyCode: string;
    currencyName: string;
    flagEmoji: string;
    cashBuy: string;
    cashSell: string;
    ttBuy: string;
    ttSell: string;
    change24h: string;
    isPositive: boolean;
    isMajor: boolean;
    updatedAt: Date;
}

function formatRate(rate: any): FormattedRate {
    return {
        id: rate.id,
        currencyCode: rate.currencyCode,
        currencyName: rate.currencyName,
        flagEmoji: rate.flagEmoji,
        cashBuy: Number(rate.cashBuy).toFixed(2),
        cashSell: Number(rate.cashSell).toFixed(2),
        ttBuy: Number(rate.ttBuy).toFixed(2),
        ttSell: Number(rate.ttSell).toFixed(2),
        change24h: rate.change24h,
        isPositive: rate.isPositive,
        isMajor: rate.isMajor,
        updatedAt: rate.updatedAt,
        };
}

/**
 * Fetch all forex rates with optional search and major filter
 */
export const getAllRatesService = async (query: GetRatesQuery) => {
    const { search, filter } = query;

    const whereClause: Prisma.ForexRateWhereInput = {};

    if (search && search.trim().length > 0) {
        whereClause.OR = [
        { currencyCode: { contains: search.trim(), mode: "insensitive" } },
        { currencyName: { contains: search.trim(), mode: "insensitive" } },
        ];
    }

    if (filter === "MAJOR") {
        whereClause.isMajor = true;
    }

    const rates = await prisma.forexRate.findMany({
        where: whereClause,
        orderBy: [
        { isMajor: "desc" },
        { currencyCode: "asc" },
        ],
    });

    const latest = rates.length > 0
        ? rates.reduce((latest, current) =>
            current.updatedAt > latest ? current.updatedAt : latest,
            rates[0].updatedAt
        )
        : new Date();

    return {
        count: rates.length,
        lastUpdated: latest,
        rates: rates.map(formatRate),
    };
};

/**
 * Fetch a single currency rate by currency code (e.g. "USD")
 */
export const getRateByCodeService = async (code: string) => {
    const rate = await prisma.forexRate.findUnique({
        where: { currencyCode: code.toUpperCase() },
    });

    if (!rate) return null;
    return formatRate(rate);
};

/**
 * Perform currency conversion calculation between two currencies
 */
export const convertCurrencyService = async (params: ConvertCurrencyParams) => {
    const fromCode = (params.from || "USD").toUpperCase();
    const toCode = (params.to || "ETB").toUpperCase();
    const amount = Number(params.amount) || 0;
    const rateType = params.type === "TT" ? "TT" : "CASH";

    if (amount <= 0) {
        return {
        from: fromCode,
        to: toCode,
        amount,
        rateType,
        effectiveRate: 0,
        convertedAmount: 0,
        fee: 0,
        feeText: "Free NBE Promo",
        };
    }

  // Same currency conversion
    if (fromCode === toCode) {
        return {
        from: fromCode,
        to: toCode,
        amount,
        rateType,
        effectiveRate: 1,
        convertedAmount: Number(amount.toFixed(2)),
        fee: 0,
        feeText: "Free NBE Promo",
        };
    }

  // Fetch rates for non-ETB currencies
    let fromRateToEtb = 1;
    let toRateToEtb = 1;

    if (fromCode !== "ETB") {
        const fromForex = await prisma.forexRate.findUnique({
        where: { currencyCode: fromCode },
        });
        if (!fromForex) {
        throw new Error(`Unsupported source currency '${fromCode}'`);
        }
        // Selling foreign currency to bank -> bank buys it
        fromRateToEtb = rateType === "TT" ? Number(fromForex.ttBuy) : Number(fromForex.cashBuy);
    }

    if (toCode !== "ETB") {
        const toForex = await prisma.forexRate.findUnique({
        where: { currencyCode: toCode },
        });
        if (!toForex) {
        throw new Error(`Unsupported target currency '${toCode}'`);
        }
        // Buying foreign currency from bank -> bank sells it
        toRateToEtb = rateType === "TT" ? Number(toForex.ttSell) : Number(toForex.cashSell);
    }

    const effectiveRate = fromRateToEtb / toRateToEtb;
    const convertedAmount = Number((amount * effectiveRate).toFixed(2));

    return {
    from: fromCode,
    to: toCode,
    amount,
    rateType,
    effectiveRate: Number(effectiveRate.toFixed(4)),
    convertedAmount,
    fee: 0,
    feeText: "Free NBE Promo",
    };
};

/**
 * Create a rate alert for an authenticated user
 */
export const createAlertService = async (
    clerkUserId: string,
    currencyCode: string,
    targetRate: number
    ) => {
    const user = await prisma.user.findUnique({
        where: { clerkUserId },
    });

    if (!user) {
        throw new Error("User not found in database. Please sync user first.");
    }

    const alert = await prisma.forexAlert.create({
        data: {
        userId: user.id,
        currencyCode: currencyCode.toUpperCase(),
        targetRate: new Prisma.Decimal(targetRate),
        isActive: true,
        },
    });

    // Dispatch In-App Notification
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: `Rate Alert Set (${currencyCode.toUpperCase()}/ETB) 🔔`,
          message: `You will be notified when ${currencyCode.toUpperCase()} reaches ${Number(targetRate).toFixed(2)} ETB at Wegagen Bank counters.`,
          isRead: false,
        },
      });
    } catch (notifErr) {
      console.warn("Failed to create in-app notification:", notifErr);
    }

    return {
    id: alert.id,
    currencyCode: alert.currencyCode,
    targetRate: Number(alert.targetRate).toFixed(2),
    isActive: alert.isActive,
    createdAt: alert.createdAt,
    };
    };

    /**
     * Fetch all active alerts for an authenticated user
     */
    export const getUserAlertsService = async (clerkUserId: string) => {
    const user = await prisma.user.findUnique({
        where: { clerkUserId },
    });

    if (!user) return [];

    const alerts = await prisma.forexAlert.findMany({
        where: {
        userId: user.id,
        isActive: true,
    },
    orderBy: {
        createdAt: "desc",
        },
    });

    return alerts.map((a) => ({
        id: a.id,
        currencyCode: a.currencyCode,
        targetRate: Number(a.targetRate).toFixed(2),
        isActive: a.isActive,
        createdAt: a.createdAt,
    }));
};

/**
 * Delete a rate alert by ID for an authenticated user
 */
export const deleteAlertService = async (
    clerkUserId: string,
    alertId: string
    ) => {
    const user = await prisma.user.findUnique({
        where: { clerkUserId },
    });

    if (!user) {
        throw new Error("User not found in database.");
    }

    const existingAlert = await prisma.forexAlert.findUnique({
        where: { id: alertId },
    });

    if (!existingAlert || existingAlert.userId !== user.id) {
        return null;
    }

    await prisma.forexAlert.delete({
        where: { id: alertId },
    });

    return true;
};

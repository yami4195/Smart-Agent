import prisma from "../config/prisma";
import { calculateDistanceKm, formatDistance } from "../utils/distance";

export interface GetBranchesQuery {
    search?: string;
    openNow?: boolean;
    forexOnly?: boolean;
    lowQueueOnly?: boolean;
    lat?: number;
    lng?: number;
    page?: number;
    limit?: number;
}

export interface PaginatedBranchesResult {
    branches: FormattedBranch[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
}

export interface FormattedBranch {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    isOpen: boolean;
    hours: string;
    phone?: string | null;
    waitingCount: number;
    estimatedWaitMins: number;
    services: string[];
    distance?: string;
    distanceKm?: number;
}

/**
 * Determines whether the bank is open based on East Africa Time (EAT - UTC+3)
 * Operating Hours:
 * - Mon - Fri: 8:00 AM - 5:00 PM (08:00 - 17:00)
 * - Saturday:  8:00 AM - 12:00 PM (08:00 - 12:00)
 * - Sunday:    Closed
 */
export function isBranchOpenBySchedule(openingHours?: string | null): boolean {
    const now = new Date();
    // Convert to UTC+3 (East Africa Time)
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const eatHours = (utcHours + 3) % 24;
    const eatMinutes = eatHours * 60 + utcMinutes;

    // Calculate day in UTC+3
    let eatDay = now.getUTCDay();
    if (utcHours + 3 >= 24) {
        eatDay = (eatDay + 1) % 7;
    }

    // Sunday (0) is closed
    if (eatDay === 0) {
        return false;
    }

    const OPEN_MINUTES = 8 * 60; // 08:00 AM = 480
    const CLOSE_WEEKDAY_MINUTES = 17 * 60; // 05:00 PM = 1020
    const CLOSE_SATURDAY_MINUTES = 12 * 60; // 12:00 PM = 720

    // Saturday (6)
    if (eatDay === 6) {
        return eatMinutes >= OPEN_MINUTES && eatMinutes < CLOSE_SATURDAY_MINUTES;
    }

    // Weekdays Monday - Friday (1 - 5)
    return eatMinutes >= OPEN_MINUTES && eatMinutes < CLOSE_WEEKDAY_MINUTES;
}

/**
 * Returns a human-friendly string stating when the branch will open next in East Africa Time (EAT - UTC+3).
 */
export function getNextOpeningSchedule(openingHours?: string | null, manualIsOpen: boolean = true): string {
    if (!manualIsOpen) {
        return "This branch has been temporarily closed by administration. Standard operating hours: Mon-Fri 8:00 AM - 5:00 PM, Sat 8:00 AM - 12:00 PM (Closed Sundays).";
    }

    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const eatHours = (utcHours + 3) % 24;
    const eatMinutes = eatHours * 60 + utcMinutes;

    let eatDay = now.getUTCDay();
    if (utcHours + 3 >= 24) {
        eatDay = (eatDay + 1) % 7;
    }

    const OPEN_MINUTES = 8 * 60; // 08:00 AM = 480
    const CLOSE_WEEKDAY_MINUTES = 17 * 60; // 05:00 PM = 1020

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Sunday (0)
    if (eatDay === 0) {
        return "Opens Monday at 8:00 AM";
    }

    // Saturday (6)
    if (eatDay === 6) {
        if (eatMinutes < OPEN_MINUTES) {
            return "Opens today (Saturday) at 8:00 AM";
        }
        return "Opens Monday at 8:00 AM";
    }

    // Friday (5)
    if (eatDay === 5) {
        if (eatMinutes < OPEN_MINUTES) {
            return "Opens today (Friday) at 8:00 AM";
        }
        if (eatMinutes >= CLOSE_WEEKDAY_MINUTES) {
            return "Opens Saturday at 8:00 AM";
        }
        return "Currently Open";
    }

    // Monday - Thursday (1 - 4)
    if (eatMinutes < OPEN_MINUTES) {
        return `Opens today (${dayNames[eatDay]}) at 8:00 AM`;
    }
    if (eatMinutes >= CLOSE_WEEKDAY_MINUTES) {
        return `Opens tomorrow (${dayNames[eatDay + 1]}) at 8:00 AM`;
    }

    return "Currently Open";
}


/**
 * Transforms a Prisma branch record into a standardized mobile-friendly format
 */
function formatBranchRecord(
    branch: any,
    userLat?: number,
    userLng?: number
    ): FormattedBranch {
    const waitingCount = branch._count?.tickets ?? 0;
    // Dynamic calculation: respect manual admin closure if false, otherwise evaluate schedule
    const isBranchOpen = branch.isOpen ? isBranchOpenBySchedule(branch.openingHours) : false;

    // Calculate estimated wait time (e.g. 3 mins per waiting ticket, 0 if closed or empty)
    const estimatedWaitMins = !isBranchOpen
    ? 0
    : waitingCount === 0
    ? 0
    : Math.round(waitingCount * 3);

    let distance: string | undefined;
    let distanceKm: number | undefined;

    if (
        userLat !== undefined &&
        userLng !== undefined &&
        !isNaN(userLat) &&
        !isNaN(userLng)
    ) {
        distanceKm = calculateDistanceKm(
        userLat,
        userLng,
        branch.latitude,
        branch.longitude
        );
        distance = formatDistance(distanceKm);
    }

    return {
    id: branch.id,
    name: branch.name,
    address: branch.address,
    latitude: branch.latitude,
    longitude: branch.longitude,
    isOpen: isBranchOpen,
    hours: branch.openingHours,
    phone: branch.phone,
    waitingCount,
    estimatedWaitMins,
    services: (branch.services || []).map((s: { name: string }) => s.name),
    distance,
    distanceKm,
    };
}

/**
 * Fetch branches with pagination, search, category filtering, and distance calculation
 */
export const getBranchesService = async (
    query: GetBranchesQuery
    ): Promise<PaginatedBranchesResult> => {
    const {
        search,
        openNow,
        forexOnly,
        lowQueueOnly,
        lat,
        lng,
        page = 1,
        limit = 10,
    } = query;

    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(50, limit));
    const skip = (safePage - 1) * safeLimit;

    // Build Prisma where clause
    const whereClause: any = {};

    if (search && search.trim().length > 0) {
        whereClause.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { address: { contains: search.trim(), mode: "insensitive" } },
        ];
    }

    if (openNow) {
        whereClause.isOpen = true;
    }

    if (forexOnly) {
        whereClause.services = {
        some: { name: { contains: "Forex", mode: "insensitive" } },
        };
    }

    const hasGeoSorting = lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng);

    // If distance sorting, lowQueue, or openNow filtering is needed, fetch candidate records to rank and filter accurately
    if (hasGeoSorting || lowQueueOnly || openNow) {
        const branches = await prisma.branch.findMany({
            where: whereClause,
            include: {
                services: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        tickets: {
                            where: {
                                status: "WAITING",
                            },
                        },
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        // Map and calculate distances & schedule open/closed status
        let formatted = branches.map((b) => formatBranchRecord(b, lat, lng));

        // openNow filter: only include branches that are actively open right now
        if (openNow) {
            formatted = formatted.filter((b) => b.isOpen);
        }

        // low-queue needs the computed waitingCount
        if (lowQueueOnly) {
            formatted = formatted.filter((b) => b.waitingCount < 10);
        }

        // If user coordinates provided, sort branches by proximity (closest first)
        if (hasGeoSorting) {
            formatted.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
        }

        const total = formatted.length;
        const totalPages = Math.ceil(total / safeLimit) || 1;
        const paginatedBranches = formatted.slice(skip, skip + safeLimit);

        return {
            branches: paginatedBranches,
            total,
            page: safePage,
            limit: safeLimit,
            totalPages,
            hasMore: safePage < totalPages,
        };
    }

    // Direct database pagination for standard queries
    const [total, branches] = await Promise.all([
        prisma.branch.count({ where: whereClause }),
        prisma.branch.findMany({
            where: whereClause,
            include: {
                services: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        tickets: {
                            where: {
                                status: "WAITING",
                            },
                        },
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
            skip,
            take: safeLimit,
        }),
    ]);

    const formatted = branches.map((b) => formatBranchRecord(b, lat, lng));
    const totalPages = Math.ceil(total / safeLimit) || 1;

    return {
        branches: formatted,
        total,
        page: safePage,
        limit: safeLimit,
        totalPages,
        hasMore: safePage < totalPages,
    };
};

/**
 * Fetch the closest branch to the user's geographic coordinates
 */
export const getNearestBranchService = async (
    lat: number,
    lng: number
): Promise<FormattedBranch | null> => {
    const branches = await prisma.branch.findMany({
        where: {
        isOpen: true, // just Prioritize open branches
        },
        include: {
        services: {
            select: {
            id: true,
            name: true,
            },
        },
        _count: {
            select: {
            tickets: {
                where: {
                status: "WAITING",
                },
            },
            },
        },
        },
    });

    if (branches.length === 0) {
        // Fallback to any branch if no open branches exist
        const anyBranches = await prisma.branch.findMany({
        include: {
            services: { select: { id: true, name: true } },
            _count: { select: { tickets: { where: { status: "WAITING" } } } },
        },
        });
        if (anyBranches.length === 0) return null;
        const formatted = anyBranches.map((b) => formatBranchRecord(b, lat, lng));
        formatted.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
        return formatted[0];
    }

    const formatted = branches.map((b) => formatBranchRecord(b, lat, lng));
    formatted.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

    return formatted[0];
};

/**
 * Fetch a single branch by its unique ID
 */
export const getBranchByIdService = async (
    id: string,
    userLat?: number,
    userLng?: number
    ): Promise<FormattedBranch | null> => {
    const branch = await prisma.branch.findUnique({
        where: { id },
        include: {
        services: {
            select: {
            id: true,
            name: true,
            description: true,
            },
        },
        _count: {
            select: {
            tickets: {
                where: {
                status: "WAITING",
                },
            },
            },
        },
        },
    });

    if (!branch) return null;

    return formatBranchRecord(branch, userLat, userLng);
};

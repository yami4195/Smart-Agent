import prisma from "../config/prisma";
import { calculateDistanceKm, formatDistance } from "../utils/distance";

export interface GetBranchesQuery {
    search?: string;
    filter?: "ALL" | "OPEN" | "FOREX" | "LOW_QUEUE" | string;
    lat?: number;
    lng?: number;
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
 * Transforms a Prisma branch record into a standardized mobile-friendly format
 */
function formatBranchRecord(
    branch: any,
    userLat?: number,
    userLng?: number
    ): FormattedBranch {
    const waitingCount = branch._count?.tickets ?? 0;
    const isBranchOpen = branch.isOpen;

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
    isOpen: branch.isOpen,
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
 * Fetch all branches with search, category filtering, and distance calculation
 */
export const getBranchesService = async (
    query: GetBranchesQuery
    ): Promise<FormattedBranch[]> => {
    const { search, filter, lat, lng } = query;

    // Build Prisma where clause
    const whereClause: any = {};

    if (search && search.trim().length > 0) {
        whereClause.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { address: { contains: search.trim(), mode: "insensitive" } },
        ];
    }

    if (filter === "OPEN") {
        whereClause.isOpen = true;
    } else if (filter === "FOREX") {
        whereClause.services = {
        some: {
            name: { contains: "Forex", mode: "insensitive" },
        },
        };
    }

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

    // Map and calculate distances
    let formatted = branches.map((b) => formatBranchRecord(b, lat, lng));

    // Apply LOW_QUEUE filter in memory based on computed waiting count
    if (filter === "LOW_QUEUE") {
    formatted = formatted.filter((b) => b.waitingCount < 10);
    }

    // If user coordinates provided, sort branches by proximity (closest first)
    if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
        formatted.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }

    return formatted;
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
        isOpen: true, // Prioritize open branches
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

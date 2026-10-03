import { Request, Response } from "express";
import {
    getBranchesService,
    getNearestBranchService,
    getBranchByIdService,
} from "../services/branch.service";
import { parseCoordinates } from "../utils/distance";

// Default coordinates (Addis Ababa central) if client does not provide GPS
const DEFAULT_LAT = parseFloat(process.env.DEFAULT_LATITUDE || "9.0112");
const DEFAULT_LNG = parseFloat(process.env.DEFAULT_LONGITUDE || "38.7467");

/**
 * GET /api/branches
 * Query params: ?search=&filter=&lat=&lng=&page=&limit=
 */
export const getBranches = async (req: Request, res: Response) => {
    try {
    const { search, openNow, forexOnly, lowQueueOnly, lat, lng, page, limit } = req.query;
    const coords = parseCoordinates(lat, lng);
    const parsedPage = page ? parseInt(page as string, 10) : 1;
    const parsedLimit = limit ? parseInt(limit as string, 10) : 10;

    const result = await getBranchesService({
        search: typeof search === "string" ? search : undefined,
        openNow: openNow === "true" || (openNow as unknown) === true,
        forexOnly: forexOnly === "true" || (forexOnly as unknown) === true,
        lowQueueOnly: lowQueueOnly === "true" || (lowQueueOnly as unknown) === true,
        lat: coords?.lat,
        lng: coords?.lng,
        page: !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1,
        limit: !isNaN(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10,
    });

    return res.status(200).json({
        success: true,
        count: result.branches.length,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
        branches: result.branches,
    });
    } catch (error) {
        console.error("Error in getBranches controller:", error);
        return res.status(500).json({
        success: false,
        message: "Internal server error while fetching branches",
        });
    }
};

/**
 * GET /api/branches/nearest
 * Query params: ?lat=&lng=
 */
export const getNearestBranch = async (req: Request, res: Response) => {
    try {
        const { lat, lng } = req.query;
        const coords = parseCoordinates(lat, lng);
        const searchLat = coords?.lat ?? DEFAULT_LAT;
        const searchLng = coords?.lng ?? DEFAULT_LNG;

    const nearestBranch = await getNearestBranchService(searchLat, searchLng);

    if (!nearestBranch) {
        return res.status(404).json({
            success: false,
            message: "No branches found near your location.",
        });
    }

    return res.status(200).json({
        success: true,
        branch: nearestBranch,
    });
    } catch (error) {
        console.error("Error in getNearestBranch controller:", error);
        return res.status(500).json({
        success: false,
        message: "Internal server error while finding nearest branch",
        });
    }
};

/**
 * GET /api/branches/:id
 * URL param: :id
 * Query params: ?lat=&lng=
 */
export const getBranchById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { lat, lng } = req.query;
        const coords = parseCoordinates(lat, lng);

        const branch = await getBranchByIdService(id, coords?.lat, coords?.lng);

        if (!branch) {
        return res.status(404).json({
            success: false,
            message: `Branch with ID '${id}' not found`,
        });
    }

    return res.status(200).json({
        success: true,
        branch,
        });
    } catch (error) {
        console.error("Error in getBranchById controller:", error);
        return res.status(500).json({
        success: false,
        message: "Internal server error while fetching branch details",
        });
    }
};

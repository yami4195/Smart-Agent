import { Request, Response } from "express";
import {
    getBranchesService,
    getNearestBranchService,
    getBranchByIdService,
} from "../services/branch.service";

/**
 * GET /api/branches
 * Query params: ?search=&filter=&lat=&lng=&page=&limit=
 */
export const getBranches = async (req: Request, res: Response) => {
    try {
    const { search, openNow, forexOnly, lowQueueOnly, lat, lng, page, limit } = req.query;
    const parsedLat = lat ? parseFloat(lat as string) : undefined;
    const parsedLng = lng ? parseFloat(lng as string) : undefined;
    const parsedPage = page ? parseInt(page as string, 10) : 1;
    const parsedLimit = limit ? parseInt(limit as string, 10) : 10;

    const result = await getBranchesService({
        search: typeof search === "string" ? search : undefined,
        openNow: openNow === "true",
        forexOnly: forexOnly === "true",
        lowQueueOnly: lowQueueOnly === "true",
        lat: parsedLat && !isNaN(parsedLat) ? parsedLat : undefined,
        lng: parsedLng && !isNaN(parsedLng) ? parsedLng : undefined,
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

        if (!lat || !lng) {
        return res.status(400).json({
            success: false,
            message: "Latitude (lat) and Longitude (lng) are required query parameters.",
        });
    }

    const parsedLat = parseFloat(lat as string);
    const parsedLng = parseFloat(lng as string);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
        return res.status(400).json({
            success: false,
            message: "Latitude and Longitude must be valid numbers.",
        });
    }

    const nearestBranch = await getNearestBranchService(parsedLat, parsedLng);

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

        const parsedLat = lat ? parseFloat(lat as string) : undefined;
        const parsedLng = lng ? parseFloat(lng as string) : undefined;

        const branch = await getBranchByIdService(
        id,
        parsedLat && !isNaN(parsedLat) ? parsedLat : undefined,
        parsedLng && !isNaN(parsedLng) ? parsedLng : undefined
        );

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

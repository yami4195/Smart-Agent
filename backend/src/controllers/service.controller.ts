import { Request, Response } from "express";
import {
  getAllServicesService,
  getServiceByIdService,
} from "../services/service.service";

/**
 * GET /api/services
 * Query params: ?branchId=
 */
export const getServices = async (req: Request, res: Response) => {
  try {
    const branchId = typeof req.query.branchId === "string" ? req.query.branchId : undefined;

    const services = await getAllServicesService(branchId);

    return res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Error in getServices controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching services",
    });
  }
};

/**
 * GET /api/services/:id
 */
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
    }

    const service = await getServiceByIdService(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: `Service with ID '${id}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Error in getServiceById controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching service details",
    });
  }
};

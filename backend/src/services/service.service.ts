import prisma from "../config/prisma";

export interface ServiceListItem {
  id: string;
  name: string;
  description: string | null;
  branchesCount: number;
}

/**
 * Fetch all banking services, optionally filtered by branch
 */
export const getAllServicesService = async (
  branchId?: string
): Promise<ServiceListItem[]> => {
  const whereClause = branchId
    ? {
        branches: {
          some: { id: branchId },
        },
      }
    : {};

  const services = await prisma.service.findMany({
    where: whereClause,
    include: {
      _count: {
        select: { branches: true },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    branchesCount: s._count.branches,
  }));
};

/**
 * Fetch a single banking service by ID with branches offering it
 */
export const getServiceByIdService = async (id: string) => {
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      branches: {
        select: {
          id: true,
          name: true,
          address: true,
          isOpen: true,
          openingHours: true,
          phone: true,
        },
        orderBy: {
          name: "asc",
        },
      },
    },
  });

  if (!service) return null;

  return {
    id: service.id,
    name: service.name,
    description: service.description,
    branchesCount: service.branches.length,
    branches: service.branches,
  };
};

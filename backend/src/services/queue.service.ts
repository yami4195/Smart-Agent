import prisma from "../config/prisma";
import { getServicePrefix, formatTicketNumber } from "../utils/ticketGenerator";

export interface JoinQueueParams {
    clerkUserId: string;
    branchId: string;
    serviceId?: string;
    serviceName?: string;
}

/**
 * Join queue at a branch for a specific banking service
 */
export const joinQueueService = async (params: JoinQueueParams) => {
    const { clerkUserId, branchId, serviceId, serviceName } = params;

    // 1. Verify user exists in database
    const user = await prisma.user.findUnique({
        where: { clerkUserId },
    });
    if (!user) {
        throw new Error("USER_NOT_SYNCED: User not found in database. Please sync user first.");
    }

    // 2. Verify branch exists and is open
    const branch = await prisma.branch.findUnique({
        where: { id: branchId },
        include: { services: true },
    });
    if (!branch) {
        throw new Error("BRANCH_NOT_FOUND: Branch not found.");
    }
    if (!branch.isOpen) {
        throw new Error("BRANCH_CLOSED: This branch is currently closed.");
    }

  // 3. Resolve the requested service
    let targetService = null;
    if (serviceId) {
        targetService = await prisma.service.findUnique({
        where: { id: serviceId },
        });
    } else if (serviceName) {
        targetService = await prisma.service.findFirst({
        where: {
            name: { contains: serviceName.trim(), mode: "insensitive" },
        },
        });
    }

    // Fallback to first available branch service or default Teller Services
    if (!targetService) {
        if (branch.services && branch.services.length > 0) {
        targetService = branch.services[0];
        } else {
        targetService = await prisma.service.findFirst({
            where: { name: { contains: "Teller", mode: "insensitive" } },
        });
        }
    }

    if (!targetService) {
        throw new Error("SERVICE_NOT_FOUND: Could not resolve service for queue ticket.");
    }

    // 4. Prevent duplicate active tickets at this branch
    const existingActive = await prisma.queueTicket.findFirst({
    where: {
        userId: user.id,
        branchId: branch.id,
        status: { in: ["WAITING", "SERVING"] },
        },
    });

    if (existingActive) {
        const error: any = new Error(
        `DUPLICATE_ACTIVE_TICKET: You already have an active ticket (${existingActive.ticketNumber}) at ${branch.name}.`
        );
        error.statusCode = 409;
        error.activeTicketId = existingActive.id;
        error.ticketNumber = existingActive.ticketNumber;
        throw error;
        }

  // 5. Generate daily sequential token number (e.g. A001, F002)
const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const prefix = getServicePrefix(targetService.name);

    const todayCount = await prisma.queueTicket.count({
        where: {
        branchId: branch.id,
        createdAt: { gte: startOfDay },
        ticketNumber: { startsWith: prefix },
        },
    });

    const sequence = todayCount + 1;
    const ticketNumber = formatTicketNumber(prefix, sequence);

    // 6. Calculate people ahead and estimated wait time (~3 mins per person)
    const peopleAhead = await prisma.queueTicket.count({
        where: {
        branchId: branch.id,
        status: "WAITING",
        },
    });

  const estimatedWaitMins = Math.max(peopleAhead * 3, 3);

  // 7. Create ticket in PostgreSQL
    const ticket = await prisma.queueTicket.create({
        data: {
        ticketNumber,
        userId: user.id,
        branchId: branch.id,
        serviceId: targetService.id,
        status: "WAITING",
        estimatedWaitMins,
        },
        include: {
        branch: {
            select: {
            id: true,
            name: true,
            address: true,
            openingHours: true,
            isOpen: true,
            phone: true,
            },
        },
        service: {
        select: {
            id: true,
            name: true,
            description: true,
            },
        },
        },
    });

    // 8. Dispatch In-App Notification
    try {
        await prisma.notification.create({
        data: {
            userId: user.id,
            title: `Queue Ticket Booked (${ticket.ticketNumber}) 🎫`,
            message: `Your ticket ${ticket.ticketNumber} for ${targetService.name} at ${branch.name} is confirmed. Estimated wait: ~${estimatedWaitMins} mins.`,
            isRead: false,
        },
    });
    } catch (notifErr) {
        console.warn("Failed to create in-app notification:", notifErr);
    }

    return {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        peopleAhead,
        estimatedWaitMins,
        branch: {
        id: ticket.branch.id,
        name: ticket.branch.name,
        address: ticket.branch.address,
        hours: ticket.branch.openingHours,
        isOpen: ticket.branch.isOpen,
    },
    service: {
        id: ticket.service.id,
        name: ticket.service.name,
        },
        createdAt: ticket.createdAt,
    };
};

/**
 * Fetch the user's currently active ticket (status WAITING or SERVING)
 */
export const getActiveTicketService = async (clerkUserId: string) => {
    const user = await prisma.user.findUnique({
        where: { clerkUserId },
    });

    if (!user) {
        return { hasActiveTicket: false, ticket: null };
    }

    const activeTicket = await prisma.queueTicket.findFirst({
        where: {
        userId: user.id,
        status: { in: ["WAITING", "SERVING"] },
    },
        include: {
        branch: {
            select: {
            id: true,
            name: true,
            address: true,
            openingHours: true,
            isOpen: true,
            phone: true,
            },
        },
        service: {
            select: {
            id: true,
            name: true,
            description: true,
            },
        },
    },
    orderBy: {
        createdAt: "desc",
        },
    });

    if (!activeTicket) {
        return { hasActiveTicket: false, ticket: null };
    }

    // Calculate live position ahead of this ticket
    let peopleAhead = 0;
    let estimatedWaitMins = 0;

    if (activeTicket.status === "WAITING") {
        peopleAhead = await prisma.queueTicket.count({
        where: {
            branchId: activeTicket.branchId,
        status: "WAITING",
        createdAt: { lt: activeTicket.createdAt },
        },
        });
        estimatedWaitMins = Math.max(peopleAhead * 3, 3);
    }

    return {
        hasActiveTicket: true,
        ticket: {
        id: activeTicket.id,
        ticketNumber: activeTicket.ticketNumber,
        status: activeTicket.status,
        peopleAhead,
        estimatedWaitMins,
        branch: {
            id: activeTicket.branch.id,
            name: activeTicket.branch.name,
            address: activeTicket.branch.address,
            hours: activeTicket.branch.openingHours,
            isOpen: activeTicket.branch.isOpen,
            phone: activeTicket.branch.phone,
        },
        service: {
            id: activeTicket.service.id,
            name: activeTicket.service.name,
        },
        createdAt: activeTicket.createdAt,
        updatedAt: activeTicket.updatedAt,
        },
    };
    };

    /**
     * Fetch past completed or cancelled tickets for the user
     */
    export const getUserQueueHistoryService = async (clerkUserId: string) => {
    const user = await prisma.user.findUnique({
        where: { clerkUserId },
    });

    if (!user) return [];

    const history = await prisma.queueTicket.findMany({
    where: {
        userId: user.id,
        status: { in: ["COMPLETED", "CANCELLED"] },
        },
        include: {
        branch: {
            select: { id: true, name: true, address: true },
        },
        service: {
            select: { id: true, name: true },
        },
        },
        orderBy: {
        createdAt: "desc",
        },
        take: 20,
    });

    return history.map((t) => ({
    id: t.id,
    ticketNumber: t.ticketNumber,
    status: t.status,
    branchName: t.branch.name,
    serviceName: t.service.name,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    }));
};

/**
 * Cancel an active ticket
 */
export const cancelTicketService = async (
    clerkUserId: string,
    ticketId: string
    ) => {
    const user = await prisma.user.findUnique({
        where: { clerkUserId },
    });

    if (!user) {
        throw new Error("User not found.");
    }

    const ticket = await prisma.queueTicket.findUnique({
        where: { id: ticketId },
    });

    if (!ticket || ticket.userId !== user.id) {
        return null;
    }

    if (ticket.status === "COMPLETED") {
        throw new Error("Cannot cancel an already completed ticket.");
    }

    if (ticket.status === "CANCELLED") {
    return true;
    }

    await prisma.queueTicket.update({
        where: { id: ticketId },
        data: { status: "CANCELLED" },
    });

    return true;
};

/**
 * Fetch live queue summary for a branch
 */
export const getBranchQueueSummaryService = async (branchId: string) => {
    const branch = await prisma.branch.findUnique({
        where: { id: branchId },
        include: {
        services: {
            select: { id: true, name: true },
        },
        },
    });

    if (!branch) return null;

    const totalWaiting = await prisma.queueTicket.count({
        where: {
        branchId,
        status: "WAITING",
        },
    });

    // Breakdown per service
    const breakdown = await Promise.all(
        branch.services.map(async (srv) => {
        const waiting = await prisma.queueTicket.count({
            where: {
            branchId,
            serviceId: srv.id,
            status: "WAITING",
        },
        });
        return {
            serviceId: srv.id,
            serviceName: srv.name,
            waiting,
        };
        })
    );

    return {
    branchId: branch.id,
    branchName: branch.name,
    isOpen: branch.isOpen,
    totalWaiting,
    estimatedWaitMins: totalWaiting === 0 ? 0 : Math.round(totalWaiting * 3),
    servicesBreakdown: breakdown,
    };
};

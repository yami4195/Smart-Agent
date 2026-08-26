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

/**
 * Fetch all tickets for a branch with optional filters (for employee view)
 */
export const getBranchTicketsService = async (
    branchId: string,
    status?: string,
    serviceId?: string
) => {
    const whereClause: any = { branchId };

    if (status && status !== "ALL") {
        whereClause.status = status;
    }
    if (serviceId && serviceId !== "ALL") {
        whereClause.serviceId = serviceId;
    }

    const tickets = await prisma.queueTicket.findMany({
        where: whereClause,
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    email: true,
                },
            },
            service: {
                select: {
                    id: true,
                    name: true,
                },
            },
            branch: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 50,
    });

    return tickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        status: t.status,
        estimatedWaitMins: t.estimatedWaitMins,
        customerName: `${t.user?.firstName || ''} ${t.user?.lastName || ''}`.trim() || 'Walk-in Customer',
        customerPhone: t.user?.phone || '—',
        serviceId: t.service.id,
        serviceName: t.service.name,
        branchId: t.branch.id,
        branchName: t.branch.name,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
    }));
};

/**
 * Call the next waiting ticket in line for an employee counter
 */
export const callNextTicketService = async (
    branchId: string,
    serviceId?: string,
    counterNumber?: string
) => {
    const whereClause: any = {
        branchId,
        status: "WAITING",
    };

    if (serviceId && serviceId !== "ALL") {
        whereClause.serviceId = serviceId;
    }

    const nextTicket = await prisma.queueTicket.findFirst({
        where: whereClause,
        orderBy: { createdAt: "asc" },
        include: {
            user: true,
            service: true,
            branch: true,
        },
    });

    if (!nextTicket) {
        return null;
    }

    const updatedTicket = await prisma.queueTicket.update({
        where: { id: nextTicket.id },
        data: { status: "SERVING" },
        include: {
            user: true,
            service: true,
            branch: true,
        },
    });

    try {
        await prisma.notification.create({
            data: {
                userId: updatedTicket.userId,
                title: `Now Serving: Ticket ${updatedTicket.ticketNumber} 🔔`,
                message: `Please proceed to Counter ${counterNumber || '01'} at ${updatedTicket.branch.name} for ${updatedTicket.service.name}.`,
                isRead: false,
            },
        });
    } catch (notifErr) {
        console.warn("Could not dispatch push notification:", notifErr);
    }

    return {
        id: updatedTicket.id,
        ticketNumber: updatedTicket.ticketNumber,
        status: updatedTicket.status,
        customerName: `${updatedTicket.user?.firstName || ''} ${updatedTicket.user?.lastName || ''}`.trim() || 'Walk-in Customer',
        customerPhone: updatedTicket.user?.phone || '—',
        serviceId: updatedTicket.service.id,
        serviceName: updatedTicket.service.name,
        branchId: updatedTicket.branch.id,
        branchName: updatedTicket.branch.name,
        counterNumber: counterNumber || '01',
        createdAt: updatedTicket.createdAt,
        updatedAt: updatedTicket.updatedAt,
    };
};

/**
 * Update a ticket's status (SERVING, COMPLETED, CANCELLED)
 */
export const updateTicketStatusService = async (
    ticketId: string,
    status: "WAITING" | "SERVING" | "COMPLETED" | "CANCELLED"
) => {
    const updated = await prisma.queueTicket.update({
        where: { id: ticketId },
        data: { status },
        include: {
            user: true,
            service: true,
            branch: true,
        },
    });

    return {
        id: updated.id,
        ticketNumber: updated.ticketNumber,
        status: updated.status,
        customerName: `${updated.user?.firstName || ''} ${updated.user?.lastName || ''}`.trim() || 'Walk-in Customer',
        customerPhone: updated.user?.phone || '—',
        serviceId: updated.service.id,
        serviceName: updated.service.name,
        branchId: updated.branch.id,
        branchName: updated.branch.name,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
    };
};

/**
 * Create a walk-in queue ticket on behalf of an in-person customer
 */
export const createWalkInTicketService = async (params: {
    branchId: string;
    serviceId?: string;
    customerName?: string;
    phone?: string;
}) => {
    const { branchId, serviceId, customerName, phone } = params;

    let user = null;
    if (phone && phone.trim()) {
        user = await prisma.user.findFirst({
            where: { phone: phone.trim() },
        });
    }

    if (!user) {
        const parts = (customerName || 'Walk-in Customer').trim().split(' ');
        const firstName = parts[0] || 'Walk-in';
        const lastName = parts.slice(1).join(' ') || 'Customer';

        user = await prisma.user.create({
            data: {
                clerkUserId: `walkin-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                firstName,
                lastName,
                phone: phone?.trim() || '',
                email: '',
                role: 'customer',
            },
        });
    }

    return joinQueueService({
        clerkUserId: user.clerkUserId,
        branchId,
        serviceId,
    });
};

/**
 * Get daily performance statistics for branch / employee
 */
export const getEmployeeStatsService = async (branchId: string) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalWaiting, totalServing, totalCompleted, totalCancelled] = await Promise.all([
        prisma.queueTicket.count({
            where: { branchId, status: "WAITING", createdAt: { gte: startOfDay } },
        }),
        prisma.queueTicket.count({
            where: { branchId, status: "SERVING", createdAt: { gte: startOfDay } },
        }),
        prisma.queueTicket.count({
            where: { branchId, status: "COMPLETED", createdAt: { gte: startOfDay } },
        }),
        prisma.queueTicket.count({
            where: { branchId, status: "CANCELLED", createdAt: { gte: startOfDay } },
        }),
    ]);

    return {
        totalWaiting,
        totalServing,
        totalCompleted,
        totalCancelled,
        totalServedToday: totalCompleted,
        avgWaitMins: totalWaiting > 0 ? totalWaiting * 3 : 4,
        avgServiceMins: 3.5,
    };
};

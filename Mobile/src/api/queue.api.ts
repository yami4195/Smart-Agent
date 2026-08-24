import api from './axiosInstance';

export interface QueueTicketData {
  id: string;
  ticketNumber: string;
  status: 'WAITING' | 'SERVING' | 'COMPLETED' | 'CANCELLED';
  peopleAhead: number;
  estimatedWaitTime: string;
  nowServingTicket: string;
  counterNumber: string;
  branch: {
    id: string;
    name: string;
    address?: string;
    hours?: string;
    isOpen?: boolean;
    phone?: string;
  };
  service: {
    id: string;
    name: string;
    description?: string;
  };
  createdAt: string;
}

export interface JoinQueuePayload {
  branchId: string;
  branchName?: string;
  serviceId?: string;
  serviceName?: string;
  estimatedWaitMins?: number;
}

export interface GetActiveTicketResponse {
  success: boolean;
  hasActiveTicket: boolean;
  ticket: QueueTicketData | null;
}

// In-memory cache for active ticket in current session (starts as NULL - no demo queue)
let localActiveTicket: QueueTicketData | null = null;

export const formatEstimatedWait = (mins?: number): string => {
  if (!mins || mins <= 0) return '03:28';
  const m = Math.floor(mins);
  const paddedM = m < 10 ? `0${m}` : `${m}`;
  return `${paddedM}:28`;
};

export const queueApi = {
  /**
   * Fetch active ticket. Returns null if user has not joined any queue.
   */
  getActiveTicket: async (): Promise<QueueTicketData | null> => {
    try {
      const response = await api.get<GetActiveTicketResponse>('/queues/active');
      if (response.data?.success && response.data?.hasActiveTicket && response.data?.ticket) {
        const t = response.data.ticket;
        localActiveTicket = {
          id: t.id,
          ticketNumber: t.ticketNumber,
          status: t.status,
          peopleAhead: t.peopleAhead ?? 2,
          estimatedWaitTime:
            t.estimatedWaitTime ||
            formatEstimatedWait((t as any).estimatedWaitMins),
          nowServingTicket: t.nowServingTicket || 'T-101',
          counterNumber: t.counterNumber || '02',
          branch: t.branch,
          service: t.service,
          createdAt: t.createdAt,
        };
        return localActiveTicket;
      }

      if (response.data?.hasActiveTicket === false) {
        localActiveTicket = null;
        return null;
      }

      return localActiveTicket;
    } catch {
      // If offline / unauthorized / server unreachable, return current localActiveTicket (which is null unless explicitly joined)
      return localActiveTicket;
    }
  },

  /**
   * Explicitly joins queue when user taps "Join Queue" on the branch details page
   */
  joinQueue: async (payload: JoinQueuePayload): Promise<QueueTicketData> => {
    try {
      const response = await api.post<{ success: boolean; ticket: any }>(
        '/queues/join',
        payload
      );
      if (response.data?.success && response.data?.ticket) {
        const t = response.data.ticket;
        localActiveTicket = {
          id: t.id,
          ticketNumber: t.ticketNumber || 'T-104',
          status: t.status || 'WAITING',
          peopleAhead: t.peopleAhead ?? 2,
          estimatedWaitTime: formatEstimatedWait(t.estimatedWaitMins || payload.estimatedWaitMins || 4),
          nowServingTicket: t.nowServingTicket || 'T-101',
          counterNumber: t.counterNumber || '02',
          branch: {
            id: t.branch?.id || payload.branchId,
            name: t.branch?.name || payload.branchName || 'Bole Branch',
          },
          service: {
            id: t.service?.id || payload.serviceId || 'srv-selected',
            name: t.service?.name || payload.serviceName || 'Cash Services',
          },
          createdAt: t.createdAt || new Date().toISOString(),
        };
        return localActiveTicket;
      }
    } catch {
      // Local fallback creation when offline/server down
    }

    const branchName = payload.branchName || 'Bole Branch';
    const serviceName = payload.serviceName || 'Cash Services';

    localActiveTicket = {
      id: `ticket-${Date.now()}`,
      ticketNumber: 'T-104',
      status: 'WAITING',
      peopleAhead: 2,
      estimatedWaitTime: formatEstimatedWait(payload.estimatedWaitMins || 4),
      nowServingTicket: 'T-101',
      counterNumber: '02',
      branch: {
        id: payload.branchId || 'branch-selected',
        name: branchName,
      },
      service: {
        id: payload.serviceId || 'srv-selected',
        name: serviceName,
      },
      createdAt: new Date().toISOString(),
    };

    return localActiveTicket;
  },

  /**
   * Cancel an active ticket and reset to null
   */
  cancelTicket: async (ticketId: string): Promise<boolean> => {
    try {
      await api.patch(`/queues/${ticketId}/cancel`);
    } catch {
      // ignore
    }
    localActiveTicket = null;
    return true;
  },

  /**
   * Clear active ticket
   */
  clearTicket: () => {
    localActiveTicket = null;
  },
};

export default queueApi;

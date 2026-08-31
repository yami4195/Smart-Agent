import api from './axiosInstance';

export type TicketStatusType = 'WAITING' | 'SERVING' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface QueueTicketData {
  id: string;
  ticketNumber: string;
  status: TicketStatusType;
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
  updatedAt?: string;
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

export interface QueueHistoryItem {
  id: string;
  ticketNumber: string;
  status: TicketStatusType;
  branchName: string;
  serviceName: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory cache for active ticket in current session
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
      const response = await api.get<GetActiveTicketResponse>('/queues/active', {
        timeout: 4000,
      });
      if (response.data?.success && response.data?.hasActiveTicket && response.data?.ticket) {
        const t = response.data.ticket;
        localActiveTicket = {
          id: t.id,
          ticketNumber: t.ticketNumber,
          status: t.status,
          peopleAhead: t.peopleAhead ?? 0,
          estimatedWaitTime:
            t.estimatedWaitTime ||
            formatEstimatedWait((t as any).estimatedWaitMins),
          nowServingTicket: t.nowServingTicket || 'T-101',
          counterNumber: t.counterNumber || '01',
          branch: t.branch,
          service: t.service,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        };
        return localActiveTicket;
      }

      if (response.data?.hasActiveTicket === false || !response.data?.ticket) {
        localActiveTicket = null;
        return null;
      }

      return localActiveTicket;
    } catch {
      return localActiveTicket;
    }
  },

  /**
   * Explicitly joins queue with exact service name
   */
  joinQueue: async (payload: JoinQueuePayload): Promise<QueueTicketData> => {
    const serviceName = payload.serviceName || 'Account Opening';
    const branchName = payload.branchName || 'Bole Branch';

    const response = await api.post<{ success: boolean; ticket: any }>(
      '/queues/join',
      {
        branchId: payload.branchId,
        serviceId: payload.serviceId,
        serviceName: serviceName,
      }
    );

    if (response.data?.success && response.data?.ticket) {
      const t = response.data.ticket;
      localActiveTicket = {
        id: t.id,
        ticketNumber: t.ticketNumber || 'A-101',
        status: t.status || 'WAITING',
        peopleAhead: t.peopleAhead ?? 0,
        estimatedWaitTime: formatEstimatedWait(t.estimatedWaitMins || payload.estimatedWaitMins || 4),
        nowServingTicket: t.nowServingTicket || '—',
        counterNumber: t.counterNumber || '01',
        branch: {
          id: t.branch?.id || payload.branchId,
          name: t.branch?.name || branchName,
        },
        service: {
          id: t.service?.id || payload.serviceId || 'srv-selected',
          name: t.service?.name || serviceName,
        },
        createdAt: t.createdAt || new Date().toISOString(),
        updatedAt: t.updatedAt,
      };
      return localActiveTicket;
    }

    throw new Error('Failed to join queue on server.');
  },

  /**
   * Fetch customer past queue history (COMPLETED, CANCELLED, NO_SHOW)
   */
  getHistory: async (): Promise<QueueHistoryItem[]> => {
    try {
      const response = await api.get<{ success: boolean; tickets: QueueHistoryItem[] }>(
        '/queues/history'
      );
      return response.data?.tickets || [];
    } catch {
      return [];
    }
  },

  /**
   * Cancel an active ticket
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
   * Clear active ticket from local cache
   */
  clearTicket: () => {
    localActiveTicket = null;
  },
};

export default queueApi;

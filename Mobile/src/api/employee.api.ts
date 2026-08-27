import api from './axiosInstance';

export type EmployeeTicketStatus = 'WAITING' | 'SERVING' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface EmployeeTicket {
  id: string;
  ticketNumber: string;
  status: EmployeeTicketStatus;
  estimatedWaitMins: number;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  branchId: string;
  branchName: string;
  counterNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeStats {
  totalWaiting: number;
  totalServing: number;
  totalCompleted: number;
  totalCancelled: number;
  totalNoShow?: number;
  totalServedToday: number;
  avgWaitMins: number;
  avgServiceMins: number;
}

export interface EmployeeHistoryItem {
  id: string;
  ticketNumber: string;
  status: EmployeeTicketStatus;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  branchName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWalkInPayload {
  branchId: string;
  serviceId?: string;
  serviceName?: string;
  customerName?: string;
  phone?: string;
}

export const employeeApi = {
  /**
   * Fetch all tickets for a branch with optional status/service filters
   */
  getBranchTickets: async (
    branchId: string,
    status?: string,
    serviceId?: string
  ): Promise<EmployeeTicket[]> => {
    try {
      const response = await api.get<{ success: boolean; tickets: EmployeeTicket[] }>(
        `/queues/branch/${branchId}/tickets`,
        {
          params: { status, serviceId },
        }
      );
      return response.data?.tickets || [];
    } catch {
      return [];
    }
  },

  /**
   * Call the next waiting ticket in line for the assigned counter
   */
  callNextTicket: async (
    branchId: string,
    serviceId?: string,
    counterNumber?: string
  ): Promise<{ hasTicket: boolean; ticket: EmployeeTicket | null; message: string }> => {
    try {
      const response = await api.post<{
        success: boolean;
        hasTicket: boolean;
        ticket: EmployeeTicket | null;
        message: string;
      }>('/queues/call-next', {
        branchId,
        serviceId,
        counterNumber,
      });
      return {
        hasTicket: response.data?.hasTicket ?? false,
        ticket: response.data?.ticket || null,
        message: response.data?.message || 'No ticket called',
      };
    } catch (err: any) {
      return {
        hasTicket: false,
        ticket: null,
        message: err?.response?.data?.message || 'Failed to call next ticket',
      };
    }
  },

  /**
   * Update ticket status (SERVING, COMPLETED, CANCELLED, NO_SHOW)
   */
  updateTicketStatus: async (
    ticketId: string,
    status: EmployeeTicketStatus
  ): Promise<EmployeeTicket | null> => {
    try {
      const response = await api.patch<{ success: boolean; ticket: EmployeeTicket }>(
        `/queues/${ticketId}/status`,
        { status }
      );
      return response.data?.ticket || null;
    } catch {
      return null;
    }
  },

  /**
   * Create an in-person walk-in ticket
   */
  createWalkInTicket: async (payload: CreateWalkInPayload): Promise<any> => {
    const response = await api.post<{ success: boolean; ticket: any }>(
      '/queues/walk-in',
      payload
    );
    return response.data?.ticket;
  },

  /**
   * Fetch daily shift / teller statistics
   */
  getEmployeeStats: async (branchId: string): Promise<EmployeeStats> => {
    try {
      const response = await api.get<{ success: boolean; stats: EmployeeStats }>(
        `/queues/employee/stats/${branchId}`
      );
      return (
        response.data?.stats || {
          totalWaiting: 0,
          totalServing: 0,
          totalCompleted: 0,
          totalCancelled: 0,
          totalNoShow: 0,
          totalServedToday: 0,
          avgWaitMins: 0,
          avgServiceMins: 3.5,
        }
      );
    } catch {
      return {
        totalWaiting: 0,
        totalServing: 0,
        totalCompleted: 0,
        totalCancelled: 0,
        totalNoShow: 0,
        totalServedToday: 0,
        avgWaitMins: 0,
        avgServiceMins: 3.5,
      };
    }
  },

  /**
   * Fetch employee handled queue history
   */
  getEmployeeHistory: async (branchId?: string): Promise<EmployeeHistoryItem[]> => {
    try {
      const response = await api.get<{ success: boolean; history: EmployeeHistoryItem[] }>(
        '/queues/employee/history',
        { params: { branchId } }
      );
      return response.data?.history || [];
    } catch {
      return [];
    }
  },

  /**
   * Delete / archive a completed or cancelled ticket from personal employee history view
   */
  archiveHistoryTicket: async (ticketId: string): Promise<boolean> => {
    try {
      const response = await api.delete<{ success: boolean }>(
        `/queues/employee/history/${ticketId}`
      );
      return response.data?.success ?? true;
    } catch {
      return false;
    }
  },

  /**
   * Update user role (e.g. switch between customer and employee)
   */
  updateUserRole: async (role: 'customer' | 'employee' | 'admin') => {
    const response = await api.patch('/users/role', { role });
    return response.data;
  },
};

export default employeeApi;

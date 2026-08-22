import api from './axiosInstance';
import { BranchData } from '../components/branch/BranchCard';

export interface BranchQueryParams {
  search?: string;
  openNow?: boolean;
  forexOnly?: boolean;
  lowQueueOnly?: boolean;
  lat?: number;
  lng?: number;
  page?: number;
  limit?: number;
}

export interface GetBranchesResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  branches: BranchData[];
}

export interface GetBranchResponse {
  success: boolean;
  branch: BranchData;
}

export const branchApi = {
  /**
   * Fetch branches with pagination, optional search, filter, and geo parameters
   */
  getBranches: async (params?: BranchQueryParams): Promise<GetBranchesResponse> => {
    const response = await api.get<GetBranchesResponse>('/branches', { params });
    return response.data;
  },

  /**
   * Fetch the nearest branch to the specified coordinates
   */
  getNearestBranch: async (lat: number, lng: number): Promise<BranchData> => {
    const response = await api.get<GetBranchResponse>('/branches/nearest', {
      params: { lat, lng },
    });
    return response.data.branch;
  },

  /**
   * Fetch branch details by ID
   */
  getBranchById: async (id: string, lat?: number, lng?: number): Promise<BranchData> => {
    const response = await api.get<GetBranchResponse>(`/branches/${id}`, {
      params: { lat, lng },
    });
    return response.data.branch;
  },
};

export default branchApi;

import api from "./axiosInstance";

// 1. Define TypeScript interfaces matching backend response
export interface Branch {
id: string;
name: string;
address: string;
latitude: number;
longitude: number;
isOpen: boolean;
waitingCount: number;
estimatedWaitMinutes: number;
services: string[];
}

export interface BranchQueryParams {
search?: string;
openNow?: boolean;
forexOnly?: boolean;
lowQueueOnly?: boolean;
lat?: number;
lng?: number;
}

interface BranchResponse {
success: boolean;
count: number;
branches: Branch[];
}

// 2. Export API call functions
export const branchApi = {
    // GET: Fetch list of branches with optional query params
    getBranches: async (params?: BranchQueryParams): Promise<Branch[]> => {
        const response = await api.get<BranchResponse>('/branches', { params });
        return response.data.branches;
    },
    // GET: Fetch nearest branch
    getNearestBranch: async (lat: number, lng: number): Promise<Branch> => {
        const response = await api.get<{ success: boolean; branch: Branch }>('/branches/nearest', {
        params: { lat, lng },
        });
        return response.data.branch;
    },
    // GET: Fetch branch by ID
    getBranchById: async (id: string): Promise<Branch> => {
        const response = await api.get<{ success: boolean; branch: Branch }>(`/branches/${id}`);
        return response.data.branch;
    },
};
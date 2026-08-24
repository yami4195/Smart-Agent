import api from './axiosInstance';

export interface UserData {
  id: string;
  clerkUserId: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  role: 'customer' | 'employee' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetMeResponse {
  user: UserData;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: UserData;
}

export interface SyncUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export const userApi = {
  /**
   * Fetch current user profile directly from PostgreSQL DB.
   * Returns null if user row does not exist yet (404).
   */
  getMe: async (): Promise<UserData | null> => {
    try {
      const response = await api.get<GetMeResponse>('/users/me');
      return response.data.user;
    } catch (err: any) {
      // 404 = user row not yet in DB (needs sync), return null so caller can sync
      if (err?.response?.status === 404) return null;
      throw err;
    }
  },

  /**
   * Sync/upsert user into DB (idempotent — safe to call any time).
   * Used both on login and as a fallback when getMe returns null.
   */
  syncUser: async (payload: SyncUserPayload): Promise<UserData> => {
    const response = await api.post<{ message: string; user: UserData }>(
      '/users/sync',
      payload
    );
    return response.data.user;
  },

  /**
   * Update current user profile in PostgreSQL DB
   */
  updateMe: async (data: UpdateProfilePayload): Promise<UserData> => {
    const response = await api.patch<UpdateProfileResponse>('/users/me', data);
    return response.data.user;
  },
};

export default userApi;

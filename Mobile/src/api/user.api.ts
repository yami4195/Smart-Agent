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

export const userApi = {
  /**
   * Fetch current user profile directly from PostgreSQL DB
   */
  getMe: async (): Promise<UserData> => {
    const response = await api.get<GetMeResponse>('/users/me');
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

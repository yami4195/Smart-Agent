import axios from 'axios';
import { Platform } from 'react-native';

const DEFAULT_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
  },
});

let getTokenFn: (() => Promise<string | null>) | null = null;

export function registerTokenGetter(fn: () => Promise<string | null>) {
  getTokenFn = fn;
}

api.interceptors.request.use(async (config) => {
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL || ''}${config.url || ''}`);
  if (getTokenFn) {
    try {
      const token = await getTokenFn();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore token getter failure
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      console.log(`[API Auth] 401 Unauthorized for ${error?.config?.url} (user signed out or session expired)`);
    } else {
      console.error(
        `[API Error] ${error?.config?.method?.toUpperCase()} ${error?.config?.url} -> Status ${error?.response?.status}:`,
        error?.response?.data || error.message
      );
    }
    return Promise.reject(error);
  }
);

export default api;
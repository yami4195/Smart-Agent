import api from './axiosInstance';

export interface ForexRate {
  id: string;
  currencyCode: string;
  currencyName: string;
  flagEmoji: string;
  cashBuy: string;
  cashSell: string;
  ttBuy: string;
  ttSell: string;
  change24h: string;
  isPositive: boolean;
  isMajor: boolean;
  updatedAt: string;
}

export interface ForexRatesResponse {
  success: boolean;
  count: number;
  lastUpdated: string;
  rates: ForexRate[];
}

export interface SingleRateResponse {
  success: boolean;
  rate: ForexRate;
}

export interface ConvertParams {
  from?: string;
  to?: string;
  amount: number;
  type?: 'CASH' | 'TT';
}

export interface ConvertResponse {
  success: boolean;
  from: string;
  to: string;
  amount: number;
  rateType: 'CASH' | 'TT';
  effectiveRate: number;
  convertedAmount: number;
  fee: number;
  feeText: string;
}

export interface ForexAlert {
  id: string;
  currencyCode: string;
  targetRate: string;
  isActive: boolean;
  createdAt: string;
}

export interface AlertsResponse {
  success: boolean;
  count: number;
  alerts: ForexAlert[];
}

export interface CreateAlertResponse {
  success: boolean;
  message: string;
  alert: ForexAlert;
}

export interface ForexQueryParams {
  search?: string;
  filter?: 'ALL' | 'MAJOR' | string;
}

export const forexApi = {
  /**
   * Fetch all exchange rates with optional search and major filter
   */
  getRates: async (params?: ForexQueryParams): Promise<ForexRatesResponse> => {
    const response = await api.get<ForexRatesResponse>('/forex/rates', { params });
    return response.data;
  },

  /**
   * Fetch a single currency rate by currency code (e.g. "USD")
   */
  getRateByCode: async (code: string): Promise<ForexRate> => {
    const response = await api.get<SingleRateResponse>(`/forex/rates/${code}`);
    return response.data.rate;
  },

  /**
   * Perform currency conversion calculation via backend service
   */
  convertCurrency: async (params: ConvertParams): Promise<ConvertResponse> => {
    const response = await api.get<ConvertResponse>('/forex/convert', { params });
    return response.data;
  },

  /**
   * Fetch all active rate alerts for authenticated user
   */
  getAlerts: async (): Promise<ForexAlert[]> => {
    const response = await api.get<AlertsResponse>('/forex/alerts');
    return response.data.alerts || [];
  },

  /**
   * Create a new rate alert
   */
  createAlert: async (currencyCode: string, targetRate: number): Promise<ForexAlert> => {
    const response = await api.post<CreateAlertResponse>('/forex/alerts', {
      currencyCode,
      targetRate,
    });
    return response.data.alert;
  },

  /**
   * Delete an existing rate alert
   */
  deleteAlert: async (id: string): Promise<boolean> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/forex/alerts/${id}`);
    return response.data.success;
  },
};

export default forexApi;

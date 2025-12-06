import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data.tokens;
          localStorage.setItem('access_token', access);

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: {
    email: string;
    username: string;
    password: string;
    password_confirm: string;
  }) => api.post('/auth/register/', data),

  login: (data: {
    email: string;
    password: string;
    otp_code?: string;
    device_name?: string;
    device_type?: string;
  }) => api.post('/auth/login/', data),

  logout: (refreshToken: string) => api.post('/auth/logout/', { refresh: refreshToken }),

  refresh: (refreshToken: string) => api.post('/auth/refresh/', { refresh: refreshToken }),

  getProfile: () => api.get('/auth/profile/'),

  updateProfile: (data: any) => api.patch('/auth/profile/', data),

  changePassword: (data: { old_password: string; new_password: string }) =>
    api.post('/auth/change-password/', data),

  mfaSetup: () => api.get('/auth/mfa/setup/'),

  mfaEnable: (otpCode: string) => api.post('/auth/mfa/setup/', { otp_code: otpCode }),

  mfaDisable: (otpCode: string) => api.post('/auth/mfa/disable/', { otp_code: otpCode }),
};

// Transactions API
export const transactionsAPI = {
  list: (params?: {
    start_date?: string;
    end_date?: string;
    category?: string;
    transaction_type?: 'debit' | 'credit';
    is_recurring?: boolean;
    min_amount?: number;
    max_amount?: number;
    search?: string;
    page?: number;
  }) => api.get('/transactions/', { params }),

  get: (id: string) => api.get(`/transactions/${id}/`),

  create: (data: {
    date: string;
    description: string;
    amount: string;
    transaction_type: 'debit' | 'credit';
    category?: string;
    notes?: string;
  }) => api.post('/transactions/', data),

  update: (id: string, data: any) => api.patch(`/transactions/${id}/`, data),

  delete: (id: string) => api.delete(`/transactions/${id}/`),

  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/transactions/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  summary: (params?: { start_date?: string; end_date?: string }) =>
    api.get('/transactions/summary/', { params }),
};

// Budgets API
export const budgetsAPI = {
  list: () => api.get('/budgets/'),

  get: (id: string) => api.get(`/budgets/${id}/`),

  create: (data: {
    name: string;
    category?: string;
    amount: string;
    period: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
    start_date: string;
    end_date: string;
    notes?: string;
  }) => api.post('/budgets/', data),

  update: (id: string, data: any) => api.patch(`/budgets/${id}/`, data),

  delete: (id: string) => api.delete(`/budgets/${id}/`),
};

// Categories API
export const categoriesAPI = {
  list: () => api.get('/transactions/categories/'),

  create: (data: { name: string; icon?: string; color?: string }) =>
    api.post('/transactions/categories/', data),

  update: (id: string, data: any) => api.patch(`/transactions/categories/${id}/`, data),

  delete: (id: string) => api.delete(`/transactions/categories/${id}/`),
};

// Recurring Patterns API
export const recurringAPI = {
  list: () => api.get('/transactions/recurring/'),

  get: (id: string) => api.get(`/transactions/recurring/${id}/`),

  update: (id: string, data: any) => api.patch(`/transactions/recurring/${id}/`, data),

  delete: (id: string) => api.delete(`/transactions/recurring/${id}/`),
};

// Notifications API
export const notificationsAPI = {
  list: (params?: { is_read?: boolean; type?: string }) =>
    api.get('/notifications/', { params }),

  get: (id: string) => api.get(`/notifications/${id}/`),

  markRead: (id: string) => api.patch(`/notifications/${id}/`, { is_read: true }),

  markAllRead: () => api.post('/notifications/mark-all-read/'),

  unreadCount: () => api.get('/notifications/unread-count/'),

  preferences: () => api.get('/notifications/preferences/'),

  updatePreferences: (data: any) => api.patch('/notifications/preferences/', data),
};

// Bill Splitting API (if enabled)
export const billsplitAPI = {
  groups: {
    list: () => api.get('/billsplit/groups/'),
    get: (id: string) => api.get(`/billsplit/groups/${id}/`),
    create: (data: { name: string; description?: string; member_emails?: string[] }) =>
      api.post('/billsplit/groups/', data),
    update: (id: string, data: any) => api.patch(`/billsplit/groups/${id}/`, data),
    delete: (id: string) => api.delete(`/billsplit/groups/${id}/`),
    addMember: (groupId: string, email: string) =>
      api.post(`/billsplit/groups/${groupId}/members/`, { email }),
    balance: (groupId: string) => api.get(`/billsplit/groups/${groupId}/balance/`),
  },
  expenses: {
    list: (groupId?: string) => api.get('/billsplit/expenses/', { params: { group: groupId } }),
    get: (id: string) => api.get(`/billsplit/expenses/${id}/`),
    create: (data: {
      group: string;
      description: string;
      amount: string;
      split_method: 'equal' | 'percentage' | 'amount';
      date: string;
      shares?: any[];
    }) => api.post('/billsplit/expenses/', data),
    update: (id: string, data: any) => api.patch(`/billsplit/expenses/${id}/`, data),
    delete: (id: string) => api.delete(`/billsplit/expenses/${id}/`),
  },
  shares: {
    update: (shareId: string, isPaid: boolean) =>
      api.patch(`/billsplit/shares/${shareId}/`, { is_paid: isPaid }),
  },
  settlements: {
    list: (groupId?: string) =>
      api.get('/billsplit/settlements/', { params: { group: groupId } }),
    create: (data: {
      group: string;
      to_user: string;
      amount: string;
      notes?: string;
    }) => api.post('/billsplit/settlements/', data),
    update: (id: string, isPaid: boolean) =>
      api.patch(`/billsplit/settlements/${id}/`, { is_paid: isPaid }),
  },
};

// Exports API
export const exportsAPI = {
  transactions: (params: {
    format: 'csv' | 'excel';
    start_date?: string;
    end_date?: string;
    category?: string;
  }) => api.get('/exports/transactions/', { params, responseType: 'blob' }),

  report: (params: {
    format: 'csv' | 'excel';
    month?: string;
    year?: string;
  }) => api.get('/exports/report/', { params, responseType: 'blob' }),
};

export default api;


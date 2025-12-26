import axios from 'axios';

// Get base URL from environment variable and append /api path
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  register: (userData: { name: string; email: string; password: string; phone?: string; vehicleType?: string; vehicleRegistration?: string }) =>
    api.post('/auth/register', userData),

  logout: () => api.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),

  getCurrentUser: () => api.get('/auth/me'),

  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
};

// User API calls
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
};

// Subscription API calls
export const subscriptionAPI = {
  getUserSubscriptions: () => api.get('/subscriptions/user'),

  getCurrentSubscription: () => api.get('/subscriptions/current'),

  createSubscription: (planId: string, paymentMethodId?: string) =>
    api.post('/subscriptions', { planId, paymentMethodId }),

  cancelSubscription: (subscriptionId: string) =>
    api.delete(`/subscriptions/${subscriptionId}`),

  updateSubscriptionStatus: (subscriptionId: string, status: string) =>
    api.patch(`/subscriptions/${subscriptionId}/status`, { status }),

  useWash: (subscriptionId: string) =>
    api.post(`/subscriptions/${subscriptionId}/use-wash`),
};

// Plans API calls
export const plansAPI = {
  getPlans: async () => {
    const response = await api.get('/plans');
    return response.data;
  },
};

// QR Code API calls
export const qrCodeAPI = {
  generateQRCode: () => api.get('/qr-codes/generate'),

  getUserQRCodes: () => api.get('/qr-codes/user'),

  verifyQRCode: (code: string, partnerId: string, locationId: string) =>
    api.post('/qr-codes/verify', { code, partnerId, locationId }),

  getVerifications: () => api.get('/qr-codes/verifications'),
};

// Support API calls
export const supportAPI = {
  createTicket: (ticketData: any) => api.post('/support/tickets', ticketData),

  getUserTickets: () => api.get('/support/tickets/user'),

  getTicketById: (ticketId: string) => api.get(`/support/tickets/${ticketId}`),

  updateTicket: (ticketId: string, data: any) => api.patch(`/support/tickets/${ticketId}`, data),
};

// Location API calls
export const locationAPI = {
  getLocations: () => api.get('/locations'),

  getLocationById: (locationId: string) => api.get(`/locations/${locationId}`),

  getNearbyLocations: (latitude: number, longitude: number, radius?: number) =>
    api.get(`/locations/nearby?lat=${latitude}&lng=${longitude}&radius=${radius || 10}`),
};

// Partner API calls
export const partnerAPI = {
  getPartners: () => api.get('/partners'),

  getPartnerById: (partnerId: string) => api.get(`/partners/${partnerId}`),
};

// Partner Auth API calls
export const partnerAuthAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/partner-auth/login', credentials),

  forgotPassword: (email: string) =>
    api.post('/partner-auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/partner-auth/reset-password', { token, password }),
};

export default api;
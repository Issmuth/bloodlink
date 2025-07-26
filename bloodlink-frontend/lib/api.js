import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
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
  (response) => {
    console.log('✅ [API] Request successful:', {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error('❌ [API] Request failed:', {
      method: originalRequest?.method?.toUpperCase(),
      url: originalRequest?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      isRetry: !!originalRequest._retry
    });

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔄 [API] 401 error detected, attempting token refresh...');
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        console.log('🔄 [API] Refresh token available:', !!refreshToken);
        
        if (refreshToken) {
          console.log('🔄 [API] Making refresh token request...');
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
            { refreshToken }
          );

          console.log('✅ [API] Token refresh response:', {
            status: response.status,
            hasData: !!response.data,
            dataStructure: response.data ? Object.keys(response.data) : 'no data'
          });

          // Check if the response has the expected structure
          let accessToken;
          if (response.data.data && response.data.data.accessToken) {
            // Direct access token (from refresh endpoint)
            accessToken = response.data.data.accessToken;
          } else if (response.data.data && response.data.data.tokens) {
            // Nested tokens structure (from login/register)
            accessToken = response.data.data.tokens.accessToken;
          }

          if (!accessToken) {
            console.error('❌ [API] No access token found in refresh response');
            throw new Error('No access token in response');
          }

          console.log('✅ [API] Token refresh successful, updating stored token:', {
            newTokenPreview: accessToken.substring(0, 20) + '...'
          });
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          console.log('🔄 [API] Retrying original request with new token...');
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ [API] Token refresh failed:', {
          status: refreshError.response?.status,
          message: refreshError.response?.data?.message,
          error: refreshError.message
        });
        
        // Refresh failed, redirect to login
        console.log('🚪 [API] Clearing tokens and redirecting to login...');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password, confirmPassword) => 
    api.post('/auth/reset-password', { token, password, confirmPassword }),
  changePassword: (currentPassword, newPassword, confirmPassword) =>
    api.put('/auth/change-password', { currentPassword, newPassword, confirmPassword }),
  getProfile: () => api.get('/auth/profile'),
};

// Users API functions
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  changePassword: (passwordData) => api.put('/users/change-password', passwordData),
};

// Donors API functions
export const donorsAPI = {
  list: (params) => api.get('/donors', { params }),
  getProfile: () => api.get('/donors/profile'),
  updateAvailability: (availability) => api.put('/donors/availability', availability),
};

// Health Centers API functions
export const healthCentersAPI = {
  list: (params) => api.get('/health-centers', { params }),
  getProfile: () => api.get('/health-centers/profile'),
  updateProfile: (centerData) => api.put('/health-centers/profile', centerData),
};

// Blood Requests API functions
export const bloodRequestsAPI = {
  create: (requestData) => api.post('/blood-requests', requestData),
  list: (params) => api.get('/blood-requests', { params }),
  get: (id) => api.get(`/blood-requests/${id}`),
  update: (id, updateData) => api.put(`/blood-requests/${id}`, updateData),
  cancel: (id) => api.delete(`/blood-requests/${id}`),
};

// Telegram API functions
export const telegramAPI = {
  linkAccount: (userId, telegramId) => api.post('/telegram/link-telegram', {
    user_id: userId,
    telegram_id: telegramId
  }),
  generateDeepLink: (userId) => api.get(`/telegram/deep-link/${userId}`),
  testBroadcast: () => api.get('/telegram/test-broadcast'),
  notifyBloodRequest: (bloodRequestId) => api.post('/telegram/notify-blood-request', {
    bloodRequestId
  })
};

export default api; 
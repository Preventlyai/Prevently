import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const apiService: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For cookie-based auth
});

// Request interceptor to add auth token
apiService.interceptors.request.use(
  (config: AxiosRequestConfig): any => {
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiService.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    
    return response;
  },
  (error) => {
    const { response, request, message } = error;
    
    if (response) {
      // Server responded with error status
      const { status, data } = response;
      
      console.error(`❌ API Error ${status}:`, data);
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          if (window.location.pathname !== '/login') {
            toast.error('Session expired. Please login again.');
            window.location.href = '/login';
          }
          break;
        case 403:
          toast.error('Access denied. Insufficient permissions.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(data?.error || 'An unexpected error occurred.');
      }
    } else if (request) {
      // Network error
      console.error('❌ Network Error:', message);
      toast.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      console.error('❌ Request Error:', message);
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

// Health check function
export const healthCheck = async () => {
  try {
    const response = await apiService.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  register: (userData: any) => apiService.post('/auth/register', userData),
  login: (credentials: any) => apiService.post('/auth/login', credentials),
  logout: () => apiService.get('/auth/logout'),
  getCurrentUser: () => apiService.get('/auth/me'),
  updateDetails: (userData: any) => apiService.put('/auth/updatedetails', userData),
  updatePassword: (passwordData: any) => apiService.put('/auth/updatepassword', passwordData),
  deleteAccount: (password: string) => apiService.delete('/auth/deleteaccount', { data: { password } }),
  addFamilyMember: (email: string) => apiService.post('/auth/family/add', { email }),
};

// Symptoms API functions
export const symptomsAPI = {
  create: (symptomData: any) => apiService.post('/symptoms', symptomData),
  getAll: (params?: any) => apiService.get('/symptoms', { params }),
  getById: (id: string) => apiService.get(`/symptoms/${id}`),
  update: (id: string, symptomData: any) => apiService.put(`/symptoms/${id}`, symptomData),
  delete: (id: string) => apiService.delete(`/symptoms/${id}`),
  getAnalytics: (period?: string) => apiService.get('/symptoms/analytics', { params: { period } }),
  getInsights: () => apiService.get('/symptoms/insights'),
};

// Upload API functions
export const uploadAPI = {
  uploadFile: (file: File, type: string = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return apiService.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Data export functions
export const dataAPI = {
  exportUserData: () => apiService.get('/data/export'),
  importUserData: (data: any) => apiService.post('/data/import', data),
};

export default apiService;
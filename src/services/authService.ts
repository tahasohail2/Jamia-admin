import axios from 'axios';
import type { LoginCredentials, AuthResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach adminToken as Authorization header (browsers block manual Cookie header)
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers['Cookie'] = `adminToken=${token}`;
  }
  return config;
});

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        '/api/auth/login',
        credentials
      );
      // Store token from response body
      const token = (response.data as any).adminToken;
      if (token) {
        localStorage.setItem('adminToken', token);
        localStorage.setItem('isAuthenticated', 'true');
      }
      // Clear any previous logout flag so verifyToken works on next load
      sessionStorage.removeItem('loggedOut');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Login failed');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('isAuthenticated');
    }
  }

  async verifyToken(): Promise<AuthResponse | null> {
    try {
      const response = await axiosInstance.get('/api/auth/verify');
      if (response.data.user) {
        return { user: response.data.user };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>('/api/auth/refresh');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Token refresh failed');
      }
      throw new Error('An unexpected error occurred');
    }
  }
}

export const authService = new AuthService();
export default authService;

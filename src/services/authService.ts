import axios from 'axios';
import type { LoginCredentials, AuthResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        '/api/auth/login',
        credentials
      );
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
      // Even if logout fails on server, we should clear client state
    }
  }

  async verifyToken(): Promise<AuthResponse | null> {
    try {
      const response = await axiosInstance.get('/api/auth/verify');
      // Backend returns { user: { id, username } } on success
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

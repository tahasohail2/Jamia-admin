import axios from 'axios';
import type {
  StudentRecord,
  FullStudentRecord,
  PaginatedResponse,
  RecordFilters,
  AdminUser,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach adminToken cookie as header
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers['Cookie'] = `adminToken=${token}`;
  }
  return config;
});

// Add response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Trigger logout on 401
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

class AdminApi {
  async getRecords(
    filters: RecordFilters = {}
  ): Promise<PaginatedResponse<StudentRecord>> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.admissionType) params.append('admissionType', filters.admissionType);
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.department) params.append('department', filters.department);
      if (filters.approvalStatus) params.append('approvalStatus', filters.approvalStatus);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

      const response = await axiosInstance.get<PaginatedResponse<StudentRecord>>(
        `/api/admin/records?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch records');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async getRecordById(id: number): Promise<FullStudentRecord> {
    try {
      const response = await axiosInstance.get<FullStudentRecord>(
        `/api/admin/records/${id}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Record not found');
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch record');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async deleteRecord(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/api/admin/records/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete record');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async updateApprovalStatus(id: number, status: 'approved' | 'disapproved' | 'pending' | null): Promise<void> {
    try {
      // Convert null to 'pending' for backend compatibility
      const statusValue = status === null ? 'pending' : status;
      await axiosInstance.patch(`/api/admin/records/${id}/approval`, { approvalStatus: statusValue });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update approval status');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async exportRecords(filters: RecordFilters = {}): Promise<string> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.admissionType) params.append('admissionType', filters.admissionType);
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.department) params.append('department', filters.department);
      if (filters.approvalStatus) params.append('approvalStatus', filters.approvalStatus);

      const response = await axiosInstance.get(
        `/api/admin/records/export?${params.toString()}`,
        {
          responseType: 'text',
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error('Failed to export records');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await axiosInstance.post('/api/admin/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to change password');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // User Management APIs (Super Admin Only)
  async getAllUsers(): Promise<AdminUser[]> {
    try {
      const response = await axiosInstance.get('/api/admin/users');
      return response.data.users;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch users');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async createUser(username: string, password: string, isSuperAdmin: boolean): Promise<AdminUser> {
    try {
      const response = await axiosInstance.post('/api/admin/users', {
        username,
        password,
        isSuperAdmin,
      });
      return response.data.user;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create user');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async changeUserPassword(userId: number, newPassword: string): Promise<void> {
    try {
      await axiosInstance.post('/api/admin/change-password', {
        userId,
        newPassword,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to change password');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async updateUserStatus(userId: number, isActive: boolean): Promise<void> {
    try {
      await axiosInstance.patch(`/api/admin/users/${userId}/status`, {
        isActive,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update user status');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async deleteUser(userId: number): Promise<void> {
    try {
      await axiosInstance.delete(`/api/admin/users/${userId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete user');
      }
      throw new Error('An unexpected error occurred');
    }
  }
}

export const adminApi = new AdminApi();
export default adminApi;

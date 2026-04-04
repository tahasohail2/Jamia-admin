// Student Record Types
export interface StudentRecord {
  id: number;
  studentName: string;
  fatherName: string;
  admissionType: string;
  gender: string;
  department: string;
  dob: string;
  cnic: string;
  phone: string;
  educationType: string;
  registrationNo: string;
  submittedAt: string;
  approvalStatus?: 'approved' | 'disapproved' | 'pending' | 'admitted' | 'denied' | null;
  approvedAt?: string | null;
  pictureUrl?: string;
  additionalUrls?: string[];
  migrationBatchId?: string | null;
  migratedAt?: string | null;
}

export interface FullStudentRecord extends StudentRecord {
  whatsapp: string;
  fullAddress: string;
  currentAddress: string;
  educationType: string;
  requiredGrade: string;
  previousEducation: string;
  registrationNo: string;
  lastYearGrade: string;
  nextYearGrade: string;
  examPart1Marks: string;
  examPart2Marks: string;
  totalMarks: string;
  remarks: string;
  approvalComments?: string;
  certificateUrls?: string[];
  cnicUrls?: string[];
  additionalUrls?: string[];
  pictureUrl?: string;
}

// Authentication Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  isSuperAdmin: boolean;
}

export interface AuthResponse {
  user: AuthUser;
}

export interface LoginResponse extends AuthResponse {
  success?: boolean;
  token?: string;
}

// User Management Types
export interface AdminUser {
  id: number;
  username: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  isSuperAdmin: boolean;
}

// API Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    pageSize: number;
  };
}

export interface RecordFilters {
  search?: string;
  admissionType?: string;
  gender?: string;
  department?: string;
  approvalStatus?: string;
  migrationBatchId?: string;
  page?: number;
  pageSize?: number;
}

export interface FilterState {
  admissionType: string;
  gender: string;
  department: string;
}

// Error Types
export interface ErrorLog {
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context: {
    url: string;
    userAgent: string;
    userId?: number;
  };
}

// Toast Types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// Migration Batch Types
export interface MigrationBatch {
  batchId: string;
  migratedAt: string;
  totalRecords: number;
}

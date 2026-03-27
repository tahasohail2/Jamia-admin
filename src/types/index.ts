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
  approvalStatus?: 'approved' | 'disapproved' | null;
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
  certificateUrls?: string[];
  cnicUrls?: string[];
  additionalUrls?: string[];
}

// Authentication Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
}

export interface AuthResponse {
  user: AuthUser;
}

export interface LoginResponse extends AuthResponse {
  success?: boolean;
  token?: string;
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

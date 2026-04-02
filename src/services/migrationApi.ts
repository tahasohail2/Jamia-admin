import { adminApi } from './adminApi';
import type { FullStudentRecord } from '../types';
import axios from 'axios';

const BATCH_SIZE = 50;

// TODO: Replace with real API URL when migration backend is ready
const MIGRATION_API_URL = import.meta.env.VITE_MIGRATION_API_URL;

interface MigrationRecord {
  id: number;
  submittedAt: string;
  admissionType: string;
  gender: string;
  department: string;
  studentName: string;
  fatherName: string;
  dob: string;
  cnic: string;
  phone: string;
  whatsapp: string;
  fullAddress: string;
  currentAddress: string;
  requiredGrade: string;
  previousEducation: string;
  educationType: string;
  registrationNo: string;
  lastYearGrade: string;
  nextYearGrade: string;
  certificateUrls: string[];
  cnicUrls: string[];
  additionalUrls: string[];
  examPart1Marks: string;
  examPart2Marks: string;
  totalMarks: string;
  remarks: string;
  approvalStatus: string | null;
  approvedBy?: number;
  approvedAt?: string;
}

interface BatchResult {
  id: number;
  status: 'success' | 'failed';
  routedTo?: string;
  error?: string;
}

interface BatchResponse {
  batchId: string;
  total: number;
  successful: number;
  failed: number;
  results: BatchResult[];
}

export interface MigrationProgress {
  totalRecords: number;
  totalBatches: number;
  completedBatches: number;
  successful: number;
  failed: number;
  failedRecords: BatchResult[];
  status: 'idle' | 'fetching' | 'migrating' | 'done' | 'error';
  errorMessage?: string;
}

function toMigrationRecord(record: FullStudentRecord): MigrationRecord {
  return {
    id: record.id,
    submittedAt: record.submittedAt,
    admissionType: record.admissionType,
    gender: record.gender,
    department: record.department,
    studentName: record.studentName,
    fatherName: record.fatherName,
    dob: record.dob,
    cnic: record.cnic,
    phone: record.phone,
    whatsapp: record.whatsapp || '',
    fullAddress: record.fullAddress || '',
    currentAddress: record.currentAddress,
    requiredGrade: record.requiredGrade || '',
    previousEducation: record.previousEducation || '',
    educationType: record.educationType || '',
    registrationNo: record.registrationNo || '',
    lastYearGrade: record.lastYearGrade || '',
    nextYearGrade: record.nextYearGrade || '',
    certificateUrls: record.certificateUrls || [],
    cnicUrls: record.cnicUrls || [],
    additionalUrls: record.additionalUrls || [],
    examPart1Marks: record.examPart1Marks || '',
    examPart2Marks: record.examPart2Marks || '',
    totalMarks: record.totalMarks || '',
    remarks: record.remarks || '',
    approvalStatus: record.approvalStatus || null,
    // approvedBy and approvedAt would come from the full record if available
  };
}

/**
 * Send a batch to the migration API.
 * Currently mocked — replace with real axios call when the API URL is ready.
 */
async function sendBatch(batchId: string, records: MigrationRecord[]): Promise<BatchResponse> {
  // TODO: Replace with real API call:
  const res = await axios.post(`${MIGRATION_API_URL}/api/migrate/batch`, { batchId, records });
  return res.data;

  // Mock: simulate network delay, return all as success
  await new Promise((resolve) => setTimeout(resolve, 500));

  const results: BatchResult[] = records.map((r) => ({
    id: r.id,
    status: 'success' as const,
    routedTo: r.approvalStatus || 'pending',
  }));

  return { batchId, total: records.length, successful: records.length, failed: 0, results };
}

export async function migrateAllRecords(
  onProgress: (progress: MigrationProgress) => void
): Promise<MigrationProgress> {
  const progress: MigrationProgress = {
    totalRecords: 0,
    totalBatches: 0,
    completedBatches: 0,
    successful: 0,
    failed: 0,
    failedRecords: [],
    status: 'fetching',
  };

  onProgress({ ...progress });

  try {
    // Step 1: Fetch all record IDs
    const listResponse = await adminApi.getRecords({ pageSize: 10000 });
    const recordIds: number[] = listResponse.data.map((r: { id: number }) => r.id);
    progress.totalRecords = recordIds.length;

    if (recordIds.length === 0) {
      progress.status = 'done';
      onProgress({ ...progress });
      return progress;
    }

    // Step 2: Fetch full details (parallel in chunks of 10 to avoid overload)
    const fullRecords: FullStudentRecord[] = [];
    const FETCH_CHUNK = 10;
    for (let i = 0; i < recordIds.length; i += FETCH_CHUNK) {
      const chunk = recordIds.slice(i, i + FETCH_CHUNK);
      const results = await Promise.all(chunk.map((id) => adminApi.getRecordById(id)));
      fullRecords.push(...results);
    }

    // Step 3: Split into batches and send
    const batches: MigrationRecord[][] = [];
    const migrationRecords = fullRecords.map(toMigrationRecord);

    for (let i = 0; i < migrationRecords.length; i += BATCH_SIZE) {
      batches.push(migrationRecords.slice(i, i + BATCH_SIZE));
    }

    progress.totalBatches = batches.length;
    progress.status = 'migrating';
    onProgress({ ...progress });

    for (let i = 0; i < batches.length; i++) {
      const batchId = `batch_${String(i + 1).padStart(3, '0')}`;
      const response = await sendBatch(batchId, batches[i]);

      progress.completedBatches = i + 1;
      progress.successful += response.successful;
      progress.failed += response.failed;
      progress.failedRecords.push(...response.results.filter((r: BatchResult) => r.status === 'failed'));

      onProgress({ ...progress });
    }

    progress.status = 'done';
    onProgress({ ...progress });
    return progress;
  } catch (err) {
    progress.status = 'error';
    progress.errorMessage = err instanceof Error ? err.message : 'Migration failed';
    onProgress({ ...progress });
    return progress;
  }
}

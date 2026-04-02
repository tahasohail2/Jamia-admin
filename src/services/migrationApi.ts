import { adminApi } from './adminApi';
import type { FullStudentRecord } from '../types';
import axios from 'axios';

const BATCH_SIZE = 5;

const MIGRATION_API_URL = 'https://donovan-subtrihedral-betsey.ngrok-free.dev';

interface MigrationRecord {
  originalId: number;
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

interface BulkInsertResponse {
  success: boolean;
  inserted: number;
  skipped: number;
  skippedList: Array<{ originalId?: number; reason?: string }>;
}

export interface MigrationProgress {
  totalRecords: number;
  totalBatches: number;
  completedBatches: number;
  inserted: number;
  skipped: number;
  skippedList: Array<{ originalId?: number; reason?: string }>;
  status: 'idle' | 'fetching' | 'migrating' | 'done' | 'error';
  errorMessage?: string;
}

function toMigrationRecord(record: FullStudentRecord): MigrationRecord {
  return {
    originalId: record.id,
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
  };
}

async function sendBatch(records: MigrationRecord[]): Promise<BulkInsertResponse> {
  console.log(`[Migration] Sending batch of ${records.length} records to API...`);
  console.log('[Migration] Request payload:', JSON.stringify(records, null, 2));

  try {
    const res = await axios.post<BulkInsertResponse>(
      `${MIGRATION_API_URL}/Home/BulkInsertStudents`,
      records
    );
    console.log('res --> ' ,res)
    console.log('[Migration] Response status:', res.status);
    console.log('[Migration] Response data:', res.data);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error('[Migration] API error status:', err.response?.status);
      console.error('[Migration] API error data:', err.response?.data);
      console.error('[Migration] API error headers:', err.response?.headers);
    }
    throw err;
  }
}

export async function migrateAllRecords(
  onProgress: (progress: MigrationProgress) => void
): Promise<MigrationProgress> {
  const progress: MigrationProgress = {
    totalRecords: 0,
    totalBatches: 0,
    completedBatches: 0,
    inserted: 0,
    skipped: 0,
    skippedList: [],
    status: 'fetching',
  };

  onProgress({ ...progress });

  try {
    // Step 1: Fetch all records
    const listResponse = await adminApi.getRecords({ pageSize: 10000 });
    progress.totalRecords = listResponse.data.length;

    if (listResponse.data.length === 0) {
      progress.status = 'done';
      onProgress({ ...progress });
      return progress;
    }

    // Step 2: Fetch full details one at a time with delay to avoid 429
    const fullRecords: FullStudentRecord[] = [];
    const recordIds = listResponse.data.map((r) => r.id);
    const DELAY_MS = 200;

    for (let i = 0; i < recordIds.length; i++) {
      if (i > 0) await new Promise((r) => setTimeout(r, DELAY_MS));
      try {
        console.log(`[Migration] Fetching record ${i + 1}/${recordIds.length} (ID: ${recordIds[i]})`);
        const record = await adminApi.getRecordById(recordIds[i]);
        fullRecords.push(record);
      } catch (err) {
        console.warn(`[Migration] Failed to fetch record ID ${recordIds[i]}, skipping`, err);
      }
    }
    console.log(`[Migration] Total full records ready: ${fullRecords.length}`);

    // Step 3: Split into batches and send
    const migrationRecords = fullRecords.map(toMigrationRecord);
    const batches: MigrationRecord[][] = [];

    for (let i = 0; i < migrationRecords.length; i += BATCH_SIZE) {
      batches.push(migrationRecords.slice(i, i + BATCH_SIZE));
    }

    progress.totalBatches = batches.length;
    progress.status = 'migrating';
    onProgress({ ...progress });

    for (let i = 0; i < batches.length; i++) {
      const response = await sendBatch(batches[i]);

      progress.completedBatches = i + 1;
      progress.inserted += response.inserted;
      progress.skipped += response.skipped;
      if (response.skippedList?.length) {
        progress.skippedList.push(...response.skippedList);
      }

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

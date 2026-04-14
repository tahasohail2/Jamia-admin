import { adminApi } from './adminApi';
import type { FullStudentRecord } from '../types';
import axios from 'axios';

const BATCH_SIZE = 3;
const FETCH_DELAY_MS = 500;
const BATCH_DELAY_MS = 1000;

let isCancelled = false;

export function cancelMigration() {
  isCancelled = true;
}

const MIGRATION_API_URL = import.meta.env.VITE_MIGRATION_API_URL;

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

interface JamiaResponseItem {
  CNICNumber: string;
  Status: 'ValidationFailed' | 'Admitted' | 'Denied';
  Comment: string;
}

interface BulkInsertResponse {
  success: boolean;
  AllResponseslists?: JamiaResponseItem[];
}

export interface MigrationProgress {
  totalRecords: number;
  totalBatches: number;
  completedBatches: number;
  admitted: number;
  denied: number;
  validationFailed: number;
  validationFailedList: { cnic: string; comment: string }[];
  status: 'idle' | 'fetching' | 'migrating' | 'done' | 'error';
  errorMessage?: string;
  fetchedRecords?: number;
  batchId?: string;
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

async function sendBatch(records: MigrationRecord[], retryCount = 0): Promise<BulkInsertResponse> {
  const MAX_RETRIES = 2;

  try {
    const res = await axios.post<BulkInsertResponse>(
      `${MIGRATION_API_URL}/Home/BulkInsertStudents`,
      records,
      {
        timeout: 60000,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!res.data || typeof res.data !== 'object') {
      throw new Error('Invalid response format from migration API');
    }

    return {
      success: res.data.success ?? false,
      AllResponseslists: res.data.AllResponseslists ?? [],
    };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (retryCount < MAX_RETRIES) {
        if (err.code === 'ECONNABORTED' || err.response?.status === 429 || err.response?.status === 503) {
          const waitTime = (retryCount + 1) * 2000;
          await new Promise((r) => setTimeout(r, waitTime));
          return sendBatch(records, retryCount + 1);
        }
      }

      if (err.code === 'ECONNABORTED') throw new Error('Request timeout - migration API took too long to respond');
      if (err.response?.status === 429) throw new Error('Too many requests - please wait and try again');
      if (err.response?.status === 500) throw new Error('Migration API server error');
      if (err.response?.status === 503) throw new Error('Migration API temporarily unavailable');

      throw new Error(err.response?.data?.message || err.message || 'Failed to send batch');
    }

    if (err instanceof Error) throw err;
    throw new Error('Unknown error occurred during batch migration');
  }
}

function generateBatchId(): string {
  const now = new Date();
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const dd = now.getDate().toString().padStart(2, '0');
  const hh = now.getHours().toString().padStart(2, '0');
  const min = now.getMinutes().toString().padStart(2, '0');
  return `B-${mm}${dd}-${hh}${min}`;
}

export async function migrateSingleRecord(
  record: FullStudentRecord,
  onProgress: (isMigrating: boolean) => void
): Promise<{ status: 'admitted' | 'denied' | 'validation_failed' | 'error'; comment: string; batchId?: string }> {
  const batchId = generateBatchId();
  onProgress(true);

  try {
    const migrationRecord = toMigrationRecord(record);
    const response = await sendBatch([migrationRecord]);

    const item = response.AllResponseslists?.find(
      (r) => r.CNICNumber === record.cnic
    ) ?? response.AllResponseslists?.[0];

    let status: 'admitted' | 'denied' | 'validation_failed' | 'error';
    let comment = item?.Comment ?? '';

    if (!item) {
      status = 'error';
      comment = 'API سے کوئی جواب نہیں ملا';
    } else if (item.Status === 'Admitted') {
      status = 'admitted';
    } else if (item.Status === 'Denied') {
      status = 'denied';
    } else {
      status = 'validation_failed';
    }

    // Persist to backend
    if (status === 'admitted' || status === 'denied') {
      try {
        await adminApi.markRecordsMigrated([record.id], batchId);
        await adminApi.bulkUpdateStatuses([{ id: record.id, status, comment }]);
      } catch (_) { /* non-critical */ }
    } else if (status === 'validation_failed') {
      try {
        await adminApi.bulkUpdateStatuses([{ id: record.id, status: 'validation_failed', comment }]);
      } catch (_) { /* non-critical */ }
    }

    return { status, comment, batchId: (status === 'admitted' || status === 'denied') ? batchId : undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'منتقلی ناکام ہو گئی';
    return { status: 'error', comment: message };
  } finally {
    onProgress(false);
  }
}

export async function migrateAllRecords(
  onProgress: (progress: MigrationProgress) => void,
  sessionYear?: number
): Promise<MigrationProgress> {
  isCancelled = false;

  const batchId = generateBatchId();

  const progress: MigrationProgress = {
    totalRecords: 0,
    totalBatches: 0,
    completedBatches: 0,
    admitted: 0,
    denied: 0,
    validationFailed: 0,
    validationFailedList: [],
    status: 'fetching',
    fetchedRecords: 0,
    batchId,
  };

  onProgress({ ...progress });

  try {
    const listResponse = await adminApi.getRecords({ pageSize: 10000, approvalStatus: 'approved', migrationBatchId: 'not_migrated', sessionYear });
    const recordsWithRegNo = listResponse.data.filter((r) => r.registrationNo && r.registrationNo.trim() !== '');
    progress.totalRecords = listResponse.data.length;

    if (recordsWithRegNo.length === 0) {
      progress.status = 'done';
      onProgress({ ...progress });
      return progress;
    }

    if (isCancelled) {
      progress.status = 'error';
      progress.errorMessage = 'منتقلی منسوخ کر دی گئی';
      onProgress({ ...progress });
      return progress;
    }

    const fullRecords: FullStudentRecord[] = [];
    const recordIds = recordsWithRegNo.map((r) => r.id);

    for (let i = 0; i < recordIds.length; i++) {
      if (isCancelled) {
        progress.status = 'error';
        progress.errorMessage = 'منتقلی منسوخ کر دی گئی';
        onProgress({ ...progress });
        return progress;
      }

      if (i > 0) {
        await new Promise((r) => setTimeout(r, FETCH_DELAY_MS));
      }

      try {
        const record = await adminApi.getRecordById(recordIds[i]);
        fullRecords.push(record);
        progress.fetchedRecords = i + 1;
        onProgress({ ...progress });
      } catch (err) {
        if (err instanceof Error && err.message.includes('429')) {
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    }

    if (isCancelled) {
      progress.status = 'error';
      progress.errorMessage = 'منتقلی منسوخ کر دی گئی';
      onProgress({ ...progress });
      return progress;
    }

    const migrationRecords = fullRecords.map(toMigrationRecord);
    const batches: MigrationRecord[][] = [];
    for (let i = 0; i < migrationRecords.length; i += BATCH_SIZE) {
      batches.push(migrationRecords.slice(i, i + BATCH_SIZE));
    }

    const idBatches: number[][] = [];
    for (let i = 0; i < fullRecords.length; i += BATCH_SIZE) {
      idBatches.push(fullRecords.slice(i, i + BATCH_SIZE).map((r) => r.id));
    }

    const successfullyMigratedIds: number[] = [];
    const allJamiaResponses: JamiaResponseItem[] = [];

    progress.totalBatches = batches.length;
    progress.status = 'migrating';
    onProgress({ ...progress });

    for (let i = 0; i < batches.length; i++) {
      if (isCancelled) {
        progress.status = 'error';
        progress.errorMessage = 'منتقلی منسوخ کر دی گئی';
        onProgress({ ...progress });
        return progress;
      }

      try {
        if (i > 0) {
          await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
        }

        const response = await sendBatch(batches[i]);
        progress.completedBatches = i + 1;

        if (response.AllResponseslists) {
          allJamiaResponses.push(...response.AllResponseslists);
          for (const item of response.AllResponseslists) {
            if (item.Status === 'Admitted') progress.admitted++;
            else if (item.Status === 'Denied') progress.denied++;
            else if (item.Status === 'ValidationFailed') {
              progress.validationFailed++;
              progress.validationFailedList.push({ cnic: item.CNICNumber, comment: item.Comment });
            }
          }
        }

        successfullyMigratedIds.push(...idBatches[i]);
        onProgress({ ...progress });
      } catch (err) {
        progress.completedBatches = i + 1;
        if (err instanceof Error && (err.message.includes('429') || err.message.includes('Too many requests'))) {
          await new Promise((r) => setTimeout(r, 3000));
        }
        onProgress({ ...progress });
      }
    }

    if (successfullyMigratedIds.length > 0) {
      try {
        await adminApi.markRecordsMigrated(successfullyMigratedIds, batchId);
      } catch (_) { /* records were already sent */ }
    }

    const cnicToId = new Map<string, number>();
    for (const rec of fullRecords) {
      cnicToId.set(rec.cnic, rec.id);
    }

    const statusUpdates: { id: number; status: string; comment: string }[] = [];
    const validationFailedIds: number[] = [];

    for (const item of allJamiaResponses) {
      const recordId = cnicToId.get(item.CNICNumber);
      if (!recordId) continue;

      if (item.Status === 'Admitted') {
        statusUpdates.push({ id: recordId, status: 'admitted', comment: item.Comment });
      } else if (item.Status === 'Denied') {
        statusUpdates.push({ id: recordId, status: 'denied', comment: item.Comment });
      } else if (item.Status === 'ValidationFailed') {
        validationFailedIds.push(recordId);
        statusUpdates.push({ id: recordId, status: 'validation_failed', comment: item.Comment });
      }
    }

    if (statusUpdates.length > 0) {
      try {
        await adminApi.bulkUpdateStatuses(statusUpdates);
      } catch (_) { /* non-critical */ }
    }

    if (validationFailedIds.length > 0) {
      try {
        await adminApi.clearMigrationBatch(validationFailedIds);
      } catch (_) { /* non-critical */ }
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

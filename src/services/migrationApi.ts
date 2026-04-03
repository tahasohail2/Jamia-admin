import { adminApi } from './adminApi';
import type { FullStudentRecord } from '../types';
import axios from 'axios';

const BATCH_SIZE = 3; // Reduced from 5 to 3 for better reliability
const FETCH_DELAY_MS = 500; // Increased from 200ms to 500ms to avoid 429 errors
const BATCH_DELAY_MS = 1000; // 1 second delay between batches

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

interface BulkInsertResponse {
  success: boolean;
  inserted?: number;
  updated?: number;
  skipped?: number;
  skippedList?: string[];
}

export interface MigrationProgress {
  totalRecords: number;
  totalBatches: number;
  completedBatches: number;
  inserted: number;
  skipped: number;
  skippedList: string[];
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
  
  console.log(`[Migration] Sending batch of ${records.length} records to API... (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
  console.log('[Migration] Request payload:', JSON.stringify(records, null, 2));

  try {
    const res = await axios.post<BulkInsertResponse>(
      `${MIGRATION_API_URL}/Home/BulkInsertStudents`,
      records,
      {
        timeout: 60000, // Increased to 60 seconds
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('[Migration] Response status:', res.status);
    console.log('[Migration] Response data:', res.data);
    
    // Validate response structure
    if (!res.data || typeof res.data !== 'object') {
      throw new Error('Invalid response format from migration API');
    }
    
    // Ensure all numeric fields have default values
    return {
      success: res.data.success ?? false,
      inserted: res.data.inserted ?? 0,
      updated: res.data.updated ?? 0,
      skipped: res.data.skipped ?? 0,
      skippedList: res.data.skippedList ?? [],
    };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error('[Migration] API error status:', err.response?.status);
      console.error('[Migration] API error data:', err.response?.data);
      console.error('[Migration] API error message:', err.message);
      
      // Retry logic for specific errors
      if (retryCount < MAX_RETRIES) {
        if (err.code === 'ECONNABORTED' || err.response?.status === 429 || err.response?.status === 503) {
          const waitTime = (retryCount + 1) * 2000; // 2s, 4s, 6s...
          console.log(`[Migration] Retrying after ${waitTime}ms...`);
          await new Promise((r) => setTimeout(r, waitTime));
          return sendBatch(records, retryCount + 1);
        }
      }
      
      if (err.code === 'ECONNABORTED') {
        throw new Error('Request timeout - migration API took too long to respond');
      }
      
      if (err.response?.status === 429) {
        throw new Error('Too many requests - please wait and try again');
      }
      
      if (err.response?.status === 500) {
        throw new Error('Migration API server error');
      }
      
      if (err.response?.status === 503) {
        throw new Error('Migration API temporarily unavailable');
      }
      
      throw new Error(err.response?.data?.message || err.message || 'Failed to send batch');
    }
    
    if (err instanceof Error) {
      throw err;
    }
    
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

export async function migrateAllRecords(
  onProgress: (progress: MigrationProgress) => void
): Promise<MigrationProgress> {
  // Reset cancellation flag
  isCancelled = false;

  const batchId = generateBatchId();
  
  const progress: MigrationProgress = {
    totalRecords: 0,
    totalBatches: 0,
    completedBatches: 0,
    inserted: 0,
    skipped: 0,
    skippedList: [],
    status: 'fetching',
    fetchedRecords: 0,
    batchId,
  };

  onProgress({ ...progress });

  try {
    // Step 1: Fetch only approved records that haven't been migrated yet
    const listResponse = await adminApi.getRecords({ pageSize: 10000, approvalStatus: 'approved', migrationBatchId: 'not_migrated' });
    progress.totalRecords = listResponse.data.length;

    if (listResponse.data.length === 0) {
      progress.status = 'done';
      onProgress({ ...progress });
      return progress;
    }

    // Check if cancelled
    if (isCancelled) {
      progress.status = 'error';
      progress.errorMessage = 'منتقلی منسوخ کر دی گئی';
      onProgress({ ...progress });
      return progress;
    }

    // Step 2: Fetch full details one at a time with delay to avoid 429
    const fullRecords: FullStudentRecord[] = [];
    const recordIds = listResponse.data.map((r) => r.id);

    console.log(`[Migration] Starting to fetch ${recordIds.length} full records...`);
    
    for (let i = 0; i < recordIds.length; i++) {
      // Check if cancelled
      if (isCancelled) {
        progress.status = 'error';
        progress.errorMessage = 'منتقلی منسوخ کر دی گئی';
        onProgress({ ...progress });
        return progress;
      }
      
      // Add delay before each request (including the first one to be safe)
      if (i > 0) {
        await new Promise((r) => setTimeout(r, FETCH_DELAY_MS));
      }
      
      try {
        console.log(`[Migration] Fetching record ${i + 1}/${recordIds.length} (ID: ${recordIds[i]})`);
        const record = await adminApi.getRecordById(recordIds[i]);
        fullRecords.push(record);
        
        // Update progress with fetched count
        progress.fetchedRecords = i + 1;
        onProgress({ ...progress });
      } catch (err) {
        console.warn(`[Migration] Failed to fetch record ID ${recordIds[i]}, skipping`, err);
        
        // If we get a 429 error, wait longer before continuing
        if (err instanceof Error && err.message.includes('429')) {
          console.log('[Migration] Rate limit hit, waiting 2 seconds before continuing...');
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    }
    console.log(`[Migration] Total full records ready: ${fullRecords.length}`);

    // Check if cancelled
    if (isCancelled) {
      progress.status = 'error';
      progress.errorMessage = 'منتقلی منسوخ کر دی گئی';
      onProgress({ ...progress });
      return progress;
    }

    // Step 3: Split into batches and send
    const migrationRecords = fullRecords.map(toMigrationRecord);
    const batches: MigrationRecord[][] = [];

    for (let i = 0; i < migrationRecords.length; i += BATCH_SIZE) {
      batches.push(migrationRecords.slice(i, i + BATCH_SIZE));
    }

    // Also split original IDs into matching batches for tracking
    const idBatches: number[][] = [];
    for (let i = 0; i < fullRecords.length; i += BATCH_SIZE) {
      idBatches.push(fullRecords.slice(i, i + BATCH_SIZE).map((r) => r.id));
    }

    const successfullyMigratedIds: number[] = [];

    progress.totalBatches = batches.length;
    progress.status = 'migrating';
    onProgress({ ...progress });

    for (let i = 0; i < batches.length; i++) {
      // Check if cancelled
      if (isCancelled) {
        progress.status = 'error';
        progress.errorMessage = 'منتقلی منسوخ کر دی گئی';
        onProgress({ ...progress });
        return progress;
      }
      
      try {
        // Add delay between batches (except for the first one)
        if (i > 0) {
          console.log(`[Migration] Waiting ${BATCH_DELAY_MS}ms before sending next batch...`);
          await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
        }
        
        console.log(`[Migration] Sending batch ${i + 1}/${batches.length}...`);
        const response = await sendBatch(batches[i]);

        progress.completedBatches = i + 1;
        
        // Handle both 'inserted' and 'updated' fields from backend
        const recordsProcessed = (response.inserted || 0) + (response.updated || 0);
        progress.inserted += recordsProcessed;
        progress.skipped += (response.skipped || 0);
        
        if (response.skippedList && response.skippedList.length > 0) {
          progress.skippedList.push(...response.skippedList);
        }

        // Track successfully sent record IDs (exclude skipped CNICs)
        const skippedCnics = new Set(response.skippedList || []);
        const batchRecordIds = idBatches[i];
        const batchMigrationRecords = batches[i];
        for (let j = 0; j < batchMigrationRecords.length; j++) {
          if (!skippedCnics.has(batchMigrationRecords[j].cnic)) {
            successfullyMigratedIds.push(batchRecordIds[j]);
          }
        }

        console.log(`[Migration] Batch ${i + 1} complete: ${recordsProcessed} processed, ${response.skipped || 0} skipped`);
        onProgress({ ...progress });
      } catch (err) {
        console.error(`[Migration] Failed to send batch ${i + 1}/${batches.length}:`, err);
        
        // Mark all records in this batch as skipped
        progress.skipped += batches[i].length;
        progress.completedBatches = i + 1;
        
        // Add error message but continue with next batch
        if (err instanceof Error) {
          console.error('[Migration] Batch error:', err.message);
          
          // If it's a rate limit error, wait longer before continuing
          if (err.message.includes('429') || err.message.includes('Too many requests')) {
            console.log('[Migration] Rate limit on migration API, waiting 3 seconds...');
            await new Promise((r) => setTimeout(r, 3000));
          }
        }
        
        onProgress({ ...progress });
      }
    }

    // Step 4: Mark successfully migrated records in our DB
    if (successfullyMigratedIds.length > 0) {
      try {
        console.log(`[Migration] Marking ${successfullyMigratedIds.length} records with batch ID: ${batchId}`);
        await adminApi.markRecordsMigrated(successfullyMigratedIds, batchId);
      } catch (err) {
        console.error('[Migration] Failed to mark records as migrated:', err);
        // Don't fail the whole migration for this — records were already sent
      }
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

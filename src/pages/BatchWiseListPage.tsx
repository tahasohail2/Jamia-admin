import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import EditRecordModal from '../components/EditRecordModal';
import { adminApi } from '../services/adminApi';
import { useToast } from '../context/ToastContext';
import { MigrationBatch, StudentRecord, FullStudentRecord } from '../types';
import '../styles/BatchWiseListPage.css';

const StatusBadge: React.FC<{ status: StudentRecord['approvalStatus'] }> = ({ status }) => {
  const map: Record<string, { label: string; cls: string }> = {
    approved:    { label: 'منظور شدہ',   cls: 'badge-approved' },
    admitted:    { label: 'داخل شدہ',    cls: 'badge-admitted' },
    disapproved: { label: 'مسترد',       cls: 'badge-disapproved' },
    denied:      { label: 'انکار شدہ',   cls: 'badge-denied' },
    pending:     { label: 'زیر التواء',  cls: 'badge-pending' },
  };
  const entry = map[status ?? 'pending'] ?? map['pending'];
  return <span className={`status-badge ${entry.cls}`}>{entry.label}</span>;
};

const BatchWiseListPage: React.FC = () => {
  const { showToast } = useToast();

  const [batches, setBatches] = useState<MigrationBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [processedRecords, setProcessedRecords] = useState<StudentRecord[]>([]);
  const [isLoadingProcessed, setIsLoadingProcessed] = useState(true);
  const [processedSearchTerm, setProcessedSearchTerm] = useState('');

  const [recordToEdit, setRecordToEdit] = useState<FullStudentRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all migration batches on mount
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoadingBatches(true);
        const data = await adminApi.getMigrationBatches();
        setBatches(data);
        if (data.length > 0) setSelectedBatch(data[0].batchId);
      } catch {
        showToast('بیچز لوڈ نہیں ہو سکے', 'error');
      } finally {
        setIsLoadingBatches(false);
      }
    };
    load();
  }, []);

  // Fetch records whenever selected batch changes
  const fetchBatchRecords = useCallback(async (batchId: string) => {
    try {
      setIsLoadingRecords(true);
      const response = await adminApi.getRecords({ migrationBatchId: batchId, pageSize: 1000 });
      setRecords(response.data);
    } catch {
      showToast('ریکارڈز لوڈ نہیں ہو سکے', 'error');
      setRecords([]);
    } finally {
      setIsLoadingRecords(false);
    }
  }, []);

  useEffect(() => {
    if (selectedBatch) fetchBatchRecords(selectedBatch);
  }, [selectedBatch, fetchBatchRecords]);

  // Fetch records that have an API response but no batch ID
  useEffect(() => {
    const loadProcessed = async () => {
      try {
        setIsLoadingProcessed(true);
        const response = await adminApi.getRecords({ pageSize: 1000 });
        const filtered = response.data.filter(
          (r) =>
            !r.migrationBatchId &&
            r.approvalStatus != null &&
            r.approvalStatus !== 'pending'
        );
        setProcessedRecords(filtered);
      } catch {
        showToast('پروسیس شدہ ریکارڈز لوڈ نہیں ہو سکے', 'error');
      } finally {
        setIsLoadingProcessed(false);
      }
    };
    loadProcessed();
  }, []);

  const handleEditClick = async (record: StudentRecord) => {
    try {
      const full = await adminApi.getRecordById(record.id);
      setRecordToEdit(full);
      setIsEditModalOpen(true);
    } catch {
      showToast('ریکارڈ لوڈ نہیں ہو سکا', 'error');
    }
  };

  const handleEditSave = async (id: number, data: Partial<FullStudentRecord>) => {
    try {
      setIsSaving(true);
      const { approvalStatus, approvalComments, ...rest } = data;
      await adminApi.updateRecord(id, { ...rest, approvalComments });
      await adminApi.updateApprovalStatus(id, (approvalStatus || null) as 'approved' | 'disapproved' | 'pending' | null);
      showToast('ریکارڈ کامیابی سے اپ ڈیٹ ہو گیا', 'success');
      if (selectedBatch) fetchBatchRecords(selectedBatch);
    } catch {
      showToast('ریکارڈ اپ ڈیٹ نہیں ہو سکا', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset search when batch changes
  useEffect(() => {
    setSearchTerm('');
  }, [selectedBatch]);

  const filteredRecords = records.filter((rec) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      rec.studentName?.toLowerCase().includes(q) ||
      rec.cnic?.toLowerCase().includes(q) ||
      rec.registrationNo?.toLowerCase().includes(q)
    );
  });

  const currentBatch = batches.find((b) => b.batchId === selectedBatch);

  const filteredProcessedRecords = processedRecords.filter((rec) => {
    if (!processedSearchTerm.trim()) return true;
    const q = processedSearchTerm.toLowerCase();
    return (
      rec.studentName?.toLowerCase().includes(q) ||
      rec.cnic?.toLowerCase().includes(q) ||
      rec.registrationNo?.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div className="batch-page">
        <div className="batch-header">
          <div>
            <h2 className="batch-title">بیچ وار فہرست</h2>
            <p className="batch-subtitle">ہر بیچ کے طلباء کی تفصیل</p>
          </div>
        </div>

        {isLoadingBatches ? (
          <div className="batch-loading">بیچز لوڈ ہو رہے ہیں...</div>
        ) : batches.length === 0 ? (
          <div className="batch-empty">کوئی بیچ موجود نہیں</div>
        ) : (
          <div className="batch-layout">
            {/* Batch selector tabs */}
            <div className="batch-tabs">
              {batches.map((b) => (
                <button
                  key={b.batchId}
                  className={`batch-tab ${selectedBatch === b.batchId ? 'active' : ''}`}
                  onClick={() => setSelectedBatch(b.batchId)}
                >
                  <span className="batch-tab-id">{b.batchId}</span>
                  <span className="batch-tab-count">{b.totalRecords} طلباء</span>
                  <span className="batch-tab-date">
                    {new Date(b.migratedAt).toLocaleDateString('ur-PK')}
                  </span>
                </button>
              ))}
            </div>

            {/* Table area */}
            <div className="batch-content">
              {currentBatch && (
                <div className="batch-info-bar">
                  <span>بیچ: <strong>{currentBatch.batchId}</strong></span>
                  <span>تاریخ: <strong>{new Date(currentBatch.migratedAt).toLocaleDateString('ur-PK')}</strong></span>
                  <span>کل طلباء: <strong>{records.length}</strong></span>
                  <div className="batch-search">
                    <input
                      type="text"
                      className="batch-search-input"
                      placeholder="نام، شناختی کارڈ، یا داخلہ نمبر سے تلاش کریں..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button className="batch-search-clear" onClick={() => setSearchTerm('')}>×</button>
                    )}
                  </div>
                </div>
              )}

              {isLoadingRecords ? (
                <div className="batch-loading">ریکارڈز لوڈ ہو رہے ہیں...</div>
              ) : records.length === 0 ? (
                <div className="batch-empty">اس بیچ میں کوئی ریکارڈ نہیں</div>
              ) : (
                <div className="batch-table-wrapper">
                  <table className="batch-table">
                    <thead>
                      <tr>
                        <th>داخلہ نمبر</th>
                        <th>طالب علم کا نام</th>
                        <th>شناختی کارڈ</th>
                        <th>اسٹیٹس</th>
                        <th>تبصرے</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="batch-no-results">کوئی نتیجہ نہیں ملا</td>
                        </tr>
                      ) : filteredRecords.map((rec) => (
                        <tr key={rec.id}>
                          <td className="col-index">{rec.registrationNo || '—'}</td>
                          <td className="col-name">{rec.studentName}</td>
                          <td className="col-cnic">{rec.cnic}</td>
                          <td className="col-status">
                            <StatusBadge status={rec.approvalStatus} />
                          </td>
                          <td className="col-comments">
                            {rec.migrationComment || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Processed records without a batch ID */}
        <div className="batch-header" style={{ marginTop: '32px' }}>
          <div>
            <h2 className="batch-title">پروسیس شدہ ریکارڈز (بغیر بیچ)</h2>
            <p className="batch-subtitle">وہ ریکارڈز جن کو API جواب مل چکا ہے لیکن کوئی بیچ ID نہیں</p>
          </div>
        </div>

        <div className="batch-content">
          <div className="batch-info-bar">
            <span>کل ریکارڈز: <strong>{processedRecords.length}</strong></span>
            <div className="batch-search">
              <input
                type="text"
                className="batch-search-input"
                placeholder="نام، شناختی کارڈ، یا داخلہ نمبر سے تلاش کریں..."
                value={processedSearchTerm}
                onChange={(e) => setProcessedSearchTerm(e.target.value)}
              />
              {processedSearchTerm && (
                <button className="batch-search-clear" onClick={() => setProcessedSearchTerm('')}>×</button>
              )}
            </div>
          </div>

          {isLoadingProcessed ? (
            <div className="batch-loading">ریکارڈز لوڈ ہو رہے ہیں...</div>
          ) : processedRecords.length === 0 ? (
            <div className="batch-empty">کوئی پروسیس شدہ ریکارڈ موجود نہیں</div>
          ) : (
            <div className="batch-table-wrapper">
              <table className="batch-table">
                <thead>
                  <tr>
                    <th>داخلہ نمبر</th>
                    <th>طالب علم کا نام</th>
                    <th>شناختی کارڈ</th>
                    <th>اسٹیٹس</th>
                    <th>تبصرے</th>
                    <th>اقدامات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProcessedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="batch-no-results">کوئی نتیجہ نہیں ملا</td>
                    </tr>
                  ) : filteredProcessedRecords.map((rec) => (
                    <tr key={rec.id}>
                      <td className="col-index">{rec.registrationNo || '—'}</td>
                      <td className="col-name">{rec.studentName}</td>
                      <td className="col-cnic">{rec.cnic}</td>
                      <td className="col-status">
                        <StatusBadge status={rec.approvalStatus} />
                      </td>
                      <td className="col-comments">{rec.migrationComment || '—'}</td>
                      <td className="col-actions">
                        <button
                          className="btn-edit"
                          onClick={() => handleEditClick(rec)}
                          title="ترمیم"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          ترمیم
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <EditRecordModal
        isOpen={isEditModalOpen}
        record={recordToEdit}
        isSaving={isSaving}
        onSave={handleEditSave}
        onClose={() => { setIsEditModalOpen(false); setRecordToEdit(null); }}
        onMigrated={() => { if (selectedBatch) fetchBatchRecords(selectedBatch); }}
      />
    </DashboardLayout>
  );
};

export default BatchWiseListPage;

import React, { useState, useEffect } from 'react';
import { FullStudentRecord } from '../types';
import { migrateSingleRecord } from '../services/migrationApi';
import { useToast } from '../context/ToastContext';

interface EditRecordModalProps {
  isOpen: boolean;
  record: FullStudentRecord | null;
  isSaving: boolean;
  onSave: (id: number, data: Partial<FullStudentRecord>) => void;
  onClose: () => void;
  onMigrated?: () => void;
}

type MigrateResult = {
  status: 'admitted' | 'denied' | 'validation_failed' | 'error';
  comment: string;
  batchId?: string;
} | null;

const EditRecordModal: React.FC<EditRecordModalProps> = ({
  isOpen,
  record,
  isSaving,
  onSave,
  onClose,
  onMigrated,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<Partial<FullStudentRecord>>({});
  const [cnicError, setCnicError] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrateResult, setMigrateResult] = useState<MigrateResult>(null);

  useEffect(() => {
    if (record) {
      setMigrateResult(null);
      setFormData({
        studentName: record.studentName,
        fatherName: record.fatherName,
        dob: record.dob ? record.dob.split('T')[0] : '',
        cnic: record.cnic,
        phone: record.phone,
        whatsapp: record.whatsapp,
        fullAddress: record.fullAddress,
        currentAddress: record.currentAddress,
        gender: record.gender,
        department: record.department,
        admissionType: record.admissionType,
        educationType: record.educationType,
        requiredGrade: record.requiredGrade,
        previousEducation: record.previousEducation,
        registrationNo: record.registrationNo,
        lastYearGrade: record.lastYearGrade,
        nextYearGrade: record.nextYearGrade,
        remarks: record.remarks,
        approvalStatus: record.approvalStatus || undefined,
        approvalComments: record.approvalComments || '',
      });
    }
  }, [record]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !record) return null;

  const handleChange = (field: string, value: string) => {
    if (field === 'cnic') {
      // Auto-format: strip non-digits, then insert dashes as XXXXX-XXXXXXX-X
      const digits = value.replace(/\D/g, '').slice(0, 13);
      let formatted = digits;
      if (digits.length > 5) formatted = digits.slice(0, 5) + '-' + digits.slice(5);
      if (digits.length > 12) formatted = digits.slice(0, 5) + '-' + digits.slice(5, 12) + '-' + digits.slice(12);
      setFormData((prev) => ({ ...prev, cnic: formatted }));
      const digitCount = digits.length;
      setCnicError(digitCount > 0 && digitCount < 13 ? 'شناختی کارڈ نمبر 13 ہندسوں کا ہونا چاہیے' : '');
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = (formData.cnic || '').replace(/\D/g, '');
    if (digits.length > 0 && digits.length < 13) {
      setCnicError('شناختی کارڈ نمبر 13 ہندسوں کا ہونا چاہیے');
      return;
    }
    onSave(record.id, formData);
  };

  const handleMigrate = async () => {
    if (!record) return;
    setMigrateResult(null);
    const result = await migrateSingleRecord(record, setIsMigrating);
    setMigrateResult(result);
    if (result.status === 'admitted') {
      showToast('ریکارڈ کامیابی سے منتقل ہو گیا — داخل شدہ', 'success');
      onMigrated?.();
    } else if (result.status === 'denied') {
      showToast('ریکارڈ منتقل ہوا — مسترد', 'warning');
      onMigrated?.();
    } else if (result.status === 'validation_failed') {
      showToast('توثیق ناکام — ریکارڈ منتقل نہیں ہوا', 'error');
    } else {
      showToast(result.comment || 'منتقلی ناکام ہو گئی', 'error');
    }
  };

  const isNewAdmission = formData.admissionType === 'نیا داخلہ';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>ریکارڈ میں ترمیم</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close dialog">×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            {/* Personal Information */}
            <div className="detail-section">
              <h3 className="section-title">ذاتی معلومات</h3>
              <div className="edit-grid">
                <div className="edit-field">
                  <label>طالب علم کا نام</label>
                  <input type="text" value={formData.studentName || ''} onChange={(e) => handleChange('studentName', e.target.value)} />
                </div>
                <div className="edit-field">
                  <label>والد کا نام</label>
                  <input type="text" value={formData.fatherName || ''} onChange={(e) => handleChange('fatherName', e.target.value)} />
                </div>
                <div className="edit-field">
                  <label>تاریخ پیدائش</label>
                  <input type="date" value={formData.dob || ''} onChange={(e) => handleChange('dob', e.target.value)} />
                </div>
                <div className="edit-field">
                  <label>شناختی کارڈ</label>
                  <input type="text" value={formData.cnic || ''} onChange={(e) => handleChange('cnic', e.target.value)} placeholder="XXXXX-XXXXXXX-X" />
                  {cnicError && <span className="field-error">{cnicError}</span>}
                </div>
                <div className="edit-field">
                  <label>فون</label>
                  <input type="text" value={formData.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} />
                </div>
                <div className="edit-field">
                  <label>واٹس ایپ</label>
                  <input type="text" value={formData.whatsapp || ''} onChange={(e) => handleChange('whatsapp', e.target.value)} />
                </div>
                <div className="edit-field full-width">
                  <label>مستقل پتہ</label>
                  <input type="text" value={formData.fullAddress || ''} onChange={(e) => handleChange('fullAddress', e.target.value)} />
                </div>
                <div className="edit-field full-width">
                  <label>موجودہ پتہ</label>
                  <input type="text" value={formData.currentAddress || ''} onChange={(e) => handleChange('currentAddress', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="detail-section">
              <h3 className="section-title">تعلیمی معلومات</h3>
              <div className="edit-grid">
                <div className="edit-field">
                  <label>جنس</label>
                  <select value={formData.gender || ''} onChange={(e) => handleChange('gender', e.target.value)}>
                    <option value="مرد">مرد</option>
                    <option value="عورت">عورت</option>
                  </select>
                </div>
                <div className="edit-field">
                  <label>شعبہ</label>
                  <input type="text" value={formData.department || ''} onChange={(e) => handleChange('department', e.target.value)} />
                </div>
                <div className="edit-field">
                  <label>داخلہ کی قسم</label>
                  <select value={formData.admissionType || ''} onChange={(e) => handleChange('admissionType', e.target.value)}>
                    <option value="نیا داخلہ">نیا داخلہ</option>
                    <option value="پہلے سے زیر تعلیم">پہلے سے زیر تعلیم</option>
                  </select>
                </div>

                {isNewAdmission ? (
                  <>
                    <div className="edit-field">
                      <label>تعلیم کی قسم</label>
                      <input type="text" value={formData.educationType || ''} onChange={(e) => handleChange('educationType', e.target.value)} />
                    </div>
                    <div className="edit-field">
                      <label>مطلوبہ جماعت</label>
                      <input type="text" value={formData.requiredGrade || ''} onChange={(e) => handleChange('requiredGrade', e.target.value)} />
                    </div>
                    <div className="edit-field">
                      <label>سابقہ تعلیم</label>
                      <input type="text" value={formData.previousEducation || ''} onChange={(e) => handleChange('previousEducation', e.target.value)} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="edit-field">
                      <label>داخلہ نمبر</label>
                      <input type="text" value={formData.registrationNo || ''} onChange={(e) => handleChange('registrationNo', e.target.value)} />
                    </div>
                    <div className="edit-field">
                      <label>گزشتہ سال کی جماعت</label>
                      <input type="text" value={formData.lastYearGrade || ''} onChange={(e) => handleChange('lastYearGrade', e.target.value)} />
                    </div>
                    <div className="edit-field">
                      <label>اگلے سال کی جماعت</label>
                      <input type="text" value={formData.nextYearGrade || ''} onChange={(e) => handleChange('nextYearGrade', e.target.value)} />
                    </div>
                  </>
                )}

                <div className="edit-field full-width">
                  <label>ملاحظات</label>
                  <textarea value={formData.remarks || ''} onChange={(e) => handleChange('remarks', e.target.value)} rows={3} />
                </div>
              </div>
            </div>
            {/* Approval & Comments */}
            <div className="detail-section">
              <h3 className="section-title">منظوری کی تفصیلات</h3>
              <div className="edit-grid">
                <div className="edit-field">
                  <label>اسٹیٹس</label>
                  <select
                    className={`approval-dropdown-edit ${formData.approvalStatus || 'pending'}`}
                    value={formData.approvalStatus || 'pending'}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleChange('approvalStatus', value === 'pending' ? '' : value);
                    }}
                  >
                    <option value="pending">زیر التواء</option>
                    <option value="approved">منظور شدہ</option>
                    <option value="disapproved">مسترد</option>
                  </select>
                </div>
                <div className="edit-field full-width">
                  <label>تبصرے (منظوری / عدم منظوری کی وجہ)</label>
                  <textarea
                    value={formData.approvalComments || ''}
                    onChange={(e) => handleChange('approvalComments', e.target.value)}
                    rows={4}
                    placeholder="منظوری یا عدم منظوری کی وجہ یہاں لکھیں..."
                  />
                </div>
                {record.migrationComment && (
                  <div className="edit-field full-width">
                    <label>جامعہ API کا جواب</label>
                    <textarea
                      value={record.migrationComment}
                      readOnly
                      rows={2}
                      className="migration-comment-readonly"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Single-record migration result */}
            {migrateResult && (
              <div className="detail-section">
                <h3 className="section-title">منتقلی کا نتیجہ</h3>
                <div className={`single-migrate-result single-migrate-${migrateResult.status}`}>
                  <div className="single-migrate-row">
                    <span className="single-migrate-status-label">
                      {migrateResult.status === 'admitted' && '✓ داخل شدہ'}
                      {migrateResult.status === 'denied' && '✕ مسترد'}
                      {migrateResult.status === 'validation_failed' && '⚠ توثیق ناکام'}
                      {migrateResult.status === 'error' && '✕ خرابی'}
                    </span>
                    {migrateResult.batchId && (
                      <span className="single-migrate-batch" dir="ltr">
                        بیچ: {migrateResult.batchId}
                      </span>
                    )}
                  </div>
                  {migrateResult.comment && (
                    <p className="single-migrate-comment" dir="ltr">{migrateResult.comment}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving || isMigrating}>منسوخ</button>
            {record.approvalStatus === 'approved' && !record.migrationBatchId && (
              <button
                type="button"
                className="btn btn-migrate"
                onClick={handleMigrate}
                disabled={isSaving || isMigrating}
              >
                {isMigrating ? (
                  <><span className="btn-spinner-sm" /> منتقل ہو رہا ہے...</>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                      <path d="M12 5v14M5 12l7-7 7 7" />
                    </svg>
                    منتقل کریں
                  </>
                )}
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={isSaving || isMigrating}>
              {isSaving ? 'محفوظ ہو رہا ہے...' : 'محفوظ کریں'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRecordModal;

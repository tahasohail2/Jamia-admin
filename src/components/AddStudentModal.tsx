import React, { useState } from 'react';
import { FullStudentRecord } from '../types';

export type AddStudentFormData = Omit<
  Partial<FullStudentRecord>,
  'id' | 'submittedAt' | 'approvedAt' | 'migrationBatchId' | 'migratedAt' | 'migrationComment'
>;

interface AddStudentModalProps {
  isOpen: boolean;
  sessionYear: number | null;
  isSaving: boolean;
  onSave: (data: AddStudentFormData, sessionYear: number) => void;
  onClose: () => void;
}

const EMPTY_FORM: AddStudentFormData = {
  studentName: '',
  fatherName: '',
  dob: '',
  cnic: '',
  phone: '',
  whatsapp: '',
  fullAddress: '',
  currentAddress: '',
  gender: 'مرد',
  department: '',
  admissionType: 'نیا داخلہ',
  educationType: '',
  requiredGrade: '',
  previousEducation: '',
  registrationNo: '',
  lastYearGrade: '',
  nextYearGrade: '',
  remarks: '',
  approvalStatus: undefined,
  approvalComments: '',
};

const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  sessionYear,
  isSaving,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<AddStudentFormData>(EMPTY_FORM);
  const [cnicError, setCnicError] = useState('');

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setCnicError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen || sessionYear === null) return null;

  const handleChange = (field: string, value: string) => {
    if (field === 'cnic') {
      const digits = value.replace(/\D/g, '').slice(0, 13);
      let formatted = digits;
      if (digits.length > 5) formatted = digits.slice(0, 5) + '-' + digits.slice(5);
      if (digits.length > 12) formatted = digits.slice(0, 5) + '-' + digits.slice(5, 12) + '-' + digits.slice(12);
      setFormData((prev) => ({ ...prev, cnic: formatted }));
      setCnicError(digits.length > 0 && digits.length < 13 ? 'شناختی کارڈ نمبر 13 ہندسوں کا ہونا چاہیے' : '');
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
    onSave(formData, sessionYear);
    resetForm();
  };

  const isNewAdmission = formData.admissionType === 'نیا داخلہ';

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>نیا طالب علم شامل کریں — سیشن {sessionYear}</h2>
          <button className="modal-close" onClick={handleClose} aria-label="Close dialog">×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            {/* Personal Information */}
            <div className="detail-section">
              <h3 className="section-title">ذاتی معلومات</h3>
              <div className="edit-grid">
                <div className="edit-field">
                  <label>طالب علم کا نام <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    value={formData.studentName || ''}
                    onChange={(e) => handleChange('studentName', e.target.value)}
                    required
                  />
                </div>
                <div className="edit-field">
                  <label>والد کا نام <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    value={formData.fatherName || ''}
                    onChange={(e) => handleChange('fatherName', e.target.value)}
                    required
                  />
                </div>
                <div className="edit-field">
                  <label>تاریخ پیدائش</label>
                  <input
                    type="date"
                    value={formData.dob || ''}
                    onChange={(e) => handleChange('dob', e.target.value)}
                  />
                </div>
                <div className="edit-field">
                  <label>شناختی کارڈ</label>
                  <input
                    type="text"
                    value={formData.cnic || ''}
                    onChange={(e) => handleChange('cnic', e.target.value)}
                    placeholder="XXXXX-XXXXXXX-X"
                  />
                  {cnicError && <span className="field-error">{cnicError}</span>}
                </div>
                <div className="edit-field">
                  <label>فون</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
                <div className="edit-field">
                  <label>واٹس ایپ</label>
                  <input
                    type="text"
                    value={formData.whatsapp || ''}
                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                  />
                </div>
                <div className="edit-field full-width">
                  <label>مستقل پتہ</label>
                  <input
                    type="text"
                    value={formData.fullAddress || ''}
                    onChange={(e) => handleChange('fullAddress', e.target.value)}
                  />
                </div>
                <div className="edit-field full-width">
                  <label>موجودہ پتہ</label>
                  <input
                    type="text"
                    value={formData.currentAddress || ''}
                    onChange={(e) => handleChange('currentAddress', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="detail-section">
              <h3 className="section-title">تعلیمی معلومات</h3>
              <div className="edit-grid">
                <div className="edit-field">
                  <label>جنس</label>
                  <select value={formData.gender || 'مرد'} onChange={(e) => handleChange('gender', e.target.value)}>
                    <option value="مرد">مرد</option>
                    <option value="عورت">عورت</option>
                  </select>
                </div>
                <div className="edit-field">
                  <label>شعبہ</label>
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => handleChange('department', e.target.value)}
                  />
                </div>
                <div className="edit-field">
                  <label>داخلہ کی قسم</label>
                  <select value={formData.admissionType || 'نیا داخلہ'} onChange={(e) => handleChange('admissionType', e.target.value)}>
                    <option value="نیا داخلہ">نیا داخلہ</option>
                    <option value="پہلے سے زیر تعلیم">پہلے سے زیر تعلیم</option>
                  </select>
                </div>

                {isNewAdmission ? (
                  <>
                    <div className="edit-field">
                      <label>تعلیم کی قسم</label>
                      <input
                        type="text"
                        value={formData.educationType || ''}
                        onChange={(e) => handleChange('educationType', e.target.value)}
                      />
                    </div>
                    <div className="edit-field">
                      <label>مطلوبہ جماعت</label>
                      <input
                        type="text"
                        value={formData.requiredGrade || ''}
                        onChange={(e) => handleChange('requiredGrade', e.target.value)}
                      />
                    </div>
                    <div className="edit-field">
                      <label>سابقہ تعلیم</label>
                      <input
                        type="text"
                        value={formData.previousEducation || ''}
                        onChange={(e) => handleChange('previousEducation', e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="edit-field">
                      <label>داخلہ نمبر</label>
                      <input
                        type="text"
                        value={formData.registrationNo || ''}
                        onChange={(e) => handleChange('registrationNo', e.target.value)}
                      />
                    </div>
                    <div className="edit-field">
                      <label>گزشتہ سال کی جماعت</label>
                      <input
                        type="text"
                        value={formData.lastYearGrade || ''}
                        onChange={(e) => handleChange('lastYearGrade', e.target.value)}
                      />
                    </div>
                    <div className="edit-field">
                      <label>اگلے سال کی جماعت</label>
                      <input
                        type="text"
                        value={formData.nextYearGrade || ''}
                        onChange={(e) => handleChange('nextYearGrade', e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="edit-field full-width">
                  <label>ملاحظات</label>
                  <textarea
                    value={formData.remarks || ''}
                    onChange={(e) => handleChange('remarks', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Approval */}
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
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={isSaving}>
              منسوخ
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'محفوظ ہو رہا ہے...' : 'شامل کریں'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;

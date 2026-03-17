import React from 'react';
import { FullStudentRecord } from '../types';

interface RecordDetailModalProps {
  isOpen: boolean;
  record: FullStudentRecord | null;
  onClose: () => void;
}

const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  isOpen,
  record,
  onClose,
}) => {
  if (!isOpen || !record) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>طالب علم کے ریکارڈ کی تفصیل</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Metadata Section */}
          <div className="detail-section">
            <h3 className="section-title">ریکارڈ کی معلومات</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">ریکارڈ آئی ڈی:</span>
                <span className="detail-value">{record.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">جمع کرانے کا وقت:</span>
                <span className="detail-value">{formatDateTime(record.submittedAt)}</span>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="detail-section">
            <h3 className="section-title">ذاتی معلومات</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">طالب علم کا نام:</span>
                <span className="detail-value">{record.studentName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">والد کا نام:</span>
                <span className="detail-value">{record.fatherName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">تاریخ پیدائش:</span>
                <span className="detail-value">{formatDate(record.dob)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">شناختی کارڈ:</span>
                <span className="detail-value">{record.cnic}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">فون:</span>
                <span className="detail-value">{record.phone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">واٹس ایپ:</span>
                <span className="detail-value">{record.whatsapp || 'غیر متعین'}</span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">مستقل پتہ:</span>
                <span className="detail-value">{record.fullAddress}</span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">موجودہ پتہ:</span>
                <span className="detail-value">{record.currentAddress}</span>
              </div>
            </div>
          </div>

          {/* Academic Information Section */}
          <div className="detail-section">
            <h3 className="section-title">تعلیمی معلومات</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">داخلہ کی قسم:</span>
                <span className="detail-value">
                  <span className={`badge badge-${record.admissionType === 'نیا داخلہ' ? 'new' : 'existing'}`}>
                    {record.admissionType === 'نیا داخلہ' ? 'نیا داخلہ' : 'پہلے سے زیر تعلیم'}
                  </span>
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">جنس:</span>
                <span className="detail-value">{record.gender}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">شعبہ:</span>
                <span className="detail-value">{record.department}</span>
              </div>

              {record.admissionType === 'نیا داخلہ' ? (
                <>
                  <div className="detail-item">
                    <span className="detail-label">تعلیم کی قسم:</span>
                    <span className="detail-value">{record.educationType || 'غیر متعین'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">مطلوبہ جماعت:</span>
                    <span className="detail-value">{record.requiredGrade || 'غیر متعین'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">سابقہ تعلیم:</span>
                    <span className="detail-value">{record.previousEducation || 'غیر متعین'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="detail-item">
                    <span className="detail-label">رجسٹریشن نمبر:</span>
                    <span className="detail-value">{record.registrationNo || 'غیر متعین'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">گزشتہ سال کی جماعت:</span>
                    <span className="detail-value">{record.lastYearGrade || 'غیر متعین'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">اگلے سال کی جماعت:</span>
                    <span className="detail-value">{record.nextYearGrade || 'غیر متعین'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">امتحان حصہ اول نمبر:</span>
                    <span className="detail-value">{record.examPart1Marks || 'غیر متعین'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">امتحان حصہ دوم نمبر:</span>
                    <span className="detail-value">{record.examPart2Marks || 'غیر متعین'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">کل نمبر:</span>
                    <span className="detail-value">{record.totalMarks || 'غیر متعین'}</span>
                  </div>
                </>
              )}

              {record.remarks && (
                <div className="detail-item full-width">
                  <span className="detail-label">ملاحظات:</span>
                  <span className="detail-value">{record.remarks}</span>
                </div>
              )}
            </div>
          </div>

          {/* Documents Section */}
          <div className="detail-section">
            <h3 className="section-title">دستاویزات</h3>
            <div className="documents-grid">
              {record.certificateUrls && record.certificateUrls.length > 0 && (
                <div className="document-group">
                  <h4>سرٹیفکیٹس</h4>
                  <ul className="document-list">
                    {record.certificateUrls.map((url, index) => (
                      <li key={index}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          📄 سرٹیفکیٹ {index + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {record.cnicUrls && record.cnicUrls.length > 0 && (
                <div className="document-group">
                  <h4>شناختی کارڈ دستاویزات</h4>
                  <ul className="document-list">
                    {record.cnicUrls.map((url, index) => (
                      <li key={index}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          📄 شناختی کارڈ {index + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {record.additionalUrls && record.additionalUrls.length > 0 && (
                <div className="document-group">
                  <h4>اضافی دستاویزات</h4>
                  <ul className="document-list">
                    {record.additionalUrls.map((url, index) => (
                      <li key={index}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          📄 اضافی دستاویز {index + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(!record.certificateUrls || record.certificateUrls.length === 0) &&
               (!record.cnicUrls || record.cnicUrls.length === 0) &&
               (!record.additionalUrls || record.additionalUrls.length === 0) && (
                <p className="no-documents">کوئی دستاویز اپلوڈ نہیں کی گئی</p>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            بند کریں
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordDetailModal;

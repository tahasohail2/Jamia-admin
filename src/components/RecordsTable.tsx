import React from 'react';
import { StudentRecord } from '../types';

interface RecordsTableProps {
  records: StudentRecord[];
  isLoading: boolean;
  currentPage?: number;
  pageSize?: number;
  onRecordClick: (record: StudentRecord) => void;
  onEditClick: (record: StudentRecord) => void;
  onDeleteClick: (record: StudentRecord) => void;
  onStatusChange: (record: StudentRecord, status: 'approved' | 'disapproved' | 'pending' | null) => void;
}

const RecordsTable: React.FC<RecordsTableProps> = ({
  records,
  isLoading,
  currentPage = 1,
  pageSize = 20,
  onRecordClick,
  onEditClick,
  onDeleteClick,
  onStatusChange,
}) => {
  const startIndex = (currentPage - 1) * pageSize;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `(${hours}:${minutes}) ${year}/${month}/${day}`;
  };

  if (isLoading) {
    return (
      <div className="table-loading">
        <div className="spinner"></div>
        <p>ریکارڈز لوڈ ہو رہے ہیں...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="table-empty">
        <p>کوئی ریکارڈ نہیں ملا</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="records-table">
        <thead>
          <tr>
            <th>#</th>
            <th>داخلہ نمبر</th>
            <th>طالب علم کا نام</th>
            <th>والد کا نام</th>
            <th className="admission-type-col">داخلہ کی قسم</th>
            <th className="gender-col">جنس</th>
            <th className="department-col">شعبہ</th>
            <th className="education-type-col">تعلیم کی قسم</th>
            <th>تاریخ پیدائش</th>
            <th>شناختی کارڈ</th>
            <th>فون</th>
            <th>اسٹیٹس</th>
            <th>منظوری کا وقت</th>
            <th>تصویر</th>
            <th>جمع کرانے کا وقت</th>
            <th>منتقلی</th>
            <th>اقدامات</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr
              key={record.id}
              className="table-row"
              onClick={() => onRecordClick(record)}
              style={{ cursor: 'pointer' }}
            >
              <td style={{ textAlign: 'center', color: '#888', fontSize: 13 }}>{startIndex + index + 1}</td>
              <td>{record.registrationNo || 'غیر متعین'}</td>
              <td>{record.studentName}</td>
              <td>{record.fatherName}</td>
              <td className="admission-type-col">
                <span className={`badge badge-${record.admissionType === 'نیا داخلہ' ? 'new' : 'existing'}`}>
                  {record.admissionType === 'نیا داخلہ' ? 'نیا' : 'پرانا'}
                </span>
              </td>
              <td className="gender-col">{record.gender}</td>
              <td className="department-col">{record.department}</td>
              <td className="education-type-col">{record.educationType || 'غیر متعین'}</td>
              <td>{formatDate(record.dob)}</td>
              <td>{record.cnic}</td>
              <td>{record.phone}</td>
              <td>
                <span className={`badge badge-status-${record.approvalStatus || 'pending'}`}>
                  {record.approvalStatus === 'approved' ? 'منظور شدہ'
                    : record.approvalStatus === 'disapproved' ? 'مسترد'
                    : record.approvalStatus === 'admitted' ? 'داخلہ'
                    : record.approvalStatus === 'denied' ? 'مسترد (جامعہ)'
                    : 'زیر التواء'}
                </span>
              </td>
              <td>
                {record.approvalStatus === 'approved' && record.approvedAt
                  ? formatDateTime(record.approvedAt)
                  : '—'}
              </td>
              <td className="picture-cell">
                {record.additionalUrls && record.additionalUrls.length > 0 ? (
                  <img 
                    src={record.additionalUrls[0]} 
                    alt="Student" 
                    className="student-picture"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(record.additionalUrls![0], '_blank');
                    }}
                  />
                ) : (
                  <span className="no-picture">-</span>
                )}
              </td>
              <td>{formatDateTime(record.submittedAt)}</td>
              <td>
                {record.migrationBatchId ? (
                  <span className="badge badge-migrated" title={record.migratedAt ? formatDateTime(record.migratedAt) : ''}>
                    {record.migrationBatchId}
                  </span>
                ) : (
                  <span className="badge badge-not-migrated">غیر منتقل</span>
                )}
              </td>
              <td>
                {record.approvalStatus === 'admitted' || record.approvalStatus === 'denied' ? (
                  <span className="badge badge-readonly">صرف مشاہدہ</span>
                ) : (
                <div className="action-buttons">
                  <select
                    className={`approval-dropdown-table ${record.approvalStatus || 'pending'}`}
                    value={record.approvalStatus || 'pending'}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      const val = e.target.value;
                      onStatusChange(record, val === 'pending' ? null : val as 'approved' | 'disapproved');
                    }}
                  >
                    <option value="pending">زیر التواء</option>
                    <option value="approved">منظور شدہ</option>
                    <option value="disapproved">مسترد</option>
                  </select>
                  <button
                    className="btn-edit-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditClick(record);
                    }}
                    aria-label={`Edit record for ${record.studentName}`}
                  >
                    <span className="edit-icon">✏️</span>
                    <span className="edit-text">ترمیم</span>
                  </button>
                  <button
                    className="btn-delete-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClick(record);
                    }}
                    aria-label={`Delete record for ${record.studentName}`}
                  >
                    <span className="delete-icon">🗑️</span>
                    <span className="delete-text">حذف</span>
                  </button>
                </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecordsTable;

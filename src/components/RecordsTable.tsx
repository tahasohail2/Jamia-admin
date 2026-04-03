import React from 'react';
import { StudentRecord } from '../types';

interface RecordsTableProps {
  records: StudentRecord[];
  isLoading: boolean;
  onRecordClick: (record: StudentRecord) => void;
  onEditClick: (record: StudentRecord) => void;
  onDeleteClick: (record: StudentRecord) => void;
}

const RecordsTable: React.FC<RecordsTableProps> = ({
  records,
  isLoading,
  onRecordClick,
  onEditClick,
  onDeleteClick,
}) => {
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
          {records.map((record) => (
            <tr
              key={record.id}
              className="table-row"
              onClick={() => onRecordClick(record)}
              style={{ cursor: 'pointer' }}
            >
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
                  {record.approvalStatus === 'approved' ? 'منظور شدہ' : record.approvalStatus === 'disapproved' ? 'مسترد' : 'زیر التواء'}
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
                <div className="action-buttons">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecordsTable;

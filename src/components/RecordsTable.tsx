import React from 'react';
import { StudentRecord } from '../types';

interface RecordsTableProps {
  records: StudentRecord[];
  isLoading: boolean;
  onRecordClick: (record: StudentRecord) => void;
  onDeleteClick: (record: StudentRecord) => void;
}

const RecordsTable: React.FC<RecordsTableProps> = ({
  records,
  isLoading,
  onRecordClick,
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
            <th>طالب علم کا نام</th>
            <th>والد کا نام</th>
            <th>داخلہ نمبر</th>
            <th>داخلہ کی قسم</th>
            <th>جنس</th>
            <th>شعبہ</th>
            <th>تعلیم کی قسم</th>
            <th>تاریخ پیدائش</th>
            <th>شناختی کارڈ</th>
            <th>فون</th>
            <th>جمع کرانے کا وقت</th>
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
              <td>{record.studentName}</td>
              <td>{record.fatherName}</td>
              <td>{record.registrationNo || 'غیر متعین'}</td>
              <td>
                <span className={`badge badge-${record.admissionType === 'نیا داخلہ' ? 'new' : 'existing'}`}>
                  {record.admissionType === 'نیا داخلہ' ? 'نیا' : 'پرانا'}
                </span>
              </td>
              <td>{record.gender}</td>
              <td>{record.department}</td>
              <td>{record.educationType || 'غیر متعین'}</td>
              <td>{formatDate(record.dob)}</td>
              <td>{record.cnic}</td>
              <td>{record.phone}</td>
              <td>{formatDateTime(record.submittedAt)}</td>
              <td>
                <button
                  className="btn-delete-small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick(record);
                  }}
                  aria-label={`Delete record for ${record.studentName}`}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecordsTable;

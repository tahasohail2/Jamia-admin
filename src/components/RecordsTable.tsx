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
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="table-loading">
        <div className="spinner"></div>
        <p>Loading records...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="table-empty">
        <p>No records found</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="records-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Student Name</th>
            <th>Father Name</th>
            <th>Admission Type</th>
            <th>Gender</th>
            <th>Department</th>
            <th>Education Type</th>
            <th>Date of Birth</th>
            <th>CNIC</th>
            <th>Phone</th>
            <th>Submitted At</th>
            <th>Actions</th>
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
              <td>{record.id}</td>
              <td>{record.studentName}</td>
              <td>{record.fatherName}</td>
              <td>
                <span className={`badge badge-${record.admissionType === 'نیا داخلہ' ? 'new' : 'existing'}`}>
                  {record.admissionType === 'نیا داخلہ' ? 'New' : 'Existing'}
                </span>
              </td>
              <td>{record.gender}</td>
              <td>{record.department}</td>
              <td>{record.educationType || 'N/A'}</td>
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

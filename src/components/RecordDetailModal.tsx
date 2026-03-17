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
          <h2>Student Record Details</h2>
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
            <h3 className="section-title">Record Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Record ID:</span>
                <span className="detail-value">{record.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Submitted At:</span>
                <span className="detail-value">{formatDateTime(record.submittedAt)}</span>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="detail-section">
            <h3 className="section-title">Personal Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Student Name:</span>
                <span className="detail-value">{record.studentName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Father Name:</span>
                <span className="detail-value">{record.fatherName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date of Birth:</span>
                <span className="detail-value">{formatDate(record.dob)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">CNIC:</span>
                <span className="detail-value">{record.cnic}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{record.phone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">WhatsApp:</span>
                <span className="detail-value">{record.whatsapp || 'N/A'}</span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">Full Address:</span>
                <span className="detail-value">{record.fullAddress}</span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">Current Address:</span>
                <span className="detail-value">{record.currentAddress}</span>
              </div>
            </div>
          </div>

          {/* Academic Information Section */}
          <div className="detail-section">
            <h3 className="section-title">Academic Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Admission Type:</span>
                <span className="detail-value">
                  <span className={`badge badge-${record.admissionType === 'نیا داخلہ' ? 'new' : 'existing'}`}>
                    {record.admissionType === 'نیا داخلہ' ? 'New Admission' : 'Existing Student'}
                  </span>
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Gender:</span>
                <span className="detail-value">{record.gender}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Department:</span>
                <span className="detail-value">{record.department}</span>
              </div>

              {record.admissionType === 'نیا داخلہ' ? (
                <>
                  <div className="detail-item">
                    <span className="detail-label">Education Type:</span>
                    <span className="detail-value">{record.educationType || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Required Grade:</span>
                    <span className="detail-value">{record.requiredGrade || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Previous Education:</span>
                    <span className="detail-value">{record.previousEducation || 'N/A'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="detail-item">
                    <span className="detail-label">Registration No:</span>
                    <span className="detail-value">{record.registrationNo || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Year Grade:</span>
                    <span className="detail-value">{record.lastYearGrade || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Next Year Grade:</span>
                    <span className="detail-value">{record.nextYearGrade || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Exam Part 1 Marks:</span>
                    <span className="detail-value">{record.examPart1Marks || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Exam Part 2 Marks:</span>
                    <span className="detail-value">{record.examPart2Marks || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Marks:</span>
                    <span className="detail-value">{record.totalMarks || 'N/A'}</span>
                  </div>
                </>
              )}

              {record.remarks && (
                <div className="detail-item full-width">
                  <span className="detail-label">Remarks:</span>
                  <span className="detail-value">{record.remarks}</span>
                </div>
              )}
            </div>
          </div>

          {/* Documents Section */}
          <div className="detail-section">
            <h3 className="section-title">Documents</h3>
            <div className="documents-grid">
              {record.certificateUrls && record.certificateUrls.length > 0 && (
                <div className="document-group">
                  <h4>Certificates</h4>
                  <ul className="document-list">
                    {record.certificateUrls.map((url, index) => (
                      <li key={index}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          📄 Certificate {index + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {record.cnicUrls && record.cnicUrls.length > 0 && (
                <div className="document-group">
                  <h4>CNIC Documents</h4>
                  <ul className="document-list">
                    {record.cnicUrls.map((url, index) => (
                      <li key={index}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          📄 CNIC Document {index + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {record.additionalUrls && record.additionalUrls.length > 0 && (
                <div className="document-group">
                  <h4>Additional Documents</h4>
                  <ul className="document-list">
                    {record.additionalUrls.map((url, index) => (
                      <li key={index}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          📄 Additional Document {index + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(!record.certificateUrls || record.certificateUrls.length === 0) &&
               (!record.cnicUrls || record.cnicUrls.length === 0) &&
               (!record.additionalUrls || record.additionalUrls.length === 0) && (
                <p className="no-documents">No documents uploaded</p>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordDetailModal;

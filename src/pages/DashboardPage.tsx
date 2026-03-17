import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRecords } from '../hooks/useRecords';
import { useToast } from '../context/ToastContext';
import { adminApi } from '../services/adminApi';
import { StudentRecord, FullStudentRecord } from '../types';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ExportButton from '../components/ExportButton';
import RecordsTable from '../components/RecordsTable';
import Pagination from '../components/Pagination';
import RecordDetailModal from '../components/RecordDetailModal';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const {
    records,
    isLoading,
    error,
    filters,
    currentPage,
    totalPages,
    totalRecords,
    pageSize,
    handleSearch,
    handleFilterChange,
    handlePageChange,
    refresh,
  } = useRecords();

  const [selectedRecord, setSelectedRecord] = useState<FullStudentRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<StudentRecord | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      showToast('Logout failed', 'error');
    }
  };

  // Handle record click to view details
  const handleRecordClick = async (record: StudentRecord) => {
    try {
      const fullRecord = await adminApi.getRecordById(record.id);
      setSelectedRecord(fullRecord);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch record details:', error);
      showToast('Failed to load record details', 'error');
    }
  };

  // Handle delete button click
  const handleDeleteClick = (record: StudentRecord) => {
    setRecordToDelete(record);
    setIsDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;

    try {
      setIsDeleting(true);
      await adminApi.deleteRecord(recordToDelete.id);
      
      showToast(`Record for ${recordToDelete.studentName} deleted successfully`, 'success');
      setIsDeleteDialogOpen(false);
      setRecordToDelete(null);
      
      // Refresh the records list
      refresh();
    } catch (error) {
      console.error('Failed to delete record:', error);
      showToast('Failed to delete record', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  // Handle detail modal close
  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedRecord(null);
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Admin Dashboard</h1>
            <p className="header-subtitle">Student Admission Records</p>
          </div>
          <div className="header-center">
            <img src="/logoHeader.png" alt="Logo" className="header-logo" />
          </div>
          <div className="header-right">
            <span className="user-info">Welcome, {user?.username}</span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Controls Section */}
          <div className="dashboard-controls">
            <div className="controls-row">
              <SearchBar onSearch={handleSearch} />
              <ExportButton filters={filters} />
            </div>
            <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-banner">
              <p>{error}</p>
              <button className="btn btn-primary" onClick={refresh}>
                Retry
              </button>
            </div>
          )}

          {/* Records Table */}
          <div className="dashboard-content">
            <RecordsTable
              records={records}
              isLoading={isLoading}
              onRecordClick={handleRecordClick}
              onDeleteClick={handleDeleteClick}
            />
          </div>

          {/* Pagination */}
          {!isLoading && !error && records.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={totalRecords}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <RecordDetailModal
        isOpen={isDetailModalOpen}
        record={selectedRecord}
        onClose={handleDetailModalClose}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        studentName={recordToDelete?.studentName || ''}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default DashboardPage;

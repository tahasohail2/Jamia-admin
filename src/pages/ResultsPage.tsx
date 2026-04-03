import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useRecords } from '../hooks/useRecords';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../services/adminApi';
import { StudentRecord, FullStudentRecord } from '../types';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ExportButton from '../components/ExportButton';
import MigrateButton from '../components/MigrateButton';
import RecordsTable from '../components/RecordsTable';
import Pagination from '../components/Pagination';
import RecordDetailModal from '../components/RecordDetailModal';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import EditRecordModal from '../components/EditRecordModal';
import '../styles/ResultsPage.css';

const ResultsPage: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
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
  const [recordToEdit, setRecordToEdit] = useState<FullStudentRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Handle record click to view details
  const handleRecordClick = async (record: StudentRecord) => {
    try {
      const fullRecord = await adminApi.getRecordById(record.id);
      setSelectedRecord(fullRecord);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch record details:', error);
      showToast('ریکارڈ کی تفصیل لوڈ نہیں ہو سکی', 'error');
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
      
      showToast(`${recordToDelete.studentName} کا ریکارڈ کامیابی سے حذف ہو گیا`, 'success');
      setIsDeleteDialogOpen(false);
      setRecordToDelete(null);
      
      // Refresh the records list
      refresh();
    } catch (error) {
      console.error('Failed to delete record:', error);
      showToast('ریکارڈ حذف نہیں ہو سکا', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  // Handle edit button click
  const handleEditClick = async (record: StudentRecord) => {
    try {
      const fullRecord = await adminApi.getRecordById(record.id);
      setRecordToEdit(fullRecord);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch record for editing:', error);
      showToast('ریکارڈ لوڈ نہیں ہو سکا', 'error');
    }
  };

  // Handle edit save
  const handleEditSave = async (id: number, data: Partial<FullStudentRecord>) => {
    try {
      setIsSaving(true);
      await adminApi.updateRecord(id, data);
      showToast('ریکارڈ کامیابی سے اپ ڈیٹ ہو گیا', 'success');
      setIsEditModalOpen(false);
      setRecordToEdit(null);
      refresh();
    } catch (error) {
      console.error('Failed to update record:', error);
      showToast('ریکارڈ اپ ڈیٹ نہیں ہو سکا', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edit modal close
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setRecordToEdit(null);
  };

  // Handle approval status change (supports approved, disapproved, or null to reset)
  const handleApprovalChange = async (recordId: number, status: 'approved' | 'disapproved' | 'pending' | null) => {
    try {
      await adminApi.updateApprovalStatus(recordId, status);
      showToast(
        status === 'approved' ? 'ریکارڈ منظور ہو گیا' : 
        status === 'disapproved' ? 'ریکارڈ مسترد ہو گیا' : 
        'اسٹیٹس ری سیٹ ہو گیا',
        'success'
      );
      // Refresh the records list to show updated status
      refresh();
    } catch (error) {
      console.error('Failed to update approval status:', error);
      showToast('اسٹیٹس اپ ڈیٹ نہیں ہو سکا', 'error');
    }
  };

  // Handle detail modal close
  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedRecord(null);
  };

  return (
    <DashboardLayout>
      <div className="results-page">
        <div className="results-header">
          <div>
            <h2 className="results-title">نتائج</h2>
            <p className="results-subtitle">تمام داخلہ ریکارڈز</p>
          </div>
        </div>

        {/* Controls Section */}
        <div className="results-controls">
          <div className="controls-row">
            <SearchBar onSearch={handleSearch} />
            <div className="controls-buttons">
              <ExportButton filters={filters} />
              {user?.isSuperAdmin && <MigrateButton />}
            </div>
          </div>
          <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={refresh}>
              دوبارہ کوشش کریں
            </button>
          </div>
        )}

        {/* Records Table */}
        <div className="results-content">
          <RecordsTable
            records={records}
            isLoading={isLoading}
            onRecordClick={handleRecordClick}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onApprovalChange={handleApprovalChange}
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

      <EditRecordModal
        isOpen={isEditModalOpen}
        record={recordToEdit}
        isSaving={isSaving}
        onSave={handleEditSave}
        onClose={handleEditModalClose}
      />
    </DashboardLayout>
  );
};

export default ResultsPage;

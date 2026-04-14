import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import SessionSelectModal from '../components/SessionSelectModal';
import AddStudentModal from '../components/AddStudentModal';
import { useToast } from '../context/ToastContext';
import { adminApi } from '../services/adminApi';
import type { AddStudentFormData } from '../components/AddStudentModal';
import '../styles/AddStudentPage.css';

const AddStudentPage: React.FC = () => {
  const { showToast } = useToast();

  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenSessionModal = () => {
    setSelectedYear(null);
    setSessionModalOpen(true);
  };

  const handleSessionConfirm = () => {
    if (!selectedYear) return;
    setSessionModalOpen(false);
    setStudentModalOpen(true);
  };

  const handleSessionClose = () => {
    setSessionModalOpen(false);
  };

  const handleStudentClose = () => {
    setStudentModalOpen(false);
  };

  const handleSave = async (data: AddStudentFormData, sessionYear: number) => {
    setIsSaving(true);
    try {
      await adminApi.createStudent({ ...data, sessionYear });
      showToast('طالب علم کامیابی سے شامل کر دیا گیا', 'success');
      setStudentModalOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'طالب علم شامل کرنے میں ناکامی';
      showToast(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="add-student-page">
        <div className="add-student-header">
          <h1 className="add-student-title">طالب علم شامل کریں</h1>
          <p className="add-student-subtitle">نئے طالب علم کا اندراج کریں</p>
        </div>

        <div className="add-student-cta">
          <button className="add-student-btn" onClick={handleOpenSessionModal}>
            <span className="add-student-btn-icon">+</span>
            <span>طالب علم شامل کریں</span>
          </button>
        </div>
      </div>

      <SessionSelectModal
        isOpen={sessionModalOpen}
        selectedYear={selectedYear}
        onSelect={setSelectedYear}
        onConfirm={handleSessionConfirm}
        onClose={handleSessionClose}
      />

      <AddStudentModal
        isOpen={studentModalOpen}
        sessionYear={selectedYear}
        isSaving={isSaving}
        onSave={handleSave}
        onClose={handleStudentClose}
      />
    </DashboardLayout>
  );
};

export default AddStudentPage;

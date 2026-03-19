import React, { useState } from 'react';
import { adminApi } from '../services/adminApi';
import { RecordFilters } from '../types';
import { useToast } from '../context/ToastContext';

interface ExportButtonProps {
  filters: RecordFilters;
}

const ExportButton: React.FC<ExportButtonProps> = ({ filters }) => {
  const [isExporting, setIsExporting] = useState(false);
  const { showToast } = useToast();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      showToast('ایکسپورٹ تیار ہو رہا ہے...', 'info');

      const csvData = await adminApi.exportRecords(filters);

      // Create blob with UTF-8 BOM so spreadsheet apps correctly read Urdu text
      const blob = new Blob(['\uFEFF', csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `student-records-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      showToast('ریکارڈز کامیابی سے ایکسپورٹ ہو گئے', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('ریکارڈز ایکسپورٹ نہیں ہو سکے', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      className="btn btn-export"
      onClick={handleExport}
      disabled={isExporting}
      aria-label="Export records to CSV"
    >
      {isExporting ? (
        <>
          <span className="spinner-small"></span>
          ایکسپورٹ ہو رہا ہے...
        </>
      ) : (
        <>
          📥 CSV ایکسپورٹ
        </>
      )}
    </button>
  );
};

export default ExportButton;

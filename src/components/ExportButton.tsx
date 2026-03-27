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

      // Process CSV to clean up date format and remove unwanted columns
      const lines = csvData.split('\n');
      const processedLines: string[] = [];
      
      let columnsToRemove: number[] = [];
      
      lines.forEach((line, index) => {
        if (!line.trim()) return; // Skip empty lines
        
        // Parse CSV line (handle quoted values)
        const columns: string[] = [];
        let currentColumn = '';
        let insideQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            insideQuotes = !insideQuotes;
            currentColumn += char;
          } else if (char === ',' && !insideQuotes) {
            columns.push(currentColumn);
            currentColumn = '';
          } else {
            currentColumn += char;
          }
        }
        columns.push(currentColumn); // Add last column
        
        // Process header row to find columns to remove
        if (index === 0) {
          columnsToRemove = [];
          columns.forEach((col, idx) => {
            const cleanCol = col.replace(/"/g, '').toLowerCase();
            if (cleanCol === 'exampart1marks' || cleanCol === 'exampart2marks' || cleanCol === 'totalmarks') {
              columnsToRemove.push(idx);
            }
          });
        }
        
        // Filter out unwanted columns
        const filteredColumns = columns.filter((_, idx) => !columnsToRemove.includes(idx));
        
        // Clean up date format in remaining columns (only for data rows)
        if (index > 0) {
          const cleanedColumns = filteredColumns.map(col => 
            col.replace(/GMT\+\d{4} \(Coordinated Universal Time\)/g, '')
          );
          processedLines.push(cleanedColumns.join(','));
        } else {
          processedLines.push(filteredColumns.join(','));
        }
      });
      
      const cleanedCsvData = processedLines.join('\n');

      // Create blob with UTF-8 BOM so spreadsheet apps correctly read Urdu text
      const blob = new Blob(['\uFEFF', cleanedCsvData], { type: 'text/csv;charset=utf-8;' });
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

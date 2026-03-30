import React, { useState } from 'react';
import * as XLSX from 'xlsx';
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
      const processedData: string[][] = [];
      
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
          } else if (char === ',' && !insideQuotes) {
            columns.push(currentColumn.replace(/^"|"$/g, '')); // Remove surrounding quotes
            currentColumn = '';
          } else {
            currentColumn += char;
          }
        }
        columns.push(currentColumn.replace(/^"|"$/g, '')); // Add last column
        
        // Process header row to find columns to remove
        if (index === 0) {
          columnsToRemove = [];
          columns.forEach((col, idx) => {
            const cleanCol = col.toLowerCase();
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
            col.replace(/GMT\+\d{4} \(Coordinated Universal Time\)/g, '').trim()
          );
          processedData.push(cleanedColumns);
        } else {
          processedData.push(filteredColumns);
        }
      });

      // Create workbook and worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(processedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Records');

      // Generate Excel file and download
      XLSX.writeFile(workbook, `student-records-${new Date().toISOString().split('T')[0]}.xlsx`);

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
      aria-label="Export records to Excel"
    >
      {isExporting ? (
        <>
          <span className="spinner-small"></span>
          ایکسپورٹ ہو رہا ہے...
        </>
      ) : (
        <>
          📥 Excel ایکسپورٹ
        </>
      )}
    </button>
  );
};

export default ExportButton;

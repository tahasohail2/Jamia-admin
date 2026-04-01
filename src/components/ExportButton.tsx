import React, { useState } from 'react';
import * as XLSX from 'xlsx-js-style';
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
      let dobColumnIndex = -1; // Track date of birth column index
      
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
        
        // Process header row to find columns to remove and DOB column
        if (index === 0) {
          columnsToRemove = [];
          columns.forEach((col, idx) => {
            const cleanCol = col.toLowerCase();
            if (cleanCol === 'exampart1marks' || cleanCol === 'exampart2marks' || cleanCol === 'totalmarks') {
              columnsToRemove.push(idx);
            }
            // Find date of birth column
            if (col === 'تاریخ پیدائش') {
              dobColumnIndex = idx;
            }
          });
        }
        
        // Filter out unwanted columns
        const filteredColumns = columns.filter((_, idx) => !columnsToRemove.includes(idx));
        
        // Adjust DOB column index after filtering
        if (index === 0 && dobColumnIndex !== -1) {
          const removedBeforeDob = columnsToRemove.filter(idx => idx < dobColumnIndex).length;
          dobColumnIndex = dobColumnIndex - removedBeforeDob;
        }
        
        // Clean up date format in remaining columns (only for data rows)
        if (index > 0) {
          const cleanedColumns = filteredColumns.map((col, colIdx) => {
            // Check if this is the date of birth column
            if (colIdx === dobColumnIndex) {
              // Parse the date and format as YYYY/MM/DD
              const dateMatch = col.match(/\w{3}\s+(\w{3})\s+(\d{1,2})\s+(\d{4})/);
              if (dateMatch) {
                const monthNames: { [key: string]: string } = {
                  'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
                  'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
                  'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
                };
                const month = monthNames[dateMatch[1]] || '01';
                const day = dateMatch[2].padStart(2, '0');
                const year = dateMatch[3];
                return `${year}/${month}/${day}`;
              }
            }
            return col.replace(/GMT\+\d{4} \(Coordinated Universal Time\)/g, '').trim();
          });
          processedData.push(cleanedColumns);
        } else {
          processedData.push(filteredColumns);
        }
      });

      // Create workbook and worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(processedData);
      
      // Set column widths
      const colWidths = processedData[0].map(() => ({ wch: 20 }));
      worksheet['!cols'] = colWidths;

      // Apply styling to header row (first row)
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellAddress]) continue;
        
        // Apply yellow background and larger font to headers
        worksheet[cellAddress].s = {
          fill: {
            fgColor: { rgb: 'FFFF00' } // Yellow background
          },
          font: {
            sz: 14, // Font size 14
            bold: true
          },
          alignment: {
            horizontal: 'center',
            vertical: 'center'
          }
        };
      }

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

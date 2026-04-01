import * as XLSX from 'xlsx-js-style';
import type { StudentRecord } from '../types';

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  // Get the date string and remove everything from " GMT" onwards
  const fullDateStr = date.toString();
  const cleanDate = fullDateStr.split(' GMT')[0];
  return cleanDate;
}

export function convertToCSV(records: StudentRecord[]): string {
  if (records.length === 0) {
    return '';
  }

  // Define headers in Urdu
  const headers = [
    'داخلہ نمبر',
    'طالب علم کا نام',
    'والد کا نام',
    'داخلہ کی قسم',
    'جنس',
    'شعبہ',
    'تاریخ پیدائش',
    'شناختی کارڈ',
    'فون',
    'جمع کرانے کا وقت',
  ];

  // Create CSV rows
  const rows = records.map((record) => [
    record.registrationNo || 'غیر متعین',
    record.studentName,
    record.fatherName,
    record.admissionType,
    record.gender,
    record.department,
    record.dob,
    record.cnic,
    record.phone,
    `'${formatDateTime(record.submittedAt)}`,
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  return csvContent;
}

export function downloadExcel(records: StudentRecord[], filename: string = 'records.xlsx'): void {
  if (records.length === 0) {
    return;
  }

  // Define headers in Urdu
  const headers = [
    'داخلہ نمبر',
    'طالب علم کا نام',
    'والد کا نام',
    'داخلہ کی قسم',
    'جنس',
    'شعبہ',
    'تاریخ پیدائش',
    'شناختی کارڈ',
    'فون',
    'جمع کرانے کا وقت',
  ];

  // Create data rows
  const rows = records.map((record) => [
    record.registrationNo || 'غیر متعین',
    record.studentName,
    record.fatherName,
    record.admissionType,
    record.gender,
    record.department,
    record.dob,
    record.cnic,
    record.phone,
    formatDateTime(record.submittedAt),
  ]);

  // Combine headers and rows
  const data = [headers, ...rows];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  const colWidths = headers.map(() => ({ wch: 20 }));
  ws['!cols'] = colWidths;

  // Apply styling to header row (first row)
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!ws[cellAddress]) continue;
    
    // Apply yellow background and larger font to headers
    ws[cellAddress].s = {
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

  // Create workbook and add worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Records');

  // Write file
  XLSX.writeFile(wb, filename);
}

export function downloadCSV(csvContent: string, filename: string = 'records.csv'): void {
  const blob = new Blob(['\uFEFF', csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

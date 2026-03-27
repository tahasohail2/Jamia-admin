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

  // Define headers
  const headers = [
    'ID',
    'Student Name',
    'Father Name',
    'Admission Type',
    'Gender',
    'Department',
    'Date of Birth',
    'CNIC',
    'Phone',
    'Submitted At',
  ];

  // Create CSV rows
  const rows = records.map((record) => [
    record.id,
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

// Export to CSV
export function exportToCSV(data: any[], filename: string, columns?: string[]) {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Get columns from first item if not provided
  const headers = columns || Object.keys(data[0]);

  // Create CSV header
  const csvHeader = headers.join(',');

  // Create CSV rows
  const csvRows = data.map((item) => {
    return headers
      .map((header) => {
        let value = item[header];

        // Handle nested objects (e.g., employee.firstName)
        if (header.includes('.')) {
          const keys = header.split('.');
          value = keys.reduce((obj, key) => obj?.[key], item);
        }

        // Escape commas and quotes
        if (value === null || value === undefined) {
          return '';
        }

        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
      })
      .join(',');
  });

  // Combine header and rows
  const csv = [csvHeader, ...csvRows].join('\n');

  // Create blob and download
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export to Excel (using CSV format which Excel can open)
export function exportToExcel(data: any[], filename: string, columns?: string[]) {
  exportToCSV(data, filename, columns);
}

// Export table to PDF (basic implementation)
export function exportToPDF(
  data: any[],
  filename: string,
  columns: { key: string; label: string }[]
) {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Create HTML table
  let html = `
    <html>
      <head>
        <meta charset="utf-8">
        <title>${filename}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          h1 {
            text-align: center;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #f3f4f6;
            border: 1px solid #e5e7eb;
            padding: 12px;
            text-align: left;
            font-weight: bold;
          }
          td {
            border: 1px solid #e5e7eb;
            padding: 10px;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
        </style>
      </head>
      <body>
        <h1>${filename}</h1>
        <table>
          <thead>
            <tr>
              ${columns.map((col) => `<th>${col.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (item) => `
              <tr>
                ${columns
                  .map((col) => {
                    let value = item[col.key];

                    // Handle nested objects
                    if (col.key.includes('.')) {
                      const keys = col.key.split('.');
                      value = keys.reduce((obj, key) => obj?.[key], item);
                    }

                    return `<td>${value ?? ''}</td>`;
                  })
                  .join('')}
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  // Open print dialog
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

// Format date for export
export function formatDateForExport(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('tr-TR');
}

// Format datetime for export
export function formatDateTimeForExport(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  return `${d.toLocaleDateString('tr-TR')} ${d.toLocaleTimeString('tr-TR')}`;
}

// Export employees data
export function exportEmployees(employees: any[], format: 'csv' | 'excel' | 'pdf') {
  const columns = [
    { key: 'employeeNumber', label: 'Sicil No' },
    { key: 'firstName', label: 'Ad' },
    { key: 'lastName', label: 'Soyad' },
    { key: 'email', label: 'E-posta' },
    { key: 'phone', label: 'Telefon' },
    { key: 'department.name', label: 'Departman' },
    { key: 'position.title', label: 'Pozisyon' },
    { key: 'status', label: 'Durum' },
    { key: 'hireDate', label: 'İşe Giriş Tarihi' },
  ];

  const formattedData = employees.map((emp) => ({
    ...emp,
    hireDate: formatDateForExport(emp.hireDate),
    'department.name': emp.department?.name || '',
    'position.title': emp.position?.title || '',
  }));

  const filename = `calisanlar_${new Date().toISOString().split('T')[0]}`;

  if (format === 'pdf') {
    exportToPDF(formattedData, filename, columns);
  } else {
    exportToExcel(formattedData, filename, columns.map((c) => c.key));
  }
}

// Export leave requests data
export function exportLeaveRequests(requests: any[], format: 'csv' | 'excel' | 'pdf') {
  const columns = [
    { key: 'employee.firstName', label: 'Ad' },
    { key: 'employee.lastName', label: 'Soyad' },
    { key: 'leaveType.name', label: 'İzin Türü' },
    { key: 'startDate', label: 'Başlangıç' },
    { key: 'endDate', label: 'Bitiş' },
    { key: 'days', label: 'Gün Sayısı' },
    { key: 'status', label: 'Durum' },
    { key: 'createdAt', label: 'Talep Tarihi' },
  ];

  const formattedData = requests.map((req) => ({
    ...req,
    startDate: formatDateForExport(req.startDate),
    endDate: formatDateForExport(req.endDate),
    createdAt: formatDateForExport(req.createdAt),
    'employee.firstName': req.employee?.firstName || '',
    'employee.lastName': req.employee?.lastName || '',
    'leaveType.name': req.leaveType?.name || '',
  }));

  const filename = `izin_talepleri_${new Date().toISOString().split('T')[0]}`;

  if (format === 'pdf') {
    exportToPDF(formattedData, filename, columns);
  } else {
    exportToExcel(formattedData, filename, columns.map((c) => c.key));
  }
}

import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';

interface ExportButtonProps {
  onExport: (format: 'csv' | 'excel' | 'pdf') => void;
  disabled?: boolean;
  formats?: ('csv' | 'excel' | 'pdf')[];
  label?: string;
  className?: string;
}

export default function ExportButton({
  onExport,
  disabled = false,
  formats = ['excel', 'pdf'],
  label = 'Dışa Aktar',
  className = '',
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatLabels = {
    csv: 'CSV',
    excel: 'Excel',
    pdf: 'PDF',
  };

  const formatIcons = {
    csv: FileSpreadsheet,
    excel: FileSpreadsheet,
    pdf: FileText,
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    setIsOpen(false);
    onExport(format);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="btn-secondary inline-flex items-center"
      >
        <Download className="w-4 h-4 mr-2" />
        {label}
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              {formats.map((format) => {
                const Icon = formatIcons[format];
                return (
                  <button
                    key={format}
                    onClick={() => handleExport(format)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Icon className="w-4 h-4 mr-3 text-gray-500" />
                    {formatLabels[format]} olarak indir
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

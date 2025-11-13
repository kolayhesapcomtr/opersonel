import { useState, useEffect } from 'react';
import { LeaveRequest, LeaveType, leaveTypeService } from '../../services/leaveService';
import { Employee, employeeService } from '../../services/employeeService';

interface LeaveRequestFormProps {
  leaveRequest?: LeaveRequest;
  onSubmit: (data: Partial<LeaveRequest>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  currentEmployeeId?: string; // For employee creating their own request
}

export default function LeaveRequestForm({
  leaveRequest,
  onSubmit,
  onCancel,
  isLoading,
  currentEmployeeId,
}: LeaveRequestFormProps) {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [formData, setFormData] = useState({
    employeeId: leaveRequest?.employeeId || currentEmployeeId || '',
    leaveTypeId: leaveRequest?.leaveTypeId || '',
    startDate: leaveRequest?.startDate
      ? new Date(leaveRequest.startDate).toISOString().split('T')[0]
      : '',
    endDate: leaveRequest?.endDate ? new Date(leaveRequest.endDate).toISOString().split('T')[0] : '',
    days: leaveRequest?.days || 1,
    reason: leaveRequest?.reason || '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Calculate days when dates change
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setFormData((prev) => ({ ...prev, days: diffDays }));
    }
  }, [formData.startDate, formData.endDate]);

  const loadData = async () => {
    try {
      const [leaveTypesData, employeesData] = await Promise.all([
        leaveTypeService.getAll(),
        currentEmployeeId ? Promise.resolve([]) : employeeService.getAll(),
      ]);
      setLeaveTypes(leaveTypesData.filter((lt) => lt.isActive));
      if (!currentEmployeeId) {
        setEmployees(employeesData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData: any = {
      ...formData,
      days: Number(formData.days),
    };

    // Remove empty strings
    Object.keys(submitData).forEach((key) => {
      if (submitData[key] === '') {
        delete submitData[key];
      }
    });

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!currentEmployeeId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Çalışan <span className="text-red-500">*</span>
          </label>
          <select
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            required
            className="input"
            disabled={!!leaveRequest}
          >
            <option value="">Seçiniz</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName} ({emp.employeeNumber})
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          İzin Türü <span className="text-red-500">*</span>
        </label>
        <select
          name="leaveTypeId"
          value={formData.leaveTypeId}
          onChange={handleChange}
          required
          className="input"
        >
          <option value="">Seçiniz</option>
          {leaveTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name} ({type.daysPerYear} gün/yıl)
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Başlangıç Tarihi <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="input"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bitiş Tarihi <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
            className="input"
            min={formData.startDate || new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gün Sayısı <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="days"
          value={formData.days}
          onChange={handleChange}
          required
          min="0.5"
          step="0.5"
          className="input"
        />
        <p className="text-xs text-gray-500 mt-1">Yarım gün için 0.5 girin</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          rows={3}
          className="input"
          placeholder="İzin sebebinizi kısaca açıklayın..."
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button type="button" onClick={onCancel} disabled={isLoading} className="btn-secondary">
          İptal
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Kaydediliyor...' : leaveRequest ? 'Güncelle' : 'Talep Oluştur'}
        </button>
      </div>
    </form>
  );
}

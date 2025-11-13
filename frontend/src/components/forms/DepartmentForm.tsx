import { useState, useEffect } from 'react';
import { Department, Employee } from '../../types';
import { departmentService } from '../../services/departmentService';
import { employeeService } from '../../services/employeeService';

interface DepartmentFormProps {
  department?: Department;
  onSubmit: (data: Partial<Department>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function DepartmentForm({ department, onSubmit, onCancel, isLoading }: DepartmentFormProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [formData, setFormData] = useState({
    name: department?.name || '',
    code: department?.code || '',
    description: department?.description || '',
    parentId: department?.parentId || '',
    managerId: department?.managerId || '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [deptData, empData] = await Promise.all([
        departmentService.getAll(),
        employeeService.getAll(),
      ]);

      // Exclude current department from parent options
      const availableDepts = department
        ? deptData.filter(d => d.id !== department.id)
        : deptData;

      setDepartments(availableDepts);
      setEmployees(empData.filter(e => e.status === 'ACTIVE'));
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData: any = { ...formData };

    // Remove empty strings
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '') {
        submitData[key] = undefined;
      }
    });

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Departman Adı <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="input"
          placeholder="Örn: İnsan Kaynakları"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Departman Kodu
        </label>
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
          className="input"
          placeholder="Örn: HR"
          disabled={!!department}
        />
        {department && (
          <p className="text-xs text-gray-500 mt-1">Departman kodu değiştirilemez</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Açıklama
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="input"
          placeholder="Departman hakkında kısa açıklama"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Üst Departman
        </label>
        <select
          name="parentId"
          value={formData.parentId}
          onChange={handleChange}
          className="input"
        >
          <option value="">Yok (Ana Departman)</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Bu departmanın bağlı olduğu üst departman
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Departman Müdürü
        </label>
        <select
          name="managerId"
          value={formData.managerId}
          onChange={handleChange}
          className="input"
        >
          <option value="">Seçiniz</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.firstName} {emp.lastName} ({emp.employeeNumber})
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="btn-secondary"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Kaydediliyor...' : (department ? 'Güncelle' : 'Kaydet')}
        </button>
      </div>
    </form>
  );
}

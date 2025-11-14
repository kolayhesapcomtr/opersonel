import { useState, useEffect } from 'react';
import { User, UserRole, Employee } from '../../types';
import { employeeService } from '../../services/employeeService';

interface UserFormProps {
  user?: User;
  onSubmit: (data: Partial<User>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function UserForm({ user, onSubmit, onCancel, isLoading = false }: UserFormProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    role: user?.role || UserRole.EMPLOYEE,
    employeeId: user?.employeeId || '',
    password: '',
    confirmPassword: '',
    isActive: user?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (err) {
      console.error('Failed to load employees:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'E-posta zorunludur';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    if (!user && !formData.password) {
      newErrors.password = 'Şifre zorunludur';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    if (!formData.role) {
      newErrors.role = 'Rol seçimi zorunludur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const submitData: Partial<User> = {
      email: formData.email,
      role: formData.role,
      employeeId: formData.employeeId || undefined,
      isActive: formData.isActive,
    };

    // Only include password if it's provided
    if (formData.password) {
      (submitData as any).password = formData.password;
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div className="md:col-span-2">
          <label className="label">
            E-posta <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`input ${errors.email ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        {/* Role */}
        <div>
          <label className="label">
            Rol <span className="text-red-500">*</span>
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={`input ${errors.role ? 'border-red-500' : ''}`}
            disabled={isLoading}
          >
            <option value={UserRole.EMPLOYEE}>Çalışan</option>
            <option value={UserRole.MANAGER}>Yönetici</option>
            <option value={UserRole.HR_MANAGER}>İK Yöneticisi</option>
            <option value={UserRole.ADMIN}>Admin</option>
            <option value={UserRole.SUPER_ADMIN}>Süper Admin</option>
          </select>
          {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
        </div>

        {/* Employee */}
        <div>
          <label className="label">Bağlı Çalışan</label>
          <select
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            className="input"
            disabled={isLoading}
          >
            <option value="">Seçiniz</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName} ({employee.employeeNumber})
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Bu kullanıcıyı bir çalışan profiliyle ilişkilendirin
          </p>
        </div>

        {/* Password */}
        <div>
          <label className="label">
            Şifre {!user && <span className="text-red-500">*</span>}
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`input ${errors.password ? 'border-red-500' : ''}`}
            disabled={isLoading}
            placeholder={user ? 'Değiştirmek için doldurun' : ''}
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="label">
            Şifre Tekrar {!user && <span className="text-red-500">*</span>}
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`input ${errors.confirmPassword ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Active Status */}
        <div className="md:col-span-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-gray-700">Aktif Kullanıcı</span>
          </label>
          <p className="mt-1 text-xs text-gray-500 ml-6">
            Pasif kullanıcılar sisteme giriş yapamaz
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={isLoading}>
          İptal
        </button>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Kaydediliyor...' : user ? 'Güncelle' : 'Oluştur'}
        </button>
      </div>
    </form>
  );
}

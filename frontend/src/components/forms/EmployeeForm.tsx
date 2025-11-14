import { useState, useEffect } from 'react';
import { Employee, Department, Position } from '../../types';
import { departmentService } from '../../services/departmentService';
import { positionService } from '../../services/positionService';

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: Partial<Employee>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function EmployeeForm({ employee, onSubmit, onCancel, isLoading }: EmployeeFormProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [allPositions, setAllPositions] = useState<Position[]>([]);

  const [formData, setFormData] = useState({
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    employeeNumber: employee?.employeeNumber || '',
    dateOfBirth: employee?.dateOfBirth?.split('T')[0] || '',
    gender: employee?.gender || '',
    maritalStatus: employee?.maritalStatus || '',
    nationalId: employee?.nationalId || '',
    address: employee?.address || '',
    city: employee?.city || '',
    postalCode: employee?.postalCode || '',
    departmentId: employee?.departmentId || '',
    positionId: employee?.positionId || '',
    managerId: employee?.managerId || '',
    employmentType: employee?.employmentType || 'FULL_TIME',
    hireDate: employee?.hireDate?.split('T')[0] || '',
    salary: employee?.salary?.toString() || '',
    emergencyContactName: employee?.emergencyContactName || '',
    emergencyContactPhone: employee?.emergencyContactPhone || '',
    emergencyContactRelation: employee?.emergencyContactRelation || '',
  });

  useEffect(() => {
    loadDepartments();
    loadPositions();
  }, []);

  useEffect(() => {
    if (formData.departmentId) {
      filterPositions(formData.departmentId);
    }
  }, [formData.departmentId, allPositions]);

  const loadDepartments = async () => {
    try {
      const data = await departmentService.getAll();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const loadPositions = async () => {
    try {
      const data = await positionService.getAll();
      setAllPositions(data);
    } catch (error) {
      console.error('Failed to load positions:', error);
    }
  };

  const filterPositions = (departmentId: string) => {
    const filtered = allPositions.filter(p => p.departmentId === departmentId);
    setPositions(filtered);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData: any = {
      ...formData,
      salary: formData.salary ? parseFloat(formData.salary) : undefined,
    };

    // Remove empty strings
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '') {
        submitData[key] = undefined;
      }
    });

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Kişisel Bilgiler</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Soyad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-posta
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doğum Tarihi
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cinsiyet
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="input"
            >
              <option value="">Seçiniz</option>
              <option value="MALE">Erkek</option>
              <option value="FEMALE">Kadın</option>
              <option value="OTHER">Diğer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medeni Durum
            </label>
            <select
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              className="input"
            >
              <option value="">Seçiniz</option>
              <option value="SINGLE">Bekar</option>
              <option value="MARRIED">Evli</option>
              <option value="DIVORCED">Boşanmış</option>
              <option value="WIDOWED">Dul</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TC Kimlik No
            </label>
            <input
              type="text"
              name="nationalId"
              value={formData.nationalId}
              onChange={handleChange}
              maxLength={11}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Employment Information */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">İş Bilgileri</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sicil No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="employeeNumber"
              value={formData.employeeNumber}
              onChange={handleChange}
              required
              disabled={!!employee}
              className="input disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              İşe Giriş Tarihi <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="hireDate"
              value={formData.hireDate}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departman <span className="text-red-500">*</span>
            </label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              required
              className="input"
            >
              <option value="">Seçiniz</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pozisyon <span className="text-red-500">*</span>
            </label>
            <select
              name="positionId"
              value={formData.positionId}
              onChange={handleChange}
              required
              disabled={!formData.departmentId}
              className="input disabled:bg-gray-100"
            >
              <option value="">Seçiniz</option>
              {positions.map(pos => (
                <option key={pos.id} value={pos.id}>{pos.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Çalışma Tipi <span className="text-red-500">*</span>
            </label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              required
              className="input"
            >
              <option value="FULL_TIME">Tam Zamanlı</option>
              <option value="PART_TIME">Yarı Zamanlı</option>
              <option value="CONTRACT">Sözleşmeli</option>
              <option value="INTERN">Stajyer</option>
              <option value="TEMPORARY">Geçici</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maaş
            </label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              step="0.01"
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Acil Durum İletişim</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ad Soyad
            </label>
            <input
              type="text"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon
            </label>
            <input
              type="tel"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yakınlık
            </label>
            <input
              type="text"
              name="emergencyContactRelation"
              value={formData.emergencyContactRelation}
              onChange={handleChange}
              placeholder="Örn: Eş, Anne, Baba"
              className="input"
            />
          </div>
        </div>
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
          {isLoading ? 'Kaydediliyor...' : (employee ? 'Güncelle' : 'Kaydet')}
        </button>
      </div>
    </form>
  );
}

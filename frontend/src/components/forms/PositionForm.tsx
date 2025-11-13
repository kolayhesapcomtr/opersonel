import { useState, useEffect } from 'react';
import { Position, Department } from '../../types';
import { departmentService } from '../../services/departmentService';

interface PositionFormProps {
  position?: Position;
  onSubmit: (data: Partial<Position>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function PositionForm({ position, onSubmit, onCancel, isLoading }: PositionFormProps) {
  const [departments, setDepartments] = useState<Department[]>([]);

  const [formData, setFormData] = useState({
    title: position?.title || '',
    code: position?.code || '',
    description: position?.description || '',
    level: position?.level || '',
    departmentId: position?.departmentId || '',
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await departmentService.getAll();
      setDepartments(data.filter(d => d.isActive));
    } catch (error) {
      console.error('Failed to load departments:', error);
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
          Pozisyon Adı <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="input"
          placeholder="Örn: Yazılım Geliştirici"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pozisyon Kodu
        </label>
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
          className="input"
          placeholder="Örn: DEV-001"
          disabled={!!position}
        />
        {position && (
          <p className="text-xs text-gray-500 mt-1">Pozisyon kodu değiştirilemez</p>
        )}
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
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Seviye
        </label>
        <select
          name="level"
          value={formData.level}
          onChange={handleChange}
          className="input"
        >
          <option value="">Seçiniz</option>
          <option value="JUNIOR">Junior</option>
          <option value="MID">Mid-Level</option>
          <option value="SENIOR">Senior</option>
          <option value="LEAD">Lead</option>
          <option value="MANAGER">Manager</option>
          <option value="DIRECTOR">Director</option>
          <option value="VP">VP</option>
          <option value="C_LEVEL">C-Level</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Pozisyonun organizasyondaki seviyesi
        </p>
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
          placeholder="Pozisyon hakkında kısa açıklama, sorumluluklar..."
        />
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
          {isLoading ? 'Kaydediliyor...' : (position ? 'Güncelle' : 'Kaydet')}
        </button>
      </div>
    </form>
  );
}

import { useState } from 'react';
import { LeaveType } from '../../services/leaveService';

interface LeaveTypeFormProps {
  leaveType?: LeaveType;
  onSubmit: (data: Partial<LeaveType>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function LeaveTypeForm({ leaveType, onSubmit, onCancel, isLoading }: LeaveTypeFormProps) {
  const [formData, setFormData] = useState({
    name: leaveType?.name || '',
    code: leaveType?.code || '',
    description: leaveType?.description || '',
    daysPerYear: leaveType?.daysPerYear || 14,
    requiresApproval: leaveType?.requiresApproval ?? true,
    isPaid: leaveType?.isPaid ?? true,
    canCarryForward: leaveType?.canCarryForward ?? false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'daysPerYear') {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData: any = { ...formData };

    // Remove empty strings
    Object.keys(submitData).forEach((key) => {
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
          İzin Türü Adı <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="input"
          placeholder="Örn: Yıllık İzin"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kod <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
          required
          className="input"
          placeholder="Örn: ANNUAL"
          disabled={!!leaveType}
        />
        {leaveType && (
          <p className="text-xs text-gray-500 mt-1">İzin türü kodu değiştirilemez</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="input"
          placeholder="İzin türü hakkında kısa açıklama..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Yıllık Gün Sayısı <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="daysPerYear"
          value={formData.daysPerYear}
          onChange={handleChange}
          required
          min="0"
          className="input"
        />
        <p className="text-xs text-gray-500 mt-1">
          Çalışana yılda kaç gün bu izin türünden tahsis edileceği
        </p>
      </div>

      {/* Checkboxes */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            name="requiresApproval"
            id="requiresApproval"
            checked={formData.requiresApproval}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="requiresApproval" className="ml-2 text-sm text-gray-700">
            Onay Gerektirir
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isPaid"
            id="isPaid"
            checked={formData.isPaid}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="isPaid" className="ml-2 text-sm text-gray-700">
            Ücretli İzin
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="canCarryForward"
            id="canCarryForward"
            checked={formData.canCarryForward}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="canCarryForward" className="ml-2 text-sm text-gray-700">
            Sonraki Yıla Devredebilir
          </label>
        </div>
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
          {isLoading ? 'Kaydediliyor...' : leaveType ? 'Güncelle' : 'Kaydet'}
        </button>
      </div>
    </form>
  );
}

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { ToastContainer } from '../../components/ui/Toast';
import PositionForm from '../../components/forms/PositionForm';
import { useToast } from '../../hooks/useToast';
import { usePermissions } from '../../hooks/usePermissions';
import { positionService } from '../../services/positionService';
import { departmentService } from '../../services/departmentService';
import { Position, Department } from '../../types';
import { Briefcase, Plus, Building2, Users, Edit, Trash2 } from 'lucide-react';

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toasts, removeToast, success, error } = useToast();
  const { canManage, canEdit, canDelete } = usePermissions();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      filterPositions();
    } else {
      loadPositions();
    }
  }, [selectedDepartment]);

  const loadData = async () => {
    try {
      const [positionsData, departmentsData] = await Promise.all([
        positionService.getAll(),
        departmentService.getAll(),
      ]);
      setPositions(positionsData);
      setDepartments(departmentsData);
    } catch (err) {
      error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadPositions = async () => {
    setLoading(true);
    try {
      const data = await positionService.getAll();
      setPositions(data);
    } catch (err) {
      error('Pozisyonlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filterPositions = async () => {
    setLoading(true);
    try {
      const data = await positionService.getAll(selectedDepartment);
      setPositions(data);
    } catch (err) {
      error('Filtreleme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPosition(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (position: Position) => {
    setSelectedPosition(position);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: Partial<Position>) => {
    setIsSubmitting(true);
    try {
      if (selectedPosition) {
        await positionService.update(selectedPosition.id, data);
        success('Pozisyon başarıyla güncellendi');
      } else {
        await positionService.create(data);
        success('Pozisyon başarıyla oluşturuldu');
      }
      setIsModalOpen(false);
      await loadPositions();
    } catch (err: any) {
      error(err.response?.data?.error || 'İşlem başarısız oldu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (position: Position) => {
    setPositionToDelete(position);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!positionToDelete) return;

    setIsDeleting(true);
    try {
      await positionService.delete(positionToDelete.id);
      success('Pozisyon başarıyla silindi');
      setIsDeleteDialogOpen(false);
      setPositionToDelete(null);
      await loadPositions();
    } catch (err: any) {
      error(err.response?.data?.error || 'Silme işlemi başarısız oldu');
    } finally {
      setIsDeleting(false);
    }
  };

  const getLevelLabel = (level?: string) => {
    const labels: Record<string, string> = {
      JUNIOR: 'Junior',
      MID: 'Mid-Level',
      SENIOR: 'Senior',
      LEAD: 'Lead',
      MANAGER: 'Manager',
      DIRECTOR: 'Director',
      VP: 'VP',
      C_LEVEL: 'C-Level',
    };
    return level ? labels[level] || level : '-';
  };

  if (loading && positions.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Yükleniyor...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pozisyonlar</h1>
            <p className="text-gray-600 mt-1">{positions.length} pozisyon</p>
          </div>
          {canManage() && (
            <button
              onClick={handleCreate}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Yeni Pozisyon
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="input"
              >
                <option value="">Tüm Departmanlar</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Position List */}
        <div className="card overflow-hidden p-0">
          {positions.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {selectedDepartment ? 'Bu departmanda pozisyon bulunamadı' : 'Henüz pozisyon eklenmemiş'}
              </p>
              {!selectedDepartment && canManage() && (
                <button
                  onClick={handleCreate}
                  className="btn-primary inline-flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  İlk Pozisyonu Ekle
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pozisyon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Departman
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seviye
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Çalışan Sayısı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {positions.map((position) => (
                    <tr key={position.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-primary-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {position.title}
                            </div>
                            {position.code && (
                              <div className="text-sm text-gray-500">
                                {position.code}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                          {position.department?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getLevelLabel(position.level)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Users className="w-4 h-4 mr-1 text-gray-400" />
                          {(position as any)._count?.employees || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          {canEdit() && (
                            <button
                              onClick={() => handleEdit(position)}
                              className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Düzenle
                            </button>
                          )}
                          {canDelete() && (
                            <button
                              onClick={() => handleDeleteClick(position)}
                              className="text-red-600 hover:text-red-900 inline-flex items-center"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Sil
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Position Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPosition ? 'Pozisyon Düzenle' : 'Yeni Pozisyon'}
        size="md"
      >
        <PositionForm
          position={selectedPosition}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Pozisyonu Sil"
        message={`${positionToDelete?.title} pozisyonunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        type="danger"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { ToastContainer } from '../../components/ui/Toast';
import DepartmentForm from '../../components/forms/DepartmentForm';
import { useToast } from '../../hooks/useToast';
import { departmentService } from '../../services/departmentService';
import { Department } from '../../types';
import { Building2, Users, Plus, Edit, Trash2 } from 'lucide-react';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await departmentService.getAll();
      setDepartments(data);
    } catch (err) {
      error('Departmanlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedDepartment(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: Partial<Department>) => {
    setIsSubmitting(true);
    try {
      if (selectedDepartment) {
        await departmentService.update(selectedDepartment.id, data);
        success('Departman başarıyla güncellendi');
      } else {
        await departmentService.create(data);
        success('Departman başarıyla oluşturuldu');
      }
      setIsModalOpen(false);
      await loadDepartments();
    } catch (err: any) {
      error(err.response?.data?.error || 'İşlem başarısız oldu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (department: Department) => {
    setDepartmentToDelete(department);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!departmentToDelete) return;

    setIsDeleting(true);
    try {
      await departmentService.delete(departmentToDelete.id);
      success('Departman başarıyla silindi');
      setIsDeleteDialogOpen(false);
      setDepartmentToDelete(null);
      await loadDepartments();
    } catch (err: any) {
      error(err.response?.data?.error || 'Silme işlemi başarısız oldu');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
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
            <h1 className="text-3xl font-bold text-gray-900">Departmanlar</h1>
            <p className="text-gray-600 mt-1">{departments.length} departman</p>
          </div>
          <button
            onClick={handleCreate}
            className="btn-primary inline-flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Yeni Departman
          </button>
        </div>

        {/* Department Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => (
            <div key={department.id} className="card hover:shadow-lg transition-shadow relative group">
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                <button
                  onClick={() => handleEdit(department)}
                  className="p-2 bg-white rounded-lg shadow hover:bg-gray-50"
                  title="Düzenle"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDeleteClick(department)}
                  className="p-2 bg-white rounded-lg shadow hover:bg-red-50"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>

              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {department.name}
                    </h3>
                    {department.code && (
                      <p className="text-sm text-gray-500">{department.code}</p>
                    )}
                  </div>
                </div>
              </div>

              {department.description && (
                <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                  {department.description}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-1" />
                  {department._count?.employees || 0} çalışan
                </div>
                {department.manager && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">
                      {department.manager.firstName} {department.manager.lastName}
                    </span>
                  </div>
                )}
              </div>

              {department.parent && (
                <div className="mt-2 text-xs text-gray-500">
                  Üst Departman: {department.parent.name}
                </div>
              )}
            </div>
          ))}
        </div>

        {departments.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Henüz departman eklenmemiş</p>
            <button
              onClick={handleCreate}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              İlk Departmanı Ekle
            </button>
          </div>
        )}
      </div>

      {/* Department Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDepartment ? 'Departman Düzenle' : 'Yeni Departman'}
        size="md"
      >
        <DepartmentForm
          department={selectedDepartment}
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
        title="Departmanı Sil"
        message={`${departmentToDelete?.name} departmanını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        type="danger"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}

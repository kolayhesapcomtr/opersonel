import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { ToastContainer } from '../../components/ui/Toast';
import LeaveTypeForm from '../../components/forms/LeaveTypeForm';
import { useToast } from '../../hooks/useToast';
import { usePermissions } from '../../hooks/usePermissions';
import { leaveTypeService, LeaveType } from '../../services/leaveService';
import { Calendar, Plus, Edit, Trash2, Check, X } from 'lucide-react';

export default function LeaveTypesPage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<LeaveType | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<LeaveType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toasts, removeToast, success, error } = useToast();
  const { canManage, canEdit, canDelete } = usePermissions();

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  const loadLeaveTypes = async () => {
    try {
      const data = await leaveTypeService.getAll();
      setLeaveTypes(data);
    } catch (err) {
      error('İzin türleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedType(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (type: LeaveType) => {
    setSelectedType(type);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: Partial<LeaveType>) => {
    setIsSubmitting(true);
    try {
      if (selectedType) {
        await leaveTypeService.update(selectedType.id, data);
        success('İzin türü güncellendi');
      } else {
        await leaveTypeService.create(data);
        success('İzin türü oluşturuldu');
      }
      setIsModalOpen(false);
      await loadLeaveTypes();
    } catch (err: any) {
      error(err.response?.data?.error || 'İşlem başarısız oldu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (type: LeaveType) => {
    setTypeToDelete(type);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!typeToDelete) return;

    setIsDeleting(true);
    try {
      await leaveTypeService.delete(typeToDelete.id);
      success('İzin türü silindi');
      setIsDeleteDialogOpen(false);
      setTypeToDelete(null);
      await loadLeaveTypes();
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
            <h1 className="text-3xl font-bold text-gray-900">İzin Türleri</h1>
            <p className="text-gray-600 mt-1">{leaveTypes.length} izin türü</p>
          </div>
          {canManage() && (
            <button onClick={handleCreate} className="btn-primary inline-flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Yeni İzin Türü
            </button>
          )}
        </div>

        {/* Leave Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaveTypes.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Henüz izin türü eklenmemiş</p>
              {canManage() && (
                <button onClick={handleCreate} className="btn-primary inline-flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  İlk İzin Türünü Ekle
                </button>
              )}
            </div>
          ) : (
            leaveTypes.map((type) => (
              <div key={type.id} className="card hover:shadow-lg transition-shadow relative group">
                {/* Action Buttons */}
                {(canEdit() || canDelete()) && (
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                    {canEdit() && (
                      <button
                        onClick={() => handleEdit(type)}
                        className="p-2 bg-white rounded-lg shadow hover:bg-gray-50"
                        title="Düzenle"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                    {canDelete() && (
                      <button
                        onClick={() => handleDeleteClick(type)}
                        className="p-2 bg-white rounded-lg shadow hover:bg-red-50"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
                      <p className="text-sm text-gray-500">{type.code}</p>
                    </div>
                  </div>
                </div>

                {type.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{type.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Yıllık Gün:</span>
                    <span className="font-semibold text-gray-900">{type.daysPerYear} gün</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-xs">
                      {type.requiresApproval ? (
                        <Check className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400 mr-1" />
                      )}
                      <span className="text-gray-600">Onay</span>
                    </div>
                    <div className="flex items-center text-xs">
                      {type.isPaid ? (
                        <Check className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400 mr-1" />
                      )}
                      <span className="text-gray-600">Ücretli</span>
                    </div>
                    <div className="flex items-center text-xs">
                      {type.canCarryForward ? (
                        <Check className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400 mr-1" />
                      )}
                      <span className="text-gray-600">Devir</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedType ? 'İzin Türünü Düzenle' : 'Yeni İzin Türü'}
        size="md"
      >
        <LeaveTypeForm
          leaveType={selectedType}
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
        title="İzin Türünü Sil"
        message={`${typeToDelete?.name} izin türünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        type="danger"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}

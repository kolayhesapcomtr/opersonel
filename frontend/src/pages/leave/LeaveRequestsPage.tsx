import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { ToastContainer } from '../../components/ui/Toast';
import LeaveRequestForm from '../../components/forms/LeaveRequestForm';
import { useToast } from '../../hooks/useToast';
import { usePermissions } from '../../hooks/usePermissions';
import {
  leaveRequestService,
  leaveTypeService,
  LeaveRequest,
  LeaveRequestStatus,
  LeaveType,
} from '../../services/leaveService';
import {
  Calendar,
  Plus,
  Check,
  X,
  Ban,
  Filter,
} from 'lucide-react';

export default function LeaveRequestsPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | 'cancel' | null;
    request: LeaveRequest | null;
    rejectionReason?: string;
  }>({
    isOpen: false,
    type: null,
    request: null,
  });

  const { toasts, removeToast, success, error } = useToast();
  const { canManage, canApproveLeave } = usePermissions();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [selectedStatus, selectedLeaveType]);

  const loadData = async () => {
    try {
      const [requestsData, typesData] = await Promise.all([
        leaveRequestService.getAll(),
        leaveTypeService.getAll(),
      ]);
      setLeaveRequests(requestsData);
      setLeaveTypes(typesData);
    } catch (err) {
      error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = async () => {
    setLoading(true);
    try {
      const data = await leaveRequestService.getAll({
        status: selectedStatus as LeaveRequestStatus | undefined,
        leaveTypeId: selectedLeaveType || undefined,
      });
      setLeaveRequests(data);
    } catch (err) {
      error('Filtreleme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedRequest(undefined);
    setIsModalOpen(true);
  };

  // Uncomment when edit functionality is needed
  // const handleEdit = (request: LeaveRequest) => {
  //   if (request.status !== LeaveRequestStatus.PENDING) {
  //     error('Sadece beklemedeki talepler düzenlenebilir');
  //     return;
  //   }
  //   setSelectedRequest(request);
  //   setIsModalOpen(true);
  // };

  const handleSubmit = async (data: Partial<LeaveRequest>) => {
    setIsSubmitting(true);
    try {
      if (selectedRequest) {
        await leaveRequestService.update(selectedRequest.id, data);
        success('İzin talebi güncellendi');
      } else {
        await leaveRequestService.create(data);
        success('İzin talebi oluşturuldu');
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      error(err.response?.data?.error || 'İşlem başarısız oldu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = async () => {
    if (!actionDialog.request || !actionDialog.type) return;

    setIsSubmitting(true);
    try {
      switch (actionDialog.type) {
        case 'approve':
          await leaveRequestService.approve(actionDialog.request.id);
          success('İzin talebi onaylandı');
          break;
        case 'reject':
          await leaveRequestService.reject(actionDialog.request.id, actionDialog.rejectionReason);
          success('İzin talebi reddedildi');
          break;
        case 'cancel':
          await leaveRequestService.cancel(actionDialog.request.id);
          success('İzin talebi iptal edildi');
          break;
      }
      setActionDialog({ isOpen: false, type: null, request: null });
      await loadData();
    } catch (err: any) {
      error(err.response?.data?.error || 'İşlem başarısız oldu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: LeaveRequestStatus) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      PENDING: 'Beklemede',
      APPROVED: 'Onaylandı',
      REJECTED: 'Reddedildi',
      CANCELLED: 'İptal Edildi',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading && leaveRequests.length === 0) {
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
            <h1 className="text-3xl font-bold text-gray-900">İzin Talepleri</h1>
            <p className="text-gray-600 mt-1">{leaveRequests.length} talep</p>
          </div>
          {canManage() && (
            <button onClick={handleCreate} className="btn-primary inline-flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Yeni Talep
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-sm font-medium text-gray-700">Filtrele</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input"
              >
                <option value="">Tüm Durumlar</option>
                <option value="PENDING">Beklemede</option>
                <option value="APPROVED">Onaylandı</option>
                <option value="REJECTED">Reddedildi</option>
                <option value="CANCELLED">İptal Edildi</option>
              </select>
            </div>
            <div>
              <select
                value={selectedLeaveType}
                onChange={(e) => setSelectedLeaveType(e.target.value)}
                className="input"
              >
                <option value="">Tüm İzin Türleri</option>
                {leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Leave Requests List */}
        <div className="card overflow-hidden p-0">
          {leaveRequests.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">İzin talebi bulunamadı</p>
              {canManage() && (
                <button onClick={handleCreate} className="btn-primary inline-flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  İlk Talebi Oluştur
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Çalışan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      İzin Türü
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tarih Aralığı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Gün
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaveRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.employee?.firstName} {request.employee?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {request.employee?.department?.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{request.leaveType?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(request.startDate).toLocaleDateString('tr-TR')} -{' '}
                        {new Date(request.endDate).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.days} gün
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {canApproveLeave() && request.status === LeaveRequestStatus.PENDING && (
                            <>
                              <button
                                onClick={() =>
                                  setActionDialog({
                                    isOpen: true,
                                    type: 'approve',
                                    request,
                                  })
                                }
                                className="text-green-600 hover:text-green-900 inline-flex items-center"
                                title="Onayla"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setActionDialog({
                                    isOpen: true,
                                    type: 'reject',
                                    request,
                                  })
                                }
                                className="text-red-600 hover:text-red-900 inline-flex items-center"
                                title="Reddet"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {canManage() &&
                            (request.status === LeaveRequestStatus.PENDING ||
                              request.status === LeaveRequestStatus.APPROVED) && (
                              <button
                                onClick={() =>
                                  setActionDialog({
                                    isOpen: true,
                                    type: 'cancel',
                                    request,
                                  })
                                }
                                className="text-gray-600 hover:text-gray-900 inline-flex items-center"
                                title="İptal Et"
                              >
                                <Ban className="w-4 h-4" />
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedRequest ? 'İzin Talebini Düzenle' : 'Yeni İzin Talebi'}
        size="md"
      >
        <LeaveRequestForm
          leaveRequest={selectedRequest}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Action Confirmation Dialog */}
      <ConfirmDialog
        isOpen={actionDialog.isOpen}
        onClose={() => setActionDialog({ isOpen: false, type: null, request: null })}
        onConfirm={handleAction}
        title={
          actionDialog.type === 'approve'
            ? 'İzin Talebini Onayla'
            : actionDialog.type === 'reject'
            ? 'İzin Talebini Reddet'
            : 'İzin Talebini İptal Et'
        }
        message={`${actionDialog.request?.employee?.firstName} ${actionDialog.request?.employee?.lastName} adlı çalışanın izin talebini ${
          actionDialog.type === 'approve'
            ? 'onaylamak'
            : actionDialog.type === 'reject'
            ? 'reddetmek'
            : 'iptal etmek'
        } istediğinize emin misiniz?`}
        confirmText={
          actionDialog.type === 'approve' ? 'Onayla' : actionDialog.type === 'reject' ? 'Reddet' : 'İptal Et'
        }
        type={actionDialog.type === 'approve' ? 'info' : actionDialog.type === 'reject' ? 'danger' : 'warning'}
        isLoading={isSubmitting}
      />
    </DashboardLayout>
  );
}

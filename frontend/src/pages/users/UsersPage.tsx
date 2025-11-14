import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { ToastContainer } from '../../components/ui/Toast';
import UserForm from '../../components/forms/UserForm';
import { useToast } from '../../hooks/useToast';
import { usePermissions } from '../../hooks/usePermissions';
import { userService } from '../../services/userService';
import { User, UserRole } from '../../types';
import { Users, Plus, Shield, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toasts, removeToast, success, error } = useToast();
  const { isAdmin } = usePermissions();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      error('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedUser(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: Partial<User>) => {
    setIsSubmitting(true);
    try {
      if (selectedUser) {
        await userService.update(selectedUser.id, data);
        success('Kullanıcı başarıyla güncellendi');
      } else {
        await userService.create(data);
        success('Kullanıcı başarıyla oluşturuldu');
      }
      setIsModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      error(err.response?.data?.error || 'İşlem başarısız oldu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await userService.delete(userToDelete.id);
      success('Kullanıcı başarıyla silindi');
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      await loadUsers();
    } catch (err: any) {
      error(err.response?.data?.error || 'Silme işlemi başarısız oldu');
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const colors = {
      SUPER_ADMIN: 'bg-purple-100 text-purple-800',
      ADMIN: 'bg-red-100 text-red-800',
      HR_MANAGER: 'bg-blue-100 text-blue-800',
      MANAGER: 'bg-green-100 text-green-800',
      EMPLOYEE: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      SUPER_ADMIN: 'Süper Admin',
      ADMIN: 'Admin',
      HR_MANAGER: 'İK Yöneticisi',
      MANAGER: 'Yönetici',
      EMPLOYEE: 'Çalışan',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role]}`}
      >
        {labels[role]}
      </span>
    );
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
            <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
            <p className="text-gray-600 mt-1">{users.length} kullanıcı</p>
          </div>
          {isAdmin() && (
            <button onClick={handleCreate} className="btn-primary inline-flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Yeni Kullanıcı
            </button>
          )}
        </div>

        {/* Users List */}
        <div className="card overflow-hidden p-0">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Henüz kullanıcı eklenmemiş</p>
              {isAdmin() && (
                <button onClick={handleCreate} className="btn-primary inline-flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  İlk Kullanıcıyı Ekle
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kullanıcı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bağlı Çalışan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.email}</div>
                            {user.employee && (
                              <div className="text-sm text-gray-500">
                                {user.employee.firstName} {user.employee.lastName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.employee ? (
                          <span>
                            {user.employee.firstName} {user.employee.lastName}
                            <br />
                            <span className="text-xs text-gray-500">
                              {user.employee.employeeNumber}
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            Pasif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          {isAdmin() && (
                            <>
                              <button
                                onClick={() => handleEdit(user)}
                                className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Düzenle
                              </button>
                              <button
                                onClick={() => handleDeleteClick(user)}
                                className="text-red-600 hover:text-red-900 inline-flex items-center"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Sil
                              </button>
                            </>
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

      {/* User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
        size="lg"
      >
        <UserForm
          user={selectedUser}
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
        title="Kullanıcıyı Sil"
        message={`${userToDelete?.email} adlı kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        type="danger"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}

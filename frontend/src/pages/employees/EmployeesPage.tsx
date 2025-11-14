import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { ToastContainer } from '../../components/ui/Toast';
import Pagination from '../../components/ui/Pagination';
import AdvancedSearch from '../../components/ui/AdvancedSearch';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/SkeletonLoader';
import EmployeeForm from '../../components/forms/EmployeeForm';
import { useToast } from '../../hooks/useToast';
import { usePermissions } from '../../hooks/usePermissions';
import { employeeService } from '../../services/employeeService';
import { departmentService } from '../../services/departmentService';
import { Employee, Department, EmploymentStatus } from '../../types';
import { Search, Plus, Mail, Phone, Building2, Briefcase, Trash2, Eye, Users } from 'lucide-react';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toasts, removeToast, success, error } = useToast();
  const { canManage, canEdit, canDelete } = usePermissions();

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [currentPage, itemsPerPage, filters]);

  const loadDepartments = async () => {
    try {
      const data = await departmentService.getAll();
      setDepartments(data);
    } catch (err) {
      error('Departmanlar yüklenirken hata oluştu');
    }
  };

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getAll({
        ...filters,
        departmentId: filters.department || undefined,
        status: filters.status as EmploymentStatus || undefined,
      });

      // Client-side pagination (for now, backend pagination can be added later)
      setTotalEmployees(data.length);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setEmployees(data.slice(startIndex, endIndex));
    } catch (err) {
      error('Çalışanlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setSelectedEmployee(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: Partial<Employee>) => {
    setIsSubmitting(true);
    try {
      if (selectedEmployee) {
        await employeeService.update(selectedEmployee.id, data);
        success('Çalışan başarıyla güncellendi');
      } else {
        await employeeService.create(data);
        success('Çalışan başarıyla oluşturuldu');
      }
      setIsModalOpen(false);
      await loadEmployees();
    } catch (err: any) {
      error(err.response?.data?.error || 'İşlem başarısız oldu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;

    setIsDeleting(true);
    try {
      await employeeService.delete(employeeToDelete.id);
      success('Çalışan başarıyla silindi');
      setIsDeleteDialogOpen(false);
      setEmployeeToDelete(null);
      await loadEmployees();
    } catch (err: any) {
      error(err.response?.data?.error || 'Silme işlemi başarısız oldu');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: EmploymentStatus) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      ON_LEAVE: 'bg-yellow-100 text-yellow-800',
      TERMINATED: 'bg-red-100 text-red-800',
      RESIGNED: 'bg-gray-100 text-gray-800',
      RETIRED: 'bg-blue-100 text-blue-800',
    };

    const labels = {
      ACTIVE: 'Aktif',
      ON_LEAVE: 'İzinli',
      TERMINATED: 'İşten Çıkarıldı',
      RESIGNED: 'İstifa Etti',
      RETIRED: 'Emekli',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const totalPages = Math.ceil(totalEmployees / itemsPerPage);

  return (
    <DashboardLayout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Çalışanlar</h1>
            <p className="text-gray-600 mt-1">{totalEmployees} çalışan</p>
          </div>
          {canManage() && (
            <button
              onClick={handleCreate}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Yeni Çalışan
            </button>
          )}
        </div>

        {/* Advanced Search */}
        <AdvancedSearch
          onSearch={handleSearch}
          searchPlaceholder="İsim, email veya sicil no ile ara..."
          filters={[
            {
              name: 'department',
              label: 'Departman',
              type: 'select',
              options: departments.map((d) => ({ value: d.id, label: d.name })),
            },
            {
              name: 'status',
              label: 'Durum',
              type: 'select',
              options: [
                { value: 'ACTIVE', label: 'Aktif' },
                { value: 'ON_LEAVE', label: 'İzinli' },
                { value: 'TERMINATED', label: 'İşten Çıkarıldı' },
                { value: 'RESIGNED', label: 'İstifa Etti' },
                { value: 'RETIRED', label: 'Emekli' },
              ],
            },
          ]}
        />

        {/* Employee List */}
        <div className="card overflow-hidden p-0">
          {loading ? (
            <TableSkeleton rows={itemsPerPage} columns={6} />
          ) : employees.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Çalışan bulunamadı"
              description={
                Object.keys(filters).length > 0
                  ? 'Arama kriterlerine uygun çalışan bulunamadı. Filtreleri temizleyip tekrar deneyin.'
                  : 'Henüz sisteme çalışan eklenmemiş.'
              }
              action={
                canManage() && Object.keys(filters).length === 0
                  ? {
                      label: 'İlk Çalışanı Ekle',
                      onClick: handleCreate,
                      icon: Plus,
                    }
                  : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Çalışan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İletişim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Departman
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pozisyon
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
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-700 font-semibold">
                              {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.employeeNumber}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {employee.email && (
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {employee.email}
                            </div>
                          )}
                          {employee.phone && (
                            <div className="flex items-center mt-1">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              {employee.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                          {employee.department?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                          {employee.position?.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(employee.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <Link
                            to={`/employees/${employee.id}`}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Görüntüle
                          </Link>
                          {canEdit() && (
                            <button
                              onClick={() => handleEdit(employee)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Düzenle
                            </button>
                          )}
                          {canDelete() && (
                            <button
                              onClick={() => handleDeleteClick(employee)}
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

          {/* Pagination */}
          {!loading && totalEmployees > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalEmployees}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </div>
      </div>

      {/* Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEmployee ? 'Çalışan Düzenle' : 'Yeni Çalışan'}
        size="xl"
      >
        <EmployeeForm
          employee={selectedEmployee}
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
        title="Çalışanı Sil"
        message={`${employeeToDelete?.firstName} ${employeeToDelete?.lastName} adlı çalışanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        type="danger"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}

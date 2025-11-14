import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import Modal from '../../components/ui/Modal';
import { ToastContainer } from '../../components/ui/Toast';
import EmployeeForm from '../../components/forms/EmployeeForm';
import { useToast } from '../../hooks/useToast';
import { usePermissions } from '../../hooks/usePermissions';
import { employeeService } from '../../services/employeeService';
import { leaveRequestService, LeaveBalance } from '../../services/leaveService';
import { Employee } from '../../types';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building2,
  DollarSign,
  User,
  Heart,
  Edit,
  Badge,
} from 'lucide-react';

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toasts, removeToast, success, error } = useToast();
  const { canEdit } = usePermissions();

  useEffect(() => {
    if (id) {
      loadEmployee();
    }
  }, [id]);

  const loadEmployee = async () => {
    if (!id) return;

    try {
      const [employeeData, balanceData] = await Promise.all([
        employeeService.getById(id),
        leaveRequestService.getBalance(id).catch(() => []), // Don't fail if balance fails
      ]);
      setEmployee(employeeData);
      setLeaveBalances(balanceData);
    } catch (err) {
      error('Çalışan bilgileri yüklenemedi');
      setTimeout(() => navigate('/employees'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: Partial<Employee>) => {
    if (!employee) return;

    setIsSubmitting(true);
    try {
      await employeeService.update(employee.id, data);
      success('Çalışan başarıyla güncellendi');
      setIsModalOpen(false);
      await loadEmployee();
    } catch (err: any) {
      error(err.response?.data?.error || 'Güncelleme başarısız oldu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: 'Aktif',
      ON_LEAVE: 'İzinli',
      TERMINATED: 'İşten Çıkarıldı',
      RESIGNED: 'İstifa Etti',
      RETIRED: 'Emekli',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      ON_LEAVE: 'bg-yellow-100 text-yellow-800',
      TERMINATED: 'bg-red-100 text-red-800',
      RESIGNED: 'bg-gray-100 text-gray-800',
      RETIRED: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      FULL_TIME: 'Tam Zamanlı',
      PART_TIME: 'Yarı Zamanlı',
      CONTRACT: 'Sözleşmeli',
      INTERN: 'Stajyer',
      TEMPORARY: 'Geçici',
    };
    return labels[type] || type;
  };

  const getGenderLabel = (gender?: string) => {
    const labels: Record<string, string> = {
      MALE: 'Erkek',
      FEMALE: 'Kadın',
      OTHER: 'Diğer',
      PREFER_NOT_TO_SAY: 'Belirtmek İstemiyorum',
    };
    return gender ? labels[gender] || gender : '-';
  };

  const getMaritalStatusLabel = (status?: string) => {
    const labels: Record<string, string> = {
      SINGLE: 'Bekar',
      MARRIED: 'Evli',
      DIVORCED: 'Boşanmış',
      WIDOWED: 'Dul',
    };
    return status ? labels[status] || status : '-';
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

  if (!employee) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Çalışan bulunamadı</div>
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
          <div className="flex items-center space-x-4">
            <Link
              to="/employees"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-gray-600 mt-1">{employee.employeeNumber}</p>
            </div>
          </div>
          {canEdit() && (
            <button
              onClick={handleEdit}
              className="btn-primary inline-flex items-center"
            >
              <Edit className="w-5 h-5 mr-2" />
              Düzenle
            </button>
          )}
        </div>

        {/* Status Card */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-bold text-2xl">
                  {employee.firstName.charAt(0)}
                  {employee.lastName.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {employee.position?.title}
                </h2>
                <p className="text-gray-600">{employee.department?.name}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(employee.status)}`}>
                {getStatusLabel(employee.status)}
              </span>
              <p className="text-sm text-gray-500 mt-2">
                {getEmploymentTypeLabel(employee.employmentType)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Kişisel Bilgiler
            </h3>
            <div className="space-y-3">
              {employee.email && (
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">E-posta</p>
                    <p className="text-sm font-medium text-gray-900">{employee.email}</p>
                  </div>
                </div>
              )}
              {employee.phone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Telefon</p>
                    <p className="text-sm font-medium text-gray-900">{employee.phone}</p>
                  </div>
                </div>
              )}
              {employee.dateOfBirth && (
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Doğum Tarihi</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(employee.dateOfBirth).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Cinsiyet</p>
                  <p className="text-sm font-medium text-gray-900">{getGenderLabel(employee.gender)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Heart className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Medeni Durum</p>
                  <p className="text-sm font-medium text-gray-900">
                    {getMaritalStatusLabel(employee.maritalStatus)}
                  </p>
                </div>
              </div>
              {employee.nationalId && (
                <div className="flex items-center">
                  <Badge className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">TC Kimlik No</p>
                    <p className="text-sm font-medium text-gray-900">{employee.nationalId}</p>
                  </div>
                </div>
              )}
              {employee.address && (
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Adres</p>
                    <p className="text-sm font-medium text-gray-900">{employee.address}</p>
                    {(employee.city || employee.state || employee.postalCode) && (
                      <p className="text-sm text-gray-600">
                        {[employee.city, employee.state, employee.postalCode].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Employment Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              İstihdam Bilgileri
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">İşe Başlama</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(employee.hireDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Departman</p>
                  <p className="text-sm font-medium text-gray-900">{employee.department?.name}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Pozisyon</p>
                  <p className="text-sm font-medium text-gray-900">{employee.position?.title}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Badge className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Sicil No</p>
                  <p className="text-sm font-medium text-gray-900">{employee.employeeNumber}</p>
                </div>
              </div>
              {employee.salary && (
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Maaş</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: employee.currency || 'TRY',
                      }).format(employee.salary)}
                    </p>
                  </div>
                </div>
              )}
              {employee.manager && (
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Yönetici</p>
                    <p className="text-sm font-medium text-gray-900">
                      {employee.manager.firstName} {employee.manager.lastName}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          {(employee.emergencyContactName || employee.emergencyContactPhone) && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                Acil Durum İletişim
              </h3>
              <div className="space-y-3">
                {employee.emergencyContactName && (
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">İsim</p>
                      <p className="text-sm font-medium text-gray-900">
                        {employee.emergencyContactName}
                      </p>
                    </div>
                  </div>
                )}
                {employee.emergencyContactPhone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Telefon</p>
                      <p className="text-sm font-medium text-gray-900">
                        {employee.emergencyContactPhone}
                      </p>
                    </div>
                  </div>
                )}
                {employee.emergencyContactRelation && (
                  <div className="flex items-center">
                    <Heart className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Yakınlık</p>
                      <p className="text-sm font-medium text-gray-900">
                        {employee.emergencyContactRelation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Leave Balance */}
          {leaveBalances.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                İzin Bakiyesi
              </h3>
              <div className="space-y-4">
                {leaveBalances.map((balance) => (
                  <div key={balance.leaveType.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {balance.leaveType.name}
                      </span>
                      <span className="text-sm text-gray-600">
                        {balance.available} / {balance.allocated} gün
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          balance.available / balance.allocated > 0.5
                            ? 'bg-green-500'
                            : balance.available / balance.allocated > 0.2
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{
                          width: `${(balance.available / balance.allocated) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Kullanılan: {balance.used} gün</span>
                      <span>Kalan: {balance.available} gün</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          {employee.bio && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hakkında</h3>
              <p className="text-sm text-gray-700">{employee.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Çalışan Düzenle"
        size="xl"
      >
        <EmployeeForm
          employee={employee}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </DashboardLayout>
  );
}

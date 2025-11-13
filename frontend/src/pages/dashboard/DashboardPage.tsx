import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { dashboardService, DashboardStats } from '../../services/dashboardService';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import {
  Users,
  Building2,
  Briefcase,
  UserCheck,
  UserPlus,
  Calendar,
  TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, tenant } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await dashboardService.getOverview();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
      setError('İstatistikler yüklenemedi');
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Yükleniyor...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !stats) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">{error || 'Bir hata oluştu'}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Hoş geldiniz, {user?.employee?.firstName || user?.email}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Toplam Çalışan"
            value={stats.overview.totalEmployees}
            icon={Users}
            colorClass="bg-blue-100 text-blue-600"
          />
          <StatCard
            title="Aktif Çalışan"
            value={stats.overview.activeEmployees}
            icon={UserCheck}
            description={`${stats.overview.onLeaveEmployees} izinli`}
            colorClass="bg-green-100 text-green-600"
          />
          <StatCard
            title="Departmanlar"
            value={stats.overview.totalDepartments}
            icon={Building2}
            colorClass="bg-purple-100 text-purple-600"
          />
          <StatCard
            title="Pozisyonlar"
            value={stats.overview.totalPositions}
            icon={Briefcase}
            colorClass="bg-orange-100 text-orange-600"
          />
        </div>

        {/* Second Row Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Yeni İşe Alımlar"
            value={stats.overview.recentHires}
            icon={UserPlus}
            description="Son 30 gün"
            colorClass="bg-indigo-100 text-indigo-600"
          />
          <StatCard
            title="İzinli Çalışanlar"
            value={stats.overview.onLeaveEmployees}
            icon={Calendar}
            colorClass="bg-yellow-100 text-yellow-600"
          />
          <StatCard
            title="Çalışan Oranı"
            value={`${Math.round((stats.overview.activeEmployees / stats.overview.totalEmployees) * 100)}%`}
            icon={TrendingUp}
            description="Aktif / Toplam"
            colorClass="bg-teal-100 text-teal-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employees by Department */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Departmanlara Göre Çalışanlar
            </h2>
            <div className="space-y-3">
              {stats.employeesByDepartment.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Henüz departman yok</p>
              ) : (
                stats.employeesByDepartment.map((dept) => (
                  <div
                    key={dept.departmentId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="font-medium text-gray-900">{dept.departmentName}</span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                      {dept.count} çalışan
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Employees by Type */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              İstihdam Türüne Göre
            </h2>
            <div className="space-y-3">
              {stats.employeesByType.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium text-gray-900">
                    {getEmploymentTypeLabel(item.type)}
                  </span>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">{item.count}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${(item.count / stats.overview.totalEmployees) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Employees */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Son Eklenen Çalışanlar</h2>
            <Link
              to="/employees"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Tümünü Gör →
            </Link>
          </div>
          <div className="overflow-x-auto">
            {stats.recentEmployees.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Henüz çalışan yok</p>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Çalışan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Departman
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Pozisyon
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      İşe Başlama
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.recentEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-700 font-semibold text-sm">
                              {employee.firstName.charAt(0)}
                              {employee.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{employee.employeeNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {employee.department.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {employee.position.title}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(employee.hireDate).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Company Info */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Şirket Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Şirket Adı:</span>
              <span className="font-medium">{tenant?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Şirket Kodu:</span>
              <span className="font-medium">{tenant?.slug}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Plan:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {tenant?.planType?.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Durum:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {tenant?.subscriptionStatus?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

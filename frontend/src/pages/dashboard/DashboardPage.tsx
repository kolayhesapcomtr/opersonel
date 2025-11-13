import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { tenantService } from '../../services/tenantService';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { Users, Building2, UserSquare2, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { user, tenant } = useAuthStore();
  const [stats, setStats] = useState({
    employeeCount: 0,
    departmentCount: 0,
    userCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await tenantService.getCurrent();
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
            value={stats.employeeCount}
            icon={<Users className="w-6 h-6" />}
            color="bg-blue-500"
            loading={loading}
          />
          <StatCard
            title="Departmanlar"
            value={stats.departmentCount}
            icon={<Building2 className="w-6 h-6" />}
            color="bg-green-500"
            loading={loading}
          />
          <StatCard
            title="Aktif Kullanıcılar"
            value={stats.userCount}
            icon={<UserSquare2 className="w-6 h-6" />}
            color="bg-purple-500"
            loading={loading}
          />
          <StatCard
            title="Büyüme"
            value="+12%"
            icon={<TrendingUp className="w-6 h-6" />}
            color="bg-orange-500"
            loading={loading}
          />
        </div>

        {/* Company Info */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Şirket Bilgileri</h2>
          <div className="space-y-3">
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

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hızlı İşlemler</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionButton title="Yeni Çalışan" href="/employees" />
            <QuickActionButton title="Departmanlar" href="/departments" />
            <QuickActionButton title="İzin Talepleri" href="/leave-requests" />
            <QuickActionButton title="Raporlar" href="/reports" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

function StatCard({ title, value, icon, color, loading }: StatCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {loading ? '...' : value}
          </p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
}

interface QuickActionButtonProps {
  title: string;
  href: string;
}

function QuickActionButton({ title, href }: QuickActionButtonProps) {
  return (
    <a
      href={href}
      className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-gray-700 hover:text-primary-700 font-medium"
    >
      {title}
    </a>
  );
}

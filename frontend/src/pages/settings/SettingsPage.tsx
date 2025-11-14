import { useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { ToastContainer } from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuthStore } from '../../store/authStore';
import {
  Settings,
  Building2,
  Mail,
  Phone,
  Globe,
  Save,
  User,
  Shield,
} from 'lucide-react';

interface TenantSettings {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
}

export default function SettingsPage() {
  const { tenant, user } = useAuthStore();
  const { canManage } = usePermissions();
  const { toasts, removeToast, success, error } = useToast();

  const [formData, setFormData] = useState<TenantSettings>({
    name: tenant?.name || '',
    email: tenant?.email || '',
    phone: tenant?.phone || '',
    address: '',
    city: '',
    country: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement tenant update API call
      // await tenantService.update(tenant.id, formData);
      success('Ayarlar başarıyla güncellendi');
    } catch (err: any) {
      error(err.response?.data?.error || 'Ayarlar güncellenirken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ayarlar</h1>
            <p className="text-gray-600 mt-1">Sistem ve şirket ayarlarını yönetin</p>
          </div>
          <Settings className="w-8 h-8 text-gray-400" />
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Company Information */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center mb-6">
                <Building2 className="w-6 h-6 text-primary-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Şirket Bilgileri</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Şirket Adı *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input"
                      required
                      disabled={!canManage()}
                    />
                  </div>

                  <div>
                    <label className="label">E-posta *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input pl-10"
                        required
                        disabled={!canManage()}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Telefon *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input pl-10"
                        required
                        disabled={!canManage()}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Şehir</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="input"
                      disabled={!canManage()}
                    />
                  </div>

                  <div>
                    <label className="label">Ülke</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="input pl-10"
                        disabled={!canManage()}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Adres</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className="input"
                      disabled={!canManage()}
                    />
                  </div>
                </div>

                {canManage() && (
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary inline-flex items-center"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="space-y-6">
            {/* Current User Info */}
            <div className="card">
              <div className="flex items-center mb-4">
                <User className="w-5 h-5 text-primary-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Kullanıcı Bilgileri</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">E-posta</p>
                  <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Rol</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.role === 'SUPER_ADMIN' && 'Süper Admin'}
                    {user?.role === 'ADMIN' && 'Admin'}
                    {user?.role === 'HR_MANAGER' && 'İK Yöneticisi'}
                    {user?.role === 'MANAGER' && 'Yönetici'}
                    {user?.role === 'EMPLOYEE' && 'Çalışan'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Durum</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Aktif
                  </span>
                </div>
              </div>
            </div>

            {/* Tenant Info */}
            <div className="card">
              <div className="flex items-center mb-4">
                <Shield className="w-5 h-5 text-primary-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Tenant Bilgileri</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Şirket Adı</p>
                  <p className="text-sm font-medium text-gray-900">{tenant?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Subdomain</p>
                  <p className="text-sm font-medium text-gray-900">
                    {tenant?.subdomain || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Plan</p>
                  <p className="text-sm font-medium text-gray-900">
                    {tenant?.planType === 'FREE' && 'Ücretsiz'}
                    {tenant?.planType === 'BASIC' && 'Temel'}
                    {tenant?.planType === 'PROFESSIONAL' && 'Profesyonel'}
                    {tenant?.planType === 'ENTERPRISE' && 'Kurumsal'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Abonelik Durumu</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tenant?.subscriptionStatus === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {tenant?.subscriptionStatus === 'ACTIVE' && 'Aktif'}
                    {tenant?.subscriptionStatus === 'TRIAL' && 'Deneme'}
                    {tenant?.subscriptionStatus === 'EXPIRED' && 'Süresi Dolmuş'}
                    {tenant?.subscriptionStatus === 'CANCELLED' && 'İptal Edilmiş'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

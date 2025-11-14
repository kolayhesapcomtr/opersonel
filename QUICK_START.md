# 🚀 oPersonel - Hızlı Başlangıç Kılavuzu

## Render.com'da İlk Kurulum

### 1️⃣ Veritabanı Migration ve Seed İşlemleri

Render.com'da deployment tamamlandıktan sonra, veritabanını hazırlamak için aşağıdaki adımları izleyin:

#### Adım 1: Backend Shell'e Giriş

1. Render.com dashboard'a gidin
2. **opersonel-backend** servisinizi seçin
3. Sağ üstteki **"Shell"** butonuna tıklayın
4. Terminal açılacak

#### Adım 2: Migration Çalıştırın

Shell'de aşağıdaki komutu çalıştırın:

```bash
cd backend
npx prisma migrate deploy
```

✅ Bu komut tüm database tablolarını oluşturacak.

#### Adım 3: Demo Verileri Yükleyin (Seed)

Hemen ardından seed komutunu çalıştırın:

```bash
npx tsx prisma/seed.ts
```

✅ Bu komut demo şirketi, çalışanları ve kullanıcıları oluşturacak.

### 2️⃣ Demo Kullanıcı Bilgileri

Seed işlemi tamamlandıktan sonra aşağıdaki kullanıcılarla login olabilirsiniz:

#### 👨‍💼 Admin Kullanıcı
- **Email:** `admin@democompany.com`
- **Şifre:** `password123`
- **Şirket Kodu:** `demo-company`
- **Yetki:** Tam yetki (tüm modüller)

#### 👤 Manager Kullanıcı
- **Email:** `fatma.kaya@democompany.com`
- **Şifre:** `password123`
- **Şirket Kodu:** `demo-company`
- **Yetki:** IT departmanı yöneticisi

#### 👤 Çalışan Kullanıcı
- **Email:** `ali.celik@democompany.com`
- **Şifre:** `password123`
- **Şirket Kodu:** `demo-company`
- **Yetki:** Standart çalışan

---

## 🔐 Yeni Şirket Kaydı

### Frontend'de Kayıt Olma

1. Frontend URL'nize gidin: `https://opersonel-frontend.onrender.com`
2. **"Kayıt Ol"** butonuna tıklayın
3. Aşağıdaki bilgileri doldurun:

**Şirket Bilgileri:**
- Şirket Adı: Örn. "Acme Şirketi"
- Şirket Kodu (slug): Örn. "acme" (benzersiz olmalı)
- Email: Şirket email adresi
- Telefon: İsteğe bağlı

**İlk Kullanıcı (Admin):**
- Email: Admin kullanıcı email
- Şifre: Minimum 6 karakter
- Ad Soyad: İsteğe bağlı

4. **"Kayıt Ol"** butonuna tıklayın
5. Başarılı olursa otomatik login olacaksınız

---

## ⚙️ Environment Variables (Render.com)

### Backend Environment Variables

Render.com'da backend servisiniz için aşağıdaki environment variable'ları ayarlayın:

```bash
# Database (otomatik oluşturulur)
DATABASE_URL=postgresql://...

# JWT Secret (otomatik generate edilir)
JWT_SECRET=your-secret-key-here

# CORS Origin (frontend URL'niz)
CORS_ORIGIN=https://opersonel-frontend.onrender.com

# Node Environment
NODE_ENV=production

# Port (otomatik)
PORT=10000
```

### Frontend Environment Variables

Frontend için:

```bash
# Backend API URL
VITE_API_URL=https://opersonel-backend.onrender.com/api
```

---

## 🐛 Sorun Giderme

### Login Çalışmıyor

**Sebep 1: Migration çalışmadı**
```bash
# Backend Shell'de:
cd backend
npx prisma migrate deploy
```

**Sebep 2: Seed çalışmadı (demo kullanıcılar yok)**
```bash
# Backend Shell'de:
cd backend
npx tsx prisma/seed.ts
```

**Sebep 3: CORS hatası**
- Backend'de `CORS_ORIGIN` environment variable'ını kontrol edin
- Frontend URL'nizle eşleşmeli

**Sebep 4: API erişilemiyor**
- Backend health check: `https://opersonel-backend.onrender.com/health`
- API test: `https://opersonel-backend.onrender.com/api`

### Kayıt Olurken Hata

**"Kayıt başarısız"** hatası alıyorsanız:

1. **Database bağlantısını kontrol edin:**
```bash
# Backend Shell'de:
cd backend
npx prisma db pull
```

2. **Browser Console'u kontrol edin:**
   - F12 tuşuna basın
   - Console tab'ına gidin
   - CORS veya Network hatası var mı?

3. **Backend logs'ları kontrol edin:**
   - Render.com → Backend Service → Logs
   - Hata mesajlarına bakın

### Database Reset (Dikkatli!)

Eğer database'i sıfırdan oluşturmak isterseniz:

```bash
# Backend Shell'de:
cd backend

# Tüm tabloları sil
npx prisma migrate reset --force

# Migration'ları çalıştır
npx prisma migrate deploy

# Seed verilerini yükle
npx tsx prisma/seed.ts
```

⚠️ **UYARI:** Bu işlem TÜM verileri siler!

---

## 📱 Erişim URL'leri

Deployment tamamlandıktan sonra:

- **Frontend:** `https://opersonel-frontend.onrender.com`
- **Backend API:** `https://opersonel-backend.onrender.com/api`
- **Health Check:** `https://opersonel-backend.onrender.com/health`
- **Database:** PostgreSQL (Render internal)

---

## 🎯 Sonraki Adımlar

1. ✅ Migration ve Seed çalıştırdınız
2. ✅ Demo kullanıcı ile login oldunuz
3. ➡️ Kendi şirketinizi kaydedin
4. ➡️ Çalışanları ekleyin
5. ➡️ Departman ve pozisyonları oluşturun
6. ➡️ İzin türlerini özelleştirin

---

## 📞 Destek

Sorun yaşıyorsanız:

1. Backend Logs: Render.com → opersonel-backend → Logs
2. Frontend Network: Browser F12 → Network tab
3. Database: Backend Shell → `npx prisma studio`

---

## 🔒 Güvenlik Önerileri

**Production için:**

1. **JWT_SECRET** değiştirin (güçlü random string)
2. **Demo kullanıcıların şifrelerini** değiştirin
3. **CORS_ORIGIN** sadece kendi domain'inizle sınırlayın
4. **Database backup** alın düzenli olarak

---

## 📝 Notlar

- Render.com free tier: 15 dakika inactivity sonrası backend uyur (cold start)
- Database: 90 gün sonra silinir (free tier)
- İlk request yavaş olabilir (cold start)
- Production için paid plan önerilir

Başarılar! 🎉

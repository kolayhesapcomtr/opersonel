# 🏠 oPersonel - Local Development Setup

Bu rehber, projeyi kendi bilgisayarınızda çalıştırmanız için gerekli adımları içerir.

## 📋 Gereksinimler

Bilgisayarınızda şunlar kurulu olmalı:

- **Node.js** (v18 veya üzeri) - [İndir](https://nodejs.org/)
- **PostgreSQL** (v14 veya üzeri) - [İndir](https://www.postgresql.org/download/)
- **Git** - [İndir](https://git-scm.com/)

## 🚀 Kurulum Adımları

### 1️⃣ Projeyi Clone Edin

```bash
git clone https://github.com/kolayhesapcomtr/opersonel.git
cd opersonel
```

### 2️⃣ PostgreSQL Database Oluşturun

PostgreSQL'i başlatın ve yeni bir database oluşturun:

```bash
# PostgreSQL'e bağlanın (Windows'ta pgAdmin kullanabilirsiniz)
psql -U postgres

# Database oluşturun
CREATE DATABASE opersonel;

# Çıkış
\q
```

### 3️⃣ Backend Environment Ayarları

Backend klasöründe `.env` dosyası oluşturun:

```bash
cd backend
```

`backend/.env` dosyasını oluşturun ve içine şunları yazın:

```env
# Database
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/opersonel"

# Server
NODE_ENV=development
PORT=5000

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS
CORS_ORIGIN=http://localhost:5173
```

**ÖNEMLİ:**
- `your_password` kısmını PostgreSQL şifrenizle değiştirin
- `JWT_SECRET` için güçlü bir şifre kullanın

### 4️⃣ Backend Dependencies Kurun

```bash
# backend klasöründeyken
npm install
```

### 5️⃣ Database Migration ve Seed

```bash
# Prisma client oluştur
npx prisma generate

# Database tablolarını oluştur
npx prisma migrate dev

# Demo verileri yükle
npx tsx prisma/seed.ts
```

### 6️⃣ Frontend Environment Ayarları

Ana klasöre dönün ve frontend ayarlarını yapın:

```bash
cd ../frontend
```

`frontend/.env` dosyasını oluşturun:

```env
VITE_API_URL=http://localhost:5000
```

### 7️⃣ Frontend Dependencies Kurun

```bash
# frontend klasöründeyken
npm install
```

## ▶️ Projeyi Çalıştırma

İki ayrı terminal açın:

### Terminal 1: Backend

```bash
cd backend
npm run dev
```

Backend şu adreste çalışacak: `http://localhost:5000`

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Frontend şu adreste açılacak: `http://localhost:5173`

## 🎉 Giriş Yapın

Tarayıcınızda `http://localhost:5173` adresine gidin ve demo hesapla giriş yapın:

### Demo Hesaplar

#### 1. Admin Hesabı
- **Email:** `admin@democompany.com`
- **Şifre:** `password123`
- **Şirket Kodu:** `demo-company`
- **Rol:** Admin (Tüm yetkilere sahip)

#### 2. HR Manager Hesabı
- **Email:** `hr@democompany.com`
- **Şifre:** `password123`
- **Şirket Kodu:** `demo-company`
- **Rol:** İK Müdürü

#### 3. Çalışan Hesabı
- **Email:** `john.doe@democompany.com`
- **Şifre:** `password123`
- **Şirket Kodu:** `demo-company`
- **Rol:** Çalışan

## 🔧 Yararlı Komutlar

### Database'i Sıfırla ve Yeniden Oluştur

```bash
cd backend

# Database'i temizle
npx prisma migrate reset

# Demo verileri tekrar yükle
npx tsx prisma/seed.ts
```

### Prisma Studio (Database GUI)

Database'i görsel olarak incelemek için:

```bash
cd backend
npx prisma studio
```

Tarayıcıda `http://localhost:5555` açılacak.

### Build (Production)

#### Backend Build

```bash
cd backend
npm run build
npm start
```

#### Frontend Build

```bash
cd frontend
npm run build
npm run preview
```

## 🐛 Sorun Giderme

### Port Zaten Kullanılıyor

Eğer `Port 5000 already in use` hatası alırsanız:

**Backend `.env` dosyasında:**
```env
PORT=5001
```

**Frontend `.env` dosyasında:**
```env
VITE_API_URL=http://localhost:5001
```

### Database Bağlantı Hatası

PostgreSQL'in çalıştığından emin olun:

```bash
# Windows
services.msc (postgresql servisini kontrol edin)

# Mac
brew services list

# Linux
sudo systemctl status postgresql
```

### Migration Hataları

Eğer migration hataları alırsanız, database'i sıfırlayın:

```bash
cd backend
npx prisma migrate reset
npx tsx prisma/seed.ts
```

## 📚 Ek Kaynaklar

- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)

## 💡 İpuçları

1. **Hot Reload:** Kod değişikliklerinde otomatik yeniden başlatma için `npm run dev` kullanın
2. **Database Changes:** Prisma schema değiştirdikten sonra `npx prisma migrate dev --name degisiklik_adi` çalıştırın
3. **Type Safety:** TypeScript hataları için IDE'nizde (VS Code) Prisma ve TypeScript extensionları kurun

## 🆘 Yardım

Sorun yaşarsanız:
1. Terminal'deki hata mesajlarını kontrol edin
2. `.env` dosyalarının doğru yapılandırıldığından emin olun
3. PostgreSQL'in çalıştığını doğrulayın
4. `node_modules` klasörlerini silip `npm install` çalıştırın

---

Başarılı bir geliştirme! 🚀

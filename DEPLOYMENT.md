# Render.com Deployment Guide

Bu guide ile oPersonel uygulamasını **ÜCRETSİZ** olarak Render.com'da deploy edebilirsiniz.

## 📋 Ön Gereksinimler

- [x] GitHub hesabı
- [x] Render.com hesabı (GitHub ile giriş yapabilirsiniz)
- [x] Proje GitHub'a push edilmiş olmalı

---

## 🚀 Deployment Adımları

### 1. GitHub'a Push

Eğer henüz yapmadıysanız, projeyi GitHub'a push edin:

```bash
git add .
git commit -m "feat: Ready for Render deployment"
git push origin main
```

### 2. Render.com'a Giriş

1. https://render.com adresine gidin
2. "Get Started for Free" butonuna tıklayın
3. GitHub hesabınızla giriş yapın

### 3. Blueprint Kullanarak Deploy

#### Otomatik Yöntem (Önerilen)

1. Render Dashboard'da "New +" butonuna tıklayın
2. "Blueprint" seçeneğini seçin
3. GitHub repository'nizi seçin (opersonel)
4. `render.yaml` dosyası otomatik algılanacak
5. "Apply" butonuna tıklayın

#### Manuel Environment Variables

Aşağıdaki environment variable'ları manuel olarak eklemeniz gerekecek:

**Backend (opersonel-backend):**
```
NODE_ENV=production
PORT=5000
DATABASE_URL=[Otomatik atanacak]
JWT_SECRET=[Render otomatik generate edecek]
CORS_ORIGIN=https://opersonel-frontend.onrender.com
```

**Frontend (opersonel-frontend):**
```
VITE_API_URL=https://opersonel-backend.onrender.com/api
```

---

## 📝 Manuel Deployment (Alternatif)

Blueprint yerine manuel deploy etmek isterseniz:

### A. PostgreSQL Database

1. Dashboard'da "New +" → "PostgreSQL"
2. Name: `opersonel-db`
3. Database: `opersonel`
4. User: `opersonel` (otomatik)
5. Region: Frankfurt (veya size en yakın)
6. "Create Database" tıklayın
7. **Internal Database URL**'yi kopyalayın

### B. Backend Deploy

1. Dashboard'da "New +" → "Web Service"
2. GitHub repository'nizi bağlayın
3. Ayarlar:
   - **Name:** `opersonel-backend`
   - **Region:** Frankfurt
   - **Branch:** main
   - **Root Directory:** (boş bırakın)
   - **Environment:** Node
   - **Build Command:**
     ```
     cd backend && npm install && npx prisma generate
     ```
   - **Start Command:**
     ```
     cd backend && npx prisma migrate deploy && npm start
     ```
   - **Plan:** Free

4. Environment Variables ekleyin:
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=[Yukarıda kopyaladığınız URL]
   JWT_SECRET=[Güçlü bir random string]
   CORS_ORIGIN=https://opersonel-frontend.onrender.com
   ```

5. "Create Web Service" tıklayın

### C. Frontend Deploy

1. Dashboard'da "New +" → "Static Site"
2. Aynı GitHub repository'yi seçin
3. Ayarlar:
   - **Name:** `opersonel-frontend`
   - **Region:** Frankfurt
   - **Branch:** main
   - **Root Directory:** (boş bırakın)
   - **Build Command:**
     ```
     cd frontend && npm install && npm run build
     ```
   - **Publish Directory:**
     ```
     frontend/dist
     ```

4. Environment Variables:
   ```
   VITE_API_URL=https://opersonel-backend.onrender.com/api
   ```

5. "Create Static Site" tıklayın

---

## ⚙️ Deployment Sonrası

### 1. Database Migration Kontrolü

Backend deploy loglarını kontrol edin. `npx prisma migrate deploy` başarıyla çalışmalı.

Hata alırsanız:
1. Backend Dashboard → Shell açın
2. Şu komutu çalıştırın:
   ```bash
   cd backend && npx prisma migrate deploy
   ```

### 2. İlk Tenant ve User Oluşturma

Backend Shell'de:
```bash
cd backend
npx prisma db seed
```

veya API üzerinden:
```bash
curl -X POST https://opersonel-backend.onrender.com/api/tenants/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Şirketi",
    "slug": "test-sirketi",
    "email": "admin@test.com",
    "password": "Test123456"
  }'
```

### 3. URL'leri Test Etme

**Frontend:** https://opersonel-frontend.onrender.com
**Backend:** https://opersonel-backend.onrender.com/health
**API:** https://opersonel-backend.onrender.com/api

---

## 🐛 Troubleshooting

### Build Hatası

**Hata:** `Module not found`
**Çözüm:** package.json dosyalarını kontrol edin. Tüm dependencies yüklü olmalı.

### Database Connection Hatası

**Hata:** `Can't reach database server`
**Çözüm:**
1. DATABASE_URL'in doğru olduğundan emin olun
2. PostgreSQL instance'ın çalıştığını kontrol edin
3. Internal Database URL kullandığınızdan emin olun

### CORS Hatası

**Hata:** `CORS policy blocked`
**Çözüm:**
1. Backend'de CORS_ORIGIN environment variable'ını kontrol edin
2. Frontend URL'ini tam olarak ekleyin (sonunda / olmadan)

### Free Plan Limitler

- **Sleep Mode:** 15 dakika inactivity sonrası backend uyur
- **750 saat/ay:** Backend çalışma süresi limiti
- **Database:** 90 gün sonra silinir (ücretsiz plan)

---

## 🔄 Güncelleme (CI/CD)

Render otomatik deploy eder:
1. GitHub'a push yapın
2. Render otomatik algılar
3. Yeniden build ve deploy eder

Manuel deploy:
- Render Dashboard → Service → "Manual Deploy" → "Deploy latest commit"

---

## 💰 Ücretli Plan'a Geçiş

Daha iyi performans için:

**Starter Plan** ($7/ay per service):
- ✅ Sleep mode yok
- ✅ Sınırsız saat
- ✅ Daha hızlı CPU
- ✅ Database kalıcı

**Toplam maliyet:** ~$21/ay (Backend + Frontend + Database)

---

## 📚 Faydalı Linkler

- [Render Documentation](https://render.com/docs)
- [Prisma Deploy](https://www.prisma.io/docs/guides/deployment)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

---

## ✅ Deployment Checklist

- [ ] GitHub repository oluşturuldu
- [ ] Kod GitHub'a push edildi
- [ ] Render.com hesabı açıldı
- [ ] PostgreSQL database oluşturuldu
- [ ] Backend service oluşturuldu
- [ ] Frontend static site oluşturuldu
- [ ] Environment variables ayarlandı
- [ ] Database migration çalıştırıldı
- [ ] İlk tenant/user oluşturuldu
- [ ] Frontend'den login test edildi

---

**Deploy tamamlandı! 🎉**

Artık uygulamanız Render.com üzerinde çalışıyor ve herkesle paylaşabilirsiniz.

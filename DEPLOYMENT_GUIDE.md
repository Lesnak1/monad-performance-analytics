# MPAS - Vercel Deployment Rehberi

## 🚀 Vercel'e Deploy Etme Adımları

### 1. Vercel'e Proje Bağlama

```bash
# Vercel CLI kurulum (eğer yoksa)
npm i -g vercel

# Proje dizininde
vercel login
vercel --prod
```

### 2. Vercel Dashboard Ayarları

**Build & Development Settings:**
- Framework Preset: `Next.js`
- Build Command: `cd frontend && npm run build`
- Output Directory: `frontend/.next`
- Install Command: `cd frontend && npm install`
- Development Command: `cd frontend && npm run dev`

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app
```

### 3. Otomatik Deployment

Her commit'te otomatik deploy için GitHub ile bağlantı:

1. Vercel Dashboard → Import Project → GitHub'dan seç
2. Repository: `your-username/monad-performance-analytics`
3. Root Directory: `/` (boş bırak)
4. Build settings yukarıdaki gibi ayarla

### 4. Production Optimizasyonları

✅ **Yapılan İyileştirmeler:**

**Frontend Optimizasyonları:**
- Sadeleştirilmiş dashboard tasarımı
- Professional footer eklendi
- Gereksiz component'ler kaldırıldı
- API routes Vercel'e uyumlu hale getirildi

**API Optimizasyonları:**
- Backend API'lar Next.js API routes'a taşındı
- RPC endpoint'leri güncellendi (DRPC + Official)
- Caching eklendi (5 saniye)
- CORS headers düzenlendi

**Performance Optimizasyonları:**
- Webpack konfigürasyonu
- Image optimization
- Bundle size optimization
- Server-side rendering

### 5. Yeni RPC Endpoints

Projeye eklenen yeni endpoint'ler:
- `https://monad-testnet.drpc.org` (Primary)
- `https://testnet-rpc.monad.xyz` (Primary)
- Backup endpoint'ler korundu

### 6. API Routes

**Frontend API Routes:**
- `/api/monad-metrics` - Real-time blockchain metrics
- `/api/network-status` - Network connection status

**Özellikler:**
- Real-time Monad Testnet data
- Automatic RPC failover
- Error handling
- Response caching

### 7. Deployment Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel --prod
```

### 8. Domain Configuration

**Custom Domain Ayarları (Opsiyonel):**
1. Vercel Dashboard → Domains
2. Add custom domain
3. DNS records'u güncelle
4. SSL otomatik aktif

### 9. Monitoring

**Performance Monitoring:**
- Vercel Analytics aktif
- Real-time logs
- Error tracking
- Build time optimization

### 10. Troubleshooting

**Common Issues:**

**Build Errors:**
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

**API Errors:**
- Check RPC endpoints are accessible
- Verify environment variables
- Check Vercel function logs

**CORS Issues:**
- CORS headers configured in next.config.js
- API routes have proper headers

## 🎯 Production URLs

**Expected URLs after deployment:**
- Main App: `https://your-domain.vercel.app`
- API Metrics: `https://your-domain.vercel.app/api/monad-metrics`
- Network Status: `https://your-domain.vercel.app/api/network-status`

## ✅ Ready for Production

✅ **Vercel-Ready Features:**
- Standalone output mode
- API routes instead of separate backend
- Optimized webpack config
- CORS configured
- Environment variables set
- Performance optimized
- Professional UI design
- Real Monad Testnet integration

## 🔧 Post-Deployment

1. **Test all API endpoints**
2. **Verify real-time data**
3. **Check mobile responsiveness**
4. **Monitor performance metrics**
5. **Update social media links**

---

**🚀 Projeniz artık production-ready ve Vercel'e deploy edilmeye hazır!** 
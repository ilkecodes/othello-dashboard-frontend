#!/bin/bash
set -e

echo "🚀 Frontend API URL Düzeltme - TAM ÇÖZÜM"
echo "═══════════════════════════════════════════"
echo ""

cd /Users/ilkeileri/othello-dashboard-frontend

# 1. Backup al
echo "💾 Backup alınıyor..."
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r pages components lib app "$BACKUP_DIR/" 2>/dev/null || true
echo "✅ Backup: $BACKUP_DIR"
echo ""

# 2. lib klasörü oluştur
echo "📁 lib/ klasörü oluşturuluyor..."
mkdir -p lib

# 3. config.ts oluştur
echo "📝 lib/config.ts"
cat > lib/config.ts << 'EOF'
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  dashboard: '/api/trends/dashboard',
  search: '/api/trends/search',
  analyze: '/api/trends/analyze',
  influencerStats: '/api/influencer-stats/stats',
  influencerSaved: '/api/influencer-stats/saved',
  advancedSearch: '/api/advanced-search/advanced-search',
  health: '/health',
};
EOF

# 4. api.ts oluştur
echo "📝 lib/api.ts"
cat > lib/api.ts << 'EOF'
import { API_URL } from './config';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const url = `${API_URL}${endpoint}`;
    console.log('🌐 API Request:', url);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ApiError(response.status, `${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof ApiError) throw error;
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
    throw new Error('Unknown error');
  }
}

export const api = {
  getDashboard: () => apiClient('/api/trends/dashboard'),
  searchTrends: (keyword: string, days = 7) =>
    apiClient('/api/trends/search', {
      method: 'POST',
      body: JSON.stringify({ keyword, days }),
    }),
  analyzeTrend: (query: string, limit = 10) =>
    apiClient('/api/trends/analyze', {
      method: 'POST',
      body: JSON.stringify({ query, limit }),
    }),
  getInfluencerStats: () => apiClient('/api/influencer-stats/stats'),
  getSavedInfluencers: () => apiClient('/api/influencer-stats/saved'),
  advancedSearch: (params: any) =>
    apiClient('/api/advanced-search/advanced-search', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  health: () => apiClient('/health'),
};
EOF

# 5. .env.local oluştur
echo "📝 .env.local"
cat > .env.local << 'EOF'
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Production için Railway URL'ini buraya yapıştır:
# NEXT_PUBLIC_API_URL=https://your-railway-app.up.railway.app
EOF

# 6. .env.example
cat > .env.example << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF

# 7. .gitignore güncelle
if ! grep -q ".env.local" .gitignore 2>/dev/null; then
  echo "" >> .gitignore
  echo "# Environment" >> .gitignore
  echo ".env.local" >> .gitignore
  echo ".env.*.local" >> .gitignore
fi

# 8. Hardcoded URL'leri bul ve göster
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Hardcoded URL'ler bulundu:"
echo ""
grep -rn "localhost:8000\|http://localhost\|https://localhost" \
  --include="*.js" --include="*.ts" --include="*.tsx" --include="*.jsx" \
  pages components app 2>/dev/null | head -10 || echo "  (Hiç bulunamadı - iyi!)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ API client hazır!"
echo ""
echo "📋 ŞİMDİ MANUEL OLARAK YAPMALISIN:"
echo ""
echo "1️⃣  Tüm fetch() çağrılarını değiştir:"
echo ""
echo "   Yukarıda listelenen dosyalarda:"
echo ""
echo "   ❌ Eski:"
echo "   fetch('http://localhost:8000/api/trends/dashboard')"
echo ""
echo "   ✅ Yeni:"
echo "   import { api } from '@/lib/api';"
echo "   api.getDashboard()"
echo ""
echo "2️⃣  Railway URL'ini ekle (.env.local):"
echo "   Railway'den URL al ve .env.local dosyasına yapıştır"
echo ""
echo "3️⃣  Test et:"
echo "   npm run dev"
echo "   http://localhost:3000"
echo ""
echo "4️⃣  Git commit:"
echo "   git add ."
echo "   git commit -m 'fix: Use environment variable for API URL'"
echo "   git push origin main"
echo ""
echo "5️⃣  Vercel Environment Variables:"
echo "   Vercel Dashboard > Settings > Environment Variables"
echo "   NEXT_PUBLIC_API_URL = https://your-railway-url.up.railway.app"
echo "   → Redeploy"
echo ""
echo "🎯 Örnek kod düzeltmesi için 'example_page_fix' artifact'ına bak!"
echo ""

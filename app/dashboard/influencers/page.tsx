'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { searchInfluencers, getClients } from '@/lib/api';
import { Users, TrendingUp } from 'lucide-react';

/* ================= Helpers ================= */
const toText = (v: unknown): string => {
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
  try { return JSON.stringify(v, null, 2); } catch { return String(v); }
};

const toNumber = (v: unknown): number => {
  const n = typeof v === 'string' ? Number(v) : (typeof v === 'number' ? v : NaN);
  return Number.isFinite(n) ? n : NaN;
};

const formatNumber = (v: unknown): string => {
  const n = toNumber(v);
  return Number.isFinite(n) ? n.toLocaleString() : '-';
};

const formatMoney = (v: unknown): string => {
  const n = toNumber(v);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : '-';
};

const formatPercent = (v: unknown): string => {
  const n = toNumber(v);
  return Number.isFinite(n) ? `%${n}` : '-';
};

/* ================= Component ================= */
export default function InfluencersPage() {
  // Client dropdown
  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState<string>(''); // dropdown string ister

  // Username fallback
  const [username, setUsername] = useState('');

  // Filters
  const [sector, setSector] = useState('Gıda ve İçecek');
  const [location, setLocation] = useState('Cyprus');
  const [minFollowers, setMinFollowers] = useState('5000');
  const [maxFollowers, setMaxFollowers] = useState('100000');
  const [minEngagement, setMinEngagement] = useState('2'); // % olarak

  // Results
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load clients for dropdown
  useEffect(() => {
    (async () => {
      try {
        const res = await getClients();
        setClients(Array.isArray(res?.data) ? res.data : []);
      } catch (e) {
        console.error('Müşteriler yüklenemedi', e);
        setClients([]);
      }
    })();
  }, []);

  const canSearch = useMemo(() => {
    // En azından ya client seçilmeli ya da username girilmeli
    return Boolean(clientId || username);
  }, [clientId, username]);

  const handleSearch = async () => {
    if (!canSearch) return;
    setLoading(true);
    try {
      // Esnek payload: backend client_id veya username ile aramayı desteklemeli
      const payload: any = {
        sector,
        goals: ['Marka Bilinirliği'],
        age_range: '18-65',
        gender: 'Tümü',
        location,
        min_followers: parseInt(minFollowers || '0', 10),
        max_followers: parseInt(maxFollowers || '0', 10),
        platforms: ['instagram'],
        sales_goal: 'Satış Odaklı',
        min_engagement_rate: parseFloat(minEngagement || '0'), // %
      };

      if (clientId) payload.client_id = isNaN(Number(clientId)) ? clientId : Number(clientId);
      if (!clientId && username) payload.username = username.replace(/^@/, ''); // @ilke -> ilke

      const res = await searchInfluencers(payload);
      setResults(res?.data ?? res);
    } catch (error) {
      console.error('Influencer arama hatası:', error);
      setResults({ total_found: 0, total_estimated_cost: 0, recommended_influencers: [] });
    } finally {
      setLoading(false);
    }
  };

  const recommended = useMemo(() => {
    const list = (results?.recommended_influencers ?? []) as any[];
    return Array.isArray(list) ? list : [];
  }, [results]);

  const totalFound = useMemo(() => formatNumber(results?.total_found), [results]);
  const totalCost = useMemo(() => formatMoney(results?.total_estimated_cost), [results]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Influencer Keşfi</h1>
        <p className="text-slate-600">Müşteri seç veya Instagram kullanıcı adıyla ara; filtrele ve önerileri gör.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Arama Kriterleri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Client seç ya da username gir */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Müşteri (varsa seç)</label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Müşteri seçin" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={String(c.id)} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">Seçmezsen alttaki kullanıcı adıyla ara.</p>
            </div>

            <div>
              <label className="text-sm font-medium">Instagram Kullanıcı Adı (opsiyonel)</label>
              <Input
                placeholder="@kullanici"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">Müşteri yoksa bunu kullan.</p>
            </div>
          </div>

          {/* Filtreler */}
          <div className="grid md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-sm font-medium">Sektör</label>
              <Input value={sector} onChange={(e) => setSector(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Lokasyon</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Min Etkileşim Oranı (%)</label>
              <Input
                type="number"
                step="0.1"
                value={minEngagement}
                onChange={(e) => setMinEngagement(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Min Takipçi</label>
              <Input
                type="number"
                value={minFollowers}
                onChange={(e) => setMinFollowers(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Takipçi</label>
              <Input
                type="number"
                value={maxFollowers}
                onChange={(e) => setMaxFollowers(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleSearch} disabled={loading || !canSearch}>
            {loading ? 'Aranıyor...' : 'Influencer Ara'}
          </Button>
          {!canSearch && (
            <p className="text-xs text-red-600 mt-1">Müşteri seçin veya bir Instagram kullanıcı adı girin.</p>
          )}
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{totalFound} Influencer Bulundu</h2>
            <div className="text-right">
              <p className="text-sm text-slate-600">Toplam Tahmini Maliyet</p>
              <p className="text-2xl font-bold">{totalCost}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.map((inf: any, i: number) => {
              const key = String(inf?.id ?? inf?.username ?? i);
              const usernameSafe = toText(inf?.username);
              const tier = toText(inf?.tier);
              const score = formatNumber(inf?.score);
              const followers = formatNumber(inf?.followers);
              const engagement = formatPercent(inf?.engagement_rate);
              const biography = toText(inf?.biography);
              const estimated = formatMoney(inf?.estimated_cost);

              return (
                <Card key={key} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {usernameSafe ? `@${usernameSafe}` : '@unknown'}
                        </CardTitle>
                        {tier && <Badge className="mt-2">{tier}</Badge>}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-600">Skor</p>
                        <p className="text-2xl font-bold">{score}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-600" />
                        <span className="text-sm font-semibold">{followers} takipçi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-slate-600" />
                        <span className="text-sm">{engagement} etkileşim</span>
                      </div>
                      {biography && (
                        <p className="text-xs text-slate-600 line-clamp-2">{biography}</p>
                      )}
                      <div className="pt-2 border-t">
                        <p className="text-xs text-slate-600">Tahmini Maliyet</p>
                        <p className="text-lg font-bold">{estimated}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


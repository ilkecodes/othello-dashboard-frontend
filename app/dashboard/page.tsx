'use client';

import { useEffect, useState } from 'react';
import { getClients, getContent, getInfluencers } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, TrendingUp, UserSearch } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    clients: 0,
    content: 0,
    influencers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [clientsRes, contentRes, influencersRes] = await Promise.all([
        getClients(),
        getContent(),
        getInfluencers(),
      ]);

      setStats({
        clients: clientsRes.data.length,
        content: contentRes.data.length,
        influencers: influencersRes.data.length,
      });
    } catch (error) {
      console.error('Stats yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-slate-600">OthelloAI Marketing Platform'a hoş geldiniz</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Müşteriler</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.clients}</div>
            <p className="text-xs text-slate-500 mt-1">Toplam müşteri sayısı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">İçerikler</CardTitle>
            <FileText className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.content}</div>
            <p className="text-xs text-slate-500 mt-1">Üretilen içerik sayısı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Influencers</CardTitle>
            <UserSearch className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.influencers}</div>
            <p className="text-xs text-slate-500 mt-1">Keşfedilen influencer</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hızlı Başlangıç</CardTitle>
          <CardDescription>Platformu kullanmaya başlamak için bu adımları takip edin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white text-sm font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold">Müşteri Ekleyin</h3>
                <p className="text-sm text-slate-600">Yeni bir müşteri profili oluşturun</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white text-sm font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold">Marka Sesi Oluşturun</h3>
                <p className="text-sm text-slate-600">Instagram'dan içerik çekerek AI ile marka sesi oluşturun</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white text-sm font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold">İçerik Üretin</h3>
                <p className="text-sm text-slate-600">AI ile markanıza özel içerikler oluşturun</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Hash, Zap, Activity } from 'lucide-react';

const API = 'https://othello-backend-production-2ff4.up.railway.app';

export default function TrendsPage() {
  const [clients, setClients] = useState([]);
  const [activeTab, setActiveTab] = useState('client');
  
  // Müşteri bazlı state
  const [clientId, setClientId] = useState('');
  const [clientKeywords, setClientKeywords] = useState('');
  
  // Genel tarama state
  const [generalKeywords, setGeneralKeywords] = useState('');
  
  // Results
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(API + '/api/clients/')
      .then(r => r.json())
      .then(setClients)
      .catch(console.error);
  }, []);

  const handleClientScan = async () => {
    if (!clientId || !clientKeywords) {
      alert('Müşteri ve keyword seçin!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API + '/api/trends/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          keywords: clientKeywords.split(',').map(k => k.trim()),
          limit: 30
        })
      });

      const data = await res.json();
      setResults(data);
    } catch (e) {
      alert('Tarama hatası: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralScan = async () => {
    if (!generalKeywords) {
      alert('Keyword girin!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API + '/api/trends/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: 'general',
          keywords: generalKeywords.split(',').map(k => k.trim()),
          limit: 30
        })
      });

      const data = await res.json();
      setResults(data);
    } catch (e) {
      alert('Tarama hatası: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const getTrendColor = (score) => {
    if (score >= 0.08) return 'bg-red-100 text-red-800';
    if (score >= 0.05) return 'bg-orange-100 text-orange-800';
    if (score >= 0.03) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  const getTrendIcon = (score) => {
    if (score >= 0.08) return '🔥';
    if (score >= 0.05) return '📈';
    if (score >= 0.03) return '📊';
    return '🌱';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trend Tarama</h1>
        <p className="text-slate-600">Instagram hashtag analizi ile trendleri yakalayın</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="client">👤 Müşteri Bazlı</TabsTrigger>
          <TabsTrigger value="general">🌍 Genel Tarama</TabsTrigger>
        </TabsList>

        {/* MÜŞTERİ BAZLI TARAMA */}
        <TabsContent value="client" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Müşteri Bazlı Trend Tarama</CardTitle>
              <CardDescription>Müşteri seçin ve keyword'leri girin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Müşteri Seçin</label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Müşteri seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} • {c.brand_guidelines?.industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Keywords (virgülle ayırın)</label>
                <Input
                  value={clientKeywords}
                  onChange={(e) => setClientKeywords(e.target.value)}
                  placeholder="health, wellness, fitness"
                />
                <p className="text-xs text-slate-500 mt-1">
                  İngilizce keyword'ler daha iyi sonuç verir
                </p>
              </div>

              <Button 
                onClick={handleClientScan} 
                disabled={loading || !clientId || !clientKeywords}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Taranıyor...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Trendleri Tara
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GENEL TARAMA */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Genel Trend Tarama</CardTitle>
              <CardDescription>Herhangi bir konuda trend araştırması yapın</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Keywords (virgülle ayırın)</label>
                <Input
                  value={generalKeywords}
                  onChange={(e) => setGeneralKeywords(e.target.value)}
                  placeholder="fashion, style, ootd"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Popüler konular: fashion, food, travel, fitness, tech
                </p>
              </div>

              <Button 
                onClick={handleGeneralScan} 
                disabled={loading || !generalKeywords}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Taranıyor...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Genel Tarama Yap
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* SONUÇLAR */}
      {results && results.trends && results.trends.length > 0 && (
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Trend Sonuçları</h2>
            <p className="text-slate-600">
              {results.client && `${results.client} için `}
              {results.trends_found} trend bulundu
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.trends.map((trend, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getTrendColor(trend.trending_score)}>
                      {getTrendIcon(trend.trending_score)} 
                      Score: {trend.trending_score.toFixed(3)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Hash className="h-5 w-5 text-pink-600" />
                    {trend.keyword}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-slate-50 rounded text-center">
                        <p className="text-xs text-slate-600">Posts</p>
                        <p className="text-lg font-bold">{trend.post_count}</p>
                      </div>
                      <div className="p-2 bg-blue-50 rounded text-center">
                        <p className="text-xs text-blue-600">Engagement</p>
                        <p className="text-lg font-bold text-blue-900">
                          {trend.avg_engagement?.toFixed(0)}
                        </p>
                      </div>
                    </div>

                    {trend.recommendation && (
                      <div className="flex items-start gap-2 p-2 bg-amber-50 rounded">
                        <Zap className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-900">
                          {trend.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {results && results.trends_found === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Trend bulunamadı</p>
            <p className="text-sm">Farklı keyword'ler deneyin</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

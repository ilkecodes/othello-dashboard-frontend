'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { searchInfluencers, getClients } from '@/lib/api';
import { Search, Users, TrendingUp, CheckCircle, ExternalLink, Download, Star, List } from 'lucide-react';

type Client = any;
type Influencer = {
  username: string;
  name?: string;
  bio?: string;
  profile_pic?: string;
  followers?: number;
  engagement_rate?: number;
  posts_count?: number;
  is_verified?: boolean;
  is_business?: boolean;
  agency_score?: number;
};

const niches = [
  { value: 'fashion', label: '👗 Moda', keywords: ['fashion', 'style', 'ootd'] },
  { value: 'beauty', label: '💄 Güzellik', keywords: ['beauty', 'makeup', 'skincare'] },
  { value: 'food', label: '🍕 Yemek', keywords: ['food', 'foodie', 'restaurant'] },
  { value: 'fitness', label: '💪 Fitness', keywords: ['fitness', 'gym', 'workout'] },
  { value: 'travel', label: '✈️ Seyahat', keywords: ['travel', 'wanderlust'] },
  { value: 'tech', label: '💻 Teknoloji', keywords: ['tech', 'gadgets', 'technology'] },
  { value: 'lifestyle', label: '🌟 Yaşam', keywords: ['lifestyle', 'daily'] },
  { value: 'health', label: '🏥 Sağlık', keywords: ['health', 'wellness', 'healthcare'] },
];

export default function InfluencersPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchMode, setSearchMode] = useState<'client' | 'general'>('general');
  const [clientId, setClientId] = useState<string>('');
  const [niche, setNiche] = useState<string>('');
  const [customKeywords, setCustomKeywords] = useState<string>('');
  const [minFollowers, setMinFollowers] = useState<number>(1000);
  const [maxFollowers, setMaxFollowers] = useState<number>(500000);
  const [minEngagement, setMinEngagement] = useState<number>(1.0);
  const [location, setLocation] = useState<string>('');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [businessOnly, setBusinessOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'engagement_rate' | 'followers' | 'avg_likes' | 'posts_30d'>('engagement_rate');
  const [results, setResults] = useState<Influencer[]>([]);
  const [shortlist, setShortlist] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [cpm, setCpm] = useState<number>(200);

  useEffect(() => {
    getClients()
      .then((res) => {
        const data = Array.isArray(res?.data) ? res.data : [];
        setClients(data);
      })
      .catch(console.error);
  }, []);

  const selectedClient = useMemo(
    () => clients.find((c: any) => String(c.id) === String(clientId)),
    [clients, clientId]
  );

  const suggestedKeywords: string[] = useMemo(() => {
    const fromKeywords =
      selectedClient?.keywords && Array.isArray(selectedClient.keywords.keywords)
        ? selectedClient.keywords.keywords
        : [];
    const industry = selectedClient?.brand_guidelines?.industry || selectedClient?.industry;
    const ig = selectedClient?.instagram_username;
    return [ ...(fromKeywords as string[]), industry, ig ]
      .filter(Boolean)
      .map((x: any) => String(x))
      .slice(0, 8);
  }, [selectedClient]);

  const handleSearch = async () => {
    const searchKeywords =
      customKeywords.trim().length > 0
        ? customKeywords.split(',').map((k) => k.trim()).filter(Boolean)
        : niche
        ? (niches.find((n) => n.value === niche)?.keywords ?? [])
        : [];

    if (searchMode === 'client' && !clientId) {
      alert('Müşteri seçin!');
      return;
    }
    if (searchKeywords.length === 0) {
      alert('Niş seçin veya anahtar kelime girin!');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        search_type: 'hashtag',
        search_value: searchKeywords[0],
        min_followers: minFollowers,
        max_followers: maxFollowers,
        min_engagement: (Number(minEngagement) || 0) / 100,
        location: location || undefined,
        verified_only: verifiedOnly,
        business_only: businessOnly,
        limit: 30
      };

      const res = await searchInfluencers(payload);
      const data = Array.isArray(res?.data?.results) ? res.data.results : [];
      setResults(data);
    } catch (err) {
      console.error('Arama hatası:', err);
      alert('Arama başarısız');
    } finally {
      setLoading(false);
    }
  };

  const addToShortlist = (inf: Influencer) => {
    if (!shortlist.find((s) => s.username === inf.username)) {
      setShortlist((prev) => prev.concat(inf));
    }
  };

  const removeFromShortlist = (username: string) => {
    setShortlist((prev) => prev.filter((s) => s.username !== username));
  };

  const downloadCSV = () => {
    const header = ['username', 'followers', 'engagement_rate(%)', 'avg_likes', 'verified', 'link'];
    const lines = [header.join(',')].concat(
      shortlist.map((r: any) =>
        [
          r.username,
          r.followers || 0,
          ((Number(r.engagement_rate) || 0) * 100).toFixed(2),
          r.avg_likes || '',
          r.is_verified ? 'yes' : 'no',
          `https://instagram.com/${r.username}`,
        ].join(',')
      )
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'influencer-shortlist.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const avgFollowers =
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + (r.followers || 0), 0) / results.length)
      : 0;
  const avgEngagement =
    results.length > 0
      ? ((results.reduce((sum, r) => sum + (Number(r.engagement_rate) || 0), 0) / results.length) * 100).toFixed(2)
      : '0.00';
  const totalReach = shortlist.reduce(
    (sum, r: any) => sum + (r.followers || 0) * (Number(r.engagement_rate) || 0) * 0.6,
    0
  );
  const estimatedBudget = Math.round((totalReach / 1000) * (Number(cpm) || 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Influencer Keşif</h1>
          <p className="text-slate-600">Instagram influencer'larını keşfedin</p>
        </div>
        {shortlist.length > 0 && (
          <Button variant="outline" onClick={downloadCSV}>
            <Download className="mr-2 h-4 w-4" />
            CSV İndir ({shortlist.length})
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant={searchMode === 'general' ? 'default' : 'outline'}
          onClick={() => setSearchMode('general')}
        >
          🌍 Genel Arama
        </Button>
        <Button
          variant={searchMode === 'client' ? 'default' : 'outline'}
          onClick={() => setSearchMode('client')}
        >
          🎯 Müşteri Bazlı
        </Button>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{results.length}</div><div className="text-xs text-slate-600">Hesap</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{avgFollowers.toLocaleString()}</div><div className="text-xs text-slate-600">Ort. Takipçi</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{avgEngagement}%</div><div className="text-xs text-slate-600">Engagement</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{shortlist.length}</div><div className="text-xs text-slate-600">Kısa Liste</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">₺{estimatedBudget.toLocaleString()}</div><div className="text-xs text-slate-600">Bütçe</div></CardContent></Card>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Filtreler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {searchMode === 'client' && (
              <div>
                <Label>Müşteri</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c: any) => (
                      <SelectItem key={String(c.id)} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Niş</Label>
              <Select value={niche} onValueChange={setNiche}>
                <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                <SelectContent>
                  {niches.map((n) => (
                    <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Anahtar Kelimeler</Label>
              <Input value={customKeywords} onChange={(e) => setCustomKeywords(e.target.value)} placeholder="cafe, brunch" />
            </div>

            <div>
              <Label>Takipçi</Label>
              <div className="flex gap-2">
                <Input type="number" value={minFollowers} onChange={(e) => setMinFollowers(Number(e.target.value))} />
                <Input type="number" value={maxFollowers} onChange={(e) => setMaxFollowers(Number(e.target.value))} />
              </div>
            </div>

            <div>
              <Label>Min Engagement (%)</Label>
              <Input type="number" step="0.1" value={minEngagement} onChange={(e) => setMinEngagement(Number(e.target.value))} />
            </div>

            <Button onClick={handleSearch} disabled={loading} className="w-full">
              <Search className="mr-2 h-4 w-4" />
              {loading ? 'Aranıyor...' : 'Ara'}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((inf, idx) => {
                const isInShortlist = !!shortlist.find((s) => s.username === inf.username);
                const engRate = ((Number(inf.engagement_rate) || 0) * 100).toFixed(2);
                return (
                  <Card key={idx} className={isInShortlist ? 'border-blue-300' : ''}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {inf.profile_pic && <img src={inf.profile_pic} alt={inf.username} className="w-16 h-16 rounded-full" />}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">@{inf.username}</h4>
                            {inf.is_verified && <CheckCircle className="h-4 w-4 text-blue-500" />}
                          </div>
                          <div className="flex gap-4 text-sm mb-2">
                            <span>{(inf.followers || 0).toLocaleString()} takipçi</span>
                            <span>{engRate}% engagement</span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <a href={`https://instagram.com/${inf.username}`} target="_blank" rel="noopener noreferrer">
                                Profil
                              </a>
                            </Button>
                            {isInShortlist ? (
                              <Button size="sm" variant="destructive" onClick={() => removeFromShortlist(inf.username)}>Çıkar</Button>
                            ) : (
                              <Button size="sm" onClick={() => addToShortlist(inf)}>Ekle</Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>Filtreleri ayarlayın</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

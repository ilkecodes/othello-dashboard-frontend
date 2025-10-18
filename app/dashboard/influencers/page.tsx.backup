'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { searchInfluencers, getClients } from '@/lib/api';
import { Search, Users, TrendingUp, CheckCircle, ExternalLink, Download, Star, List } from 'lucide-react';

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
  const [clients, setClients] = useState<any[]>([]);
  const [searchMode, setSearchMode] = useState<'client' | 'general'>('general');
  
  // Filters
  const [clientId, setClientId] = useState('');
  const [niche, setNiche] = useState('');
  const [customKeywords, setCustomKeywords] = useState('');
  const [minFollowers, setMinFollowers] = useState(1000);
  const [maxFollowers, setMaxFollowers] = useState(500000);
  const [minEngagement, setMinEngagement] = useState(1.0);
  const [location, setLocation] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [businessOnly, setBusinessOnly] = useState(false);
  const [sortBy, setSortBy] = useState('engagement_rate');
  
  const [results, setResults] = useState<any[]>([]);
  const [shortlist, setShortlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cpm, setCpm] = useState(200);

  useEffect(() => {
    getClients()
      .then(res => {
        const data = Array.isArray(res?.data) ? res.data : [];
        setClients(data);
      })
      .catch(console.error);
  }, []);

  const selectedClient = clients.find((c: any) => String(c.id) === String(clientId));
  
  // Suggested keywords from client
  const suggestedKeywords = selectedClient ? [
    ...(Array.isArray(selectedClient.keywords?.keywords) ? selectedClient.keywords.keywords : []),
    selectedClient.brand_guidelines?.industry,
    selectedClient.industry,
  ].filter(Boolean).slice(0, 8) : [];

  const handleSearch = async () => {
    const searchKeywords = customKeywords 
      ? customKeywords.split(',').map(k => k.trim()).filter(Boolean)
      : niche 
        ? niches.find(n => n.value === niche)?.keywords || []
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
      const res = await searchInfluencers({
        search_type: 'hashtag',
        search_value: searchKeywords[0],
        min_followers: minFollowers,
        max_followers: maxFollowers,
        min_engagement: (Number(minEngagement) || 0) / 100,
        location: location || undefined,
        verified_only: verifiedOnly,
        business_only: businessOnly,
        limit: 30
      });

      const data = Array.isArray(res?.data?.results) ? res.data.results : [];
      setResults(data);
    } catch (error) {
      console.error('Arama hatası:', error);
      alert('Arama başarısız');
    } finally {
      setLoading(false);
    }
  };

  const addToShortlist = (inf: any) => {
    if (!shortlist.find(s => s.username === inf.username)) {
      setShortlist([...shortlist, inf]);
    }
  };

  const removeFromShortlist = (username: string) => {
    setShortlist(shortlist.filter(s => s.username !== username));
  };

  const downloadCSV = () => {
    const header = ['username', 'followers', 'engagement_rate(%)', 'avg_likes', 'verified', 'link'];
    const lines = [header.join(',')].concat(
      shortlist.map(r => [
        r.username,
        r.followers || 0,
        ((Number(r.engagement_rate) || 0) * 100).toFixed(2),
        r.avg_likes || '',
        r.is_verified ? 'yes' : 'no',
        `https://instagram.com/${r.username}`
      ].join(','))
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'influencer-shortlist.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // KPI calculations
  const avgFollowers = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + (r.followers || 0), 0) / results.length)
    : 0;
  const avgEngagement = results.length > 0
    ? (results.reduce((sum, r) => sum + (Number(r.engagement_rate) || 0), 0) / results.length * 100).toFixed(2)
    : '0.00';
  const totalReach = shortlist.reduce((sum, r) => sum + (r.followers || 0) * (Number(r.engagement_rate) || 0) * 0.6, 0);
  const estimatedBudget = Math.round((totalReach / 1000) * cpm);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Influencer Keşif</h1>
          <p className="text-slate-600">Instagram influencer'larını keşfedin ve analiz edin</p>
        </div>
        
        {/* Shortlist Badge */}
        {shortlist.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadCSV}>
              <Download className="mr-2 h-4 w-4" />
              CSV İndir ({shortlist.length})
            </Button>
          </div>
        )}
      </div>

      {/* Search Mode Toggle */}
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
          🎯 Müşteri Bazlı Arama
        </Button>
      </div>

      {/* KPI Bar */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{results.length}</div>
              <div className="text-xs text-slate-600">Bulunan Hesap</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{avgFollowers.toLocaleString()}</div>
              <div className="text-xs text-slate-600">Ort. Takipçi</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{avgEngagement}%</div>
              <div className="text-xs text-slate-600">Ort. Engagement</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{shortlist.length}</div>
              <div className="text-xs text-slate-600">Kısa Liste</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">₺{estimatedBudget.toLocaleString()}</div>
              <div className="text-xs text-slate-600">Tahmini Bütçe</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sol Panel - Filtreler */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Arama Filtreleri</CardTitle>
              <CardDescription>İnfluencer kriterlerini belirleyin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Müşteri */}
              {searchMode === 'client' && (
                <div>
                  <Label>Müşteri</Label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Müşteri seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c: any) => (
                        <SelectItem key={String(c.id)} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Suggested Keywords */}
                  {suggestedKeywords.length > 0 && (
                    <div className="mt-2">
                      <Label className="text-xs text-slate-500">Önerilen Kelimeler:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {suggestedKeywords.map((kw: string) => (
                          <Badge
                            key={kw}
                            variant="secondary"
                            className="cursor-pointer hover:bg-slate-200"
                            onClick={() => setCustomKeywords(prev => prev ? `${prev}, ${kw}` : kw)}
                          >
                            #{kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Niş */}
              <div>
                <Label>Niş</Label>
                <Select value={niche} onValueChange={setNiche}>
                  <SelectTrigger>
                    <SelectValue placeholder="Niş seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {niches.map((n) => (
                      <SelectItem key={n.value} value={n.value}>
                        {n.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Keywords */}
              <div>
                <Label>Özel Anahtar Kelimeler</Label>
                <Input
                  value={customKeywords}
                  onChange={(e) => setCustomKeywords(e.target.value)}
                  placeholder="cafe, brunch, cyprus"
                />
                <p className="text-xs text-slate-500 mt-1">Virgülle ayırın</p>
              </div>

              {/* Takipçi Aralığı */}
              <div>
                <Label>Takipçi Aralığı</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="number"
                    value={minFollowers}
                    onChange={(e) => setMinFollowers(Number(e.target.value))}
                    placeholder="Min"
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    value={maxFollowers}
                    onChange={(e) => setMaxFollowers(Number(e.target.value))}
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Min Engagement */}
              <div>
                <Label>Min. Engagement Rate (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={minEngagement}
                  onChange={(e) => setMinEngagement(Number(e.target.value))}
                />
              </div>

              {/* Location */}
              <div>
                <Label>Lokasyon (opsiyonel)</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Cyprus, Istanbul"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                  />
                  <span className="text-sm">Sadece Onaylı Hesaplar</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={businessOnly}
                    onChange={(e) => setBusinessOnly(e.target.checked)}
                  />
                  <span className="text-sm">Sadece İşletme Hesapları</span>
                </label>
              </div>

              {/* CPM for Budget */}
              <div>
                <Label>CPM (Bütçe Tahmini İçin)</Label>
                <Input
                  type="number"
                  value={cpm}
                  onChange={(e) => setCpm(Number(e.target.value))}
                  placeholder="200"
                />
              </div>

              <Button onClick={handleSearch} disabled={loading} className="w-full" size="lg">
                <Search className="mr-2 h-4 w-4" />
                {loading ? 'Aranıyor...' : 'Influencer Ara'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sağ Panel - Sonuçlar */}
        <div className="lg:col-span-2">
          {results.length > 0 ? (
            <div className="space-y-4">
              <div className="grid gap-4">
                {results.map((inf: any, idx: number) => {
                  const isInShortlist = shortlist.find(s => s.username === inf.username);
                  const engagementRate = ((Number(inf.engagement_rate) || 0) * 100).toFixed(2);
                  
                  return (
                    <Card key={idx} className={isInShortlist ? 'border-blue-300 bg-blue-50' : ''}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {inf.profile_pic && (
                            <img
                              src={inf.profile_pic}
                              alt={inf.username}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          )}

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">@{inf.username}</h4>
                                  {inf.is_verified && (
                                    <CheckCircle className="h-4 w-4 text-blue-500" />
                                  )}
                                  {inf.is_business && (
                                    <Badge variant="outline" className="text-xs">İşletme</Badge>
                                  )}
                                </div>
                                {inf.bio && (
                                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                    {inf.bio}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-4 text-sm mb-3">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">{(inf.followers || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">{engagementRate}%</span>
                              </div>
                              {inf.posts_count && (
                                <span className="text-slate-500">{inf.posts_count} gönderi</span>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" asChild>
                                
                                  href={`https://instagram.com/${inf.username}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Profil
                                </a>
                              </Button>
                              {isInShortlist ? (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeFromShortlist(inf.username)}
                                >
                                  <List className="h-3 w-3 mr-1" />
                                  Listeden Çıkar
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => addToShortlist(inf)}
                                >
                                  <Star className="h-3 w-3 mr-1" />
                                  Kısa Listeye Ekle
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold mb-2">Influencer Bekleniyor</h3>
                <p className="text-slate-600">Filtreleri ayarlayın ve arama yapın</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

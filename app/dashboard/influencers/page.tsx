'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { searchInfluencers } from '@/lib/api';
import { Search, Users, Heart, TrendingUp, Check, Briefcase, Filter, MapPin, Plus } from 'lucide-react';

export default function InfluencersPage() {
  const [searchType, setSearchType] = useState('niche');
  const [searchValue, setSearchValue] = useState('');
  const [customNiche, setCustomNiche] = useState('');
  const [showCustomNiche, setShowCustomNiche] = useState(false);
  const [filters, setFilters] = useState({
    minFollowers: 10000,
    maxFollowers: 1000000,
    minEngagement: 2,
    location: '',
    verifiedOnly: false,
    businessOnly: false,
  });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const niches = [
    { value: 'moda', label: '👗 Moda & Stil' },
    { value: 'guzellik', label: '💄 Güzellik & Makyaj' },
    { value: 'yemek', label: '🍽️ Yemek & Mutfak' },
    { value: 'saglik', label: '💪 Sağlık & Fitness' },
    { value: 'seyahat', label: '✈️ Seyahat' },
    { value: 'teknoloji', label: '💻 Teknoloji' },
    { value: 'anne', label: '👶 Anne & Bebek' },
    { value: 'ev', label: '🏡 Ev & Dekorasyon' },
  ];

  const locations = [
    'Türkiye',
    'İstanbul',
    'Ankara',
    'İzmir',
    'Bursa',
    'Antalya',
  ];

  const followerRanges = [
    { label: 'Nano (1K-10K)', min: 1000, max: 10000 },
    { label: 'Mikro (10K-50K)', min: 10000, max: 50000 },
    { label: 'Orta (50K-100K)', min: 50000, max: 100000 },
    { label: 'Makro (100K-500K)', min: 100000, max: 500000 },
    { label: 'Mega (500K+)', min: 500000, max: 10000000 },
  ];

  const handleSearch = async () => {
    const finalSearchValue = showCustomNiche && customNiche ? customNiche : searchValue;
    
    if (!finalSearchValue && searchType === 'niche') {
      alert('Lütfen bir niche seçin veya girin');
      return;
    }
    
    setLoading(true);
    try {
      const searchData = {
        search_type: searchType,
        search_value: finalSearchValue,
        min_followers: filters.minFollowers,
        max_followers: filters.maxFollowers,
        min_engagement: filters.minEngagement,
        location: filters.location || undefined,
        verified_only: filters.verifiedOnly,
        business_only: filters.businessOnly,
        limit: 20
      };

      const res = await searchInfluencers(searchData);
      setResults(res.data?.results || []);
    } catch (error: any) {
      console.error('Arama hatası:', error);
      alert('Arama başarısız: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const setFollowerRange = (range: any) => {
    setFilters({ ...filters, minFollowers: range.min, maxFollowers: range.max });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Influencer Keşfi</h1>
        <p className="text-slate-600">Profesyonel influencer arama ve filtreleme</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Keşif Yöntemi</CardTitle>
          <CardDescription>Nasıl aramak istersiniz?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => { setSearchType('niche'); setShowCustomNiche(false); }}
              className={`p-4 border-2 rounded-lg text-left transition ${
                searchType === 'niche' ? 'border-pink-600 bg-pink-50' : 'border-slate-200'
              }`}
            >
              <TrendingUp className="w-5 h-5 mb-2" />
              <div className="font-semibold">Niche Araması</div>
              <p className="text-sm text-slate-500">Sektöre göre keşfet</p>
            </button>
            
            <button
              onClick={() => { setSearchType('hashtag'); setShowCustomNiche(false); }}
              className={`p-4 border-2 rounded-lg text-left transition ${
                searchType === 'hashtag' ? 'border-pink-600 bg-pink-50' : 'border-slate-200'
              }`}
            >
              <Search className="w-5 h-5 mb-2" />
              <div className="font-semibold">Hashtag</div>
              <p className="text-sm text-slate-500">Hashtag ile bul</p>
            </button>
            
            <button
              onClick={() => { setSearchType('username'); setShowCustomNiche(false); }}
              className={`p-4 border-2 rounded-lg text-left transition ${
                searchType === 'username' ? 'border-pink-600 bg-pink-50' : 'border-slate-200'
              }`}
            >
              <Users className="w-5 h-5 mb-2" />
              <div className="font-semibold">Kullanıcı Adı</div>
              <p className="text-sm text-slate-500">Profil ara</p>
            </button>
          </div>

          {searchType === 'niche' && !showCustomNiche && (
            <div className="space-y-2">
              <Select value={searchValue} onValueChange={setSearchValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Niche seçin" />
                </SelectTrigger>
                <SelectContent>
                  {niches.map(n => (
                    <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCustomNiche(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Özel Niche Gir
              </Button>
            </div>
          )}

          {searchType === 'niche' && showCustomNiche && (
            <div className="space-y-2">
              <Input
                placeholder="Örn: petcare, gaming, luxury"
                value={customNiche}
                onChange={(e) => setCustomNiche(e.target.value)}
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { setShowCustomNiche(false); setCustomNiche(''); }}
                className="w-full"
              >
                Hazır Listeden Seç
              </Button>
            </div>
          )}

          {searchType !== 'niche' && (
            <Input
              placeholder={searchType === 'hashtag' ? 'Örn: fashion, moda' : 'Örn: cristiano'}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filtreler</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Gizle' : 'Göster'}
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Konum
              </label>
              <Select value={filters.location} onValueChange={(v) => setFilters({...filters, location: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm konumlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tüm konumlar</SelectItem>
                  {locations.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">Not: Bio'da bu konum geçen profiller bulunur</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Takipçi Aralığı</label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {followerRanges.map(range => (
                  <Button
                    key={range.label}
                    variant="outline"
                    size="sm"
                    onClick={() => setFollowerRange(range)}
                    className={
                      filters.minFollowers === range.min && filters.maxFollowers === range.max
                        ? 'border-pink-600 bg-pink-50' 
                        : ''
                    }
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-slate-500">Min Takipçi</label>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minFollowers}
                    onChange={(e) => setFilters({...filters, minFollowers: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500">Max Takipçi</label>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxFollowers}
                    onChange={(e) => setFilters({...filters, maxFollowers: parseInt(e.target.value) || 10000000})}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Min Engagement Rate: {filters.minEngagement}%
              </label>
              <Slider
                value={[filters.minEngagement]}
                onValueChange={(v) => setFilters({...filters, minEngagement: v[0]})}
                min={0}
                max={20}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0%</span>
                <span>10%</span>
                <span>20%</span>
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly}
                  onChange={(e) => setFilters({...filters, verifiedOnly: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-sm">Sadece Doğrulanmış</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.businessOnly}
                  onChange={(e) => setFilters({...filters, businessOnly: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-sm">Sadece İşletme</span>
              </label>
            </div>
          </CardContent>
        )}
      </Card>

      <Button onClick={handleSearch} disabled={loading} className="w-full bg-pink-600" size="lg">
        <Search className="w-5 h-5 mr-2" />
        {loading ? 'Influencer Aranıyor...' : 'Influencer Keşfet'}
      </Button>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{results.length} Influencer Bulundu</h2>
            <Badge variant="outline">
              {filters.minFollowers >= 1000000 ? 'Mega' : 
               filters.minFollowers >= 100000 ? 'Makro' :
               filters.minFollowers >= 50000 ? 'Orta' :
               filters.minFollowers >= 10000 ? 'Mikro' : 'Nano'} Influencer
            </Badge>
          </div>
          {results.map((inf, idx) => (
            <Card key={idx}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {inf.profile_pic_url && (
                    <img src={inf.profile_pic_url} className="w-20 h-20 rounded-full object-cover" alt={inf.username} />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold">@{inf.username}</h3>
                      {inf.is_verified && (
                        <Badge className="bg-blue-500">
                          <Check className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {inf.is_business && (
                        <Badge variant="outline">
                          <Briefcase className="w-3 h-3 mr-1" />
                          Business
                        </Badge>
                      )}
                    </div>
                    {inf.full_name && <p className="text-sm font-medium text-slate-700 mb-1">{inf.full_name}</p>}
                    {inf.biography && <p className="text-sm text-slate-600 mb-2 line-clamp-2">{inf.biography}</p>}
                    <div className="flex gap-6 text-sm">
                      <span>
                        <Users className="w-4 h-4 inline mr-1 text-slate-500" />
                        <strong>{formatNumber(inf.followers)}</strong> takipçi
                      </span>
                      {inf.engagement_rate !== undefined && (
                        <span>
                          <Heart className="w-4 h-4 inline mr-1 text-pink-500" />
                          <strong>{inf.engagement_rate}%</strong> engagement
                        </span>
                      )}
                      {inf.posts && (
                        <span>
                          <strong>{formatNumber(inf.posts)}</strong> gönderi
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    
                      <a href={`https://instagram.com/${inf.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline" className="w-full">
                        Instagram
                      </Button>
                    </a>
                    <Button size="sm" className="bg-pink-600 w-full">
                      Kampanyaya Ekle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && (searchValue || customNiche) && (
        <Card>
          <CardContent className="p-12 text-center text-slate-500">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Sonuç bulunamadı</p>
            <p className="text-sm">Filtrelerinizi değiştirmeyi deneyin</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

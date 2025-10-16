'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { searchInfluencers } from '@/lib/api';
import { Search, Users, Heart, TrendingUp } from 'lucide-react';

export default function InfluencersPage() {
  const [searchType, setSearchType] = useState<'username' | 'hashtag'>('username');
  const [searchValue, setSearchValue] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    
    setLoading(true);
    try {
      const searchData = searchType === 'username' 
        ? { usernames: [searchValue.trim()], limit: 10 }
        : { hashtag: searchValue.trim().replace('#', ''), limit: 10 };

      const res = await searchInfluencers(searchData);
      setResults(res.data?.results || res.data || []);
    } catch (error: any) {
      console.error('Influencer arama hatası:', error);
      alert(error.response?.data?.detail || 'Arama başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || '0';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Influencer Ara</h1>
        <p className="text-slate-600">Instagram influencer'larını bul ve analiz et</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Arama Kriterleri</CardTitle>
          <CardDescription>Username veya hashtag ile ara</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={searchType === 'username' ? 'default' : 'outline'}
              onClick={() => setSearchType('username')}
              className={searchType === 'username' ? 'bg-pink-600' : ''}
            >
              <Users className="w-4 h-4 mr-2" />
              Username
            </Button>
            <Button
              variant={searchType === 'hashtag' ? 'default' : 'outline'}
              onClick={() => setSearchType('hashtag')}
              className={searchType === 'hashtag' ? 'bg-pink-600' : ''}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Hashtag
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder={
                searchType === 'username' 
                  ? 'Örn: cristiano veya @cristiano' 
                  : 'Örn: fashion veya #fashion'
              }
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch} 
              disabled={loading || !searchValue.trim()}
              className="bg-pink-600"
            >
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Aranıyor...' : 'Ara'}
            </Button>
          </div>

          {searchType === 'username' && (
            <p className="text-sm text-slate-500">
              💡 Tip: Tek bir Instagram kullanıcı adı girin (@ olmadan da olur)
            </p>
          )}
          {searchType === 'hashtag' && (
            <p className="text-sm text-slate-500">
              💡 Tip: Bir hashtag girin, en popüler profiller bulunacak
            </p>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold">Sonuçlar ({results.length})</h2>
          {results.map((influencer, idx) => (
            <Card key={idx}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {influencer.profile_pic && (
                    <img
                      src={influencer.profile_pic}
                      alt={influencer.username}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">@{influencer.username}</h3>
                      <Badge variant="outline">Instagram</Badge>
                    </div>
                    
                    {influencer.bio && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {influencer.bio}
                      </p>
                    )}

                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span className="font-medium">{formatNumber(influencer.followers)}</span>
                        <span className="text-slate-500">takipçi</span>
                      </div>
                      
                      {influencer.engagement_rate !== undefined && (
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-pink-500" />
                          <span className="font-medium">{influencer.engagement_rate.toFixed(2)}%</span>
                          <span className="text-slate-500">engagement</span>
                        </div>
                      )}
                    </div>

                    {influencer.url && (
                      
                        href={influencer.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-pink-600 hover:underline mt-2 inline-block"
                      >
                        Profili Görüntüle →
                      </a>
                    )}
                  </div>

                  <Button variant="outline" size="sm">
                    Kampanyaya Ekle
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && searchValue && (
        <Card>
          <CardContent className="p-12 text-center text-slate-500">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Sonuç bulunamadı. Farklı bir arama deneyin.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

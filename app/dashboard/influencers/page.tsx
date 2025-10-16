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
        <p className="text-slate-600">Instagram influencerlarını bul</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Arama</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={searchType === 'username' ? 'default' : 'outline'}
              onClick={() => setSearchType('username')}
            >
              Username
            </Button>
            <Button
              variant={searchType === 'hashtag' ? 'default' : 'outline'}
              onClick={() => setSearchType('hashtag')}
            >
              Hashtag
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder={searchType === 'username' ? 'cristiano' : 'fashion'}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Aranıyor...' : 'Ara'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="grid gap-4">
          {results.map((inf, idx) => (
            <Card key={idx}>
              <CardContent className="p-4">
                <h3>@{inf.username}</h3>
                <p>{formatNumber(inf.followers)} takipçi</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

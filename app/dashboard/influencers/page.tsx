'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { searchInfluencers } from '@/lib/api';
import { Search, Users, Heart, TrendingUp, Check, Briefcase, ExternalLink } from 'lucide-react';

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
        ? { usernames: [searchValue.trim().replace('@', '')], limit: 10 }
        : { hashtag: searchValue.trim().replace('#', ''), limit: 20 };
      const res = await searchInfluencers(searchData);
      setResults(res.data || []);
    } catch (error: any) {
      console.error('Error:', error);
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Influencer Keşfi</h1>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-2">
            <Button variant={searchType === 'username' ? 'default' : 'outline'} onClick={() => setSearchType('username')}>
              Username
            </Button>
            <Button variant={searchType === 'hashtag' ? 'default' : 'outline'} onClick={() => setSearchType('hashtag')}>
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
        <div className="space-y-4">
          {results.map((inf, idx) => (
            <Card key={idx}>
              <CardContent className="p-6 flex gap-4">
                {inf.profile_pic_url && <img src={inf.profile_pic_url} className="w-16 h-16 rounded-full" alt={inf.username} />}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">@{inf.username}</h3>
                    {inf.is_verified && <Badge>Verified</Badge>}
                  </div>
                  {inf.biography && <p className="text-sm text-slate-600">{inf.biography}</p>}
                  <div className="flex gap-4 text-sm mt-2">
                    <span>{formatNumber(inf.followers)} takipçi</span>
                    <span>{formatNumber(inf.posts)} gönderi</span>
                  </div>
                </div>
                <Button size="sm">Kampanyaya Ekle</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

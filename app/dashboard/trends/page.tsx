'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, TrendingUp, Lightbulb, Target, Hash, Clock,
  Zap, BarChart3, Sparkles, ArrowUp, ArrowDown, Minus,
  Music, Globe, Trophy, Loader2, RefreshCw, Film, Image,
  Layers, PlayCircle
} from 'lucide-react';

interface GoogleTrend {
  keyword: string;
  interest: number;
  category: string;
  trend_emoji: string;
}

interface TikTokTrend {
  hashtag: string;
  views: string;
  posts: number;
  growth: string;
  category: string;
  rank: number;
}

interface ContentType {
  type: string;
  percentage: number;
  avg_engagement: number;
  description: string;
  emoji: string;
}

interface ContentTypeAnalysis {
  niche: string;
  total_posts_analyzed: number;
  content_types: {
    distribution: ContentType[];
    insights?: string[];
  };
  top_performing_type: ContentType;
  recommendations: string[];
}

interface DashboardData {
  google_trends: GoogleTrend[];
  tiktok_trends: TikTokTrend[];
  last_updated: string;
}

interface SearchResult {
  query: string;
  niche: any;
  google_analysis: any[];
  tiktok_analysis: any[];
  content_types?: ContentTypeAnalysis;
  ranked_trends: any[];
  ai_insights: any;
}

export default function TrendsPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  const examples = [
    "yemek tarifi videolu",
    "fitness motivasyon",
    "moda kombini",
    "teknoloji haberleri"
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/trends/dashboard`);
      const data = await res.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    setSearchResult(null);
    
    try {
      const res = await fetch(`${API_URL}/api/trends/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      
      const data = await res.json();
      if (data.success) {
        setSearchResult(data.result);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Arama hatası!');
    } finally {
      setSearchLoading(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    const icons: {[key: string]: any} = {
      'video': <PlayCircle className="h-5 w-5" />,
      'carousel': <Layers className="h-5 w-5" />,
      'single_image': <Image className="h-5 w-5" />,
      'story': <Film className="h-5 w-5" />,
      'tutorial': <Lightbulb className="h-5 w-5" />
    };
    return icons[type] || <Image className="h-5 w-5" />;
  };

  const getContentTypeColor = (percentage: number) => {
    if (percentage >= 40) return 'from-green-500 to-emerald-600';
    if (percentage >= 25) return 'from-blue-500 to-cyan-600';
    return 'from-purple-500 to-pink-600';
  };

  const getCategoryColor = (category: string) => {
    const colors: {[key: string]: string} = {
      'food': 'bg-orange-100 text-orange-800',
      'fashion': 'bg-pink-100 text-pink-800',
      'fitness': 'bg-green-100 text-green-800',
      'beauty': 'bg-purple-100 text-purple-800',
      'travel': 'bg-blue-100 text-blue-800',
      'tech': 'bg-gray-100 text-gray-800',
      'entertainment': 'bg-yellow-100 text-yellow-800',
      'lifestyle': 'bg-teal-100 text-teal-800',
      'gaming': 'bg-indigo-100 text-indigo-800',
      'genel': 'bg-slate-100 text-slate-800',
      'türkiye': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🔥 Trend Analiz Dashboard</h1>
          <p className="text-gray-600">Google Trends + TikTok + İçerik Türü Analizi</p>
        </div>
        <Button variant="outline" onClick={loadDashboard} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Niş trend aramak için yazın... (örn: yemek tarifi videolu)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 h-12 text-lg"
              />
              <Button 
                onClick={handleSearch} 
                disabled={searchLoading || !searchQuery.trim()}
                size="lg"
                className="px-8"
              >
                {searchLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {examples.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => setSearchQuery(ex)}
                  className="text-sm px-3 py-1.5 rounded-full bg-white border hover:bg-gray-50 transition"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {searchLoading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="font-semibold">Trend analizi yapılıyor...</p>
              <p className="text-sm text-gray-500 mt-2">Google + TikTok + İçerik türleri analiz ediliyor...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results - Simplified for now */}
      {searchResult && !searchLoading && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Arama Sonuçları</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(searchResult, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dashboard */}
      {!searchResult && !searchLoading && !loading && dashboardData && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Google Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Google Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.google_trends.slice(0, 10).map((trend, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{trend.trend_emoji}</span>
                      <div>
                        <p className="font-semibold">{trend.keyword}</p>
                        <Badge className={`text-xs ${getCategoryColor(trend.category)}`}>
                          {trend.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{trend.interest}</div>
                      <div className="text-xs text-gray-500">/100</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* TikTok Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5 text-pink-600" />
                TikTok Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.tiktok_trends.slice(0, 10).map((trend, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center">
                        {trend.rank}
                      </div>
                      <div>
                        <p className="font-semibold">#{trend.hashtag}</p>
                        <Badge className={`text-xs ${getCategoryColor(trend.category)}`}>
                          {trend.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-pink-600">{trend.views}</div>
                      <div className="text-xs text-gray-500">{trend.growth}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {loading && !searchLoading && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { generateContent, getClients } from '@/lib/api';
import { Sparkles, FileText, Copy, Save } from 'lucide-react';

const contentGoals = [
  { value: 'awareness', label: 'Bilinirlik Artırma', icon: '📢', color: 'blue' },
  { value: 'engagement', label: 'Etkileşim', icon: '❤️', color: 'pink' },
  { value: 'sales', label: 'Satış', icon: '💰', color: 'green' },
  { value: 'education', label: 'Bilgilendirme', icon: '📚', color: 'purple' },
  { value: 'community', label: 'Topluluk', icon: '👥', color: 'orange' }
];

export default function ContentPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState<string>('');
  const [platform, setPlatform] = useState('instagram');
  const [contentType, setContentType] = useState('feed');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [goal, setGoal] = useState('awareness');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getClients()
      .then(res => {
        const data = Array.isArray(res?.data) ? res.data : [];
        setClients(data);
      })
      .catch(console.error);
  }, []);

  const selectedClient = clients.find((c: any) => String(c.id) === String(clientId));

  const handleGenerate = async () => {
    if (!clientId || !topic) {
      alert('Müşteri ve konu seçin!');
      return;
    }

    setLoading(true);
    try {
      const res = await generateContent({
        client_id: clientId,
        platform,
        content_type: contentType,
        topic,
        tone,
        goal
      });
      setResult(res.data);
    } catch (error) {
      console.error('İçerik üretimi hatası:', error);
      alert('İçerik üretilemedi');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const fullText = `${result.caption}\n\n${result.hashtags}\n\n${result.cta}`;
    navigator.clipboard.writeText(fullText);
    alert('İçerik kopyalandı!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">İçerik Üretici</h1>
        <p className="text-slate-600">AI ile otomatik içerik oluşturun</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sol Panel - Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              İçerik Ayarları
            </CardTitle>
            <CardDescription>
              İçeriğinizi özelleştirin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Müşteri Seçimi */}
            <div>
              <Label>Müşteri</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Müşteri seçin" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c: any) => (
                    <SelectItem key={String(c.id)} value={String(c.id)}>
                      {c.name} • {c.brand_guidelines?.industry || c.industry || 'Sektör yok'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedClient && (
                <div className="mt-2 text-sm text-slate-600">
                  <div><strong>Sektör:</strong> {selectedClient.brand_guidelines?.industry || selectedClient.industry}</div>
                </div>
              )}
            </div>

            {/* Platform */}
            <div>
              <Label>Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">📷 Instagram</SelectItem>
                  <SelectItem value="facebook">📘 Facebook</SelectItem>
                  <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
                  <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* İçerik Türü */}
            <div>
              <Label>İçerik Türü</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feed">Feed Post</SelectItem>
                  <SelectItem value="reel">Reels</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Konu */}
            <div>
              <Label>Konu</Label>
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Örn: Yeni ürünümüz hakkında bilgilendirici post"
                rows={3}
              />
            </div>

            {/* Ton */}
            <div>
              <Label>Ton</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Profesyonel</SelectItem>
                  <SelectItem value="friendly">Samimi</SelectItem>
                  <SelectItem value="casual">Rahat</SelectItem>
                  <SelectItem value="formal">Resmi</SelectItem>
                  <SelectItem value="fun">Eğlenceli</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Hedef */}
            <div>
              <Label>İçerik Hedefi</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {contentGoals.map((g) => (
                  <Button
                    key={g.value}
                    variant={goal === g.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGoal(g.value)}
                    className="justify-start"
                  >
                    <span className="mr-2">{g.icon}</span>
                    {g.label}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !clientId || !topic}
              className="w-full"
              size="lg"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {loading ? 'Üretiliyor...' : 'İçerik Üret'}
            </Button>
          </CardContent>
        </Card>

        {/* Sağ Panel - Sonuç */}
        <div className="space-y-4">
          {result ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    Üretilen İçerik
                  </div>
                  {result.success && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      ✓ Başarılı
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Caption */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-slate-600">📝 Caption:</h4>
                  <div className="bg-slate-50 p-4 rounded-lg whitespace-pre-wrap text-sm">
                    {result.caption}
                  </div>
                </div>

                {/* Hashtags */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-slate-600">🏷️ Hashtags:</h4>
                  <div className="bg-slate-50 p-4 rounded-lg text-sm">
                    {result.hashtags}
                  </div>
                </div>

                {/* CTA */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-slate-600">�� Call to Action:</h4>
                  <div className="bg-slate-50 p-4 rounded-lg text-sm">
                    {result.cta}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={copyToClipboard} className="flex-1">
                    <Copy className="mr-2 h-4 w-4" />
                    Tümünü Kopyala
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Save className="mr-2 h-4 w-4" />
                    Kaydet
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold mb-2">İçerik Bekleniyor</h3>
                <p className="text-slate-600">
                  Soldaki formu doldurun ve içerik üretin
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

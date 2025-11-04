'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Copy, Download, Film, Image, FileText } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ContentPage() {
  const [clientName, setClientName] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [contentType, setContentType] = useState('post');
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!clientName || !topic || !goal) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }
    
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch(`${API_URL}/api/content/simple-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: clientName,
          platform,
          content_type: contentType,
          topic,
          goal
        })
      });
      
      const data = await response.json();
      setResult(data.content || 'İçerik üretildi');
    } catch (error) {
      console.error('Error:', error);
      setResult('Hata: İçerik üretilemedi');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    alert('✅ Panoya kopyalandı!');
  };

  const downloadAsText = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clientName}-${contentType}-${Date.now()}.txt`;
    a.click();
  };

  const getContentIcon = (type: string) => {
    if (type === 'reel') return <Film className="h-4 w-4" />;
    if (type === 'carousel') return <Image className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">✨ İçerik Üretimi</h1>
        <p className="text-gray-600">
          AI ile marka kimliğine uygun profesyonel içerik üretin
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Generator Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                İçerik Parametreleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Müşteri Adı */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Müşteri Adı *
                </label>
                <Input
                  placeholder="Örn: Baklava Atölyesi, Dr. Murat Önal, Seluna"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Kayıtlı markalar için görsel kimlik otomatik uygulanır
                </p>
              </div>

              {/* Platform & Content Type */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Platform *
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                  >
                    <option value="instagram">📸 Instagram</option>
                    <option value="tiktok">🎵 TikTok</option>
                    <option value="twitter">🐦 Twitter</option>
                    <option value="linkedin">💼 LinkedIn</option>
                    <option value="facebook">👍 Facebook</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    İçerik Türü *
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                  >
                    <option value="post">📝 Post</option>
                    <option value="reel">🎥 Reel (Detaylı Şablon)</option>
                    <option value="carousel">📸 Carousel</option>
                    <option value="story">⚡ Story</option>
                  </select>
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Konu / Tema *
                </label>
                <Input
                  placeholder="Örn: Ramazan kampanyası, yeni ürün lansmanı, bilinçlendirme"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              {/* Goal */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Amaç / Hedef *
                </label>
                <Textarea
                  placeholder="Örn: Yeni müşteri kazanımı, marka bilinirliği artırma, güven oluşturma"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Content Type Info */}
              {contentType === 'reel' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-blue-800 mb-1">
                    🎥 Reel Formatı
                  </p>
                  <p className="text-blue-700 text-xs">
                    Detaylı üretim şablonu: Hook, zamanlama, görsel tasarım brief, 
                    script ve tasarımcı notları içerir.
                  </p>
                </div>
              )}

              {contentType === 'carousel' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-purple-800 mb-1">
                    📸 Carousel Formatı
                  </p>
                  <p className="text-purple-700 text-xs">
                    5 slaytlık akış formatı: Her slayt için başlık, metin ve görsel brief.
                  </p>
                </div>
              )}

              {/* Generate Button */}
              <Button 
                onClick={handleGenerate} 
                disabled={loading || !clientName || !topic || !goal}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Üretiliyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    İçerik Üret
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result Card */}
          {result && (
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getContentIcon(contentType)}
                    <span>Üretilen İçerik</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4 mr-1" />
                      Kopyala
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadAsText}>
                      <Download className="h-4 w-4 mr-1" />
                      İndir
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{clientName}</Badge>
                    <Badge variant="outline">{platform}</Badge>
                    <Badge variant="outline">{contentType}</Badge>
                  </div>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                      {result}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Kayıtlı Markalar */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="text-sm">🎨 Kayıtlı Markalar</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p className="font-semibold mb-2">Görsel kimlik otomatik uygulanır:</p>
              {[
                'Baklava Atölyesi',
                'Dr. Murat Önal',
                'Seluna',
                'Kemerli Su Restaurant'
              ].map((brand, idx) => (
                <button
                  key={idx}
                  onClick={() => setClientName(brand)}
                  className="w-full text-left p-2 rounded border bg-white hover:bg-gray-50 transition"
                >
                  {brand}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Example Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">💡 Örnek Konular</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  'Ramazan özel kampanya',
                  'Yeni menü tanıtımı',
                  'Müşteri hikayesi',
                  'Bilinçlendirme içeriği',
                  'Marka değerleri paylaşımı'
                ].map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTopic(ex)}
                    className="w-full text-left text-xs p-2 rounded border hover:bg-gray-50"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">📋 İpuçları</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>• Reel formatı = Tam üretim şablonu</p>
              <p>• Carousel = Slayt slayt içerik</p>
              <p>• Kayıtlı markalar = Otomatik görsel brief</p>
              <p>• Hedefi net belirtin</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Copy, Download, Wand2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Client {
  id: number;
  name: string;
  industry: string;
}

export default function ContentPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [contentType, setContentType] = useState('post');
  const [purpose, setPurpose] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  // Müşterileri yükle
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await fetch(`${API_URL}/api/clients`);
      const data = await response.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedClient || !purpose) {
      alert('Lütfen müşteri ve amaç seçin!');
      return;
    }
    
    setLoading(true);
    setResult('');
    
    try {
      // Müşteri bilgisini al
      const client = clients.find(c => c.id === parseInt(selectedClient));
      
      // Prompt oluştur
      const prompt = `
Müşteri: ${client?.name} (${client?.industry})
Platform: ${platform}
İçerik Türü: ${contentType}
Amaç: ${purpose}
${additionalNotes ? `Ek Notlar: ${additionalNotes}` : ''}

Bu bilgilere göre profesyonel bir sosyal medya içeriği oluştur.
      `.trim();

      const response = await fetch(`${API_URL}/api/content/simple-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      const data = await response.json();
      setResult(data.content || data.message || 'İçerik üretildi');
    } catch (error) {
      console.error('Error:', error);
      setResult('Hata: İçerik üretilemedi. Lütfen tekrar deneyin.');
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
    a.download = `content-${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">✨ İçerik Üretimi</h1>
        <p className="text-gray-600">AI ile müşterileriniz için profesyonel sosyal medya içerikleri oluşturun</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Generator Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-purple-600" />
                İçerik Parametreleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Müşteri Seçimi */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Müşteri *
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                >
                  <option value="">Müşteri Seçin</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.industry}
                    </option>
                  ))}
                </select>
                {clients.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Henüz müşteri yok. "Müşteriler" sayfasından ekleyin.
                  </p>
                )}
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
                    <option value="twitter">🐦 Twitter (X)</option>
                    <option value="linkedin">💼 LinkedIn</option>
                    <option value="facebook">�� Facebook</option>
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
                    <option value="story">⚡ Story</option>
                    <option value="reel">🎥 Reel/Video</option>
                    <option value="carousel">📸 Carousel</option>
                  </select>
                </div>
              </div>

              {/* Amaç */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Amaç *
                </label>
                <Input
                  placeholder="Örn: Yeni ürün lansmanı duyurusu, marka bilinirliği artırma"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              {/* Ek Notlar */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Ek Notlar (Opsiyonel)
                </label>
                <Textarea
                  placeholder="Ton, hedef kitle, özel istekler vb."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Generate Button */}
              <Button 
                onClick={handleGenerate} 
                disabled={loading || !selectedClient || !purpose}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    İçerik Üretiliyor...
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
                  <span>✨ Üretilen İçerik</span>
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
                  <div className="flex gap-2">
                    <Badge>{platform}</Badge>
                    <Badge variant="outline">{contentType}</Badge>
                  </div>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{result}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar - Tips & Examples */}
        <div className="space-y-6">
          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">💡 İpuçları</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>• Müşteri bilgilerini eksiksiz doldurun</p>
              <p>• Amacı net ve detaylı belirtin</p>
              <p>• Hedef kitlenizi açıkça tanımlayın</p>
              <p>• Marka sesini ek notlara ekleyin</p>
            </CardContent>
          </Card>

          {/* Example Purposes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">🎯 Örnek Amaçlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  "Yeni ürün lansmanı duyurusu",
                  "Kampanya tanıtımı ve indirim paylaşımı",
                  "Marka hikayesi anlatımı",
                  "Müşteri testimonialleri paylaşımı",
                  "Eğitici içerik ve ipuçları"
                ].map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPurpose(ex)}
                    className="w-full text-left text-xs p-2 rounded border hover:bg-gray-50 transition"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platform Stats */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="text-sm">📊 Platform İstatistikleri</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="flex justify-between">
                <span>Instagram Post:</span>
                <span className="font-semibold">2200 karakter</span>
              </div>
              <div className="flex justify-between">
                <span>TikTok Caption:</span>
                <span className="font-semibold">2200 karakter</span>
              </div>
              <div className="flex justify-between">
                <span>Twitter/X:</span>
                <span className="font-semibold">280 karakter</span>
              </div>
              <div className="flex justify-between">
                <span>LinkedIn:</span>
                <span className="font-semibold">3000 karakter</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

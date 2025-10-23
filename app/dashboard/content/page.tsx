'use client';

import { useState, useEffect } from 'react';
import { getClients, generateContent, getContent } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileText, Copy } from 'lucide-react';

export default function ContentPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [contentList, setContentList] = useState<any[]>([]);

  useEffect(() => {
    loadClients();
    loadContent();
  }, []);

  const loadClients = async () => {
    try {
      const res = await getClients();
      setClients(res.data);
    } catch (error) {
      console.error('Müşteriler yüklenemedi:', error);
    }
  };

  const loadContent = async () => {
    try {
      const res = await getContent();
      setContentList(res.data);
    } catch (error) {
      console.error('İçerikler yüklenemedi:', error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedClient || !prompt) {
      alert('Lütfen müşteri seçin ve prompt girin');
      return;
    }

    setLoading(true);
    try {
      const res = await generateContent({
        client_id: selectedClient,
        platform,
        prompt,
        tone,
      });
      setGeneratedText(res.data.text || '');
      loadContent();
    } catch (error: any) {
      alert('Hata: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText);
    alert('Kopyalandı!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">İçerik Üretimi</h1>
        <p className="text-slate-600">AI ile içerik oluşturun</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam İçerik</CardTitle>
            <FileText className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentList.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yeni İçerik Üret</CardTitle>
          <CardDescription>AI destekli içerik oluşturun</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="Müşteri seçin..." />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>

          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Profesyonel</SelectItem>
              <SelectItem value="casual">Samimi</SelectItem>
              <SelectItem value="friendly">Arkadaşça</SelectItem>
            </SelectContent>
          </Select>

          <Textarea
            placeholder="İçerik konusu veya prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
          />

          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            İçerik Üret
          </Button>

          {generatedText && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Üretilen İçerik:</h4>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Kopyala
                </Button>
              </div>
              <p className="whitespace-pre-wrap">{generatedText}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Son İçerikler</CardTitle>
        </CardHeader>
        <CardContent>
          {contentList.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Henüz içerik üretilmedi</p>
          ) : (
            <div className="space-y-4">
              {contentList.slice(0, 10).map((content: any) => (
                <div key={content.id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">{content.platform}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(content.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{content.text}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

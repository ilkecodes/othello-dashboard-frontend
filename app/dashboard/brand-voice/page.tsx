'use client';

import { useState, useEffect } from 'react';
import { brandVoice, getClients } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, MessageSquare, BarChart3, Copy, CheckCircle2 } from 'lucide-react';

export default function BrandVoicePage() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Step 1: Add Content
  const [contentText, setContentText] = useState('');
  const [platform, setPlatform] = useState('instagram');

  // Step 2: Generate Content
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadProfile();
      loadStats();
    }
  }, [selectedClient]);

  const loadClients = async () => {
    try {
      const res = await getClients();
      setClients(res.data);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadProfile = async () => {
    try {
      const res = await brandVoice.get(selectedClient);
      setProfile(res.data);
    } catch (error) {
      setProfile(null);
    }
  };

  const loadStats = async () => {
    try {
      const res = await brandVoice.stats(selectedClient);
      setStats(res.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAddContent = async () => {
    if (!selectedClient || !contentText) {
      alert('Lütfen müşteri seçin ve içerik girin');
      return;
    }

    setLoading(true);
    try {
      await brandVoice.addCorpus({
        client_id: selectedClient,
        platform,
        text_content: contentText,
      });
      alert('✅ İçerik eklendi!');
      setContentText('');
      loadStats();
    } catch (error: any) {
      alert('Hata: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleBuildVoice = async () => {
    if (!selectedClient) return;

    setLoading(true);
    try {
      await brandVoice.build(selectedClient);
      alert('✅ Marka sesi oluşturuldu!');
      loadProfile();
      loadStats();
    } catch (error: any) {
      alert('Hata: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedClient || !prompt) {
      alert('Lütfen müşteri seçin ve prompt girin');
      return;
    }

    setLoading(true);
    try {
      const res = await brandVoice.generate({
        client_id: selectedClient,
        prompt,
        platform,
      });
      setGeneratedContent(res.data.text);
    } catch (error: any) {
      alert('Hata: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">✨ Marka Sesi AI</h1>
        <p className="text-slate-600">Markanıza özel, AI destekli içerik üretimi</p>
      </div>

      {/* Client Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Müşteri Seçin</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="Bir müşteri seçin..." />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedClient && (
        <>
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">İçerik Sayısı</CardTitle>
                  <MessageSquare className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.corpus_items}</div>
                  <p className="text-xs text-slate-500 mt-1">Toplam içerik</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Üretilen İçerik</CardTitle>
                  <Sparkles className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.generated_contents}</div>
                  <p className="text-xs text-slate-500 mt-1">AI ile üretildi</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Güven Skoru</CardTitle>
                  <BarChart3 className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.confidence_score}%</div>
                  <p className="text-xs text-slate-500 mt-1">Analiz kalitesi</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Brand Voice Profile */}
          {profile && (
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Marka Sesi Profili
                </CardTitle>
                <CardDescription>AI tarafından analiz edilmiş marka kişiliği</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-semibold text-slate-700">Ton:</span>{' '}
                  <Badge variant="secondary" className="ml-2">{profile.tone}</Badge>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Özet:</span>
                  <p className="mt-1 text-slate-600">{profile.voice_summary}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Güven:</span>{' '}
                  <Badge variant="outline" className="ml-2">{profile.confidence_score}%</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 1: Add Content */}
          <Card>
            <CardHeader>
              <CardTitle>Adım 1: Marka İçeriği Ekle</CardTitle>
              <CardDescription>
                Markanızın mevcut içeriklerinden 5-10 örnek ekleyin (Instagram, Twitter vb.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <Textarea
                placeholder="Marka içeriğinizi buraya yapıştırın..."
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                rows={5}
                className="resize-none"
              />

              <Button onClick={handleAddContent} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                İçerik Ekle
              </Button>
            </CardContent>
          </Card>

          {/* Step 2: Build Voice */}
          {stats && stats.corpus_items >= 3 && !profile && (
            <Card className="border-purple-300 bg-purple-50">
              <CardHeader>
                <CardTitle>Adım 2: Marka Sesi Oluştur</CardTitle>
                <CardDescription>
                  {stats.corpus_items} içerik hazır. Analiz için hazırsınız!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleBuildVoice} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  AI ile Marka Sesi Oluştur
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Generate Content */}
          {profile && (
            <Card>
              <CardHeader>
                <CardTitle>Adım 3: İçerik Üret</CardTitle>
                <CardDescription>
                  Markanıza uygun AI destekli içerik oluşturun
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <Textarea
                  placeholder="Ne hakkında içerik üretmek istiyorsunuz? (örn: 'Yaz indirimi duyurusu')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="resize-none"
                />

                <Button onClick={handleGenerate} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  İçerik Üret
                </Button>

                {generatedContent && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        Üretilen İçerik:
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Kopyalandı!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Kopyala
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="whitespace-pre-wrap text-slate-700">{generatedContent}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

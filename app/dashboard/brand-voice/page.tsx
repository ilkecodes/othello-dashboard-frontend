'use client';

import { useState, useEffect } from 'react';
import { brandVoice, getClients } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, MessageSquare, BarChart3, Copy, CheckCircle2, Instagram, History, Plus } from 'lucide-react';

export default function BrandVoicePage() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [generatedHistory, setGeneratedHistory] = useState<any[]>([]);

  // Instagram Sync
  const [instagramUsername, setInstagramUsername] = useState('');
  const [showInstagramSync, setShowInstagramSync] = useState(true);

  // Step 1: Add Content
  const [contentText, setContentText] = useState('');
  const [platform, setPlatform] = useState('instagram');

  // Step 2: Generate Content
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');

  // Müşteri değiştiğinde localStorage'dan yükle
  useEffect(() => {
    loadClients();
    
    // Son seçilen müşteriyi yükle
    const savedClientId = localStorage.getItem('selectedClientId');
    if (savedClientId) {
      setSelectedClient(savedClientId);
    }
  }, []);

  useEffect(() => {
    if (selectedClient) {
      // Müşteriyi localStorage'a kaydet
      localStorage.setItem('selectedClientId', selectedClient);
      
      loadProfile();
      loadStats();
      loadGeneratedHistory();
    }
  }, [selectedClient]);

  const loadClients = async () => {
    try {
      const res = await getClients();
      setClients(res.data);
    } catch (error) {
      console.error('Müşteriler yüklenemedi:', error);
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
      console.error('İstatistikler yüklenemedi:', error);
    }
  };

  const loadGeneratedHistory = () => {
    // localStorage'dan geçmiş içerikleri yükle
    const historyKey = `brandVoiceHistory_${selectedClient}`;
    const savedHistory = localStorage.getItem(historyKey);
    if (savedHistory) {
      try {
        setGeneratedHistory(JSON.parse(savedHistory));
      } catch (e) {
        setGeneratedHistory([]);
      }
    } else {
      setGeneratedHistory([]);
    }
  };

  const saveToHistory = (content: string, promptUsed: string, platform: string) => {
    const historyKey = `brandVoiceHistory_${selectedClient}`;
    const newItem = {
      id: Date.now(),
      content,
      prompt: promptUsed,
      platform,
      timestamp: new Date().toISOString(),
    };
    
    const updatedHistory = [newItem, ...generatedHistory].slice(0, 20); // Son 20 içeriği sakla
    setGeneratedHistory(updatedHistory);
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
  };

  const handleInstagramSync = async () => {
    if (!selectedClient || !instagramUsername) {
      alert('Lütfen müşteri seçin ve Instagram kullanıcı adı girin');
      return;
    }

    setLoading(true);
    try {
      const res = await brandVoice.syncInstagram(selectedClient, instagramUsername, 15);
      alert(`✅ ${res.data.posts_added} Instagram postu eklendi!`);
      setShowInstagramSync(false);
      loadStats();
    } catch (error: any) {
      alert('Hata: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
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
      const generated = res.data.text;
      setGeneratedContent(generated);
      
      // Geçmişe kaydet
      saveToHistory(generated, prompt, platform);
      
      // İstatistikleri güncelle
      loadStats();
    } catch (error: any) {
      alert('Hata: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteFromHistory = (id: number) => {
    const historyKey = `brandVoiceHistory_${selectedClient}`;
    const updatedHistory = generatedHistory.filter(item => item.id !== id);
    setGeneratedHistory(updatedHistory);
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">✨ Marka Sesi AI</h1>
        <p className="text-slate-600">Markanıza özel, AI destekli içerik üretimi</p>
      </div>

      {/* Client Selection - STICKY */}
      <Card className="sticky top-4 z-10 shadow-lg">
        <CardHeader>
          <CardTitle>Müşteri Seçin</CardTitle>
          <CardDescription>Son seçiminiz otomatik kaydedilir</CardDescription>
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
                  <div className="text-2xl font-bold">{generatedHistory.length}</div>
                  <p className="text-xs text-slate-500 mt-1">Bu tarayıcıda</p>
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

          {/* TABS: Yeni İçerik vs Geçmiş */}
          <Tabs defaultValue="new" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new">
                <Plus className="mr-2 h-4 w-4" />
                Yeni İçerik
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="mr-2 h-4 w-4" />
                Geçmiş ({generatedHistory.length})
              </TabsTrigger>
            </TabsList>

            {/* YENİ İÇERİK OLUŞTURMA */}
            <TabsContent value="new" className="space-y-6">
              {/* Instagram Sync */}
              {showInstagramSync && (!stats || stats.corpus_items < 3) && (
                <Card className="border-pink-300 bg-gradient-to-r from-pink-50 to-purple-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Instagram className="h-5 w-5 text-pink-600" />
                      Instagram'dan Otomatik İçerik Çek
                    </CardTitle>
                    <CardDescription>
                      Instagram profilinizden son paylaşımları otomatik olarak alın
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Instagram kullanıcı adı (örn: nike)"
                      value={instagramUsername}
                      onChange={(e) => setInstagramUsername(e.target.value)}
                    />
                    <Button 
                      onClick={handleInstagramSync} 
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Instagram className="mr-2 h-4 w-4" />
                      )}
                      Instagram'dan Çek (15 Post)
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Manuel Add */}
              <Card>
                <CardHeader>
                  <CardTitle>Manuel İçerik Ekle</CardTitle>
                  <CardDescription>İsterseniz manuel olarak da içerik ekleyebilirsiniz</CardDescription>
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
                  />
                  <Button onClick={handleAddContent} disabled={loading} variant="outline">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Manuel Ekle
                  </Button>
                </CardContent>
              </Card>

              {/* Build Voice */}
              {stats && stats.corpus_items >= 3 && !profile && (
                <Card className="border-purple-300 bg-purple-50">
                  <CardHeader>
                    <CardTitle>Marka Sesi Oluştur</CardTitle>
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

              {/* Generate Content */}
              {profile && (
                <Card>
                  <CardHeader>
                    <CardTitle>İçerik Üret</CardTitle>
                    <CardDescription>Markanıza uygun AI destekli içerik oluşturun</CardDescription>
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
                      placeholder="Ne hakkında içerik üretmek istiyorsunuz?"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={3}
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
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedContent)}>
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
            </TabsContent>

            {/* GEÇMİŞ İÇERİKLER */}
            <TabsContent value="history" className="space-y-4">
              {generatedHistory.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-slate-500">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Henüz içerik üretmediniz</p>
                  </CardContent>
                </Card>
              ) : (
                generatedHistory.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.platform}</Badge>
                          <span className="text-sm text-slate-500">
                            {new Date(item.timestamp).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(item.content)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteFromHistory(item.id)}
                          >
                            Sil
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="mt-2">
                        <span className="font-semibold">Prompt:</span> {item.prompt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap text-slate-700">{item.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

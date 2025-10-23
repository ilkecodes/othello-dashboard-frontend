
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, FileText, Target } from 'lucide-react';
import { generateContent, getClients } from '@/lib/api';

/* =========================
   Types
========================= */
type BrandGuidelines = {
  industry?: string | Record<string, unknown>;
  brand_voice?: string | Record<string, unknown>;
  [k: string]: unknown;
};

type Client = {
  id: string | number;
  name: string;
  brand_guidelines?: BrandGuidelines;
};

type GeneratedResult =
  | { content?: unknown; text?: unknown; [k: string]: unknown }
  | string;

/* =========================
   Constants
========================= */
const contentGoals = [
  { value: 'awareness', label: 'Bilinirlik Artırma', icon: '📢', color: 'blue' },
  { value: 'engagement', label: 'Etkileşim', icon: '❤️', color: 'pink' },
  { value: 'sales', label: 'Satış', icon: '💰', color: 'green' },
  { value: 'education', label: 'Bilgilendirme', icon: '📘', color: 'purple' },
  { value: 'community', label: 'Topluluk', icon: '👥', color: 'orange' }
] as const;

const toneOptions = [
  { value: 'professional', label: 'Profesyonel', emoji: '👔' },
  { value: 'friendly', label: 'Samimi', emoji: '😊' },
  { value: 'casual', label: 'Gündelik', emoji: '🙂' },
  { value: 'energetic', label: 'Enerjik', emoji: '⚡' },
  { value: 'inspirational', label: 'İlham Verici', emoji: '✨' },
  { value: 'humorous', label: 'Eğlenceli', emoji: '😄' }
] as const;

const platformTypes: Record<
  string,
  { types: { value: string; label: string; description: string }[] }
> = {
  instagram: {
    types: [
      { value: 'feed', label: 'Feed Post', description: 'Klasik Instagram paylaşımı' },
      { value: 'reel', label: 'Reels', description: 'Kısa video içeriği' },
      { value: 'story', label: 'Story', description: '24 saat görünür içerik' },
      { value: 'carousel', label: 'Carousel', description: 'Çoklu görsel paylaşımı' }
    ]
  },
  facebook: {
    types: [
      { value: 'post', label: 'Post', description: 'Standart paylaşım' },
      { value: 'video', label: 'Video', description: 'Video içeriği' },
      { value: 'event', label: 'Event', description: 'Etkinlik duyurusu' }
    ]
  },
  linkedin: {
    types: [
      { value: 'post', label: 'Post', description: 'Profesyonel paylaşım' },
      { value: 'article', label: 'Article', description: 'Uzun form içerik' },
      { value: 'poll', label: 'Poll', description: 'Anket' }
    ]
  },
  tiktok: {
    types: [
      { value: 'video', label: 'Video', description: 'Kısa video' },
      { value: 'duet', label: 'Duet', description: 'İşbirliği videosu' }
    ]
  }
};

// Tailwind JIT için güvenli renk sınıfları
const colorClasses: Record<string, string> = {
  blue: 'border-blue-600 bg-blue-50',
  pink: 'border-pink-600 bg-pink-50',
  green: 'border-green-600 bg-green-50',
  purple: 'border-purple-600 bg-purple-50',
  orange: 'border-orange-600 bg-orange-50'
};

/* =========================
   Helpers
========================= */
const toText = (v: unknown): string => {
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
  // JSON.stringify ile okunur çıktıya çevir; circular hatasına karşı try/catch
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
};

/* =========================
   Component
========================= */
export default function ContentPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<string>(''); // Select string ister
  const [platform, setPlatform] = useState<string>('instagram');
  const [contentType, setContentType] = useState<string>('feed');
  const [goal, setGoal] = useState<string>('awareness');
  const [topic, setTopic] = useState<string>('');
  const [tone, setTone] = useState<string>('professional');
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Clients yükle
  useEffect(() => {
    (async () => {
      try {
        const res = await getClients(); // beklenen: { data: Client[] }
        const list: Client[] = Array.isArray(res?.data) ? res.data : [];
        setClients(list);
      } catch (e) {
        console.error('Müşteri listesi alınamadı', e);
        setClients([]);
      }
    })();
  }, []);

  // Seçili client (id string karşılaştır)
  const selectedClient = useMemo(
    () => clients.find(c => String(c.id) === clientId),
    [clients, clientId]
  );

  // Platform değişince varsayılan content type güvenli seç
  const handlePlatformChange = (p: string) => {
    setPlatform(p);
    const first = platformTypes[p]?.types?.[0]?.value ?? 'post';
    setContentType(first);
  };

  // İçerik üret
  const handleGenerate = async () => {
    if (!clientId || !topic) return;
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        client_id: isNaN(Number(clientId)) ? clientId : Number(clientId),
        platform,
        content_type: contentType,
        topic,
        tone,
        goal
      };
      const res = await generateContent(payload); // beklenen: { data: any }
      setResult(res?.data ?? res);
    } catch (error) {
      console.error('İçerik üretimi hatası:', error);
      setResult({ content: 'İçerik üretimi sırasında bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const generatedText = useMemo(() => {
    if (!result) return '';
    if (typeof result === 'string') return result;
    const v = (result as any)?.content ?? (result as any)?.text ?? result;
    return toText(v);
  }, [result]);

  const selectedGoal = useMemo(
    () => contentGoals.find(g => g.value === goal),
    [goal]
  );

  const platformTypeList = platformTypes[platform]?.types ?? [];
  const selectedTypeDesc =
    platformTypeList.find(t => t.value === contentType)?.description ?? '';

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-3xl font-bold">İçerik Üretimi</h1>
        <p className="text-slate-600">AI destekli sosyal medya içeriği oluşturun</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Sol: Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Yeni İçerik Oluştur
            </CardTitle>
            <CardDescription>Parametreleri seçin ve AI içerik üretsin</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Müşteri Seçimi */}
            <div>
              <label className="text-sm font-medium mb-2 block">Müşteri</label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Müşteri seçin" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={String(client.id)} value={String(client.id)}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedClient && (
                <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium">
                    {toText(selectedClient.brand_guidelines?.industry)}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {toText(selectedClient.brand_guidelines?.brand_voice)}
                  </p>
                </div>
              )}
            </div>

            {/* Amaç Seçimi */}
            <div>
              <label className="text-sm font-medium mb-2 block">İçerik Amacı</label>
              <div className="grid grid-cols-2 gap-2">
                {contentGoals.map((g) => {
                  const active = goal === g.value;
                  return (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setGoal(g.value)}
                      className={`p-3 border-2 rounded-lg text-left transition ${
                        active ? colorClasses[g.color] : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{g.icon}</span>
                        <span className="text-sm font-medium">{g.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platform ve Tür */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Platform</label>
                <Select value={platform} onValueChange={handlePlatformChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Platform seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">�� Instagram</SelectItem>
                    <SelectItem value="facebook">📘 Facebook</SelectItem>
                    <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
                    <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">İçerik Türü</label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tür seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {platformTypeList.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1">{selectedTypeDesc}</p>
              </div>
            </div>

            {/* Ton */}
            <div>
              <label className="text-sm font-medium mb-2 block">İçerik Tonu</label>
              <div className="grid grid-cols-3 gap-2">
                {toneOptions.map((t) => {
                  const active = tone === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTone(t.value)}
                      className={`p-2 border rounded-lg text-sm transition ${
                        active ? 'border-pink-600 bg-pink-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="mr-1">{t.emoji}</span>
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Konu */}
            <div>
              <label className="text-sm font-medium mb-2 block">Konu / Tema</label>
              <Input
                placeholder="Örn: Bahar mevsimi sağlık ipuçları"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !clientId || !topic}
              className="w-full"
              type="button"
            >
              {loading ? 'Üretiliyor...' : 'İçerik Üret'}
            </Button>
          </CardContent>
        </Card>

        {/* Sağ: Özet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Seçilen Parametreler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedClient ? (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600">Müşteri</p>
                <p className="text-sm font-semibold">{selectedClient.name}</p>
              </div>
            ) : (
              <div className="p-3 bg-slate-100 rounded-lg text-sm text-slate-500">
                Müşteri seçilmedi
              </div>
            )}

            {selectedGoal && (
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-600">Amaç</p>
                <p className="text-sm font-semibold">
                  {selectedGoal.icon} {selectedGoal.label}
                </p>
              </div>
            )}

            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-600">Platform</p>
              <p className="text-sm font-semibold capitalize">{platform} - {contentType}</p>
            </div>

            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-xs text-orange-600">Ton</p>
              <p className="text-sm font-semibold">
                {toneOptions.find(t => t.value === tone)?.emoji}{' '}
                {toneOptions.find(t => t.value === tone)?.label}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Çıktı */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Üretilen İçerik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 p-6 rounded-lg whitespace-pre-wrap font-mono text-sm">
              {generatedText}
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigator.clipboard.writeText(generatedText)}
              >
                📋 Kopyala
              </Button>
              {/* Buraya ileride kaydetme/versiyonlama entegre edilebilir */}
              <Button variant="outline" type="button" disabled title="Yakında">
                💾 Kaydet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getClients, createClient, deleteClient } from '@/lib/api';
import { Plus, Trash2, Users, Building2, Target, MessageSquare } from 'lucide-react';

/* ------------ Helpers ------------- */
const toText = (v: unknown): string => {
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
  try { return JSON.stringify(v, null, 2); } catch { return String(v); }
};

// Farklı API şekillerini tolere eden güvenli okuyucular:
const getIndustry = (client: any) =>
  client?.brand_guidelines?.industry ?? client?.industry ?? '';

const getDescription = (client: any) =>
  client?.brand_guidelines?.description ?? client?.description ?? '';

const getTargetAudience = (client: any) =>
  client?.brand_guidelines?.target_audience ?? client?.target_audience ?? '';

const getBrandVoice = (client: any) =>
  client?.brand_guidelines?.brand_voice ?? client?.brand_voice ?? '';

const getKeywordsArray = (client: any): string[] => {
  // server farklı döndürebilir: {keywords:[...]} | {keywords:{keywords:[...]}} | ["a","b"] | string
  const k = client?.keywords ?? client?.brand_guidelines?.keywords ?? client?.keywords?.keywords;
  if (Array.isArray(k)) return k.map(String);
  if (Array.isArray(client?.keywords?.keywords)) return client.keywords.keywords.map(String);
  if (typeof k === 'string') return k.split(',').map(s => s.trim()).filter(Boolean);
  return [];
};

const getPlatformsArray = (client: any): string[] => {
  // server farklı döndürebilir: {platforms:[...]} | {platforms:{platforms:[...]}} | {social_platforms:[...]}
  const p = client?.platforms ?? client?.social_platforms ?? client?.platforms?.platforms;
  if (Array.isArray(p)) return p.map(String);
  if (Array.isArray(client?.platforms?.platforms)) return client.platforms.platforms.map(String);
  return [];
};

/* ------------ UI sabitleri ------------- */
const industries = [
  'Healthcare', 'Restaurant', 'Food & Beverage', 'Food', 'Entertainment',
  'Digital Marketing', 'E-commerce', 'Real Estate', 'Technology', 'Fashion',
  'Beauty', 'Education', 'Finance', 'Travel', 'Sports'
];

const platforms = [
  { value: 'instagram', label: '📷 Instagram' },
  { value: 'facebook', label: '📘 Facebook' },
  { value: 'tiktok', label: '🎵 TikTok' },
  { value: 'linkedin', label: '💼 LinkedIn' },
  { value: 'youtube', label: '📹 YouTube' },
  { value: 'twitter', label: '🐦 Twitter' }
];

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [brandVoice, setBrandVoice] = useState('');
  const [keywords, setKeywords] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  useEffect(() => { loadClients(); }, []);

  const loadClients = async () => {
    try {
      const res = await getClients();
      setClients(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error('Müşteriler yüklenemedi:', error);
      setClients([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createClient({
        name,
        industry,
        description,
        target_audience: targetAudience,
        brand_voice: brandVoice,
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
        social_platforms: selectedPlatforms
      });
      // Reset
      setName(''); setIndustry(''); setDescription(''); setTargetAudience('');
      setBrandVoice(''); setKeywords(''); setSelectedPlatforms([]); setDialogOpen(false);
      loadClients();
    } catch (error) {
      console.error('Müşteri eklenemedi:', error);
      alert('Müşteri eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clientId: string | number, clientName: string) => {
    if (!confirm(`"${clientName}" müşterisini silmek istediğinizden emin misiniz?`)) return;
    try {
      await deleteClient(String(clientId));
      loadClients();
    } catch (error) {
      console.error('Müşteri silinemedi:', error);
      alert('Müşteri silinirken hata oluştu');
    }
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  // Görselleştirme için map
  const platformLabel = (value: string) =>
    platforms.find(p => p.value === value)?.label || value;

  // performans için hesaplanmış değerler
  const normalizedClients = useMemo(() => clients.map(c => ({
    ...c,
    _id: String(c?.id ?? c?._id ?? crypto.randomUUID()),
    _industry: getIndustry(c),
    _description: getDescription(c),
    _targetAudience: getTargetAudience(c),
    _brandVoice: getBrandVoice(c),
    _keywords: getKeywordsArray(c),
    _platforms: getPlatformsArray(c),
  })), [clients]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Müşteriler</h1>
          <p className="text-slate-600">Müşteri portföyünüzü yönetin</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Müşteri
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
              <DialogDescription>Müşteri bilgilerini girin</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Müşteri Adı *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn: Op. Dr. Murat Önal" required />
              </div>

              <div>
                <Label>Sektör *</Label>
                <Select value={industry} onValueChange={setIndustry} required>
                  <SelectTrigger><SelectValue placeholder="Sektör seçin" /></SelectTrigger>
                  <SelectContent>
                    {industries.map(ind => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Açıklama</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Müşteri hakkında kısa açıklama" rows={3} />
              </div>

              <div>
                <Label>Hedef Kitle</Label>
                <Input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Örn: 25-45 yaş kadınlar" />
              </div>

              <div>
                <Label>Marka Sesi</Label>
                <Input value={brandVoice} onChange={(e) => setBrandVoice(e.target.value)}
                  placeholder="Örn: Profesyonel, güvenilir, samimi" />
              </div>

              <div>
                <Label>Anahtar Kelimeler (virgülle ayırın)</Label>
                <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="sağlık, wellness, ivf" />
              </div>

              <div>
                <Label>Sosyal Medya Platformları *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {platforms.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => togglePlatform(p.value)}
                      className={`px-4 py-2 rounded-lg border transition ${
                        selectedPlatforms.includes(p.value)
                          ? 'bg-blue-50 border-blue-600 text-blue-900'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
                <Button type="submit" disabled={loading || !name || !industry || selectedPlatforms.length === 0}>
                  {loading ? 'Ekleniyor...' : 'Müşteri Ekle'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {normalizedClients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600">Henüz müşteri eklenmemiş</p>
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                İlk Müşteriyi Ekle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {normalizedClients.map(client => (
              <Card key={client._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{toText(client.name)}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Building2 className="h-4 w-4" />
                        {toText(client._industry)}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(client.id ?? client._id, client.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      aria-label="Müşteriyi sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                  <CardContent className="space-y-4">
                    {client._description && (
                      <p className="text-sm text-slate-600">{toText(client._description)}</p>
                    )}

                    {client._targetAudience && (
                      <div className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-slate-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Hedef Kitle</p>
                          <p className="text-sm">{toText(client._targetAudience)}</p>
                        </div>
                      </div>
                    )}

                    {client._brandVoice && (
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-slate-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Marka Sesi</p>
                          <p className="text-sm">{toText(client._brandVoice)}</p>
                        </div>
                      </div>
                    )}

                    {client._keywords.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 mb-2">Anahtar Kelimeler</p>
                        <div className="flex flex-wrap gap-1">
                          {client._keywords.map((keyword: string, i: number) => (
                            <Badge key={`${client._id}-kw-${i}`} variant="secondary">
                              {toText(keyword)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {client._platforms.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 mb-2">Platformlar</p>
                        <div className="flex flex-wrap gap-1">
                          {client._platforms.map((p: string, i: number) => (
                            <Badge key={`${client._id}-pl-${i}`} variant="outline">
                              {platformLabel(p)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


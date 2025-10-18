'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Building2 } from 'lucide-react';

const API = '/api/clients';

const industries = [
  'Healthcare', 'Restaurant', 'Food & Beverage', 'Fashion',
  'Beauty', 'Technology', 'Entertainment', 'E-commerce'
];

type Client = {
  id: string | number;
  name: string;
  industry?: string;
  target_audience?: string;
  brand_guidelines?: {
    industry?: string;
    target_audience?: string;
  };
  // keywords API’den string[] ya da { keywords: string[] } gelebilir
  keywords?: string[] | { keywords?: string[] };
  instagram_username?: string | null;
  social_links?: { instagram?: string };
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    description: '',
    target_audience: '',
    keywords: '',
    instagram_username: ''
  });

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadClients = async () => {
    try {
      const res = await fetch(API, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Liste yüklenemedi: ${res.status}`);
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Yükleme hatası:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          industry: formData.industry,
          description: formData.description || null,
          target_audience: formData.target_audience || null,
          keywords: formData.keywords
            .split(',')
            .map(k => k.trim())
            .filter(Boolean),
          social_platforms: ['instagram'],
          instagram_username: formData.instagram_username?.trim() || null
        })
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        alert('Hata: ' + response.status + (text ? `\n${text}` : ''));
        return;
      }

      // reset + kapanış + liste tazele
      setFormData({
        name: '',
        industry: '',
        description: '',
        target_audience: '',
        keywords: '',
        instagram_username: ''
      });
      setDialogOpen(false);
      await loadClients();
    } catch (e: any) {
      alert('Eklenemedi: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: Client['id'], name: string) => {
    if (!confirm(`"${name}" silinsin mi?`)) return;
    try {
      const res = await fetch(`${API}?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Silinemedi: ${res.status} ${text}`);
      }
      await loadClients();
    } catch (e: any) {
      alert('Silinemedi: ' + e.message);
    }
  };

  // Yardımcı: keywords normalizasyonu
  const getKeywords = (c: Client): string[] => {
    if (Array.isArray(c.keywords)) return c.keywords;
    if (c.keywords && Array.isArray(c.keywords.keywords)) return c.keywords.keywords;
    return [];
  };

  // Yardımcı: industry/target_audience fallback
  const getIndustry = (c: Client) => c.industry || c.brand_guidelines?.industry || '';
  const getAudience = (c: Client) => c.target_audience || c.brand_guidelines?.target_audience || '';

  // Yardımcı: instagram URL
  const getInstagramUrl = (c: Client) => {
    const fromLinks = c.social_links?.instagram;
    const fromUsername = c.instagram_username
      ? `https://instagram.com/${c.instagram_username.replace(/^@/, '')}`
      : undefined;
    return fromLinks || fromUsername;
  };

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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="client-name">Müşteri Adı *</Label>
                <Input
                  id="client-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Test Markası"
                  required
                />
              </div>

              <div>
                <Label htmlFor="client-industry">Sektör *</Label>
                {/* shadcn Select required’ı native olarak desteklemez, submit butonunu disable ediyoruz */}
                <Select
                  value={formData.industry}
                  onValueChange={(v) => setFormData({ ...formData, industry: v })}
                >
                  <SelectTrigger id="client-industry">
                    <SelectValue placeholder="Sektör seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="client-audience">Hedef Kitle</Label>
                <Input
                  id="client-audience"
                  value={formData.target_audience}
                  onChange={(e) =>
                    setFormData({ ...formData, target_audience: e.target.value })
                  }
                  placeholder="Örn: 25-45 yaş kadınlar"
                />
              </div>

              <div>
                <Label htmlFor="client-keywords">Anahtar Kelimeler (virgülle ayırın)</Label>
                <Input
                  id="client-keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="health, wellness, fitness"
                />
              </div>

              <div>
                <Label htmlFor="client-ig">Instagram Kullanıcı Adı (opsiyonel)</Label>
                <Input
                  id="client-ig"
                  value={formData.instagram_username}
                  onChange={(e) =>
                    setFormData({ ...formData, instagram_username: e.target.value })
                  }
                  placeholder="@kullaniciadi"
                />
                <p className="text-xs text-slate-500 mt-1">Brand voice öğrenmek için</p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.name || !formData.industry}
                >
                  {loading ? 'Ekleniyor...' : 'Müşteri Ekle'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600">Henüz müşteri eklenmemiş</p>
            <Button className="mt-4" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              İlk Müşteriyi Ekle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => {
            const industry = getIndustry(client);
            const audience = getAudience(client);
            const kws = getKeywords(client);
            const igUrl = getInstagramUrl(client);

            return (
              <Card key={client.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{client.name}</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">
                        {industry || 'Sektör bilgisi yok'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(client.id, client.name)}
                      className="text-red-600 hover:text-red-700"
                      aria-label={`${client.name} kaydını sil`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  {audience && (
                    <p className="text-sm text-slate-600 mb-2">
                      🎯 {audience}
                    </p>
                  )}

                  {kws.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {kws.map((kw, i) => (
                        <span
                          key={`${kw}-${i}`}
                          className="text-xs bg-slate-100 px-2 py-1 rounded"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}

                  {igUrl && (
                    <a
                      href={igUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm underline text-slate-700"
                    >
                      Instagram profili
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

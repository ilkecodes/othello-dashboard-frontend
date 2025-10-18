'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getClients, createClient, deleteClient, updateClient } from '@/lib/api';
import { Plus, Trash2, Users, Building2, Target, MessageSquare, Edit, ExternalLink } from 'lucide-react';

const industries = [
  'Healthcare', 'Restaurant', 'Food & Beverage', 'Food', 'Entertainment',
  'Digital Marketing', 'E-commerce', 'Real Estate', 'Technology', 'Fashion',
  'Beauty', 'Education', 'Finance', 'Travel', 'Sports', 'Desserts', 'Interior Design'
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  
  // Create form state
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [brandVoice, setBrandVoice] = useState('');
  const [keywords, setKeywords] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  
  // Edit form state
  const [editInstagramUrl, setEditInstagramUrl] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await getClients();
      setClients(response.data || []);
    } catch (error) {
      console.error('Müşteriler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const clientData = {
        name,
        industry,
        description,
        target_audience: targetAudience,
        brand_voice: brandVoice,
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        social_platforms: selectedPlatforms,
      };

      await createClient(clientData);
      
      setDialogOpen(false);
      resetForm();
      loadClients();
      
      alert('Müşteri başarıyla eklendi!');
    } catch (error: any) {
      console.error('Müşteri eklenemedi:', error);
      alert('Müşteri eklenemedi: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clientId: string, clientName: string) => {
    if (!confirm(`${clientName} müşterisini silmek istediğinize emin misiniz?`)) return;

    try {
      await deleteClient(clientId);
      loadClients();
      alert('Müşteri silindi');
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Müşteri silinemedi');
    }
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setEditInstagramUrl(client.instagram_url || '');
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingClient) return;

    try {
      await updateClient(editingClient.id, { 
        instagram_url: editInstagramUrl 
      });
      setEditDialogOpen(false);
      setEditingClient(null);
      loadClients();
      alert('Müşteri güncellendi!');
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Müşteri güncellenemedi');
    }
  };

  const resetForm = () => {
    setName('');
    setIndustry('');
    setDescription('');
    setTargetAudience('');
    setBrandVoice('');
    setKeywords('');
    setSelectedPlatforms([]);
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Müşteriler</h1>
          <p className="text-slate-600">Müşterilerinizi yönetin ve analiz edin</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Müşteri
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
              <DialogDescription>
                Yeni bir müşteri profili oluşturun
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Müşteri Adı *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Acme Corp"
                  required
                />
              </div>

              <div>
                <Label htmlFor="industry">Sektör</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sektör seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map(ind => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Müşteri hakkında kısa açıklama"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="targetAudience">Hedef Kitle</Label>
                <Input
                  id="targetAudience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Örn: 25-35 yaş arası kadınlar"
                />
              </div>

              <div>
                <Label htmlFor="brandVoice">Marka Sesi</Label>
                <Input
                  id="brandVoice"
                  value={brandVoice}
                  onChange={(e) => setBrandVoice(e.target.value)}
                  placeholder="Örn: Samimi, profesyonel, eğlenceli"
                />
              </div>

              <div>
                <Label htmlFor="keywords">Anahtar Kelimeler (virgülle ayırın)</Label>
                <Input
                  id="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="moda, stil, trend"
                />
              </div>

              <div>
                <Label>Sosyal Medya Platformları</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {platforms.map(platform => (
                    <Button
                      key={platform.value}
                      type="button"
                      variant={selectedPlatforms.includes(platform.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => togglePlatform(platform.value)}
                    >
                      {platform.label}
                    </Button>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Ekleniyor...' : 'Müşteri Ekle'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Müşteri Düzenle</DialogTitle>
            <DialogDescription>
              {editingClient?.name} müşterisini düzenleyin
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-instagram">Instagram URL</Label>
              <Input
                id="edit-instagram"
                value={editInstagramUrl}
                onChange={(e) => setEditInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleUpdate}>
              Güncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading && !clients.length ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Müşteriler yükleniyor...</p>
        </div>
      ) : clients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Henüz müşteri yok</h3>
            <p className="text-slate-600 mb-4">İlk müşterinizi ekleyerek başlayın</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Müşteri Ekle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">{client.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {client.brand_guidelines?.industry || 'Sektör belirtilmemiş'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(client)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(client.id, client.name)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {client.brand_guidelines?.target_audience && (
                  <div className="flex items-start gap-2 text-sm">
                    <Target className="h-4 w-4 text-slate-500 mt-0.5" />
                    <span className="text-slate-600">{client.brand_guidelines.target_audience}</span>
                  </div>
                )}
                
                {client.brand_guidelines?.brand_voice && (
                  <div className="flex items-start gap-2 text-sm">
                    <MessageSquare className="h-4 w-4 text-slate-500 mt-0.5" />
                    <span className="text-slate-600">{client.brand_guidelines.brand_voice}</span>
                  </div>
                )}

                {client.instagram_url && (
                  <a 
                    href={client.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Instagram Profili
                  </a>
                )}

                {client.keywords?.keywords && client.keywords.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {client.keywords.keywords.slice(0, 3).map((keyword: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                    {client.keywords.keywords.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{client.keywords.keywords.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

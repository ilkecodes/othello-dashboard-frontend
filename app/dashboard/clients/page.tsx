'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Building2 } from 'lucide-react';

const API = 'https://othello-backend-production-2ff4.up.railway.app/api/clients';

const industries = [
  'Healthcare', 'Restaurant', 'Food & Beverage', 'Fashion', 
  'Beauty', 'Technology', 'Entertainment', 'E-commerce'
];

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
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
  }, []);

  const loadClients = async () => {
    try {
      const res = await fetch(API + '/');
      const data = await res.json();
      setClients(data);
    } catch (e) {
      console.error('Yükleme hatası:', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(API + '/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          industry: formData.industry,
          description: formData.description,
          target_audience: formData.target_audience,
          keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
          social_platforms: ['instagram'],
          instagram_username: formData.instagram_username || null
        })
      });

      if (response.ok) {
        setFormData({
          name: '', industry: '', description: '', 
          target_audience: '', keywords: '', instagram_username: ''
        });
        setDialogOpen(false);
        loadClients();
      } else {
        alert('Hata: ' + response.status);
      }
    } catch (e) {
      alert('Eklenemedi: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" silinsin mi?`)) return;
    
    try {
      await fetch(API + '/' + id, { method: 'DELETE' });
      loadClients();
    } catch (e) {
      alert('Silinemedi: ' + e.message);
    }
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
                <Label>Müşteri Adı *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Örn: Test Markası"
                  required
                />
              </div>

              <div>
                <Label>Sektör *</Label>
                <Select 
                  value={formData.industry} 
                  onValueChange={(v) => setFormData({...formData, industry: v})}
                  required
                >
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
                <Label>Hedef Kitle</Label>
                <Input
                  value={formData.target_audience}
                  onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                  placeholder="Örn: 25-45 yaş kadınlar"
                />
              </div>

              <div>
                <Label>Anahtar Kelimeler (virgülle ayırın)</Label>
                <Input
                  value={formData.keywords}
                  onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                  placeholder="health, wellness, fitness"
                />
              </div>

              <div>
                <Label>Instagram Kullanıcı Adı (opsiyonel)</Label>
                <Input
                  value={formData.instagram_username}
                  onChange={(e) => setFormData({...formData, instagram_username: e.target.value})}
                  placeholder="@kullaniciadi"
                />
                <p className="text-xs text-slate-500 mt-1">Brand voice öğrenmek için</p>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit" disabled={loading || !formData.name || !formData.industry}>
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
          {clients.map(client => (
            <Card key={client.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{client.name}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      {client.brand_guidelines?.industry}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(client.id, client.name)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {client.brand_guidelines?.target_audience && (
                  <p className="text-sm text-slate-600 mb-2">
                    🎯 {client.brand_guidelines.target_audience}
                  </p>
                )}
                {client.keywords?.keywords?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {client.keywords.keywords.map((kw, i) => (
                      <span key={i} className="text-xs bg-slate-100 px-2 py-1 rounded">
                        {kw}
                      </span>
                    ))}
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

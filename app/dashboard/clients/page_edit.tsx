'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getClients, createClient, updateClient } from '@/lib/api';
import { Users, Plus, Edit, Trash2 } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    instagram_url: '',
    keywords: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const res = await getClients();
    setClients(res.data);
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      industry: client.brand_guidelines?.industry || '',
      instagram_url: client.instagram_url || '',
      keywords: client.keywords?.keywords?.join(', ') || '',
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateClient(editingClient.id, {
        instagram_url: formData.instagram_url,
        // Diğer alanlar eklenebilir
      });
      setEditingClient(null);
      loadClients();
      alert('Müşteri güncellendi!');
    } catch (error) {
      alert('Güncelleme başarısız');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Müşteriler</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Müşteri
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client: any) => (
          <Card key={client.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {client.name}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(client)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Müşteri Düzenle</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">İsim</label>
                        <Input value={formData.name} disabled />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Instagram URL</label>
                        <Input
                          value={formData.instagram_url}
                          onChange={(e) => setFormData({...formData, instagram_url: e.target.value})}
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                      <Button type="submit" className="w-full">Güncelle</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">{client.brand_guidelines?.industry}</p>
              {client.instagram_url && (
                <a href={client.instagram_url} target="_blank" className="text-xs text-blue-600">
                  Instagram
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

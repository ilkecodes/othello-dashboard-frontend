'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [name, setName] = useState('');

  const API = 'https://othello-backend-production-2ff4.up.railway.app/api/clients';

  useEffect(() => {
    fetch(API + '/')
      .then(r => r.json())
      .then(data => setClients(data))
      .catch(e => console.error(e));
  }, []);

  const handleAdd = async () => {
    try {
      await fetch(API + '/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          industry: 'Test',
          keywords: [],
          social_platforms: ['instagram']
        })
      });
      window.location.reload();
    } catch (e) {
      alert('Hata: ' + e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(API + '/' + id, { method: 'DELETE' });
      window.location.reload();
    } catch (e) {
      alert('Hata: ' + e);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Müşteriler</h1>
      
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Müşteri adı"
          className="border p-2 rounded"
        />
        <Button onClick={handleAdd}>Ekle</Button>
      </div>

      <div className="space-y-2">
        {clients.map((c) => (
          <div key={c.id} className="flex justify-between border p-4 rounded">
            <span>{c.name}</span>
            <Button onClick={() => handleDelete(c.id)} variant="destructive">
              Sil
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

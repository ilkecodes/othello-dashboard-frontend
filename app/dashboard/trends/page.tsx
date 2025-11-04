'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
// ... (diğer importlar aynı)

export default function TrendsPage() {
  // ... (state'ler aynı)

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/trends/dashboard`);
      const data = await res.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    setSearchResult(null);
    
    try {
      const res = await fetch(`${API_URL}/api/trends/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      
      const data = await res.json();
      if (data.success) {
        setSearchResult(data.result);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Arama hatası!');
    } finally {
      setSearchLoading(false);
    }
  };

  // ... (geri kalan kod aynı)
}

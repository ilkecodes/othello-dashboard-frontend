'use client';

// ... (önceki importlar aynı)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function TrendsPage() {
  // ...

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/trends/dashboard`);
      // ...
    }
  };

  const handleSearch = async () => {
    // ...
    const res = await fetch(`${API_URL}/api/trends/search`, {
      method: 'POST',
      // ...
    });
  };

  // ...
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://othello-backend-production-2ff4.up.railway.app';

const fetchJSON = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  const data = await response.json();
  return { data };
};

export const api = {
  health: () => fetchJSON(`${API_URL}/health`),

  // Clients
  getClients: () => fetchJSON(`${API_URL}/api/clients/`),
  createClient: (data: any) => 
    fetchJSON(`${API_URL}/api/clients/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteClient: (id: string) => 
    fetchJSON(`${API_URL}/api/clients/${id}`, { method: 'DELETE' }),

  // Campaigns
  getCampaigns: (clientId?: string) => {
    const url = clientId 
      ? `${API_URL}/api/campaigns/?client_id=${clientId}`
      : `${API_URL}/api/campaigns/`;
    return fetchJSON(url);
  },
  createCampaign: (data: any) => 
    fetchJSON(`${API_URL}/api/campaigns/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Trends
  scanTrends: (data: { client_id: string; keywords: string[]; limit?: number }) =>
    fetchJSON(`${API_URL}/api/trends/scan`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getTrends: (clientId?: string) => {
    const url = clientId
      ? `${API_URL}/api/trends/client/${clientId}`
      : `${API_URL}/api/trends/`;
    return fetchJSON(url);
  },

  // Content
  getContent: (clientId?: string) => {
    const url = clientId
      ? `${API_URL}/api/content/?client_id=${clientId}`
      : `${API_URL}/api/content/`;
    return fetchJSON(url);
  },
  generateContent: (data: {
    client_id: string;
    platform: string;
    topic: string;
    tone?: string;
    goal?: string;
    trend_id?: number;
  }) =>
    fetchJSON(`${API_URL}/api/content/generate`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Influencers
  searchInfluencers: (data: any) =>
    fetchJSON(`${API_URL}/api/influencers/search`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getInfluencers: () => fetchJSON(`${API_URL}/api/influencers/`),
};

// Named exports
export const getClients = api.getClients;
export const createClient = api.createClient;
export const deleteClient = api.deleteClient;
export const getCampaigns = api.getCampaigns;
export const createCampaign = api.createCampaign;
export const scanTrends = api.scanTrends;
export const getTrends = api.getTrends;
export const generateContent = api.generateContent;
export const getContent = api.getContent;
export const searchInfluencers = api.searchInfluencers;
export const getInfluencers = api.getInfluencers;

import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://othello-backend-production-2ff4.up.railway.app';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Clients
export const getClients = () => api.get('/api/clients/');
export const createClient = (data: any) => api.post('/api/clients/', data);
export const deleteClient = (id: string) => api.delete(`/api/clients/${id}`);

// Trends
export const scanTrends = (data: any) => api.post('/api/trends/scan', data);
export const getClientTrends = (clientId: string) => api.get(`/api/trends/client/${clientId}`);

// Content
export const generateContent = (data: any) => api.post('/api/content/generate', data);
export const getContent = (clientId?: string) => {
  const params = clientId ? { client_id: clientId } : {};
  return api.get('/api/content/', { params });
};

// Influencers
export const searchInfluencers = (data: any) => api.post('/api/influencers/search', data);
export const getInfluencers = () => api.get('/api/influencers/');

// ============= BRAND VOICE =============

export const brandVoice = {
  health: () => api.get('/api/brand-voice/health'),
  
  addCorpus: (data: {
    client_id: string;
    platform: string;
    content_type?: string;
    text_content: string;
    post_metadata?: any;
  }) => api.post('/api/brand-voice/corpus', data),
  
  build: (clientId: string, forceRebuild: boolean = false) => 
    api.post('/api/brand-voice/build', {
      client_id: clientId,
      force_rebuild: forceRebuild
    }),
  
  get: (clientId: string) => api.get(`/api/brand-voice/get/${clientId}`),
  
  generate: (data: {
    client_id: string;
    prompt: string;
    platform?: string;
  }) => api.post('/api/brand-voice/generate', data),
  
  stats: (clientId: string) => api.get(`/api/brand-voice/stats/${clientId}`)
};

export default api;

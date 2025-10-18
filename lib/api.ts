import axios from 'axios';

// Proxy kullan - aynı origin (CORS yok!)
const api = axios.create({ baseURL: '' });

export const getClients = () => api.get('/api/clients');
export const createClient = (data: any) => api.post('/api/clients', data);
export const deleteClient = (id: string) => api.delete(`/api/clients?id=${id}`);
export const updateClient = (clientId: string, data: any) => api.patch(`/api/clients?id=${clientId}`, data);

export const scanTrends = (data: any) => api.post('/api/trends/scan', data);
export const getClientTrends = (clientId: string) => api.get(`/api/trends/client/${clientId}`);
export const getTopTrends = () => api.get('/api/trends/top');

export const generateContent = (data: any) => api.post('/api/content/generate', data);
export const searchInfluencers = (data: any) => api.post('/api/influencers/search', data);
export const getCampaigns = () => api.get('/api/campaigns');
export const createCampaign = (data: any) => api.post('/api/campaigns', data);

export default api;

import axios from 'axios';

const BACKEND_URL = 'https://othello-backend-production-2ff4.up.railway.app';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getClients = () => axios.get(`${BACKEND_URL}/api/clients/`);
export const createClient = (data: any) => axios.post(`${BACKEND_URL}/api/clients/`, data);
export const deleteClient = (id: string) => axios.delete(`${BACKEND_URL}/api/clients/${id}`);
export const updateClient = (clientId: string, data: any) => axios.patch(`${BACKEND_URL}/api/clients/${clientId}`, data);
export const generateContent = (data: any) => axios.post(`${BACKEND_URL}/api/content/generate`, data);
export const scanTrends = (data: any) => axios.post(`${BACKEND_URL}/api/trends/scan`, data);
export const getClientTrends = (clientId: string) => axios.get(`${BACKEND_URL}/api/trends/client/${clientId}`);
export const getTopTrends = () => axios.get(`${BACKEND_URL}/api/trends/top`);
export const searchInfluencers = (data: any) => axios.post(`${BACKEND_URL}/api/influencers/search`, data);
export const getCampaigns = () => axios.get(`${BACKEND_URL}/api/campaigns/`);
export const createCampaign = (data: any) => axios.post(`${BACKEND_URL}/api/campaigns/`, data);

export default api;

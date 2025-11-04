const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const getClients = async () => {
  const res = await fetch(`${API_URL}/api/clients`);
  return res.json();
};

export const createClient = async (client: any) => {
  const res = await fetch(`${API_URL}/api/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(client)
  });
  return res.json();
};

// Campaign functions (placeholder)
export const getCampaigns = async () => {
  return { campaigns: [] };
};

export const createCampaign = async (campaign: any) => {
  return { success: true, campaign };
};

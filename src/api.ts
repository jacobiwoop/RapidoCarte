export const API_URL = '/api';

export const api = {
  auth: {
    register: async (data: any) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
    login: async (data: any) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw await res.json();
      return res.json();
    }
  },
  cards: {
    list: async () => {
      const res = await fetch(`${API_URL}/cards`);
      if (!res.ok) throw await res.json();
      return res.json();
    }
  },
  verify: {
    submit: async (token: string, data: any) => {
      const res = await fetch(`${API_URL}/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw await res.json();
      return res.json();
    }
  },
  buy: {
    submit: async (token: string, data: any) => {
      const res = await fetch(`${API_URL}/buy`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw await res.json();
      return res.json();
    }
  },
  promo: {
    claim: async (token: string, data: any) => {
      const res = await fetch(`${API_URL}/promo/claim`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw await res.json();
      return res.json();
    }
  }
};

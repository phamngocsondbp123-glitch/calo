import { create } from 'zustand';
import { api } from '../lib/api';

type User = { id: string; name: string; email: string; role: 'user' | 'admin'; goalType: string; currentWeight: number; goalWeight: number };
type AuthState = { user?: User; token?: string; boot: () => Promise<void>; login: (email: string, password: string) => Promise<void>; logout: () => void };

export const useAuth = create<AuthState>((set) => ({
  token: localStorage.getItem('calo_token') ?? undefined,
  async boot() {
    const token = localStorage.getItem('calo_token');
    if (!token) return;
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, token });
    } catch {
      localStorage.removeItem('calo_token');
      set({ user: undefined, token: undefined });
    }
  },
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('calo_token', data.token);
    set({ user: data.user, token: data.token });
  },
  logout() {
    localStorage.removeItem('calo_token');
    set({ user: undefined, token: undefined });
  }
}));

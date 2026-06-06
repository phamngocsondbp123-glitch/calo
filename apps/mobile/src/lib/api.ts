import axios from 'axios';
export const api = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api' });
let token: string | undefined;
export function setToken(next?: string) { token = next; }
api.interceptors.request.use((config) => { if (token) config.headers.Authorization = `Bearer ${token}`; return config; });

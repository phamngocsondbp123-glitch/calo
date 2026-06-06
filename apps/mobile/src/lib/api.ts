import axios, { type AxiosAdapter, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { createDemoStore, demoTargets } from '@calo/shared';

const demoMode = process.env.EXPO_PUBLIC_DEMO_MODE !== 'false';
const demoStore = createDemoStore();

let token: string | undefined = 'demo-user-token';
export function setToken(next?: string) {
  token = next;
}

const userId = () => (token?.includes('demo-admin') ? 'demo-admin' : 'demo-user');
const ok = <T>(config: AxiosRequestConfig, data: T): AxiosResponse<T> => ({ data, status: 200, statusText: 'OK', headers: {}, config: config as AxiosResponse<T>['config'] });
const pathFor = (config: AxiosRequestConfig) => new URL(config.url ?? '/', 'http://demo.local').pathname.replace(/^\/api/, '');
const paramsFor = (config: AxiosRequestConfig) => Object.fromEntries(new URL(config.url ?? '/', 'http://demo.local').searchParams.entries());

const demoAdapter: AxiosAdapter = async (config) => {
  const path = pathFor(config);
  const params = { ...paramsFor(config), ...(config.params ?? {}) } as Record<string, string>;
  const user = demoStore.user(userId());

  if (path === '/diary/summary') return ok(config, { ...demoStore.diary(user.id), targets: demoTargets(user) });
  if (path === '/suggestions/today') return ok(config, demoStore.suggestions(user.id));
  if (path === '/foods' || path === '/foods/search') return ok(config, { foods: demoStore.foods(params) });
  if (path === '/diary') return ok(config, demoStore.diary(user.id, String(params.date ?? new Date().toISOString().slice(0, 10))));
  if (path.startsWith('/reports/')) return ok(config, demoStore.report(user.id, path.split('/').pop() ?? 'weekly'));
  if (path === '/users/me' || path === '/auth/me') return ok(config, { user, targets: demoTargets(user) });
  if (path === '/weights') return ok(config, { weights: demoStore.weights(user.id) });
  return ok(config, { ok: true, mode: 'demo' });
};

export const api = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api', adapter: demoMode ? demoAdapter : undefined });

api.interceptors.request.use((config) => {
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

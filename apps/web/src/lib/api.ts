import axios, { type AxiosAdapter, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { createDemoStore, demoTargets, type GoalType, type MealType } from '@calo/shared';

const demoMode = import.meta.env.VITE_DEMO_MODE !== 'false';
const demoStore = createDemoStore();

const tokenUserId = () => (localStorage.getItem('calo_token')?.includes('demo-admin') ? 'demo-admin' : 'demo-user');
const ok = <T>(config: AxiosRequestConfig, data: T, status = 200): AxiosResponse<T> => ({ data, status, statusText: 'OK', headers: {}, config: config as AxiosResponse<T>['config'] });
const pathFor = (config: AxiosRequestConfig) => new URL(config.url ?? '/', 'http://demo.local').pathname.replace(/^\/api/, '');
const paramsFor = (config: AxiosRequestConfig) => Object.fromEntries(new URL(config.url ?? '/', 'http://demo.local').searchParams.entries());
const bodyFor = (config: AxiosRequestConfig) => typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data ?? {});

const demoAdapter: AxiosAdapter = async (config) => {
  const path = pathFor(config);
  const params = { ...paramsFor(config), ...(config.params ?? {}) } as Record<string, string>;
  const body = bodyFor(config);
  const user = demoStore.user(tokenUserId());

  if (path === '/auth/login' && config.method === 'post') {
    const loggedIn = demoStore.login(String(body.email ?? 'demo@calo.vn'));
    return ok(config, { user: loggedIn, token: loggedIn.role === 'admin' ? 'demo-admin-token' : 'demo-user-token' });
  }
  if (path === '/auth/me' || path === '/users/me') return ok(config, { user, targets: demoTargets(user) });
  if (path === '/users/goals' && config.method === 'put') {
    const updated = demoStore.updateGoal(user.id, { goalType: body.goalType as GoalType, goalWeight: Number(body.goalWeight) });
    return ok(config, { user: updated, targets: demoTargets(updated), goal: { id: 'demo-goal' } });
  }
  if (path === '/foods' || path === '/foods/search') return ok(config, { foods: demoStore.foods(params) });
  if (path === '/foods/categories') return ok(config, { categories: demoStore.categories() });
  if (path === '/diary' && config.method === 'post') return ok(config, { entry: demoStore.addDiary(user.id, { foodId: body.foodId, mealType: body.mealType as MealType, date: String(body.date), quantityGram: Number(body.quantityGram) }) }, 201);
  if (path === '/diary') return ok(config, demoStore.diary(user.id, String(params.date ?? new Date().toISOString().slice(0, 10))));
  if (path === '/diary/summary') return ok(config, { ...demoStore.diary(user.id, String(params.date ?? new Date().toISOString().slice(0, 10))), targets: demoTargets(user) });
  if (path === '/weights' && config.method === 'get') return ok(config, { weights: demoStore.weights(user.id) });
  if (path === '/weights' && config.method === 'post') return ok(config, { weight: demoStore.addWeight(user.id, { date: String(body.date), weight: Number(body.weight), note: body.note }) }, 201);
  if (path.startsWith('/reports/')) return ok(config, demoStore.report(user.id, path.split('/').pop() ?? 'weekly'));
  if (path === '/suggestions/today') return ok(config, demoStore.suggestions(user.id));
  if (path === '/admin/stats') return ok(config, demoStore.adminStats());
  if (path === '/admin/foods') return ok(config, { foods: demoStore.foods() });
  if (path.startsWith('/admin/foods/') && path.endsWith('/verify')) return ok(config, { food: demoStore.verifyFood(path.split('/')[3]) });
  return ok(config, { ok: true, mode: 'demo' });
};

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api', adapter: demoMode ? demoAdapter : undefined });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('calo_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export type Food = {
  id: string;
  vietnameseName: string;
  englishName?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  category?: { vietnameseName: string; slug: string };
};

export type DiaryEntry = {
  id: string;
  mealType: string;
  quantityGram: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  food: Food;
};

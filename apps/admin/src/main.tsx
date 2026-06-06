import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import './styles.css';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function App() {
  const [token, setToken] = useState(localStorage.getItem('admin_token') ?? '');
  const [stats, setStats] = useState<Record<string, unknown>>();
  const [foods, setFoods] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState({ email: 'admin@calo.vn', password: 'password123' });

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.user.role !== 'admin') throw new Error('Admin role required');
      localStorage.setItem('admin_token', response.data.token);
      setToken(response.data.token);
    } catch {
      setError('Không đăng nhập được với quyền admin.');
    }
  }

  async function load() {
    const [statsResponse, foodsResponse, usersResponse] = await Promise.all([api.get('/admin/stats'), api.get('/admin/foods'), api.get('/admin/users')]);
    setStats(statsResponse.data);
    setFoods(foodsResponse.data.foods);
    setUsers(usersResponse.data.users);
  }

  useEffect(() => {
    if (token) void load().catch(() => setError('Token admin không hợp lệ hoặc API chưa chạy.'));
  }, [token]);

  function logout() {
    localStorage.removeItem('admin_token');
    setToken('');
  }

  if (!token) {
    return (
      <main className="grid min-h-screen place-items-center p-4">
        <form onSubmit={login} className="card w-full max-w-md space-y-4">
          <h1 className="text-3xl font-black text-green-600">Calo Admin</h1>
          <p className="text-slate-500">Seed account: admin@calo.vn / password123</p>
          <label className="block text-sm font-semibold" htmlFor="admin-email">Email</label>
          <input id="admin-email" className="input w-full" type="email" value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} required />
          <label className="block text-sm font-semibold" htmlFor="admin-password">Password</label>
          <input id="admin-password" className="input w-full" type="password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} required />
          {error ? <p role="alert" className="text-red-600">{error}</p> : null}
          <button className="btn w-full" type="submit">Login admin</button>
        </form>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-black">Admin operations</h1>
        <button className="btn" type="button" onClick={logout}>Logout</button>
      </div>
      {error ? <div role="alert" className="card text-red-600">{error}</div> : null}
      <div className="grid gap-4 md:grid-cols-4">{Object.entries(stats ?? {}).map(([key, value]) => <div className="card" key={key}><p className="text-slate-500">{key}</p><b className="text-3xl">{String(value)}</b></div>)}</div>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-x-auto"><h2 className="text-xl font-bold">Users</h2>{users.map((user) => <p className="mt-2 flex justify-between gap-3" key={user.id}><span>{user.name}</span><span>{user.role}</span></p>)}</div>
        <div className="card overflow-x-auto"><h2 className="text-xl font-bold">Foods & approvals</h2>{foods.slice(0, 30).map((food) => <p className="mt-2 flex justify-between gap-3" key={food.id}><span>{food.vietnameseName}</span><span>{food.isVerified ? '✅' : '⏳'}</span></p>)}</div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);

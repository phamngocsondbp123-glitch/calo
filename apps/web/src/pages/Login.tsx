import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';

export function Login() {
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: 'demo@calo.vn', password: 'password123' });
  const login = useAuth((state) => state.login);
  const nav = useNavigate();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      nav('/');
    } catch {
      setError('Không đăng nhập được. Hãy seed database hoặc kiểm tra API.');
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-green-50 to-white p-4">
      <form onSubmit={submit} className="card w-full max-w-md space-y-4">
        <h1 className="text-4xl font-black text-primary">Calo Việt</h1>
        <p className="text-slate-500">Theo dõi calories, macro và cân nặng cho người Việt.</p>
        <label className="block text-sm font-semibold" htmlFor="email">Email</label>
        <input id="email" className="input" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        <label className="block text-sm font-semibold" htmlFor="password">Password</label>
        <input id="password" className="input" type="password" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        {error ? <p role="alert" className="text-danger">{error}</p> : null}
        <button className="btn w-full" type="submit">Đăng nhập</button>
        <p className="text-xs text-slate-400">Demo: demo@calo.vn / password123</p>
      </form>
    </main>
  );
}

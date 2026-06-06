import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export function Admin() {
  const [stats, setStats] = useState<Record<string, unknown>>();
  const [foods, setFoods] = useState<any[]>([]);
  const [error, setError] = useState('');

  async function load() {
    const [statsResponse, foodsResponse] = await Promise.all([api.get('/admin/stats'), api.get('/admin/foods')]);
    setStats(statsResponse.data);
    setFoods(foodsResponse.data.foods);
  }

  useEffect(() => {
    void load().catch(() => setError('Admin only. Đăng nhập bằng tài khoản admin để xem trang này.'));
  }, []);

  async function verify(id: string) {
    await api.put(`/admin/foods/${id}/verify`);
    await load();
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-black">Admin panel</h1>
      {error ? <div role="alert" className="card text-warning">{error}</div> : null}
      {!error ? <div className="grid gap-4 md:grid-cols-4">{Object.entries(stats ?? {}).map(([key, value]) => <div className="card" key={key}><p className="text-slate-500">{key}</p><b className="text-3xl">{String(value)}</b></div>)}</div> : null}
      <div className="card overflow-x-auto">
        <h2 className="font-bold">Food approval queue & database</h2>
        <table className="mt-4 w-full min-w-[520px] text-left text-sm">
          <thead><tr className="text-slate-500"><th className="py-2">Food</th><th>Status</th><th>Category</th><th className="text-right">Action</th></tr></thead>
          <tbody>
            {foods.slice(0, 30).map((food) => (
              <tr className="border-t" key={food.id}>
                <td className="py-3 font-semibold">{food.vietnameseName}</td>
                <td>{food.isVerified ? 'Verified' : 'Pending'}</td>
                <td>{food.category?.vietnameseName ?? '—'}</td>
                <td className="text-right">{food.isVerified ? '—' : <button className="btn px-3 py-2" type="button" onClick={() => void verify(food.id)}>Verify</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

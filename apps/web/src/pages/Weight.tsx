import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function Weight() {
  const [weights, setWeights] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [weight, setWeight] = useState(60);
  const [error, setError] = useState('');

  async function load() {
    setWeights((await api.get('/weights')).data.weights.map((entry: any) => ({ ...entry, date: entry.date.slice(0, 10) })));
  }

  useEffect(() => {
    void load().catch(() => setError('Không tải được cân nặng.'));
  }, []);

  async function add(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    await api.post('/weights', { date, weight });
    await load();
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-black">Weight tracking</h1>
      <form onSubmit={add} className="card grid gap-3 md:grid-cols-3">
        <label className="sr-only" htmlFor="weight-date">Ngày</label>
        <input id="weight-date" className="input" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
        <label className="sr-only" htmlFor="weight-value">Cân nặng</label>
        <input id="weight-value" className="input" type="number" min="30" max="250" step="0.1" value={weight} onChange={(event) => setWeight(Number(event.target.value))} required />
        <button className="btn" type="submit">Lưu cân nặng</button>
        {error ? <p role="alert" className="text-danger md:col-span-3">{error}</p> : null}
      </form>
      <div className="card h-96">
        <ResponsiveContainer>
          <LineChart data={weights}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="weight" stroke="#16a34a" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

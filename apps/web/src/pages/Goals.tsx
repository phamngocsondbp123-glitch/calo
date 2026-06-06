import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export function Goals() {
  const [me, setMe] = useState<any>();
  const [goalType, setGoalType] = useState('maintain_weight');
  const [goalWeight, setGoalWeight] = useState(60);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void api.get('/users/me').then((response) => {
      setMe(response.data);
      setGoalType(response.data.user.goalType);
      setGoalWeight(response.data.user.goalWeight);
    });
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setMe((await api.put('/users/goals', { goalType, goalWeight })).data);
    setMessage('Đã cập nhật mục tiêu.');
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-black">Goal planning</h1>
      <form onSubmit={save} className="card grid gap-4 md:grid-cols-3">
        <label className="sr-only" htmlFor="goal-type">Loại mục tiêu</label>
        <select id="goal-type" className="input" value={goalType} onChange={(event) => setGoalType(event.target.value)}>
          <option value="gain_weight">Tăng cân</option>
          <option value="lose_weight">Giảm cân</option>
          <option value="maintain_weight">Duy trì</option>
        </select>
        <label className="sr-only" htmlFor="goal-weight">Cân nặng mục tiêu</label>
        <input id="goal-weight" className="input" type="number" min="30" max="250" step="0.1" value={goalWeight} onChange={(event) => setGoalWeight(Number(event.target.value))} required />
        <button className="btn" type="submit">Cập nhật</button>
      </form>
      {message ? <p role="status" className="text-primary">{message}</p> : null}
      <div className="card">
        <h2 className="font-bold">BMI {me?.targets.bmi} • TDEE {me?.targets.tdee}</h2>
        <p className="mt-2 text-slate-600">{me?.targets.explanation}</p>
      </div>
    </section>
  );
}

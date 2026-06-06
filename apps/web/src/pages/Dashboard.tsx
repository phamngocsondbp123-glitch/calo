import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { StatCard } from '../components/StatCard';

type Totals = { calories: number; protein: number; carbs: number; fat: number };

export function Dashboard() {
  const [summary, setSummary] = useState<{ totals: Totals; targets: any }>();
  const [suggestions, setSuggestions] = useState<any>();
  const [error, setError] = useState('');

  useEffect(() => {
    void Promise.all([api.get('/diary/summary'), api.get('/suggestions/today')])
      .then(([summaryResponse, suggestionsResponse]) => {
        setSummary(summaryResponse.data);
        setSuggestions(suggestionsResponse.data);
      })
      .catch(() => setError('Không tải được dashboard. Vui lòng kiểm tra API.'));
  }, []);

  const totals = summary?.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const targets = summary?.targets;
  const pct = Math.min(100, Math.round((totals.calories / (targets?.calories || 1)) * 100));

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-black">Dashboard hôm nay</h1>
        <p className="text-slate-500">Thêm món ăn nhanh dưới 5 giây, theo dõi target và macro.</p>
      </header>
      {error ? <div role="alert" className="card text-danger">{error}</div> : null}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Target" value={`${targets?.calories ?? 0} kcal`} sub={targets?.explanation} />
        <StatCard label="Đã ăn" value={`${Math.round(totals.calories)} kcal`} sub={`${pct}% mục tiêu`} />
        <StatCard label="Còn lại" value={`${Math.round((targets?.calories ?? 0) - totals.calories)} kcal`} tone="warning" />
        <StatCard label="BMI / TDEE" value={`${targets?.bmi ?? 0}`} sub={`${targets?.tdee ?? 0} kcal`} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Protein" value={`${Math.round(totals.protein)} / ${targets?.macros.protein ?? 0}g`} />
        <StatCard label="Carbs" value={`${Math.round(totals.carbs)} / ${targets?.macros.carbs ?? 0}g`} />
        <StatCard label="Fat" value={`${Math.round(totals.fat)} / ${targets?.macros.fat ?? 0}g`} />
      </div>
      <div className="card">
        <h2 className="text-xl font-bold">Gợi ý thông minh</h2>
        <p className="mt-2 text-slate-600">{suggestions?.message ?? 'Chưa có gợi ý.'}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {suggestions?.suggestions?.map((suggestion: any) => (
            <div className="rounded-2xl bg-green-50 p-4" key={suggestion.food.id}>
              <b>{suggestion.food.vietnameseName}</b>
              <p>{suggestion.servingGram}g • {Math.round((suggestion.food.caloriesPer100g * suggestion.servingGram) / 100)} kcal</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

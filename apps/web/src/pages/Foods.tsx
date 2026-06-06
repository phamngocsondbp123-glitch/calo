import { useEffect, useState } from 'react';
import { api, type Food } from '../lib/api';

export function Foods() {
  const [q, setQ] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      void api.get('/foods', { params: { q } })
        .then((response) => {
          setFoods(response.data.foods);
          setError('');
        })
        .catch(() => setError('Không tải được danh sách món ăn.'));
    }, 250);
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-black">Vietnamese food database</h1>
      <label className="sr-only" htmlFor="food-search">Tìm món ăn</label>
      <input id="food-search" className="input" placeholder="Tìm cơm, phở, bún, ức gà..." value={q} onChange={(event) => setQ(event.target.value)} />
      {error ? <div role="alert" className="card text-danger">{error}</div> : null}
      <div className="grid gap-4 md:grid-cols-3">
        {foods.map((food) => (
          <div className="card" key={food.id}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-bold">{food.vietnameseName}</h2>
              <span className="rounded-full bg-green-50 px-3 py-1 text-sm text-primary">{food.category?.vietnameseName ?? 'Khác'}</span>
            </div>
            <p className="text-sm text-slate-500">{food.englishName}</p>
            <p className="mt-4 text-2xl font-black">{food.caloriesPer100g} kcal</p>
            <p className="text-sm">P {food.proteinPer100g}g • C {food.carbsPer100g}g • F {food.fatPer100g}g / 100g</p>
          </div>
        ))}
      </div>
    </section>
  );
}

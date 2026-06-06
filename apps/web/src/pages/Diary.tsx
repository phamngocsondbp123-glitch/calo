import { useEffect, useState } from 'react';
import { api, type DiaryEntry, type Food } from '../lib/api';

const meals = [
  ['breakfast', 'Breakfast'],
  ['lunch', 'Lunch'],
  ['dinner', 'Dinner'],
  ['snack', 'Snack']
] as const;

export function Diary() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<{ entries: DiaryEntry[]; totals: { calories: number } }>();
  const [foods, setFoods] = useState<Food[]>([]);
  const [foodId, setFoodId] = useState('');
  const [mealType, setMeal] = useState('breakfast');
  const [quantityGram, setQty] = useState(100);
  const [error, setError] = useState('');

  async function load() {
    const [diaryResponse, foodsResponse] = await Promise.all([api.get('/diary', { params: { date } }), api.get('/foods', { params: { q: '' } })]);
    setData(diaryResponse.data);
    setFoods(foodsResponse.data.foods);
    setFoodId((current) => current || foodsResponse.data.foods[0]?.id || '');
  }

  useEffect(() => {
    void load().catch(() => setError('Không tải được nhật ký.'));
  }, [date]);

  async function add(event: React.FormEvent) {
    event.preventDefault();
    if (!foodId) {
      setError('Vui lòng chọn món ăn.');
      return;
    }
    setError('');
    await api.post('/diary', { foodId, mealType, date, quantityGram });
    await load();
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-black">Food diary</h1>
      <div className="card">
        <form onSubmit={add} className="grid gap-3 md:grid-cols-5">
          <label className="sr-only" htmlFor="diary-date">Ngày</label>
          <input id="diary-date" className="input" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
          <label className="sr-only" htmlFor="diary-food">Món ăn</label>
          <select id="diary-food" className="input" value={foodId} onChange={(event) => setFoodId(event.target.value)} required>
            <option value="" disabled>Chọn món</option>
            {foods.map((food) => <option value={food.id} key={food.id}>{food.vietnameseName}</option>)}
          </select>
          <label className="sr-only" htmlFor="diary-meal">Bữa ăn</label>
          <select id="diary-meal" className="input" value={mealType} onChange={(event) => setMeal(event.target.value)}>
            {meals.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
          <label className="sr-only" htmlFor="diary-quantity">Khối lượng gram</label>
          <input id="diary-quantity" className="input" type="number" min="1" max="5000" value={quantityGram} onChange={(event) => setQty(Number(event.target.value))} required />
          <button className="btn" type="submit">Thêm nhanh</button>
        </form>
        {error ? <p role="alert" className="mt-3 text-danger">{error}</p> : null}
      </div>
      <div className="card">
        <h2 className="text-xl font-bold">Tổng: {Math.round(data?.totals.calories ?? 0)} kcal</h2>
        {data?.entries.length ? data.entries.map((entry) => (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4" key={entry.id}>
            <div>
              <b>{entry.food.vietnameseName}</b>
              <p className="text-sm text-slate-500">{entry.mealType} • {entry.quantityGram}g • P {entry.protein} C {entry.carbs} F {entry.fat}</p>
            </div>
            <b>{Math.round(entry.calories)} kcal</b>
          </div>
        )) : <p className="mt-3 text-slate-500">Chưa có món ăn trong ngày này.</p>}
      </div>
    </section>
  );
}

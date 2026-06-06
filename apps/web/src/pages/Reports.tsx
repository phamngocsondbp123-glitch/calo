import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function Reports() {
  const [period, setPeriod] = useState('weekly');
  const [data, setData] = useState<any>();
  const [error, setError] = useState('');

  useEffect(() => {
    void api.get(`/reports/${period}`).then((response) => {
      setData(response.data);
      setError('');
    }).catch(() => setError('Không tải được báo cáo.'));
  }, [period]);

  const totals = (data?.nutrition ?? []).reduce(
    (acc: any, day: any) => ({ calories: acc.calories + day.calories, protein: acc.protein + day.protein, carbs: acc.carbs + day.carbs, fat: acc.fat + day.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  const macroData = [
    { name: 'Protein', value: totals.protein },
    { name: 'Carbs', value: totals.carbs },
    { name: 'Fat', value: totals.fat }
  ];

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-black">Reports & analytics</h1>
      <label className="sr-only" htmlFor="report-period">Report period</label>
      <select id="report-period" className="input max-w-xs" value={period} onChange={(event) => setPeriod(event.target.value)}>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>
      {error ? <div role="alert" className="card text-danger">{error}</div> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card h-80"><h2 className="font-bold">Calories over time</h2><ResponsiveContainer><AreaChart data={data?.nutrition ?? []}><XAxis dataKey="date" /><YAxis /><Tooltip /><Area dataKey="calories" fill="#bbf7d0" stroke="#16a34a" /></AreaChart></ResponsiveContainer></div>
        <div className="card h-80"><h2 className="font-bold">Macro distribution</h2><ResponsiveContainer><PieChart><Pie data={macroData} dataKey="value" label>{['#16a34a', '#60a5fa', '#f97316'].map((color) => <Cell fill={color} key={color} />)}</Pie></PieChart></ResponsiveContainer></div>
        <div className="card h-80"><h2 className="font-bold">Calories by meal</h2><ResponsiveContainer><BarChart data={Object.entries(data?.mealCalories ?? {}).map(([meal, calories]) => ({ meal, calories }))}><XAxis dataKey="meal" /><YAxis /><Tooltip /><Bar dataKey="calories" fill="#16a34a" /></BarChart></ResponsiveContainer></div>
        <div className="card"><h2 className="font-bold">Top 10 foods</h2>{data?.topFoods?.length ? data.topFoods.map((food: any) => <p className="mt-2 flex justify-between" key={food.food}><span>{food.food}</span><b>{food.servings} lần</b></p>) : <p className="mt-2 text-slate-500">Chưa có dữ liệu.</p>}</div>
      </div>
    </section>
  );
}

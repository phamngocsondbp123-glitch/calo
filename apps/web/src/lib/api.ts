import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api' });

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

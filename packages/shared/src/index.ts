import { z } from 'zod';

export const goalTypes = ['gain_weight', 'lose_weight', 'maintain_weight'] as const;
export const activityLevels = ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'athlete'] as const;
export const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export const genders = ['male', 'female', 'other'] as const;

export type GoalType = (typeof goalTypes)[number];
export type ActivityLevel = (typeof activityLevels)[number];
export type MealType = (typeof mealTypes)[number];
export type Gender = (typeof genders)[number];

export const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  athlete: 1.9
};

export const macroTargets = { proteinRatio: 0.25, carbsRatio: 0.5, fatRatio: 0.25 };

export function calculateBmi(weightKg: number, heightCm: number) {
  if (!weightKg || !heightCm) return 0;
  return Number((weightKg / (heightCm / 100) ** 2).toFixed(1));
}

export function calculateBmr(input: { gender: Gender; age: number; heightCm: number; weightKg: number }) {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  if (input.gender === 'female') return Math.round(base - 161);
  if (input.gender === 'male') return Math.round(base + 5);
  return Math.round(base - 78);
}

export function calculateTdee(input: { gender: Gender; age: number; heightCm: number; weightKg: number; activityLevel: ActivityLevel }) {
  return Math.round(calculateBmr(input) * activityMultipliers[input.activityLevel]);
}

export function calculateCalorieTarget(tdee: number, goalType: GoalType) {
  if (goalType === 'lose_weight') return Math.max(1200, tdee - 400);
  if (goalType === 'gain_weight') return tdee + 450;
  return tdee;
}

export function calculateMacroGrams(calories: number) {
  return {
    protein: Math.round((calories * macroTargets.proteinRatio) / 4),
    carbs: Math.round((calories * macroTargets.carbsRatio) / 4),
    fat: Math.round((calories * macroTargets.fatRatio) / 9)
  };
}

export function nutritionForQuantity(per100g: { caloriesPer100g: number; proteinPer100g: number; carbsPer100g: number; fatPer100g: number }, quantityGram: number) {
  const ratio = quantityGram / 100;
  return {
    calories: Math.round(per100g.caloriesPer100g * ratio),
    protein: Number((per100g.proteinPer100g * ratio).toFixed(1)),
    carbs: Number((per100g.carbsPer100g * ratio).toFixed(1)),
    fat: Number((per100g.fatPer100g * ratio).toFixed(1))
  };
}

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  gender: z.enum(genders).default('other'),
  age: z.coerce.number().int().min(13).max(100).default(25),
  height: z.coerce.number().min(100).max(230).default(165),
  currentWeight: z.coerce.number().min(30).max(250).default(60),
  goalWeight: z.coerce.number().min(30).max(250).default(60),
  activityLevel: z.enum(activityLevels).default('lightly_active'),
  goalType: z.enum(goalTypes).default('maintain_weight')
});

export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const foodSchema = z.object({
  name: z.string().min(1), vietnameseName: z.string().min(1), englishName: z.string().optional().nullable(), categoryId: z.string().min(1),
  caloriesPer100g: z.coerce.number().min(0), proteinPer100g: z.coerce.number().min(0), carbsPer100g: z.coerce.number().min(0), fatPer100g: z.coerce.number().min(0),
  fiberPer100g: z.coerce.number().min(0).default(0), sugarPer100g: z.coerce.number().min(0).default(0), sodiumPer100g: z.coerce.number().min(0).default(0), source: z.string().default('user'), note: z.string().optional().nullable()
});
export const diaryEntrySchema = z.object({ foodId: z.string(), mealType: z.enum(mealTypes), date: z.coerce.date(), quantityGram: z.coerce.number().positive(), note: z.string().optional().nullable() });
export const weightEntrySchema = z.object({ date: z.coerce.date(), weight: z.coerce.number().positive(), note: z.string().optional().nullable() });

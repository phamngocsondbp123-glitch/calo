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

export function nutritionForQuantity(
  per100g: { caloriesPer100g: number; proteinPer100g: number; carbsPer100g: number; fatPer100g: number },
  quantityGram: number
) {
  const ratio = quantityGram / 100;
  return {
    calories: Math.round(per100g.caloriesPer100g * ratio),
    protein: Number((per100g.proteinPer100g * ratio).toFixed(1)),
    carbs: Number((per100g.carbsPer100g * ratio).toFixed(1)),
    fat: Number((per100g.fatPer100g * ratio).toFixed(1))
  };
}

const requiredText = z.string().trim().min(1);
const optionalText = z.string().trim().optional().nullable();
const nutrient = z.coerce.number().min(0).max(1000);

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(128),
  gender: z.enum(genders).default('other'),
  age: z.coerce.number().int().min(13).max(100).default(25),
  height: z.coerce.number().min(100).max(230).default(165),
  currentWeight: z.coerce.number().min(30).max(250).default(60),
  goalWeight: z.coerce.number().min(30).max(250).default(60),
  activityLevel: z.enum(activityLevels).default('lightly_active'),
  goalType: z.enum(goalTypes).default('maintain_weight')
});

export const loginSchema = z.object({ email: z.string().trim().email().toLowerCase(), password: z.string().min(1) });

export const foodSchema = z.object({
  name: requiredText.max(160),
  vietnameseName: requiredText.max(160),
  englishName: optionalText,
  categoryId: requiredText,
  caloriesPer100g: nutrient,
  proteinPer100g: nutrient,
  carbsPer100g: nutrient,
  fatPer100g: nutrient,
  fiberPer100g: nutrient.default(0),
  sugarPer100g: nutrient.default(0),
  sodiumPer100g: nutrient.default(0),
  source: z.string().trim().max(120).default('user'),
  note: optionalText
});

export const diaryEntrySchema = z.object({
  foodId: requiredText,
  mealType: z.enum(mealTypes),
  date: z.coerce.date(),
  quantityGram: z.coerce.number().positive().max(5000),
  note: optionalText
});

export const weightEntrySchema = z.object({
  date: z.coerce.date(),
  weight: z.coerce.number().min(30).max(250),
  note: optionalText
});

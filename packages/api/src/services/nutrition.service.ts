import { calculateBmi, calculateCalorieTarget, calculateMacroGrams, calculateTdee, nutritionForQuantity, type ActivityLevel, type Gender, type GoalType } from '@calo/shared';

export function userTargets(user: { gender: Gender; age: number; height: number; currentWeight: number; activityLevel: ActivityLevel; goalType: GoalType }) {
  const bmi = calculateBmi(user.currentWeight, user.height);
  const tdee = calculateTdee({ gender: user.gender, age: user.age, heightCm: user.height, weightKg: user.currentWeight, activityLevel: user.activityLevel });
  const calories = calculateCalorieTarget(tdee, user.goalType);
  return { bmi, tdee, calories, macros: calculateMacroGrams(calories), explanation: targetExplanation(user.goalType, tdee, calories) };
}
export const foodPortion = nutritionForQuantity;
function targetExplanation(goalType: GoalType, tdee: number, calories: number) { return goalType === 'lose_weight' ? `Mục tiêu giảm cân: TDEE ${tdee} kcal - thâm hụt 400 kcal = ${calories} kcal/ngày.` : goalType === 'gain_weight' ? `Mục tiêu tăng cân: TDEE ${tdee} kcal + dư 450 kcal = ${calories} kcal/ngày.` : `Mục tiêu duy trì: ăn xấp xỉ TDEE ${tdee} kcal/ngày.`; }

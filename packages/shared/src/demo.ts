import { calculateBmi, calculateCalorieTarget, calculateMacroGrams, calculateTdee, nutritionForQuantity, type GoalType, type MealType } from './index.js';

export type DemoCategory = { id: string; vietnameseName: string; englishName: string; slug: string };
export type DemoFood = {
  id: string;
  name: string;
  vietnameseName: string;
  englishName?: string;
  categoryId: string;
  category?: DemoCategory;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g?: number;
  sugarPer100g?: number;
  sodiumPer100g?: number;
  source?: string;
  isVerified?: boolean;
};
export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  gender: 'male' | 'female' | 'other';
  age: number;
  height: number;
  currentWeight: number;
  goalWeight: number;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'athlete';
  goalType: GoalType;
};
export type DemoDiaryEntry = ReturnType<typeof createDiaryEntry>;
export type DemoWeightEntry = { id: string; userId: string; date: string; weight: number; note?: string | null };

const todayKey = () => new Date().toISOString().slice(0, 10);
const daysAgoKey = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

export const demoCategories: DemoCategory[] = [
  { id: 'cat-rice', vietnameseName: 'Cơm & tinh bột', englishName: 'Rice and starches', slug: 'rice-starches' },
  { id: 'cat-noodle', vietnameseName: 'Bún phở mì', englishName: 'Noodles', slug: 'noodles' },
  { id: 'cat-protein', vietnameseName: 'Đạm', englishName: 'Protein', slug: 'protein' },
  { id: 'cat-veg', vietnameseName: 'Rau củ', englishName: 'Vegetables', slug: 'vegetables' },
  { id: 'cat-drink', vietnameseName: 'Đồ uống', englishName: 'Drinks', slug: 'drinks' }
];

const category = (categoryId: string) => demoCategories.find((item) => item.id === categoryId);

export const demoFoods: DemoFood[] = [
  { id: 'food-com-tam', name: 'com tam suon', vietnameseName: 'Cơm tấm sườn', englishName: 'Broken rice with pork chop', categoryId: 'cat-rice', caloriesPer100g: 210, proteinPer100g: 9.2, carbsPer100g: 27, fatPer100g: 7.5, isVerified: true },
  { id: 'food-pho-bo', name: 'pho bo', vietnameseName: 'Phở bò', englishName: 'Beef pho', categoryId: 'cat-noodle', caloriesPer100g: 115, proteinPer100g: 7.1, carbsPer100g: 15.6, fatPer100g: 2.7, isVerified: true },
  { id: 'food-bun-cha', name: 'bun cha', vietnameseName: 'Bún chả', englishName: 'Grilled pork with noodles', categoryId: 'cat-noodle', caloriesPer100g: 180, proteinPer100g: 8.5, carbsPer100g: 22, fatPer100g: 6.2, isVerified: true },
  { id: 'food-uc-ga', name: 'uc ga luoc', vietnameseName: 'Ức gà luộc', englishName: 'Boiled chicken breast', categoryId: 'cat-protein', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, isVerified: true },
  { id: 'food-ca-kho', name: 'ca kho to', vietnameseName: 'Cá kho tộ', englishName: 'Caramelized fish', categoryId: 'cat-protein', caloriesPer100g: 170, proteinPer100g: 22, carbsPer100g: 3.4, fatPer100g: 7.3, isVerified: true },
  { id: 'food-rau-muong', name: 'rau muong xao toi', vietnameseName: 'Rau muống xào tỏi', englishName: 'Morning glory with garlic', categoryId: 'cat-veg', caloriesPer100g: 75, proteinPer100g: 2.6, carbsPer100g: 7, fatPer100g: 4.2, isVerified: true },
  { id: 'food-goi-cuon', name: 'goi cuon', vietnameseName: 'Gỏi cuốn', englishName: 'Fresh spring rolls', categoryId: 'cat-veg', caloriesPer100g: 120, proteinPer100g: 6.8, carbsPer100g: 18, fatPer100g: 2.4, isVerified: true },
  { id: 'food-ca-phe-sua-da', name: 'ca phe sua da', vietnameseName: 'Cà phê sữa đá', englishName: 'Vietnamese iced milk coffee', categoryId: 'cat-drink', caloriesPer100g: 85, proteinPer100g: 1.8, carbsPer100g: 15, fatPer100g: 2.2, isVerified: false }
].map((food) => ({ ...food, category: category(food.categoryId), source: 'demo' }));

export const demoUsers: DemoUser[] = [
  { id: 'demo-user', name: 'Demo User', email: 'demo@calo.vn', role: 'user', gender: 'female', age: 28, height: 165, currentWeight: 60, goalWeight: 57, activityLevel: 'lightly_active', goalType: 'lose_weight' },
  { id: 'demo-admin', name: 'Demo Admin', email: 'admin@calo.vn', role: 'admin', gender: 'male', age: 32, height: 172, currentWeight: 72, goalWeight: 72, activityLevel: 'moderately_active', goalType: 'maintain_weight' }
];

function createDiaryEntry(input: { id: string; userId: string; foodId: string; mealType: MealType; date: string; quantityGram: number }) {
  const food = demoFoods.find((item) => item.id === input.foodId) ?? demoFoods[0];
  return { ...input, ...nutritionForQuantity(food, input.quantityGram), food };
}

const seedDiaryEntries = () => [
  createDiaryEntry({ id: 'entry-1', userId: 'demo-user', foodId: 'food-pho-bo', mealType: 'breakfast', date: todayKey(), quantityGram: 450 }),
  createDiaryEntry({ id: 'entry-2', userId: 'demo-user', foodId: 'food-goi-cuon', mealType: 'lunch', date: todayKey(), quantityGram: 180 }),
  createDiaryEntry({ id: 'entry-3', userId: 'demo-user', foodId: 'food-uc-ga', mealType: 'dinner', date: todayKey(), quantityGram: 160 }),
  createDiaryEntry({ id: 'entry-4', userId: 'demo-user', foodId: 'food-com-tam', mealType: 'lunch', date: daysAgoKey(1), quantityGram: 350 }),
  createDiaryEntry({ id: 'entry-5', userId: 'demo-user', foodId: 'food-rau-muong', mealType: 'dinner', date: daysAgoKey(1), quantityGram: 200 }),
  createDiaryEntry({ id: 'entry-6', userId: 'demo-user', foodId: 'food-bun-cha', mealType: 'lunch', date: daysAgoKey(2), quantityGram: 420 })
];

const seedWeights = (): DemoWeightEntry[] => [0, 3, 7, 14, 21, 30].map((days, index) => ({ id: `weight-${index}`, userId: 'demo-user', date: daysAgoKey(days), weight: Number((60.5 - index * 0.35).toFixed(1)) })).reverse();

export function demoTargets(user: DemoUser) {
  const tdee = calculateTdee({ gender: user.gender, age: user.age, heightCm: user.height, weightKg: user.currentWeight, activityLevel: user.activityLevel });
  const calories = calculateCalorieTarget(tdee, user.goalType);
  return {
    bmi: calculateBmi(user.currentWeight, user.height),
    tdee,
    calories,
    macros: calculateMacroGrams(calories),
    explanation: user.goalType === 'lose_weight' ? 'Demo mode: thâm hụt nhẹ để giảm cân bền vững.' : user.goalType === 'gain_weight' ? 'Demo mode: dư năng lượng để tăng cân.' : 'Demo mode: duy trì cân nặng hiện tại.'
  };
}

export function createDemoStore() {
  let users = demoUsers.map((user) => ({ ...user }));
  let foods = demoFoods.map((food) => ({ ...food }));
  let diaryEntries = seedDiaryEntries();
  let weights = seedWeights();

  const currentUser = (userId = 'demo-user') => users.find((user) => user.id === userId) ?? users[0];
  const findFood = (id: string) => foods.find((food) => food.id === id) ?? foods[0];
  const summary = (userId: string, date = todayKey()) => {
    const entries = diaryEntries.filter((entry) => entry.userId === userId && entry.date.slice(0, 10) === date.slice(0, 10));
    const totals = entries.reduce((acc, entry) => ({ calories: acc.calories + entry.calories, protein: acc.protein + entry.protein, carbs: acc.carbs + entry.carbs, fat: acc.fat + entry.fat }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    const byMeal = entries.reduce<Record<string, typeof totals>>((acc, entry) => {
      acc[entry.mealType] ??= { calories: 0, protein: 0, carbs: 0, fat: 0 };
      acc[entry.mealType].calories += entry.calories;
      acc[entry.mealType].protein += entry.protein;
      acc[entry.mealType].carbs += entry.carbs;
      acc[entry.mealType].fat += entry.fat;
      return acc;
    }, {});
    return { entries, totals, byMeal };
  };

  return {
    login(email: string) {
      return users.find((user) => user.email === email) ?? users[0];
    },
    user: currentUser,
    updateGoal(userId: string, input: { goalType?: GoalType; goalWeight?: number }) {
      users = users.map((user) => user.id === userId ? { ...user, ...input } : user);
      return currentUser(userId);
    },
    foods(query: { q?: string; category?: string; minCalories?: string | number; maxCalories?: string | number } = {}) {
      const q = (query.q ?? '').trim().toLowerCase();
      return foods.filter((food) => (!q || [food.vietnameseName, food.englishName, food.name].some((name) => name?.toLowerCase().includes(q))) && (!query.category || food.category?.slug === query.category) && (!query.minCalories || food.caloriesPer100g >= Number(query.minCalories)) && (!query.maxCalories || food.caloriesPer100g <= Number(query.maxCalories))).slice(0, 50);
    },
    categories: () => demoCategories,
    findFood,
    verifyFood(id: string) {
      foods = foods.map((food) => food.id === id ? { ...food, isVerified: true } : food);
      return findFood(id);
    },
    diary: summary,
    addDiary(userId: string, input: { foodId: string; mealType: MealType; date: string; quantityGram: number }) {
      const entry = createDiaryEntry({ id: `entry-${Date.now()}`, userId, ...input });
      diaryEntries = [entry, ...diaryEntries];
      return entry;
    },
    weights: (userId: string) => weights.filter((entry) => entry.userId === userId),
    addWeight(userId: string, input: { date: string; weight: number; note?: string | null }) {
      const date = input.date.slice(0, 10);
      weights = weights.filter((entry) => !(entry.userId === userId && entry.date.slice(0, 10) === date));
      const weight = { id: `weight-${Date.now()}`, userId, ...input, date };
      weights = [...weights, weight].sort((a, b) => a.date.localeCompare(b.date));
      users = users.map((user) => user.id === userId ? { ...user, currentWeight: input.weight } : user);
      return weight;
    },
    report(userId: string, period: string) {
      const days = ({ daily: 1, weekly: 7, monthly: 30, yearly: 365 } as Record<string, number>)[period] ?? 7;
      const allowedDates = new Set(Array.from({ length: days }, (_, index) => daysAgoKey(index)));
      const entries = diaryEntries.filter((entry) => entry.userId === userId && allowedDates.has(entry.date.slice(0, 10)));
      const nutrition = Array.from(allowedDates).sort().map((date) => summary(userId, date).totals).map((totals, index) => ({ date: Array.from(allowedDates).sort()[index], ...totals }));
      const topFoods = Object.values(entries.reduce<Record<string, { food: string; servings: number; calories: number }>>((acc, entry) => {
        acc[entry.foodId] ??= { food: entry.food.vietnameseName, servings: 0, calories: 0 };
        acc[entry.foodId].servings += 1;
        acc[entry.foodId].calories += entry.calories;
        return acc;
      }, {}));
      const mealCalories = entries.reduce<Record<string, number>>((acc, entry) => ({ ...acc, [entry.mealType]: (acc[entry.mealType] ?? 0) + entry.calories }), {});
      return { period, nutrition, topFoods, mealCalories, weights: weights.filter((entry) => entry.userId === userId) };
    },
    suggestions(userId: string) {
      const user = currentUser(userId);
      const { totals } = summary(userId, todayKey());
      const targets = demoTargets(user);
      const calorieGap = targets.calories - totals.calories;
      const proteinGap = targets.macros.protein - totals.protein;
      const suggestions = foods.filter((food) => proteinGap > 20 ? food.proteinPer100g >= 18 : food.caloriesPer100g >= 75).slice(0, 3).map((food) => ({ food, servingGram: food.proteinPer100g >= 18 ? 150 : 100 }));
      const warning = calorieGap < 0 ? `Bạn đã vượt ${Math.abs(Math.round(calorieGap))} kcal trong demo hôm nay.` : undefined;
      return { message: warning ?? `Demo mode: bạn còn cần ${Math.round(calorieGap)} kcal và ${Math.max(0, Math.round(proteinGap))}g protein hôm nay.`, warning, suggestions };
    },
    adminStats() {
      return { users: users.length, foods: foods.length, diaryEntries: diaryEntries.length, pendingFoods: foods.filter((food) => !food.isVerified).length };
    }
  };
}

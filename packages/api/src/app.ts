import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';
import { prisma, type Food, type MealType, type Prisma, type User } from '@calo/database';
import { diaryEntrySchema, foodSchema, loginSchema, registerSchema, weightEntrySchema, nutritionForQuantity, goalTypes, mealTypes } from '@calo/shared';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { env } from './config/env.js';
import { requireAdmin, requireAuth, signToken } from './middleware/auth.js';
import { asyncHandler, errorHandler, HttpError } from './utils/http.js';
import { userTargets } from './services/nutrition.service.js';

const app = express();
const upload = multer({ dest: env.uploadDir, limits: { fileSize: 5 * 1024 * 1024 } });

app.use(helmet());
app.use(cors({ origin: env.corsOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

const publicUser = (user: User) => {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
};

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);
const dayRange = (date: string | Date) => {
  const start = new Date(date);
  if (Number.isNaN(start.getTime())) throw new HttpError(400, 'Invalid date');
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { gte: start, lt: end };
};

const createGoal = async (user: User) => {
  const targets = userTargets(user);
  await prisma.goal.updateMany({ where: { userId: user.id, isActive: true }, data: { isActive: false, endDate: new Date() } });
  return prisma.goal.create({
    data: {
      userId: user.id,
      goalType: user.goalType,
      startWeight: user.currentWeight,
      targetWeight: user.goalWeight,
      dailyCalories: targets.calories,
      proteinTarget: targets.macros.protein,
      carbsTarget: targets.macros.carbs,
      fatTarget: targets.macros.fat
    }
  });
};

async function diarySummary(userId: string, date: string) {
  const entries = await prisma.diaryEntry.findMany({
    where: { userId, date: dayRange(date) },
    include: { food: { include: { category: true } } },
    orderBy: { createdAt: 'asc' }
  });
  const emptyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const totals = entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat
    }),
    emptyTotals
  );
  const byMeal = entries.reduce<Record<MealType, typeof emptyTotals>>((acc, entry) => {
    acc[entry.mealType] ??= { ...emptyTotals };
    acc[entry.mealType].calories += entry.calories;
    acc[entry.mealType].protein += entry.protein;
    acc[entry.mealType].carbs += entry.carbs;
    acc[entry.mealType].fat += entry.fat;
    return acc;
  }, {} as Record<MealType, typeof emptyTotals>);
  return { entries, totals, byMeal };
}

function foodSearchWhere(query: { q?: unknown; category?: unknown; minCalories?: unknown; maxCalories?: unknown }): Prisma.FoodWhereInput {
  const where: Prisma.FoodWhereInput[] = [];
  const q = String(query.q ?? '').trim();
  if (q) {
    where.push({
      OR: [
        { vietnameseName: { contains: q, mode: 'insensitive' } },
        { englishName: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } }
      ]
    });
  }
  if (query.category) where.push({ category: { slug: String(query.category) } });
  if (query.minCalories) where.push({ caloriesPer100g: { gte: Number(query.minCalories) } });
  if (query.maxCalories) where.push({ caloriesPer100g: { lte: Number(query.maxCalories) } });
  return where.length ? { AND: where } : {};
}

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'calo-api' }));

app.post('/api/auth/register', asyncHandler(async (req, res) => {
  const body = registerSchema.parse(req.body);
  const exists = await prisma.user.findUnique({ where: { email: body.email } });
  if (exists) throw new HttpError(409, 'Email already registered');

  const { password, ...profile } = body;
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { ...profile, passwordHash } });
  await createGoal(user);
  res.status(201).json({ user: publicUser(user), token: signToken({ id: user.id, role: user.role }) });
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) throw new HttpError(401, 'Invalid credentials');
  res.json({ user: publicUser(user), token: signToken({ id: user.id, role: user.role }) });
}));

app.post('/api/auth/logout', (_req, res) => res.status(204).send());
app.get('/api/auth/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  res.json({ user: publicUser(user), targets: userTargets(user) });
}));

app.get('/api/users/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  res.json({ user: publicUser(user), targets: userTargets(user) });
}));

app.put('/api/users/me', requireAuth, asyncHandler(async (req, res) => {
  const schema = registerSchema.omit({ password: true, email: true }).partial();
  const user = await prisma.user.update({ where: { id: req.user!.id }, data: schema.parse(req.body) });
  res.json({ user: publicUser(user), targets: userTargets(user) });
}));

app.put('/api/users/goals', requireAuth, asyncHandler(async (req, res) => {
  const schema = z.object({ goalType: z.enum(goalTypes), goalWeight: z.coerce.number().min(30).max(250) });
  const data = schema.parse(req.body);
  const user = await prisma.user.update({ where: { id: req.user!.id }, data });
  const goal = await createGoal(user);
  res.json({ user: publicUser(user), goal, targets: userTargets(user) });
}));

app.get('/api/foods', requireAuth, asyncHandler(async (req, res) => {
  const foods = await prisma.food.findMany({
    where: foodSearchWhere(req.query),
    include: { category: true },
    take: 50,
    orderBy: [{ isVerified: 'desc' }, { vietnameseName: 'asc' }]
  });
  res.json({ foods });
}));

app.get('/api/foods/search', requireAuth, asyncHandler(async (req, res) => {
  const foods = await prisma.food.findMany({ where: foodSearchWhere(req.query), include: { category: true }, take: 20 });
  res.json({ foods });
}));
app.get('/api/foods/categories', requireAuth, asyncHandler(async (_req, res) => res.json({ categories: await prisma.foodCategory.findMany({ orderBy: { vietnameseName: 'asc' } }) })));
app.get('/api/foods/recent', requireAuth, asyncHandler(async (req, res) => {
  const entries = await prisma.diaryEntry.findMany({ where: { userId: req.user!.id }, distinct: ['foodId'], include: { food: { include: { category: true } } }, orderBy: { createdAt: 'desc' }, take: 10 });
  res.json({ foods: entries.map((entry) => entry.food) });
}));
app.get('/api/foods/popular', requireAuth, asyncHandler(async (_req, res) => {
  const rows = await prisma.diaryEntry.groupBy({ by: ['foodId'], _count: true, orderBy: { _count: { foodId: 'desc' } }, take: 10 });
  const foods = await prisma.food.findMany({ where: { id: { in: rows.map((row) => row.foodId) } }, include: { category: true } });
  res.json({ foods });
}));
app.get('/api/foods/:id', requireAuth, asyncHandler(async (req, res) => res.json({ food: await prisma.food.findUniqueOrThrow({ where: { id: req.params.id }, include: { category: true } }) })));
app.post('/api/foods', requireAuth, asyncHandler(async (req, res) => {
  const parsed = foodSchema.parse(req.body);
  const food = await prisma.food.create({ data: { ...parsed, createdById: req.user!.id, source: 'user', isVerified: false } });
  res.status(201).json({ food });
}));
app.put('/api/foods/:id', requireAuth, asyncHandler(async (req, res) => {
  const existing = await prisma.food.findUniqueOrThrow({ where: { id: req.params.id } });
  if (existing.createdById !== req.user!.id && req.user!.role !== 'admin') throw new HttpError(403, 'Cannot edit this food');
  res.json({ food: await prisma.food.update({ where: { id: req.params.id }, data: foodSchema.partial().parse(req.body) }) });
}));
app.delete('/api/foods/:id', requireAuth, asyncHandler(async (req, res) => {
  const existing = await prisma.food.findUniqueOrThrow({ where: { id: req.params.id } });
  if (existing.createdById !== req.user!.id && req.user!.role !== 'admin') throw new HttpError(403, 'Cannot delete this food');
  await prisma.food.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

app.get('/api/diary', requireAuth, asyncHandler(async (req, res) => res.json(await diarySummary(req.user!.id, String(req.query.date ?? toDateKey(new Date()))))));
app.get('/api/diary/summary', requireAuth, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  const summary = await diarySummary(req.user!.id, String(req.query.date ?? toDateKey(new Date())));
  res.json({ ...summary, targets: userTargets(user) });
}));
app.post('/api/diary', requireAuth, asyncHandler(async (req, res) => {
  const body = diaryEntrySchema.parse(req.body);
  const food = await prisma.food.findUniqueOrThrow({ where: { id: body.foodId } });
  const nutrition = nutritionForQuantity(food, body.quantityGram);
  const entry = await prisma.diaryEntry.create({ data: { ...body, userId: req.user!.id, ...nutrition } });
  res.status(201).json({ entry });
}));
app.put('/api/diary/:id', requireAuth, asyncHandler(async (req, res) => {
  const old = await prisma.diaryEntry.findFirstOrThrow({ where: { id: req.params.id, userId: req.user!.id }, include: { food: true } });
  const body = diaryEntrySchema.partial().parse(req.body);
  const food: Food = body.foodId ? await prisma.food.findUniqueOrThrow({ where: { id: body.foodId } }) : old.food;
  const quantityGram = body.quantityGram ?? old.quantityGram;
  const nutrition = nutritionForQuantity(food, quantityGram);
  res.json({ entry: await prisma.diaryEntry.update({ where: { id: old.id }, data: { ...body, quantityGram, ...nutrition } }) });
}));
app.delete('/api/diary/:id', requireAuth, asyncHandler(async (req, res) => {
  const result = await prisma.diaryEntry.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
  if (!result.count) throw new HttpError(404, 'Diary entry not found');
  res.status(204).send();
}));
app.post('/api/diary/copy-yesterday', requireAuth, asyncHandler(async (req, res) => {
  const date = String(req.body.date ?? toDateKey(new Date()));
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) throw new HttpError(400, 'Invalid target date');
  const yesterday = new Date(target);
  yesterday.setDate(yesterday.getDate() - 1);
  const items = await prisma.diaryEntry.findMany({ where: { userId: req.user!.id, date: dayRange(yesterday) } });
  const created = await prisma.$transaction(items.map(({ id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...entry }) => prisma.diaryEntry.create({ data: { ...entry, date: target } })));
  res.status(201).json({ entries: created });
}));

app.get('/api/meal-templates', requireAuth, asyncHandler(async (req, res) => res.json({ templates: await prisma.mealTemplate.findMany({ where: { userId: req.user!.id }, include: { items: { include: { food: true } } }, orderBy: { updatedAt: 'desc' } }) })));
app.post('/api/meal-templates', requireAuth, asyncHandler(async (req, res) => {
  const schema = z.object({ name: z.string().trim().min(1), description: z.string().trim().optional(), items: z.array(z.object({ foodId: z.string().min(1), quantityGram: z.coerce.number().positive().max(5000) })).min(1) });
  const body = schema.parse(req.body);
  const template = await prisma.mealTemplate.create({ data: { userId: req.user!.id, name: body.name, description: body.description, items: { create: body.items } }, include: { items: { include: { food: true } } } });
  res.status(201).json({ template });
}));
app.post('/api/meal-templates/:id/add-to-diary', requireAuth, asyncHandler(async (req, res) => {
  const schema = z.object({ date: z.coerce.date(), mealType: z.enum(mealTypes) });
  const body = schema.parse(req.body);
  const template = await prisma.mealTemplate.findFirstOrThrow({ where: { id: req.params.id, userId: req.user!.id }, include: { items: { include: { food: true } } } });
  const entries = await prisma.$transaction(template.items.map((item) => {
    const nutrition = nutritionForQuantity(item.food, item.quantityGram);
    return prisma.diaryEntry.create({ data: { userId: req.user!.id, foodId: item.foodId, mealType: body.mealType, date: body.date, quantityGram: item.quantityGram, ...nutrition } });
  }));
  res.status(201).json({ entries });
}));
app.put('/api/meal-templates/:id', requireAuth, asyncHandler(async (req, res) => {
  const schema = z.object({ name: z.string().trim().min(1).optional(), description: z.string().trim().optional().nullable() });
  const existing = await prisma.mealTemplate.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
  if (!existing) throw new HttpError(404, 'Meal template not found');
  res.json({ template: await prisma.mealTemplate.update({ where: { id: existing.id }, data: schema.parse(req.body) }) });
}));
app.delete('/api/meal-templates/:id', requireAuth, asyncHandler(async (req, res) => {
  const result = await prisma.mealTemplate.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
  if (!result.count) throw new HttpError(404, 'Meal template not found');
  res.status(204).send();
}));

app.get('/api/weights', requireAuth, asyncHandler(async (req, res) => res.json({ weights: await prisma.weightEntry.findMany({ where: { userId: req.user!.id }, orderBy: { date: 'asc' } }) })));
app.post('/api/weights', requireAuth, asyncHandler(async (req, res) => {
  const body = weightEntrySchema.parse(req.body);
  const weight = await prisma.weightEntry.upsert({ where: { userId_date: { userId: req.user!.id, date: body.date } }, update: { weight: body.weight, note: body.note }, create: { ...body, userId: req.user!.id } });
  await prisma.user.update({ where: { id: req.user!.id }, data: { currentWeight: body.weight } });
  res.status(201).json({ weight });
}));
app.put('/api/weights/:id', requireAuth, asyncHandler(async (req, res) => {
  const existing = await prisma.weightEntry.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
  if (!existing) throw new HttpError(404, 'Weight entry not found');
  res.json({ weight: await prisma.weightEntry.update({ where: { id: existing.id }, data: weightEntrySchema.partial().parse(req.body) }) });
}));
app.delete('/api/weights/:id', requireAuth, asyncHandler(async (req, res) => {
  const result = await prisma.weightEntry.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
  if (!result.count) throw new HttpError(404, 'Weight entry not found');
  res.status(204).send();
}));

app.get('/api/reports/:period', requireAuth, asyncHandler(async (req, res) => {
  const days = ({ daily: 1, weekly: 7, monthly: 30, yearly: 365 } as Record<string, number>)[req.params.period] ?? 7;
  const from = new Date();
  from.setDate(from.getDate() - days + 1);
  from.setHours(0, 0, 0, 0);
  const entries = await prisma.diaryEntry.findMany({ where: { userId: req.user!.id, date: { gte: from } }, include: { food: true } });
  const daily = new Map<string, { date: string; calories: number; protein: number; carbs: number; fat: number }>();
  for (const entry of entries) {
    const key = toDateKey(entry.date);
    const row = daily.get(key) ?? { date: key, calories: 0, protein: 0, carbs: 0, fat: 0 };
    row.calories += entry.calories;
    row.protein += entry.protein;
    row.carbs += entry.carbs;
    row.fat += entry.fat;
    daily.set(key, row);
  }
  const topFoods = Object.values(entries.reduce<Record<string, { food: string; servings: number; calories: number }>>((acc, entry) => {
    acc[entry.foodId] ??= { food: entry.food.vietnameseName, servings: 0, calories: 0 };
    acc[entry.foodId].servings += 1;
    acc[entry.foodId].calories += entry.calories;
    return acc;
  }, {})).sort((a, b) => b.servings - a.servings).slice(0, 10);
  const mealCalories = entries.reduce<Record<MealType, number>>((acc, entry) => {
    acc[entry.mealType] = (acc[entry.mealType] ?? 0) + entry.calories;
    return acc;
  }, {} as Record<MealType, number>);
  const weights = await prisma.weightEntry.findMany({ where: { userId: req.user!.id, date: { gte: from } }, orderBy: { date: 'asc' } });
  res.json({ period: req.params.period, nutrition: [...daily.values()], topFoods, mealCalories, weights });
}));

app.get('/api/suggestions/today', requireAuth, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  const { totals } = await diarySummary(req.user!.id, toDateKey(new Date()));
  const targets = userTargets(user);
  const calorieGap = targets.calories - totals.calories;
  const proteinGap = targets.macros.protein - totals.protein;
  const warning = calorieGap < 0 ? `Bạn đã vượt ${Math.abs(Math.round(calorieGap))} kcal hôm nay. Hãy ưu tiên rau xanh và protein nạc.` : undefined;
  const foods = await prisma.food.findMany({ where: proteinGap > 20 ? { proteinPer100g: { gte: 18 } } : { caloriesPer100g: { gte: calorieGap > 500 ? 150 : 60 } }, take: 6, orderBy: proteinGap > 20 ? { proteinPer100g: 'desc' } : { caloriesPer100g: 'desc' } });
  res.json({ message: calorieGap > 0 ? `Bạn còn cần ${Math.round(calorieGap)} kcal và ${Math.max(0, Math.round(proteinGap))}g protein hôm nay.` : warning, warning, suggestions: foods.map((food) => ({ food, servingGram: food.proteinPer100g > 20 ? 150 : 100 })) });
}));

app.get('/api/barcodes/:barcode', requireAuth, asyncHandler(async (req, res) => res.json({ product: await prisma.barcodeProduct.findUnique({ where: { barcode: req.params.barcode } }) })));
app.post('/api/barcodes', requireAuth, asyncHandler(async (req, res) => {
  const schema = z.object({ barcode: z.string().trim().min(3), productName: z.string().trim().min(1), brand: z.string().trim().optional(), caloriesPer100g: z.coerce.number().min(0), proteinPer100g: z.coerce.number().min(0), carbsPer100g: z.coerce.number().min(0), fatPer100g: z.coerce.number().min(0) });
  const body = schema.parse(req.body);
  const product = await prisma.barcodeProduct.upsert({ where: { barcode: body.barcode }, update: body, create: body });
  res.status(201).json({ product });
}));
app.post('/api/uploads/food-image', requireAuth, upload.single('image'), (req, res) => res.json({ file: req.file, message: 'AI recognition coming soon. Please select food manually.' }));

app.get('/api/admin/users', requireAuth, requireAdmin, asyncHandler(async (_req, res) => res.json({ users: (await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })).map(publicUser) })));
app.get('/api/admin/foods', requireAuth, requireAdmin, asyncHandler(async (_req, res) => res.json({ foods: await prisma.food.findMany({ include: { category: true, createdBy: true }, orderBy: { updatedAt: 'desc' } }) })));
app.post('/api/admin/foods', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const parsed = foodSchema.parse(req.body);
  res.status(201).json({ food: await prisma.food.create({ data: { ...parsed, isVerified: true } }) });
}));
app.put('/api/admin/foods/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => res.json({ food: await prisma.food.update({ where: { id: req.params.id }, data: foodSchema.partial().parse(req.body) }) })));
app.delete('/api/admin/foods/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  await prisma.food.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));
app.put('/api/admin/foods/:id/verify', requireAuth, requireAdmin, asyncHandler(async (req, res) => res.json({ food: await prisma.food.update({ where: { id: req.params.id }, data: { isVerified: true } }) })));
app.get('/api/admin/stats', requireAuth, requireAdmin, asyncHandler(async (_req, res) => res.json({ users: await prisma.user.count(), foods: await prisma.food.count(), diaryEntries: await prisma.diaryEntry.count(), pendingFoods: await prisma.food.count({ where: { isVerified: false } }) })));

app.use(errorHandler);
export default app;

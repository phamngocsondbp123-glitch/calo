import { Router } from 'express';
import { createDemoStore, demoTargets, type DemoUser, type GoalType, type MealType } from '@calo/shared';
import { signToken } from '../middleware/auth.js';

const store = createDemoStore();
const router = Router();

const userIdFromHeader = (authorization?: string) => {
  if (authorization?.includes('demo-admin')) return 'demo-admin';
  return authorization ? 'demo-user' : 'demo-user';
};
const currentUser = (authorization?: string) => store.user(userIdFromHeader(authorization));
const withTargets = (user: DemoUser) => ({ user, targets: demoTargets(user) });

router.get('/health', (_req, res) => res.json({ ok: true, service: 'calo-api', mode: 'demo' }));

router.post('/auth/login', (req, res) => {
  const user = store.login(String(req.body?.email ?? 'demo@calo.vn'));
  res.json({ user, token: signToken({ id: user.id, role: user.role }) });
});
router.post('/auth/register', (req, res) => {
  const user = store.login(String(req.body?.email ?? 'demo@calo.vn'));
  res.status(201).json({ user, token: signToken({ id: user.id, role: user.role }) });
});
router.post('/auth/logout', (_req, res) => res.status(204).send());
router.get('/auth/me', (req, res) => res.json(withTargets(currentUser(req.headers.authorization))));
router.get('/users/me', (req, res) => res.json(withTargets(currentUser(req.headers.authorization))));
router.put('/users/goals', (req, res) => {
  const user = store.updateGoal(currentUser(req.headers.authorization).id, { goalType: req.body.goalType as GoalType, goalWeight: Number(req.body.goalWeight) });
  res.json({ ...withTargets(user), goal: { id: 'demo-goal', isActive: true } });
});

router.get('/foods', (req, res) => res.json({ foods: store.foods(req.query as Record<string, string>) }));
router.get('/foods/search', (req, res) => res.json({ foods: store.foods(req.query as Record<string, string>) }));
router.get('/foods/categories', (_req, res) => res.json({ categories: store.categories() }));
router.get('/foods/recent', (_req, res) => res.json({ foods: store.foods().slice(0, 5) }));
router.get('/foods/popular', (_req, res) => res.json({ foods: store.foods().slice(0, 5) }));
router.get('/foods/:id', (req, res) => res.json({ food: store.findFood(req.params.id) }));

router.get('/diary', (req, res) => res.json(store.diary(currentUser(req.headers.authorization).id, String(req.query.date ?? new Date().toISOString().slice(0, 10)))));
router.get('/diary/summary', (req, res) => {
  const user = currentUser(req.headers.authorization);
  res.json({ ...store.diary(user.id, String(req.query.date ?? new Date().toISOString().slice(0, 10))), targets: demoTargets(user) });
});
router.post('/diary', (req, res) => {
  const user = currentUser(req.headers.authorization);
  const entry = store.addDiary(user.id, { foodId: req.body.foodId, mealType: req.body.mealType as MealType, date: String(req.body.date ?? new Date().toISOString().slice(0, 10)), quantityGram: Number(req.body.quantityGram ?? 100) });
  res.status(201).json({ entry });
});

router.get('/weights', (req, res) => res.json({ weights: store.weights(currentUser(req.headers.authorization).id) }));
router.post('/weights', (req, res) => {
  const weight = store.addWeight(currentUser(req.headers.authorization).id, { date: String(req.body.date ?? new Date().toISOString().slice(0, 10)), weight: Number(req.body.weight), note: req.body.note });
  res.status(201).json({ weight });
});
router.get('/reports/:period', (req, res) => res.json(store.report(currentUser(req.headers.authorization).id, req.params.period)));
router.get('/suggestions/today', (req, res) => res.json(store.suggestions(currentUser(req.headers.authorization).id)));
router.get('/barcodes/:barcode', (req, res) => res.json({ product: null, barcode: req.params.barcode }));
router.post('/barcodes', (req, res) => res.status(201).json({ product: req.body }));
router.post('/uploads/food-image', (_req, res) => res.json({ file: null, message: 'Demo mode: AI recognition coming soon. Please select food manually.' }));

router.get('/admin/users', (_req, res) => res.json({ users: ['demo-user', 'demo-admin'].map((id) => store.user(id)) }));
router.get('/admin/foods', (_req, res) => res.json({ foods: store.foods() }));
router.put('/admin/foods/:id/verify', (req, res) => res.json({ food: store.verifyFood(req.params.id) }));
router.get('/admin/stats', (_req, res) => res.json(store.adminStats()));

export default router;

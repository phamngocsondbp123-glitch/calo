# Calo Việt API documentation

Base URL: `http://localhost:4000/api`

All endpoints except auth login/register and health require `Authorization: Bearer <token>`.

## Auth

- `POST /auth/register` — Create a user and initial active goal.
- `POST /auth/login` — Return user and JWT token.
- `POST /auth/logout` — Stateless logout placeholder.
- `GET /auth/me` — Return current user and BMI/TDEE/macro targets.

## Users

- `GET /users/me`
- `PUT /users/me`
- `PUT /users/goals`

Goal payload:

```json
{ "goalType": "gain_weight", "goalWeight": 68 }
```

## Foods

- `GET /foods?q=&category=&minCalories=&maxCalories=`
- `GET /foods/search?q=pho`
- `GET /foods/categories`
- `GET /foods/recent`
- `GET /foods/popular`
- `GET /foods/:id`
- `POST /foods`
- `PUT /foods/:id`
- `DELETE /foods/:id`

Food payload:

```json
{
  "name": "Cơm nhà tự nấu",
  "vietnameseName": "Cơm nhà tự nấu",
  "englishName": "Homemade rice",
  "categoryId": "category_id",
  "caloriesPer100g": 130,
  "proteinPer100g": 2.7,
  "carbsPer100g": 28.2,
  "fatPer100g": 0.3,
  "fiberPer100g": 0,
  "sugarPer100g": 0,
  "sodiumPer100g": 0,
  "source": "user"
}
```

## Diary

- `GET /diary?date=2026-06-06`
- `GET /diary/summary?date=2026-06-06`
- `POST /diary`
- `PUT /diary/:id`
- `DELETE /diary/:id`
- `POST /diary/copy-yesterday`

Diary payload:

```json
{ "foodId": "food_id", "mealType": "breakfast", "date": "2026-06-06", "quantityGram": 150 }
```

## Meal templates

- `GET /meal-templates`
- `POST /meal-templates`
- `PUT /meal-templates/:id`
- `DELETE /meal-templates/:id`
- `POST /meal-templates/:id/add-to-diary`

Template payload:

```json
{ "name": "Bữa sáng tăng cân", "items": [{ "foodId": "food_id", "quantityGram": 100 }] }
```

## Weight

- `GET /weights`
- `POST /weights`
- `PUT /weights/:id`
- `DELETE /weights/:id`

Weight payload:

```json
{ "date": "2026-06-06", "weight": 62.4, "note": "Morning weight" }
```

## Reports

- `GET /reports/daily`
- `GET /reports/weekly`
- `GET /reports/monthly`
- `GET /reports/yearly`

Returns nutrition time series, macro totals, calories by meal type, top 10 eaten foods, and weight entries for the period.

## Suggestions

- `GET /suggestions/today`

Returns a rule-based message, warning if over target, and food suggestions based on calorie/protein gaps.

## Barcode and image placeholders

- `GET /barcodes/:barcode`
- `POST /barcodes`
- `POST /uploads/food-image` with multipart field `image`.

The image endpoint returns `AI recognition coming soon` and lets the UI continue with manual food selection.

## Admin

Admin role required.

- `GET /admin/users`
- `GET /admin/foods`
- `POST /admin/foods`
- `PUT /admin/foods/:id`
- `DELETE /admin/foods/:id`
- `PUT /admin/foods/:id/verify`
- `GET /admin/stats`

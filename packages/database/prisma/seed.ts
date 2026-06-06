import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
  ['Rice / grains', 'Cơm / ngũ cốc', 'rice-grains'], ['Meat', 'Thịt', 'meat'], ['Fish / seafood', 'Cá / hải sản', 'fish-seafood'], ['Eggs', 'Trứng', 'eggs'],
  ['Dairy', 'Sữa', 'dairy'], ['Vegetables', 'Rau củ', 'vegetables'], ['Fruits', 'Trái cây', 'fruits'], ['Nuts', 'Các loại hạt', 'nuts'], ['Drinks', 'Đồ uống', 'drinks'],
  ['Vietnamese dishes', 'Món Việt', 'vietnamese-dishes'], ['Fast food', 'Đồ ăn nhanh', 'fast-food'], ['Supplements', 'Thực phẩm bổ sung', 'supplements'], ['Others', 'Khác', 'others']
] as const;

const foods = [
['Cơm trắng','White rice','Rice / grains',130,2.7,28.2,0.3],['Cơm gạo lứt','Brown rice','Rice / grains',111,2.6,23,0.9],['Bún tươi','Rice vermicelli','Rice / grains',110,1.7,25,0.2],['Phở tươi','Pho noodles','Rice / grains',123,2.1,27,0.4],['Miến dong','Glass noodles','Rice / grains',330,0.5,82,0.1],['Mì trứng','Egg noodles','Rice / grains',138,4.5,25,2.1],['Bánh mì không','Vietnamese baguette','Rice / grains',270,8.5,56,1.5],['Bánh đa','Rice cracker','Rice / grains',350,6,78,1],['Khoai lang','Sweet potato','Rice / grains',86,1.6,20,0.1],['Khoai tây','Potato','Rice / grains',77,2,17,0.1],['Yến mạch','Oats','Rice / grains',389,16.9,66,6.9],['Ngô luộc','Boiled corn','Rice / grains',96,3.4,21,1.5],
['Ức gà','Chicken breast','Meat',165,31,0,3.6],['Đùi gà','Chicken thigh','Meat',209,26,0,10.9],['Thịt bò nạc','Lean beef','Meat',217,26,0,12],['Thịt heo nạc','Lean pork','Meat',242,27,0,14],['Thịt ba chỉ','Pork belly','Meat',518,9,0,53],['Sườn heo','Pork ribs','Meat',321,21,0,26],['Giò lụa','Vietnamese pork sausage','Meat',230,16,3,17],['Chả bò','Beef sausage','Meat',210,18,4,13],['Xúc xích','Sausage','Meat',301,12,2,27],['Thịt vịt','Duck meat','Meat',337,19,0,28],
['Cá hồi','Salmon','Fish / seafood',208,20,0,13],['Cá thu','Mackerel','Fish / seafood',205,19,0,14],['Cá basa','Basa fish','Fish / seafood',158,16,0,9],['Cá ngừ','Tuna','Fish / seafood',132,28,0,1],['Cá rô phi','Tilapia','Fish / seafood',129,26,0,2.7],['Tôm','Shrimp','Fish / seafood',99,24,0.2,0.3],['Mực','Squid','Fish / seafood',92,15.6,3.1,1.4],['Cua biển','Crab','Fish / seafood',97,19,0,1.5],['Nghêu','Clams','Fish / seafood',86,15,3.6,1],['Hàu','Oyster','Fish / seafood',68,7,4,2.5],
['Trứng gà','Chicken egg','Eggs',155,13,1.1,11],['Lòng trắng trứng','Egg white','Eggs',52,11,0.7,0.2],['Trứng vịt','Duck egg','Eggs',185,13,1.5,14],['Trứng cút','Quail egg','Eggs',158,13,0.4,11],
['Sữa tươi không đường','Unsweetened milk','Dairy',61,3.2,4.8,3.3],['Sữa tươi có đường','Sweetened milk','Dairy',76,3.1,9.5,3.2],['Sữa chua không đường','Plain yogurt','Dairy',59,10,3.6,0.4],['Sữa chua có đường','Sweetened yogurt','Dairy',95,3.5,15,3],['Phô mai','Cheese','Dairy',402,25,1.3,33],['Sữa đặc','Condensed milk','Dairy',321,7.9,54,8.7],
['Rau muống','Water spinach','Vegetables',19,2.6,3.1,0.2],['Cải xanh','Mustard greens','Vegetables',27,2.9,4.7,0.4],['Cải thìa','Bok choy','Vegetables',13,1.5,2.2,0.2],['Bông cải xanh','Broccoli','Vegetables',34,2.8,6.6,0.4],['Cà rốt','Carrot','Vegetables',41,0.9,10,0.2],['Cà chua','Tomato','Vegetables',18,0.9,3.9,0.2],['Dưa leo','Cucumber','Vegetables',15,0.7,3.6,0.1],['Bí đỏ','Pumpkin','Vegetables',26,1,6.5,0.1],['Đậu que','Green beans','Vegetables',31,1.8,7,0.1],['Nấm rơm','Straw mushroom','Vegetables',32,3.8,4.6,0.7],['Đậu phụ','Tofu','Vegetables',76,8,1.9,4.8],['Giá đỗ','Bean sprouts','Vegetables',30,3,6,0.2],
['Chuối','Banana','Fruits',89,1.1,23,0.3],['Táo','Apple','Fruits',52,0.3,14,0.2],['Cam','Orange','Fruits',47,0.9,12,0.1],['Xoài','Mango','Fruits',60,0.8,15,0.4],['Dưa hấu','Watermelon','Fruits',30,0.6,8,0.2],['Ổi','Guava','Fruits',68,2.6,14,1],['Thanh long','Dragon fruit','Fruits',57,0.4,13,0.1],['Bơ','Avocado','Fruits',160,2,9,15],['Nho','Grapes','Fruits',69,0.7,18,0.2],['Dứa','Pineapple','Fruits',50,0.5,13,0.1],
['Hạt điều','Cashew','Nuts',553,18,30,44],['Đậu phộng','Peanut','Nuts',567,26,16,49],['Bơ đậu phộng','Peanut butter','Nuts',588,25,20,50],['Hạnh nhân','Almond','Nuts',579,21,22,50],['Hạt óc chó','Walnut','Nuts',654,15,14,65],['Hạt chia','Chia seeds','Nuts',486,17,42,31],
['Nước lọc','Water','Drinks',0,0,0,0],['Cà phê sữa đá','Iced milk coffee','Drinks',120,2,20,4],['Trà sữa','Milk tea','Drinks',160,2,28,5],['Nước cam','Orange juice','Drinks',45,0.7,10,0.2],['Nước dừa','Coconut water','Drinks',19,0.7,3.7,0.2],['Sinh tố bơ','Avocado smoothie','Drinks',180,3,22,9],['Sữa đậu nành','Soy milk','Drinks',54,3.3,6,1.8],
['Phở bò','Beef pho','Vietnamese dishes',180,10,22,5],['Phở gà','Chicken pho','Vietnamese dishes',165,11,20,4],['Bánh mì thịt','Pork banh mi','Vietnamese dishes',290,12,40,9],['Bún bò Huế','Hue beef noodle soup','Vietnamese dishes',190,11,24,6],['Bún chả','Bun cha','Vietnamese dishes',210,12,26,7],['Bún thịt nướng','Grilled pork vermicelli','Vietnamese dishes',220,11,30,7],['Cơm tấm sườn','Broken rice pork chop','Vietnamese dishes',240,13,31,8],['Gỏi cuốn','Fresh spring roll','Vietnamese dishes',100,6,14,2],['Chả giò','Fried spring roll','Vietnamese dishes',250,8,24,14],['Bánh xèo','Vietnamese pancake','Vietnamese dishes',220,7,26,10],['Bánh cuốn','Steamed rice roll','Vietnamese dishes',170,6,28,4],['Xôi mặn','Savory sticky rice','Vietnamese dishes',250,8,42,6],['Cháo gà','Chicken porridge','Vietnamese dishes',90,5,14,2],['Hủ tiếu','Hu tieu noodle soup','Vietnamese dishes',170,9,24,4],['Mì Quảng','Mi Quang','Vietnamese dishes',210,10,28,7],['Bánh canh','Thick noodle soup','Vietnamese dishes',160,7,25,3],['Bún riêu','Crab noodle soup','Vietnamese dishes',170,8,22,5],['Cao lầu','Cao lau','Vietnamese dishes',215,11,29,7],['Cá kho tộ','Caramelized fish','Vietnamese dishes',190,18,5,10],['Thịt kho trứng','Braised pork and egg','Vietnamese dishes',260,15,6,18],['Canh chua cá','Sour fish soup','Vietnamese dishes',70,7,6,2],['Rau muống xào tỏi','Stir-fried water spinach','Vietnamese dishes',90,3,7,6],['Đậu phụ sốt cà','Tofu tomato sauce','Vietnamese dishes',115,7,6,7],['Gà kho gừng','Ginger braised chicken','Vietnamese dishes',210,20,4,13],['Bò lúc lắc','Shaking beef','Vietnamese dishes',230,20,7,14],['Cơm gà Hội An','Hoi An chicken rice','Vietnamese dishes',220,12,32,6],['Bún đậu mắm tôm','Vermicelli tofu platter','Vietnamese dishes',260,13,28,12],['Lẩu thái','Thai hotpot','Vietnamese dishes',120,9,10,5],
['Hamburger','Hamburger','Fast food',295,17,30,12],['Gà rán','Fried chicken','Fast food',320,18,10,22],['Khoai tây chiên','French fries','Fast food',312,3.4,41,15],['Pizza phô mai','Cheese pizza','Fast food',266,11,33,10],['Whey protein','Whey protein','Supplements',400,80,8,6],['Creatine','Creatine','Supplements',0,0,0,0],['Dầu ô liu','Olive oil','Others',884,0,0,100],['Mật ong','Honey','Others',304,0.3,82,0]
] as const;

async function main() {
  const categoryMap = new Map<string, string>();
  for (const [name, vietnameseName, slug] of categories) {
    const cat = await prisma.foodCategory.upsert({ where: { slug }, update: {}, create: { name, vietnameseName, slug } });
    categoryMap.set(name, cat.id);
  }
  const passwordHash = await bcrypt.hash('password123', 12);
  await prisma.user.upsert({ where: { email: 'admin@calo.vn' }, update: {}, create: { name: 'Calo Admin', email: 'admin@calo.vn', passwordHash, role: Role.admin, gender: 'other', age: 30, height: 170, currentWeight: 65, goalWeight: 65, activityLevel: 'moderately_active', goalType: 'maintain_weight' } });
  await prisma.user.upsert({ where: { email: 'demo@calo.vn' }, update: {}, create: { name: 'Người dùng Demo', email: 'demo@calo.vn', passwordHash, gender: 'male', age: 28, height: 172, currentWeight: 62, goalWeight: 68, activityLevel: 'lightly_active', goalType: 'gain_weight' } });
  for (const [vietnameseName, englishName, categoryName, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g] of foods) {
    await prisma.food.upsert({
      where: { name: vietnameseName },
      update: { caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g },
      create: { name: vietnameseName, vietnameseName, englishName, categoryId: categoryMap.get(categoryName)!, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, fiberPer100g: 0, sugarPer100g: 0, sodiumPer100g: 0, source: 'Vietnam nutrition seed v1', isVerified: true }
    });
  }
  await prisma.barcodeProduct.upsert({ where: { barcode: '8934673000000' }, update: {}, create: { barcode: '8934673000000', productName: 'Sữa tươi TH true MILK không đường', brand: 'TH true MILK', caloriesPer100g: 60, proteinPer100g: 3.1, carbsPer100g: 4.7, fatPer100g: 3.2 } });
  console.log(`Seeded ${categories.length} categories and ${foods.length} foods. Demo password: password123`);
}

main().finally(async () => prisma.$disconnect());

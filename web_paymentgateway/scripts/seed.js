import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

console.log('DEBUG MONGODB_URI:', process.env.MONGODB_URI);

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI tidak terbaca. Periksa .env.local di root project.');
  process.exit(1);
}

// import modul DB dan model setelah dotenv dijalankan
const { default: dbConnect } = await import('../lib/mongodb.js');
const { default: Product } = await import('../models/Product.js');

async function seed() {
  await dbConnect();

  const items = [
    { name: 'T-Shirt', category: 'Clothing', price: 100000 },
    { name: 'Notebook', category: 'Stationery', price: 25000 },
    { name: 'Tas Ransel', category: 'Bag', price: 200000 },
  ];

  await Product.deleteMany({});
  await Product.insertMany(items);

  console.log('✅ Database seeded with sample products');
  process.exit(0);
}

await seed();

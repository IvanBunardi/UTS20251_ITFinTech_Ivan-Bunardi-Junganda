// scripts/createAdmin.js
import dotenv from 'dotenv';
import dbConnect from '../lib/mongodb.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

// Untuk ES Module: dapatkan directory saat ini
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paksa load .env.local dari root project
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function main() {
  try {
    console.log('MONGODB_URI:', process.env.MONGODB_URI); // debug

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI tidak ditemukan. Pastikan ada di .env.local');
    }

    await dbConnect(); // hubungkan ke MongoDB

    const name = 'Admin Test';
    const email = 'admin@example.com';
    const password = 'Admin123!';

    // cek apakah user sudah ada
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('User already exists:', existing.email);
      process.exit(0);
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // buat user admin
    const user = new User({
      name,
      email,
      password: hashed,
      role: 'admin',
      isVerified: true, // set sesuai kebijakan
    });

    await user.save();

    console.log('Admin created successfully:', user.email);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

// jalankan main
main();

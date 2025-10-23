// lib/mongodb.js
import mongoose from 'mongoose';

let cached = global.mongoose || { conn: null, promise: null };

export default async function dbConnect() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Please define the MONGODB_URI in your .env.local file');
  }

  // Return koneksi yang sudah ada (agar tidak reconnect setiap request)
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

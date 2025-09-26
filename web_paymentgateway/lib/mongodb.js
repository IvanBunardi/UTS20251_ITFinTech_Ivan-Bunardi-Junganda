// lib/mongodb.js
import mongoose from 'mongoose';

let cached = global.mongoose;
if (!cached) global.mongoose = cached = { conn: null, promise: null };

async function dbConnect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please define MONGODB_URI in .env.local');
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      // options optional
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then(m => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;

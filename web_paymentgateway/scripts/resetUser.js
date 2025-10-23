// scripts/resetUser.js
import 'dotenv/config';
import dbConnect from '../lib/mongodb.js';
import User from '../models/User.js';

async function resetUser(identifier) {
  try {
    await dbConnect();

    // identifier bisa email atau phone
    const query = identifier.includes('@') ? { email: identifier } : { phone: identifier };

    const user = await User.findOne(query);

    if (!user) {
      console.log('User tidak ditemukan:', identifier);
      process.exit(0);
    }

    await User.deleteOne(query);

    console.log('User dan OTP berhasil dihapus:', identifier);
    process.exit(0);
  } catch (err) {
    console.error('Error reset user:', err);
    process.exit(1);
  }
}

// Jalankan script dari command line
// node scripts/resetUser.js user@example.com
// atau node scripts/resetUser.js +628123456789

const identifier = process.argv[2];
if (!identifier) {
  console.error('Tolong masukkan email atau phone sebagai argumen!');
  process.exit(1);
}

resetUser(identifier);

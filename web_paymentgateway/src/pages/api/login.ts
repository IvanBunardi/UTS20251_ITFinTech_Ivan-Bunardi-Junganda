import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ✅ Hubungkan ke MongoDB
    await dbConnect();

    const { email, password } = req.body;

    // 🔍 Validasi input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi.' });
    }

    // 🔍 Cek apakah user ada
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    // ❌ Jika akun belum diverifikasi OTP
    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Akun belum diverifikasi. Silakan verifikasi OTP terlebih dahulu.',
      });
    }

    // 🔐 Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Password salah.' });
    }

    // 🔑 Buat JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role || 'user', // Default ke 'user' jika role tidak ada
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 🎯 Tentukan redirect berdasarkan role
    let redirectTo = '/selectitem'; // Default untuk user biasa
    
    if (user.role === 'admin') {
      redirectTo = '/admin';
    } else if (user.role === 'merchant') {
      redirectTo = '/merchant/dashboard';
    }
    // Jika user.role === 'user' atau undefined, tetap ke /selectitem

    // 🚀 Kirim respons sukses
    return res.status(200).json({
      message: 'Login berhasil!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        isVerified: user.isVerified,
      },
      redirectTo,
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
}
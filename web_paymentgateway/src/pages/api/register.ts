// /pages/api/auth/register.js
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await dbConnect();

  const { name, email, password, whatsapp, role } = req.body;

  if (!name || !email || !password || !whatsapp)
    return res.status(400).json({ error: 'Semua field wajib diisi.' });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email sudah digunakan.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
      name,
      email,
      password: hashedPassword,
      whatsapp,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000, // OTP berlaku 5 menit
      role: role === 'admin' ? 'admin' : 'user', // ✅ tambahkan peran
    });

    await user.save();

    // Kirim OTP via WhatsApp (Twilio)
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${whatsapp}`,
      body: `Halo ${name}, kode verifikasi kamu adalah: ${otp}`,
    });

    return res.status(200).json({ message: 'OTP dikirim ke WhatsApp kamu!' });
  } catch (error) {
    console.error('❌ Error register:', error);
    return res.status(500).json({ error: 'Gagal mengirim OTP.' });
  }
}

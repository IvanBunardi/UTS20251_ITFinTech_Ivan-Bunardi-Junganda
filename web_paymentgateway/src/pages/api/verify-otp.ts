import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM; // contoh: 'whatsapp:+14155238886'

export default async function handler(req, res) {
  await dbConnect();

  // 🔑 Verifikasi OTP
  if (req.method === 'POST') {
    const { whatsapp, otp } = req.body;

    // Validasi input
    if (!whatsapp || !otp) {
      return res.status(400).json({ error: 'WhatsApp dan OTP harus diisi' });
    }

    const user = await User.findOne({ whatsapp });
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    // ✅ Jika sudah terverifikasi, langsung login (buat token baru)
    if (user.isVerified) {
      const token = jwt.sign(
        { userId: user._id, whatsapp: user.whatsapp },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        message: 'Akun sudah terverifikasi. Berhasil login!',
        token,
        user: { 
          name: user.name,
          email: user.email,
          whatsapp: user.whatsapp,
          isVerified: true 
        },
      });
    }

    // Cek OTP valid dan belum expired
    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Kode OTP tidak valid' });
    }

    if (Date.now() > user.otpExpires) {
      return res.status(400).json({ error: 'Kode OTP telah kedaluwarsa. Silakan kirim ulang.' });
    }

    // ✅ Tandai user sebagai terverifikasi
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // 🔑 Buat JWT session
    const token = jwt.sign(
      { userId: user._id, whatsapp: user.whatsapp },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Akun berhasil diverifikasi!',
      token,
      user: { 
        name: user.name,
        email: user.email,
        whatsapp: user.whatsapp,
        isVerified: true 
      },
    });
  }

  // 🔁 Kirim ulang OTP via WhatsApp
  if (req.method === 'PUT') {
    const { whatsapp } = req.body;

    if (!whatsapp) {
      return res.status(400).json({ error: 'Nomor WhatsApp harus diisi' });
    }

    const user = await User.findOne({ whatsapp });
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    // ✅ Jika sudah terverifikasi, tidak perlu kirim OTP lagi
    if (user.isVerified) {
      return res.status(400).json({ 
        error: 'Akun sudah terverifikasi. Silakan login langsung.',
        redirect: '/login'
      });
    }

    // Buat OTP baru
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 menit

    user.otp = newOtp;
    user.otpExpires = otpExpires;
    await user.save();

    try {
      // Kirim OTP via Twilio WhatsApp
      await client.messages.create({
        from: WHATSAPP_FROM,
        to: `whatsapp:${whatsapp}`,
        body: `🔑 Kode OTP baru kamu adalah *${newOtp}*. Berlaku 5 menit.`,
      });

      return res.status(200).json({ message: 'OTP baru berhasil dikirim via WhatsApp ✅' });
    } catch (error) {
      console.error('Twilio Error:', error);
      return res.status(500).json({ error: 'Gagal mengirim OTP via WhatsApp. Periksa konfigurasi Twilio.' });
    }
  }

  return res.status(405).json({ error: 'Method tidak diizinkan' });
}
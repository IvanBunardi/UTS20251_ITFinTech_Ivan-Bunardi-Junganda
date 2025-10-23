import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { whatsapp, otp, newPassword } = req.body;
  if (!whatsapp || !otp || !newPassword) return res.status(400).json({ error: 'Semua field harus diisi' });

  try {
    await dbConnect();

    const user = await User.findOne({ whatsapp });
    if (!user) return res.status(404).json({ error: 'Nomor WhatsApp tidak terdaftar' });

    if (user.forgotOtp !== otp || Date.now() > user.forgotOtpExpiry) {
      return res.status(400).json({ error: 'OTP tidak valid atau sudah kedaluwarsa' });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.forgotOtp = undefined;
    user.forgotOtpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password berhasil diubah. Silakan login.' });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

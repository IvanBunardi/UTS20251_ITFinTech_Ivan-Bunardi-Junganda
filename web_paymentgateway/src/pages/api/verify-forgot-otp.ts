import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { whatsapp, otp } = req.body;
  if (!whatsapp || !otp) return res.status(400).json({ error: 'WhatsApp dan OTP wajib diisi' });

  try {
    await dbConnect();

    const user = await User.findOne({ whatsapp });
    if (!user) return res.status(404).json({ error: 'Nomor WhatsApp tidak terdaftar' });

    if (!user.forgotOtp || user.forgotOtp !== otp)
      return res.status(400).json({ error: 'OTP salah' });

    if (Date.now() > user.forgotOtpExpiry)
      return res.status(400).json({ error: 'OTP sudah kadaluarsa' });

    res.status(200).json({ message: 'OTP berhasil diverifikasi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

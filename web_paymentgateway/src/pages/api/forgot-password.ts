import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { whatsapp } = req.body;
  if (!whatsapp) return res.status(400).json({ error: 'WhatsApp harus diisi' });

  try {
    await dbConnect();

    const user = await User.findOne({ whatsapp });
    if (!user) return res.status(404).json({ error: 'Nomor WhatsApp tidak terdaftar' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.forgotOtp = otp;
    user.forgotOtpExpiry = Date.now() + 5 * 60 * 1000; // 5 menit
    await user.save();

    // Kirim OTP via Twilio WhatsApp
    const msg = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER, // contoh: whatsapp:+14155238886
      to: `whatsapp:${whatsapp}`,
      body: `Kode OTP untuk reset password Anda: ${otp} (berlaku 5 menit)`
    });
    console.log('Twilio SID:', msg.sid);

    res.status(200).json({ message: 'OTP berhasil dikirim ke WhatsApp Anda' });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = 'whatsapp:+14155238886'; // Nomor Twilio Sandbox
const client = twilio(accountSid, authToken);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  await dbConnect();

  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Nomor WhatsApp wajib diisi' });

  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpExpires = Date.now() + 5 * 60 * 1000; // 5 menit

  let user = await User.findOne({ phone });
  if (!user) {
    user = new User({ phone, otp, otpExpires, isVerified: false });
  } else {
    user.otp = otp;
    user.otpExpires = otpExpires;
  }
  await user.save();

  try {
    await client.messages.create({
      from: whatsappFrom,
      to: `whatsapp:${phone}`,
      body: `🔑 Kode OTP Anda adalah *${otp}*. Berlaku selama 5 menit.`,
    });

    return res.status(200).json({ message: 'OTP berhasil dikirim via WhatsApp ✅' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal mengirim OTP WhatsApp' });
  }
}

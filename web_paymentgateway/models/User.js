import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  whatsapp: String,
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,
  forgotOtp: String,
  forgotOtpExpiry: Date,
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // ✅ penting
});

export default mongoose.models.User || mongoose.model('User', userSchema);

import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  checkout: { type: mongoose.Schema.Types.ObjectId, ref: 'Checkout', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
  xenditId: String,
  method: String
}, { timestamps: true });

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
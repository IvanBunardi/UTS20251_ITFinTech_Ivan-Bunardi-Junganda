import mongoose from 'mongoose';
const CheckoutSchema = new mongoose.Schema({
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, qty: Number, price: Number }],
  totalPrice: Number,
  status: { type: String, enum: ['PENDING','PAID','EXPIRED'], default: 'PENDING' },
  externalId: String,         // external_id used for Xendit (e.g., checkout-<id>)
  xenditInvoiceId: String,
  invoiceUrl: String
}, { timestamps: true });

export default mongoose.models.Checkout || mongoose.model('Checkout', CheckoutSchema);

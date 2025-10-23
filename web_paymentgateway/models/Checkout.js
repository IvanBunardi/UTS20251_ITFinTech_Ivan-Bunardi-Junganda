import mongoose from 'mongoose'

const CheckoutSchema = new mongoose.Schema(
  {
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['PENDING', 'PAID', 'EXPIRED'], default: 'PENDING' },
    externalId: { type: String, required: true, unique: true, index: true },
    xenditInvoiceId: String,
    invoiceUrl: String,
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerWhatsapp: { type: String, required: true },
  },
  { timestamps: true }
)

export default mongoose.models.Checkout || mongoose.model('Checkout', CheckoutSchema)
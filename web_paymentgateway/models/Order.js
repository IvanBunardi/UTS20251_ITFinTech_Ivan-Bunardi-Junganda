import mongoose from 'mongoose'

const OrderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  imageUrl: { type: String },
})

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
    },
    items: [OrderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['waiting_payment', 'paid', 'cancelled'],
      default: 'waiting_payment',
    },
    paymentMethod: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
)

// ✅ Gunakan export default agar bisa dipakai dengan `import Order from '../../models/order'`
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema)
export default Order

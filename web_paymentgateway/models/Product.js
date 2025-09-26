import mongoose from 'mongoose';
const ProductSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  description: String,
  imageUrl: String
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);

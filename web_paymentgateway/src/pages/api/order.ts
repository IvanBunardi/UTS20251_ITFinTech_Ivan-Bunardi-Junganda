// pages/api/order.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../lib/mongodb'
import Order from '../../../models/Order'

const generateOrderNumber = () => {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `ORD${year}${month}${day}${random}`
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()
  const { id } = req.query

  try {
    if (req.method === 'GET') {
      if (id) {
        const order = await Order.findById(id)
        if (!order) return res.status(404).json({ error: 'Order tidak ditemukan' })
        return res.status(200).json(order)
      } else {
        const orders = await Order.find().sort({ createdAt: -1 })
        return res.status(200).json(orders)
      }
    }

    if (req.method === 'POST') {
      const { customerName, customerPhone, customerEmail, items, totalAmount, paymentMethod, notes } = req.body

      if (!customerName || !customerPhone || !items || !totalAmount) {
        return res.status(400).json({ error: 'Data tidak lengkap' })
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Items harus berisi minimal 1 produk' })
      }

      const orderNumber = generateOrderNumber()

      const newOrder = await Order.create({
        orderNumber,
        customerName,
        customerPhone,
        customerEmail,
        items,
        totalAmount,
        paymentMethod,
        notes,
        status: 'waiting_payment',
      })

      return res.status(201).json(newOrder)
    }

    if (req.method === 'PUT') {
      if (!id) return res.status(400).json({ error: 'ID order diperlukan' })

      const { status, paymentMethod, notes } = req.body

      if (status && !['waiting_payment', 'paid', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Status tidak valid' })
      }

      const updateData: any = {}
      if (status) updateData.status = status
      if (paymentMethod) updateData.paymentMethod = paymentMethod
      if (notes !== undefined) updateData.notes = notes

      const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true })

      if (!updatedOrder) return res.status(404).json({ error: 'Order tidak ditemukan' })

      return res.status(200).json(updatedOrder)
    }

    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'ID order diperlukan' })

      const deletedOrder = await Order.findByIdAndDelete(id)
      if (!deletedOrder) return res.status(404).json({ error: 'Order tidak ditemukan' })

      return res.status(200).json({ message: 'Order berhasil dihapus' })
    }

    return res.status(405).json({ error: 'Method tidak diizinkan' })
  } catch (error: any) {
    console.error('Order API Error:', error)
    return res.status(500).json({ error: error.message || 'Terjadi kesalahan server' })
  }
}
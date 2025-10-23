// src/pages/api/checkout.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../lib/mongodb'
import Checkout from '../../../models/Checkout'
import Payment from '../../../models/Payment'
import Order from '../../../models/Order'
import Xendit from 'xendit-node'

// 🧩 Inisialisasi Xendit client
const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY!,
})
const { Invoice } = xendit

// 🔹 Tipe data item dari frontend
interface CheckoutItem {
  _id: string
  name: string
  category?: string
  price: number
  qty?: number
  imageUrl?: string
}

// 🔹 Tipe body request
interface CheckoutRequestBody {
  items: CheckoutItem[]
  totalPrice: number
  email?: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  notes?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Cegah selain POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' })
  }

  await dbConnect()

  console.log('🔥 BODY dari frontend:', JSON.stringify(req.body, null, 2))

  const {
    items,
    totalPrice,
    email,
    customerName,
    customerPhone,
    customerEmail,
    notes,
  } = req.body as CheckoutRequestBody

  // 🧠 Validasi input
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items wajib diisi dan harus berupa array.' })
  }

  if (!totalPrice || isNaN(totalPrice)) {
    return res.status(400).json({ error: 'Total price tidak valid.' })
  }

  if (!customerName || !customerPhone) {
    return res.status(400).json({ error: 'Nama dan nomor telepon pelanggan wajib diisi.' })
  }

  const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  const externalId = `checkout-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  try {
    // 🛒 1️⃣ Buat Checkout record
    const checkout = await Checkout.create({
      items: items.map((item) => ({
        product: item._id,
        qty: item.qty || 1,
        price: item.price,
      })),
      totalPrice: Math.round(totalPrice),
      status: 'PENDING',
      externalId,
      customerName,
      customerEmail: customerEmail || email || 'noemail@example.com',
      customerWhatsapp: customerPhone,
    })

    console.log('✅ Checkout created:', checkout._id)

    // 🧾 2️⃣ Buat Order record untuk dashboard admin
    const order = await Order.create({
      orderNumber,
      customerName,
      customerPhone,
      customerEmail: customerEmail || email || '',
      items: items.map((item) => ({
        productId: item._id,
        name: item.name,
        category: item.category || '',
        price: item.price,
        quantity: item.qty || 1,
        imageUrl: item.imageUrl || '',
      })),
      totalAmount: Math.round(totalPrice),
      status: 'waiting_payment',
      notes: notes || '',
    })

    console.log('✅ Order created:', order._id, order.orderNumber)

    // 💳 3️⃣ Buat Invoice di Xendit
    const resp = await Invoice.createInvoice({
      data: {
        externalId,
        amount: Math.round(totalPrice),
        payerEmail: email || customerEmail || 'customer@example.com',
        description: `Pembayaran order ${orderNumber}`,
        successRedirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/success?orderId=${order._id}`,
        failureRedirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/fail?orderId=${order._id}`,
        invoiceDuration: 30 * 60, // 30 menit
      },
    })

    console.log('✅ Invoice created:', resp.id)

    // 🪄 4️⃣ Update data checkout dengan informasi Xendit
    await Checkout.findByIdAndUpdate(checkout._id, {
      xenditInvoiceId: resp.id,
      invoiceUrl: resp.invoiceUrl,
      status: resp.status || 'PENDING',
    })

    // 💰 5️⃣ Simpan Payment record
    const payment = await Payment.create({
      checkout: checkout._id,
      order: order._id,
      amount: Math.round(totalPrice),
      status: resp.status || 'PENDING',
      xenditId: resp.id,
    })

    console.log('✅ Payment created:', payment._id)

    // 🚀 6️⃣ Response sukses ke frontend
    return res.status(201).json({
      success: true,
      invoiceUrl: resp.invoiceUrl,
      checkoutId: checkout._id,
      orderId: order._id,
      orderNumber,
    })
  } catch (err: unknown) {
    // 🛠️ Error handling terperinci
    if (err instanceof Error) {
      console.error('❌ Error create invoice:', err.message)
      return res.status(500).json({ error: err.message })
    } else {
      console.error('❌ Unknown error:', err)
      return res.status(500).json({ error: 'Unknown server error' })
    }
  }
}

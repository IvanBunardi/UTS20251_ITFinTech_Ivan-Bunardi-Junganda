import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Checkout from '../../../models/Checkout';
import Payment from '../../../models/Payment';
import Xendit from 'xendit-node';

// Inisialisasi Xendit
const xendit = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY! });
const { Invoice } = xendit; // ✅ langsung ambil API

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  await dbConnect();

  console.log("🔥 BODY dari frontend:", JSON.stringify(req.body, null, 2));

  const { items, totalPrice, email } = req.body;

  if (!items || items.length === 0 || !totalPrice || isNaN(totalPrice)) {
    return res.status(400).json({ error: 'Items dan totalPrice wajib diisi dengan benar' });
  }

  // Buat checkout
  const checkout = await Checkout.create({
    items,
    totalPrice,
    status: 'PENDING',
    externalId: `checkout-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  });

  try {
    // ✅ Panggil langsung tanpa `new`
    const resp = await Invoice.createInvoice({
  data: {
    externalId: checkout.externalId,
    amount: Number(totalPrice),
    payerEmail: email || 'customer@example.com',
    description: `Pembayaran order ${checkout._id}`,
    successRedirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
    failureRedirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/fail`,
    invoiceDuration: 30 * 60,
  }
});


    console.log("✅ Invoice created:", resp);

    await Checkout.findByIdAndUpdate(checkout._id, {
      xenditInvoiceId: resp.id,
      invoiceUrl: resp.invoiceUrl,
      status: resp.status || 'PENDING'
    });

    await Payment.create({
      checkout: checkout._id,
      amount: totalPrice,
      status: resp.status || 'PENDING',
      xenditId: resp.id
    });

    return res.status(201).json({
      invoiceUrl: resp.invoiceUrl,
      checkoutId: checkout._id
    });
  } catch (err: any) {
    console.error('❌ Error create invoice:', err.response?.data || err.message || err);
    return res.status(500).json({ error: 'Gagal membuat invoice' });
  }
}

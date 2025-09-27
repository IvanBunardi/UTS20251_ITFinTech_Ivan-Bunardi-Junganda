import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Checkout from '../../../models/Checkout';
import Payment from '../../../models/Payment';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  await dbConnect();

  // Verifikasi token dari header webhook Xendit
  const tokenHeader =
    req.headers['x-callback-token'] ||
    req.headers['X-Callback-Token'.toLowerCase()];

  if (!tokenHeader || tokenHeader !== process.env.XENDIT_WEBHOOK_TOKEN) {
    console.warn("❌ Invalid webhook token:", tokenHeader);
    return res.status(403).json({ error: 'Invalid webhook token' });
  }

  const event = req.body;
  console.log("🔥 Webhook event:", JSON.stringify(event, null, 2));

  //  Pastikan mapping benar sesuai payload Xendit
  const status = event.status || event.data?.status;
  const externalId =
    event.external_id || event.data?.external_id || event.data?.externalId;
  const xenditId = event.id || event.data?.id;

  // Hanya tangani event `PAID` atau `SETTLED`
  if (status === 'PAID' || status === 'SETTLED' || event.type === 'invoice.paid') {
    const checkout = await Checkout.findOneAndUpdate(
      { externalId },
      { status: 'PAID' },
      { new: true }
    );

    if (checkout) {
      await Payment.findOneAndUpdate(
        { checkout: checkout._id },
        { status: 'PAID', xenditId },
        { new: true, upsert: true }
      );
    } else {
      console.warn("⚠️ Checkout not found for externalId:", externalId);
    }
  }
  // ✅ Selalu balas 200 OK ke Xendit biar retry tidak terus-terusan
  return res.status(200).json({ received: true });
}

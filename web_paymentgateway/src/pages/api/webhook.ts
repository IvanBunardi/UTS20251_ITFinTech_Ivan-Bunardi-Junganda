import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Checkout from '../../../models/Checkout';
import Payment from '../../../models/Payment';
import Order from '../../../models/Order';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('\n========== WEBHOOK HANDLER START ==========');

  if (req.method !== 'POST') {
    console.warn('❌ Method not POST');
    return res.status(405).end();
  }

  // Verify webhook token
  const tokenHeader =
    req.headers['x-callback-token'] ||
    req.headers['X-Callback-Token'.toLowerCase()];

  console.log('Token from header:', tokenHeader);
  console.log('Token expected:', process.env.XENDIT_WEBHOOK_TOKEN);

  if (!tokenHeader || tokenHeader !== process.env.XENDIT_WEBHOOK_TOKEN) {
    console.warn('❌ Invalid webhook token');
    return res.status(403).json({ error: 'Invalid webhook token' });
  }

  await dbConnect();
  console.log('✅ Connected to MongoDB');

  const event = req.body;
  console.log('Event body:', JSON.stringify(event, null, 2));

  const status = event.status || event.data?.status;
  const externalId =
    event.external_id || event.data?.external_id || event.data?.externalId;
  const xenditId = event.id || event.data?.id;

  console.log('Status:', status);
  console.log('External ID:', externalId);
  console.log('Xendit ID:', xenditId);

  try {
    // Handle PAID status
    if (status === 'PAID' || status === 'SETTLED' || event.type === 'invoice.paid') {
      console.log('\n✅ INVOICE PAID\n');

      // Find and update Checkout
      const checkout = await Checkout.findOneAndUpdate(
        { externalId },
        { status: 'PAID' },
        { new: true }
      );

      if (!checkout) {
        console.warn('⚠️ Checkout not found:', externalId);
        return res.status(200).json({ received: true });
      }

      console.log('✅ Checkout updated:', checkout._id);

      // Find and update Payment
      const payment = await Payment.findOneAndUpdate(
        { checkout: checkout._id },
        { status: 'PAID', xenditId },
        { new: true, upsert: true }
      );

      console.log('✅ Payment updated:', payment._id);

      // Find and update Order
      if (payment?.order) {
        const order = await Order.findByIdAndUpdate(
          payment.order,
          { status: 'paid' },
          { new: true }
        );

        console.log('✅ Order updated to PAID:', order?._id, order?.orderNumber);

        // Send WhatsApp notification
        if (order && order.customerPhone) {
          console.log('\n📱 Sending WhatsApp notification...\n');

          try {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            const notificationUrl = `${baseUrl}/api/send-payment-notification`;

            console.log('Calling:', notificationUrl);

            const response = await fetch(notificationUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: order._id,
                phone: order.customerPhone,
                customerName: order.customerName,
                totalAmount: order.totalAmount,
                orderNumber: order.orderNumber,
              }),
            });

            const result = await response.json();

            if (response.ok) {
              console.log('✅✅ WhatsApp sent successfully!');
              console.log('Message SID:', result.messageSid);
              console.log('Status:', result.status);
            } else {
              console.error('❌ WhatsApp API error:', result.error);
            }
          } catch (notificationError) {
            console.error('❌ Error calling WhatsApp API:');
            console.error(notificationError);
          }
        } else {
          console.warn('⚠️ No customerPhone found in order');
        }
      } else {
        console.warn('⚠️ Payment has no order reference');
      }
    }
    // Handle EXPIRED status
    else if (status === 'EXPIRED' || event.type === 'invoice.expired') {
      console.log('\n⏰ INVOICE EXPIRED\n');

      const checkout = await Checkout.findOneAndUpdate(
        { externalId },
        { status: 'EXPIRED' }
      );

      if (checkout) {
        const payment = await Payment.findOne({ checkout: checkout._id });
        if (payment?.order) {
          await Order.findByIdAndUpdate(payment.order, { status: 'cancelled' });
          console.log('✅ Order cancelled due to expired invoice');
        }
      }
    } else {
      console.log('📌 Event not handled:', event.type, 'status:', status);
    }
  } catch (error) {
    console.error('❌ ERROR in webhook:');
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    } else {
      console.error('Unknown error:', error);
    }
  }

  console.log('\n========== WEBHOOK HANDLER END ==========\n');
  return res.status(200).json({ received: true });
}
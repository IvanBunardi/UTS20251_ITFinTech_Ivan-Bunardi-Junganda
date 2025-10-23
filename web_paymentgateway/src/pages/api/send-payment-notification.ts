// src/pages/api/sendWhatsapp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Order from '../../../models/Order';
import twilio from 'twilio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    await dbConnect();

    const { orderId, phone, customerName, totalAmount, orderNumber } = req.body;

    // 🔹 Validasi input
    if (!phone) {
      return res.status(400).json({ error: 'Nomor WhatsApp wajib diisi' });
    }

    if (!customerName || !totalAmount || !orderNumber) {
      return res.status(400).json({
        error: 'customerName, totalAmount, dan orderNumber wajib diisi',
      });
    }

    console.log('\n========== SEND PAYMENT WHATSAPP WITH TEMPLATE ==========');
    console.log('Phone:', phone);
    console.log('Customer:', customerName);
    console.log('Amount:', totalAmount);
    console.log('Order:', orderNumber);

    // 🔹 Ambil kredensial Twilio dari environment variable
    const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    const authToken = process.env.TWILIO_AUTH_TOKEN || '';
    const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || '';
    const templateSid = process.env.TWILIO_TEMPLATE_SID || '';

    console.log('\nChecking credentials:');
    console.log('- Account SID:', accountSid ? '✅ YES' : '❌ NO');
    console.log('- Auth Token:', authToken ? '✅ YES' : '❌ NO');
    console.log('- WhatsApp From:', whatsappFrom ? '✅ YES' : '❌ NO');
    console.log('- Template SID:', templateSid ? '✅ YES' : '❌ NO');

    if (!accountSid || !authToken || !whatsappFrom || !templateSid) {
      throw new Error('Missing Twilio credentials in environment variables');
    }

    const client = twilio(accountSid, authToken);

    // 🔹 Format nomor telepon ke format internasional (WhatsApp)
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('62')) {
      formattedPhone = formattedPhone.startsWith('0')
        ? '62' + formattedPhone.slice(1)
        : '62' + formattedPhone;
    }
    const toNumber = `whatsapp:+${formattedPhone}`;

    console.log('\nPhone formatting:');
    console.log('- Original:', phone);
    console.log('- Formatted:', toNumber);
    console.log('- From:', whatsappFrom);

    // 🔹 Format harga dengan prefix Rp
    const formattedAmount =
      typeof totalAmount === 'number'
        ? `Rp${totalAmount.toLocaleString('id-ID')}`
        : `Rp${Number(totalAmount).toLocaleString('id-ID')}`;

    // 🔹 Isi variabel template
    const contentVars = {
      customer_name: customerName,
      amount: formattedAmount,
      order_number: orderNumber,
    };

    console.log('\nSending with template...');
    console.log('- Template SID:', templateSid);
    console.log('- Variables:', JSON.stringify(contentVars));

    // 🔹 Kirim pesan WhatsApp via Twilio
    const message = await client.messages.create({
      from: whatsappFrom,
      to: toNumber,
      contentSid: templateSid,
      contentVariables: JSON.stringify(contentVars),
    });

    console.log('\n✅ SUCCESS - Message sent!');
    console.log('- SID:', message.sid);
    console.log('- Status:', message.status);
    console.log('- To:', message.to);
    console.log('========== END ==========\n');

    // 🔹 Kembalikan response ke client
    return res.status(200).json({
      success: true,
      message: 'WhatsApp sent successfully',
      messageSid: message.sid,
      status: message.status,
    });
  } catch (err: unknown) {
    const error = err as Error & { code?: string; status?: number; moreInfo?: string };

    console.log('\n❌ ERROR OCCURRED:');
    console.log('- Message:', error.message);
    console.log('- Code:', error.code);
    console.log('- Status:', error.status);
    if (error.moreInfo) {
      console.log('- More Info:', error.moreInfo);
    }
    console.log('========== END ==========\n');

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send WhatsApp',
      code: error.code,
    });
  }
}

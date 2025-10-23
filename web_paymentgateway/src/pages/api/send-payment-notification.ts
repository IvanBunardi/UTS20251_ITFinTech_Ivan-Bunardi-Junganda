import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Order from '../../../models/Order';

const twilio = require('twilio');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  await dbConnect();

  const { orderId, phone, customerName, totalAmount, orderNumber } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Nomor WhatsApp wajib diisi' });
  }

  if (!customerName || !totalAmount || !orderNumber) {
    return res.status(400).json({ error: 'customerName, totalAmount, dan orderNumber wajib diisi' });
  }

  console.log('\n========== SEND PAYMENT WHATSAPP WITH TEMPLATE ==========');
  console.log('Phone:', phone);
  console.log('Customer:', customerName);
  console.log('Amount:', totalAmount);
  console.log('Order:', orderNumber);

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    const authToken = process.env.TWILIO_AUTH_TOKEN || '';
    const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || '';
    const templateSid = process.env.TWILIO_TEMPLATE_SID || '';

    console.log('\nChecking credentials:');
    console.log('- Account SID:', accountSid ? 'YES' : 'NO');
    console.log('- Auth Token:', authToken ? 'YES' : 'NO');
    console.log('- WhatsApp From:', whatsappFrom ? 'YES' : 'NO');
    console.log('- Template SID:', templateSid ? 'YES' : 'NO');

    if (!accountSid || !authToken || !whatsappFrom || !templateSid) {
      throw new Error('Missing Twilio credentials in environment variables');
    }

    const client = twilio(accountSid, authToken);

    // Format phone number
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

    // Format amount with Rp prefix
    const formattedAmount = `Rp${totalAmount.toLocaleString('id-ID')}`;

    // ✅ PERBAIKAN: Content variables sesuai template
    // Template menggunakan: {{customer_name}}, {{amount}}, {{order_number}}
    const contentVars = {
      "customer_name": customerName,
      "amount": formattedAmount,
      "order_number": orderNumber,
    };

    console.log('\nSending with template...');
    console.log('- Template SID:', templateSid);
    console.log('- Variables:', JSON.stringify(contentVars));

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

    return res.status(200).json({
      success: true,
      message: 'WhatsApp sent successfully',
      messageSid: message.sid,
      status: message.status,
    });

  } catch (err: any) {
    console.log('\n❌ ERROR OCCURRED:');
    console.log('- Message:', err.message);
    console.log('- Code:', err.code);
    console.log('- Status:', err.status);
    
    if (err.moreInfo) {
      console.log('- More Info:', err.moreInfo);
    }
    
    console.log('\nFull error:');
    console.log(JSON.stringify(err, null, 2));
    console.log('========== END ==========\n');

    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to send WhatsApp',
      code: err.code,
    });
  }
}
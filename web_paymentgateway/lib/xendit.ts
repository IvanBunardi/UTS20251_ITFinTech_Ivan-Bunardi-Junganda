export async function createInvoice(externalId: string, email: string, amount: number, description: string) {
  const auth = Buffer.from(`${process.env.XENDIT_API_KEY}:`).toString('base64');

  const body = {
    external_id: externalId,
    payer_email: email,
    amount,
    description,
    callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook`,
    success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
    failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/fail`,
    invoice_duration: 30 * 60, 
  };

  const res = await fetch('https://api.xendit.co/v2/invoices', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  console.log("Invoice created:", data);

  return data;
}

import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("API /products dipanggil:", req.method);
  console.log("API HIT:", req.method);
  await dbConnect();

  try {
    if (req.method === 'GET') {
      const products = await Product.find({});
      return res.status(200).json(products);
    } 
    
    if (req.method === 'POST') {
      const { name, category, price, imageUrl } = req.body;
      if (!name || !category || !price) {
        return res.status(400).json({ error: 'name, category, price wajib diisi' });
      }

      const p = await Product.create({ name, category, price, imageUrl });
      return res.status(201).json(p);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('API /products error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

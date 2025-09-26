// pages/api/product.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';
import type { RequestHandler } from 'express';

// Nonaktifkan bodyParser Next.js agar multer bisa jalan
export const config = { api: { bodyParser: false } };

// Buat folder uploads jika belum ada
const uploadDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Setup multer
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Tipe request dengan file
interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

// Wrapper middleware multer
const multerMiddleware: RequestHandler = upload.single('image');

const router = createRouter<NextApiRequestWithFile, NextApiResponse>();

// POST → tambah produk
router.post(async (req, res) => {
  await new Promise<void>((resolve, reject) => {
    multerMiddleware(req as any, res as any, (err?: unknown) => {
      if (err) reject(err);
      else resolve();
    });
  });

  try {
    await dbConnect();

    const { name, category, price, description } = req.body as {
      name?: string;
      category?: string;
      price?: string;
      description?: string;
    };

    if (!name || !category || !price || !description) {
      return res.status(400).json({
        error: 'name, category, price, description wajib diisi',
      });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const product = await Product.create({
      name,
      category,
      price: Number(price),
      description,
      imageUrl,
    });

    return res.status(201).json(product);
  } catch (err) {
    console.error('POST /api/product error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET → ambil semua produk
router.get(async (_req, res) => {
  try {
    await dbConnect();
    const products = await Product.find({});
    return res.status(200).json(products);
  } catch (err) {
    console.error('GET /api/product error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Default export handler
export default async function handler(
  req: NextApiRequestWithFile,
  res: NextApiResponse
) {
  await router.run(req, res);
}

// pages/api/product.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';

// Nonaktifkan bodyParser Next.js agar multer bisa jalan
export const config = { api: { bodyParser: false } };

// Buat folder uploads jika belum ada
const uploadDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Setup multer
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Tipe request dengan file
interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

// Helper untuk jalankan middleware multer
const runMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  fn: (req: any, res: any, next: (err?: any) => void) => void
) =>
  new Promise<void>((resolve, reject) => {
    fn(
      req as unknown as import('express').Request,
      res as unknown as import('express').Response,
      (result?: any) => {
        if (result instanceof Error) reject(result);
        else resolve();
      }
    );
  });

// Buat router
const router = createRouter<NextApiRequestWithFile, NextApiResponse>();

// POST → tambah produk
router.post(async (req, res) => {
  // Jalankan multer middleware
  await runMiddleware(req, res, upload.single('image'));

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
router.get(async (req, res) => {
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

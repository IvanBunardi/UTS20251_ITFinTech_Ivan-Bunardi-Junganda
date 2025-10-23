/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import multer from "multer";
import fs from "fs";
import path from "path";
import dbConnect from "../../../lib/mongodb";
import Product from "../../../models/Product";
import type { RequestHandler } from "express";

// 🔧 Nonaktifkan bodyParser agar multer bisa jalan
export const config = { api: { bodyParser: false } };

// 🔧 Pastikan folder upload ada
const uploadDir = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// 🔧 Konfigurasi multer
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// 🔧 Tipe khusus untuk req dengan file
interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

// 🔧 Helper untuk jalankan multer di Next.js
const runMulter = (req: NextApiRequest, res: NextApiResponse, fn: RequestHandler) =>
  new Promise<void>((resolve, reject) => {
    fn(req as any, res as any, (err?: any) => {
      if (err) reject(err);
      else resolve();
    });
  });

// 🔧 Buat router next-connect
const router = createRouter<NextApiRequestWithFile, NextApiResponse>();

// ======================================================================
// 🟢 POST → Tambah Produk
// ======================================================================
router.post(async (req, res) => {
  await runMulter(req, res, upload.single("image"));

  try {
    await dbConnect();

    const { name, category, price, description } = req.body as {
      name?: string;
      category?: string;
      price?: string;
      description?: string;
    };

    if (!name || !category || !price || !description) {
      return res.status(400).json({ error: "name, category, price, description wajib diisi" });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const product = await Product.create({
      name,
      category,
      price: Number(price),
      description,
      imageUrl,
    });

    return res.status(201).json(product);
  } catch (err) {
    console.error("POST /api/product error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ======================================================================
// 🟡 GET → Ambil Semua Produk
// ======================================================================
router.get(async (_req, res) => {
  try {
    await dbConnect();
    const products = await Product.find({}).sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (err) {
    console.error("GET /api/product error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ======================================================================
// 🔵 PUT → Update Produk (gunakan query id)
// ======================================================================
router.put(async (req, res) => {
  await runMulter(req, res, upload.single("image"));

  try {
    await dbConnect();

    const { id } = req.query;
    const { name, category, price, description } = req.body;

    const existing = await Product.findById(id);
    if (!existing) return res.status(404).json({ error: "Produk tidak ditemukan" });

    // Jika ada file baru → hapus file lama (optional)
    let imageUrl = existing.imageUrl;
    if (req.file) {
      if (existing.imageUrl) {
        const oldPath = path.join(process.cwd(), "public", existing.imageUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      imageUrl = `/uploads/${req.file.filename}`;
    }

    existing.name = name ?? existing.name;
    existing.category = category ?? existing.category;
    existing.price = price ? Number(price) : existing.price;
    existing.description = description ?? existing.description;
    existing.imageUrl = imageUrl;

    await existing.save();

    return res.status(200).json(existing);
  } catch (err) {
    console.error("PUT /api/product error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ======================================================================
// 🔴 DELETE → Hapus Produk (gunakan query id)
// ======================================================================
router.delete(async (req, res) => {
  try {
    await dbConnect();
    const { id } = req.query;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Produk tidak ditemukan" });

    // Hapus file gambar dari /public/uploads
    if (product.imageUrl) {
      const filePath = path.join(process.cwd(), "public", product.imageUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Product.findByIdAndDelete(id);

    return res.status(200).json({ message: "Produk berhasil dihapus" });
  } catch (err) {
    console.error("DELETE /api/product error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ======================================================================
// 🧩 Default export handler
// ======================================================================
export default async function handler(req: NextApiRequestWithFile, res: NextApiResponse) {
  await router.run(req, res);
}

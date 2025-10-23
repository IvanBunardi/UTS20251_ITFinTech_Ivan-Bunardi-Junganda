// src/pages/api/product.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import dbConnect from '../../../../lib/mongodb'
import Product from '../../../../models/Product'

// 🧩 Nonaktifkan bodyParser bawaan Next.js agar formidable bisa digunakan
export const config = {
  api: {
    bodyParser: false,
  },
}

// 🔹 Helper untuk parse FormData (formidable)
const parseForm = (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    // Pastikan folder upload tersedia
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const form = formidable({
      multiples: false,
      uploadDir,
      keepExtensions: true,
    })

    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })
}

// 🔹 Helper simpan gambar di folder uploads
const saveImage = (file: File): string => {
  const fileName = `${Date.now()}_${file.originalFilename || 'image'}`
  const newPath = path.join(process.cwd(), 'public', 'uploads', fileName)
  fs.renameSync(file.filepath, newPath)
  return `/uploads/${fileName}`
}

// 🔹 Helper ambil nilai field dari FormData
const getFieldValue = (field: string | string[] | undefined): string => {
  if (Array.isArray(field)) return field[0]
  return field || ''
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()
  const { id } = req.query

  try {
    switch (req.method) {
      // ========================================
      // 📦 GET - Ambil semua produk atau berdasarkan ID
      // ========================================
      case 'GET': {
        if (id) {
          const product = await Product.findById(id)
          if (!product) {
            return res.status(404).json({ error: 'Produk tidak ditemukan' })
          }
          return res.status(200).json(product)
        }

        const products = await Product.find().sort({ createdAt: -1 })
        return res.status(200).json(products)
      }

      // ========================================
      // 🆕 POST - Tambah produk baru
      // ========================================
      case 'POST': {
        const { fields, files } = await parseForm(req)

        const name = getFieldValue(fields.name)
        const category = getFieldValue(fields.category)
        const price = getFieldValue(fields.price)
        const description = getFieldValue(fields.description)

        // Validasi field wajib
        if (!name || !category || !price || !description) {
          return res.status(400).json({ error: 'Semua field wajib diisi' })
        }

        // Simpan gambar (jika ada)
        let imageUrl = ''
        if (files.image) {
          const file = Array.isArray(files.image) ? files.image[0] : files.image
          imageUrl = saveImage(file as File)
        }

        // Simpan produk ke MongoDB
        const newProduct = await Product.create({
          name,
          category,
          price: Number(price),
          description,
          imageUrl,
        })

        return res.status(201).json(newProduct)
      }

      // ========================================
      // ✏️ PUT - Update produk
      // ========================================
      case 'PUT': {
        if (!id || typeof id !== 'string') {
          return res.status(400).json({ error: 'ID produk diperlukan' })
        }

        const { fields, files } = await parseForm(req)

        const name = getFieldValue(fields.name)
        const category = getFieldValue(fields.category)
        const price = getFieldValue(fields.price)
        const description = getFieldValue(fields.description)
        const oldImageUrl = getFieldValue(fields.imageUrl)

        if (!name || !category || !price || !description) {
          return res.status(400).json({ error: 'Semua field wajib diisi' })
        }

        // Update gambar jika ada file baru
        let imageUrl = oldImageUrl
        if (files.image) {
          const file = Array.isArray(files.image) ? files.image[0] : files.image
          imageUrl = saveImage(file as File)

          // Hapus gambar lama (opsional)
          if (oldImageUrl && oldImageUrl.startsWith('/uploads/')) {
            const oldPath = path.join(process.cwd(), 'public', oldImageUrl)
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
          }
        }

        // Update data produk di database
        const updatedProduct = await Product.findByIdAndUpdate(
          id,
          {
            name,
            category,
            price: Number(price),
            description,
            imageUrl,
          },
          { new: true }
        )

        if (!updatedProduct) {
          return res.status(404).json({ error: 'Produk tidak ditemukan' })
        }

        return res.status(200).json(updatedProduct)
      }

      // ========================================
      // ❌ DELETE - Hapus produk
      // ========================================
      case 'DELETE': {
        if (!id || typeof id !== 'string') {
          return res.status(400).json({ error: 'ID produk diperlukan' })
        }

        const product = await Product.findById(id)
        if (!product) {
          return res.status(404).json({ error: 'Produk tidak ditemukan' })
        }

        // Hapus gambar dari folder (jika ada)
        if (product.imageUrl && product.imageUrl.startsWith('/uploads/')) {
          const imagePath = path.join(process.cwd(), 'public', product.imageUrl)
          if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath)
        }

        await Product.findByIdAndDelete(id)
        return res.status(200).json({ message: 'Produk berhasil dihapus' })
      }

      // ========================================
      // 🚫 Default - Method tidak diizinkan
      // ========================================
      default:
        return res.status(405).json({ error: 'Method tidak diizinkan' })
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ API Error:', error.message)
      return res.status(500).json({ error: error.message })
    } else {
      console.error('❌ Unknown error:', error)
      return res.status(500).json({ error: 'Terjadi kesalahan server' })
    }
  }
}

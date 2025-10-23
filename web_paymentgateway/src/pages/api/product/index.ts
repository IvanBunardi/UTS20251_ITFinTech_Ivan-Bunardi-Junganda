// pages/api/product.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import dbConnect from '../../../../lib/mongodb'
import Product from '../../../../models/Product'

// Nonaktifkan bodyParser untuk formidable
export const config = {
  api: {
    bodyParser: false,
  },
}

// Helper untuk parse FormData
const parseForm = (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    
    // Pastikan folder uploads ada
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

// Helper untuk save gambar
const saveImage = (file: File): string => {
  const fileName = `${Date.now()}_${file.originalFilename || 'image'}`
  const newPath = path.join(process.cwd(), 'public', 'uploads', fileName)
  fs.renameSync(file.filepath, newPath)
  return `/uploads/${fileName}`
}

// Helper untuk extract field value
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
      // GET - Ambil semua produk atau by ID
      // ========================================
      case 'GET': {
        if (id) {
          const product = await Product.findById(id)
          if (!product) {
            return res.status(404).json({ error: 'Produk tidak ditemukan' })
          }
          return res.status(200).json(product)
        } else {
          const products = await Product.find().sort({ createdAt: -1 })
          return res.status(200).json(products)
        }
      }

      // ========================================
      // POST - Tambah produk baru
      // ========================================
      case 'POST': {
        const { fields, files } = await parseForm(req)

        const name = getFieldValue(fields.name)
        const category = getFieldValue(fields.category)
        const price = getFieldValue(fields.price)
        const description = getFieldValue(fields.description)

        // Validasi
        if (!name || !category || !price || !description) {
          return res.status(400).json({ error: 'Semua field wajib diisi' })
        }

        // Handle gambar
        let imageUrl = ''
        if (files.image) {
          const file = Array.isArray(files.image) ? files.image[0] : files.image
          imageUrl = saveImage(file as File)
        }

        // Simpan ke database
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
      // PUT - Update produk
      // ========================================
      case 'PUT': {
        if (!id) {
          return res.status(400).json({ error: 'ID produk diperlukan' })
        }

        const { fields, files } = await parseForm(req)

        const name = getFieldValue(fields.name)
        const category = getFieldValue(fields.category)
        const price = getFieldValue(fields.price)
        const description = getFieldValue(fields.description)
        const oldImageUrl = getFieldValue(fields.imageUrl)

        // Validasi
        if (!name || !category || !price || !description) {
          return res.status(400).json({ error: 'Semua field wajib diisi' })
        }

        // Handle gambar
        let imageUrl = oldImageUrl
        if (files.image) {
          const file = Array.isArray(files.image) ? files.image[0] : files.image
          imageUrl = saveImage(file as File)

          // Hapus gambar lama jika ada (opsional)
          if (oldImageUrl && oldImageUrl.startsWith('/uploads/')) {
            const oldPath = path.join(process.cwd(), 'public', oldImageUrl)
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath)
            }
          }
        }

        // Update database
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
      // DELETE - Hapus produk
      // ========================================
      case 'DELETE': {
        if (!id) {
          return res.status(400).json({ error: 'ID produk diperlukan' })
        }

        const product = await Product.findById(id)
        if (!product) {
          return res.status(404).json({ error: 'Produk tidak ditemukan' })
        }

        // Hapus gambar dari folder (opsional)
        if (product.imageUrl && product.imageUrl.startsWith('/uploads/')) {
          const imagePath = path.join(process.cwd(), 'public', product.imageUrl)
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath)
          }
        }

        await Product.findByIdAndDelete(id)
        return res.status(200).json({ message: 'Produk berhasil dihapus' })
      }

      // ========================================
      default:
        return res.status(405).json({ error: 'Method tidak diizinkan' })
    }
  } catch (error: any) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      error: error.message || 'Terjadi kesalahan server'
    })
  }
}
// src/pages/admin/edit/[id].tsx
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'

interface Product {
  _id: string
  name: string
  category: string
  price: number
  description: string
  imageUrl: string
}

export default function EditProductPage() {
  const router = useRouter()
  const { id } = router.query

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  // ✅ useCallback agar tidak trigger infinite re-render dan fix eslint deps
  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/product?id=${id}`)
      if (!res.ok) throw new Error('Produk tidak ditemukan')

      const product: Product = await res.json()
      setName(product.name)
      setCategory(product.category)
      setPrice(product.price.toString())
      setDescription(product.description)
      setCurrentImageUrl(product.imageUrl)
    } catch (error) {
      console.error('Error:', error)
      setMessage('❌ Gagal memuat data produk')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) fetchProduct()
  }, [id, fetchProduct])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('⏳ Menyimpan...')

    const formData = new FormData()
    formData.append('name', name)
    formData.append('category', category)
    formData.append('price', price)
    formData.append('description', description)

    if (imageFile) {
      formData.append('image', imageFile)
    } else {
      formData.append('imageUrl', currentImageUrl)
    }

    try {
      const res = await fetch(`/api/product?id=${id}`, {
        method: 'PUT',
        body: formData,
      })

      const result = await res.json()

      if (res.ok) {
        setMessage('✅ Produk berhasil diupdate!')
        setTimeout(() => {
          router.push('/admin')
        }, 1500)
      } else {
        setMessage(`❌ Gagal: ${result.error || 'Terjadi kesalahan'}`)
      }
    } catch (error) {
      console.error('Update Error:', error)
      setMessage('❌ Gagal mengupdate produk')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">⏳ Memuat data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md py-4 px-8 flex items-center justify-between">
        <button
          onClick={() => router.push('/admin')}
          className="text-black font-semibold hover:text-blue-700"
        >
          ← Kembali ke Admin
        </button>
        <h1 className="text-xl font-bold text-gray-800">Edit Produk</h1>
        <div />
      </nav>

      {/* Form Edit */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">✏️ Edit Produk</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Produk
              </label>
              <input
                type="text"
                placeholder="Nama Produk"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="">Pilih Kategori</option>
                <option value="Drinks">Drinks</option>
                <option value="Snacks">Snacks</option>
                <option value="Food">Food</option>
                <option value="Clothes">Clothes</option>
                <option value="Bundle">Bundle</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga
              </label>
              <input
                type="number"
                placeholder="Harga Produk"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                placeholder="Deskripsi Produk"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                rows={3}
                required
              />
            </div>

            {/* Gambar Saat Ini */}
            {currentImageUrl && !imageFile && (
              <div className="border rounded-lg p-3 bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Gambar saat ini:
                </p>
                <div className="relative w-full h-48">
                  <Image
                    src={currentImageUrl || '/no-image.png'}
                    alt="Current"
                    fill
                    className="object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'https://via.placeholder.com/300x200?text=No+Image'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Upload Gambar Baru */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ganti Gambar (Opsional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImageFile(e.target.files ? e.target.files[0] : null)
                }
                className="w-full px-4 py-2 border rounded-lg"
              />
              {imageFile && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ File baru: {imageFile.name}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
              >
                💾 Simpan Perubahan
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="px-8 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
              >
                Batal
              </button>
            </div>
          </form>

          {message && (
            <div
              className={`mt-6 text-center font-medium p-3 rounded-lg ${
                message.includes('❌')
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface Product {
  _id: string
  name: string
  category: string
  price: number
  description: string
  imageUrl: string
}

export default function AdminPage() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState('')
  const router = useRouter()
  const currentPath = router.pathname

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/product')
      if (!res.ok) throw new Error('Gagal mengambil data produk')
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (err: unknown) {
      console.error('Error fetching products:', err)
      setMessage('❌ Gagal memuat produk')
    } finally {
      setLoading(false)
    }
  }

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
    } else if (editingId && currentImageUrl) {
      formData.append('imageUrl', currentImageUrl)
    }

    try {
      const url = editingId ? `/api/product?id=${editingId}` : '/api/product'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        body: formData,
      })

      const result = await res.json()

      if (res.ok) {
        setMessage(editingId ? '✅ Produk berhasil diupdate!' : '✅ Produk berhasil ditambahkan!')
        resetForm()
        fetchProducts()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(`❌ Gagal: ${result.error || 'Terjadi kesalahan'}`)
      }
    } catch (error) {
      console.error('Submit Error:', error)
      setMessage('❌ Gagal menyimpan produk')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingId(product._id)
    setName(product.name)
    setCategory(product.category)
    setPrice(product.price.toString())
    setDescription(product.description)
    setCurrentImageUrl(product.imageUrl)
    setImageFile(null)
    setMessage('')

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return

    try {
      const res = await fetch(`/api/product?id=${id}`, { method: 'DELETE' })
      const result = await res.json()

      if (res.ok) {
        setMessage('🗑️ Produk berhasil dihapus!')
        fetchProducts()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(`❌ Gagal menghapus: ${result.error}`)
      }
    } catch (error) {
      console.error('Delete Error:', error)
      setMessage('❌ Gagal menghapus produk')
    }
  }

  const resetForm = () => {
    setName('')
    setCategory('')
    setPrice('')
    setDescription('')
    setImageFile(null)
    setEditingId(null)
    setCurrentImageUrl('')

    if (typeof document !== 'undefined') {
      const fileInput = document.getElementById('imageFileInput') as HTMLInputElement | null
      if (fileInput) fileInput.value = ''
    }
  }

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md py-4 px-8 flex items-center justify-between relative">
        <button onClick={() => router.push('/')} className="text-black font-semibold hover:text-blue-700">
          ← Back
        </button>

        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold text-gray-800">
          Admin Dashboard
        </h1>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              currentPath === '/admin' ? 'bg-blue-700 text-white shadow' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            ➕ Add Item
          </button>
          <button
            onClick={() => router.push('/checkoutlist')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              currentPath === '/admin/checkout' ? 'bg-blue-700 text-white shadow' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            🛒 Checkout List
          </button>
          <button
            onClick={() => router.push('/statistik')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              currentPath === '/admin/statistik' ? 'bg-blue-700 text-white shadow' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            📊 Statistik
          </button>
        </div>
      </nav>

      <main className="flex-grow p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Form Tambah/Edit Produk */}
          <div className="bg-white shadow-lg rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {editingId ? '✏️ Edit Produk' : '➕ Tambah Produk Baru'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Nama Produk"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />

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

              <input
                type="number"
                placeholder="Harga Produk"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />

              <textarea
                placeholder="Deskripsi Produk"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                rows={3}
                required
              />

              {editingId && currentImageUrl && !imageFile && (
                <div className="border rounded-lg p-2">
                  <p className="text-sm text-gray-600 mb-2">Gambar saat ini:</p>
                  <img src={currentImageUrl} alt="Current" className="w-32 h-32 object-cover rounded" />
                </div>
              )}

              <div className="w-full">
                <label className="block">
                  <span className="text-sm text-gray-600">
                    {editingId ? 'Ganti gambar (opsional):' : 'Pilih gambar:'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    id="imageFileInput"
                    onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full px-4 py-2 border rounded-lg mt-1"
                  />
                  {imageFile && <p className="text-sm text-green-600 mt-1">✓ {imageFile.name}</p>}
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
                >
                  {editingId ? '💾 Update Produk' : '💾 Simpan Produk'}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
                  >
                    ✖️ Batal
                  </button>
                )}
              </div>
            </form>

            {message && (
              <div
                className={`mt-6 text-center font-medium ${
                  message.includes('❌') ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {message}
              </div>
            )}
          </div>

          {/* Daftar Produk */}
          <section className="bg-white shadow-lg rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">📦 Daftar Produk</h2>

            {loading ? (
              <p className="text-center text-gray-500 py-8">⏳ Memuat data produk...</p>
            ) : products.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Belum ada produk.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <div
                    key={p._id}
                    className={`border-2 rounded-xl p-4 flex flex-col space-y-3 shadow-sm hover:shadow-lg transition ${
                      editingId === p._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-40 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x200?text=No+Image'
                        }}
                      />
                    )}
                    <h3 className="font-semibold text-lg">{p.name}</h3>
                    <p className="text-gray-600 text-sm">📂 {p.category}</p>
                    <p className="text-blue-600 font-bold text-lg">{formatRupiah(p.price)}</p>
                    <p className="text-gray-500 text-sm line-clamp-2">{p.description}</p>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition font-medium"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-medium"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

import { useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminPage() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, price, imageUrl }),
    })

    if (res.ok) {
      setMessage('Produk berhasil ditambahkan!')
      setName('')
      setCategory('')
      setPrice('')
      setImageUrl('')
    } else {
      const err = await res.json()
      setMessage(`Gagal menambahkan produk: ${err.error || 'unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-8 flex items-center">
        <button
          onClick={() => router.push('/')}
          className="mr-4 text-black font-semibold hover:text-blue-800"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800 flex-grow text-center">
          UTS IT IN FINTECH Payment Gateway - Admin
        </h1>
      </header>

      {/* Form */}
      <main className="flex-grow flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-96">
          <h2 className="text-xl font-bold mb-6 text-center">Tambah Produk</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Nama Produk"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
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
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Image URL (opsional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Simpan Produk
            </button>
          </form>

          {message && (
            <p className="mt-4 text-center text-green-600">{message}</p>
          )}
        </div>
      </main>
    </div>
  )
}

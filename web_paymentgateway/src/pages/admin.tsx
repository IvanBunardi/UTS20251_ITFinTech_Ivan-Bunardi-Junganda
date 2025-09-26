import { useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminPage() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('name', name)
    formData.append('category', category)
    formData.append('price', price)
    formData.append('description', description)
    if (imageFile) formData.append('image', imageFile)

    const res = await fetch('/api/product', {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      setMessage('Produk berhasil ditambahkan!')
      setName('')
      setCategory('')
      setPrice('')
      setDescription('')
      setImageFile(null)
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

            <textarea
              placeholder="Deskripsi Produk"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              rows={3}
              required
            />

            {/* Custom file input */}
            <div className="w-full">
              <label className="block">
                <span className="sr-only">Pilih Gambar Produk</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImageFile(e.target.files ? e.target.files[0] : null)
                  }
                  className="hidden"
                  id="imageFileInput"
                />
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById('imageFileInput')?.click()
                  }
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  {imageFile ? imageFile.name : 'Pilih Gambar'}
                </button>
              </label>
            </div>

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

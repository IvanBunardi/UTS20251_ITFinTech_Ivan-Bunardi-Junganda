import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'

interface Product {
  _id: string
  name: string
  category: string
  price: number
  description: string
  imageUrl?: string
  qty?: number
}

export default function LandingPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Product[]>([])
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  // ambil data produk
  useEffect(() => {
    fetch('/api/product')
      .then((res) => res.json())
      .then(setProducts)
      .catch((err) => console.error('Gagal ambil produk:', err))
  }, [])

  const categories = ['All', 'Drinks', 'Snacks', 'Food', 'Clothes', 'Bundle']

  const filteredProducts = products.filter((p) => {
    const matchesCategory = filter === 'All' || p.category === filter
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // ✅ Fungsi Add to Cart - selalu tampilkan alert login
  function addToCart(p: Product) {
    alert('Silakan login terlebih dahulu')
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/dot-grid.png')]" />

      {/* Navbar */}
      <header className="flex justify-between items-center py-4 px-8 bg-white/20 backdrop-blur-md shadow-md z-10">
        <h1 className="text-2xl font-bold text-white drop-shadow-md">XenditPay</h1>

        <nav className="flex items-center space-x-6">
          <button
            onClick={() => router.push('/login')}
            className="text-white hover:text-yellow-300 font-medium transition"
          >
            Login
          </button>
          <button
            onClick={() => router.push('/register')}
            className="bg-yellow-400 text-gray-800 font-semibold px-5 py-2 rounded-lg hover:bg-yellow-300 transition"
          >
            Register
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center text-center px-6 md:px-16 py-16 z-10">
        <h2 className="text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-md">
          Belanja Mudah & Aman <br /> dengan{' '}
          <span className="text-yellow-300">XenditPay</span>
        </h2>

        <p className="text-white/90 text-lg max-w-md mb-8">
          Platform e-commerce modern dengan sistem pembayaran terintegrasi.
          Nikmati kemudahan checkout menggunakan Payment Gateway Xendit.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={() => router.push('/login')}
            className="bg-yellow-400 text-gray-800 font-semibold px-8 py-3 rounded-lg hover:bg-yellow-300 transition"
          >
            Masuk ke Akun
          </button>
          <button
            onClick={() => router.push('/register')}
            className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/20 transition"
          >
            Buat Akun Baru
          </button>
        </div>

        {/* Produk Section */}
        <section className="w-full bg-white rounded-t-3xl shadow-inner py-10 px-4 md:px-10 mt-10">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">
            🛍️ Pilih Produk Anda
          </h3>

          {/* Filter dan Search */}
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-1 rounded-full text-sm font-medium ${
                  filter === c
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex justify-center mb-6">
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full max-w-md"
            />
          </div>

          {/* Daftar Produk */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <div
                key={p._id}
                className="bg-white border rounded-xl shadow-md p-4 hover:shadow-lg transition"
              >
                <div className="w-full h-40 relative mb-3 rounded-lg overflow-hidden bg-gray-100">
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No Img
                    </div>
                  )}
                </div>
                <h4 className="font-semibold text-gray-800">{p.name}</h4>
                <p className="text-gray-500 text-sm">
                  Rp {p.price.toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  {p.description || 'Tidak ada deskripsi'}
                </p>
                <button
                  onClick={() => addToCart(p)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500 transition"
                >
                  Add +
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center bg-black py-4 text-white/80 text-sm z-10">
        © {new Date().getFullYear()} IT IN FINTECH Payment Gateway. All rights reserved.
      </footer>
    </div>
  )
}
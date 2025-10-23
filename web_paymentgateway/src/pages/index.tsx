import { useRouter } from 'next/router'
import Image from 'next/image'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/dot-grid.png')]"></div>

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
      <main className="flex-grow flex flex-col md:flex-row items-center justify-center text-center md:text-left px-6 md:px-16 py-16 z-10">
        <div className="flex-1 mb-10 md:mb-0">
          <h2 className="text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-md">
            Belanja Mudah & Aman <br /> dengan{' '}
            <span className="text-yellow-300">XenditPay</span>
          </h2>

          <p className="text-white/90 text-lg max-w-md mb-8">
            Platform e-commerce modern dengan sistem pembayaran terintegrasi.
            Nikmati kemudahan checkout menggunakan Payment Gateway Xendit.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
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
        </div>

        {/* Illustration (optimized with next/image) */}
        <div className="flex-1 flex justify-center">
          <Image
            src="https://illustrations.popsy.co/blue/online-shopping.svg"
            alt="E-commerce Illustration"
            width={400}
            height={400}
            className="drop-shadow-lg"
            priority
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center bg-black py-4 text-white/80 text-sm z-10">
        © {new Date().getFullYear()} IT IN FINTECH Payment Gateway. All rights reserved.
      </footer>
    </div>
  )
}

import { useRouter } from 'next/router';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-8">
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          UTS IT IN FINTECH Payment Gateway
        </h1>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Card Admin */}
          <div className="bg-white shadow-lg rounded-2xl p-8 w-64 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">Admin</h2>
            <p className="text-gray-600 text-center mb-6">
              Untuk Tambah Produk.
            </p>
            <button
              onClick={() => router.push('/admin')}
              className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Masuk sebagai Admin
            </button>
          </div>

          {/* Card User */}
          <div className="bg-white shadow-lg rounded-2xl p-8 w-64 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4 text-green-600">User</h2>
            <p className="text-gray-600 text-center mb-6">
              Belanja produk, lakukan checkout, dan bayar pakai Xendit.
            </p>
            <button
              onClick={() => router.push('/selectitem')}
              className="w-full py-2 px-4 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
            >
              Masuk sebagai User
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

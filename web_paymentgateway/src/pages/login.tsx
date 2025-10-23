import { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.token) localStorage.setItem('token', data.token);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

        setMessage('Login berhasil! Mengalihkan...');
        const redirectTo = data.redirectTo || '/selectitem';
        setTimeout(() => router.push(redirectTo), 1500);
      } else {
        setMessage(data.error || 'Email atau password salah');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <header className="flex items-center py-3 px-4 border-b border-gray-200 bg-white">
        <button
          onClick={() => router.push('/')}
          className="text-gray-700 hover:text-gray-900 mr-2"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">XenditPay</h1>
      </header>

      {/* Form Section */}
      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Masuk ke XenditPay</h2>
          <p className="text-gray-600 mb-6 text-sm">Gunakan akun Anda untuk masuk</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
              minLength={6}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>

            {/* Link ke register */}
            <p className="text-center text-sm text-gray-600 mt-2">
              Belum punya akun?{' '}
              <span
                onClick={() => router.push('/register')}
                className="text-blue-600 font-medium cursor-pointer hover:underline"
              >
                Daftar di sini
              </span>
            </p>

            <p className="text-center text-sm text-gray-600 mt-1">
              <span
                onClick={() => router.push('/forgot-password')}
                className="text-blue-600 cursor-pointer hover:underline"
              >
                Lupa password?
              </span>
            </p>
          </form>

          {message && (
            <div
              className={`mt-3 p-2 rounded-md text-center text-sm ${
                message.includes('berhasil') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center bg-black py-4 text-white/80 text-sm z-10">
        © {new Date().getFullYear()} IT IN FINTECH Payment Gateway. All rights reserved.
      </footer>
    </div>
  );
}

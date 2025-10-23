import { useState } from 'react';
import axios from 'axios';

export default function VerifyPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔑 Fungsi verifikasi OTP
  const handleVerify = async () => {
    if (!phone || !otp) {
      setMessage('Nomor WhatsApp dan OTP wajib diisi!');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post('/api/verify-otp', { phone, otp });
      localStorage.setItem('token', res.data.token);
      setMessage(res.data.message || 'Verifikasi berhasil!');
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setMessage(err.response?.data?.error || 'Terjadi kesalahan saat verifikasi.');
      } else {
        setMessage('Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Fungsi kirim ulang OTP
  const handleResend = async () => {
    if (!phone) {
      setMessage('Nomor WhatsApp wajib diisi!');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await axios.put('/api/verify-otp', { phone });
      setMessage(res.data.message || 'Kode OTP baru telah dikirim.');
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setMessage(err.response?.data?.error || 'Gagal mengirim OTP baru.');
      } else {
        setMessage('Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-400 via-teal-500 to-cyan-600">
      <div className="p-8 bg-white rounded-2xl shadow-2xl w-80 text-center">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Verifikasi Akun via WhatsApp
        </h2>

        {/* Input Nomor WhatsApp */}
        <input
          type="tel"
          placeholder="Nomor WhatsApp (contoh: +6281234567890)"
          className="border border-gray-300 p-2 rounded w-full mb-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {/* Input Kode OTP */}
        <input
          type="text"
          placeholder="Kode OTP"
          className="border border-gray-300 p-2 rounded w-full mb-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        {/* Tombol Verifikasi */}
        <button
          onClick={handleVerify}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded w-full mb-2 transition-all disabled:opacity-70"
        >
          {loading ? 'Memproses...' : 'Verifikasi'}
        </button>

        {/* Tombol Kirim Ulang */}
        <button
          onClick={handleResend}
          disabled={loading}
          className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded w-full transition-all disabled:opacity-70"
        >
          Kirim Ulang OTP
        </button>

        {/* Pesan Status */}
        {message && (
          <p className="text-sm text-gray-700 mt-3 bg-gray-100 p-2 rounded">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

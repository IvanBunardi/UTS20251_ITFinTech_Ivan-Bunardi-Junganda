import { useState } from 'react';
import axios from 'axios';

export default function VerifyPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔑 Verifikasi akun
  const handleVerify = async () => {
    if (!phone || !otp) {
      setMessage('Nomor WhatsApp dan OTP wajib diisi!');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post('/api/verify-otp', { phone, otp }); // endpoint server
      localStorage.setItem('token', res.data.token); // simpan JWT
      setMessage(res.data.message);
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

  // 🔁 Kirim ulang OTP via WhatsApp
  const handleResend = async () => {
    if (!phone) {
      setMessage('Nomor WhatsApp wajib diisi!');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await axios.put('/api/verify-otp', { phone }); // PUT sesuai server
      setMessage(res.data.message);
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-2xl shadow-lg w-80 text-center">
        <h2 className="text-xl font-bold mb-4">Verifikasi Akun via WhatsApp</h2>

        <input
          type="tel"
          placeholder="Nomor WhatsApp (contoh: +6281234567890)"
          className="border p-2 rounded w-full mb-3"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="text"
          placeholder="Kode OTP"
          className="border p-2 rounded w-full mb-3"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded w-full mb-2 transition-all"
        >
          {loading ? 'Memproses...' : 'Verifikasi'}
        </button>

        <button
          onClick={handleResend}
          disabled={loading}
          className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded w-full transition-all"
        >
          Kirim Ulang OTP
        </button>

        {message && <p className="text-sm text-gray-700 mt-3">{message}</p>}
      </div>
    </div>
  );
}

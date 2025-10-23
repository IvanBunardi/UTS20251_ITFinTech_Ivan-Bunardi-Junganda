import { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=masukkan WA, 2=OTP, 3=ganti password
  const [whatsapp, setWhatsapp] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Kirim OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp })
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      if (res.ok) setStep(2);
    } catch {
      setMessage('Terjadi kesalahan server');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verifikasi OTP + Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp, otp, newPassword })
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      if (res.ok) setStep(3);
    } catch {
      setMessage('Terjadi kesalahan server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <header className="flex items-center py-3 px-4 border-b border-gray-200 bg-white">
        <button onClick={() => router.push('/login')} className="text-gray-700 hover:text-gray-900 mr-2">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">XenditPay</h1>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white p-6 rounded-xl border border-gray-200">
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold mb-2">Lupa Password</h2>
              <p className="text-gray-600 mb-6 text-sm">Masukkan nomor WhatsApp terdaftar untuk menerima OTP</p>
              <form onSubmit={handleSendOTP} className="space-y-4">
                <input
                  type="tel"
                  placeholder="+628123456789"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                  pattern="^\+[1-9]\d{1,14}$"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Mengirim OTP...' : 'Kirim OTP'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold mb-2">Verifikasi OTP</h2>
              <p className="text-gray-600 mb-6 text-sm">Kode telah dikirim ke WhatsApp {whatsapp}</p>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-center font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                  maxLength={6}
                  pattern="\d{6}"
                />
                <input
                  type="password"
                  placeholder="Password Baru"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                  minLength={6}
                />
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-green-600 text-white py-2 rounded-md font-medium hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? 'Memproses...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-green-600">Password Berhasil Diubah!</h2>
              <p className="text-gray-600 mb-4 text-sm">Silakan login dengan password baru Anda.</p>
              <button
                onClick={() => router.push('/login')}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
              >
                Login Sekarang
              </button>
            </div>
          )}

          {message && (
            <div
              className={`mt-3 p-2 rounded-md text-center text-sm ${
                message.toLowerCase().includes('berhasil') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

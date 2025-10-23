import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  qty: number;
  imageUrl?: string;
  category?: string;
}

export default function PaymentPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: '',
  });

  const SHIPPING_COST = 12000;

  useEffect(() => {
    const c = localStorage.getItem('cart');
    if (c) {
      try {
        setCart(JSON.parse(c));
      } catch (e) {
        console.error('Error parsing cart:', e);
      }
    }
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * (item.qty || 0), 0);
  const tax = subtotal * 0.11;
  const total = subtotal + SHIPPING_COST + tax;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validasi
    if (!formData.customerName.trim()) {
      setError('Nama harus diisi');
      setLoading(false);
      return;
    }

    if (!formData.customerPhone.trim()) {
      setError('Nomor telepon harus diisi');
      setLoading(false);
      return;
    }

    if (cart.length === 0) {
      setError('Keranjang kosong');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        items: cart,
        totalPrice: Math.round(total),
        email: formData.customerEmail || 'noemail@example.com',
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        customerEmail: formData.customerEmail.trim(),
        notes: formData.notes.trim(),
      };

      console.log('Sending to checkout:', JSON.stringify(payload, null, 2));

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      console.log('Checkout response:', data);

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat invoice');
      }

      console.log('Invoice created, redirecting...');
      localStorage.removeItem('cart');
      window.location.href = data.invoiceUrl;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(errorMsg);
      console.error('Error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow p-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-black font-medium hover:text-blue-600"
        >
          &lt; Back
        </button>
        <h1 className="font-bold text-lg">Secure Checkout</h1>
        <div className="w-12" />
      </header>

      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Informasi Pengiriman</h2>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Telepon/WhatsApp *
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder="08123456789 atau +6281234567890"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nomor ini akan digunakan untuk notifikasi WhatsApp
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Opsional)
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan Pesanan (Opsional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Tulis catatan tambahan jika ada..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || cart.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {loading ? 'Memproses...' : 'Lanjut ke Pembayaran'}
              </button>
            </form>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-lg font-bold mb-4">Ringkasan Pesanan</h2>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto border-b pb-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-sm">Keranjang kosong</p>
              ) : (
                cart.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-gray-500">
                        {item.qty}x @ Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      Rp {(item.price * item.qty).toLocaleString('id-ID')}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pengiriman</span>
                <span>Rp {SHIPPING_COST.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pajak (11%)</span>
                <span>Rp {tax.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-3">
                <span>Total</span>
                <span className="text-blue-600">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
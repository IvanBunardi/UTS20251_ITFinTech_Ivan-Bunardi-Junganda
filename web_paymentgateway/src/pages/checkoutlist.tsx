import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AdminCheckoutPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const router = useRouter()
  const currentPath = router.pathname

  // 🔹 Ambil data order dari API
  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/order')
      if (!res.ok) throw new Error('Gagal mengambil data order')
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error:', error)
      setMessage('❌ Gagal memuat data order')
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Update status order
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/order?id=${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Gagal update status')
      setMessage('✅ Status berhasil diupdate!')
      fetchOrders()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ Gagal update status')
    }
  }

  // 🔹 Hapus order
  const deleteOrder = async (orderId: string) => {
    if (!confirm('Yakin ingin menghapus order ini?')) return

    try {
      const res = await fetch(`/api/order?id=${orderId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus order')
      setMessage('🗑️ Order berhasil dihapus!')
      fetchOrders()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ Gagal menghapus order')
    }
  }

  // 🔹 Format ke Rupiah
  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)

  // 🔹 Format tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 🔹 Tampilan badge status
  const getStatusBadge = (status: string) => {
    const config: any = {
      waiting_payment: { bg: 'bg-yellow-100 text-yellow-800', label: '⏳ Menunggu Pembayaran' },
      paid: { bg: 'bg-green-100 text-green-800', label: '✅ Lunas' },
      cancelled: { bg: 'bg-red-100 text-red-800', label: '❌ Dibatalkan' },
    }
    const c = config[status] || config.waiting_payment
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${c.bg}`}>{c.label}</span>
  }

  // 🔹 Filter order sesuai status
  const filteredOrders =
    filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus)

  // 🔹 Statistik ringkasan
  const stats = {
    total: orders.length,
    waiting: orders.filter((o) => o.status === 'waiting_payment').length,
    paid: orders.filter((o) => o.status === 'paid').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    revenue: orders
      .filter((o) => o.status === 'paid')
      .reduce((sum, o) => sum + o.totalAmount, 0),
  }

  // ============================== RENDER ==============================
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* 🔹 Navbar */}
      <nav className="bg-white shadow-md py-4 px-8 flex items-center justify-between relative">
        <button onClick={() => router.push('/')} className="text-black font-semibold hover:text-blue-700">
          ← Back
        </button>
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold text-gray-800">
          Admin Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              currentPath === '/admin' ? 'bg-blue-700 text-white shadow' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            ➕ Add Item
          </button>
          <button
            onClick={() => router.push('/checkoutlist')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              currentPath === '/admin/checkout' ? 'bg-blue-700 text-white shadow' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            🛒 Checkout
          </button>
          <button
            onClick={() => router.push('/statistik')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              currentPath === '/admin/statistik' ? 'bg-blue-700 text-white shadow' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            📊 Statistik
          </button>
        </div>
      </nav>

      {/* 🔹 Main Content */}
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Statistik */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatBox label="Total Order" value={stats.total} color="text-blue-600" />
            <StatBox label="Menunggu" value={stats.waiting} color="text-yellow-600" />
            <StatBox label="Lunas" value={stats.paid} color="text-green-600" />
            <StatBox label="Dibatalkan" value={stats.cancelled} color="text-red-600" />
            <StatBox label="Pendapatan" value={formatRupiah(stats.revenue)} color="text-green-600" />
          </div>

          {/* Pesan Sukses/Error */}
          {message && (
            <div
              className={`p-4 rounded-lg text-center font-medium ${
                message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}
            >
              {message}
            </div>
          )}

          {/* Filter Status */}
          <div className="bg-white rounded-lg p-4 shadow flex items-center gap-4">
            <span className="font-medium text-gray-700">Filter:</span>
            {[
              { key: 'all', label: 'Semua', count: stats.total, color: 'blue' },
              { key: 'waiting_payment', label: 'Menunggu', count: stats.waiting, color: 'yellow' },
              { key: 'paid', label: 'Lunas', count: stats.paid, color: 'green' },
              { key: 'cancelled', label: 'Dibatalkan', count: stats.cancelled, color: 'red' },
            ].map((btn) => (
              <button
                key={btn.key}
                onClick={() => setFilterStatus(btn.key)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === btn.key
                    ? `bg-${btn.color}-500 text-white`
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {btn.label} ({btn.count})
              </button>
            ))}
          </div>

          {/* Daftar Order */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">📋 Daftar Order</h2>
            </div>

            {loading ? (
              <p className="text-center text-gray-500 py-12">⏳ Memuat data...</p>
            ) : filteredOrders.length === 0 ? (
              <p className="text-center text-gray-500 py-12">Belum ada order.</p>
            ) : (
              <div className="divide-y">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    expandedOrder={expandedOrder}
                    setExpandedOrder={setExpandedOrder}
                    formatDate={formatDate}
                    formatRupiah={formatRupiah}
                    getStatusBadge={getStatusBadge}
                    updateOrderStatus={updateOrderStatus}
                    deleteOrder={deleteOrder}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// ===================== Komponen Tambahan =====================

function StatBox({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <p className="text-gray-600 text-sm">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

function OrderCard({
  order,
  expandedOrder,
  setExpandedOrder,
  formatDate,
  formatRupiah,
  getStatusBadge,
  updateOrderStatus,
  deleteOrder,
}: any) {
  return (
    <div className="p-6 hover:bg-gray-50 transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-blue-600">{order.orderNumber}</h3>
            {getStatusBadge(order.status)}
          </div>
          <p className="text-gray-600">
            <span className="font-medium">👤 {order.customerName}</span> • 📱 {order.customerPhone}
            {order.customerEmail && ` • ✉️ ${order.customerEmail}`}
          </p>
          <p className="text-sm text-gray-500 mt-1">🕐 {formatDate(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">{formatRupiah(order.totalAmount)}</p>
          <p className="text-sm text-gray-500">{order.items.length} item(s)</p>
        </div>
      </div>

      <button
        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
        className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-3"
      >
        {expandedOrder === order._id ? '▼ Sembunyikan Detail' : '▶ Lihat Detail'}
      </button>

      {expandedOrder === order._id && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
          {order.items.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/64?text=No+Image'
                  }}
                />
              )}
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">{item.category}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{item.quantity}x</p>
                <p className="text-sm text-gray-600">{formatRupiah(item.price)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">{formatRupiah(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
          {order.notes && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mt-3">
              <p className="text-sm font-medium text-gray-700">📝 Catatan:</p>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {order.status === 'waiting_payment' && (
          <>
            <button
              onClick={() => updateOrderStatus(order._id, 'paid')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
            >
              ✅ Tandai Lunas
            </button>
            <button
              onClick={() => updateOrderStatus(order._id, 'cancelled')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
            >
              ❌ Batalkan
            </button>
          </>
        )}
        {order.status === 'paid' && (
          <button
            onClick={() => updateOrderStatus(order._id, 'cancelled')}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
          >
            ❌ Batalkan
          </button>
        )}
        {order.status === 'cancelled' && (
          <button
            onClick={() => updateOrderStatus(order._id, 'waiting_payment')}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-medium"
          >
            🔄 Kembalikan
          </button>
        )}
        <button
          onClick={() => deleteOrder(order._id)}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium ml-auto"
        >
          🗑️ Hapus
        </button>
      </div>
    </div>
  )
}

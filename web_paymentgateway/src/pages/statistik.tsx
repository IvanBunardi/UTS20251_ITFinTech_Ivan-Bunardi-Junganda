'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend as RechartsLegend,
} from 'recharts'

// ✅ Legend wrapper agar tidak error di TypeScript / Recharts v3
const LegendWrapper: React.FC<Record<string, unknown>> = (props) => {
  return React.createElement(RechartsLegend as any, props)
}

// ---------------------------
// Interface Types
// ---------------------------
interface OrderItem {
  name: string
  price: number
  quantity: number
}

interface Order {
  _id?: string
  createdAt: string
  totalAmount: number
  status: 'paid' | 'waiting_payment' | 'cancelled'
  items: OrderItem[]
}

// ---------------------------
// Page Component
// ---------------------------
export default function StatistikPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  const router = useRouter()
  const currentPath = router.pathname

  useEffect(() => {
    void fetchOrders()
  }, [])

  // ---------------------------
  // Fetch Orders
  // ---------------------------
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/order')
      if (!res.ok) throw new Error('Gagal mengambil data order')
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (value: number): string =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)

  // ---------------------------
  // Filter Order Berdasarkan Periode
  // ---------------------------
  const filterOrdersByDate = (): Order[] => {
    if (dateRange === 'all') return orders
    const now = new Date()
    const cutoff = new Date()
    switch (dateRange) {
      case '7d':
        cutoff.setDate(now.getDate() - 7)
        break
      case '30d':
        cutoff.setDate(now.getDate() - 30)
        break
      case '90d':
        cutoff.setDate(now.getDate() - 90)
        break
    }
    return orders.filter((o) => new Date(o.createdAt) >= cutoff)
  }

  const filteredOrders = filterOrdersByDate()

  // ---------------------------
  // Statistik
  // ---------------------------
  const paidOrders = filteredOrders.filter((o) => o.status === 'paid')
  const waitingOrders = filteredOrders.filter((o) => o.status === 'waiting_payment')
  const cancelledOrders = filteredOrders.filter((o) => o.status === 'cancelled')

  const stats = {
    totalOrders: filteredOrders.length,
    totalRevenue: paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    paidOrders: paidOrders.length,
    waitingOrders: waitingOrders.length,
    cancelledOrders: cancelledOrders.length,
    averageOrderValue:
      paidOrders.length > 0
        ? paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) / paidOrders.length
        : 0,
  }

  // ---------------------------
  // Grafik Pendapatan Harian
  // ---------------------------
  const getDailyRevenueData = () => {
    const daily: Record<string, number> = {}
    paidOrders.forEach((o) => {
      const d = new Date(o.createdAt)
      if (isNaN(d.getTime())) return
      const date = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
      daily[date] = (daily[date] || 0) + (o.totalAmount || 0)
    })
    return Object.entries(daily)
      .map(([date, revenue]) => ({ date, revenue }))
      .slice(-14)
  }

  // ---------------------------
  // Produk Terlaris
  // ---------------------------
  const getTopProducts = () => {
    const sales: Record<string, { name: string; quantity: number; revenue: number }> = {}
    paidOrders.forEach((order) => {
      const items = Array.isArray(order.items) ? order.items : []
      items.forEach((item) => {
        const name = item.name || 'Unknown'
        if (!sales[name]) sales[name] = { name, quantity: 0, revenue: 0 }
        sales[name].quantity += item.quantity
        sales[name].revenue += item.price * item.quantity
      })
    })
    return Object.values(sales).sort((a, b) => b.revenue - a.revenue).slice(0, 10)
  }

  // ---------------------------
  // Distribusi Status Order
  // ---------------------------
  const getOrderStatusData = () => [
    { name: 'Lunas', value: stats.paidOrders, color: '#10b981' },
    { name: 'Menunggu', value: stats.waitingOrders, color: '#f59e0b' },
    { name: 'Dibatalkan', value: stats.cancelledOrders, color: '#ef4444' },
  ]

  const dailyRevenueData = getDailyRevenueData()
  const topProductsData = getTopProducts()
  const orderStatusData = getOrderStatusData()

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
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

      {/* Main Content */}
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Filter */}
          <div className="bg-white rounded-lg p-4 shadow flex items-center gap-4">
            <span className="font-medium text-gray-700">Periode:</span>
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  dateRange === range ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {range === '7d' ? '7 Hari' : range === '30d' ? '30 Hari' : range === '90d' ? '90 Hari' : 'Semua'}
              </button>
            ))}
          </div>

          {/* Stats Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-6 shadow">
              <p className="text-gray-600 text-sm mb-2">Total Pendapatan</p>
              <p className="text-3xl font-bold text-green-600">{formatRupiah(stats.totalRevenue)}</p>
              <p className="text-sm text-gray-500 mt-1">{stats.paidOrders} transaksi berhasil</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <p className="text-gray-600 text-sm mb-2">Rata-rata Order</p>
              <p className="text-3xl font-bold text-blue-600">{formatRupiah(stats.averageOrderValue)}</p>
              <p className="text-sm text-gray-500 mt-1">per transaksi</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <p className="text-gray-600 text-sm mb-2">Total Order</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalOrders}</p>
              <p className="text-sm text-gray-500 mt-1">dalam periode ini</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <p className="text-gray-600 text-sm mb-2">Success Rate</p>
              <p className="text-3xl font-bold text-indigo-600">
                {stats.totalOrders > 0 ? Math.round((stats.paidOrders / stats.totalOrders) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-500 mt-1">tingkat keberhasilan</p>
            </div>
          </div>

          {/* Chart Section */}
          {loading ? (
            <p className="text-center text-gray-500 py-12">⏳ Memuat data...</p>
          ) : (
            <>
              {/* Line Chart */}
              <div className="bg-white rounded-lg p-6 shadow">
                <h2 className="text-xl font-bold mb-4">📈 Pendapatan Harian (14 Hari Terakhir)</h2>
                {dailyRevenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(v) => `Rp${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => formatRupiah(v)} />
                      <LegendWrapper />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Pendapatan" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-12">Belum ada data pendapatan</p>
                )}
              </div>

              {/* Bar & Pie */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow">
                  <h2 className="text-xl font-bold mb-4">🏆 Produk Terlaris (Top 10)</h2>
                  {topProductsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={topProductsData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(v) => `Rp${(v / 1000).toFixed(0)}k`} />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip formatter={(v: number) => formatRupiah(v)} />
                        <LegendWrapper />
                        <Bar dataKey="revenue" fill="#3b82f6" name="Pendapatan" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-500 py-12">Belum ada data produk</p>
                  )}
                </div>

                <div className="bg-white rounded-lg p-6 shadow">
                  <h2 className="text-xl font-bold mb-4">📊 Distribusi Status Order</h2>
                  {orderStatusData.some((d) => d.value > 0) ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {orderStatusData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <LegendWrapper />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-500 py-12">Belum ada data order</p>
                  )}
                </div>
              </div>

              {/* Tabel Produk */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold">📦 Detail Produk Terlaris</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Terjual</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pendapatan</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {topProductsData.length > 0 ? (
                        topProductsData.map((p, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
                                  {i + 1}
                                </div>
                                <div className="text-sm font-medium text-gray-900">{p.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{p.quantity} unit</td>
                            <td className="px-6 py-4 text-sm font-medium text-green-600">{formatRupiah(p.revenue)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                            Belum ada data penjualan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

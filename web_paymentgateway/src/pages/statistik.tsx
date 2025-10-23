'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
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

// ✅ Legend wrapper aman di Recharts v3
const LegendWrapper = React.memo((props: Record<string, unknown>) =>
  React.createElement(RechartsLegend as any, props)
)

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
// Component Utama
// ---------------------------
export default function StatistikPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  const router = useRouter()
  const currentPath = usePathname()

  // ---------------------------
  // Ambil Data Order
  // ---------------------------
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/order', { cache: 'no-store' })
        if (!res.ok) throw new Error('Gagal mengambil data order')
        const data = await res.json()
        setOrders(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error fetching orders:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const formatRupiah = (value: number): string =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)

  // ---------------------------
  // Filter Berdasarkan Range Waktu
  // ---------------------------
  const filteredOrders = useMemo(() => {
    if (dateRange === 'all') return orders
    const now = new Date()
    const cutoff = new Date()
    if (dateRange === '7d') cutoff.setDate(now.getDate() - 7)
    if (dateRange === '30d') cutoff.setDate(now.getDate() - 30)
    if (dateRange === '90d') cutoff.setDate(now.getDate() - 90)
    return orders.filter((o) => new Date(o.createdAt) >= cutoff)
  }, [orders, dateRange])

  // ---------------------------
  // Statistik
  // ---------------------------
  const paidOrders = useMemo(() => filteredOrders.filter((o) => o.status === 'paid'), [filteredOrders])
  const waitingOrders = useMemo(() => filteredOrders.filter((o) => o.status === 'waiting_payment'), [filteredOrders])
  const cancelledOrders = useMemo(() => filteredOrders.filter((o) => o.status === 'cancelled'), [filteredOrders])

  const stats = useMemo(() => {
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    return {
      totalOrders: filteredOrders.length,
      totalRevenue,
      paidOrders: paidOrders.length,
      waitingOrders: waitingOrders.length,
      cancelledOrders: cancelledOrders.length,
      averageOrderValue: paidOrders.length ? totalRevenue / paidOrders.length : 0,
    }
  }, [filteredOrders, paidOrders, waitingOrders, cancelledOrders])

  // ---------------------------
  // Data Chart
  // ---------------------------
  const dailyRevenueData = useMemo(() => {
    const daily: Record<string, number> = {}
    paidOrders.forEach((o) => {
      const d = new Date(o.createdAt)
      if (!isNaN(d.getTime())) {
        const key = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
        daily[key] = (daily[key] || 0) + (o.totalAmount || 0)
      }
    })
    return Object.entries(daily).map(([date, revenue]) => ({ date, revenue })).slice(-14)
  }, [paidOrders])

  const topProductsData = useMemo(() => {
    const sales: Record<string, { name: string; quantity: number; revenue: number }> = {}
    paidOrders.forEach((order) => {
      const items = order.items || []
      items.forEach((item) => {
        const name = item.name || 'Unknown'
        if (!sales[name]) sales[name] = { name, quantity: 0, revenue: 0 }
        sales[name].quantity += item.quantity
        sales[name].revenue += item.price * item.quantity
      })
    })
    return Object.values(sales).sort((a, b) => b.revenue - a.revenue).slice(0, 10)
  }, [paidOrders])

  const orderStatusData = useMemo(
    () => [
      { name: 'Lunas', value: stats.paidOrders, color: '#10b981' },
      { name: 'Menunggu', value: stats.waitingOrders, color: '#f59e0b' },
      { name: 'Dibatalkan', value: stats.cancelledOrders, color: '#ef4444' },
    ],
    [stats]
  )

  // ---------------------------
  // Render
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
              currentPath === '/checkoutlist' ? 'bg-blue-700 text-white shadow' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            🛒 Checkout
          </button>
          <button
            onClick={() => router.push('/statistik')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              currentPath === '/statistik' ? 'bg-blue-700 text-white shadow' : 'text-gray-700 hover:bg-gray-200'
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

          {/* Statistik Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Pendapatan', value: formatRupiah(stats.totalRevenue), sub: `${stats.paidOrders} transaksi`, color: 'text-green-600' },
              { label: 'Rata-rata Order', value: formatRupiah(stats.averageOrderValue), sub: 'per transaksi', color: 'text-blue-600' },
              { label: 'Total Order', value: stats.totalOrders, sub: 'dalam periode ini', color: 'text-purple-600' },
              {
                label: 'Success Rate',
                value: `${stats.totalOrders ? Math.round((stats.paidOrders / stats.totalOrders) * 100) : 0}%`,
                sub: 'tingkat keberhasilan',
                color: 'text-indigo-600',
              },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow">
                <p className="text-gray-600 text-sm mb-2">{card.label}</p>
                <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          {loading ? (
            <p className="text-center text-gray-500 py-12">⏳ Memuat data...</p>
          ) : (
            <>
              {/* Line Chart */}
              <div className="bg-white rounded-lg p-6 shadow">
                <h2 className="text-xl font-bold mb-4">📈 Pendapatan Harian</h2>
                {dailyRevenueData.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(v) => `Rp${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => formatRupiah(v)} />
                      <LegendWrapper />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-12">Belum ada data</p>
                )}
              </div>

              {/* Bar + Pie */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Produk Terlaris */}
                <div className="bg-white rounded-lg p-6 shadow">
                  <h2 className="text-xl font-bold mb-4">🏆 Produk Terlaris</h2>
                  {topProductsData.length ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={topProductsData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(v) => `Rp${(v / 1000).toFixed(0)}k`} />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip formatter={(v: number) => formatRupiah(v)} />
                        <LegendWrapper />
                        <Bar dataKey="revenue" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-500 py-12">Belum ada data</p>
                  )}
                </div>

                {/* Pie Chart */}
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
                          dataKey="value"
                        >
                          {orderStatusData.map((d, i) => (
                            <Cell key={i} fill={d.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <LegendWrapper />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-500 py-12">Belum ada data</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

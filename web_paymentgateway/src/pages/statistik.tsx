// src/pages/statistik.tsx  (atau pages/admin/statistik.tsx)
'use client'

import React from 'react'
import { useState, useEffect } from 'react'
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

// Wrapper untuk Legend supaya TypeScript/JSX tidak error pada recharts@3.x
const LegendWrapper: React.FC<any> = (props) => {
  return React.createElement(RechartsLegend as any, props)
}

// ----------------------
// Page component
// ----------------------
export default function StatistikPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const router = useRouter()
  const currentPath = router.pathname

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
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)

  // Filter orders by date range
  const filterOrdersByDate = () => {
    if (dateRange === 'all') return orders
    const now = new Date()
    const cutoffDate = new Date()
    switch (dateRange) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case '30d':
        cutoffDate.setDate(now.getDate() - 30)
        break
      case '90d':
        cutoffDate.setDate(now.getDate() - 90)
        break
    }
    return orders.filter((order) => new Date(order.createdAt) >= cutoffDate)
  }

  const filteredOrders = filterOrdersByDate()

  // Stats
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
      paidOrders.length > 0 ? paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) / paidOrders.length : 0,
  }

  // Daily Revenue Data (for Line Chart)
  const getDailyRevenueData = () => {
    const dailyData: { [key: string]: number } = {}

    paidOrders.forEach((order) => {
      const d = new Date(order.createdAt)
      if (isNaN(d.getTime())) return
      const date = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
      dailyData[date] = (dailyData[date] || 0) + (order.totalAmount || 0)
    })

    return Object.entries(dailyData)
      .map(([date, revenue]) => ({ date, revenue }))
      .slice(-14)
  }

  // Top Products (for Bar Chart)
  const getTopProducts = () => {
    const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {}

    paidOrders.forEach((order) => {
      const items = Array.isArray(order.items) ? order.items : []
      items.forEach((item: any) => {
        const name = item.name ?? 'Unknown'
        if (!productSales[name]) productSales[name] = { name, quantity: 0, revenue: 0 }
        productSales[name].quantity += item.quantity || 0
        productSales[name].revenue += (item.price || 0) * (item.quantity || 0)
      })
    })

    return Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 10)
  }

  // Order Status Distribution (for Pie Chart)
  const getOrderStatusData = () => [
    { name: 'Lunas', value: stats.paidOrders, color: '#10b981' },
    { name: 'Menunggu', value: stats.waitingOrders, color: '#f59e0b' },
    { name: 'Dibatalkan', value: stats.cancelledOrders, color: '#ef4444' },
  ]

  // Custom label renderer dengan safe check
  const renderPieLabel = ({ name, percent }: any) => {
    // Validasi percent adalah number dan tidak NaN
    const percentValue = typeof percent === 'number' && !isNaN(percent) ? percent : 0
    const displayPercent = (percentValue * 100).toFixed(0)
    return `${name}: ${displayPercent}%`
  }

  const dailyRevenueData = getDailyRevenueData()
  const topProductsData = getTopProducts()
  const orderStatusData = getOrderStatusData()

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navigation */}
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
          {/* Date Range Filter */}
          <div className="bg-white rounded-lg p-4 shadow flex items-center gap-4">
            <span className="font-medium text-gray-700">Periode:</span>
            {['7d', '30d', '90d', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range as any)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  dateRange === range ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {range === '7d' ? '7 Hari' : range === '30d' ? '30 Hari' : range === '90d' ? '90 Hari' : 'Semua'}
              </button>
            ))}
          </div>

          {/* Stats Cards */}
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

          {loading ? (
            <p className="text-center text-gray-500 py-12">⏳ Memuat data...</p>
          ) : (
            <>
              {/* Revenue Line Chart */}
              <div className="bg-white rounded-lg p-6 shadow">
                <h2 className="text-xl font-bold mb-4">📈 Pendapatan Harian (14 Hari Terakhir)</h2>
                {dailyRevenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => formatRupiah(value)} />
                      <LegendWrapper />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Pendapatan" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-12">Belum ada data pendapatan</p>
                )}
              </div>

              {/* Top Products & Order Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white rounded-lg p-6 shadow">
                  <h2 className="text-xl font-bold mb-4">🏆 Produk Terlaris (Top 10)</h2>
                  {topProductsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={topProductsData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}k`} />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip formatter={(value: number) => formatRupiah(value)} />
                        <LegendWrapper />
                        <Bar dataKey="revenue" fill="#3b82f6" name="Pendapatan" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-500 py-12">Belum ada data produk</p>
                  )}
                </div>

                {/* Order Status */}
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
                          label={renderPieLabel}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {orderStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
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

              {/* Product Details Table */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold">📦 Detail Produk Terlaris</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produk
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Terjual
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pendapatan
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {topProductsData.length > 0 ? (
                        topProductsData.map((product, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
                                  {index + 1}
                                </div>
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {product.quantity} unit
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              {formatRupiah(product.revenue)}
                            </td>
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
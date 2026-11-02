
import { useEffect, useState } from 'react'
import { Download, TrendingUp, ShoppingCart, Receipt } from 'lucide-react'
import api from '../services/api'
import Loading from '../components/Loading'

function Reports() {
  const [sales, setSales] = useState([])
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError('')

      const params = {}

      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate

      const [salesResponse, purchasesResponse] = await Promise.all([
        api.get('/reports/sales/', { params }),
        api.get('/reports/purchases/', { params }),
      ])

      setSales(Array.isArray(salesResponse.data) ? salesResponse.data : [])
      setPurchases(
        Array.isArray(purchasesResponse.data)
          ? purchasesResponse.data
          : []
      )
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to load reports. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const totalRevenue = sales.reduce(
    (total, sale) => total + Number(sale.total || 0),
    0
  )

  const totalPurchases = purchases.reduce(
    (total, purchase) => total + Number(purchase.total || 0),
    0
  )

  const exportCSV = (data, filename, headers) => {
    if (!data.length) {
      alert('No data available to export.')
      return
    }

    const rows = [
      headers,
      ...data.map((item) =>
        headers.map((header) => item[header.key] ?? '')
      ),
    ]

    const csv = rows
      .map((row) =>
        row.map((value) =>
          `"${String(value).replace(/"/g, '""')}"`
        ).join(',')
      )
      .join('\n')

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = filename
    link.click()

    URL.revokeObjectURL(url)
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Reports
        </h1>
        <p className="text-gray-500 mt-1">
          Analyze sales and purchase performance.
        </p>
      </div>

      {/* Date Filters */}
      <div className="bg-white p-5 rounded-xl shadow-sm border flex flex-wrap items-end gap-4">

        <div>
          <label className="block text-sm font-medium mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        <button
          onClick={fetchReports}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          Apply Filters
        </button>

        <button
          onClick={() => {
            setStartDate('')
            setEndDate('')
            setTimeout(fetchReports, 0)
          }}
          className="border px-5 py-2 rounded-lg hover:bg-gray-50"
        >
          Reset
        </button>

      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex justify-between">
            <p className="text-gray-500">Total Revenue</p>
            <TrendingUp className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mt-3 text-green-600">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex justify-between">
            <p className="text-gray-500">Total Purchases</p>
            <ShoppingCart className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold mt-3 text-blue-600">
            ₹{totalPurchases.toLocaleString('en-IN')}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex justify-between">
            <p className="text-gray-500">Sales Orders</p>
            <Receipt className="text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold mt-3">
            {sales.length}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex justify-between">
            <p className="text-gray-500">Purchase Orders</p>
            <ShoppingCart className="text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold mt-3">
            {purchases.length}
          </h2>
        </div>

      </div>

      {/* Sales Report */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

        <div className="p-5 flex justify-between items-center border-b">
          <div>
            <h2 className="font-bold text-lg">Sales Report</h2>
            <p className="text-sm text-gray-500">
              Customer sales transactions
            </p>
          </div>

          <button
            onClick={() =>
              exportCSV(
                sales,
                'sales-report.csv',
                [
                  { key: 'invoice_number', label: 'Invoice Number' },
                  { key: 'customer_name', label: 'Customer' },
                  { key: 'sale_date', label: 'Sale Date' },
                  { key: 'created_by', label: 'Created By' },
                  { key: 'total', label: 'Total' },
                ]
              )
            }
            className="flex items-center gap-2 text-blue-600 border border-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4">Invoice</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Sale Date</th>
                <th className="p-4">Created By</th>
                <th className="p-4">Total</th>
              </tr>
            </thead>

            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-t">
                  <td className="p-4">{sale.invoice_number}</td>
                  <td className="p-4">
                    {sale.customer_name || 'Walk-in Customer'}
                  </td>
                  <td className="p-4">{sale.sale_date}</td>
                  <td className="p-4">{sale.created_by}</td>
                  <td className="p-4 font-medium">
                    ₹{Number(sale.total).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}

              {sales.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    No sales records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Report */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

        <div className="p-5 flex justify-between items-center border-b">
          <div>
            <h2 className="font-bold text-lg">Purchase Report</h2>
            <p className="text-sm text-gray-500">
              Supplier purchase transactions
            </p>
          </div>

          <button
            onClick={() =>
              exportCSV(
                purchases,
                'purchase-report.csv',
                [
                  { key: 'invoice_number', label: 'Invoice Number' },
                  { key: 'supplier', label: 'Supplier' },
                  { key: 'purchase_date', label: 'Purchase Date' },
                  { key: 'created_by', label: 'Created By' },
                  { key: 'total', label: 'Total' },
                ]
              )
            }
            className="flex items-center gap-2 text-blue-600 border border-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4">Invoice</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Purchase Date</th>
                <th className="p-4">Created By</th>
                <th className="p-4">Total</th>
              </tr>
            </thead>

            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="border-t">
                  <td className="p-4">{purchase.invoice_number}</td>
                  <td className="p-4">{purchase.supplier}</td>
                  <td className="p-4">{purchase.purchase_date}</td>
                  <td className="p-4">{purchase.created_by}</td>
                  <td className="p-4 font-medium">
                    ₹{Number(purchase.total).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}

              {purchases.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    No purchase records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default Reports

import {
  useEffect,
  useState,
} from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import api from '../services/api'


function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const chartData = (() => {
    const sales = data?.sales_trend || []
    const purchases = data?.purchase_trend || []

    const dates = [
      ...new Set([
        ...sales.map((item) => item.date),
        ...purchases.map((item) => item.date),
      ]),
    ].sort()

    return dates.map((date) => ({
      date,
      sales:
        Number(
          sales.find(
            (item) => item.date === date
          )?.total || 0
        ),

      purchases:
        Number(
          purchases.find(
            (item) => item.date === date
          )?.total || 0
        ),
    }))
  })()

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(
          '/reports/dashboard/'
        )

        setData(response.data)
      } catch (err) {
        console.error(err)

        if (err.response?.status === 401) {
          setError(
            'Your session has expired. Please login again.'
          )
        } else {
          setError(
            'Unable to load dashboard data.'
          )
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            Dashboard
          </h2>
        </div>

        <div className="flex items-center justify-center rounded-xl bg-white p-12 shadow-sm">
          <p className="text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            Dashboard
          </h2>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">
          Dashboard
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Overview of your inventory and business activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Products
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-800">
            {data?.total_products ?? 0}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Stock
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-800">
            {data?.total_stock ?? 0}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Low Stock
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {data?.low_stock_count ?? 0}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Revenue
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            ₹{data?.total_sales ?? '0.00'}
          </p>
        </div>

      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">
            Purchase Summary
          </h3>

          <p className="mt-4 text-3xl font-bold text-gray-800">
            ₹{data?.total_purchases ?? '0.00'}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Total received purchases
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">

          <div className="mb-5">
            <h3 className="text-lg font-semibold text-gray-800">
              Sales vs Purchases
            </h3>

            <p className="text-sm text-gray-500">
              Daily business activity
            </p>
          </div>

          <div className="h-80 w-full">

            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">

                <LineChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 10,
                  }}
                >

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="date" />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="sales"
                    name="Sales"
                    stroke="#2563eb"
                    strokeWidth={3}
                    activeDot={{ r: 6 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="purchases"
                    name="Purchases"
                    stroke="#16a34a"
                    strokeWidth={3}
                  />

                </LineChart>

              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No sales or purchase data available.
              </div>
            )}

          </div>
          
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
  <div className="mb-5">
    <h3 className="text-lg font-semibold text-gray-800">
      Inventory Overview
    </h3>

    <p className="text-sm text-gray-500">
      Current stock health
    </p>
  </div>

  <div className="h-72 flex items-center justify-center">

    <div className="text-center">
      <p className="text-5xl font-bold text-gray-800">
        {data?.total_stock ?? 0}
      </p>

      <p className="mt-2 text-gray-500">
        Total Units in Stock
      </p>

      <p className="mt-4 text-sm text-red-600">
        {data?.low_stock_count ?? 0} products need attention
      </p>
    </div>

  </div>
</div>

        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">
            Estimated Profit
          </h3>

          <p className="mt-4 text-3xl font-bold text-green-600">
            ₹{data?.total_profit ?? '0.00'}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Sales minus purchases
          </p>
        </div>

      </div>

      <div className="mt-6 rounded-xl border border-gray-100 bg-white shadow-sm">

        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Recent Inventory Transactions
          </h3>
        </div>

        <div className="overflow-x-auto">

          {data?.recent_transactions?.length ? (
            <table className="min-w-full text-sm">

              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">
                    Product
                  </th>

                  <th className="px-5 py-3 text-left font-semibold text-gray-600">
                    SKU
                  </th>

                  <th className="px-5 py-3 text-left font-semibold text-gray-600">
                    Type
                  </th>

                  <th className="px-5 py-3 text-left font-semibold text-gray-600">
                    Quantity
                  </th>

                  <th className="px-5 py-3 text-left font-semibold text-gray-600">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {data.recent_transactions.map(
                  (transaction) => (
                    <tr key={transaction.id}>

                      <td className="px-5 py-3 text-gray-800">
                        {transaction.product__name}
                      </td>

                      <td className="px-5 py-3 text-gray-600">
                        {transaction.product__sku}
                      </td>

                      <td className="px-5 py-3">
                        <span
                          className={
                            transaction.transaction_type === 'IN'
                              ? 'rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700'
                              : 'rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700'
                          }
                        >
                          {transaction.transaction_type}
                        </span>
                      </td>

                      <td className="px-5 py-3 text-gray-800">
                        {transaction.quantity}
                      </td>

                      <td className="px-5 py-3 text-gray-600">
                        {new Date(
                          transaction.created_at
                        ).toLocaleString('en-IN')}
                      </td>

                    </tr>
                  )
                )}

              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No inventory transactions yet.
            </div>
          )}

        </div>
      </div>

    </div>
  )
}

export default Dashboard

import { useEffect, useState } from 'react'
import { Search, Package, AlertTriangle, Boxes } from 'lucide-react'
import api from '../services/api'
import Loading from '../components/Loading'

function Inventory() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchInventory = async () => {
    try {
      const response = await api.get('/products/', {
        params: {
          search,
          ordering: 'name',
        },
      })

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || []

      setProducts(data)
      setError('')
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Failed to load inventory.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [search])

  const lowStockProducts = products.filter(
    (product) =>
      Number(product.current_stock) <= Number(product.minimum_stock)
  )

  const displayedProducts = products.filter((product) => {
    if (filter === 'LOW') {
      return Number(product.current_stock) <= Number(product.minimum_stock)
    }

    if (filter === 'IN_STOCK') {
      return Number(product.current_stock) > Number(product.minimum_stock)
    }

    return true
  })

  const totalStock = products.reduce(
    (total, product) => total + Number(product.current_stock || 0),
    0
  )

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
        <p className="text-gray-500 mt-1">
          Monitor product stock levels and inventory availability.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Inventory Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Products</p>
              <h2 className="text-2xl font-bold mt-2">
                {products.length}
              </h2>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Package className="text-blue-600" size={25} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Stock Units</p>
              <h2 className="text-2xl font-bold mt-2">{totalStock}</h2>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <Boxes className="text-purple-600" size={25} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Low Stock Products</p>
              <h2 className="text-2xl font-bold mt-2 text-red-600">
                {lowStockProducts.length}
              </h2>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="text-red-600" size={25} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-3 text-gray-400"
            size={20}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product name or SKU..."
            className="w-full border rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg px-4 py-3"
        >
          <option value="ALL">All Products</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="LOW">Low Stock</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Current Stock</th>
              <th className="p-4">Minimum Stock</th>
              <th className="p-4">Stock Status</th>
            </tr>
          </thead>

          <tbody>
            {displayedProducts.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="p-8 text-center text-gray-500"
                >
                  No inventory records found.
                </td>
              </tr>
            ) : (
              displayedProducts.map((product) => {
                const isLow =
                  Number(product.current_stock) <=
                  Number(product.minimum_stock)

                return (
                  <tr key={product.id} className="border-t">
                    <td className="p-4 font-medium text-gray-800">
                      {product.name}
                    </td>

                    <td className="p-4 text-gray-600">
                      {product.sku}
                    </td>

                    <td className="p-4 font-semibold">
                      {product.current_stock}
                    </td>

                    <td className="p-4">
                      {product.minimum_stock}
                    </td>

                    <td className="p-4">
                      {isLow ? (
                        <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm">
                          Low Stock
                        </span>
                      ) : (
                        <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                          In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Inventory

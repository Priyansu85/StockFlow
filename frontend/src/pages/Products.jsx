import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from 'lucide-react'

import api from '../services/api'
import Loading from '../components/Loading'

function Products() {
  const { user } = useAuth()

  const isAdmin = user?.role === 'ADMIN'
  const isManager = user?.role === 'MANAGER'
  const canManage = isAdmin || isManager

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [ordering, setOrdering] = useState('name')
  const [page, setPage] = useState(1)

  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const [formData, setFormData] = useState({
    category: '',
    name: '',
    sku: '',
    description: '',
    purchase_price: '',
    selling_price: '',
    current_stock: 0,
    minimum_stock: 10,
    is_active: true,
  })

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/products/', {
        params: {
          search: search || undefined,
          ordering,
          page,
        },
      })

      setProducts(response.data.results || [])
      setTotalCount(response.data.count || 0)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Failed to load products.'
      )
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/')

      setCategories(response.data.results || response.data)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [search, ordering, page])

  useEffect(() => {
    fetchCategories()
  }, [])

  const totalPages = Math.ceil(totalCount / pageSize)

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleOrdering = (e) => {
    setOrdering(e.target.value)
    setPage(1)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const openAddForm = () => {
    setError('')

    setFormData({
      category: '',
      name: '',
      sku: '',
      description: '',
      purchase_price: '',
      selling_price: '',
      current_stock: 0,
      minimum_stock: 10,
      is_active: true,
    })

    setShowForm(true)
  }

  const closeForm = () => {
    if (!saving) {
      setShowForm(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')

      await api.post('/products/', {
        category: Number(formData.category),
        name: formData.name,
        sku: formData.sku,
        description: formData.description,
        purchase_price: Number(formData.purchase_price),
        selling_price: Number(formData.selling_price),
        current_stock: Number(formData.current_stock),
        minimum_stock: Number(formData.minimum_stock),
        is_active: formData.is_active,
      })

      setShowForm(false)

      setFormData({
        category: '',
        name: '',
        sku: '',
        description: '',
        purchase_price: '',
        selling_price: '',
        current_stock: 0,
        minimum_stock: 10,
        is_active: true,
      })

      await fetchProducts()
    } catch (err) {
      const apiError = err.response?.data

      if (apiError && typeof apiError === 'object') {
        const messages = Object.entries(apiError)
          .map(([field, value]) => {
            const message = Array.isArray(value)
              ? value.join(', ')
              : String(value)

            return `${field}: ${message}`
          })
          .join(' | ')

        setError(messages || 'Failed to create product.')
      } else {
        setError(
          apiError?.detail ||
          'Failed to create product.'
        )
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Products
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your inventory products.
          </p>
        </div>

        {canManage && (
          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Product
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Search + Sorting */}
      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">

        <div className="relative w-full md:max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search products or SKU..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <select
          value={ordering}
          onChange={handleOrdering}
          className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="name">Name A-Z</option>
          <option value="-name">Name Z-A</option>
          <option value="current_stock">Stock Low-High</option>
          <option value="-current_stock">Stock High-Low</option>
          <option value="purchase_price">
            Purchase Price Low-High
          </option>
          <option value="-purchase_price">
            Purchase Price High-Low
          </option>
          <option value="selling_price">
            Selling Price Low-High
          </option>
          <option value="-selling_price">
            Selling Price High-Low
          </option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Product
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  SKU
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Category
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Purchase Price
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Selling Price
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Stock
                </th>

                {canManage && (
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {products.length > 0 ? (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50"
                  >
                    {/* Product */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">
                        {product.name}
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.sku}
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.category_name || product.category}
                    </td>

                    {/* Purchase Price */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ₹{product.purchase_price}
                    </td>

                    {/* Selling Price */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ₹{product.selling_price}
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4">
                      <span
                        className={
                          product.is_low_stock
                            ? 'font-medium text-red-600'
                            : 'font-medium text-green-600'
                        }
                      >
                        {product.current_stock}
                      </span>
                    </td>

                    {/* Actions */}
                    {canManage && (
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
                          >
                            Edit
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(product)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={canManage ? 7 : 6}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Showing{' '}
            {totalCount === 0
              ? 0
              : (page - 1) * pageSize + 1}
            {' '}to{' '}
            {Math.min(page * pageSize, totalCount)}
            {' '}of {totalCount} products
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setPage((prev) => Math.max(prev - 1, 1))
              }
              disabled={page === 1}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <span className="px-3 text-sm font-medium text-gray-700">
              Page {page} of {Math.max(totalPages, 1)}
            </span>

            <button
              onClick={() =>
                setPage((prev) =>
                  prev < totalPages ? prev + 1 : prev
                )
              }
              disabled={
                page >= totalPages ||
                totalPages === 0
              }
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Add Product
                </h2>

                <p className="text-sm text-gray-500">
                  Enter the product details below.
                </p>
              </div>

              <button
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* Product Name */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Product Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter product name"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    SKU
                  </label>

                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter SKU"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Category
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Purchase Price */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Purchase Price
                  </label>

                  <input
                    type="number"
                    name="purchase_price"
                    value={formData.purchase_price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="0.00"
                  />
                </div>

                {/* Selling Price */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Selling Price
                  </label>

                  <input
                    type="number"
                    name="selling_price"
                    value={formData.selling_price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="0.00"
                  />
                </div>

                {/* Current Stock */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Current Stock
                  </label>

                  <input
                    type="number"
                    name="current_stock"
                    value={formData.current_stock}
                    onChange={handleChange}
                    min="0"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Minimum Stock */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Minimum Stock
                  </label>

                  <input
                    type="number"
                    name="minimum_stock"
                    value={formData.minimum_stock}
                    onChange={handleChange}
                    min="0"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter product description"
                />
              </div>

              {/* Active */}
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Product is active
              </label>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
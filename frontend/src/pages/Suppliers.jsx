
import { useEffect, useState } from 'react'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'

import api from '../services/api'
import Loading from '../components/Loading'
import { useAuth } from '../context/AuthContext'

function Suppliers() {
  const { user } = useAuth()

  const isAdmin = user?.role === 'ADMIN'
  const canManage = isAdmin || user?.role === 'MANAGER'

  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)

  const emptyForm = {
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    is_active: true,
  }

  const [formData, setFormData] = useState(emptyForm)

  const fetchSuppliers = async () => {
    try {
      setError('')

      const response = await api.get('/suppliers/', {
        params: {
          search: search || undefined,
          ordering: 'name',
        },
      })

      const data = response.data.results ?? response.data
      setSuppliers(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Failed to load suppliers.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [search])

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const openAddForm = () => {
    setError('')
    setEditingSupplier(null)
    setFormData({ ...emptyForm })
    setShowForm(true)
  }

  const openEditForm = (supplier) => {
    setError('')
    setEditingSupplier(supplier)

    setFormData({
      name: supplier.name || '',
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      is_active: supplier.is_active ?? true,
    })

    setShowForm(true)
  }

  const closeForm = () => {
    if (saving) return

    setShowForm(false)
    setEditingSupplier(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')

      const payload = {
        ...formData,
        name: formData.name.trim(),
        contact_person: formData.contact_person.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
      }

      if (editingSupplier) {
        await api.patch(
          `/suppliers/${editingSupplier.id}/`,
          payload
        )
      } else {
        await api.post('/suppliers/', payload)
      }

      setShowForm(false)
      setEditingSupplier(null)
      setFormData({ ...emptyForm })

      await fetchSuppliers()
    } catch (err) {
      const data = err.response?.data

      if (data && typeof data === 'object') {
        const messages = Object.entries(data)
          .map(([field, value]) => {
            const message = Array.isArray(value)
              ? value.join(', ')
              : String(value)

            return `${field}: ${message}`
          })
          .join(' | ')

        setError(messages || 'Unable to save supplier.')
      } else {
        setError('Unable to save supplier.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (supplier) => {
    const confirmed = window.confirm(
      `Delete supplier "${supplier.name}"?`
    )

    if (!confirmed) return

    try {
      setError('')
      await api.delete(`/suppliers/${supplier.id}/`)
      await fetchSuppliers()
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to delete supplier. It may be linked to purchases.'
      )
    }
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Suppliers
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage supplier contact information.
          </p>
        </div>

        {canManage && (
          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Supplier
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suppliers..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Supplier Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                Supplier
              </th>
              <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                Contact Person
              </th>
              <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                Phone
              </th>
              <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                Email
              </th>
              <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                Status
              </th>
              {canManage && (
                <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {suppliers.length > 0 ? (
              suppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-800">
                      {supplier.name}
                    </div>
                    <div className="mt-1 max-w-xs truncate text-xs text-gray-500">
                      {supplier.address || 'No address'}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {supplier.contact_person || '—'}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {supplier.phone}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {supplier.email || '—'}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={
                        supplier.is_active
                          ? 'rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700'
                          : 'rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600'
                      }
                    >
                      {supplier.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {canManage && (
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditForm(supplier)}
                          title="Edit supplier"
                          className="rounded-lg border border-blue-200 p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil size={16} />
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(supplier)}
                            title="Delete supplier"
                            className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
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
                  colSpan={canManage ? 6 : 5}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  No suppliers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
                </h2>
                <p className="text-sm text-gray-500">
                  Enter supplier details below.
                </p>
              </div>

              <button
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Supplier Name *
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={150}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="Supplier name"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Contact Person
                  </label>
                  <input
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="Contact person"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Phone *
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    maxLength={20}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="supplier@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="Supplier address"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Supplier is active
              </label>

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
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving
                    ? 'Saving...'
                    : editingSupplier
                      ? 'Update Supplier'
                      : 'Create Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Suppliers

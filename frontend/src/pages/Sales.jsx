
import { useEffect, useState } from 'react'
import {
    Search,
    Plus,
    ShoppingCart,
    Trash2,
    X,
    CheckCircle,
} from 'lucide-react'
import api from '../services/api'
import Loading from '../components/Loading'
import { useAuth } from '../context/AuthContext'

function Sales() {
    const { user } = useAuth()
    const canManage = ['ADMIN', 'MANAGER'].includes(user?.role)

    const [sales, setSales] = useState([])
    const [products, setProducts] = useState([])
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        invoice_number: '',
        sale_date: new Date().toISOString().split('T')[0],
        notes: '',
        items: [{ product: '', quantity: 1, unit_price: '' }],
    })

    const getResults = (response) =>
        Array.isArray(response.data)
            ? response.data
            : response.data.results || []

    const fetchSales = async () => {
        try {
            const response = await api.get('/sales/', {
                params: {
                    search,
                    status: status || undefined,
                    ordering: '-sale_date',
                },
            })

            setSales(getResults(response))
            setError('')
        } catch (err) {
            setError('Failed to load sales records.')
        } finally {
            setLoading(false)
        }
    }

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products/')
            setProducts(getResults(response))
        } catch (err) {
            setError('Failed to load products.')
        }
    }

    useEffect(() => {
        fetchSales()
    }, [search, status])

    useEffect(() => {
        fetchProducts()
    }, [])

    const resetForm = () => {
        setFormData({
            invoice_number: '',
            sale_date: new Date().toISOString().split('T')[0],
            notes: '',
            items: [{ product: '', quantity: 1, unit_price: '' }],
        })
    }

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...formData.items]
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value,
        }

        setFormData({ ...formData, items: updatedItems })
    }

    const handleProductChange = (index, productId) => {
        const selectedProduct = products.find(
            (product) => String(product.id) === String(productId)
        )

        const updatedItems = [...formData.items]

        updatedItems[index] = {
            ...updatedItems[index],
            product: productId,
            unit_price: selectedProduct
                ? selectedProduct.selling_price
                : '',
        }

        setFormData({ ...formData, items: updatedItems })
    }

    const addItem = () => {
        setFormData({
            ...formData,
            items: [
                ...formData.items,
                { product: '', quantity: 1, unit_price: '' },
            ],
        })
    }

    const removeItem = (index) => {
        if (formData.items.length === 1) return

        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index),
        })
    }

    const totalAmount = formData.items.reduce(
        (total, item) =>
            total +
            Number(item.quantity || 0) *
            Number(item.unit_price || 0),
        0
    )


    const totalSales = sales.length

    const completedSales = sales.filter(
        (sale) => sale.status === 'COMPLETED'
    ).length

    const pendingSales = sales.filter(
        (sale) => sale.status === 'PENDING'
    ).length


    const totalRevenue = sales.reduce(
        (total, sale) => {
            if (sale.status !== 'COMPLETED') return total

            const saleTotal = (sale.items || []).reduce(
                (itemTotal, item) =>
                    itemTotal + Number(item.line_total || 0),
                0
            )

            return total + saleTotal
        },
        0
    )



    const handleSubmit = async (e) => {
        e.preventDefault()

        if (
            formData.items.some(
                (item) =>
                    !item.product ||
                    Number(item.quantity) <= 0 ||
                    item.unit_price === '' ||
                    Number(item.unit_price) < 0
            )
        ) {
            alert('Please enter valid product, quantity and price for every item.')
            return
        }

        const payload = {
            invoice_number: formData.invoice_number,
            sale_date: formData.sale_date,
            notes: formData.notes,
            items: formData.items.map((item) => ({
                product: Number(item.product),
                quantity: Number(item.quantity),
                unit_price: Number(item.unit_price),
            })),
        }

        try {
            setSaving(true)

            await api.post('/sales/', payload)

            alert('Sale created successfully!')
            setShowForm(false)
            resetForm()
            fetchSales()
        } catch (err) {
            const data = err.response?.data
            const message =
                data?.detail ||
                data?.invoice_number?.[0] ||
                'Failed to create sale. Please check the entered details.'

            alert(message)
        } finally {
            setSaving(false)
        }
    }

    const handleComplete = async (sale) => {
        if (
            !window.confirm(
                `Complete sale ${sale.invoice_number}? This will deduct stock.`
            )
        ) {
            return
        }

        try {
            await api.post(`/sales/${sale.id}/complete/`)
            alert('Sale completed successfully. Inventory has been updated.')
            fetchSales()
        } catch (err) {
            alert(
                err.response?.data?.detail ||
                'Unable to complete sale. Check available stock.'
            )
        }
    }

    if (loading) return <Loading />

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sales</h1>
                    <p className="text-gray-500 mt-1">
                        Manage customer sales and outgoing stock.
                    </p>
                </div>

                {canManage && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        New Sale
                    </button>
                )}
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-xl shadow-sm border">
                    <p className="text-gray-500 text-sm">Total Sales</p>
                    <h2 className="text-2xl font-bold mt-2">{totalSales}</h2>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border">
                    <p className="text-gray-500 text-sm">Completed Sales</p>
                    <h2 className="text-2xl font-bold mt-2 text-green-600">
                        {completedSales}
                    </h2>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border">
                    <p className="text-gray-500 text-sm">Pending Sales</p>
                    <h2 className="text-2xl font-bold mt-2 text-yellow-600">
                        {pendingSales}
                    </h2>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border">
                    <p className="text-gray-500 text-sm">Total Revenue</p>
                    <h2 className="text-2xl font-bold mt-2 text-blue-600">
                        ₹{totalRevenue.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </h2>
                </div>
            </div>


            {error && (
                <p className="bg-red-50 text-red-600 p-3 rounded-lg">
                    {error}
                </p>
            )}

            <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search
                        className="absolute left-3 top-3 text-gray-400"
                        size={20}
                    />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search invoice..."
                        className="w-full border rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border rounded-lg px-4 py-3"
                >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4">Invoice</th>
                            <th className="p-4">Sale Date</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {sales.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-500">
                                    No sales found.
                                </td>
                            </tr>
                        ) : (
                            sales.map((sale) => (
                                <tr key={sale.id} className="border-t">
                                    <td className="p-4 font-medium">
                                        {sale.invoice_number}
                                    </td>
                                    <td className="p-4">{sale.sale_date}</td>
                                    <td className="p-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm ${sale.status === 'COMPLETED'
                                                ? 'bg-green-50 text-green-700'
                                                : sale.status === 'CANCELLED'
                                                    ? 'bg-red-50 text-red-700'
                                                    : 'bg-yellow-50 text-yellow-700'
                                                }`}
                                        >
                                            {sale.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {canManage && sale.status === 'PENDING' ? (
                                            <button
                                                onClick={() => handleComplete(sale)}
                                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                            >
                                                <CheckCircle size={17} />
                                                Complete
                                            </button>
                                        ) : sale.status === 'COMPLETED' ? (
                                            <span className="text-green-600">Completed</span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-5 border-b">
                            <h2 className="text-xl font-bold">Create New Sale</h2>
                            <button onClick={() => setShowForm(false)}>
                                <X size={22} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Invoice Number
                                    </label>
                                    <input
                                        required
                                        value={formData.invoice_number}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                invoice_number: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. SALE-001"
                                        className="w-full border rounded-lg p-3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Sale Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.sale_date}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                sale_date: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg p-3"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold">Sale Items</h3>
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="text-blue-600 flex items-center gap-1"
                                    >
                                        <Plus size={17} />
                                        Add Item
                                    </button>
                                </div>

                                {formData.items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3 items-end"
                                    >
                                        <div className="md:col-span-5">
                                            <label className="block text-sm mb-1">Product</label>
                                            <select
                                                required
                                                value={item.product}
                                                onChange={(e) =>
                                                    handleProductChange(index, e.target.value)
                                                }
                                                className="w-full border rounded-lg p-3"
                                            >
                                                <option value="">Select Product</option>
                                                {products.map((product) => (
                                                    <option key={product.id} value={product.id}>
                                                        {product.name} (Stock: {product.current_stock})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm mb-1">Quantity</label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    handleItemChange(index, 'quantity', e.target.value)
                                                }
                                                className="w-full border rounded-lg p-3"
                                            />
                                        </div>

                                        <div className="md:col-span-3">
                                            <label className="block text-sm mb-1">
                                                Selling Price
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                required
                                                value={item.unit_price}
                                                onChange={(e) =>
                                                    handleItemChange(index, 'unit_price', e.target.value)
                                                }
                                                className="w-full border rounded-lg p-3"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                disabled={formData.items.length === 1}
                                                className="w-full border rounded-lg p-3 text-red-600 disabled:opacity-30"
                                            >
                                                <Trash2 size={18} className="mx-auto" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Notes
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({ ...formData, notes: e.target.value })
                                    }
                                    rows="3"
                                    placeholder="Optional sale notes..."
                                    className="w-full border rounded-lg p-3"
                                />
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                                <span className="font-semibold">Estimated Total</span>
                                <span className="text-xl font-bold text-blue-600">
                                    ₹{totalAmount.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false)
                                        resetForm()
                                    }}
                                    className="border px-5 py-2 rounded-lg"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Create Sale'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Sales

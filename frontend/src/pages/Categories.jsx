
import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import api from '../services/api'
import Loading from '../components/Loading'
import { useAuth } from '../context/AuthContext'

function Categories() {
    const { user } = useAuth()
    const canManage = ['ADMIN', 'MANAGER'].includes(user?.role)

    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [saving, setSaving] = useState(false)

    const fetchCategories = async () => {
        try {
            setLoading(true)
            setError('')
            const response = await api.get('/categories/')
            const data = response.data.results ?? response.data
            setCategories(Array.isArray(data) ? data : [])
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                'Failed to load categories.'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setSaving(true)
            setError('')

            await api.post('/categories/', {
                name: name.trim(),
                description: description.trim(),
            })

            setName('')
            setDescription('')
            setShowForm(false)
            await fetchCategories()
        } catch (err) {
            const data = err.response?.data
            setError(
                data?.name?.join?.(', ') ||
                data?.detail ||
                'Could not create category. Check your permissions and input.'
            )
        } finally {
            setSaving(false)
        }
    }

    const filteredCategories = categories.filter((category) =>
        `${category.name} ${category.description || ''}`
            .toLowerCase()
            .includes(search.toLowerCase())
    )

    if (loading) return <Loading />

    return (
        <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Categories
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Organize products by category.
                    </p>
                </div>

                {canManage && (
                    <button
                        onClick={() => {
                            setError('')
                            setShowForm(!showForm)
                        }}
                        className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        Add Category
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="mb-6 space-y-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Category Name
                        </label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            maxLength={100}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                            placeholder="e.g. Electronics"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                            placeholder="Optional category description"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            {saving ? 'Saving...' : 'Save Category'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            disabled={saving}
                            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="mb-5 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="relative max-w-md">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search categories..."
                        className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
                <table className="w-full text-left">
                    <thead className="border-b bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                                Category
                            </th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                                Description
                            </th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                                Status
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {filteredCategories.length ? (
                            filteredCategories.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {category.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {category.description || '—'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={
                                                category.is_active
                                                    ? 'rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700'
                                                    : 'rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600'
                                            }
                                        >
                                            {category.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="px-6 py-10 text-center text-gray-500"
                                >
                                    No categories found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Categories

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'

export default function ProductForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    name_en: '',
    name_bn: '',
    description_en: '',
    description_bn: '',
    price: '',
    category: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    if (isEdit) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await axios.get(`/api/products/all`)
      const product = response.data.find(p => p._id === id)
      if (product) {
        setFormData({
          name_en: product.name.en,
          name_bn: product.name.bn,
          description_en: product.description.en,
          description_bn: product.description.bn,
          price: product.price,
          category: product.category
        })
      }
    } catch (err) {
      setError('Failed to load product')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const token = localStorage.getItem('token')
    const productData = {
      name: { en: formData.name_en, bn: formData.name_bn },
      description: { en: formData.description_en, bn: formData.description_bn },
      price: Number(formData.price),
      category: formData.category
    }

    try {
      if (isEdit) {
        await axios.put(`/api/products/${id}`, productData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post('/api/products/add', productData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      navigate('/products')
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name (English)</label>
              <input
                type="text"
                name="name_en"
                required
                value={formData.name_en}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name (বাংলা)</label>
              <input
                type="text"
                name="name_bn"
                required
                value={formData.name_bn}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Description (English)</label>
              <textarea
                name="description_en"
                required
                value={formData.description_en}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description (বাংলা)</label>
              <textarea
                name="description_bn"
                required
                value={formData.description_bn}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price (৳)</label>
            <input
              type="number"
              name="price"
              required
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. handicraft, textile, food"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

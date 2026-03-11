import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

export default function Products() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products/all')
      setProducts(response.data)
    } catch (err) {
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return

    const token = localStorage.getItem('token')
    try {
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProducts(products.filter(p => p._id !== id))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product')
    }
  }

  const canEditDelete = (product) => {
    if (!user) return false
    return user.role === 'admin' || product.createdBy._id === user._id
  }

  if (loading) return <div className="text-center py-10">Loading products...</div>

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Products & Services</h1>
          {(user?.role === 'entrepreneur' || user?.role === 'admin') && (
            <Link
              to="/products/add"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add Product
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {products.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {product.name.en}
                  </h3>
                  <p className="text-gray-600 mb-4">{product.description.en}</p>
                  <p className="text-2xl font-bold text-green-600 mb-2">৳{product.price}</p>
                  <p className="text-sm text-gray-500">Category: {product.category}</p>
                  {product.createdBy && (
                    <p className="text-sm text-gray-500">By: {product.createdBy.name}</p>
                  )}
                  
                  {user && canEditDelete(product) && (
                    <div className="mt-4 flex gap-2">
                      <Link
                        to={`/products/edit/${product._id}`}
                        className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

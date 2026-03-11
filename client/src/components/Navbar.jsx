import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav className="bg-green-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            Rural Women Entrepreneurship
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/products" className="hover:text-green-200">
              Products
            </Link>

            {user ? (
              <>
                <Link to="/profile" className="hover:text-green-200">
                  Profile
                </Link>
                {(user.role === 'entrepreneur' || user.role === 'admin') && (
                  <Link to="/products/add" className="hover:text-green-200">
                    Add Product
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-green-700 hover:bg-green-800 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-green-200">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-green-700 hover:bg-green-800 rounded"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

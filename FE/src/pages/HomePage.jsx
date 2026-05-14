import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()

  function handleLogout() {
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Trang chủ</h1>
        <p className="text-gray-500 mb-4">Đăng nhập thành công!</p>
        <button
          onClick={handleLogout}
          className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  )
}

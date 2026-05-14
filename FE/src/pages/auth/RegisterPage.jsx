import { Link } from 'react-router-dom'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Đăng ký</h1>
        <p className="text-gray-500 mb-4">Trang đang được xây dựng.</p>
        <Link to="/dang-nhap" className="text-amber-600 hover:underline text-sm">← Quay lại đăng nhập</Link>
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { mockLogin } from '../../mocks/auth'
import { useAuth } from '../../context/AuthContext'

const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const EyeIcon = ({ open }) =>
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )

const Spinner = () => (
  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

function validate(email, password) {
  const errors = {}
  if (!email) {
    errors.email = 'Vui lòng nhập email.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Email không đúng định dạng.'
  }
  if (!password) {
    errors.password = 'Vui lòng nhập mật khẩu.'
  } else if (password.length < 6) {
    errors.password = 'Mật khẩu phải có ít nhất 6 ký tự.'
  }
  return errors
}

const inputCls = (hasError) =>
  `w-full px-4 py-2.5 rounded-xl border bg-stone-800 text-stone-200 text-sm outline-none transition-all placeholder:text-stone-500
  ${hasError
    ? 'border-red-500/70 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
    : 'border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
  }
  disabled:opacity-50 disabled:cursor-not-allowed`

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    if (serverError) setServerError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate(form.email, form.password)
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }
    setLoading(true)
    setServerError('')
    try {
      const data = await mockLogin(form.email, form.password)
      login(data.user)
      router.push('/home')
    } catch (err) {
      setServerError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20 mb-4">
            <span className="text-white"><BookOpenIcon /></span>
          </div>
          <h1 className="text-2xl font-bold text-white">TruyệnHay</h1>
          <p className="text-stone-500 text-sm mt-1">Kho truyện chữ hàng đầu Việt Nam</p>
        </div>

        {/* Card */}
        <div className="bg-stone-900 rounded-2xl border border-stone-800 px-8 py-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Đăng nhập</h2>

          {serverError && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-300 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@email.com"
                disabled={loading}
                className={inputCls(!!errors.email)}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-stone-300 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  disabled={loading}
                  className={`${inputCls(!!errors.password)} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                  tabIndex={-1}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>}
            </div>

            <div className="text-right mb-6">
              <Link href="/forgot-password" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:bg-amber-500/50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              {loading ? <><Spinner /><span>Đang đăng nhập...</span></> : 'Đăng nhập'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-stone-800" />
            <span className="text-xs text-stone-600">hoặc</span>
            <div className="flex-1 h-px bg-stone-800" />
          </div>

          <p className="text-center text-sm text-stone-500">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-amber-400 font-medium hover:text-amber-300 transition-colors">
              Đăng ký ngay
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-stone-700 mt-6">
          © 2025 TruyệnHay. Tất cả quyền được bảo lưu.
        </p>
      </div>
    </div>
  )
}

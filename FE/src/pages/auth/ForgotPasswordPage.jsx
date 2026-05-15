'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const Spinner = () => (
  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

function validate(email) {
  if (!email.trim()) return 'Vui lòng nhập email.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email không đúng định dạng.'
  return ''
}

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function handleChange(e) {
    setEmail(e.target.value)
    if (error) setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationError = validate(email)
    if (validationError) { setError(validationError); return }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSuccess(true)
    setTimeout(() => router.push('/login'), 3000)
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
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
          {!success ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">Quên mật khẩu</h2>
                <p className="text-sm text-stone-500 mt-1">
                  Nhập email của bạn, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-stone-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    disabled={loading}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-stone-800 text-stone-200 text-sm outline-none transition-all placeholder:text-stone-500
                      ${error
                        ? 'border-red-500/70 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
                        : 'border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                  {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:bg-amber-500/50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
                  {loading ? <><Spinner /><span>Đang gửi...</span></> : 'Gửi hướng dẫn'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Đã gửi email!</h3>
              <p className="text-sm text-stone-500 mb-1">
                Hướng dẫn đặt lại mật khẩu đã được gửi đến
              </p>
              <p className="text-sm font-medium text-amber-400 mb-4">{email}</p>
              <p className="text-xs text-stone-600">Đang chuyển về trang đăng nhập...</p>
            </div>
          )}

          {!success && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-stone-800" />
                <span className="text-xs text-stone-600">hoặc</span>
                <div className="flex-1 h-px bg-stone-800" />
              </div>
              <p className="text-center text-sm text-stone-500">
                Nhớ mật khẩu rồi?{' '}
                <Link href="/login" className="text-amber-400 font-medium hover:text-amber-300 transition-colors">
                  Đăng nhập
                </Link>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-stone-700 mt-6">
          © 2025 TruyệnHay. Tất cả quyền được bảo lưu.
        </p>
      </div>
    </div>
  )
}

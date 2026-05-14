const MOCK_USERS = [
  { email: 'user@example.com', password: '123456', name: 'Nguyễn Văn A' },
  { email: 'admin@truyen.vn', password: 'admin123', name: 'Admin' },
]

export function mockLogin(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = MOCK_USERS.find(
        (u) => u.email === email && u.password === password
      )
      if (user) {
        resolve({ user: { email: user.email, name: user.name } })
      } else {
        reject(new Error('Email hoặc mật khẩu không chính xác.'))
      }
    }, 1200)
  })
}

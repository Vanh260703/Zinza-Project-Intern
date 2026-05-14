import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

const USERS_PATH = path.resolve('./mocks/users/users.json')

function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'))
}

function writeUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), 'utf-8')
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => resolve(JSON.parse(body)))
  })
}

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'mock-api',
      configureServer(server) {
        server.middlewares.use('/api/mock/login', async (req, res, next) => {
          if (req.method !== 'POST') return next()
          const { email, password } = await parseBody(req)
          await new Promise((r) => setTimeout(r, 1200))
          const user = readUsers().find((u) => u.email === email && u.password === password)
          if (user) {
            send(res, 200, { user: { email: user.email, name: user.name, gender: user.gender } })
          } else {
            send(res, 401, { message: 'Email hoặc mật khẩu không chính xác.' })
          }
        })

        server.middlewares.use('/api/mock/register', async (req, res, next) => {
          if (req.method !== 'POST') return next()
          const { email, name, gender, password } = await parseBody(req)
          await new Promise((r) => setTimeout(r, 1200))
          const users = readUsers()
          if (users.find((u) => u.email === email)) {
            return send(res, 409, { message: 'Email này đã được sử dụng.' })
          }
          users.push({ email, name, gender, password })
          writeUsers(users)
          send(res, 201, { message: 'Đăng ký thành công.' })
        })
      },
    },
  ],
})

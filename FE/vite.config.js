import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

const USERS_PATH = path.resolve('./mocks/users/users.json')
const UPLOAD_DIR = path.resolve('./mocks/upload')
const STORIES_JSON_PATH = path.resolve('./mocks/stories/stories.json')

// ── Per-story chapter file cache (keyed by storyId) ──────────────────────────
const _fileCaches = {}
function getFileCache(storyId) {
  if (_fileCaches[storyId]) return _fileCaches[storyId]
  const dir = _storyDirById(storyId)
  if (!dir) return []
  _fileCaches[storyId] = fs.readdirSync(dir)
    .filter((f) => f.endsWith('.txt') && !f.startsWith('00000'))
  return _fileCaches[storyId]
}

function _storyDirById(storyId) {
  const entries = fs.readdirSync(UPLOAD_DIR)
  const folder = entries.find((e) => e.startsWith(storyId + '_'))
  return folder ? path.join(UPLOAD_DIR, folder) : null
}

function getTotalChapters(storyId) {
  const files = getFileCache(storyId)
  if (!files.length) return 0
  return parseInt(files[files.length - 1].match(/^(\d+)/)[1])
}

// Cache title cho search (lazy per story)
const _titleCaches = {}
function getTitleCache(storyId) {
  if (_titleCaches[storyId]) return _titleCaches[storyId]
  const dir = _storyDirById(storyId)
  if (!dir) return []
  _titleCaches[storyId] = getFileCache(storyId).map((f) => {
    const match = f.match(/^(\d+)_(\d+)\.txt$/)
    const firstLine = fs.readFileSync(path.join(dir, f), 'utf-8').split('\n')[0].trim()
    return { number: parseInt(match[1]), id: match[2], title: firstLine }
  })
  return _titleCaches[storyId]
}

// ── Story list from upload folder ────────────────────────────────────────────
let _storyListCache = null

function parseOverview(content, id, slug, index) {
  const get = (key) => {
    const re = new RegExp(`^${key}\\s*:\\s*(.+)$`, 'm')
    const m = content.match(re)
    return m ? m[1].trim() : ''
  }

  const ratingStr = get('Đánh giá')
  const ratingMatch = ratingStr.match(/([\d.]+)\s*⭐\s*\((\d+)/)

  const tagsStr = get('Tags')
  const tags = (!tagsStr || tagsStr === '—') ? [] : tagsStr.split(',').map((t) => t.trim())

  const genreStr = get('Thể loại')

  const descIdx = content.indexOf('Tóm tắt:')
  const description = descIdx >= 0 ? content.slice(descIdx + 'Tóm tắt:'.length).trim() : ''

  return {
    id,
    slug,
    title: get('Tên truyện'),
    type: get('Loại'),
    target: get('Đối tượng'),
    status: get('Trạng thái'),
    rating: ratingMatch ? parseFloat(ratingMatch[1]) : 0,
    ratingCount: ratingMatch ? parseInt(ratingMatch[2]) : 0,
    commentCount: parseInt(get('Bình luận')) || 0,
    nominations: parseInt(get('Đề cử')) || 0,
    author: get('Tác giả'),
    postedBy: get('Đăng bởi'),
    genres: genreStr ? [genreStr] : [],
    tags,
    description,
    poster: `/mock-assets/${id}_${slug}/00000_poster.jpg`,
    gradient: index,
  }
}

// Async init: đọc tất cả overview song song → ghi stories.json
const _initPromise = (async () => {
  const folders = (await fs.promises.readdir(UPLOAD_DIR))
    .filter((f) => /^\d+_/.test(f))
  const results = await Promise.all(
    folders.map(async (folder, index) => {
      const m = folder.match(/^(\d+)_(.+)$/)
      if (!m) return null
      const [, id, slug] = m
      const overviewPath = path.join(UPLOAD_DIR, folder, '00000_overview.txt')
      try {
        const content = await fs.promises.readFile(overviewPath, 'utf-8')
        const story = parseOverview(content, id, slug, index)
        story.totalChapters = getTotalChapters(id)
        return story
      } catch {
        return null
      }
    })
  )
  _storyListCache = results.filter(Boolean)
  await fs.promises.writeFile(STORIES_JSON_PATH, JSON.stringify(_storyListCache, null, 2), 'utf-8')
  console.log(`[mock] ✓ Khởi tạo ${_storyListCache.length} truyện → mocks/stories/stories.json`)
})()

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
function publicUser(u) {
  return { email: u.email, name: u.name, gender: u.gender, candy: u.candy ?? 0, chaptersRead: u.chaptersRead ?? 0 }
}

function getStoryDetail(storyId) {
  const story = (_storyListCache ?? []).find((s) => s.id === storyId)
  if (!story) return null
  return { ...story, views: 0, followers: 0, totalChapters: getTotalChapters(storyId) }
}

const MOCK_REVIEWS = [
  { id: 1, user: 'KiếmKhách99', avatar: null, rating: 5, date: '2024-11-20', content: 'Bộ truyện cực hay! Thế giới quan rộng lớn, nhân vật phụ được xây dựng rất tốt. Tần Mục không phải kiểu nhân vật vô địch từ đầu mà phải từng bước phấn đấu. Tác giả xây dựng bầu không khí u ám, huyền bí rất tốt. Cực kỳ recommend!' },
  { id: 2, user: 'TiênHiệpFan', avatar: null, rating: 5, date: '2024-10-15', content: 'Đây là một trong những bộ huyền huyễn hay nhất tôi từng đọc. Cách tác giả xây dựng hệ thống tu luyện và thế giới quan rất độc đáo và nhất quán. Mỗi nhân vật đều có chiều sâu riêng.' },
  { id: 3, user: 'NightReader', avatar: null, rating: 4, date: '2024-09-30', content: 'Truyện hay nhưng đầu hơi chậm, phải đến chương 50 mới thực sự cuốn. Nhưng bù lại phần sau rất đỉnh, hành trình của Tần Mục từ Tàn Lão thôn ra thế giới bên ngoài rất ấn tượng.' },
  { id: 4, user: 'HuyenHuyenFan', avatar: null, rating: 5, date: '2024-08-12', content: 'World building xuất sắc. Hệ thống bóng tối, những bí ẩn về Đại Khư và nguồn gốc của Tần Mục được dẫn dắt khéo léo xuyên suốt tác phẩm. Đây là loại truyện mà bạn đọc không thể dừng lại được.' },
]

const MOCK_COMMENTS = [
  { id: 1, user: 'LongVânHiệp', avatar: null, date: '2025-01-05', content: 'Mới đọc đến chương 150, hay quá trời! Tần Mục ở trong Tàn Lão thôn mà học được cả đống skill từ bọn lão già tàn phế :)) Tác giả thiên tài thật sự' },
  { id: 2, user: 'TruyenChê', avatar: null, date: '2025-01-03', content: 'Đọc đến chương 800 rồi, plot twist về thân thế Tần Mục ngon vãi lúa. Ai mới đọc cố gắng kiên nhẫn nhé, về sau hay hơn nhiều.' },
  { id: 3, user: 'Phantom_x', avatar: null, date: '2024-12-28', content: 'Hệ thống sức mạnh trong truyện này unique lắm. Bảy đại thần tàng, Linh Thể, Bá Thể... được giải thích rõ ràng và logic. Không như mấy truyện khác viết cho có.' },
  { id: 4, user: 'DarkReader2024', avatar: null, date: '2024-12-20', content: 'Câu mở đầu "Trời tối, đừng đi ra ngoài" đỉnh vãi. Nghe đơn giản mà chứa đựng cả một thế giới bí ẩn phía sau. Ambiance của truyện rất riêng, không lẫn vào đâu được.' },
  { id: 5, user: 'ReadingAddict', avatar: null, date: '2024-12-15', content: 'Đã hoàn thành 1844 chương. Cái kết mãn nguyện lắm, tác giả không phụ độc giả. Cảm ơn DarkHero đã dịch bộ này!' },
  { id: 6, user: 'MocLongVan', avatar: null, date: '2024-12-10', content: 'Tư bà bà và Mã gia là best supporting characters. Tụi này tàn phế hết mà vẫn ngầu hơn nhân vật chính mấy truyện khác :v' },
]

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'mock-api',
      configureServer(server) {

        /* ── Wait for async init before serving any request ── */
        server.middlewares.use(async (_req, _res, next) => {
          await _initPromise
          next()
        })

        /* ── Static mock assets (images) ── */
        server.middlewares.use('/mock-assets', (req, res, next) => {
          const filePath = path.resolve('./mocks/upload' + req.url)
          if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath).toLowerCase()
            const mime = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }
            res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' })
            fs.createReadStream(filePath).pipe(res)
          } else {
            next()
          }
        })

        /* ── Auth ── */
        server.middlewares.use('/api/mock/login', async (req, res, next) => {
          if (req.method !== 'POST') return next()
          const { email, password } = await parseBody(req)
          await new Promise((r) => setTimeout(r, 1200))
          const user = readUsers().find((u) => u.email === email && u.password === password)
          user ? send(res, 200, { user: publicUser(user) }) : send(res, 401, { message: 'Email hoặc mật khẩu không chính xác.' })
        })

        server.middlewares.use('/api/mock/register', async (req, res, next) => {
          if (req.method !== 'POST') return next()
          const { email, name, gender, password } = await parseBody(req)
          await new Promise((r) => setTimeout(r, 1200))
          const users = readUsers()
          if (users.find((u) => u.email === email)) return send(res, 409, { message: 'Email này đã được sử dụng.' })
          users.push({ email, name, gender, password, candy: 0, chaptersRead: 0 })
          writeUsers(users)
          send(res, 201, { message: 'Đăng ký thành công.' })
        })

        server.middlewares.use('/api/mock/update-profile', async (req, res, next) => {
          if (req.method !== 'PUT') return next()
          const { email, name, gender } = await parseBody(req)
          await new Promise((r) => setTimeout(r, 800))
          const users = readUsers()
          const idx = users.findIndex((u) => u.email === email)
          if (idx === -1) return send(res, 404, { message: 'Người dùng không tồn tại.' })
          users[idx].name = name
          if (gender) users[idx].gender = gender
          writeUsers(users)
          send(res, 200, { user: publicUser(users[idx]) })
        })

        server.middlewares.use('/api/mock/change-password', async (req, res, next) => {
          if (req.method !== 'PUT') return next()
          const { email, currentPassword, newPassword } = await parseBody(req)
          await new Promise((r) => setTimeout(r, 800))
          const users = readUsers()
          const idx = users.findIndex((u) => u.email === email)
          if (idx === -1) return send(res, 404, { message: 'Người dùng không tồn tại.' })
          if (users[idx].password !== currentPassword) return send(res, 400, { message: 'Mật khẩu hiện tại không đúng.' })
          users[idx].password = newPassword
          writeUsers(users)
          send(res, 200, { message: 'Đổi mật khẩu thành công.' })
        })

        /* ── Story list ── */
        server.middlewares.use('/api/mock/stories', (req, res, next) => {
          if (req.method !== 'GET') return next()
          const urlObj = new URL(req.url, 'http://localhost')
          const sort = urlObj.searchParams.get('sort') || 'latest'
          const limit = Math.min(40, parseInt(urlObj.searchParams.get('limit') || '10'))
          const q = (urlObj.searchParams.get('q') || '').toLowerCase().trim()
          let list = [...(_storyListCache ?? [])]
          if (q) {
            list = list.filter((s) =>
              s.title.toLowerCase().includes(q) || s.author.toLowerCase().includes(q)
            )
          } else {
            if (sort === 'hot') list.sort((a, b) => b.nominations - a.nominations)
            else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
            else list.sort((a, b) => parseInt(b.id) - parseInt(a.id))
          }
          send(res, 200, { stories: list.slice(0, limit) })
        })

        /* ── Story detail ── */
        server.middlewares.use('/api/mock/story-detail', (req, res, next) => {
          if (req.method !== 'GET') return next()
          const urlObj = new URL(req.url, 'http://localhost')
          const storyId = urlObj.searchParams.get('id') || '100412'
          const story = getStoryDetail(storyId)
          if (!story) return send(res, 404, { message: 'Không tìm thấy truyện.' })
          send(res, 200, story)
        })

        /* ── Story reviews ── */
        server.middlewares.use('/api/mock/story-reviews', (req, res, next) => {
          if (req.method !== 'GET') return next()
          send(res, 200, { reviews: MOCK_REVIEWS })
        })

        /* ── Story comments ── */
        server.middlewares.use('/api/mock/story-comments', (req, res, next) => {
          if (req.method !== 'GET') return next()
          send(res, 200, { comments: MOCK_COMMENTS })
        })

        /* ── Chapter list ── */
        server.middlewares.use('/api/mock/story-chapters', (req, res, next) => {
          if (req.method !== 'GET') return next()
          const urlObj = new URL(req.url, 'http://localhost')
          const storyId = urlObj.searchParams.get('storyId') || '100412'
          const page = Math.max(1, parseInt(urlObj.searchParams.get('page') || '1'))
          const limit = Math.min(50, parseInt(urlObj.searchParams.get('limit') || '30'))
          const search = (urlObj.searchParams.get('search') || '').toLowerCase()
          const dir = _storyDirById(storyId)
          if (!dir) return send(res, 404, { message: 'Không tìm thấy truyện.' })

          if (search) {
            const all = getTitleCache(storyId)
            const filtered = all.filter((c) => c.title.toLowerCase().includes(search))
            const start = (page - 1) * limit
            return send(res, 200, {
              chapters: filtered.slice(start, start + limit),
              total: filtered.length,
              page, limit,
              totalPages: Math.ceil(filtered.length / limit),
            })
          }

          const files = getFileCache(storyId)
          const total = getTotalChapters(storyId)
          const start = (page - 1) * limit
          const chapters = files.slice(start, start + limit).map((f) => {
            const match = f.match(/^(\d+)_(\d+)\.txt$/)
            const firstLine = fs.readFileSync(path.join(dir, f), 'utf-8').split('\n')[0].trim()
            return { number: parseInt(match[1]), id: match[2], title: firstLine }
          })
          send(res, 200, { chapters, total, page, limit, totalPages: Math.ceil(total / limit) })
        })

        /* ── Chapter content ── */
        server.middlewares.use('/api/mock/story-chapter-content', (req, res, next) => {
          if (req.method !== 'GET') return next()
          const urlObj = new URL(req.url, 'http://localhost')
          const storyId = urlObj.searchParams.get('storyId') || '100412'
          const chapterNum = urlObj.searchParams.get('chapter')
          if (!chapterNum) return send(res, 400, { message: 'Thiếu số chương.' })
          const dir = _storyDirById(storyId)
          if (!dir) return send(res, 404, { message: 'Không tìm thấy truyện.' })
          const padded = String(chapterNum).padStart(5, '0')
          const files = fs.readdirSync(dir).filter((f) => f.startsWith(padded + '_') && f.endsWith('.txt'))
          if (!files.length) return send(res, 404, { message: 'Không tìm thấy chương.' })
          const content = fs.readFileSync(path.join(dir, files[0]), 'utf-8')
          send(res, 200, { content })
        })

        /* ── Gift candy ── */
        server.middlewares.use('/api/mock/gift-candy', async (req, res, next) => {
          if (req.method !== 'POST') return next()
          const { email, amount } = await parseBody(req)
          const users = readUsers()
          const idx = users.findIndex((u) => u.email === email)
          if (idx === -1) return send(res, 404, { message: 'Người dùng không tồn tại.' })
          if ((users[idx].candy ?? 0) < amount) return send(res, 400, { message: 'Số kẹo không đủ.' })
          users[idx].candy = (users[idx].candy ?? 0) - amount
          writeUsers(users)
          send(res, 200, { candy: users[idx].candy })
        })
      },
    },
  ],
})

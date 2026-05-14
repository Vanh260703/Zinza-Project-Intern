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

// ── VIP story indices (10 stories) ──────────────────────────────────────────
const VIP_INDICES = new Set([1, 3, 6, 9, 12, 15, 18, 21, 24, 27])
const VIP_PRICE = 50

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

  const isVip = VIP_INDICES.has(index)
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
    vip: isVip,
    price: isVip ? VIP_PRICE : 0,
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
  const diskChapters = getTotalChapters(storyId)
  return {
    ...story,
    views: story.views ?? 0,
    followers: story.followers ?? 0,
    totalChapters: diskChapters || story.totalChapters || 0,
  }
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
          const sort   = urlObj.searchParams.get('sort')   || 'latest'
          const limit  = Math.min(40, parseInt(urlObj.searchParams.get('limit') || '10'))
          const q      = (urlObj.searchParams.get('q')      || '').toLowerCase().trim()
          const genre  = (urlObj.searchParams.get('genre')  || '').trim()
          const status = (urlObj.searchParams.get('status') || '').trim()

          let list = [...(_storyListCache ?? [])]

          // ── Filters (always applied) ──────────────────────────────
          if (q)      list = list.filter((s) => s.title.toLowerCase().includes(q) || s.author.toLowerCase().includes(q))
          if (genre)  list = list.filter((s) => s.genres?.includes(genre))
          if (status) list = list.filter((s) => s.status === status)

          // ── Sort ──────────────────────────────────────────────────
          if      (sort === 'hot'    ) list.sort((a, b) => b.nominations - a.nominations)
          else if (sort === 'rating' ) list.sort((a, b) => b.rating      - a.rating)
          else if (sort === 'views'  ) list.sort((a, b) => b.nominations - a.nominations) // proxy
          else if (sort === 'candy'  ) list.sort((a, b) => (b.nominations * 10 + b.ratingCount) - (a.nominations * 10 + a.ratingCount))
          else                         list.sort((a, b) => parseInt(b.id) - parseInt(a.id))

          send(res, 200, { stories: list.slice(0, limit), total: list.length })
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

        /* ── Chapter comments ── */
        const _chapterComments = {}  // key: `${storyId}_${chapter}`
        let _commentIdSeq = 1

        server.middlewares.use('/api/mock/chapter-comments', async (req, res, next) => {
          const urlObj = new URL(req.url, 'http://localhost')

          if (req.method === 'GET') {
            const key = `${urlObj.searchParams.get('storyId')}_${urlObj.searchParams.get('chapter')}`
            return send(res, 200, { comments: _chapterComments[key] ?? [] })
          }

          if (req.method === 'POST') {
            const { storyId, chapter, userName, content } = await parseBody(req)
            if (!content?.trim()) return send(res, 400, { message: 'Nội dung không được để trống.' })
            const key = `${storyId}_${chapter}`
            const comment = {
              id: _commentIdSeq++,
              user: userName,
              content: content.trim(),
              date: new Date().toISOString().slice(0, 10),
            }
            _chapterComments[key] = [comment, ...(_chapterComments[key] ?? [])]
            return send(res, 201, { comment })
          }

          next()
        })

        /* ── Genres list ── */
        server.middlewares.use('/api/mock/genres', (req, res, next) => {
          if (req.method !== 'GET') return next()
          const genres = [...new Set((_storyListCache ?? []).flatMap((s) => s.genres).filter(Boolean))]
          send(res, 200, { genres })
        })

        /* ── My stories (user-submitted) ── */
        const _myStories = {}   // { [email]: story[] }
        const _myChapters = {}  // { [storyId]: chapter[] }
        let _myStorySeq = 1
        let _myChapterSeq = 1

        server.middlewares.use('/api/mock/my-stories', async (req, res, next) => {
          const urlObj = new URL(req.url, 'http://localhost')

          if (req.method === 'GET') {
            const email = urlObj.searchParams.get('email')
            if (!email) return send(res, 400, { message: 'Thiếu email.' })
            return send(res, 200, { stories: _myStories[email] ?? [] })
          }

          if (req.method === 'POST') {
            const { email, title, author, genre, description, cover, fromZip } = await parseBody(req)
            if (!email || !title?.trim()) return send(res, 400, { message: 'Thiếu thông tin bắt buộc.' })
            const story = {
              id: String(Date.now() + _myStorySeq++),
              title: title.trim(),
              author: author?.trim() || '',
              genre: genre || '',
              description: description?.trim() || '',
              cover: cover || null,
              fromZip: fromZip || null,
              status: 'Đang viết',
              chaptersCount: 0,
              views: 0,
              followers: 0,
              candyEarned: 0,
              createdAt: new Date().toISOString().slice(0, 10),
            }
            _myStories[email] = [story, ...(_myStories[email] ?? [])]
            // Unshift vào đầu mock story list để hiện ở trang chủ / tìm kiếm
            if (_storyListCache) {
              _storyListCache.unshift({
                id: story.id,
                slug: `user-story-${story.id}`,
                title: story.title,
                type: 'Truyện chữ',
                target: '',
                status: story.status,
                rating: 0, ratingCount: 0, commentCount: 0, nominations: 0,
                author: story.author,
                postedBy: email,
                genres: story.genre ? [story.genre] : [],
                tags: [],
                description: story.description,
                poster: story.cover || null,
                gradient: _storyListCache.length % 12,
                vip: false, price: 0,
                totalChapters: 0,
                isUserStory: true,
                views: 0, followers: 0,
              })
            }
            return send(res, 201, { story })
          }

          if (req.method === 'DELETE') {
            const email = urlObj.searchParams.get('email')
            const id = urlObj.searchParams.get('id')
            if (!email || !id) return send(res, 400, { message: 'Thiếu thông tin.' })
            _myStories[email] = (_myStories[email] ?? []).filter((s) => s.id !== id)
            delete _myChapters[id]
            // Xóa khỏi mock story list
            if (_storyListCache) {
              const idx = _storyListCache.findIndex((s) => s.id === id)
              if (idx !== -1) _storyListCache.splice(idx, 1)
            }
            return send(res, 200, { message: 'Đã xóa.' })
          }

          next()
        })

        /* ── Update my story info ── */
        server.middlewares.use('/api/mock/my-story-update', async (req, res, next) => {
          if (req.method !== 'PUT') return next()
          const { email, id, title, author, genre, description, cover, status } = await parseBody(req)
          const stories = _myStories[email] ?? []
          const idx = stories.findIndex((s) => s.id === id)
          if (idx === -1) return send(res, 404, { message: 'Không tìm thấy truyện.' })
          stories[idx] = {
            ...stories[idx],
            title: title?.trim() || stories[idx].title,
            author: author?.trim() ?? stories[idx].author,
            genre: genre ?? stories[idx].genre,
            description: description?.trim() ?? stories[idx].description,
            status: status ?? stories[idx].status,
            ...(cover !== undefined && { cover }),
          }
          // Sync vào mock story list
          if (_storyListCache) {
            const cacheIdx = _storyListCache.findIndex((s) => s.id === id)
            if (cacheIdx !== -1) {
              const s = stories[idx]
              _storyListCache[cacheIdx] = {
                ..._storyListCache[cacheIdx],
                title: s.title, author: s.author,
                genres: s.genre ? [s.genre] : [],
                description: s.description, status: s.status,
                poster: s.cover ?? _storyListCache[cacheIdx].poster,
              }
            }
          }
          return send(res, 200, { story: stories[idx] })
        })

        /* ── My story chapters ── */
        server.middlewares.use('/api/mock/my-story-chapters', async (req, res, next) => {
          const urlObj = new URL(req.url, 'http://localhost')

          if (req.method === 'GET') {
            const storyId = urlObj.searchParams.get('storyId')
            return send(res, 200, { chapters: (_myChapters[storyId] ?? []).slice().reverse() })
          }

          if (req.method === 'POST') {
            const { email, storyId, title, content } = await parseBody(req)
            if (!content?.trim()) return send(res, 400, { message: 'Nội dung chương không được để trống.' })
            const ownerStories = _myStories[email] ?? []
            const storyIdx = ownerStories.findIndex((s) => s.id === storyId)
            if (storyIdx === -1) return send(res, 403, { message: 'Không có quyền.' })
            const number = (_myChapters[storyId]?.length ?? 0) + 1
            const chapter = {
              id: String(_myChapterSeq++),
              storyId,
              number,
              title: title?.trim() || `Chương ${number}`,
              content: content.trim(),
              publishedAt: new Date().toISOString().slice(0, 10),
            }
            _myChapters[storyId] = [...(_myChapters[storyId] ?? []), chapter]
            const newCount = _myChapters[storyId].length
            ownerStories[storyIdx].chaptersCount = newCount
            if (_storyListCache) {
              const ci = _storyListCache.findIndex((s) => s.id === storyId)
              if (ci !== -1) _storyListCache[ci].totalChapters = newCount
            }
            return send(res, 201, { chapter })
          }

          if (req.method === 'DELETE') {
            const email = urlObj.searchParams.get('email')
            const storyId = urlObj.searchParams.get('storyId')
            const chapterId = urlObj.searchParams.get('chapterId')
            const ownerStories = _myStories[email] ?? []
            const storyIdx = ownerStories.findIndex((s) => s.id === storyId)
            if (storyIdx === -1) return send(res, 403, { message: 'Không có quyền.' })
            _myChapters[storyId] = (_myChapters[storyId] ?? []).filter((c) => c.id !== chapterId)
            _myChapters[storyId].forEach((c, i) => { c.number = i + 1 })
            const newCount = _myChapters[storyId].length
            ownerStories[storyIdx].chaptersCount = newCount
            if (_storyListCache) {
              const ci = _storyListCache.findIndex((s) => s.id === storyId)
              if (ci !== -1) _storyListCache[ci].totalChapters = newCount
            }
            return send(res, 200, { message: 'Đã xóa chương.' })
          }

          next()
        })

        /* ── VIP stories list ── */
        server.middlewares.use('/api/mock/vip-stories', (req, res, next) => {
          if (req.method !== 'GET') return next()
          const list = (_storyListCache ?? []).filter((s) => s.vip)
          send(res, 200, { stories: list })
        })

        /* ── Purchase VIP story ── */
        server.middlewares.use('/api/mock/purchase-vip', async (req, res, next) => {
          if (req.method !== 'POST') return next()
          const { email, storyId } = await parseBody(req)
          const story = (_storyListCache ?? []).find((s) => s.id === storyId)
          if (!story || !story.vip) return send(res, 400, { message: 'Truyện không phải VIP.' })
          const users = readUsers()
          const idx = users.findIndex((u) => u.email === email)
          if (idx === -1) return send(res, 404, { message: 'Người dùng không tồn tại.' })
          const currentCandy = users[idx].candy ?? 0
          if (currentCandy < story.price) return send(res, 400, { message: `Không đủ kẹo. Bạn cần ${story.price} kẹo.` })
          users[idx].candy = currentCandy - story.price
          writeUsers(users)
          send(res, 200, { candy: users[idx].candy })
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

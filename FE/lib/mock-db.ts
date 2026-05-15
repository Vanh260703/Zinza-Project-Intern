import fs from 'fs'
import path from 'path'
import type { Story, User, PublicUser, ChapterFull, Transaction, MyStory } from '@/types/index'

const ROOT = process.cwd()
const USERS_PATH = path.resolve(ROOT, 'mocks/users/users.json')
const UPLOAD_DIR = path.resolve(ROOT, 'mocks/upload')
const STORIES_JSON_PATH = path.resolve(ROOT, 'mocks/stories/stories.json')

// ── VIP ────────────────────────────────────────────────────────────────────────
const VIP_INDICES = new Set([1, 3, 6, 9, 12, 15, 18, 21, 24, 27])
export const VIP_PRICE = 50

// ── Per-story chapter file cache ───────────────────────────────────────────────
const _fileCaches: Record<string, string[]> = {}
function getFileCache(storyId: string): string[] {
  if (_fileCaches[storyId]) return _fileCaches[storyId]
  const dir = _storyDirById(storyId)
  if (!dir) return []
  _fileCaches[storyId] = fs.readdirSync(dir).filter((f) => f.endsWith('.txt') && !f.startsWith('00000'))
  return _fileCaches[storyId]
}

function _storyDirById(storyId: string): string | null {
  if (!fs.existsSync(UPLOAD_DIR)) return null
  const entries = fs.readdirSync(UPLOAD_DIR)
  const folder = entries.find((e) => e.startsWith(storyId + '_'))
  return folder ? path.join(UPLOAD_DIR, folder) : null
}

export function storyDirById(storyId: string): string | null {
  return _storyDirById(storyId)
}

function getTotalChapters(storyId: string): number {
  const files = getFileCache(storyId)
  if (!files.length) return 0
  const last = files[files.length - 1]
  if (!last) return 0
  const m = last.match(/^(\d+)/)
  return m ? parseInt(m[1]) : 0
}

const _titleCaches: Record<string, { number: number; id: string; title: string }[]> = {}
export function getTitleCache(storyId: string) {
  if (_titleCaches[storyId]) return _titleCaches[storyId]
  const dir = _storyDirById(storyId)
  if (!dir) return []
  _titleCaches[storyId] = getFileCache(storyId).map((f) => {
    const match = f.match(/^(\d+)_(\d+)\.txt$/)
    const firstLine = fs.readFileSync(path.join(dir, f), 'utf-8').split('\n')[0].trim()
    return { number: parseInt(match?.[1] ?? '0'), id: match?.[2] ?? '', title: firstLine }
  })
  return _titleCaches[storyId]
}

// ── Story list ─────────────────────────────────────────────────────────────────
let _storyListCache: Story[] | null = null
let _initPromise: Promise<void> | null = null

function parseOverview(content: string, id: string, slug: string, index: number): Story {
  const get = (key: string) => {
    const re = new RegExp(`^${key}\\s*:\\s*(.+)$`, 'm')
    const m = content.match(re)
    return m ? m[1].trim() : ''
  }
  const ratingStr = get('Đánh giá')
  const ratingMatch = ratingStr.match(/([\d.]+)\s*⭐\s*\((\d+)/)
  const tagsStr = get('Tags')
  const tags = !tagsStr || tagsStr === '—' ? [] : tagsStr.split(',').map((t) => t.trim())
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
    totalChapters: 0,
  }
}

function ensureInit(): Promise<void> {
  if (_storyListCache) return Promise.resolve()
  if (_initPromise) return _initPromise
  _initPromise = (async () => {
    if (!fs.existsSync(UPLOAD_DIR)) {
      _storyListCache = []
      return
    }
    const folders = (await fs.promises.readdir(UPLOAD_DIR)).filter((f) => /^\d+_/.test(f))
    const results = await Promise.all(
      folders.map(async (folder, index) => {
        const m = folder.match(/^(\d+)_(.+)$/)
        if (!m) return null
        const [, id, slug] = m
        if (!id || !slug) return null
        const overviewPath = path.join(UPLOAD_DIR, folder, '00000_overview.txt')
        try {
          const content = await fs.promises.readFile(overviewPath, 'utf-8')
          const story = parseOverview(content, id, slug, index)
          story.totalChapters = getTotalChapters(id)
          return story
        } catch {
          return null
        }
      }),
    )
    _storyListCache = results.filter((s): s is Story => s !== null)
    await fs.promises.writeFile(STORIES_JSON_PATH, JSON.stringify(_storyListCache, null, 2), 'utf-8')
  })()
  return _initPromise
}

export async function getStoryList(): Promise<Story[]> {
  await ensureInit()
  return _storyListCache ?? []
}

export async function getStoryDetail(storyId: string): Promise<Story | null> {
  const list = await getStoryList()
  const story = list.find((s) => s.id === storyId)
  if (!story) return null
  const diskChapters = getTotalChapters(storyId)
  return { ...story, totalChapters: diskChapters || story.totalChapters || 0 }
}

export async function pushToStoryList(story: Story): Promise<void> {
  await ensureInit()
  _storyListCache?.unshift(story)
}

export async function removeFromStoryList(id: string): Promise<void> {
  await ensureInit()
  if (_storyListCache) {
    const idx = _storyListCache.findIndex((s) => s.id === id)
    if (idx !== -1) _storyListCache.splice(idx, 1)
  }
}

export async function updateInStoryList(id: string, patch: Partial<Story>): Promise<void> {
  await ensureInit()
  if (_storyListCache) {
    const idx = _storyListCache.findIndex((s) => s.id === id)
    if (idx !== -1) {
      const existing = _storyListCache[idx]
      if (existing) _storyListCache[idx] = { ...existing, ...patch }
    }
  }
}

// ── Chapter content (disk) ─────────────────────────────────────────────────────
export function readChapterContent(storyId: string, chapterNum: number): string | null {
  const dir = _storyDirById(storyId)
  if (!dir) return null
  const padded = String(chapterNum).padStart(5, '0')
  const files = fs.readdirSync(dir).filter((f) => f.startsWith(padded + '_') && f.endsWith('.txt'))
  if (!files.length) return null
  const file = files[0]
  if (!file) return null
  return fs.readFileSync(path.join(dir, file), 'utf-8')
}

export function getChapterPage(
  storyId: string,
  page: number,
  limit: number,
): { chapters: { number: number; id: string; title: string }[]; total: number; totalPages: number } {
  const dir = _storyDirById(storyId)
  if (!dir) return { chapters: [], total: 0, totalPages: 0 }
  const files = getFileCache(storyId)
  const total = getTotalChapters(storyId)
  const start = (page - 1) * limit
  const chapters = files.slice(start, start + limit).map((f) => {
    const match = f.match(/^(\d+)_(\d+)\.txt$/)
    const firstLine = fs.readFileSync(path.join(dir, f), 'utf-8').split('\n')[0].trim()
    return { number: parseInt(match?.[1] ?? '0'), id: match?.[2] ?? '', title: firstLine }
  })
  return { chapters, total, totalPages: Math.ceil(total / limit) }
}

// ── Users ──────────────────────────────────────────────────────────────────────
export function readUsers(): User[] {
  try {
    return JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8')) as User[]
  } catch {
    return []
  }
}

export function writeUsers(users: User[]): void {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), 'utf-8')
}

export function publicUser(u: User): PublicUser {
  return { email: u.email, name: u.name, gender: u.gender, candy: u.candy ?? 0, chaptersRead: u.chaptersRead ?? 0, followers: u.followers ?? 0 }
}

// ── In-memory state (global singleton to survive HMR) ─────────────────────────
interface MockState {
  myStories: Record<string, MyStory[]>
  myChapters: Record<string, ChapterFull[]>
  myStorySeq: number
  myChapterSeq: number
  chapterComments: Record<string, { id: number; user: string; content: string; date: string }[]>
  commentIdSeq: number
  transactions: Record<string, Transaction[]>
  txSeq: number
}

declare global {
  // eslint-disable-next-line no-var
  var __mockState: MockState | undefined
}

function getState(): MockState {
  if (!global.__mockState) {
    global.__mockState = {
      myStories: {},
      myChapters: {},
      myStorySeq: 1,
      myChapterSeq: 1,
      chapterComments: {},
      commentIdSeq: 1,
      transactions: {},
      txSeq: 1,
    }
  }
  return global.__mockState
}

export function getMyStories(email: string): MyStory[] {
  return getState().myStories[email] ?? []
}

export function addMyStory(email: string, story: Omit<MyStory, 'id' | 'chaptersCount' | 'views' | 'followers' | 'candyEarned' | 'createdAt'> & { id?: string }): MyStory {
  const state = getState()
  const s: MyStory = {
    id: story.id ?? String(Date.now() + state.myStorySeq++),
    title: story.title,
    author: story.author,
    genre: story.genre,
    description: story.description,
    cover: story.cover,
    fromZip: story.fromZip,
    status: 'Đang viết',
    chaptersCount: 0,
    views: 0,
    followers: 0,
    candyEarned: 0,
    createdAt: new Date().toISOString().slice(0, 10),
  }
  state.myStories[email] = [s, ...(state.myStories[email] ?? [])]
  return s
}

export function updateMyStory(email: string, id: string, patch: Partial<MyStory>): MyStory | null {
  const stories = getState().myStories[email] ?? []
  const idx = stories.findIndex((s) => s.id === id)
  if (idx === -1) return null
  const existing = stories[idx]
  if (!existing) return null
  stories[idx] = { ...existing, ...patch }
  return stories[idx] ?? null
}

export function deleteMyStory(email: string, id: string): void {
  const state = getState()
  state.myStories[email] = (state.myStories[email] ?? []).filter((s) => s.id !== id)
  delete state.myChapters[id]
}

export function getMyChapters(storyId: string): ChapterFull[] {
  return getState().myChapters[storyId] ?? []
}

export function addMyChapter(email: string, storyId: string, title: string, content: string, candyPrice: number): ChapterFull | null {
  const state = getState()
  const ownerStories = state.myStories[email] ?? []
  const storyIdx = ownerStories.findIndex((s) => s.id === storyId)
  if (storyIdx === -1) return null
  const number = (state.myChapters[storyId]?.length ?? 0) + 1
  const chapter: ChapterFull = {
    id: String(state.myChapterSeq++),
    storyId,
    number,
    title: title || `Chương ${number}`,
    content,
    candyPrice: Math.max(0, candyPrice),
    publishedAt: new Date().toISOString().slice(0, 10),
  }
  state.myChapters[storyId] = [...(state.myChapters[storyId] ?? []), chapter]
  const newCount = state.myChapters[storyId].length
  const st = ownerStories[storyIdx]
  if (st) st.chaptersCount = newCount
  return chapter
}

export function deleteMyChapter(email: string, storyId: string, chapterId: string): boolean {
  const state = getState()
  const ownerStories = state.myStories[email] ?? []
  const storyIdx = ownerStories.findIndex((s) => s.id === storyId)
  if (storyIdx === -1) return false
  state.myChapters[storyId] = (state.myChapters[storyId] ?? []).filter((c) => c.id !== chapterId)
  state.myChapters[storyId].forEach((c, i) => { c.number = i + 1 })
  const st = ownerStories[storyIdx]
  if (st) st.chaptersCount = state.myChapters[storyId].length
  return true
}

export function setChapterPrice(email: string, storyId: string, chapterId: string, candyPrice: number): number | null {
  const state = getState()
  if (!(state.myStories[email] ?? []).find((s) => s.id === storyId)) return null
  const chapters = state.myChapters[storyId] ?? []
  const idx = chapters.findIndex((c) => c.id === chapterId)
  if (idx === -1) return null
  const ch = chapters[idx]
  if (!ch) return null
  ch.candyPrice = Math.max(0, candyPrice)
  return ch.candyPrice
}

export function findMyChapter(storyId: string, chapterNum: number): ChapterFull | undefined {
  return (getState().myChapters[storyId] ?? []).find((c) => c.number === chapterNum)
}

// ── Chapter comments ───────────────────────────────────────────────────────────
export function getChapterComments(storyId: string, chapter: string | number) {
  const key = `${storyId}_${chapter}`
  return getState().chapterComments[key] ?? []
}

export function addChapterComment(storyId: string, chapter: string | number, userName: string, content: string) {
  const state = getState()
  const key = `${storyId}_${chapter}`
  const comment = { id: state.commentIdSeq++, user: userName, content: content.trim(), date: new Date().toISOString().slice(0, 10) }
  state.chapterComments[key] = [comment, ...(state.chapterComments[key] ?? [])]
  return comment
}

// ── Transactions ───────────────────────────────────────────────────────────────
export function getTransactions(email: string): Transaction[] {
  return getState().transactions[email] ?? []
}

export function addTransaction(email: string, tx: Omit<Transaction, 'id' | 'date'>): Transaction {
  const state = getState()
  const full: Transaction = { ...tx, id: state.txSeq++, date: new Date().toISOString() }
  state.transactions[email] = [full, ...(state.transactions[email] ?? [])]
  return full
}

// ── Static mock data ───────────────────────────────────────────────────────────
export const MOCK_REVIEWS = [
  { id: 1, user: 'KiếmKhách99', avatar: null, rating: 5, date: '2024-11-20', content: 'Bộ truyện cực hay! Thế giới quan rộng lớn, nhân vật phụ được xây dựng rất tốt. Tần Mục không phải kiểu nhân vật vô địch từ đầu mà phải từng bước phấn đấu. Tác giả xây dựng bầu không khí u ám, huyền bí rất tốt. Cực kỳ recommend!' },
  { id: 2, user: 'TiênHiệpFan', avatar: null, rating: 5, date: '2024-10-15', content: 'Đây là một trong những bộ huyền huyễn hay nhất tôi từng đọc. Cách tác giả xây dựng hệ thống tu luyện và thế giới quan rất độc đáo và nhất quán. Mỗi nhân vật đều có chiều sâu riêng.' },
  { id: 3, user: 'NightReader', avatar: null, rating: 4, date: '2024-09-30', content: 'Truyện hay nhưng đầu hơi chậm, phải đến chương 50 mới thực sự cuốn. Nhưng bù lại phần sau rất đỉnh, hành trình của Tần Mục từ Tàn Lão thôn ra thế giới bên ngoài rất ấn tượng.' },
  { id: 4, user: 'HuyenHuyenFan', avatar: null, rating: 5, date: '2024-08-12', content: 'World building xuất sắc. Hệ thống bóng tối, những bí ẩn về Đại Khư và nguồn gốc của Tần Mục được dẫn dắt khéo léo xuyên suốt tác phẩm. Đây là loại truyện mà bạn đọc không thể dừng lại được.' },
]

export const MOCK_COMMENTS = [
  { id: 1, user: 'LongVânHiệp', avatar: null, date: '2025-01-05', content: 'Mới đọc đến chương 150, hay quá trời! Tần Mục ở trong Tàn Lão thôn mà học được cả đống skill từ bọn lão già tàn phế :)) Tác giả thiên tài thật sự' },
  { id: 2, user: 'TruyenChê', avatar: null, date: '2025-01-03', content: 'Đọc đến chương 800 rồi, plot twist về thân thế Tần Mục ngon vãi lúa. Ai mới đọc cố gắng kiên nhẫn nhé, về sau hay hơn nhiều.' },
  { id: 3, user: 'Phantom_x', avatar: null, date: '2024-12-28', content: 'Hệ thống sức mạnh trong truyện này unique lắm. Bảy đại thần tàng, Linh Thể, Bá Thể... được giải thích rõ ràng và logic. Không như mấy truyện khác viết cho có.' },
  { id: 4, user: 'DarkReader2024', avatar: null, date: '2024-12-20', content: 'Câu mở đầu "Trời tối, đừng đi ra ngoài" đỉnh vãi. Nghe đơn giản mà chứa đựng cả một thế giới bí ẩn phía sau. Ambiance của truyện rất riêng, không lẫn vào đâu được.' },
  { id: 5, user: 'ReadingAddict', avatar: null, date: '2024-12-15', content: 'Đã hoàn thành 1844 chương. Cái kết mãn nguyện lắm, tác giả không phụ độc giả. Cảm ơn DarkHero đã dịch bộ này!' },
  { id: 6, user: 'MocLongVan', avatar: null, date: '2024-12-10', content: 'Tư bà bà và Mã gia là best supporting characters. Tụi này tàn phế hết mà vẫn ngầu hơn nhân vật chính mấy truyện khác :v' },
]

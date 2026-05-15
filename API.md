# API Specification

Tài liệu mô tả toàn bộ API cần implement cho backend của ứng dụng đọc truyện chữ.

---

## Tổng quan

| Mục | Giá trị |
|-----|---------|
| Base URL | `/api/v1` (đề xuất, thay thế `/api/mock/`) |
| Format | JSON (`Content-Type: application/json`) |
| Auth | JWT Bearer token (header `Authorization: Bearer <token>`) |
| Ngôn ngữ lỗi | Tiếng Việt |

---

## Data Models

### User
```json
{
  "id": "uuid",
  "email": "string (unique)",
  "name": "string",
  "gender": "male | female",
  "candy": "integer (default: 0)",
  "chaptersRead": "integer (default: 0)",
  "followers": "integer (default: 0)",
  "createdAt": "datetime"
}
```
> `password` (bcrypt hash) chỉ lưu DB, không trả về client.

---

### Story
```json
{
  "id": "string (numeric string để tương thích disk stories, hoặc uuid)",
  "slug": "string (unique URL slug)",
  "title": "string",
  "author": "string (tên hiển thị tác giả)",
  "postedBy": "string (email người đăng, nullable với disk stories)",
  "type": "string (vd: 'Chuyển ngữ', 'Sáng tác')",
  "target": "string (vd: 'Nam', 'Nữ')",
  "status": "string ('Đang ra' | 'Hoàn thành' | 'Đang viết')",
  "genres": ["string"],
  "tags": ["string"],
  "description": "string",
  "poster": "string (URL ảnh bìa, nullable)",
  "gradient": "integer (0–11, index màu CSS fallback)",
  "rating": "float (0–5)",
  "ratingCount": "integer",
  "commentCount": "integer",
  "nominations": "integer (số lượt đề cử/yêu thích)",
  "totalChapters": "integer",
  "views": "integer (default: 0)",
  "followerCount": "integer (default: 0)",
  "vip": "boolean (story-level VIP, default: false)",
  "price": "integer (candy, dùng khi vip=true, default: 0)",
  "hasVipChapters": "boolean (true nếu có ≥1 chương có candyPrice > 0)",
  "candyEarned": "integer (tổng kẹo thu được từ story này)",
  "isUserStory": "boolean (false với disk stories, true với user-created)",
  "createdAt": "datetime"
}
```

---

### Chapter
```json
{
  "id": "uuid",
  "storyId": "string (foreign key → Story)",
  "number": "integer (1-based, auto-increment)",
  "title": "string",
  "content": "text",
  "candyPrice": "integer (default: 0, >= 0)",
  "publishedAt": "datetime"
}
```

---

### Transaction
```json
{
  "id": "uuid",
  "userEmail": "string (foreign key → User)",
  "type": "topup | purchase | gift",
  "description": "string (human-readable, tiếng Việt)",
  "candyChange": "integer (signed: dương = nạp, âm = tiêu)",
  "candyAfter": "integer (số dư sau giao dịch)",
  "createdAt": "datetime"
}
```

---

### Comment (Chapter)
```json
{
  "id": "uuid",
  "storyId": "string",
  "chapterNumber": "integer",
  "userName": "string",
  "content": "text",
  "createdAt": "datetime"
}
```

---

### Review (Story-level)
```json
{
  "id": "uuid",
  "storyId": "string",
  "userName": "string",
  "rating": "integer (1–5)",
  "content": "text",
  "createdAt": "datetime"
}
```

---

## Client-side Auth State

Frontend lưu trong `localStorage` key `auth_user` — những trường này cần được trả về từ các API auth và phải được giữ đồng bộ:

```json
{
  "email": "string",
  "name": "string",
  "gender": "string",
  "candy": "integer",
  "chaptersRead": "integer",
  "followers": "integer",
  "readHistory": { "storyId": "lastChapterNum" },
  "bookmark": ["storyId"],
  "unlockedChapters": { "${storyId}_${chapterNum}": true }
}
```
> `readHistory`, `bookmark`, `unlockedChapters` hiện đang lưu client-only. BE cần quyết định có persist không.

---

## Endpoints

---

### 1. Authentication

#### POST /auth/login
```
Body:  { email, password }
200:   { user: User }
401:   { message: "Email hoặc mật khẩu không chính xác." }
```

#### POST /auth/register
```
Body:  { email, name, gender, password }
201:   { message: "Đăng ký thành công." }
409:   { message: "Email này đã được sử dụng." }
```
> Khởi tạo: candy=0, chaptersRead=0, followers=0.

#### PUT /auth/update-profile
```
Auth:  required
Body:  { email, name, gender? }
200:   { user: User }
404:   { message: "Người dùng không tồn tại." }
```

#### PUT /auth/change-password
```
Auth:  required
Body:  { email, currentPassword, newPassword }
200:   { message: "Đổi mật khẩu thành công." }
400:   { message: "Mật khẩu hiện tại không đúng." }
404:   { message: "Người dùng không tồn tại." }
```

---

### 2. Stories — Duyệt truyện

#### GET /stories
Lấy danh sách truyện (không bao gồm truyện `vip=true`).

```
Query:
  q       — tìm kiếm theo tên truyện hoặc tác giả (case-insensitive substring)
  genre   — lọc theo thể loại (khớp chính xác trong mảng genres)
  status  — lọc theo trạng thái ('Đang ra' | 'Hoàn thành')
  sort    — 'latest' (default) | 'hot' | 'rating' | 'views' | 'candy'
  limit   — integer (default: 10, max: 40)
  page    — integer (default: 1) [nếu dùng offset pagination]

200: { stories: Story[], total: integer }
```

**Sort logic:**
| sort | Trường sắp xếp |
|------|----------------|
| `latest` | `createdAt DESC` |
| `hot` | `nominations DESC` |
| `rating` | `rating DESC` |
| `views` | `views DESC` (hoặc nominations làm proxy) |
| `candy` | `(nominations * 10 + ratingCount) DESC` |

---

#### GET /stories/vip
Trả về truyện VIP: `vip = true` **hoặc** `hasVipChapters = true`.

```
200: { stories: Story[] }
```

---

#### GET /stories/:id
```
200: Story (đầy đủ + totalChapters)
404: { message: "Không tìm thấy truyện." }
```

---

#### GET /genres
Trả về danh sách thể loại duy nhất từ tất cả truyện.
```
200: { genres: string[] }
```

---

### 3. Chapters

#### GET /stories/:storyId/chapters
```
Query:
  page    — integer (default: 1)
  limit   — integer (default: 30, max: 50)
  search  — tìm kiếm theo tiêu đề chương

200: {
  chapters: { number, id, title, candyPrice }[],
  total, page, limit, totalPages
}
404: { message: "Không tìm thấy truyện." }
```

#### GET /stories/:storyId/chapters/:chapterNum
```
200: {
  content: string,
  candyPrice: integer,
  ownerEmail: string    // email chủ truyện, dùng để check isOwner ở FE
}
400: { message: "Thiếu số chương." }
404: { message: "Không tìm thấy chương." }
```

---

### 4. Comments & Reviews

#### GET /stories/:storyId/reviews
```
200: { reviews: Review[] }
```

#### GET /stories/:storyId/comments
```
200: { comments: Comment[] }   // comment cấp story (tổng quan)
```

#### GET /stories/:storyId/chapters/:chapterNum/comments
```
200: { comments: Comment[] }
```

#### POST /stories/:storyId/chapters/:chapterNum/comments
```
Auth:  optional (userName lấy từ body hoặc từ token nếu đã đăng nhập)
Body:  { storyId, chapter, userName, content }
201:   { comment: Comment }
400:   { message: "Nội dung không được để trống." }
```

---

### 5. User Stories — Truyện tự đăng

Tất cả endpoints dưới đây yêu cầu Auth.

#### GET /my-stories
```
Query: email (hoặc lấy từ token)
200:   { stories: Story[] }
```

#### POST /my-stories
```
Body: { email, title, author?, genre?, description?, cover?, fromZip? }
201:  { story: Story }
400:  { message: "Thiếu thông tin bắt buộc." }
```
**Side effects:**
- Tạo story với `status='Đang viết'`, `chaptersCount=0`, `hasVipChapters=false`
- Story ngay lập tức xuất hiện trong `/stories?sort=latest`

#### PUT /my-stories/:id
```
Body: { email, title?, author?, genre?, description?, cover?, status? }
200:  { story: Story }
404:  { message: "Không tìm thấy truyện." }
```

#### DELETE /my-stories/:id
```
Query: email
200:  { message: "Đã xóa." }
400:  { message: "Thiếu thông tin." }
```
**Side effects:** Xóa toàn bộ chapter của story đó.

---

### 6. My Story Chapters

#### GET /my-stories/:storyId/chapters
```
200: { chapters: Chapter[] }   // sắp xếp mới nhất trước
```

#### POST /my-stories/:storyId/chapters
```
Auth:  required (phải là chủ story)
Body:  { email, storyId, title?, content, candyPrice? }
201:   { chapter: Chapter }
400:   { message: "Nội dung chương không được để trống." }
403:   { message: "Không có quyền." }
```
**Side effects:**
- `chapter.number` auto-increment (1-based)
- Cập nhật `story.chaptersCount++`
- Nếu `candyPrice > 0` → `story.hasVipChapters = true`

#### DELETE /my-stories/:storyId/chapters/:chapterId
```
Query: email
200:  { message: "Đã xóa chương." }
403:  { message: "Không có quyền." }
```
**Side effects:**
- Renumber toàn bộ chapter còn lại (1-based liên tục)
- Cập nhật `story.chaptersCount`
- Recalculate `story.hasVipChapters`

#### PUT /my-stories/:storyId/chapters/:chapterId/price
```
Auth:  required
Body:  { email, storyId, chapterId, candyPrice }
200:   { candyPrice: integer }
403:   { message: "Cần ít nhất 1.000 người theo dõi để đặt giá chương." }
403:   { message: "Không có quyền." }
404:   { message: "Không tìm thấy chương." }
```
**Điều kiện:** `user.followers >= 1000`
**Side effects:** Recalculate `story.hasVipChapters`

---

### 7. VIP

#### PUT /my-stories/:id/vip
```
Auth:  required
Body:  { email, id, price, action: 'toggle' | 'update-price' }
200:   { vip: boolean, price: integer }
403:   { message: "Cần ít nhất 1.000 người theo dõi để mở khoá tính năng VIP." }
404:   { message: "Không tìm thấy truyện." }
```
**Điều kiện:** `user.followers >= 1000`
- `action='toggle'`: bật/tắt `story.vip`, set price nếu đang bật
- `action='update-price'`: chỉ cập nhật price, giữ nguyên vip flag
- Giá mặc định: 50 candy nếu không truyền

#### POST /purchase/vip
```
Auth:  required
Body:  { email, storyId }
200:   { candy: integer }   // số dư mới của buyer
400:   { message: "Truyện không phải VIP." }
400:   { message: "Không đủ kẹo. Bạn cần X kẹo." }
404:   { message: "Người dùng không tồn tại." }
```
**Side effects:**
- Trừ `story.price` kẹo từ buyer
- Cộng `story.price` kẹo vào tài khoản chủ truyện (nếu khác buyer)
- Tăng `story.candyEarned`
- Ghi transaction type=`purchase` cho buyer

#### POST /purchase/chapter
```
Auth:  required
Body:  { email, storyId, chapterNum }
200:   { candy: integer }   // số dư mới của buyer
400:   { message: "Chương này không yêu cầu mở khoá." }
400:   { message: "Không đủ kẹo. Bạn cần X 🍬." }
404:   { message: "Người dùng không tồn tại." }
```
**Side effects:**
- Trừ `chapter.candyPrice` kẹo từ buyer
- Cộng kẹo vào chủ truyện
- Tăng `story.candyEarned`
- Ghi transaction type=`purchase`, description kèm tên truyện

---

### 8. Candy

#### POST /candy/topup
```
Auth:  required
Body:  { email, candy: integer, vnd?: integer }
200:   { candy: integer }   // số dư mới
404:   { message: "Người dùng không tồn tại." }
```
**Side effects:**
- Cộng candy vào user
- Ghi transaction type=`topup`
- Description: `"Nạp {candy} kẹo · {vnd}đ"` hoặc `"Nạp {candy} kẹo"` nếu không có vnd

#### POST /candy/gift
```
Auth:  required
Body:  { email, amount: integer, storyTitle?: string }
200:   { candy: integer }   // số dư mới của người tặng
400:   { message: "Số kẹo không đủ." }
404:   { message: "Người dùng không tồn tại." }
```
**Side effects:**
- Trừ `amount` kẹo từ user
- Ghi transaction type=`gift`
- Description: `"Tặng kẹo · {storyTitle}"` hoặc `"Tặng kẹo cho tác giả"`

#### GET /candy/transactions
```
Auth:  required
Query: email
200:   { transactions: Transaction[] }   // mới nhất trước
400:   { message: "Thiếu email." }
```

---

### 9. Rankings

#### GET /rankings
```
Query:
  type  — 'reader' | 'spender' | 'topup' | 'author' (default: 'reader')
  limit — integer (default: 10, max: 20)

200: {
  rankings: {
    key: string,           // email hoặc tên tác giả (unique key)
    name: string,          // tên hiển thị
    score: integer,        // điểm theo từng loại
    rank: integer,         // 1-indexed
    nominations?: integer  // chỉ có với type='author'
  }[]
}
```

**Cách tính score:**

| type | Score | Nguồn dữ liệu |
|------|-------|----------------|
| `reader` | `user.chaptersRead` | bảng users |
| `spender` | tổng candy chi (purchase + gift transactions) | bảng transactions |
| `topup` | tổng candy nạp (topup transactions) | bảng transactions |
| `author` | số lượng truyện đã đăng | bảng stories |

---

### 10. Static Assets

#### GET /assets/fake-qr
```
200: image/jpeg (ảnh QR giả để demo thanh toán)
404: not found
```

#### GET /assets/upload/:path
```
200: image (jpg/png/webp)   // ảnh bìa truyện, avatar, v.v.
```
> BE có thể thay bằng object storage (S3, Cloudinary, v.v.) và trả URL trực tiếp.

---

## Business Rules

### Candy Economy

1. Kẹo là đơn vị tệ tệ trong app.
2. **Nạp kẹo**: user trả tiền thật (VNĐ) → nhận kẹo.
3. **Mua chương**: buyer trả candyPrice → chủ truyện nhận 100% (không split fee).
4. **Mua VIP story**: tương tự mua chương nhưng ở cấp story.
5. **Tặng kẹo**: chỉ trừ người tặng, không cộng cho ai (donation cho tác giả).
6. Tất cả thao động kẹo phải ghi transaction.

### VIP Feature

| Điều kiện | Yêu cầu |
|-----------|---------|
| Toggle VIP story | `user.followers >= 1000` |
| Đặt giá chương | `user.followers >= 1000` |

- Story có `vip=true`: toàn bộ truyện bị khoá → phải mua 1 lần để đọc tất cả.
- Story có `hasVipChapters=true` (vip=false): từng chương có giá riêng.
- Cả hai loại đều xuất hiện trong `/stories/vip`.

### Access Control

| Resource | Ai được phép |
|----------|-------------|
| Đọc truyện/chương | Everyone |
| Tạo/sửa/xóa story | Owner (email khớp `postedBy`) |
| Thêm/xóa/định giá chương | Owner |
| Mua VIP/chapter | User đã đăng nhập (không phải owner) |
| Xem transaction | Owner (chỉ xem của chính mình) |

### Chapter Numbering

- Auto-increment bắt đầu từ 1.
- Khi xóa chương: renumber lại toàn bộ (1, 2, 3, ...) để không có khoảng trống.

### hasVipChapters Flag

Tự động cập nhật khi:
- Thêm chương có `candyPrice > 0` → `hasVipChapters = true`
- Sửa giá chương → recalculate (kiểm tra tất cả chapters)
- Xóa chương → recalculate

---

## Response Format

### Thành công
```json
HTTP 200 / 201
{ "data_field": "..." }
```

### Lỗi
```json
HTTP 4xx / 5xx
{ "message": "Mô tả lỗi bằng tiếng Việt." }
```

---

## Persistence

| Dữ liệu | Mock (hiện tại) | BE cần |
|---------|-----------------|--------|
| Users | `users.json` (đọc/ghi) | DB table |
| Stories (disk) | File system, đọc khi khởi động | DB table (import 1 lần) |
| Stories (user) | RAM (`_myStories`) | DB table |
| Chapters (disk) | File `.txt` | DB table hoặc file storage |
| Chapters (user) | RAM (`_myChapters`) | DB table |
| Transactions | RAM (`_transactions`) | DB table |
| Chapter comments | RAM (`_chapterComments`) | DB table |
| Reviews | Hardcoded | DB table |
| Unlocked chapters | localStorage FE | DB table `user_unlocked_chapters(userId, storyId, chapterNum)` |
| Read history | localStorage FE | DB table `user_read_history(userId, storyId, lastChapter)` |
| Bookmarks | localStorage FE | DB table `user_bookmarks(userId, storyId)` |

---

## Điểm cần quyết định khi viết BE

1. **JWT vs Session**: Hiện tại mock không có token. BE cần chọn auth strategy.
2. **Read history / Bookmarks / Unlocked chapters**: Mock lưu localStorage. BE nên persist để không mất khi đổi thiết bị.
3. **File upload**: Hiện dùng URL text. BE cần endpoint `POST /upload` (multipart) trả về URL.
4. **Disk stories import**: 40 truyện từ file → cần script import vào DB 1 lần.
5. **Candy gift recipient**: Mock không ghi nhận người nhận (tặng 1 chiều). Cần clarify — có ghi nhận tác giả nhận kẹo không?
6. **VIP story purchase**: Mock cộng kẹo thẳng vào user, không có escrow hay refund. BE nên có chính sách refund rõ ràng.
7. **Ranking tie-breaker**: `author` dùng `nominations DESC`. Các loại còn lại chưa có tie-breaker.
8. **Rate limiting**: Mock không có. BE nên giới hạn topup/purchase để tránh abuse.

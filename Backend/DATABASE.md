# Database Design — Novel Web

## Tổng quan

Hệ thống đọc truyện online với tính năng:
- Đọc truyện miễn phí và VIP (trả candy để mở khoá chapter)
- Nạp tiền qua cổng thanh toán SePay
- Theo dõi tiến độ đọc, bookmark, đánh giá, bình luận
- Hệ thống đề cử truyện (mỗi user 1 lần / 1 truyện)
- Thông báo realtime-ready

**Stack:** NestJS · TypeORM · PostgreSQL · Redis

---

## Sơ đồ quan hệ

```
users ──────────────────────────────────────────────────────────────────┐
  │                                                                      │
  ├── user_wallets (1-1)          ← số dư candy                         │
  ├── user_story_reads (1-N)      ← tiến độ đọc (chapter gần nhất)      │
  ├── user_story_bookmarks (1-N)  ← truyện đang theo dõi                │
  ├── user_daily_reads (1-N)      ← lịch sử đọc theo ngày               │
  ├── payment_orders (1-N)        ← đơn nạp tiền                        │
  ├── wallet_transactions (1-N)   ← lịch sử biến động candy             │
  ├── chapter_purchases (1-N)     ← lịch sử mua chapter VIP             │
  ├── story_ratings (1-N)         ← đánh giá truyện                     │
  ├── story_comments (1-N)        ← bình luận                           │
  ├── story_nominations (1-N)     ← đề cử truyện                        │
  └── notifications (1-N)         ← thông báo                           │
                                                                         │
stories ──────────────────────────────────────────────────────────────  ┤
  ├── story_categories (N-N) ──→ categories                             │
  ├── story_tags (N-N) ──────→ tags                                     │
  ├── story_ratings (1-N) ───→ users ─────────────────────────────────  ┘
  ├── story_comments (1-N) ──→ users
  ├── story_nominations (1-N) → users
  └── chapters (1-N)
        └── chapter_purchases (1-N) → users

payment_orders ──→ candy_packages
sepay_webhook_logs ──→ payment_orders
```

---

## Chi tiết các bảng

### Domain: Users

#### `users`
Thông tin tài khoản và thống kê hoạt động đọc truyện của người dùng.

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| id | uuid | PK | |
| email | varchar | UNIQUE, NOT NULL | |
| name | varchar | NOT NULL | |
| password | varchar | NOT NULL, select:false | Bcrypt hash, không trả về mặc định |
| gender | enum | nullable | MALE / FEMALE / OTHER |
| role | enum | default: USER | USER / ADMIN |
| avatarUrl | varchar | nullable, select:false | |
| chaptersRead | int | default: 0 | Tổng số chapter đã đọc |
| recommendationTicket | int | default: 0 | Vé đề cử tích lũy |
| dailyReadCount | int | default: 0 | Số chapter đọc trong ngày (reset mỗi ngày) |
| dailyReadDate | date | nullable | Ngày tương ứng với dailyReadCount |
| dailyTicketClaimed | bool | default: false | Đã nhận vé đề cử hôm nay chưa |
| joinedAt | timestamptz | auto | |
| updatedAt | timestamptz | auto | |

> `dailyReadCount` + `dailyReadDate` + `dailyTicketClaimed` phục vụ cơ chế tặng vé đề cử khi đọc đủ số chapter mỗi ngày.

---

#### `user_wallets`
Số dư candy của từng user. Tách riêng khỏi `users` để tránh race condition khi cập nhật đồng thời.

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK → users, UNIQUE, CASCADE | OneToOne |
| balance | int | default: 0 | Số dư hiện tại — source of truth |
| totalDeposited | int | default: 0 | Tổng candy đã nạp (thống kê) |
| totalSpent | int | default: 0 | Tổng candy đã tiêu (thống kê) |
| createdAt | timestamptz | auto | |
| updatedAt | timestamptz | auto | |

> Mọi thay đổi balance phải đi kèm 1 record trong `wallet_transactions` và thực hiện trong cùng 1 DB transaction.

---

#### `user_story_reads`
Lưu chapter gần nhất user đọc của mỗi truyện — dùng cho tính năng "Đọc tiếp".

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK → users, CASCADE | |
| story_id | uuid | FK → stories, CASCADE | |
| chapter_id | uuid | FK → chapters, CASCADE | Chapter đọc gần nhất |
| lastReadAt | timestamptz | auto update | |

**Constraint:** `UNIQUE(user_id, story_id)` — mỗi user chỉ có 1 record per story, UPDATE khi đọc chapter mới.

---

#### `user_story_bookmarks`
Truyện user đang theo dõi.

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK → users, CASCADE | |
| story_id | uuid | FK → stories, CASCADE | |
| createdAt | timestamptz | auto | |

**Constraint:** `UNIQUE(user_id, story_id)`

---

#### `user_daily_reads`
Lịch sử đọc từng chapter theo ngày. Dùng để tính streak, reward, anti-cheat (đọc nhanh để farm vé).

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK → users, CASCADE | |
| chapter_id | uuid | FK → chapters, CASCADE | |
| readDate | date | NOT NULL | Ngày đọc (Date only, không có time) |

**Constraints:**
- `UNIQUE(user_id, chapter_id, readDate)` — 1 chapter chỉ tính 1 lần / ngày
- `INDEX(user_id, readDate)` — tăng tốc query "hôm nay user đọc được mấy chapter"

---

### Domain: Stories

#### `stories`
Thông tin chính của truyện kèm các cached counter để tránh COUNT(*) mỗi lần render.

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| id | uuid | PK | |
| posted_by_id | uuid | FK → users, SET NULL | Admin/author đăng truyện |
| name | varchar | NOT NULL | |
| slug | varchar | UNIQUE | Auto-generate từ name khi INSERT |
| poster | varchar | NOT NULL | URL ảnh bìa |
| author | varchar | NOT NULL | Tên tác giả thực |
| description | text | NOT NULL | |
| status | enum | NOT NULL | PENDING / COMPLETED |
| vip | bool | default: false | Truyện có chapter VIP không |
| candyReceived | int | default: 0 | Tổng candy nhận từ mở khoá chapter |
| chapterCount | int | default: 0 | Cached — cập nhật khi thêm/xoá chapter |
| nominations | int | default: 0 | Cached — cập nhật khi có nomination mới |
| rating | numeric(3,2) | default: 0 | Cached trung bình — cập nhật khi có rating mới |
| ratingCount | int | default: 0 | Cached — số lượt đánh giá |
| commentCount | int | default: 0 | Cached — cập nhật khi có comment mới |
| createdAt | timestamptz | auto | |
| updatedAt | timestamptz | auto | |

**Check constraint:** `rating >= 0 AND rating <= 5`

> Slug chỉ generate khi `@BeforeInsert()`, **không** regenerate khi UPDATE để tránh broken URL/SEO.
> Các cached counter (`chapterCount`, `nominations`, `rating`...) cần được cập nhật đồng bộ trong service khi có thay đổi.

---

#### `story_categories`
Bảng trung gian nhiều-nhiều giữa truyện và thể loại.

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| id | uuid | PK | |
| story_id | uuid | FK → stories, CASCADE | |
| category_id | uuid | FK → categories, CASCADE | |
| createdAt | timestamptz | auto | |

**Constraint:** `UNIQUE(story_id, category_id)` — 1 truyện không được gán cùng 1 thể loại 2 lần.

---

#### `story_tags`
Bảng trung gian nhiều-nhiều giữa truyện và tag.

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| id | uuid | PK | |
| story_id | uuid | FK → stories, CASCADE | |
| tag_id | uuid | FK → tags, CASCADE | |
| createdAt | timestamptz | auto | |

**Constraint:** `UNIQUE(story_id, tag_id)`

---

#### `story_ratings`
Đánh giá sao của user cho truyện.

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK → users, CASCADE | |
| story_id | uuid | FK → stories, CASCADE | |
| rating | int | NOT NULL | 1–5 sao |
| review | text | nullable | Nhận xét kèm theo |
| createdAt | timestamptz | auto | |
| updatedAt | timestamptz | auto | |

**Constraints:**
- `UNIQUE(user_id, story_id)` — mỗi user chỉ đánh giá 1 lần
- `CHECK(rating >= 1 AND rating <= 5)`

---

#### `story_comments`
Bình luận của user trên truyện.

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| id | uuid | PK | |
| story_id | uuid | FK → stories, CASCADE | |
| user_id | uuid | FK → users, CASCADE | |
| comment | text | NOT NULL | |
| createdAt | timestamptz | auto | |
| updatedAt | timestamptz | auto | |

---

#### `story_nominations`
Lượt đề cử truyện. Tách thành bảng riêng để đảm bảo mỗi user chỉ đề cử 1 lần / 1 truyện.

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| id | uuid | PK | |
| story_id | uuid | FK → stories, CASCADE | |
| user_id | uuid | FK → users, CASCADE | |
| createdAt | timestamptz | auto | |

**Constraint:** `UNIQUE(user_id, story_id)` — DB tự reject nếu user đề cử lần 2.

> Số đề cử thực tế = `COUNT(*) FROM story_nominations WHERE story_id = ?`. Field `stories.nominations` là cached counter.

---

### Domain: Chapters

#### `chapters`
Nội dung từng chương của truyện.

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| id | uuid | PK | |
| story_id | uuid | FK → stories, CASCADE | |
| number | int | NOT NULL | Số thứ tự chương |
| title | varchar | NOT NULL | |
| content | text | NOT NULL | Nội dung chương |
| wordCount | int | default: 0 | |
| views | int | default: 0 | |
| price | int | default: 0 | Số candy cần để mở khoá (0 = miễn phí) |
| createdAt | timestamptz | auto | |
| updatedAt | timestamptz | auto | |

**Constraint:** `UNIQUE(story_id, number)` — số thứ tự unique trong phạm vi 1 truyện (chương 1 của truyện A và truyện B không conflict).

---

### Domain: Categories & Tags

#### `categories`
Thể loại truyện (Tiên Hiệp, Đô Thị, Ngôn Tình...).

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| id | uuid | PK | |
| name | varchar | NOT NULL | |
| slug | varchar | UNIQUE | Auto-generate từ name |
| createdAt | timestamptz | auto | |
| updatedAt | timestamptz | auto | |

---

#### `tags`
Tag bổ sung cho truyện (Xuyên Không, Trọng Sinh, Ngọt Sủng...).

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| id | uuid | PK | |
| name | varchar | NOT NULL | |
| slug | varchar | UNIQUE | Auto-generate từ name |
| createdAt | timestamptz | auto | |
| updatedAt | timestamptz | auto | |

---

### Domain: Payments

#### `candy_packages`
Các gói nạp candy do admin cấu hình. Không hardcode tỷ giá trong code.

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| id | uuid | PK | |
| price | int | NOT NULL | Số tiền VND |
| candy | int | NOT NULL | Số candy cơ bản nhận được |
| bonus | int | default: 0 | Candy thưởng thêm khi chạy event |
| badge | varchar | NOT NULL | Label hiển thị VD: "Phổ biến", "Giá trị nhất" |
| isActive | bool | default: true | Admin bật/tắt gói mà không cần xoá |
| sortOrder | int | default: 0 | Thứ tự hiển thị trên UI |
| createdAt | timestamptz | auto | |
| updatedAt | timestamptz | auto | |

---

#### `payment_orders`
Đơn nạp tiền chờ SePay xác nhận. Mỗi đơn có `orderCode` duy nhất — user ghi vào nội dung chuyển khoản để SePay match.

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK → users, CASCADE | |
| candy_package_id | uuid | FK → candy_packages, SET NULL, nullable | null nếu nhập tay |
| orderCode | varchar | UNIQUE | VD: "NOVEL240527A1B2" — dùng làm nội dung CK |
| amountVnd | int | NOT NULL | Snapshot tại lúc tạo đơn |
| candyAmount | int | NOT NULL | Snapshot — tổng candy sẽ nhận (candy + bonus) |
| status | enum | default: PENDING | PENDING / COMPLETED / FAILED / EXPIRED |
| sepayTransactionId | varchar | nullable | ID từ SePay, có sau khi webhook về |
| paidAt | timestamptz | nullable | Thời điểm thanh toán thành công |
| expiredAt | timestamptz | NOT NULL | Sau thời gian này không chấp nhận CK nữa |
| createdAt | timestamptz | auto | |
| updatedAt | timestamptz | auto | |

> `amountVnd` và `candyAmount` được snapshot tại lúc tạo đơn để tránh bị ảnh hưởng nếu admin đổi giá gói sau.

---

#### `wallet_transactions`
Audit log đầy đủ mọi biến động số dư candy. **Không bao giờ xoá record này.**

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK → users, CASCADE | |
| type | enum | NOT NULL | TOPUP / SPEND / REFUND / BONUS |
| amount | int | NOT NULL | Dương = cộng vào, Âm = trừ ra |
| balanceBefore | int | NOT NULL | Snapshot số dư trước giao dịch |
| balanceAfter | int | NOT NULL | Snapshot số dư sau giao dịch |
| referenceType | varchar | nullable | `payment_order` / `chapter_purchase` / `bonus` |
| referenceId | uuid | nullable | ID bản ghi liên quan |
| description | varchar | NOT NULL | VD: "Nạp 50,000đ = 500 candy" |
| createdAt | timestamptz | auto | |

> `balanceBefore` + `balanceAfter` cho phép reconstruct lịch sử ngay cả khi có bug — quan trọng cho support và audit.

---

#### `chapter_purchases`
Lịch sử mua chapter VIP bằng candy. Dùng để kiểm tra quyền truy cập chapter.

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK → users, CASCADE | |
| chapter_id | uuid | FK → chapters, CASCADE | |
| story_id | uuid | FK → stories, CASCADE | Denormalized — tránh join qua chapters |
| candySpent | int | NOT NULL | Snapshot giá tại lúc mua |
| createdAt | timestamptz | auto | |

**Constraint:** `UNIQUE(user_id, chapter_id)` — không thể mua cùng 1 chapter 2 lần.

> `story_id` denormalized để query "tất cả chapter đã mua trong truyện X" chỉ cần 1 bảng, không cần join.

---

#### `sepay_webhook_logs`
Raw log từ webhook SePay. Bảo vệ chống xử lý trùng (idempotency) và cho phép replay khi có bug.

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| id | uuid | PK | |
| gatewayTransactionId | varchar | UNIQUE | ID từ SePay — chống xử lý trùng |
| payment_order_id | uuid | FK → payment_orders, SET NULL, nullable | null nếu không match được orderCode |
| rawPayload | jsonb | NOT NULL | Toàn bộ body webhook gốc |
| isProcessed | bool | default: false | |
| processedAt | timestamptz | nullable | |
| errorMessage | text | nullable | Lý do lỗi nếu xử lý thất bại |
| createdAt | timestamptz | auto | |

> SePay có thể gửi lại cùng 1 webhook nhiều lần khi network lỗi. `UNIQUE(gatewayTransactionId)` đảm bảo chỉ xử lý 1 lần duy nhất.

---

### Domain: Notifications

#### `notifications`
Thông báo gửi đến user. Thiết kế sẵn cho realtime (Socket.IO) hoặc polling.

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK → users, CASCADE | Người nhận |
| type | enum | NOT NULL | NEW_CHAPTER / NEW_COMMENT / PAYMENT_SUCCESS / SYSTEM |
| title | varchar | NOT NULL | |
| content | text | NOT NULL | |
| isRead | bool | default: false | |
| readAt | timestamptz | nullable | |
| referenceType | varchar | nullable | Loại entity liên quan để điều hướng khi click |
| referenceId | uuid | nullable | ID entity liên quan |
| metadata | jsonb | nullable | Snapshot data để render không cần query thêm |
| createdAt | timestamptz | auto | |

**`referenceType` mapping:**

| Value | Điều hướng |
|---|---|
| `chapter` | `/stories/:storyId/chapters/:chapterId` |
| `comment` | `/stories/:storyId#comment-:commentId` |
| `payment_order` | `/wallet` |
| `null` | Không điều hướng |

**`metadata` schema theo từng loại:**

| Type | metadata |
|---|---|
| `NEW_CHAPTER` | `{ storyId, storyName, storyPoster, chapterNumber, chapterTitle }` |
| `NEW_COMMENT` | `{ commentId, commenterName, commenterAvatar, storyId, storyName }` |
| `PAYMENT_SUCCESS` | `{ orderId, amountVnd, candyAmount }` |
| `SYSTEM` | `{}` — title + content là đủ |

---

## Thiết kế nổi bật

### 1. Refresh token — không lưu trong DB

Refresh token được lưu **chỉ trong Redis** với key `refresh_token:{userId}` và TTL 7 ngày. Access token (15 phút) lưu trong httpOnly cookie. Client không bao giờ nhìn thấy refresh token.

```
Redis key: refresh_token:{userId}
Value:     userId
TTL:       7 ngày
```

Khi refresh: server đọc access token (dù expired) từ cookie → giải mã lấy userId → kiểm tra Redis → rotate session → cấp access token mới.

---

### 2. Payment flow — SePay webhook

```
[1] User tạo đơn → payment_orders (PENDING) + orderCode unique
[2] User chuyển khoản với nội dung = orderCode
[3] SePay gọi POST /payments/webhook
[4] Server INSERT sepay_webhook_logs (idempotency check)
[5] Tìm payment_orders theo orderCode trong rawPayload
[6] Trong 1 DB transaction:
      UPDATE payment_orders → COMPLETED
      UPDATE user_wallets.balance += candyAmount
      INSERT wallet_transactions (TOPUP, balanceBefore, balanceAfter)
[7] INSERT notifications (PAYMENT_SUCCESS)
```

---

### 3. Cached counters trong `stories`

`chapterCount`, `nominations`, `rating`, `ratingCount`, `commentCount` được lưu trực tiếp trong `stories` để tránh COUNT/AVG mỗi lần render danh sách truyện. Source of truth vẫn là các bảng gốc — các counter này phải được cập nhật đồng bộ trong service khi có thay đổi.

---

### 4. Denormalization có chủ ý

| Bảng | Field denormalized | Lý do |
|---|---|---|
| `chapter_purchases` | `story_id` | Query "chapter đã mua của truyện X" không cần join |
| `notifications` | `metadata` (jsonb) | Render danh sách thông báo chỉ cần 1 query |
| `payment_orders` | `amountVnd`, `candyAmount` | Giá gói có thể thay đổi sau — giữ snapshot |
| `wallet_transactions` | `balanceBefore`, `balanceAfter` | Audit trail đầy đủ, không phụ thuộc state hiện tại |

---

## Tổng hợp

| Domain | Bảng | Tổng |
|---|---|---|
| Users | users, user_wallets, user_story_reads, user_story_bookmarks, user_daily_reads | 5 |
| Stories | stories, story_categories, story_tags, story_ratings, story_comments, story_nominations | 6 |
| Chapters | chapters | 1 |
| Taxonomy | categories, tags | 2 |
| Payments | candy_packages, payment_orders, wallet_transactions, chapter_purchases, sepay_webhook_logs | 5 |
| Notifications | notifications | 1 |
| **Total** | | **20** |

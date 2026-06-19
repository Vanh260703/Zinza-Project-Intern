# API Plan — Novel Web

**Base URL:** `http://localhost:4000/api`  
**Auth:** JWT Bearer token (httpOnly cookie hoặc `Authorization: Bearer <token>`)  
**OpenAPI spec:** `openapi.yaml`

---

## Quick Reference

| Domain | Endpoints |
|---|---|
| Auth | 4 |
| Users | 11 |
| Notifications | 2 |
| Stories | 8 |
| Chapters | 6 |
| Taxonomy | 4 |
| Payments | 5 |
| Admin | 9 |
| **Total** | **49** |

---

## Auth

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| POST | `/auth/register` | ✗ | Đăng ký tài khoản mới |
| POST | `/auth/login` | ✗ | Đăng nhập, nhận access token |
| POST | `/auth/refresh` | ✗ | Lấy access token mới (đọc refreshToken từ httpOnly cookie) |
| POST | `/auth/logout` | ✓ | Đăng xuất, xoá refresh token khỏi Redis |

### POST `/auth/register`
**Request:** `RegisterDto`  
**Response 201:** `{ message: string, user: { id, name, email } }`  
**Errors:** `409` email đã tồn tại

### POST `/auth/login`
**Request:** `LoginDto`  
**Response 200:** `AuthResponseDto` — access token + user info  
**Errors:** `401` sai email/password

### POST `/auth/refresh`
**Request:** httpOnly cookie `refreshToken`  
**Response 200:** `RefreshResponseDto` — access token mới  
**Errors:** `401` refresh token hết hạn hoặc không hợp lệ

### POST `/auth/logout`
**Response 200:** `{ message: "Đăng xuất thành công" }`

---

## Users

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/users/me` | ✓ | Lấy profile hiện tại |
| PATCH | `/user/profile` | ✓ | Cập nhật name / gender |
| POST | `/users/me/avatar` | ✓ | Upload ảnh đại diện (multipart) |
| PATCH | `/user/change-password` | ✓ | Đổi mật khẩu |
| GET | `/users/me/wallet` | ✓ | Lấy số dư ví candy |
| GET | `/users/me/wallet/transactions` | ✓ | Lịch sử giao dịch candy (phân trang) |
| GET | `/users/me/bookmarks` | ✓ | Danh sách truyện đã bookmark (phân trang) |
| POST | `/users/me/bookmarks` | ✓ | Thêm bookmark |
| DELETE | `/users/me/bookmarks/{storyId}` | ✓ | Xoá bookmark |
| DELETE | `/user/reading-history` | ✓ | Xoá 1 truyện khỏi lịch sử đọc |
| POST | `/user/daily-read` | ✓ | Ghi nhận đọc 1 chương (cập nhật dailyReadCount) |
| POST | `/user/daily-ticket/claim` | ✓ | Nhận vé đề cử hàng ngày (điều kiện: đọc đủ 10 chương) |

### GET `/users/me`
**Response 200:** `UserResponseDto`

### PATCH `/user/profile`
**Request:** `UpdateProfileDto` (`name?`, `gender?`)  
**Response 200:** `UserResponseDto`  
> Avatar không được cập nhật tại đây — dùng `POST /users/me/avatar`

### POST `/users/me/avatar`
**Request:** `multipart/form-data` — field `avatar` (JPG/PNG/WebP ≤ 2MB)  
**Response 200:** `{ avatarUrl: string }`  
**Errors:** `400` sai định dạng hoặc quá 2MB

### PATCH `/user/change-password`
**Request:** `ChangePasswordDto` (`currentPassword`, `newPassword`)  
**Response 200:** `{ message: string }`  
**Errors:** `400` mật khẩu hiện tại không đúng

### GET `/users/me/wallet`
**Response 200:** `WalletResponseDto`

### GET `/users/me/wallet/transactions`
**Query:** `page`, `limit`  
**Response 200:** `PaginatedResponse<WalletTransactionResponseDto>`

### GET `/users/me/bookmarks`
**Query:** `page`, `limit`  
**Response 200:** `PaginatedResponse<StorySummaryDto>`

### POST `/users/me/bookmarks`
**Request:** `{ storyId: string (uuid) }`  
**Response 201:** `{ message: string }`  
**Errors:** `409` đã bookmark rồi

### DELETE `/users/me/bookmarks/{storyId}`
**Response 200:** `{ message: string }`

### DELETE `/user/reading-history`
**Query:** `storyId` (uuid)  
**Response 200:** `{ ok: true }`

### POST `/user/daily-read`
**Request:** `{ storyId, chapterId, chapterTitle?, chapterNumber? }`  
**Response 200:** `UserResponseDto`  
> Idempotent — gọi nhiều lần cùng chapterId trong ngày chỉ tính 1 lần

### POST `/user/daily-ticket/claim`
**Response 200:** `UserResponseDto`  
**Errors:** `400` chưa đủ 10 chương / đã nhận hôm nay rồi

---

## Notifications

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/notifications` | ✓ | Lấy danh sách thông báo (phân trang) |
| PATCH | `/notifications` | ✓ | Đánh dấu tất cả đã đọc |

### GET `/notifications`
**Query:** `page`, `limit`  
**Response 200:** `PaginatedResponse<NotificationResponseDto>`

### PATCH `/notifications`
**Response 200:** `{ ok: true }`

---

## Stories

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/novels` | ✗ | Danh sách truyện (filter + phân trang) |
| POST | `/novels` | ✓ | Tạo truyện mới |
| GET | `/novels/{id}` | ✗ | Chi tiết truyện |
| PATCH | `/novels/{id}` | ✓ | Cập nhật truyện (chủ truyện / admin) |
| DELETE | `/novels/{id}` | ✓ | Xoá truyện (chủ truyện / admin) |
| GET | `/cover/{id}` | ✗ | Lấy file ảnh bìa |
| POST | `/cover/{id}` | ✓ | Upload ảnh bìa |
| POST | `/novels/{id}/nominate` | ✓ | Đề cử truyện (tốn 1 vé, UNIQUE per user per story) |
| GET | `/stories/{storyId}/ratings` | ✗ | Danh sách đánh giá (phân trang) |
| POST | `/stories/{storyId}/ratings` | ✓ | Tạo hoặc cập nhật rating của user |
| GET | `/stories/{storyId}/comments` | ✗ | Danh sách bình luận (phân trang) |
| POST | `/stories/{storyId}/comments` | ✓ | Đăng bình luận |
| DELETE | `/stories/{storyId}/comments/{commentId}` | ✓ | Xoá bình luận (chủ comment / admin) |

### GET `/novels`
**Query:** `page`, `limit`, `search?`, `status?`, `categoryId?`, `tagId?`, `vip?`, `sortBy?`, `sortOrder?`  
**Response 200:** `PaginatedResponse<StorySummaryDto>`

### POST `/novels`
**Request:** `CreateStoryDto`  
**Response 201:** `{ story: StoryResponseDto }`

### GET `/novels/{id}`
**Response 200:** `StoryResponseDto`

### PATCH `/novels/{id}`
**Request:** `UpdateStoryDto` (tất cả field optional)  
**Response 200:** `{ story: StoryResponseDto }`  
**Errors:** `403` không phải chủ truyện

### DELETE `/novels/{id}`
**Response 200:** `{ message: string }`

### POST `/cover/{id}`
**Request:** `multipart/form-data` — field `cover` (JPG/PNG/WebP ≤ 2MB)  
**Response 200:** `{ poster: string }`

### POST `/novels/{id}/nominate`
**Response 200:** `{ nominations: number, recommendationTicket: number }`  
**Errors:** `403` tự đề cử / `400` hết vé / `409` đã đề cử rồi

### POST `/stories/{storyId}/ratings`
**Request:** `RatingDto` (`score: 1–5`, `review?`)  
**Response 200:** `RatingResponseDto`  
> Upsert — tạo mới hoặc cập nhật rating hiện có của user

---

## Chapters

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/novels/{id}/chapters` | ✗ | Danh sách chương (index, không có content) |
| POST | `/novels/{id}/chapters` | ✓ | Tạo chương mới (chủ truyện) |
| GET | `/novels/{id}/chapters/{chapterId}` | ✗/✓ | Chi tiết + nội dung chương |
| PATCH | `/novels/{id}/chapters/{chapterId}` | ✓ | Cập nhật chương (chủ truyện) |
| DELETE | `/novels/{id}/chapters/{chapterId}` | ✓ | Xoá chương (chủ truyện / admin) |
| POST | `/novels/{id}/chapters/{chapterId}/unlock` | ✓ | Mua khoá chương VIP bằng candy |

### GET `/novels/{id}/chapters`
**Response 200:** `ChapterResponseDto[]` (không có field `content`)

### GET `/novels/{id}/chapters/{chapterId}`
**Response 200:** `{ chapter: ChapterResponseDto, content: string }`  
> Nếu chapter VIP và user chưa mua → trả về preview (500 từ đầu) và `isUnlocked: false`

### POST `/novels/{id}/chapters/{chapterId}/unlock`
**Response 200:** `{ ok: true, newBalance: number }`  
**Errors:** `400` số dư không đủ / chương miễn phí / đã mua rồi

---

## Taxonomy

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/categories` | ✗ | Lấy tất cả thể loại |
| POST | `/categories` | ✓ Admin | Tạo thể loại mới |
| GET | `/tags` | ✗ | Lấy tất cả tag |
| POST | `/tags` | ✓ Admin | Tạo tag mới |

---

## Payments

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/payments/packages` | ✗ | Lấy các gói candy đang active |
| POST | `/payments/orders` | ✓ | Tạo đơn nạp tiền, nhận `orderCode` để chuyển khoản |
| GET | `/payments/orders` | ✓ | Lịch sử đơn nạp tiền của user (phân trang) |
| GET | `/payments/orders/{id}` | ✓ | Chi tiết đơn |
| POST | `/payments/webhook` | SePay | Webhook từ SePay xác nhận thanh toán |

### POST `/payments/orders`
**Request:** `CreatePaymentOrderDto` (`packageId`)  
**Response 201:** `PaymentOrderResponseDto` — có `orderCode` để user ghi vào nội dung CK  
> `expiredAt` = 15 phút sau khi tạo đơn

### POST `/payments/webhook`
**Request:** `SepayWebhookDto` — xác thực bằng SePay API key trong header  
**Response 200:** `{ success: true }`  
> Idempotent — `gatewayTransactionId` UNIQUE, gọi nhiều lần chỉ xử lý 1 lần

---

## Admin

> Tất cả endpoint trong nhóm này yêu cầu `role = ADMIN`.

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/admin/stats` | ✓ Admin | Thống kê tổng quan hệ thống |
| GET | `/admin/users` | ✓ Admin | Danh sách tất cả user (phân trang + search) |
| GET | `/admin/users/{id}` | ✓ Admin | Chi tiết user |
| PATCH | `/admin/users/{id}` | ✓ Admin | Cập nhật role / trạng thái user |
| POST | `/admin/users/{id}/topup` | ✓ Admin | Cộng candy thủ công cho user |
| GET | `/admin/candy-packages` | ✓ Admin | Danh sách tất cả gói candy (kể cả inactive) |
| POST | `/admin/candy-packages` | ✓ Admin | Tạo gói candy mới |
| PATCH | `/admin/candy-packages/{id}` | ✓ Admin | Cập nhật gói candy |
| DELETE | `/admin/candy-packages/{id}` | ✓ Admin | Xoá gói candy |

### POST `/admin/users/{id}/topup`
**Request:** `AdminTopupDto` (`amount`, `description`)  
**Response 200:** `{ wallet: WalletResponseDto, transaction: WalletTransactionResponseDto }`  
> Ghi vào `wallet_transactions` với `type = BONUS`

---

## Business Rules

| Rule | Chi tiết |
|---|---|
| Đề cử | UNIQUE(user_id, story_id) — không thể đề cử lần 2 cùng truyện |
| Vé đề cử | Nhận 1 vé/ngày khi đọc đủ 10 chương (`dailyTicketClaimed`) |
| Mua chapter | UNIQUE(user_id, chapter_id) — không thể mua lại |
| Wallet | Mọi thay đổi balance phải có record `wallet_transactions` trong cùng DB transaction |
| SePay idempotency | `gatewayTransactionId` UNIQUE — webhook retry không gây xử lý 2 lần |
| Slug | Chỉ generate lúc `@BeforeInsert()`, không đổi khi UPDATE |
| Avatar | Upload riêng qua `POST /users/me/avatar`, không dùng PATCH profile |

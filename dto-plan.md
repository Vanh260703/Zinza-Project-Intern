# DTO Plan — Novel Web

**Location:** `src/dto/`  
**Tech:** NestJS + `class-validator` + `@nestjs/swagger`  
**Export:** Tất cả re-export từ `src/dto/index.ts`

---

## Shared Shapes

### Pagination Response

Mọi endpoint trả danh sách đều dùng cấu trúc sau:

```ts
{
  data: T[];
  meta: {
    page: number;        // trang hiện tại (bắt đầu từ 1)
    limit: number;       // số item mỗi trang
    total: number;       // tổng số record
    totalPages: number;  // tổng số trang
    hasNext: boolean;    // còn trang tiếp không
    hasPrev: boolean;    // có trang trước không
  };
}
```

**Query params chung cho endpoint có phân trang:**

| Param | Type | Default | Constraint |
|---|---|---|---|
| `page` | number | 1 | min: 1 |
| `limit` | number | 20 | min: 1, max: 100 |

---

### Error Response Shape

```ts
{
  statusCode: number;    // HTTP status code
  message: string;       // mô tả lỗi (string hoặc string[])
  error: string;         // tên lỗi HTTP ("Bad Request", "Unauthorized", v.v.)
  timestamp: string;     // ISO 8601
  path: string;          // request path
}
```

**Ví dụ 400 Validation Error:**
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password must be at least 6 characters"],
  "error": "Bad Request",
  "timestamp": "2026-06-16T10:00:00.000Z",
  "path": "/api/auth/register"
}
```

**Ví dụ 401:**
```json
{
  "statusCode": 401,
  "message": "Sai email hoặc mật khẩu",
  "error": "Unauthorized",
  "timestamp": "2026-06-16T10:00:00.000Z",
  "path": "/api/auth/login"
}
```

**Mã lỗi thường gặp:**

| Code | Tình huống |
|---|---|
| 400 | Validation thất bại, business rule vi phạm |
| 401 | Chưa đăng nhập hoặc token hết hạn |
| 403 | Không có quyền (sai user, sai role) |
| 404 | Resource không tồn tại |
| 409 | Conflict (email trùng, đã mua rồi, đã bookmark rồi) |
| 500 | Lỗi server không mong đợi |

---

## Enums

**File:** `src/dto/enums.ts`

| Enum | Values |
|---|---|
| `UserRole` | `USER`, `ADMIN` |
| `Gender` | `MALE`, `FEMALE`, `OTHER` |
| `StoryStatus` | `PENDING`, `COMPLETED` |
| `WalletTransactionType` | `TOPUP`, `SPEND`, `REFUND`, `BONUS` |
| `NotificationType` | `NEW_CHAPTER`, `NEW_COMMENT`, `PAYMENT_SUCCESS`, `SYSTEM` |
| `PaymentOrderStatus` | `PENDING`, `COMPLETED`, `FAILED`, `EXPIRED` |

---

## Auth

**File:** `src/dto/auth.dto.ts`

### Request DTOs

#### `RegisterDto`

| Field | Type | Required | Validation |
|---|---|---|---|
| `email` | string | ✓ | `@IsEmail()` |
| `password` | string | ✓ | `@MinLength(6)` |
| `name` | string | ✓ | `@MinLength(2)`, `@MaxLength(50)` |
| `gender` | `Gender` | ✗ | `@IsEnum(Gender)` |

#### `LoginDto`

| Field | Type | Required | Validation |
|---|---|---|---|
| `email` | string | ✓ | `@IsEmail()` |
| `password` | string | ✓ | `@IsNotEmpty()` |

### Response DTOs

#### `AuthUserPayloadDto`

| Field | Type | Mô tả |
|---|---|---|
| `id` | string (uuid) | ID user |
| `email` | string | Email user |
| `name` | string | Tên hiển thị |
| `role` | `UserRole` | Vai trò |

#### `AuthResponseDto`

| Field | Type | Mô tả |
|---|---|---|
| `accessToken` | string | JWT access token (15 phút) |
| `user` | `UserResponseDto` | Thông tin đầy đủ của user (tất cả field) |

#### `RefreshResponseDto`

| Field | Type | Mô tả |
|---|---|---|
| `accessToken` | string | JWT access token mới |

---

## Users

**File:** `src/dto/user.dto.ts`

### Request DTOs

#### `UpdateProfileDto`

| Field | Type | Required | Validation |
|---|---|---|---|
| `name` | string | ✗ | `@MinLength(2)`, `@MaxLength(50)` |
| `gender` | `Gender` | ✗ | `@IsEnum(Gender)` |

> `avatarUrl` **không có** trong DTO này — upload riêng qua `POST /users/me/avatar`

#### `ChangePasswordDto`

| Field | Type | Required | Validation |
|---|---|---|---|
| `currentPassword` | string | ✓ | `@IsNotEmpty()` |
| `newPassword` | string | ✓ | `@MinLength(6)` |

### Response DTOs

#### `UserResponseDto`

| Field | Type | Nullable | Mô tả |
|---|---|---|---|
| `id` | string (uuid) | | ID user |
| `email` | string | | Email |
| `name` | string | | Tên hiển thị |
| `gender` | `Gender` | ✓ | Giới tính |
| `role` | `UserRole` | | Vai trò |
| `avatarUrl` | string | ✓ | URL ảnh đại diện |
| `chaptersRead` | number | | Tổng chương đã đọc |
| `recommendationTicket` | number | | Số vé đề cử hiện có |
| `dailyReadCount` | number | | Số chương đọc hôm nay |
| `dailyReadDate` | string (date) | ✓ | Ngày của dailyReadCount |
| `dailyTicketClaimed` | boolean | | Đã nhận vé hôm nay chưa |
| `joinedAt` | string (date-time) | | Ngày tạo tài khoản |
| `updatedAt` | string (date-time) | | Lần cập nhật cuối |

#### `UploadAvatarResponseDto`

| Field | Type | Mô tả |
|---|---|---|
| `avatarUrl` | string | URL ảnh đại diện mới |

#### `WalletResponseDto`

| Field | Type | Mô tả |
|---|---|---|
| `id` | string (uuid) | ID ví |
| `userId` | string (uuid) | ID user sở hữu |
| `balance` | number | Số dư candy hiện tại |
| `totalDeposited` | number | Tổng candy đã nạp |
| `totalSpent` | number | Tổng candy đã tiêu |
| `updatedAt` | string (date-time) | Lần cập nhật cuối |

#### `WalletTransactionResponseDto`

| Field | Type | Nullable | Mô tả |
|---|---|---|---|
| `id` | string (uuid) | | ID giao dịch |
| `userId` | string (uuid) | | ID user |
| `type` | `WalletTransactionType` | | Loại giao dịch |
| `amount` | number | | Số candy (+ nhận, − tiêu) |
| `balanceBefore` | number | | Số dư trước giao dịch (snapshot) |
| `balanceAfter` | number | | Số dư sau giao dịch (snapshot) |
| `description` | string | ✓ | Mô tả giao dịch |
| `referenceId` | string (uuid) | ✓ | orderId hoặc chapterId liên quan |
| `createdAt` | string (date-time) | | Thời điểm giao dịch |

#### `NotificationResponseDto`

| Field | Type | Nullable | Mô tả |
|---|---|---|---|
| `id` | string (uuid) | | ID thông báo |
| `userId` | string (uuid) | | ID user nhận |
| `type` | `NotificationType` | | Loại thông báo |
| `title` | string | | Tiêu đề |
| `content` | string | | Nội dung |
| `isRead` | boolean | | Đã đọc chưa |
| `referenceId` | string (uuid) | ✓ | storyId/chapterId/orderId liên quan |
| `createdAt` | string (date-time) | | Thời điểm tạo |

---

## Stories

**File:** `src/dto/story.dto.ts`

### Request DTOs

#### `CreateStoryDto`

| Field | Type | Required | Validation |
|---|---|---|---|
| `name` | string | ✓ | `@MaxLength(200)` |
| `author` | string | ✓ | `@MaxLength(100)` |
| `description` | string | ✓ | không giới hạn |
| `status` | `StoryStatus` | ✓ | `@IsEnum(StoryStatus)` |
| `vip` | boolean | ✓ | `@IsBoolean()` |
| `categoryIds` | string[] (uuid[]) | ✓ | `@IsUUID('4', { each: true })` |
| `tagIds` | string[] (uuid[]) | ✗ | `@IsUUID('4', { each: true })` |

#### `UpdateStoryDto`

Tất cả field từ `CreateStoryDto` đều là optional (`@IsOptional()`).

#### `StoryQueryDto`

| Field | Type | Default | Constraint |
|---|---|---|---|
| `page` | number | 1 | min: 1 |
| `limit` | number | 20 | min: 1, max: 100 |
| `search` | string | — | `@IsOptional()` |
| `status` | `StoryStatus` | — | `@IsOptional()` |
| `categoryId` | string (uuid) | — | `@IsOptional()` |
| `tagId` | string (uuid) | — | `@IsOptional()` |
| `vip` | boolean | — | `@IsOptional()` |
| `sortBy` | `'views'\|'nominations'\|'rating'\|'createdAt'` | `'createdAt'` | |
| `sortOrder` | `'ASC'\|'DESC'` | `'DESC'` | |

#### `RatingDto`

| Field | Type | Required | Validation |
|---|---|---|---|
| `score` | number | ✓ | `@Min(1)`, `@Max(5)`, `@IsInt()` |
| `review` | string | ✗ | `@MaxLength(1000)` |

#### `CommentDto`

| Field | Type | Required | Validation |
|---|---|---|---|
| `content` | string | ✓ | `@MinLength(1)`, `@MaxLength(500)` |

### Response DTOs

#### `StorySummaryDto`

| Field | Type | Nullable | Mô tả |
|---|---|---|---|
| `id` | string (uuid) | | ID truyện |
| `name` | string | | Tên truyện |
| `slug` | string | | Slug URL (immutable) |
| `author` | string | | Tên tác giả |
| `status` | `StoryStatus` | | Trạng thái |
| `vip` | boolean | | Truyện VIP không |
| `views` | number | | Tổng lượt xem |
| `nominations` | number | | Tổng lượt đề cử |
| `candyReceived` | number | | Tổng candy nhận được |
| `averageRating` | number | ✓ | Điểm đánh giá TB |
| `posterUrl` | string | ✓ | URL ảnh bìa |
| `postedBy` | string (uuid) | | ID user đăng |
| `createdAt` | string (date-time) | | Ngày đăng |

#### `StoryResponseDto` — extends `StorySummaryDto`

Thêm các field sau:

| Field | Type | Nullable | Mô tả |
|---|---|---|---|
| `description` | string | | Mô tả truyện |
| `ratingCount` | number | | Số lượt rating |
| `commentCount` | number | | Số bình luận |
| `updatedAt` | string (date-time) | | Lần cập nhật cuối |
| `categories` | `{ id, name }[]` | | Danh sách thể loại |
| `tags` | `{ id, name }[]` | | Danh sách tag |

#### `RatingResponseDto`

| Field | Type | Mô tả |
|---|---|---|
| `id` | string (uuid) | ID rating |
| `userId` | string (uuid) | ID user |
| `storyId` | string (uuid) | ID truyện |
| `score` | number | Điểm 1–5 |
| `review` | string (nullable) | Nhận xét |
| `createdAt` | string (date-time) | Thời điểm |

#### `CommentResponseDto`

| Field | Type | Mô tả |
|---|---|---|
| `id` | string (uuid) | ID comment |
| `userId` | string (uuid) | ID user |
| `storyId` | string (uuid) | ID truyện |
| `content` | string | Nội dung |
| `user` | `{ id, name, avatarUrl }` | Thông tin user rút gọn |
| `createdAt` | string (date-time) | Thời điểm |

---

## Chapters

**File:** `src/dto/chapter.dto.ts`

### Request DTOs

#### `CreateChapterDto`

| Field | Type | Required | Validation |
|---|---|---|---|
| `number` | number | ✓ | `@IsInt()`, `@Min(1)` |
| `title` | string | ✓ | `@MaxLength(200)` |
| `content` | string | ✓ | `@MinLength(1)` |
| `price` | number | ✗ | `@IsInt()`, `@Min(0)` — 0 = miễn phí |

#### `UpdateChapterDto`

Tất cả field từ `CreateChapterDto` đều là optional.

### Response DTOs

#### `ChapterResponseDto`

| Field | Type | Nullable | Mô tả |
|---|---|---|---|
| `id` | string (uuid) | | ID chương |
| `storyId` | string (uuid) | | ID truyện |
| `number` | number | | Số thứ tự chương |
| `title` | string | | Tiêu đề |
| `content` | string | ✓ | Nội dung (null trong list endpoint) |
| `price` | number | | Giá candy (0 = miễn phí) |
| `wordCount` | number | | Số từ |
| `views` | number | | Lượt xem |
| `isUnlocked` | boolean | | User đã mua chương chưa |
| `createdAt` | string (date-time) | | Ngày tạo |
| `updatedAt` | string (date-time) | | Lần cập nhật cuối |

---

## Payments

**File:** `src/dto/payment.dto.ts`

### Request DTOs

#### `CreatePaymentOrderDto`

| Field | Type | Required | Validation |
|---|---|---|---|
| `packageId` | string (uuid) | ✓ | `@IsUUID('4')` |

#### `SepayWebhookDto`

Payload từ SePay — không validate bằng class-validator thông thường, xác thực qua SePay API key trong header `Authorization`.

| Field | Type | Nullable | Mô tả |
|---|---|---|---|
| `id` | number | | ID giao dịch nội bộ SePay |
| `gateway` | string | | Ngân hàng ("MBBank", "Vietcombank", …) |
| `transactionDate` | string | | Thời gian giao dịch (format SePay) |
| `accountNumber` | string | | Số tài khoản nhận |
| `subAccount` | string | ✓ | Tài khoản phụ (nếu có) |
| `transferAmount` | number | | Số tiền VND |
| `accumulated` | number | | Số dư tích luỹ sau giao dịch |
| `code` | string | ✓ | Mã ngân hàng (nullable) |
| `content` | string | | Nội dung chuyển khoản (chứa `orderCode`) |
| `referenceCode` | string | | Mã tham chiếu nội bộ SePay |
| `transferType` | `'in'\|'out'` | | Chiều tiền |

> Idempotency: BE lưu `referenceCode` → `gatewayTransactionId` (UNIQUE constraint). Nếu đã xử lý rồi → trả 200 ngay không xử lý lại.

### Response DTOs

#### `CandyPackageResponseDto`

| Field | Type | Mô tả |
|---|---|---|
| `id` | string (uuid) | ID gói |
| `name` | string | Tên gói ("100 Candy", …) |
| `priceVnd` | number | Giá VND |
| `candyAmount` | number | Số candy chính |
| `bonusCandy` | number | Candy thưởng thêm |
| `isActive` | boolean | Đang active không |
| `createdAt` | string (date-time) | Ngày tạo |

#### `PaymentOrderResponseDto`

| Field | Type | Nullable | Mô tả |
|---|---|---|---|
| `id` | string (uuid) | | ID đơn hàng |
| `userId` | string (uuid) | | ID user tạo đơn |
| `packageId` | string (uuid) | | ID gói candy |
| `orderCode` | string | | Mã user ghi vào nội dung CK |
| `amountVnd` | number | | Số tiền VND cần CK |
| `candyAmount` | number | | Candy sẽ nhận sau thanh toán |
| `status` | `PaymentOrderStatus` | | Trạng thái đơn |
| `expiredAt` | string (date-time) | | Hết hạn sau 15 phút |
| `completedAt` | string (date-time) | ✓ | Thời điểm thanh toán thành công |
| `createdAt` | string (date-time) | | Thời điểm tạo |

---

## Admin

**File:** `src/dto/admin.dto.ts`

### Request DTOs

#### `AdminTopupDto`

| Field | Type | Required | Validation |
|---|---|---|---|
| `amount` | number | ✓ | `@IsInt()`, `@Min(1)` |
| `description` | string | ✓ | `@IsNotEmpty()`, `@MaxLength(200)` |

#### `AdminUpdateUserDto`

| Field | Type | Required | Validation |
|---|---|---|---|
| `name` | string | ✗ | `@MinLength(2)`, `@MaxLength(50)` |
| `role` | `UserRole` | ✗ | `@IsEnum(UserRole)` |
| `gender` | `Gender` | ✗ | `@IsEnum(Gender)` |
| `recommendationTicket` | number | ✗ | `@IsInt()`, `@Min(0)` |

### Response DTOs

#### `AdminStatsResponseDto`

| Field | Type | Mô tả |
|---|---|---|
| `totalUsers` | number | Tổng số user |
| `totalStories` | number | Tổng số truyện |
| `totalChapters` | number | Tổng số chương |
| `totalRevenue` | number | Tổng doanh thu VND |
| `totalCandySold` | number | Tổng candy đã bán |
| `newUsersToday` | number | User mới hôm nay |
| `newStoriesThisMonth` | number | Truyện mới tháng này |
| `pendingOrders` | number | Đơn đang chờ thanh toán |

---

## Barrel Export

**File:** `src/dto/index.ts`

```ts
export * from './enums';
export * from './auth.dto';
export * from './user.dto';
export * from './story.dto';
export * from './chapter.dto';
export * from './payment.dto';
export * from './admin.dto';
```

# NovelWeb

Nền tảng đọc truyện chữ trực tuyến — đọc, bình luận, đánh giá, theo dõi truyện; tác giả tự đăng và quản lý truyện; hệ thống tiền ảo "kẹo" (candy) để mở khoá chương trả phí và ủng hộ tác giả, nạp qua chuyển khoản ngân hàng (SePay webhook).

## Kiến trúc

Monorepo gồm 2 app độc lập:

```
demo/
  Backend/   — NestJS API (TypeScript, PostgreSQL, Redis)
  Frontend/  — Next.js 15 App Router (TypeScript)
```

- `Backend` expose REST API tại `/api/v1/*`.
- `Frontend` không gọi thẳng Backend từ component — mọi request đi qua lớp proxy `src/app/api/**` (pattern Backend-For-Frontend), giữ cookie httpOnly an toàn phía server.
- Auth: JWT access token (cookie httpOnly, ngắn hạn) + refresh token opaque lưu Redis, tự xoay vòng.

## Chạy nhanh bằng Docker

Yêu cầu: Docker + Docker Compose.

```bash
cp Backend/.env.example Backend/.env
# điền JWT_SECRET_KEY, CLOUDINARY_*, MAIL_USER/MAIL_PASSWORD, SEPAY_SECRET_KEY, BANK_* vào Backend/.env

docker compose up -d --build
```

Sau khi lên xong:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000/api/v1
- PostgreSQL: `localhost:5432` (user/pass/db: `novelweb`)
- Redis: `localhost:6379`

`docker-compose.yml` tự tạo network nội bộ giữa 4 service, Backend chỉ khởi động sau khi Postgres + Redis healthy. Xem `Backend/Dockerfile` và `Frontend/Dockerfile` để hiểu build multi-stage (tách stage build khỏi image chạy thật, không mang theo source code / devDependencies).

## Chạy thủ công (không Docker)

Cần cài sẵn: Node.js 22+, PostgreSQL, Redis.

### Backend

```bash
cd Backend
cp .env.example .env   # điền đầy đủ biến môi trường
npm install
npm run start:dev      # http://localhost:8000
```

`synchronize: true` — TypeORM tự đồng bộ schema theo entity lúc dev, không cần chạy migration.

### Frontend

```bash
cd Frontend
npm install
npm run dev             # http://localhost:3000
```

Frontend cần biến môi trường `NEXT_PUBLIC_API_URL` trỏ tới Backend (mặc định `http://localhost:8000` nếu không set).

## Biến môi trường Backend

| Biến | Mô tả |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL |
| `JWT_SECRET_KEY` | Khoá ký JWT (hex 64 ký tự) |
| `REDIS_URL` | Mặc định `redis://localhost:6379` |
| `CLOUDINARY_NAME` / `_API_KEY` / `_API_SECRET` | Lưu trữ ảnh bìa truyện, avatar |
| `MAIL_USER` / `MAIL_PASSWORD` | Gmail + app password, gửi email quên mật khẩu |
| `SEPAY_SECRET_KEY` | Xác thực chữ ký webhook SePay (nạp kẹo) |
| `BANK_ID` / `BANK_ACCOUNT_NO` | Dựng QR chuyển khoản khi tạo đơn nạp kẹo |
| `ACCESS_TOKEN_EXPIRES_IN` / `REFRESH_TOKEN_EXPIRES_IN_DAYS` | Thời hạn token |

Xem đầy đủ tại [`Backend/.env.example`](./Backend/.env.example).

## Tính năng chính

- **Độc giả**: trang chủ (mới/hot/VIP/xếp hạng), tìm kiếm & lọc, đọc chương (miễn phí/trả phí), bình luận, đánh giá, theo dõi, lịch sử đọc, vé đề cử hằng ngày, ví kẹo (nạp/tặng), lịch sử giao dịch, thông báo real-time.
- **Tác giả**: đăng/sửa/xoá truyện, quản lý chương, upload bìa, import truyện hàng loạt bằng file `.zip` (xử lý nền qua BullMQ).
- **Admin**: dashboard thống kê, quản lý user, nạp kẹo thủ công, quản lý truyện toàn hệ thống, phân quyền.
- **Thanh toán thật**: tạo đơn nạp kẹo → QR động → webhook SePay xác nhận → cộng kẹo + thông báo tự động.

## Công nghệ

**Backend**: NestJS 11, TypeORM, PostgreSQL, Redis (ioredis), BullMQ, JWT + Passport, Cloudinary, Nodemailer.
**Frontend**: Next.js 15 (App Router), React 19, TypeScript, TanStack React Query, Zustand, React Hook Form + Zod, Tailwind CSS 4.

## Lệnh hữu ích

```bash
# Backend (trong Backend/)
npm run start:dev   # dev server hot-reload
npm run build        # compile dist/
npm run lint          # ESLint --fix
npx tsc --noEmit       # type-check

# Frontend (trong Frontend/)
npm run dev   # dev server
npm run build   # production build
npm run lint     # Next.js ESLint
npm run test      # Playwright e2e
```

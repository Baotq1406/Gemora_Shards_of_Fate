# Gemora backend — bước nền database

Đã có NestJS 12.3.2, Prisma ORM 7.10.1, PostgreSQL adapter và migration tạo User, PlayerProfile, AuthSession. Chưa có API đăng ký/đăng nhập và chưa nối giao diện. Node.js 24; chạy các lệnh dưới đây từ **gốc repository**. Prisma dùng bản vá 7.10.1 thay cho 7.10.0 trong bài học cũ để khắc phục cảnh báo dependency; cả CLI, Client và adapter được khóa cùng phiên bản.

## 1. Chuẩn bị PostgreSQL một lần trên mỗi máy phát triển

Trong pgAdmin, kết nối bằng tài khoản quản trị postgres:

1. Chuột phải Login/Group Roles → Create → Login/Group Role. Name: `gemora_app`; Definition: đặt mật khẩu riêng; Privileges: bật Can login, giữ các quyền khác tắt; Save.
2. Chuột phải Databases → Create → Database. Name: `gemora_dev`; Owner: `gemora_app`; Save.
3. Tạo tiếp `gemora_shadow`, Owner: `gemora_app`.

Không tạo lại nếu các đối tượng đã tồn tại. `gemora_shadow` dành riêng cho Prisma thử lịch sử migration; không chứa dữ liệu cần giữ. Cách này không yêu cầu cấp CREATEDB/superuser cho gemora_app. PostgreSQL phải đang chạy và nhận kết nối tại 127.0.0.1:5432.

## 2. Cấu hình và khởi chạy

```powershell
npm ci
# Chỉ copy nếu chưa có .env; không ghi đè cấu hình đang dùng.
if (!(Test-Path apps/game-server/.env)) {
  Copy-Item apps/game-server/.env.example apps/game-server/.env
}
```

Mở `apps/game-server/.env`, thay `REPLACE_WITH_URL_ENCODED_PASSWORD` trong cả hai URL bằng mật khẩu gemora_app đã URL-encode. Ví dụ `@` → `%40`, `#` → `%23`, `%` → `%25`; chỉ encode phần mật khẩu. Không gửi mật khẩu vào chat hoặc commit .env. `.env.example` chỉ chứa placeholder.

```powershell
npm run db:migrate:apply
npm run db:generate
npm run db:check
npm run dev:server
```

- `http://127.0.0.1:3000/api/v1/health`: server đang chạy.
- `http://127.0.0.1:3000/api/v1/health/ready`: kiểm tra kết nối và ba bảng auth; trả 503 khi chưa sẵn sàng.
- Nếu máy khác cần truy cập API, đổi HOST thành `0.0.0.0`, cho phép cổng 3000 trong mạng Private của Windows Firewall, dùng IP LAN máy server. Không cần mở cổng database cho trình duyệt.

Build/chạy bản đã biên dịch:

```powershell
npm run build:server
npm run start:server
```

Build/schema validation/generate không cần mật khẩu hoặc PostgreSQL. Chạy backend, migration và db:check cần kết nối thật. Backend không tự chạy migration lúc khởi động. Source ESM dùng decorator NestJS, tsx cho dev, TypeScript compile sang JavaScript cho start.

## 3. Đồng bộ thay đổi trong nhóm

Người sửa cấu trúc: sửa `prisma/schema.prisma`, rồi:

```powershell
npm run db:migrate:create -- --name add_user_avatar
# Đọc migration.sql mới; sửa SQL khi cần giữ dữ liệu cột đổi tên.
npm run db:migrate:dev
npm run db:generate
npm run typecheck:server
```

Commit schema, toàn bộ migration mới và code liên quan; không sửa migration đã chia sẻ. Mỗi người có DB dev/shadow riêng. Không sửa cấu trúc bằng pgAdmin, không dùng db push thay migration và không reset database có dữ liệu cần giữ.

Người nhận code: pull, `npm ci`, `npm run db:migrate:apply`, `npm run db:generate`. Migration chỉ đồng bộ cấu trúc, không sao chép dữ liệu tài khoản. Bước này chưa cần seed: database auth bắt đầu trống, không tạo tài khoản mặc định. Nội dung game sẽ có seed riêng sau.

CI/production: generate/build và áp dụng migration trong bước triển khai có kiểm soát; không dùng migrate dev. Tách tài khoản migration khỏi tài khoản runtime khi triển khai công khai; sao lưu trước thay đổi dữ liệu quan trọng. `gemora_app` sở hữu DB ở đây là cấu hình local.

## 4. Kiểm chứng

```powershell
npm run db:validate
npm run typecheck:server
npm run db:status
```

Test tích hợp dùng database riêng tên kết thúc bằng `_test`. Tạo ví dụ `gemora_auth_test` với owner phù hợp, rồi trong PowerShell (điền URL thật tại máy; không commit):

```powershell
$env:TEST_DATABASE_URL = 'postgresql://USER:PASSWORD@127.0.0.1:5432/gemora_auth_test?schema=public'
$savedDatabaseUrl = $env:DATABASE_URL
try {
  $env:DATABASE_URL = $env:TEST_DATABASE_URL
  npm run db:migrate:apply
  if ($LASTEXITCODE -ne 0) { throw 'Migration test thất bại' }
  npm run test:db
} finally {
  $env:DATABASE_URL = $savedDatabaseUrl
  Remove-Item Env:TEST_DATABASE_URL -ErrorAction SilentlyContinue
}
```

Test kiểm tra unique email/profile/token, foreign key, rollback, cascade và HTTP health/readiness. Dữ liệu test nằm trong transaction rollback. Không dùng DB dev/production để chạy test. Kiểm tra migration không có thay đổi pending bằng cách chạy db:migrate:apply lần hai.

Đã kiểm chứng ngày 02/11/2026 trên PostgreSQL 18 tạm, với role không có SUPERUSER/CREATEDB:
build đạt; 7/7 test tích hợp đạt; migrate deploy lần đầu thành công và lần hai không có
migration pending; replay migration qua shadow database không khác schema; bản JavaScript
đã biên dịch khởi động và trả readiness 200. Đây là kết quả trên database kiểm thử,
không phải xác nhận đã thiết lập gemora_dev trên máy người dùng.

## 5. Xử lý lỗi thường gặp

- Kết nối thất bại: kiểm tra dịch vụ PostgreSQL, host/port và mật khẩu trong .env; dùng đúng gemora_app thay vì mật khẩu postgres.
- Database không tồn tại: hoàn thành bước 1; không dùng reset để sửa lỗi cấu hình.
- Health ready trả 503: chạy db:status, db:migrate:apply và db:check.
- Migrate dev báo thiếu quyền tạo database: kiểm tra SHADOW_DATABASE_URL trỏ đúng gemora_shadow, owner là gemora_app.
- PORT đang dùng: đổi PORT trong .env. Không chạy đồng thời dev và start trên cùng cổng.

Tham khảo: [Prisma Migrate 7](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/development-and-production), [NestJS](https://docs.nestjs.com/first-steps).

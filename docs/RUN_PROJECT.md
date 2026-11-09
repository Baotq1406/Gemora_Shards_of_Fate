# Hướng dẫn chạy Gemora: Shards of Fate

Tài liệu dành cho môi trường phát triển local trên Windows/PowerShell, đối chiếu với mã nguồn ngày 09/11/2026. Chạy các lệnh trong **thư mục gốc dự án**, nơi có `package.json` và `package-lock.json`.

## 1. Các phần của dự án

| Thành phần | Lệnh chạy | Địa chỉ mặc định |
| --- | --- | --- |
| API/backend | `npm run dev:server` | http://127.0.0.1:3000/api/v1/health |
| Giao diện game | `npm run dev:game` | http://localhost:8080 |
| Trang quản trị | `npm run dev:admin` | http://localhost:8081 |

Muốn đăng ký, đăng nhập và lưu hồ sơ người chơi, cần PostgreSQL, API và giao diện game cùng chạy. Trang quản trị hiện dùng dữ liệu mẫu trong bộ nhớ, có thể chạy riêng; tải lại trang sẽ khôi phục dữ liệu mẫu. Gameplay còn đang phát triển.

## 2. Chuẩn bị lần đầu

### 2.1. Công cụ cần có

- **Node.js 24.x kèm npm**: backend khai báo phiên bản `>=24 <25`.
- **PostgreSQL** và pgAdmin để tạo tài khoản/database. Tài liệu backend ghi nhận kiểm chứng trên PostgreSQL 18.6; migration hồ sơ dùng collation `pg_catalog.pg_c_utf8`, nên dùng môi trường tương ứng để tránh khác biệt.
- Mã nguồn dự án đã có trên máy.

Mở PowerShell tại thư mục dự án. Với đường dẫn trên máy hiện tại:

```powershell
Set-Location 'D:\DNTN\Gemora_Shards_of_Fate'
node --version
npm --version
```

Kết quả Node cần là `v24.x.x`. Nếu vừa cài Node, mở lại terminal để nhận PATH mới. Nếu PowerShell chặn `npm.ps1`, dùng `npm.cmd` thay cho `npm` trong các lệnh bên dưới.

### 2.2. Cài thư viện

```powershell
npm ci
```

Lệnh cài các workspace theo lockfile; không cần cài riêng trong từng thư mục app. Cần kết nối mạng để tải thư viện. Nếu lệnh thất bại, xử lý lỗi trước khi tiếp tục.

### 2.3. Tạo tài khoản và database PostgreSQL

Mở pgAdmin, kết nối PostgreSQL bằng tài khoản quản trị `postgres`:

1. Trong **Login/Group Roles**, tạo role `gemora_app`, đặt mật khẩu riêng và bật **Can login**. Không cần bật Superuser hoặc Create databases.
2. Trong **Databases**, tạo database `gemora_dev`, chọn owner là `gemora_app` và encoding **UTF8**.
3. Tạo database `gemora_shadow` với cùng owner và encoding.

Không tạo lại nếu đã có. `gemora_dev` giữ dữ liệu phát triển; `gemora_shadow` dành riêng cho Prisma kiểm tra lịch sử khi tạo migration, không dùng để lưu dữ liệu cần giữ. Việc áp dụng migration có sẵn dùng `gemora_dev`.

Các ví dụ bên dưới giả định PostgreSQL đang chạy tại `127.0.0.1:5432`.

### 2.4. Cấu hình backend

Tạo file cấu hình nếu chưa tồn tại:

```powershell
if (!(Test-Path 'apps/game-server/.env')) {
  Copy-Item 'apps/game-server/.env.example' 'apps/game-server/.env'
}
```

Mở `apps/game-server/.env` trong trình soạn thảo và điền cấu hình:

```dotenv
DATABASE_URL="postgresql://gemora_app:REPLACE_WITH_URL_ENCODED_PASSWORD@127.0.0.1:5432/gemora_dev?schema=public"
SHADOW_DATABASE_URL="postgresql://gemora_app:REPLACE_WITH_URL_ENCODED_PASSWORD@127.0.0.1:5432/gemora_shadow?schema=public"
HOST=127.0.0.1
PORT=3000
APP_ORIGIN=http://localhost:8080
SESSION_TTL_DAYS=7
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8080/api/v1/auth/google/callback
```

Thay placeholder trong **cả hai URL** bằng mật khẩu của `gemora_app`, không phải mật khẩu `postgres`. Chỉ URL-encode phần mật khẩu nếu chứa ký tự đặc biệt, ví dụ `@` thành `%40`, `#` thành `%23`, `%` thành `%25`.

Giữ `.env` trên máy, không commit hoặc chia sẻ mật khẩu. Nếu đã có `.env`, chỉ cập nhật giá trị cần thiết, không ghi đè toàn bộ cấu hình. Có thể để trống hai biến Google và dùng đăng nhập email trước.

### 2.5. Tạo bảng và kiểm tra database

Chạy lần lượt, chỉ tiếp tục khi lệnh trước thành công:

```powershell
npm run db:migrate:apply
npm run db:generate
npm run db:check
```

- `db:migrate:apply`: áp dụng các migration đã có vào database.
- `db:generate`: tạo Prisma Client theo schema hiện tại.
- `db:check`: kiểm tra kết nối và truy vấn bốn bảng tài khoản.

Kết quả mong đợi của bước cuối: `Kết nối PostgreSQL và kiểm tra bốn bảng auth thành công.`

Backend không tự chạy migration khi khởi động. Hiện không cần seed và không có tài khoản đăng nhập mặc định; tạo tài khoản từ giao diện game.

## 3. Khởi chạy dự án

Mở hai cửa sổ/tab PowerShell tại thư mục gốc. Giữ chúng mở trong khi sử dụng.

**Cửa sổ 1 — API:**

```powershell
npm run dev:server
```

Khi khởi động thành công, terminal hiển thị `Gemora API: http://127.0.0.1:3000/api/v1/health`.

**Cửa sổ 2 — giao diện game:**

```powershell
npm run dev:game
```

Mở http://localhost:8080. Dùng thống nhất hostname `localhost` cho giao diện để khớp cấu hình origin và cookie. Giao diện chuyển các yêu cầu `/api` tới backend ở `127.0.0.1:3000` thông qua proxy Vite; không cần tạo file `.env` riêng cho client với cấu hình mặc định.

**Cửa sổ 3 — trang quản trị, nếu cần:**

```powershell
npm run dev:admin
```

Mở http://localhost:8081. Nếu cổng 8081 đang bận, Vite có thể chọn cổng khác; dùng địa chỉ terminal hiển thị. Trang quản trị chưa có đăng nhập, phân quyền hoặc kết nối database thật.

Để dừng, nhấn **Ctrl+C** tại từng cửa sổ chạy app. Nếu terminal hỏi xác nhận dừng, nhập `Y`.

## 4. Kiểm tra đã chạy đúng

1. Mở http://127.0.0.1:3000/api/v1/health để kiểm tra API hoạt động.
2. Mở http://127.0.0.1:3000/api/v1/health/ready để kiểm tra database sẵn sàng. Kết quả thành công là `{"status":"ok","database":"ready"}`. Chỉ health thành công chưa đủ xác nhận database.
3. Mở http://localhost:8080/api/v1/auth/providers để kiểm tra kết nối từ cổng giao diện qua API. Google chưa cấu hình sẽ có `google: false`.
4. Tại giao diện game, chọn **Play Now → Sign up**, đăng ký bằng email và mật khẩu dài 15–128 ký tự.
5. Đăng ký thành công chuyển về **Sign in**; đăng nhập bằng tài khoản vừa tạo.
6. Với tài khoản mới, đặt tên nhân vật 3–16 ký tự ở màn tạo nhân vật rồi chọn **Let's play** để vào Home. Tên phải hợp lệ và chưa bị sử dụng.
7. Tải lại trang để kiểm tra khôi phục phiên. Có thể đăng xuất qua **Account → Sign out**.

Đăng nhập Google là tùy chọn. Làm theo [hướng dẫn cấu hình Google](AUTH_SETUP.md), điền Client ID/Secret và dùng redirect URI `http://localhost:8080/api/v1/auth/google/callback`. Khởi động lại API sau khi đổi `.env`. `google: true` chỉ thể hiện đã có cấu hình; cần thử đăng nhập để xác nhận thông tin OAuth hợp lệ.

## 5. Mở lại hằng ngày và cập nhật mã nguồn

**Khi không có thay đổi thư viện hoặc database:** bảo đảm PostgreSQL đang chạy, sau đó mở hai terminal và chạy `npm run dev:server`, `npm run dev:game`. Chỉ mở admin khi cần. Không phải tạo lại database hoặc `.env` mỗi lần.

**Sau khi nhận mã nguồn mới:** dừng các app đang chạy, tại thư mục gốc chạy lần lượt:

```powershell
npm ci
npm run db:migrate:apply
npm run db:generate
npm run db:check
```

Sau đó khởi động lại các app theo mục 3. Migration đồng bộ cấu trúc database, không sao chép tài khoản từ máy khác. Không dùng reset database để xử lý lỗi cài đặt nếu có dữ liệu cần giữ.

## 6. Build và các lệnh kiểm tra

| Lệnh tại thư mục gốc | Mục đích |
| --- | --- |
| `npm run db:validate` | Kiểm tra schema Prisma |
| `npm run db:status` | Kiểm tra trạng thái migration với database |
| `npm run typecheck:server` | Tạo Prisma Client và kiểm tra kiểu backend |
| `npm run build:server` | Biên dịch backend vào `apps/game-server/dist` |
| `npm run start:server` | Chạy backend đã build; cần `.env` và database sẵn sàng |
| `npm run build:ui` | Lint, kiểm tra kiểu và build cả game client lẫn admin |

Build UI tạo thư mục `dist` trong từng app, không tự mở web server. Để dùng local theo hướng dẫn này, chạy các lệnh `dev`. Không chạy `dev:server` và `start:server` cùng lúc trên cổng 3000. Tài liệu này không thay thế hướng dẫn triển khai production.

Test tích hợp cần database riêng có tên kết thúc bằng `_test`; xem [hướng dẫn backend](../apps/game-server/README.md) và [hướng dẫn kiểm thử auth](AUTH_SETUP.md). Không trỏ test vào `gemora_dev`.

## 7. Xử lý lỗi thường gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| Không tìm thấy `node` hoặc `npm` | Cài Node.js 24 kèm npm, mở lại terminal. Có thể dùng ` .\npm-local.cmd ci` hoặc ` .\npm-local.cmd run dev:game` nếu Node đã cài ở vị trí launcher hỗ trợ. |
| PowerShell báo không được chạy `npm.ps1` | Dùng `npm.cmd ci`, `npm.cmd run dev:server`… thay cho `npm`; không cần đổi chính sách PowerShell. |
| Backend không khởi động | Kiểm tra `.env`, `DATABASE_URL`, dịch vụ PostgreSQL và cổng 3000; chạy `npm run db:check`. Có thể khởi động bằng `.\start-server.cmd` nếu gặp vấn đề tìm npm. |
| Không kết nối được database hoặc sai mật khẩu | Kiểm tra PostgreSQL đang chạy, host/port, database `gemora_dev`, role `gemora_app` và mật khẩu đã URL-encode. |
| Readiness trả 503, thiếu bảng/cột | Chạy `npm run db:status`, `npm run db:migrate:apply`, `npm run db:generate`, rồi khởi động lại API. |
| Migration báo thiếu `pg_c_utf8` | Kiểm tra phiên bản PostgreSQL và collation; schema hiện dùng `pg_catalog.pg_c_utf8`, môi trường đã được ghi nhận kiểm chứng là PostgreSQL 18.6. |
| Cổng 3000 hoặc 8080 đang được sử dụng | Dừng phiên chạy cũ bằng Ctrl+C. Game client đặt `strictPort: true`, nên không tự đổi cổng 8080. |
| Giao diện mở được nhưng đăng nhập báo lỗi mạng | Kiểm tra API đang chạy ở 3000 và thử đường dẫn `/api/v1/auth/providers` qua cổng 8080. Chạy UI riêng không đủ cho đăng nhập. |
| Origin không hợp lệ hoặc phiên không hoạt động như mong đợi | Mở đúng `http://localhost:8080`, đối chiếu `APP_ORIGIN` và khởi động lại API sau khi sửa. |
| Nút Google bị vô hiệu hóa | Điền cấu hình Google theo tài liệu auth rồi khởi động lại API, tải lại trang. Email vẫn dùng được khi chưa cấu hình Google. |

Nếu chủ động đổi cổng API, cập nhật cả `PORT` trong `.env` và `server.proxy` trong `apps/game-client/vite.config.ts`. Nếu đổi cổng giao diện, cập nhật `server.port`, `APP_ORIGIN`, `GOOGLE_REDIRECT_URI` và redirect URI trên Google nếu dùng Google OAuth. Khởi động lại các app sau khi sửa.

## 8. Tài liệu liên quan

- [README dự án](../README.md)
- [Cấu trúc dự án](PROJECT_STRUCTURE.md)
- [Database và migration backend](../apps/game-server/README.md)
- [Đăng nhập email và cấu hình Google](AUTH_SETUP.md)

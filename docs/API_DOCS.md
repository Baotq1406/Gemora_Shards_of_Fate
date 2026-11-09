# Xem và thử API bằng Swagger

## Khởi chạy

Sau khi cài dependencies (`.\npm-local.cmd ci`) và thiết lập database theo [hướng dẫn backend](../apps/game-server/README.md), chạy từ gốc dự án trong hai cửa sổ:

```powershell
.\npm-local.cmd run dev:server
```

```powershell
.\npm-local.cmd run dev:game
```

Mở **http://localhost:8080/api/docs**. Tài liệu OpenAPI JSON: **http://localhost:8080/api/docs-json** (có thể import vào công cụ API khác).

Trang này liệt kê 13 API hiện có, chia thành Health (2), Auth (8), Players (3). Chọn API → **Try it out** → nhập JSON → **Execute**. Phản hồi hiển thị mã HTTP, dữ liệu và thời gian xử lý.

**Execute gọi backend thật và có thể lưu dữ liệu.** Dùng tài khoản thử; kiểm thử tự động phải dùng database riêng có tên kết thúc `_test`.

## Thứ tự thử

1. `GET /api/v1/health` và `/health/ready`: server và database sẵn sàng.
2. `POST /api/v1/auth/register`: nhập email mới và mật khẩu 15–128 ký tự. `displayName` tùy chọn, là tên hiển thị tài khoản cũ, không phải tên nhân vật. Đăng ký chưa tạo phiên.
3. `POST /api/v1/auth/login`: dùng email/mật khẩu vừa tạo. Trình duyệt nhận cookie `gemora_session` HttpOnly.
4. `GET /api/v1/auth/me`: xem tài khoản đang đăng nhập. Không cần nhập token/cookie vào **Authorize**.
5. `POST /api/v1/players/me/onboarding`: nhập `playerName`; `avatarKey` tùy chọn, mặc định `crystal-dragon`. Tên không thể đổi sau khi xác nhận.
6. `GET /api/v1/players/me/home`: xem thông tin nhân vật và trạng thái tính năng.
7. `POST /api/v1/players/me/avatar`: chọn một trong `crystal-dragon`, `moon`, `sun`, `leaf`, `crystal`.
8. `POST /api/v1/auth/logout`: gửi `{}`, nhận 204. Gọi lại `/auth/me` sẽ nhận 401.

Trang Swagger và game dùng chung cookie trong cùng trình duyệt. Đăng nhập/đăng xuất ở Swagger cũng tác động đến phiên của game.

## Origin và Google

Dùng đúng địa chỉ `APP_ORIGIN`, mặc định `http://localhost:8080`. Trang ở cổng 3000 có thể hiển thị tài liệu nhưng không phải địa chỉ dành cho thử API qua trình duyệt. Không đổi `localhost` thành `127.0.0.1`: Origin phải khớp chính xác. Khi đổi `APP_ORIGIN`, cần phục vụ giao diện/proxy tại địa chỉ mới và khởi động lại backend.

Swagger gửi JSON và dùng cookie do trình duyệt quản lý. Giữ nguyên kiểm tra Origin, cookie HttpOnly và giới hạn tần suất của backend.

Google yêu cầu điều hướng cả trang: mở liên kết **mở đăng nhập Google** trong phần giới thiệu. Không dùng Execute cho `/google/start` hoặc `/google/callback`. Callback do Google gọi sau khi bắt đầu luồng hợp lệ. Sau khi quay về game, mở lại Swagger và gọi `/auth/me` để kiểm tra phiên. Với `/google/link`, xác nhận mật khẩu rồi mở `authorizationUrl` trong cùng trình duyệt. Cần cấu hình Google theo [AUTH_SETUP.md](AUTH_SETUP.md).

## Bật/tắt

Biến tùy chọn `API_DOCS_ENABLED=true` hoặc `false` trong `apps/game-server/.env`. Nếu bỏ trống biến (không khai báo), tài liệu bật ngoài production và tắt khi `NODE_ENV=production`. Giá trị khác true/false bị từ chối lúc khởi động.

Khi tắt, cả trang, tài nguyên Swagger và JSON đều không được phục vụ. Chỉ bật ở môi trường production nếu chủ động muốn công khai tài liệu; biến này không thay thế xác thực API.

## Thêm hoặc sửa API

- Gắn `@ApiTags` cho controller và `@ApiContract` cho từng handler.
- Khai báo schema đầu vào/kết quả trong `apps/game-server/src/api-contracts.ts`, bám theo validation và kết quả thực tế. Đây là mô tả tài liệu, không thay thế validation runtime.
- Khai báo `session: true` nếu cần cookie phiên; mô tả mã lỗi và trạng thái HTTP thực tế, nhất là 201, 204 và redirect.
- Cập nhật danh sách route kỳ vọng trong `test/api-docs.test.ts` khi thêm/xóa API.
- Schema khai báo tường minh hoạt động cả khi chạy dev bằng tsx và bản build TypeScript, không cần compiler plugin.

## Kiểm chứng

```powershell
.\npm-local.cmd run build:server
.\npm-local.cmd run test:docs
```

`test:docs` không cần database; xác minh route/schema, UI/JSON, cookie security, redirect, guard và chế độ tắt tài liệu.

Kiểm thử trình duyệt dùng Edge chạy ẩn và database PostgreSQL riêng đã áp dụng migration. Đặt `TEST_DATABASE_URL` đến database có tên kết thúc `_test`, rồi:

```powershell
.\npm-local.cmd run test:swagger -w @gemora/game-client
.\npm-local.cmd run test:auth
```

Bộ test Swagger tự chạy backend ở 13000 và proxy ở 18080 để không chiếm cổng dev thông thường. Test tạo tài khoản/nhân vật trong database kiểm thử, kiểm tra cookie HttpOnly, đăng nhập, tạo nhân vật, đổi avatar, lỗi và đăng xuất. Các tài khoản có tiền tố `swagger-`; dùng database kiểm thử dùng một lần. Có thể đặt `PLAYWRIGHT_CHANNEL=chrome` nếu máy dùng Chrome.

# Chạy API đăng nhập Gemora và cấu hình Google

API đăng ký bằng email, đăng nhập bằng mật khẩu, giữ phiên, đăng xuất và liên kết Google đã có trên backend. Giao diện hiện tại vẫn là prototype. Có thể thử API qua địa chỉ web `http://localhost:8080` nhờ proxy của Vite.

## Tạo Google OAuth Client

1. Mở [Google Cloud Console](https://console.cloud.google.com/), tạo project Gemora hoặc chọn project nhóm đang dùng.
2. Mở **Google Auth Platform** và hoàn thành **Branding**. Chọn **External** trong **Audience** nếu dùng tài khoản Google cá nhân. Nếu project ở chế độ Testing và yêu cầu danh sách người thử, thêm email Google bạn sẽ dùng.
3. Trong **Clients**, chọn **Create client** và loại **Web application**.
4. Trong **Authorized redirect URIs**, thêm đúng địa chỉ `http://localhost:8080/api/v1/auth/google/callback` rồi lưu. [Tài liệu OAuth của Google](https://developers.google.com/identity/protocols/oauth2/web-server#creatingcred)
5. Sao chép Client ID và Client Secret vào [file cấu hình backend](../apps/game-server/.env) trên máy. Giữ nguyên cấu hình PostgreSQL đang dùng.

```dotenv
APP_ORIGIN=http://localhost:8080
SESSION_TTL_DAYS=7
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:8080/api/v1/auth/google/callback
```

`.env` chứa thông tin riêng của máy và được Git bỏ qua. Chia sẻ tên biến qua `.env.example`.

## Chạy và thử

Chạy hai lệnh này trong hai cửa sổ PowerShell tại gốc dự án.

```powershell
npm run dev:server
```

```powershell
npm run dev:game
```

Mở [trạng thái phương thức đăng nhập](http://localhost:8080/api/v1/auth/providers). Sau khi cấu hình và khởi động lại backend, giá trị `google` là `true` nếu đã điền đủ thông tin. Để kiểm tra thông tin có thực sự hợp lệ, mở [luồng đăng nhập Google](http://localhost:8080/api/v1/auth/google/start) trong cùng trình duyệt. Sau khi quay về Gemora, mở [thông tin tài khoản hiện tại](http://localhost:8080/api/v1/auth/me). Phản hồi `200` kèm hồ sơ xác nhận phiên đã được tạo.

Với Chrome và Brave trên cùng máy, dùng cùng địa chỉ `localhost:8080`. Khi thử Google từ máy khác, dùng một hostname HTTPS hợp lệ và cập nhật `APP_ORIGIN`, `GOOGLE_REDIRECT_URI` và redirect URI trên Google Cloud cho khớp. [Quy tắc redirect URI của Google](https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation)

## API cho game client

Các đường dẫn sau dùng tiền tố `/api/v1/auth`. Gọi qua cùng origin với giao diện. Gửi `Content-Type: application/json` và `Origin` khớp `APP_ORIGIN` cho POST. Cookie phiên tự được trình duyệt gửi cùng origin.

| Method | Đường dẫn | Input và kết quả |
|---|---|---|
| GET | `/providers` | `{ password, google }` cho biết phương thức đã cấu hình |
| POST | `/register` | `{ displayName, email, password }` → `201 { user }`, đăng nhập ở bước riêng |
| POST | `/login` | `{ email, password }` → `200 { user }` và cookie phiên |
| GET | `/me` | `200 { user }` nếu phiên còn hiệu lực, `401` nếu cần đăng nhập lại |
| POST | `/logout` | `{}` → `204`, thu hồi phiên hiện tại và xóa cookie |
| GET | `/google/start` | Điều hướng cả trang tới route này để bắt đầu Google |
| GET | `/google/callback` | Google gửi kết quả về route này, sau đó backend chuyển về `/?auth=…` |
| POST | `/google/link` | Phiên đang đăng nhập và `{ password }` → `{ authorizationUrl }`. Điều hướng tới URL này để xác nhận Google |

Các giá trị `auth` trên URL gồm `success`, `account_link_required`, `google_link_conflict`, `session_changed`, `google_cancelled` và `google_failed`. Khi nhận `success`, giao diện gọi `/me` để lấy tài khoản. Nếu trùng email, người chơi đăng nhập Gemora trước rồi dùng `/google/link`. `auth` trên URL chỉ là thông báo, việc xác thực dựa trên phản hồi `/me`.

Cookie phiên mặc định có hạn 7 ngày. Mỗi lần đăng nhập từ trình duyệt khác tạo một phiên riêng. Khi đổi tài khoản trong cùng trình duyệt, backend thu hồi phiên trước đó của trình duyệt này. OAuth attempt và giới hạn tần suất đang dùng bộ nhớ của một backend. Khi triển khai nhiều backend, hai cơ chế đó cần kho trạng thái dùng chung. Nếu chạy sau reverse proxy, cấu hình IP đáng tin cậy trước khi tính giới hạn theo từng người dùng.

## Kiểm thử của nhóm

Chạy migration vào database riêng có tên kết thúc bằng `_test`, đặt `TEST_DATABASE_URL` trỏ tới database đó, rồi chạy `npm run test:auth` và `npm run test:db`. Bộ test xác minh chữ ký token bằng khóa thử và chạy API Google với kết quả nhà cung cấp mô phỏng. Xác nhận Google thật bằng các bước trên sau khi tạo OAuth client.

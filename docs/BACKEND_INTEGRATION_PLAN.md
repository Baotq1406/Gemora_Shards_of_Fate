# Kế hoạch nối backend vào Gemora

> Yêu cầu tiếp theo ngày 08/11/2026: [tạo nhân vật và sảnh chính](PLAYER_ONBOARDING_LOBBY_PLAN.md). Đợt này bổ sung phân luồng người mới/cũ sau đăng nhập, tạo tên và avatar, rồi vào sảnh có lối vào PvE/PvP. Xem tài liệu riêng để biết phạm vi và trạng thái triển khai.

Ngày lập: 07/11/2026. Trạng thái: kế hoạch, chưa triển khai.

**Cập nhật triển khai 07/11/2026:** đã nối giao diện tài khoản với API email/Google, thêm quản lý phiên, kiểm tra lỗi và bộ test trình duyệt. PostgreSQL dev và migration đã được kiểm tra; các test ghi dữ liệu dùng PostgreSQL tạm riêng. Luồng Google trên UI đã triển khai nhưng đăng nhập với Google thật còn cần kiểm tra tương tác. Các đợt hồ sơ/đội, gameplay, thưởng và Admin bên dưới vẫn là kế hoạch. Xem [hướng dẫn chạy và kiểm thử](AUTH_SETUP.md).

## 1. Căn cứ và phạm vi

Kế hoạch dựa trên mã nguồn hiện tại, ưu tiên nối game client với backend sẵn có rồi mở rộng từng luồng chơi hoàn chỉnh. Không coi các tính năng trong tài liệu thiết kế là đã được lập trình. Chưa kiểm chứng kết nối PostgreSQL hoặc Google thật trong lần lập kế hoạch này.

Hiện trạng đã đọc từ mã:

- `apps/game-server`: NestJS, Prisma, PostgreSQL; có health/readiness và các API tài khoản, phiên, Google.
- Schema có `User`, `PlayerProfile`, `AuthSession`, `AuthIdentity`; profile hiện chỉ có tên hiển thị, chưa có Gold, hero, đội hay tiến trình.
- `apps/game-client/src/main.ts`: giao diện xác thực dùng bộ đếm 700 ms để báo thành công giả lập; chưa gọi API.
- Vite của game client đã chuyển tiếp `/api` đến `http://127.0.0.1:3000`, cổng giao diện cố định 8080.
- `packages/shared-types/src/auth.d.ts` đã có hợp đồng auth; game client chưa khai báo dependency đến package này.
- Admin dùng dữ liệu mẫu; `game-core` chưa có logic gameplay.
- README và kế hoạch database cũ có một số mô tả chưa theo kịp mã nguồn, cần cập nhật khi hoàn thành từng mốc.

## 2. Cách kết nối

Luồng phát triển: trình duyệt → `http://localhost:8080/api/v1/...` → Vite proxy → NestJS → PostgreSQL.

Giữ REST và cookie phiên hiện có. Client dùng đường dẫn tương đối `/api/v1`; không tự chuyển sang JWT hoặc lưu token vào localStorage. `APP_ORIGIN` phải khớp địa chỉ mở giao diện; thống nhất `localhost:8080`, không dùng lẫn với `127.0.0.1:8080`. Trình duyệt tự gửi Origin; client không tự đặt header này.

Khi đưa lên máy chủ, dùng HTTPS và reverse proxy phục vụ giao diện cùng `/api` trên một origin. Cấu hình Google callback theo origin đó. Đợt đầu dùng một backend vì trạng thái OAuth và giới hạn tần suất hiện ở bộ nhớ của tiến trình.

## 3. Đợt đầu — hoàn thành tài khoản thật

### M0. Xác minh môi trường

- Kiểm tra cấu hình hiện có, không ghi đè `.env` hoặc đưa secret vào client.
- Kiểm tra trạng thái migration và kết nối database; chỉ áp dụng migration còn thiếu theo hướng dẫn backend, không reset dữ liệu.
- Chạy backend và game client; kiểm tra `/api/v1/health/ready` qua cổng giao diện.
- Kiểm tra `/api/v1/auth/providers`; Google chưa cấu hình thì giao diện giải thích rõ và vô hiệu hóa lựa chọn này.

Nghiệm thu: readiness trả 200 qua proxy; API có thể đọc từ trình duyệt; biết rõ Google đang được bật hay tắt.

### M1. Lớp gọi API và quản lý phiên

Các file dự kiến:

- `apps/game-client/src/api/http.ts`: gửi JSON, cookie cùng origin, xử lý response 204, lỗi HTTP, timeout và mất kết nối.
- `apps/game-client/src/api/auth.ts`: các hàm providers/register/login/me/logout/linkGoogle.
- `apps/game-client/src/auth/session.ts`: trạng thái đang kiểm tra, khách, đã đăng nhập và lỗi kết nối.
- `apps/game-client/package.json`: dùng kiểu dữ liệu từ `@gemora/shared-types`; cập nhật lockfile tương ứng.

Quy tắc xử lý:

- Gọi `/auth/me` khi mở trang. Chỉ 401 mới xác nhận cần đăng nhập lại; lỗi mạng hoặc 5xx cho phép thử lại, không báo sai thành hết phiên.
- Tách trạng thái phiên khỏi trạng thái popup. Request hoàn thành sau khi đóng popup không được mở lại popup cũ hoặc ghi đè một thao tác mới; vẫn đối soát phiên với server khi cần.
- Chống gửi form hai lần; không tự retry POST khi chưa biết server đã xử lý hay chưa.
- Phân biệt thông báo 400, 401, 403, 409, 429, 5xx và lỗi mạng. Hiện hợp đồng lỗi chỉ có `statusCode/message`; bổ sung mã lỗi ổn định nếu cần ánh xạ chính xác hơn.
- Hiển thị thông báo server và tên người chơi bằng text an toàn, không chèn dữ liệu chưa escape vào HTML.

Nghiệm thu: lấy được tài khoản thật; tải lại giữ phiên; lỗi mạng có nút thử lại; không lưu mật khẩu/token ở bộ nhớ trình duyệt lâu dài.

### M2. Nối đăng ký, đăng nhập và đăng xuất

| Thao tác | API hiện có | Hành vi giao diện cần làm |
| --- | --- | --- |
| Đăng ký | `POST /api/v1/auth/register` | Gửi displayName/email/password; nhận 201 rồi chuyển sang đăng nhập, giữ email và xóa mật khẩu |
| Đăng nhập | `POST /api/v1/auth/login` | Nhận user và cookie; đóng popup, hiện tên người chơi và nút đăng xuất |
| Khôi phục phiên | `GET /api/v1/auth/me` | Dùng tài khoản server trả về làm nguồn trạng thái |
| Đăng xuất | `POST /api/v1/auth/logout` | Gửi `{}` và Content-Type JSON; chờ 204 rồi về trạng thái khách |

Sửa trực tiếp `main.ts`: bỏ timer và thông báo thành công demo; đồng bộ kiểm tra mật khẩu đăng ký 15–128 ký tự và tên hiển thị 2–50 ký tự với backend, kể cả cách đếm ký tự Unicode. `confirmPassword` chỉ kiểm tra ở client, không gửi lên API vì backend từ chối trường thừa.

Đăng ký hiện không tạo session: không hiển thị người dùng như đã đăng nhập chỉ vì response chứa `user`. Sau đăng nhập, tạo khu vực chào người chơi tối thiểu; nút Play Now nhận biết phiên và không mở lại form đăng nhập. Chưa tuyên bố đã vào trận khi màn gameplay chưa có.

Nếu logout lỗi mạng, thông báo chưa xác nhận đăng xuất và cho thử lại. Khi API được bảo vệ trả 401, xóa dữ liệu người dùng đang hiển thị và yêu cầu đăng nhập lại.

Nghiệm thu: đăng ký → đăng nhập → tải lại → đăng xuất hoạt động với dữ liệu thật; email trùng và mật khẩu sai không dẫn đến màn thành công.

### M3. Nối Google và liên kết tài khoản

- Dùng `/auth/providers` để quyết định trạng thái nút Google.
- Điều hướng cả trang đến `/api/v1/auth/google/start`.
- Sau callback `/?auth=...`, đọc mã kết quả, gọi `/auth/me` để xác nhận danh tính rồi xóa tham số thông báo khỏi URL bằng history API. Giá trị `auth=success` tự nó không chứng minh đã đăng nhập.
- Hiển thị riêng các kết quả hủy đăng nhập, lỗi Google, yêu cầu liên kết, xung đột liên kết và phiên đã thay đổi.
- Khi nhận `account_link_required`, hướng dẫn đăng nhập bằng mật khẩu trước; cung cấp thao tác liên kết Google trong khu vực tài khoản.
- Liên kết gọi `POST /auth/google/link` với mật khẩu xác nhận, sau đó điều hướng đến `authorizationUrl`. Không tự gộp tài khoản chỉ vì trùng email.

Nghiệm thu: Google thật tạo/khôi phục phiên; tài khoản có email trùng phải đi đúng luồng liên kết; hủy Google quay về trạng thái dễ hiểu. Chrome và Brave có phiên riêng; logout một trình duyệt không làm mất phiên trình duyệt kia.

### M4. Kiểm chứng và bàn giao đợt đầu

- Build UI, typecheck/build server; chạy `test:auth` và `test:db` trên database test riêng đã migrate, không dùng database chứa dữ liệu người dùng.
- Bổ sung kiểm thử trình duyệt cho email register/login/reload/logout, lỗi 401/409/429, backend tắt, gửi lặp, đóng/đổi popup trong lúc request chạy.
- Kiểm tra Google thật có cấu hình hợp lệ; các test mô phỏng nhà cung cấp hiện có không thay thế bước này.
- Kiểm tra nhiều tab khi một tab logout: lần gọi API tiếp theo phải nhận biết phiên đã mất. Nếu cần cập nhật UI ngay giữa các tab, thêm thông báo nội bộ giữa tab rồi đối soát `/me`.
- Cập nhật README và AUTH_SETUP để phản ánh UI đã kết nối, các bước chạy và phần chưa có.

Điểm bàn giao: người dùng tạo tài khoản, đăng nhập email/Google, liên kết Google, giữ phiên qua reload và đăng xuất được từ giao diện. Không cần thay đổi schema chỉ để nối các API auth hiện có.

## 4. Các đợt mở rộng sau tài khoản

| Thứ tự | Công việc | Điều kiện hoàn thành |
| --- | --- | --- |
| 1. Hồ sơ và đội | Chốt hợp đồng player/hero/team; migration và seed nội dung tối thiểu; API hồ sơ, roster, lưu đội; UI Home/Team | Tài khoản mới và tài khoản đã tồn tại đều nhận bộ khởi đầu đúng một lần; lưu đội rồi reload vẫn đúng; không truy cập đội của người khác |
| 2. Một trận thật | Chốt lại luật bàn cờ theo thiết kế mới; làm game-core tối thiểu, màn Battle, API bắt đầu/đọc state/hành động/bỏ trận | Chơi được một stage; server xác định kết quả; reload khôi phục state; gửi lại hành động không chạy hai lượt |
| 3. Thưởng và nâng cấp | Thêm progress, inventory, reward, ledger; API nâng hero và giao diện kết quả | Thắng → nhận thưởng → nâng hero → reload vẫn giữ tiến trình; retry không nhận thưởng hai lần, hai tab không tiêu âm tài nguyên |
| 4. Admin thật | Tạo API kiểm tra quyền ADMIN; nối từng trang với dữ liệu đã có; thêm audit cho thay đổi | PLAYER bị backend từ chối; danh sách có phân trang; thao tác quản trị có dấu vết; số liệu chưa có nguồn không hiển thị như dữ liệu thật |
| 5. Triển khai | Reverse proxy/HTTPS, migration khi phát hành, log, backup/restore, health checks | Cài trên môi trường sạch theo tài liệu; luồng tài khoản và một trận chạy xuyên suốt; khôi phục được bản sao lưu |

Phần gameplay cần schema/API mới, không chỉ thay dữ liệu mẫu bằng fetch. Lấy `docs/DATABASE_CLIENT_BACKEND_PLAN.md` làm tài liệu tham khảo cho transaction và chống cấp thưởng lặp; đối chiếu lại GDD trước khi chốt luật vì bàn cờ cũ đã được gỡ.

Admin hiện là frontend riêng. Trước khi nối phải quyết định origin và luồng đăng nhập: guard auth hiện chỉ chấp nhận một `APP_ORIGIN`, nên không thể mặc định cho rằng form ở cổng Admin khác sẽ hoạt động. Đề xuất khi triển khai phục vụ Admin dưới cùng origin tại `/admin/`, cấu hình base/proxy tương ứng và dùng phiên chung; nếu cần tách origin phải thiết kế lại allowlist/CORS/cookie có kiểm thử. Backend vẫn kiểm tra quyền cho mọi API quản trị.

## 5. Thứ tự thực hiện và phụ thuộc

Thứ tự đề xuất: M0 → M1 → M2 → M3 → M4 → hồ sơ/đội → một trận → thưởng/nâng cấp → Admin → phát hành.

Phần Google phụ thuộc cấu hình OAuth hợp lệ; có thể hoàn tất email và kiểm thử callback mô phỏng trong lúc chờ, nhưng không đánh dấu Google thật đã nghiệm thu. Phần trận phụ thuộc luật bàn cờ mới và màn gameplay. Chưa ấn định lịch ngày hoàn thành khi chưa biết thời gian làm việc và phạm vi gameplay được chốt.

Việc nên triển khai tiếp theo: M0–M2 để có luồng email hoạt động xuyên giao diện, backend và database; sau đó hoàn tất Google trong cùng đợt tài khoản.

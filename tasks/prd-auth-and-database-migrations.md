# Kế hoạch: đăng ký, đăng nhập và đồng bộ database

> Cập nhật 04/11/2026: phạm vi auth của tài liệu này đã được thay thế bởi
> [kế hoạch email + Google cho người chơi](prd-player-auth-email-google.md).
> Google nằm trong đợt đầu; quy trình migration và lịch sử triển khai bên dưới vẫn dùng để tham khảo.

Ngày: 02/11/2026. Trạng thái: đã triển khai nền backend/database; API auth chưa triển khai.

**Tiến độ 02/11/2026:** đã triển khai nền NestJS/Prisma và migration đầu tiên (User,
PlayerProfile, AuthSession); build và 7 test tích hợp đạt trên PostgreSQL 18 tạm.
Migration đã thử trên database trống, áp dụng lại và so khớp schema qua shadow database.
Database chính chưa được tạo/cấu hình; người dùng cần tạo role/database và điền .env.
API auth và nối UI vẫn là các bước tiếp theo. Xem [hướng dẫn backend](../apps/game-server/README.md).

**Tiến độ 04/11/2026:** đã áp dụng migration đầu tiên vào `gemora_dev` local,
sinh Prisma Client và kiểm tra truy vấn thành công cả ba bảng auth.
`prisma migrate status` xác nhận database đã đồng bộ. Thông tin kết nối được giữ
trong `.env` local, không ghi vào tài liệu hoặc Git.

## 1. Mục tiêu và phạm vi

Hoàn thành một luồng thật: đăng ký → đăng nhập → xem thông tin bản thân → tải lại vẫn đăng nhập → đăng xuất. Tài khoản lưu trong PostgreSQL và còn sau khi khởi động lại backend.

Giả định theo trao đổi: phát triển trên Windows, thử trong LAN trước; giữ NestJS/TypeScript, PostgreSQL và Prisma của kiến trúc hiện tại. Giai đoạn này dùng email/mật khẩu; Google, xác minh email, quên mật khẩu, cấp hero và gameplay là các bước tiếp theo. Trước phát hành công khai cần bổ sung xác minh email và khôi phục tài khoản.

## 2. Các bước triển khai và user stories

### US-001 — Môi trường có thể tái tạo

Là thành viên nhóm, tôi muốn dựng database từ mã nguồn để không tạo bảng thủ công.

- [ ] Khởi tạo NestJS trong apps/game-server; cấu hình PostgreSQL/Prisma và kiểm tra kết nối.
- [ ] Pin phiên bản Prisma CLI/Client/adapter cùng nhau theo nhánh 7 của hướng dẫn hiện có; không dùng latest tùy ý. Xác minh bản vá khi triển khai.
- [ ] Có .env.example, hướng dẫn setup và script ở cấp repository; .env thật không vào Git.
- [ ] Migration đầu tiên chạy thành công trên database trống; chạy lại không tạo bảng trùng.
- [ ] Có gemora_shadow riêng cho migrate dev, owner là tài khoản migration; không dùng database chứa dữ liệu làm shadow.
- [ ] Typecheck/lint đã cấu hình chạy thành công.

### US-002 — Đăng ký

Là người chơi mới, tôi muốn tạo tài khoản bằng tên hiển thị, email và mật khẩu.

- [ ] Backend kiểm tra dữ liệu, chuẩn hóa email bằng trim/lowercase theo chính sách của sản phẩm; không trim mật khẩu.
- [ ] Email unique ở database; hai yêu cầu đăng ký cùng email đồng thời chỉ tạo một tài khoản.
- [ ] Mật khẩu băm bằng Argon2id; không ghi mật khẩu/token vào log hoặc response.
- [ ] Tạo User và PlayerProfile tối thiểu trong cùng transaction; lỗi thì rollback cả hai.
- [ ] Thành công chuyển về form đăng nhập, điền sẵn email và xóa ô mật khẩu.
- [ ] Typecheck/lint và test đăng ký hợp lệ, trùng email, dữ liệu sai, rollback đều đạt.

### US-003 — Đăng nhập và duy trì phiên

Là người chơi, tôi muốn đăng nhập và tải lại trang mà không phải nhập lại mật khẩu.

- [ ] Đăng nhập đúng tạo phiên; email không tồn tại hoặc mật khẩu sai trả cùng thông báo lỗi.
- [ ] Giới hạn tần suất đăng ký/đăng nhập; tài khoản bị khóa không đăng nhập hoặc sử dụng phiên cũ được.
- [ ] Phiên được lưu bền vững trong database, có hết hạn; khởi động lại backend không làm mất phiên còn hiệu lực.
- [ ] GET /api/v1/auth/me trả dữ liệu công khai của người đang đăng nhập, trả 401 khi thiếu/hết hạn phiên.
- [ ] Typecheck/lint và test đúng/sai mật khẩu, hết hạn, khóa tài khoản đều đạt.

### US-004 — Đăng xuất

Là người chơi, tôi muốn kết thúc phiên hiện tại.

- [ ] POST /api/v1/auth/logout vô hiệu phiên phía server và xóa cookie.
- [ ] Gọi lại logout không gây lỗi; cookie cũ không truy cập được API bảo vệ.
- [ ] Giai đoạn này logout chỉ kết thúc phiên hiện tại; các thiết bị khác có phiên độc lập.
- [ ] Typecheck/lint và test thu hồi phiên đều đạt.

### US-005 — Nối giao diện hiện có

Là người chơi, tôi muốn các form hiện tại trả kết quả thật từ backend.

- [ ] Thay submit giả lập bằng API; trạng thái đang gửi ngăn gửi lặp.
- [ ] Hiển thị lỗi trường nhập, lỗi mạng và lỗi server; không báo thành công khi API thất bại.
- [ ] Tải lại trang gọi /auth/me; đăng nhập thành công hiển thị tên và nút đăng xuất.
- [ ] Nút Google hiển thị rõ chưa hỗ trợ, không giả lập thành công.
- [ ] Verify in browser using dev-browser skill (nếu không có skill này, dùng công cụ trình duyệt khả dụng).
- [ ] Kiểm tra trên hai máy LAN, typecheck/lint/build UI đạt.

## 3. Yêu cầu chức năng và mô hình dữ liệu

- FR-1: POST /api/v1/auth/register nhận displayName, email, password; confirmPassword chỉ dùng để hỗ trợ nhập ở UI.
- FR-2: POST /api/v1/auth/login nhận email/password, tạo phiên mới.
- FR-3: GET /api/v1/auth/me và POST /api/v1/auth/logout hoạt động theo phiên hiện tại.
- FR-4: User có id, normalizedEmail unique, passwordHash, role mặc định PLAYER, status, createdAt, updatedAt. Client không được tự đặt role/status.
- FR-5: PlayerProfile có id, userId unique, displayName; tên hiển thị không cần unique ở bước này. Gameplay bổ sung sau.
- FR-6: AuthSession có id, userId, tokenHash unique, expiresAt, revokedAt, createdAt; index phù hợp cho truy vấn phiên và dọn phiên cũ.
- FR-7: Không trả passwordHash/tokenHash hoặc ORM entity nguyên bản về client; DTO công khai đặt trong shared-types.

## 4. Đề xuất kỹ thuật xác thực

Đề xuất đơn giản hóa cho web MVP: session token ngẫu nhiên đủ mạnh trong cookie HttpOnly; database chỉ lưu hash token. Dùng SameSite phù hợp, kiểm tra Origin/chống CSRF cho yêu cầu thay đổi dữ liệu, Secure khi dùng HTTPS; thời hạn ban đầu 7 ngày, cấu hình được. Không lưu token trong localStorage. Mật khẩu đề xuất tối thiểu 15, tối đa 128 ký tự; cho phép khoảng trắng, không tự cắt chuỗi.

Đây là đề xuất thay thế access-token/RefreshSession trong DATABASE_CLIENT_BACKEND_PLAN.md riêng cho giai đoạn auth cơ bản; khi triển khai cần đồng bộ lại kiến trúc và hợp đồng API, không xây cả hai cơ chế song song.

Phục vụ UI và /api cùng origin qua proxy để dễ quản lý cookie khi thử LAN. PostgreSQL chỉ nhận kết nối cần thiết từ backend, trình duyệt không kết nối DB. HTTPS cho môi trường triển khai; HTTP LAN chỉ dành cho phát triển với dữ liệu thử.

## 5. Database thay đổi bằng code: Prisma Migrate

schema.prisma mô tả cấu trúc mong muốn; prisma/migrations lưu lịch sử SQL thay đổi cấu trúc. Cả hai được commit cùng code. Seed tạo dữ liệu mẫu có thể chạy lại không nhân đôi, không xóa tài khoản/dữ liệu hiện có.

Các lệnh bên dưới dành cho Prisma ORM 7, chạy trong workspace backend sau khi đã cài và cấu hình; hiện chưa có script/dependency để dùng ngay.

Người thay đổi cấu trúc:

1. Pull nhánh mới nhất; sửa schema.prisma.
2. Chạy `npx prisma migrate dev --name add_user_avatar --create-only`.
3. Đọc migration.sql, kiểm tra nguy cơ mất dữ liệu; đổi tên cột cần chỉnh SQL để giữ dữ liệu thay vì drop/add.
4. Chạy `npx prisma migrate dev` rồi `npx prisma generate`; test chức năng liên quan.
5. Commit schema, thư mục migration và code sử dụng trường mới cùng nhau.

Thành viên nhận thay đổi:

1. Pull code; chạy npm ci từ gốc repository.
2. Trong backend chạy `npx prisma migrate deploy` để áp dụng migration đã có, rồi `npx prisma generate`.
3. Chạy seed riêng khi cần dữ liệu mẫu; chạy ứng dụng/test.
4. Khi tự tạo migration, dùng migrate dev trên database cá nhân và shadow riêng.

Server test/production: quy trình triển khai chạy migrate deploy một lần có kiểm soát; generate ở bước build. Không tự sinh migration lúc server khởi động. Có sao lưu trước migration làm thay đổi dữ liệu quan trọng.

### Quy tắc làm việc nhóm

- Mỗi lập trình viên có database phát triển riêng. Máy thứ hai chỉ thử game thì dùng chung backend, không cần DB riêng.
- Migration đồng bộ cấu trúc, không sao chép tài khoản hoặc dữ liệu chơi giữa máy; seed đồng bộ dữ liệu mẫu. Dùng môi trường test chung nếu cần cùng tập dữ liệu.
- Không sửa bảng bằng pgAdmin trong luồng làm việc thường ngày; dùng pgAdmin để xem/kiểm tra dữ liệu.
- Không sửa/xóa migration đã chia sẻ hoặc áp dụng; tạo migration mới để sửa tiếp.
- Hai nhánh sửa cùng khu vực schema phải hợp nhất, review SQL và chạy thử toàn bộ lịch sử trên database sạch trước merge; không chỉ giải quyết xung đột text.
- Không dùng db push làm quy trình đồng bộ nhóm. Không reset database cần giữ dữ liệu khi gặp drift; xác định nguyên nhân trước.
- Tài khoản gemora_app không có CREATEDB vẫn dùng migrate dev được nếu quản trị viên đã tạo shadow riêng và cấu hình đúng quyền. Production tách quyền migration khỏi tài khoản runtime.

Script dự kiến: db:migrate:create, db:migrate:apply, db:generate, db:seed, db:status. Tên và cách truyền tham số sẽ được viết vào README lúc triển khai.

## 6. Nghiệm thu và thứ tự thực hiện

1. Database/migration và cấu hình → 2. Register → 3. Login/me/logout → 4. Nối UI → 5. Test hai máy và hướng dẫn nhóm.

Hoàn thành khi: một thành viên mới dựng được DB trống từ migration; đăng ký trên máy 1 và đăng nhập tài khoản đó trên máy 2 qua cùng backend; reload giữ phiên; logout thu hồi phiên; restart backend còn tài khoản/phiên; email trùng và truy cập chưa xác thực bị chặn; thêm một trường bằng migration giữ nguyên dữ liệu đã có.

## 7. Điểm cần xác nhận khi triển khai

- Database gemora_dev và role gemora_app đã được tạo thực tế chưa; pgAdmin hiện chỉ xác nhận kết nối PostgreSQL thành công.
- Giữ đề xuất session đơn giản hay cần access/refresh token vì một client khác ngoài web.
- Thông số thời hạn phiên/mật khẩu có thể chỉnh; không cản trở lập kế hoạch này.

## 8. Nguồn tham khảo

- [Prisma ORM 7: development và production](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/development-and-production)
- [Prisma ORM 7: shadow database](https://www.prisma.io/docs/orm/v7/prisma-migrate/understanding-prisma-migrate/shadow-database)
- [OWASP: password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP: session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

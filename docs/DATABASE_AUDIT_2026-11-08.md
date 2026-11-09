# Kiểm tra database trước khi nối UI người chơi

> Đã xử lý phần cấu trúc ngày 08/11/2026: migration `20261108000100_player_onboarding` đã áp dụng vào `gemora_dev`. Thêm bốn trường tên/avatar/mốc hoàn tất và các CHECK/unique tương ứng. Build backend đạt; 15 test onboarding, 12 test database và 21 test auth/Google đạt trên database kiểm thử riêng. Nội dung kiểm tra bên dưới ghi lại hiện trạng **trước** migration. API onboarding và điều hướng UI chưa được triển khai trong đợt sửa database này.

Ngày: 08/11/2026. Phạm vi: schema Prisma, hai migration, code auth và truy vấn chỉ đọc trên database đang cấu hình `gemora_dev`.

## Kết luận

**Cấu trúc hợp lý cho tài khoản email/Google và phiên đăng nhập; chưa đủ cho luồng tạo nhân vật và sảnh có dữ liệu thật.** Không cần thiết kế lại toàn bộ database. Việc cần làm trước mắt là bổ sung danh tính nhân vật và thống nhất thời điểm xác nhận tên.

## 1. Kết quả kiểm tra thực tế

| Kiểm tra | Kết quả |
| --- | --- |
| Kết nối database cấu hình hiện hành | Thành công, `gemora_dev`, PostgreSQL 18.6 |
| Prisma validate | Đạt |
| Migration status | Hai migration đã hoàn tất, không pending |
| Checksum migration | Cả hai file khớp bản đã áp dụng |
| So sánh database với schema Prisma | `prisma migrate diff`: không phát hiện khác biệt |
| Bảng nghiệp vụ | User, PlayerProfile, AuthSession, AuthIdentity |
| Số bản ghi | Cả bốn bảng đều bằng 0 tại lúc kiểm tra |
| Ràng buộc hiện có | Khóa chính, khóa ngoại, unique index và index phiên có mặt trong database |

Truy vấn dữ liệu chạy trong transaction READ ONLY rồi ROLLBACK. Không chạy migration, seed, reset hay test ghi vào database này. Vì database trống, các kiểm tra dữ liệu lỗi/trùng đều bằng 0 nhưng không chứng minh được hành vi trên dữ liệu thực hoặc tải đồng thời. Lần này không chạy lại bộ test tích hợp có ghi dữ liệu; các test đó phải dùng database kiểm thử riêng.

## 2. Những phần nên giữ

- `User` tách thông tin đăng nhập, quyền và trạng thái khỏi hồ sơ game.
- `PlayerProfile.userId` unique: đúng với phạm vi một nhân vật mỗi tài khoản, chưa có phân máy chủ.
- `AuthIdentity` unique theo `(provider, providerSubject)` và `(userId, provider)`: một danh tính Google không thể gắn hai tài khoản, mỗi tài khoản có tối đa một liên kết Google.
- `passwordHash` nullable phù hợp tài khoản chỉ đăng nhập Google. Code đăng ký Google tạo User/Profile/Identity và phiên trong cùng transaction.
- `AuthSession` lưu hash của token, có unique token hash và index theo userId/expiresAt, phù hợp các truy vấn hiện tại.
- Backend đã kiểm tra phiên hết hạn/thu hồi và tài khoản bị khóa; có tác vụ dọn phiên hết hạn. Không nhầm đây là tính năng database tự thực hiện.
- UUID, timestamptz và lịch sử migration thống nhất. Không cần thêm index trùng các unique index đã tồn tại.

## 3. Khoảng trống cần xử lý trước khi nối UI

### Ưu tiên 1 — Chưa phân biệt được đã hoàn tất nhân vật

Nguồn: `prisma/schema.prisma:51`, `src/auth/auth.service.ts:64` và `:166`.

Profile đang được tạo ngay khi đăng ký email hoặc Google. Nó chỉ có `displayName`; không có dấu mốc người chơi chủ động xác nhận tên. Nếu dùng `profile != null` để quyết định vào Home, tài khoản mới cũng sẽ bỏ qua Create player.

Đề xuất: thêm `onboardingCompletedAt`, server trả `NEEDS_PROFILE` hoặc `READY` từ dữ liệu đã xác nhận. Không dùng thời điểm tạo tài khoản hoặc lần đăng nhập làm căn cứ. Chỉ đánh dấu hoàn tất sau khi tên và avatar được lưu thành công cùng transaction.

### Ưu tiên 1 — Chưa lưu được avatar

Nguồn: `prisma/schema.prisma:51`; preview hiện dùng `avatarIndex` trong bộ nhớ.

Đề xuất: thêm `avatarKey` có danh sách ID ổn định và hợp lệ, mặc định `crystal-dragon` khi hoàn tất nhân vật. Không lưu vị trí trong mảng frontend. Việc đổi avatar sau này cập nhật cùng hồ sơ, không tạo thêm profile.

### Ưu tiên 1 — Tên tài khoản hiện tại chưa phải tên nhân vật đã xác nhận

Nguồn: `src/auth/auth.validation.ts:24`, `prisma/schema.prisma:54` và `game-client/src/preview/player-preview.ts:290`.

Backend hiện nhận tên 2–50 ký tự, không unique; UI mới yêu cầu 3–16 ký tự. Google lấy tên do nhà cung cấp trả về. Đây là quy tắc của hai luồng hiện chưa được nối, không phải lỗi duplicate key đang xảy ra.

Theo kế hoạch nối UI, tên game phải được nhập/xác nhận ở Create player. Bổ sung `playerName` và `normalizedPlayerName` unique; chuẩn hóa/validate cùng quy tắc ở server và client, có constraint cho độ dài và tính nhất quán dữ liệu hoàn tất. Unique tại database quyết định khi hai người tranh cùng tên.

`displayName` cũ chỉ giữ tạm để tương thích; không dùng nó làm nguồn tên thứ hai trên Home và không đồng bộ hai chiều. Về dài hạn nên chỉ giữ một trường tên game được phép chỉnh. DB dev hiện trống nên chưa có chi phí backfill ở môi trường này; không suy ra các môi trường khác cũng trống để xóa cột cũ ngay.

## 4. Những điểm tăng độ chặt chẽ, không chặn nối UI

- Email được chuẩn hóa ở backend; DB chỉ unique theo chuỗi lưu thực tế. Nếu thêm đường ghi từ admin/import SQL, cần bảo đảm dùng cùng quy tắc hoặc bổ sung constraint phù hợp. Không cần thay ngay bằng một cơ chế tên/email mới.
- Database chưa kiểm tra token hash đúng 64 ký tự hex hay `expiresAt > createdAt`; code auth hiện sinh các giá trị đúng. Có thể thêm CHECK để ngăn ghi sai từ công cụ/script khác. Test hiện dùng UUID giả làm token hash nên phải cập nhật fixture nếu thêm constraint này.
- Quy tắc “tài khoản có ít nhất một phương thức đăng nhập” hiện do service/transaction bảo đảm; nullable passwordHash không tự chứng minh có Google identity. Khi làm chức năng gỡ liên kết hoặc xóa mật khẩu, phải kiểm tra không gỡ phương thức cuối cùng.
- Cascade khi xóa User hợp lý cho dữ liệu auth hiện tại. Trước khi thêm lịch sử trận/phần thưởng/giao dịch cần quyết định chính sách giữ dữ liệu của các bảng mới, không mặc định cascade mọi thứ.
- UUID và updatedAt được Prisma quản lý; script SQL trực tiếp phải cung cấp UUID và cập nhật thời gian. Đây là lựa chọn hiện có, không phải thiếu default khiến Prisma hỏng.

## 5. Phạm vi migration tiếp theo

Giữ bốn bảng hiện có; mở rộng `PlayerProfile`:

| Trường | Vai trò |
| --- | --- |
| playerName | Tên nhân vật đã xác nhận |
| normalizedPlayerName | Khóa tên duy nhất sau chuẩn hóa |
| avatarKey | Avatar đã chọn hoặc mặc định |
| onboardingCompletedAt | Mốc hoàn tất tạo nhân vật |

Ở giai đoạn chuyển tiếp các trường có thể NULL khi chưa tạo nhân vật; ràng buộc phải ngăn trạng thái hoàn tất nhưng thiếu tên/avatar. API không cho ghi đè tên đã xác nhận bằng cách gọi lại onboarding. Giữ profile ID và userId unique.

Chưa cần đưa Gold, EXP, hero, kho, đội hình và trận đấu vào migration này. Những bảng đó phục vụ gameplay và sẽ được thêm theo hệ thống thực sự triển khai; Home hiện chưa có dữ liệu để hiển thị các con số mẫu như dữ liệu thật.

Trình tự: migration bổ sung → cập nhật auth/players API → test tên trùng, tạo đồng thời, retry và đổi avatar → nối UI. Kế hoạch chi tiết: [UI_FLOW_INTEGRATION_PLAN.md](UI_FLOW_INTEGRATION_PLAN.md).

## 6. Giới hạn đánh giá

Đây là kiểm tra cấu trúc và code tại thời điểm hiện tại, không phải xác nhận hiệu năng, khôi phục backup hay Google sign-in thực tế. Không có phát hiện dữ liệu người chơi hỏng vì database được kiểm tra chưa có bản ghi. Tài liệu `DATABASE_REVIEW.md` cũ có các mô tả auth chưa triển khai; dùng bản kiểm tra này cho hiện trạng backend mới.

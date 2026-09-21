# Kế hoạch UI cơ bản — Game và Admin Dashboard

Trạng thái: prototype UI đã triển khai ngày 22/09/2026. Phạm vi: frontend với dữ liệu mẫu. Màn chào game có background đơn giản, nút “Chơi ngay”, popup đăng nhập/đăng ký và lựa chọn đăng nhập Google.

Tài liệu liên quan: [GDD](GDD.md), [kiến trúc](ARCHITECTURE.md), [PRD](PRD.md). Kế hoạch này ưu tiên duyệt UI trước các bước engine/backend trong lộ trình tổng thể. Google được bổ sung ở mức giao diện theo yêu cầu mới; OAuth thật vẫn thuộc giai đoạn tích hợp sau.

## 1. Kết quả cần đạt

- Game có landing screen hoàn chỉnh và popup xác thực tương tác được bằng chuột/bàn phím.
- Admin có khung điều hướng, trang tổng quan và các trang quản lý cơ bản bằng dữ liệu mẫu.
- Có thể xem trạng thái bình thường, đang xử lý, lỗi, trống và thành công giả lập.
- Có bộ màu, chữ, khoảng cách và component nhất quán để tiếp tục phát triển.

Đã hoàn thành landing game, popup xác thực và Admin Dashboard React theo phạm vi dưới đây. Chưa xây API, database, session/token, OAuth Google, phân quyền thật, gameplay hoặc thao tác quản trị lên dữ liệu thật.

## 2. Định hướng giao diện

Ngôn ngữ mặc định: tiếng Việt. Game mang cảm giác fantasy nhẹ; Admin ưu tiên dễ đọc và thao tác bảng/form nhanh. Dùng cùng màu nhấn tím để nhận diện Gemora, nhưng hai phần có cách bố trí phù hợp mục đích riêng.

| Thành phần       | Game                                            | Admin                                            |
| ---------------- | ----------------------------------------------- | ------------------------------------------------ |
| Background       | Gradient xanh đêm–tím, ánh sáng nhẹ ở trung tâm | Nền xám rất nhạt, thẻ nội dung trắng             |
| Màu nhấn đề xuất | Tím sáng; nút chính chữ trắng                   | Tím đậm cho thao tác chính và menu đang chọn     |
| Typography       | Tên game lớn; form dùng sans-serif dễ đọc       | Sans-serif, thứ bậc tiêu đề/nội dung/nhãn rõ     |
| Khoảng cách      | Thoáng quanh logo và nút Chơi ngay              | Thang 4/8/12/16/24/32 px                         |
| Bo góc           | Popup 16 px, nút/input 10–12 px                 | Thẻ 12 px, nút/input 8 px                        |
| Hiệu ứng         | Fade ngắn 150–200 ms khi mở popup               | Hover/focus nhẹ; không trang trí chuyển động nền |

Background đầu tiên làm bằng CSS gradient và vài hình gem trang trí đơn giản nếu cần. Chưa cần vẽ background riêng hoặc tạo ảnh AI. Khi triển khai cần kiểm tra tương phản chữ thực tế, đặc biệt trên nút chính và nền popup.

## 3. Game: màn chào

Màn chào chiếm toàn bộ viewport, gồm tên “GEMORA”, dòng phụ “Shards of Fate”, một câu giới thiệu ngắn và nút chính “Chơi ngay” ở giữa. Nền không cạnh tranh với nội dung. Chưa thêm navigation, bảng tin, cửa hàng hoặc hero carousel.

```text
┌──────────────────────────────────────────────┐
│              Background gradient             │
│                                              │
│                   GEMORA                     │
│               Shards of Fate                 │
│          Ghép ngọc, viết nên vận mệnh         │
│                                              │
│                [ Chơi ngay ]                 │
│                                              │
└──────────────────────────────────────────────┘
```

Nhấn “Chơi ngay” mở popup ở tab Đăng nhập. Màn chào vẫn nhìn thấy dưới lớp phủ tối. Đóng popup đưa người dùng về đúng màn chào và trả focus cho nút Chơi ngay.

## 4. Game: popup đăng nhập và đăng ký

### Bố cục desktop

Popup rộng tối đa khoảng 760 px, chia hai cột: form ở trái, lựa chọn Google ở phải. Hai tab Đăng nhập/Đăng ký đặt trên form; nút đóng ở góc trên phải. Google vẫn xuất hiện khi chuyển tab.

```text
┌──────────────────────────────────────────────────────┐
│ Chào mừng đến Gemora                              [×] │
│                                                      │
│ [Đăng nhập] [Đăng ký]     │                           │
│ Email                    │   Tiếp tục bằng tài khoản │
│ [                      ] │                           │
│ Mật khẩu                 │   [G  Tiếp tục với Google] │
│ [                Hiện  ] │                           │
│ [      Đăng nhập       ] │                           │
└──────────────────────────────────────────────────────┘
```

Nút Google có nhãn đầy đủ, không chỉ có biểu tượng. Khi dựng UI dùng tài sản thương hiệu phù hợp; không tự vẽ lại chữ G nhiều màu. Chưa tải Google SDK hoặc mở trang chọn tài khoản thật.

### Form và hành vi

| Chế độ    | Trường                                           | Tương tác                                                          |
| --------- | ------------------------------------------------ | ------------------------------------------------------------------ |
| Đăng nhập | Email, mật khẩu                                  | Hiện/ẩn mật khẩu, submit bằng Enter, lỗi dưới field                |
| Đăng ký   | Tên hiển thị, email, mật khẩu, xác nhận mật khẩu | Kiểm tra bắt buộc/email/trùng mật khẩu, submit bằng Enter          |
| Google    | Nút “Tiếp tục với Google”                        | Hiện thông báo “Đăng nhập Google sẽ được kết nối ở giai đoạn sau.” |

Validation ở prototype chỉ phục vụ phản hồi UI: không tuyên bố kiểm tra email đã tồn tại hoặc mật khẩu đúng với tài khoản thật. Quy tắc độ mạnh mật khẩu chi tiết sẽ thống nhất khi tích hợp xác thực.

- Chuyển tab giữ email đã nhập, xóa mật khẩu và lỗi cũ.
- Submit hợp lệ chuyển nút sang “Đang xử lý…” và vô hiệu submit lặp trong lúc giả lập.
- Thành công giả lập hiện “Đã hoàn tất thao tác mẫu” ngay trong popup, có nút quay về màn chào; chưa dẫn vào game/lobby chưa xây.
- Lỗi giả lập có thông báo và cho thử lại, giữ dữ liệu không nhạy cảm đã nhập.
- Đóng bằng nút × hoặc Escape; click nền phủ không đóng để tránh mất form ngoài ý muốn.
- Khi đóng, xóa mật khẩu khỏi state. Không lưu email/mật khẩu vào localStorage hoặc log.
- Focus nằm trong popup khi mở; nền phía sau không nhận thao tác. Popup có tên truy cập được, label thật cho input và vùng thông báo lỗi.

## 5. Admin Dashboard cơ bản

### Khung chung

Sidebar gồm: Tổng quan, Người chơi, Hero, Màn chơi, Nhật ký trận. Header có tên trang và nhãn “Dữ liệu mẫu”. Tài khoản demo ở góc phải là thông tin hiển thị; prototype chưa có đăng nhập Admin hay role guard thật.

```text
┌───────────────┬───────────────────────────────────────────┐
│ GEMORA ADMIN  │ Tổng quan        Dữ liệu mẫu   Admin demo │
│               ├───────────────────────────────────────────┤
│ Tổng quan     │ [Người chơi] [Trận thắng] [Trận thua]      │
│ Người chơi    │                                           │
│ Hero          │ Hoạt động gần đây                         │
│ Màn chơi      │ ┌───────────────────────────────────────┐ │
│ Nhật ký trận  │ │ Bảng dữ liệu mẫu                      │ │
│               │ └───────────────────────────────────────┘ │
└───────────────┴───────────────────────────────────────────┘
```

### Màn hình và mức độ thực hiện

| Trang        | UI cơ bản                                                 | Tương tác mẫu                                          | Ưu tiên |
| ------------ | --------------------------------------------------------- | ------------------------------------------------------ | ------- |
| Tổng quan    | 3 thẻ số liệu, bảng trận gần đây                          | Chọn khoảng 7/30 ngày, mở chi tiết trận                | Đợt 1   |
| Người chơi   | Tìm kiếm, lọc trạng thái, bảng tên/level/stage/trạng thái | Xem panel chi tiết; xác nhận khóa/mở khóa trong bộ nhớ | Đợt 1   |
| Hero         | Bảng tên/nguyên tố/vai trò/trạng thái nội dung            | Tìm/lọc; mở form mẫu sửa tên, nguyên tố, vai trò       | Đợt 2   |
| Màn chơi     | Bảng tên/thứ tự/loại/thưởng/trạng thái                    | Xem/sửa form mẫu tên, loại và Gold reward              | Đợt 2   |
| Nhật ký trận | Bảng thời điểm/người chơi/stage/kết quả/số lượt           | Lọc kết quả, mở panel chỉ đọc                          | Đợt 2   |

Thẻ số liệu phải tính từ cùng fixture với bảng liên quan và cùng khoảng thời gian. Tránh biểu đồ nếu bảng ngắn đã trả lời được nhu cầu. Tên, email và ID đều là dữ liệu hư cấu.

Form Hero/Màn chơi có nút “Lưu bản mẫu” và “Hủy”; dữ liệu chỉ đổi trong bộ nhớ, reload khôi phục fixture. Phần cấu hình game, publish content thật, trình chỉnh sửa skill và phân quyền chi tiết để giai đoạn sau.

Mỗi trang có loading skeleton, empty state, error state với nút thử lại, kết quả tìm kiếm rỗng và trạng thái nội dung bình thường. Có bộ chọn tình huống riêng trong chế độ preview để duyệt các trạng thái, không đưa công cụ này vào bản phát hành.

## 6. Component cần chuẩn bị

| Phần                       | Component                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------ |
| Game                       | LandingScreen, PlayButton, AuthModal, AuthTabs, LoginForm, RegisterForm, GoogleSignInButton            |
| Admin                      | AdminLayout, Sidebar, PageHeader, StatCard, DataTable, SearchInput, FilterSelect, DetailPanel          |
| Pattern dùng trong mỗi app | Button, TextField, StatusBadge, LoadingState, EmptyState, ErrorState, ConfirmDialog, thông báo kết quả |

Thống nhất tên màu, spacing, font size và trạng thái hover/focus/disabled trước. Hai app có thể cùng dùng quy ước thiết kế; chưa cần tách package UI dùng chung khi một bên dùng DOM đơn giản, một bên dùng React.

## 7. Hướng triển khai frontend

- Game: dựng landing và form popup bằng HTML/CSS/TypeScript trong `apps/game-client`; phù hợp nhập liệu và accessibility. PixiJS được giữ cho phần gameplay sau, không cần chạy demo xoay thỏ phía sau màn chào.
- Admin: thiết lập React + TypeScript + Vite trong `apps/admin-dashboard` theo kiến trúc đã đề xuất, rồi xây layout và trang mẫu.
- Mỗi app có dữ liệu mẫu và lớp xử lý tương tác giả lập riêng, tách khỏi component hiển thị để thay bằng API sau này.
- Thành công/thất bại/độ trễ giả lập có thể chọn được, kết quả ổn định để review; không ngẫu nhiên gây lỗi mỗi lần bấm.
- Prototype chạy độc lập frontend, không yêu cầu server, database hay tài khoản Google.

## 8. Responsive và khả năng sử dụng

| Kích thước               | Game                                                      | Admin                                       |
| ------------------------ | --------------------------------------------------------- | ------------------------------------------- |
| Desktop 1280×720 trở lên | CTA giữa màn, popup 2 cột                                 | Sidebar khoảng 224 px, bảng đầy đủ          |
| Tablet 768×1024          | Popup chuyển 1 cột khi thiếu chỗ; Google dưới form        | Sidebar thu gọn, bảng có vùng cuộn riêng    |
| Mobile 390×844           | Popup 1 cột, lề 16 px, cuộn trong popup; Google dưới form | Menu dạng drawer, ưu tiên đọc bảng/chi tiết |

Nút/input mục tiêu cao ít nhất 44 px, input trên mobile dùng chữ ít nhất 16 px. Không cuộn ngang toàn trang. Popup có giới hạn chiều cao theo viewport và luôn truy cập được nút đóng, lỗi và nút submit. Kiểm tra khi bàn phím ảo mở và khi phóng to trang 200%.

## 9. Thứ tự thực hiện và đầu ra

| Bước  | Công việc                                    | Đầu ra và điều kiện hoàn tất                                           |
| ----- | -------------------------------------------- | ---------------------------------------------------------------------- |
| UI-01 | Chốt màu/chữ/spacing và bố cục theo kế hoạch | Token thiết kế, wireframe màn chào/popup/Admin                         |
| UI-02 | Dựng màn chào game                           | Background, tên game, nút Chơi ngay đúng bố cục                        |
| UI-03 | Dựng popup và form                           | Hai tab, Google bên cạnh trên desktop, đầy đủ tương tác/validation mẫu |
| UI-04 | Thiết lập Admin và khung điều hướng          | Sidebar/header/route hoạt động, menu hiện active state                 |
| UI-05 | Làm Tổng quan và Người chơi                  | Dữ liệu mẫu nhất quán, tìm/lọc/chi tiết/xác nhận tương tác được        |
| UI-06 | Làm Hero, Màn chơi và Nhật ký                | Danh sách/form/panel mẫu theo phạm vi cơ bản                           |
| UI-07 | Hoàn thiện responsive và trạng thái          | Loading/empty/error/success; keyboard/focus; kích thước mục tiêu       |
| UI-08 | Duyệt trong trình duyệt                      | Ảnh màn hình desktop/mobile, ghi nhận lỗi đã sửa và giới hạn còn lại   |

Mốc duyệt đầu tiên sau UI-03: màn chào + popup game. Mốc tiếp theo sau UI-05: Admin tổng quan + Người chơi. UI-06 hoàn thiện các màn cơ bản còn lại sau khi layout dùng chung ổn định. Đây là thứ tự phụ thuộc, chưa ấn định thời gian khi chưa triển khai.

## 10. Tiêu chí nghiệm thu UI

- “Chơi ngay” mở đúng popup, mặc định Đăng nhập; chuyển Đăng ký không thay trang.
- Có lựa chọn Google cạnh form trên desktop và dưới form trên mobile; click có phản hồi đúng trạng thái chưa tích hợp.
- Form có label, thông báo lỗi rõ và hiện/ẩn mật khẩu; Enter hoạt động đúng form hiện tại.
- Có thể dùng Tab/Shift+Tab/Escape trong popup; đóng xong focus quay lại CTA.
- Không có xác thực thành công thật, không lưu credential và không phát sinh request tới dịch vụ xác thực.
- Admin chuyển được giữa 5 trang; thao tác tìm/lọc/sửa mẫu phản hồi nhất quán.
- Trạng thái mẫu được ghi rõ; refresh khôi phục dữ liệu ban đầu; không có nút nhìn như hoạt động nhưng bấm không phản hồi.
- Không cắt nút chính ở các viewport mục tiêu; bảng Admin cuộn trong vùng bảng.
- Khi triển khai: chạy lint/typecheck/build theo script của từng app và kiểm tra trực tiếp các luồng trong trình duyệt. Báo cáo duyệt phân biệt đã kiểm tra với chưa kiểm tra.

## 11. Ranh giới bàn giao cho giai đoạn tiếp theo

Sau khi UI được duyệt, công việc tiếp theo mới bao gồm API đăng nhập/đăng ký, OAuth Google, session, quyền Admin, lưu dữ liệu quản trị và nối gameplay. Việc xuất hiện nút Google hoặc màn Admin trong prototype không chứng minh các chức năng đó đã được tích hợp.

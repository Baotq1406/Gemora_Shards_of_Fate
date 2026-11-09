# Play Now — đồng bộ cartoon UI

Ngày 09/11/2026. Đã triển khai.

- Trang mở đầu dùng artwork đảo và rồng chibi hiện có, khung giấy kem viền gỗ, logo vàng và nút Play Now nổi khối.
- Đăng nhập, đăng ký và các dialog tài khoản dùng cùng màu giấy/gỗ, nút vàng, ô nhập sáng và focus xanh.
- Lilita One cho wordmark; Nunito cho nội dung, nút, tên người chơi và tiêu đề UI trên landing, tạo nhân vật và sảnh. Cả hai font được phục vụ từ `public/fonts`, kèm giấy phép OFL và preload. Nunito giữ ký tự tiếng Việt.
- Giữ nguyên xử lý phiên và xác thực; thay markup trang mở đầu chỉ để thêm linh thú trang trí và đổi câu giới thiệu.

## Kiểm chứng

- Build, ESLint và TypeScript đạt.
- Script `node apps/game-client/scripts/capture-landing.mjs` đạt: ảnh ở 1440×960, 390×844 và 360×640; nút Play Now nằm trong màn đầu, không tràn ngang, font tải được, form đăng ký cuộn được, Escape trả focus, tên `Ngọc Ánh` giữ đúng khi chuyển vào sảnh preview.
- Bộ browser test hiện có ghi nhận 18 ca đạt, 1 ca database thật bỏ qua do không cấu hình TEST_DATABASE_URL. Runner bị kẹt khi đóng server trên Windows và được dừng sau khi các ca hoàn tất; không coi đây là một lần chạy có exit code thành công.
- Ảnh kiểm tra dùng API giả lập cho trạng thái khách và Google khả dụng; chưa kiểm tra đăng nhập Google thật trong đợt thay giao diện này.

## Ảnh

- [Play Now desktop](previews/play-now/landing-desktop.png)
- [Play Now mobile](previews/play-now/landing-mobile.png)
- [Đăng nhập mobile](previews/play-now/login-mobile.png)
- [Tạo nhân vật](previews/play-now/create-player-desktop.png)
- [Sảnh với font mới](previews/play-now/home-desktop.png)

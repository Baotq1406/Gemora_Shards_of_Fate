# Tinh gọn UI và mặc định tiếng Anh

Ngày 08/11/2026 — đã triển khai trên bản xem trước giao diện game.

## Kế hoạch và kết quả

1. Giữ phong cách cartoon cute, ảnh đảo và linh thú hiện có.
2. Dùng tiếng Anh mặc định: `lang=en`, nhãn, menu, tên biểu tượng, tên gợi ý, hướng dẫn, lỗi, aria-label và popup. Tên người chơi vẫn cho phép Unicode/tiếng Việt; không dịch nội dung người chơi nhập.
3. Thu khung tạo nhân vật từ khoảng 460 px xuống 350 px trên desktop, chiều cao theo nội dung khoảng 370 px. Màn điện thoại 390×844 hiển thị được toàn bộ form và nút chính.
4. Chỉ giữ `Create your player`, `Name`, gợi ý tên dạng nút có nhãn truy cập, `3–16 characters`, `Avatar`, bốn lựa chọn và `Let's play`.
5. Bỏ lời dẫn lớn, tagline, thanh bước, lời thoại linh thú, mô tả biểu tượng, dòng hứa đổi avatar, ghi chú sức mạnh, lời nhắc về tên và khu đổi tài khoản lặp lại. Thanh preview vẫn có đường về trang đăng nhập.
6. Giữ thông báo preview ngắn, tránh hiểu nhầm rằng tên đã được lưu hoặc dữ liệu sảnh là dữ liệu tài khoản thật.

## Kiểm chứng

- Build bao gồm lint và TypeScript đạt.
- Chụp lại desktop 1440×960 và mobile 390 px cho hai màn.
- Kiểm tra `lang=en`, giữ tên khi đổi avatar, chuyển tên sang sảnh, kiểm tra tên sai, đóng popup, không tràn ngang và không gọi API tài khoản từ preview.
- Ảnh mới: [tạo nhân vật](previews/create-player-desktop.png), [sảnh](previews/home-desktop.png), [tạo nhân vật mobile](previews/create-player-mobile.png).

Phạm vi: UI preview; chưa thay đổi schema, dữ liệu người chơi hoặc luồng onboarding trên backend.

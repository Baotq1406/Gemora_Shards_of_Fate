# Sơ đồ database hiện tại

Bộ 9 sơ đồ cũ và mã dựng bộ sơ đồ đó đã được gỡ ngày 04/11/2026 để thiết kế lại.

- [Mở sơ đồ có nút phóng to](index.html)
- [SVG](auth-database.svg) · [PNG](auth-database.png)
- [Giải thích toàn bộ cột và quan hệ, các điểm cần đánh giá](../DATABASE_REVIEW.md)

Sơ đồ hiện tại chỉ mô tả User, PlayerProfile, AuthSession, AuthIdentity theo schema đã triển khai.
Database/gameplay rộng hơn sẽ được thiết kế lại sau; không dùng sơ đồ này làm ERD của toàn bộ game.

## Dựng lại

Từ gốc repository, chạy `node docs/diagrams/build-database.cjs` để sinh SVG và HTML.
Nếu cần PNG, cài renderer vào thư mục tạm và truyền đường dẫn module:

```powershell
npm install --prefix tmp/diagram-render --no-package-lock --no-save @resvg/resvg-js
node docs/diagrams/build-database.cjs tmp/diagram-render/node_modules/@resvg/resvg-js
```

Script kiểm tra danh sách cột vật lý so với schema và dừng nếu khác. Khi đổi kiểu,
ràng buộc hoặc quan hệ, cập nhật metadata sơ đồ và DATABASE_REVIEW.md cùng thay đổi đó.
Không kết nối database, không chạy migration, không đọc .env khi dựng sơ đồ.

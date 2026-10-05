# Gemora: Shards of Fate

Monorepo cho Gemora: Shards of Fate. Hiện dự án đã có prototype UI cho màn chào
game, popup xác thực và Admin Dashboard; gameplay và backend vẫn đang ở giai đoạn thiết kế.

Để vừa làm vừa học, đọc [hướng dẫn chi tiết cấu trúc và các file setup](docs/PROJECT_STRUCTURE.md).
Tài liệu giải thích từng file hiện có, các công cụ của client và ranh giới giữa các workspace.

[Hướng dẫn PostgreSQL và Prisma](docs/POSTGRESQL_PRISMA_GUIDE.md) giải thích vai trò
của database/ORM và cách cài trên Windows, cấu hình backend, tạo migration, seed
và kiểm tra kết nối. Các bước là hướng dẫn thực hành, chưa được triển khai vào backend.

[Bộ sơ đồ thiết kế MVP](docs/diagrams/index.html) gồm kiến trúc, ERD, luồng chơi,
lượt chiến đấu, trao đổi client–server và nâng hero; nền trắng, chữ/đường nối đen.
Mỗi sơ đồ có bản SVG, PNG và [ghi chú thiết kế](docs/diagrams/README.md).

[PRD của Gemora](docs/PRD.md) xác định mục tiêu, gameplay, phạm vi MVP,
yêu cầu hệ thống và tiêu chí nghiệm thu. Đây là đặc tả dự kiến, chưa phải các tính năng đã triển khai.

[GDD](docs/GDD.md) mô tả trải nghiệm, vòng lặp, luật chơi, tiến trình và định hướng
hình ảnh/âm thanh. [Tài liệu kiến trúc](docs/ARCHITECTURE.md) mô tả kiến trúc mục tiêu,
ranh giới module, luồng dữ liệu, bảo mật, kiểm thử và lộ trình triển khai từ skeleton hiện tại.

[Kế hoạch UI cơ bản](docs/UI_IMPLEMENTATION_PLAN.md) mô tả và ghi nhận prototype
màn chào game, popup đăng nhập/đăng ký với lựa chọn Google và Admin Dashboard.

CodeGraph đã được khởi tạo và lập chỉ mục mã nguồn hiện tại. Thư mục `.codegraph/`
là dữ liệu sinh tự động, đã được bỏ qua trong Git. Quy tắc ignore dùng chung nằm
ở `.gitignore` gốc; mã nguồn, assets, tài liệu và lockfile vẫn được giữ để chia sẻ.

```text
Gemora_Shards_of_Fate/
├── apps/
│   ├── game-client/       # Landing game và popup xác thực; giữ PixiJS cho gameplay sau
│   ├── game-server/       # src/index.ts trống
│   └── admin-dashboard/   # React dashboard với dữ liệu mẫu
├── packages/
│   ├── shared-types/     # src/index.ts trống
│   └── game-core/        # src/index.ts trống
├── docs/
│   ├── GDD.md            # Thiết kế gameplay và phạm vi trải nghiệm MVP
│   ├── PRD.md            # Đặc tả sản phẩm và phạm vi MVP
│   ├── ARCHITECTURE.md   # Kiến trúc chi tiết và lộ trình triển khai
│   ├── UI_IMPLEMENTATION_PLAN.md # Đặc tả và trạng thái triển khai UI
│   └── PROJECT_STRUCTURE.md # Hướng dẫn cấu trúc và setup
├── .editorconfig
├── .gitignore
├── package.json
└── README.md
```

`package.json` ở gốc khai báo npm workspaces và các lệnh chạy/build UI. Dependency
được khóa trong `package-lock.json`. Game client dùng Vite/TypeScript và giữ PixiJS
cho gameplay sau; Admin Dashboard dùng React/TypeScript/Vite.

```powershell
npm run dev:game
npm run dev:admin
npm run build:ui
```

## Vai trò các thư mục

- `apps/game-client`: hiển thị game, nhận thao tác người chơi, giao tiếp server.
- `apps/game-server`: xử lý kết nối và quyết định trạng thái/kết quả game.
- `apps/admin-dashboard`: giao diện quản trị khi có nhu cầu vận hành cụ thể.
- `packages/shared-types`: kiểu dữ liệu và hợp đồng giao tiếp dùng chung.
- `packages/game-core`: logic game thuần, độc lập với giao diện, mạng và database.
- `docs`: GDD, quyết định thiết kế và tài liệu dự án.

Hướng tổ chức dự kiến: các app dùng packages qua tên `@gemora/...`; packages không
phụ thuộc ngược vào apps. Hiện chưa thiết lập dependency và đầu ra để import các
package dùng chung. Mã dùng chung với client không chứa secrets hoặc dữ liệu server cần giữ kín.

Chỉ thêm thư mục tính năng khi có nhu cầu từ GDD. Chọn database, cơ chế realtime,
đăng nhập và mô hình triển khai sau khi rõ vòng lặp gameplay và quy mô multiplayer.

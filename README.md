# Gemora: Shards of Fate

Khung monorepo ban đầu cho game online. Gameplay và lựa chọn công nghệ tiếp theo
sẽ được phát triển dựa trên GDD.

Để vừa làm vừa học, đọc [hướng dẫn chi tiết cấu trúc và các file setup](docs/PROJECT_STRUCTURE.md).
Tài liệu giải thích từng file hiện có, các công cụ của client và ranh giới giữa các workspace.

[PRD của Gemora](docs/PRD.md) xác định mục tiêu, gameplay, phạm vi MVP,
yêu cầu hệ thống và tiêu chí nghiệm thu. Đây là đặc tả dự kiến, chưa phải các tính năng đã triển khai.

CodeGraph đã được khởi tạo và lập chỉ mục mã nguồn hiện tại. Thư mục `.codegraph/`
là dữ liệu sinh tự động, đã được bỏ qua trong Git. Quy tắc ignore dùng chung nằm
ở `.gitignore` gốc; mã nguồn, assets, tài liệu và lockfile vẫn được giữ để chia sẻ.

```text
Gemora_Shards_of_Fate/
├── apps/
│   ├── game-client/       # Template PixiJS có sẵn, giữ nguyên demo và assets
│   ├── game-server/       # src/index.ts trống
│   └── admin-dashboard/   # src/main.ts trống
├── packages/
│   ├── shared-types/     # src/index.ts trống
│   └── game-core/        # src/index.ts trống
├── docs/
│   ├── GDD.md            # Chỗ đặt GDD sau này
│   ├── PRD.md            # Đặc tả sản phẩm và phạm vi MVP
│   └── PROJECT_STRUCTURE.md # Hướng dẫn cấu trúc và setup
├── .editorconfig
├── .gitignore
├── package.json
└── README.md
```

`package.json` ở gốc chỉ khai báo npm workspaces. Các workspace mới có manifest
tối thiểu, chưa có dependencies, scripts chạy/build hoặc cấu hình triển khai.
Các file code mới đều để trống. Cấu hình và dependencies PixiJS có sẵn nằm trong
`apps/game-client`.

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

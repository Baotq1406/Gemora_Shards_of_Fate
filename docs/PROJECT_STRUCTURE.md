# Hiểu cấu trúc và các file setup của Gemora

> Tài liệu dành cho giai đoạn vừa làm vừa học; phần setup được ghi nhận ngày 08/09/2026, bổ sung liên kết PRD ngày 14/09/2026.
> Các ví dụ gameplay bên dưới chỉ dùng để giải thích vị trí của code, chưa được triển khai.

## 1. Bạn đang có gì?

Bạn đang tạo **khung dự án** để phát triển game online. Khung này giúp xác định
mỗi phần công việc sẽ nằm ở đâu khi bạn bắt đầu triển khai ý tưởng.

Hiện trạng cụ thể:

| Thành phần | Đã có | Chưa có |
| --- | --- | --- |
| Thư mục gốc | Khai báo npm workspaces, quy ước editor, quy tắc bỏ qua file | Lệnh chạy/build chung, cấu hình TypeScript chung |
| Game client | Template PixiJS, demo thỏ xoay, cấu hình Vite/TypeScript/ESLint | Gameplay của Gemora, kết nối game server |
| Game server | Manifest và file code trống | Server lắng nghe kết nối, API, realtime, database |
| Admin dashboard | Manifest, README và file code trống | Giao diện quản trị, framework, xác thực |
| Shared types | Manifest và file code trống | Kiểu dữ liệu dùng chung, cấu hình xuất package |
| Game core | Manifest và file code trống | Luật game, cấu hình xuất package |
| Tài liệu | README, hướng dẫn này, PRD | Nội dung GDD; file GDD hiện trống |

Chưa cài dependencies của game hoặc chạy thử. Tại thời điểm cập nhật chưa có
`node_modules/`, `package-lock.json` hay `.git/`.
CodeGraph đã được khởi tạo trong `.codegraph/` và đã lập chỉ mục 8 file mã nguồn.

**Điểm cần nhớ:** hiện tại tên “game-server” thể hiện nơi sẽ viết server.
Bản thân thư mục đó chưa tạo ra một server hoạt động.

### Một số từ sẽ gặp

| Từ | Hiểu trong dự án này |
| --- | --- |
| Source code / mã nguồn | Code bạn viết, thường nằm trong `src/` |
| Runtime | Môi trường thực thi code, ví dụ trình duyệt hoặc Node.js |
| Package | Một đơn vị code được mô tả bằng `package.json` |
| Dependency | Thư viện hoặc package mà một phần code cần sử dụng |
| Workspace | Package con được npm quản lý trong dự án gốc |
| Monorepo | Cách tổ chức nhiều app/package trong một kho mã nguồn; ở đây đang dựng cấu trúc theo hướng đó |
| Entry point | File được chọn làm điểm bắt đầu chạy hoặc điểm xuất chức năng |
| Build | Xử lý mã nguồn thành sản phẩm đầu ra có thể phục vụ/chạy |
| Typecheck | Kiểm tra sự phù hợp của kiểu dữ liệu |
| Lint | Kiểm tra các quy tắc và mẫu code dễ gây lỗi |
| Format | Thống nhất cách trình bày code: khoảng trắng, xuống dòng… |
| Asset | Tài nguyên như ảnh, âm thanh, font |

## 2. Bản đồ toàn bộ thư mục hiện tại

```text
Gemora_Shards_of_Fate/
├── .codegraph/                  # Chỉ mục sinh tự động, không đưa lên Git
├── .editorconfig
├── .gitignore
├── package.json
├── README.md
│
├── apps/
│   ├── game-client/
│   │   ├── .gitignore
│   │   ├── eslint.config.mjs
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   └── vite-env.d.ts
│   │   └── public/
│   │       ├── style.css
│   │       ├── favicon.png
│   │       └── assets/
│   │           ├── bunny.png
│   │           └── logo.svg
│   │
│   ├── game-server/
│   │   ├── package.json
│   │   └── src/
│   │       └── index.ts          # Trống
│   │
│   └── admin-dashboard/
│       ├── package.json
│       ├── README.md
│       └── src/
│           └── main.ts           # Trống
│
├── packages/
│   ├── shared-types/
│   │   ├── package.json
│   │   └── src/
│   │       └── index.ts          # Trống
│   └── game-core/
│       ├── package.json
│       └── src/
│           └── index.ts          # Trống
│
└── docs/
    ├── GDD.md                    # Trống
    ├── PRD.md                    # Đặc tả sản phẩm và phạm vi MVP
    └── PROJECT_STRUCTURE.md      # Tài liệu bạn đang đọc
```

`apps`, `packages`, `docs` là tên do chúng ta chọn để tổ chức dự án.
Chúng không phải từ khóa tự tạo tính năng của JavaScript.

Riêng `src` là viết tắt của “source”. Tên `main.ts` và `index.ts` cũng là quy ước:
cần một file khác hoặc công cụ trỏ đến chúng thì chúng mới có vai trò entry point.

## 3. Các file ở thư mục gốc

### 3.1. package.json — mô tả dự án và các workspace

Nội dung hiện tại:

```json
{
  "name": "gemora-shards-of-fate",
  "version": "0.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

| Trường | Vai trò |
| --- | --- |
| `name` | Tên package gốc theo cách đặt tên của npm |
| `version` | Phiên bản package; `0.0.0` là mốc khởi đầu chúng ta đặt |
| `private: true` | Ngăn vô tình publish package này lên npm |
| `workspaces` | Khai báo các vị trí package con được quản lý cùng nhau |

`private` không phải cơ chế đăng nhập game, cũng không quyết định kho GitHub
công khai hay riêng tư. Xem [ý nghĩa các trường package.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/).

`apps/*` và `packages/*` chọn các thư mục con trực tiếp có manifest.
Sau này khi cài từ gốc, npm có thể liên kết các workspace trong quá trình cài đặt.
Xem [npm workspaces](https://docs.npmjs.com/cli/v11/using-npm/workspaces/).

Hiện root không có `scripts`, `dependencies` hay `devDependencies`.
Vì vậy chưa có lệnh `npm run dev` ở gốc để khởi động toàn bộ game.

**Ba việc khác nhau cần phân biệt:**

- Khai báo workspace: npm biết package nào thuộc dự án.
- Khai báo dependency và đầu ra package: code của app biết cách sử dụng package khác.
- Viết giao tiếp mạng: client và server trao đổi dữ liệu khi chạy.

Mới có việc đầu tiên ở mức cấu hình. Chưa có import package dùng chung hoặc
kết nối mạng giữa các app.

### 3.2. .editorconfig — thống nhất cách editor lưu file

File này được editor có hỗ trợ EditorConfig đọc để áp dụng các quy ước cơ bản.

| Thiết lập hiện tại | Ý nghĩa |
| --- | --- |
| `root = true` | Dừng tìm cấu hình EditorConfig ở thư mục cha |
| `[*]` | Áp dụng cho mọi tên file trong phạm vi |
| `charset = utf-8` | Dùng UTF-8 cho văn bản, phù hợp với tiếng Việt |
| `indent_style = space` | Dùng dấu cách để thụt lề |
| `indent_size = 2` | Mỗi mức thụt lề là 2 dấu cách |
| `end_of_line = lf` | Chọn kiểu xuống dòng LF |
| `insert_final_newline = true` | Có dấu xuống dòng ở cuối file khi lưu |
| `trim_trailing_whitespace = true` | Bỏ khoảng trắng thừa cuối dòng |

Các quy tắc phụ thuộc editor hỗ trợ và không tự sửa ngược toàn bộ file đang có.
Xem [EditorConfig](https://editorconfig.org/).

### 3.3. .gitignore — danh sách file không muốn đưa vào Git

File này chuẩn bị quy tắc cho lúc sử dụng Git. Nó không tự khởi tạo Git.
Hiện dự án chưa có `.git/`.

| Mẫu hiện tại | Thứ được bỏ qua |
| --- | --- |
| `node_modules/` | Thư viện cài về |
| `dist/`, `dist-ssr/`, `build/` | Kết quả build |
| `coverage/`, `.nyc_output/` | Báo cáo và dữ liệu độ bao phủ test |
| `.vite/`, `.cache/`, `.turbo/` | Cache công cụ |
| `*.tsbuildinfo` | Cache build của TypeScript |
| `logs/`, `*.log`, `*.pid`, `*.pid.lock` | Log và thông tin tiến trình cục bộ |
| `.env`, `.env.*` | File cấu hình môi trường |
| `!.env.example`, `!.env.*.example`, `!.env.sample`, `!.env.*.sample` | Cho phép lưu file mẫu, gồm cả mẫu theo môi trường |
| `*.local` | Cấu hình riêng của máy |
| `secrets/`, `*.key`, `*.p12`, `*.pfx`, `*.keystore`, `id_rsa`, `id_ed25519` | Thư mục secrets, khóa riêng và keystore |
| `/data/`, `/backups/` | Dữ liệu chạy và bản sao lưu ở gốc dự án |
| `*.sqlite`, `*.sqlite3` và các đuôi journal/wal/shm tương ứng | Database SQLite cục bộ và file phụ |
| `.codegraph/` | Chỉ mục CodeGraph sinh tự động |
| `.idea/`, `**/.vscode/*`, `*.code-workspace`, `*.suo`, `*.user` | Cấu hình/trạng thái riêng của editor |
| `!**/.vscode/extensions.json`, `!**/.vscode/tasks.json`, `!**/.vscode/launch.json` | Cho phép chia sẻ các cấu hình VS Code này ở gốc và workspace |
| `.DS_Store`, `Thumbs.db`, `Desktop.ini` | Metadata của hệ điều hành |
| `*.tmp`, `*.temp`, `*.swp`, `*.swo`, `*~`, `/tmp/`, `/temp/` | File tạm và bản lưu tạm của editor |

Dấu `!` là ngoại lệ cho quy tắc bỏ qua. Gitignore tác động đến file chưa được
theo dõi; không xóa lịch sử của file đã commit.
Xem [quy tắc gitignore](https://git-scm.com/docs/gitignore).

Các mẫu như `coverage/` hay `.env` chỉ chuẩn bị cách xử lý nếu xuất hiện sau này.
Riêng `.codegraph/` hiện đã có chỉ mục thực tế. Có thể tái tạo chỉ mục từ mã nguồn;
không cần push database và các file phụ của CodeGraph.

Các mẫu thư mục như `node_modules/` áp dụng ở mọi cấp. Dấu `/` ở đầu `/data/`
giới hạn quy tắc vào thư mục gốc: dữ liệu thiết kế trong `packages/game-core/src/data/`
vẫn có thể đưa lên Git.

Nên đưa lên Git: mã nguồn, assets game, tài liệu, manifest, lockfile và cấu hình
dùng chung. Không bỏ qua toàn bộ ảnh/âm thanh, JSON, SQL hoặc thư mục `docs/`.
File mẫu `.env` và cấu hình VS Code được phép lưu phải dùng giá trị minh họa,
không chứa secrets thật. Quy tắc theo tên file không tự phát hiện secrets trong nội dung.

### 3.4. README.md — trang giới thiệu đầu tiên

README ở gốc cho người mới biết dự án là gì, cấu trúc tổng quát và trạng thái hiện tại.
Hướng dẫn chi tiết nằm trong tài liệu này để README vẫn dễ đọc.

Khi có thay đổi lớn, ví dụ thêm cách chạy server, nên cập nhật README và phần
hướng dẫn liên quan cùng lúc.

## 4. apps/ — các ứng dụng có trách nhiệm riêng

Một app thường có điểm khởi động và môi trường chạy riêng.
Client và admin sẽ phục vụ hai nhóm người dùng khác nhau; server thực thi phần xử lý phía máy chủ.

### 4.1. apps/game-client/ — phần người chơi nhìn thấy và tương tác

Client hiện dùng **TypeScript + Vite + PixiJS**:

| Công cụ | Làm gì ở đây? |
| --- | --- |
| TypeScript | Giúp kiểm tra kiểu trong code |
| Vite | Phục vụ mã nguồn khi phát triển và tạo bản build frontend |
| PixiJS | Vẽ nội dung 2D lên canvas và cung cấp các đối tượng đồ họa |

Vite xử lý công việc phát triển/build frontend.
Xem [tài liệu Vite 6](https://v6.vite.dev/guide/), tương ứng với major version
được khai báo trong template hiện tại.

Khi có gameplay, client có thể nhận thao tác bàn phím, vẽ nhân vật, phát hiệu ứng,
hiện túi đồ và gửi yêu cầu tới server. Đây là trách nhiệm dự kiến; demo hiện chỉ có thỏ xoay.

#### package.json của client

Tên hiện tại là `@gemora/game-client`. Tiền tố `@gemora` giúp nhóm tên package của
dự án; tên này chưa có nghĩa là package đã được đăng lên npm.

`type: "module"` chọn cách diễn giải file JavaScript `.js` theo hệ module
`import`/`export` trong phạm vi package. Nó không tự tạo công cụ build TypeScript.
Các manifest mới cũng dùng thiết lập này.
Xem [Node.js: package.json và trường type](https://nodejs.org/api/packages.html#type).

**Scripts có sẵn trong client:**

| Script | Lệnh thực tế | Tác dụng theo cấu hình |
| --- | --- | --- |
| `start` | `npm run dev` | Gọi lại script dev |
| `dev` | `vite` | Khởi động Vite cho client |
| `lint` | `eslint .` | Kiểm tra code theo cấu hình ESLint của client |
| `build` | `npm run lint && tsc && vite build` | Lint, kiểm tra TypeScript, rồi build frontend |

Dấu `&&` yêu cầu bước trước thành công mới chạy bước tiếp theo.
Do `noEmit: true`, bước `tsc` ở đây kiểm tra kiểu và không sinh JavaScript;
Vite đảm nhận tạo bản build.

Tên script là lựa chọn của người viết. Trong template này, `start` gọi dev,
nên không nên hiểu nó là lệnh khởi động production.

**Các thư viện đang được khai báo:**

| Nhóm | Package | Nhiệm vụ |
| --- | --- | --- |
| `dependencies` | `pixi.js` | Thư viện đồ họa mà code client sử dụng |
| `devDependencies` | `vite` | Công cụ phát triển/build |
| `devDependencies` | `typescript` | Cung cấp trình kiểm tra/biên dịch `tsc` |
| `devDependencies` | `eslint` | Chạy kiểm tra lint |
| `devDependencies` | `@eslint/js` | Bộ quy tắc JavaScript được ESLint khuyến nghị |
| `devDependencies` | `typescript-eslint` | Giúp ESLint hiểu và kiểm tra TypeScript |
| `devDependencies` | `prettier` | Định dạng code |
| `devDependencies` | `eslint-plugin-prettier` | Đưa kiểm tra định dạng Prettier vào ESLint |
| `devDependencies` | `eslint-config-prettier` | Tắt các quy tắc lint có thể xung đột với Prettier |

“Đang được khai báo” chưa có nghĩa “đã cài”.

`^8.8.1` cho phép npm chọn bản ổn định tương thích từ 8.8.1 đến trước 9.0.0;
`~5.7.3` giới hạn từ 5.7.3 đến trước 5.8.0. Vì chưa có lockfile, chưa thể coi
những số trong manifest là phiên bản thực tế đã cài.
Xem [dependency version ranges của npm](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#dependencies).

#### index.html — trang HTML bắt đầu của client

Các phần trong file hiện tại:

| Thành phần | Ý nghĩa trong demo |
| --- | --- |
| `<!doctype html>` | Khai báo tài liệu HTML hiện đại |
| `lang="en"` | Ngôn ngữ tài liệu hiện để tiếng Anh theo template |
| `charset="UTF-8"` | Bảng mã văn bản |
| `viewport` | Hướng dẫn kích thước hiển thị trên thiết bị |
| Link `/favicon.png` | Icon trên tab trình duyệt |
| Link `/style.css` | Nạp CSS trong `public/` |
| `<title>` | Tiêu đề tab hiện vẫn là “PixiJS - Template” |
| `div#app` | Vùng HTML bao ngoài |
| `div#pixi-container` | Nơi code TypeScript gắn canvas của PixiJS |
| Script `/src/main.ts` | Trỏ đến code khởi động của demo |

`type="module"` trên thẻ script cho phép sử dụng module JavaScript.
Trong quá trình phát triển, Vite xử lý file TypeScript này để trình duyệt sử dụng.

Nếu đổi ID `pixi-container` trong HTML, đoạn tìm phần tử cùng ID trong
`src/main.ts` cũng cần đổi tương ứng.

#### src/ — mã nguồn client

`src/main.ts` là entry point thực tế vì `index.html` đã trỏ tới nó.
Code hiện tại thực hiện lần lượt:

1. Import `Application`, `Assets`, `Sprite` từ PixiJS.
2. Gọi ngay một hàm `async`, cho phép dùng `await` trong phần khởi động.
3. Tạo `Application`.
4. Gọi `app.init` với nền xanh và `resizeTo: window`.
5. Gắn `app.canvas` vào phần tử HTML `pixi-container`.
6. Tải texture ảnh thỏ từ `/assets/bunny.png`.
7. Tạo `Sprite` dùng texture đó.
8. Đặt `anchor` về `0.5, 0.5`, tức tâm ảnh.
9. Đặt vị trí sprite vào giữa màn hình tại lúc khởi tạo.
10. Thêm sprite vào `app.stage`, nơi quản lý các đối tượng cần vẽ.
11. Đăng ký hàm với `app.ticker` để tăng góc xoay theo từng khung hình.

`Application` gom các phần như renderer, ticker và quản lý resize;
`init` là bước khởi tạo bất đồng bộ trong PixiJS 8.
Xem [PixiJS Application](https://pixijs.com/8.x/guides/components/application).

Một vài chi tiết học được ngay từ demo:

- `await Assets.load(...)` chờ ảnh tải xong rồi mới sử dụng kết quả.
- `document.getElementById(...)!` có dấu `!` để khẳng định với TypeScript
  rằng phần tử tồn tại. Đây không phải kiểm tra runtime: nếu HTML sai ID,
  đoạn code vẫn có thể lỗi khi chạy.
- `time.deltaTime` giúp lượng xoay thay đổi theo thời gian khung hình.
- Code chỉ đặt vị trí thỏ ở giữa một lần. Resize canvas không tự chạy lại câu lệnh
  đặt vị trí thỏ.

**src/vite-env.d.ts**

Nội dung:

```ts
/// <reference types="vite/client" />
```

Đuôi `.d.ts` biểu thị file khai báo kiểu. File này đưa các khai báo phía client
của Vite vào TypeScript, chẳng hạn thông tin về import asset và `import.meta.env`.
Nó không khởi động Vite và không lưu giá trị biến môi trường.
Xem [Vite: hỗ trợ kiểu cho asset](https://v6.vite.dev/guide/assets).

#### public/ — tài nguyên được phục vụ theo đường dẫn

Với cấu hình Vite mặc định, file trong `public/` được phục vụ từ URL gốc
và chép nguyên trạng sang đầu ra build. Vì vậy đường dẫn không có chữ `public`.
Xem [Vite public directory](https://v6.vite.dev/guide/assets#the-public-directory).

| File hiện có | URL tương ứng | Đang được sử dụng ở đâu? |
| --- | --- | --- |
| `public/style.css` | `/style.css` | `index.html` |
| `public/favicon.png` | `/favicon.png` | `index.html` |
| `public/assets/bunny.png` | `/assets/bunny.png` | `src/main.ts` |
| `public/assets/logo.svg` | `/assets/logo.svg` | Chưa được tham chiếu trong mã nguồn/HTML hiện tại |

`assets/` chỉ là thư mục con chúng ta dùng để nhóm tài nguyên.
`.png` lưu ảnh dạng điểm ảnh; `.svg` mô tả hình bằng dữ liệu vector.

`style.css` hiện bỏ margin/padding mặc định của body, đặt màu nền/chữ và
cho vùng `#app` chiếm toàn bộ chiều cao màn hình. Flexbox dùng để căn nội dung;
`overflow: hidden` ẩn phần tràn. File này chưa tạo hệ thống giao diện game.

#### vite.config.ts — cấu hình công cụ Vite

Nội dung cốt lõi:

```ts
export default defineConfig({
  server: {
    port: 8080,
    open: true,
  },
});
```

`defineConfig` giúp viết cấu hình với gợi ý kiểu.
`port: 8080` chọn cổng mong muốn; `open: true` yêu cầu mở trình duyệt khi chạy dev.
Vì chưa đặt `strictPort`, Vite có thể chọn cổng tiếp theo nếu 8080 bận.
Xem [Vite server options](https://vite.dev/config/server-options#server-port).

Chữ `server` ở đây là **dev server của Vite** phục vụ frontend.
Nó không phải code trong `apps/game-server/` và chưa xử lý multiplayer.

Hiện file này chưa cấu hình proxy API hay WebSocket.

#### tsconfig.json — cách TypeScript hiểu và kiểm tra client

File gồm `compilerOptions` và `include: ["src"]`.
Theo danh sách include hiện tại, `tsc` lấy mã trong `src/` làm đầu vào;
`vite.config.ts` không được liệt kê trong phạm vi đó.

Có thể đọc các lựa chọn theo từng nhóm.

**Ngôn ngữ và môi trường:**

| Tùy chọn | Ý nghĩa |
| --- | --- |
| `target: "ES2020"` | Mốc JavaScript mục tiêu của TypeScript |
| `useDefineForClassFields: true` | Dùng ngữ nghĩa trường class theo chuẩn JavaScript |
| `module: "ESNext"` | Chọn dạng module ECMAScript hiện đại |

Các lựa chọn trên thuộc [TSConfig reference](https://www.typescriptlang.org/tsconfig/).
Do `noEmit` đang bật, TypeScript không xuất JS; không nên xem `target` này
là cam kết độc lập rằng mọi trình duyệt đều chạy được bản build Vite.

| Thành phần của `lib` | TypeScript biết thêm gì? |
| --- | --- |
| `ES2020` | Kiểu của API JavaScript tương ứng |
| `DOM` | Các API trình duyệt như `window`, `document` |
| `DOM.Iterable` | Khả năng duyệt các tập hợp DOM tương ứng |

`lib` cung cấp khai báo kiểu, không tự cài API hay polyfill vào runtime.
Xem [TypeScript lib](https://www.typescriptlang.org/tsconfig/lib.html).

**Cách xử lý module và đầu ra:**

| Tùy chọn | Ý nghĩa |
| --- | --- |
| `moduleResolution: "bundler"` | Tìm module theo môi trường dùng bundler |
| `allowImportingTsExtensions: true` | Cho phép đường dẫn import ghi đuôi `.ts` trong cấu hình hiện tại |
| `resolveJsonModule: true` | Cho phép import JSON và nhận thông tin kiểu từ nội dung |
| `moduleDetection: "force"` | Coi các file nguồn không phải declaration là module |
| `noEmit: true` | Kiểm tra code nhưng không sinh file đầu ra bằng `tsc` |

Xem [module resolution](https://www.typescriptlang.org/tsconfig/moduleResolution.html)
và [noEmit](https://www.typescriptlang.org/tsconfig/noEmit.html).
Các tùy chọn import/JSON được mô tả trong [TSConfig reference](https://www.typescriptlang.org/tsconfig/).

`isolatedModules: true` cảnh báo các cách viết TypeScript không phù hợp với
công cụ chuyển đổi từng file riêng lẻ. Nó không có nghĩa là mỗi file chạy trong
một tiến trình riêng. Xem [isolatedModules](https://www.typescriptlang.org/tsconfig/isolatedModules.html).

**Các kiểm tra:**

| Tùy chọn | Tác dụng |
| --- | --- |
| `strict: true` | Bật nhóm kiểm tra kiểu chặt chẽ |
| `noUnusedLocals: true` | Báo biến cục bộ không dùng |
| `noUnusedParameters: true` | Báo tham số không dùng theo quy tắc TypeScript |
| `noFallthroughCasesInSwitch: true` | Báo nhánh switch có nội dung rơi sang nhánh sau ngoài ý muốn |
| `noUncheckedSideEffectImports: true` | Kiểm tra việc tìm module trong import chỉ để chạy tác dụng phụ |
| `skipLibCheck: true` | Bỏ kiểm tra nội dung các file khai báo `.d.ts` |

`strict` giúp phát hiện lỗi kiểu sớm; không chứng minh gameplay đúng.
Xem [strict](https://www.typescriptlang.org/tsconfig/strict.html).
Các cờ còn lại được liệt kê trong [TSConfig reference](https://www.typescriptlang.org/tsconfig/).

#### eslint.config.mjs — quy tắc kiểm tra cách viết code

Đuôi `.mjs` xác định đây là file JavaScript dùng hệ module ECMAScript.
File hiện tại:

- Bỏ qua `dist`, vì đây là đầu ra build.
- Áp dụng cấu hình cho file `.ts` và `.tsx`.
- Kết hợp bộ quy tắc JavaScript khuyến nghị và TypeScript khuyến nghị.
- Dùng `ecmaVersion: "latest"`, `sourceType: "module"`.
- Để `rules: {}`: chưa có quy tắc tùy chỉnh thêm, nhưng quy tắc kế thừa vẫn áp dụng.

Bộ công cụ [typescript-eslint](https://typescript-eslint.io/getting-started/)
giúp ESLint làm việc với TypeScript.

Cấu hình `eslint-plugin-prettier/recommended` được đặt cuối để tích hợp
kiểm tra định dạng, đồng thời xử lý các quy tắc xung đột.
Xem [tích hợp Prettier với ESLint](https://github.com/prettier/eslint-plugin-prettier#configuration-new-eslintconfigjs).

Vì vậy lệnh lint của template có thể báo lỗi trình bày code.
Hiện chưa có script `format` riêng.

Ba công cụ kiểm tra khác nhau:

| Công cụ | Ví dụ vấn đề nó hỗ trợ phát hiện/xử lý |
| --- | --- |
| TypeScript | Bạn khai báo HP là số nhưng gán chuỗi |
| ESLint | Mẫu code hoặc cách dùng biến vi phạm quy tắc đã bật |
| Prettier | Thụt lề và xuống dòng không theo định dạng |

Không công cụ nào trong ba công cụ này tự xác nhận công thức damage là đúng GDD.

#### .gitignore trong client

File này hiện chỉ có chú thích trỏ về quy tắc chung ở gốc. Các mẫu trùng từ
template đã được gom về `.gitignore` gốc để tránh phải sửa ở nhiều nơi.
Chỉ thêm quy tắc vào file client nếu sau này có ngoại lệ riêng của client.
Git áp dụng file gốc xuống các thư mục con; đây không phải cú pháp import file ignore.

### 4.2. apps/game-server/ — nơi viết xử lý phía máy chủ

| Thành phần hiện có | Nhiệm vụ hiện tại |
| --- | --- |
| `package.json` | Định danh `@gemora/game-server`, phiên bản `0.0.0`, private, module |
| `src/` | Chỗ chứa mã nguồn server sau này |
| `src/index.ts` | File trống, dự kiến làm điểm khởi động |

File `index.ts` chưa được scripts hoặc một chương trình nào chọn để chạy.
Chưa có HTTP endpoint, socket, cổng server hay thao tác database.

**Trách nhiệm dự kiến khi GDD rõ hơn:** xác thực yêu cầu, kiểm tra luật,
cập nhật trạng thái và gửi kết quả cho người chơi.

Ví dụ minh họa: người chơi gửi yêu cầu đánh quái. Server cần kiểm tra người chơi
có được phép đánh, mục tiêu có hợp lệ và kết quả được tính theo luật nào.
Client không nên là bên tự quyết “tôi vừa nhận 999 vàng” rồi yêu cầu server lưu.

Lựa chọn framework server, database và hình thức realtime vẫn đang để mở.

### 4.3. apps/admin-dashboard/ — nơi viết giao diện vận hành

| File hiện có | Vai trò |
| --- | --- |
| `package.json` | Định danh `@gemora/admin-dashboard` |
| `README.md` | Ghi phạm vi dự kiến và nguyên tắc truy cập API server |
| `src/main.ts` | File trống dành cho code sau này |

Dashboard dành cho người vận hành game. Ví dụ có thể là màn hình xem thông tin
người chơi hoặc quản lý nội dung. Những tính năng này chưa được chốt.

Chưa có `index.html`, framework giao diện, cấu hình Vite hoặc scripts.
Việc có tên `main.ts` không làm dashboard mở được trong trình duyệt.

## 5. packages/ — những phần có thể dùng lại

App giải quyết một luồng sử dụng; package cung cấp dữ liệu hoặc chức năng cho app.

Hai package hiện mới có tên và nơi để code. Chúng chưa có `exports`, `main`,
`types`, scripts build hoặc cấu hình TypeScript. Client cũng chưa khai báo chúng
trong dependencies.

Vì vậy ví dụ `import ... from "@gemora/game-core"` dưới đây thể hiện
**hướng tổ chức sẽ thiết lập**, chưa phải import dùng được ngay.

### 5.1. packages/shared-types/ — thống nhất hình dạng dữ liệu

| Thành phần hiện có | Vai trò |
| --- | --- |
| `package.json` | Định danh `@gemora/shared-types` |
| `src/` | Chỗ viết kiểu dữ liệu dùng chung |
| `src/index.ts` | Trống; dự kiến xuất các kiểu mà bên ngoài được dùng |

Ví dụ để hiểu khái niệm, chưa thêm vào code:

```ts
export interface PlayerSummary {
  id: string;
  name: string;
  level: number;
}
```

Kiểu này mô tả dữ liệu gồm những trường nào. Client có thể dùng để hiển thị,
server có thể dùng để mô tả kết quả gửi đi.

Nó không tạo người chơi, không lưu database và không tự kiểm tra dữ liệu mạng
khi chương trình đang chạy. Kiểm tra dữ liệu đầu vào tại runtime sẽ cần triển khai riêng.

Nên chỉ chia sẻ dữ liệu mà các bên cần hiểu chung. Mật khẩu, token riêng tư hay
chi tiết nội bộ database không nên vô tình trở thành dữ liệu trả về cho client.

### 5.2. packages/game-core/ — luật game độc lập với giao diện

| Thành phần hiện có | Vai trò |
| --- | --- |
| `package.json` | Định danh `@gemora/game-core` |
| `src/` | Chỗ viết logic game thuần |
| `src/index.ts` | Trống; dự kiến xuất các hàm/kiểu được dùng bên ngoài |

Ví dụ minh họa vị trí code, không phải công thức đã chọn cho Gemora:

```ts
export function calculateDamage(attack: number, defense: number): number {
  return Math.max(0, attack - defense);
}
```

Hàm nhận số, trả về số. Nó không biết sprite nằm ở đâu, không gọi mạng,
không ghi database và không đọc bàn phím.

Nhờ ranh giới đó, server có thể dùng để tính kết quả;
client có thể dùng cùng logic để hiển thị dự đoán khi phù hợp.

Chia sẻ công thức không trao quyền quyết định cho client. Server vẫn phải
kiểm tra hành động và xác nhận trạng thái thật.

Nếu luật phụ thuộc thời gian hoặc ngẫu nhiên, có thể truyền chúng qua đầu vào
để dễ kiểm thử và tái hiện. Không cần thiết kế sẵn các hệ thống đó khi GDD chưa rõ.

### 5.3. Vì sao dùng index.ts?

Một file `index.ts` thường được chọn làm nơi tập hợp những gì package cho phép
bên ngoài sử dụng. Sau này nó có thể xuất hàm từ các file nhỏ hơn.

Ví dụ tương lai: `index.ts` xuất `calculateDamage` từ một file combat.
App chỉ cần biết API công khai của package, ít phụ thuộc cấu trúc file bên trong.

Tên file không tự làm điều này; chúng ta vẫn cần viết exports và cấu hình package.
Hiện cả hai file index đều trống.

## 6. docs/ — ghi lại điều mình định xây và lý do

### PRD.md

PRD xác định mục tiêu sản phẩm, phạm vi MVP, quy tắc gameplay, yêu cầu hệ thống
và tiêu chí nghiệm thu. Đây là thiết kế dự kiến; xem [PRD](PRD.md) trước khi
chia việc triển khai. Các mô tả về code hiện có trong tài liệu này vẫn phản ánh
trạng thái setup ở thời điểm được ghi nhận, không có nghĩa PRD đã được triển khai.

### GDD.md

GDD là Game Design Document: tài liệu mô tả thiết kế game.
File hiện tại được để trống để bạn bổ sung ý tưởng.

Khi sẵn sàng, có thể bắt đầu bằng: người chơi làm gì, mục tiêu là gì,
vòng lặp gameplay, cách chơi cùng người khác và phạm vi bản đầu tiên.
Chưa cần biến mỗi ý tưởng thành một hệ thống kỹ thuật ngay.

### PROJECT_STRUCTURE.md

Tài liệu này giải thích codebase hiện tại. Khi thêm cấu hình hoặc tính năng,
nên cập nhật đúng trạng thái để ví dụ không bị hiểu nhầm là chức năng đã hoàn thành.

GDD trả lời “game sẽ chơi thế nào”; tài liệu cấu trúc trả lời
“phần code nào chịu trách nhiệm thực hiện điều đó”.

## 7. Các phần liên quan với nhau như thế nào?

### 7.1. Luồng demo hiện có

Đây là luồng đọc từ các file hiện tại, chưa phải kết quả chạy thử:

```text
index.html
  ├── nạp /style.css và /favicon.png
  └── trỏ tới /src/main.ts
        ├── tạo PixiJS Application
        ├── gắn canvas vào #pixi-container
        ├── tải /assets/bunny.png
        └── thêm sprite và cập nhật góc xoay
```

Trong luồng này chưa có game server, shared-types hay game-core.

### 7.2. Luồng online dự kiến

```text
Người chơi
   │ thao tác
   ▼
game-client ── yêu cầu qua mạng ──► game-server
   ▲                                   │
   └──────── trạng thái/kết quả ────────┘
```

Giao thức mạng và cách đồng bộ sẽ được chọn theo GDD.

Hướng phụ thuộc code dự kiến:

```text
game-client ──────► shared-types
       └─────────► game-core ──────► shared-types

game-server ─────► shared-types
       └─────────► game-core

admin-dashboard ─► shared-types   (khi có kiểu dữ liệu cần dùng chung)
```

Mũi tên ở sơ đồ này là “dùng code/kiểu của”, không phải kết nối mạng.
Các dependency này chưa được khai báo trong manifests hiện tại.

Ranh giới đang là quy ước tài liệu, chưa có công cụ lint tự động ngăn import sai.

### 7.3. Khi có ý tưởng, đặt phần nào ở đâu?

| Ý tưởng minh họa | Phần code nên đặt |
| --- | --- |
| Hiệu ứng khi đánh trúng | Client |
| Cấu trúc thông báo “đánh trúng” | Shared types |
| Công thức damage có thể dùng chung | Game core |
| Kiểm tra đòn đánh có hợp lệ | Server |
| Lưu vật phẩm sau trận | Server và lớp lưu trữ sẽ thiết kế sau |
| Hiển thị túi đồ | Client |
| Màn hình hỗ trợ người chơi | Admin dashboard |
| Mô tả luật túi đồ và giới hạn vật phẩm | GDD |

Một tính năng hoàn chỉnh thường có phần việc ở nhiều nơi.
Không cần tạo ngay tất cả các file trong bảng chỉ vì có ví dụ này.

## 8. Những file có thể xuất hiện sau này

Các mục sau **chưa tồn tại trong setup hiện tại**.

| File/thư mục | Khi nào có thể xuất hiện? | Dùng làm gì? |
| --- | --- | --- |
| `node_modules/` | Sau khi cài dependencies | Chứa code thư viện và liên kết workspace |
| `package-lock.json` | Sau khi npm tạo lockfile | Ghi lại cây dependency và phiên bản đã resolve |
| `dist/` | Sau khi build | Chứa sản phẩm build |
| `.env` | Khi triển khai đọc cấu hình môi trường | Giữ giá trị cấu hình theo môi trường |
| `.env.example` | Khi có biến môi trường cần mô tả | Mẫu tên biến và giá trị minh họa |
| `tests/` | Khi có hành vi cần kiểm tra | Code test |
| `tsconfig.base.json` | Khi cần chia sẻ cấu hình TypeScript | Tránh lặp cấu hình giữa các workspace |
| `.github/workflows/` | Khi thiết lập CI trên GitHub | Tự động chạy các bước kiểm tra |
| `.git/` | Khi khởi tạo kho Git | Metadata và lịch sử quản lý phiên bản |

Đề xuất cho lúc cài đặt: dùng một lockfile ở gốc cho workspace và lưu nó vào Git.
Không sửa tay `node_modules/` để phát triển tính năng; sửa mã nguồn của dự án.

Đặt file `.env` vào thư mục cũng chưa đủ: runtime/công cụ phải được cấu hình để
đọc nó. Hiện chưa có phần cấu hình đó cho server.

## 9. Đọc lệnh npm mà chưa cần chạy

Các lệnh dưới đây chỉ để bạn hiểu scripts hiện có.
Không có lệnh nào được thực thi trong quá trình viết tài liệu.

Sau khi có Node.js/npm phù hợp và đã cài dependencies, từ thư mục gốc có thể
chọn workspace bằng `-w`:

```powershell
npm run dev -w @gemora/game-client
npm run lint -w @gemora/game-client
npm run build -w @gemora/game-client
```

`-w @gemora/game-client` chỉ định package chứa script cần chạy.
Cơ chế này được mô tả trong [npm workspaces](https://docs.npmjs.com/cli/v11/using-npm/workspaces/#running-commands-in-the-context-of-workspaces).

Ở setup hiện tại:

- Root chưa có script dev/build chung.
- Server và admin chưa có script chạy.
- Shared types và game core chưa có script build.
- Chưa xác nhận cài đặt hoặc build thành công.
- Chưa khóa phiên bản Node.js/npm trong file cấu hình của dự án.

## 10. Thứ tự đọc để học dễ hơn

1. Đọc `index.html`, tìm chỗ trỏ đến `main.ts`.
2. Đọc `main.ts`, đối chiếu từng bước tạo canvas và sprite.
3. Mở `public/`, đối chiếu đường dẫn asset trong code.
4. Đọc scripts trong package.json client để hiểu dev/lint/build.
5. Đọc `vite.config.ts` rồi `tsconfig.json` để phân biệt công cụ chạy và kiểm tra kiểu.
6. Đọc `eslint.config.mjs` để hiểu vì sao editor hoặc lint có thể báo lỗi.
7. Khi có ý tưởng gameplay, dùng bảng phân trách nhiệm ở mục 7 để chọn nơi viết code.

Một bài tập đọc code không cần chạy: giải thích vì sao URL ảnh thỏ là
`/assets/bunny.png`, vì sao đổi ID trong HTML có thể làm demo lỗi,
và vì sao file server trống chưa thể nhận kết nối từ client.

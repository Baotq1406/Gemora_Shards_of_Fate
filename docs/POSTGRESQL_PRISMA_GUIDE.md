# PostgreSQL + Prisma: giải thích và hướng dẫn cài đặt cho Gemora

Ngày đối chiếu tài liệu: **05/10/2026**. Môi trường hướng dẫn: Windows, PowerShell, npm workspaces, TypeScript ESM.

Đây là tài liệu học và cài đặt. Các file cấu hình, schema và script bên dưới là nội dung để tạo khi thực hành; chúng chưa được cài hoặc triển khai vào backend chỉ bằng việc thêm tài liệu này. Schema ví dụ là bước khởi đầu, chưa phải toàn bộ database MVP.

## 1. PostgreSQL và Prisma làm công việc gì?

**PostgreSQL** là hệ quản trị cơ sở dữ liệu: một chương trình chạy nền, nhận truy vấn và lưu dữ liệu bền vững. Khi tắt game rồi mở lại, Gold, hero sở hữu và tiến trình vẫn còn vì chúng đã được lưu ở database.

**Prisma ORM** là bộ công cụ để backend TypeScript làm việc với database: mô tả bảng, tạo lịch sử thay đổi cấu trúc và sinh mã truy vấn có kiểu dữ liệu. Prisma không thay thế PostgreSQL và việc cài Prisma không tự cài PostgreSQL trên máy.

| Câu hỏi | PostgreSQL | Prisma ORM |
| --- | --- | --- |
| Dữ liệu thực sự nằm ở đâu? | Trong database trên ổ đĩa/volume của PostgreSQL | Không giữ bản database riêng |
| Ai thực thi SQL? | PostgreSQL server | Client/driver chuyển truy vấn tới server |
| Ai hỗ trợ viết truy vấn bằng TypeScript? | Có thể dùng SQL thông qua driver | Prisma Client được sinh từ schema |
| Ai giữ dữ liệu không trùng, quan hệ đúng? | UNIQUE, FK, CHECK và transaction | Khai báo được nhiều ràng buộc, điều phối thao tác |
| Có cần chạy ở trình duyệt game không? | Không | Prisma Client có kết nối DB chỉ chạy ở backend |

Luồng của Gemora:

```text
Game client / Admin dashboard
             │ HTTPS: yêu cầu xem kho, bắt đầu trận, nâng hero
             ▼
Backend: xác thực → kiểm tra quyền → áp dụng luật game
             │
             ▼
Prisma Client → PostgreSQL driver → PostgreSQL
             │
             └── Backend nhận dữ liệu → trả DTO công khai cho client
```

Ví dụ người chơi nhấn “Nâng hero”: client gửi hero ID và mã yêu cầu; backend tính giá, kiểm tra chủ sở hữu và tài nguyên; database lưu việc trừ tài nguyên và tăng level trong cùng giao dịch. Không nhận một số Gold mới do client tự tính rồi lưu thẳng.

Prisma ORM khác **Prisma Postgres**: tên thứ hai là dịch vụ database của Prisma. Hướng dẫn này dùng PostgreSQL tự chạy ở máy của bạn, không yêu cầu tạo tài khoản dịch vụ cloud.

## 2. Những khái niệm cần hiểu

| Khái niệm | Ý nghĩa | Ví dụ trong Gemora |
| --- | --- | --- |
| Server/instance | Tiến trình PostgreSQL nhận kết nối | Một PostgreSQL trên cổng 5432 |
| Database | Không gian dữ liệu độc lập trong instance | gemora_dev, gemora_shadow |
| Schema PostgreSQL | Namespace bên trong database | public; khác file schema.prisma |
| Table/row/column | Bảng/bản ghi/cột | PlayerProfile / một người chơi / gold |
| Primary key | Khóa định danh bản ghi | id dạng UUID |
| Foreign key | Khóa tham chiếu bản ghi bảng khác | PlayerProfile.userId → User.id |
| UNIQUE | Ngăn dữ liệu trùng theo khóa | Một profile trên mỗi user |
| Index | Cấu trúc giúp truy vấn phù hợp nhanh hơn | Index theo playerId, createdAt |
| Transaction | Nhóm thay đổi cùng thành công hoặc cùng rollback | Trừ Gold + nâng hero + ghi ledger |
| Migration | Bản thay đổi cấu trúc database được lưu thành file | Thêm bảng PlayerHero |
| Seed | Dữ liệu khởi đầu do dự án chuẩn bị | Vật liệu Hero EXP, hero, stage mẫu |
| JSONB | Kiểu lưu JSON để xử lý/truy vấn trong PostgreSQL | Board, status, snapshot trận |

Transaction không tự giải quyết mọi tranh chấp. Hai request đồng thời vẫn cần khóa hoặc cập nhật có điều kiện; retry cần mã chống xử lý trùng. Thiết kế chi tiết nằm trong [kế hoạch database/client/backend](DATABASE_CLIENT_BACKEND_PLAN.md). Cơ chế commit/rollback được mô tả trong [PostgreSQL transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html).

## 3. Bộ công cụ và phiên bản dùng trong hướng dẫn

| Thành phần | Lựa chọn cho bài thực hành |
| --- | --- |
| PostgreSQL | Nhánh 18, dùng bản vá hiện có từ nhà cung cấp |
| Node.js | Nhánh 24; máy hiện tại đã có 24.15.0 |
| npm | Máy hiện tại có 11.12.1; dùng npm workspaces của repo |
| Prisma CLI / Client / adapter-pg | Khóa cả ba ở **7.10.0** |
| TypeScript | Nhánh 5.9 |
| Chạy script TypeScript | tsx 4 |
| Thư mục backend | D:\Gemora_Shards_of_Fate\apps\game-server |

**7.10.0 là phiên bản nền của bài hướng dẫn, không phải tuyên bố đây là Prisma mới nhất.** Tài liệu chính thức đã có Prisma 8 với API/config khác. Khóa version giúp các ví dụ ở đây không bị thay đổi khi npm `latest` chuyển nhánh. Khi chủ động nâng major, cần cập nhật đồng thời hướng dẫn, config, client và migration workflow. Xem [hướng dẫn chuyển Prisma 7 sang 8](https://docs.prisma.io/docs/guides/upgrade-prisma-orm/postgresql).

Node 24 đáp ứng yêu cầu của Prisma 7. Trên Windows có thể cần Visual C++ Redistributable nếu môi trường thiếu runtime. Xem [system requirements của Prisma 7](https://www.prisma.io/docs/orm/v7/reference/system-requirements).

Kiểm tra trong PowerShell:

```powershell
node --version
npm --version
```

Không cần cài Prisma global. Dependency đặt ở workspace game-server; package-lock.json chung ở gốc repository.

## 4. Cài PostgreSQL trực tiếp trên Windows — đường đi chính

### 4.1. Tải và chạy installer

1. Mở [PostgreSQL cho Windows](https://www.postgresql.org/download/windows/), chọn installer EDB được trang chính thức liên kết.
2. Chọn PostgreSQL 18 cho Windows x64.
3. Giữ PostgreSQL Server, Command Line Tools và pgAdmin nếu muốn dùng giao diện quản lý.
4. Ghi nhớ thư mục cài đặt; ví dụ dưới dùng `C:\Program Files\PostgreSQL\18`.
5. Đặt mật khẩu riêng cho tài khoản quản trị database `postgres` và lưu lại an toàn.
6. Dùng cổng 5432 nếu chưa có chương trình khác sử dụng; locale có thể giữ mặc định.
7. Hoàn tất cài đặt. Không cần thêm extension từ Stack Builder cho bài này.

`postgres` ở đây là tài khoản database; không phải tài khoản người chơi hoặc tài khoản Windows. pgAdmin là giao diện quản lý, không phải database server. Installer bao gồm server và các công cụ theo [mô tả chính thức](https://www.postgresql.org/download/windows/).

### 4.2. Kiểm tra server

Các lệnh có đường dẫn đầy đủ nên không yêu cầu bạn sửa PATH:

```powershell
& 'C:\Program Files\PostgreSQL\18\bin\psql.exe' --version
Test-NetConnection -ComputerName 127.0.0.1 -Port 5432
& 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h 127.0.0.1 -p 5432 -U postgres -d postgres -W
```

Lệnh cuối yêu cầu nhập mật khẩu quản trị đã đặt khi cài. Khi vào được dấu nhắc `postgres=#`, chạy:

```sql
SELECT version();
SELECT current_user, current_database();
```

`psql --version` chỉ xác nhận phiên bản công cụ; truy vấn thành công mới xác nhận kết nối tới server. `TcpTestSucceeded: True` chỉ xác nhận cổng có phản hồi.

### 4.3. Tạo user ứng dụng và hai database local

Trong phiên **psql**, chạy lần lượt. Đây không phải lệnh PowerShell:

```sql
CREATE ROLE gemora_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE;
```

Đặt mật khẩu bằng lệnh psql sau để không viết mật khẩu vào câu SQL/lịch sử lệnh:

```text
\password gemora_app
```

Nhập mật khẩu riêng cho gemora_app, rồi tiếp tục:

```sql
CREATE DATABASE gemora_dev OWNER gemora_app;
CREATE DATABASE gemora_shadow OWNER gemora_app;
```

Tạo mỗi database ở lệnh riêng, ngoài `BEGIN/COMMIT`. Các bước tạo role/database chỉ chạy một lần; nếu tên đã tồn tại, kiểm tra đối tượng trước khi tiếp tục, không xóa database để chạy lại bài.

- `gemora_dev`: dữ liệu phát triển game.
- `gemora_shadow`: database riêng để Prisma Migrate thử lại lịch sử schema và phát hiện lệch cấu trúc.
- `gemora_app`: có quyền sở hữu database local này nhưng không phải superuser; không dùng cấu hình quyền dev này nguyên xi cho production.

Shadow database có thể bị Prisma làm sạch trong quá trình migrate. **Không trỏ nó vào gemora_dev hoặc bất kỳ database chứa dữ liệu cần giữ.** Tạo riêng giúp user ứng dụng không cần quyền CREATEDB. Xem [Prisma shadow database](https://www.prisma.io/docs/orm/v7/prisma-migrate/understanding-prisma-migrate/shadow-database).

Thoát psql:

```text
\q
```

Kiểm tra đăng nhập bằng user ứng dụng từ PowerShell:

```powershell
& 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h 127.0.0.1 -p 5432 -U gemora_app -d gemora_dev -W
```

Trong psql chạy `SELECT current_user, current_database();`, mong đợi `gemora_app | gemora_dev`, rồi `\q`.

Tham khảo: [CREATE ROLE](https://www.postgresql.org/docs/current/sql-createrole.html), [CREATE DATABASE](https://www.postgresql.org/docs/current/sql-createdatabase.html), [psql](https://www.postgresql.org/docs/current/app-psql.html).

## 5. Cài Prisma trong workspace backend

Mở PowerShell tại gốc repository. Hai lệnh install dưới đây cập nhật dependency của **game-server**, không phải game-client:

```powershell
Set-Location D:\Gemora_Shards_of_Fate
npm install --save-exact -D prisma@7.10.0 typescript@5.9 tsx@4 @types/node@24 @types/pg@8 -w @gemora/game-server
npm install --save-exact @prisma/client@7.10.0 @prisma/adapter-pg@7.10.0 pg@8 dotenv@17 -w @gemora/game-server
Set-Location D:\Gemora_Shards_of_Fate\apps\game-server
npx prisma --version
```

Kết quả phải báo CLI và Client 7.10.0. `--save-exact` lưu phiên bản đã resolve chính xác; commit package.json và lockfile để người khác tái lập bằng `npm ci` từ gốc repo.

| Package | Vai trò |
| --- | --- |
| prisma | CLI: init, validate, generate, migrate, Studio |
| @prisma/client | Runtime Prisma Client; client của app được generate vào thư mục chỉ định |
| @prisma/adapter-pg | Nối Prisma 7 với PostgreSQL driver |
| pg | Driver node-postgres |
| dotenv | Nạp biến môi trường từ .env |
| typescript, tsx | Kiểm tra kiểu và chạy script TypeScript |
| @types/node, @types/pg | Kiểu TypeScript cho Node và driver |

Khởi tạo, khi vẫn đang ở `apps/game-server`:

```powershell
npx prisma init --datasource-provider postgresql --output ../src/generated/prisma
```

Lệnh tạo schema/config và hướng dẫn cấu hình kết nối. Nếu đã có Prisma từ lần cài trước, mở và cập nhật file hiện có thay vì init lại. Không dùng `--db`: bài này đã có PostgreSQL local. Xem [Prisma init](https://docs.prisma.io/docs/cli/v7/init).

## 6. Cấu hình kết nối và TypeScript

### 6.1. File .env

Tạo hoặc sửa `apps/game-server/.env`:

```dotenv
DATABASE_URL="postgresql://gemora_app:YOUR_URL_ENCODED_PASSWORD@127.0.0.1:5432/gemora_dev?schema=public"
SHADOW_DATABASE_URL="postgresql://gemora_app:YOUR_URL_ENCODED_PASSWORD@127.0.0.1:5432/gemora_shadow?schema=public"
```

Thay placeholder bằng mật khẩu của **gemora_app**. URL gồm user, password, host, port, tên database và schema. Mật khẩu chứa ký tự đặc biệt phải URL-encode, ví dụ `@` thành `%40`, `#` thành `%23`, `%` thành `%25`. Chỉ encode thành phần mật khẩu, không encode cả URL; tránh dùng website bên ngoài để encode mật khẩu thật. Xem [connection URLs](https://www.prisma.io/docs/orm/v7/reference/connection-urls).

`.gitignore` của Gemora đã bỏ qua `.env` và cho phép `.env.example`. Tạo `.env.example` cùng hai dòng placeholder để chia sẻ cấu hình mẫu. Không thêm tiền tố `VITE_` cho database URL vì biến đó có thể bị đưa vào frontend bundle.

### 6.2. File prisma.config.ts

Nội dung `apps/game-server/prisma.config.ts`:

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
```

Config này dành cho CLI. Runtime Prisma Client sẽ nhận URL riêng trong `src/db.ts` bên dưới. Prisma 7 đặt datasource URL ở config; không trộn với mẫu Prisma 6 đặt `url` trong schema. Chạy các lệnh CLI từ thư mục game-server để việc tìm config và nạp `.env` nhất quán. Xem [Prisma Config API](https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference).

### 6.3. File tsconfig.json cho bài thực hành

`apps/game-server/package.json` hiện đã có `"type": "module"`; giữ nguyên. Tạo `apps/game-server/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts", "prisma/**/*.ts", "prisma.config.ts"]
}
```

Cấu hình này dùng **tsx chạy trực tiếp TypeScript**, còn tsc chỉ kiểm tra kiểu. Nó chưa phải cấu hình build NestJS production. Khi dựng NestJS cần thống nhất lại ESM/CommonJS, decorator và cách build; không mặc định lấy cấu hình này để xuất `dist`.

## 7. Viết schema đầu tiên

Sửa `apps/game-server/prisma/schema.prisma` thành:

```prisma
generator client {
  provider            = "prisma-client"
  output              = "../src/generated/prisma"
  moduleFormat        = "esm"
  importFileExtension = "ts"
}

datasource db {
  provider = "postgresql"
}

model User {
  id           String         @id @default(uuid()) @db.Uuid
  email        String         @unique @db.VarChar(254)
  passwordHash String
  createdAt    DateTime       @default(now()) @db.Timestamptz(3)
  profile      PlayerProfile?
}

model PlayerProfile {
  id        String          @id @default(uuid()) @db.Uuid
  userId    String          @unique @db.Uuid
  username  String          @unique @db.VarChar(32)
  level     Int             @default(1)
  exp       Int             @default(0)
  gold      Int             @default(0)
  user      User            @relation(fields: [userId], references: [id], onDelete: Restrict)
  inventory InventoryItem[]
}

model ItemDefinition {
  id          String          @id @default(uuid()) @db.Uuid
  code        String          @unique @db.VarChar(64)
  name        String          @db.VarChar(100)
  description String
  inventory   InventoryItem[]
}

model InventoryItem {
  playerId String         @db.Uuid
  itemId   String         @db.Uuid
  quantity Int            @default(0)
  player   PlayerProfile  @relation(fields: [playerId], references: [id], onDelete: Restrict)
  item     ItemDefinition @relation(fields: [itemId], references: [id], onDelete: Restrict)

  @@id([playerId, itemId])
  @@index([itemId])
}
```

Các ký hiệu: `@id` là primary key; `@unique` là ràng buộc duy nhất; `?` là quan hệ/trường tùy chọn; `[]` là danh sách quan hệ; `@relation` liên kết FK; `@@id` là khóa ghép. `User.profile` có thể thiếu ở cấp schema, nên use case đăng ký cần tạo User và Profile cùng transaction. Xem [Prisma schema reference](https://www.prisma.io/docs/orm/v7/reference/prisma-schema-reference).

Generator ghi TypeScript vào `src/generated/prisma`; importFileExtension phù hợp bài thực hành dùng tsx. Thêm `/apps/game-server/src/generated/prisma/` vào `.gitignore` gốc khi thực hành; chạy generate để tái tạo, không sửa generated code bằng tay. Xem [Prisma generators](https://www.prisma.io/docs/orm/v7/prisma-schema/overview/generators).

Đây là schema để học quan hệ User–Profile–Item, chưa có refresh session, role, content release, trận hay economy ledger. InventoryItem nối thẳng Profile để ví dụ ngắn; schema MVP trong kế hoạch có thể thêm Inventory trung gian. Chốt schema thực tế trước khi có dữ liệu người chơi thật.

## 8. Tạo và áp dụng migration

Tại `D:\Gemora_Shards_of_Fate\apps\game-server`:

```powershell
npx prisma format
npx prisma validate
npx prisma migrate dev --name init_accounts_inventory --create-only
```

Lệnh cuối tạo một thư mục có timestamp trong `prisma/migrations`. Mở `migration.sql`, xem các câu CREATE TABLE/INDEX/FK. Trước khi áp dụng migration mới này, thêm các CHECK phù hợp ở cuối file:

```sql
ALTER TABLE "PlayerProfile"
  ADD CONSTRAINT "PlayerProfile_gold_nonnegative" CHECK ("gold" >= 0),
  ADD CONSTRAINT "PlayerProfile_exp_nonnegative" CHECK ("exp" >= 0),
  ADD CONSTRAINT "PlayerProfile_level_positive" CHECK ("level" >= 1);

ALTER TABLE "InventoryItem"
  ADD CONSTRAINT "InventoryItem_quantity_nonnegative" CHECK ("quantity" >= 0);
```

Các CHECK này bổ sung bảo vệ tại database; default 0 không tự cấm giá trị âm. Chỉ chỉnh migration **chưa áp dụng**. Khi migration đã chia sẻ/áp dụng, tạo migration mới cho thay đổi tiếp theo. Chi tiết cơ chế CHECK: [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html).

Áp dụng và tạo client:

```powershell
npx prisma migrate dev
npx prisma generate
npx prisma migrate status
```

Mong đợi: migration được áp dụng, client được sinh và không còn migration pending. Database có bốn bảng của ví dụ cùng `_prisma_migrations` để theo dõi lịch sử. `generate` chỉ sinh mã TypeScript, không tạo bảng hay cấp dữ liệu. Prisma 7 cần chạy generate/seed rõ ràng theo workflow. Xem [development và production migrations](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/development-and-production).

## 9. Kết nối từ TypeScript và seed một vật phẩm

### 9.1. Tạo src/db.ts

```typescript
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Thiếu DATABASE_URL trong môi trường backend.");
}

const adapter = new PrismaPg({ connectionString, max: 5 });
export const prisma = new PrismaClient({ adapter });
```

Prisma Client được import từ output vừa generate; adapter nối tới PostgreSQL qua URL. Backend nên dùng chung một instance/pool theo vòng đời ứng dụng, không tạo PrismaClient cho từng request. Giới hạn pool cần điều chỉnh theo số instance khi triển khai. Tham khảo [khởi tạo generated client](https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/generating-prisma-client).

### 9.2. Tạo prisma/seed.ts

```typescript
import { prisma } from "../src/db.ts";

async function main() {
  const item = await prisma.itemDefinition.upsert({
    where: { code: "HERO_EXP_SMALL" },
    update: {},
    create: {
      code: "HERO_EXP_SMALL",
      name: "Mảnh kinh nghiệm nhỏ",
      description: "Vật liệu mẫu dùng để kiểm tra database Gemora.",
    },
    select: { code: true, name: true },
  });
  console.log("Seed hoàn tất:", item);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Seed thất bại.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Seed dùng code unique và upsert nên chạy lại không nhân đôi vật phẩm; `update: {}` cũng không ghi đè nội dung đã chỉnh. Seed này không tạo tài khoản, không chứa mật khẩu mẫu và chưa cấu hình lượng EXP thực tế. Chạy từ game-server:

```powershell
npx prisma db seed
npx prisma db seed
```

Mong đợi cả hai lần thành công và vẫn chỉ có một item với code trên. Cách khai báo/chạy seed: [Prisma seeding](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/seeding).

### 9.3. Tạo src/check-db.ts để đọc thử

```typescript
import { prisma } from "./db.ts";

async function main() {
  const items = await prisma.itemDefinition.findMany({
    select: { code: true, name: true },
    orderBy: { code: "asc" },
    take: 10,
  });
  console.table(items);
  console.log("Kết nối và truy vấn PostgreSQL thành công.");
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Truy vấn thất bại.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Chạy:

```powershell
npx tsc --noEmit
npx tsx src/check-db.ts
npx prisma studio
```

Script phải in item vừa seed. Studio mở giao diện xem dữ liệu; chọn ItemDefinition để kiểm tra. Studio có thể sửa dữ liệu trực tiếp, phù hợp kiểm tra local; Admin game sau này vẫn phải đi qua API để áp dụng quyền và luật game.

Các API thường dùng: `findUnique` tìm theo khóa duy nhất; `findMany` lọc/phân trang; `create` thêm; `update` sửa; `upsert` tạo nếu thiếu; `delete` xóa. Chỉ chọn các trường cần trả bằng `select`, đặc biệt không trả passwordHash. Xem [Prisma CRUD](https://www.prisma.io/docs/orm/v7/prisma-client/queries/crud).

## 10. Cấu trúc và script sau khi thực hành

```text
apps/game-server/
├── .env                         # Bí mật local; không commit
├── .env.example                 # Placeholder; commit
├── prisma.config.ts             # Config CLI
├── tsconfig.json                # Typecheck cho bài dùng tsx
├── package.json                 # Dependency và scripts backend
├── prisma/
│   ├── schema.prisma            # Data model
│   ├── migrations/              # SQL migration; commit
│   └── seed.ts                  # Item mẫu
└── src/
    ├── index.ts                 # Entry point hiện có; chưa dựng API
    ├── db.ts                    # Một client dùng chung
    ├── check-db.ts              # Kiểm tra kết nối
    └── generated/prisma/        # Sinh tự động
```

Có thể thêm trường `scripts` sau vào package.json của game-server; giữ nguyên name, type và dependencies đã cài:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "db:validate": "prisma validate",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:status": "prisma migrate status",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:check": "tsx src/check-db.ts"
  }
}
```

Sau đó từ gốc repo chạy, ví dụ:

```powershell
Set-Location D:\Gemora_Shards_of_Fate
npm run db:check -w @gemora/game-server
npm run db:migrate -w @gemora/game-server -- --name add_hero_tables
```

Lệnh migrate sau chỉ dùng khi đã sửa schema để thêm bảng tương ứng.

## 11. Quy trình dùng hằng ngày và khi triển khai

| Việc cần làm | Cách làm |
| --- | --- |
| Sửa cấu trúc bảng trên dev | Sửa schema → migrate dev --name ten_thay_doi → generate → typecheck/test |
| Thêm CHECK/SQL đặc thù | migrate dev --create-only → review/sửa migration mới → migrate dev → generate |
| Lấy repo lần đầu | npm ci ở gốc → tạo .env backend → generate → áp dụng migration local → seed |
| Xem lịch sử đã áp dụng | prisma migrate status |
| Xem bảng nhanh | prisma studio hoặc pgAdmin |
| Chỉ sinh lại client | prisma generate |
| Đọc database có sẵn để suy ra schema | prisma db pull; review diff trước khi dùng |
| Thay schema nhanh không có lịch sử migration | prisma db push; dành cho thử nghiệm riêng, không thay workflow migration của Gemora |
| Áp dụng migration đã review lên staging/production | prisma migrate deploy qua bước release |

Migrate dev có shadow DB và có thể đề nghị reset khi phát hiện drift. Chỉ đồng ý reset khi chắc chắn đó là database local có thể bỏ dữ liệu; không dùng reset để sửa lỗi production. Migrate deploy không tạo migration mới và không tự seed/generate. Xem [workflow migrate](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/development-and-production).

Với production: tách user chạy migration có quyền đổi schema khỏi user runtime chỉ có quyền đọc/ghi cần thiết; dùng secret của môi trường triển khai; cấu hình TLS theo nhà cung cấp; backup và thử restore trước thay đổi lớn. Generate trong bước build, đảm bảo CLI có mặt ở bước deploy, và chạy migration một lần cho mỗi release. Database private; client không kết nối trực tiếp.

## 12. Lựa chọn thay thế: PostgreSQL bằng Docker

Chọn phần này **thay cho cài server Windows**, nếu bạn đã dùng Docker Desktop. Cài theo [hướng dẫn Docker Desktop cho Windows](https://docs.docker.com/desktop/setup/install/windows-install/) rồi bảo đảm Docker đang chạy với Linux containers. Phần Prisma phía trên giữ nguyên.

Tạo `compose.postgres.yml` ở gốc repo:

```yaml
services:
  postgres:
    image: postgres:18
    ports:
      - "127.0.0.1:5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_ADMIN_PASSWORD:?Set POSTGRES_ADMIN_PASSWORD}
      POSTGRES_DB: postgres
    volumes:
      - gemora_postgres_data:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d postgres"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  gemora_postgres_data:
```

Tạo `.env` **ở gốc repo**, chỉ cho Compose, với dòng placeholder dưới và thay bằng mật khẩu quản trị local riêng:

```dotenv
POSTGRES_ADMIN_PASSWORD="REPLACE_WITH_LOCAL_ADMIN_PASSWORD"
```

File này khác `.env` trong game-server. Từ gốc repo:

```powershell
docker compose -f compose.postgres.yml up -d
docker compose -f compose.postgres.yml ps
docker compose -f compose.postgres.yml exec postgres psql -U postgres -d postgres
```

Trong psql, làm lại **phần 4.3** để tạo gemora_app, đặt mật khẩu và tạo gemora_dev/gemora_shadow. Docker POSTGRES_USER là superuser khởi tạo; backend vẫn dùng gemora_app.

Với PostgreSQL image 18, volume trong ví dụ mount vào `/var/lib/postgresql`. Volume giữ dữ liệu khi tạo lại container; không dùng `down -v` trừ khi cố ý xóa dữ liệu local. Các biến khởi tạo chỉ có tác dụng khi thư mục dữ liệu còn trống; đổi password trong `.env` không tự đổi password của database đã tồn tại. Xem [Postgres Official Image](https://hub.docker.com/_/postgres).

Nếu Windows PostgreSQL đã chiếm 5432, dùng host port 5433 trong Compose và đổi cả hai connection URL sang 5433. Nếu sau này backend cũng chạy trong Compose, host sẽ là tên service `postgres`, cổng nội bộ 5432; `127.0.0.1` trong container backend không trỏ tới container database.

## 13. Lỗi thường gặp

| Triệu chứng | Kiểm tra và hướng xử lý |
| --- | --- |
| psql không được nhận diện | Dùng đường dẫn đầy đủ như phần 4; nếu thư mục cài khác thì sửa đường dẫn |
| Không kết nối được / P1001 | Server/service hoặc Docker chưa chạy; sai host/port; kiểm tra TCP rồi đăng nhập psql |
| Sai mật khẩu / P1000 | Dùng mật khẩu gemora_app; kiểm tra URL-encoding; không nhầm mật khẩu postgres |
| Database không tồn tại / P1003 | Kiểm tra đã tạo đúng gemora_dev, đang vào đúng instance/cổng |
| Thiếu DATABASE_URL | Chạy ở apps/game-server; kiểm tra .env và import dotenv/config; không in URL thật vào log |
| Không tạo/khởi tạo được shadow DB | Kiểm tra SHADOW_DATABASE_URL riêng và quyền sở hữu gemora_shadow; không dùng database chính làm shadow |
| Lỗi datasource url trong schema | Đang trộn Prisma khác major; dùng config/schema/package versions đồng bộ theo bài |
| Thiếu generated client | Chạy prisma generate, kiểm tra output và đường dẫn import |
| ESM hoặc lỗi import .ts | Giữ type=module, cấu hình tsconfig và chạy qua tsx như bài; build Node/NestJS cần cấu hình riêng |
| Trùng email/code / P2002 | UNIQUE đã chặn trùng; API cần trả lỗi nghiệp vụ hoặc dùng upsert cho seed |
| Schema drift / yêu cầu reset | Kiểm tra có sửa bảng bằng pgAdmin/Studio SQL ngoài migration; không tự đồng ý reset dữ liệu cần giữ |
| Prisma CLI hiện 8.x | Cài lại đúng bộ 7.10.0 hoặc viết lại toàn bộ config theo v8; không trộn cú pháp |
| Pool hết kết nối | Không tạo client mỗi request; kiểm tra request/transaction giữ kết nối quá lâu |

## 14. Tiêu chí hoàn tất và bước tiếp theo của Gemora

- Đăng nhập psql bằng gemora_app vào gemora_dev thành công.
- prisma validate và migrate status thành công; migration ban đầu được áp dụng.
- prisma generate tạo client; tsc --noEmit không lỗi.
- Seed chạy hai lần vẫn chỉ có một HERO_EXP_SMALL.
- check-db.ts đọc được vật phẩm; Studio nhìn thấy bảng/dữ liệu.
- .env không được Git theo dõi; schema, migration, seed, config, package.json và lockfile được lưu cùng code.

Sau bài này, thực hiện schema P1 trong [kế hoạch Gemora](DATABASE_CLIENT_BACKEND_PLAN.md): auth/session/profile, content có phiên bản, roster và team. Tiếp theo là battle/action snapshot, rồi reward/inventory/upgrade. Transaction cho economy cần cả chống trùng, kiểm tra số dư và kiểm soát cạnh tranh; Prisma hỗ trợ các công cụ này nhưng không tự suy ra luật game. Xem [Prisma transactions](https://www.prisma.io/docs/orm/v7/prisma-client/queries/transactions).

**Mức kiểm chứng tài liệu:** đã đối chiếu các API/lệnh chính với tài liệu chính thức và kiểm tra cấu trúc repo, Node/npm tại máy. Chưa thực thi cài PostgreSQL/Prisma, chạy migration hoặc xác nhận kết nối database của bài hướng dẫn trên máy này.

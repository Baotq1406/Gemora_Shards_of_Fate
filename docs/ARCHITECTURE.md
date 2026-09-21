# Kiến trúc chi tiết dự án — Gemora: Shards of Fate

## 1. Mục đích và trạng thái

Tài liệu này mô tả kiến trúc mục tiêu cho MVP và lộ trình đi từ skeleton hiện tại đến hệ thống chạy được. Nó là tài liệu kỹ thuật đồng hành với [GDD](GDD.md) và [PRD](PRD.md), không phải tuyên bố rằng toàn bộ thành phần đã được triển khai.

| Hạng mục        | Hiện trạng ngày 22/09/2026                                           | Kiến trúc mục tiêu MVP                                         |
| --------------- | -------------------------------------------------------------------- | -------------------------------------------------------------- |
| Monorepo        | npm workspaces với `apps/*`, `packages/*`                            | Giữ monorepo; build/typecheck/test thống nhất                  |
| Game client     | Vite/TypeScript landing và popup xác thực; giữ PixiJS 8 cho gameplay | Scene-based client, typed services, animation từ battle events |
| Game server     | `src/index.ts` trống                                                 | NestJS REST API, Prisma, PostgreSQL                            |
| Admin dashboard | React + TypeScript prototype với fixture và tương tác trong bộ nhớ   | Kết nối Admin REST API và phân quyền thật                      |
| `game-core`     | `src/index.ts` trống                                                 | Engine thuần, deterministic, không I/O                         |
| `shared-types`  | `src/index.ts` trống                                                 | Public DTO/action/event/value types                            |
| Persistence     | Chưa có                                                              | PostgreSQL, Prisma migrations/transactions                     |
| Realtime        | Chưa có                                                              | Không dùng trong PvE MVP; WebSocket là Phase 2                 |
| Deployment      | Chưa có                                                              | Docker Compose + Nginx + health checks                         |

## 2. Mục tiêu kiến trúc

1. **Server authoritative:** client gửi ý định, server quyết định action hợp lệ, state và reward.
2. **Deterministic battle:** cùng content snapshot, seed và action log tạo cùng state hash.
3. **Ranh giới rõ:** UI, networking, use case, domain rule và persistence không trộn lẫn.
4. **Vertical slice sớm:** một luồng register → team → stage → battle → reward → upgrade chạy xuyên hệ thống trước khi mở rộng nội dung.
5. **Thay đổi an toàn:** content published có version, battle giữ snapshot, action và reward idempotent.
6. **Vừa sức MVP:** một server instance và PostgreSQL; không thêm Redis, message broker hoặc microservice khi chưa có nhu cầu đo được.
7. **Quan sát và kiểm thử được:** lỗi có request ID, battle có sequence/action log, engine có unit/property/replay test.

## 3. Những quyết định không thuộc kiến trúc MVP

- Không tách microservice.
- Không dùng event sourcing toàn hệ thống; `BattleAction` chỉ là audit/replay log có chủ đích.
- Không xử lý PvE qua WebSocket.
- Không cho client ghi trực tiếp database hoặc tự cấp reward.
- Không dùng Redis nếu chưa triển khai queue/session PvP hoặc cache có số liệu chứng minh.
- Không chia sẻ ORM model với client; chỉ chia sẻ public contract.

## 4. System context

```text
┌──────────────┐       HTTPS / JSON        ┌──────────────────────────┐
│ Game Player  │ ────────────────────────► │ Gemora Web Platform      │
│ Web Browser  │ ◄──────────────────────── │ Client + Game API        │
└──────────────┘                            └─────────────┬────────────┘
                                                       │
┌──────────────┐       HTTPS / JSON                    │ SQL
│ Administrator│ ────────────────────────►             ▼
│ Web Browser  │ ◄────────────────────────      ┌──────────────┐
└──────────────┘                                 │ PostgreSQL   │
                                                 └──────────────┘
```

Người chơi sử dụng game client; quản trị viên sử dụng dashboard. Cả hai chỉ truy cập dữ liệu qua game server. PostgreSQL không lộ ra public network. Nginx là điểm vào triển khai, phục vụ static assets và reverse proxy `/api`.

## 5. Container architecture

```text
Browser
  ├─ /game  ──► Nginx ──► static game-client build (PixiJS)
  ├─ /admin ──► Nginx ──► static admin-dashboard build (React)
  └─ /api/v1 ─► Nginx ──► game-server (NestJS)
                                ├─ application/domain calls ─► @gemora/game-core
                                ├─ DTO/contracts ───────────► @gemora/shared-types
                                └─ Prisma ──────────────────► PostgreSQL
```

### 5.1. Trách nhiệm container

| Container/package | Sở hữu                                                              | Không được sở hữu                                      |
| ----------------- | ------------------------------------------------------------------- | ------------------------------------------------------ |
| `game-client`     | Input, scene, HUD, animation, local settings, API adapter           | Quyết định reward, quyền sở hữu, state battle thật     |
| `game-server`     | Auth, use case, validation, transaction, persistence, authorization | Rendering, DOM/Pixi objects                            |
| `admin-dashboard` | UI quản trị, form/diff/publish workflow                             | Quyền ADMIN thực; sửa DB trực tiếp                     |
| `game-core`       | Board/combat reducer, luật thuần, deterministic RNG                 | HTTP, DB, clock hệ thống, PixiJS/NestJS/Prisma         |
| `shared-types`    | Public DTO, enum, action/event/value object contract                | Secret, password hash, Prisma entity, business service |
| PostgreSQL        | Trạng thái bền vững, unique constraints, transaction                | Tính toán gameplay ở trigger/stored procedure          |

## 6. Dependency rules

```text
game-client ─────────► shared-types
     └───────────────► game-core  (chỉ preview/animation helper an toàn)

game-server ─────────► shared-types
     └───────────────► game-core

admin-dashboard ─────► shared-types

game-core ───────────► shared-types (chỉ value types ổn định nếu cần)
shared-types ─────────► không phụ thuộc app hoặc game-core
```

Quy tắc bắt buộc:

- Package không import từ `apps/`.
- `game-core` không import API framework, ORM, renderer hoặc global environment.
- App không import file private bên trong package; chỉ dùng public exports.
- `shared-types` không trở thành “sọt rác” chứa helper hoặc domain behavior.
- Runtime validation ở trust boundary; TypeScript type không thay thế validation dữ liệu mạng.

## 7. Cấu trúc thư mục mục tiêu

Chỉ tạo thư mục khi phase tương ứng bắt đầu; cây dưới đây là đích đến, không yêu cầu scaffold toàn bộ ngay lập tức.

```text
Gemora_Shards_of_Fate/
├─ apps/
│  ├─ game-client/
│  │  └─ src/
│  │     ├─ app/              # bootstrap, composition root, scene router
│  │     ├─ scenes/           # Boot, Auth, Home, Team, Campaign, Battle, Result
│  │     ├─ battle/           # board view, HUD, animation queue, presenter
│  │     ├─ heroes/           # roster/card/detail presentation
│  │     ├─ services/         # client use cases
│  │     ├─ stores/           # session/UI state
│  │     ├─ network/          # typed HTTP, auth refresh, error mapping
│  │     ├─ assets/           # manifest and loaders
│  │     └─ ui/               # reusable UI controls
│  ├─ game-server/
│  │  ├─ prisma/              # schema, migrations, seed
│  │  └─ src/
│  │     ├─ auth/
│  │     ├─ players/
│  │     ├─ heroes/
│  │     ├─ teams/
│  │     ├─ stages/
│  │     ├─ battles/
│  │     ├─ rewards/
│  │     ├─ inventory/
│  │     ├─ admin/
│  │     ├─ observability/
│  │     └─ common/           # guards, pipes, error envelope; không chứa domain rời rạc
│  └─ admin-dashboard/
│     └─ src/
│        ├─ app/
│        ├─ features/
│        ├─ api/
│        ├─ auth/
│        └─ ui/
├─ packages/
│  ├─ game-core/
│  │  └─ src/
│  │     ├─ board/
│  │     ├─ battle/
│  │     ├─ combat/
│  │     ├─ skills/
│  │     ├─ ai/
│  │     ├─ rng/
│  │     └─ index.ts
│  └─ shared-types/
│     └─ src/
│        ├─ api/
│        ├─ battle/
│        ├─ content/
│        ├─ errors/
│        └─ index.ts
├─ docs/
└─ package.json
```

Một package `validation` chỉ được tách khi ít nhất hai app thực sự dùng cùng runtime schema. Trước đó, schema request của server ở sát endpoint để ownership rõ.

## 8. Kiến trúc `game-core`

### 8.1. Public API dự kiến

```ts
createBattle(input, rng): BattleState
validateAction(state, action, content): ValidationResult
reduceBattle(state, action, content, rng): {
  state: BattleState;
  events: BattleEvent[];
  rngState: RngState;
}
hashBattleState(state): string
```

Tên và signature cuối cùng được chốt trong code review; nguyên tắc bất biến là input/output serializable và không đọc dependency ngầm.

### 8.2. Invariants

- Board luôn đúng 7×7 trong ruleset MVP.
- Mọi ô có ID/vị trí hợp lệ; không có hai gem cùng chiếm một ô.
- State terminal không nhận action.
- `sequence` tăng đúng một lần cho mỗi action đã commit.
- HP nằm trong `[0, maxHp]`; energy nằm trong `[0, 100]`.
- Một effect chỉ resolve một lần; special chain có tập `visited`.
- Mọi tie-break có thứ tự ổn định hoặc dùng seeded RNG được truyền vào.
- Không dùng `Math.random()`, `Date.now()` hoặc iteration order không bảo đảm để quyết định kết quả.

### 8.3. Reducer pipeline

```text
Action + expected sequence
  → structural validation
  → phase/ownership/rule validation
  → resolve domain command
  → ordered BattleEvents
  → next state + next RNG state
  → invariant checks
  → state hash
```

`BattleEvent` là output giải thích những gì đã xảy ra, ví dụ `GEM_REMOVED`, `SPECIAL_TRIGGERED`, `ENERGY_GAINED`, `DAMAGE_DEALT`, `UNIT_DEFEATED`, `STATUS_APPLIED`, `TURN_CHANGED`, `BATTLE_FINISHED`. Client phát animation từ event rồi reconcile với authoritative state.

### 8.4. Deterministic RNG

RNG phải là dependency với interface nhỏ, có seed/state serialize được. Tạo board, refill và mọi lựa chọn ngẫu nhiên của AI dùng cùng cơ chế. Action result lưu RNG state sau resolve hoặc đủ dữ liệu để replay. Khi thay thuật toán RNG, tăng `engineVersion`; battle cũ tiếp tục dùng version tương thích hoặc snapshot đầy đủ.

## 9. Kiến trúc game client

### 9.1. Layers

```text
Pixi Scene/View
      ↕ view model / typed UI events
Presenter + Animation Queue
      ↕ client use cases
Store (session, navigation, confirmed snapshots)
      ↕ repository interfaces
HTTP/Auth/Asset adapters
```

- Scene sở hữu display objects, ticker và listener; phải dispose khi rời scene.
- Service/use case không import `Sprite`, `Container` hoặc DOM.
- Network layer không chứa luật match/combat.
- Store không mutate battle snapshot để “đoán” kết quả đã commit.
- Optimistic UI chỉ dùng cho trạng thái dễ rollback; battle action khóa input cho tới khi nhận ack/result.

### 9.2. Scene lifecycle

Mỗi scene hỗ trợ `enter(context)`, `update(delta)` nếu cần và `exit()/dispose()`. Router đảm bảo scene trước dừng ticker/subscription trước khi scene mới hoạt động. Boot scene chịu trách nhiệm asset manifest, font, auth restore và route ban đầu.

### 9.3. Battle presentation flow

```text
Player input
  → BattlePresenter tạo action + clientActionId + expectedSequence
  → khóa input và gửi API
  → nhận ordered events + authoritative snapshot
  → AnimationQueue phát events
  → reconcile snapshot/hash
  → mở input nếu phase cho phép
```

Nếu request timeout, client giữ cùng `clientActionId` khi retry. Nếu server trả sequence conflict, client tải lại full state, hủy animation chưa xác nhận và trình diễn trạng thái phục hồi phù hợp.

### 9.4. Asset management

- Asset đi qua manifest có logical ID và version/hash.
- Boot chỉ tải asset cần cho màn đầu; battle bundle tải trước khi vào stage.
- Có placeholder và retry khi asset thiếu.
- Texture dùng chung cache theo scope; scene dispose instance nhưng không hủy nhầm shared texture.
- Object pool chỉ dùng cho phần tử lặp nhiều như gem particle/damage number và phải reset đầy đủ trước khi tái sử dụng.

## 10. Kiến trúc game server

### 10.1. Module pattern

```text
Controller → DTO/runtime validation → Application service
           → authorization/policy  → Domain/game-core
           → repository interface  → Prisma adapter
           → transaction boundary  → response mapper
```

Controller mỏng: nhận request, gọi use case, map status code. Service sở hữu transaction và orchestration. Repository chỉ truy cập dữ liệu, không quyết định luật game. Prisma model không trả thẳng ra response.

### 10.2. Module ownership

| Module    | Use case chính                             | Transaction đáng chú ý                                            |
| --------- | ------------------------------------------ | ----------------------------------------------------------------- |
| Auth      | register/login/refresh/logout              | Tạo User + Profile + starter roster; rotate refresh session       |
| Player    | xem profile/avatar                         | Cập nhật avatar hợp lệ                                            |
| Hero      | roster/detail/level-up                     | Trừ Gold/material + tăng level + ledger                           |
| Team      | xem/lưu team                               | Validate ownership, unique slots, leader                          |
| Stage     | catalog/detail/unlock view                 | Chủ yếu read; content published/versioned                         |
| Battle    | start/state/action/result/abandon          | Lock battle, reduce action, persist state/action, finalize result |
| Reward    | grant và ledger                            | Grant + inventory/currency + progress đúng một lần                |
| Inventory | material stacks                            | Atomic increment/decrement có bounds                              |
| Admin     | content draft/publish, player status, logs | Publish immutable version + audit                                 |

### 10.3. Battle action transaction

```text
1. Authenticate player và kiểm tra ownership battle.
2. Tìm action theo (battleId, clientActionId).
   └─ Nếu đã tồn tại: trả lại result cũ.
3. Lock/read battle ACTIVE và content snapshot.
4. So sánh expectedSequence với current sequence.
5. validateAction + reduceBattle trong game-core.
6. Persist next state, RNG state, sequence và BattleAction.
7. Nếu terminal WON: RewardModule cấp reward, update progress và ledger.
8. Commit.
9. Trả events + public state + sequence + state hash.
```

Các bước 3–7 nằm trong một database transaction. Unique constraint cho `(battleId, clientActionId)` và `(battleId, sequence)` là lớp bảo vệ cuối cùng. Không giữ transaction mở trong lúc gọi dịch vụ mạng ngoài.

### 10.4. Concurrency

MVP có thể dùng optimistic concurrency bằng `sequence` kết hợp transaction/conditional update. Hai action cùng expected sequence: chỉ một action commit; action còn lại nhận `409 SEQUENCE_CONFLICT` và state hiện tại. Start battle cũng idempotent và đảm bảo tối đa một battle active mỗi player bằng constraint hoặc transaction phù hợp.

## 11. Shared contracts

### 11.1. Quy ước API

- Base path `/api/v1`.
- JSON; timestamp UTC ISO 8601; ID opaque string.
- Request action có `clientActionId` và `expectedSequence`.
- Error envelope ổn định:

```json
{
  "code": "SEQUENCE_CONFLICT",
  "message": "Battle state has advanced.",
  "details": {},
  "requestId": "opaque-id"
}
```

- Pagination dùng `cursor` và `limit` tối đa 100 cho danh sách lớn.
- Contract có thể additive trong cùng version; breaking change tạo API/protocol version mới.

### 11.2. Public và private model

Public battle state chỉ chứa dữ liệu client cần để hiển thị/hành động. Database entity có thể chứa snapshot, RNG state, audit và security metadata không được lộ. Password hash, refresh token hash, internal role policy, future PvP hidden state và raw stack trace tuyệt đối không nằm trong shared response type.

## 12. Data architecture

### 12.1. Aggregate và ownership

```text
User ─1:1─ PlayerProfile
PlayerProfile ─1:N─ PlayerHero
PlayerProfile ─1:1─ Inventory ─1:N─ InventoryItem
PlayerProfile ─1:N─ Team ─1:N─ TeamMember
PlayerProfile ─1:N─ Battle ─1:N─ BattleAction
Battle ─1:N─ RewardGrant / BattleParticipant snapshot
World ─1:N─ Chapter ─1:N─ Stage ─1:N─ StageEnemy
HeroDefinition ─N:M─ SkillDefinition
```

### 12.2. Source of truth

| Dữ liệu                      | Nguồn sự thật                                               |
| ---------------------------- | ----------------------------------------------------------- |
| Schema                       | Prisma schema + migrations đã commit                        |
| Content đang draft/published | PostgreSQL, qua Admin API                                   |
| Battle đang chạy             | Battle snapshot/state trong PostgreSQL                      |
| Luật tính toán               | Versioned `game-core` + balance/content snapshot            |
| Client UI state              | Bộ nhớ client; không có thẩm quyền nghiệp vụ                |
| Asset binary                 | Static hosting; manifest/version liên kết với build/content |

### 12.3. Content versioning

Hero, skill, stage và balance config có vòng đời `DRAFT → PUBLISHED → ARCHIVED`. Published record không sửa in-place nếu battle có thể tham chiếu. `POST /battles` ghi `contentVersion`, `engineVersion` và snapshot tối thiểu cần thiết. Publish validate reference, reward không âm, prerequisite không chu trình và dữ liệu skill đúng schema.

### 12.4. Migration và seed

- Migration chỉ tiến về trước trong môi trường chia sẻ; backup trước thay đổi rủi ro.
- Seed MVP phải chạy lại an toàn bằng stable content IDs/upsert có kiểm soát.
- Không seed credential thật; admin dev dùng biến môi trường hoặc bootstrap flow được ghi rõ.
- CI tạo database sạch, chạy migration rồi seed/test để phát hiện drift.

## 13. Authentication và authorization

- Password hash bằng thuật toán thích hợp với cost cấu hình; không log password.
- Access token ngắn hạn; refresh session có rotation và revoke.
- Nếu refresh dùng cookie: `HttpOnly`, `Secure`, `SameSite` phù hợp và CSRF strategy tương ứng.
- Role guard chạy ở server; UI ẩn nút chỉ là trải nghiệm, không phải bảo mật.
- Mỗi resource player phải kiểm tra ownership ở query/use case.
- Admin write ghi `actor`, entity, before/after, timestamp và request ID.
- Lock account thu hồi hoặc vô hiệu session theo policy đã định.

## 14. Security boundaries

| Boundary                  | Kiểm soát                                                 |
| ------------------------- | --------------------------------------------------------- |
| Browser → Nginx           | HTTPS, CSP, security headers, payload limit               |
| Nginx → Server            | Chỉ expose route cần thiết, request ID forwarding         |
| Request → Use case        | Runtime validation, auth, role/ownership, rate limit      |
| Server → Database         | Parameterized Prisma query, least-privilege DB user       |
| Admin content → Published | Schema validation, diff/confirm, immutable version, audit |
| Battle action → Reward    | Sequence, idempotency, transaction, unique constraint     |

Secret được inject qua environment/secret store; `.env.example` chỉ nêu tên biến giả. Log không chứa token, password, full email nếu không cần hoặc public/private battle data nhạy cảm.

## 15. Các luồng hệ thống quan trọng

### 15.1. Register

```text
Client → POST /auth/register
Server validate → transaction tạo User/Profile/Inventory/starter roster/team
Server tạo session → trả public profile + token/cookie phù hợp
Client route Home hoặc onboarding
```

Toàn bộ dữ liệu khởi tạo phải atomic; lỗi giữa chừng không để lại account nửa hoàn chỉnh.

### 15.2. Start battle

```text
Client chọn stage/team → POST /battles + idempotency key
Server kiểm tra ownership/unlock/team/content
Server lấy content version + tạo seed/snapshot
game-core tạo initial state
Server lưu Battle ACTIVE
Client nhận public state và tải Battle scene
```

Double click trả cùng battle/result hoặc lỗi có thể phục hồi, không tạo hai battle active.

### 15.3. Resolve action

```text
Client intent → validate/authorize → game-core reducer
              → transaction state/action/(reward nếu terminal)
              → events + state → animation queue → reconcile
```

### 15.4. Publish content

```text
Admin sửa draft → server validate field/reference/invariant
Admin xem diff và xác nhận → transaction tạo published version + audit
Battle mới dùng version mới; battle active giữ snapshot/version cũ
```

## 16. Error handling và resilience

| Tình huống         | Server                              | Client                                         |
| ------------------ | ----------------------------------- | ---------------------------------------------- |
| Validation fail    | `400` + field details               | Giữ form/action, hiển thị lỗi cụ thể           |
| Chưa đăng nhập     | `401`                               | Refresh một lần; thất bại thì về Login         |
| Không đủ quyền     | `403`                               | Không lộ dữ liệu; thông báo phù hợp            |
| Sequence conflict  | `409` + current sequence/state hint | Tải snapshot mới và reconcile                  |
| Duplicate action   | Trả stored result của action cũ     | Không phát animation/reward hai lần            |
| Timeout sau commit | Retry cùng idempotency key          | Giữ trạng thái pending, không tạo action mới   |
| Asset fail         | Không ảnh hưởng state battle        | Placeholder/retry, không crash toàn app        |
| Server unavailable | Health/log; không trả state giả     | Backoff có giới hạn; khóa action chưa xác nhận |

Server map exception sang error code ổn định và chỉ log stack trace nội bộ. Các lỗi không biết phải có request ID để đối chiếu.

## 17. Observability

### 17.1. Structured log

Field tối thiểu: `timestamp`, `level`, `service`, `environment`, `requestId`, `route`, `status`, `durationMs`. Với battle có thể thêm `battleId`, `sequence`, `clientActionId`, `engineVersion`, `contentVersion`; không log full state mặc định.

### 17.2. Metrics MVP

- HTTP request count/error/latency theo route/status.
- Battle action latency và conflict count.
- Battle started/won/lost/abandoned.
- Reward grant duplicate prevented/failed.
- Database connection/error và process health.
- Client load time, asset failure, battle FPS/memory trong build đo thử.

### 17.3. Health endpoints

- Liveness: process/event loop đang hoạt động, không phụ thuộc database.
- Readiness: database và migration state đủ để nhận traffic.
- Health response public không lộ secret, version dependency chi tiết hoặc stack trace.

## 18. Testing architecture

### 18.1. Test pyramid

| Tầng                 | Trọng tâm                                                                |
| -------------------- | ------------------------------------------------------------------------ |
| Unit/property        | Board invariants, match/special/cascade, damage, status, RNG             |
| Golden replay        | Seed + content + action log cho state hash cố định                       |
| Integration          | Prisma transaction, reward idempotency, content snapshot, auth ownership |
| Contract/API         | Request/response/error schema, permission và conflict                    |
| Component/UI         | Presenter, store, animation queue, admin form                            |
| E2E browser          | Register → team → battle → result → upgrade; admin publish               |
| Performance/security | 20 users staging, FPS/memory, rate limit, role/owner bypass              |

### 18.2. Quy tắc test engine

- Chạy nhiều seed cho initial board, cascade, special chain và dead-board.
- Lưu mọi seed gây bug thành regression fixture.
- Test không phụ thuộc timezone, clock thật hoặc random toàn cục.
- State hash loại bỏ field không thuộc logic như timestamp/request ID.
- Golden snapshot chỉ dùng cho output có ý nghĩa; invariant test ưu tiên hơn snapshot khổng lồ.

### 18.3. Test transaction quan trọng

1. Hai request cùng `clientActionId` chỉ commit một action.
2. Hai request cùng sequence khác ID chỉ một request thắng.
3. Crash/exception khi grant reward rollback cả result và currency/progress.
4. Battle cũ không thay đổi sau khi publish content mới.
5. User A không đọc/sửa battle, team, hero của User B.
6. Admin action không chạy với PLAYER token.

## 19. Build, CI và quality gates

Root scripts mục tiêu nên điều phối workspace mà không che lỗi:

```text
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Pipeline pull request:

1. Cài dependency từ lockfile.
2. Format/lint/typecheck.
3. Unit + property/golden replay tests.
4. Khởi tạo PostgreSQL test, migration và integration tests.
5. Build client, server và admin.
6. E2E smoke test cho critical path khi hạ tầng đã sẵn sàng.
7. Dependency/secret scan phù hợp.

Không publish image/deploy nếu quality gate trước đó thất bại. Build artifact phải ghi commit SHA/build version để đối chiếu log.

## 20. Deployment mục tiêu

```text
Internet
   │ HTTPS
   ▼
Nginx
   ├─ static /game
   ├─ static /admin
   └─ reverse proxy /api/v1
             ▼
        game-server
             │ private network
             ▼
        PostgreSQL volume
```

Docker Compose phù hợp môi trường demo/MVP một máy. Database không publish port ra internet. Nginx thực hiện TLS termination, cache static asset có hash và không cache response nhạy cảm. Server chạy migration bằng bước triển khai có kiểm soát, không để nhiều replica tự migrate đồng thời.

### 20.1. Environment tối thiểu

- `development`: local logging, seed demo, hot reload.
- `test`: database riêng, deterministic fixtures, không dùng credential dev.
- `staging`: gần production, dùng để load/security/browser test.
- `production/demo`: secret riêng, HTTPS, backup và log retention phù hợp.

### 20.2. Backup và phục hồi

MVP cần script/quy trình backup PostgreSQL và một lần diễn tập restore trước nghiệm thu. Backup phải được bảo vệ như dữ liệu gốc. Asset/config release cần map được tới content/build version để phục hồi bản tương thích.

## 21. Performance budgets

| Khu vực            | Budget mục tiêu                                    |
| ------------------ | -------------------------------------------------- |
| Client FPS         | median 60, p95 không thấp hơn 45 trong test 5 phút |
| Client memory      | dưới 500 MB sau 20 trận, không tăng đều            |
| First load         | p75 ≤5 giây trên 20 Mbps, cache lạnh               |
| Asset MVP          | tổng tải ban đầu/bundle cần thiết ≤15 MB           |
| GET profile/stage  | p95 <500 ms ở 20 user staging                      |
| POST battle action | p95 <800 ms ở 20 user staging                      |

Đo trên thiết bị/browser đã ghi nhận. Nếu không đạt, ưu tiên profile texture/particle, payload battle, query/N+1 và transaction duration trước khi thêm cache phân tán.

## 22. Quyết định kiến trúc (ADR index)

| ID      | Quyết định                        | Trạng thái                | Lý do ngắn                                         |
| ------- | --------------------------------- | ------------------------- | -------------------------------------------------- |
| ADR-001 | npm workspaces monorepo           | Accepted hiện tại         | Chia sẻ contract/engine và đơn giản hóa đồ án      |
| ADR-002 | PixiJS cho game client            | Accepted hiện tại         | Renderer 2D đã có trong template                   |
| ADR-003 | Server-authoritative PvE qua REST | Proposed/đã nêu trong PRD | Giảm độ phức tạp realtime, bảo vệ reward           |
| ADR-004 | Deterministic functional core     | Proposed/required         | Replay, test và tái sử dụng cho Phase 2            |
| ADR-005 | NestJS + Prisma + PostgreSQL      | Proposed/đã nêu trong PRD | Module rõ, typed data access, transaction bền vững |
| ADR-006 | React cho admin                   | Proposed/đã nêu trong PRD | Form/table ecosystem, tách khỏi Pixi renderer      |
| ADR-007 | Content immutable theo version    | Proposed/required         | Battle đang chạy không đổi khi admin publish       |
| ADR-008 | Không Redis trong MVP             | Accepted scope            | Chưa có nhu cầu queue/cache/realtime đo được       |

Mỗi quyết định lớn tiếp theo nên có file ADR riêng trong `docs/adr/` khi bắt đầu triển khai, gồm context, decision, consequences và migration plan.

## 23. Trình tự triển khai khuyến nghị

1. Chuẩn hóa root scripts, TypeScript config và public exports cho hai package.
2. Xây `game-core` board deterministic và property tests.
3. Thêm battle reducer/event contract và golden replay.
4. Tạo NestJS health/auth skeleton, Prisma schema/migration.
5. Làm vertical slice start battle/action/result bằng dữ liệu seed.
6. Thay demo PixiJS bằng Boot/Battle scene đọc mock rồi API thật.
7. Thêm roster/team/stage và Campaign UI.
8. Thêm reward/inventory/hero level bằng transaction.
9. Xây admin theo từng use case content thật; không xây CMS tổng quát trước.
10. Hoàn thiện observability, E2E, performance/security test và Docker Compose.

Mỗi bước phải giữ build xanh và có một đường demo chạy được. Không scaffold hàng chục module rỗng trước domain engine.

## 24. Checklist review kiến trúc

### Khi thêm feature

- Feature thuộc app/package nào và ai là nguồn sự thật?
- Dữ liệu đi qua trust boundary nào, runtime validation ở đâu?
- Có cần transaction, idempotency hoặc unique constraint không?
- Có ảnh hưởng deterministic replay/content version không?
- Client phục hồi thế nào khi timeout/reload/sequence conflict?
- Có log/metric đủ điều tra mà không lộ dữ liệu nhạy cảm không?
- Test thấp nhất nào chứng minh invariant chính?

### Trước MVP release

- Dependency graph không vi phạm ranh giới.
- Không còn `Math.random()`/system clock trong engine decision.
- Reward và level-up vượt qua duplicate/rollback tests.
- Content publish không thay đổi battle active.
- Ownership/role tests phủ mọi endpoint nhạy cảm.
- Client dispose scene/listener/texture đúng, qua test 20 trận.
- Migration + seed chạy từ database sạch.
- Backup/restore và fresh Docker setup đã được diễn tập.
- GDD, PRD, API contract và architecture phản ánh cùng một luật.

## 25. Rủi ro kỹ thuật và biện pháp

| Rủi ro                      | Dấu hiệu                                          | Biện pháp                                                         |
| --------------------------- | ------------------------------------------------- | ----------------------------------------------------------------- |
| Engine bị gắn với renderer  | `game-core` import PixiJS hoặc callback animation | Giữ state/event thuần; adapter ở client                           |
| Client/server lệch contract | DTO trùng lặp, lỗi runtime thường xuyên           | Shared contract + runtime validation + contract test              |
| Double reward               | Retry tạo nhiều ledger entry                      | Action ID, unique constraint, transaction, stored response        |
| Content drift               | Battle đổi hành vi sau publish                    | Snapshot + content/engine version immutable                       |
| Race action                 | Hai action cùng lượt cùng commit                  | Expected sequence + conditional write/lock                        |
| Monorepo build rối          | Import source chéo, circular dependency           | Public exports, project references/build order, dependency checks |
| Pixi memory leak            | FPS/memory xấu dần qua nhiều trận                 | Scene ownership, explicit dispose, pooling có reset, profiler     |
| Scope phình                 | Redis/PvP/equipment xuất hiện trước core loop     | Gate theo phase và Definition of Done trong GDD/PRD               |

## 26. Quy tắc duy trì tài liệu

- Cập nhật bảng hiện trạng khi một thành phần chuyển từ proposed sang implemented.
- Quyết định thay framework/database/protocol phải cập nhật ADR trước hoặc cùng pull request.
- Sơ đồ và contract phải thay đổi cùng code, migration và test liên quan.
- Mọi API được triển khai cần có contract cụ thể hơn PRD (OpenAPI là lựa chọn ưu tiên với NestJS).
- Rà soát tài liệu ở cuối mỗi phase và trước demo/triển khai.

# Kế hoạch database, client và backend — Gemora

Ngày: 05/10/2026. Trạng thái: đề xuất triển khai; chưa phải schema/migration đã chạy.

Căn cứ: [PRD](PRD.md), [GDD](GDD.md), [ARCHITECTURE](ARCHITECTURE.md), [UI_IMPLEMENTATION_PLAN](UI_IMPLEMENTATION_PLAN.md) và mã hiện tại. Tài liệu này cụ thể hóa kiến trúc đã đề xuất; khi triển khai cần đồng bộ các quyết định mới vào PRD/Architecture.

## 1. Hiện trạng và mục tiêu

- Client có landing và popup xác thực giả lập; Google mới là nút giao diện.
- Admin React có tổng quan, người chơi, hero, stage, nhật ký trận với fixture trong bộ nhớ.
- Entry point của game-server, game-core và shared-types hiện trống; chưa có persistence/gameplay thật.
- MVP theo PRD: PvE, board 7×7, đội 3 hero, roster 8 hero, 5 element, 7 role, 2 chapter × 4 stage, Gold và vật liệu Hero EXP. Một team/người; player level tối đa 10, hero level tối đa 20.
- Mục tiêu đầu tiên: đăng ký → nhận 3 hero khởi đầu → lưu đội → chơi 1 stage → nhận thưởng → nâng hero → tải lại vẫn giữ dữ liệu.

## 2. Lựa chọn database

Giữ PostgreSQL + Prisma + NestJS như kiến trúc dự án. Một backend chia module, một PostgreSQL và REST là đủ cho MVP PvE theo lượt. Chưa cần Redis, WebSocket hay microservice.

Lưu tài khoản, quyền sở hữu, Gold, vật phẩm, đội, tiến trình và lịch sử giao dịch bằng bảng quan hệ. Lưu state/snapshot trận và cấu hình effect có cấu trúc bằng JSONB, có schema kiểm tra ở server. PostgreSQL hỗ trợ cả dữ liệu quan hệ và JSONB trong cùng database; không cần thêm document database chỉ để chứa board. Xem [JSONB](https://www.postgresql.org/docs/current/datatype-json.html).

Ảnh, âm thanh, atlas để trong static hosting; database giữ asset key/version. MVP lưu Gold ngay trong PlayerProfile theo PRD, chưa tách Wallet đa tiền tệ. Không lưu toàn bộ tài khoản vào một JSON lớn.

## 3. Schema logic đề xuất

Tên dưới đây là model logic, có thể map sang tên bảng snake_case. ID dùng UUID; timestamp dùng timestamptz/UTC; Gold, số lượng, EXP là số nguyên với giới hạn rõ. Các FK truy vấn thường xuyên cần index.

| Nhóm | Bảng | Các trường chính và trách nhiệm |
| --- | --- | --- |
| Tài khoản | User | id, normalizedEmail unique, passwordHash, role PLAYER/ADMIN, status, createdAt |
| Tài khoản | RefreshSession | id, userId, tokenHash, expiresAt, revokedAt, token family để rotation/revoke |
| Người chơi | PlayerProfile | id, userId unique, username unique, avatarKey, level, exp, gold, lastActiveAt |
| Nội dung | ContentRelease | id, version unique, status DRAFT/PUBLISHED/ARCHIVED, publishedAt; đơn vị phát hành nhất quán |
| Nội dung | HeroDefinition, SkillDefinition, HeroSkill | Hero/skill có stable code, releaseId, stats/growth/effect; HeroSkill nối hero với skill cùng release |
| Nội dung | World, Chapter, Stage | ID logic ổn định cho campaign, thứ tự và quan hệ world/chapter/stage |
| Nội dung | StageVersion, EnemyDefinition, StageEnemy | StageVersion(stageId, releaseId), điều kiện mở, turn limit; enemy và đội địch cùng release, AI/boss phase config |
| Nội dung | ItemDefinition, RewardDefinition, BalanceConfig | Mã vật phẩm ổn định; reward thường/first-clear và chi phí nâng cấp thuộc release |
| Hero sở hữu | PlayerHero | id, playerId, heroCode, level, exp, acquiredAt; liên kết hero logic ổn định qua các release |
| Đội | Team, TeamMember | Team(playerId unique, version); member(teamId, slot, playerHeroId, isLeader) |
| Kho | Inventory, InventoryItem | Inventory(playerId unique); item(inventoryId, itemDefinitionId, quantity) |
| Tiến trình | PlayerStageProgress | playerId, stageId, bestStars, clearCount, firstClearGrantedAt |
| Trận | Battle | playerId, stageId, contentReleaseId, engineVersion, status, sequence, seed/rngState riêng tư, initialSnapshot, currentState, result, timestamps |
| Hành động | BattleAction | battleId, sequence, clientActionId, requestHash, payload, storedResponse, stateHash |
| Thưởng | RewardGrant | playerId, battleId, grantKey unique, reward bundle snapshot, createdAt |
| Economy | CurrencyLedger | playerId, operationId, delta, balanceAfter, reason, battleId nullable, createdAt; chỉ thêm bản ghi |
| Retry | OperationReceipt | playerId, operationType, requestId, requestHash, storedResponse; chống lặp start/upgrade/abandon |
| Quản trị | AdminAuditLog | actorId, action, target, before/after đã lọc dữ liệu nhạy cảm, requestId, createdAt |

Chi tiết cần chốt khi viết migration:

- Hero logic dùng một bảng HeroCatalog(code unique) để PlayerHero tham chiếu; HeroDefinition là phiên bản có unique(releaseId, heroCode). Không gắn ownership với một bản hero cũ mãi mãi. SkillDefinition cũng có stable code + releaseId. StageProgress tham chiếu Stage ổn định, không tham chiếu StageVersion.
- Đề xuất phát hành theo ContentRelease: mỗi release chứa tập definition hoàn chỉnh, kích thước MVP nhỏ. Start battle đọc một release đã publish và chụp toàn bộ stats/skill/enemy/reward cần dùng. Admin sửa draft, publish thành release mới; không sửa release đã publish.
- Battle.initialSnapshot chứa participants lúc bắt đầu và state khởi tạo; currentState chứa board, HP, energy, cooldown, status, phase hiện tại. Đây là triển khai snapshot logic của BattleParticipant trong PRD. MVP chưa cần bảng BattleParticipant vật lý; tránh lưu HP ở cả bảng participant và JSON rồi phải đồng bộ hai nguồn.
- Public response chỉ chứa phần state client cần. Không trả seed/RNG state nội bộ, token hash, audit hoặc ORM entity nguyên bản. Nếu dùng hash public state thì cả hai phía dùng cùng phép serialize chuẩn; JSONB không đảm bảo thứ tự key.
- ItemDefinition có ID ổn định; thuộc tính ảnh hưởng economy phải được lưu trong release/snapshot. HP và energy trong trận không ghi về PlayerHero.
- Google OAuth: thêm AuthIdentity(userId, provider, providerSubject), unique(provider, providerSubject), passwordHash nullable cho account chỉ OAuth ở mốc triển khai OAuth. Không tự liên kết hai tài khoản chỉ dựa vào email.

### Ràng buộc và index

| Đối tượng | Ràng buộc cần có |
| --- | --- |
| Ownership | PlayerHero unique(playerId, heroCode) cho MVP mỗi loại một bản |
| Team | Team unique(playerId); member unique(teamId, slot), unique(teamId, playerHeroId); slot trong 1..3; tối đa một isLeader=true bằng partial unique index |
| Team đủ điều kiện | Khi lưu/start, transaction kiểm tra đủ 3 hero, cùng chủ, đúng 1 leader; unique index đơn lẻ không đảm bảo đủ 3 thành viên |
| Inventory | unique(inventoryId, itemDefinitionId), CHECK quantity >= 0 |
| Player | CHECK gold >= 0, exp >= 0; cap level được validate theo ruleset |
| Progress | unique(playerId, stageId), CHECK bestStars BETWEEN 0 AND 3 |
| Action | unique(battleId, clientActionId), unique(battleId, sequence) |
| Battle | Partial unique(playerId) khi status IN ('CREATED','ACTIVE'); index(playerId, createdAt), index(status, updatedAt) |
| Reward | grantKey='battle:{battleId}:clear' cho thưởng mỗi trận; 'player:{playerId}:stage:{stageId}:first-clear' cho thưởng lần đầu |
| Retry | unique(playerId, operationType, requestId); key trùng nhưng payload khác phải báo lỗi |
| Audit/log | index(actorId, createdAt), index(playerId, createdAt) trên bảng tương ứng; phân trang danh sách |

Foreign key giữ quan hệ, CHECK chặn giá trị sai, unique chặn cấp trùng. Các ràng buộc cần SQL riêng thì commit cùng Prisma migration; kiểm tra khả năng hỗ trợ theo phiên bản Prisma thực tế khi cài. Xem [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html) và [partial indexes](https://www.postgresql.org/docs/current/indexes-partial.html).

## 4. Ba transaction quan trọng

**Kết thúc trận:** authenticate/ownership → khóa battle hoặc conditional update theo sequence → chạy game-core → lưu action/state/result → khóa profile/progress theo thứ tự ổn định → tạo grant thường và first-clear nếu chưa có → cộng Gold/item/EXP/hero mốc → cập nhật sao tốt nhất và ledger → commit. Lỗi ở bất kỳ bước nào rollback cả lượt cuối và thưởng. Retry trả lại kết quả đã lưu, không cấp thêm thưởng. Nút “Tiếp tục” trên Result chỉ điều hướng; GET result không cấp thưởng.

**Nâng hero:** dùng requestId → khóa profile, hero và item theo thứ tự thống nhất → kiểm tra ownership/cap, lấy giá từ release hiện hành → trừ Gold/vật liệu với điều kiện đủ số dư → tăng level → ledger + receipt → commit. Dùng expected hero level hoặc quote version để yêu cầu xác nhận lại khi giá/level đã đổi. Hai tab cùng nâng không được tiêu quá số dư; retry cùng request không nâng thêm lần nữa.

**Bắt đầu trận:** dùng requestId → kiểm tra stage mở, đội và account → khóa/read nhất quán profile/team/roster, resolve published release → tạo snapshot → tạo battle duy nhất đang mở → lưu receipt → commit. Nếu đã có trận ACTIVE, trả thông tin để tiếp tục hoặc bỏ trận rõ ràng. Chỉ trả public state.

Mọi action transaction cần kiểm tra lại idempotency sau khi lấy khóa; hai request trùng đến đồng thời vẫn trả cùng kết quả. Unique conflict/serialization conflict cần retry có giới hạn hoặc đọc receipt đã commit. Một transaction đơn thuần không thay thế khóa/conditional update. Xem [Prisma transactions và idempotency](https://docs.prisma.io/docs/orm/v7/prisma-client/queries/transactions); cú pháp cuối cùng theo phiên bản được pin khi triển khai.

## 5. Phân chia tính năng

| Tính năng | Game client | Backend + game-core | Mốc |
| --- | --- | --- | --- |
| Tài khoản | Form, lỗi, restore phiên, logout | Register/login/refresh/revoke, hash mật khẩu, role/ownership, cấp starter một lần | P1 |
| Home | Profile, Gold, điều hướng, trận đang dở | Profile API, tiến trình, activeBattleId | P1–P2 |
| Hero/đội | Roster, chi tiết, chọn 3 slot/leader | Ownership, stats, validation đội, lưu team | P1–P2 |
| Campaign | Bản đồ, khóa/mở, sao, preview reward | Prerequisite, progress, stage published | P2–P4 |
| Board | Chọn/kéo gem, animation swap/cascade/special, âm thanh | Tạo board, swap hợp lệ, match, cascade, refill, shuffle | P0–P2 |
| Combat | HUD, focus, nút skill, telegraph, hiệu ứng HP/energy/status | Phase/lượt, damage/heal, energy, target, cooldown, enemy AI, win/loss | P0–P4 |
| Kết quả | Hiện kết quả và thưởng đã được xác nhận | Chốt trận, sao, unlock, cấp thưởng đúng một lần | P3 |
| Nâng cấp/kho | Material list, preview giá/stat, xác nhận nâng | Giá/cap, trừ tài nguyên, nâng hero, ledger | P3 |
| Phục hồi | Retry cùng ID, báo mất mạng, tải lại state, dừng animation lỗi thời | State bền vững, sequence, receipt, resume/abandon | P2–P3 |
| Settings/tutorial | Volume, tốc độ animation, reduced motion, hướng dẫn | Lưu mốc tutorial nếu ảnh hưởng tiến trình; luật tutorial vẫn được validate | P4 |
| Google login | Nối nút hiện có, xử lý callback/lỗi | Xác minh danh tính, liên kết an toàn, tạo/khôi phục session | Sau slice; tích hợp riêng |

Client được phản hồi kéo/chọn ngay nhưng kết quả damage, drop, Gold, thắng/thua do server quyết định. Không gửi từng frame hoặc particle lên API. Mỗi hành động hợp lệ trả ordered events + public state + sequence; client phát animation rồi đồng bộ state. Timeout giữ nguyên ID để retry; sequence conflict tải lại state.

`packages/game-core`: logic thuần, seeded RNG, reducer/action/event; không DB/HTTP/PixiJS, không thời gian hoặc random toàn cục. `packages/shared-types`: DTO công khai; không chứa Prisma model hay secret. Local settings có thể dùng localStorage; không dùng localStorage làm nguồn sự thật cho progression.

Admin là frontend riêng: bảng/filter/form/preview ở admin-dashboard; kiểm tra ADMIN, khóa người chơi, validation draft/publish, log và audit ở backend. Kết nối API thật theo từng trang sau khi gameplay slice chạy được.

## 6. Kế hoạch theo mốc có thể nghiệm thu

| Mốc | Công việc chính | Điều kiện hoàn thành |
| --- | --- | --- |
| P0 — Luật và hợp đồng | Chốt role/seed, DTO/action/event/errors; game-core board/combat tối thiểu; dựng Battle view bằng fixture | Cùng seed + snapshot + action cho cùng kết quả; demo 3 hero/1 enemy/1 stage trên board 7×7 |
| P1 — Account và persistence | NestJS/Prisma/PostgreSQL, migration + seed; auth/profile/roster/team; nối form auth, Home và Team | Tạo account chỉ cấp starter một lần; logout/login/reload giữ đội; không đọc/sửa dữ liệu người khác |
| P2 — Trận thật | Battle start/state/action/abandon, snapshot/version/sequence/receipts; Pixi HUD + event animation + resume | Chơi 1 stage từ đầu đến terminal; reload/server restart khôi phục state đã commit; action trùng không tiến 2 lượt |
| P3 — Vòng tiến trình | RewardGrant/ledger/inventory/progress, API level-up; Result/Inventory/Hero Detail | Thắng → nhận thưởng → nâng hero → trận sau mạnh hơn; first-clear không lặp; nâng đồng thời không âm Gold |
| P4 — Đủ nội dung MVP | 8 hero/7 role/5 element, special/cascade/status đầy đủ, 8 stage, elite/boss 2 phase, tutorial và cân bằng | Chơi hết campaign; đủ skill/AI; cap level đúng; hero mốc cấp một lần; kiểm tra desktop/mobile |
| P5 — Vận hành và phát hành | Nối Admin thật, release draft/publish, khóa account + audit, config giới hạn, Docker/Nginx, backup/restore, logs | Publish không đổi trận đang chạy; PLAYER không dùng Admin API; fresh setup chạy được; restore backup thành công |

P0 là phần lõi tối thiểu; P4 hoàn thiện mọi cơ chế bắt buộc của PRD. Không cần chờ engine đủ mọi skill mới nối database. Mỗi mốc nên chia ticket nhỏ nhưng phải giữ một luồng demo hoạt động xuyên client–server–database. Chưa ấn định số tuần khi chưa biết nhân lực, lịch làm việc và tình trạng asset.

API giữ tên trong PRD §33. Bổ sung activeBattleId vào GET /players/me để tìm trận đang dở sau reload; idempotency cho start/level-up/abandon; expectedSequence + clientActionId cho actions. Không thêm API “save toàn bộ player” hoặc “client gửi số Gold mới”.

## 7. Migration theo nhu cầu

1. P1: auth/profile/content tối thiểu + hero/team/inventory ban đầu; content seed đủ 3 hero, 1 stage, 1 item.
2. P2: battle/action/receipts và ràng buộc một trận đang mở; lưu snapshot và engine version ngay từ đầu.
3. P3: reward/progress/ledger, reward definition và chi phí upgrade; transaction tests trước khi cho thay đổi tài nguyên thật.
4. P4: seed mở rộng đến đủ nội dung; không ghi đè published release hoặc reset dữ liệu player khi seed lại.
5. P5: audit và các trường quản trị còn thiếu; công cụ publish, backup, chính sách giữ log theo dung lượng đo được.

Dev/test dùng database riêng. Migration và seed phải chạy được trên database sạch; seed chạy lần hai không nhân đôi dữ liệu. Giữ release/engine cần để replay trận cũ hoặc có chính sách kết thúc trận cũ trước khi bỏ engine version.

## 8. Kiểm chứng bắt buộc khi triển khai

- Replay engine; invalid swap, dead board, cascade/special chain, target chết, skill thiếu energy, terminal không nhận action.
- Hai action cùng sequence: chỉ một commit; hai request cùng ID: trả cùng kết quả; cùng ID khác payload: bị từ chối.
- Response bị mất sau commit: retry không tăng lượt, thưởng hay level lần nữa.
- Restart server giữa trận: state đã commit vẫn phục hồi; không cần giữ trận chỉ trong RAM.
- Reward lỗi giữa chừng: rollback, không có Gold tăng nhưng inventory chưa tăng; first-clear độc lập giữa các stage và không lặp khi replay.
- Upgrade ở hai tab: không âm tài nguyên, cap đúng; sửa đội/nâng hero sau start không thay snapshot trận hiện tại.
- Publish release mới giữa trận: trận cũ giữ rules/reward cũ; trận mới dùng release mới; roster/progress không bị mất khi đổi version.
- Auth/ownership/ADMIN/locked account được kiểm tra trên server; chỉ admin đúng quyền mới sửa nội dung.
- Browser flow account → team → battle → reward → upgrade → reload; asset lỗi/mất mạng có đường phục hồi.

## 9. Điểm lệch cần xử lý trước schema

- Admin fixture hiện có Striker/Tank/Support/Healer; PRD yêu cầu Tank/Warrior/Mage/Assassin/Ranger/Support/Healer. Lấy PRD làm chuẩn khi viết enum/seed/UI thật; chưa tự đổi mock trong kế hoạch này.
- PROJECT_STRUCTURE còn nói lựa chọn backend/database để mở; ARCHITECTURE và PRD đã đề xuất NestJS/Prisma/PostgreSQL. Đồng bộ lại khi bắt đầu P1.
- Không đưa equipment, gacha, shop, premium currency, daily quest, guild, PvP, matchmaking hoặc leaderboard vào migration MVP. Mở rộng sau khi vòng PvE đã chơi thử và ổn định.
- Thứ tự ưu tiên ngay sau tài liệu này: chốt hợp đồng P0 và schema P1, dựng board/combat tối thiểu, sau đó nối account và một trận thật. Không cần hoàn thiện toàn bộ Admin trước khi chơi được.

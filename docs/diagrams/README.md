# Sơ đồ Gemora — MVP

[Mở danh sách sơ đồ](index.html). Mỗi sơ đồ có một trang HTML riêng và nút trước/tiếp theo. Trang HTML mở trực tiếp trong trình duyệt, hoạt động offline; có phóng to, SVG và tải PNG.

Đây là thiết kế đề xuất, dựa trên [PRD](../PRD.md), [GDD](../GDD.md), [kế hoạch database](../DATABASE_CLIENT_BACKEND_PLAN.md). Không dùng schema rút gọn trong bài học Prisma làm schema chính thức.

## Mở từng sơ đồ

- [01. Kiến trúc tổng thể](01-system-architecture.html)
- [02. ERD — Tài khoản, hero và đội hình](02-erd-player.html)
- [03. ERD — Nội dung game có phiên bản](03-erd-content.html)
- [04. ERD — Trận đấu, tiến trình và phần thưởng](04-erd-battle.html)
- [05. Luồng chơi tổng thể](05-player-game-flow.html)
- [06. Một lượt chiến đấu PvE](06-battle-turn-flow.html)
- [07. Trao đổi khi người chơi thực hiện một hành động](07-action-sequence.html)
- [08. Vòng đời một trận đấu](08-battle-state.html)
- [09. Luồng nâng hero và bảo vệ tài nguyên](09-hero-upgrade-flow.html)

## Danh mục

| Số | Nội dung | File |
| --- | --- | --- |
| 01 | Kiến trúc tổng thể | [SVG](01-system-architecture.svg) · [PNG](01-system-architecture.png) |
| 02 | ERD — Tài khoản, hero và đội hình | [SVG](02-erd-player.svg) · [PNG](02-erd-player.png) |
| 03 | ERD — Nội dung game có phiên bản | [SVG](03-erd-content.svg) · [PNG](03-erd-content.png) |
| 04 | ERD — Trận đấu, tiến trình và phần thưởng | [SVG](04-erd-battle.svg) · [PNG](04-erd-battle.png) |
| 05 | Luồng chơi tổng thể | [SVG](05-player-game-flow.svg) · [PNG](05-player-game-flow.png) |
| 06 | Một lượt chiến đấu PvE | [SVG](06-battle-turn-flow.svg) · [PNG](06-battle-turn-flow.png) |
| 07 | Trao đổi khi người chơi thực hiện một hành động | [SVG](07-action-sequence.svg) · [PNG](07-action-sequence.png) |
| 08 | Vòng đời một trận đấu | [SVG](08-battle-state.svg) · [PNG](08-battle-state.png) |
| 09 | Luồng nâng hero và bảo vệ tài nguyên | [SVG](09-hero-upgrade-flow.svg) · [PNG](09-hero-upgrade-flow.png) |

## Cách đọc

- ERD: PK = khóa chính, FK = khóa ngoại, UQ = duy nhất. Nhãn quan hệ đọc từ bảng nguồn sang bảng đích trong file DOT. 1 : 0..N nghĩa là một bản ghi có từ 0 đến nhiều bản ghi con.
- Flow: chữ nhật = bước xử lý, hình thoi = điều kiện, bầu dục = điểm bắt đầu/kết thúc. Nhãn Có/Không ghi ngay trên nhánh.
- Sơ đồ sequence: đọc từ trên xuống; đường dọc là vòng đời thành phần, nét đứt ngang là response, khung lớn là transaction.
- ERD được chia theo miền; bảng Profile/Stage/Release xuất hiện lại để giữ ngữ cảnh, không phải tạo thêm bảng trùng. Các FK phụ được ghi trong bảng/ghi chú.

## Ghi chú thiết kế theo từng sơ đồ

### 01. Kiến trúc tổng thể

- Mũi tên hai chiều: trao đổi dữ liệu. Nét đứt: phụ thuộc hỗ trợ.
- MVP PvE dùng REST. Game client và Admin không kết nối trực tiếp database.
- Prisma nằm ở backend; game-core không chứa HTTP, ORM hay renderer.

### 02. ERD — Tài khoản, hero và đội hình

- PK: khóa chính; FK: khóa ngoại; UQ: duy nhất. 1 : 0..N là một bản ghi có thể có nhiều bản ghi con.
- Quan hệ 1:1 là trạng thái nghiệp vụ sau khởi tạo; backend tạo User/Profile/Inventory/Team trong transaction. Đội được lưu hợp lệ phải có đúng 3 hero cùng chủ và một leader.
- UQ: PlayerHero(playerId, heroCode); TeamMember(teamId, playerHeroId). Số 3 và điều kiện cùng chủ cần kiểm tra ở backend.
- HeroCatalog giữ định danh qua các phiên bản. HP/energy đang dùng thuộc Battle, không thuộc PlayerHero.

### 03. ERD — Nội dung game có phiên bản

- UQ: (releaseId, heroCode), (releaseId, skill code), (releaseId, enemy code), (releaseId, stageId).
- Mũi nối thể hiện quan hệ cấu trúc. Khi publish cần kiểm tra đủ hero/skill/enemy/reward, tham chiếu cùng release và prerequisite không có vòng lặp.
- Reward bundle là JSONB có schema; server kiểm tra item/hero code. RewardDefinition kế thừa release qua StageVersion.
- Nội dung đã publish không sửa trực tiếp. Trận mới chụp snapshot; thay nội dung không sửa trận đang chạy.

### 04. ERD — Trận đấu, tiến trình và phần thưởng

- FK playerId của RewardGrant/CurrencyLedger được ghi trong bảng; lược bớt đường nối về Profile để dễ đọc. Profile có 0..N grant và ledger.
- BattleAction: UQ(battleId, clientActionId) và UQ(battleId, sequence). OperationReceipt: UQ(playerId, operationType, requestId).
- grantKey thưởng thường gắn battleId; first-clear gắn playerId + stageId. Mỗi player có tối đa một Battle CREATED/ACTIVE.
- AdminAuditLog (phụ trợ, không vẽ): id, actorId → User, action, target, before/after, requestId, createdAt. Google AuthIdentity ngoài phạm vi MVP này.

### 05. Luồng chơi tổng thể

- Đội/màn không hợp lệ: báo lỗi và giữ nguyên dữ liệu. Đăng nhập thất bại: ở lại form để thử lại.
- Mất mạng hoặc tải lại trang không đồng nghĩa bỏ trận. Abandon chỉ xảy ra khi người chơi xác nhận.
- Thưởng được server cấp khi chốt WON. Màn Result chỉ đọc kết quả, không cấp thưởng lần nữa.

### 06. Một lượt chiến đấu PvE

- Từ chối action sai phase, hero chết, thiếu energy, còn cooldown hoặc target sai; action lỗi không đổi state.
- Kiểm tra terminal ngay khi effect có thể kết thúc trận; không buộc swap hay cho địch đã chết phản công. Mũi skill → WON diễn đạt quy tắc này.
- Hết HP đội hoặc chạm giới hạn lượt → LOST; địch chết do status có thể → WON. Cần chốt thứ tự ưu tiên nếu hai phe cùng chết trong một tick.
- Vượt safety cap cascade: báo lỗi và rollback action, không cấp thưởng. Bỏ trận có xác nhận → ABANDONED (xem sơ đồ trạng thái).

### 07. Trao đổi khi người chơi thực hiện một hành động

- Auth và ownership luôn được kiểm tra trước khi trả lại response của action cũ.
- Transaction không gọi dịch vụ mạng ngoài. Kiểm soát cạnh tranh bằng khóa hoặc cập nhật có điều kiện và unique constraints.
- First-clear dùng khóa player + stage; clear thường dùng battle. Không cấp thưởng trong GET result.

### 08. Vòng đời một trận đấu

- Tạo và kích hoạt có thể nằm trong cùng transaction; lỗi khởi tạo rollback, không để CREATED mồ côi.
- Tải lại hoặc mất mạng: vẫn ACTIVE; resume từ state đã commit. Action sai không tạo chuyển trạng thái.
- Trận kết thúc chỉ đọc result/replay. Bấm chơi lại tạo battleId mới; không đưa WON/LOST về ACTIVE.
- Tối đa một Battle CREATED/ACTIVE trên mỗi player; chống start trùng bằng requestId và ràng buộc database.

### 09. Luồng nâng hero và bảo vệ tài nguyên

- Nếu mất response sau commit, client gửi lại cùng requestId; không tạo ID mới cho lần retry.
- Receipt kiểm tra lại dưới khóa để hai request trùng đồng thời không nâng hai lần; nếu tìm thấy thì trả kết quả cũ.
- Expected level/quote version đã đổi: yêu cầu xác nhận lại. Quyền sở hữu sai hoặc auth lỗi: dừng trước transaction.
- Nâng hero không sửa snapshot của trận đã bắt đầu. Luồng này là thiết kế, chưa phải API đã triển khai.

## Các quyết định cần chốt khi triển khai

- Nếu status làm cả hai phe chết trong cùng tick, cần chốt thứ tự ưu tiên WON/LOST trong GDD và engine tests.
- Backend phải bảo đảm profile/kho/đội sau khởi tạo, đúng ba hero và một leader; quan hệ 1:1/1:3 trên hình mô tả nghiệp vụ, không tự được bảo đảm bằng mỗi FK.
- Nội dung publish phải đủ và tham chiếu cùng release; các quan hệ 0..N vẫn cho phép draft chưa hoàn thiện.
- Sơ đồ nội dung cụ thể hóa RewardDefinition thành bundle JSONB liên kết StageVersion. Cần validate schema và các item/hero code khi publish.

## Chỉnh sửa và tái tạo

Các file .dot là nguồn Graphviz có thể mở trong trình sửa text. Sơ đồ sequence dùng SVG với tọa độ cố định. File build-diagrams.cjs chứa nguồn của toàn bộ bộ sơ đồ và dựng lại HTML/SVG/PNG; sửa trong script nếu muốn giữ kết quả khi chạy lại.

Yêu cầu Node.js và hai package @viz-js/viz, sharp có sẵn trong đường tìm module (NODE_PATH hoặc môi trường riêng). Chạy từ bất kỳ thư mục nào bằng đường dẫn tới script; output luôn nằm cạnh script. Không cần thay package.json của game.

```powershell
node D:\Gemora_Shards_of_Fate\docs\diagrams\build-diagrams.cjs
```

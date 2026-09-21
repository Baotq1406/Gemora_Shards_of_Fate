# Game Design Document — Gemora: Shards of Fate

## 1. Thông tin tài liệu

| Trường | Giá trị |
| --- | --- |
| Phiên bản | 1.0 — bản thiết kế MVP |
| Trạng thái | Draft / living document |
| Cập nhật | 22/09/2026 |
| Thể loại | Turn-based Match-3 RPG, hero collection, PvE |
| Nền tảng | Web desktop; responsive ở mức khả thi |
| Đối tượng đọc | Game designer, developer, artist, QA, giảng viên hướng dẫn |

Tài liệu này mô tả **trải nghiệm và luật chơi**. [PRD](PRD.md) là nguồn yêu cầu sản phẩm và tiêu chí nghiệm thu; [ARCHITECTURE](ARCHITECTURE.md) mô tả cách hiện thực bằng phần mềm. Khi có mâu thuẫn, nhóm phải cập nhật cả ba tài liệu và ghi lại quyết định, không để code tự trở thành luật game ngầm định.

Các con số cân bằng trong GDD là giá trị khởi đầu để playtest, không phải cam kết bất biến. Mọi thay đổi ảnh hưởng luật, reward hoặc nội dung đã phát hành phải đi qua cấu hình có phiên bản.

## 2. High concept

**Elevator pitch:** Gemora: Shards of Fate là game RPG chiến thuật theo lượt, nơi người chơi ghép ngọc trên bàn 7×7 để nạp năng lượng nguyên tố, điều khiển đội ba hero và chọn đúng thời điểm tung kỹ năng trong các trận PvE ngắn 3–7 phút.

**Player fantasy:** xây một đội anh hùng có bản sắc, đọc bàn cờ, tạo chuỗi gem hợp lý và lật ngược thế trận bằng một quyết định chiến thuật đúng lúc.

**Điểm khác biệt cốt lõi:** một thao tác swap đồng thời tác động lên ba lớp quyết định:

1. Thay đổi hình thế của board và khả năng tạo cascade.
2. Nạp năng lượng cho hero cùng nguyên tố.
3. Gây Resonance damage và mở thời điểm dùng skill.

## 3. Trụ cột thiết kế

| Trụ cột | Ý nghĩa khi thiết kế | Dấu hiệu đi sai |
| --- | --- | --- |
| Dễ hiểu, khó tối ưu | Người mới hiểu gem–energy sau hướng dẫn ngắn; người chơi giỏi tìm được nhiều nước có giá trị khác nhau | Quá nhiều luật ẩn hoặc chỉ có một nước đúng hiển nhiên |
| Quyết định có hậu quả | Chọn màu, mục tiêu và thời điểm dùng skill đều thay đổi kết quả | Animation nhiều nhưng lựa chọn không ảnh hưởng chiến thắng |
| Công bằng và tái hiện được | Cùng seed, config và action phải cho cùng kết quả | Reload hoặc thiết bị khác làm thay đổi kết quả trận |
| Tiến bộ có ý nghĩa | Nâng hero giúp vượt thử thách mới nhưng không thay thế hoàn toàn kỹ năng chơi | Chỉ số tăng vô hạn, buộc grind để vượt mọi ải |
| Phiên chơi gọn | Một trận thường kéo dài 3–7 phút, có nhịp căng–nghỉ rõ | Trận thường vượt 10 phút hoặc kết thúc trước khi player ra quyết định |

## 4. Người chơi mục tiêu

- Người chơi casual RPG muốn một phiên chơi ngắn và thấy đội hình mạnh lên rõ ràng.
- Người thích Match-3 muốn dự đoán nước đi, tạo cascade và kiểm soát phần nào tính ngẫu nhiên.
- Người thích sưu tầm hero muốn roster nhỏ nhưng mỗi hero có vai trò thực tế.

MVP phục vụ chuột/bàn phím trên Chrome và Edge desktop. Thao tác chạm cơ bản được cân nhắc trong bố cục, nhưng native mobile và portrait combat không phải mục tiêu chính.

## 5. Vòng lặp gameplay

### 5.1. Vòng lặp 30 giây

```text
Quan sát board và trạng thái hai đội
  → chọn mục tiêu / dùng skill đã sẵn sàng
  → swap một cặp gem hợp lệ
  → xem match, cascade, damage, energy và địch phản công
  → đánh giá board mới và lặp lại
```

Kiểm tra thiết kế: trong 30 giây, người chơi phải thực hiện ít nhất một hành động, nhận phản hồi hình–âm rõ ràng, hiểu phần thưởng chiến thuật của hành động và có lý do để nghĩ về lượt tiếp theo.

### 5.2. Vòng lặp một phiên

```text
Đăng nhập → chọn đội → chọn ải → chiến đấu → nhận kết quả
         → nhận tài nguyên → nâng hero / đổi đội → chọn ải tiếp theo
```

### 5.3. Vòng lặp dài hạn của MVP

Hoàn thành Campaign → mở stage khó hơn → nhận Gold, Hero EXP và vật liệu → tăng level hero → thử đội hình/nguyên tố phù hợp → chinh phục elite và boss.

MVP không dùng gacha, premium currency, daily quest hay cơ chế mất hero. Tám hero được cấp từ roster khởi đầu và các mốc first-clear cố định.

## 6. Cấu trúc một trận

### 6.1. Điều kiện bắt đầu

- Người chơi đã chọn đúng 3 hero sở hữu, không trùng `PlayerHero`.
- Stage đã mở khóa và có content version hợp lệ.
- Mỗi người chơi có tối đa một battle `ACTIVE` trong MVP.
- Server chụp snapshot đội, địch, luật cân bằng và content version tại thời điểm bắt đầu.

### 6.2. Trình tự một player turn

1. Bắt đầu phase `PLAYER_SKILL`; giảm cooldown theo luật.
2. Người chơi có thể đổi focus target hợp lệ.
3. Mỗi hero sống có thể dùng tối đa một skill nếu đủ energy và cooldown bằng 0.
4. Người chơi thực hiện đúng một swap hợp lệ.
5. Game resolve match, special gem, cascade, Resonance và energy.
6. Các hero sống thực hiện basic attack theo Speed giảm dần.
7. Nếu toàn bộ địch bị hạ, battle kết thúc `WON`.
8. Các địch còn sống hành động theo Speed giảm dần.
9. Status tick; kiểm tra toàn đội người chơi bị hạ hoặc chạm giới hạn lượt.
10. Nếu chưa kết thúc, chuyển sang player turn tiếp theo.

Không có đồng hồ lượt trong PvE MVP. Người chơi có thể bỏ qua skill nhưng không thể kết thúc lượt mà không swap. Một action không hợp lệ không tiêu lượt và không đổi state.

### 6.3. Điều kiện kết thúc

| Kết quả | Điều kiện |
| --- | --- |
| `WON` | Tất cả địch hết HP |
| `LOST` | Tất cả hero hết HP hoặc vượt giới hạn 20 lượt |
| `ABANDONED` | Người chơi xác nhận rời battle đang active |

Battle terminal không nhận action mới. Reward chỉ được cấp khi server chốt `WON`, đúng một lần.

## 7. Board Match-3

### 7.1. Cấu hình cơ bản

- Board 7×7, gồm Fire, Water, Nature, Light và Dark.
- Hai ô swap phải kề nhau theo hàng hoặc cột.
- Swap thường phải trực tiếp tạo match; swap với Prism là ngoại lệ hợp lệ.
- Board khởi tạo không có match sẵn và có ít nhất một nước đi hợp lệ.
- PRNG có seed; engine lưu trạng thái PRNG để replay chính xác.

### 7.2. Match và special gem

| Pattern | Kết quả chính | Special tạo ra |
| --- | --- | --- |
| 3 thẳng | Xóa gem, nạp 3 energy, tạo Resonance hit | Không |
| 4 thẳng | Nạp 4 energy | Charge Gem xóa hàng/cột theo hướng match |
| 5 thẳng | Nạp 5 energy | Prism Gem xóa toàn bộ gem của màu được swap cùng |
| L/T | Energy bằng số gem khác nhau trong cụm | Burst Gem xóa vùng 3×3 |

Thứ tự ưu tiên khi pattern chồng nhau: 5 thẳng → L/T → 4 thẳng → 3. Một cụm liên thông sinh tối đa một special. Vị trí ưu tiên là ô cuối của swap nếu thuộc match; nếu không, dùng quy tắc tọa độ ổn định.

### 7.3. Cascade và dead board

Sau khi xóa gem, gravity kéo gem xuống, board refill từ trên và tiếp tục resolve đến khi ổn định. Hệ số Resonance theo cascade:

| Cascade | Hệ số damage |
| --- | --- |
| 1 | ×1.00 |
| 2 | ×1.25 |
| 3 trở lên | ×1.50 |

Energy không nhân hệ số cascade. Engine có safety cap 100 vòng; chạm cap là lỗi kỹ thuật và không được phát reward.

Nếu board không còn swap hợp lệ, game tự shuffle bằng seed tiếp theo, không tiêu lượt. MVP xóa special khi shuffle để tránh trạng thái khó dự đoán; mọi shuffle phải xuất hiện trong event log.

### 7.4. Energy và Resonance

- Mỗi hero sống cùng element với match nhận energy, tối đa 100.
- Gem bị xóa bởi special cấp energy theo `min(số gem cùng màu bị xóa, 8)`.
- Mỗi cụm match/effect tạo một Resonance hit vào focus target.
- Nếu không có hero sống cùng màu, hit dùng hệ số thấp hơn dựa trên tổng ATK đội.
- Khi focus target chết giữa chuỗi, target chuyển sang địch sống có vị trí thấp nhất.

Các hệ số damage chính xác nằm trong balance config có version; renderer không được tự tính lại luật.

## 8. Hệ chiến đấu RPG

### 8.1. Thuộc tính đơn vị

| Thuộc tính | Vai trò |
| --- | --- |
| HP | Khả năng sống sót; về 0 thì đơn vị bị hạ |
| ATK | Đầu vào chính của basic attack, skill và Resonance |
| DEF | Giảm damage nhận vào theo công thức cấu hình |
| Speed | Xác định thứ tự hành động trong cùng phase |
| Element | Tương tác với gem và quan hệ khắc chế |
| Energy | Tài nguyên dùng active skill, từ 0 đến 100 |

Mọi phép tính dùng số nguyên hoặc quy tắc làm tròn xác định. Damage tối thiểu, critical, variance và khắc chế chỉ được thêm khi đã có công thức, test và tín hiệu UI rõ; MVP ưu tiên tính dự đoán được.

### 8.2. Element

- Fire, Water và Nature tạo vòng khắc chế ba chiều.
- Light và Dark khắc chế lẫn nhau.
- Khắc chế phải được hiển thị trước trận và bằng feedback khi đánh trúng.
- Không thiết kế stage bắt buộc duy nhất một element; counter là lợi thế, không phải khóa cứng.

Giá trị multiplier khởi đầu phải nằm trong balance config và được kiểm tra bằng playtest. Nếu người mới không thể giải thích vì sao damage tăng/giảm, feedback cần sửa trước khi tăng độ phức tạp.

### 8.3. Skill và status

MVP có một active skill cho mỗi hero. Một skill định nghĩa tối thiểu:

- energy cost và cooldown;
- loại target;
- damage/heal/shield/status effect;
- thứ tự resolve;
- điều kiện hợp lệ;
- VFX/SFX cue và mô tả ngắn cho người chơi.

Status cần có ID, nguồn, số lượt còn lại, stacking rule và thời điểm tick rõ ràng. MVP chỉ dùng một tập nhỏ như buff ATK/DEF, poison/burn, shield hoặc heal-over-time; không thêm status nếu UI chưa giải thích được.

### 8.4. Enemy AI và boss

Địch thường dùng priority rule có thể dự đoán: hành động hợp lệ ưu tiên cao nhất, sau đó tie-break bằng ID ổn định hoặc seeded RNG. Boss có thể đổi phase theo ngưỡng HP, nhưng phase transition phải phát event riêng và không thay đổi retroactive snapshot.

Telegraph skill mạnh trước một lượt được ưu tiên vì tạo quyết định phòng thủ/thời điểm heal. Boss không nên chỉ là địch có HP lớn.

## 9. Hero và xây đội

### 9.1. Đội hình

- Đội có 3 hero và 1 leader.
- Mỗi slot phải tham chiếu hero thuộc chính người chơi.
- Một hero instance không thể xuất hiện ở hai slot.
- Team được kiểm tra lại ở server trước khi bắt đầu battle.

### 9.2. Vai trò thiết kế

| Role | Công dụng | Câu hỏi cân bằng |
| --- | --- | --- |
| Striker | Burst damage hoặc kết liễu mục tiêu | Có cần setup và có trade-off phòng thủ không? |
| Tank | Hấp thụ damage, shield hoặc bảo vệ đồng đội | Có tạo giá trị ngoài việc nhiều HP không? |
| Support | Buff/debuff, tạo nhịp combo | Hiệu ứng có dễ nhận biết không? |
| Healer | Hồi phục hoặc kiểm soát rủi ro | Có trì hoãn trận quá lâu không? |

Roster MVP gồm 8 hero, mỗi hero cần có element, role, stat curve, một active skill và một điểm mạnh dễ mô tả trong một câu. Không dùng rarity để làm hero cùng vai trò trở thành bản sao mạnh/yếu tuyệt đối.

### 9.3. Mẫu đặc tả hero

```text
Tên / ID:
Fantasy và silhouette:
Element / Role:
Điểm mạnh / điểm yếu:
HP / ATK / DEF / Speed ở level 1 và đường tăng:
Basic attack cue:
Active skill: cost, cooldown, target, effect:
Synergy / counter:
Nguồn mở khóa:
VFX / SFX / animation notes:
Test cases đặc biệt:
```

## 10. Campaign và nội dung MVP

Campaign theo cấu trúc World → Chapter → Stage. MVP có 8 stage, bao gồm tutorial, các ải thường, ít nhất một elite và một boss cuối. Mỗi stage cần:

- mục tiêu và điều kiện mở khóa;
- đội địch và snapshot chỉ số;
- reward thường và first-clear reward;
- giới hạn lượt;
- theme hình ảnh/âm thanh;
- mechanic được giới thiệu hoặc kiểm tra;
- target turn count và target win rate playtest.

Nhịp nội dung đề xuất:

| Chặng | Mục tiêu trải nghiệm |
| --- | --- |
| Stage 1–2 | Dạy swap, match màu, energy và basic attack; tạo chiến thắng sớm |
| Stage 3–4 | Dạy focus target, skill timing và element |
| Stage 5–6 | Kết hợp đội hình, status và special gem |
| Stage 7 | Elite kiểm tra khả năng chuẩn bị và sustain |
| Stage 8 | Boss nhiều nhịp, telegraph và cao trào |

Star rating nếu dùng phải dựa trên điều kiện rõ như chiến thắng, số hero còn sống và ngưỡng lượt. Star không được chặn đường Campaign chính trong MVP.

## 11. Tiến trình và economy

### 11.1. Tài nguyên MVP

| Tài nguyên | Nguồn | Sử dụng | Nguyên tắc |
| --- | --- | --- | --- |
| Gold | Stage clear, first clear | Hero level-up | Sink chính, không có premium conversion |
| Hero EXP / material | Stage reward | Tăng EXP/level hero | Cho phép nhắm mục tiêu thay vì RNG nặng |
| Account EXP | Hoàn thành Campaign | Player level/mốc mở đơn giản | Chủ yếu thể hiện tiến trình |

MVP không có energy/stamina giới hạn lượt chơi, premium currency, loot box hoặc thị trường giữa người chơi.

### 11.2. Reward

- Reward preview là khả dĩ; reward result chỉ hiển thị sau server confirmation.
- First-clear reward được cấp đúng một lần.
- Replay có reward hợp lý nhưng không làm grind trở thành cách duy nhất vượt stage.
- Mọi biến động currency có source và ledger/audit đủ để điều tra double grant.

### 11.3. Level-up

Level-up tiêu Gold và vật liệu/EXP, tăng stat theo curve đã cấu hình. UI phải preview chi phí và stat thay đổi trước khi xác nhận. Một request trùng idempotency key không được trừ tài nguyên hoặc tăng level lần hai.

## 12. Difficulty và balancing

### 12.1. Mục tiêu flow

Độ khó tăng bằng cách giới thiệu một biến mới rồi mới kết hợp nhiều biến. Không tăng đồng thời HP, damage và mechanic mới ở cùng một stage nếu không có playtest chứng minh cần thiết.

Các đòn bẩy cân bằng:

- stat và đội hình địch;
- số lượt giới hạn;
- skill/telegraph của địch;
- reward và tốc độ level-up;
- energy cost/cooldown;
- multiplier element và combo;
- tần suất xuất hiện màu qua PRNG công bằng, không bí mật ưu ái người chơi.

### 12.2. Guardrail khởi đầu

- Trận thường mục tiêu 3–7 phút và 6–15 lượt.
- Tutorial: đa số người mới thắng ở lần đầu nhưng vẫn phải dùng ít nhất một skill.
- Boss: cho người chơi thấy mechanic ít nhất một lần trước khi chịu hậu quả lớn.
- Một hero không được vừa dẫn đầu damage, sustain và utility trong cùng mức đầu tư.
- Thay một hero để counter stage phải tạo khác biệt quan sát được nhưng không bảo đảm thắng.

### 12.3. Playtest loop

1. Ghi giả thuyết: thay đổi nào sẽ cải thiện trải nghiệm nào.
2. Chạy test với seed/config được lưu.
3. Thu thập turn count, duration, HP còn lại, skill usage, fail reason và nhận xét.
4. Chỉ đổi một nhóm biến có liên quan.
5. Chạy lại regression seed và playtest người thật.

## 13. UX, hướng dẫn và accessibility

### 13.1. Thứ tự màn hình MVP

Boot → Login/Register → Home → Campaign/Team/Hero/Inventory → Battle → Result → Home.

Trong Battle, người chơi luôn nhìn thấy:

- HP/energy/cooldown của ba hero;
- HP, status và focus của địch;
- round/phase;
- element relation cần thiết;
- skill có dùng được hay không và lý do khi bị khóa;
- trạng thái mạng/đang chờ server khi action chưa xác nhận.

### 13.2. Onboarding

Tutorial dùng nhiệm vụ ngắn trong ngữ cảnh, không dồn một màn văn bản dài:

1. Highlight một swap tạo match.
2. Cho thấy gem cùng màu nạp energy cho hero.
3. Yêu cầu chọn focus.
4. Yêu cầu dùng skill khi đủ energy.
5. Cho người chơi tự hoàn thành trận.

Người chơi có thể xem lại glossary/tooltips sau tutorial. Không gian lận board im lặng; nếu tutorial dùng board cố định, phải được coi là stage tutorial có seed/config riêng.

### 13.3. Accessibility tối thiểu

- Không dùng màu là tín hiệu duy nhất; gem có shape/icon khác nhau.
- Text và HUD có contrast đủ đọc trên nền combat.
- Có điều chỉnh âm lượng Music/SFX và mức hiệu ứng hình ảnh.
- Không bắt người chơi phản xạ theo thời gian trong PvE.
- Nút chính đủ lớn cho touch cơ bản; focus state cho phần HTML UI.
- Tôn trọng tùy chọn giảm chuyển động cho shake/flash lặp lại.

## 14. Art direction

**Phong cách:** fantasy anime sáng, silhouette hero rõ, hiệu ứng gem giàu năng lượng nhưng HUD không bị che. Gem là lớp tương tác quan trọng nhất nên phải đọc được ở kích thước nhỏ và trong mọi hiệu ứng.

### 14.1. Quy tắc hình ảnh

- Mỗi element có palette, shape và motif riêng.
- Ally và enemy có ngôn ngữ silhouette khác nhau.
- VFX ưu tiên truyền đạt hit, element, shield, heal, critical state và phase transition.
- Rare/special gem phải dễ phân biệt với gem thường ngay cả khi tắt particle.
- Placeholder phải có license rõ và không được trở thành dependency kỹ thuật khó thay.

### 14.2. Camera và animation

MVP dùng layout combat cố định thay vì camera tự do. Animation queue phát theo `BattleEvents`; có thể tăng tốc/bỏ qua hiệu ứng dài nhưng không bỏ qua state. Resolve một action phải giữ thứ tự thị giác phù hợp với thứ tự logic.

## 15. Audio direction

- Nhạc menu: cảm giác phiêu lưu, nhẹ và không gây mệt khi lặp.
- Nhạc battle: nhịp rõ, tăng cường ở boss phase.
- SFX riêng cho swap hợp lệ/sai, match, cascade, special, energy full, skill, hit, heal, win/loss.
- Pitch/layer có thể tăng theo cascade để feedback combo mà không cần thêm text.
- Audio cue quan trọng luôn có visual cue tương ứng.

## 16. Phạm vi MVP

### 16.1. Bắt buộc

- Auth, profile và lưu tiến trình.
- Roster 8 hero; đội 3 hero; mỗi hero một active skill.
- Board 7×7, cascade, match 3/4/5/L/T, special và dead-board shuffle.
- Battle deterministic, enemy AI, win/loss/abandon.
- 8 stage PvE gồm elite/boss.
- Gold, Hero EXP/material và hero level.
- Result/reward server-authoritative.
- Admin cơ bản cho player, hero/stage content và battle log.

### 16.2. Không thuộc MVP

PvP realtime, MMR/ranking, gacha, premium shop, equipment, ascension, guild, chat, marketplace, world boss, daily quest, achievement và native mobile.

Những mục này không được đưa vào sprint MVP nếu các tiêu chí về deterministic engine, reward idempotency, core loop và deployment chưa hoàn tất.

## 17. Chỉ số và tiêu chí playtest

| Câu hỏi | Chỉ số/tín hiệu |
| --- | --- |
| Người mới hiểu core loop? | Hoàn thành tutorial; giải thích được gem → energy → skill; số lần swap sai |
| Trận có nhịp phù hợp? | Duration, turn count, thời gian suy nghĩ giữa action |
| Lựa chọn có ý nghĩa? | Phân bố màu swap, focus change, skill hold/use và team composition |
| Độ khó hợp lý? | Win rate theo stage, HP còn lại, fail reason, retry rate |
| Economy có quá grind? | Số trận tới lần level-up đầu, replay count trước khi mở stage |
| UX có rõ? | Error/retry, abandon, reload recovery, câu hỏi người chơi trong buổi test |

MVP không cần analytics phức tạp. Sáu event nghiệp vụ tối thiểu: `login_success`, `stage_started`, `stage_completed`, `stage_failed`, `hero_upgraded`, `battle_result`. Không ghi credential hoặc dữ liệu cá nhân không cần thiết.

## 18. Definition of fun và Definition of Done thiết kế

### 18.1. Definition of fun cho vertical slice

Vertical slice đạt ngưỡng để mở rộng nội dung khi:

- người thử chủ động cân nhắc ít nhất hai nước swap ở một số lượt;
- energy đầy tạo cảm giác mong đợi và skill thay đổi cục diện;
- cascade tạo phấn khích nhưng không quyết định phần lớn trận chỉ nhờ may mắn;
- người chơi hiểu nguyên nhân thắng/thua;
- họ muốn thử lại bằng cách đổi nước đi hoặc đội hình, không chỉ yêu cầu thêm level.

### 18.2. Done cho một mechanic

Một mechanic chỉ được xem là hoàn tất khi có:

1. Luật và edge case được ghi trong GDD/config.
2. State/action/event contract xác định.
3. Server validation và deterministic test.
4. Feedback hình/âm và trạng thái loading/error.
5. Telemetry hoặc cách quan sát trong playtest.
6. Kiểm tra accessibility liên quan.

## 19. Câu hỏi mở cần playtest/quyết định

| ID | Câu hỏi | Cách quyết định |
| --- | --- | --- |
| GD-01 | Multiplier element chính xác là bao nhiêu? | Mô phỏng + playtest stage 3–6 |
| GD-02 | Basic attack mỗi hero sau swap có làm trận quá dài? | So sánh damage share và duration |
| GD-03 | Giữ hay xóa special khi dead-board shuffle? | MVP đang chọn xóa; kiểm tra cảm giác mất giá trị |
| GD-04 | Star rating có tạo động lực hay làm người chơi grind? | Test sau khi core campaign ổn định |
| GD-05 | Bộ status tối thiểu nào dễ hiểu nhất? | Prototype tối đa 4 status trước khi mở rộng |
| GD-06 | Touch trên tablet có cần drag hay tap–tap? | Usability test trên viewport 768×1024 |

## 20. Quản lý thay đổi

- Thay đổi luật phải ghi lý do, tác động tới save/replay và content version.
- Thay đổi con số cân bằng đi qua config, kèm seed/test trước–sau.
- Không sửa in-place content published đang được battle snapshot tham chiếu.
- Mỗi playtest lưu build/version, config version, seed quan trọng và kết luận.
- GDD được rà lại cuối mỗi phase phát triển; câu hỏi đã giải quyết phải chuyển thành quyết định rõ ràng.

## 21. Glossary

| Thuật ngữ | Nghĩa |
| --- | --- |
| Action | Ý định người chơi gửi lên server: focus, use skill, swap, abandon |
| BattleEvent | Sự kiện có thứ tự do engine sinh để UI trình diễn |
| Cascade | Match mới xuất hiện sau gravity/refill trong cùng action |
| Content version | Phiên bản immutable của hero, stage và balance config |
| Focus target | Địch được ưu tiên nhận hit khi còn sống |
| Resonance | Damage phát sinh từ cụm gem cùng element |
| Snapshot | Bản đóng băng dữ liệu cần thiết để battle không đổi khi content live đổi |
| Special gem | Charge, Burst hoặc Prism có effect xóa đặc biệt |

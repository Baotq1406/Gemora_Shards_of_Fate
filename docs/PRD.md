# Product Requirements Document — Gemora: Shards of Fate

## Mục lục

1. [Thông tin tài liệu](#1-thông-tin-tài-liệu)
2. [Tổng quan sản phẩm](#2-tổng-quan-sản-phẩm)
3. [Vấn đề và cơ hội](#3-vấn-đề-và-cơ-hội)
4. [Mục tiêu](#4-mục-tiêu)
5. [Ngoài phạm vi](#5-ngoài-phạm-vi)
6. [Người chơi mục tiêu](#6-người-chơi-mục-tiêu)
7. [Ý tưởng game cốt lõi](#7-ý-tưởng-game-cốt-lõi)
8. [Core gameplay loop](#8-core-gameplay-loop)
9. [Meta gameplay loop](#9-meta-gameplay-loop)
10. [Hệ thống Match-3](#10-hệ-thống-match-3)
11. [Hệ thống chiến đấu](#11-hệ-thống-chiến-đấu)
12. [Hệ nguyên tố](#12-hệ-nguyên-tố)
13. [Hệ hero](#13-hệ-hero)
14. [Vai trò hero](#14-vai-trò-hero)
15. [Hệ skill](#15-hệ-skill)
16. [Hệ đội hình](#16-hệ-đội-hình)
17. [PvE Campaign](#17-pve-campaign)
18. [Boss Battle](#18-boss-battle)
19. [Tiến trình người chơi](#19-tiến-trình-người-chơi)
20. [Economy](#20-economy)
21. [Inventory](#21-inventory)
22. [Equipment](#22-equipment)
23. [Phần thưởng](#23-phần-thưởng)
24. [PvP](#24-pvp)
25. [Leaderboard](#25-leaderboard)
26. [Authentication](#26-authentication)
27. [Player Profile](#27-player-profile)
28. [Backend](#28-backend)
29. [Dữ liệu và ERD logic](#29-dữ-liệu-và-erd-logic)
30. [Admin Dashboard](#30-admin-dashboard)
31. [Màn hình game client](#31-màn-hình-game-client)
32. [Màn hình admin](#32-màn-hình-admin)
33. [REST API](#33-rest-api)
34. [WebSocket events](#34-websocket-events)
35. [Yêu cầu phi chức năng](#35-yêu-cầu-phi-chức-năng)
36. [Bảo mật](#36-bảo-mật)
37. [Kiến trúc tổng thể](#37-kiến-trúc-tổng-thể)
38. [Kiến trúc client](#38-kiến-trúc-client)
39. [Battle engine](#39-battle-engine)
40. [Shared code và monorepo](#40-shared-code-và-monorepo)
41. [Analytics và logging](#41-analytics-và-logging)
42. [Xử lý lỗi](#42-xử-lý-lỗi)
43. [User stories](#43-user-stories)
44. [Functional requirements](#44-functional-requirements)
45. [Quy ước acceptance criteria](#45-quy-ước-acceptance-criteria)
46. [Bảng phạm vi MVP](#46-bảng-phạm-vi-mvp)
47. [Các giai đoạn phát triển](#47-các-giai-đoạn-phát-triển)
48. [Rủi ro](#48-rủi-ro)
49. [Chiến lược kiểm thử](#49-chiến-lược-kiểm-thử)
50. [Giá trị trình bày đồ án](#50-giá-trị-trình-bày-đồ-án)
51. [Definition of Done](#51-definition-of-done)
52. [Future roadmap](#52-future-roadmap)
53. [Tổng hợp MVP cuối cùng](#53-tổng-hợp-mvp-cuối-cùng)

## 1. Thông tin tài liệu

| Trường | Giá trị |
| --- | --- |
| Product | Gemora: Shards of Fate |
| Version | 1.0 — bản thiết kế đề xuất |
| Status | Draft, chờ xác nhận trước khi triển khai |
| Author | [Họ tên sinh viên] |
| Last updated | [DD/MM/YYYY] |
| Đối tượng đọc | Sinh viên thực hiện, giảng viên hướng dẫn, người thiết kế game/kiến trúc, người kiểm thử |

**Nguyên tắc phạm vi:** Từ “MVP” trong tài liệu là bản đồ án bắt buộc phải chạy được. “Core Release” là phần mở rộng chỉ làm sau khi MVP đạt Definition of Done. “Phase 2” là một phần của Core Release có phụ thuộc kỹ thuật lớn, đặc biệt PvP. “Future” không phải tiêu chí nghiệm thu đồ án. Mọi số liệu cân bằng dưới đây là giá trị khởi đầu có thể chỉnh bằng dữ liệu cấu hình và phải được playtest.

## 2. Tổng quan sản phẩm

Gemora là web-based fantasy RPG kết hợp chiến thuật Match-3, thu thập **hero** và chiến đấu PvE theo lượt. Người chơi chọn đội hình, đổi vị trí gem để tạo chuỗi, tích năng lượng nguyên tố và kích hoạt skill vào thời điểm thích hợp. Mỗi trận phải có quyết định chiến thuật rõ: chọn màu cần nạp, chọn mục tiêu, chấp nhận hay trì hoãn skill để tận dụng combo.

**Genre:** turn-based Match-3 RPG, hero collection, PvE Campaign; PvP là Phase 2. **Platform:** trình duyệt desktop trước (chuột/bàn phím), bố cục responsive và thao tác chạm cơ bản ở mức khả thi, không cam kết tối ưu mobile trong MVP.

**Vision:** một game chiến thuật ngắn, dễ bắt đầu nhưng đủ chiều sâu nhờ tương tác giữa board, nguyên tố và đội hero. **Mission của đồ án:** chứng minh có thể thiết kế và triển khai end-to-end một game web có luật nhất quán, dữ liệu bền vững, hệ quản trị và khả năng mở rộng kỹ thuật. Phong cách fantasy anime là định hướng thẩm mỹ; Gemora dùng nhân vật, tên gọi, luật, nội dung và tài sản sáng tạo riêng.

## 3. Vấn đề và cơ hội

Người chơi thích RPG sưu tầm thường phải dành thời gian dài cho một phiên chơi; nhiều game Match-3 lại thiếu cảm giác phát triển đội hình. Gemora nhắm đến phiên 3–7 phút: một lượt swap có tác dụng rõ lên hero, skill và kết quả trận, còn phần thưởng dẫn tới nâng cấp có ý nghĩa. Đây là giả thuyết sản phẩm cần kiểm chứng với người chơi thử, không phải tuyên bố về thị trường. Với đồ án, bài toán kỹ thuật trung tâm là đồng bộ quy tắc board–combat–progression giữa client và server mà không để client quyết định phần thưởng.

## 4. Mục tiêu

| Nhóm | Mục tiêu và cách đo |
| --- | --- |
| Product | Người mới hoàn thành đăng ký → trận đầu → nâng cấp một hero trong tối đa 15 phút ở ít nhất 4/5 buổi thử có quan sát. |
| Player | Một trận thường hoàn tất trong 3–7 phút với ít nhất hai lựa chọn có ý nghĩa mỗi lượt (swap, mục tiêu hoặc thời điểm dùng skill); 4/5 người thử hiểu quan hệ gem–energy sau hướng dẫn ngắn. |
| Technical | Cùng seed, cấu hình và chuỗi action tạo cùng battle result trong test; server kiểm tra mọi action và cấp reward đúng một lần. |
| Graduation | Trình diễn luồng đăng nhập, xây đội, ải thường, boss, nâng cấp, quản trị nội dung, test engine và triển khai bằng Docker trong một môi trường được ghi lại. |

Các ngưỡng trên là tiêu chí thử nghiệm cho MVP, cần ghi rõ mẫu và điều kiện đo trong báo cáo đồ án.

## 5. Ngoài phạm vi

MVP không có PvP realtime, matchmaking, MMR, leaderboard PvP, gacha, premium shop, monetization, guild, chat, world boss, marketplace, social graph, daily quest, achievement, hàng trăm hero hay nội dung live-service. Equipment và ascension chỉ thuộc Core Release; awakening thuộc Future. Không xây MMORPG, thế giới mở nhiều người đồng thời hoặc ứng dụng native mobile. MVP không yêu cầu tạo tài khoản qua nền tảng thứ ba.

## 6. Người chơi mục tiêu

| Persona | Tuổi tham chiếu | Động lực và hành vi | Khó khăn | Trải nghiệm mong đợi |
| --- | --- | --- | --- | --- |
| Minh — casual RPG player | 18–30 | Chơi 10–20 phút/ngày, thích thấy hero mạnh lên | Quá nhiều hệ nâng cấp và phiên dài | Vào trận nhanh, kết quả rõ, một đường nâng cấp dễ hiểu |
| Lan — strategy/Match-3 player | 18–35 | Thử chuỗi màu, tối ưu combo và lượt | Board có kết quả ngẫu nhiên quá lớn | Swap có dự đoán được hậu quả, combo tạo lợi thế nhưng không tự thắng |
| Khoa — hero collector | 16–30 | Tìm cách phối vai trò và nguyên tố | Hero khác nhau chỉ ở hình ảnh | Roster nhỏ nhưng mỗi hero có công dụng rõ và có lý do đổi đội |

Độ tuổi là giả định thiết kế, không dùng để suy luận dữ liệu cá nhân hay chính sách phát hành.

## 7. Ý tưởng game cốt lõi

Một trận dùng board 7×7 chung cho đội người chơi. Mỗi lượt người chơi swap một cặp gem liền kề tạo match, các hero tương ứng nguyên tố nhận năng lượng; match còn gây đòn **Resonance** lên mục tiêu được chọn. Hero không trùng màu vẫn tham gia thông qua basic attack theo nhịp lượt và kỹ năng hỗ trợ. Trước swap, người chơi có thể dùng skill đã sẵn sàng. Đội địch phản công sau khi người chơi chốt lượt. Mối liên kết “đổi màu → nạp hero → chọn lúc tung skill” là bản sắc cơ chế Gemora; không sao chép board, chỉ số hoặc nội dung của game tham khảo.

Thế giới fantasy gồm World → Chapter → Stage, hero thuộc class và element riêng, có kẻ địch thường, elite và boss. PvE là nội dung bắt buộc; PvP dùng cùng battle engine nhưng phải thiết kế phiên, timeout và bảo mật riêng ở Phase 2.

## 8. Core gameplay loop

1. **Login/Register:** xác thực; tải profile, roster, team và tiến trình.
2. **Home:** hiển thị stage kế tiếp, tài nguyên, nút Team/Campaign; người mới nhận tutorial roster cố định.
3. **Build Team:** chọn 3 hero sở hữu, không lặp PlayerHero, một leader; xem nguyên tố và vai trò.
4. **Select Stage:** chỉ stage đã mở; xem địch, độ khó, reward khả dĩ, trạng thái first clear.
5. **Battle Start:** server chụp snapshot chỉ số đội và phiên bản nội dung, tạo board từ seed, lưu battle ACTIVE.
6. **Match Gems:** người chơi chọn mục tiêu rồi swap hai ô kề nhau; server xác nhận match, xử lý cascade và special gem.
7. **Gain Energy / Use Skills:** trận nhận energy theo màu; người chơi có thể kích hoạt skill trước swap của lượt tiếp theo khi đủ energy và cooldown bằng 0.
8. **Enemy Turn:** khi lượt người chơi kết thúc, AI địch chọn hành động theo mẫu đã công bố; server tính damage/status.
9. **Result:** hết HP toàn bộ địch là thắng; hết HP toàn đội hoặc vượt turn limit là thua; server chốt kết quả một lần.
10. **Rewards / Upgrade:** thắng nhận gold, EXP và vật liệu; dùng tài nguyên để tăng level hero rồi tiếp tục ải.

Để MVP dễ hiểu, một **player turn** gồm tối đa một skill của mỗi hero còn sống, sau đó đúng một swap hợp lệ. Không có đồng hồ lượt trong PvE. Người chơi có thể bỏ qua skill; không thể kết thúc lượt mà không swap. Basic attack và Resonance được giải quyết sau swap, rồi tới enemy turn. UI phải thể hiện thứ tự sự kiện này.

## 9. Meta gameplay loop

Người chơi hoàn thành stage → nhận gold, Hero EXP và vật liệu → nâng cấp một hero → đổi đội theo địch/element → mở stage khó hơn → kiếm tài nguyên nhiều hơn. MVP cấp **8 hero định sẵn** qua tài khoản mới và mốc first-clear; không có gacha, shop hoặc cơ chế mất hero. Level người chơi tăng theo campaign EXP và chỉ dùng hiển thị thành tích/mốc mở nội dung đơn giản; không khóa sức mạnh bằng nhiều lớp hệ thống. Core Release có thể thêm equipment và ascension sau khi loop cơ bản được playtest.

## 10. Hệ thống Match-3

**Board:** 7×7. Kích thước này tạo đủ chỗ cho match 4/5 và L/T nhưng vẫn đọc được trên viewport laptop phổ biến; 8×8 làm lượt nhiều lựa chọn hơn và UI nhỏ, 6×6 giảm cơ hội hình đặc biệt. Có 5 gem: Fire, Water, Nature, Light, Dark. Không có gem hồi máu riêng; healer dùng energy đúng element của mình, tạo quyết định giữ màu cho heal hay gây damage.

| Quy tắc | Đặc tả MVP |
| --- | --- |
| Tạo board | Seeded PRNG; khởi tạo không có match sẵn và có ít nhất một swap hợp lệ. Giới hạn 100 lần tạo, sau đó dùng thuật toán sửa board có kiểm thử. |
| Swap | Chỉ hai ô orthogonally adjacent, thuộc board, chưa bị khóa; swap phải tạo match **trực tiếp**, trừ swap có Prism Gem kích hoạt effect. Swap sai trả về board cũ, không tiêu lượt. |
| Match 3 | Ba gem cùng element theo hàng/cột; loại bỏ, mỗi hero sống cùng element nhận 3 energy, tạo 1 Resonance hit của element đó. |
| Match 4 | Mỗi hero sống cùng element nhận 4 energy; tạo 1 **Charge Gem** ở vị trí cuối của swap nếu thuộc match, nếu không tại ô ưu tiên theo tọa độ; kích hoạt bằng một swap hợp lệ sau đó để xóa hàng/cột theo hướng match gốc. |
| Match 5 | Mỗi hero sống cùng element nhận 5 energy; tạo 1 **Prism Gem**. Swap Prism với gem kề sẽ xóa mọi gem của element đó, tính là một action hợp lệ. Không nhân đôi special khi shape chồng nhau. |
| L/T | Mỗi hero sống cùng element nhận energy bằng số gem khác nhau trong cụm; tạo 1 **Burst Gem** tại ô giao; kích hoạt xóa vùng 3×3. |
| Ưu tiên shape | 5 thẳng → L/T → 4 thẳng → 3. Một cụm liên thông sinh tối đa một special; các gem còn lại bị xóa theo union của match. |
| Cascade | Sau xóa: gravity theo cột, refill từ trên bằng PRNG có seed, quét match mới đến khi ổn định. Không cap số cascade trong luật; engine có safety cap 100 vòng và báo lỗi thay vì phát reward nếu vượt cap. |
| Combo | Cascade thứ 1 hệ số damage ×1, thứ 2 ×1.25, từ thứ 3 ×1.5; energy không nhân hệ số, tránh bùng nổ skill. Làm tròn damage xuống ở cuối mỗi hit. |
| Special | Gem đặc biệt giữ element nguồn (Prism không có element). Special đã tạo không kích hoạt ngay trong cùng lượt; khi bị match hoặc swap hợp lệ ở lượt sau, effect được giải quyết một lần theo thứ tự tọa độ. Chain effect có hàng đợi và tập visited để tránh lặp. |
| Dead board | Sau refill ổn định, nếu không có swap hợp lệ: shuffle toàn bộ gem thường, giữ count theo màu; xóa special rồi tái tạo board hợp lệ bằng seed tiếp theo. Shuffle không tiêu lượt và được ghi event. |

Một match tạo energy cho **mỗi hero sống** cùng element, tối đa energy 100. Gem bị xóa bởi effect của special cũng cấp energy cùng màu bằng `min(số gem bị xóa, 8)` cho mỗi hero phù hợp và tạo một Resonance hit; riêng Prism dùng màu gem đã swap cùng. Gem bị xóa chỉ bởi effect không tạo special mới, nhưng match mới sau gravity/refill vẫn được xử lý như cascade thường. Để tránh hero không trùng màu bị vô dụng, basic attack của từng hero sống xảy ra một lần sau swap và không tiêu energy. Resonance hit dùng tổng ATK của hero sống cùng màu nhân hệ số 0.20; nếu không có hero màu đó, dùng 0.10 × tổng ATK đội và element là màu match. Với mỗi cụm match/effect, hit chọn mục tiêu đang được focus; nếu mục tiêu chết, chuyển sang địch sống có vị trí thấp nhất. Mỗi cụm được xử lý theo (cascade index, hàng, cột, element), giúp replay ổn định. Những hằng số cân bằng là config có version, không hard-code trong renderer.

## 11. Hệ thống chiến đấu

**State machine:** CREATED → ACTIVE → WON/LOST/ABANDONED; kết quả terminal không nhận action mới. Trạng thái ACTIVE có `round`, `phase` (PLAYER_SKILL, PLAYER_SWAP, RESOLVE, ENEMY), board, HP/energy/status/cooldown của tất cả đơn vị, seed/PRNG state, contentVersion và action sequence. Start battle lưu snapshot để chỉnh hero/stage sau này không đổi trận đang chạy.

**Trình tự lượt:** giảm cooldown ở đầu PLAYER_SKILL; player chọn focus và dùng 0–3 skill hợp lệ; swap một lần; resolve match/cascade/Resonance; mỗi hero sống basic attack vào focus theo Speed giảm dần (hòa thì theo ID ổn định); kiểm tra thắng; địch sống hành động theo Speed giảm dần; tick status cuối enemy turn; kiểm tra thua và turn limit 20; quay lại player turn. Không có phản công nếu địch đã chết. PvE tự động lưu sau action; tải lại tiếp tục đúng state.

**Công thức khởi điểm:** `raw = max(1, floor(power × ATK × 100 / (100 + DEF)))`; `elementMultiplier` là 1.25 / 0.80 / 1; `critMultiplier = 1 + CritDamage` khi RNG roll < CritRate, ngược lại bằng 1; `damage = max(1, floor(raw × elementMultiplier × critMultiplier × comboMultiplier))`. `power` là hệ số skill (basic 0.5), ATK/DEF sau buff; `CritRate` được chặn 0–0.75, `CritDamage` mặc định 0.50 và chặn 0–2.00. Heal `floor(caster ATK × healPower)` không vượt MaxHP và không crit ở MVP. Damage nguyên tố tính theo nguyên tố của đòn, không theo gem tạo năng lượng cho skill khác. Mọi roll dùng PRNG của battle; không dùng `Math.random` trong engine.

**Status MVP:** `GUARD` giảm 25% damage nhận trong 1 enemy turn; `BURN` gây 5% MaxHP (tối thiểu 1) cuối enemy turn trong 2 lượt; `WEAKEN` giảm 20% ATK trong 2 lượt. Mỗi status có source, target, duration; cùng loại chỉ refresh duration, không stack. Hero HP = 0 là chết, không nhận energy/không hành động; enemy HP = 0 tương tự. Địch không đánh mục tiêu chết. Skill không đủ energy, còn cooldown, caster chết hoặc target không hợp lệ bị từ chối và không đổi state. Ultimate nằm trong Core Release; MVP dùng một active skill/hero và basic attack tự động. Hệ buff/debuff trên là tập nhỏ nhưng có thể mở rộng theo effect registry.

## 12. Hệ nguyên tố

Fire > Nature > Water > Fire. Light và Dark khắc chế hai chiều; các cặp còn lại trung tính. Tấn công khắc chế dùng ×1.25, bị khắc chế ×0.80, trung tính ×1.00. Chỉ áp dụng một multiplier, không cộng dồn theo đội. UI hiển thị mũi tên mạnh/yếu trong màn hình Team và biểu tượng “Strong/Weak” ngay khi chọn mục tiêu, kèm màu và nhãn chữ để không phụ thuộc nhận biết màu sắc. Server là nguồn tính chính thức; client chỉ preview.

## 13. Hệ hero

`HeroDefinition` là nội dung toàn cục do admin quản lý: `id`, `name`, `description`, `rarity` (Common/Rare/Epic cho MVP), `element`, `role`, `class`, base HP/ATK/DEF/Speed/CritRate/CritDamage, growth curve, skill IDs, contentVersion và trạng thái published. `PlayerHero` là một bản hero do người chơi sở hữu: `id`, `playerId`, `heroDefinitionId`, `level`, `exp`, `ascensionRank` (0 trong MVP), `currentEquipment` (rỗng trong MVP), `acquiredAt`. Energy và HP hiện tại thuộc **BattleParticipant snapshot**, không lưu làm chỉ số vĩnh viễn của PlayerHero.

Tách definition khỏi ownership để một lần cân bằng không phải sửa từng tài khoản, còn level và EXP riêng của từng người không ghi đè nội dung mẫu. Khi bắt đầu trận, server tính chỉ số dẫn xuất từ definition + level và khóa bản snapshot/contentVersion cho trận đó. Roster MVP gồm 8 hero: ít nhất một Tank, Warrior, Mage, Assassin, Ranger, Support, Healer và một hero linh hoạt; 5 element đều có đại diện. Tên, art, skill và chỉ số cụ thể được chốt trong GDD/content seed trước Phase 4.

## 14. Vai trò hero

| Role | Nhiệm vụ | Tương tác Match-3 dự kiến |
| --- | --- | --- |
| Tank | Chịu đòn, bảo vệ đồng đội | Skill GUARD sau khi nạp đủ màu bản thân |
| Warrior | Damage ổn định | Basic attack mạnh, hưởng lợi từ combo |
| Mage | Damage diện rộng | Skill đánh nhiều địch, phù hợp chuẩn bị màu |
| Assassin | Hạ mục tiêu yếu | Skill ưu tiên mục tiêu HP thấp, khuyến khích focus |
| Ranger | Damage đơn mục tiêu linh hoạt | Skill bỏ qua một phần DEF |
| Support | Tăng hiệu quả đội | Skill cấp GUARD hoặc buff trong giới hạn effect registry |
| Healer | Giữ đội sống | Skill heal một đồng minh, phải cân đối energy với damage |

`role` là vai trò chiến thuật; `class` là phân loại nội dung/animation, MVP có thể trùng tên role nhưng vẫn lưu riêng để sau này thêm biến thể. Mỗi hero có element cố định; gem không bắt buộc tương ứng với role.

## 15. Hệ skill

Mô hình dài hạn: Basic Attack, Skill 1, Skill 2, Ultimate, Passive. **MVP:** mỗi hero có Basic Attack tự động và một Skill 1 chủ động; tối đa 3 mẫu effect dùng lại (damage, heal, GUARD/BURN/WEAKEN). Không có Skill 2, Ultimate hoặc Passive ở MVP. Điều này giữ 8 hero khác biệt qua role, element, power/cost/target/effect mà không tăng số hành vi phải test quá mức.

`SkillDefinition` chứa `id`, `name`, `energyCost` (ví dụ 40–60), `cooldownTurns` (0–2), `targetType` (`SELF`, `ALLY_ONE`, `ENEMY_ONE`, `ENEMY_ALL`), `power`, `effectType`, `effectDuration`, `contentVersion`. Skill được dùng ở PLAYER_SKILL; trừ energy và đặt cooldown sau khi validation thành công. Target chết hoặc thuộc sai team bị từ chối. `ENEMY_ALL` áp dụng damage theo thứ tự ID; không đổi RNG ordering. Skill AoE, status và ultimate phức tạp chỉ mở rộng qua schema/effect registry sau MVP. UI luôn hiện energy hiện tại/cost, cooldown, target hợp lệ và lý do nút bị khóa.

## 16. Hệ đội hình

Đội MVP có **3 hero**: vị trí Front (1) và Back (2); một leader nằm trong ba vị trí, là nhãn nhận diện chưa cho bonus chỉ số ở MVP. Front bị AI ưu tiên 70% nếu còn sống, Back chia 30% theo seed; target selection deterministic theo PRNG. Không có hàng chặn đường phức tạp. Team validation: đủ 3 PlayerHero khác nhau, cùng chủ sở hữu, chưa bị vô hiệu, đúng vị trí duy nhất; một leader; không khóa role/element. Người chơi có một đội đang chọn và lưu được tối đa 3 preset ở Core Release; MVP chỉ lưu một. Synergy theo element là Future để tránh buộc người chơi xếp đội đơn sắc.

## 17. PvE Campaign

MVP: **1 World, 2 Chapter, mỗi Chapter 4 Stage** (6 thường, 1 elite, 1 boss). Stage ID, thứ tự và prereq là dữ liệu; hoàn thành stage trước mở stage sau. Admin được chỉnh nội dung ở trạng thái Draft; publish tạo contentVersion mới. Ải thường có 1–3 địch, elite có 2–3 địch với skill đặc biệt, boss có một boss và tối đa một add đơn giản. Difficulty tăng bằng level/HP/ATK và mẫu hành động, không chỉ tăng tất cả chỉ số tuyến tính. Kịch bản điều chỉnh mục tiêu: người chơi dùng đội cấp tương ứng thắng ải thường trong 3–7 phút, boss cần 5–10 phút.

Thắng cấp tối đa 3 sao: 1 sao thắng; +1 nếu không hero nào chết; +1 nếu kết thúc ≤ 10 player turns. Sao tốt nhất lưu trên `PlayerStageProgress`; first-clear reward cấp đúng một lần. Thua không nhận first-clear hay unlock; có thể nhận lượng EXP nhỏ nếu cần playtest nhưng mặc định bằng 0 trong MVP. Không có stamina/energy-to-enter.

## 18. Boss Battle

Boss cuối World có **hai phase**: Phase A > 50% MaxHP, Phase B ≤ 50%. Khi đổi phase, boss phát sự kiện telegraph và dùng skill AoE BURN ở enemy turn kế tiếp; các turn sau luân phiên basic/skill theo pattern cấu hình. Boss có thể gọi tối đa một add ở Phase B; không tạo thêm nếu add còn sống. UI chỉ ra phase, hành động kế tiếp và status nguy hiểm để người chơi có cơ sở chọn heal/guard. Turn limit 20 là giới hạn chung; **enrage** là Core Release nếu boss playtest quá dễ, không cần trong MVP. Boss result dùng cùng quy tắc thắng/thua, reward chỉ cấp một lần.

## 19. Tiến trình người chơi

| Hệ | MVP | Sau MVP |
| --- | --- | --- |
| Player Level | EXP từ stage; cap 10, hiển thị và mở chapter 2 tại level 3 hoặc sau chapter 1 (điều kiện nào đến sau). | Milestone mới, avatar/title. |
| Hero Level | Cap 20; gold + Hero EXP item, growth curve HP/ATK/DEF theo bảng; tăng cấp có xác nhận chi phí. | Cap cao hơn, nhiều curve. |
| Ascension | Không triển khai; trường dự phòng 0. | Core Release, thêm vật liệu và max-level gate. |
| Awakening | Không. | Future, chỉ khi vai trò chiến thuật cần thêm chiều sâu. |
| Equipment | Không ảnh hưởng trận. | Core Release tối đa 2 slot, xem §22. |

Không có reset mất tài nguyên do thao tác thất bại; nâng cấp là transaction atomic, từ chối nếu thiếu bất kỳ chi phí nào.

## 20. Economy

| Currency/resource | Source | Usage | Mốc |
| --- | --- | --- | --- |
| Gold | Stage clear, first clear, boss | Nâng level hero | MVP |
| Player EXP | Stage clear | Tăng Player Level tự động | MVP |
| Hero EXP material | Stage clear, boss | Nâng hero; tồn kho theo số lượng | MVP |
| Ascension material | Boss/elite | Ascension | Core Release |
| Premium currency | Chưa có nguồn | Gacha/cosmetic nếu phát triển và đánh giá đạo đức sản phẩm | Future |

Reward table cố định theo stage, không có giá động hoặc giao dịch giữa người chơi. Server ghi ledger tối thiểu `reason`, `sourceId`, `amount`, `balanceAfter`, `createdAt` cho Gold và material để đối soát lỗi; `sourceId` của battle result là duy nhất để chống cấp trùng.

## 21. Inventory

MVP có material dạng stack: `itemDefinitionId`, `quantity` nguyên không âm, `updatedAt`; Hero EXP item là loại sử dụng đầu tiên. Inventory UI hiển thị số lượng, nguồn kiếm và tác dụng; không có giới hạn ô hoặc bán vật phẩm. Equipment và consumable được định nghĩa trong taxonomy nhưng chưa phát sinh ở MVP. Không cho client gửi số lượng nhận/thay đổi; server suy ra từ reward/upgrade đã validate.

## 22. Equipment

**Core Release:** hai slot `Weapon` (+ATK) và `Armor` (+HP/DEF); cùng một item instance chỉ gắn cho một PlayerHero, thay đồ cập nhật trong transaction. `Accessory`, random substat, set bonus, nâng cấp trang bị và item rarity phức tạp là Future. MVP không đưa equipment vào công thức damage hoặc screen bắt buộc, dù schema có thể chừa khóa ngoại nullable. Quyết định này tránh ba nguồn cân bằng đồng thời (level, skill, equipment) trong đồ án.

## 23. Phần thưởng

Stage thường có Gold + Player EXP + xác suất hoặc số Hero EXP material **cấu hình cố định**; để test ổn định, MVP dùng số lượng cố định. First-clear cấp thêm một hero hoặc Gold theo bảng và lưu dấu `firstClearClaimedAt`. Boss cấp lượng material lớn hơn và một hero milestone. Nếu có PvP ở Phase 2, reward mùa là cosmetic hoặc Gold có giới hạn ngày để tránh ảnh hưởng PvE balance; daily reward thuộc Future. Server chốt `BattleResult` + progress + currencies + inventory trong một database transaction với unique key theo battle ID; retry API trả cùng kết quả, không cộng tiếp.

## 24. PvP

**Phase 2 / Core Release, không là điều kiện tốt nghiệp.** PvP 1v1 đồng bộ lượt dùng snapshot hero cân bằng và board seed do server giữ. Matchmaking tìm đối thủ trong dải MMR ±100, mở rộng 50 mỗi 10 giây đến ±300; sau 60 giây báo chưa tìm thấy. Rating ban đầu 1000, cập nhật Elo K=24 sau trận hợp lệ; không cập nhật khi trận bị hủy trước lượt đầu. Server authoritative: client chỉ gửi `swap_gem` (tọa độ A/B), `use_skill` (heroId/skillId/targetId), `surrender`; server validate session, lượt, adjacency/target/energy → chạy engine Match-3 và combat → lưu state/action sequence → broadcast state/event. Client không gửi damage, board cuối, reward hay MMR.

Mỗi player turn giới hạn 30 giây; hết giờ server dùng fallback action hợp lệ xác định theo seed hoặc bỏ lượt theo luật đã công bố (quyết định cuối cần playtest trước Phase 2). Mất kết nối giữ slot 60 giây và cho reconnect bằng auth/session; hết hạn xử thua. Surrender kết thúc ngay. Tất cả action có `battleId`, `expectedSequence`, `clientActionId`; server từ chối stale/duplicate hoặc trả kết quả cũ, tránh double action. Không tin đồng hồ client. Log tối thiểu đủ replay tranh chấp. UI và transport chỉ được triển khai sau khi battle engine chứng minh deterministic trên cùng input.

## 25. Leaderboard

MVP có thể hiển thị **highest stage** trong profile cá nhân, chưa cần leaderboard công khai. Core Release: bảng highest-stage sắp theo stage order rồi thời gian hoàn thành, giới hạn top 100 và chỉ hiển thị username công khai; cập nhật từ battle result đã chốt. Nếu PvP được triển khai, ranking theo MMR có season ID và quy tắc tie-break (win count, thời điểm đạt điểm). Optional score ranking là Future vì cần chống gian lận và chuẩn hóa score. Admin có thể ẩn tài khoản bị khóa khỏi bảng.

## 26. Authentication

MVP hỗ trợ register bằng username duy nhất (3–20 ký tự chữ/số/`_`), email duy nhất, password tối thiểu 12 ký tự; login bằng email + password; logout; access JWT TTL 15 phút; refresh token quay vòng TTL 7 ngày và lưu **hash** ở server. Password hash bằng Argon2id (hoặc bcrypt cost phù hợp nếu môi trường không hỗ trợ), không ghi log password/token. `PLAYER` chỉ truy cập dữ liệu mình sở hữu; `ADMIN` truy cập route quản trị, tài khoản admin tạo bằng seed/CLI riêng, không được đăng ký công khai. Sai thông tin đăng nhập trả thông điệp chung để không lộ email tồn tại. Logout thu hồi refresh token; access JWT hiện tại hết hạn theo TTL, API nhạy cảm có thể kiểm tra session version. Có rate limit cho register/login/refresh.

## 27. Player Profile

Profile gồm `userId`, `username`, `avatarId` chọn từ danh sách asset sẵn có, `level`, `accountExp`, `gold`, `ownedHeroes` (qua quan hệ), `selectedTeamId`, `highestStageId`, `stageProgress` và thời điểm cập nhật. API trả DTO công khai phù hợp màn hình, không trả password hash, refresh token, ban reason nội bộ hoặc thông tin tài khoản khác. Người chơi đổi avatar trong danh sách cho phép; đổi username để Future nhằm tránh rắc rối identity/leaderboard. Ban/lock từ admin chặn login/refresh và action đang diễn ra theo chính sách xử lý lỗi.

## 28. Backend

NestJS chia module theo trách nhiệm, controller chỉ nhận/validate DTO, service thực thi use case, repository truy cập Prisma, `game-core` tính quy tắc thuần:

| Module | MVP và trách nhiệm | Sau MVP |
| --- | --- | --- |
| AuthModule | Register/login/refresh/logout, guards và roles | OAuth nếu có |
| PlayerModule | Profile, account EXP, avatar | Social profile |
| HeroModule | Definition published, roster, hero upgrade | Ascension |
| TeamModule | Lưu/kiểm tra đội 3 hero | Nhiều preset |
| BattleModule | Start/action/state/result/replay metadata PvE | PvP session |
| StageModule | Catalog, unlock, progress | World mới |
| InventoryModule | Material stack | Equipment/consumable |
| RewardModule | Reward transaction, idempotency, ledger | Reward mùa |
| AdminModule | Nội dung hero/stage, player search, battle logs, config publish | Vận hành nâng cao |
| LeaderboardModule | Chưa triển khai route ở MVP | Highest stage, PvP ranking |
| MatchmakingModule | Chưa triển khai | Queue/MMR Phase 2 |

Tách `RewardModule` khỏi `BattleModule` để result và reward vẫn atomic ở application transaction; không để client tự gọi “claim battle reward” với amount tùy ý.

## 29. Dữ liệu và ERD logic

| Entity | Khóa và quan hệ chính | Ghi chú phạm vi |
| --- | --- | --- |
| User | `id`; 1–1 PlayerProfile; role, email unique, passwordHash, accountStatus | RefreshSession 1–n để thu hồi token |
| PlayerProfile | `userId` unique; 1–n PlayerHero, Team, PlayerStageProgress, Battle | username unique, level/EXP/Gold |
| HeroDefinition | `id`; 1–n PlayerHero; n–m SkillDefinition qua HeroSkill | contentVersion, publish state |
| PlayerHero | `id`, `playerId`, `heroDefinitionId`; 0–n TeamMember | level/EXP; cùng definition có thể nhiều bản nếu sau này cần, MVP seed mỗi definition tối đa một bản/người |
| SkillDefinition | `id`; n–m HeroDefinition | cost/cooldown/target/effect versioned |
| Team | `id`, `playerId`; 1–3 TeamMember; selected marker | MVP một team/người |
| TeamMember | `teamId`, `slot` unique; `playerHeroId` unique trong team | front/back/leader flag hoặc leaderId ở Team |
| World/Chapter/Stage | World 1–n Chapter 1–n Stage; Stage 1–n StageEnemy, RewardDefinition | stage order/prereq/contentVersion |
| EnemyDefinition | `id`; 1–n StageEnemy | stat/AI/skill/phase config |
| Inventory/InventoryItem | Inventory 1–1 PlayerProfile; InventoryItem unique `(inventoryId,itemDefinitionId)` | quantity ≥ 0 |
| Equipment | ItemDefinition/PlayerEquipmentInstance | Chỉ Core Release; không cần bảng instance trong migration MVP nếu chưa dùng |
| Battle | `id`, owner, stageId, seed, PRNG state, status, sequence, contentVersion | Snapshot đội/địch/board; result immutable |
| BattleParticipant | `battleId`, unit snapshot, side, HP, energy, cooldown/status | Không tham chiếu live level để tính lại giữa trận |
| BattleAction | `battleId`, `sequence` unique, clientActionId unique trong battle, payload/result | Dùng replay/audit |
| RewardGrant | `battleId`, `rewardType`, `amount`, `sourceId` unique phù hợp | Cấp đúng một lần; CurrencyLedger ghi biến động |
| PlayerStageProgress | `(playerId, stageId)` unique; bestStars, firstClearClaimedAt | Unlock có thể suy từ stage trước và progress |
| LeaderboardEntry | `(seasonId, playerId, boardType)` unique | Chỉ Core Release |

**Quan hệ xử lý:** User sở hữu Profile; Profile sở hữu hero/team/inventory/progress; TeamMember phải tham chiếu PlayerHero cùng Profile (kiểm tra ở service và transaction); Battle lấy snapshot từ Team + Stage tại thời điểm start; BattleAction có sequence tăng đơn điệu; kết quả Battle sinh RewardGrant và cập nhật Progress trong cùng transaction. Stage/hero/skill đã publish không sửa in-place nếu có battle đang chạy: tạo contentVersion mới hoặc giữ snapshot đầy đủ. Prisma migrations là nguồn schema, seed tạo nội dung MVP có thể chạy lại an toàn.

## 30. Admin Dashboard

MVP dùng React + TypeScript để giảm cấu hình, dùng REST API NestJS. Dashboard hiển thị total players, số battle WON/LOST trong khoảng 7 ngày, active players chỉ khi định nghĩa rõ là số tài khoản có login hoặc battle trong 7 ngày (không gọi là online realtime). Player Management: tìm username/email, xem profile/progress/battle, lock/unlock có audit log; không cho admin xem password/token. Hero Management: tạo/sửa draft hero definition, stat/skill/rarity/element, preview và publish version; không xóa definition đã tham chiếu, chỉ archive. Stage Management: draft enemy, boss, rewards, difficulty; validate prereq không chu trình và reward không âm trước publish. Game Config: xem/chỉnh hằng số cân bằng có version, review diff và publish; MVP có thể chỉ chỉnh một tập nhỏ (`damage multipliers`, `stage rewards`) để kiểm soát rủi ro. Battle Logs: xem result, action sequence, seed, version; không cho sửa kết quả. Mỗi write cần ADMIN và ghi admin audit (`actor`, `entity`, `before/after`, `timestamp`).

## 31. Màn hình game client

`API` bên dưới là phụ thuộc dữ liệu; Boot/animation thuần có thể dùng asset cục bộ. Mọi màn hình tương tác phải được kiểm tra bằng trình duyệt trong quá trình nghiệm thu UI.

| Screen | Mục đích và thành phần | Hành động chính | API phụ thuộc | Mốc |
| --- | --- | --- | --- | --- |
| Boot | Load manifest/asset tối thiểu, progress, lỗi tải | Retry hoặc vào Login/Home | `GET /auth/me`/asset manifest | MVP |
| Login | Email/password, lỗi hợp lệ | Login, sang Register | `POST /auth/login` | MVP |
| Register | Username/email/password, quy tắc nhập | Register | `POST /auth/register` | MVP |
| Home/Lobby | Profile, gold, stage kế, navigation | Mở Team/Campaign/Hero/Inventory | `GET /players/me`, `/stages` | MVP |
| Campaign | World/chapter/stage, lock/star/reward | Chọn stage/start | `GET /stages`, `POST /battles` | MVP |
| Team | 3 slot, leader, owned roster | Chọn/đổi/lưu team | `GET /player-heroes`, `PUT /teams/current` | MVP |
| Hero List | Roster, filter element/role | Mở chi tiết | `GET /player-heroes` | MVP |
| Hero Detail | Stat/skill/EXP/chi phí | Nâng level | `GET /player-heroes/:id`, `POST .../level-up` | MVP |
| Battle | Board, hero/địch, HP/energy, focus/skill, turn log | Focus, skill, swap, thoát có xác nhận | `GET /battles/:id`, `POST .../actions` | MVP |
| Result | Win/loss, sao, reward, tiến trình | Quay Home/chơi lại | `GET /battles/:id/result` | MVP |
| Inventory | Material và nguồn dùng | Xem item, sang Hero Detail | `GET /inventory` | MVP |
| Settings | Âm lượng, chất lượng hiệu ứng, logout | Chỉnh local settings, logout | `POST /auth/logout` | MVP |
| Leaderboard | Top highest stage/PvP | Xem bảng | `GET /leaderboard` | Core Release |

Màn hình không được hiện reward trước khi server xác nhận result. Khi resize, board giữ ô vuông, HUD có thể chuyển xuống dưới; ở màn hình quá hẹp, hiển thị thông báo xoay ngang/giảm hiệu ứng thay vì che các thao tác quan trọng.

## 32. Màn hình admin

| Screen | Mục đích và thành phần | Hành động | API phụ thuộc | Mốc |
| --- | --- | --- | --- | --- |
| Login | Form admin, lỗi truy cập | Đăng nhập | `POST /auth/login` | MVP |
| Dashboard | Chỉ số player/battle 7 ngày | Chọn khoảng thời gian | `GET /admin/metrics` | MVP |
| Players | Search, trạng thái, danh sách | Xem, lock/unlock | `GET /admin/players`, `PATCH /admin/players/:id/status` | MVP |
| Heroes | Definition, draft/published | Tìm, tạo draft, archive | `GET/POST /admin/heroes` | MVP |
| Hero Editor | Stat, skill, validation, diff | Lưu draft, publish | `PATCH /admin/heroes/:id`, `POST .../publish` | MVP |
| Stages | World/chapter/stage và version | Tìm, tạo draft | `GET/POST /admin/stages` | MVP |
| Stage Editor | Enemy, boss, reward, prereq | Lưu draft, publish | `PATCH /admin/stages/:id`, `POST .../publish` | MVP |
| Battle Logs | Battle result, actions, seed/version | Xem chi tiết | `GET /admin/battles` | MVP |
| Config | Hằng số cân bằng, version/diff | Lưu và publish | `GET/PATCH /admin/config`, `POST .../publish` | MVP giới hạn |

Admin UI xác nhận trước thao tác lock/publish, hiển thị lỗi theo field và không đánh đồng save draft với publish. Không cần xây CMS tổng quát hoặc workflow nhiều cấp phê duyệt.

## 33. REST API

Quy ước: JSON, version prefix `/api/v1`, timestamp UTC ISO 8601, ID opaque, lỗi có `code`, `message`, `details`, `requestId`. Phân trang `limit` tối đa 100, `cursor` cho danh sách lớn; POST action dùng `clientActionId` để idempotency. `P` = PLAYER sở hữu tài nguyên, `A` = ADMIN, `Public` không cần token. Bảng chỉ liệt kê contract mức PRD, không phải toàn bộ DTO.

| Method | Endpoint | Purpose | Auth | Mốc |
| --- | --- | --- | --- | --- |
| POST | `/auth/register` | Tạo User/Profile và roster ban đầu | Public | MVP |
| POST | `/auth/login` | Cấp access/refresh token | Public | MVP |
| POST | `/auth/refresh` | Rotate refresh token | Refresh token | MVP |
| POST | `/auth/logout` | Thu hồi refresh session | P/A | MVP |
| GET | `/auth/me` | Vai trò/session hiện tại | P/A | MVP |
| GET | `/players/me` | Profile, currencies, progress tóm tắt | P | MVP |
| PATCH | `/players/me/avatar` | Chọn avatar có sẵn | P | MVP |
| GET | `/heroes` | Danh sách definition published | P | MVP |
| GET | `/player-heroes` | Roster của mình | P | MVP |
| GET | `/player-heroes/:id` | Chi tiết bản hero sở hữu | P | MVP |
| POST | `/player-heroes/:id/level-up` | Trừ tài nguyên và tăng một level | P | MVP |
| GET | `/teams/current` | Đội hiện tại | P | MVP |
| PUT | `/teams/current` | Lưu 3 slot và leader | P | MVP |
| GET | `/stages` | Catalog, lock, sao, reward | P | MVP |
| GET | `/stages/:id` | Chi tiết ải và địch | P | MVP |
| POST | `/battles` | Start stage sau validation | P | MVP |
| GET | `/battles/:id` | State trận sở hữu và sequence | P | MVP |
| POST | `/battles/:id/actions` | Focus/use_skill/swap theo action discriminant | P | MVP |
| GET | `/battles/:id/result` | Kết quả đã chốt/reward | P | MVP |
| POST | `/battles/:id/abandon` | Bỏ trận ACTIVE, không reward | P | MVP |
| GET | `/inventory` | Material stacks | P | MVP |
| GET | `/leaderboard` | Highest stage/PvP top | P | Core |
| GET | `/admin/metrics` | Thống kê dashboard | A | MVP |
| GET | `/admin/players` | Tìm player, phân trang | A | MVP |
| PATCH | `/admin/players/:id/status` | Lock/unlock | A | MVP |
| GET/POST | `/admin/heroes` | Liệt kê/tạo definition draft | A | MVP |
| PATCH | `/admin/heroes/:id` | Sửa draft | A | MVP |
| POST | `/admin/heroes/:id/publish` | Validate và publish version | A | MVP |
| GET/POST | `/admin/stages` | Liệt kê/tạo stage draft | A | MVP |
| PATCH | `/admin/stages/:id` | Sửa draft | A | MVP |
| POST | `/admin/stages/:id/publish` | Validate và publish | A | MVP |
| GET | `/admin/battles` | Tìm log/result/action | A | MVP |
| GET/PATCH | `/admin/config` | Xem/sửa config draft | A | MVP |
| POST | `/admin/config/publish` | Publish config version | A | MVP |

Focus action chỉ đổi target hợp lệ trong phase PLAYER_SKILL, không tiêu lượt. `POST /battles` có thể dùng idempotency key để tránh hai trận ACTIVE từ double click; MVP cho mỗi player tối đa một trận ACTIVE, start mới khi trận cũ còn mở trả ID trận cũ hoặc yêu cầu abandon rõ ràng. `GET /battles/:id/result` trả 409 nếu chưa terminal. Tránh endpoint trả thông tin nội bộ không cần cho client như seed của lượt tương lai trong PvP.

## 34. WebSocket events

Chỉ **Phase 2 PvP**. Dùng Socket.IO hoặc WebSocket chuẩn sau spike kỹ thuật; contract không phụ thuộc thư viện. Mọi event mang protocolVersion, request/action ID, battle ID khi có và server sequence. Auth token kiểm tra lúc kết nối và trước action nhạy cảm.

| Hướng | Event | Payload tối thiểu và phản hồi |
| --- | --- | --- |
| Client → server | `join_queue` | mode, requestId; ack queued/error |
| Client → server | `leave_queue` | requestId; ack removed |
| Client → server | `battle_ready` | matchId; ack ready |
| Client → server | `swap_gem` | battleId, from, to, expectedSequence, clientActionId; ack accepted/rejected |
| Client → server | `use_skill` | battleId, playerHeroId, skillId, targetId, expectedSequence, clientActionId |
| Client → server | `surrender` | battleId, expectedSequence; terminal result |
| Server → client | `match_found` | matchId, readyDeadline |
| Server → client | `battle_started` | battleId, public snapshot, turn owner/deadline |
| Server → client | `battle_state` | snapshot phục hồi có sequence |
| Server → client | `action_resolved` | sequence, events, public state diff |
| Server → client | `turn_changed` | nextPlayerId, deadline, sequence |
| Server → client | `battle_finished` | result, rating delta, sequence |
| Server → client | `opponent_disconnected` | grace deadline; tiếp tục/reconnect theo luật |

Client nhận gap sequence phải xin full `battle_state`, không tự tính tiếp. Server không broadcast thông tin bí mật nếu cơ chế PvP sau này có hidden state.

## 35. Yêu cầu phi chức năng

| Nhóm | Mục tiêu đo trong môi trường đồ án |
| --- | --- |
| Performance client | 60 FPS median và ≥45 FPS p95 trong trận trên laptop tầm trung tham chiếu (4 core, 8 GB RAM, Chrome bản đang dùng); đo 5 phút, tắt tab nền. |
| First load | ≤5 giây p75 đến màn Login/Home trên mạng 20 Mbps, cache lạnh, asset MVP ≤15 MB; có progress/loading state. |
| API | GET profile/stage p95 <500 ms, POST battle action p95 <800 ms với 20 người dùng đồng thời trong môi trường local/staging; exclude internet RTT. |
| Memory | Client tab <500 MB sau 20 trận liên tiếp trên bộ test tham chiếu; không tăng đều do texture/listener rò rỉ. |
| Reliability | Battle action/reward idempotent; crash giữa transaction không cấp nửa reward; reload PvE phục hồi state ACTIVE cuối cùng. |
| Maintainability | Engine thuần không import PixiJS/NestJS/Prisma; DTO/schema versioned; mỗi module có owner trách nhiệm rõ; CI chạy typecheck/test chính. |
| Scalability | MVP một server instance + PostgreSQL, kiểm thử 20 phiên đồng thời; Redis chỉ thêm khi queue/session PvP hoặc cache thật sự cần. |
| Compatibility | Chrome/Edge hai phiên bản ổn định gần nhất trên desktop; Firefox smoke test; Safari/mobile là best effort có ghi giới hạn. |
| Responsive | 1280×720 và 1920×1080 đủ thao tác; 768×1024 không cắt nút chính; portrait phone được hỗ trợ mức xem/điều hướng hoặc báo xoay ngang rõ ràng. |
| Error/logging | Mỗi lỗi API có requestId; client hiển thị hành động retry hợp lý; server log không chứa credential. |

Các ngưỡng là đề xuất nghiệm thu nội bộ, không cam kết SLA công khai. Ghi thiết bị, browser, dữ liệu test và phương pháp đo trong báo cáo.

## 36. Bảo mật

Password hash và token theo §26; không đưa secret vào repo, dùng env/secret injection của Docker và `.env.example` chỉ chứa tên biến giả. Validate mọi DTO (kiểu, độ dài, enum, bounds), đặc biệt tọa độ swap, skill ID, item amount và stage ID. Prisma parameterized queries; raw SQL nếu có phải parameterized. Giới hạn CORS theo origin triển khai, HTTPS ở Nginx, cookie refresh `HttpOnly; Secure; SameSite` nếu dùng cookie; nếu refresh trong JSON thì lưu trong memory và nêu tradeoff trong thiết kế chi tiết. Access token ngắn hạn, rotation và revoke; ADMIN guard ở server, không chỉ ẩn menu. Escape/encode dữ liệu user trong React/Pixi text; không render HTML từ username. CSP phù hợp asset. Rate limit auth và action; giới hạn payload. PvP server authoritative, chống replay bằng sequence/idempotency; PvE cũng cần server validate để chống sửa reward. Audit admin write và kiểm tra quyền sở hữu mọi tài nguyên. Không log email đầy đủ khi không cần, không lộ stack trace cho client.

## 37. Kiến trúc tổng thể

```text
Browser (PixiJS client) ── HTTPS REST ──┐
                                      ├── Nginx ── NestJS game server ── Prisma ── PostgreSQL
Browser (React admin) ─── HTTPS REST ───┘                │
                                      WebSocket (Phase 2) │
                                                         └── Redis (Phase 2: queue/session, nếu cần)
```

Client hiển thị input/animation và nhận state server; admin quản lý content version; server là nguồn sự thật cho battle, progression và reward; PostgreSQL lưu trạng thái bền vững. `game-core` được server gọi để resolve action; client có thể dùng bản thuần để preview/offline animation nhưng không được tự chốt kết quả. MVP dùng REST cho PvE để giảm độ phức tạp realtime, Docker Compose cho client/admin/server/PostgreSQL/Nginx. Không thêm Redis chỉ để có mặt trong sơ đồ. Nginx phục vụ static build và reverse proxy `/api`; Phase 2 thêm WebSocket upgrade và Redis nếu chạy nhiều instance.

## 38. Kiến trúc client

```text
apps/game-client/src/
  core/       # app bootstrap, scene lifecycle, asset manager
  scenes/     # Boot, Home, Campaign, Team, Battle, Result
  battle/     # board view, effects, action presenter, animation queue
  heroes/     # hero card/detail presenters
  ui/         # buttons, modals, HUD, accessibility labels
  services/   # use cases: load profile, save team, start battle
  stores/     # UI/session state; server battle state là nguồn sự thật
  network/    # typed REST client, auth, retry/idempotency
  assets/     # manifest/asset references; binary assets có thể ở public/
  utils/      # hàm thuần dùng cục bộ
```

PixiJS scene sở hữu display objects, hủy listener/ticker khi thoát; service không import Sprite/Container; network không hiểu quy tắc match. Dùng event bus có typed events cho tương tác giữa presenter và view, không làm global event bus cho mọi state. Object pooling cho gem particles/damage numbers lặp nhiều; texture cache có vòng đời rõ. Áp dụng SOLID ở ranh giới module, tránh tạo abstraction chỉ để “đúng mẫu”. UI logic phải không trực tiếp mutate battle snapshot; animation tiêu thụ `BattleEvents` từ server, sau đó áp dụng authoritative state.

## 39. Battle engine

```text
Input (tọa độ/skill/target)
  → Action DTO + expectedSequence
  → validateAction(state, action)
  → reduceBattle(state, action, seededRng, contentSnapshot)
  → next BattleState + ordered BattleEvents
  → persist transaction / API response
  → PixiJS renderer + HUD
```

`packages/game-core` chứa board generation, match detection, cascade, special resolution, damage, status, enemy AI và reducer. Nó không import PixiJS, DOM, NestJS hoặc Prisma; I/O, auth và persistence nằm ở server. State và action serializable, reducer không đọc thời gian hệ thống hoặc RNG toàn cục; seed/PRNG state được truyền vào và trả ra. BattleEvent có loại rõ (`GEM_REMOVED`, `ENERGY_GAINED`, `DAMAGE`, `HEAL`, `STATUS`, `TURN_CHANGED`, `BATTLE_FINISHED`) để renderer không phải suy lại luật. Cùng snapshot/version/seed/action log phải cho cùng state hash; test replay sau mỗi action. Client chỉ gửi ý định; server quyết định legality, damage và reward. Thiết kế này cho phép unit test thuật toán, replay bug, tái dùng với PvP và thay renderer mà không đổi luật.

## 40. Shared code và monorepo

```text
Gemora_Shards_of_Fate/
  apps/game-client/       PixiJS + TypeScript + Vite
  apps/game-server/       NestJS + Prisma + PostgreSQL
  apps/admin-dashboard/   React + TypeScript
  packages/shared-types/  DTO công khai, enum, BattleAction/Event/State view
  packages/game-core/     Battle reducer và luật thuần
  packages/validation/    Schema runtime dùng chung khi có nhu cầu thực tế
  docs/                   PRD, GDD, architecture, API/ERD sau này
```

Repo hiện có 3 app, `shared-types`, `game-core` và `docs`; `validation` là package **đề xuất**, chỉ tạo khi ít nhất hai app thật sự chia sẻ schema. `config` có thể là thư mục dữ liệu/config versioned ở server trước khi tách package. Root npm workspaces đang khai báo `apps/*`, `packages/*`; không mặc định các package đã có exports/build scripts. Server không import từ client/admin, game-core không phụ thuộc app. Shared DTO không chứa password hash, secret hoặc quyền nội bộ.

## 41. Analytics và logging

MVP ghi 6 sự kiện nghiệp vụ: `login_success`, `stage_started`, `stage_completed`, `stage_failed`, `hero_upgraded`, `battle_result`. Mỗi event có `eventId`, `occurredAt`, `playerId` nội bộ, `battleId`/`stageId` nếu có, `contentVersion`; không gửi password/token, không cần công cụ analytics bên ngoài. Login failure ghi security log riêng có rate-limit key đã giảm dữ liệu nhạy cảm. Dashboard chỉ tính aggregate từ bảng Battle/User hoặc event table đã chuẩn hóa; không cần streaming pipeline. Dùng structured logs với requestId/actionId, mức INFO/WARN/ERROR, retention staging ngắn phù hợp tài nguyên đồ án.

## 42. Xử lý lỗi

| Tình huống | Hành vi client | Hành vi server |
| --- | --- | --- |
| API timeout/failure | Giữ input chưa xác nhận, hiện Retry; dùng cùng idempotency key/actionId | Trả lỗi có code/requestId; action đã commit trả kết quả cũ |
| Mất mạng giữa PvE | Tạm khóa input, cho reconnect/reload rồi GET battle state | State ACTIVE và sequence lưu bền; không tự cộng reward |
| Action không hợp lệ | Hiển thị lý do ngắn, snap gem về vị trí cũ | 400/409 với code cụ thể, state không đổi |
| Asset thiếu | Placeholder rõ và nút tải lại; không crash toàn app | Không liên quan battle logic; log asset path/version phía client |
| Server unavailable | Màn thông báo, retry backoff có giới hạn; không cho chơi trận giả rồi đồng bộ reward | Health endpoint/log cảnh báo, không trả dữ liệu chưa commit |
| Session hết hạn | Refresh một lần, nếu thất bại về Login và giữ đường quay lại | Rotate/revoke theo session, 401 có code ổn định |
| Admin publish sai dữ liệu | Giữ draft và hiện field lỗi | Validation transaction, không tạo version nửa chừng |

PvP reconnect/timeout có luật ở §24; không lấy hành vi offline PvE suy sang PvP.

## 43. User stories

Mỗi story theo mẫu **As a [role], I want [action], so that [benefit]**. Acceptance criteria (AC) dưới đây là điều kiện hành vi tối thiểu; story có giao diện phải thêm kiểm tra thao tác và hiển thị trên trình duyệt thật khi triển khai. Có thể tách từng story thành ticket nhỏ hơn khi lập sprint; các story PvP là Phase 2.

| ID / nhóm | User story | AC kiểm chứng | Mốc |
| --- | --- | --- | --- |
| US-001 Auth | As a player, I want to register, so that I can save progress. | Username/email unique; password policy; tài khoản mới có profile và roster; form/lỗi kiểm tra trên browser. | MVP |
| US-002 Auth | As a player, I want to log in, so that I can resume my game. | Đúng credential nhận session; sai trả lỗi chung; form/lỗi kiểm tra trên browser. | MVP |
| US-003 Auth | As a player, I want to log out, so that others cannot refresh my session. | Refresh token hiện tại bị revoke; UI về Login; kiểm tra trên browser. | MVP |
| US-004 Auth | As a player, I want my session refreshed, so that a short access-token expiry does not interrupt a battle. | Một refresh hợp lệ cấp token mới và vô hiệu token cũ; reload battle thành công. | MVP |
| US-005 Hero | As a player, I want to see my heroes, so that I can compare roles and elements. | Roster chỉ gồm hero sở hữu; role/element/level hiện đúng; kiểm tra trên browser. | MVP |
| US-006 Hero | As a player, I want to inspect a hero, so that I understand stats and skill cost. | Detail hiển thị chỉ số dẫn xuất, skill/cost/cooldown; kiểm tra trên browser. | MVP |
| US-007 Hero | As a player, I want to level a hero, so that my team can clear harder stages. | Đủ Gold/material tăng đúng 1 level; thiếu thì không trừ gì; kiểm tra trên browser. | MVP |
| US-008 Hero | As a player, I want to earn a milestone hero, so that my team choices grow without gacha. | First-clear mốc cấp hero đúng một lần; roster cập nhật sau result. | MVP |
| US-009 Team | As a player, I want to select three heroes, so that I can prepare for a stage. | Đúng 3 hero sở hữu, slot duy nhất; UI kiểm tra trên browser. | MVP |
| US-010 Team | As a player, I want to choose a leader, so that my team has a clear identity. | Leader thuộc 3 hero; save/reload giữ lựa chọn; UI kiểm tra trên browser. | MVP |
| US-011 Team | As a player, I want to see enemy elements before battle, so that I can adjust my team. | Stage detail nêu địch và strong/weak; UI kiểm tra trên browser. | MVP |
| US-012 Battle | As a player, I want to swap adjacent gems, so that I can create a match. | Swap không kề/no-match không tiêu lượt; swap hợp lệ tạo event/state mới; UI kiểm tra trên browser. | MVP |
| US-013 Battle | As a player, I want cascade and special gems, so that planning a shape matters. | Match 4/5/L/T tạo đúng một special; cascade lặp tới ổn định; animation đúng event; kiểm tra trên browser. | MVP |
| US-014 Battle | As a player, I want matched colors to charge heroes, so that team and board interact. | Mỗi hero sống cùng element nhận energy theo số gem; không vượt 100; HUD kiểm tra trên browser. | MVP |
| US-015 Battle | As a player, I want to use a skill on a valid target, so that I can respond to danger. | Chỉ dùng khi đủ energy/cooldown/phase; sai target không đổi state; UI kiểm tra trên browser. | MVP |
| US-016 Battle | As a player, I want to focus an enemy, so that I can finish a priority target. | Focus đổi được trước swap; chết thì tự chọn địch còn sống; UI kiểm tra trên browser. | MVP |
| US-017 Battle | As a player, I want to resume an interrupted PvE battle, so that I do not lose progress. | Reload lấy state/sequence cuối; cùng actionId không xử lý hai lần; UI kiểm tra trên browser. | MVP |
| US-018 Battle | As a player, I want to see turn order and boss telegraph, so that I can choose a defensive skill. | HUD thể hiện phase/đòn báo trước, thứ tự event khớp server; kiểm tra trên browser. | MVP |
| US-019 PvE | As a player, I want to choose an unlocked stage, so that I can progress through the campaign. | Stage khóa không start được; hoàn thành stage trước mở stage sau; UI kiểm tra trên browser. | MVP |
| US-020 PvE | As a player, I want a clear result, so that I know why I won or lost. | Result có win/loss, turn count, sao/reward từ server; kiểm tra trên browser. | MVP |
| US-021 PvE | As a player, I want to defeat a two-phase boss, so that the chapter has a tactical climax. | Phase đổi tại ≤50% HP, telegraph và hành động Phase B đúng config; kiểm tra trên browser. | MVP |
| US-022 Progression | As a player, I want to earn Gold and EXP, so that my next battle becomes easier. | Battle WON cấp đúng bảng một lần; balance/level hiển thị đúng; kiểm tra trên browser. | MVP |
| US-023 Progression | As a player, I want to see my best stars, so that I can replay stages for mastery. | Lưu max(previous,new); first-clear không cấp lại; UI kiểm tra trên browser. | MVP |
| US-024 Inventory | As a player, I want to see materials, so that I know whether I can upgrade a hero. | Stack không âm, item/count/usage đúng; kiểm tra trên browser. | MVP |
| US-025 Inventory | As a player, I want upgrade costs shown before confirming, so that I do not spend by surprise. | Modal nêu Gold/material và stat delta; cancel không đổi dữ liệu; kiểm tra trên browser. | MVP |
| US-026 PvP | As a player, I want to join a fair queue, so that I can find an opponent. | Queue một lần/player, dải MMR mở rộng theo thời gian, hủy queue được; UI kiểm tra trên browser. | Phase 2 |
| US-027 PvP | As a player, I want both clients to receive the same resolved turn, so that the match stays fair. | Cùng sequence/state hash; stale action bị từ chối; reconnect nhận full state. | Phase 2 |
| US-028 PvP | As a player, I want disconnect protection, so that a brief outage does not instantly lose my match. | Giữ slot 60 giây, hết hạn xử thua; UI countdown kiểm tra trên browser. | Phase 2 |
| US-029 PvP | As a player, I want to surrender, so that I can end a lost match. | Battle terminal một lần, MMR/reward theo chính sách; UI xác nhận trên browser. | Phase 2 |
| US-030 Admin | As an admin, I want to search players, so that I can inspect reported issues. | Search phân trang, dữ liệu nhạy cảm không hiện; UI kiểm tra trên browser. | MVP |
| US-031 Admin | As an admin, I want to lock an account, so that I can stop abuse. | PLAYER bị khóa không refresh/action; audit có actor/time; UI xác nhận trên browser. | MVP |
| US-032 Admin | As an admin, I want to publish a hero draft, so that content can be updated safely. | Draft validate đủ field, publish tạo version, battle cũ giữ snapshot; UI kiểm tra trên browser. | MVP |
| US-033 Admin | As an admin, I want to configure stage enemies and rewards, so that I can balance campaign. | Không có prereq cycle/negative reward; publish versioned; UI kiểm tra trên browser. | MVP |
| US-034 Admin | As an admin, I want to inspect battle logs, so that I can diagnose disputed results. | Tìm theo battle/player; xem seed/version/action sequence; không sửa result; UI kiểm tra trên browser. | MVP |

## 44. Functional requirements

Priority dùng **Must/Should/Could/Won't**; “Must” trong bảng là MVP trừ khi ghi Phase 2. Acceptance criteria (AC) là hành vi kiểm thử, không phải mô tả ý định. Các giá trị cụ thể ở §10–25 là phần của các AC liên quan.

| ID | Description | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-AUTH-001 | Register User/Profile/roster khởi đầu nguyên tử. | Must | Email/username unique; sai validation không tạo record; retry không nhân bản roster. |
| FR-AUTH-002 | Login bằng email/password và cấp JWT/refresh. | Must | Sai credential trả 401 chung; đúng role trong token; password hash không trả về. |
| FR-AUTH-003 | Refresh token rotation và logout revoke. | Must | Token cũ không refresh lần 2; token logout bị từ chối. |
| FR-AUTH-004 | Kiểm tra role và ownership cho mọi private endpoint. | Must | PLAYER truy cập ID của người khác nhận 403/404; PLAYER gọi `/admin` nhận 403. |
| FR-PLAYER-001 | Trả profile và tiến trình hiện tại. | Must | Level/EXP/Gold/highestStage phản ánh transaction cuối; không lộ private fields. |
| FR-HERO-001 | Trả published HeroDefinition và roster người chơi. | Must | Draft không xuất hiện ở client; level của PlayerHero riêng mỗi người. |
| FR-HERO-002 | Nâng đúng một hero level trong transaction. | Must | Cap 20; đủ cost trừ đúng một lần; thiếu cost/cap không đổi balance/level. |
| FR-HERO-003 | Snapshot chỉ số dẫn xuất khi start battle. | Must | Đổi content/level sau đó không làm đổi participant của battle ACTIVE. |
| FR-TEAM-001 | Lưu một đội 3 hero và leader hợp lệ. | Must | 3 slot duy nhất, hero cùng owner, leader thuộc đội; lỗi không ghi một phần. |
| FR-TEAM-002 | Dùng selected team tại start battle. | Must | BattleParticipant phản ánh đúng team snapshot; team rỗng/thiếu hero không start được. |
| FR-BATTLE-001 | Tạo battle PvE với seed, board hợp lệ và snapshot nội dung. | Must | Board không match sẵn và có move; một ACTIVE/player; state/seed/version lưu bền. |
| FR-BATTLE-002 | Validate phase, owner, sequence và idempotency của action. | Must | Action sai không đổi state; duplicate `clientActionId` trả kết quả đã lưu. |
| FR-BATTLE-003 | Xử lý swap và cascade theo luật Match-3. | Must | Adjacent/no-match kiểm tra; match xóa → rơi → refill → cascade đến ổn định; state hash replay bằng nhau. |
| FR-BATTLE-004 | Xử lý match 4/5/L/T và special đúng ưu tiên. | Must | Một cụm tối đa một special; special kích hoạt một lần; dead board shuffle không tiêu lượt. |
| FR-BATTLE-005 | Cấp energy/Resonance/basic attack theo thứ tự. | Must | Energy chặn 100; combo damage đúng hệ số; địch chết không nhận hit tiếp nếu target auto-switch. |
| FR-BATTLE-006 | Dùng skill, cooldown, targeting và status. | Must | Không đủ cost/sai target bị từ chối; đúng skill trừ cost/đặt cooldown; status tick đúng. |
| FR-BATTLE-007 | Giải quyết enemy turn và terminal state. | Must | Thắng/thua/turn 20 đúng; terminal từ chối action; địch chết không đánh. |
| FR-BATTLE-008 | Resume battle PvE sau reload. | Must | GET state có sequence cuối; action kế tiếp resolve cùng kết quả như khi không reload. |
| FR-BATTLE-009 | Cho abandon battle ACTIVE. | Should | Đổi ABANDONED một lần, không cấp reward, start battle mới được. |
| FR-PVE-001 | Stage lock/unlock theo thứ tự. | Must | Stage chưa mở trả 403 khi start; thắng stage trước mới mở stage sau. |
| FR-PVE-002 | Tính sao và lưu best result. | Must | 1 sao thắng, bonus không chết/≤10 turn; bestStars không giảm khi replay. |
| FR-PVE-003 | Boss hai phase và telegraph. | Must | Đổi phase ở ≤50% HP đúng một lần; attack telegraph thực hiện lượt kế tiếp. |
| FR-REWARD-001 | Chốt result/progress/reward atomic, idempotent. | Must | Retry result/action không cấp lần hai; transaction lỗi rollback cả balance và progress. |
| FR-REWARD-002 | First-clear reward cấp một lần. | Must | `firstClearClaimedAt`/unique grant chống trùng dù hai request đến gần nhau. |
| FR-INVENTORY-001 | Quản lý material stack không âm. | Must | Nâng level trừ đúng item; thiếu item trả lỗi và không ghi số âm. |
| FR-ADMIN-001 | Admin xem metrics/player/battle logs. | Must | Chỉ ADMIN; tìm kiếm phân trang; log không cho sửa result. |
| FR-ADMIN-002 | Admin tạo/sửa/publish HeroDefinition draft. | Must | Thiếu skill/stat/element không publish; version mới, battle cũ giữ snapshot. |
| FR-ADMIN-003 | Admin tạo/sửa/publish Stage và reward. | Must | Prereq không chu trình; reward không âm; publish atomic. |
| FR-ADMIN-004 | Admin lock/unlock User và ghi audit. | Must | Lock chặn refresh/action; audit có before/after, actor, timestamp. |
| FR-ADMIN-005 | Admin xem/chỉnh một tập balancing config versioned. | Should | Draft khác published; publish tạo version; battle cũ không đổi. |
| FR-API-001 | REST lỗi nhất quán và giới hạn dữ liệu. | Must | Lỗi có code/requestId; danh sách có limit; không trả password/token/hash. |
| FR-PVP-001 | Matchmaking và MMR theo luật §24. | Must, Phase 2 | Một queue/player; dải mở rộng đúng mốc; rating chỉ cập nhật ở result hợp lệ. |
| FR-PVP-002 | Server authoritative action qua WebSocket. | Must, Phase 2 | Client gửi intent; server validate/resolve/broadcast; client gửi damage bị từ chối. |
| FR-PVP-003 | Timeout/reconnect/surrender. | Must, Phase 2 | Deadline server quyết định; reconnect ≤60 giây tiếp tục, sau đó thua; terminal một lần. |
| FR-LEADER-001 | Tạo bảng xếp hạng từ result hợp lệ. | Should, Core | Top 100 đúng sort/tie-break; banned user bị ẩn; không nhận score do client gửi. |

## 45. Quy ước acceptance criteria

Mọi FR có **positive**, **negative/boundary** và **persistence/retry** case khi liên quan dữ liệu. Ví dụ chuẩn cho `FR-BATTLE-003`: Given battle ACTIVE ở PLAYER_SWAP và hai ô kề nhau, When gửi swap, Then server kiểm tra adjacency và match trực tiếp; nếu không match, trả lỗi và board/sequence/lượt không đổi; nếu có match, xóa union gem, cho gem phía trên rơi, refill theo PRNG state, giải quyết cascade tới khi không còn match, tính event theo thứ tự và trả state/sequence mới. Gửi lại cùng `clientActionId` trả cùng response; gửi cùng action với sequence cũ nhưng ID mới bị 409. Cùng seed/snapshot/action log phải tạo cùng state hash.

AC ở §43–44 là baseline cho test case chi tiết. UI story cần kiểm tra browser ở viewport 1280×720 và 768×1024, gồm loading/error/disabled state, không chỉ chụp ảnh màn hình thành công. Việc typecheck/lint/test pass là tiêu chí kỹ thuật chung trong Definition of Done, không lặp vào từng user story.

## 46. Bảng phạm vi MVP

| Feature | Priority | Complexity | MVP? | Reason |
| --- | --- | --- | --- | --- |
| Auth + Profile | Must Have | M | Có | Lưu tiến trình, bảo vệ tài khoản |
| 8 HeroDefinition + starter/milestone roster | Must Have | M | Có | Đủ lựa chọn đội mà không cần gacha |
| Đội 3 hero + leader | Must Have | S | Có | Quyết định chiến thuật trước trận |
| Match-3 7×7 + cascade/special/dead-board | Must Have | L | Có | Cơ chế trung tâm và giá trị thuật toán đồ án |
| Battle engine + 1 active skill/hero | Must Have | L | Có | Kết nối board với RPG, kiểm thử deterministic |
| PvE 8 stage, gồm elite/boss | Must Have | L | Có | Vòng chơi hoàn chỉnh có cao trào |
| Hero level + Gold/Hero EXP inventory | Must Have | M | Có | Meta loop tối thiểu |
| Server + PostgreSQL/Prisma + REST | Must Have | L | Có | Nguồn sự thật, progression bền vững |
| Admin player/hero/stage/log cơ bản | Must Have | M | Có | Chứng minh vận hành và chỉnh nội dung |
| Config editor giới hạn | Should Have | M | Có nếu không đe dọa core | Cân bằng thuận tiện; có thể seed cấu hình thay thế |
| Highest-stage leaderboard | Could Have | S | Không | Profile cá nhân đã đủ cho MVP |
| Equipment 2 slot, ascension | Could Have | M/L | Không | Thêm trục cân bằng sau playtest |
| PvP realtime + MMR/ranking | Won't Have (MVP) | XL | Không, Phase 2 | Đồng bộ và chống cheat cần giai đoạn riêng |
| Gacha, daily quest, achievement | Won't Have (MVP) | L | Không, Future | Không phục vụ chứng minh core loop |
| Guild/chat/marketplace/world boss | Won't Have (MVP) | XL | Không, Future | Vượt phạm vi một sinh viên |

## 47. Các giai đoạn phát triển

Các phase dưới đây là **thứ tự phụ thuộc**, không phải cam kết tuần tuyệt đối. Ưu tiên dừng sau Phase 8 + 10 + 11 nếu thời gian đồ án hạn chế; Phase 9 không chặn nghiệm thu MVP.

| Phase | Objective | Deliverable | Dependency | Exit criteria |
| --- | --- | --- | --- | --- |
| 0 — Documentation | Chốt luật, nội dung, architecture decision | PRD/GDD, sơ đồ state/ERD/API, 8 hero/8 stage seed plan | Không | Giảng viên/owner chấp nhận phạm vi và luật không mâu thuẫn |
| 1 — Core Prototype | Chạy client và server skeleton, vertical slice UI | PixiJS scene, NestJS health, shared build/CI | 0 | Build/typecheck ở tất cả workspace; một scene nhận mock state |
| 2 — Match-3 Engine | Board thuần deterministic | Generate/swap/match/cascade/special/shuffle + tests | 1 | Replay seed/action ổn định; property tests board hợp lệ |
| 3 — Battle System | Gắn hero/enemy/skill/status vào board | Reducer, state machine, basic AI, event protocol | 2 | Một trận mock đi từ start đến win/loss; không phụ thuộc PixiJS |
| 4 — Hero System | Roster/definition/team | Seed 8 hero, team validation, hero UI | 3 | Lưu/reload đội, skill các role chính chạy đúng |
| 5 — PvE | World/chapter/stage/boss | 8 stage, unlock, stars, boss phase, result UI | 3–4 | Chơi hết campaign bằng dữ liệu seed không cần chỉnh DB tay |
| 6 — Backend | Bền vững và bảo mật | Auth, Prisma schema/migrations, battle API, transaction | 3–5 (có thể phát triển song song từng slice) | Reload battle/profile; wrong-owner/duplicate action bị chặn |
| 7 — Progression | Meta loop | Rewards, inventory material, hero level, profile | 6 | Một trận thắng → reward → upgrade → trận sau dùng stats mới |
| 8 — Admin Dashboard | Quản trị nội dung và người chơi | Player, hero/stage draft+publish, logs, config giới hạn | 6–7 | Admin publish version mới, battle cũ không đổi |
| 9 — PvP (Phase 2) | Multiplayer authoritative | Matchmaking, WebSocket, MMR, reconnect | 3, 6, test replay ổn định | Hai client cùng state/sequence qua disconnect; load test riêng |
| 10 — Testing | Hồi quy, bảo mật, hiệu năng, UX | Test report, bug fixes, playtest notes | 2–8 (và 9 nếu chọn) | Tất cả Must AC pass, không còn bug blocker/high |
| 11 — Deployment | Môi trường demo tái lập | Docker Compose, Nginx, seed, README vận hành | 10 | Fresh setup chạy được theo hướng dẫn và trình diễn end-to-end |

## 48. Rủi ro

Thang: Probability/Impact = Thấp (T), Trung bình (TB), Cao (C). Người thực hiện rà lại rủi ro mỗi phase; giảm scope theo thứ tự Future → Core → Should của MVP, không cắt luật cốt lõi để giữ bề ngoài.

| Risk | Probability | Impact | Mitigation / tín hiệu kích hoạt |
| --- | --- | --- | --- |
| Scope quá lớn | C | C | Khóa 8 hero/8 stage/1 skill, không đưa PvP vào DoD; thấy trễ >1 phase thì bỏ Should. |
| PvP phức tạp | C | C | Phase 2 độc lập, chỉ bắt đầu sau deterministic replay và MVP hoàn tất. |
| Network synchronization | TB | C | Server sequence/actionId, snapshot recovery, test hai client và packet delay. |
| Match-3 bugs | C | C | Property/golden tests cho board, special chain, dead-board, seeded replay. |
| Game balancing | C | TB | Config versioned, bảng chỉ số nhỏ, playtest 5 người, đo win rate/turn count. |
| Thiếu assets | C | TB | Dùng placeholder có license rõ, asset manifest, ưu tiên UI đọc được trước art hoàn thiện. |
| Performance PixiJS | TB | TB | Sprite pooling, profiler 20 trận liên tiếp, giới hạn particle, texture lifecycle. |
| Thiếu thời gian | C | C | Vertical slice sớm; mỗi phase có exit; dành buffer test/deploy, ngừng Core Release. |
| Backend/transaction phức tạp | TB | C | Làm action/result idempotency sớm, migration/seed, integration test rollback. |
| Mất cân đối bảo mật/admin | TB | C | Role/ownership test ngay khi có API, review response DTO và secret handling. |

## 49. Chiến lược kiểm thử

| Loại | Phạm vi và ví dụ | Điều kiện đạt |
| --- | --- | --- |
| Unit | Damage/element, XP curve, skill validation, status tick | Boundary và negative cases pass |
| Match-3 algorithm | Generate board, match 3/4/5/L/T, gravity/refill, special chain, dead-board | Nhiều seed (ví dụ ≥10.000) không board vô nghiệm/lỗi invariants; bug seed lưu regression |
| Battle engine | Reducer sequence, win/loss, enemy AI, replay seed+actions | Golden replay/state hash giống nhau trên CI và local |
| Integration | Prisma transaction reward/upgrade, content version snapshot, auth/ownership | Rollback không tạo dữ liệu nửa chừng; duplicate không cấp lại |
| API | REST happy/invalid/unauthorized/forbidden/409; schema response | Contract test các route Must, error có code/requestId |
| UI/browser | Ứng dụng thật trên Chrome/Edge, viewport mục tiêu, keyboard/mouse/touch cơ bản | Core loop chơi từ register đến upgrade; error/loading không kẹt |
| Performance | FPS/memory 5 phút và 20 trận; API 20 user giả lập | Đạt ngưỡng §35 hoặc ghi chênh lệch + tối ưu trước DoD |
| Security | Rate limit, XSS input, owner bypass, role bypass, token rotation, secret scan | Không có lỗi high/critical mở |
| Multiplayer | Chỉ Phase 2: delay/drop/reorder packet, reconnect, timeout, simultaneous action | Hai client có cùng sequence/state; không double result/MMR |

Không viết test chỉ để lặp cấu trúc code; ưu tiên invariant và đường lỗi có nguy cơ mất dữ liệu. Với đồ án, báo cáo test cần nêu seed, môi trường, dữ liệu, kết quả và bug đã sửa.

## 50. Giá trị trình bày đồ án

| Chủ đề hội đồng | Bằng chứng trình diễn |
| --- | --- |
| Software architecture | Ranh giới 3 app + shared packages; dependency diagram; lý do engine thuần |
| Match-3 algorithm | Demo một seed có match 4/5/cascade/dead board, unit/property test |
| Battle engine | Cùng action log cho cùng state hash; state machine và event stream |
| Client/server separation | Sửa payload gửi damage/reward bị server từ chối, chỉ intent được chấp nhận |
| Realtime networking | Nếu làm Phase 2, demo hai client/reconnect/sequence; nếu không, trình bày thiết kế có điều kiện và không nhận là đã triển khai |
| Database design | ERD, migration, versioned content, transaction reward idempotent |
| Authentication/security | Hash/refresh rotation, guard role/ownership, rate limit và test âm |
| Admin dashboard | Publish hero/stage draft, xem battle log, audit lock |
| Game balancing | Bảng config và kết quả playtest điều chỉnh damage/độ khó |
| Performance | FPS/memory/API đo trên cấu hình ghi rõ, cách tối ưu |
| Testing | Test pyramid, regression seed, integration rollback, UI verification |
| Deployment | Fresh Docker Compose + Nginx + PostgreSQL, seed và health check |

## 51. Definition of Done

Gemora MVP được coi hoàn thành khi: (1) người mới có thể register/login, xây đội, chơi 8 stage gồm boss, nhận reward, nâng level, logout/login mà tiến trình còn nguyên; (2) tất cả FR Must của MVP và AC tương ứng pass, bao gồm swap lỗi, replay, reward idempotency, ownership và admin publish; (3) 8 hero/8 stage có nội dung/asset hợp pháp tối thiểu, không còn placeholder gây không hiểu gameplay; (4) typecheck/lint/test/build và migration/seed chạy được từ checkout sạch; (5) kiểm tra UI/browser và mục tiêu phi chức năng §35 có báo cáo đo, lỗi high/critical đã xử lý; (6) Docker deployment với hướng dẫn thiết lập, biến môi trường mẫu, backup/restore cơ bản và tài khoản demo không chứa secret thật; (7) PRD/GDD/API/ERD/architecture phản ánh triển khai thực tế, nêu rõ phần Core/Future chưa làm. PvP, leaderboard, equipment, ascension, gacha không thuộc DoD.

## 52. Future roadmap

Sau nghiệm thu MVP, ưu tiên theo kết quả playtest: **Core Release:** thêm equipment 2 slot, ascension giới hạn, highest-stage leaderboard; sau đó spike và triển khai PvP authoritative + MMR nếu có đủ thời gian/test. **Future:** thêm hero và story chapter mới, gacha chỉ sau khi có phân tích economy/đạo đức thiết kế, guild, world boss, event/LiveOps, cosmetic, mobile optimization. Marketplace, guild war, chat/social phức tạp chỉ cân nhắc khi sản phẩm có nhu cầu vận hành thật. Mỗi bước cần PRD riêng, không tự coi là yêu cầu MVP.

## 53. Tổng hợp MVP cuối cùng

| Hạng mục bắt buộc | Quy mô chốt | Bằng chứng nghiệm thu |
| --- | --- | --- |
| Account | Register/login/logout/refresh, PLAYER/ADMIN, profile | Session/role/ownership tests và luồng browser |
| Hero/team | 8 hero, 5 element, 7 role, đội 3, 1 leader, 1 active skill/hero | Tạo đội, lưu/reload, dùng skill của từng role |
| Match-3 | Board 7×7, 5 màu, swap/match 3/4/5/L/T, cascade, special, shuffle | Seeded replay + invariant tests + animation đúng event |
| Battle PvE | Server authoritative, focus, energy/basic/skill/status, enemy AI, win/loss | Trận chạy end-to-end; invalid/duplicate action không phá state |
| Campaign | 1 world, 2 chapter × 4 stage, elite + boss 2 phase, sao/unlock | Chơi hết campaign, boss telegraph, first-clear một lần |
| Progression/economy | Player level 10, hero level 20, Gold + Hero EXP material, inventory stack | Trận thắng → reward → upgrade → stat trận sau tăng |
| Data/backend | NestJS, PostgreSQL, Prisma, REST, battle snapshot/version, transaction | Reload state; rollback và idempotency tests |
| Admin | Dashboard, player search/lock, hero/stage draft-publish, log, config giới hạn | ADMIN-only, audit, publish mới không đổi battle cũ |
| Client/deployment | PixiJS/Vite, React admin, Docker/Nginx, desktop-first responsive | Browser QA ở viewport mục tiêu, fresh setup demo |

**Không thuộc bảng nghiệm thu MVP:** PvP realtime, matchmaking/MMR, leaderboard công khai, equipment, ascension, gacha, daily quest, achievement, guild/social/world boss. Mọi thay đổi phạm vi sau khi chốt PRD phải cập nhật bảng này và các FR/AC liên quan để tránh tài liệu và sản phẩm lệch nhau.

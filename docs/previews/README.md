# Gemora — bản xem trước tạo nhân vật và sảnh

## PvE năm vùng rồng — bản hiện tại

Mở `http://localhost:8080/?preview=campaign` khi chạy `npm run dev:game`, hoặc bấm Adventure PvE trong sảnh. Có năm vùng Nature/Water/Fire/Light/Dark, mỗi vùng 10 thử thách. Thêm `&realm=nature` để mở riêng một vùng; thay bằng `water`, `fire`, `light`, `dark` cho vùng khác.

- [Thế giới trên desktop](pve-world-desktop.png) · [Thế giới trên mobile](pve-world-mobile.png)
- [Thiên nhiên](pve-nature-desktop.png) · [Nước](pve-water-desktop.png) · [Lửa](pve-fire-desktop.png) · [Ánh sáng](pve-light-desktop.png) · [Bóng tối](pve-dark-desktop.png)
- [Map mobile](pve-nature-mobile.png) · [Thông tin thử thách trên mobile](pve-details-mobile.png)

Tiến trình/thưởng là mẫu, Play/Replay chưa chạy trận thật. Có thể duyệt tất cả vùng để xem UI; trạng thái khóa vẫn hiện đúng theo tiến trình mẫu. Ảnh kiểm tra tự động nằm trong `apps/game-client/test-results/` rồi được chọn lưu vào thư mục này. [Tiến độ và giới hạn](../PVE_FIVE_REALMS_REDESIGN_PLAN.md), [asset/prompt](../PVE_ART_ASSETS.md).

Các mục bên dưới ghi lại những bản UI trước, gồm bản đồ 8 màn đã được thay thế.

Cập nhật 12/11/2026: thêm bản đồ PvE tại `http://localhost:8080/?preview=campaign`, hoặc bấm Adventure PvE từ sảnh. Bản đồ có 8 màn mẫu; chọn màn để xem địch, phần thưởng và điều kiện mở. Desktop có bảng bên phải, mobile có bảng nổi. Các nút Play/Replay chưa hoạt động vì chưa có gameplay. Tiến trình mẫu không được lưu vào tài khoản.

Ảnh PvE: [Desktop](campaign-desktop.png), [Mobile](campaign-mobile.png), [Thông tin màn trên mobile](campaign-mobile-details.png). [Kế hoạch và tiến độ](../PVE_MAP_UI_PLAN.md).

Cập nhật avatar và lời chào: avatar tròn 56 px, mặc định là chân dung rồng ngọc. Bấm bút chì mới mở bảng chọn; có thể đổi tiếp qua hồ sơ người chơi trong sảnh → `Change avatar`. Đổi avatar giữ nguyên tên. Linh thú có bong bóng `Welcome to Gemora!`, `Welcome, <name>!` sau tạo tên và `Welcome back, <name>!` khi mở sảnh trực tiếp. Tất cả vẫn là trạng thái preview trong bộ nhớ, không lưu vào tài khoản.

Đã kiểm tra: bảng chọn ẩn ban đầu, đóng bằng Escape và trả focus, đổi avatar trước/sau tạo tên, giữ tên, ba lời chào, desktop/mobile, build/lint/TypeScript. [Ảnh bảng chọn avatar](avatar-picker-desktop.png).

Cập nhật 08/11/2026: chuyển sang cartoon cute theo hai hình tham khảo của người dùng: màu xanh tươi, đảo nổi, nét viền đậm, khung gỗ/giấy và linh thú chibi.

Cập nhật tiếp: mặc định tiếng Anh cho UI game và thu gọn màn tạo nhân vật còn tên, avatar và nút `Let's play`. Xem [kế hoạch tinh gọn đã thực hiện](../PLAYER_UI_REFINEMENT_PLAN.md). Ảnh chụp bên dưới là bản tiếng Anh mới nhất.

## PvE ít chữ — 15/11/2026

Mở `http://localhost:8080/?preview=campaign`. Năm vùng × 10 thử thách; đảo chưa mở có khóa minh họa. Bấm khóa để xem điều kiện; View preview trong dialog chỉ dành cho chế độ phát triển. Tiến trình/phần thưởng vẫn là dữ liệu mẫu, chưa có chiến đấu.

- [Thế giới — desktop](pve-minimal-world-desktop.png)
- [Thế giới — mobile](pve-minimal-world-mobile.png)
- [Bảng điều kiện mở đảo](pve-minimal-lock-mobile.png)
- [Bản đồ thử thách — desktop](pve-minimal-nature-desktop.png)
- [Bản đồ thử thách — mobile](pve-minimal-nature-mobile.png)
- [Thông tin thử thách — mobile](pve-minimal-details-mobile.png)

Đã kiểm tra build/lint/TypeScript, 6 bài kiểm tra trình duyệt và tràn ngang ở 360/390/768/1440 px. Các ảnh PvE không có tiền tố `pve-minimal-` bên trên là phiên bản trước.

## Mở bản xem trước

Chạy `npm run dev:game`, rồi mở:

- `http://localhost:8080/?preview=create-player`: đặt tên và chọn biểu tượng.
- `http://localhost:8080/?preview=home`: vào thẳng sảnh người chơi cũ minh họa.

Thanh trên cùng cho chuyển qua lại hai màn. Nhập tên rồi bấm `Let's play` sẽ hiển thị tên và biểu tượng vừa chọn trong sảnh. Các khu chức năng có popup giới thiệu trạng thái xem trước. Đây là UI prototype, không gọi API tài khoản, không lưu tên, không cấp vật phẩm hoặc thực hiện gameplay. Trang `/` vẫn dùng luồng xác thực hiện có.

## Ảnh chụp trực tiếp từ trình duyệt

- [Tạo nhân vật — desktop](create-player-desktop.png)
- [Sảnh chính — desktop](home-desktop.png)
- [Tạo nhân vật — mobile](create-player-mobile.png)
- [Sảnh chính — mobile](home-mobile.png)

Ảnh desktop ở 1440×960; mobile rộng 390 px và chụp toàn trang. Bản fantasy trước khi nhận yêu cầu đổi phong cách được giữ tại `fantasy-v1/`.

Chụp lại bằng `node apps/game-client/scripts/capture-player-preview.mjs` từ gốc repository. Cần Microsoft Edge. Công cụ chạy server riêng ở 8081 rồi đóng sau khi chụp; đồng thời kiểm tra chuyển màn, giữ tên khi đổi avatar, tên không hợp lệ, dialog, tràn ngang và không gọi API từ preview.

## Artwork

Tạo mới bằng công cụ tạo ảnh tích hợp, dùng ảnh người dùng gửi làm tham chiếu phong cách; không sao chép nhân vật hay logo trong tham chiếu.

- Background: `apps/game-client/public/art/cute-crystal-island.png`.
- Linh thú nền trong suốt: `apps/game-client/public/art/gemora-baby-dragon.png`.
- Background fantasy trước đó giữ tại `apps/game-client/public/art/crystal-sanctuary.png`.

### Prompt background

Use case: stylized-concept. Create a new ORIGINAL browser RPG home island environment background for Gemora. Use attached screenshots only as broad art-style inspiration: cute 2010s cartoon webgame, hand-painted 2D cel-shaded art, bold warm dark outlines, cheerful saturated colors, chunky rounded architecture, NOT realistic epic fantasy. No copied characters, no logos, no text, no interface elements. Landscape wide 16:9. A cute lush emerald green floating island in turquoise sky with puffy white clouds, isometric three-quarter game-camera view. A round little crystal shrine with enormous faceted lavender crystal and small gold trim in upper middle-left; inviting pale stone circular paths through bright green lawn, bushes shaped like puffballs, pink flowers, purple crystal clusters, small cozy orange-roofed magical houses near edges, waterfall and dangling vines at island edge. Central lower-middle area broad open grassy clearing for a creature companion. Tiny stone arena gate on right and blue forest portal in upper left, balanced as landmarks. Island fills most of screen edge-to-edge, medium-close game map view, no huge ocean empty space. Clear painted forms and thick outlines like cute pet-collecting webgames, sunny azure sky, turquoise, spring-green grass, yellow-orange accents. Background is meant behind wooden/paper UI panels, keep center uncluttered. No people, no monsters, no HUD. Crisp polished illustration 1536x1024 or wider.

### Prompt linh thú

Use case: stylized-concept. Original creature mascot asset for a cute cartoon browser RPG called Gemora. One full-body small chubby baby crystal dragon, very large friendly round head, teal mint body, soft cream belly and muzzle, big amber expressive eyes, little rounded lavender crystal horns and tiny crystal winglets, stubby feet, curling tail with a crystal tip, pink cheeks, small neckerchief in warm orange held with gold gem clasp. Cheerful open-mouth smile and one tiny paw raised waving. Compact silhouette, 3/4 view facing right, standing, whole body visible including tail, centered with margin all around. Adorable 2D hand-painted cartoon cel shading, thick smooth dark navy outlines, simple rounded shapes, bright saturated colors, polished game mascot illustration. Genuine transparent background, no scene, no ground plane, no text, no UI, no logo. Inspired by the broad chibi creature appeal of the reference screenshot, but invent an entirely new design and do not copy any existing Pokemon, Pockie or game character.

## Đảo nổi tương tác — 15/11/2026

Phiên bản mới nhất dùng năm asset đảo độc lập trên nền trời sạch; hover cả đảo, tên và khóa. Mobile là hành trình đảo nổi dọc. [Desktop](pve-islands-world-desktop.png) · [Hover](pve-islands-hover-desktop.png) · [Mobile](pve-islands-world-mobile.png). [Kế hoạch và kết quả](../PVE_INTERACTIVE_ISLANDS_PLAN.md). Build và 8 bài kiểm tra trình duyệt đạt; tiến trình vẫn là dữ liệu mẫu.

## Sảnh công trình — 15/11/2026

Phiên bản sảnh mới: cổng PvE, đấu trường PvP, đền Pets, lò rèn Forge và asset Bag. [Desktop](home-landmarks-desktop.png) · [Mobile](home-landmarks-mobile.png) · [Lò rèn](home-forge-desktop.png) · [Túi đồ mobile](home-bag-mobile.png).

Mở `http://localhost:8080/?preview=home`. Pets/Forge/Bag cho duyệt dữ liệu minh họa; nâng cấp vẫn vô hiệu hóa. Build và 10 kiểm tra trình duyệt đạt. [Chi tiết triển khai](../HOME_INTERACTIVE_LANDMARKS_PLAN.md), [asset và prompt](../HOME_ART_ASSETS.md).

Cập nhật bố cục: linh thú căn về giữa sân (neo theo chân, bóng tiếp xúc nhẹ), cổng và lò rèn thu lại để có khoảng cách rõ hơn. Heroes đổi thành Monsters, Team dùng biểu tượng dấu chân và nội dung đội hình quái. Build cùng 4 kiểm tra sảnh/luồng người chơi đạt; ảnh sảnh desktop/mobile đã cập nhật.

Thêm nhóm bốn linh thú trong sân: Gemling, Leafwing, Coralfin, Emberhorn. Ba asset mới cùng phong cách chibi, dáng ngồi/cầm lá/ngủ khác nhau; dùng chung hình trong khu Pets. Mobile có khoảng sân riêng sau Arena. [Asset và prompt](../COMPANION_ASSETS.md). Build và 4 kiểm tra sảnh/luồng người chơi đạt; dữ liệu vẫn là mẫu.

Cập nhật mới nhất: tách bốn linh thú về cổng PvE, Pets, thác nước và Forge; thu nhỏ theo công trình, neo chân và bóng riêng. Desktop dùng chung tỷ lệ cảnh; mobile/tablet đến 900 px neo thú cạnh từng công trình, bỏ khoảng sân nhóm và lời chào thường trực. [Kế hoạch và kết quả](../COMPANION_PLACEMENT_PLAN.md). Ảnh sảnh desktop/mobile phía trên đã cập nhật. Build và 4 kiểm tra trình duyệt đạt; đã kiểm tra 6 kích thước màn hình.

## Responsive và linh thú chuyển động — 16/11/2026

Quái được tăng kích thước, có bộ animation riêng gồm chớp mắt/nhịp thở và cử động điểm nhấn. Desktop vừa khung theo cả chiều rộng/cao; tablet và mobile dùng hai hàng trên nền đảo mới. Header/dock có vùng riêng, cảnh cuộn độc lập khi thấp. Settings cho tắt chuyển động; thiết lập giảm chuyển động của thiết bị được tôn trọng.

[Desktop](home-landmarks-desktop.png) · [Laptop](home-landmarks-laptop.png) · [Tablet](home-landmarks-tablet.png) · [Mobile](home-landmarks-mobile.png) · [GIF chuyển động thực tế](home-companions-animated.gif).

[Kết quả triển khai](../HOME_RESPONSIVE_ANIMATION_PLAN.md) · [Asset và prompt](../COMPANION_ANIMATION_ASSETS.md). Build và 7 kiểm tra trình duyệt đạt. Chưa đo hiệu năng trên thiết bị vật lý.

### Cập nhật tràn viền — 16/11/2026

Cảnh Home phủ toàn bộ chiều rộng và kéo tới đáy khung, dùng một nền liên tục thay cho nền trời ghép hai bên. Dock nổi trên cảnh; vùng công trình và quái chừa khoảng an toàn phía dưới. Kích thước công trình desktop vẫn giới hạn theo chiều cao để giữ các lối vào trong khung. Ảnh desktop/laptop/tablet/mobile phía trên đã cập nhật; GIF giữ bản demo animation trước thay đổi tràn viền này.

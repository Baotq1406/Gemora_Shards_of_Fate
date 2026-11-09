# Gemora — bản xem trước tạo nhân vật và sảnh

Cập nhật avatar và lời chào: avatar tròn 56 px, mặc định là chân dung rồng ngọc. Bấm bút chì mới mở bảng chọn; có thể đổi tiếp qua hồ sơ người chơi trong sảnh → `Change avatar`. Đổi avatar giữ nguyên tên. Linh thú có bong bóng `Welcome to Gemora!`, `Welcome, <name>!` sau tạo tên và `Welcome back, <name>!` khi mở sảnh trực tiếp. Tất cả vẫn là trạng thái preview trong bộ nhớ, không lưu vào tài khoản.

Đã kiểm tra: bảng chọn ẩn ban đầu, đóng bằng Escape và trả focus, đổi avatar trước/sau tạo tên, giữ tên, ba lời chào, desktop/mobile, build/lint/TypeScript. [Ảnh bảng chọn avatar](avatar-picker-desktop.png).

Cập nhật 08/11/2026: chuyển sang cartoon cute theo hai hình tham khảo của người dùng: màu xanh tươi, đảo nổi, nét viền đậm, khung gỗ/giấy và linh thú chibi.

Cập nhật tiếp: mặc định tiếng Anh cho UI game và thu gọn màn tạo nhân vật còn tên, avatar và nút `Let's play`. Xem [kế hoạch tinh gọn đã thực hiện](../PLAYER_UI_REFINEMENT_PLAN.md). Ảnh chụp bên dưới là bản tiếng Anh mới nhất.

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

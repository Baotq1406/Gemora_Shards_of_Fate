# Sảnh Gem Island — Chọn chế độ bằng công trình trong cảnh

Ngày: 15/11/2026. Trạng thái: đã triển khai sảnh công trình và các bảng Pets/Forge/Bag bằng dữ liệu mẫu.

## Hướng thiết kế

Sảnh là một hòn đảo với bốn công trình tương tác: cổng PvE, đấu trường PvP, đền nâng cấp thú và lò rèn nâng cấp trang bị. Túi đồ có asset riêng trên thanh tiện ích, tạo thành năm điểm truy cập chính. Người chơi bấm trực tiếp vào công trình hoặc bảng tên nhỏ gắn với công trình. Bỏ hai thẻ chế độ chữ nhật lớn đang đặt dưới cảnh.

Giữ phong cách hiện tại: cartoon rồng dễ thương, cỏ xanh, pha lê tím, đá sáng, mái ngói cam, bảng tên gỗ vàng kem, font Lilita One/Nunito. Không đưa thêm phong cách kiến trúc hoặc hệ màu khác.

Tranh gốc `apps/game-client/public/art/cute-crystal-island.png` đã có cổng xanh bên trái, đền pha lê giữa và đấu trường đá bên phải. Dùng các công trình này làm tham chiếu để giữ cảm giác quen thuộc. Đền pha lê trở thành nơi nâng cấp thú; một ngôi nhà phía trước trái được thay bằng lò rèn nhỏ. Nhà còn lại và cây tạo bối cảnh; linh thú đứng ở khoảng cỏ phía trước.

## 1. Các điểm truy cập chính

| Chế độ | Asset và vị trí | Nhãn mặc định | Tương tác |
| --- | --- | --- | --- |
| PvE | Cổng đá phủ lá, xoáy năng lượng xanh và pha lê; phía trái cảnh | Adventure · PvE | Bấm cổng hoặc bảng tên vào màn campaign hiện có |
| PvP | Sàn đấu tròn, bậc đá, cổng và hai cờ đỏ; phía phải cảnh | Arena · PvP, khóa và Coming soon nhỏ | Bấm xem thông báo chế độ chưa mở |
| Nâng cấp thú | Đền pha lê tím, bệ tròn và biểu tượng rồng/trứng; sau giữa đảo | Pets | Mở khu chọn thú và nâng cấp |
| Nâng cấp trang bị | Lò rèn mái cam, đe, búa và lửa ấm; trước trái đảo | Forge | Mở khu chọn trang bị và nâng cấp |
| Túi đồ | Túi da tròn, khóa pha lê tím, viền vàng; thanh tiện ích dưới phải | Bag | Mở kho đồ, bộ lọc và chi tiết vật phẩm |

Cổng PvE là điểm nổi bật nhất, có ánh sáng xanh ở lòng cổng. PvP vẫn giữ hình ảnh đầy đủ nhưng ánh sáng dịu, khóa dễ nhận biết. Không làm cả đấu trường xám tối hoặc biến nó thành một ô màu tím.

Mỗi công trình là một vùng tương tác thống nhất. Bảng tên là chỉ dẫn trong cảnh, không có thêm dải Start adventure hoặc nút lớn bên dưới. Không thêm nút Continue cạnh cổng gây trùng hành động. Pets và Forge có quy mô vừa phải, không cạnh tranh ánh sáng với cổng PvE. Bag là vật thể minh họa trên thanh tiện ích, không cần thêm một tòa nhà kho chiếm diện tích đảo.

PvP hiện chưa có gameplay: Coming soon là trạng thái phát triển, không phải khóa do người chơi thiếu cấp. Không đặt điều kiện mở giả, không dẫn tới trận đấu hoặc tự mở khóa bằng tiến trình PvE.

## 2. Bố cục mới

- Thanh đầu trang gọn: hồ sơ avatar + tên + cấp bên trái, logo GEMORA giữa, tài nguyên hiện có và các điều khiển tài khoản/cài đặt bên phải. Số liệu minh họa vẫn được giải thích qua Preview.
- Phần chính là một cảnh đảo liên tục: PvE ở trái trên, đền nâng cấp thú ở sau giữa, PvP ở phải trên, lò rèn phía trước trái và linh thú phía trước giữa. Đường đá nối các công trình; không phủ kín khoảng cỏ bằng các bảng chữ.
- Các công trình không bị hồ sơ/nhiệm vụ che. Mục tiêu desktop phổ biến là thấy bốn điểm đến và túi đồ trong màn hình đầu tiên. Khi chiều cao không đủ, cho cuộn thay vì thu nhãn quá nhỏ.
- Thay dấu nút Shrine đang nổi giữa cảnh bằng tương tác trực tiếp trên đền Pets. Linh thú đồng hành vẫn là nhân vật đứng trong sảnh, không bị hiểu nhầm là nút nâng cấp.
- Thay mục Inventory hiện tại bằng asset Bag, cùng một điểm truy cập kho đồ; không để hai nút kho cạnh nhau. Giữ khả năng truy cập Team/Heroes/Guide hiện có và phân biệt xem đội hình/danh sách với nâng cấp thú. Hồ sơ vẫn có đổi avatar, không dùng Pets để thay avatar người chơi.
- Chừa không gian để mở rộng công trình về sau, nhưng không tự thêm shop/triệu hồi/chế tạo hay một loạt công trình khóa khi chưa có phạm vi cụ thể cho phần “v.v.”.

## 3. Giảm chữ và bảng che cảnh

| Thành phần đang có | Thay đổi |
| --- | --- |
| YOUR ADVENTURE STARTS HERE, Gem Island lớn, tagline | Chỉ giữ Gem Island nhỏ nếu cần tên địa điểm; logo ở thanh trên là điểm nhận diện chính |
| CHOOSE YOUR ADVENTURE, 01 / 02 | Bỏ; các công trình và bảng tên đã thể hiện lựa chọn |
| CAMPAIGN, CHAPTER I, EXPLORE THE WORLD, lời giới thiệu PvE | Bỏ khỏi sảnh; chi tiết thế giới nằm trong màn campaign |
| Bảng First light nhiều dòng | Một biểu tượng cuộn giấy + tên nhiệm vụ ngắn; bấm mở chi tiết |
| New adventurer và thanh XP kèm nhiều con số | Giữ avatar, tên, Lv.; XP/chi tiết xem trong hồ sơ |
| Tip Match gems… | Bỏ khỏi sảnh mặc định; thuộc hướng dẫn chơi khi có gameplay |
| Lời chào linh thú luôn hiện | Chỉ hiện ngắn khi vừa vào hoặc tạo nhân vật, sau đó thu lại; không che điểm đến |
| Dải ghi chú preview dài | Chip Preview mở giải thích về dữ liệu mẫu |

Nhiệm vụ hiện là nội dung mẫu; không giữ “Clear stage 1–1” như nhiệm vụ thật khi campaign đang minh họa đã qua ba thử thách. Bảng nhiệm vụ phải ghi rõ mẫu và không tạo phần thưởng/tiến độ tài khoản. Khi có dữ liệu nhiệm vụ thật sẽ nối từ cùng nguồn tiến trình thay vì viết cứng riêng ở sảnh.

## 4. Bộ asset

Sáu ảnh mới bắt buộc: một nền, bốn công trình và một túi đồ. Đặt riêng cho sảnh để không ảnh hưởng màn tạo nhân vật đang dùng tranh gốc:

| File đề xuất | Nội dung |
| --- | --- |
| `art/home/home-base-v2.webp` | Nền đảo, đường đá, nhà trang trí, cây, trời; đã xóa các công trình tương tác và nhà được thay bằng lò rèn, phục dựng mặt đất phía dưới |
| `art/home/pve-portal-v1.webp` | Một cổng xanh độc lập, gồm bậc cửa và trang trí đi kèm, nền trong suốt |
| `art/home/pvp-arena-v1.webp` | Một đấu trường đá độc lập, gồm nền sàn, bậc, cổng và cờ, nền trong suốt |
| `art/home/pet-sanctuary-v1.webp` | Đền pha lê tím/bệ chăm thú, dấu rồng hoặc trứng rõ, nền trong suốt |
| `art/home/equipment-forge-v1.webp` | Lò rèn nhỏ mái ngói cam, đe và búa đọc rõ ở kích thước nhỏ, nền trong suốt |
| `art/home/player-bag-v1.webp` | Một túi da cách điệu bo tròn, nắp và khóa pha lê tím, không chữ, nền trong suốt; nhận ra được ở 48–64 px |

Dùng lại linh thú `gemora-baby-dragon.png`, khóa vàng `campaign/island-lock-v1.webp`, icon hồ sơ/nhiệm vụ và hệ chữ hiện tại. Túi đồ có thân da nâu ấm, nét viền và sắc tím giống bộ khóa/pha lê để cùng một phong cách. Đợt đầu chưa cần riêng ảnh túi mở, spritesheet hoặc nhiều bản theo cấp công trình.

Yêu cầu tạo ảnh:

1. Tham chiếu tranh sạch hiện tại, giữ cùng góc nhìn chéo, độ dày nét, hướng sáng, màu đá và tỷ lệ công trình.
2. Tạo bốn công trình đầy đủ và túi đồ trên nền trong suốt thật; không vẽ sẵn nhãn, chữ PvE/PvP/Pets/Forge, khóa trạng thái hoặc số đếm vào ảnh.
3. Nền phải xóa sạch các công trình được tách. Khi công trình sáng lên/phóng nhẹ không được lộ bản sao phía sau.
4. Công trình có điểm neo ở chân, mặt nền và bóng tiếp xúc hợp với đường đá; tránh cảm giác dán sticker hoặc lơ lửng trên cỏ.
5. Giữ PNG master, xuất WebP có alpha và biến thể nhỏ cho điện thoại. Kiểm tra mép lá, khoảng trống trong cổng, cờ và bậc đá trên nền sáng/tối; không có viền màu nền còn sót.
6. Chừa đủ khoảng trống trong khung asset cho bóng/ánh sáng. Hiệu ứng hover dùng cùng ảnh, không đổi sang ảnh công trình khác hình dạng.

## 5. Hover, bàn phím và chạm

- Cổng PvE: lòng cổng sáng hơn, viền pha lê có quầng nhẹ, công trình có thể phóng khoảng 1–1,5% quanh chân trong 180–220 ms. Chân công trình giữ trên mặt đất; không nâng cả tòa nhà như đảo nổi.
- Đấu trường PvP: viền đá và bảng tên sáng nhẹ khi hover, khóa giữ nguyên. Không phát sáng mạnh như chế độ đã sẵn sàng.
- Pets: pha lê sáng dịu, dấu rồng/bệ chăm thú được nhấn nhẹ; không dùng hiệu ứng tăng cấp trước khi người chơi thực hiện nâng cấp.
- Forge: ánh lửa ấm hơn và viền đe sáng nhẹ; không tự chạy búa đập liên tục.
- Bag: túi phóng nhẹ, khóa pha lê lóe dịu khi hover/focus; chạm mở ngay. Chỉ hiện chấm báo đồ mới khi có trạng thái chưa xem hợp lệ, không gắn thông báo giả mặc định.
- Bảng tên đi cùng công trình; khóa là lớp riêng. Không hiện thêm đoạn mô tả dài khi rê chuột.
- Vùng nhận chuột bám thân công trình và bảng tên. Các góc trong suốt, cây trang trí và lối đi giữa các công trình không chiếm vùng bấm của nhau.
- Vùng bấm đứng yên, lớp hình phản hồi độc lập để tránh hover rung ở mép. Bóng/ánh sáng và linh thú không chặn thao tác.
- Tab tới từng công trình hiện viền focus rõ; Enter/Space kích hoạt. Mỗi chế độ chỉ có một điểm dừng bàn phím và tên truy cập đầy đủ.
- Điện thoại chạm một lần vào công trình hoặc nhãn là chọn; không bắt chạm lần đầu để bật hover. Cuộn không kích hoạt chế độ.
- Giảm chuyển động: giữ thay đổi ánh sáng/viền, bỏ phóng hoặc chuyển động. Không tự phát âm thanh khi hover.

## 6. Mobile và màn hình hẹp

Không thu nhỏ nguyên cảnh desktop đến mức bốn công trình trở thành chi tiết khó bấm. Dùng bố cục riêng cho cùng các asset:

- Thu thanh hồ sơ/tiện ích; chi tiết nằm trong bảng mở khi bấm.
- Linh thú nhỏ hơn để nhường chỗ cho công trình; đền Pets vẫn đủ lớn và có nhãn, không bị lùi đến mức chỉ như cảnh trang trí.
- Xếp các công trình so le theo chiều dọc: hai chế độ chơi ở phần trên, Pets và Forge phía dưới; cùng nằm trên nền đảo liên tục và nối bằng đường đá. Không quay lại các thẻ chữ nhật.
- Ưu tiên thấy PvE/PvP trước trong khung 390 × 844; cho cuộn ngắn để tới Pets/Forge. Không ép cả bốn công trình vào một màn nếu làm mất vùng chạm và độ rõ.
- Asset Bag luôn dễ mở ở thanh tiện ích dưới, không cuộn mất cùng cảnh. Bảng tên, khóa và Coming soon không chồng nhau. Vùng chạm tối thiểu 48 px, có khoảng đệm cuối trang để thanh dưới không che công trình cuối.

## 7. Nội dung khi mở Pets, Forge và Bag

### Pets — nâng cấp thú

Mở khu chọn thú, ưu tiên thú đã chọn gần nhất nếu còn hợp lệ. Chọn một thú để xem chân dung rồng, tên, cấp hiện tại, thay đổi sau nâng cấp và nguyên liệu cần dùng. Một hành động chính Upgrade; tránh rải nhiều cách nâng cấp trên màn đầu. Chưa mở rộng sang tiến hóa, kỹ năng hoặc lai tạo nếu chưa có yêu cầu.

Khi chưa chọn thú hoặc chưa có thú, có trạng thái hướng dẫn ngắn. Số cấp, giá nguyên liệu và chỉ số lấy từ dữ liệu hệ thống khi có, không tự quyết định cân bằng game trong kế hoạch UI.

### Forge — nâng cấp trang bị

Mở danh sách trang bị có thể chọn. Chi tiết gồm hình món đồ, cấp hiện tại → cấp sau, chỉ số thay đổi và chi phí; một hành động Upgrade. Thể hiện riêng chưa chọn món, thiếu nguyên liệu, đạt giới hạn và đang xử lý khi có dữ liệu tương ứng. Chưa đưa chế tạo, bán hay phá hủy trang bị vào phạm vi này.

### Bag — túi đồ

Mở bảng kho với khung gỗ/giấy cùng style, lưới vật phẩm rõ, ảnh vật phẩm, số lượng ở góc và trạng thái trống. Bộ lọc đầu tiên: All, Equipment, Materials. Bấm vật phẩm mở chi tiết; trên mobile dùng bảng chi tiết gọn, không dựa vào hover để đọc tên.

Từ món trang bị trong Bag có thể chọn Go to Forge, mở lò rèn với món đó được chọn sẵn. Nguyên liệu dùng cùng định danh và số lượng với khu nâng cấp, tránh mỗi màn tự có một kho khác nhau. Không hiện số ô tối đa hoặc nút mở rộng túi nếu hệ thống chưa có luật sức chứa.

### Ranh giới UI và dữ liệu thật

Hiện các chức năng ngoài PvE trong sảnh chủ yếu là popup Coming soon. Đợt UI có thể dựng ba khu riêng để duyệt bằng dữ liệu mẫu và chip Preview; nút nâng cấp phải vô hiệu hóa khi chưa có xử lý thật. Không trừ nguyên liệu, tăng chỉ số hay ghi vật phẩm vào tài khoản bằng thao tác minh họa. Khi nối backend phải dùng chung kho/thú/trang bị, khóa gửi lặp lúc nâng cấp và nhận kết quả thành công/thất bại từ máy chủ trước khi cập nhật.

## 8. Thứ tự triển khai

1. Dựng bố cục sảnh mới cho bốn công trình, linh thú, hồ sơ và Bag trên desktop/mobile.
2. Tạo nền sạch và cổng PvE trước; kiểm tra độ hòa vào mặt đất và phong cách. Tạo đấu trường, đền Pets, Forge và Bag theo cùng chuẩn.
3. Ghép các lớp, bỏ thẻ chế độ cũ; thay chữ thừa bằng nhãn ngắn, thu gọn nhiệm vụ và đổi Inventory sang asset Bag.
4. Nối PvE với campaign hiện có, giữ PvP là Coming soon; dựng khu Pets/Forge/Bag có chọn đối tượng và xem chi tiết, thể hiện rõ dữ liệu mẫu nếu chưa nối hệ thống thật.
5. Giữ hồ sơ/đổi avatar, tài khoản, cài đặt; hoàn thiện hover/focus/chạm, quay lại sảnh và luồng Bag → Forge. Tối ưu ảnh, kiểm tra desktop/mobile và luồng người chơi.

Vị trí triển khai dự kiến: phần `homeScreen()` và `showInfo()` trong `apps/game-client/src/preview/player-preview.ts`; CSS riêng cho sảnh mới, tránh sửa nền toàn cục làm đổi màn tạo nhân vật. Giữ tên truy cập Adventure PvE/Arena PvP để điều hướng và kiểm tra không phụ thuộc chữ trang trí.

## 9. Tiêu chí hoàn thành

- Nhìn sảnh nhận ra cổng PvE, đấu trường PvP, nơi nâng cấp thú và lò rèn là các điểm chọn; Bag luôn dễ tìm. Không còn hai thẻ chế độ lớn ở dưới.
- Công trình cùng phong cách với nền, có chân/bóng hợp lý; hover không lộ hình cũ, không rung, không che tên hoặc điểm chọn khác.
- Nhãn ngắn nhưng vẫn rõ PvE/PvP và trạng thái Coming soon. Không có điều kiện mở PvP hay số liệu tài khoản được bịa thêm.
- PvE tới bản đồ năm vùng hiện có; quay lại vẫn giữ hồ sơ và lựa chọn/tiến trình mẫu theo hành vi hiện tại. PvP không gọi API trận đấu.
- Nhiệm vụ mẫu không được trình bày như tiến trình thật. Không mất tính năng sửa avatar, tài khoản hoặc điều hướng phụ đang có.
- Pets/Forge mở đúng khu và giữ đối tượng đang chọn khi phù hợp; Bag lọc/xem vật phẩm được và dẫn sang Forge đúng món. Có trạng thái trống và chưa sẵn sàng; thao tác UI mẫu không làm thay đổi tài khoản.
- Kiểm tra 360/390/768/1024/1440 px, màn desktop thấp, chuột, Tab/Enter, chạm/cuộn, giảm chuyển động và mở/đóng các bảng thông tin.
- Build/lint/TypeScript và các kiểm tra luồng người chơi/campaign đạt. Chụp desktop/mobile để kiểm tra khoảng cách, mép asset, bảng tên và vùng bị thanh cố định che.

## Kết quả triển khai

- Đã tạo sáu asset: nền sạch, cổng, đấu trường, đền thú, lò rèn và túi đồ. PNG/WebP lưu tại `apps/game-client/public/art/home/`; [prompt và nguồn tham chiếu](HOME_ART_ASSETS.md).
- Sảnh dùng công trình độc lập, vùng nhận chuột ổn định, hover quanh chân công trình, nhãn ngắn, túi đồ trong thanh tiện ích. Mobile dùng cảnh dọc và công trình so le. Không thay nền màn tạo nhân vật.
- Pets: chọn ba rồng minh họa, xem cấp/chỉ số/chi phí mẫu; Upgrade vô hiệu hóa.
- Forge: chọn hai trang bị minh họa, xem cấp/chỉ số/chi phí mẫu; Upgrade vô hiệu hóa.
- Bag: lọc All/Equipment/Materials, chọn vật phẩm, Go to Forge giữ đúng món được chọn. Dữ liệu dùng chung trong phiên xem trước, không ghi vào tài khoản. Hình vật phẩm trong bảng hiện dùng biểu tượng đơn giản, chưa phải bộ minh họa vật phẩm hoàn chỉnh.
- Giữ hồ sơ/đổi avatar, tài khoản, điều hướng PvE, PvP Coming soon và các mục Team/Heroes/Guide. Quest được ghi rõ là mẫu. Bỏ thanh chuyển màn preview khỏi sảnh để bớt chữ; vẫn truy cập màn tạo nhân vật qua URL preview.
- Đã đạt build/lint/TypeScript và 10 kiểm tra trình duyệt: 2 sảnh mới, 6 campaign, 2 luồng người chơi. Kiểm tra chọn thú, kho → lò rèn, hover, chạm, focus vòng trong dialog có nút disabled, đổi avatar, onboarding và không tràn ngang ở 360/390/768/1024/1440 px.
- Đã xem ảnh desktop/mobile, lưu tại [thư mục preview](previews/README.md). Chưa triển khai nâng cấp thật, lưu kho đồ/thú hoặc chiến đấu PvP; các chỉ số/chi phí chỉ minh họa UI, chưa phải cân bằng game.

# Gem Island — responsive và animation linh thú

Ngày lập: 15/11/2026. Cập nhật triển khai: 16/11/2026. Kế hoạch này thay các thông số kích thước và responsive trong COMPANION_PLACEMENT_PLAN.md; giữ bốn khu sinh hoạt riêng đã triển khai.

## Kết quả triển khai 16/11/2026

- Home chia thành header, vùng cảnh có thể cuộn và dock riêng; kích thước cảnh dựa trên khung chứa thực tế. Desktop giữ tỷ lệ đảo, tablet có hai hàng với thú đứng bên cạnh, mobile có hai hàng với thú đứng trước công trình. Không còn cột bốn công trình kéo dài hoặc dock che nội dung cảnh.
- Đã tạo nền portrait sạch cùng style. Compact layout giới hạn chiều rộng công trình theo cả chiều cao khung để không chặn vùng bấm của khu khác.
- Quái lớn hơn và có kích thước tối thiểu riêng; các khu có điểm chân và bóng riêng, không chặn chuột/chạm.
- Bốn bộ sprite atlas thật, mỗi con 16 keyframe gồm idle/blink và điểm nhấn. Dùng thời gian giữ frame khác nhau; không nhân bản frame chỉ để khớp ước lượng ban đầu 16+8 trong kế hoạch. [Asset, thông số và prompt](COMPANION_ANIMATION_ASSETS.md).
- Animation có nhịp riêng, chỉ tải khi quái xuất hiện trong vùng cảnh. Dừng khi tab ẩn, mở dialog, ra ngoài cảnh, đổi màn hình hoặc bật giảm chuyển động. Ảnh tĩnh cùng nhân vật vẫn hiện nếu tải atlas lỗi.
- Settings có tùy chọn Creature animations, lưu trên thiết bị. Trên mobile, Account và thông tin Preview được truy cập trong Settings.
- Lint, TypeScript và build đạt. Bảy kiểm tra trình duyệt đạt, gồm 12 kích thước từ 360×640 đến 1920×1080, điện thoại ngang 844×390, các chiều rộng sát ngưỡng 700, 1099 và 1100 px, thao tác công trình, giảm chuyển động, lỗi tải atlas, lưu tùy chọn và rời/quay lại Home. Chưa đo FPS trên thiết bị vật lý hoặc kiểm tra browser zoom thực tế.
- Chưa thêm bước đi tự do hoặc nhảy di chuyển giữa các khu; bản này dùng chuyển động tại chỗ theo phạm vi đã chốt.
- Ảnh desktop/mobile đã cập nhật; thêm `previews/home-landmarks-tablet.png`, `previews/home-landmarks-laptop.png` và GIF ghi lại cảnh `previews/home-companions-animated.gif`.

## 1. Vấn đề cần giải quyết

- Ảnh người dùng gửi cho thấy công trình nổi bật nhưng quái nhỏ, khó đọc biểu cảm. Tăng kích thước quái khoảng 1,4–1,7 lần trên desktop là mốc thử đầu tiên; cần cân lại khoảng trống xung quanh từng con.
- Hiện `.h-island` lấy toàn bộ chiều rộng với tỷ lệ 1440/878. Ví dụ rộng 1600 px thì riêng cảnh đã cao khoảng 976 px, chưa tính header. Vì vậy khung ngang thấp cần cuộn và có thể đưa header ra ngoài vùng nhìn thấy. Ảnh chụp không đủ để kết luận header bị mất hay chỉ đang cuộn.
- `.h-companion-pet` lấy kích thước theo phần trăm công trình; kích thước nhỏ tiếp tục giảm khi khung chơi thu hẹp.
- Tất cả màn hình dưới 900 px dùng cùng một cột bốn công trình. Cách này làm tablet dài và lãng phí chiều ngang.
- Dock cố định trên viewport có thể phủ lên cảnh khi cuộn. Mục tiêu mới là dành chỗ rõ ràng cho dock trong khung game.
- Bốn quái hiện chỉ là ảnh tĩnh. Chớp mắt, vẫy tay và cử động đuôi cần bộ khung hình hoặc bộ phận tách lớp được chuẩn bị riêng.

## 2. Quy tắc khung chơi

- Chia khung game thành header gọn, vùng cảnh và vùng dock. Đo chiều rộng/chiều cao khả dụng của khung chứa game, kể cả khi mở trong panel hẹp của ứng dụng.
- Dùng chiều cao thực tế còn lại sau header, dock và khoảng an toàn của thiết bị; không trừ cố định 82 px cho mọi layout.
- Chọn layout theo cả chiều rộng và chiều cao. Trong mỗi layout, nền và công trình dùng cùng hệ tọa độ; quái có điểm chân, vùng hoạt động và kích thước đọc được riêng.
- Thu phóng cảnh để giữ các điểm chức năng quan trọng trong vùng nhìn thấy. Chỉ cắt phần trang trí ngoài rìa nếu cần; không cắt cửa công trình, bảng tên hoặc quái.
- Khi khung quá nhỏ để vừa cảnh mà vẫn đọc được, dùng cuộn dọc trong vùng cảnh. Header và dock vẫn truy cập được; không ép nhỏ mọi thứ hoặc tạo hai thanh cuộn lồng nhau.
- Giữ style asset công trình tương tác, ít chữ và sân cỏ; tránh thêm khung thẻ bao quanh từng khu.

## 3. Ba bố cục, thêm biến thể khung thấp

Các ngưỡng dưới đây là điểm bắt đầu để kiểm tra, tính bằng CSS px của khung game, không phải độ phân giải vật lý màn hình.

| Khung | Bố cục | Cách xử lý |
| --- | --- | --- |
| Rộng từ 1100 px | Đảo ngang với bốn khu hiện có | PvE trái, Pets phía trên, Arena phải, Forge trái dưới; giữ sân giữa thoáng. Cân theo cả chiều cao khả dụng. |
| 700–1099 px | Đảo gọn, bốn khu bố trí hai hàng | Hàng trên PvE/Pets, hàng dưới Forge/Arena; không kéo dài thành bốn hàng. Có khoảng cỏ riêng cho quái. |
| Dưới 700 px | Đảo dọc gọn, hai khu trên mỗi hàng khi đủ chỗ | Công trình, bảng tên và quái được sắp lại trong từng khu; quái đứng trước hoặc cạnh trong công trình, không tràn ra ngoài cột. |
| Chiều cao khả dụng của cảnh dưới khoảng 440 px | Biến thể thấp của layout đang chọn | Header/dock gọn hơn, ưu tiên vùng chức năng; nếu vẫn chật thì cuộn vùng cảnh ở tỷ lệ tối thiểu dễ đọc. Áp dụng cả điện thoại xoay ngang. |

- Mobile ở 360 px: thử công trình rộng khoảng 135–155 px và dành tổng chiều cao mỗi hàng khoảng 220–260 px, gồm biển tên và vị trí quái. Nếu vùng an toàn không đủ, chuyển sang các khu so le có chủ đích; không để quái đè sang khu khác để cố giữ hai cột.
- Header: avatar/tên gọn, logo nhỏ; các nút phụ được gom hợp lý nhưng vẫn truy cập được. Dock giữ Team, Monsters, Guide, Bag, có vùng chạm tối thiểu 44 × 44 px.
- Tablet/mobile cần bố cục nền đất phù hợp. Kiểm tra crop nền hiện có trước; nếu không thể giữ các điểm chân trên cỏ thì chuẩn bị nền portrait/compact sạch cùng style, giữ nguyên các công trình là asset rời. Không giả định chỉ đổi tọa độ là mọi nền đều dùng được.
- Trật tự bàn phím theo bố cục đọc; chữ và vùng chạm không bị thu nhỏ theo hệ số của tranh nền.

## 4. Tỷ lệ quái mới

Đo chiều cao hình hữu hình từ sừng tới chân, không tính khoảng trong suốt của file. Các con ngồi và con cuộn ngủ có dáng khác nhau nên so thêm bề ngang/khối thân.

| Quái | Desktop rộng | Tablet | Mobile | Chỉnh vị trí khi tăng cỡ |
| --- | --- | --- | --- | --- |
| Gemling | 120–136 px | 100–116 px | 84–96 px | Nới bãi cỏ trước/phải Pets, giữ khoảng cách biển tên |
| Leafwing | 108–120 px | 90–104 px | 76–88 px | Dịch nhẹ vào sân từ mép cổng PvE, tránh bụi cây che mặt |
| Coralfin | 108–120 px | 90–104 px | 76–88 px | Lùi vào bãi cỏ từ hàng rào, dành chỗ cho đuôi và vây |
| Emberhorn | 78–90 px | 68–80 px | 60–72 px | Giữ cạnh Forge, thân rộng hơn dáng ngồi, tránh cửa lò/đe |

- Dùng giới hạn nhỏ nhất/lớn nhất theo từng layout, không tăng vô hạn theo màn hình ultrawide và không để quái teo đi theo công trình.
- Nếu kích thước tối thiểu không vừa, đổi vị trí/bố cục hoặc cho cuộn cảnh; không vượt ra khỏi đất của đảo.
- Gemling nổi bật nhẹ, không lớn gấp đôi các con khác. Emberhorn tăng diện tích thân đủ để nhìn rõ dù đang ngủ.
- Vùng an toàn tính theo toàn bộ biên chuyển động, không chỉ khung đứng yên. Dự trù khoảng hở ban đầu 12–20 px quanh biển tên/cửa vào; tăng nếu khung hình có cánh hoặc đuôi vươn ra.
- Bóng nằm ở điểm tiếp đất, tỷ lệ theo thân; chuyển động đầu/tay không làm bóng chạy theo.

## 5. Animation theo tính cách

| Quái | Chuyển động nền | Cử động điểm nhấn |
| --- | --- | --- |
| Gemling | Thở nhẹ, chớp mắt, đuôi chuyển động nhỏ | Vẫy tay hoặc nghiêng đầu nhìn quanh |
| Leafwing | Thở, tai lá và đuôi rung nhẹ | Nhìn chiếc lá đang cầm rồi ngẩng lên |
| Coralfin | Thở, chớp mắt, vây tai đung đưa | Quay đầu về phía nước, quẫy đuôi nhỏ |
| Emberhorn | Nhịp thở chậm lúc ngủ | Giật nhẹ tai/đuôi, cựa mình rồi ngủ tiếp |

- Chuyển động nền có nhịp riêng. Điểm nhấn cách nhau khoảng 8–18 giây, lệch thời điểm giữa các con; Emberhorn chậm hơn, khoảng 14–24 giây.
- Bắt đầu bằng chuyển động tại chỗ có neo chân chắc. Mỗi khung giữ đúng khuôn mặt, màu, tỷ lệ và phụ kiện; không để cả nhân vật trượt trên cỏ khi đang thở.
- Có thể làm bước ngắn hoặc nhảy nhỏ ở giai đoạn sau, giới hạn trong vùng sinh hoạt riêng. Chỉ thêm khi có animation chân tương ứng và vùng hoạt động đã kiểm tra; không cho đi khắp đảo trong đợt đầu.
- Quái vẫn là cư dân trang trí: không tạo nút/tooltip hoặc trạng thái hover gợi ý chức năng chưa có. Công trình giữ hành vi hiện tại.

## 6. Gói asset và cách tích hợp

- Dùng hình gốc của từng con làm mẫu chuẩn nhận diện. Tạo thử Gemling trước để kiểm chứng phong cách và chuyển động trước khi làm cả bộ.
- Mỗi con có bộ `idle` khoảng 16 frame ở 8 fps (chu kỳ 2 giây) và một bộ điểm nhấn 8–12 frame ở 10–12 fps. Đây là thông số thử; thời gian giữ từng frame được tinh chỉnh theo hành động, không ép Emberhorn thở nhanh bằng Gemling.
- Khung giao hàng dự kiến 256 × 256 px, nền trong suốt, cùng điểm chân và tỷ lệ giữa các frame. Nguồn giữ độ phân giải cao để tái xuất. Nếu đuôi/cánh chật, tăng canvas đồng bộ thay vì co từng frame riêng lẻ.
- Xuất PNG frame gốc, atlas PNG/WebP có alpha, thông tin vị trí/frame/thời gian/điểm neo và ảnh tĩnh dự phòng. GIF hoặc video chỉ dùng để xem thử vòng lặp.
- Không tự căn giữa độc lập từng frame: khóa điểm tiếp đất và khung nhân vật, tránh rung vị trí. Kiểm tra vòng lặp ở cả kích thước gốc và kích thước hiện trên điện thoại.
- Home đang dùng HTML/CSS. Tích hợp sprite atlas vào lớp quái hiện có, không chuyển toàn bộ Home sang hệ dựng cảnh mới chỉ để có bốn animation.
- Lớp ngoài phụ trách vị trí/kích thước/độ sâu; lớp trong phát frame. Bóng tiếp đất là lớp riêng để chuyển động không phá phép neo.
- Đặt ảnh tĩnh trước, chỉ bắt đầu khi atlas đã tải và giải mã; nếu tải lỗi vẫn hiện đúng quái. Tải điểm nhấn sau bộ idle; chỉ nạp asset của cảnh đang mở.
- Hướng ngân sách ban đầu: tổng dữ liệu animation bốn con khoảng tối đa 4 MB sau nén, cần đo trên asset thật. Theo dõi cả bộ nhớ giải mã; 4 atlas idle 1024 × 1024 RGBA đã khoảng 16 MiB, không tính là chỉ bằng dung lượng file tải.

## 7. Chuyển động và hiệu năng

- Tạm dừng khi tab ẩn, rời Home hoặc quái ngoài vùng nhìn thấy. Đóng dialog thì trở lại trạng thái nhẹ, không phát dồn các hành động đã bỏ lỡ.
- Có tùy chọn tắt chuyển động trong Settings và tôn trọng thiết lập giảm chuyển động của thiết bị. Khi tắt, dùng tư thế tĩnh rõ nét, không bỏ quái khỏi cảnh.
- Khởi tạo và hủy bộ phát cùng vòng đời Home; không sinh thêm bộ hẹn giờ sau mỗi lần mở Pets/Bag hoặc quay lại Home.
- Đo độ mượt khi cuộn/chạm trên thiết bị thật phù hợp trước khi tăng frame hoặc thêm nhiều hiệu ứng môi trường. Không cam kết FPS chỉ dựa trên mô phỏng kích thước màn hình.

## 8. Thứ tự thực hiện

1. Sửa khung game theo không gian khả dụng, bố cục ba nhóm màn hình và dock; tăng quái bằng ảnh tĩnh để kiểm tra tỷ lệ trước.
2. Chụp kiểm tra các bố cục; hoàn thiện nền compact/portrait nếu crop hiện có không đủ vùng đất an toàn.
3. Làm bộ animation Gemling mẫu, kiểm tra nhận diện, chân, bóng, vòng lặp và độ rõ trên mobile.
4. Làm ba bộ còn lại theo cùng tiêu chuẩn; tích hợp nhịp độc lập, tải dự phòng và tùy chọn giảm chuyển động.
5. Kiểm tra toàn bộ tương tác Home/PvE/Pets/Forge/Bag, bàn phím/chạm và vòng đời khi đổi màn hình.

## 9. Tiêu chí nghiệm thu

- Các khung 360×640, 390×844, 430×932, 768×1024, 1024×768, 1366×768, 1440×900, 1920×1080; thêm 844×390, panel hẹp và browser zoom 125%/200%.
- Không tràn ngang, không cắt mất bảng tên/cửa vào; header và dock còn truy cập được ở chế độ cuộn.
- Quái đủ lớn để đọc mặt, mỗi con ở một khu rõ ràng; toàn bộ biên animation không đi qua biển tên, hàng rào, mặt nước hoặc dock.
- Cả bốn có chuyển động riêng, không đồng loạt nhún một nhịp; chân không trượt, đầu/tay/đuôi không biến dạng hoặc đổi nhận diện giữa frame.
- Không có frame trắng khi tải chậm hoặc đổi trạng thái; ảnh tĩnh dự phòng hoạt động khi atlas tải lỗi.
- Kiểm tra giảm chuyển động, tab ẩn, cuộn quái ra ngoài màn hình, đổi hướng màn hình và quay lại Home nhiều lần.
- Build và các kiểm tra chức năng liên quan đạt; đánh giá hình ảnh/animation bằng mắt bên cạnh kiểm tra tự động.

## Tham chiếu kỹ thuật

- [CSS container queries — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries): điều chỉnh bố cục theo khung chứa game.
- [Page Visibility API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API): xác định tab ẩn/hiện để quản lý bộ phát animation.
- [prefers-reduced-motion — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion): đọc lựa chọn giảm chuyển động của người dùng.

# Kế hoạch sửa UI PvE — Hành trình năm vùng nguyên tố

> Cập nhật yêu cầu 14/11/2026: giảm chữ trên UI và dùng asset khóa cho đảo chưa mở. Xem [kế hoạch tinh gọn và khóa đảo](PVE_MINIMAL_UI_PLAN.md). Cấu trúc 5 vùng × 10 thử thách và phong cách rồng vẫn giữ nguyên.

Ngày: 12/11/2026. Trạng thái: đã triển khai UI năm vùng thay thế bản đồ PvE 8 màn; tiến trình và phần thưởng vẫn là dữ liệu xem trước, chưa có API chiến đấu.

## Bản UI đã triển khai

- Bản đồ thế giới có năm đảo nguyên tố; mobile dùng năm thẻ cảnh theo hành trình dọc. Chọn vùng mở bản đồ riêng, mỗi vùng đúng 10 thử thách: 7 thường, 2 elite (4/8) và boss (10).
- Có tranh nền riêng cho năm vùng, một tranh thế giới, năm hình rồng và năm hình boss. Khung gỗ–vàng, font Lilita One/Nunito, mascot và logo tiếp nối sảnh. Elite tạm dùng tạo hình rồng cùng vùng; chưa có atlas elite riêng.
- Chọn thử thách mở dialog có chân dung, loại thử thách, mục tiêu, phần thưởng mẫu, đội hình chờ triển khai và trạng thái khóa. Escape/nút đóng trả focus về thử thách; Tab dùng hành vi modal của trình duyệt.
- Hỗ trợ chuyển vùng, World map, tìm màn hiện tại/boss, Back/Forward, tải lại URL vùng và nhớ vị trí cuộn/màn đã chọn trong phiên màn hình.
- Sample progress: vùng Nature đã qua 3 màn, vùng khác chưa mở. Cho phép tham quan cả năm vùng trong UI preview, nhưng không bắt đầu trận, mở khóa hay nhận thưởng thật.
- Xem thế giới: `http://localhost:8080/?preview=campaign`; xem một vùng: thêm `&realm=nature` (hoặc `water`, `fire`, `light`, `dark`). Sảnh thật mở `/campaign`, có thể dùng `?realm=...`; vẫn kiểm tra đăng nhập/onboarding như trước.
- Bộ ảnh WebP khoảng 4.2 MB; chỉ vùng đang mở được dùng làm nền chính. [Nguồn asset và prompt](PVE_ART_ASSETS.md).
- Đã kiểm tra build/lint/TypeScript và sáu ca browser gồm 50 thử thách, trạng thái khóa, URL, lịch sử, modal/focus, mobile và hồi quy onboarding. Bố cục đã rà tại 360, 390, 768 và 1440 px.

Các phần dưới là định hướng và đặc tả đích. Việc cân bằng 50 trận, API đội hình/chiến đấu/phần thưởng, tạo hình elite riêng và tiến trình tài khoản thật là công việc gameplay tiếp theo.

## 1. Yêu cầu và quyết định chính

- Campaign gồm **5 vùng đất × 10 thử thách = 50 thử thách**. Đây là phạm vi theo yêu cầu mới, thay cho phương án 8 màn.
- Mỗi vùng đất là một map riêng; 10 thử thách là 10 điểm đến trên map đó. Không xếp cả 50 điểm trên một đường cuộn liên tục.
- Dùng năm nguyên tố có sẵn trong GDD: **Nature, Water, Fire, Light, Dark** — Thiên nhiên, Nước, Lửa, Ánh sáng, Bóng tối. Không tự thay bằng hệ Kim/Mộc/Thủy/Hỏa/Thổ hoặc thêm hệ Gió/Đất.
- Thứ tự vùng đề xuất: **Thiên nhiên → Nước → Lửa → Ánh sáng → Bóng tối**. Đây là nhịp hành trình, không phải thứ tự khắc chế.
- Lấy sảnh Gem Island hiện tại làm chuẩn hình ảnh: fantasy hoạt hình sáng, pha lê, hình khối tròn, viền rõ, khung gỗ và vàng, nút có chiều sâu.
- **Bổ sung theo yêu cầu: phần lớn quái là rồng.** Hướng hình ảnh thống nhất là **thế giới rồng nguyên tố và pha lê**, phát triển từ rồng đồng hành hiện có. Rồng được hiểu là họ sinh vật; Nature/Water/Fire/Light/Dark vẫn là năm nguyên tố, chưa thêm nguyên tố Dragon.
- “Phần lớn” không đồng nghĩa toàn bộ: có thể có sinh vật phụ trợ phù hợp sinh cảnh. Chưa chốt tỷ lệ và không suy ra rằng mọi hero của người chơi phải đổi thành rồng.
- Giữ chữ UI tiếng Anh như sảnh; tên tiếng Việt trong tài liệu để giải thích. Tên riêng dưới đây là đề xuất.

## 2. Vì sao bản hiện tại chưa phù hợp

Đối chiếu trực tiếp `docs/previews/home-desktop.png` và `campaign-desktop.png`:

| Vấn đề quan sát được | Hướng sửa cụ thể |
| --- | --- |
| Tiêu đề Georgia, bố cục rộng màu kem và các đường viền mảnh lệch với chữ/nút hoạt hình của sảnh | Dùng lại font hiển thị Lilita One và font nội dung Nunito, logo và bộ khung của sảnh |
| Cây SVG phẳng, lặp lại; nền xanh bạc màu, địa hình ít mốc riêng | Vẽ nền riêng cho từng vùng, có góc nhìn từ trên chếch xuống, khối đất, cây, công trình và ánh sáng đồng nhất |
| Bản đồ nằm trong một thẻ lớn, bảng mô tả luôn chiếm cột phải | Để cảnh game làm nền chính toàn màn hình; chỉ mở thông tin khi chọn thử thách |
| Cảnh bị kéo giãn theo chiều ngang, tỷ lệ cây/đường khác nhau giữa desktop và mobile | Giữ tỷ lệ hình minh họa, chuyển vị trí camera/khung nhìn; không kéo méo asset |
| Nút chỉ là vòng tròn đánh số; elite/boss chưa có địa điểm riêng | Nút thành bệ đá/ngọc đặt trong cảnh; elite tại lãnh địa rồng trưởng thành, boss ở long sào đặc trưng cuối vùng |
| Hình xem trước màn dùng ảnh sảnh nên không khớp địa điểm | Dùng ảnh cắt từ vùng tương ứng hoặc minh họa địa danh của chính thử thách |
| Chữ phụ quá nhỏ, nhiều chữ trang trí kiểu bộ sưu tập | Bỏ “THE ADVENTURE COLLECTION”; ưu tiên tên vùng, tiến trình, nút quay lại và hành động chơi |

Giữ lại phần đã hữu ích: điều hướng từ sảnh, đường dẫn `/campaign`, chọn màn, trạng thái khóa/đã thắng, ghi nhớ vị trí, điều khiển bàn phím và bảng nổi mobile.

### Chuẩn hình ảnh rồng của Gemora

- **Mẫu gốc:** `apps/game-client/public/art/gemora-baby-dragon.png` và sảnh Gem Island. Giữ khối đầu tròn, mắt biểu cảm, chân/móng ngắn rõ, sừng và pha lê cách điệu, nét viền đậm vừa, mảng sáng tối mềm và màu tươi.
- **Quái thường:** rồng nhỏ hoặc vừa, hình dáng dễ nhận biết ở kích thước nhỏ; khác nhau bằng dáng đứng, sừng, cánh, đuôi và lớp giáp. Không lấy rồng đồng hành rồi đổi màu cho mọi địch.
- **Elite:** rồng trưởng thành, thân vững hơn, sừng/cánh hoặc giáp nổi bật. Thể hiện độ mạnh bằng hình khối và tư thế, không chỉ phóng to quái thường.
- **Boss:** long vương hoặc cổ long của vùng, dáng độc quyền và dấu hiệu nguyên tố lớn, có thể oai vệ hơn mascot nhưng vẫn giữ cùng nét hoạt hình. Tránh vảy tả thực li ti, giải phẫu kinh dị và nền quá tối làm mất khả năng đọc hình.
- **Rồng đồng hành và rồng địch:** giữ khăn cổ, biểu cảm và tư thế thân thiện của mascot; rồng địch dùng tư thế chiến đấu, đặc điểm loài và ký hiệu địch trong bảng gặp gỡ. Không phân biệt chỉ bằng màu đỏ/xanh, không mặc định mọi rồng đều là sinh vật xấu.
- **Cảnh quan là môi trường sống:** bổ sung hang, tổ, bãi đậu, vết chân, đá cào, pha lê mọc quanh long sào. Dấu vết có chọn lọc; không phủ biểu tượng rồng lên mọi nút và khung.
- **Liên kết với sảnh:** Gem Island tiếp tục là nơi cư trú an toàn và điểm xuất phát; giữ rồng đồng hành cùng chất liệu pha lê/gỗ/vàng để chuyển sang PvE không có cảm giác sang trò chơi khác.

## 3. Hai cấp bản đồ

### Bản đồ thế giới — nhìn thấy hành trình năm vùng

- Một quần đảo fantasy gồm năm vùng, nối nhau bằng cầu sáng hoặc đường hành trình. Gem Island là điểm xuất phát trang trí, không tính là vùng thứ sáu.
- Các đảo có dáng và công trình khác nhau, nhận ra được ngay cả khi bỏ tên và màu nguyên tố.
- Mỗi vùng hiển thị biểu tượng nguyên tố, tên, tiến trình `0/10` đến `10/10`, trạng thái mở/khóa.
- Vùng chưa mở vẫn nhìn thấy cảnh và tên; chỉ phủ sương nhẹ, đặt khóa tại lối vào. Bấm vào thấy điều kiện mở, không cho bắt đầu thử thách.
- Nút **Continue journey** đưa tới thử thách kế tiếp của vùng đang chơi, không tự bắt đầu trận.
- Mobile dùng cảnh thế giới bố trí theo chiều dọc với năm đảo; không thu nhỏ nguyên bản desktop tới mức nhãn không đọc được.

### Bản đồ vùng — nơi chọn 10 thử thách

- Cảnh minh họa chiếm toàn vùng chơi, HUD gọn nổi trên nền. Đường đi qua các địa danh, có chặng đầu–giữa–cuối rõ.
- Thanh trên: về World map, tên vùng, biểu tượng nguyên tố, tiến trình `4/10`.
- Thanh chuyển vùng gọn có năm biểu tượng; không tạo thêm một tầng menu chọn chapter.
- Mỗi map có **đúng 10 điểm có thể chọn**, mang số 1–10. Khi xem chi tiết dùng mã rõ ràng như `Nature · 04/10`; dữ liệu vẫn có ID duy nhất cho cả 50 thử thách.
- Nút Current challenge đưa về thử thách tiếp theo; giữ nguyên vị trí khi đóng bảng thông tin hoặc quay lại từ đội hình/trận.
- Rồng nhỏ đồng hành xuất hiện cạnh thử thách hiện tại, kích thước vừa đủ, không che nút hoặc đường đi.

Luồng lần đầu: **Sảnh → PvE → Thế giới năm vùng → Vùng Thiên nhiên → Chọn thử thách → Chi tiết**.

Luồng quay lại: **Sảnh → PvE → Vùng đang chơi**, có nút World map để xem toàn hành trình. Khi đã hoàn thành cả 50 thử thách, mở bản đồ thế giới với trạng thái hoàn thành, không tìm một thử thách kế tiếp không tồn tại.

## 4. Bản sắc năm vùng

| Vùng / tên UI đề xuất | Cảnh và màu chủ đạo | Đường hành trình và địa danh | Long sào cuối vùng |
| --- | --- | --- | --- |
| Thiên nhiên — **Whispering Woods** | Xanh lá tươi, vàng nắng, cây tán tròn, hoa và nấm lớn | Cầu rễ cây, tổ rồng giữa tán lá, hồ rừng và bãi đá có dấu chân | Hang dưới cổ thụ pha lê, tổ của Cổ Long Rừng |
| Nước — **Tideglass Isles** | Xanh ngọc, xanh biển, cát kem, san hô, thác nước | Đảo nhỏ, bãi nghỉ của thủy long, hồ thủy triều và cầu gỗ | Động san hô sau vòng thác, lãnh địa Hải Long |
| Lửa — **Emberfall Peaks** | Cam, đỏ san hô, đá nâu tím; dung nham sáng nhưng không phủ kín cảnh | Bãi đá ấm, vách núi có tổ rồng, cầu đá qua khe dung nham | Long sào trong miệng núi lửa, nơi Hỏa Long trú ngụ |
| Ánh sáng — **Dawnspire Sanctuary** | Trắng ngà, vàng mật ong, xanh trời; mây tròn và pha lê vàng | Đảo mây, bãi đáp cánh rộng, cầu ánh sáng và di tích đền | Tổ pha lê trên đỉnh thánh điện, nơi Quang Long canh giữ |
| Bóng tối — **Moonveil Hollow** | Tím violet, xanh đêm, điểm sáng cyan; trăng và nấm phát quang | Rừng hoàng hôn, cầu trăng, hồ phản chiếu và hang đá tím | Long sào trăng khuyết trong tàn tích, lãnh địa Ảnh Long |

Bóng tối vẫn theo phong cách dễ thương, huyền bí và dễ nhìn. Năm nền phải khác bố cục địa hình, địa danh và ánh sáng; đổi màu một bản đồ không đáp ứng yêu cầu.

### Hình dáng rồng theo vùng — đề xuất tạo hình

| Họ rồng | Đặc điểm nhận diện ngoài màu sắc | Hướng tạo hình boss |
| --- | --- | --- |
| Thiên nhiên | Thân chắc, sừng cành cây bo tròn, cánh dạng lá, giáp rêu/pha lê | Cổ long mang tán lá và cụm pha lê trên lưng |
| Nước | Thân thuôn, mào vây, đuôi bản rộng, sừng san hô và vảy lớn gọn | Hải long với vây xòe như san hô, thân uốn quanh hồ |
| Lửa | Ngực rộng, cánh ngắn khỏe, sừng đá núi lửa, giáp có khe phát sáng | Hỏa long giáp đá, cánh lớn mang mảng sáng dung nham |
| Ánh sáng | Dáng thanh, cánh rộng nhiều mảng, sừng pha lê cân đối | Quang long với cánh pha lê tỏa hình mặt trời |
| Bóng tối | Tai/vây nhọn nhưng mềm, cánh dơi tròn mép, đuôi cong, dấu trăng | Ảnh long với cánh trăng khuyết và viền phát quang tím |

Đây là định hướng mỹ thuật, chưa khẳng định kỹ năng hay luật chiến đấu. Một vùng có thể có nhiều biến thể dáng/vai trò và vài quái phụ trợ; không cần tạo 50 loài rồng độc lập để có 50 thử thách.

## 5. Nhịp 10 thử thách trong mỗi vùng

Đề xuất bố cục **7 thử thách thường + 2 elite + 1 boss**, giữ cùng quy ước để người chơi đọc map nhanh. Đây là nhịp nội dung dự kiến, chưa phải luật hay cân bằng đã kiểm chứng.

| Vị trí | Vai trò | Cách hiện trên map |
| --- | --- | --- |
| 1–3 | Làm quen đội địch/cơ chế của vùng và thử cách đối phó | Bệ ngọc nhỏ trên chặng đầu |
| 4 | Elite đầu vùng, kiểm tra điều vừa học | Bãi đá của rồng trưởng thành, huy hiệu rồng và dấu Elite |
| 5–7 | Kết hợp và biến đổi tình huống; tăng độ khó có nhịp | Các địa danh giữa vùng, không lặp nguyên bố trí địch |
| 8 | Elite thứ hai, chuẩn bị cho trận cuối | Rồng canh lối vào long sào, hình lớn hơn nút thường |
| 9 | Thử thách tổng hợp trước boss | Bệ ngọc trước long sào cuối vùng |
| 10 | Boss rồng đặc trưng của vùng | Long sào lớn và chân dung boss riêng |

Chỉ vùng Thiên nhiên giới thiệu thao tác cơ bản. Các vùng sau giới thiệu tình huống chiến đấu mới thay vì lặp tutorial. Ý tưởng khác biệt theo vùng: Nature về hồi phục và chọn mục tiêu; Water về phòng thủ và thời điểm dùng skill; Fire về tín hiệu đòn mạnh và quyết định công/thủ; Light về hỗ trợ giữa các địch; Dark về thứ tự xử lý hiệu ứng. Các chủ đề này cần đặc tả và thử nghiệm gameplay riêng, không được coi là tính năng đã có.

Nguyên tố của vùng là bản sắc chủ đạo; không bắt mọi địch trong vùng cùng một nguyên tố, không bắt người chơi sở hữu một hero cụ thể mới được vào.

Quy tắc tiến trình đề xuất:

- Vùng 1, thử thách 1 mở lúc bắt đầu.
- Thắng thử thách N mở N+1. Thắng boss 10 mở vùng kế tiếp, thử thách 1.
- Màn đã qua luôn có thể chọn lại. Thua không mất quyền chơi màn hiện tại.
- Chưa thêm điều kiện tổng sao, stamina hoặc trả phí mở đường.
- Kết quả, mở khóa và thưởng thật do server xác nhận. UI preview phải ghi rõ dữ liệu mẫu.

## 6. Bộ UI đồng bộ với sảnh

### Nền, chữ và khung

- Dùng nền minh họa riêng cho mỗi vùng, tỷ lệ vật thể và góc nhìn nhất quán với Gem Island. Màu bão hòa vừa đủ, phần nằm sau chữ/nút giảm chi tiết.
- Logo dùng lại từ sảnh. Tiêu đề dùng Lilita One, nội dung dùng Nunito; không dùng Georgia hoặc chữ serif cho map.
- Khung thông tin: giấy kem, viền gỗ nâu hai lớp, góc bo, điểm nhấn vàng. Nút chính vàng nổi giống nút hành động ở sảnh.
- Nội dung chính tối thiểu 14 px trên mobile, nhãn phụ tối thiểu 12 px; các nhãn màn phải đọc được ở màn rộng 360 px.
- Thông tin quan trọng đặt trên bảng nền đặc; không đặt chữ nhỏ trực tiếp lên cây, mây, lửa hoặc mặt nước.

### Điểm thử thách và trạng thái

- Thường: bệ đá tròn mang ngọc của vùng, số nổi rõ.
- Elite: bệ lớn hơn với huy hiệu rồng và dấu Elite; boss có long sào và chân dung riêng. Số thử thách vẫn rõ, không bị hình rồng che.
- Đã qua: dấu ✓ và đường đã đi sáng lên; giữ hình dáng nguyên tố để không mất bản sắc.
- Tiếp theo: vòng sáng chậm, nhãn Next và rồng chỉ đường. Giảm chuyển động sẽ bỏ hiệu ứng lặp.
- Đang chọn: viền vàng và trạng thái nhấn rõ, phân biệt với Next.
- Khóa: giảm độ sáng vừa phải, thêm biểu tượng khóa; vẫn xem được số và lý do khóa.
- Vùng bấm tối thiểu 48 × 48 px, không chồng giữa các nút. Hiệu ứng trang trí không chặn thao tác.

### Thông tin thử thách

- Khi chưa chọn thử thách, để trọn cảnh map; bỏ bảng bên phải mở thường trực.
- Desktop: chọn điểm mở bảng gọn bên cạnh hoặc popup, tự đặt để không che điểm đang chọn. Có nút X rõ.
- Mobile: bảng từ dưới lên khoảng 60–70% chiều cao, nội dung cuộn, đóng và hành động chính luôn tiếp cận được.
- Nội dung theo thứ tự: tên và loại thử thách → mục tiêu ngắn → địch/nguyên tố → phần thưởng → ba hero → Play/Replay.
- Địch hiển thị chân dung rồng thật theo vùng thay cho icon chiếc lá chung. Họ sinh vật, nguyên tố và cấp thường/elite/boss là các thông tin khác nhau; nguyên tố có biểu tượng rõ cạnh chân dung.
- Tránh đoạn mô tả dài, ô trang trí thừa và thông tin lặp. Đội chưa đủ có hành động chỉnh đội và lý do chưa thể chơi.
- Khi chưa có API, hiển thị preview và Coming soon; không tạo trận hay cộng tiến trình giả như dữ liệu thật.

## 7. Bố cục và kỹ thuật hình ảnh

- Desktop: bản đồ chiếm khoảng 80–90% diện tích nhìn thấy; thanh trên gọn, không dành một khối lớn cho tiêu đề.
- Mobile: một vùng cuộn dọc chính, mỗi khung thấy khoảng 3–4 điểm và địa danh liên quan; tránh vừa cuộn trang vừa cuộn hộp bản đồ.
- Nền, điểm đến và đường nối dùng chung hệ tọa độ. Giữ tỷ lệ bằng camera/crop hoặc phiên bản bố cục mobile, không dùng kéo giãn nền độc lập với nút.
- Cấu trúc dữ liệu tách định nghĩa vùng, định nghĩa thử thách, vị trí điểm và tiến trình tài khoản. Không hard-code điều kiện kiểu `index > 3`.
- Tải bản đồ thế giới nhẹ trước, tải nền vùng đang xem và nạp trước vùng kế tiếp; không tải toàn bộ năm nền lớn ngay khi vào sảnh.
- Tách nền xa, địa hình và hiệu ứng nhẹ nếu cần; ưu tiên rõ hình, tốc độ tải và sự đồng nhất trước animation.
- Dùng minh họa cho cảnh; HTML cho HUD/nút và lớp đường nối đồng bộ. Chỉ chuyển sang canvas nếu có nhu cầu camera/hiệu ứng cụ thể, không đổi công nghệ chỉ để sửa style.

## 8. Kế hoạch thực hiện theo thứ tự

| Bước | Công việc | Đầu ra và điều kiện chuyển bước |
| --- | --- | --- |
| 1. Chốt bộ hình ảnh | Đối chiếu trực tiếp sảnh và mascot; làm bảng năm họ rồng, phân cấp thường/elite/boss, mẫu font/khung/nút | Rồng và UI cùng phong cách; năm họ khác hình dáng, không chỉ khác màu |
| 2. Mockup đại diện | Thiết kế bản đồ thế giới và map Thiên nhiên đủ 10 điểm, desktop/mobile | Cảnh và UI nhìn như cùng một game với sảnh; 10 điểm không chồng nhau; dùng đây để lấy phản hồi trước khi nhân rộng |
| 3. Asset năm vùng | Làm năm nền sinh cảnh rồng, năm biểu tượng nguyên tố, năm long sào/chân dung boss và bộ rồng thường/elite cần cho nội dung | Đồng nhất nét vẽ/góc nhìn, khác biệt nhận diện; có bố cục mobile |
| 4. Triển khai UI | Điều hướng World/Region, 50 điểm cấu hình, popup, trạng thái khóa/qua/đang chọn và ghi nhớ vị trí | Mọi vùng có đúng 10 thử thách và tương tác nhất quán |
| 5. Kiểm tra hình ảnh | Chụp cùng kích thước với sảnh; rà ở 360, 390, 768 và 1440 px | Không kéo méo cảnh, không che điểm, chữ đủ lớn, thao tác bàn phím và touch hoạt động |
| 6. Nối gameplay sau | Đặc tả 50 thử thách, đội địch, boss, phần thưởng, API tiến trình | UI dùng dữ liệu thật; kết quả và mở khóa được server xác nhận |

Làm hoàn chỉnh một vùng đại diện trước giúp kiểm tra style và cách chơi; mục tiêu cuối vẫn là đủ **5 vùng, 50 thử thách**, không giảm phạm vi yêu cầu xuống một vùng.

## 9. Tiêu chí duyệt bản sửa

1. Đặt ảnh sảnh và map cạnh nhau: cùng logo, font, chất liệu khung/nút, độ nổi và phong cách minh họa.
2. Có thể phân biệt năm vùng bằng địa hình và công trình khi chưa đọc tên.
3. Thế giới thể hiện rõ năm vùng; từng map có đúng 10 điểm, boss tại điểm 10.
4. Trong vài giây, người chơi thử xác định được đang ở vùng nào, đã qua bao nhiêu thử thách và nên bấm điểm nào tiếp theo. Đây là mục tiêu cần kiểm tra, không phải kết quả đã có.
5. Nút và chữ đủ đọc ở 360 px; map không kéo méo, popup không che mất nút đóng hoặc hành động chính.
6. Hoàn thành boss vùng trước mở đúng vùng sau; quay lại vẫn chọn được thử thách đã qua. Preview và dữ liệu thật được phân biệt rõ.
7. Mỗi vùng sau có tình huống gameplay mới khi triển khai nội dung; tránh 50 trận chỉ đổi hình nền và tăng HP.
8. Đặt mascot, một quái rồng và một boss cạnh nhau: nhận ra cùng thế giới Gemora nhưng phân biệt được vai trò. Khi bỏ màu, vẫn nhận ra khác biệt giữa năm họ rồng bằng cánh, sừng, thân và đuôi.

## 10. Đồng bộ tài liệu và phần cần kiểm chứng

- Kế hoạch này thay thế phạm vi 8 màn và hướng hình ảnh trong `PVE_MAP_UI_PLAN.md`.
- PRD/GDD hiện vẫn mô tả 8 stage. Khi cập nhật đặc tả Campaign, phải đổi cấu trúc, milestone, tiêu chí nghiệm thu và nội dung seed tương ứng sang 5 × 10; không coi số 8 cũ là giới hạn của yêu cầu mới.
- Chưa chốt tên vùng chính thức, tên từng thử thách, boss, chỉ số, thưởng hoặc độ dài toàn Campaign. Các tên/nhịp trong tài liệu là đề xuất; sản xuất 50 màn cần cân bằng gameplay riêng.
- Bước tiếp theo đề xuất: làm bảng tạo hình năm họ rồng dựa trên mascot hiện tại, rồi mockup bản đồ thế giới và map Thiên nhiên 10 thử thách với một rồng thường, một elite và Cổ Long Rừng ở long sào cuối map. Kiểm tra sự đồng bộ với sảnh trước khi nhân rộng.

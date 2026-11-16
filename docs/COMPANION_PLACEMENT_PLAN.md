# Kế hoạch bố trí linh thú trên Gem Island

Ngày: 15/11/2026. Trạng thái: đã triển khai bố cục tĩnh; các phần bên dưới lưu hướng thiết kế đã thống nhất.

## Kết quả triển khai

- Leafwing đứng bên cổng PvE, Gemling cạnh Pets, Coralfin ở bãi cỏ trong hàng rào gần thác, Emberhorn cạnh Forge.
- Nền, công trình và thú cùng co giãn theo một khung cảnh desktop cố định tỷ lệ; màn hình thấp cuộn được thay vì bóp méo hoặc cắt mất công trình. Khung cao có phần nền trời bổ sung bên dưới.
- Mỗi con neo theo công trình và điểm chân riêng, có bóng tiếp xúc, không nhận thao tác chuột/chạm. Giữ ảnh đúng tỷ lệ gốc, kể cả Gemling không phải ảnh vuông.
- Từ 900 px trở xuống dùng bố cục dọc và vị trí riêng cạnh từng công trình; bỏ nhóm chung và khoảng đệm 180 px. Không còn bong bóng chào trên sân.
- Tận dụng bốn asset hiện có; chưa thêm chuyển động hoặc cơ chế tương tác với thú trang trí.
- Build gồm lint/TypeScript đạt; bốn kiểm tra trình duyệt Home và luồng người chơi đạt. Kiểm tra hình ảnh ở 360, 390, 768, 1024, 1440 px và desktop 1440 × 720: không tràn ngang, thú không bị cắt hoặc đè bảng tên.
- Ảnh mới: `previews/home-landmarks-desktop.png`, `previews/home-landmarks-mobile.png`.

## Mục tiêu

Bốn linh thú sống ở các góc khác nhau trên đảo, có tỷ lệ phù hợp với công trình và chiều sâu cảnh. Giữ phong cách rồng chibi hiện có, ít chữ, nhìn rõ lối vào PvE, Pets, Arena và Forge. Sân giữa có khoảng trống để người chơi đọc được bố cục.

## Nhận xét hiện trạng

- Bốn con cùng nằm trong một khung ở giữa sân, tạo cảm giác đội hình trưng bày.
- Gemling lớn hơn rõ rệt; ba con còn lại thu nhỏ theo cùng khung nên chưa có quan hệ kích thước với môi trường.
- Bong bóng chào chiếm thêm vùng trống ngay dưới Pets.
- Ảnh nền dùng cách phủ kín khung trong khi công trình và nhóm thú có cách định vị riêng. Khi đổi tỷ lệ màn hình, vị trí thú có thể lệch khỏi vùng đất phù hợp.
- Mobile dành một khoảng trống chung sau Arena cho cả nhóm. Cách này cần thay bằng vị trí riêng gần từng công trình.

## Tham khảo game và cách áp dụng

1. **Dragon City:** tài liệu chính thức mô tả rồng nguyên tố được đặt trong habitat cùng hệ. Áp dụng về mặt hình ảnh: mỗi linh thú có một góc môi trường phù hợp, giúp người chơi hiểu tính cách/hệ mà không cần thêm nhãn. Không đưa cơ chế habitat vào Gemora ở đợt này.
   Nguồn: https://socialpoint.helpshift.com/hc/en/7-dragon-city/faq/4226-what-are-the-different-types-of-habitats/
2. **My Singing Monsters:** trang chính thức giới thiệu các đảo có diện mạo và loài quái riêng, cho phép tùy biến đảo. Áp dụng: xem linh thú là cư dân của cảnh, tạo các điểm sinh hoạt phân bố trên đảo và giữ bản sắc từng con.
   Nguồn: https://www.bigbluebubble.com/home/games/my-singing-monsters-series/my-singing-monsters/

Các vị trí và thông số dưới đây là đề xuất riêng cho Gemora, không phải tỷ lệ đo từ các game tham khảo.

## Bố cục đề xuất

| Linh thú | Vị trí | Hướng và cảm giác | Kích thước thử ban đầu |
| --- | --- | --- | --- |
| Gemling — pha lê | Bãi cỏ phía dưới, lệch phải khu Pets; tránh bảng tên và bậc thềm | Chào người chơi, nhìn về khoảng sân | Cao phần hình nhìn thấy 75–85 px |
| Leafwing — thiên nhiên | Bãi cỏ bên phải cổng PvE, gần bụi cây; tránh cửa cổng và đường đi | Ngồi nhìn vào đảo | Cao phần hình nhìn thấy 65–75 px |
| Coralfin — nước | Bãi cỏ gần thác bên phải, phía trong hàng rào và dưới Arena; tránh dock góc dưới | Quay vào sân, có cảm giác đang ngắm nước | Cao phần hình nhìn thấy 65–75 px |
| Emberhorn — lửa | Sát mép bãi cỏ bên phải Forge, cạnh nền đá; tránh cửa lò, đe và bảng tên | Cuộn ngủ, tạo một góc yên tĩnh | Cao phần hình nhìn thấy 45–55 px; thân rộng khoảng 70–85 px |

Thông số trên dành cho khung tham chiếu 1440 × 960 như ảnh kiểm tra hiện tại. Chốt lại sau khi đặt lên cảnh thật; không giữ pixel cố định trên mọi màn hình. Emberhorn thấp hơn vì tư thế cuộn ngủ, không phải một cá thể nhỏ bất thường.

## Quy tắc tỷ lệ và chiều sâu

- Đo phần hình hữu hình, loại trừ khoảng trong suốt của ảnh. Cùng chiều rộng file không có nghĩa cùng kích thước linh thú.
- So với bậc cửa, hàng rào và công trình gần nhất. Mốc thử cho thú ngồi là khoảng 20–30% chiều cao phần công trình nhìn thấy; kiểm tra bằng mắt để tránh quá bé hoặc lớn ngang cổng.
- Với cùng tư thế và độ sâu, Gemling chỉ nổi bật hơn khoảng 10–15%. Không tiếp tục dùng vai trò mascot để phóng lớn giữa cảnh.
- Vị trí phía sau có thể nhỏ hơn khoảng 10–15% so với tiền cảnh. Không nhân nhiều hệ số khiến một con mất khả năng nhận diện.
- Neo ảnh tại điểm chân/thân chạm đất. Mỗi con có bóng elip mềm riêng, khớp điểm tiếp xúc và tư thế.
- Giữ khoảng cách với đường viền công trình, biển tên và mép đảo; không để đuôi hoặc sừng vô tình chạm đường viền khác.
- Sắp lớp theo chân và vật cản: nếu ở sau bụi cây/hàng rào thì chỉ che đúng phần cần che. Không dùng thứ tự lớp để giấu lỗi đặt thú trên nước hoặc trên trời.
- Ảnh thú hiện có hơi chính diện so với cảnh nhìn từ trên xuống. Đợt đầu xử lý bằng vị trí, tỷ lệ và bóng; nếu vẫn bị cảm giác dán nổi, mới cân nhắc asset góc nhìn 3/4 phù hợp hơn.

## Tương tác và chữ

- Giữ sân giữa thoáng, bỏ bong bóng chào thường trực; lời chào nếu cần chỉ xuất hiện ngắn ở Gemling.
- Không thêm bảng tên, cấp độ hoặc thanh sức mạnh trên cả bốn con.
- Đợt đầu ưu tiên bố cục tĩnh; linh thú trang trí không chặn thao tác vào công trình, Team, Monsters hay Bag.
- Sau khi bố cục đạt yêu cầu, có thể thêm nhịp thở nhẹ lệch nhịp giữa các con. Không cho cả nhóm cùng nhún hoặc đi ngẫu nhiên qua lối vào.
- Nếu sau này cho bấm vào thú, cần thiết kế hành động rõ ràng và trạng thái bàn phím/chạm; không tạo hiệu ứng gợi ý bấm khi chưa có chức năng.

## Desktop và mobile

- Desktop: nền, công trình và thú dùng cùng hệ tọa độ cảnh, có tính đến phần nền bị cắt khi phủ kín khung. Vị trí chân phải bám bãi cỏ thực tế, không chỉ bám phần trăm màn hình.
- Tablet: kiểm tra lại vùng đất an toàn khi khung hẹp; giữ khoảng cách với các bảng tên và dock.
- Mobile: neo mỗi con vào khu vực của công trình liên quan, có độ lệch và kích thước riêng; bỏ khoảng đệm 180 px dùng cho nhóm hiện tại.
- Nếu thác bị cắt khỏi màn hình mobile, Coralfin đứng ở vùng cỏ cạnh Arena còn nhìn thấy, không cố giữ tọa độ desktop.
- Giữ đủ kích thước để đọc mặt và dáng; nếu chật thì điều chỉnh khoảng cách cục bộ giữa các công trình. Không thu nhỏ cả bốn con đến mức khó thấy.

## Thứ tự triển khai sau kế hoạch

1. Tách dữ liệu hiển thị từng thú: vùng neo, điểm chân, kích thước nhìn thấy, độ sâu và vị trí mobile.
2. Thay khung nhóm chung bằng các thú độc lập trong lớp cảnh; thống nhất phép co giãn/định vị với nền và công trình.
3. Đặt bốn thú vào các vùng đã chọn, chỉnh tỷ lệ, bóng và khoảng hở. Tận dụng asset hiện tại.
4. Xử lý mobile riêng; giảm chữ và bỏ bong bóng thường trực.
5. Chụp đối chiếu ở các chiều rộng 360, 390, 768, 1024 và 1440 px, thêm desktop thấp để phát hiện lỗi cắt nền.
6. Kiểm tra thao tác công trình và dock, trạng thái hover/focus, phần thú không che biển tên hoặc nằm ngoài đảo. Chạy kiểm tra hiện có liên quan trang Home sau khi triển khai.

## Điều kiện hoàn thành

- Nhìn lướt thấy bốn linh thú ở bốn vùng, không còn cụm đội hình giữa sân.
- Cả bốn tiếp đất tự nhiên, không đứng trên nước/trời hoặc chắn lối vào.
- Tỷ lệ hợp với công trình; Gemling không lấn át toàn cảnh.
- Không thêm chữ thường trực, không phát sinh khoảng trống lớn trên mobile.
- Thay đổi chỉ liên quan trình bày cảnh Home; dữ liệu sở hữu/nâng cấp linh thú giữ theo chức năng hiện có.

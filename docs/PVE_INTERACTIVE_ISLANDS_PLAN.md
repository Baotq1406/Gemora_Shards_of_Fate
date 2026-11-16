# PvE — Đảo nổi độc lập, ít chữ, tương tác trên toàn đảo

Ngày: 15/11/2026. Trạng thái: kế hoạch theo ảnh người dùng gửi; chưa tạo bộ đảo mới hoặc thay đổi giao diện trong lượt này.

## Mục tiêu và phạm vi

Giữ bố cục thế giới trong ảnh tham chiếu: trời xanh, mây sáng, năm đảo nổi lớn, góc nhìn chéo, tranh fantasy cartoon tươi và khung vàng kem. Đảo là đối tượng tương tác chính. Giữ nguyên năm vùng Nature → Water → Fire → Light → Dark, mỗi vùng 10 thử thách và hệ rồng hiện có.

Lần này tập trung vào màn thế giới. Bản đồ 10 thử thách, bảng thông tin địch, tiến trình mẫu và hành vi khóa đã triển khai tiếp tục được sử dụng. Không thêm chiến đấu hoặc phần thưởng thật.

Ảnh tham chiếu của người dùng: `codex-clipboard-c9a724e4-6d3a-4bc3-baf9-1479b57ff29a.png`. Bản tranh sạch đang có: `apps/game-client/public/art/campaign/world.webp`.

## 1. Bố cục và chữ

- Thanh trên: nút quay về sảnh ở trái, logo GEMORA gọn ở giữa như ảnh tham chiếu, chip Preview nhỏ bên phải. Không thêm một tiêu đề lớn khác trên tranh.
- Bỏ toàn bộ khối THE FIVE ELEMENTAL REALMS, A world of dragons awaits và câu mô tả dưới tiêu đề.
- Bỏ số thứ tự REALM, tên nguyên tố lặp bằng chữ, EXPLORE PREVIEW, CONTINUE trên từng bảng tên và tổng 5 REALMS · 50 CHALLENGES.
- Mỗi đảo chỉ có bảng tên nhỏ gồm icon nguyên tố + tên hiện tại. Đảo mở thêm tiến trình `3/10`; hoàn thành dùng dấu ✓; đảo khóa không hiện `0/10`.
- Bảng tên dùng gỗ viền nâu, giấy vàng kem; cao khoảng 44–52 px desktop, tối đa hai dòng trên mobile. Giữ chữ rõ, giảm nội dung thay vì thu nhỏ chữ.
- Một nút Continue ở góc dưới phải. Rồng đồng hành ở dưới trái, không có bong bóng lời chào. Chỉ đảo đang chơi có dấu chỉ nhẹ.
- Thông tin tiến trình/thưởng mẫu nằm trong chip Preview, không chiếm một dải chữ dưới bản đồ.

Vị trí tương đối desktop: Thiên nhiên dưới trái; Nước trên trái; Lửa ở giữa; Ánh sáng trên phải; Bóng tối dưới phải. Đảo nhà nhỏ phía dưới giữa chỉ là trang trí, không có trạng thái hover hoặc bảng tên như một vùng thứ sáu.

## 2. Bộ asset cần làm

| Asset đề xuất | Nội dung | Yêu cầu |
| --- | --- | --- |
| `world-sky-v2.webp` | Bầu trời, mây, đảo xa và đảo nhà trang trí | Loại bỏ năm đảo chơi cùng đường nối cũ; phục dựng nền ở các chỗ trống |
| `island-nature-v2.webp` | Cây pha lê, tổ rồng, thác nhỏ, khối đá nổi | Nền trong suốt, toàn bộ đảo nằm trong khung |
| `island-water-v2.webp` | Hang san hô, nước xanh, thác chảy xuống | Giữ khe đá, nhánh san hô và mép nước rõ |
| `island-fire-v2.webp` | Núi lửa, cửa hang dung nham, đá nổi | Cùng góc nhìn và nét vẽ với bốn đảo còn lại |
| `island-light-v2.webp` | Đền mặt trời, cây vàng, mây quanh chân đảo | Phân biệt mây thuộc đảo và nền trời |
| `island-dark-v2.webp` | Hang trăng khuyết, cây tím, pha lê | Giữ sắc tím sáng, không đổi sang dark fantasy |
| `island-lock-v1.webp` | Khóa vàng pha lê hiện có | Dùng lại, đặt độc lập gần cửa vào |

Đây là sáu ảnh mới bắt buộc: một nền và năm đảo. Không cần tạo năm ảnh hover khác: hiệu ứng được áp dụng lên cùng một ảnh để hình đảo không thay đổi giữa hai trạng thái.

Quy trình tạo asset:

1. Dùng tranh sạch hiện có làm tham chiếu trực tiếp về hình dáng, màu, ánh sáng và góc nhìn. Không lấy ảnh màn hình có chữ làm ảnh cắt cuối cùng.
2. Tách/phục dựng từng đảo bằng công cụ tạo và chỉnh ảnh với nền trong suốt. Một số phần rìa của đảo Thiên nhiên/Bóng tối bị cắt trong tranh hiện tại; phải vẽ nối đủ hình, không chỉ cắt hình chữ nhật.
3. Tạo nền trời riêng, không còn hình bóng của năm đảo cũ. Nếu giữ nguyên nền ghép, đảo di chuyển sẽ để lộ một bản sao phía sau.
4. Lưu PNG gốc có alpha và WebP dùng trong giao diện; dự kiến bản lớn cạnh 1024 px và bản nhỏ 512 px, điều chỉnh theo kích thước hiển thị thực tế. Chừa khoảng trống cho viền sáng/bóng, không cắt sát thác hoặc tán cây.
5. Kiểm tra viền trên nền sáng/tối: không có nền caro giả, viền xanh trời còn sót, phần đảo bị mất hoặc ánh sáng lệch nhau. Không vẽ chữ, khóa, đường nối hoặc khung UI vào ảnh đảo.

## 3. Các lớp của màn thế giới

Từ sau ra trước: nền trời → đường nối hành trình → các đảo riêng → khóa/sương theo đảo → bảng tên → thanh trên/nút Continue/linh thú.

- Đảo, khóa và bảng tên dùng chung vị trí; khi đảo nổi lên, chúng di chuyển cùng nhau.
- Đường nối vẽ riêng, mảnh và dịu. Khi hover, vẫn giữ đường nối ổn định; khoảng nâng nhỏ không gây cảm giác đứt đường. Khi đổi bố cục màn hình, đường nối cập nhật theo vị trí đảo.
- Khu vực tương tác bám hình dáng chính của đảo và bảng tên; không dùng toàn bộ hình chữ nhật trong suốt làm vùng bấm che mất đảo lân cận.
- Bầu trời giữa các đảo không kích hoạt hover. Sương, khóa trang trí và đường nối không chặn sự kiện của đảo.
- Vùng nhận chuột ổn định; chỉ lớp hình ảnh di chuyển để tránh hover bật/tắt liên tục ở mép.
- Dành đủ khoảng trống quanh đảo để phóng nhẹ không chạm bảng tên bên cạnh, thanh trên hoặc mép màn hình.

## 4. Hover, focus và bấm

Các thông số dưới đây là điểm xuất phát để tinh chỉnh trên bản dựng.

| Trạng thái | Phản hồi hình ảnh | Khi bấm |
| --- | --- | --- |
| Đảo mở | Nâng 6–8 px, phóng khoảng 1.025 lần, sáng nhẹ viền theo nguyên tố, bóng mềm hơn; chuyển trong 180–220 ms | Vào bản đồ 10 thử thách |
| Đảo đang chơi | Có dấu chỉ nhỏ lúc đứng yên; hover giống đảo mở | Vào vùng hiện tại |
| Đảo khóa | Nâng nhẹ khoảng 3 px, bảng tên sáng nhẹ, khóa vẫn rõ; không dùng hào quang của đảo mở | Mở bảng điều kiện khóa hiện có |
| Đảo hoàn thành | Giữ dấu ✓; hover giống đảo mở | Xem lại vùng |
| Nhấn giữ | Co nhẹ rồi trở về trạng thái trước | Chỉ thực hiện khi kết thúc thao tác bấm hợp lệ |

- Hiệu ứng tác động lên cả hình đảo, không chỉ bảng tên. Không rung mạnh, nháy sáng hoặc cho cả năm đảo bay liên tục.
- Rê chuột không làm xuất hiện đoạn mô tả dài. Tên và trạng thái cần thiết luôn nhìn thấy.
- Khi dùng Tab: hiện viền focus rõ trên đảo/bảng tên; Enter/Space thực hiện cùng hành vi như click. Mỗi đảo là một điểm dừng bàn phím, không tách khóa thành một điểm dừng trùng lặp.
- Chế độ giảm chuyển động bỏ nâng/phóng, giữ viền nhận biết. Rời hover/focus trả đúng trạng thái ban đầu.
- Điều kiện khóa, Go to boss/Continue, đóng dialog và View preview chỉ trong chế độ phát triển giữ nguyên hành vi đã triển khai. Hiệu ứng không làm thay đổi tiến trình.

## 5. Desktop, tablet và điện thoại

- Desktop: giữ bố cục năm đảo như ảnh; ưu tiên thấy cả hành trình và nút Continue trong màn hình phổ biến. Nền có thể kéo rộng, nhưng không cắt mất thân đảo chính để lấp màn hình.
- Tablet: co và dịch từng đảo bằng cấu hình bố cục riêng, không thu nhỏ toàn bộ chữ theo tranh; khoảng cách tối thiểu phải đủ để phân biệt vùng bấm.
- Điện thoại: chuyển thành hành trình dọc với đảo nổi so le trên cùng bầu trời, theo thứ tự Thiên nhiên → Nước → Lửa → Ánh sáng → Bóng tối. Không chuyển thành danh sách thẻ chữ nhật như bản mobile hiện tại.
- Chạm đảo là mở vùng/bảng khóa ngay; không yêu cầu chạm lần đầu để giả lập hover. Cuộn trang không kích hoạt đảo và không giữ lại trạng thái hover sau khi chạm.
- Nút Continue luôn dễ tiếp cận trên mobile, có khoảng đệm cuối bản đồ nếu đặt cố định để không che đảo cuối. Nhãn/điểm chạm tối thiểu 48 px, không giấu thông tin thiết yếu sau hover.

## 6. Thứ tự triển khai

1. **Làm nền và đảo Thiên nhiên trước:** dựng mẫu trên bố cục tham chiếu, kiểm tra nét vẽ, độ trong suốt và hover cả đảo. Hoàn thiện mẫu này trước khi làm bốn đảo còn lại để giảm sai khác phong cách.
2. **Hoàn thiện bộ năm đảo:** đồng bộ góc nhìn, ánh sáng, độ chi tiết và tỷ lệ; kiểm tra các góc bị khuất trong ảnh gốc đã được phục dựng.
3. **Ghép màn thế giới:** thay ảnh nền ghép, đặt từng đảo, khóa, bảng tên và đường nối; phục hồi thanh logo gọn theo ảnh tham chiếu.
4. **Gắn tương tác:** hover/focus/nhấn, vùng bấm theo hình, giữ điều hướng/khóa hiện có. Dùng cấu trúc giao diện hiện tại; chưa cần đổi bộ máy hiển thị game chỉ để làm hover.
5. **Hoàn thiện mobile và kiểm tra:** hành trình dọc, thao tác chạm/cuộn, ảnh nhỏ phù hợp màn hình; tối ưu dung lượng và chụp lại các trạng thái.

Điểm chỉnh chính khi triển khai: `campaign.ts` cho lớp đảo và điều hướng, CSS màn thế giới cho bố cục/tương tác; dữ liệu bố cục đảo nên có cấu hình riêng cho vị trí, kích thước, điểm đặt khóa/bảng tên và vùng bấm, không dùng lại tọa độ bảng tên làm tâm đảo. Giữ cấu trúc năm vùng và thử thách trong `realms.ts`.

## 7. Điều kiện hoàn thành

- Nhìn vào vẫn nhận ra bố cục và phong cách của ảnh tham chiếu; mặc định chỉ còn logo, tên năm đảo, tiến trình cần thiết, Preview và một nút Continue.
- Hover lên hình đảo hoặc bảng tên đều phản hồi đúng một đảo; trời trống không phản hồi, vùng trong suốt không chắn nhau.
- Khi đảo nâng lên không lộ bản sao nền, không hở phần bị cắt, không cắt mất viền sáng và không đè lên đảo khác.
- Khóa rõ nhưng không che tên; đảo khóa vẫn có màu sắc riêng. Vào đảo bằng click, bàn phím, tab hoặc URL giữ đúng điều kiện mở.
- Kiểm tra ít nhất 360/390/768/1024/1440 px và màn desktop thấp; chữ không tràn, bảng tên không chồng, Continue không che nội dung.
- Kiểm tra chuột, bàn phím, chạm/cuộn và giảm chuyển động; hover không bị kẹt sau chạm hoặc rung ở mép.
- Chỉ dùng ảnh cần thiết cho màn thế giới, giữ kích thước ảnh cố định khi tải để không nhảy bố cục. Đặt mục tiêu bộ ảnh thế giới mới khoảng 3 MB trở xuống nếu vẫn giữ được chất lượng, đo lại khi có asset thật.
- Build và các kiểm tra điều hướng/khóa hiện có đạt; bổ sung kiểm tra vùng tương tác, bố cục đảo và phản hồi trên thiết bị cảm ứng. Kiểm tra trực quan cần đi cùng kiểm tra tự động.

Kế hoạch này bổ sung [bản giảm chữ đã triển khai](PVE_MINIMAL_UI_PLAN.md): giữ phần giảm chữ/khóa và thay cách trình bày thế giới từ ảnh ghép sang các đảo nổi độc lập.

## Đã triển khai — 15/11/2026

- Tạo nền trời sạch và năm đảo RGBA độc lập bằng công cụ tạo ảnh tích hợp, dùng world.webp làm tham chiếu. Giữ PNG master và WebP trong `apps/game-client/public/art/campaign/`; các đảo có bản nhỏ 512 px và bản lớn 1024 px. Tổng 11 WebP mới: 2.164.218 byte, trình duyệt chỉ tải biến thể phù hợp.
- Màn thế giới dùng logo GEMORA, bảng tên ngắn, khóa riêng, đường nối riêng và một Continue. Vùng nhận chuột dùng đa giác ổn định; lớp hình đảo, tên và khóa chuyển động cùng nhau. Không còn hình đảo cũ trong nền.
- Mobile dùng hành trình đảo nổi so le, nút Continue cố định và khoảng đệm cuối trang. Lớp nền mờ dần để đảo nhà trang trí không phóng lớn sau đảo cuối.
- Hover chỉ áp dụng với chuột, có focus bàn phím và giảm chuyển động. Điều kiện khóa và cấu trúc 5 × 10 giữ nguyên.
- Build/lint/TypeScript và 8 bài kiểm tra trình duyệt đạt: 6 kiểm tra PvE (bao gồm hover/vùng trời trống/giảm chuyển động/cảm ứng), 2 kiểm tra luồng người chơi. Đã xem ảnh chụp desktop và mobile. Chưa playtest với người chơi ngoài nhóm.
- Ảnh: [desktop](previews/pve-islands-world-desktop.png), [hover](previews/pve-islands-hover-desktop.png), [mobile](previews/pve-islands-world-mobile.png).

### Asset provenance và prompt

Tạo bằng built-in image_gen, transparent_background=true cho năm đảo, false cho nền. Không dùng API/CLI riêng. Mỗi đảo được tạo bằng một lượt riêng, tham chiếu cùng tranh world.webp. Đầu ra gốc được sao chép vào workspace trước khi mã hóa WebP; chỉ đổi kích thước/định dạng, giữ alpha.

Prompt Thiên nhiên: Extract and faithfully reconstruct ONLY the lower-left emerald NATURE floating island as one independent game asset. Crystal tree, nest, green foliage, small falls, entire tapered floating rock base. Preserve EXACT illustrated cartoon style, colors, detail and isometric perspective of reference. Complete any cut-off edges. Center full island filling 90% square canvas with margin, genuine transparent background. No sky, clouds outside island, other islands, connecting dots, text, UI, frame, ground shadow. Keep whole island fully visible.

Prompt chung cho bốn đảo còn lại: Extract and faithfully reconstruct ONLY the {description} island from reference as one independent game asset. Preserve exact colorful illustrated cartoon style, colors, isometric angle and detail. Complete cut edges, whole floating rock base visible. Full island centered filling 88% square canvas, 6% transparent margin. Genuine transparent background. NO sky, other islands, connecting dots, text, UI, frames, ground shadow. One complete isolated island.

Descriptions:
- Water: upper left coral cavern, pink coral, turquoise lagoons and waterfalls
- Fire: central volcano, orange lava dragon den, red foliage, tapered rock base
- Light: upper right golden sun temple, golden trees, white marble and clouds attached to its rock base
- Dark: lower right crescent moon dragon cavern, purple trees, lavender crystals and waterfalls

Prompt nền: Edit the reference into a clean BACKGROUND PLATE. Remove ALL FIVE LARGE foreground islands and ALL glowing connecting dots. Reconstruct uninterrupted turquoise sky and soft cream clouds where islands were. Keep only tiny distant hazy decorative islands and the SMALL mint home island bottom center. Same painterly cartoon art style. Wide landscape 3:2. No text, UI, foreground main islands or large objects.

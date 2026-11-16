# PvE — Giảm chữ và thể hiện đảo chưa mở bằng khóa

Ngày lập kế hoạch: 14/11/2026. Đã triển khai UI và tích hợp asset khóa ngày 15/11/2026.

Giữ năm vùng rồng nguyên tố, mỗi vùng 10 thử thách. Giữ tranh nền, rồng, font Lilita One/Nunito và khung gỗ–vàng. Lần sửa này tập trung vào việc nhìn bản đồ, nhận biết trạng thái và chọn điểm đến nhanh hơn.

## 1. Quy tắc thông tin

- Mặc định chỉ hiện **đang ở đâu, đã đi được bao xa và có thể bấm gì**.
- Chi tiết mục tiêu/địch/phần thưởng xuất hiện sau khi chọn thử thách. Điều kiện mở đảo chỉ hiện khi chọn đảo khóa.
- Mỗi thông tin có một chỗ hiển thị; không lặp tên nguyên tố, tiến trình và lời hướng dẫn ở nhiều nơi.
- Giảm lượng chữ bằng cách bỏ nội dung thừa, không thu nhỏ chữ. Tên đảo được xuống tối đa hai dòng trên mobile, không cắt mất tên bằng dấu ba chấm.
- Icon phải có tên hỗ trợ đọc màn hình, tooltip khi dùng chuột và vùng bấm ít nhất 48 × 48 px. Thông tin quan trọng không phụ thuộc hover.

## 2. Bản đồ thế giới

| Thành phần hiện tại | Đề xuất thay thế |
| --- | --- |
| “THE FIVE ELEMENTAL REALMS”, tiêu đề lớn và câu giới thiệu | Một tiêu đề gọn **Adventure** trên thanh trên; bỏ ba dòng nằm đè lên cảnh |
| “5 REALMS · 50 CHALLENGES” | Bỏ khỏi màn chính; giữ trong phần giới thiệu nếu cần |
| “REALM 01 · NATURE” và tên đảo | Chỉ giữ **icon nguyên tố + tên đảo** |
| “CONTINUE” lặp trên thẻ và nút dưới | Một nút chính **Continue** ở dưới màn hình |
| “EXPLORE PREVIEW” ở mọi đảo khóa | Asset khóa trên cảnh; điều kiện mở hiện sau khi bấm |
| `0/10` trên các đảo chưa mở | Ẩn; đảo đã mở mới hiện tiến trình như `3/10` |
| Hai câu chào của rồng đồng hành | Giữ rồng, bỏ bong bóng mặc định; chỉ có lời ngắn trong tutorial lần đầu nếu cần |
| Dải giải thích preview dài | Một chip **Preview** có nút thông tin, đọc được cả bằng click/tap và bàn phím |

Đảo đang chơi: giữ màu tươi, viền/ngọc chỉ đường nhẹ và `3/10`. Đảo đã hoàn thành: dấu ✓ thay dòng mô tả. Đảo chưa mở: khóa lớn tại lối vào, lớp sương nhẹ quanh đảo, tên đảo vẫn nhìn thấy. Không dùng ánh sáng nhấp nháy để thu hút vào đảo khóa.

Giảm thẻ tên xuống một bảng gỗ gọn phía dưới đảo. Khóa và bảng tên là hai lớp riêng, không đặt khóa đè lên chữ. Desktop để cảnh đảo là vùng bấm chính; mobile giữ thẻ cảnh lớn nhưng bỏ nhãn phụ, chỉ còn tên và khóa/tiến trình.

## 3. Asset khóa đã tạo

- **Bản gốc PNG:** `apps/game-client/public/art/campaign/island-lock-v1.png`, 1254 × 1254, nền trong suốt.
- **Bản dùng trên web:** `apps/game-client/public/art/campaign/island-lock-v1.webp`, 256 × 256, khoảng 18 KB, giữ alpha.
- Tạo hình: thân khóa vàng mật ong, viền đồng/nâu, quai đóng rõ, lỗ khóa lớn, pha lê tím và vài mảng vảy rồng. Không có chữ, dây xích hoặc nền.
- Dùng chung cho cả bốn đảo chưa mở; màu nguyên tố vẫn thuộc đảo. Không cần năm bản khóa đổi màu.
- Kích thước hiển thị đề xuất: **80–96 px desktop**, **56–64 px mobile**. Đây là kích thước khung ảnh; phần khóa có khoảng trống trong suốt quanh mép.
- Khóa đặt gần cửa hang/đền/lối vào đảo. Vị trí riêng từng vùng, cùng hệ tọa độ với tranh nền và vùng bấm.
- Có thể thêm bóng đổ nhỏ bằng CSS để tách nền. Không dùng vòng sáng vàng lớn như điểm chơi tiếp.
- Giữ SVG khóa đơn giản hiện có cho dấu nhỏ 16–24 px trong tooltip/tab; asset minh họa mới dành cho khóa lớn trên đảo.

Asset là lớp overlay độc lập, **không vẽ khóa vào tranh nền**. Khi mở vùng chỉ cần bỏ overlay và sương, giữ nguyên cảnh. Tranh thế giới hiện là một ảnh ghép năm đảo: không dùng `filter: grayscale()` trên toàn ảnh vì sẽ làm mờ cả vùng đã mở. Dùng lớp sương/mask cục bộ có tọa độ theo từng đảo; nếu muốn làm xám chính xác từng đảo thì cần tách layer đảo trong một bước asset riêng.

## 4. Hành vi đảo khóa

1. Click/tap/Enter vào đảo khóa mở bảng nhỏ gồm khóa, tên đảo và **một câu điều kiện**. Ví dụ đảo Nước: `Defeat Elderbloom to unlock.`
2. Có một hành động hữu ích **Go to boss**, đưa về thử thách 10 của vùng trước. Nút này chỉ điều hướng, không tự bắt đầu trận; thử thách đó vẫn giữ đúng trạng thái mở/khóa.
3. Nếu vùng trước cũng chưa mở, thay bằng **Continue**, đưa về thử thách kế tiếp hợp lệ trong hành trình.
4. Đóng bằng X/Escape/chạm ngoài bảng, trả focus về đảo vừa chọn.
5. Khi server xác nhận mở vùng: bỏ khóa, sương mờ dần, giữ tên và hiện `0/10`. Giảm chuyển động thì cập nhật ngay. Animation không tự thay đổi tiến trình.

**Phân biệt preview và bản thật:** bản thật không cho vào map chưa mở qua nút đảo, tab hay URL trực tiếp. Bản đang phát triển có thể giữ `View preview` như hành động phụ bên trong bảng khóa để duyệt asset; không hiện lặp trên mọi đảo. Chip Preview phải cho biết tiến trình/thưởng đang là mẫu, không ngầm hứa rằng Continue/Play đã chạy gameplay.

## 5. Bản đồ trong vùng

- Thanh trên: mũi tên về thế giới, **tên vùng + icon**, tiến trình `3/10`.
- Thanh đổi vùng: năm icon nguyên tố; tên chỉ hiện ở vùng đang chọn hoặc trong tooltip. Vùng khóa dùng hành vi bảng khóa như bản đồ thế giới.
- Thử thách thường: **chỉ số 1–10**, bỏ “Challenge 01/02…”. Dấu ✓ thể hiện đã qua, khóa thể hiện chưa mở.
- Elite 4/8: số + huy hiệu hai kiếm. Boss 10: số + chân dung/vương miện. Không cần lặp nhãn “ELITE”, “BOSS”, “FINAL CHALLENGE” ở nhiều vị trí.
- Giữ một dấu chỉ thử thách tiếp theo: rồng đồng hành hoặc vòng sáng; bỏ “UP NEXT” nếu dấu chỉ đã đủ rõ trong thử nghiệm.
- Bỏ hai bảng giới thiệu rồng/boss bên trái/phải mặc định. Đưa chân dung và tên địch vào bảng thông tin thử thách để cảnh map có thêm diện tích.
- Bỏ câu “Scroll to explore · Select a challenge”. Có thể hướng dẫn một lần khi người chơi mới vào map.
- Nút tìm màn hiện tại dùng biểu tượng định vị với tên truy cập “Current challenge”; giữ vùng chạm đủ lớn.

## 6. Bảng thông tin thử thách

Giữ **tên thử thách**, chân dung rồng, icon nguyên tố, phần thưởng bằng icon + số, ba ô đội hình và một nút chính. Chỉ giữ một câu mục tiêu nếu có luật đặc biệt; bỏ câu chung kiểu “Match gems and lead your party…” trên mọi màn.

Địch elite/boss vẫn có tên/cấp rõ trong bảng này. Các icon tài nguyên có tên khi tương tác và cho trình đọc màn hình; không để người chơi phải đoán icon mới.

Chưa có đội hình/API chiến đấu: một dòng `Battles coming soon` là đủ ở vị trí hành động. Giữ Play vô hiệu hóa và chip Preview, không thêm nhiều dòng cảnh báo giống nhau ở đầu/cuối bảng. Thưởng lần đầu chỉ hiện nhãn ngắn `First clear` và trạng thái đã nhận khi có dữ liệu tương ứng.

## 7. Thứ tự triển khai tiếp theo

1. Dựng mockup thế giới ít chữ trên tranh hiện có, đặt khóa tại bốn đảo chưa mở; so sánh desktop/mobile với bản hiện tại.
2. Thu gọn markup và CSS của world/region/dialog theo bảng trên; giữ nhãn trợ năng.
3. Tích hợp asset khóa và sương cục bộ, xử lý bảng điều kiện mở; áp dụng nhất quán cho đảo, tab và đường dẫn.
4. Rà các trạng thái: mới chơi, đang chơi, vùng kế tiếp khóa, nhiều vùng còn khóa, hoàn thành 50 thử thách, preview và giảm chuyển động.
5. Chụp lại ở 360, 390, 768 và 1440 px; thử với người chưa xem bản đồ để kiểm tra họ có nhận ra đảo mở và bước tiếp theo hay không.

## 8. Tiêu chí hoàn thành

- Màn thế giới mặc định chỉ có một tiêu đề, năm tên đảo, tiến trình của đảo mở và một nút Continue; không còn slogan hay mô tả lặp.
- Khóa nhận ra được ở 56 px, không che tên/lối tương tác; đảo khóa vẫn giữ bản sắc nguyên tố.
- Không thay đổi cấu trúc 5 vùng × 10 thử thách hoặc hệ rồng.
- Có thể xác định điểm chơi tiếp, xem lý do khóa và quay lại bằng chuột, touch và bàn phím.
- Giảm chữ nhưng không giấu điều kiện mở, tên tài nguyên hay trạng thái preview cần thiết.
- Chỉ bỏ khóa sau khi có trạng thái hợp lệ; không thể đi vòng khóa bằng tab/URL ở luồng thật.

## 9. Kết quả triển khai — 15/11/2026

- World: bỏ slogan, mô tả và số đếm lặp; giữ Adventure, tên đảo, tiến trình đảo mở và Continue. Bốn đảo khóa dùng WebP nền trong suốt cùng sương cục bộ; mobile dùng thẻ cảnh và khóa 64 px.
- Region: giữ 10 nút số, biểu tượng elite/boss và linh thú ở thử thách hiện tại; bỏ hai bảng mô tả hai bên. Bản đồ có thêm diện tích, tab nguyên tố gọn và nút quay về thử thách hiện tại.
- Dialog: thưởng bằng icon + số, bấm để xem tên tài nguyên; ba ô đội hình, nút hành động vô hiệu hóa và một dòng Battles coming soon. Chip Preview giải thích dữ liệu mẫu khi bấm.
- Đảo/tab khóa mở bảng điều kiện. Go to boss đưa đến thử thách 10 của vùng trước nếu vùng đó đã mở; nếu chưa, Continue đưa về thử thách hiện tại. Escape, nút đóng và nền ngoài dialog đóng bảng, trả focus.
- Luồng tài khoản không hiển thị View preview và không vào vùng khóa qua URL/tab. Dev `?preview=campaign` cho xem tranh vùng khóa sau khi chọn View preview trong dialog. Đây vẫn là kiểm soát giao diện dựa trên tiến trình mẫu, chưa phải quyền truy cập gameplay từ máy chủ.
- Đã đạt build/lint/TypeScript và 6 kiểm tra trình duyệt (4 PvE, 2 luồng người chơi). Kiểm tra 50 thử thách, điều hướng/lịch sử/cuộn, khóa/URL, focus, phần thưởng và không tràn ngang ở 360/390/768/1440 px. Đã xem ảnh chụp desktop/mobile; chưa thực hiện playtest với người chơi mới.
- Ảnh mới tại [thư mục preview](previews/README.md). Tiến trình thật, lưu phần thưởng và chiến đấu chưa nằm trong phạm vi triển khai này.

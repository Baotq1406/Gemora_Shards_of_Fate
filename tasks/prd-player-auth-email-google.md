# PRD — Đăng ký email, đăng nhập mật khẩu và Google cho người chơi

Ngày: 04/11/2026. Trạng thái: **kế hoạch triển khai**, chưa sửa schema, chạy migration mới hoặc viết API auth trong lần lập kế hoạch này.

**Tiến độ triển khai database 04/11/2026:** đã thêm AuthIdentity, AuthProvider GOOGLE,
cho phép User.passwordHash NULL và áp dụng migration mới vào gemora_dev. Build đạt,
12/12 test tích hợp đạt; đã kiểm chứng nâng cấp giữ dữ liệu cũ và dựng DB sạch.
Phần database trong mục 4 đã triển khai.

**Tiến độ API 05/11/2026:** đã có register/login/me/logout, Google start/callback/link và proxy cho game-client. Kiểm thử HTTP với database riêng và xác minh chữ ký Google bằng khóa thử đã đạt. Giao diện đang chờ nối API. Xác minh Google thật cần OAuth client của dự án. Xem [hướng dẫn cấu hình và thử API](../docs/AUTH_SETUP.md).

Kế hoạch này thay thế phạm vi auth trong [kế hoạch trước](prd-auth-and-database-migrations.md). Google nằm trong đợt đầu theo yêu cầu mới. Các mục JWT/access-refresh token và Google ở giai đoạn sau trong tài liệu tổng thể không áp dụng cho đợt auth này.

## 1. Mục tiêu và hiện trạng

Người chơi có thể tự đăng ký bằng email/mật khẩu hoặc chọn Google để vào Gemora. Cả hai cách đều dùng User/PlayerProfile của Gemora và cùng một cơ chế phiên; đăng nhập nhiều trình duyệt không tạo các bản dữ liệu game riêng.

Đã có: backend NestJS, PostgreSQL local, Prisma 7.10.1, migration User/PlayerProfile/AuthSession, health API và kiểm thử database. Popup login/register và nút Google hiện vẫn là prototype. Chưa có API auth, Google OAuth hoặc kiểm tra phiên thật.

Giả định triển khai: web cho người chơi, một backend, dùng UI hiện có; cookie phiên thay cho JWT access/refresh trong đợt này. Tài khoản mới mặc định PLAYER; không có lựa chọn đăng ký ADMIN.

## 2. Phạm vi và hành vi sản phẩm

| Chức năng | Hành vi trong đợt này |
|---|---|
| Đăng ký riêng | Nhập tên hiển thị, email, mật khẩu, xác nhận mật khẩu. Thành công chuyển về form đăng nhập và điền sẵn email. |
| Đăng nhập email | Nhập email/mật khẩu đúng thì tạo phiên Gemora và vào màn chào sau đăng nhập. |
| Tiếp tục với Google | Chuyển tới Google để chọn tài khoản; quay lại Gemora và vào màn chào. Lần đầu tự tạo User/Profile, không buộc nhập thêm mật khẩu hoặc điền lại form đăng ký. |
| Google đã liên kết | Tìm đúng User qua danh tính Google và tạo phiên mới, không tạo hồ sơ thứ hai. |
| Email Google trùng tài khoản local | Không tự gộp; hướng dẫn đăng nhập tài khoản Gemora hiện có, xác nhận mật khẩu và chọn liên kết Google. |
| Liên kết Google | Tài khoản local đã đăng nhập có thể xác nhận liên kết một tài khoản Google cùng email; sau đó hai cách đăng nhập dùng cùng User. |
| Giữ phiên | Tải lại trang, đóng/mở trình duyệt trong hạn hoặc khởi động lại backend vẫn nhận diện phiên còn hiệu lực. |
| Nhiều trình duyệt | Chrome và Brave có phiên riêng; hồ sơ được lấy từ cùng backend/database. |
| Đăng xuất | Thu hồi phiên hiện tại và xóa cookie; phiên trình duyệt khác còn hiệu lực. |

Không làm trong đợt này: gameplay/cấp hero, đăng ký quản trị, One Tap tự bật, chỉnh tên/avatar, giao diện quản lý toàn bộ thiết bị, logout tất cả, unlink Google, đặt mật khẩu cho tài khoản chỉ Google, MFA. Xác minh email local và quên mật khẩu là đợt tiếp theo trước phát hành công khai; đợt hiện tại nghiệm thu trên môi trường phát triển/test.

## 3. Các luồng cần hoàn thành

### 3.1. Đăng ký bằng email và đăng nhập

1. UI kiểm tra nhanh trường nhập; backend kiểm tra lại toàn bộ dữ liệu.
2. Email được trim/lowercase theo chính sách sản phẩm; không trim hoặc tự cắt mật khẩu. Không tự loại dấu chấm hay phần + của địa chỉ Gmail.
3. Đề xuất tên hiển thị 2–50 ký tự sau trim; mật khẩu 15–128 ký tự, chấp nhận khoảng trắng; cập nhật thông báo UI cho thống nhất.
4. Băm mật khẩu bằng Argon2id. Tạo User và PlayerProfile trong một transaction; role PLAYER, status ACTIVE do server đặt.
5. Email trùng được xử lý bằng unique constraint và thông báo phù hợp; không ghi đè mật khẩu hoặc tài khoản Google đã tồn tại.
6. Đăng nhập đúng tạo AuthSession mới; sai email/mật khẩu trả cùng một thông báo. Tài khoản passwordHash NULL không đăng nhập bằng mật khẩu được.
7. Trang sau đăng nhập chỉ cần tên, email, phương thức đã liên kết và nút đăng xuất; chưa cần Home gameplay.

### 3.2. Google lần đầu và quay lại

Đề xuất dùng OpenID Connect với authorization-code flow do backend xử lý, chuyển trang trong cùng tab; cấu hình thư viện hỗ trợ PKCE S256, state và nonce. Dùng thư viện được duy trì thay vì tự viết phần xác minh JWT. Tham khảo [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect).

1. Người chơi bấm Tiếp tục với Google; backend tạo yêu cầu xác thực ngắn hạn gắn với trình duyệt và chuyển sang Google.
2. Callback được kiểm tra tính hợp lệ; backend đổi authorization code và xác minh ID token, gồm chữ ký, issuer, audience, thời hạn, nonce và email_verified. Yêu cầu email hợp lệ cho tạo tài khoản mới.
3. Tìm AuthIdentity bằng provider GOOGLE và providerSubject từ claim sub. Nếu có, dùng User đã liên kết và kiểm tra status.
4. Nếu chưa có identity và email chưa tồn tại, tạo User với passwordHash NULL, PlayerProfile, AuthIdentity và AuthSession trong một transaction. Tên hiển thị lấy từ thông tin Google sau kiểm tra độ dài; nếu thiếu dùng tên mặc định hợp lệ. Không tải ảnh hoặc cấp nội dung game ở bước này.
5. Nếu email đã tồn tại nhưng identity chưa liên kết, không cấp phiên của tài khoản đó. Trả người dùng về luồng xác nhận liên kết ở mục 3.3.
6. Thành công đặt cookie phiên Gemora và chuyển về một đường dẫn nội bộ cố định. Những lần sau không ghi đè tên người chơi hoặc email Gemora bằng dữ liệu Google mới.

Google khuyến nghị dùng sub làm định danh ổn định, không dùng email để định danh Google. Backend phải xác minh ID token trước khi tin thông tin người dùng. [Google: xác minh ID token](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token)

Nếu người chơi hủy, callback hết hạn, Google không phản hồi hoặc dữ liệu xác minh sai: không tạo tài khoản/phiên một phần, hiển thị thông báo và cho thử lại. Lỗi này không làm ngừng đăng nhập email.

### 3.3. Liên kết Google với tài khoản đã có

Đây là chính sách của Gemora: không gộp tự động chỉ vì hai email giống nhau.

- Người dùng đăng nhập tài khoản local, vào phần Tài khoản và bấm Liên kết Google, nhập lại mật khẩu hiện tại.
- Backend lưu ý định LINK gắn với userId và phiên hiện tại, hết hạn sau 5 phút; sau đó chạy một lượt xác thực Google mới.
- Callback LINK phải còn đúng phiên/người đã bắt đầu, có bằng chứng xác thực lại, và Google trả email đã xác minh khớp email tài khoản trong MVP. Không nhận target userId tùy ý từ client.
- Identity đã thuộc User khác thì từ chối; không chuyển identity giữa các User. User đã có Google khác cũng bị từ chối theo giới hạn một Google/User của đợt này.
- Transaction thêm AuthIdentity và thay phiên hiện tại bằng phiên mới; giữ nguyên User.id, PlayerProfile và các phiên khác. Liên kết cùng identity đã có thì xử lý idempotent.
- Google-only account trùng email khi người dùng cố đăng ký local không được tự gắn mật khẩu. Hướng dẫn dùng phương thức đã có; đặt mật khẩu là tính năng riêng sau này.

Trường hợp Chrome dùng mật khẩu, Brave dùng Google chỉ vào cùng User **sau khi đã liên kết**. Trước đó Brave nhận hướng dẫn liên kết, không âm thầm tạo User trùng email. Với Google đã liên kết mà email phía Google đổi, tra cứu vẫn bằng sub; không tự đổi email Gemora hoặc liên kết sang User khác.

### 3.4. Giữ phiên và đồng bộ Chrome/Brave

Mỗi đăng nhập tạo token ngẫu nhiên ít nhất 32 byte; database lưu SHA-256 dạng hex trong tokenHash. Cookie riêng của mỗi trình duyệt dùng HttpOnly, SameSite=Lax, Secure trên HTTPS, thời hạn đề xuất 7 ngày, cấu hình được. Không lưu token phiên trong localStorage.

Backend kiểm tra phiên tồn tại, chưa bị thu hồi, chưa hết hạn và User ACTIVE trên từng API bảo vệ. Logout kết thúc phiên Gemora, không đăng xuất tài khoản Google toàn trình duyệt. Việc Google thu hồi quyền ứng dụng không tự thu hồi các phiên Gemora đã cấp nếu chưa triển khai thông báo tương ứng.

Client gọi GET /auth/me khi mở/tải lại trang và khi tab trở lại hiển thị, có debounce và chỉ một request đang chạy. Không hiển thị dữ liệu cũ của người trước khi chuyển tài khoản; bỏ qua response đến muộn thuộc phiên cũ. Nhận 401 thì xóa trạng thái đăng nhập trong UI; lỗi mạng không coi là logout thành công. Response auth dùng Cache-Control: no-store.

Chưa dùng WebSocket/SSE. Lấy lại dữ liệu khi quay lại tab hoặc tải trang đủ cho phạm vi auth; đồng bộ gameplay và xử lý cập nhật đồng thời là thiết kế tiếp theo. Chưa có API sửa hồ sơ trong đợt này, nên kiểm chứng đồng bộ bằng fixture thay đổi có kiểm soát trên database test.

## 4. Database dự kiến thay đổi

Đây là **thiết kế đề xuất cho migration mới**, không phải schema đã triển khai. ERD trong docs/diagrams hiện vẫn mô tả ba bảng đang có.

| Thành phần | Thay đổi | Lý do |
|---|---|---|
| User.passwordHash | Cho phép NULL | Người chỉ dùng Google không có mật khẩu Gemora; không đặt mật khẩu giả hoặc mật khẩu chung |
| User.normalizedEmail | Giữ UNIQUE/NOT NULL | Chính sách một tài khoản Gemora cho mỗi email đã chuẩn hóa trong MVP |
| PlayerProfile | Giữ nguyên | Cả hai cách đăng nhập dùng cùng hồ sơ |
| AuthSession | Giữ nguyên | Cơ chế phiên Gemora dùng chung, không cần Google access token để gọi API game |
| AuthIdentity | Thêm bảng mới | Liên kết định danh Google ổn định với User |

Các trường AuthIdentity đề xuất:

| Trường | Kiểu / ràng buộc | Vai trò |
|---|---|---|
| id | UUID, PK | Mã liên kết |
| userId | UUID, NOT NULL, FK tới User.id, cascade khi xóa User | Chủ tài khoản Gemora |
| provider | Enum, hiện chỉ GOOGLE | Nguồn xác thực |
| providerSubject | TEXT, NOT NULL | Giá trị sub của Google, không phải email |
| createdAt | TIMESTAMPTZ(3), default now() | Thời điểm liên kết |

Unique(provider, providerSubject) chặn một Google thuộc nhiều User; unique(userId, provider) giới hạn một Google/User trong đợt này. User có 0..1 AuthIdentity GOOGLE; mỗi identity thuộc đúng một User. Tài khoản local có thể có cả passwordHash và Google identity. Khi passwordHash NULL, transaction tạo tài khoản bắt buộc tạo identity cùng lúc; invariant xuyên bảng này do backend bảo đảm, không phải FK tự bảo đảm.

Không lưu Google access/refresh token lâu dài vì chỉ cần xác thực danh tính. Nếu sau này cần quyền Google API, thiết kế riêng. Thông tin email Google không được dùng như bằng chứng tổng quát để reset mật khẩu hoặc tự gộp tài khoản; đặc biệt email bên thứ ba có thể đổi chủ.

Migration mới phải giữ toàn bộ dữ liệu hiện có, không sửa migration init_auth. Thử trên database trống qua toàn bộ lịch sử và trên database có tài khoản/phiên. Bắt unique violation khi đăng ký hoặc callback đồng thời; đọc lại identity đã được commit nếu đúng cùng provider/sub, không tạo tài khoản rác hoặc bỏ qua chính sách liên kết.

## 5. API dự kiến

Prefix chung: `/api/v1`. Các route dưới đây chưa tồn tại.

| Method | Route | Chức năng |
|---|---|---|
| POST | /auth/register | Tạo tài khoản email và hồ sơ, chưa tự đăng nhập |
| POST | /auth/login | Kiểm tra mật khẩu, tạo phiên Gemora |
| GET | /auth/me | Trả thông tin công khai và phương thức đã liên kết của tài khoản hiện tại |
| POST | /auth/logout | Thu hồi phiên hiện tại, xóa cookie; gọi lặp vẫn thành công |
| GET | /auth/google/start | Khởi tạo ý định LOGIN và chuyển sang Google |
| GET | /auth/google/callback | Xử lý kết quả Google theo ý định đã lưu ở server |
| POST | /auth/google/link | Kiểm tra phiên/mật khẩu lại, tạo ý định LINK và trả URL chuyển hướng Google |

Hợp đồng DTO công khai nằm trong shared-types. Không trả passwordHash, tokenHash, secret, stack trace hoặc ORM entity nguyên bản. Không có /auth/refresh trong thiết kế cookie session này. Quản trị vẫn là role do backend kiểm soát; không cấp quyền ADMIN từ email Google, tên miền email hay dữ liệu form.

## 6. Giao diện

- Giữ popup login/register và nút Tiếp tục với Google ở cả hai tab; nút Google mở chuyển trang thật, không báo thành công giả lập.
- Cập nhật loading, lỗi từng trường, lỗi chung và trạng thái hủy Google; nút đóng/ESC/focus bàn phím hoạt động như hiện tại.
- Không ghi lại mật khẩu vào localStorage, URL, log hoặc giữ lại khi đổi tab form.
- Sau login, đóng popup và hiển thị màn tài khoản tối thiểu có tên, email, trạng thái đã liên kết Google và nút logout. Với tài khoản local chưa liên kết, có thao tác Liên kết Google và xác nhận mật khẩu.
- Khi callback thất bại, trở về màn đăng nhập với thông báo ngắn đã ánh xạ; không đưa token hay thông tin lỗi thô vào URL.
- Khi cấu hình Google thiếu, nút thể hiện chưa sẵn sàng; chưa được nghiệm thu tính năng Google. Nút dùng tài sản/nhãn theo [hướng dẫn thương hiệu Google](https://developers.google.com/identity/branding-guidelines).

## 7. Cấu hình Google và môi trường kiểm thử

Chuẩn bị Google Cloud project, cấu hình thông tin ứng dụng/đối tượng sử dụng và OAuth client loại Web application. Khai báo callback chính xác; cấu hình người thử phù hợp với trạng thái ứng dụng trong Google Auth Platform. Secret chỉ đặt ở môi trường backend.

Biến dự kiến trong .env.example: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, APP_ORIGIN, SESSION_TTL_DAYS. .env thật không commit; không đưa secret vào biến VITE_. Giới hạn scope ở openid/email/profile; không xin quyền Drive/Gmail hoặc offline access.

Đề xuất một origin cho UI và /api qua Vite proxy khi dev, reverse proxy khi triển khai. Callback local đi qua cùng origin, ví dụ `http://localhost:5173/api/v1/auth/google/callback` (cần xác minh port cấu hình khi triển khai). Không xây callback từ Host header không tin cậy hoặc nhận returnTo URL tùy ý.

Google yêu cầu callback khớp cấu hình; HTTPS có ngoại lệ localhost và IP thô chỉ có ngoại lệ loopback. Vì vậy máy thứ hai truy cập `http://192.168.x.x` không dùng trực tiếp callback đó cho Google. [Google: yêu cầu redirect URI](https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation)

Lộ trình test: Chrome/Brave trên máy phát triển dùng localhost; email/password có thể thử LAN. Muốn Google trên hai máy dùng chung backend, chuẩn bị một origin HTTPS có hostname hợp lệ (môi trường test hoặc tunnel được cấu hình), đăng ký đúng callback và chạy UI/API qua cùng origin. Việc tạo dịch vụ/tunnel sẽ xử lý khi triển khai, không tự mở cổng Internet trong bước lập kế hoạch.

## 8. Các yêu cầu bảo vệ và vận hành

- FR-1: Mọi dữ liệu form được kiểm tra phía server; role/status không được nhận từ payload đăng ký.
- FR-2: Rate limit login/register và khởi tạo/callback/link Google; thông báo đăng nhập sai không phân biệt email có tồn tại. Không log password, cookie, code, ID token hoặc URL chứa secret.
- FR-3: Chống CSRF cho yêu cầu thay đổi dữ liệu bằng kiểm tra Origin và token phù hợp; cùng-origin proxy, không bật CORS wildcard với credentials. OAuth callback dùng state/nonce/browser binding riêng.
- FR-4: OAuth attempt có TTL 5 phút, một lần dùng, chứa intent và PKCE verifier ở server; state gắn cookie HttpOnly ngắn hạn của trình duyệt. Khi tiêu thụ phải atomic để chống callback lặp. Với một backend ban đầu có thể dùng store trong RAM giới hạn kích thước và dọn TTL; restart làm lượt Google đang dở yêu cầu thử lại, nhưng không mất các phiên Gemora trong DB. Trước khi chạy nhiều instance phải chuyển attempt store sang kho dùng chung.
- FR-5: Phiên mới được tạo sau xác thực, không tái sử dụng token do client chọn. Logout thực sự revoke phía server. Dọn phiên/attempt hết hạn định kỳ.
- FR-6: Không gọi mạng Google trong transaction giữ khóa DB. Sau khi xác minh mới mở transaction ngắn để ghi User/Profile/Identity/Session và xử lý tranh chấp unique.
- FR-7: Không bật TLS Secure cookie trên HTTP LAN rồi giả định cookie sẽ hoạt động; cấu hình dev và HTTPS phải được kiểm thử riêng. Production bắt buộc HTTPS.
- FR-8: Cùng một tài khoản có thể có nhiều phiên. Một phiên hết hạn/thu hồi không tự ảnh hưởng phiên khác; User LOCKED chặn cả local login, Google login và API dùng phiên cũ.

## 9. User stories và tiêu chí nghiệm thu

### US-01 — Mở rộng dữ liệu cho Google
Là thành viên nhóm, tôi muốn migration mới cho phép Google-only account mà giữ nguyên dữ liệu hiện có.
- [ ] Migration thêm AuthIdentity và nullable passwordHash; constraints và cascade đúng mục 4.
- [ ] Tài khoản/phiên cũ còn nguyên; apply lần hai không đổi dữ liệu; toàn bộ lịch sử dựng được DB sạch.
- [ ] Prisma generate, schema validation và typecheck đạt.

### US-02 — Đăng ký tài khoản riêng
Là người chơi, tôi muốn tạo tài khoản bằng email và mật khẩu.
- [ ] Form gọi API thật; tên/email/mật khẩu không hợp lệ bị từ chối; role không tự nâng được.
- [ ] Hai yêu cầu đăng ký cùng email chỉ tạo một User/Profile; lỗi transaction không để lại dữ liệu một phần.
- [ ] Hash mật khẩu không bằng mật khẩu gốc; đăng ký thành công về form login với email đã nhập.
- [ ] Typecheck/test đạt; verify in browser using dev-browser skill (nếu không khả dụng, dùng công cụ trình duyệt sẵn có).

### US-03 — Đăng nhập local và phiên
Là người chơi, tôi muốn đăng nhập, tải lại trang và đăng xuất được.
- [ ] Đúng mật khẩu vào màn tài khoản; sai hoặc Google-only nhập mật khẩu đều không cấp phiên.
- [ ] Reload và restart backend giữ phiên còn hạn; hết hạn/thu hồi/LOCKED bị chặn.
- [ ] Logout có hiệu lực ở server, lặp lại vẫn thành công; Chrome logout không logout Brave.
- [ ] Typecheck/test đạt; verify in browser using dev-browser skill hoặc công cụ trình duyệt sẵn có.

### US-04 — Đăng nhập ngay bằng Google
Là người chơi, tôi muốn chọn Google mà không tạo mật khẩu Gemora.
- [ ] Người mới tạo đủ User/Profile/Identity/Session; quay lại dùng cùng User.id và hồ sơ.
- [ ] Hủy Google, sai state/nonce/audience/issuer/signature, token hết hạn và thiếu email hợp lệ không cấp phiên.
- [ ] Callback replay/đồng thời không tạo trùng hoặc cấp quyền sai; khóa tài khoản có hiệu lực.
- [ ] Typecheck/test đạt; verify in browser using dev-browser skill hoặc công cụ khả dụng với Google thật trên Chrome và Brave.

### US-05 — Liên kết hai cách đăng nhập
Là người đã có tài khoản Gemora, tôi muốn thêm Google mà giữ nguyên hồ sơ.
- [ ] Email trùng chưa liên kết không tự đăng nhập vào User cũ, không tạo User trùng.
- [ ] Xác nhận lại mật khẩu + Google cùng email hợp lệ mới liên kết; LINK hết hạn hoặc đổi user/session bị từ chối.
- [ ] Không chiếm identity của User khác; local và Google sau liên kết trả cùng User.id.
- [ ] Typecheck/test đạt; verify in browser using dev-browser skill hoặc công cụ trình duyệt sẵn có.

### US-06 — Trải nghiệm nhiều trình duyệt
Là người chơi, tôi muốn Chrome/Brave hiển thị đúng cùng tài khoản, có phiên độc lập.
- [ ] Hai phiên khác nhau đọc cùng hồ sơ; tái lấy /me khi quay lại tab phản ánh fixture hồ sơ mới trên DB test.
- [ ] Không làm lộ hồ sơ người cũ khi logout/login tài khoản khác hoặc response về chậm.
- [ ] Mất mạng hiện trạng thái lỗi/thử lại; 401 đưa về đăng nhập; không đồng bộ token giữa trình duyệt.
- [ ] Typecheck/test và kiểm tra UI trình duyệt đạt.

## 10. Trình tự triển khai

| Mốc | Việc làm | Điều kiện hoàn thành |
|---|---|---|
| A — Hợp đồng và database | Migration Google, DTO, cấu hình cookie/origin, Google OAuth client | Database nâng cấp an toàn; cấu hình mẫu đủ cho người khác setup |
| B — Local auth | Register/login/me/logout, hash, guard, rate limit, nối form | Đăng ký và đăng nhập thật qua UI; hai trình duyệt có phiên độc lập |
| C — Google và liên kết | Start/callback, xác minh, tạo lần đầu, xử lý collision và LINK | Google thật hoạt động; không tạo trùng hoặc liên kết sai tài khoản |
| D — Hoàn thiện phiên và UI | Restore khi mở trang/quay lại tab, lỗi mạng/callback, accessibility | Chrome/Brave chạy đúng các luồng chính và lỗi |
| E — Kiểm chứng và bàn giao | Test tích hợp DB/API, browser, hướng dẫn Google, cập nhật ERD mới | Checklist dưới đây đạt; công bố rõ phần chưa phát hành công khai |

Google là bắt buộc để hoàn thành đợt này, dù được viết sau local auth. Có thể triển khai B trong lúc chờ cấu hình Google; không được coi C hoàn tất chỉ vì test bằng token giả.

## 11. Kết quả đo được và kiểm chứng

Hoàn thành khi cả hai đường đăng nhập hoạt động qua UI, local/Google đã liên kết dùng cùng User, Chrome/Brave có phiên riêng, reload giữ phiên, logout thu hồi đúng phiên, không có mật khẩu/token thô trong DB/log/response và migration không mất dữ liệu.

Kiểm thử tự động: validation, chuẩn hóa email, hash, session guard/expiry/revoke, Google verifier dùng mock có các lỗi chủ động, callback replay, linking, uniqueness/concurrency, rollback và nâng cấp database. Mock phục vụ kiểm tra lỗi, không thay thế Google thật.

Kiểm tra trình duyệt: đăng ký local; local login sai/đúng; Google mới/quay lại/hủy; email collision và liên kết; đổi tab; hai trình duyệt; logout; mạng lỗi; cookie trên HTTP localhost và HTTPS test. Build/typecheck/lint nếu đã cấu hình phải đạt; test auth dùng database riêng, không chạm dữ liệu dev cần giữ.

## 12. Phụ thuộc còn cần chuẩn bị

- Chưa xác nhận Google Cloud project/OAuth client đã có. Khi triển khai cần tạo hoặc dùng cấu hình có sẵn; secret điền tại máy, không gửi vào chat.
- Chọn hostname HTTPS nếu nghiệm thu Google trên hai máy vật lý; không cần thông tin này để triển khai local auth.
- Thời hạn 7 ngày và chính sách một Google/User là mặc định đề xuất, có thể điều chỉnh trước khi viết migration/API.
- Trước public: bổ sung xác minh email local, khôi phục tài khoản, điều khoản/quyền riêng tư và hoàn tất cấu hình phát hành Google phù hợp. Không tự gộp tài khoản local chưa xác minh chỉ dựa vào email Google.

Tài liệu liên quan: [schema đang chạy](../apps/game-server/prisma/schema.prisma), [đánh giá database hiện tại](../docs/DATABASE_REVIEW.md), [hướng dẫn backend](../apps/game-server/README.md).

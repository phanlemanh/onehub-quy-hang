# Đăng nhập bằng mật khẩu do sàn cấp — thiết kế

Ngày: 2026-11-04 · Hàng lộ trình: `dang-nhap-mat-khau` (T3) · Ô cơ hội: `_acceptance/dang-nhap-mat-khau/opportunity.md`
(Cổng Đáng `build`, Manh Phan 04/11) · Nguồn: `docs/plan/danh-gia-dang-nhap-tai-khoan.md` (lối A, chủ kho chọn 04/11),
luật 52 và 55 của đợt dau-khach-nhap · Quyết định bị chạm: ADR-0005 §1, §4, «đường gửi mã», «thời hạn phiên»; ADR-0006
§2–§3; hàng 38 (tab Tôi, báo mất máy); hàng 93 (khối auth-15).

## 1. Điều hàng này làm

Quản trị sàn cấp cho người trong sàn một **mật khẩu tạm** do máy sinh; người đăng nhập bằng email + mật khẩu tạm, bị
đưa thẳng tới «Đặt mật khẩu mới», đặt xong mới vào vỏ. Quên mật khẩu thì xin quản trị cấp lại — không có đường quên
mật khẩu qua thư. Mã 6 số qua email vẫn là cửa thứ nhất, không đổi gì. Gộp thêm luật 55: đăng xuất mà máy chủ lỗi hay
mất mạng thì báo «Chưa đăng xuất được» và cho thử lại.

## 2. Luật mật khẩu (sáu luật đề xuất ở §4 của bản đánh giá — trình Cổng Phạm vi, Hỏi-1)

1. Mật khẩu người tự đặt: 8–128 ký tự, nhận dấu cách và chữ có dấu, không luật trộn loại ký tự, không ép đổi định kỳ;
   từ chối khi khớp danh sách mật khẩu phổ biến đóng gói trong kho, hay khi là chuỗi dễ đoán theo ngữ cảnh (chứa phần
   trước «@» của email, «quỹ hàng» / «quyhang», một ký tự lặp, dãy bàn phím hay dãy số). Không gọi ra ngoài.
2. Mật khẩu tạm: máy sinh ngẫu nhiên 16 ký tự từ bảng chữ không dễ nhầm, chia bốn nhóm; hết hạn sau 72 giờ; chỉ mở
   được «Đặt mật khẩu mới», không bao giờ cho vào vỏ. Bản đánh giá đề xuất «dùng được một lần»; thiết kế soạn theo
   khuyến nghị của Hỏi-5: **dùng lại được tới khi người đặt xong mật khẩu mới hay hết 72 giờ** — mỗi lần đăng nhập bằng
   mật khẩu tạm cấp một mã đổi mới và huỷ mã cũ; đặt xong thì mật khẩu tạm hết dùng. Lý do: điện thoại chuyển app hay tải
   lại trang là mất mã đổi; «một lần» thì người phải tìm quản trị lần hai mà không thêm an toàn (quản trị biết mật khẩu
   tạm suốt 72 giờ dù dùng một lần hay nhiều lần).
3. Giới hạn thử ở cơ sở dữ liệu: 5 lần sai trong 15 phút theo email (email lạ đếm như email thật) thì chờ; 20 lần sai
   liên tiếp của một tài khoản thì mật khẩu bị vô hiệu tới khi quản trị cấp lại. Email lạ và mật khẩu sai nhận cùng một
   câu lỗi, cùng mã HTTP.
4. Đổi mật khẩu thu mọi phiên khác của người; cấp lại thu **mọi** phiên của người được cấp; «Báo mất máy» còn vô hiệu
   mật khẩu.
5. Quản trị sàn A chỉ cấp được cho người **chỉ thuộc sàn A**. Người thuộc nhiều sàn tự đặt trong Cá nhân sau khi vào
   bằng mã. **Mật khẩu có gốc từ sàn cấp** (mật khẩu tạm, hay mật khẩu đặt lần đầu từ mật khẩu tạm ấy) bị vô hiệu ngay
   khi người được thêm vào một sàn khác — quản trị A có thể đã đăng nhập bằng mật khẩu tạm trước người ấy và đặt một mật
   khẩu mình biết; mật khẩu người tự đổi ở Cá nhân thì giữ.
6. Mỗi lần cấp, đổi, vô hiệu, khoá ghi một sự kiện (ai, cho ai, lúc nào, loại) — không bao giờ ghi mật khẩu hay băm.

## 3. Kiến trúc

### 3.1 Cơ sở dữ liệu — migration 034 (`034_mat_khau.sql`)

- `identity.password_state` (một dòng mỗi người có mật khẩu): `user_id` khoá chính tham chiếu `identity.user`,
  `kind` (`tam` | `tu-dat`), `origin` (`san-cap` | `tu-doi` — gốc của mật khẩu đang dùng: cấp tạm và đặt lần đầu từ
  mật khẩu tạm là `san-cap`, đổi ở Cá nhân là `tu-doi`), `temp_expires_at`, `change_token_hash`, `change_token_expires_at`,
  `failed_streak` (số lần sai liên tiếp), `disabled_at`, `disabled_reason` (`khoa-20` | `bao-mat-may` | `vao-san-khac`), `updated_at`.
  Băm mật khẩu vẫn nằm ở `identity.account.password` (`providerId = 'credential'`) như thư viện đọc.
- `identity.password_failures (email, at)` — đếm cửa sổ 15 phút theo email, cùng khuôn `identity.otp_requests`.
- `identity.password_events (id, user_id, company_id null, actor_user_id, kind, at)` — `kind` ∈ `cap`, `doi`,
  `dat-lan-dau`, `vo-hieu-bao-mat`, `khoa-20`, `vo-hieu-san-khac`. Không có cột nào chứa mật khẩu. Thuộc schema `identity`: không phải bảng
  của công ty (người thuộc nhiều sàn tự đổi thì không có sàn), chỉ vai chủ đọc ghi.
- Cả ba bảng: thu quyền của `public` và của `quy_hang_app` như 029 — vai API không đọc được.
- `app.cap_mat_khau_tam(p_user uuid, p_hash text, p_expires timestamptz) returns void`, `security definer`, chủ
  `quy_hang_owner`, cấp `quy_hang_app`. Trong một giao dịch: khoá tư vấn theo `p_user`; người gọi là quản trị của sàn
  đang làm (`app.current_user_is_admin()`); người được cấp là thành viên sàn đang làm (không → P0002, API 404); người
  được cấp không có dòng `company_members` ở sàn nào khác (có → mã lỗi riêng, API 409); ghi/đè dòng `credential` của
  `identity.account`, đặt `password_state` về `tam` (xoá khoá, xoá streak), xoá mọi `identity.session` của người,
  ghi sự kiện `cap` kèm `company_id`.
- Trigger `before insert` trên `company_members` (hàm `security definer`) lấy cùng khoá tư vấn theo `user_id` — lời mời
  vào sàn B chạy đồng thời với lần cấp ở sàn A phải xếp hàng — rồi, khi người đã có sàn khác và mật khẩu có
  `origin = 'san-cap'`, vô hiệu mật khẩu (`disabled_reason = 'vao-san-khac'`), xoá mã đổi và ghi sự kiện
  `vo-hieu-san-khac`. Lời mời vẫn thành công như hôm nay; người vào lại bằng mã 6 số và tự đặt mật khẩu ở Cá nhân.

### 3.2 API

- `createAuth` bật `emailAndPassword` với `disableSignUp: true`, `minPasswordLength: 8`, `maxPasswordLength: 128`.
- **Bảng xếp loại đường mở rộng sang lõi thư viện**: `/sign-up/email`, `/change-password`, `/request-password-reset`,
  `/reset-password`, `/reset-password/:token`, `/verify-password`, `/send-verification-email`, `/verify-email` vào
  `AUTH_DISABLED_PATHS` (404 trước bộ xử lý). `/sign-in/email` không đi thẳng thư viện: Hono đăng ký nó trước đường
  bắt-tất-cả (như `/sign-out` hôm nay). Bài kiểm của bảng đọc mọi đường lõi của bản thư viện đã cài; đường nào chạm mật
  khẩu, đăng ký hay thư xác minh mà chưa xếp loại thì đỏ.
- `POST /api/v1/auth/sign-in/email` (bọc): (1) đếm `password_failures` 15 phút ≥ 5 → 429 `password_rate_limited`, kể
  cả khi mật khẩu đúng; (2) mật khẩu sai hay email lạ → ghi một dòng failure, cộng `failed_streak` (tới 20 thì vô hiệu,
  sự kiện `khoa-20`) → 401 `invalid_email_or_password`; (3) mật khẩu đúng mà đã vô hiệu → 403 `password_disabled`;
  (4) đúng và là mật khẩu tạm: hết hạn → 403 `temp_password_expired`; còn hạn → sinh mã đổi mới (15 phút, lưu băm, huỷ
  mã cũ), trả 200 `{ mustChange: true, changeToken }` **không đặt cookie phiên**; (5) đúng và tự đặt → xoá streak, chuyển cho thư viện tạo phiên như mã 6 số (30 ngày trượt).
- `POST /api/v1/auth/password/first` `{ changeToken, newPassword }`: kiểm luật 1, đặt mật khẩu, `password_state` về
  `tu-dat`, `origin` giữ `san-cap`, sự kiện `dat-lan-dau`, rồi tạo phiên và trả cookie; mật khẩu tạm hết dùng. Mã đổi sai, hết hạn hay đã dùng → 403.
- `PUT /api/v1/me/password` `{ currentPassword?, newPassword }` (đăng nhập rồi): có mật khẩu dùng được thì phải đúng
  mật khẩu hiện tại; chưa có hay đã vô hiệu thì đặt không cần. Kiểm luật 1, `origin` thành `tu-doi`, thu mọi phiên khác (giữ phiên
  này), sự kiện `doi`. Không có đường nào nhận mật khẩu tạm làm `currentPassword`.
- `POST /api/v1/company/members/:userId/temp-password` (quản trị sàn): sinh mật khẩu tạm, băm bằng `hashPassword` của
  thư viện, gọi `app.cap_mat_khau_tam`, trả `{ tempPassword, expiresAt }` đúng **một lần** — không lưu bản rõ, không
  ghi nhật ký. Người không quản trị 403; người ngoài sàn 404; người thuộc sàn khác 409 `user_in_other_company` với câu
  không nêu sàn nào.
- `POST /api/v1/me/report-lost`: thêm bước vô hiệu mật khẩu (`disabled_reason = 'bao-mat-may'`, sự kiện
  `vo-hieu-bao-mat`) trước khi thu phiên khác.
- `GET /api/v1/me` thêm `password: "khong" | "co" | "vo-hieu"` để Cá nhân chọn chữ cho dòng.
- Mật khẩu và mã đổi không bao giờ vào nhật ký: thân yêu cầu của các đường trên không được in; lỗi in mã, không in thân.

### 3.3 Web

- **Đăng nhập** (`(auth)/login`): bước email như hôm nay; dưới nút «Gửi mã đăng nhập» thêm nút phụ «Dùng mật khẩu» mở
  ô mật khẩu trên cùng màn (Hỏi-2). Đúng mật khẩu tạm → sang `/dat-mat-khau` mang mã đổi trong bộ nhớ trang (không vào
  địa chỉ). Lỗi gắn dưới ô (`FieldError`, luật KH-xt-loi-gan-o): sai → «Email hoặc mật khẩu không đúng»; chờ →
  «Thử lại sau ít phút»; vô hiệu → «Mật khẩu đã bị khoá — đăng nhập bằng mã rồi đặt mật khẩu mới trong Cá nhân, hay nhờ quản trị
  sàn cấp lại»; tạm hết hạn → «Mật khẩu tạm đã hết hạn — nhờ quản trị sàn cấp lại».
- **Đặt mật khẩu mới** (`(auth)/dat-mat-khau`, mới, trong `Khung`): một ô mật khẩu có nút hiện/ẩn, câu gợi ý «Ít nhất
  8 ký tự — một câu ngắn có dấu là dễ nhớ», nút «Lưu và vào Quỹ hàng». Không có mã đổi (mở thẳng địa chỉ,
  tải lại trang) → báo «Phiên đặt mật khẩu đã hết» với mô tả «Đăng nhập lại bằng mật khẩu tạm.» kèm nút về đăng nhập; mã
  đổi chỉ ở bộ nhớ trang, không vào địa chỉ, lịch sử hay kho trình duyệt. Proxy cho địa chỉ này đi như
  `/login`.
- **Người dùng** (`settings/users`): mỗi dòng thêm việc «Cấp mật khẩu». Bấm → hộp hỏi `AlertDialog` «Cấp mật khẩu tạm
  cho [Tên]? Mật khẩu cũ thôi dùng và [Tên] bị đăng xuất ở mọi máy.» → hộp kết quả hiện mật khẩu tạm một lần, nút «Chép»,
  câu «Trao tận tay cho [Tên]. Mật khẩu hết hạn sau 72 giờ, đóng hộp này là không xem lại được.» 409 → tiêu đề «[Tên] còn ở
  sàn khác», mô tả «Người này tự đặt mật khẩu trong Cá nhân.»
- **Cá nhân** (`me`): dòng «Mật khẩu» nằm trong nhóm «Hồ sơ» (Hỏi-6; lối khác: nhóm «Máy đang đăng nhập») — không thêm
  nhóm thứ bảy (luật KH-toi-sau-nhom giữ sáu nhóm).
  Chữ dòng theo `password`: «Chưa đặt» / «Đã đặt» / «Đã khoá — đặt mật khẩu mới»; nút «Đặt mật khẩu» hay «Đổi mật
  khẩu» mở hộp `Dialog` (ô mật khẩu hiện tại khi `co`, ô mật khẩu mới).
- **Đăng xuất** (luật 55): `dangXuatTrenMay` trả `"xong" | "o-lai" | "loi"`; máy chủ trả lỗi hay mất mạng → `"loi"`,
  không rời màn; menu tài khoản và Cá nhân hiện «Chưa đăng xuất được» kèm «Thử lại». Kho trên máy vẫn xoá **trước** khi
  gọi máy chủ như hôm nay. `dang-xuat.tsx` (màn chọn sàn, chưa có sàn) đi cùng đường.

### 3.4 Tài liệu

ADR-0005 thêm mục «Bổ sung 04/11 — mật khẩu do sàn cấp»; `design/patterns/xac-thuc.md` thêm màn «Đặt mật khẩu mới»;
Tham chiếu §12 thêm một dòng; `CONTEXT.md` thêm «Mật khẩu tạm ↔ temp password».

## 3.5 Đối chiếu ngành (ADR-0022)

RESO Data Dictionary không có đối tượng đăng nhập hay mật khẩu — không có tên trường để theo. Nguồn tra 04/11:
[Salesforce — Set Password Policies](https://developer.salesforce.com/docs/atlas.en-us.232.0.securityImplGuide.meta/securityImplGuide/admin_password.htm),
[Follow Up Boss — Creating or Changing Your Password](https://help.followupboss.com/hc/en-us/articles/360012325934-Creating-or-Changing-Your-Password),
bản đánh giá §3 (Getfly CRM).

| Năng lực | RESO | Salesforce | Follow Up Boss | Ta định làm | Ta cứng — họ cấu hình |
| --- | --- | --- | --- | --- | --- |
| Độ dài tối thiểu | — | Quản trị chỉnh, mặc định 8 | 10 ký tự; chỉnh được không — chưa kiểm | 8, cứng (chủ kho chọn 05/11; NIST 800-63B-4 đòi 15 khi mật khẩu là yếu tố duy nhất — bù bằng giới hạn thử và danh sách chặn) | **Có** (Salesforce) → Hỏi-3 |
| Khoá sau thử sai | — | Quản trị chỉnh số lần; thời gian khoá mặc định 15 phút | chưa kiểm | 5 lần / 15 phút; 20 lần liên tiếp thì vô hiệu, cứng | **Có** (Salesforce) → Hỏi-3 |
| Hạn mật khẩu tạm | — | chưa kiểm | không có mật khẩu tạm | 72 giờ, cứng | chưa kiểm → Hỏi-3 |
| Ai cấp lại khi quên | — | Quản trị đặt lại, đổi ở lần đầu (bản đánh giá §3) | Người tự đặt lại qua thư | Quản trị sàn; không qua thư | Không |
| Tên đăng nhập | — | Dạng email | Email | Email | Không |

Ba dòng «có» gom thành **Hỏi-3**: giữ cứng ba số với lý do «quyền và an toàn» (khuyến nghị: một sàn nới độ dài hay giới
hạn thử là mở lối đoán vào số chủ nhà, bất biến 2), hay làm dữ liệu của sàn. Giữ cứng thì thêm một dòng «điều khoá» ở
Sổ điểm biến thiên; cho sàn **siết** thêm (dài hơn, ít lần thử hơn) để hàng sau khi có sàn đòi.

## 4. Lối khác đã bỏ

- **Plugin `admin` của thư viện** để đặt mật khẩu hộ: mang vai quản trị toàn hệ thống, trái ADR-0005 §2 — bỏ.
- **Phiên «phải đổi» rồi chặn từng đường API**: cần thêm một lần đọc danh tính mỗi lời gọi và mỗi đường phải nhớ chặn;
  không tạo phiên tới khi đặt xong thì vỏ không vào được theo cấu trúc — chọn cách này.
- **Danh sách mật khẩu lộ qua `haveibeenpwned`**: gọi ra ngoài; luật 1 đề xuất danh sách đóng gói trong kho.
- **Bảng sự kiện theo công ty**: người thuộc nhiều sàn tự đổi thì không có sàn để ghi; một bảng ở `identity` với
  `company_id` khi quản trị cấp.
- **Kiểm «chỉ thuộc sàn A» ở API rồi ghi bằng kết nối danh tính**: hai kết nối, hai giao dịch, kẽ hở khi mời đồng thời;
  hàm `security definer` + khoá tư vấn đóng kẽ ấy.

## 5. Rủi ro và chặn

- *Quản trị sàn A chiếm lối vào sàn B* — luật 5 ở hàm cơ sở dữ liệu (không ở giao diện), khoá tư vấn chung với lời mời,
  ca trong bộ kiểm cách ly; mật khẩu có gốc sàn cấp bị vô hiệu khi người vào thêm sàn khác (quản trị A có thể đã đặt
  mật khẩu thay người ấy bằng mật khẩu tạm).
- *Đoán mật khẩu* — giới hạn thử ở cơ sở dữ liệu (không trong bộ nhớ tiến trình: Vercel mỗi hàm một bộ nhớ).
- *Dò email có tài khoản* — email lạ cùng câu lỗi, cùng mã, cùng đếm; mã lỗi riêng (`password_disabled`,
  `temp_password_*`) chỉ trả khi mật khẩu đúng.
- *Máy mất đang nhớ mật khẩu* — báo mất máy vô hiệu mật khẩu.
- *Mật khẩu lộ ở nhật ký* — không in thân yêu cầu; bài kiểm quét nhật ký của lần chạy tìm mật khẩu thử.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ (lần đầu): quản trị mở Người dùng → «Cấp mật khẩu» → xác nhận → chép mật khẩu tạm, trao tay → người mở
  `/login`, gõ email → «Dùng mật khẩu» → gõ mật khẩu tạm → `/dat-mat-khau` → gõ mật khẩu mới → vào Hôm nay.
- Suôn sẻ (hằng ngày): `/login` → email → «Dùng mật khẩu» → mật khẩu → vào vỏ.
- Biên: người thuộc nhiều sàn (409, câu chỉ tới Cá nhân); mật khẩu tạm hết hạn; 5 lần sai (chờ); 20 lần sai liên tiếp
  (khoá); tải lại `/dat-mat-khau` (mất mã đổi, đăng nhập lại bằng mật khẩu tạm); người được thêm vào sàn khác (mật khẩu
  sàn cấp bị vô hiệu).
- Lỗi & quay lại: mọi lỗi đăng nhập ở dưới ô, người sửa ô hay quay lại bằng mã 6 số; đặt mật khẩu bị từ chối thì câu lý
  do dưới ô, gõ lại; đăng xuất lỗi thì «Thử lại».

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Đăng nhập | Vào bằng mã 6 số hay mật khẩu | Mọi địa chỉ khi chưa có phiên / vỏ, Đặt mật khẩu mới |
| Đặt mật khẩu mới | Đổi mật khẩu tạm thành mật khẩu của mình | Đăng nhập bằng mật khẩu tạm / vỏ |
| Người dùng — hộp cấp mật khẩu | Cấp và trao mật khẩu tạm | Việc trên dòng người / đóng hộp |
| Cá nhân — hộp mật khẩu | Đặt hay đổi mật khẩu của mình | Dòng «Mật khẩu» / đóng hộp |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-dang-nhap-mat-khau | Đăng nhập | Ô email, ô mật khẩu, nút «Đăng nhập», nút «Dùng mã qua email» | Gõ mật khẩu |
| ST-dang-nhap-sai | Đăng nhập | «Email hoặc mật khẩu không đúng» dưới ô mật khẩu | Gõ lại / dùng mã |
| ST-dang-nhap-cho | Đăng nhập | «Thử lại sau ít phút» dưới ô mật khẩu | Chờ / dùng mã |
| ST-dang-nhap-khoa | Đăng nhập | «Mật khẩu đã bị khoá — đăng nhập bằng mã rồi đặt mật khẩu mới trong Cá nhân, hay nhờ quản trị sàn cấp lại» | Dùng mã / nhờ quản trị |
| ST-dang-nhap-tam-het | Đăng nhập | «Mật khẩu tạm đã hết hạn — nhờ quản trị sàn cấp lại» | Nhờ quản trị |
| ST-dat-mat-khau-mac-dinh | Đặt mật khẩu mới | Ô mật khẩu có nút hiện/ẩn, câu gợi ý, nút «Lưu và vào Quỹ hàng» | Gõ, lưu |
| ST-dat-mat-khau-tu-choi | Đặt mật khẩu mới | Lý do dưới ô («Cần ít nhất 8 ký tự», «Mật khẩu quá dễ đoán») | Gõ lại |
| ST-dat-mat-khau-het-phien | Đặt mật khẩu mới | Tiêu đề «Phiên đặt mật khẩu đã hết», mô tả «Đăng nhập lại bằng mật khẩu tạm.», nút về đăng nhập | Đăng nhập lại bằng mật khẩu tạm |
| ST-cap-mat-khau-hoi | Người dùng | Hộp hỏi nói mật khẩu cũ thôi dùng, đăng xuất mọi máy | Cấp / Huỷ |
| ST-cap-mat-khau-ket-qua | Người dùng | Mật khẩu tạm, nút «Chép», câu trao tay và hạn 72 giờ | Chép, đóng |
| ST-cap-mat-khau-san-khac | Người dùng | Tiêu đề «[Tên] còn ở sàn khác», mô tả «Người này tự đặt mật khẩu trong Cá nhân.» | Đóng |
| ST-toi-mat-khau-dong | Cá nhân | Dòng «Mật khẩu» trong nhóm Hồ sơ: Chưa đặt / Đã đặt / Đã khoá | Mở hộp |
| ST-toi-mat-khau-hop | Cá nhân | Hộp đổi: ô mật khẩu hiện tại (khi «Đã đặt») và ô mật khẩu mới; hộp đặt: chỉ ô mới | Lưu / Huỷ |
| ST-dang-xuat-loi | Menu tài khoản, Cá nhân, chọn sàn | «Chưa đăng xuất được» kèm «Thử lại» | Thử lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ô mật khẩu `type="password"`, `autocomplete="current-password"` ở đăng nhập, `new-password` ở đặt mới; cho dán; nút
  hiện/ẩn. Không đếm ký tự trực tiếp; độ dài và danh sách kiểm ở máy chủ, câu lý do trả về gắn dưới ô.
- Hộp kết quả cấp mật khẩu: chữ đơn cách, nhóm bốn; «Chép» đổi thành «Đã chép» hai giây; đóng hộp là mất.
- Điện thoại và máy tính cùng một cột của `Khung`; hộp ở Người dùng và Cá nhân theo `Dialog`/`AlertDialog` có sẵn.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Khung` (auth-15 chuyển thể) | dùng | Khuôn của nhóm xác thực |
| `InputGroup`, `Field`, `FieldError` | dùng | Như ô email và mã ở hàng 93 |
| `AlertDialog`, `Dialog` | dùng | Hộp hỏi nguy hiểm và hộp kết quả có sẵn ở Người dùng |
| Nút hiện/ẩn mật khẩu | ghép | `InputGroupButton` + icon lucide `Eye`/`EyeOff` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: màn đăng nhập và đặt mật khẩu là một cột hẹp của `Khung` (hàng 93); hộp ở Người dùng và Cá nhân nằm trong khuôn
danh-sách sẵn có của từng màn — luồng hiển nhiên, không tra mẫu.

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Mọi người trong sàn (đăng nhập, đặt mật khẩu); quản trị sàn (cấp mật khẩu) |
| Việc chính | Vào Quỹ hàng khi thư mã không tới; quản trị trao lối vào cho người đứng cạnh |
| Tần suất | Đăng nhập: mỗi ngày; cấp mật khẩu: hiếm |
| Số bản ghi | một |
| Thiết bị | cả hai |
<!-- UX-SPEC-TEMPLATE>>> -->

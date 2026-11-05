# Đánh giá: thêm đăng nhập bằng tài khoản do sàn cấp

Ngày: 2026-11-04 · Trạng thái: **đánh giá, chưa quyết** · Người hỏi: Manh Phan («Tôi muốn bổ sung login bằng tài
khoản») · Liên quan: ADR-0005 (đăng nhập theo sàn, hai mục «Bổ sung 31/10»), ADR-0006 vai, khu (mời người), ADR-0009
(môi trường thật), Tham chiếu §12 dòng 30/10, 31/10 ×3, 03/11 tab Tôi, hàng 93 (`_acceptance/dang-nhap-auth-15/`)

Chủ kho chốt kiểu tài khoản ngày 04/11 (một câu hỏi, chọn khuyến nghị): **sàn cấp tài khoản + mật khẩu** — quản trị
sàn tạo tài khoản kèm mật khẩu tạm, quên thì quản trị cấp lại; mã 6 số qua email vẫn giữ. Không phải email + mật khẩu
tự đặt, không phải Google / Zalo / OneHub.

## 1. Vấn đề

Hôm nay chỉ có một cửa: gõ email → nhận mã 6 số qua thư → vào. Cửa ấy phụ thuộc hoàn toàn vào việc thư tới được.

- **Thư mã có thể chưa tới người thật.** ADR-0009 ghi Resend trả 403 tới khi tên miền gửi `onehub.center` được xác
  minh, và lỗi chỉ hiện ở nhật ký (người xin mã vẫn thấy «đã gửi»). Đo DNS 04/11: khoá DKIM của Resend
  (`resend._domainkey.onehub.center`) đã có, nhưng bản ghi MX và SPF của `send.onehub.center` trỏ sang một dịch vụ khác
  (`forge.rmta.net`), không phải của Resend. **Chưa kiểm được** trạng thái xác minh ở Resend (không có khoá đọc); Tham
  chiếu §12 vẫn ghi việc này «còn mở». `/api/v1/health` của bản thật trả `ok: true`.
- **Không có lối dự phòng.** Thư rơi vào thư rác, hộp thư công ty chặn, hay nhà cung cấp gửi trục trặc thì không ai
  vào được, kể cả quản trị sàn. Quản trị không có cách nào giúp người đang đứng cạnh mình.
- **Người không có email công ty.** Telesales và cộng tác viên của sàn thường dùng email cá nhân hay không đọc email
  trên máy đang làm. Mã gõ được ở máy nào cũng xong (lý do chọn mã ở ADR-0005 §1), nhưng vẫn phải mở được hộp thư.
- **Thói quen ngành ở Việt Nam.** Phần mềm quản lý cho doanh nghiệp quen kiểu «admin tạo tài khoản, phát mật khẩu,
  nhân viên đổi sau» (mục 3).

Điều **không** giải: telesales dùng chung một máy. Mật khẩu không làm việc dùng chung an toàn hơn — dùng chung một tài
khoản còn xoá dấu ai làm gì. Luật «mỗi người một tài khoản» giữ nguyên ở mọi lối.

## 2. Quyết định đã niêm bị chạm

| Ngày · nguồn | Điều đang đúng | Lối A (khuyến nghị) làm gì với nó |
| --- | --- | --- |
| 30/10 · ADR-0005 §1 | Email + mã 6 số là cách đăng nhập duy nhất; «Google và số điện thoại để sau» | **Đổi**: thêm cửa thứ hai «email + mật khẩu»; mã 6 số giữ nguyên |
| 30/10 · ADR-0005 §4 | Không tự đăng ký; chỉ tài khoản được mở hay mời | Giữ — đường tự đăng ký bằng mật khẩu của thư viện tắt (404) |
| 31/10 · ADR-0005 «đường gửi mã» | Quên, đặt lại mật khẩu qua thư trả 404, lý do «kho không có mật khẩu» | Giữ 404 (quên mật khẩu đi qua quản trị, không qua thư); **viết lại lý do** và xếp loại thêm các đường mật khẩu của lõi thư viện |
| 31/10 · ADR-0005 «thời hạn phiên» | Phiên 30 ngày trượt, chưa có trần tuyệt đối | Giữ; thêm: đổi hay cấp lại mật khẩu thì thu mọi phiên khác của người |
| 03/11 · tab Tôi (hàng 38) | «Báo mất máy» đăng xuất mọi máy khác, xoá kho trên máy bị báo | **Thêm**: báo mất máy cũng vô hiệu mật khẩu (máy mất có thể đang nhớ mật khẩu) |
| 30/10 · ADR-0006 §2–§3 | Mời là vào sàn ngay; câu trả lời giống nhau dù email đã có tài khoản | Thêm «cấp mật khẩu tạm» lúc mời và «cấp lại» ở màn Người dùng; giữ câu trả lời không lộ ai đã có tài khoản |
| 31/10 · ADR-0009 | Thư mã gửi qua Resend, còn mở xác minh tên miền | Không đổi; lối A không cần thư nên không bị chặn bởi việc này |
| 03/11 · hàng 93 | Ba màn xác thực theo khối auth-15 | Màn đăng nhập thêm lối «Mật khẩu»; thêm màn «Đặt mật khẩu mới» cùng khối |

## 3. Đối chiếu ngành và chuẩn

Theo ADR-0022: điểm sàn là câu giao, so với ít nhất hai sản phẩm cùng lớp và chuẩn bảo mật. Tra ngày 04/11, không
đăng nhập.

| Sản phẩm | Tên đăng nhập | Quên mật khẩu | Ghi chú |
| --- | --- | --- | --- |
| Salesforce | Tên đăng nhập dạng email | Admin đặt lại từ Setup; người **phải đổi ở lần đăng nhập đầu**; có mật khẩu tạm khi người không mở được thư | Gần nhất với lối A |
| Follow Up Boss (CRM BĐS) | Email | Tự đặt lại qua thư «Forgot Password»; có đăng nhập Google, Microsoft | Gần lối B; admin đặt lại hộ **chưa kiểm** |
| Getfly CRM (Việt Nam) | Tài khoản do admin tạo trong quản lý người dùng | Người tự đổi trong «Thông tin tài khoản» (nhập cũ, nhập mới); admin cấp lại **chưa kiểm** | Mẫu «admin tạo tài khoản» quen ở Việt Nam |

**NIST SP 800-63B-4** (bản thay 800-63B, mục 3.1.1.2):

- Mật khẩu là yếu tố duy nhất: **tối thiểu 15 ký tự**; nằm trong xác thực nhiều yếu tố thì tối thiểu 8. Cho phép tối đa
  ít nhất 64 ký tự, nhận dấu cách và Unicode (gõ tiếng Việt có dấu được).
- **Bắt buộc so với danh sách mật khẩu phổ biến hay đã lộ**, so cả chuỗi; từ chối thì nói lý do.
- **Không** ép trộn loại ký tự; **không** ép đổi định kỳ (chỉ ép khi có dấu bị lộ); không gợi ý mật khẩu, không câu
  hỏi bí mật.
- Cho dán và trình quản lý mật khẩu.
- Giới hạn thử sai liên tiếp **không quá 100** rồi vô hiệu; được đặt thấp hơn.
- Mật khẩu do người chọn hoặc **do hệ thống sinh ngẫu nhiên** — mật khẩu tạm của quản trị phải do máy sinh, không để
  quản trị tự gõ.

**Thư viện đăng nhập đang dùng (better-auth 1.7.14) có sẵn:**

- Đăng nhập email + mật khẩu (`emailAndPassword`), tắt tự đăng ký được; băm mật khẩu mặc định scrypt; độ dài tối thiểu,
  tối đa chỉnh được (mặc định 8 và 128). Bảng `identity.account` đã có cột `password` từ migration 002.
- Đổi mật khẩu kèm thu phiên khác; plugin `username` (tên đăng nhập riêng, **duy nhất toàn hệ thống**, vẫn cần email);
  plugin `haveibeenpwned` (gọi `api.pwnedpasswords.com`, chỉ gửi 5 ký tự đầu của băm); plugin `admin` (đặt mật khẩu hộ,
  thu phiên — nhưng mang vai quản trị toàn hệ thống, trái ADR-0005 §2 «better-auth chỉ giữ danh tính»; **không dùng**).
- Giới hạn thử có sẵn cho `/sign-in*` (3 lần / 10 giây) nhưng lưu **trong bộ nhớ tiến trình** — trên Vercel mỗi hàm một
  bộ nhớ, giới hạn gần như không có tác dụng. Phải đếm ở cơ sở dữ liệu như `identity.otp_requests` đang làm cho mã.

## 4. Các lối

### Lối A — Sàn cấp mật khẩu, email làm tên đăng nhập (khuyến nghị)

Quản trị sàn mời người như hôm nay; màn Người dùng thêm «Cấp mật khẩu» — máy sinh mật khẩu tạm ngẫu nhiên, hiện **một
lần** cho quản trị tự trao tận tay (quản trị tự bấm gửi, đúng bất biến 3). Người đăng nhập bằng email + mật khẩu tạm,
bị đưa ngay tới «Đặt mật khẩu mới» trước khi vào vỏ. Quên thì xin quản trị cấp lại. Mã 6 số qua email vẫn là cửa thứ
nhất, ai muốn vẫn dùng.

Luật đề xuất cho hàng (để Cổng Phạm vi duyệt, không phải đã chốt):

1. Mật khẩu người tự đặt: tối thiểu 15 ký tự, tối đa 128, không luật trộn ký tự, so với danh sách mật khẩu phổ biến
   đóng gói sẵn trong kho (không gọi ra ngoài); không ép đổi định kỳ.
2. Mật khẩu tạm: máy sinh, hết hạn sau 72 giờ, dùng được một lần để vào «Đặt mật khẩu mới»; không cho vào vỏ.
3. Giới hạn thử đếm ở cơ sở dữ liệu theo tài khoản: 5 lần sai trong 15 phút thì chờ; 20 lần sai liên tiếp thì mật
   khẩu bị vô hiệu tới khi quản trị cấp lại (dưới trần 100 của NIST). Email lạ nhận đúng câu lỗi như sai mật khẩu.
4. Đổi mật khẩu, cấp lại mật khẩu và «Báo mất máy» đều thu mọi phiên khác; báo mất máy còn vô hiệu mật khẩu.
5. **Quản trị sàn A chỉ cấp được mật khẩu cho người chỉ thuộc sàn A.** Người thuộc nhiều sàn tự đổi mật khẩu trong tab
   Tôi (sau khi vào bằng mã) hay nhờ đội vận hành. Lý do ở «Rủi ro».
6. Mỗi lần cấp, đổi, vô hiệu mật khẩu ghi một sự kiện (ai, lúc nào — không bao giờ ghi mật khẩu).

**Chi phí.** Một hàng T3 cỡ hàng 6 (đăng nhập theo sàn): một migration trong schema `identity` (cờ «phải đổi», hạn mật
khẩu tạm, bộ đếm thử sai), đường API cấp lại / đổi / đăng nhập mật khẩu, bảng xếp loại đường của thư viện thêm các
đường mật khẩu, màn đăng nhập thêm lối, màn «Đặt mật khẩu mới», nút trên màn Người dùng, dòng «Đổi mật khẩu» ở tab Tôi,
ADR-0005 thêm một mục bổ sung. Không đụng bảng của công ty ngoài sự kiện.

**Rủi ro và cách chặn.**

- *Bất biến 1 — cách ly giữa công ty.* Danh tính dùng chung mọi sàn: một người một mật khẩu. Nếu quản trị sàn A đặt
  được mật khẩu cho người cũng thuộc sàn B, quản trị A **chiếm được lối vào sàn B** của người ấy. Luật 5 chặn ở API và
  có ca trong bộ kiểm cách ly. Hệ quả nhỏ: quản trị A thấy «người này tự đặt mật khẩu» thì đoán được người có ở sàn
  khác — chấp nhận, vì quản trị A đã thấy người ấy trong danh sách của mình; câu chữ không nêu sàn nào.
- *Bất biến 2 — thông tin chủ nhà không rời công ty.* Mật khẩu lộ (dán giấy, gửi Zalo) là lối vào số chủ nhà của đầu
  chủ. Chặn bằng luật 1–4 và sự kiện ở luật 6; lớp nguồn vẫn chặn ở lõi và cơ sở dữ liệu như cũ, mật khẩu không nới
  quyền nào.
- *Máy bị báo mất.* Hôm nay báo mất chỉ cần thu phiên vì muốn vào lại phải có hộp thư. Có mật khẩu thì kẻ giữ máy có
  thể đang có mật khẩu đã nhớ trong trình duyệt → luật 4 vô hiệu mật khẩu.
- *Đặt lại khi thư chưa gửi được.* Đây chính là lý do chọn lối A: cấp lại đi qua quản trị, không qua thư. Quản trị
  quên mật khẩu mà thư cũng không tới thì đội vận hành cấp lại bằng công cụ mở sàn (thêm một lệnh vận hành).
- *Mật khẩu 15 ký tự gây vướng.* Gợi ý cụm từ («ba từ tiếng Việt có dấu») trên màn; trình quản lý mật khẩu và dán
  được. Muốn hạ xuống 8 thì phải có yếu tố thứ hai — việc sau, không ở bản đầu.

### Lối B — Email + mật khẩu tự đặt, quên thì đặt lại qua thư

Như Follow Up Boss. Rẻ hơn A một chút (thư viện có sẵn cả đường quên mật khẩu), nhưng **vẫn phụ thuộc thư tới được** —
đúng điểm yếu đang có. Phải mở lại đường quên / đặt lại mật khẩu đã cố ý trả 404 hôm 31/10, kèm rủi ro dội thư vào
hộp thư người khác mà hàng 55 vừa đóng. Không có lợi gì hơn A cho tình huống hôm nay.

### Lối C — Chưa thêm mật khẩu; sửa gốc ở thư và cho quản trị phát mã hộ

Xác minh tên miền gửi ở Resend (việc vận hành, không phải hàng), và thêm «Phát mã đăng nhập» cho quản trị sàn: máy sinh
mã một lần, hiện cho quản trị trao tận tay. Không lưu mật khẩu nào, không đụng NIST, không đổi báo mất máy; chi phí chừng
nửa lối A (vẫn T3 vì chạm danh tính). Không đáp ứng điều chủ kho muốn — người vẫn không có «tài khoản + mật khẩu» để
tự vào hằng ngày.

### Không chọn: Google / Zalo / OneHub

Đăng nhập Zalo không trả email và gắn người với tài khoản Zalo cá nhân; Google cần người có tài khoản Google và mở một
bên ngoài vào danh tính; OneHub chưa có cửa đăng nhập chung. ADR-0005 §1 để Google «sau» — giữ nguyên.

## 5. Khuyến nghị

**Mở một hàng lộ trình theo lối A**, bậc **T3** (chạm danh tính, schema `identity`, rào gửi mã và bộ kiểm cách ly).

Căn cứ:

1. Giải đúng điểm gãy đang có — cửa duy nhất phụ thuộc thư, mà thư chưa chắc tới — mà không cần thư cho cả lúc quên
   mật khẩu.
2. Giữ được quyết định 31/10 «mã chỉ phát qua một đường»: đường quên mật khẩu qua thư vẫn 404.
3. Khớp cách làm của Salesforce (admin đặt lại, đổi ở lần đầu) và thói quen «admin tạo tài khoản» của phần mềm Việt Nam.
4. Rủi ro lớn nhất (quản trị sàn này chiếm lối vào sàn khác) chặn được bằng một luật và một ca trong bộ kiểm cách ly.

Tên đăng nhập **không phải email** (cho người không có email) để sau: plugin `username` của thư viện là duy nhất toàn hệ
thống, nên sàn này đặt «[tên]» thì sàn khác không đặt được, và vẫn phải có email ẩn bên dưới. Mở khi một sàn thật có người
không email.

Việc đi kèm, không thuộc hàng: xác minh tên miền gửi ở Resend (ADR-0009 «còn mở») — cần cho mã 6 số dù chọn lối nào.

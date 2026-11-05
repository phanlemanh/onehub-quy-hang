# Vá hai kẽ an toàn của mật khẩu do sàn cấp — thiết kế

Ngày: 2026-11-05 · Hàng: `va-dang-nhap-mat-khau` (hàng vá, luật 64 của đợt dau-khach-nhap) · Nguồn: Cổng Bằng chứng
hàng 104 `dang-nhap-mat-khau` — chủ kho chọn «mở hợp đồng mới» cho Ngoài-6 và Ngoài-7 (Manh Phan, 05/11) ·
Quyết định bị chạm: ADR-0005 bổ sung 04/11; migration 034.

## 1. Hai kẽ

- **Ngoài-6 — vào sàn khác mà phiên cũ còn sống.** Migration 034 vô hiệu mật khẩu có gốc sàn cấp khi người được thêm vào
  một sàn khác sàn đã cấp. Nhưng trigger chỉ đổi `identity.password_state`, không thu phiên. Quản trị sàn A cấp mật
  khẩu tạm, tự đăng nhập bằng nó trước người được cấp và đặt mật khẩu mình biết, nên giữ một phiên 30 ngày của người ấy.
  Người ấy vào sàn B: mật khẩu bị khoá nhưng phiên của quản trị A vẫn sống và làm việc được ở sàn B. Tệ hơn,
  `PUT /api/v1/me/password` bỏ kiểm mật khẩu hiện tại khi mật khẩu đã vô hiệu, nên phiên ấy đặt được một mật khẩu
  mới gốc `tu-doi` — không bao giờ bị vô hiệu nữa. Phạm bất biến 1 (cách ly giữa công ty).
- **Ngoài-7 — đổi mật khẩu ở Cá nhân không giới hạn lần đoán.** Đường đổi so `currentPassword` mà không ghi lần sai,
  không cộng chuỗi sai. Ai giữ một phiên mở đoán mật khẩu hiện tại không giới hạn, rồi đổi và thu các phiên khác của
  chủ tài khoản. Lệch ADR-0005 bổ sung 04/11: «giới hạn thử ở cơ sở dữ liệu … cố định vì quyền và an toàn».

## 2. Cách vá

1. **Thu phiên khi vô hiệu vì vào sàn khác** — migration mới `035_*.sql` thay thân `app.vo_hieu_mat_khau_khi_vao_san()`
   (cùng tên, cùng trigger): khi lệnh `update identity.password_state … where origin = 'san-cap' …` đổi một dòng, hàm xoá
   thêm mọi dòng `identity.session` của người ấy trong CÙNG giao dịch với lời mời, rồi ghi sự kiện `vo-hieu-san-khac`
   như cũ. Mật khẩu `tu-doi` không bị vô hiệu thì phiên giữ nguyên. Người được mời vào lại bằng mã 6 số như mọi người
   vừa vào sàn mới (Hỏi-1).
2. **Đếm lần sai ở đường đổi** — `PUT /api/v1/me/password` dùng chung bộ đếm của đăng nhập (`identity.password_failures`
   theo email của phiên, `failed_streak` của tài khoản):
   - ≥ 5 lần sai trong 15 phút theo email → 429 `password-rate-limited`, kể cả khi `currentPassword` đúng, không so;
   - `currentPassword` sai → ghi một dòng sai, cộng chuỗi sai → 403 `invalid-current-password`;
   - chuỗi sai chạm 20 qua đường này → vô hiệu mật khẩu (`khoa-20`) **và thu mọi phiên của người, kể cả phiên đang
     gọi** — nếu chỉ khoá thì phiên ấy đặt được mật khẩu mới không cần mật khẩu cũ (đường «đã vô hiệu thì đặt không
     cần»), tức khoá thành lối vòng;
   - `currentPassword` đúng → xoá chuỗi sai như đăng nhập đúng.
   Bộ đếm chung với đăng nhập: 5 lần sai ở đăng nhập cùng email làm đường đổi chờ, và ngược lại.
3. **Hộp đổi mật khẩu ở Cá nhân** đọc 429 thành câu «Thử lại sau ít phút» dưới ô mật khẩu hiện tại; 401 sau khi phiên bị
   thu đi đường «hết phiên» sẵn có của vỏ.

## 3. Lối khác đã bỏ

- **Thu phiên ở API mời người** (`thanh-vien.ts`) thay vì trigger: lời mời còn đi qua công cụ mở sàn và chèn thẳng ở
  cơ sở dữ liệu; luật nằm ở chỗ ghi `company_members` mới không lọt — cùng lý do 034 đặt vô hiệu ở trigger.
- **Chỉ thu phiên tạo bằng mật khẩu** (giữ phiên tạo bằng mã 6 số): phiên không mang dấu cách tạo; thêm cột cho
  `identity.session` là sửa bảng thư viện quản — Hỏi-1 nêu lối này.
- **Đếm riêng cho đường đổi**: hai bộ đếm cho phép 5 + 5 lần mỗi cửa sổ; chung một bộ là đúng con số ADR-0005 khai.

## 4. Rủi ro

- Người được mời vào sàn B bị đăng xuất ở mọi máy (khi mật khẩu gốc sàn cấp) — đổi lấy việc phiên lạ không sống sót.
- Người gõ sai mật khẩu hiện tại 5 lần phải chờ 15 phút mới đổi được — cùng nhịp với đăng nhập.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Cá nhân → «Đổi mật khẩu» → gõ mật khẩu hiện tại đúng và mật khẩu mới → lưu (không đổi so với hàng 104).
- Biên: sai mật khẩu hiện tại (câu dưới ô như cũ); sai 5 lần trong 15 phút → «Thử lại sau ít phút»; sai tới 20 lần liên
  tiếp → phiên bị thu, vỏ đưa về đăng nhập.
- Lỗi & quay lại: chờ 15 phút; hay đăng nhập bằng mã rồi đặt mật khẩu mới.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cá nhân — hộp mật khẩu | Đặt hay đổi mật khẩu của mình | Dòng «Mật khẩu» / đóng hộp |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-doi-mat-khau-cho | Cá nhân — hộp mật khẩu | «Thử lại sau ít phút» dưới ô mật khẩu hiện tại | Chờ / đóng hộp |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Câu báo gắn dưới ô (`FieldError`), như các lỗi khác của hộp.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Field`, `FieldError` trong hộp mật khẩu của hàng 104 | dùng | Thêm một câu lỗi, không thêm ô |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: hộp mật khẩu có sẵn ở hàng 104; chỉ thêm một trạng thái lỗi.

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Mọi người trong sàn |
| Việc chính | Đổi mật khẩu của mình |
| Tần suất | hiếm |
| Số bản ghi | một |
| Thiết bị | cả hai |
<!-- UX-SPEC-TEMPLATE>>> -->

# Mời người, đặt vai và khu phụ trách — thiết kế

Ngày 30/10/2026 · Hàng 7 của lộ trình · Hồ sơ `_acceptance/moi-nguoi-vai-khu/` · T3 · đứng trên hàng 6 (ADR-0005).

Câu giao: **Quản trị sàn mời người vào sàn, đặt vai và khu phụ trách; một người giữ được nhiều vai.**
Vì sao: màn S6 · Người dùng; tách khỏi đăng nhập vì là lớp quyền.

## 1. Bài toán

Hàng 6 đã có thành viên sàn (`company_members`) nhưng chỉ đội vận hành gắn được người, và chưa ai có vai. Hàng này cho
**quản trị sàn** tự quản người của sàn mình: mời theo email, đặt một hay nhiều trong năm vai (Tham chiếu §2), giao khu
phụ trách, sửa, bỏ khỏi sàn. Vai và khu là nền cho quyền của mọi màn sau (Bảng hàng, Đội, Hôm nay theo vai, vỏ theo vai
của hàng 53).

## 2. Năm câu chỉ chủ kho trả lời (lên thẻ Cổng Phạm vi)

- **Hỏi-1 · Mời là vào sàn ngay, hay lời mời chờ người nhận.** Khuyến nghị: **vào ngay** — quản trị nhập email và vai,
  người đó đăng nhập bằng mã 6 số là đã ở trong sàn; không có bước «chấp nhận lời mời». Vì: chưa có email thật (hàng
  nơi chạy), nên một lời mời chờ nhận không có đường tới tay người được mời; quản trị tự báo qua kênh của mình (người
  luôn là người bấm gửi). Lối khác: lời mời chờ nhận có hạn (giá: thêm bảng lời mời, màn nhận lời, và vô dụng tới khi
  có email thật).
- **Hỏi-2 · Khu là gì khi danh mục toà chưa có.** Khuyến nghị: **khu là tên do sàn tự đặt** («Toà A», «Phân khu
  Hướng Dương») trong bảng khu của sàn; khi hàng nạp danh mục xong thì mỗi khu gắn được vào toà / phân khu của danh mục.
  Lối khác: chờ danh mục rồi mới cho giao khu (giá: hàng 7 thiếu nửa câu giao, Đội và Bảng hàng theo khu chờ theo).
- **Hỏi-3 · Ai xem được danh sách người của sàn.** Khuyến nghị: **chỉ quản trị sàn** ở hàng này; trưởng nhóm xem người
  của nhóm ở màn Đội (TN1, hàng sau). Lối khác: mọi thành viên xem danh sách (giá: lộ ai giữ vai gì cho telesales, đầu
  khách — chưa ai đòi).

- **Hỏi-4 · Quản trị sàn được tạo tài khoản và gắn người đang ở sàn khác khi mời không.** Khuyến nghị: **được** —
  hàng 6 tắt tự đăng ký, nên mời là đường duy nhất để người mới có tài khoản; người đang ở sàn khác thì vào thêm sàn
  này và thấy màn chọn sàn (như được thêm vào một nhóm làm việc). Câu trả lời khi mời giống hệt nhau dù email đã có
  tài khoản hay chưa, nên quản trị không dò được ai đã dùng Quỹ hàng. Giá: khi có email thật, quản trị của một sàn bắt
  Quỹ hàng gửi mã tới địa chỉ do họ nhập — đổi lại mọi lời mời đều mang tên sàn và người mời. Lối khác: chỉ đội vận
  hành tạo tài khoản, quản trị chỉ gắn người đã có (giá: mỗi người mới phải nhờ đội vận hành); hoặc người ở sàn khác
  phải tự đồng ý (giá: cần lời mời chờ nhận — xem Hỏi-1).
- **Hỏi-5 · Dùng khối Pro `solution-users-8` (chủ kho thêm khoá ReUI vào `.env.local`) hay ghép từ thành phần đã cài.**
  Khuyến nghị: **ghép** ở hàng này — màn chỉ cần danh sách, form và hộp xác nhận; chuyển thể khối Pro là việc nhỏ trên
  cùng API khi có khoá. Lối khác: chủ kho thêm khoá rồi máy cài khối đích (giá: một bước của người trước S3, thêm bước
  duyệt giao diện bản bấm được).

## 3. Phương án (theo khuyến nghị)

### Dữ liệu — migration 003 (không sửa 001, 002)

- `company_members.roles text[] not null default '{}'`, ràng buộc chỉ nhận năm giá trị: `telesales` · `listing_agent`
  (đầu chủ, RESO ListAgent) · `buyer_agent` (đầu khách, RESO BuyerAgent) · `team_lead` (trưởng nhóm) ·
  `company_admin` (quản trị sàn). Một người nhiều vai = nhiều phần tử.
- `company_zones (id uuid, company_id, name, created_at)`, tên duy nhất trong một sàn; luật theo dòng theo sàn.
- `member_zones (company_id, user_id, zone_id)`: khu phụ trách của một thành viên; khoá ngoại tới thành viên và khu
  **cùng sàn** (khoá ngoại đôi `(company_id, zone_id)`), nên không giao được khu của sàn khác.
- Hàm `app.current_user_is_admin()` (security definer, chỉ đọc thành viên của chính người và sàn đang làm) — luật ghi
  dùng hàm này, tránh luật tự gọi chính bảng.
- Luật ghi: thêm, sửa, bỏ thành viên; tạo khu; giao khu — chỉ khi người đang làm là quản trị của **sàn đang làm**.
  Đọc: như hàng 6 (dòng của mình, dòng của sàn đang làm).
- **Sàn luôn còn ít nhất một quản trị**: trigger sau khi sửa / xoá thành viên từ chối nếu sàn không còn ai mang
  `company_admin`. Chặn ở cơ sở dữ liệu, không chỉ ở màn. Trigger lấy khoá theo sàn (`pg_advisory_xact_lock`) trước khi
  đếm, nên hai quản trị gỡ nhau cùng lúc thì giao dịch sau thấy kết quả của giao dịch trước.
- Công cụ mở sàn của hàng 6 gắn email đầu tiên với vai `company_admin`.

### API (dưới `/api/v1`, qua `withCompany` như hàng 6)

| Đường | Làm gì | Không phải quản trị |
|---|---|---|
| `GET /san/thanh-vien` | người của sàn: email, vai, khu | 403 `can-quan-tri` |
| `POST /san/thanh-vien` | mời `{ email, roles, zoneIds }`: tạo tài khoản nếu chưa có, gắn vào sàn | 403 |
| `PATCH /san/thanh-vien/:userId` | đổi vai, khu | 403 |
| `DELETE /san/thanh-vien/:userId` | bỏ khỏi sàn | 403 |
| `GET /san/khu` · `POST /san/khu` | xem khu · tạo khu `{ name }` | đọc được · tạo 403 |

- Mời trả cùng một câu (201 + `{ userId }`) dù email đã có tài khoản hay chưa. Mời email đã là thành viên → 409
  `da-la-thanh-vien`. Vai lạ → 400. Khu không thuộc sàn → 400.
- Bỏ quản trị cuối cùng, hay tự gỡ vai quản trị khi là quản trị cuối → 409 `can-mot-quan-tri` (lỗi của trigger).
- `GET /me` thêm `roles` của sàn đang làm (vỏ hàng 53 cần). Vai đọc lại từ cơ sở dữ liệu mỗi lời gọi, không lưu trong
  phiên — gỡ vai có hiệu lực ngay ở lời gọi kế.
- Tạo tài khoản lúc mời đi qua phần danh tính (`packages/api/src/auth/accounts.ts`, kết nối danh tính) — cùng cửa với
  hàng 6; bộ soát một cửa thêm tệp này vào danh sách phần danh tính.

### Màn `/settings/users` (Cài đặt sàn → Người dùng; vùng của hàng)

Khối đích `solution-users-8` là khối Pro; kho chưa cài khối Pro nào nên màn ghép từ thành phần đã cài (bậc 6 của thang):
`Frame` + danh sách `Item` (email, vai bằng `Badge`, khu) + form mời (`Field`, `Input`, `Checkbox` cho vai và khu,
`Button`) + `AlertDialog` xác nhận bỏ khỏi sàn. Không quản trị → «Chỉ quản trị sàn xem được trang này».

## 4. Không làm ở hàng này

- Gửi email mời (chưa có email thật — hàng nơi chạy).
- Quyền chi tiết của từng vai ở từng màn — mỗi màn làm khi dựng màn đó; hàng này chỉ chặn quyền quản trị người.
- Lịch sử ai sửa gì — đi theo sự kiện của hàng 8.
- Gắn khu vào toà / phân khu của danh mục — hàng nạp danh mục.
- Màn Đội của trưởng nhóm (TN1), nhãn riêng của người.
- Khối Pro `solution-users-8`.

## Đặc tả UX
<!-- <<<UX-SPEC-TEMPLATE -->

### 1. Luồng

- Suôn sẻ: quản trị mở `/settings/users` → thấy danh sách người → «Mời người» → nhập email, chọn vai, chọn khu → «Mời»
  → người mới hiện trong danh sách (điểm ra: danh sách).
- Biên: chưa có khu nào → ô khu ghi «Chưa có khu — thêm khu ở dưới»; người không phải quản trị mở trang → thông báo chặn.
- Lỗi & quay lại: email đã là thành viên → báo dưới ô email; bỏ quản trị cuối cùng → báo trong hộp xác nhận, không bỏ.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Người dùng | Quản trị quản người của sàn | Cài đặt sàn (sau này vỏ) / chính nó |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-nguoi-dung-danh-sach | Người dùng | Danh sách: email, vai (badge), khu; nút «Mời người» | mời / sửa / bỏ |
| ST-nguoi-dung-moi | Người dùng | Form: «Email», ô chọn năm vai, ô chọn khu, nút «Mời» | nhập, mời |
| ST-nguoi-dung-da-la-thanh-vien | Người dùng | «Email này đã là thành viên của sàn.» dưới ô email | sửa email |
| ST-nguoi-dung-sua | Người dùng | Form sửa vai, khu của một người, nút «Lưu» | lưu |
| ST-nguoi-dung-bo | Người dùng | Hộp xác nhận «Bỏ [email] khỏi sàn?» | xác nhận / huỷ |
| ST-nguoi-dung-can-mot-quan-tri | Người dùng | «Sàn cần ít nhất một quản trị.» | huỷ |
| ST-nguoi-dung-khong-quyen | Người dùng | «Chỉ quản trị sàn xem được trang này.» | quay lại |
| ST-nguoi-dung-khu | Người dùng | Danh sách khu + ô «Tên khu» + nút «Thêm khu» | thêm khu |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Vai chọn được nhiều; phải chọn ít nhất một vai khi mời. Email chuẩn hoá chữ thường như hàng 6.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Danh sách người | ghép (`Item`, `Badge`) | khối đích `solution-users-8` là Pro, chưa cài |
| Form mời / sửa | ghép (`Field`, `Input`, `Checkbox`, `Button`) | thành phần đã cài |
| Xác nhận bỏ | dùng (`AlertDialog`) | thành phần đã cài, luật lint cấm `confirm` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: khối đích `solution-users-8` ở `docs/design/vo-va-ia.md` là danh sách người với thao tác từng dòng.
<!-- UX-SPEC-TEMPLATE>>> -->

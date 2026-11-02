# Mở số của lead — thiết kế

Ngày 02/11 · hàng `mo-so-lead` (dãy L, đợt `dau-chu-dong-vao`) · nguồn quyết định: chủ kho, Hỏi-3 hàng 22 (Hôm nay của
đầu chủ, `_acceptance/hom-nay-dau-chu` dòng `d-20261101T135417Z-10`) — «Mở số của lead cho đầu chủ tách thành hàng
riêng; Hôm nay không hiện số tới khi hàng ấy xong» · phải xong trước hai tuần thử · hạng **T3** (migration
`017_mo_so_lead.sql` thêm một bảng có luật theo dòng — bất biến 1, 2).

## Vấn đề

Lead về đầu chủ (nhịp chia, trưởng nhóm giao, lúc nhập khớp chủ nhà) và hiện ở nhóm «Lead mới» của Hôm nay, kèm hạn nhận
15 phút và hạn gọi 30 phút (ADR-0017). Nhưng số chủ nhà của lead không ra ở đâu cả: telesales nhập rồi không thấy lại số
(chốt 29/10), API của lead không có lối đọc số, cột số của bảng lead là bản mã không cấp quyền đọc cho vai API (ADR-0013).
Đầu chủ được giao lead mà không gọi được từ app — Hôm nay đếm hạn gọi cho một việc người không làm được.

## Cách làm

- **Một cửa mở số cho lead, như «Mở số» của hồ sơ căn** (hàng 11, ADR-0010, ADR-0013): hàm cơ sở dữ liệu
  `app.reveal_lead_phone(lead)` xét quyền, ghi một vết, trả bản mã; API giải bằng khoá mã hoá số chủ với ngữ cảnh của
  chính lead (`leads:<sàn>:<lead>`). Lối API `POST /api/v1/leads/{leadId}/phone-reveal` trả `{ ownerPhone }`.
- **Ai mở được:** đầu chủ đang được giao lead (người nhận của lead hiện tại, còn vai Đầu chủ) — đúng chữ Hỏi-3 hàng 22
  «mở số của lead cho đầu chủ» (Hỏi-1 bàn về trưởng nhóm). Lead mở được khi còn trong việc của đầu chủ theo đúng định
  nghĩa hạn nhận, hạn gọi đang dùng (lead không trùng hay chủ trùng, chưa bỏ, chưa trả lại — `app.lead_deadline_facts`,
  migration 015), ở mọi nấc Đã gửi · Đã nhận · Đã gọi. Lead cũ đã gửi lại là lead đã trả lại. Lead căn trùng (tin bổ sung
  cho căn đang rao, người nhận là đầu chủ giữ căn) là Hỏi-3 của hàng này. Bị chặn thì không ghi vết.
- **Vết mở số** (`lead_phone_reveals`, migration 017): sàn, lead, người mở, vai lúc mở, lúc mở. Chỉ thêm — không sửa,
  không xoá (cùng trigger chỉ-thêm của bảng vết mở số căn). Người mở đọc vết của mình; trưởng nhóm đọc cả sàn; vai API
  không ghi thẳng — chỉ hàm mở số ghi.
- **Số không ra ngoài cửa ấy:** danh sách lead giao cho tôi, các lỗi, nhật ký máy chủ không mang số; web không lưu số
  trên máy (không IndexedDB, không localStorage) — số chỉ sống trong trạng thái của dòng tới khi rời trang (bất biến 2).
- **Hôm nay:** mỗi dòng lead có nút «Mở số». Bấm → số hiện ngay trên dòng, viết theo nhóm (`0900 000 011`) kèm nút «Gọi»
  (`tel:` — điện thoại mở bàn phím gọi, máy tính mở ứng dụng gọi mặc định). Mở số KHÔNG tự ghi «Đã nhận» hay «Đã gọi»:
  hai mốc ấy vẫn do người bấm (luật một cửa ghi, ADR-0020). Lỗi nói ở dòng: mất mạng, lead không còn của bạn, hết phiên.
- Số nào: số người nhập cùng lead (cột bản mã của chính lead). Các số khác của liên hệ (hàng 85) không mở ở đây.

## Đối chiếu ngành

| Năng lực | RESO | Follow Up Boss | KW Command | Ta làm | Ta viết cứng — họ cho cấu hình |
|---|---|---|---|---|---|
| Agent được giao thấy số của lead | `Contacts` có `MobilePhone`, `HomePhone`, `OtherPhone`; DD 2.0 không có tài nguyên lead và không có khái niệm «mở số» | Agent thấy số ngay trên hồ sơ lead mình được giao; quản trị chọn agent chỉ thấy lead của mình hay thấy hết (chưa kiểm) | Bấm số trên liên hệ thì chuyển sang ứng dụng gọi, không tự quay ([Call Your Contacts](https://answers.kw.com/hc/en-us/articles/360041340054-Call-Your-Contacts-Using-Command)) | Số ẩn tới khi bấm «Mở số»; bấm `tel:` | Ai được mở: ta cứng «đầu chủ đang được giao»; FUB cho quản trị chọn phạm vi thấy → **Hỏi-1** |
| Vết ai đã xem số | Không có; gần nhất là `HistoryTransactional` (lịch sử đổi trường) | Ghi lịch sử cuộc gọi, không ghi lần xem số (chưa kiểm) | Không ghi (chưa kiểm) | Mỗi lần mở một vết chỉ thêm | Giữ cứng — lý do **bất biến** (số chủ là lớp nguồn, bất biến 2; đã chốt ở hàng 11, 62) |
| Gọi từ app | — | Gọi trong trình duyệt (dialer) có ghi âm, theo gói | Chuyển sang ứng dụng gọi của máy | `tel:` chuyển sang ứng dụng gọi | Không: gọi trong trình duyệt là hàng 28, 30 |

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Hôm nay (nhóm «Lead mới») → bấm «Mở số» trên dòng lead → số hiện trên dòng + nút «Gọi» → bấm «Gọi» mở ứng dụng
  gọi của máy (điểm ra: ứng dụng gọi; quay lại Hôm nay bấm «Đã gọi»)
- Biên: lead vừa bị trưởng nhóm giao cho người khác hay đã trả lại → «Lead này không còn của bạn»; tải lại trang → số ẩn
  lại, bấm «Mở số» lần nữa ghi thêm một vết
- Lỗi & quay lại: mất mạng → «Mất mạng — chưa mở được số, thử lại khi có mạng»; hết phiên → «Hết phiên đăng nhập — đăng
  nhập lại rồi thử»; nút giữ nguyên để thử lại

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hôm nay của đầu chủ (có sẵn, hàng 22) | Làm việc trong ngày — ở đây: gọi chủ nhà của lead mới | Mở app / ứng dụng gọi |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-homnay-so-an | Hôm nay | Nút «Mở số» (viền) cạnh «Nhận» / «Đã gọi» | Bấm «Mở số» |
| ST-homnay-dang-mo | Hôm nay | Nút «Mở số» khoá trong lúc chờ | Chờ |
| ST-homnay-so-hien | Hôm nay | Số theo nhóm `0900 000 011` + nút «Gọi» thay chỗ «Mở số» | Bấm «Gọi», rồi «Đã gọi» |
| ST-homnay-mo-loi | Hôm nay | Dòng chữ đỏ dưới nút: lý do (mất mạng · không còn của bạn · hết phiên) | Thử lại / bỏ qua |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Số chỉ sống trong trạng thái dòng; tải lại trang hay rời Hôm nay là ẩn lại. Khung hẹp (điện thoại): số và «Gọi» xuống
  dưới tên như các nút khác của dòng.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Button` (shadcn, đã cài) | dùng | Cùng họ nút của dòng lead (Nhận · Đã gọi · Trả lại) |
| Liên kết `tel:` | dùng | `Button` dạng liên kết — điện thoại tự mở bàn phím gọi |
| Dòng báo lỗi dưới nút | dùng | Đúng dòng lỗi có sẵn của nút dòng lead (`text-destructive text-sm`, token của theme) — cùng chỗ lỗi của Nhận · Đã gọi |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: không đổi IA — Hôm nay (hàng 22) đã chọn khuôn này ở Cổng Phạm vi; hàng này chỉ thêm một nút vào dòng có sẵn.
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài phạm vi

- Mở các số khác của liên hệ chủ nhà (hàng 85) — chỉ số nhập cùng lead.
- Gọi trong trình duyệt, ghi âm, kết quả cuộc gọi — hàng 28 (Cuộc gọi), 30.
- Màn xem vết mở số cho trưởng nhóm — hàng 42; vết đọc được qua luật theo dòng từ nay.
- Telesales xem lại số đã nhập — giữ chốt 29/10 (không thấy lại).

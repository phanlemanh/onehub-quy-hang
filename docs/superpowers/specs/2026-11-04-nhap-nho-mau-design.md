# Nhớ mẫu file của lần nhập (hàng 67, nhap-nho-mau)

Ngày: 2026-11-04 · Hạng: T2 · Dãy G đợt dau-khach-nhap · Gốc: ADR-0011 quyết định 6, Tham chiếu luật 11 «nhớ mẫu file»,
Kiến trúc «Nhập dữ liệu» §2 (sơ đồ «áp bộ nhớ của sàn»), §8 (bảng). Gộp thêm hai mục chủ kho chọn «mở hợp đồng mới» ở Cổng
Bằng chứng Màn Nhập Excel (luật 50 của đợt): Ngoài-3 thanh bước, Ngoài-7 thân lỗi không phải chuỗi.

## Vấn đề

Đầu chủ nhập tệp bảng hàng theo cùng một mẫu nhiều lần (bản cập nhật hằng tuần của cùng một sheet). Màn Nhập Excel (hàng
man-nhap-excel) ghép cột bằng từ điển chung mỗi lần, nên mọi lần người phải chỉnh lại đúng những cột đã chỉnh lần trước, và
mọi «cách gọi riêng» của sàn (ô «Đã cọc», «Toà A1» viết tắt…) lại thành «cần người». Câu giao: nhập lại file cùng mẫu thì
thấy máy ghép sẵn như lần trước, kể cả cách gọi riêng của sàn.

## Phương án

### Bộ nhớ ở đâu (Hỏi-1)

Kiến trúc §8 dự tính một bảng `import_templates` riêng. Hàng 67 trong lộ trình khai hạng T2 và vùng không có
`packages/db/**`. Máy khuyên **dựng bộ nhớ từ các lần nhập đã ghi**: bảng `imports` (migration 024) đã giữ trọn kế hoạch
của mỗi lần nhập (`plan`: tiêu đề cột → đích, phép biến đổi, bảng quy đổi giá trị), đã là `company_internal`, đã có luật
theo dòng và trạng thái `committed`. Mẫu của sàn = kế hoạch của các lần nhập đã ghi, mới nhất thắng theo từng tiêu đề.
Không migration, không bảng mới; bảng `import_templates` để dành cho màn quản mẫu file của quản trị sàn (S6, hàng 50) —
lúc ấy mới cần sửa, xoá, đếm lượt dùng.

Lối khác: bảng `import_templates` ngay bây giờ — đúng chữ kiến trúc, nhưng đổi hồ sơ sang T3 (migration, luật theo dòng
mới, ca cách ly mới, Cổng 1.5), vượt vùng hàng đã khai, và dựng phần sửa/xoá chưa có màn dùng.

### Vân tay và khớp

- Khoá của một cột = `headerKey(tiêu đề)` của lõi (đã có, bỏ dấu, gộp khoảng trắng, chữ thường).
- Khớp **theo từng cột**, không theo cả tệp: cột có khoá đã xuất hiện trong một lần nhập đã ghi thì lấy đích, phép biến đổi
  và bảng quy đổi của lần **mới nhất** có khoá ấy; cột chưa thấy bao giờ đi từ điển như cũ (ADR-0011 «khớp một phần → chỉ
  gửi cột và giá trị mới»). Khớp trọn là trường hợp mọi cột đều có khoá trong bộ nhớ. Thứ tự cột trong tệp không quan
  trọng.
- Mẫu áp xong vẫn qua `validatePlan`: cột mà đích hay phép biến đổi nhớ được không còn hợp lệ trên ô mới (ví dụ phép đổi
  đơn vị giá gặp cột toàn chữ) thì cột ấy về từ điển, có lý do.
- Dòng tiêu đề (`headerRow`) không nhớ: lõi dò lại trên tệp mới.

### Bộ nhớ chứa gì, không chứa gì

Chỉ: khoá tiêu đề → đích, phép biến đổi, bảng quy đổi giá trị. Bảng quy đổi **bị bỏ** với cột lớp nguồn (lõi đã chặn ở
kế hoạch) và cột lớp «tên người» (máy chủ bỏ thêm khi trả mẫu) — ADR-0011: bộ nhớ không bao giờ chứa giá trị của cột nguồn
hay cột tên người. Mẫu trả về qua API không mang ô, không mang dòng, không mang tên tệp.

### Sửa của người vào bộ nhớ

- Đổi đích cột ở bước ghép: đã vào `plan` khi mở lần nhập → ghi xong là nhớ.
- **Sửa ô ở bước xem trước**: với cột lớp danh mục hay hàng chia sẻ được, sửa một ô «cần người» mà giá trị mới được lõi
  nhận thì thêm cặp «nguyên văn → giá trị» vào bảng quy đổi của cột trong kế hoạch và áp lại; lần nhập sau nhận luôn.
  **Hỏi-2**: máy khuyên mọi ô cùng nguyên văn của cột trong tệp đang nhập đổi theo, màn báo «Đã đổi theo K ô cùng chữ» để
  người soát trước khi ghi; lối khác: chỉ đổi ô được sửa, học cho lần sau. Cột nguồn, tên người, chữ tự do, chưa rõ: sửa ô
  chỉ đổi ô ấy, không vào kế hoạch.
- Chỉ lần nhập **đã ghi** (`committed`) mới dạy bộ nhớ; lần xem thử rồi bỏ không dạy.

### Đo (Hỏi-3)

Ba số mỗi lần nhập, đọc từ kế hoạch đã lưu ở `imports` (không đọc ô): cột theo mẫu · cột người đổi đích · tổng cột —
hàm thuần `doMau(plan)` của lõi và lệnh `_acceptance/nhap-nho-mau/thu/do-mau.mjs` đọc các lần đã ghi của một sàn. Ngưỡng
đề xuất: SỐNG ≥ 90% cột theo mẫu và ≤ 1 cột đổi khi nhập lại cùng mẫu; CHẾT < 50% sau ba lần nhập. Lối khác: bỏ đo ở vòng
này.

### API

`GET /api/v1/imports/templates` — vai nhập (Đầu chủ, Trưởng nhóm), sàn hiện tại (luật theo dòng): các cột đã nhớ, mỗi khoá
một dòng `{ headerKey, target, transform?, valueMap?, importId, at }` lấy từ lần nhập đã ghi mới nhất có khoá ấy. Vai khác
403 `import-role-required`. Màn gọi một lần khi mở tệp; lỗi thì màn chạy như chưa có bộ nhớ và báo một dòng.

### Màn

Bước «Ghép cột» thêm một dải báo trong khe đầu bước: «Ghép theo mẫu đã nhớ — N/M cột như lần nhập ngày …» và nhãn «theo
mẫu» ở từng cột nhớ được; cột về từ điển vì mẫu không hợp lệ có lý do ở dưới. Không thêm bước, không thêm trang: màn đi
khuôn `nhap-excel` đã duyệt. Trang quản mẫu (`imports/templates`) để hàng 50.

### Gộp từ Màn Nhập Excel (luật 50)

- **Ngoài-3**: bấm thanh bước khi máy chủ đang xem thử hay đang ghi bị khoá như nút Quay lại (hôm nay chỉ nút Quay lại
  ẩn; thanh bước vẫn cho đổi ô giữa lúc ghi, phần còn lại vẫn ghi theo bản cũ).
- **Ngoài-7**: thân lỗi có `error` không phải chuỗi (lỗi kiểm thân mặc định của Hono) vẫn là lỗi — không coi gói là đã ghi,
  không gọi `/imports/undefined/rows`.

## Đối chiếu ngành (ADR-0022)

| Năng lực | RESO | Follow Up Boss | Lofty | Ta làm | Ta cứng — họ cấu hình |
| --- | --- | --- | --- | --- | --- |
| Nhớ cách ghép cột giữa các lần nhập | Không có trong Data Dictionary (chuẩn trường, không chuẩn nhập) | Người ghép mỗi lần nhập; nhớ ghép hay không — chưa kiểm ([nguồn](https://help.followupboss.com/hc/en-us/articles/4402323033751)) | Máy tự ghép, người soát; nhớ theo tài khoản hay không — chưa kiểm ([nguồn](https://help.lofty.com/hc/en-us/articles/360001710831)) | Nhớ theo sàn, từng tiêu đề, lần ghi mới nhất thắng | Không: luật khớp không phải danh sách của sàn; quản mẫu (sửa, xoá) là dữ liệu của sàn ở hàng 50 |
| Nhớ cách gọi giá trị | `StandardStatus` ↔ `MlsStatus` — chuẩn cố định, nhãn của sàn neo vào | Chưa kiểm | Chưa kiểm | Bảng quy đổi của cột trong kế hoạch, học từ sửa ở bước xem trước | Không: giá trị đích vẫn là giá trị chuẩn của lõi; nhãn của sàn là dữ liệu |

Bảng đối chiếu ở [Đối chiếu ngành §11](../../product/doi-chieu-nganh.md#11-nhập-file-bảng-tính) đã ghi «chưa thấy sản phẩm
nào nhớ cách ghép theo sàn (chưa kiểm)» — vòng này không tra thêm, không thêm dòng «ta cứng — họ cấu hình».

## Đặc tả UX

<!-- ux-spec:begin -->
- **Khuôn IA đã chọn + căn cứ**: giữ «Luồng nhiều bước» của nhóm `nhap-excel` (ADR-0024, `design/patterns/nhap-excel.md`);
  thêm một dải báo trong khe đầu của bước 2 — một luồng hiển nhiên, không tra mẫu.
- **Thẻ việc**: nhập lại tệp cùng mẫu với ít chỉnh tay nhất.
- **Trạng thái của dải báo**: không có mẫu (ẩn) · khớp một phần (N/M cột) · khớp trọn (M/M cột) · đọc mẫu lỗi (báo «Không
  đọc được mẫu đã nhớ — ghép theo từ điển»).
- **Khổ**: 1440 và 375; dải báo xuống dòng, không cuộn ngang.
<!-- ux-spec:end -->

## Ngoài phạm vi

- Màn quản mẫu file (sửa, xoá, đếm lượt dùng) — hàng 50 (S6), lúc ấy mới dựng `import_templates`.
- Từ điển giá trị dùng chung của sàn (`company_value_aliases`, cách gọi riêng ở Cài đặt sàn) — hàng 45/70.
- Tác tử AI cho cột chưa nhớ — hàng 68.
- Quên một mẫu, đặt tên mẫu.

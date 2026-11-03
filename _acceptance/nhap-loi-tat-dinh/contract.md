---
schema_version: 1
feature: Lõi đọc một bảng hàng bẩn và nói được từng cột là gì, từng ô ra giá trị chuẩn nào hay vì sao không đọc được — không cần AI — trên bộ file thử có đáp án
slug: nhap-loi-tat-dinh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [core]
status: implemented
design_doc: docs/superpowers/specs/2026-11-03-nhap-loi-tat-dinh-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-03T11:15:32Z
---

# Acceptance Contract: nhap-loi-tat-dinh

## Context

Hàng 64 của lộ trình (ND1, vai nền, đợt nhap-du-lieu-3110), dãy G của đợt dau-khach-nhap, đứng trên hàng 5 (bộ dữ liệu
mẫu, hai file bảng hàng) và hàng 9 (cách đọc mã căn, tra danh mục). ADR-0011 quyết định 1 (chế độ tất định là nền và dự
phòng), 7 (đo chế độ tất định trước — số nền quyết có dựng tác tử hàng 68 không), 12 (bộ chuẩn hoá là lớp chung của lõi
cho mọi cửa vào). Lõi thuần ở `packages/core/src/import/`, bộ thử ở `packages/core/test/import/`, số nền ở
`_acceptance/nhap-loi-tat-dinh/so-nen.json`. Không giao diện, không API, không cơ sở dữ liệu.

Hạng: máy suy **T2** (không tệp nào thuộc `t3_paths`); hàng lộ trình ghi **T2**.

Source input: `docs/plan/lo-trinh.json` hàng 64 · `_acceptance/nhap-loi-tat-dinh/opportunity.md` (Cổng Đáng «build»
02/11) · `docs/adr/0011-nhap-du-lieu-tac-tu.md` · `docs/architecture/nhap-du-lieu.md` §1, §3, §4, §9, §12, §13 · thiết kế
`docs/superpowers/specs/2026-11-03-nhap-loi-tat-dinh-design.md`.

«Bộ thử» dưới đây = hai file mẫu `packages/db/seed/mau/mau-a.xlsx`, `mau-b.xlsx` (đọc từ đĩa) và sáu file bẩn sinh tất
định từ `packages/db/seed/mau/du-lieu-mau.json`: `ban-tieu-de`, `ban-gia`, `ban-ma-can`, `ban-ngay-trang-thai`,
`ban-nguon-giau`, `ban-csv`. «Đáp án» của một file = dòng tiêu đề, đích từng cột, giá trị đúng từng ô và nhãn từng lỗi cấy,
suy từ dữ liệu mẫu — không suy từ mã đang kiểm.

## Criteria

- AC-1: Given `ban-tieu-de` — hai dòng tên bảng và một dòng trống trước tiêu đề (tiêu đề ở dòng 4), một nhóm tiêu đề hai
  tầng có ô gộp (ô cha rồi ô trống bên phải), một dòng trống giữa bảng, dòng «Tổng cộng» cuối — và `ban-csv` ở hai dạng
  byte (UTF-8 có BOM; Windows-1258), When giải mã và đọc bảng, Then dòng tiêu đề đúng đáp án, tiêu đề hai tầng ra «cha /
  con», đúng 40 dòng dữ liệu mang đúng số dòng gốc, dòng trống và dòng tổng không thành dòng dữ liệu; hai dạng csv ra cùng
  một bảng, từng ô bằng ô của `mau-a` sau chuẩn NFC.
- AC-2: Given ma trận cột viết trước — mỗi lớp tạm (`source`, `person_name`, `free_text`, `catalog`, `shareable_listing`,
  `unknown`) ít nhất một cột, và mỗi kiểu viết số điện thoại Việt Nam (0 hay +84 hay 84, ngăn bằng cách, chấm, gạch), email,
  số giấy tờ 9 và 12 chữ số trong một cột tiêu đề lạ — cùng mọi cột của hai file mẫu, When phân loại, Then mỗi cột ra đúng
  lớp đáp án; cột có một ô trúng bộ dò mà dưới 30% ra `free_text`, từ 30% ô số điện thoại ra `source`.
- AC-3: Given `mau-a`, `mau-b` và `ban-nguon-giau` (số chủ trong «Ghi chú», cột «Liên hệ» chứa số, tên chủ trong cột
  «Toà», số dạng +84 có dấu cách, email và số giấy tờ trong cột tiêu đề lạ), When dựng hồ sơ cột, Then bản JSON của hồ sơ
  không chứa giá trị nguồn hay dữ liệu cá nhân nào của file (tên và số mọi chủ nhà, mọi số, email, số giấy tờ cấy — ở cả
  dạng nguyên văn lẫn dạng chỉ chữ số); cột ngoài `catalog`, `shareable_listing` chỉ mang hình dạng, không giá trị; cột
  được gửi giá trị mang tối đa 300 giá trị — và vẫn mang giá trị thật của cột ấy (đối chứng: «Mã căn» của `mau-a` có mặt).
- AC-4: Given `mau-a.xlsx` và `mau-b.xlsx` đọc từ đĩa, When ghép tất định, Then 13/13 và 16/16 cột ra đúng đích đáp án
  (độ đúng ghép cột 100%), mọi cột có đích, `ignore_with_reason` chỉ ở cột số thứ tự, và kế hoạch qua bộ kiểm khuôn không
  lỗi.
- AC-5: Given ma trận đầu vào viết trước cho từng phép của thực đơn đóng (`price`, `fee_condition`, `area`, `unit_code`,
  `floor`, `bedrooms`, `direction`, `status`, `date`, `phone`, `text`) — mỗi dòng ghi đầu vào, tham số và kết cục đúng (giá
  trị chuẩn, có hay không lý do sửa; hay «cần người» / «chặn» kèm lý do), When chạy phép, Then mỗi dòng ra đúng kết cục; giá
  qua `docGia` của hàng 15, mã căn qua bộ đọc và danh mục của hàng 9 (mã đọc được mà không có trong danh mục ra «cần người»
  «chưa có trong danh mục», không đoán), số điện thoại qua `normalizePhone`.
- AC-6: Given kế hoạch hỏng ở từng chỗ (khoá lạ ở gốc, ở cột, ở phép; phép ngoài thực đơn; tham số sai; `ignore_with_reason`
  trên cột có dữ liệu không phải số thứ tự) và một kế hoạch hợp lệ trên `ban-ma-can`, When kiểm khuôn rồi áp kế hoạch, Then
  mỗi kế hoạch hỏng ra lỗi nêu đúng đường; áp kế hoạch hợp lệ hai lần ra cùng kết quả từng byte; mọi ô mang đúng một trong
  bốn dấu (giữ nguyên · máy sửa · cần người · chặn), ba dấu sau luôn có lý do; ô danh mục lệch danh mục của mã căn ra «cần
  người» nêu cả hai giá trị; hai dòng cùng mã căn chuẩn đều ra «cần người» nêu dòng kia.
- AC-7: Given ma trận chữ gõ tay viết trước («dong nam», «ĐN», «bp», «Đang gd», «a1-03», «4,65 tỷ»…) và một từ điển của
  sàn đưa qua ngữ cảnh, When gọi bộ chuẩn hoá một cửa `normalizeValue`, Then mỗi chữ ra giá trị chuẩn đúng đáp án; giá trị
  chỉ có trong từ điển của sàn được nhận khi có từ điển ấy và ra «cần người» khi không; mọi ô «giữ nguyên» hay «máy sửa» do
  áp kế hoạch sinh ra bằng đúng `normalizeValue` của cùng chữ, cùng trường (lần nhập và cửa gõ tay dùng một bộ).
- AC-8: Given bộ sinh file bẩn, When sinh hai lần, Then hai lần ra cùng từng byte; mỗi file bẩn có đáp án đủ (dòng tiêu đề,
  đích mọi cột, giá trị đúng mọi ô) và mỗi lỗi cấy một nhãn (dòng, cột, giá trị đúng hay «phải hỏi người»); giá trị đúng
  trong đáp án bằng trường tương ứng của `du-lieu-mau.json`; mọi số điện thoại trong file sinh chuẩn hoá về dạng
  `0900000xxx` và mọi tên người mang nhãn «[Mẫu]» (không dữ liệu cá nhân thật).
- AC-9: Given bộ thử, When chạy lệnh đo số nền, Then `_acceptance/nhap-loi-tat-dinh/so-nen.json` ghi bốn số đo của Kiến trúc
  §9 — độ đúng ghép cột, lỗi được sửa, lỗi lọt, tỉ lệ hỏi người — cho từng file và cộng dồn, mỗi số kèm tử và mẫu, cùng số
  giá trị nguồn lọt vào hồ sơ cột (phải 0); tệp đã commit bằng đúng lần tính lại trên cây hiện tại; hai file mẫu ghép 100%.
- AC-10: Given mọi tệp mã (không phải test) dưới `packages/core/src/import/`, When quét lời nhập và lời gọi, Then chỉ nhập
  đường tương đối trong `packages/core/src` — không `node:`, không gói npm, không `fetch`, không `process`, không đọc giờ
  máy (`Date.now()`, `new Date()` không đối số); bộ quét nêu đúng tệp và lời vi phạm khi gặp một lời như vậy.

## Coverage

Quét theo khuôn morphological-scan (preset test-matrix) cho không gian tiêu chí của lõi nhập tất định. Chân sản phẩm:
ADR-0011 quyết định 1, 7, 12 [SUY-TỪ-REPO: docs/adr/0011-nhap-du-lieu-tac-tu.md], Kiến trúc nhập dữ liệu §1–§4, §9, §12
[SUY-TỪ-REPO: docs/architecture/nhap-du-lieu.md], bộ mẫu hàng 5 [SUY-TỪ-REPO: packages/db/seed/mau/du-lieu-mau.json].
Chân ngành: ghép cột khi nhập CSV — người chọn trường từng cột, cột không khớp vào Notes hay Custom Field
[NGÀNH: Follow Up Boss — Import Contacts]; máy tự ghép rồi người soát [NGÀNH: Lofty — Lead Import]; tên trường theo RESO
Data Dictionary [NGÀNH: RESO DD 2.0].

- Trục bước của lõi: giải mã + đọc lưới (AC-1) | phân loại cột (AC-2) | hồ sơ cột (AC-3) | ghép tất định (AC-4) | thực đơn
  phép biến đổi (AC-5) | kiểm khuôn + áp kế hoạch (AC-6) | bộ chuẩn hoá một cửa (AC-7) | bộ thử (AC-8) | số nền (AC-9) |
  không I/O, không AI (AC-10) [thước CE: luồng ở Kiến trúc §2 và bảng ranh giới §1 — mỗi việc «Mã» của bảng có một AC;
  việc «Tác tử», «Máy chủ», «Ghi» thuộc hàng 65–68]
- Trục loại bẩn: tiêu đề và cấu trúc (AC-1, AC-4) | giá và phí (AC-5) | mã căn và danh mục (AC-5, AC-6) | ngày và trạng
  thái (AC-5) | nguồn giấu (AC-2, AC-3) | mã hoá csv (AC-1) [thước CE: bảng sáu file bẩn ở Kiến trúc §9]
- Trục lớp cột: `source` | `person_name` | `free_text` | `catalog` | `shareable_listing` | `unknown` (AC-2, AC-3)
  [thước CE: bảng lớp tạm ở Kiến trúc §3; trần lớp ở `packages/core/src/data-classes.ts`]
- Trục dấu ô: giữ nguyên | máy sửa | cần người | chặn (AC-5, AC-6, AC-7) [thước CE: ADR-0011 quyết định 1 «mỗi ô mang một
  trong bốn dấu»]
- Later: màu ô và gạch ngang thành cột ảo (bộ đọc file hàng 65); đọc xlsx/xls trên trình duyệt (hàng 65 chọn thư viện);
  kiểm trùng với hàng đang mở (máy chủ, hàng 65); từ điển và mẫu của sàn lưu ở cơ sở dữ liệu (hàng 67, 70); ngưỡng của bốn
  số đo (Cổng Đáng hàng 68); tác tử và khách AI giả (hàng 68).
- Never: tác tử đọc cả file trả dòng sạch (ADR-0011, lối A bị loại — trái bất biến 2); băm số chủ để so trong hồ sơ
  (ADR-0011 quyết định 2: băm số đảo ngược được).

## Out of scope

- Không đọc tệp xlsx/xls trong lõi và không thêm thư viện đọc file — hàng 65 chọn thư viện (thêm thư viện là sửa
  `package-lock.json`); bộ thử đọc hai file mẫu bằng bộ đọc chỉ-để-thử ở `packages/core/test/import/`.
- Không màn, không API, không bảng, không ghi, không hoàn tác, không nhớ mẫu, không tác tử.
- Không đặt ngưỡng cho bốn số đo trên file bẩn — chỉ ghi số nền; ngưỡng là của Cổng Đáng hàng 68.
- Không xuất lõi nhập ra gốc gói `@quy-hang/core` (`package.json`, `src/index.ts` ngoài vùng) — hàng 65 thêm lối xuất.
- Không áp luật chuyển trạng thái cho hàng nhập (hàng mới bắt đầu «Chưa đủ để rao», dòng «Đã bán» mặc định không nhập) —
  hàng 65.

## Notes

- Vùng của hàng: `packages/core/src/import/**`, `packages/core/test/import/**`, `_acceptance/nhap-loi-tat-dinh/**` (vùng
  gốc ở `hang-viec.json`) cộng thiết kế, kế hoạch và trang Đối chiếu ngành (chỉ thêm mục) — khai bằng `hang vung` ở S1.
- Test chạy trong `npm test -w @quy-hang/core` (mẫu `src/**/*.test.ts`), nên ca kiểm đặt ở `src/import/*.test.ts` và nhập
  bộ thử từ `test/import/`.

---
schema_version: 1
feature: Đầu chủ phát góc nhìn đang lọc ra ảnh, PDF hay Excel theo mẫu, kèm bài chép theo kênh; không cột nội bộ nào ra ngoài
slug: phat-hang
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api, db]
status: approved
design_doc: _acceptance/phat-hang/design.md
approved_by: Manh Phan
approved_at: 2026-11-04
---

# Acceptance Contract: phat-hang

## Context

Hàng 43 của lộ trình (dãy H, đợt `dau-khach-nhap`), mã phạm vi P6; đứng trên hàng 14 (bảng hàng, góc nhìn) và 31 (luật
ẩn, cửa `phat_hang`). Khối đích `dialog-5` (vo-va-ia §2). Hàng lộ trình khai T2; hồ sơ là T3 vì thêm migration bảng
`exports` (lần xuất) cho số đo «Số lần xuất bảng hàng» (luật đợt 35). Thiết kế và bốn câu chỉ người quyết: `design.md`
§7 (Hỏi-1 … Hỏi-4). Hợp đồng viết theo khuyến nghị.

## Criteria

- AC-1: Given đầu chủ hay trưởng nhóm đang ở bảng hàng trên máy tính với một cách xem (lọc, cột, sắp) và k căn đang tích
  (k ≥ 0), When bấm «Xuất bảng hàng» trên thanh bảng hàng, Then hộp thoại bốn bước mở với tập căn là k căn đã tích khi k > 0,
  hay mọi căn đang hiện theo bộ lọc khi k = 0; khi không căn nào hiện thì nút tắt kèm lời «Không có căn nào để xuất»;
  vai khác và khổ điện thoại không có nút; «Xuất bảng hàng» ở menu Tạo đưa về bảng hàng và mở hộp thoại với cách xem mặc định.
- AC-2: Given hộp thoại đã mở với n căn, When đi qua các bước, Then bước 1 có đúng năm mẫu — Bài Zalo, Bài Facebook,
  Excel, Ảnh, PDF — trong đó Bài Zalo, Bài Facebook, Ảnh bị khoá kèm lời «Quá 30 căn — dùng Excel hay PDF» khi n > 30;
  bước 2 có hai người nhận Nhóm môi giới (chọn sẵn) và Khách riêng; bước 3 xem trước đúng nội dung sẽ ra; quay lại bước
  trước được.
- AC-3: Given góc nhìn đang hiện các cột theo một thứ tự và một quy sắp, When xem trước bản xuất cho một người nhận, Then
  bản xuất có đúng các cột đang hiện mà luật ẩn cho người nhận ấy được ra, giữ thứ tự cột và thứ tự dòng của góc nhìn;
  mỗi cột đang hiện mà luật ẩn không cho ra được liệt bằng nhãn ở dòng «Cột không ra ngoài: …»; trường riêng của sàn
  không kèm.
- AC-4: Given mẫu Bài Zalo hay Bài Facebook, When bấm «Chép bài», Then bài đúng khuôn của kênh (Zalo: một dòng một căn;
  Facebook: dòng đầu tên sàn, mỗi căn một khối cách dòng; không biểu tượng cảm xúc, không định dạng đậm) nằm trong bộ nhớ
  tạm và hộp thoại báo «Đã chép bài»; hệ thống không gửi, không đăng bài ở đâu.
- AC-5: Given mẫu Excel, When bấm «Tải file», Then máy tải `bang-hang-<ngày>.xlsx` một sheet: dòng đầu là nhãn cột, mỗi
  căn một dòng với giá trị đã định dạng như bảng hàng; tệp mở được bằng một bộ đọc độc lập và đọc lại ra đúng bảng đã
  xem trước.
- AC-6: Given mẫu Ảnh (n ≤ 30) hay PDF, When bấm «Tải file», Then máy tải `bang-hang-<ngày>.png` là ảnh của bảng đã xem
  trước, hay `bang-hang-<ngày>.pdf` gồm các trang ảnh của bảng mở được bằng trình đọc PDF, số trang theo số căn; chữ
  tiếng Việt có dấu đọc đúng.
- AC-7 (cross-layer): Given một căn mồi có mọi trường nội bộ mang giá trị đánh dấu (chủ nhà, số điện thoại, giá đáy, ảnh
  sổ, liên hệ, lý do rút, người giữ, giá chốt, trường riêng), When dựng bản xuất qua đường của trang cho cả năm mẫu × hai
  người nhận, Then không giá trị đánh dấu nào của trường không được ra có trong bài, bảng xem trước, tệp Excel, chữ vẽ lên
  ảnh hay PDF; khách riêng không thấy mã căn, chỉ thấy toà và tầng cao / thấp; hộp thoại xuất bảng hàng có bài kiểm rò rỉ riêng quét
  cả đầu ra lẫn mã nguồn của nó.
- AC-8 (cross-layer): Given người chép bài hay tải file thành công, When lần ấy xong, Then máy chủ ghi đúng một lần xuất của sàn đang
  làm: người xuất, mẫu, người nhận, số căn, lúc xuất — không nội dung, không danh sách căn; người sàn khác không đọc,
  không ghi được lần xuất của sàn này; vai API không sửa, không xoá; ghi hỏng thì bài hay file vẫn có và hộp thoại báo
  «Chưa ghi được lần xuất».
- AC-9: Given các lần xuất trong một kỳ, When tính số đo hai tuần thử, Then mã «Số lần xuất bảng hàng» ra đúng số lần
  xuất trong kỳ (theo lúc xuất, cận dưới tính, cận trên không tính) và không còn mang «chưa có sự kiện»; kỳ không có lần
  xuất nào ra 0.

## Out of scope

- Sàn tự chỉnh mẫu xuất bảng hàng, mẫu bài (Cài đặt sàn, mục 50) — hàng sau; bản đầu dùng mẫu dựng sẵn ở lõi (Tham chiếu §7).
- Kèm trường riêng của sàn khi xuất cho đội khác (bật từng trường) — hàng sau (Hỏi-2).
- PDF có lớp chữ chọn được, tìm được — chỉ khi chủ kho đổi Hỏi-3.
- Xuất bảng hàng trên điện thoại (Tham chiếu §9).
- Lưu nội dung hay danh sách căn của lần xuất, xem lại «Đã xuất» — chưa hàng nào cần.
- Xếp hàng gửi lại lần xuất ghi hỏng khi mất mạng.
- Route API ra ngoài sàn (luật đợt 39) — hàng này không mở route nào.

## Coverage

- Trục mẫu × người nhận: 5 × 2 = 10 ô — AC-2 (có mặt), AC-7 (không rò rỉ ở cả 10 ô).
- Trục nguồn tập căn: đã tích k > 0 · không tích · không căn nào · từ menu Tạo — AC-1.
- Trục cột: cột được ra · cột bị luật ẩn bỏ · thứ tự cột · thứ tự dòng — AC-3.
- Trục cỡ: n ≤ 30 · n > 30 (ảnh, bài khoá) — AC-2, AC-6.
- Trục đầu ra: bộ nhớ tạm · .xlsx · .png · .pdf — AC-4, AC-5, AC-6.
- Trục ghi: thành công · hỏng · sàn khác · sửa/xoá — AC-8.
- Trục số đo: có lần xuất · kỳ trống · cận kỳ — AC-9.

## Đường đo

- «Số lần xuất bảng hàng» (Tham chiếu §11, ô cơ hội): đếm dòng bảng `exports` trong kỳ — AC-8 (ghi), AC-9 (tính).

## Notes

- Hỏi-1 … Hỏi-4: `design.md` §7; sổ quyết định.

# Phiên 01/11/2026 — thiết kế cấu hình theo sàn

Phiên thiết kế do phiên giám sát đợt dau-chu-dong-vao giao (Claude Code, MacBook Pro), 01/11/2026. Chỉ tài liệu, không
mã, không gói, không dịch vụ tốn tiền. Kết quả: ADR-0018 (đề xuất), `docs/architecture/so-diem-bien-thien.md`,
`docs/plan/pham-vi-cau-hinh-theo-san.md`, hàng 81–82 và tám mục chờ điều kiện H8–H15 của lộ trình.

## Lời chủ kho (nguyên văn, giám sát chuyển, 31/10–1/11)

«trước đây sự thiếu linh hoạt thường mang lại thất bại và Quỹ hàng được thiết kế cho nhiều sàn/công ty sử dụng nên sự
đa dạng cách dùng và phương pháp… như cách một công ty SaaS thiết kế hệ thống: Metadata-driven architecture,
Multi-tenant, Custom objects/custom fields… Rules engine, Workflow engine, API-first». Chủ kho chọn mở phiên thiết kế.

## Khuyến nghị của giám sát (đầu vào, đã kiểm lại)

Hướng «khai báo có rào»: (1) sổ điểm biến thiên ở lõi; (2) bảng cấu hình theo sàn có luật theo dòng, đổi ghi sự kiện;
(3) luật nghiệp vụ dạng bảng quyết định ở điểm đã biết, bộ phép so cố định; (4) trường riêng kiểu hữu hạn, không lớp
nguồn, không trang khách; (5) bảng hàng, bộ lọc, ghép cột đọc từ sổ; (6) không đối tượng tự tạo, công thức, luồng tự
vẽ, kịch bản cho tới khi có số đo từ sàn thật; luật mở một điểm: ≥ 2 sàn thật hoặc Tham chiếu đã chốt mặc định.

## Đã kiểm trên mã (main 611df45 và nhánh đang chạy)

- Đã có: luật theo dòng + bộ kiểm cách ly; API một cửa; thoả thuận có trần lớp (`agreements.ts`, `data-classes.ts`);
  sáu trạng thái chuẩn (`listing/status.ts`).
- Mầm dữ liệu-là-cấu-hình: `UNIT_CODE_RULES` (hàng 9), `PROPERTY_SUBTYPE_FIELDS` (nhánh hàng 72, PR #45),
  `access/bang-xem-nguon.json` (bảng 12 ô đo cùng lúc lõi và SQL, hàng 11).
- Hằng số rải: `CALL_BACK_AFTER_DAYS = 14` (`listing/freshness.ts`, main); `DEFAULT_LEAD_DEADLINES` 15/30 phút
  (`routing/index.ts`, nhánh `claude/dcdv-l-25-chia-lead` 2c0a7cf, ghi «chỗ khai duy nhất; SQL và lối API không chép lại
  con số»). Migration 011 của nhánh ấy không có số phút nào — SQL nhận số từ ngoài.
- Thẻ Cổng Phạm vi hàng 25: máy từng tự chốt chia đều theo vòng, sửa thành câu hỏi Hỏi-5 vì «chuyện thu nhập của đầu
  chủ».
- Hàng 22, 23 (dãy G, H) chưa có nhánh mã lúc kiểm.
- `mayFlow` từ chối lớp `company_internal` đi ra; thoả thuận «Xử lý bằng AI» (ADR-0011) chỉ mở `catalog`,
  `shareable_listing` — nên định nghĩa trường riêng, nhãn riêng của sàn không gửi được cho nhà cung cấp AI nếu không mở
  thêm lớp.

## Kiểm kê

27 điểm mở hay đề xuất (25 mở, 2 đề xuất; 21 giá trị đơn, 6 đối tượng cấu hình), 5 ứng viên, 19 điều khoá — bảng đủ
nguồn ở `docs/architecture/so-diem-bien-thien.md`.

## Phản biện khuyến nghị của giám sát

- «Ai thấy hàng» là quyền, lớp khó đảo, kề bất biến 2 → khoá, không bảng quyết định.
- «Thuế phí» là số và tập con → tham số có kiểu đủ.
- Chia lead bản đầu chọn một luật dựng sẵn; bảng quyết định chờ sàn thứ hai khác hình luật.
- Thêm cột «ghi đè dưới sàn» (phí môi giới từng căn, mức chia từng bộ — Tham chiếu §13).
- Sổ khai cả điều khoá.
- Hàng nền không chặn dãy đang chạy; hàng 81 gom hằng số sau khi 22, 23, 25 gộp.

## Mã của đợt cau-hinh-theo-san-0111

CH1–CH5 thành hàng 81, 82; CH6–CH13 thành mục chờ điều kiện H8–H15.

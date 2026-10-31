# Phiên 31/10/2026 — thiết kế nhập dữ liệu có tác tử

Phiên thiết kế do phiên giám sát đợt nen-2 giao (Claude Code, MacBook Pro), 31/10/2026. Kết quả: PR #36 — ADR-0011,
`docs/architecture/nhap-du-lieu.md`, `docs/plan/pham-vi-nhap-du-lieu.md`.

## Lời giao (từ phiên giám sát, tóm)

Chủ kho muốn nâng nhập dữ liệu thành giai đoạn trọng tâm — giai đoạn quyết định chất lượng dữ liệu: làm tốt thì dữ liệu
gọn, sạch, sửa được các lỗi thường gặp; đề xuất dùng tác tử AI với một mô hình LLM mạnh. Phiên thiết kế, không viết mã;
trả lời sáu câu: ranh giới LLM, bất biến 2 và Luật Bảo vệ dữ liệu cá nhân, Google Sheets, chạy ở đâu và chi phí, học theo
sàn, đo chất lượng.

## Lời chủ kho (nguyên văn)

- «Tôi có ý này không biết nó nằm ở giai đoạn import hay giai đoạn nào? Chúng ta giúp cho chủ sàn enrich vậy có cách nào
  giúp chuẩn hoá dữ liệu luôn không? Thông qua tác tử ai hay thông qua cơ chế nào phù hợp? Tôi muốn hỏi điều này vì nguồn
  nhập bằng tay và mỗi sàn thường nhập có thể sai lỗi chính tả, viết tắt,...»
- Sau đề xuất «chuẩn hoá là lớp chung của lõi, AI chỉ dọn từ điển»: «Duyệt hướng này».
- Sau khi được hỏi duyệt phần còn lại của ADR-0011 để cắt lượt: «Duyệt, cắt lượt».

## Đã kiểm (31/10)

- Anthropic: không dùng dữ liệu API để huấn luyện; chính sách thương mại tự xoá đầu vào, đầu ra trong 30 ngày, giữ tới 2
  năm nếu bị gắn cờ an toàn; ZDR xin riêng; Batch API giữ 29 ngày, ngoài ZDR; vùng suy luận `global` hoặc `us` (×1,1 giá),
  nơi lưu chỉ `us`.
- Luật 91/2025/QH15 hiệu lực 1/1/2026: chuyển dữ liệu cá nhân ra nước ngoài phải lập hồ sơ đánh giá tác động, nộp trong
  60 ngày (bình luận luật, chưa đọc văn bản gốc).
- Vercel Hobby: hàm tối đa 300 giây. Google: `drive.file` không nhạy cảm; `spreadsheets.readonly` nhạy cảm.
- Hai file mẫu hàng 5: hồ sơ cột đã che ~1.460 và ~1.950 ký tự; chưa đo token thật (không có khoá API).

## Phản biện context sạch (tóm)

Năm câu hỏi và ba mâu thuẫn: ai được nhập và ai giữ căn; trạng thái từ file với bảng chuyển; hoàn tác với nấc cuối; so
băm số chủ là thêm chỗ giữ nguồn; «vượt nền» là biên hay ngưỡng; trùng với luật 20; luật 9 đóng dấu xác nhận hôm nay;
loại kết nối `spreadsheet` có sẵn. Đã sửa vào ADR-0011 quyết định 2, 7, 8, 11.

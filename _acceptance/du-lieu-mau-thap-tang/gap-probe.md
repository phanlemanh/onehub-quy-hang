---
slug: du-lieu-mau-thap-tang
at: 2026-11-05T05:40:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ «nạp vào chính sàn mẫu» ghi căn cứ mục tiêu nhưng câu trích chỉ liên quan, không quyết; lý do thật (kiểm trùng chạy trong một công ty) chưa ghi; hệ quả không gỡ riêng được chưa trình | Người ký duyệt nạp chung sàn trên căn cứ sai loại; sau này tách sàn thì ca trùng chéo bộ mất nghĩa mà không dòng sổ nào cảnh báo | Dòng sổ mới nguồn một-lối nêu ràng buộc cách ly; Out of scope nêu không gỡ riêng | fixed: dòng sổ mới thay d-20261105T050947Z-5 (một-lối: cách ly theo công ty); thêm mục Out of scope «Gỡ riêng phần thấp tầng»; design nêu hệ quả |
| P1 | evals | E5 chỉ đo nhãn căn đích, không đo chữ của cách viết có đúng số nhà, số đường, phường của căn; kiểu HXH chưa ghim đáp án | Bộ sinh in nhầm số của căn kề vào chuỗi gắn căn khác ở cặp gần trùng; E5 vẫn xanh | Tách số nhà theo khuôn đóng, so với căn đích; phá thử tráo chuỗi cặp gần trùng | fixed: E5 thêm quan hệ chuỗi ↔ căn đích với mọi cách viết, kiểu HXH giữ đủ cấp hẻm, phá thử «chuỗi lệch căn đích»; AC-5 thêm vế |
| P1 | evals | E6 không đo quan hệ ô thật trong file ↔ đáp án | Bộ ghi lệch dòng hay ghi giá của lô kề; đáp án vẫn đúng theo dữ liệu nên E6 xanh | Ô sạch bằng thẳng, ô bẩn giải theo nhãn ra giá trị đúng; phá thử tráo ô giá hai dòng | fixed: E6 thêm quan hệ ô ↔ đáp án qua bộ giải đóng theo nhãn, mã lô hay địa chỉ của dòng chỉ đúng căn; phá thử «ô lệch đáp án»; AC-6 thêm vế |
| P1 | evals | Bài quét tên đường của E8 chỉ bắt chuỗi có chữ «Đường» | «45 Lê Lợi, P. Bến Thành» lọt quét | Quét danh sách trắng trên mọi chuỗi địa chỉ | fixed: E8 đổi sang danh sách trắng (số nhà, Đường Mẫu N, tên trong bảng trích, từ khoá đóng); phá thử hai dạng không chữ «Đường»; AC-8 sửa vế |
| P1 | evals | E9 chỉ đo nạp thấp tầng trên cơ sở dữ liệu trống | Máy đã có bộ hàng 5 thì bộ nạp tạo sàn mẫu thứ hai mà E9 vẫn xanh | Nhánh nạp hàng 5 trước; đúng một sàn; hai bộ cùng có mặt | fixed: E9 thêm nhánh thứ tự ngược và phá thử «hai sàn mẫu»; AC-9 thêm vế |

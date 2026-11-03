---
slug: luat-an-va-kiem-ro-ri
at: 2026-11-03T11:25:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

# Phản biện context sạch — luat-an-va-kiem-ro-ri

Một tác tử tươi đọc đúng sáu tệp (design, contract, evals, sổ quyết định, bài học từ hồ sơ trước, ô cơ hội), không đọc mã.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Sổ ghi máy quyết rằng khách riêng vẫn thấy diện tích, phòng ngủ, hướng — câu luật 24 chỉ quyết vị trí, không quyết đặc điểm; đây là đánh đổi chỉ người có ([va-he-bo-cuc#F1], [goi-tu-may-tinh#F1]) | Trang khách hiện toà · tầng cao · 74,5 m² · hướng Đông Nam; khách khớp ra một trục và đi vòng; E4 vẫn xanh vì chỉ đo bốn khoá vị trí | Hỏi-3 nguồn chỉ-người, AC-4 theo Hỏi-3, E4 so nguyên tập khoá của khách riêng | fixed: dòng sổ Hỏi-3 thay dòng S1-4; AC-4 ghi «theo Hỏi-3»; E4 deepEqual danh sách khoá viết trước — human-gate1 chọn Hỏi-3 |
| P0 | contract | Sổ ghi máy quyết bảng trạng thái → tình trạng và giá (giá căn đã cọc, gộp Tạm ngưng vào «không còn»); cách đếm «X ngày trước» không có dòng nào | Căn tạm ngưng hiện «không còn» làm khách bỏ đi; trang khách ghi 9 ngày khi bàn làm việc ghi 10 | Hỏi-4 nguồn chỉ-người, AC-7 theo Hỏi-4, E7 có ô ranh giới ngày | fixed: Hỏi-4 thay dòng S1-10 (khuyến nghị tách «tạm ngưng»); đếm ngày dùng lại hàm freshness của lõi hàng — dòng sổ mục tiêu; E7 ba ô ranh giới ngày gọi hàm thật — human-gate1 chọn Hỏi-4 |
| P1 | evals | Rào cửa ra chỉ đo thư mục cứng và có một tệp kiểm; không thấy nhóm route, tệp kiểm rỗng, route API công khai | Hàng 35 đặt trang ở (khach)/s/[ma] hay thêm tệp kiểm rỗng — job ro-ri vẫn xanh | Đoán cửa ra theo URL sau khi bỏ nhóm route; tệp kiểm phải gọi canMoi, timRoRi; thêm packages/api/src/public | fixed: design §5, AC-9, E9 ma trận 6 ô (nhóm route, tệp rỗng, route API, trang không phải cửa ra); quan hệ «trang dựng từ banRaNgoai» ghi giới hạn đã biết — đo gián tiếp bằng quét mồi |
| P1 | evals | Ma trận cách viết số không trọn (gộp một ô); thiếu NFC | Tin soạn sẵn chứa «+84 900 000 071» mà bộ kiểm không trúng | Mỗi cách viết một cặp; thêm NFC; E5 chạy đủ cách viết trên hai số | fixed: E8 16 dạng × 2 = 32 assert; E5 2 số × 6 cách viết = 12 assert; design dùng lại normalizePhone của hàng 11 |
| P1 | evals | Bảng lớp của luật ẩn không round-trip với bảng gốc của lõi; ca đỏ theo lớp thiếu behavior | Một hàng sau xếp lại trường chủ nhà ở bảng gốc, luật ẩn vẫn đọc lớp cũ; khoá lớp behavior lọt | E2 so với OWNER_FIELDS, SOURCE_KEYS, COMPARTMENT_CLASS bằng import; ca đỏ đủ 5 lớp | fixed: design §2, AC-2, E2 (round-trip bằng import, ca đỏ đổi lớp ownerName, 5 lớp) |

---
slug: nhap-loi-tat-dinh
at: 2026-11-03T11:24:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

# Phản biện context sạch — nhap-loi-tat-dinh

Một tác tử tươi đọc đúng sáu tệp: thiết kế, hợp đồng, evals, sổ quyết định, bài học xuyên hồ sơ (claim-scan), ô cơ hội.
Kiểm chéo không ra lỗ: mười AC đều có eval; bốn trục Coverage đều có AC; không eval judgment; ba ngưỡng của ô cơ hội có
đường đo (AC-3, AC-4, AC-9); đường dẫn suy từ `import.meta.url`; sổ S1 không chạm việc khó đảo, căn cứ quyết đúng lựa chọn.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P1 | evals (E8) | AC-8 hứa giá trị đúng của mọi trường bằng du-lieu-mau.json, E8 chỉ so Mã căn và Giá | Bộ sinh lấy đáp án ngày, trạng thái, hướng bằng normalizeValue (mã đang kiểm) → số nền thổi phồng, Cổng Đáng hàng 68 quyết sai | Bảng ghép tay đích → trường du-lieu-mau phủ mọi cột, so từng ô, đếm; ca quét bộ sinh không nhập src/import | fixed: E8 so mọi cột có đích qua bảng ghép tay, đếm số lần so; thêm ca «bộ sinh không nhập mã đang kiểm» |
| P1 | evals (E1) | csv Windows-1258 do bộ sinh tự mã hoá; assert chuẩn NFC phía đầu ra | Bộ mã hoá và decodeText sai đối xứng vẫn xanh; ô NFD lọt sang hàng 65 | Vectơ byte viết tay theo bảng mã chuẩn, dấu tách rời, so với chuỗi NFC viết sẵn, không normalize đầu ra | fixed: thêm ca «giải mã: vectơ byte Windows-1258 viết tay», chiều đỏ bỏ NFC |
| P1 | evals (E3) | Danh sách cấm không khép theo chuẩn hoá (thiếu dạng 0…, lõi 9 chữ số, email chữ thường) | Hồ sơ ghi số đã chuẩn hoá 0900000012 trong khi danh sách chỉ có 84900000012 → lọt mà xanh | Mỗi số ba dạng, mỗi email hai dạng, đếm phần tử danh sách | fixed: E3 dựng danh sách ba dạng/hai dạng, assert số phần tử, thêm chiều đỏ ghi mẫu số chuẩn hoá |
| P2 | evals (E10) | Ma trận vi phạm thiếu new Date(), import động, require | Bộ quét không bắt new Date(), apply đọc giờ máy, số nền chập chờn | Một phần tử cho mỗi loại AC-10 kê cộng biến thể, đối chứng sạch new Date(x) | fixed: ma trận chín phần tử, đối chứng sạch |
| P2 | evals (E5, E7) | Quan hệ với bộ đọc hàng 9, hàng 18 chỉ đo cho giá; E7 chỉ so ô keep/fixed | Bộ đọc mã căn thứ hai khớp ma trận nhưng lệch hàng 9; apply có nhánh needs_person riêng | So từng dòng unit_code/phone với lookupUnit/normalizePhone; E7 so cả bốn dấu | fixed: E5 thêm vế quan hệ với lookupUnit và normalizePhone; E7 so mọi ô cả bốn dấu trừ hai luật cấp dòng |

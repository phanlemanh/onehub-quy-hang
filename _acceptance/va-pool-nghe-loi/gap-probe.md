---
slug: va-pool-nghe-loi
at: 2026-11-06T05:20:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

# Phản biện context sạch — va-pool-nghe-loi

Một tác tử tươi đọc đúng design doc, contract, evals, sổ quyết định, ô cơ hội và tệp bài học từ hồ sơ trước.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Trục kết nối thiếu ô «đã mượn, giữa hai truy vấn» — pg-pool gỡ trình nghe rảnh khi cho mượn | pooler cắt đúng lúc withCompany giữ kết nối; kết nối phát error không ai nghe, phiên bản vẫn sập, E1–E7 xanh | thêm ô vào Trục B và AC + ca script có đối chứng chết | fixed: Trục B ba ô theo pg-pool 3.14; AC-6 + E8 (kết nối đã mượn, đối chứng pool trần); dungPools gắn trình chặn lặng trên kết nối mới; dòng sổ thay d-3 |
| P1 | evals | E3 không ghim tiến trình con nạp dungPools thật, không có chiều đỏ | bài thử tự dựng pool trong .mjs, ca xanh dù dungPools thật không nghe lỗi | ghi cơ chế nạp và chiều đỏ bỏ trình nghe | fixed: E3/E8 nạp dungPools thật bằng node --import tsx; chiều đỏ bỏ trình nghe → tiến trình con thoát khác 0 |
| P2 | contract | Ngưỡng «một dòng lỗi» của ô cơ hội không có đường đo | trình nghe ghi lặp mà E3 vẫn xanh | section Đường đo, assert đúng một dòng | fixed: section Đường đo bốn ngưỡng; E3 assert đúng một dòng của pool cho một kết nối rảnh |
| P2 | evals | Không đo tiền đề «chỉ dungPools dựng pool» | một new Pool khác trong máy chủ web vẫn sập, mọi eval xanh | bài quét nơi dựng pool có đối chứng | fixed: AC-7 + E9 quét apps/web/src và packages/api/src, chiều đỏ tệp mồi |
| P2 | contract | AC-3 đi qua backend thật mà thiếu tag cross-layer; AC-2 bỏ mã lỗi | eval lớp đơn vị đủ cho AC-3; dòng nhật ký thiếu mã mà E2 vẫn xanh | tag cross-layer; mã lỗi vào AC-2/E2 | fixed: AC-3, AC-6 gắn (cross-layer), E3/E8 layer backend-effect; AC-2 và E2 có mã ECONNRESET |

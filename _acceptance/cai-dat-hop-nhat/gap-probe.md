---
slug: cai-dat-hop-nhat
at: 2026-11-04T10:39:27Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ -5 ghi máy quyết cách chặn người không quản trị mở mục sàn, nhưng câu trích chỉ liên quan, không quyết người ấy thấy gì — nghĩa người dùng thấy | Đầu chủ nhận đường dẫn /settings/users, bị chuyển lặng về Cá nhân, tưởng đường dẫn hỏng | Đổi thành câu Hỏi có khuyến nghị và lối khác; AC-5, E5, E11 ghim theo câu trả lời | human-gate1: Hỏi-1 (dòng sổ mới supersedes -5); nháp theo khuyến nghị «chuyển về Cá nhân kèm câu báo»; AC-5, E5, E11 ghim chữ câu báo |
| P1 | contract | Ngưỡng SỐNG «hai lần bấm từ cả hai đường vào» không có mục Đường đo; quản trị đi từ menu tài khoản tới mục sàn mất ba lần bấm | Phiên nghiệm thu: quản trị đi từ menu không đạt SỐNG dù mọi eval xanh | Mục Đường đo; eval đếm số lần bấm | fixed: thêm mục «Cài đặt sàn» vào menu tài khoản của quản trị (dòng sổ mới), mục «## Đường đo», E11 đếm soLanBam; việc sàn trên điện thoại theo Hỏi-2 ghi ở Đường đo |
| P1 | evals | Tab điện thoại người chỉ quản trị: hai tab cùng dưới /settings, E3b thiếu ô; nhãn «Cài đặt sàn» của Hỏi-2 bị đổi không ghi sổ | Cả hai tab cùng sáng; nhãn «Cài đặt» cạnh «Tôi» gây nhầm | Ma trận đường × tab, chiều đỏ so tiền tố; cảnh 390 cho người chỉ quản trị | fixed: dòng sổ mới (supersedes -8) giữ nhãn tab «Cài đặt sàn»; E3b ma trận 4 × 2, AC-8 ghim tab sáng; E11 thêm e11-quan-tri-390 |
| P1 | evals | «Mọi màn Đọc» hẹp lại chỉ có lý do lint, không dòng sổ, không kể Ô nhận lead; E11 chỉ đo Cá nhân | Ô nhận lead bị bó 48rem mà chủ kho không biết; mục sàn tự bọc lớp khác vẫn trải rộng | Dòng sổ cho phạm vi; E11 đo Ô nhận lead, một mục sàn, một trang tạm | fixed: dòng sổ mới (supersedes -6) kể tên Ô nhận lead; AC-7 và design §4 kể tên; E11 thêm e11-doc-1440 ba màn |
| P2 | evals | E6 chỉ đo bảng chữ, không đo mỗi màn hiện đúng câu phạm vi | Trang quên dựng dòng phạm vi, E6 vẫn xanh | Bài quét mọi page.tsx dùng bảng; E11 đo phamVi và «trên máy này» | fixed: E6 thêm bài quét có chiều đỏ; E11 e11-ca-nhan-1440 thêm phamVi và «trên máy này» |

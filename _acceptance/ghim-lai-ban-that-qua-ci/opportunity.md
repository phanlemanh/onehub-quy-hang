---
schema_version: 1
slug: ghim-lai-ban-that-qua-ci
feature: "Thêm một lượt chạy bằng tay trên GitHub (environment production) ghim lại một hồ sơ nghiệm thu cần biến của bản thật: lấy chuỗi kết nối và khoá từ bí mật GitHub, chạy làn ghim lại cho đúng một hồ sơ trên nhánh của PR, đẩy dòng ghim về nhánh ấy; không in bí mật, không chạy bộ kiểm ghi nào trên bản thật; chủ kho chỉ bấm chạy và duyệt environment."
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-07     # ISO UTC — chủ kho gõ ở phiên Q 07/11 «Mở hàng nút CI»; giám sát mở hàng (Q-11)
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: ghim-lai-ban-that-qua-ci
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng ghim-lai-ban-that-qua-ci của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Thêm một lượt chạy bằng tay trên GitHub (environment production) ghim lại một hồ sơ nghiệm thu cần biến của bản thật: lấy chuỗi kết nối và khoá từ bí mật GitHub, chạy làn ghim lại cho đúng một hồ sơ trên nhánh của PR, đẩy dòng ghim về nhánh ấy; không in bí mật, không chạy bộ kiểm ghi nào trên bản thật; chủ kho chỉ bấm chạy và duyệt environment.

Vì sao: PR #192 (va-thuoc-ci-moi-truong-that-ban-that) chờ ghim lại hồ sơ moi-truong-that, lệnh cần chuỗi kết nối và khoá của bản thật. Máy không đọc được bí mật (luật quyền chặn .env*, chặn dò bí mật GitHub); chủ kho không phải developer nên không tự chạy lệnh. Bí mật bản thật đã nằm ở environment production của GitHub (job deploy, nút nạp mẫu dùng).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Hồ sơ moi-truong-that ghim lại xanh bằng một lượt bấm trên GitHub, PR #192 gộp được; không bí mật nào rời GitHub, không bộ kiểm ghi nào chạy trên bản thật» chưa?
- Kết quả nào là SỐNG: [đề xuất] Hồ sơ moi-truong-that ghim lại xanh bằng một lượt bấm trên GitHub, PR #192 gộp được; không bí mật nào rời GitHub, không bộ kiểm ghi nào chạy trên bản thật
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Hồ sơ moi-truong-that ghim lại xanh bằng một lượt bấm trên GitHub, PR #192 gộp được; không bí mật nào rời GitHub, không bộ kiểm ghi nào chạy trên bản thật» khi hết timebox
- Timebox: …

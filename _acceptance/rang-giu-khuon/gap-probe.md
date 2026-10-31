---
slug: rang-giu-khuon
at: 2026-10-31T11:40:00Z
verdict: findings
p0: 3
p1: 2
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals E1–E3, E7 · AC-1 | Không eval nào chứng cấu hình eslint thật của kho bật luật mới ở mức error; E1–E3 tự dựng cấu hình | Luật không đăng ký hay ở mức warn, mọi eval vẫn xanh mà npm run lint không đỏ khi tiêm Frame | Ca chạy ESLint bằng cấu hình thật, tiêm trang Cài đặt nhập Frame ra 1 lỗi mức 2; calculateConfigForFile trả mức error | fixed: thêm E7b — ESLint cwd gốc kho thật với eslint.config.mjs, lintText trang settings/thu nhập Frame ra đúng 1 lỗi mức 2, calculateConfigForFile mức 2 cho một tệp mỗi nhóm |
| P0 | sổ d-2 | Câu trích chỉ quyết hai lớp; lớp --base không có căn cứ trong câu trích | Chủ kho tin cả ba lớp do lộ trình quyết | Tách dòng; lớp --base trích finding §11.4 | fixed: hai dòng mới thay d-2 — hai lớp trích ô cơ hội; lớp --base trích nguyên văn dòng S4 «kiem --base» của finding kit §11.4 |
| P0 | sổ d-6 | Bỏ chấm theo dòng ghi «một lối» trong khi lối kia sống | Chủ kho không thấy đánh đổi | Ghi lại căn cứ đúng | fixed: lật dòng bỏ — làm chấm theo dòng thêm/đổi trong hàng này, căn cứ dòng «im · nợ cũ trong tệp vòng chạm nhưng dòng thêm không lệch» của finding §11.5; AC-6 và E6 thêm ca nợ cũ cùng tệp |
| P1 | thiết kế lớp 3 · AC-6 · E6 | git diff bỏ qua tệp mới chưa theo dõi | Tệp màn mới chưa git add dựng lệch mà --base im | Thêm ca tệp mới chưa theo dõi | fixed: --base cộng git ls-files --others --exclude-standard; E6 ca (c) tệp mới chưa theo dõi phải đỏ |
| P1 | AC-7 · E7 | Chỉ bắt chỉ thị tắt mang tên luật; chỉ thị tắt trơn lọt | Tác tử thêm eslint-disable-next-line trơn, mọi thứ xanh | Lint cây thật với noInlineConfig, 0 lỗi luật | fixed: E7b lint apps/web/src với noInlineConfig: true phải ra 0 lỗi ban-do-khuon; AC-7 ghi vế ấy |

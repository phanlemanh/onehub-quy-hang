---
slug: va-bang-hang-cuon-so-lon
at: 2026-11-06T14:30:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract · evals · do-the.test.ts | Ô điện thoại × khe ẩn (hồ sơ đang mở, bảng thẻ gắn mà ẩn) chưa đo; E3 đo hàm chứ không đo bảng thẻ dùng hàm | Lần sửa sau nối sai phép đo trong bang-the.tsx, E1/E3/E4 vẫn xanh, điện thoại mở hồ sơ thì sập #185 | Khổ 375x812-ho-so: mở hồ sơ từ thẻ rồi đóng, đòi không #185 và còn «<N> căn» | fixed: AC-5 + E6 (khổ 375x812-ho-so); chiều đỏ đo tay 06/11 khi bỏ lớp ước lượng — sập #185 đúng thông điệp |
| P1 | design · d-2 · E1/E4 | Bước chuyển khe từ ẩn sang hiện (đổi khổ trên một trang) không đo; d-2 nói E1/E4 bắt mà không đúng | Thu hẹp cửa sổ thì khe điện thoại hiện ra trống | Khổ đổi khổ trên một trang 1366→375, đòi «<N> căn» và có thẻ | fixed: khổ «1366x768>375x812» vào E4 và AC-4; d-2 thay bằng dòng mới trỏ đúng bài đo |
| P1 | contract · design · evals | Lời phạm vi mâu thuẫn với lần lặp 2 (không gắn bảng thẻ trên máy tính) và không AC nào khoá việc không gắn | Bảng thẻ lại gắn trên máy tính, gánh nghe cuộn quay lại mà không ai thấy | AC «trên máy tính bảng thẻ không gắn», đếm [data-the-can] = 0 ở máy tính, đối chứng dương ở điện thoại | fixed: Context và Out of scope viết lại; AC-1 đòi 0 thẻ trên máy tính (E1), AC-4 đòi có thẻ ở điện thoại (đối chứng dương) |
| P1 | d-3 · AC-2 · opportunity | Hạ E11 xuống vế chức năng bằng một-lối trong khi lối A/B còn sống; vế «chấm ở #165» không có ràng buộc; ngưỡng ô cơ hội để trống | Bản sửa làm chậm Bảng hàng trong giới hạn không sập, vòng vẫn xanh | Đo A/B cùng lượt, hoặc dòng sổ trỏ ca E11 ở #165 và điều kiện chặn gộp | fixed: d-3 thay bằng dòng mới nêu vì sao A/B chết (build commit khác: cay-doi chặn trong cây, worktree + cài + build ngoài cây) và ràng buộc chặn ở #165 (làn ghim lại dừng khi E11 đỏ, lưới trước gộp đòi pin); ngưỡng ô cơ hội đã điền |
| P2 | evals · kiem-cuon.mjs | Bài đo trang phụ thuộc bộ thử dãy B dựng sẵn; chiều đỏ trên trang không có đầu ra lưu | Bộ thử bị dọn, E1/E2/E4/E6 thoát 2 dù bản sửa đúng | Bước tiền đề dựng bộ thử, lưu đầu ra đỏ | deferred: bộ thử dãy B do giám sát cấp cho D tới hết #165, giữ dựng suốt lượt chấm; thiếu bộ thử thì bài thoát 2 có thông điệp ghim — không xanh giả. Đầu ra hai lượt đỏ đo tay ghi nguyên văn ở design.md |

---
schema_version: 1
slug: cau-hinh-theo-san
feature: "Mỗi sàn giữ cấu hình riêng: đổi một điểm qua một lệnh API thành sự kiện chỉ thêm ghi người và vai, sàn chưa đổi thì nhận mặc định của sổ, đối tượng tạo sau lần đổi mang số mới còn đối tượng cũ giữ số lúc tạo, và sàn khác không đọc hay đổi được"
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-02T09:55:25Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 82
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 82 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/cau-hinh-theo-san-0111.md#1c5cf2675135487835527ef0631137a34455d447` — chưa có trang: trang nền, mã CH3, mã CH4, mã CH5

Mỗi sàn giữ cấu hình riêng: đổi một điểm qua một lệnh API thành sự kiện chỉ thêm ghi người và vai, sàn chưa đổi thì nhận mặc định của sổ, đối tượng tạo sau lần đổi mang số mới còn đối tượng cũ giữ số lúc tạo, và sàn khác không đọc hay đổi được

Vì sao: ADR-0018 quyết định 3, 4; Tham chiếu §4 «Cấu hình sàn: mọi thay đổi vào nhật ký, không sửa số đã lưu», luật 13; hàng 25 đã tạo bảng company_settings cho bốn khoá lead_routing.* — 82 thêm nhật ký sự kiện và mở bảng cho mọi khoá của sổ
Số đo hai tuần thử gần nhất (Tham chiếu §11): không đo trực tiếp — bản đầu chạy bằng mặc định; hàng này mở đường cho Cài đặt sàn (45–49) — ngưỡng số đặt trước khi thử.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Trên Postgres thử: quản trị sàn A đổi hạn nhận lead 15 → 20 phút; lead chia sau tính 20, lead chia trước giữ 15; vai khác → 403; ngoài khoảng → 400 nêu khoá; sàn B vẫn đọc 15; bộ kiểm cách ly có ca cho hai bảng cấu hình; sửa hay xoá sự kiện cấu hình bị chặn» chưa?
- Kết quả nào là SỐNG: [đề xuất] Trên Postgres thử: quản trị sàn A đổi hạn nhận lead 15 → 20 phút; lead chia sau tính 20, lead chia trước giữ 15; vai khác → 403; ngoài khoảng → 400 nêu khoá; sàn B vẫn đọc 15; bộ kiểm cách ly có ca cho hai bảng cấu hình; sửa hay xoá sự kiện cấu hình bị chặn
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Trên Postgres thử: quản trị sàn A đổi hạn nhận lead 15 → 20 phút; lead chia sau tính 20, lead chia trước giữ 15; vai khác → 403; ngoài khoảng → 400 nêu khoá; sàn B vẫn đọc 15; bộ kiểm cách ly có ca cho hai bảng cấu hình; sửa hay xoá sự kiện cấu hình bị chặn» khi hết timebox
- Timebox: …

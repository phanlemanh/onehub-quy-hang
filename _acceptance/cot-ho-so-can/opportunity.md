---
schema_version: 1
slug: cot-ho-so-can
feature: "Đầu chủ chọn một căn và thấy cột hồ sơ cạnh bảng: thuộc tính tự điền, lần rao, lịch sử giá và trạng thái ai sửa khi nào; thấy thuộc tính sai thì bấm «Báo sai thông tin căn»"
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-31T13:38:56Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 17
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 17 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã D4, mã D5

Đầu chủ chọn một căn và thấy cột hồ sơ cạnh bảng: thuộc tính tự điền, lần rao, lịch sử giá và trạng thái ai sửa khi nào; thấy thuộc tính sai thì bấm «Báo sai thông tin căn»

Vì sao: Màn P0 (2); luật 3: một căn một hồ sơ
Số đo hai tuần thử gần nhất (Tham chiếu §11): Tỉ lệ căn ở mức đủ cao nhất — ngưỡng số đặt trước khi thử.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Đầu chủ chọn một căn và thấy cột hồ sơ cạnh bảng: thuộc tính tự điền, lần rao, lịch sử giá và trạng thái ai sửa khi nào; thấy thuộc tính sai thì bấm «Báo sai thông tin căn»» chưa?
- Kết quả nào là SỐNG: [đề xuất] Đầu chủ chọn một căn và thấy cột hồ sơ cạnh bảng: thuộc tính tự điền, lần rao, lịch sử giá và trạng thái ai sửa khi nào; thấy thuộc tính sai thì bấm «Báo sai thông tin căn»
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Đầu chủ chọn một căn và thấy cột hồ sơ cạnh bảng: thuộc tính tự điền, lần rao, lịch sử giá và trạng thái ai sửa khi nào; thấy thuộc tính sai thì bấm «Báo sai thông tin căn»» khi hết timebox
- Timebox: …

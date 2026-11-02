---
schema_version: 1
slug: nhap-loi-tat-dinh
feature: Lõi đọc một bảng hàng bẩn và nói được từng cột là gì, từng ô ra giá trị chuẩn nào hay vì sao không đọc được — không cần AI — trên bộ file thử có đáp án
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-02T09:55:25Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 64
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 64 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/nhap-du-lieu-3110.md#071467f2c9f6b260c323903bbb9b5253349afd32` · `wiki/dot/nen-dau.md#015b66d24d60d7679bc3960ebb29146fdd9b4a09` — chưa có trang: trang nền

Lõi đọc một bảng hàng bẩn và nói được từng cột là gì, từng ô ra giá trị chuẩn nào hay vì sao không đọc được — không cần AI — trên bộ file thử có đáp án

Vì sao: ADR-0011 quyết định 1, 7, 12: chế độ tất định là nền và chế độ dự phòng; bộ chuẩn hoá dùng chung cho mọi cửa vào; số nền quyết hàng tác tử

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Hai file mẫu ghép cột 100%; số nền của độ đúng ghép cột, lỗi được sửa, lỗi lọt, tỉ lệ hỏi người trên file bẩn ghi vào hồ sơ; hồ sơ cột dựng ra không chứa giá trị nguồn hay dữ liệu cá nhân nào trên file nguồn giấu» chưa?
- Kết quả nào là SỐNG: [đề xuất] Hai file mẫu ghép cột 100%; số nền của độ đúng ghép cột, lỗi được sửa, lỗi lọt, tỉ lệ hỏi người trên file bẩn ghi vào hồ sơ; hồ sơ cột dựng ra không chứa giá trị nguồn hay dữ liệu cá nhân nào trên file nguồn giấu
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Hai file mẫu ghép cột 100%; số nền của độ đúng ghép cột, lỗi được sửa, lỗi lọt, tỉ lệ hỏi người trên file bẩn ghi vào hồ sơ; hồ sơ cột dựng ra không chứa giá trị nguồn hay dữ liệu cá nhân nào trên file nguồn giấu» khi hết timebox
- Timebox: …

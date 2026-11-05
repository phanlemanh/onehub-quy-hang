---
schema_version: 1
slug: chup-anh-dien-thoai
feature: Đầu chủ chụp ảnh khi đi xem nhà ngay trên điện thoại và ảnh vào đúng ngăn của căn, tải lên ở nền
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-05T11:27:14Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 41
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 41 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã P3

Đầu chủ chụp ảnh khi đi xem nhà ngay trên điện thoại và ảnh vào đúng ngăn của căn, tải lên ở nền

Vì sao: Màn P1 (M5)

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Đầu chủ đứng ở căn, chụp ảnh ngay trên điện thoại và ảnh vào đúng ngăn của căn đó; mất mạng thì ảnh chờ và tự tải lên khi có mạng, không mất ảnh nào; ảnh sổ đỏ vào lớp nguồn, không bao giờ ra trang khách» chưa?
- Kết quả nào là SỐNG: [đề xuất] Đầu chủ đứng ở căn, chụp ảnh ngay trên điện thoại và ảnh vào đúng ngăn của căn đó; mất mạng thì ảnh chờ và tự tải lên khi có mạng, không mất ảnh nào; ảnh sổ đỏ vào lớp nguồn, không bao giờ ra trang khách
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Đầu chủ đứng ở căn, chụp ảnh ngay trên điện thoại và ảnh vào đúng ngăn của căn đó; mất mạng thì ảnh chờ và tự tải lên khi có mạng, không mất ảnh nào; ảnh sổ đỏ vào lớp nguồn, không bao giờ ra trang khách» khi hết timebox
- Timebox: …

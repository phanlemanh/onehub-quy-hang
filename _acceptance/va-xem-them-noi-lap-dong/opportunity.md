---
schema_version: 1
slug: va-xem-them-noi-lap-dong
feature: Trên màn Liên hệ, sau khi bấm «Xem thêm» mà gõ rồi xoá nhanh ô tìm, lần «Xem thêm» kế tiếp nối đúng trang sau — không hiện lặp dòng của trang trước, con trỏ trang không quay về trang 1 khi ô tìm trở lại như cũ.
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-08T02:45:01Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-xem-them-noi-lap-dong
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-xem-them-noi-lap-dong của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Trên màn Liên hệ, sau khi bấm «Xem thêm» mà gõ rồi xoá nhanh ô tìm, lần «Xem thêm» kế tiếp nối đúng trang sau — không hiện lặp dòng của trang trước, con trỏ trang không quay về trang 1 khi ô tìm trở lại như cũ.

Vì sao: Ngoài-1 của khung-ho-so-lien-he (#199): lỗi do lượt sửa 1 gây ra; chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 08/11 (sổ d-20261108T024501Z-24), dãy L. Hàng không mã — đã quyết.

Cổng Đáng: căn cứ lựa chọn của chủ kho ở Cổng Bằng chứng hàng khung-ho-so-lien-he (08/11), nguyên văn «Ngoài-1: mở hợp đồng mới» (`_acceptance/khung-ho-so-lien-he/decisions.jsonl` d-20261108T024501Z-24); giám sát đưa hàng vào lộ trình (PR #203).

Ngoài-1: gõ rồi xoá ô tìm trong 250 ms làm con trỏ «Xem thêm» quay về trang 1 sau khi đã nối trang 2, nên lần bấm tiếp theo nối lặp dòng (`apps/web/src/app/(app)/contacts/vung.tsx`).

## Ngưỡng chết / ngưỡng UAT

- Không áp: hàng vá đã quyết (Cổng Bằng chứng #199), không phiên nghiệm thu — lưới là hợp đồng và lượt chấm S4; điều kiện bật của hàng («Bấm «Xem thêm», gõ rồi xoá một ký tự ô tìm trong 250 ms, bấm «Xem thêm» lần nữa: không dòng nào lặp, các dòng đi đúng thứ tự trang») là AC-3 của hợp đồng.

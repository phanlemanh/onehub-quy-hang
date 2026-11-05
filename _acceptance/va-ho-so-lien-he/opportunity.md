---
schema_version: 1
slug: va-ho-so-lien-he
feature: "Vá màn Liên hệ: bộ kiểm vai phủ đường xem hồ sơ và đếm đủ ô (Ngoài-22 hàng 103); «Xem thêm» không trộn trang của bộ lọc cũ (AC-2 thấp)"
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-05T09:49:48Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-ho-so-lien-he
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-ho-so-lien-he của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Vá màn Liên hệ: bộ kiểm vai phủ đường xem hồ sơ và đếm đủ ô (Ngoài-22 hàng 103); «Xem thêm» không trộn trang của bộ lọc cũ (AC-2 thấp)

Vì sao: Chủ kho chọn «mở hợp đồng mới» cho Ngoài-22 ở Cổng Bằng chứng hàng 103 (05/11); kèm phát hiện thấp AC-2 ký cùng 103. Hàng vá, không mã: đã quyết, chạy ngay (luật đợt 72).

Cổng Đáng: căn cứ lựa chọn của chủ kho ở Cổng Bằng chứng hàng 103, nguyên văn «Ngoài-22: mở hợp đồng mới» (`_acceptance/man-lien-he/decisions.jsonl` d-20261105T094948Z-49); giám sát duyệt hàng vào lộ trình (L-32, PR #133).

1. Ngoài-22: bảng vai trong bộ kiểm màn Liên hệ ghi «dùng chung cho ba đường» nhưng chỉ chạy ở tìm theo số và mở số; đường xem hồ sơ chỉ có một ca; vòng tìm theo số không đếm số ô đã kiểm.
2. AC-2 thấp (lượt chấm 4 hàng 103, `_acceptance/man-lien-he/review-findings.md`): trong 250 ms chờ gõ sau khi đổi bộ lọc, «Xem thêm» gửi con trỏ của bộ lọc cũ kèm bộ lọc mới và có thể đè danh sách mới bằng danh sách cũ cộng một trang lạc lọc.

## Ngưỡng chết / ngưỡng UAT

- Không áp: hàng vá đã quyết theo luật đợt 72, không phiên nghiệm thu — lưới là hợp đồng và lượt chấm S4.

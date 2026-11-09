---
schema_version: 1
slug: va-lead-da-nhap-than-hong
feature: Khi danh sách Lead đã nhập nhận được phản hồi thành công nhưng nội dung hỏng, màn báo lỗi và có nút Thử lại, không treo mãi ở khung chờ.
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-09T11:12:44Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-lead-da-nhap-than-hong
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-lead-da-nhap-than-hong của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Khi danh sách Lead đã nhập nhận được phản hồi thành công nhưng nội dung hỏng, màn báo lỗi và có nút Thử lại, không treo mãi ở khung chờ.

Vì sao: Ngoài của hom-nay-chiu-loi-tung-phan (#238): chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 09/11 (Ngoài-3). Dãy L.

Cổng Đáng: căn cứ lựa chọn của chủ kho ở Cổng Bằng chứng hàng hom-nay-chiu-loi-tung-phan, nguyên văn «Ngoài-3: mở hợp đồng mới» (`_acceptance/hom-nay-chiu-loi-tung-phan/decisions.jsonl` d-20261109T111244Z-24); giám sát đưa hàng vào lộ trình (#239). Cùng lệ hàng vá va-ho-so-lien-he.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Giả API trả 200 với nội dung không đọc được: màn hiện câu báo và nút Thử lại; bấm khi API về đúng thì danh sách hiện» chưa?
- Kết quả nào là SỐNG: [đề xuất] Giả API trả 200 với nội dung không đọc được: màn hiện câu báo và nút Thử lại; bấm khi API về đúng thì danh sách hiện
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Giả API trả 200 với nội dung không đọc được: màn hiện câu báo và nút Thử lại; bấm khi API về đúng thì danh sách hiện» khi hết timebox
- Timebox: một vòng, không phiên nghiệm thu — hàng vá, lưới là hợp đồng và lượt chấm.

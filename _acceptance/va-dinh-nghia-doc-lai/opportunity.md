---
schema_version: 1
slug: va-dinh-nghia-doc-lai
feature: Dòng «Tính theo định nghĩa ngày …» ở hồ sơ căn đọc lại dấu định nghĩa bao phí khi giá mới vừa đồng bộ xong, nên khi mạng yếu và giá còn trong hàng đợi, người xem không bị giữ ở dấu cũ sau khi giá đã lên máy chủ.
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: giám sát đợt dau-khach-nhap (Q-17), dẫn chữ chủ kho
decided_at: 2026-11-09T02:35:16Z     # ISO UTC — dẫn căn cứ, không quyết mới: Ngoài-3 hàng 49 thue-phi, chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 06/11
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-dinh-nghia-doc-lai
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-dinh-nghia-doc-lai của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Dòng «Tính theo định nghĩa ngày …» ở hồ sơ căn đọc lại dấu định nghĩa bao phí khi giá mới vừa đồng bộ xong, nên khi mạng yếu và giá còn trong hàng đợi, người xem không bị giữ ở dấu cũ sau khi giá đã lên máy chủ.

Vì sao: Ngoài-3 của hàng 49 thue-phi (PR #160): dong-dinh-nghia.tsx đọc dấu cũ khi giá mới còn trong hàng đợi đồng bộ và không đọc lại. Chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 06/11 (dãy Q, Q-7). Hàng không mã: đã quyết.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Đổi giá khi mất mạng rồi có mạng lại: dòng định nghĩa ở hồ sơ căn đổi sang dấu mới ngay khi giá đồng bộ xong, không cần tải lại trang; bài kiểm phủ đường mạng yếu» chưa?
- Kết quả nào là SỐNG: [đề xuất] Đổi giá khi mất mạng rồi có mạng lại: dòng định nghĩa ở hồ sơ căn đổi sang dấu mới ngay khi giá đồng bộ xong, không cần tải lại trang; bài kiểm phủ đường mạng yếu
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Đổi giá khi mất mạng rồi có mạng lại: dòng định nghĩa ở hồ sơ căn đổi sang dấu mới ngay khi giá đồng bộ xong, không cần tải lại trang; bài kiểm phủ đường mạng yếu» khi hết timebox
- Timebox: 1 ngày sau gộp.

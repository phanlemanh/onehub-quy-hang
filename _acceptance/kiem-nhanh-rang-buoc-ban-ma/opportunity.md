---
schema_version: 1
slug: kiem-nhanh-rang-buoc-ban-ma
feature: "Kiểm nhanh chỉ đọc của bước triển khai trên bản thật thêm vế bất biến 2: bảng chủ nhà và bảng lead không còn số điện thoại để rõ thì ràng buộc chặn số rõ phải đã bật — bảng sạch mà ràng buộc chưa bật làm bước triển khai đỏ trước khi gọi Vercel, gọi đúng tên bảng và ràng buộc; bảng còn số rõ thì chỉ báo, không chặn; vẫn một kết nối, giao dịch chỉ đọc (Ngoài-2 của hàng va-deploy-csdl-tam, chủ kho mở hợp đồng mới 06/11)."
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-06     # ISO UTC — chủ kho chọn «mở hợp đồng mới» cho Ngoài-2 ở Cổng Bằng chứng va-deploy-csdl-tam (signoff 06/11); giám sát mở hàng theo quyết định ấy
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: kiem-nhanh-rang-buoc-ban-ma
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng kiem-nhanh-rang-buoc-ban-ma của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Kiểm nhanh chỉ đọc của bước triển khai trên bản thật thêm vế bất biến 2: bảng chủ nhà và bảng lead không còn số điện thoại để rõ thì ràng buộc chặn số rõ phải đã bật — bảng sạch mà ràng buộc chưa bật làm bước triển khai đỏ trước khi gọi Vercel, gọi đúng tên bảng và ràng buộc; bảng còn số rõ thì chỉ báo, không chặn; vẫn một kết nối, giao dịch chỉ đọc (Ngoài-2 của hàng va-deploy-csdl-tam, chủ kho mở hợp đồng mới 06/11).

Vì sao: Ngoài-2 của hàng va-deploy-csdl-tam (PR #176): bỏ bộ cách ly trên bản thật cũng bỏ ca chỉ đọc «bảng sạch số rõ thì ràng buộc bản mã phải đã bật» của packages/db/tests/bat-rang-buoc.test.mjs; chủ kho chọn mở hợp đồng mới ở Cổng Bằng chứng 06/11, giám sát xếp ưu tiên nhất của dãy Q (bất biến 2).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Job deploy trên main xanh ở lần gộp đầu sau hàng này với dòng kiểm nhanh nêu trạng thái ràng buộc bản mã của bảng chủ nhà và bảng lead; bảng sạch mà ràng buộc chưa bật làm kiểm nhanh đỏ trước khi gọi Vercel; vẫn một kết nối, chỉ đọc» chưa?
- Kết quả nào là SỐNG: [đề xuất] Job deploy trên main xanh ở lần gộp đầu sau hàng này với dòng kiểm nhanh nêu trạng thái ràng buộc bản mã của bảng chủ nhà và bảng lead; bảng sạch mà ràng buộc chưa bật làm kiểm nhanh đỏ trước khi gọi Vercel; vẫn một kết nối, chỉ đọc
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Job deploy trên main xanh ở lần gộp đầu sau hàng này với dòng kiểm nhanh nêu trạng thái ràng buộc bản mã của bảng chủ nhà và bảng lead; bảng sạch mà ràng buộc chưa bật làm kiểm nhanh đỏ trước khi gọi Vercel; vẫn một kết nối, chỉ đọc» khi hết timebox
- Timebox: …

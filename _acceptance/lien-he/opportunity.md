---
schema_version: 1
slug: lien-he-chu-nha
feature: "Chủ nhà là một liên hệ của sàn (RESO Contacts, ContactType Seller/Landlord): một người, nhiều số (bản mã + dấu vết), một đầu chủ đang giữ; lead và hàng cùng gắn vào liên hệ ấy — kiểm trùng tìm theo liên hệ, «Lên bảng» là dữ kiện (hàng tạo từ lead mang mã lead), «Sửa số» thêm số vào cùng người; chủ nhà vẫn là lớp nguồn, telesales tạo được nhưng không đọc lại số; Tham chiếu thêm mục «Tri thức ngành và RESO» (đối tượng ↔ RESO resource/lookup ↔ khái niệm ngành)"
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 85
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 85 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Chủ nhà là một liên hệ của sàn (RESO Contacts, ContactType Seller/Landlord): một người, nhiều số (bản mã + dấu vết), một đầu chủ đang giữ; lead và hàng cùng gắn vào liên hệ ấy — kiểm trùng tìm theo liên hệ, «Lên bảng» là dữ kiện (hàng tạo từ lead mang mã lead), «Sửa số» thêm số vào cùng người; chủ nhà vẫn là lớp nguồn, telesales tạo được nhưng không đọc lại số; Tham chiếu thêm mục «Tri thức ngành và RESO» (đối tượng ↔ RESO resource/lookup ↔ khái niệm ngành)

Vì sao: Tham chiếu §4 khai «Chủ nhà» là một người (một chủ nhiều căn → một đầu chủ) nhưng hàng 11 dựng «chủ nhà của hàng», hàng 24 dựng lead mang số riêng — không bản ghi nào nói hai thứ là một người; hệ quả đo được ở hàng 24, 25, 27: chủ trùng so dấu vết trên hai bảng, «Lên bảng» phải đoán (ADR-0020), gửi lại thành người khác, chủ hai số thành hai người. RESO Contacts (ContactType Seller/Landlord/Lead) coi lead là con người (đề nghị của dãy L, yêu cầu L-12)

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Một chủ nhà hai số, có một hàng và một lead: kiểm trùng ra cùng một liên hệ và cùng đầu chủ; hàng tạo từ lead mang mã lead và «Lên bảng» đọc từ dữ kiện, không suy; «Sửa số và gửi lại» thêm số vào cùng liên hệ; telesales tạo được liên hệ nhưng không đọc lại số; bộ kiểm cách ly xanh với bảng liên hệ mới; Tham chiếu có mục «Tri thức ngành và RESO»» chưa?
- Kết quả nào là SỐNG: [đề xuất] Một chủ nhà hai số, có một hàng và một lead: kiểm trùng ra cùng một liên hệ và cùng đầu chủ; hàng tạo từ lead mang mã lead và «Lên bảng» đọc từ dữ kiện, không suy; «Sửa số và gửi lại» thêm số vào cùng liên hệ; telesales tạo được liên hệ nhưng không đọc lại số; bộ kiểm cách ly xanh với bảng liên hệ mới; Tham chiếu có mục «Tri thức ngành và RESO»
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Một chủ nhà hai số, có một hàng và một lead: kiểm trùng ra cùng một liên hệ và cùng đầu chủ; hàng tạo từ lead mang mã lead và «Lên bảng» đọc từ dữ kiện, không suy; «Sửa số và gửi lại» thêm số vào cùng liên hệ; telesales tạo được liên hệ nhưng không đọc lại số; bộ kiểm cách ly xanh với bảng liên hệ mới; Tham chiếu có mục «Tri thức ngành và RESO»» khi hết timebox
- Timebox: …

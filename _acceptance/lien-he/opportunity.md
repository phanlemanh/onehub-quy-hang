---
schema_version: 1
slug: lien-he
feature: "Mỗi người làm việc với sàn là một liên hệ (RESO Contacts): một người, nhiều số (bản mã + dấu vết), một hay nhiều loại liên hệ — Chủ bán, Chủ cho thuê, Người mua, Người thuê… (ContactType) — và một người giữ; lead và hàng gắn vào liên hệ chủ nhà: kiểm trùng tìm theo liên hệ, «Lên bảng» là dữ kiện (hàng tạo từ lead mang mã lead), «Sửa số» thêm số vào cùng người; liên hệ có chỗ cho trường riêng theo loại liên hệ của sàn (định nghĩa ở hàng 47); số và mọi thứ của chủ nhà vẫn lớp nguồn, telesales tạo được nhưng không đọc lại số; Tham chiếu thêm mục «Tri thức ngành và RESO»"
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-01T06:25:56Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 85
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 85 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Mỗi người làm việc với sàn là một liên hệ (RESO Contacts): một người, nhiều số (bản mã + dấu vết), một hay nhiều loại liên hệ — Chủ bán, Chủ cho thuê, Người mua, Người thuê… (ContactType) — và một người giữ; lead và hàng gắn vào liên hệ chủ nhà: kiểm trùng tìm theo liên hệ, «Lên bảng» là dữ kiện (hàng tạo từ lead mang mã lead), «Sửa số» thêm số vào cùng người; liên hệ có chỗ cho trường riêng theo loại liên hệ của sàn (định nghĩa ở hàng 47); số và mọi thứ của chủ nhà vẫn lớp nguồn, telesales tạo được nhưng không đọc lại số; Tham chiếu thêm mục «Tri thức ngành và RESO»

Vì sao: Tham chiếu §4 khai «Chủ nhà» là một người (một chủ nhiều căn → một đầu chủ) nhưng hàng 11 dựng «chủ nhà của hàng», hàng 24 dựng lead mang số riêng — không bản ghi nào nói hai thứ là một người; hệ quả đo được ở hàng 24, 25, 27: chủ trùng so dấu vết trên hai bảng, «Lên bảng» phải đoán (ADR-0020), gửi lại thành người khác, chủ hai số thành hai người. RESO Contacts (ContactType Seller/Landlord/Lead) coi lead là con người (đề nghị của dãy L, yêu cầu L-12). Chủ kho 01/11: mở rộng ra mọi loại liên hệ theo RESO (chủ nhà, người mua, người thuê…) kèm trường riêng cấu hình theo sàn

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Một chủ nhà hai số, có một hàng và một lead: kiểm trùng ra cùng một liên hệ và cùng đầu chủ; một người vừa là Chủ bán vừa là Người mua vẫn là một liên hệ; hàng tạo từ lead mang mã lead và «Lên bảng» đọc từ dữ kiện, không suy; «Sửa số và gửi lại» thêm số vào cùng liên hệ; telesales tạo được liên hệ nhưng không đọc lại số; bộ kiểm cách ly xanh với bảng liên hệ mới; Tham chiếu có mục «Tri thức ngành và RESO»» chưa?
- Kết quả nào là SỐNG: [đề xuất] Một chủ nhà hai số, có một hàng và một lead: kiểm trùng ra cùng một liên hệ và cùng đầu chủ; một người vừa là Chủ bán vừa là Người mua vẫn là một liên hệ; hàng tạo từ lead mang mã lead và «Lên bảng» đọc từ dữ kiện, không suy; «Sửa số và gửi lại» thêm số vào cùng liên hệ; telesales tạo được liên hệ nhưng không đọc lại số; bộ kiểm cách ly xanh với bảng liên hệ mới; Tham chiếu có mục «Tri thức ngành và RESO»
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Một chủ nhà hai số, có một hàng và một lead: kiểm trùng ra cùng một liên hệ và cùng đầu chủ; một người vừa là Chủ bán vừa là Người mua vẫn là một liên hệ; hàng tạo từ lead mang mã lead và «Lên bảng» đọc từ dữ kiện, không suy; «Sửa số và gửi lại» thêm số vào cùng liên hệ; telesales tạo được liên hệ nhưng không đọc lại số; bộ kiểm cách ly xanh với bảng liên hệ mới; Tham chiếu có mục «Tri thức ngành và RESO»» khi hết timebox
- Timebox: …

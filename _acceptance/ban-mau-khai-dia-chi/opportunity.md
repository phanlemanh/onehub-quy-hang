---
schema_version: 1
slug: ban-mau-khai-dia-chi
feature: Mỗi trang bản mẫu khai một địa chỉ màn thật nó đứng thay; vỏ lấy nhà, tiêu đề điện thoại, tab dưới và mục sáng cột thứ hai theo địa chỉ ấy (nâng nhaMau của hàng 91 từ nhà lên địa chỉ, trang trong khu làm việc khai được); bộ quét bản đồ khuôn coi khu proto là khu bản mẫu riêng (ra khỏi nhận diện Trang tạm, khỏi khai ngoại lệ từng trang) và đỏ khi trang bản mẫu không khai địa chỉ; sổ design-pass ghi địa chỉ thật cạnh đường chạy.
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: giám sát đợt dau-khach-nhap (D-33)
decided_at: 2026-11-08T16:26:18Z     # ISO UTC — giám sát ghi theo lời chủ kho «Duyệt, mở hàng» ở phiên rà soát 05/11 (docs/plan/lo-trinh.json, ra-soat-ban-mau.md §3, PR #141); chủ kho không ký ở phiên này
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: ban-mau-khai-dia-chi
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng ban-mau-khai-dia-chi của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Mỗi trang bản mẫu khai một địa chỉ màn thật nó đứng thay; vỏ lấy nhà, tiêu đề điện thoại, tab dưới và mục sáng cột thứ hai theo địa chỉ ấy (nâng nhaMau của hàng 91 từ nhà lên địa chỉ, trang trong khu làm việc khai được); bộ quét bản đồ khuôn coi khu proto là khu bản mẫu riêng (ra khỏi nhận diện Trang tạm, khỏi khai ngoại lệ từng trang) và đỏ khi trang bản mẫu không khai địa chỉ; sổ design-pass ghi địa chỉ thật cạnh đường chạy.

Vì sao: Rà soát bản mẫu (docs/plan/ra-soat-ban-mau.md §3, PR #141): bản mẫu design-pass ở /proto/{slug} không thuộc nhà nào nên vỏ không dựng cột thứ hai, ảnh trình chủ kho thiếu cột (lặp ở hàng 91, 45). Chủ kho duyệt khuyến nghị ở phiên rà soát, nguyên văn «Duyệt, mở hàng» (05/11). Hàng không mã: đã quyết. Xong thì bỏ luật đợt 73.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Bản mẫu ở khu proto chụp ra đủ thanh trên, nhà sáng, cột thứ hai có mục sáng, tiêu đề và tab điện thoại như màn thật; bản mẫu thiếu khai địa chỉ thì lint đỏ; không đổi _acceptance/config.yaml» chưa?
- Kết quả nào là SỐNG: [đề xuất] Bản mẫu ở khu proto chụp ra đủ thanh trên, nhà sáng, cột thứ hai có mục sáng, tiêu đề và tab điện thoại như màn thật; bản mẫu thiếu khai địa chỉ thì lint đỏ; không đổi _acceptance/config.yaml
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Bản mẫu ở khu proto chụp ra đủ thanh trên, nhà sáng, cột thứ hai có mục sáng, tiêu đề và tab điện thoại như màn thật; bản mẫu thiếu khai địa chỉ thì lint đỏ; không đổi _acceptance/config.yaml» khi hết timebox
- Timebox: …

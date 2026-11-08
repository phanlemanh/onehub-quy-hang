---
schema_version: 1
feature: "Đầu chủ gõ mã căn, mở Bảng hàng hay hồ sơ căn và thấy thuộc tính căn đọc từ vùng danh mục dùng chung thay cho gói mẫu cố định; căn chưa có vẫn đi đường mã ngoài danh mục"
slug: doc-vung-danh-muc
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: implemented
design_doc: docs/superpowers/specs/2026-11-09-doc-vung-danh-muc-design.md
approved_by: Manh Phan
approved_at: 2026-11-09
---

# Acceptance Contract: doc-vung-danh-muc

## Context

«Vùng» = hai bảng `catalog_subdivisions`, `catalog_units`. «Cửa nhận» = `POST /api/v1/catalog/feeds`. «Nguồn» = `packages/api/src/catalog/nguon.ts`.

Source input: hàng 99 (`docs/plan/lo-trinh.json`) · ô cơ hội đã ký · thiết kế ở `design_doc`.

## Criteria

- **AC-1 (cross-layer)** — Gõ mã trong gói ra đúng thuộc tính của gói.
  Given một gói nạp qua cửa nhận với căn có mã không có trong gói mẫu,
  When tra `GET /api/v1/catalog/units/<mã>`,
  Then `found`, đúng khu, toà, tầng, diện tích, phòng ngủ, hướng của gói.

- **AC-2 (cross-layer)** — Bảng hàng ghép theo gói.
  Given gói ấy,
  When đọc `GET /api/v1/catalog` rồi ghép hàng theo toà + mã,
  Then hàng có đúng loại căn và diện tích của gói.

- **AC-3** — Gói mới thấy ngay.
  Given đã đọc danh mục một lần,
  When nạp gói chỉ đổi diện tích một căn, gói chỉ đổi tên khu, hoặc gói thêm một căn, kể cả nạp ở một bản máy chủ và đọc ở bản khác,
  Then lần đọc kế trả giá trị mới, không khởi động lại máy chủ.

- **AC-4** — Căn chưa có vẫn đi đường cũ.
  Given vùng có dữ liệu,
  When tra một mã đọc được mà không có trong vùng,
  Then `not_in_catalog`, cùng khuôn trả như hiện nay.

- **AC-5** — Vùng có dữ liệu thì gói mẫu tắt; vùng rỗng thì dùng gói mẫu.
  Given vùng có một khu,
  When tra mã chỉ có trong gói mẫu,
  Then không ra `found`: khu có cách đọc mã trả `not_in_catalog`, khu chưa có cách đọc mã trả `unreadable`; vùng rỗng thì `found` theo gói mẫu.

- **AC-6 (cross-layer)** — Nhập Excel và «chỉ biết toà» đọc cùng nguồn.
  Given gói nạp qua cửa nhận,
  When ghi một lần nhập có căn của gói và đọc danh sách toà của lead,
  Then căn khớp được ghi, danh sách toà có toà của gói.

- **AC-7** — Gói mẫu chỉ còn ở một chỗ.
  Given mã nguồn `packages/api/src` trừ tệp kiểm,
  When tìm nơi dùng `SAMPLE_CATALOG`,
  Then chỉ `catalog/sample.ts` và `catalog/nguon.ts`.

- **AC-8** — Chỉ lớp danh mục ra, cách ly giữ nguyên.
  Given vùng có dữ liệu, đọc bằng vai API của một sàn không phải sàn nạp,
  When đọc danh mục,
  Then thấy dữ liệu, thân trả không có `agreement_id` hay `provider`; bộ kiểm cách ly xanh.

- **AC-9** — Đọc lỗi không lùi về gói mẫu.
  Given đọc vùng lỗi,
  When tra mã,
  Then đang giữ bản thật thì trả theo bản ấy; chưa giữ thì HTTP 500 có mã lỗi; không trường hợp nào trả thuộc tính của gói mẫu.

- **AC-10 (cross-layer)** — Trên màn thấy đúng gói.
  Given gói đã nạp qua cửa nhận, có một căn Đang bán mang mã không có trong gói mẫu,
  When đầu chủ gõ mã ở ô Gõ mã căn, mở Bảng hàng và mở hồ sơ căn ấy,
  Then ô Gõ mã mở đúng hồ sơ căn ấy; Bảng hàng và hồ sơ căn hiện đúng thuộc tính của gói.

## Coverage

Trục: nơi đọc (gõ mã · cả danh mục · Nhập Excel · toà của lead) × trạng thái vùng (rỗng · có · lỗi · vừa đổi) × căn (trong gói · chỉ trong mẫu · không ở đâu). AC-1, 2, 6 phủ nơi đọc; AC-3, 5, 9 phủ trạng thái; AC-4, 5 phủ căn; AC-8 phủ bất biến. Không gian nhỏ và đóng — xem dòng sổ «bỏ coverage-scan».

## Đường đo

- Gõ mã trong gói ra đúng thuộc tính: bài kiểm trên cửa nhận thật · AC-1
- Bảng hàng ghép đúng loại căn, diện tích: bài kiểm ghép theo toà và mã · AC-2
- Không còn chỗ đọc gói mẫu ngoài dữ liệu mẫu: lệnh quét mã nguồn · AC-7

## Out of scope

- Xoá căn vắng khỏi gói; từ chối gói cũ hơn.
- Danh mục lô thấp tầng.
- Khoá máy cho Invest tự đẩy.
- Sửa giao diện Bảng hàng, hồ sơ căn.

## Notes

- Ngoài-1 (máy định tuyến 2026-11-08, đề xuất S4 known-limits): Nếu hai dự án khác nhau có cùng tên toà và cùng mã căn, Bảng hàng và hồ sơ căn có thể hiện diện tích, loại căn của dự án kia mà không báo gì. — `apps/web/src/app/(app)/inventory/ghep-danh-muc.ts`
- Ngoài-2 (máy định tuyến 2026-11-08, đề xuất S4 known-limits): Khi máy chủ chưa đọc được danh mục, Bảng hàng có thể hiện căn đang có trong danh mục là «Chưa rõ» như căn ngoài danh mục, và không báo là đang lỗi. — `apps/web/src/app/(app)/inventory/danh-muc.ts`
- Ngoài-3 (máy định tuyến 2026-11-08, đề xuất S4 known-limits): Khi hệ thống tạm không đọc được danh mục, ở màn Nhập Excel người dùng có thể thấy một dòng báo lỗi bằng chữ kỹ thuật tiếng Anh thay vì câu tiếng Việt dễ hiểu. — `packages/api/src/catalog/nguon.ts`
- Ngoài-4 (máy định tuyến 2026-11-08, đề xuất S4 known-limits): Tài liệu API dành cho bên ngoài thiếu một mã lỗi mà hai chức năng thực sự có thể trả; người dùng cuối không thấy khác biệt. — `packages/api/src/leads/routes.ts`
- Ngoài-5 (máy định tuyến 2026-11-08, đề xuất S4 known-limits): Nếu danh mục tạm không đọc được, bản xem trước khi nhập Excel vẫn hiện bình thường nhưng không đối chiếu căn với danh mục, nên kết quả lúc ghi thật có thể khác bản xem trước. — `apps/web/src/app/(app)/imports/new/man-nhap.tsx`
- Ngoài-6 (máy định tuyến 2026-11-08, đề xuất S4 known-limits): Khi danh mục tạm lỗi, ô chọn Toà khi nhập lead hiện trống mà không giải thích, người dùng không biết vì sao không chọn được. — `apps/web/src/app/(app)/leads/new/page.tsx`
- Ngoài-8 (máy định tuyến 2026-11-08, đề xuất S4 known-limits): Bài chụp màn E10 có thể chạy trên bản chép dữ liệu thiếu mà không báo, làm ảnh chụp sai bối cảnh; người dùng sản phẩm không bị ảnh hưởng. — `_acceptance/doc-vung-danh-muc/thu/nap-goi-thu.mjs`
- Ngoài-9 (máy định tuyến 2026-11-08, đề xuất S4 known-limits): Một số tổ hợp, như danh mục lỗi hoặc vừa đổi gói ở Nhập Excel và danh sách toà, chưa có bài kiểm riêng nên chưa được chứng minh bằng máy. — `_acceptance/doc-vung-danh-muc/contract.md`
- Ngoài-10 (máy định tuyến 2026-11-08, đề xuất S4 known-limits): Bài kiểm chiều đỏ của Bảng hàng chưa chứng minh được rằng nạp gói khác diện tích thì Bảng hàng đổi theo qua đường thật. — `packages/api/test-db/catalog/doc-vung.test.ts`

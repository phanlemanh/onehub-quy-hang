---
schema_version: 1
feature: "Che vùng ảnh: đầu chủ kéo khung che lên ảnh căn rồi lưu một bản che nhẹ ở ngăn Gửi được; bản gốc giữ nguyên và sang ngăn Nội bộ"
slug: che-vung-anh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
approved_by: Manh Phan
approved_at: 2026-11-01
design_doc: _acceptance/che-vung-anh/design.md
---

# Acceptance Contract: che-vung-anh

## Context

Hàng 19 của lộ trình (`docs/plan/lo-trinh.json`), dãy B, đứng trên hàng 18 (anh-can-ba-ngan) và va-anh-ban-that. Ranh giới:
`apps/web/src/app/(app)/units/photos/redact/**`, `_acceptance/che-vung-anh/**`; xin thêm móc ở `photos/muc-anh.tsx`, hằng cỡ
bản nhẹ ở `packages/core/src/photos/index.ts` và dòng ở `docs/product/doi-chieu-nganh.md` (B-23). Giám sát cho dừng ở Cổng
Phạm vi tới khi hạn mức tuần đặt lại.

## Criteria

- AC-1: Given hồ sơ căn có ảnh, When người sửa được ảnh (đầu chủ giữ căn, trưởng nhóm) mở menu của một ảnh, Then có «Che
  vùng…» mở trình che trên ảnh ấy — chỉ ảnh ở ngăn Gửi được; ảnh ở ngăn Nội bộ không có mục này và hàm lưu từ chối ảnh
  nguồn Nội bộ (bản che của ảnh nội bộ sẽ đưa phần còn lại của nó ra ngăn Gửi được — bất biến 2); người không sửa được không
  thấy mục này.
- AC-2: Given trình che đang mở, When kéo chuột vẽ khung, «Bỏ khung cuối», «Bỏ hết», Then danh sách khung đổi theo; chưa có
  khung nào thì «Lưu bản che» tắt. Toạ độ khung đổi từ toạ độ màn sang điểm ảnh của ảnh gốc, kẹp trong mép ảnh — ma trận viết
  trước gồm khung kéo ngược chiều, khung tràn mép, ảnh hiển thị thu nhỏ và phóng to, và ảnh dọc chụp điện thoại (điểm ảnh lưu
  ngang kèm hướng xoay EXIF): khung vẽ trên ảnh đã xoay rơi đúng vùng ấy trên bản che.
- AC-3: Given một ảnh và các khung, When dựng bản che, Then mọi điểm ảnh trong khung là màu tô đặc và mọi điểm ảnh ngoài khung
  giữ nguyên giá trị — kiểm trên mảng điểm ảnh, gồm khung chồng nhau và khung một điểm ảnh ở mép.
- AC-4: Given ảnh gốc cỡ bất kỳ, When dựng bản nhẹ của bản che, Then cạnh dài ≤ mặc định của sàn (1600), giữ tỉ lệ, ảnh nhỏ
  hơn giữ cỡ; cỡ đọc từ một hằng có tên ở lõi ghi «mặc định của sàn» (Hỏi-2, nháp theo khuyến nghị). Che bằng tô kín màu
  đặc là Hỏi-3 (giữ cứng vì an toàn), nháp theo khuyến nghị.
- AC-5: Given đã vẽ khung, When «Lưu bản che», Then ngăn Gửi được có đúng một ảnh mới mang ngày chụp của ảnh gốc, ảnh gốc
  giữ nguyên byte (băm byte trước và sau bằng nhau) và sang ngăn Nội bộ (Hỏi-1, nháp theo khuyến nghị); lịch sử ảnh của căn
  có đúng hai sự kiện mới theo thứ tự — thêm ảnh (bản che), đổi ngăn (ảnh gốc sang Nội bộ) — người làm là người lưu. (cross-layer)
- AC-6: Given ảnh gốc có siêu dữ liệu EXIF (ngày chụp, vị trí), When lưu bản che, Then byte bản che không còn khối EXIF.
- AC-7: Given tải bản che lên bị lỗi, When «Lưu bản che», Then không ảnh mới nào được ghi, ảnh gốc không đổi ngăn, trình che
  báo lỗi và giữ nguyên khung để thử lại. (cross-layer)
- AC-8: Given cây sau hàng này, When chạy kiểm kiểu, lint (luật `quy-hang-ui`, mức nợ 0), bộ test và sàn thiết kế, Then tất
  cả xanh; không tệp nào ngoài ranh giới của hàng đổi.

## Coverage

Quét không gian AC theo trục (preset entity-feature + test-matrix, rút gọn):

- Trục A — người và ngăn: sửa được ảnh · không sửa được · ảnh nguồn ở Gửi được · ở Nội bộ
- Trục B — khung: một · nhiều · chồng nhau · ngược chiều · tràn mép · chưa có
- Trục C — ảnh: lớn hơn bản nhẹ · nhỏ hơn · ngang · dọc · dọc theo hướng xoay EXIF · có EXIF · không đọc được
- Trục D — lưu: thành công · tải lỗi [thước CE: mọi nhánh của hàm lưu]
- Core: A ở AC-1; B ở AC-2, AC-3; C ở AC-3, AC-4, AC-6; D ở AC-5, AC-7; rào AC-8.
- Later: tự nhận diện mặt, biển số · bản nhẹ cho mọi ảnh gửi đi (hàng gửi) · sửa khung của bản che đã lưu.
- Never: ghi đè byte bản gốc · che bằng làm mờ đọc ngược được.

## Đường đo

- Số link khách mở có ảnh đã che (ô cơ hội): chưa có đường gửi để đếm — bỏ ở hàng này, đường đo thuộc hàng gửi; AC-5 bảo
  đảm bản che nằm ở ngăn Gửi được để hàng gửi đếm được.

## Out of scope

- Tự nhận diện mặt người, biển số — cần AI và thoả thuận «Xử lý bằng AI» của sàn.
- Đường gửi và trang khách; bản nhẹ cho mọi ảnh gửi đi — hàng gửi.
- Sửa lại khung của bản che đã lưu — che lại từ bản gốc ở Nội bộ.
- Che trên điện thoại (cảm ứng).
- Nối bản che với bản gốc trong dữ liệu — cần migration.

## Notes

- Dữ liệu cho bài nhìn: chỗ thử dãy B của hàng 14 (`_acceptance/bang-hang-kieu-sheet/thu/dung-b.mjs`), cộng ảnh mẫu của
  hồ sơ anh-can-ba-ngan.
- Ngoài-1 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Màn che vùng ảnh chạy bình thường với người dùng. Chỉ là sổ thiết kế chưa ghi lại việc màn này được ghép từ thành phần có sẵn và tự viết thêm. — `apps/web/src/app/(app)/units/photos/redact/trinh-che.tsx`
- Ngoài-2 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Nếu bản che đã lưu mà ảnh gốc chưa chuyển được sang Nội bộ, màn vẫn mở và danh sách ảnh không cập nhật. Bấm Lưu lần nữa sẽ tạo thêm một bản che trùng, và ảnh gốc vẫn còn ở ngăn Gửi được cho tới khi người dùng tự chuyển. — `apps/web/src/app/(app)/units/photos/redact/trinh-che.tsx`
- Ngoài-4 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Với ảnh PNG có vùng trong suốt, khung đen đã bỏ vẫn hiện trên màn xem trước. Người dùng thấy như đang che nhưng bản lưu thì không che vùng đó. — `apps/web/src/app/(app)/units/photos/redact/trinh-che.tsx`
- Ngoài-6 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Bài kiểm tự động chưa chứng minh được ảnh chụp dọc từ điện thoại được che đúng vị trí. Nếu lỗi xoay xuất hiện thì bài vẫn xanh, và chỉ mắt người xem mới thấy. — `apps/web/src/app/(app)/units/photos/redact/vung.test.ts`
- Known limits — chọn ở Cổng Bằng chứng 2026-11-02:
  - Ngoài-1: Sổ thiết kế chưa ghi trình che là phần ghép và tự viết.
  - Ngoài-2: Bản che đã lưu mà bản gốc chưa sang Nội bộ thì hộp vẫn mở; bấm Lưu lần nữa tạo bản che trùng.
  - Ngoài-4: Với ảnh PNG có vùng trong suốt, khung đã bỏ vẫn hiện trên bản xem trước (bản lưu vẫn đúng).
  - Ngoài-6: Bài kiểm máy cho ảnh dọc chụp điện thoại chưa đi qua bước xoay thật.

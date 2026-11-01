---
schema_version: 1
feature: "Sửa hàng loạt: đầu chủ tích nhiều căn trên Bảng hàng rồi đổi trạng thái hay đánh dấu đã gọi cho tất cả trong một lần, máy kể trước căn nào không đổi được"
slug: sua-hang-loat
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
approved_by: Manh Phan
approved_at: 2026-11-01
design_doc: _acceptance/sua-hang-loat/design.md
---

# Acceptance Contract: sua-hang-loat

## Context

Hàng 16 của lộ trình (`docs/plan/lo-trinh.json`), dãy B, đứng trên hàng 15 và va-sua-tren-o. Ranh giới:
`apps/web/src/app/(app)/inventory/bulk/**`, `_acceptance/sua-hang-loat/**`; giám sát cho thêm móc vào
`apps/web/src/app/(app)/inventory/bang-hang.tsx` (B-20) và giao tiêu chí Ctrl/Cmd+Z trong ô chữ (Ngoài-2 của
va-sua-tren-o) chạm `cell-edit/tren-o.tsx`. «Đổi đầu chủ hàng loạt» tách ra theo Hỏi-1 (nháp theo khuyến nghị).

## Criteria

- AC-1: Given Bảng hàng trên máy tính, When đầu chủ tích ô ở đầu dòng của vài căn hay bấm «Chọn hết», Then căn được tích
  («Chọn hết» tích đúng các căn đang hiện sau lọc) và thanh hành động hiện «n căn đã chọn» với Đổi trạng thái, Đánh dấu
  đã gọi, Bỏ chọn; «Bỏ chọn» gỡ hết tích và thanh biến mất.
- AC-2: Given đã tích căn, When đổi lọc, nhóm hay góc nhìn làm vài căn tích bị ẩn, Then các căn vẫn tích, thanh nói thêm
  «k đang bị lọc ẩn», và thao tác áp cho mọi căn tích kể cả căn ẩn: hộp hỏi đếm đủ và mỗi căn ẩn đổi được cũng nhận
  đúng một sự kiện. (cross-layer)
- AC-3: Given một lô căn tích ở nhiều trạng thái và mức đủ khác nhau, When xét lô đổi sang một nấc, Then mỗi căn rơi đúng
  một ngăn — đổi được, hoặc không đổi được với lý do («đã ở nấc này», «không chuyển được từ <nấc>», «thiếu <mục>») — theo
  bảng chuyển và điều kiện của lõi (ADR-0008); menu chỉ đưa nấc mà ít nhất một căn chuyển được và không bao giờ đưa
  «Đã bán»; «Ngừng hẳn» đòi một lý do cho cả lô. Ma trận viết trước: mọi cặp trạng thái hiện tại × nấc đích.
- AC-4: Given hộp hỏi lại của «Đổi trạng thái», When bấm «Thôi», Then không sự kiện nào được ghi; When bấm «Đổi», Then
  mỗi căn đổi được nhận đúng một sự kiện đổi trạng thái và căn không đổi được không nhận sự kiện nào; hộp hỏi nêu «Đổi n
  căn sang <nấc>» và «k căn không đổi được» kèm mã căn và lý do; «Ngừng hẳn» chưa chọn lý do thì nút Đổi tắt, chọn rồi thì
  sự kiện của mỗi căn mang lý do ấy; lô không căn nào đổi được thì nút Đổi tắt. Hỏi lại trước khi ghi là Hỏi-2 (sổ
  d-…-15), nháp theo khuyến nghị. (cross-layer)
- AC-5: Given một lô căn tích có cả căn đã đóng (Đã bán, Ngừng hẳn), When «Đánh dấu đã gọi» rồi «Đổi», Then mỗi căn còn
  mở nhận đúng một sự kiện «Còn / giữ giá» (xác nhận với chủ nhà) và cột Độ tươi của căn ấy về «hôm nay»; căn đã đóng
  không nhận sự kiện và được kể «căn đã đóng»; hộp hỏi nói trước «không hoàn tác được». (cross-layer)
- AC-6: Given vừa ghi một lô, When thông báo hiện, Then nó nêu đúng số căn đã ghi («Đã đổi trạng thái n căn» / «Đã đánh
  dấu đã gọi n căn», cộng «k căn chưa ghi được» khi kho trên máy từ chối); căn đã ghi bỏ tích, căn không đổi được vẫn tích.
- AC-7: Given thông báo của một lô đổi trạng thái, When bấm «Hoàn tác», Then mỗi căn của lô mà phiên bản trên máy còn
  bằng phiên bản ngay sau lần ghi nhận đúng một sự kiện bù về nấc cũ; căn đã có lần sửa sau (của mình hay người khác kéo
  về) không nhận gì và được đếm «k căn đã có lần sửa sau — bỏ qua»; bấm lần hai báo «Đã hoàn tác rồi», không ghi gì. Ma
  trận viết trước của hàm quyết lô. (cross-layer)
- AC-8: Given tiêu điểm đang ở một ô gõ chữ (ô lọc cột, input, textarea, vùng contenteditable) và vừa có một lần sửa trên
  ô, When bấm Ctrl/Cmd+Z, Then không lần sửa nào bị hoàn tác, không sự kiện nào được ghi, và phím tắt về lại ô gõ.
- AC-9: Given cây sau hàng này, When chạy kiểm kiểu, lint (luật `quy-hang-ui`, mức nợ 0), bộ test và sàn thiết kế, Then
  tất cả xanh; không tệp nào ngoài ranh giới của hàng đổi.

## Coverage

Quét không gian AC theo trục (preset entity-feature + test-matrix, rút gọn):

- Trục A — thao tác: đổi trạng thái (5 nấc đích khả dĩ trừ Đã bán) · đánh dấu đã gọi · bỏ chọn · hoàn tác lô
- Trục B — trạng thái căn tích: 6 trạng thái chuẩn × đủ / thiếu mục cho Đang bán
- Trục C — chỗ đứng của căn tích: đang hiện · bị lọc ẩn
- Trục D — kết cục ghi: đổi được · không đổi được (lõi từ chối) · kho trên máy từ chối lúc ghi · có lần sửa sau khi
  hoàn tác [thước CE: mọi kết cục của `xetDoiTrangThai`, `xetDaGoi`, hàm quyết hoàn tác lô]
- Core: A×B ở AC-3, AC-5; C ở AC-2; D ở AC-4, AC-6, AC-7; chọn ở AC-1; phím tắt ở AC-8; rào AC-9.
- Later: đổi đầu chủ hàng loạt (Hỏi-1) · dán, kéo điền · Ctrl/Cmd+Z hoàn tác cả lô · «Không nghe máy» hàng loạt.
- Never: Đã bán hàng loạt (giá chốt từng căn) · ghi khi người chưa bấm «Đổi».

## Đường đo

- Tỉ lệ căn xác nhận trong N ngày (ô cơ hội): số từ sự kiện xác nhận với chủ nhà của mỗi căn (độ tươi đã có ở lõi, hàng
  9); AC-5 bảo đảm «đánh dấu đã gọi» hàng loạt ghi đúng sự kiện xác nhận cho từng căn, nên thước đếm được lần gọi theo lô.

## Out of scope

- Đổi đầu chủ hàng loạt — tách thành hàng sau (Hỏi-1): cần hàng mang đầu chủ, danh sách thành viên cho trưởng nhóm, vai
  người dùng ở web.
- Đã bán hàng loạt — mỗi căn cần giá chốt riêng; đổi từng căn trên ô (hàng 15).
- Dán, kéo điền nhiều ô — không thuộc câu giao của hàng 16.
- Khổ điện thoại — sửa chỉ có trên máy tính (luật 6).
- Ctrl/Cmd+Z hoàn tác cả lô — lô hoàn tác bằng nút trên thông báo.
- «Không nghe máy» hàng loạt — lõi chưa có sự kiện cho kết quả này; thêm là đổi `packages/core`, ngoài ranh giới.

## Notes

- Dữ liệu cho bài nhìn: chỗ thử dãy B của hàng 14 (`_acceptance/bang-hang-kieu-sheet/thu/dung-b.mjs`).
- Ngoài-1 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Sau khi sửa nhiều căn một lần, máy chủ chỉ nhận ngay căn đầu; các căn còn lại lên sau khoảng 15 giây. Trong lúc đó người khác và trang khách chưa thấy thay đổi dù thông báo đã báo xong. — `apps/web/src/app/(app)/inventory/bulk/thanh.tsx`
- Ngoài-2 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Hiện tại hộp hỏi vẫn ghi đúng tên mục còn thiếu. Nếu sau này sản phẩm thêm một mục bắt buộc mới, hộp hỏi của sửa hàng loạt có thể ghi «thiếu undefined» thay vì tên mục. — `apps/web/src/app/(app)/inventory/bulk/lo.ts`
- Ngoài-4 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Một bài kiểm tự động nói là bảo vệ việc «căn đã đóng không bị gọi nhầm» thực ra không bắt được lỗi nếu bộ xét sai. Người dùng không thấy gì ngay, nhưng lỗi về sau có thể lọt qua. — `apps/web/src/app/(app)/inventory/bulk/lo.test.ts`
- Ngoài-5 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Bài kiểm xác nhận chỉ ba cột sửa được trên bảng chỉ đọc chữ trong mã nên có thể xanh dù bảng thật mở nhầm cột, hoặc đỏ dù bảng đúng. Người dùng chưa gặp lỗi nào. — `apps/web/src/app/(app)/inventory/cell-edit/cot-sua.test.ts`
- Ngoài-6 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Bài kiểm câu cảnh báo «Không hoàn tác được» chỉ phủ một phần các chuyển trạng thái, nên một lệch ở chuyển còn lại có thể không bị bắt. Hiện chưa thấy người dùng gặp lỗi. — `apps/web/src/app/(app)/inventory/cell-edit/hoan-tac.test.ts`
- Known limits — chọn ở Cổng Bằng chứng 2026-11-01:
  - Ngoài-1: Sửa nhiều căn một lần thì máy chủ nhận ngay căn đầu, các căn còn lại lên sau khoảng 15 giây.
  - Ngoài-2: Lõi thêm mục bắt buộc mới thì hộp hỏi của sửa hàng loạt có thể ghi «thiếu undefined».
  - Ngoài-4: Đối chứng đỏ của bài «căn đã đóng không bị đánh dấu đã gọi» còn yếu.
  - Ngoài-5: Bài kiểm «chỉ ba cột sửa được» đọc chữ trong mã thay vì cấu hình bảng thật.
  - Ngoài-6: Bài kiểm cảnh báo «Không hoàn tác được» chỉ phủ 4 trên 12 chuyển trạng thái.

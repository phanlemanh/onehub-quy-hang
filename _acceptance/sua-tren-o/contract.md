---
schema_version: 1
feature: "Đầu chủ sửa giá, phí, trạng thái ngay trên ô; giá luôn kèm điều kiện phí, máy nói lại «Hiểu là…», sửa là vừa xác nhận với chủ nhà, hoàn tác được"
slug: sua-tren-o
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, docs]
status: implemented
approved_by: Manh Phan
approved_at: 2026-11-01
design_doc: _acceptance/sua-tren-o/design.md
---

# Acceptance Contract: sua-tren-o

## Context

Hàng 15 của lộ trình, màn P0 (2b), luật sản phẩm 6–10. Bật sửa trên ô cho ba cột Giá, Phí, Trạng thái của Bảng hàng
(hàng 14) trên máy tính. Lõi đã có: giá luôn kèm điều kiện phí, đổi giá/trạng thái tính là vừa xác nhận với chủ nhà,
báo khi hai người cùng sửa, ghi trên máy trước (hàng 6, 13). Hàng này thêm bộ đọc giá và ngưỡng hỏi lại ở
`packages/core/src/pricing/`, trình sửa ở `apps/web/src/app/(app)/inventory/cell-edit/`, và nối vào Bảng hàng. Sửa hàng
loạt, dán, kéo điền là hàng 16.

Source input: hàng 15 của `docs/plan/lo-trinh.json` · ô cơ hội `_acceptance/sua-tren-o/opportunity.md` (ký `build`) ·
trả lời giám sát B-9 (chạm `bang-hang.tsx`, `cot.ts`, `proto/sua-tren-o/`, dòng «chỉ đọc» ở `vo-va-ia.md` và Tham chiếu).

## Criteria

- AC-1: Given bộ đọc giá ở `packages/core/src/pricing/`, When đọc một bảng chữ viết trước (ít nhất 20 dòng: «4,65 tỷ»,
  «4.65 tỷ», «4,65t», «4 tỷ 650», «4ty65», «950 triệu», «950tr», «950 tr», «4650000000», «4.650.000.000», «1,2 tỷ», …),
  Then mỗi dòng ra đúng số đồng đã viết trước; và các dòng mơ hồ hay sai (chữ trống, «abc», «12», «4,65 tỷ 3 triệu 2»,
  số âm, quá 1.000 tỷ) ra «chưa hiểu», không đoán số.
- AC-2: Given Đầu chủ mẫu trên Bảng hàng khổ 1440×900, When mở sửa ô Giá của một hàng đang có giá và gõ «4,8 tỷ», Then
  dưới ô hiện «Hiểu là: 4,8 tỷ, <điều kiện phí đang chọn>» trước khi ghi; Enter ghi đúng MỘT sự kiện đổi giá mang cả giá
  4.800.000.000 lẫn điều kiện phí; ô và chân bảng đổi ngay; không có nút Lưu. (cross-layer)
- AC-3: Given trình sửa Giá, When gõ chữ bộ đọc trả «chưa hiểu», Then dưới ô báo «Chưa hiểu «…» — gõ như 4,65 tỷ hoặc
  950 triệu», Enter không ghi gì (hàng chờ gửi không thêm lệnh nào), Esc trả ô về giá cũ.
- AC-4: Given giá luôn đi cùng điều kiện phí, When sửa, Then trình sửa Giá luôn có hai nút «Bao phí / Không bao phí»
  (mặc định điều kiện hiện tại; hàng chưa có giá thì chưa chọn và Enter không ghi tới khi chọn); sửa ô Phí ghi một sự
  kiện đổi giá với giá cũ + điều kiện mới; ô Phí của hàng chưa có giá mở trình sửa Giá. Không đường nào ghi giá thiếu
  điều kiện phí hay điều kiện phí thiếu giá. (cross-layer)
- AC-5: Given ngưỡng hỏi lại khai một chỗ có tên trong `packages/core/src/pricing/` (20, chú thích «mặc định của sàn»),
  When giá mới lệch quá 20% so với giá cũ cùng điều kiện phí, hoặc điều kiện phí đổi, Then trước khi ghi hiện hộp hỏi lại
  tại ô với giá cũ → giá mới và phần trăm đổi; «Đổi» ghi, «Thôi» không ghi gì; lệch đúng 20% hay ít hơn thì ghi thẳng.
  Ma trận viết trước gồm biên 20% / 20,01%, hai chiều tăng giảm, đổi phí, hàng chưa có giá.
- AC-6: Given ô Trạng thái, When mở sửa, Then danh sách chỉ gồm các nấc chuyển hợp lệ từ trạng thái hiện tại theo bảng
  ADR-0008 (sáu trạng thái × nấc đi, ma trận viết trước); chọn «Đã bán» hỏi giá chốt (cùng bộ đọc giá) và ngày bán (mặc
  định hôm nay); chọn «Ngừng hẳn» hỏi một trong ba lý do; chọn «Đang bán» khi thiếu điều kiện thì báo thiếu gì và không
  ghi. (cross-layer)
- AC-7: Given luật 9, When ghi một lần sửa giá hay trạng thái từ trên ô, Then trình sửa hiện «Tính là vừa xác nhận với
  chủ nhà», sự kiện ghi ở máy chủ mang `confirmedWithOwner: true`, và cột Xác nhận của hàng thành «Hôm nay». (cross-layer)
- AC-8: Given một lần sửa vừa ghi, When bấm «Hoàn tác» trên thông báo (trong 10 giây) hay Ctrl/Cmd+Z, Then ghi MỘT sự
  kiện mới đưa về đúng giá trị trước (giá và điều kiện phí cũ, hay trạng thái cũ), sự kiện cũ vẫn còn trong lịch sử; khi
  lần sửa không hoàn tác được — nấc cuối Đã bán, Ngừng hẳn; chuyển mà chiều ngược không có trong bảng ADR-0008; lần đặt
  giá đầu tiên — thì hộp hỏi lại hiện «Không hoàn tác được» TRƯỚC khi ghi và thông báo sau khi ghi không có nút Hoàn tác.
  (cross-layer)
- AC-9: Given Bảng hàng, When thử mở sửa ở mọi cột, Then chỉ ba cột Giá, Phí, Trạng thái mở được trên máy tính; mười sáu
  cột còn lại (mười ba cột hiện và ba cột ẩn: thuộc tính căn và phần khác) không mở; khổ 375 không mở sửa ở cột nào; mất mạng vẫn sửa được (ô đổi, hàng
  chờ gửi tăng một) và gửi khi có mạng; hai người cùng sửa một hàng thì hàng vào «Cần xem», không ghi đè lặng.
- AC-10: Given cây sau hàng này, When chạy kiểm kiểu, lint (luật `quy-hang-ui`, mức nợ 0, kiểm chuẩn danh mục), bộ test
  và bộ kiểm cách ly, Then tất cả xanh; `vo-va-ia.md` và Tham chiếu thôi ghi Bảng hàng «chỉ đọc» và §12 có dòng sổ của
  hàng này; không tệp nào ngoài ranh giới đã duyệt (B-9) đổi.

## Đường đo

Ngưỡng của ô cơ hội (đề xuất, chưa có số): đạt «Đầu chủ sửa giá, phí, trạng thái ngay trên ô…». Số «tỉ lệ căn xác nhận
trong N ngày» (Tham chiếu §11) là của phiên nghiệm thu sau hai tuần thử — hàng này bảo đảm mỗi lần sửa trên ô ghi đúng
một lần xác nhận để số ấy đếm được.

- Thước: sửa trên ô ghi đúng sự kiện · số từ: E2, E4, E6 · bảo đảm bởi: AC-2, AC-4, AC-6
- Thước: lần sửa tính là xác nhận · số từ: E7 · bảo đảm bởi: AC-7
- Thước: hoàn tác được · số từ: E8 · bảo đảm bởi: AC-8

## Coverage

Quét không gian AC theo trục (morphological, preset entity-feature, rút gọn):

- Trục A — cột sửa: Giá · Phí · Trạng thái · (16 cột khoá) [thước CE: luật 6, `cot.ts`]
- Trục B — loại thay đổi: tăng/giảm giá trong ngưỡng · vượt ngưỡng · đổi điều kiện phí · đặt giá lần đầu · từng nấc chuyển
  trạng thái · nấc cần thêm thông tin (Đã bán, Ngừng hẳn) · nấc thiếu điều kiện (Đang bán) [thước CE: luật 7, ADR-0008]
- Trục C — chữ người gõ: đúng · mơ hồ · sai · biên [thước CE: bảng chữ viết trước của AC-1]
- Trục D — sau khi ghi: hoàn tác được · không hoàn tác được · xác nhận · mất mạng · đụng nhau [thước CE: luật 8, 9, 10, 30]
- Trục E — khổ: 1440 · 375 [thước CE: luật 6]
- Core: A×B ở AC-2, AC-4, AC-5, AC-6; C ở AC-1, AC-3; D ở AC-7, AC-8, AC-9; E ở AC-9; rào AC-10.
- Later: sửa bốn phần chữ của lần rao trên ô · cờ «không tính là xác nhận» · hoàn tác gỡ lần xác nhận của lần sửa nhầm · sàn chỉnh ngưỡng · màn sửa nhanh điện thoại.
- Never: sửa thuộc tính căn trên ô (luật 6) · ghi giá không kèm điều kiện phí (luật 7).

## Out of scope

- Sửa hàng loạt, dán nhiều ô, kéo điền, đổi trạng thái cho hàng đã tích (hàng 16).
- Sửa Nội thất, Pháp lý, Tài chính, Tình trạng sử dụng trên ô — bốn phần chữ của lần rao, để hàng sau.
- Cờ «không tính là xác nhận với chủ nhà» trên trình sửa — cần sửa bộ đồng bộ (`lib/sync`), ngoài ranh giới.
- Hoàn tác gỡ luôn lần xác nhận của lần sửa nhầm — cột Xác nhận lấy lần xác nhận mới nhất, nên cần sửa bước gấp ở lõi
  và bộ đồng bộ; ở hàng này hoàn tác tính như mọi lần sửa (Hỏi-2, sổ d-20261101T021239Z-9). Để hàng sau.
- Sàn chỉnh ngưỡng 20% ở Cài đặt sàn — hàng cấu hình theo sàn đọc hằng của hàng này.
- Giá về tay và tỉ lệ bao phí (luật 12–13); màn sửa nhanh trên điện thoại.

## Notes

- Chạm ngoài vùng, giám sát duyệt B-9: `inventory/bang-hang.tsx`, `inventory/cot.ts` (bật `cellEdit` ba cột, nối trình
  sửa), `proto/sua-tren-o/` (trang mẫu design-pass), dòng «chỉ đọc» của Bảng hàng ở `docs/design/vo-va-ia.md` và Tham
  chiếu + dòng sổ §12.
- Dữ liệu cho bài nhìn: chỗ thử dãy B của hàng 14 (`_acceptance/bang-hang-kieu-sheet/thu/dung-b.mjs`, 40 hàng mẫu).

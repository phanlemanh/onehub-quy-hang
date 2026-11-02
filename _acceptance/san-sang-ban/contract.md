---
schema_version: 1
feature: Đầu chủ bấm «Sẵn sàng bán» và căn lên bảng hàng chung ngay khi máy kiểm đủ giá về tay, ảnh thật, pháp lý, tình trạng sử dụng; thiếu thì chỉ đúng chỗ thiếu
slug: san-sang-ban
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: signed-off
design_doc: docs/superpowers/specs/2026-11-01-san-sang-ban-design.md
approved_by: Manh Phan
approved_at: 2026-11-01
---

# Acceptance Contract: san-sang-ban

## Context

Hàng 23 (luật 17: một chạm, không qua người duyệt). Lõi đã chặn lối vào Đang bán bằng giá kèm điều kiện phí, pháp lý,
tình trạng sử dụng (ADR-0008); ADR-0008 hẹn thêm điều «ảnh thật» khi có kho ảnh — kho ảnh có từ hàng 18. Hồ sơ căn chưa
có nút đổi trạng thái. «Giá về tay» giữ nghĩa «giá kèm điều kiện phí» tới khi có phần tính giá (hàng 28). Không đổi cơ sở
dữ liệu.

## Criteria

- AC-1: Given luật lõi vào Đang bán, When kiểm với số ảnh thật và số ảnh tối thiểu của sàn trong ngữ cảnh, Then số ảnh
  thật < tối thiểu → thiếu `realPhoto`; ≥ tối thiểu → không thiếu; vắng tối thiểu → mặc định 1; cấu hình
  `listing.ready_min_real_photos` ngoài khoảng 1–20 hay sai kiểu bị lõi từ chối khi đọc thành cấu hình (về mặc định, nêu
  khoá); bốn điều cũ (giá, điều kiện phí, pháp lý, tình trạng sử dụng) giữ nguyên; vào các trạng thái khác không đòi ảnh.
- AC-2: Given hàng đủ giá, điều kiện phí, pháp lý, tình trạng sử dụng, When gửi lệnh đổi sang Đang bán qua API mà căn
  không có ảnh thật (không ảnh · chỉ ảnh mẫu · chỉ ảnh ngăn Nội bộ · ảnh đã xoá), Then 400 `missing-requirement` với
  `missing` đúng `["realPhoto"]`, không ghi sự kiện; có một ảnh thật ngăn Gửi được → 200, hàng ở Đang bán; sàn đặt
  `listing.ready_min_real_photos` = 2 thì một ảnh thật vẫn bị từ chối, hai ảnh thì qua; sàn khác không đặt khoá vẫn theo
  mặc định 1. (cross-layer)
- AC-3: Given hàng vừa vào Đang bán qua lệnh ở AC-2, When một thành viên khác của sàn đọc hàng, Then đọc được (hàng lên
  «Toàn sàn» như hàng 12); thành viên sàn khác không đọc được.
- AC-4: Given hồ sơ căn của lần rao đang mở, When lần rao ở Chưa đủ để rao hay Tạm ngừng và người xem sửa được hàng,
  Then có nút «Sẵn sàng bán»; ở Đang bán, Đang giao dịch, Đã bán, Ngừng hẳn, hay người không sửa được thì không có nút.
- AC-5: Given nút «Sẵn sàng bán», When bấm mà còn thiếu, Then danh sách «Còn thiếu» liệt đúng các điều thiếu theo luật lõi
  với nhãn «Giá về tay», «Ảnh thật», «Pháp lý», «Tình trạng sử dụng», không lệnh nào được gửi; «Ảnh thật» dẫn tới mục
  Ảnh; điều thiếu của lần rao ghi «Chưa có» đúng ô trong mục «Lần rao đang mở».
- AC-6: Given nút «Sẵn sàng bán», When bấm mà đủ, Then đúng một lệnh đổi trạng thái sang Đang bán đi qua đường lệnh của
  trình sửa ô (cùng `dungLenhTrangThai`, hàng đợi đồng bộ) tới API thật và ra đúng một sự kiện chuyển sang Đang bán, nhãn
  trạng thái thành «Đang bán», nút ẩn; máy chủ từ chối (ảnh vừa bị xoá ở máy khác) thì hàng về trạng thái cũ trên máy và
  «Cần xem» ghi lý do có «ảnh thật». Số ảnh thật nút dùng được đếm từ danh sách ảnh của căn bằng đúng định nghĩa của máy
  chủ (Gửi được, không ảnh mẫu, chưa xoá). (cross-layer)
- AC-7: Given trình sửa ô Trạng thái ở Bảng hàng (kiểm trên máy theo Hỏi-2), When máy chủ từ chối lên Đang bán vì thiếu
  ảnh thật, Then lời báo dùng nhãn «ảnh thật» (bảng nhãn thiếu có đủ mọi điều của luật lõi).
- AC-8: Given bản chạy dev của dãy H với dữ liệu mẫu, When đầu chủ mở hồ sơ một căn Chưa đủ để rao đã đủ giá, pháp lý,
  tình trạng sử dụng nhưng chưa có ảnh, bấm «Sẵn sàng bán», thêm một ảnh, bấm lại, Then mắt thấy lần một «Còn thiếu: Ảnh
  thật», lần hai nhãn «Đang bán» và nút biến mất; Bảng hàng của một thành viên khác thấy căn ấy; căn chỉ có ảnh mẫu báo
  «Còn thiếu: Ảnh thật»; căn thiếu pháp lý thấy ô Pháp lý ghi «Chưa có» và bấm dòng «Ảnh thật» thì màn cuộn tới mục Ảnh.

- AC-9: Given Sổ điểm biến thiên và Đối chiếu ngành, When đọc, Then sổ có điểm `listing.ready_min_real_photos` (kiểu,
  mặc định 1, khoảng 1–20, Quản trị sàn, nguồn hàng 23) và điều khoá K7 trỏ sang điểm ấy cho phần ảnh; mục Đếm khớp số
  dòng; Đối chiếu ngành §7 ghi luật ảnh tối thiểu của MLS kèm nguồn; ADR-0008 ghi điều ảnh thật đã thêm. (judgment)

- AC-10: Given hồ sơ căn ngoại tuyến hay đọc danh sách ảnh lỗi, When có nút «Sẵn sàng bán», Then nút mờ với chữ «Cần mạng
  để kiểm ảnh» và không lệnh nào được gửi.

## Coverage

Bỏ quét không gian: bốn điều của câu giao × một lối mới (nút) cộng các lối cũ qua cùng một cửa API — đã liệt ở AC-1…AC-10
(descope «bỏ coverage-scan»).

## Đường đo

| Thước | Số từ đâu | AC bảo đảm |
|---|---|---|
| Số ngày lead → Sẵn sàng bán | `board_at` (Lên bảng) của hàng lead-bon-nac: mốc sự kiện `status_changed` → `Active`; hàng này giữ sự kiện ấy là lối duy nhất vào Đang bán | AC-2, AC-6 |

## Out of scope

- Máy tính giá về tay (giá bao phí ↔ giá về tay) — hàng 28; ở hàng này «giá về tay» là giá kèm điều kiện phí.
- Màn chỉnh `listing.ready_min_real_photos` và lệnh ghi khoá — hàng màn cấu hình sau; hàng này chỉ đọc khoá.
- Sàn bỏ hay thêm điều kiện khác ngoài số ảnh — ứng viên B#28, chờ hai sàn thật xin.
- Sửa giá, pháp lý, tình trạng sử dụng ngay ở hồ sơ căn — vẫn sửa ở Bảng hàng.
- Nút «Sẵn sàng bán» ở Bảng hàng và trên điện thoại ngoài hồ sơ căn.

## Notes

- Known limits — khai ở thi công 2026-11-01 (giám sát chọn «B»):
  - Nút nạp mẫu bản thật cho sàn mới dừng ở căn Đang bán đầu tiên (căn mẫu chưa có ảnh) tới khi hàng vá nap-mau-co-anh xong; sàn mẫu đã nạp không ảnh hưởng.
- Ngoài-3 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Nếu sàn lỡ đặt số ảnh tối thiểu sai, hệ thống âm thầm dùng 1 ảnh mà không báo ai. Hiện chưa có chỗ nào để sàn tự đặt giá trị này nên chưa ai gặp. — `packages/api/src/listings/store.ts`
- Ngoài-6 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Nếu cấu hình số ảnh tối thiểu của sàn bị sai, căn chỉ có 1 ảnh vẫn lên bán mà không ai được báo. Sàn tưởng đã siết chặt hơn. — `packages/api/src/listings/store.ts`
- Known limits — chọn ở Cổng Bằng chứng 2026-11-02:
  - Ngoài-3: Sàn đặt sai số ảnh tối thiểu thì máy lặng lẽ dùng 1 ảnh; hiện chưa có chỗ để sàn tự đặt nên chưa ai gặp.
  - Ngoài-6: Cấu hình số ảnh tối thiểu sai thì căn một ảnh vẫn lên bán mà không ai được báo.

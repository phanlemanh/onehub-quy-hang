---
schema_version: 1
feature: "Đầu chủ đưa một căn lên Đang bán khi chưa có ảnh thật — ở cả ba cửa; ảnh là mục còn thiếu ở mức đủ và việc «Bổ sung ảnh» ở Hôm nay"
slug: anh-khong-chan-ban
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: approved
design_doc: docs/superpowers/specs/2026-11-07-anh-khong-chan-ban-design.md
approved_by: Manh Phan
approved_at: 2026-11-07
---

# Acceptance Contract: anh-khong-chan-ban

## Context

Luật 17 cũ đòi ít nhất một ảnh thật trước khi căn vào Đang bán; Sheet không có ảnh nên mọi lần chuyển nhà thành một bảng
hàng chung rỗng (audit sàn mới ngày 0 §9.2 dòng 2b). Chủ kho chốt 06/11 (Tham chiếu §12, luật 17 đã đổi): thiếu ảnh không
chặn lên Đang bán ở mọi cửa; ảnh thành một mục của mức đủ và một việc ở Hôm nay; số ảnh tối thiểu là điểm sàn chỉnh được,
mặc định 0. Giá kèm điều kiện phí, pháp lý, tình trạng sử dụng vẫn là điều kiện. Hạng T3 vì chạm luật trạng thái ở lõi
(`packages/core/src/listing/**`) và sổ điểm biến thiên. Không migration. Thiết kế: `docs/superpowers/specs/2026-11-07-anh-khong-chan-ban-design.md`.

Dữ liệu mẫu: `[Tên]`, `0900 000 0xx`, `[Tên sàn]`.

## Criteria

- **AC-1 — Số ảnh tối thiểu mặc định 0.** Given sổ điểm biến thiên, When đọc điểm `listing.ready_min_real_photos`, Then
  mặc định 0, khoảng 0–20 (lõi, bản sao hằng số, bộ đọc cấu hình sàn cùng một số); `missingFor("Active")` của căn đủ giá
  kèm điều kiện phí, pháp lý, tình trạng sử dụng, mã căn mà 0 ảnh thật và tối thiểu 0 → rỗng; tối thiểu k ∈ {1, 2, 20} và
  số ảnh k−1 → đúng `["realPhoto"]`, số ảnh k → rỗng; giá trị −1, 21, 1.5 bị bộ đọc từ chối và về mặc định.
- **AC-2 — Máy chủ nhận căn 0 ảnh ở ba cửa.** Given sàn chưa đặt số ảnh tối thiểu và một căn đủ điều kiện khác, 0 ảnh thật,
  When đưa căn lên Đang bán bằng (a) lệnh của nút «Sẵn sàng bán», (b) lệnh sửa ô Trạng thái / sửa hàng loạt ở Bảng hàng,
  (c) nhập file dòng «còn hàng», Then căn ở Đang bán, sự kiện `status_changed` ghi đúng một lần, và đầu khách của sàn thấy
  căn trong `GET /api/v1/listings`; When sàn đặt tối thiểu 2 và căn có 1 ảnh thật, Then (a)(b) bị từ chối `missing:
  ["realPhoto"]` như hôm nay và (c) để dòng ở Chưa đủ để rao với lý do chứa «ảnh thật», không chứa mã `realPhoto`; sàn
  đã lưu dòng tối thiểu 1 từ trước hàng này giữ 1 (căn 0 ảnh vẫn bị từ chối), sàn chưa từng lưu dòng ấy đi theo Hỏi-6.
  (cross-layer)
- **AC-3 — Bảng hàng không đẩy căn 0 ảnh vào «Cần xem».** Given máy của đầu chủ, sàn chưa đặt số ảnh tối thiểu, When sửa ô
  Trạng thái của căn 0 ảnh sang Đang bán và đồng bộ, Then máy chủ nhận, «Cần xem» rỗng, ô hiện Đang bán; When sàn đặt
  tối thiểu 1, Then «Cần xem» có đúng căn ấy với lý do «thiếu ảnh thật» như hôm nay. (cross-layer)
- **AC-4 — Bản xem hàng mang số ảnh thật.** Given căn có ảnh ở ngăn Gửi được, ảnh ở ngăn Nội bộ, ảnh mẫu và ảnh đã gỡ, When
  đọc `GET /api/v1/listings` và `/{id}`, Then `photosCount` bằng số ảnh thật gửi được (không mẫu, chưa gỡ) — cùng con số
  mà máy chủ dùng để xét Đang bán; `completeness` có mục `photos` (đủ khi ≥ 1), tổng 6; căn 0 ảnh có `photos` trong
  `missing`; bản xem không thêm trường nguồn nào.
- **AC-5 — Ảnh hiện là mục thiếu ở mức đủ.** Given căn 0 ảnh đủ năm mục mô tả, When xem hồ sơ căn, cột «Mức đủ» của Bảng
  hàng và mức đủ ở màn cuộc gọi, Then hiện 5/6 và mục «Ảnh thật» là mục còn thiếu; danh sách hỏi của màn cuộc gọi vẫn
  đúng năm mục mô tả; số đo «mức đủ cao nhất» vẫn đếm năm mục mô tả (Hỏi-2).
- **AC-6 — Việc «Bổ sung ảnh» ở Hôm nay.** Given bộ nhóm mặc định, When dựng Hôm nay của đầu chủ, Then có nhóm «Bổ sung
  ảnh» (điều kiện đóng `missing_photo`, hành động «Mở hồ sơ») chứa đúng các căn đầu chủ giữ, đang mở (Chưa đủ để rao, Đang
  bán, Giữ chỗ, Đang giao dịch) và 0 ảnh thật; căn có ảnh, căn đã bán hay ngừng hẳn, căn của đầu chủ khác không vào; nhóm
  «Thiếu thông tin» không nhận căn chỉ vì thiếu ảnh; bộ nhóm sàn đã lưu riêng không đổi (Hỏi-3); bộ kiểm bộ nhóm chấp nhận
  điều kiện mới và từ chối khoá lạ trên nó; số ảnh tới máy của đầu chủ qua bộ đồng bộ — tải một ảnh Gửi được rồi kéo lại
  thì căn rời nhóm và mức đủ thành 6/6. (cross-layer)
- **AC-7 — Nút «Sẵn sàng bán» khớp số tối thiểu của sàn.** Given hồ sơ căn, When sàn tối thiểu 0 và căn 0 ảnh đủ điều kiện
  khác, Then «Còn thiếu» không có «Ảnh thật» và nút gửi lệnh (kể cả khi không đếm được ảnh lúc mất mạng); When sàn tối
  thiểu 2 và căn 1 ảnh, Then «Còn thiếu: Ảnh thật» như hôm nay.
- **AC-8 — Quản trị sàn đặt số ảnh tối thiểu.** Given Cài đặt sàn › Trạng thái, When quản trị sàn mở, Then có ô «Số ảnh
  thật tối thiểu để căn vào Đang bán» 0–20, đang hiện 0; lưu 2 → máy chủ xét theo 2 từ lệnh kế; lưu 21 → bị từ chối với
  câu nói khoảng; người không phải quản trị không thấy ô và lưu qua API bị từ chối; ở khổ 1440 và 375.
- **AC-9 — Gửi được và trang khách mở căn không ảnh.** Given căn Đang bán 0 ảnh, When đầu khách tạo lần gửi có căn ấy và
  khách mở `/s/<mã>`, Then máy chủ nhận lần gửi, dữ liệu trang khách có căn với danh sách ảnh rỗng, thẻ căn và chi tiết
  căn hiện ô ảnh trống, không lỗi; ảnh ngăn Nội bộ không ra trang khách hay bản xem qua số đếm hay mục ảnh (bộ kiểm rò rỉ
  có mồi mới). (cross-layer)

## Coverage

Quét bằng skill `morphological-scan` (preset entity-feature + risk-premortem). Đối tượng: một căn đi lên Đang bán.

| Trục | Giá trị | Thước CE |
| --- | --- | --- |
| Cửa lên | «Sẵn sàng bán» · ô Trạng thái · sửa hàng loạt · nhập file | Tham chiếu §12 dòng 06/11 «ở mọi cửa»; `packages/api/src/listings/store.ts:257`, `imports/store.ts:380` |
| Số ảnh thật | 0 · dưới tối thiểu · bằng tối thiểu | luật 17 đã đổi |
| Tối thiểu của sàn | chưa đặt (0) · 1 · 2 · 20 · ngoài khoảng | sổ điểm biến thiên dòng 33 |
| Loại ảnh | Gửi được · Nội bộ · mẫu · đã gỡ | `nguCanhAnh` |
| Chỗ thấy | hồ sơ căn · Bảng hàng · cuộc gọi · Hôm nay · Cài đặt · trang khách | câu giao hàng lộ trình |
| Mạng | có mạng · mất mạng | luật ghi trên máy, hàng 13 |

Core ↔ AC: cửa × số ảnh × tối thiểu → AC-1, AC-2, AC-3, AC-7; loại ảnh → AC-4; chỗ thấy → AC-5, AC-6, AC-8, AC-9; mạng →
AC-3, AC-7. Later/Never ở «Out of scope».

## Đường đo

- Căn 0 ảnh vào Đang bán ở cả ba lối · số từ ca ba cửa của bộ kiểm API trên Postgres (đếm căn Đang bán, đầu khách thấy) · AC-2, AC-3
- Số ảnh tối thiểu mặc định 0, đặt 1–20 thì luật cũ áp lại · số từ ma trận tối thiểu × số ảnh ở lõi và ca đặt 2 ở máy chủ · AC-1, AC-2, AC-8
- Trang khách mở căn không ảnh hiện ô trống, không lỗi · số từ ca dựng trang khách 0 ảnh · AC-9
- Căn thiếu ảnh có dấu ở Bảng hàng và việc ở Hôm nay · số từ cột Mức đủ và nhóm «Bổ sung ảnh» trên bộ mẫu · AC-5, AC-6

## Out of scope

- Cửa nhập đưa căn thiếu pháp lý hay tình trạng sử dụng lên Đang bán — hàng `can-nhap-len-bang-chung`.
- Tự thêm nhóm «Bổ sung ảnh» vào bộ nhóm Hôm nay mà sàn đã lưu riêng.
- Đổi số đo «mức đủ cao nhất» sang sáu mục.
- Màn tải ảnh, ảnh mẫu, nhắc ảnh theo số lượng (ví dụ «còn thiếu 3 ảnh»).
- Ẩn căn không ảnh khỏi trang khách hay bản phát hàng.

## Notes

- Không migration: số tối thiểu là một dòng `company_settings`; không ràng buộc cơ sở dữ liệu nào chặn Đang bán theo ảnh.

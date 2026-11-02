---
schema_version: 1
feature: Đầu chủ được giao lead mở số chủ nhà của lead ấy ở Hôm nay để gọi; mỗi lần mở là một vết
slug: mo-so-lead
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, db, ui]
status: draft
design_doc: docs/superpowers/specs/2026-11-02-mo-so-lead-design.md
approved_by:
approved_at:
---

# Acceptance Contract: mo-so-lead

## Context

Hàng phát sinh của đợt `dau-chu-dong-vao` (dãy L), tách từ Hỏi-3 hàng 22: chủ kho chọn để «mở số của lead cho đầu chủ»
thành hàng riêng, Hôm nay không hiện số tới khi hàng này xong. Đầu chủ đang nhận lead với hạn gọi 30 phút mà không có số
trong app. Hàng thêm một bảng vết có luật theo dòng (T3), theo nếp «Mở số» của hồ sơ căn (hàng 11, 62).

Source input: `_acceptance/hom-nay-dau-chu/decisions.jsonl` d-20261101T135417Z-10 · `docs/plan/lo-trinh.json` hàng
`mo-so-lead` · thiết kế `docs/superpowers/specs/2026-11-02-mo-so-lead-design.md`

Từ ngữ: «đầu chủ được giao» = người nhận hiện tại của lead (nhịp chia, trưởng nhóm giao, lúc nhập khớp chủ nhà, tự nhận
kho chung) còn vai Đầu chủ; «vết mở số» = một dòng ghi người, vai, lúc mở.

## Criteria

- AC-1: Given đầu chủ được giao một lead còn trong việc của mình (lead không trùng hay chủ trùng, chưa bỏ, chưa trả lại), ở
  nấc Đã gửi, Đã nhận hay Đã gọi, When gọi mở số của lead ấy, Then nhận đúng số người nhập cùng lead, cơ sở dữ liệu có thêm
  đúng một vết ghi người, vai, lúc, và lead không đổi nấc hay mốc nào; mở lần hai thêm vết thứ hai. (cross-layer)
- AC-2: Given một lead của sàn, When người khác mở số — đầu chủ không được giao, telesales đã nhập lead, trưởng nhóm, quản
  trị sàn, người sàn khác, người nhận đã bị gỡ vai Đầu chủ — hay khi lead đã trả lại, đã gửi lại thành lead mới, hay là lead
  căn trùng (tin bổ sung cho căn đang rao — theo Hỏi-3), Then bị từ chối và không có vết nào được ghi.
- AC-3: Given bảng vết mở số của lead, When đọc lược đồ và gọi bằng vai API, Then bảng bật và ép luật theo dòng; người mở đọc
  vết của mình, trưởng nhóm cùng sàn đọc mọi vết của sàn, người khác cùng sàn và người sàn khác không đọc được; vai API không
  thêm, sửa, xoá thẳng được dòng nào (chỉ hàm mở số ghi), kể cả vai chủ không sửa hay xoá được (chỉ thêm).
- AC-4: Given lead có số, When đầu chủ đọc danh sách lead giao cho mình, khi mở số bị từ chối, và khi máy chủ ghi nhật ký,
  Then số không xuất hiện ở các chỗ ấy — số chỉ ra ở câu trả lời của cửa mở số.
- AC-5: Given đầu chủ mở Hôm nay có lead ở nhóm «Lead mới», When bấm «Mở số» trên dòng lead, Then số hiện trên dòng theo
  nhóm chữ số kèm nút «Gọi» mở ứng dụng gọi (`tel:`); tải lại trang thì số ẩn lại; web không lưu số trên máy; lỗi (mất
  mạng, lead không còn của bạn, hết phiên) hiện một dòng dưới nút và nút vẫn bấm lại được; mở số không tự ghi «Đã nhận» hay
  «Đã gọi».
- AC-6: Given Tham chiếu, When đọc §12 Sổ quyết định, Then có dòng mới ghi «Mở số của lead» (ai mở được, mỗi lần một vết,
  số không lưu trên máy).

## Coverage

Bỏ quét coverage có tên — không gian AC là một cửa có sẵn khuôn (Mở số của hồ sơ căn, hàng 11, 62), trục đã kê thẳng
(dòng `descope` «bỏ coverage-scan»). Trục đã phủ: ai mở (AC-1, AC-2) · lead ở nấc nào (AC-2) · vết (AC-1, AC-3) · rò số
(AC-4, AC-5) · màn (AC-5) · tài liệu (AC-6).

## Out of scope

- Mở các số khác của liên hệ chủ nhà (hàng 85) — chỉ số nhập cùng lead.
- Gọi trong trình duyệt, ghi âm, kết quả cuộc gọi — hàng 28 (Cuộc gọi), 30.
- Màn xem vết mở số cho trưởng nhóm — hàng 42.
- Telesales xem lại số đã nhập — giữ chốt 29/10.
- Thử bấm «Gọi» trên điện thoại thật — phiên nghiệm thu.

## Notes

- Giám sát cấp (02/11): migration `017_mo_so_lead.sql` (số giữ cho hàng này), vùng ở `hang-viec.json`.
- Hỏi-1 (trưởng nhóm có mở được không), Hỏi-2 (mở số có tự ghi «Đã nhận»), Hỏi-3 (lead căn trùng có mở được) nháp theo
  khuyến nghị «không» — chủ kho chốt ở Cổng Phạm vi.

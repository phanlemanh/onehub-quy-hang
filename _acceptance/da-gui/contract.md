---
schema_version: 1
feature: "Đầu khách mở Đã gửi và thấy từng link: lượt khách mở, căn được quan tâm, căn vừa đổi kèm «Gợi ý căn thay»; tắt được link"
slug: da-gui
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: draft
design_doc: docs/superpowers/specs/2026-11-04-da-gui-design.md
approved_by:
approved_at:
---

# Acceptance Contract: da-gui

## Context

Hàng 36 của lộ trình (dãy L, đợt `dau-khach-nhap`), Cổng Đáng: build (Manh Phan 02/11). Đứng trên hàng 34 (Lần gửi) và 35
(trang khách, `share_events`). Hạng T3: migration mới (hàm tắt link). Hợp đồng mang thêm bốn mục chủ kho chọn «mở hợp đồng
mới» ở Cổng Bằng chứng hàng 35 (luật đợt 49, nguồn «Ngoài-1/4/5/8 hàng 35»).

Source input: `docs/plan/lo-trinh.json` hàng 36 · `_acceptance/da-gui/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-11-04-da-gui-design.md`.

Từ ngữ: «Đã gửi» = `/shares`; «Lần gửi» = một dòng `shares`; «lượt mở», «lượt quan tâm» = sự kiện `link_opened`,
`interest` của `share_events` (hàng 35); «vừa đổi» = căn có sự kiện đổi giá hay đổi trạng thái sau lúc gửi; «căn thay» =
căn luật «Gợi ý căn thay» chọn (Hỏi-3).

## Criteria

- **AC-1** (cross-layer) — Given đầu khách đã gửi n link, When mở Đã gửi, Then thấy đúng n thẻ của chính mình, mới trước,
  mỗi thẻ có người nhận (tên nhu cầu khách hay «Nhóm môi giới»), số căn, bìa tối đa bốn ảnh căn; trưởng nhóm thấy link của cả
  sàn (kho chưa có «nhóm» — đội là cả sàn); vai khác bị chặn (API 403, màn báo vai); dữ liệu qua `GET /api/v1/shares` không mang số khách hay trường lớp `source`.
- **AC-2** (cross-layer) — Given khách đã mở link và chạm «Quan tâm», When xem thẻ và chi tiết, Then thẻ có số lượt mở, số
  lượt quan tâm và giờ mở gần nhất đúng bằng số dòng `share_events` của Lần gửi; chi tiết có số lượt quan tâm từng căn theo
  thứ tự gửi.
- **AC-3** (cross-layer) — Given một căn trong link đổi giá hay đổi trạng thái sau lúc gửi, When xem chi tiết, Then căn ấy
  mang nhãn «Vừa đổi» với giá cũ → mới hay trạng thái mới; căn không đổi không mang nhãn.
- **AC-4** (cross-layer) — Given một căn vừa đổi, When xem chi tiết, Then có «Gợi ý căn thay» gồm tối đa ba căn theo luật
  Hỏi-3 ở lõi (Đang bán, chưa có trong link, cùng số phòng ngủ, giá trong ±15% giá gửi, cùng toà trước rồi giá gần nhất);
  chạm một căn thay mở luồng Gửi `/shares/new?can=<id>`.
- **AC-5** (cross-layer) — Given người được tắt link (Hỏi-2), When bấm «Tắt link» và xác nhận, Then `shares.disabled_at`
  được đặt qua `app.disable_share`, thẻ mang nhãn «Đã tắt», trang khách của link ấy hiện «Link không còn mở được»; người
  khác (đầu khách khác, vai khác, sàn khác) bị từ chối, không đổi gì; link đã tắt không tắt lại được và không có nút bật lại.
- **AC-6** — Given các trạng thái của màn, When dựng Đã gửi, Then có trống («Chưa gửi link nào» + «Gửi căn»), lỗi tải («Chưa
  tải được — thử lại»), đang tải, vai không xem được — đi qua `TrangThai`.
- **AC-7** (cross-layer) — Given migration mới, When chạy bộ kiểm cách ly, Then `app.disable_share` chỉ đặt `disabled_at` cho
  Lần gửi của sàn đang làm khi người gọi là người gửi (hay trưởng nhóm theo Hỏi-2); vai `quy_hang_app` vẫn không update thẳng
  bảng `shares`.
- **AC-8** (nguồn «Ngoài-1/5 hàng 35») — Given trình duyệt chặn lưu trữ (đọc `window.localStorage` ném lỗi), When trang khách
  dựng nút «Quan tâm» và khách chạm, Then trang không vỡ, lời gọi vẫn gửi với mã máy tạm.
- **AC-9** (cross-layer; nguồn «Ngoài-4 hàng 35») — Given route đọc công khai trả lỗi máy chủ (5xx), When trang khách dựng,
  Then hiện «Chưa mở được — thử lại sau», không hiện «Link không còn mở được»; chỉ 404 mới là link không còn mở được.
- **AC-10** (nguồn «Ngoài-8 hàng 35») — Given app API thật, When chạy rào route công khai, Then mỗi route dưới
  `/api/v1/public/` có một bài rò rỉ gọi chính route ấy trên app và quét đầu ra bằng `timRoRi`; nhắc tên route trong chú
  thích không được tính; route mới không có bài thì rào đỏ nêu route. Màn Đã gửi có khuôn nhóm mới `design/patterns/da-gui.md`,
  `npm run lint` xanh, Tham chiếu ghi «Đã gửi — Đã dựng (hàng 36)».

## Coverage

Quét `morphological-scan` preset entity-feature trên «Đã gửi»: trục **người xem** (đầu khách gửi · đầu khách khác ·
trưởng nhóm · vai khác · sàn khác) × **trạng thái link** (mở · đã tắt) × **phản ứng** (chưa mở · đã mở · có quan tâm) ×
**căn** (không đổi · đổi giá · đổi trạng thái) × **hành động** (xem · tắt · gửi căn thay) × **lớp** (màn · API · hàm · trang
khách). Core → AC-1…AC-10; Later/Never → Out of scope. Thước CE: mỗi người xem có dòng ở AC-1 hay AC-5; mỗi trạng thái căn có
dòng ở AC-3; bốn mục hàng 35 mỗi mục một AC (AC-8, AC-9, AC-10).

## Đường đo

- «Số link khách mở», «số lượt quan tâm» (Tham chiếu §11): đếm từ `share_events` (hàng 35); AC-2 bảo đảm Đã gửi đọc đúng
  cùng nguồn ấy. Nối hai số đo vào bảng số đo là việc giám sát (luật đợt 35) — ghi ở Notes.

## Out of scope

- Báo đầu khách khi khách mở hay quan tâm (Hôm nay của đầu khách, hàng 37).
- Lịch xem, xin dẫn xem (P1, chờ phỏng vấn).
- Bật lại link đã tắt (Hỏi-4); sửa bộ căn của link đã gửi.
- Luật «Gợi ý căn thay» do sàn chỉnh (Cài đặt sàn 45–49).
- Nối hai số đo vào `packages/core/src/metrics` (giám sát, luật đợt 35).

## Notes

- Bất biến chạm: 1 (hàm tắt link), 2 (không lớp `source`, không số khách), 3 (gợi ý chỉ mở luồng Gửi), 4 (trang khách và rào
  route công khai).
- Migration số 032 (giám sát giữ chỗ theo luật đợt 25, trả lời L-22).

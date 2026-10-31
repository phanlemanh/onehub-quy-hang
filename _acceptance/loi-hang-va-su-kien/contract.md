---
schema_version: 1
feature: Mọi thay đổi của hàng đi qua một lệnh API và thành sự kiện chỉ thêm; sáu trạng thái chuẩn, độ tươi và mức đủ thông tin tính ra từ sự kiện
slug: loi-hang-va-su-kien
owner: omre.cnsp4@onemount.com
risk_tier: T3
surfaces: [api, db]
status: implemented
design_doc: docs/superpowers/specs/2026-10-31-loi-hang-va-su-kien-design.md
approved_by: Manh Phan
approved_at: 2026-10-30T23:09:39Z
---

# Acceptance Contract: loi-hang-va-su-kien

## Context

Hàng 8 của lộ trình (nền, dãy Q), đứng trên hàng 6 (đăng nhập theo sàn) và hàng 7 (vai, khu). Tham chiếu §4–§5, luật 8,
15, 16: sự kiện chỉ thêm, ghi người và vai lúc làm; sáu trạng thái chuẩn; độ tươi và mức đủ tính từ sự kiện. Hàng này
dựng lõi — hai bảng, một lệnh API, hàm gấp thuần — chưa có màn. Bốn câu Hỏi-1..4 của bản thiết kế theo khuyến nghị;
chủ kho chốt ở Cổng Phạm vi.

Source input: `docs/plan/lo-trinh.json` hàng 8 · `_acceptance/loi-hang-va-su-kien/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-10-31-loi-hang-va-su-kien-design.md`

## Criteria

- AC-1: Given thành viên sàn A, When tạo hàng rồi gửi lệnh đổi hàng (`POST /api/v1/listings/{listingId}/events`), Then
  mỗi lệnh thành công ghi đúng một sự kiện với `seq` kế tiếp, người và vai lúc làm, và bản tính của hàng đổi theo trong
  cùng giao dịch; lệnh bị từ chối không ghi sự kiện nào và không đổi bản tính. (cross-layer)
- AC-2: Given một sự kiện đã ghi, When bất kỳ vai nào — kể cả chủ bảng — sửa hay xoá nó trong cơ sở dữ liệu, Then bị từ
  chối; vai `quy_hang_app` không có quyền sửa, xoá bảng sự kiện.
- AC-3: Given mã nguồn của kho và các hàm, trigger trong cơ sở dữ liệu, When quét, Then câu ghi vào bảng hàng và bảng sự
  kiện chỉ nằm ở `packages/api/src/listings/` — không đường ghi nào ngoài lệnh API.
- AC-4: Given hàm chuyển trạng thái của `packages/core`, When thử đủ 36 cặp (từ, tới) của sáu trạng thái chuẩn
  (`Incomplete`, `Active`, `Pending`, `Closed`, `Hold`, `Withdrawn`), Then đúng 12 cặp «nhận» của bảng dưới được nhận,
  24 cặp còn lại bị từ chối kèm lý do; không giá trị thứ bảy nào được nhận. Bảng theo Hỏi-3 (chủ kho chốt ở Cổng Phạm vi):

  | Từ \ Tới | Incomplete | Active | Pending | Closed | Hold | Withdrawn |
  |---|---|---|---|---|---|---|
  | Incomplete | — | nhận (qua điều kiện) | — | — | nhận | nhận |
  | Active | — | — | nhận | nhận | nhận | nhận |
  | Pending | — | nhận (khách bỏ cọc) | — | nhận | — | nhận |
  | Closed | — | — | — | — | — | — |
  | Hold | — | nhận (qua điều kiện) | — | — | — | nhận |
  | Withdrawn | — | — | — | — | — | — |

  «—» là từ chối; đứng yên (cùng trạng thái) là từ chối; `Closed`, `Withdrawn` là nấc cuối.
- AC-5: Given lệnh đổi trạng thái, When vào `Closed` thiếu giá chốt, vào `Withdrawn` thiếu lý do, hay vào `Active` khi
  thiếu một điều kiện máy kiểm (giá kèm điều kiện phí, pháp lý, tình trạng sử dụng), Then API trả 400 nêu điều thiếu và
  không ghi gì; hàng đã bán vẫn giữ giá chốt và ngày bán. (cross-layer)
- AC-6: Given bộ ca kiểm cố định của dãy sự kiện và ngày «hôm nay» truyền vào, When tính độ tươi, Then ra ngày xác nhận
  gần nhất với chủ nhà và tuổi tính bằng ngày đúng từng ca — đổi giá, đổi trạng thái và «Còn / giữ giá» mặc định tính là
  xác nhận, lệnh tắt cờ thì không; hàng chưa từng xác nhận ra «chưa xác nhận».
- AC-7: Given cùng bộ ca kiểm, When tính mức đủ thông tin, Then ra phần đã có trên năm mục của lần rao (giá kèm điều kiện
  phí, nội thất, pháp lý, tài chính, tình trạng sử dụng — theo Hỏi-4) và danh sách mục còn thiếu đúng từng ca.
- AC-8: Given các hàng đã qua nhiều lệnh, When xoá trắng bảng hàng rồi gấp lại từ bảng sự kiện bằng hàm của
  `packages/core`, Then ra đúng bảng cũ từng cột — bảng hàng không chứa gì không tính lại được từ sự kiện.
- AC-9: Given hai người cùng sửa một hàng, When lệnh mang phiên bản cũ, Then API trả 409 `version-conflict` và không ghi;
  lệnh đổi sang `Pending` hay `Closed` thì thắng ngay dù phiên bản cũ nhưng vẫn xét bảng chuyển trạng thái trên trạng thái
  hiện tại; hai lệnh đồng thời — kể cả hai lệnh «thắng ngay» — không bao giờ cùng một `seq`. (cross-layer)
- AC-10: Given cơ sở dữ liệu đã áp mọi migration, When chạy bộ kiểm cách ly, Then bảng hàng và bảng sự kiện bật và ép
  luật theo dòng; sàn A không đọc, không ghi được hàng hay sự kiện của sàn B, kể cả gửi lệnh vào mã hàng của sàn B qua
  API (404); payload của mỗi loại sự kiện theo khuôn chặt — khoá lạ, gồm mọi khoá thuộc lớp `source` (chủ nhà, số chủ,
  giá đáy, ảnh sổ) ở cấp nào, bị từ chối. (cross-layer)

## Coverage

Quét morphological-scan, preset entity-feature, cho thực thể «hàng và sự kiện của hàng».

- Trục thao tác: tạo (AC-1) | đổi trường lần rao (AC-1, AC-7) | đổi giá (AC-1, AC-6) | đổi trạng thái (AC-4, AC-5) |
  xác nhận với chủ nhà (AC-6) | đọc (AC-8, AC-10) [thước CE: Tham chiếu §4 dòng «Sự kiện», §5]
- Trục lớp chặn: lõi thuần (AC-4, AC-6, AC-7) | API (AC-1, AC-5, AC-9) | cơ sở dữ liệu (AC-2, AC-10) | mã nguồn (AC-3)
  [thước CE: câu bật «không đường ghi nào ngoài API»]
- Trục tính ra: trạng thái (AC-4) | độ tươi (AC-6) | mức đủ (AC-7) | gấp lại toàn bảng (AC-8) [thước CE: Kiến trúc §1
  «số trên màn là bản tính ra từ sự kiện»]
- Trục người thao tác: cùng sàn (AC-1) | hai người cùng lúc (AC-9) | sàn khác (AC-10) | quyền theo vai — Later, theo
  Hỏi-2 [CE chưa kiểm chứng: chờ Hỏi-2]
- Trục dữ liệu nhạy: thông tin chủ nhà — Never ở hai bảng này (AC-10 chặn khoá `source`)

## Đường đo

- bỏ đường-đo — ô cơ hội chưa khai ngưỡng số (timebox «…»); không có thước nào để dựng đường.

## Out of scope

- Chủ nhà, số chủ, giá đáy, mở số — hàng chủ nhà (bảng riêng có luật chặt hơn).
- Kiểm trùng «một hàng đang mở trên một căn» — hàng dòng vào.
- Quyền theo vai và trục «Chỉ tôi → Nhóm → Toàn sàn» — làm cùng màn bảng hàng (theo Hỏi-2).
- Gán đầu chủ cho hàng — đi cùng hàng chủ nhà, vì đầu chủ gắn với nguồn chủ nhà (chủ kho chọn 31/10, sau Cổng Phạm vi).
- Hoàn tác, nhãn trạng thái riêng của sàn, ảnh, lịch sử trả giá trên màn, gắn mã căn danh mục, mọi màn.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Bất biến chạm: (1) cách ly — hai bảng mới mang luật theo dòng và ca trong bộ kiểm cách ly; (2) chủ nhà — hai bảng
  không chứa lớp `source`, payload mang khoá `source` bị từ chối; (3), (4) không chạm.
- Dãy Q chạy dev ở cổng 3461 (`web-q`), Postgres 5545.

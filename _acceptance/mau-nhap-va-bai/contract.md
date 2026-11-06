---
schema_version: 1
feature: "Hàng 50: Quản trị sàn xem, sửa, xoá mẫu file nhập đã nhớ ở Cài đặt › Sàn › Mẫu nhập; lần nhập kế dùng bản mới, lần nhập đã xong không đổi"
slug: mau-nhap-va-bai
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: signed-off
design_doc: _acceptance/mau-nhap-va-bai/design.md
approved_by: Manh Phan
approved_at: 2026-11-05
---

# Acceptance Contract: mau-nhap-va-bai

## Context

Mẫu file nhập đã nhớ (hàng 67) đang là dẫn xuất chỉ-đọc từ kế hoạch các lần nhập đã ghi. Hàng 50 cho Quản trị sàn xem,
sửa, xoá từng cột đã nhớ qua bảng chỉ-thêm `import_templates` (migration 045), gộp với bộ nhớ dẫn xuất theo «mục mới nhất
thắng». Mẫu bảng hàng và mẫu bài theo kênh tách sang hàng kế (Hỏi-1). Thiết kế: `_acceptance/mau-nhap-va-bai/design.md`.
Dữ liệu mẫu: `[Tên]`, `0900 000 0xx`.

## Criteria

- **AC-1 — Xem mẫu của sàn mình.** (cross-layer) Given sàn có hai lần nhập đã ghi (tiêu đề trùng một phần) và một lần nhập
  chỉ mới mở · When Quản trị sàn mở Cài đặt › Sàn › Mẫu nhập · Then thấy đúng mỗi tiêu đề đã gặp ở lần ĐÃ GHI một dòng —
  trường đích, phép biến đổi, quy đổi và nguồn (lần nhập, ngày) lấy theo lần ghi mới nhất; lần chỉ mới mở không dạy mẫu.
- **AC-2 — Sửa một cột, lần nhập kế dùng bản mới.** (cross-layer) Given một cột đã nhớ · When Quản trị sàn đổi trường đích
  (và quy đổi khi trường giá trị đóng) rồi lưu — kể cả tiêu đề có dấu, khoảng trắng, «/» · Then màn hiện bản mới với nguồn
  «Sửa bởi [Tên]», và mẫu mà màn Nhập Excel đọc (`GET /api/v1/imports/templates`) trả đúng bản mới cho khoá ấy, các khoá
  khác không đổi; một lần nhập mở TRƯỚC lần sửa rồi ghi SAU không đè lại bản sửa.
- **AC-3 — Xoá một cột, lần nhập kế ghép lại từ đầu.** (cross-layer) Given một cột đã nhớ · When Quản trị sàn xoá nó và xác
  nhận · Then khoá ấy không còn trong màn lẫn trong mẫu màn nhập đọc; một lần nhập ghi SAU lần xoá dạy lại khoá ấy như
  thường; một lần nhập mở TRƯỚC lần xoá rồi ghi SAU không dạy lại khoá ấy.
- **AC-4 — Lần nhập đã xong không đổi.** (cross-layer) Given một lần nhập đã ghi và một lần nhập đang mở · When Quản trị sàn
  sửa rồi xoá các cột của chúng · Then kế hoạch đã lưu của cả hai lần nhập giữ nguyên từng byte, và hoàn tác lần nhập đã ghi
  vẫn gỡ đúng các căn của nó.
- **AC-5 — Sửa sai luật bị từ chối.** Given hộp sửa · When gửi trường đích không hợp lệ, quy đổi ở trường không phải giá trị
  đóng (gồm trường lớp nguồn), hay khoá không có trong mẫu · Then máy chủ trả 400 (hay 404 với khoá không có) kèm lý do,
  không ghi dòng sổ nào, và bảng chặn lần nữa khi chèn thẳng bỏ qua API (quy đổi ở trường không đóng hay lớp nguồn, xoá
  kèm đích, sửa thiếu đích).
- **AC-6 — Chỉ Quản trị sàn.** (cross-layer) Given mọi vai của sàn (Đầu chủ, Trưởng nhóm, Telesales, Đầu khách, Quản trị)
  và người chưa đăng nhập · When gọi ba đường đọc, sửa, xoá mẫu và mở `/settings/templates` · Then chỉ Quản trị sàn được;
  vai khác 403 `admin-required` và màn chuyển về Cá nhân kèm câu báo; chưa đăng nhập 401; không dòng sổ nào được ghi.
- **AC-7 — Sàn khác không thấy mẫu của nhau.** (cross-layer) Given hai sàn cùng có mẫu · When Quản trị sàn B đọc, sửa, xoá
  một khoá của sàn A (qua API và gọi thẳng bảng dưới vai `quy_hang_app`) · Then không thấy, không đổi được gì của sàn A.
- **AC-8 — Migration 045 an toàn và chỉ thêm.** Given cơ sở dữ liệu đã có 001–044 · When chạy `npm run db:migrate` hai lần ·
  Then lần hai không áp lại; `import_templates` bật và ép luật theo dòng; `quy_hang_app` chỉ có `select`, `insert` (không
  `update`, `delete`); dòng không thuộc lớp nguồn.
- **AC-9 — Màn theo khuôn Cài đặt sàn, có đủ trạng thái.** Given màn Mẫu nhập · When đang tải, trống, lỗi, có dữ liệu · Then
  màn dựng trong `MucCaiDat` (một khung), mỗi trạng thái có chữ như bảng trạng thái của thiết kế, xoá có hộp xác nhận;
  lưu bị từ chối thì hộp sửa còn mở với lý do dưới ô, lưu lỗi mạng thì hộp còn mở với «Chưa lưu được — thử lại», lưu được
  thì hộp đóng; ô Quy đổi chỉ hiện ở trường giá trị đóng.

## Coverage

Bỏ quét bằng phép quét (Hỏi-5); trục liệt từ thiết kế và phản biện S1.

- Trục **thao tác**: xem | sửa | xoá [thước CE: ba đường API §3 thiết kế] — AC-1, AC-2, AC-3
- Trục **nguồn của một khoá**: chỉ lần nhập | sửa mới hơn | xoá mới hơn | lần nhập mới hơn lần sửa/xoá [thước CE: `apSuaMau`] — AC-1..AC-3
- Trục **trường đích**: trường giá trị đóng | trường thường | trường lớp nguồn | đích không hợp lệ [thước CE: `nhoBangQuyDoi`, `validatePlan`] — AC-2, AC-5
- Trục **lần nhập bị chạm**: đã ghi | đang mở | hoàn tác | mở trước sửa/xoá rồi ghi sau [thước CE: `imports.status`,
  `imports.created_at`] — AC-2, AC-3, AC-4
- Trục **dạng tiêu đề**: thường | có dấu | khoảng trắng | «/» | ký tự đơn vị «(m²)» [thước CE: `khoaMau`] — AC-2, AC-3
- Trục **người gọi**: năm vai × chưa đăng nhập [thước CE: `ROLES` của `thanh-vien.ts`] — AC-6
- Trục **sàn**: cùng sàn | sàn khác [thước CE: luật theo dòng] — AC-7
- Trục **trạng thái màn**: đang tải | trống | lỗi | có dữ liệu | không quyền | lưu bị từ chối | lưu lỗi mạng [thước CE:
  bảng trạng thái thiết kế] — AC-6, AC-9

## Đường đo

Chờ Hỏi-4: ngưỡng ở ô cơ hội vẫn nói cả ba loại mẫu (và «bài kế tiếp»), timebox để trống. Khuyến nghị: chủ kho chốt lại
ngưỡng cho phạm vi đã tách — SỐNG: «Quản trị sàn thấy đủ mẫu file nhập đã nhớ của sàn mình, sửa hay xoá một cột thì lần
nhập kế dùng bản mới, lần nhập đã xong không đổi; vai khác không mở được; sàn khác không thấy» — bảo đảm bởi AC-1..AC-7.

## Out of scope

- Mẫu bảng hàng khi phát hàng và mẫu bài theo kênh — tách thành hàng kế (Hỏi-1), dùng lại nếp bảng sổ sửa này.
- Đổi cách lần nhập dạy mẫu, đường ghi lần nhập, hoàn tác, màn Nhập Excel (hàng 66, 67).
- Từ điển giá trị của sàn / cách gọi riêng (hàng 45, 70).
- Thêm tay một cột mới vào mẫu khi chưa có lần nhập nào gặp tiêu đề ấy.

## Notes

- Vùng (giám sát L-33): `packages/db/migrations/045_*.sql`, `packages/db/tests/isolation.test.mjs`, `packages/api/src/templates/**`,
  `packages/api/src/imports/store.ts`, `packages/api/test-db/mau-nhap-va-bai/**`, `packages/core/src/import/memory/**`,
  `apps/web/src/lib/nhap/**`, `apps/web/src/app/(app)/settings/templates/**`; xin thêm `app.ts`, `docs/product/tham-chieu.md` (L-34).
- Known limits — chọn ở Cổng Bằng chứng 2026-11-06:
  - Ngoài-1: Xoá một cột mẫu mà gặp lỗi mạng hay bị máy chủ từ chối thì hộp xác nhận vẫn đóng, cột còn nguyên, không có câu báo.
  - Ngoài-2: Cùng lỗi với Ngoài-1 (phát hiện trùng): xoá không thành công trông như đã xoá, không báo lý do.
  - Ngoài-3: Gọi thẳng API có thể lưu mẫu giá hay ngày thiếu tham số mà vẫn được báo thành công; lần nhập sau bỏ lặng mẫu đó.
  - Ngoài-4: Bài kiểm chưa đo căn thật sự được ghi khi lần nhập đang mở ghi sau lần sửa mẫu; chỉ đọc lại kế hoạch đã lưu.
  - Ngoài-5: Bài kiểm hoàn tác chỉ soát tập con và xanh cả khi không có căn nào để gỡ.
  - Ngoài-6: Bài kiểm tiêu đề trùng chưa đo trường đích của lần ghi sau, chỉ đo nguồn.
  - Ngoài-7: Bài kiểm chặn vai ở màn Mẫu nhập đọc chữ trong mã trang, không mở màn bằng từng vai.

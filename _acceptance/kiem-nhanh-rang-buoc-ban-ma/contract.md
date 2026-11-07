---
schema_version: 1
feature: "Kiểm nhanh chỉ đọc trên bản thật thêm vế bất biến 2: bảng chủ nhà và bảng lead không còn số điện thoại để rõ thì ràng buộc chặn số rõ phải đã bật; bảng sạch mà ràng buộc chưa bật làm bước triển khai đỏ trước Vercel; bảng còn số rõ chỉ báo"
slug: kiem-nhanh-rang-buoc-ban-ma
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ci, config]
status: implemented
approved_by: Manh Phan
approved_at: 2026-11-07
design_doc: docs/superpowers/specs/2026-11-06-kiem-nhanh-rang-buoc-ban-ma-design.md
---

# Acceptance Contract: kiem-nhanh-rang-buoc-ban-ma

## Context

Ngoài-2 của hàng `va-deploy-csdl-tam` (PR #176): bỏ bộ cách ly khỏi bản thật làm mất ca chỉ đọc «bảng sạch thì ràng buộc
bản mã phải đã bật» (Tham chiếu §12, 01/11). Chủ kho chọn mở hợp đồng mới ở Cổng Bằng chứng 06/11. T3: chạm
`packages/db/**`. Bất biến chạm: **2 — thông tin chủ nhà không rời công ty** (lưới ràng buộc bản mã); kiểm nhanh chỉ
đếm dòng, không đọc giá trị số. Không chạm bất biến 1, 3, 4.

## Criteria

- **AC-1** — Bảng sạch mà ràng buộc chưa bật thì kiểm nhanh đỏ.
  Given cơ sở dữ liệu đã migrate,
  When bảng `listing_owners` hay `leads` không còn dòng `owner_phone is not null` mà ràng buộc `*_phone_chi_ban_ma` của
  nó chưa bật (`convalidated = false`),
  Then kiểm nhanh thoát 1, dòng lỗi gọi đúng tên bảng và tên ràng buộc — phần dựng mã thoát và dòng lỗi của CLI
  (`ketQuaCli`) nhận đúng kết quả soi ấy và trả mã 1.

- **AC-2** — Bảng còn số rõ thì chỉ báo, không chặn.
  Given bảng còn N > 0 dòng số rõ và ràng buộc chưa bật,
  When chạy kiểm nhanh,
  Then không lỗi; dòng xanh nêu «còn N số rõ (chưa bật — chờ mã hoá lại)» cho đúng bảng ấy.

- **AC-3** — Trạng thái không thể có và ràng buộc vắng là lỗi.
  Given ràng buộc đã bật mà bảng còn số rõ (trạng thái không thể có), hoặc ràng buộc không tồn tại,
  When chạy kiểm nhanh,
  Then thoát 1 với vế «ràng buộc bật mà còn số rõ» hoặc «thiếu ràng buộc», gọi đúng tên.

- **AC-4** — Dòng xanh nêu trạng thái ràng buộc bản mã của cả hai bảng.
  Given cơ sở dữ liệu lành (cả hai ràng buộc đã bật, không số rõ),
  When chạy `npm run kiem-nhanh -w @quy-hang/db`,
  Then thoát 0 và dòng in có «ràng buộc bản mã: listing_owners bật · leads bật».

- **AC-5** — Vẫn một kết nối, chỉ đọc, không đọc giá trị số.
  Given kiểm nhanh chạy,
  When nó soi ràng buộc bản mã,
  Then mọi câu chạy trên đúng một kết nối trong giao dịch read only (ca hiện có của hàng va-deploy-csdl-tam vẫn xanh), và
  câu đọc bảng chủ nhà chỉ là `count(*)` — không câu nào chọn cột `owner_phone` ra kết quả.

- **AC-6** — Vai kết nối phải thấy mọi dòng, không thì báo thay vì đếm sai.
  Given bảng chủ nhà và bảng lead bật và ép luật theo dòng,
  When vai đang kết nối không là superuser và không có `bypassrls` (ví dụ `quy_hang_app`),
  Then kiểm nhanh thoát 1 với vế «vai kết nối chịu luật theo dòng — không đếm được số rõ» gọi tên vai, không báo
  «bảng sạch» dựa trên số đếm 0 của vai ấy; vai chủ (`quy_hang_owner` bypassrls trên bản thật, `postgres` superuser ở
  dãy) thì không lỗi.

## Coverage

Trục: bảng {listing_owners, leads} × số rõ {0, >0} × ràng buộc {bật, chưa bật, vắng} = 12 ô, ma trận viết trước ở bài
kiểm. Thước CE: `kiemTrangThai` của `packages/db/tests/bat-rang-buoc.test.mjs` và migration 013 (cùng hai cặp).

## Đường đo

- Ngưỡng `bat_khi`: «deploy trên main xanh ở lần gộp đầu sau hàng với dòng kiểm nhanh nêu trạng thái ràng buộc bản mã» →
  đọc dòng kiểm nhanh trong log job `deploy` của lần chạy CI trên main đầu tiên sau khi gộp (AC-4 bảo đảm phần máy) ·
  «bảng sạch mà ràng buộc chưa bật làm kiểm nhanh đỏ trước Vercel» → AC-1 (thứ tự bước đã đo ở hàng va-deploy-csdl-tam) ·
  «một kết nối, chỉ đọc» → AC-5. Timebox chưa khai — người khai ở Cổng Giá trị.

## Out of scope

- Sửa chú thích «chạy cả ở job deploy» của `packages/db/tests/bat-rang-buoc.test.mjs` — ngoài vùng; ghi việc theo sau.
- Mã hoá lại số rõ còn lại, đổi migration — Never ở hàng này.
- Đọc hay in giá trị số điện thoại — Never (bất biến 2).

## Notes

- Ảnh chụp bản thật trước hàng: lần chạy CI trên main 42230599946 (06/11 14:12Z, trước PR #176) chạy ca «bật ràng buộc:
  bảng không còn số rõ thì ràng buộc phải đã bật» của bat-rang-buoc trên bản thật và xanh — trạng thái bản thật lúc ấy
  thoả luật của hàng này, nên ngưỡng «deploy xanh ở lần gộp đầu» đạt được nếu không ai đổi dữ liệu chủ nhà giữa chừng.
  Máy không chạy gì lên bản thật để chụp lại (Never của hàng va-deploy-csdl-tam).

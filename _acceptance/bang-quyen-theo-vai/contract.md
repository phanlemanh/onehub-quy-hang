---
schema_version: 1
feature: "Mọi thao tác ghi đọc quyền từ một bảng quyền thao tác × vai ở lõi. Trước hết: chỉ người có nhà Bảng hàng (Đầu chủ, Đầu khách, Trưởng nhóm) đọc và sửa được hàng; Telesales và Quản trị sàn chỉ thấy kết quả lead và cấu hình; đưa hàng lên «Đang bán» theo đúng cờ «Sẵn sàng bán» ở mọi lối; luật theo dòng của hàng và sự kiện hàng xét vai, không chỉ cách ly công ty."
slug: bang-quyen-theo-vai
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: verified
design_doc: docs/superpowers/specs/2026-11-05-bang-quyen-theo-vai-design.md
approved_by: Manh Phan
approved_at: 2026-11-05
---

# Acceptance Contract: bang-quyen-theo-vai

## Context

Rà soát phân quyền 05/11 (`docs/plan/ra-soat-crud-phan-quyen.md`, chỗ hở G1 kèm G7 phần hàng) thấy: ai đọc được hàng
«Toàn sàn» đều đổi được giá, phí, trạng thái và gắn mã căn qua API, kể cả Telesales và Quản trị sàn — hai vai không có nhà
Bảng hàng; ô Trạng thái của Bảng hàng đưa được hàng lên «Đang bán» dù nút «Sẵn sàng bán» đã ẩn với Đầu khách; luật theo
dòng của hàng chỉ cách ly công ty. Lệch luật 21 và bảng nhà theo vai §9 của Tham chiếu. Chủ kho 05/11 «Mở G1 ngay», đọc
§12 31/10 «mọi thành viên sàn sửa được» là «mọi thành viên có Bảng hàng». Vòng này dựng bảng quyền thao tác × vai ở lõi,
bắt đầu từ hàng, và cho API, luật theo dòng, ô Trạng thái cùng đọc bảng ấy.

Source input: hàng lộ trình `bang-quyen-theo-vai` (`docs/plan/lo-trinh.json`), ô `_acceptance/bang-quyen-theo-vai/opportunity.md`.
Thiết kế: `docs/superpowers/specs/2026-11-05-bang-quyen-theo-vai-design.md`. Dữ liệu mẫu: `[Tên]`, `0900 000 0xx`.

Bất biến chạm: **1** (cách ly giữa công ty — luật theo dòng của `listings`, `listing_events` thêm trục vai, cách ly công ty
giữ nguyên). Không chạm bất biến 2, 3, 4.

## Criteria

Bảng quyền là `packages/core/src/access/bang-quyen-hang.json` (14 ca người × 4 thao tác = 56 ô, viết trước, duyệt ở cổng
này cùng hợp đồng). «Người có Bảng hàng» = có ít nhất một trong ba vai Đầu chủ, Đầu khách, Trưởng nhóm. «Đủ cờ Sẵn sàng
bán» = có vai Trưởng nhóm; hoặc (có vai Đầu chủ và (dòng gán mới nhất của căn là chính người ấy, hoặc căn chưa có dòng
gán nào)). «Sửa hàng» = mọi loại lệnh của lõi trừ tạo hàng, gỡ hàng và đưa lên Đang bán.

- **AC-1 — Bảng quyền ở lõi, một luật cho mọi lối.** Given bảng `bang-quyen-hang.json` · When lõi tính quyền
  (`duocLamVoiHang`) cho từng ca và từng thao tác · Then mỗi ô ra đúng kỳ vọng của bảng; cờ «Sẵn sàng bán» của hồ sơ căn
  (`lopPhuHoSo().sanSang`) bằng đúng cột «Đưa lên Đang bán» ở mọi ca; một ô bị đổi trong bản sao bảng thì bài đỏ, nêu tên ca
  và thao tác.
- **AC-2 — Telesales, Quản trị sàn không thấy hàng.** (cross-layer) Given sàn có hàng «Toàn sàn» · When Telesales hay người
  chỉ giữ vai Quản trị sàn đọc Bảng hàng (`GET /api/v1/listings`) và mở một hàng (`GET /api/v1/listings/{id}`) · Then danh
  sách không có hàng nào và mở hàng nhận `404 not-found` — «không có hàng này», cùng câu với hàng không có; gõ thẳng địa chỉ
  trang Bảng hàng thì về Hôm nay; Đầu chủ, Đầu khách, Trưởng nhóm cùng sàn đọc được hàng ấy như trước.
- **AC-3 — Telesales, Quản trị sàn không tạo, không sửa hàng.** (cross-layer) Given hàng «Toàn sàn» · When Telesales hay Quản
  trị sàn gửi từng loại lệnh của lõi (đổi chi tiết, đổi giá kèm phí, đổi trạng thái, xác nhận với chủ nhà, gắn mã căn, gỡ
  hàng), hoặc tạo hàng mới · Then nhận `404 not-found`, bảng sự kiện
  của hàng không thêm dòng nào, bản tính không đổi, không hàng mới nào được tạo.
- **AC-4 — Người có Bảng hàng vẫn sửa hàng «Toàn sàn».** (cross-layer) Given hàng «Toàn sàn» do một đầu chủ giữ · When Đầu
  khách, một Đầu chủ khác và Trưởng nhóm gửi từng loại lệnh sửa hàng (đổi chi tiết, đổi giá kèm phí, xác nhận với chủ nhà,
  chuyển sang trạng thái khác «Đang bán», gắn mã căn) ·
  Then mỗi lệnh ghi đúng một sự kiện mang người và vai lúc làm, như trước vòng này (đọc lại §12 31/10).
- **AC-5 — Đưa lên «Đang bán» theo đúng cờ «Sẵn sàng bán» ở API.** (cross-layer) Given hàng đủ điều kiện vào Đang bán ·
  When người gửi `status_changed → Active` · Then Trưởng nhóm, Đầu chủ giữ căn và Đầu chủ khi căn chưa ai giữ ghi được; Đầu
  khách (cả khi căn chưa ai giữ), Đầu chủ khi người khác giữ và Đầu chủ từng giữ mà căn đã đổi đầu chủ nhận `403 listing-agent-required`, không sự kiện nào, trạng thái không đổi — kể cả
  khi lệnh mang phiên bản cũ.
- **AC-6 — Ô Trạng thái của Bảng hàng theo cùng cờ.** Given Đầu khách, hay Đầu chủ không giữ căn, mở trình sửa ô Trạng thái
  của một hàng có thể lên Đang bán · When xem các nấc chọn được và khi có lệnh `Active` dựng tay · Then không có nấc «Đang
  bán»; lệnh dựng tay bị trình sửa từ chối với câu «Chỉ đầu chủ giữ căn hay trưởng nhóm đưa lên Đang bán», không gửi gì;
  người đủ cờ vẫn thấy và chọn được «Đang bán» như trước.
- **AC-7 — Luật theo dòng xét vai ở hàng và sự kiện hàng.** (cross-layer) Given vai `quy_hang_app` với người và sàn của
  phiên, bỏ qua API · When Telesales hay Quản trị sàn đọc, thêm, sửa `listings` và đọc, thêm `listing_events`; khi người
  không đủ cờ thêm sự kiện `status_changed → Active` · Then cơ sở dữ liệu không trả dòng nào khi đọc và từ chối mọi lần
  ghi bằng luật theo dòng; người có Bảng hàng đọc, ghi được như trước; sàn khác vẫn không thấy gì (cách ly công ty giữ
  nguyên).
- **AC-8 — Bộ kiểm đếm khớp từng ô ở API và ở luật theo dòng.** (cross-layer) Given bảng `bang-quyen-hang.json` · When bộ kiểm API và bộ
  kiểm cách ly chạy · Then mỗi bộ dựng đủ 14 ca người thật trong một sàn, gọi đủ 4 thao tác bằng từng ca — 56 lần gọi thật
  mỗi lớp, số kết quả khớp đếm được đúng bằng số ô của bảng — và nêu tên ca, thao tác khi một ô lệch.
- **AC-9 — Các đường đang sống không gãy.** (cross-layer) Given lead → hàng của đầu chủ, nhập file và hoàn tác lần nhập, kiểm trùng lúc
  telesales nhập lead, mốc lên bảng ở «Lead của tôi» của telesales, trang khách và «Quan tâm», đổi đầu chủ hàng loạt · When
  chạy bộ kiểm có sẵn của các đường ấy trên cơ sở dữ liệu đã có migration 046 · Then tất cả xanh; bài có sẵn chỉ đổi vai
  của người tạo hàng khi người ấy chỉ giữ vai Quản trị sàn, không đổi điều bài kiểm.
- **AC-10 — Ghi lại điều đang đúng.** Given vòng xong · When đọc Sổ điểm biến thiên phần C, Tham chiếu §6 và §12, và
  migration 046 · Then Sổ điểm có dòng khoá K28 trỏ `access/bang-quyen-hang.json`; Tham chiếu §6 có dòng quyền thao tác theo
  vai một bảng ở lõi và §12 có dòng 05/11 đọc lại dòng 31/10; hai hàm mới của 046 là `security definer`, `search_path` rỗng,
  chỉ `quy_hang_app` được gọi.

## Coverage

Quét bằng `morphological-scan` (preset entity-feature) trên đối tượng «hàng». Chân sản phẩm: Tham chiếu §9, luật 21,
`core/navigation.ts` `HOMES` [SUY-TỪ-REPO: docs/product/tham-chieu.md]. Chân ngành: Keller Williams Command (nấc quyền cố
định), Follow Up Boss (vai cố định, agent sửa phần được giao) [NGÀNH: KW Command, Follow Up Boss — nguồn ở
`docs/plan/ra-soat-crud-phan-quyen.md` §4].

- Trục **vai** (kể cả kiêm vai): Telesales | Đầu chủ | Đầu khách | Trưởng nhóm | Quản trị sàn [thước CE: năm vai `ROLES` của
  `core/navigation.ts`, ADR-0006; ba ca kiêm vai QT+ĐC, TS+TN, TS+ĐK như `bang-xem-nguon.json`]
- Trục **quan hệ với căn**: giữ căn | căn chưa ai giữ | người khác giữ | từng giữ, căn đã đổi sang người khác [thước CE: dòng gán mới nhất của
  `listing_agent_assignments`; ca «từng giữ, mất vai» của `bang-xem-nguon.json`]
- Trục **thao tác**: xem | tạo | sửa (giá kèm phí, trạng thái khác Đang bán, chi tiết, xác nhận, gắn mã) | đưa lên Đang bán
  [thước CE: `EVENT_TYPES` của lõi trừ `created`, `voided`; bảng hai của tài liệu rà soát, bốn dòng về hàng]
- Trục **lớp chặn**: lõi (AC-1) | API (AC-2..5, AC-8) | luật theo dòng (AC-7, AC-8) | màn — ô Trạng thái (AC-6)

Trục quan hệ với căn thêm giá trị «từng giữ, căn đã đổi sang người khác» (phản biện F2: ca duy nhất đo chữ «dòng gán mới
nhất»). Cắt: 5 vai × 4 quan hệ thu về 14 ca — bỏ ca cho kết quả trùng ở cả bốn cột (Telesales, Quản trị sàn, Trưởng nhóm
không đổi theo quan hệ với căn — giữ một ca đại diện), giữ mọi ca mà cột «Đưa lên Đang bán» đổi theo quan hệ (Đầu chủ đủ bốn
quan hệ, Đầu khách với căn chưa ai giữ), cộng ca «từng giữ, mất vai» và ba ca kiêm vai; 14 × 4 = 56 ô, chạy ở hai lớp API và
luật theo dòng (AC-8); lõi chạy đủ 56 (AC-1); màn chỉ có ô Trạng thái cho «đưa lên Đang bán» (AC-6) —
các thao tác khác ở màn không có lối cho Telesales, Quản trị sàn (không nhà Bảng hàng).

Cross-cutting áp mọi ô: nấc ai thấy hàng «Toàn sàn» (ô «xem» đo trên hàng Toàn sàn; «Chỉ tôi» giữ nguyên ở lõi và API —
bộ kiểm có sẵn của hàng 12 trong AC-9); đường vào hàng (route, lead → hàng, nhập file, hoàn tác, hàm `security definer` —
AC-9).

Later: bảng quyền cho lead, liên hệ, nhu cầu khách, Lần gửi, vùng, cấu hình (G2–G6). Never: ma trận quyền do sàn tự vẽ —
cả KW lẫn Follow Up Boss đều cố định nghĩa vai (Hỏi-1). Mỗi dòng có dòng `descope` ở sổ.

## Đường đo

| Thước của ô cơ hội | Số từ đâu | AC bảo đảm |
| --- | --- | --- |
| Bảng quyền viết trước, lấy bảng hai làm nháp | `bang-quyen-hang.json` có trước mã, duyệt ở Cổng Phạm vi | AC-1 |
| Bộ kiểm gọi từng thao tác bằng từng vai ở API và luật theo dòng, đếm khớp từng ô | số ô khớp của bài API và bài cách ly = 56 | AC-8 |
| Telesales và Quản trị sàn nhận «không có hàng này» | mã `404 not-found` ở bài API | AC-2, AC-3 |
| Lệnh đưa lên Đang bán từ ô Trạng thái của Đầu khách bị từ chối như nút đã ẩn | bài trình sửa ô + bài API | AC-5, AC-6 |
| Sổ điểm có dòng khoá trỏ về bảng | dòng K28 | AC-10 |

## Out of scope

- Bảng quyền cho lead, liên hệ, nhu cầu khách, Lần gửi, vùng, cấu hình — G2–G6 thêm vào bảng cùng khuôn khi mở.
- Bảng thoả thuận (G7 phần hai) — hàng vá riêng của dãy nền.
- Đưa trục «Chỉ tôi» xuống cơ sở dữ liệu (quyết định của hàng 12 giữ nguyên).
- Mã lỗi mới cho «không đủ cờ Sẵn sàng bán» — dùng lại `listing-agent-required` (Hỏi-2).
- Ai được gỡ hàng (`voided`): giữ nguyên «chỉ qua hoàn tác lần nhập» (hàng 66); G2 quyết. Lệnh gỡ của người không có Bảng
  hàng vẫn nhận 404 ở AC-3.

## Notes

- Vùng: `packages/core/src/access/**`, `packages/api/src/listings/**`, `apps/web/src/app/(app)/inventory/cell-edit/**`,
  `packages/db/migrations/046_*`, `packages/db/tests/isolation.test.mjs`, `packages/api/test-db/bang-quyen-theo-vai/**`,
  `_acceptance/bang-quyen-theo-vai/**`; chạm thêm có duyệt: `docs/architecture/so-diem-bien-thien.md` (Q-1), dòng thêm ở
  `docs/product/tham-chieu.md` (luật 12); sáu tệp bài có sẵn chỉ thêm vai Bảng hàng cho người tạo hàng (xin chạm Q-3); trang `apps/web/src/app/(app)/inventory/page.tsx` chỉ thêm nhánh về Hôm nay (xin chạm Q-4):
  `packages/api/test-db/listings.test.ts`, `owners.test.ts`, `doi-gia-da-ban/doi-gia-da-ban.test.ts`,
  `ngay-ban/ngay-ban.test.ts`, `goi-ep-gia-dot-hai.test.ts`, `apps/web/src/lib/sync/test-db/doi-gia-da-ban.db-test.mts`.
- Nguồn: G1, G7 của `docs/plan/ra-soat-crud-phan-quyen.md`; luật 74 của đợt (chủ kho «Mở G1 ngay» 05/11).

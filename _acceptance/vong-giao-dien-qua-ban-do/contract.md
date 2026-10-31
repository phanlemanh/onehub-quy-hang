---
schema_version: 1
feature: Chủ sản phẩm duyệt một vòng giao diện và thấy màn mới đặt cạnh màn mẫu của nhóm, cùng khổ và cùng trạng thái; nhóm chưa có trong bản đồ thì chính vòng ấy tạo mục bản đồ và khuôn
slug: vong-giao-dien-qua-ban-do
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci, ui]
status: implemented
design_doc: docs/superpowers/specs/2026-10-31-vong-giao-dien-qua-ban-do-design.md
approved_by: Manh Phan
approved_at: 2026-10-31T12:52:33Z
---

# Acceptance Contract: vong-giao-dien-qua-ban-do

## Context

Hàng 60 của lộ trình (đợt `ban-do-khuon-3110`, mã QK3 và QK4; dãy A, đợt nen-2), đứng trên hàng 58 (bản đồ khuôn) và 59
(răng giữ khuôn). Thêm ba lệnh ở `packages/ui-lint`: lập kế hoạch và ghép trang đối chiếu màn mới cạnh màn mẫu, răng «màn
ngoài bản đồ» trong bài quét sẵn có, và ghi số đo mỗi vòng giao diện; ghi luật vào `docs/design/vo-va-ia.md` và skill
`quy-hang-ui`.

Source input: `docs/plan/lo-trinh.json` hàng 60 · `_acceptance/vong-giao-dien-qua-ban-do/opportunity.md` · bản phạm vi
`docs/plan/pham-vi-ban-do-khuon-3110.md` · thiết kế `docs/superpowers/specs/2026-10-31-vong-giao-dien-qua-ban-do-design.md`

## Criteria

- AC-1: Given bản sao kho có một commit sửa `settings/users/page.tsx` và `(auth)/login/page.tsx`, When chạy
  `node packages/ui-lint/doi-chieu.mjs --base <ref> --slug <slug>`, Then `doi-chieu/ke-hoach.json` có đúng các cặp viết
  trước — mỗi tệp × mỗi trạng thái trong `mau_dang_chay.trang_thai` của nhóm × khổ 1440 và 375 (cài đặt sàn 3 × 2, xác
  thực 2 × 2) — mỗi cặp mang nhóm, tệp mới, tệp và đường màn mẫu, hai tên ảnh `<nhóm>--<trạng thái>--<khổ>--{moi,mau}.png`;
  stdout mỗi cặp một dòng; thoát 0; một tệp màn MỚI chưa `git add` (`settings/thu/page.tsx`) cũng sinh đủ cặp của nó,
  còn tệp chưa theo dõi dưới `docs/` không sinh cặp nào. When vòng chỉ sửa `docs/` hay `_acceptance/`, Then một dòng «đối chiếu: vòng không
  chạm màn của nhóm nào», không ghi tệp, thoát 0.
- AC-2: Given kế hoạch của AC-1 và đủ ảnh cho mọi cặp, When chạy `doi-chieu.mjs --dung <slug>`, Then
  `doi-chieu/index.html` có đúng một hàng mỗi cặp, mỗi hàng hai ảnh nhúng cùng bề ngang với nhãn «màn mới · <tệp>» và
  «màn mẫu · <đường>», thoát 0 với dòng «đối chiếu: 10 cặp đủ»; When xoá một ảnh mẫu, Then trang có ô «thiếu ảnh <tên
  tệp>» ở đúng hàng ấy, stderr gọi tên tệp ảnh, thoát 1.
- AC-3: Given lệnh `doi-chieu.mjs --mau`, When chạy trên cây thật, Then kế hoạch liệt màn mẫu của đủ bốn nhóm với đường
  và trạng thái khai trong bản đồ; và mở từng đường ấy trên bản đang chạy ở khổ 1440 và 375 cho thấy đúng màn mẫu trong
  từng trạng thái đã khai (Người dùng: mặc định, không quyền, lỗi; đăng nhập: mặc định, lỗi; Hôm nay; chuông trống), không
  trang lỗi.
- AC-4: Given bản sao kho, When một `apps/web/src/app/**/page.tsx` trả JSX nằm ngoài `nhan_dien` và ngoại lệ của mọi nhóm
  đơn vị màn — `(app)/inventory/page.tsx` bị đưa ra khỏi `nhan_dien` trang tạm, hay một trang mới `(app)/bao-cao/page.tsx`
  sau khi bỏ khỏi trang tạm — Then `ban-do-khuon.mjs` thoát 1 và một dòng `<tệp>: ngoai-ban-do — màn chưa thuộc nhóm nào …`
  nêu `design/patterns/`; When thêm `design/patterns/bang-hang.md` hợp lệ có khuôn phủ tệp ấy, Then thoát 0; trang chỉ
  chuyển hướng (không trả JSX, như `app/page.tsx`) không bị báo.
- AC-5: Given `ban-do-khuon.mjs --base <ref>` và `kiem-chuan.mjs`, When vòng chỉ thêm một màn ngoài bản đồ (không tệp nhóm
  nào đổi), Then `--base` thoát 1 nêu tệp ấy — không in «không tệp nào của nhóm đổi» — và `kiem-chuan` thoát 1 với đúng một dòng
  lỗi `khuôn: <tệp>: ngoai-ban-do — …`; When cây thật, Then `kiem-chuan` vẫn in «khuôn: 4 nhóm · 0 lỗi đọc · 0 lệch» và
  `ban-do-khuon.mjs` thoát 0.
- AC-6: Given một kho thử có bốn commit trên `<ref>` — commit 1 thêm trang Cài đặt gốc `<main>` (lệch), commit 2 sửa thành
  `MucCaiDat`, commit 3 thêm một màn ngoài bản đồ rồi commit 4 thêm mục bản đồ cho nó — và sổ `docs/design/lech-lot.md` có
  hai dòng, một dòng ghi vòng này, When chạy `so-do-vong.mjs --slug <slug> --base <ref> --write`, Then
  `khuon-so-do.json` có `rang_bat` = 2 kèm danh sách hai cặp (tệp, điều lệch), `lech_lot` = 1, `tep_theo_khuon` liệt đúng
  các tệp nhóm vòng đổi đang theo khuôn; lệch còn ở HEAD không tính vào `rang_bat`.
- AC-7: Given hồ sơ có dòng `gio-may` trong `run-log.jsonl` và sổ quyết định có dòng `seal` và dòng `gate2` có
  `decided_by`, When chạy `so-do-vong.mjs --write --bao`, Then `khuon-so-do.json` có khối `kit` chép đúng giờ máy, giờ chờ,
  tổng token ra, % hạn mức tuần và đếm lượt gọi người; stdout có đúng một dòng
  `quy-hang · hàng <mã lộ trình> · khuôn <n> tệp · răng bắt <k> · lệch lọt <j> · giờ máy <g> · giờ chờ <c> · token ra <t> · gọi người <p>` — chỉ số, không tên hồ sơ hay chữ sản phẩm (kho kit công khai); hồ sơ thiếu `gio-may`
  thì khối `kit` ghi `null` kèm lý do, không thoát lỗi.
- AC-8: Given `docs/design/vo-va-ia.md`, skill `quy-hang-ui` và sổ `docs/design/lech-lot.md`, When một tác tử mới dựng
  màn đầu của một nhóm chưa có trong bản đồ, Then văn bản nói đủ: xếp nhóm và đọc màn mẫu trước khi dựng; nhóm mới tạo mục
  bản đồ và khuôn trong chính vòng ấy; ba lệnh (`doi-chieu`, `ban-do-khuon`, `so-do-vong`) chạy ở bước nào; lệch lọt ghi
  ở đâu; vòng chạm màn phải gửi `doi-chieu/index.html` có ảnh màn mới kèm thẻ Cổng Phạm vi trước khi ký; bảng luật của
  skill có dòng «màn ngoài bản đồ». (judgment)
- AC-9: Given hồ sơ của chính vòng này, When tới bước chấm, Then hồ sơ đã commit `khuon-so-do.json` do
  `so-do-vong.mjs --write` ghi (vòng không đổi màn: `tep_theo_khuon` rỗng, `rang_bat` theo commit của vòng) và
  `doi-chieu/` mang kế hoạch màn mẫu của bốn nhóm cùng trang ghép ảnh màn mẫu chụp ở bước dựng; AC-3 chụp lại vào
  `evidence/` để đối chiếu.

## Coverage

Quét morphological-scan, preset entity-feature, cho thực thể «một vòng chạm giao diện». Chân sản phẩm: bản phạm vi QK3,
QK4 [SUY-TỪ-REPO: docs/plan/pham-vi-ban-do-khuon-3110.md], bản đồ hàng 58 [SUY-TỪ-REPO: design/patterns], răng hàng 59
[SUY-TỪ-REPO: packages/ui-lint/ban-do-khuon.mjs]. Chân ngành: so màn mới cạnh màn chuẩn ở cổng sẵn có [NGÀNH: finding kit
§3.2 nguyên tắc 7, §7.6]; hai chiều của thước [NGÀNH: finding kit §11.5].

- Trục loại vòng: chạm màn của nhóm (AC-1, AC-2) | chỉ sửa tài liệu (AC-1, AC-5) | dựng màn đầu nhóm mới (AC-4, AC-5) |
  không chạm màn (AC-9) [thước CE: bốn đường của §11.4]
- Trục vật: kế hoạch chụp (AC-1, AC-3) | trang ghép đôi (AC-2, AC-9) | răng màn ngoài bản đồ (AC-4, AC-5) | số đo (AC-6,
  AC-7, AC-9) | luật chữ (AC-8)
- Trục chiều của thước: đủ → xanh (AC-2, AC-4 sau khi thêm mục) | thiếu → đỏ có tên (AC-2, AC-4, AC-5) | im (AC-1 docs,
  AC-4 trang chuyển hướng, AC-5 cây thật)
- Trục số cho kit: tệp theo khuôn · răng bắt · lệch lọt (AC-6) | năm dòng số của kit (AC-7)
- Later: đăng báo lên issue #308 (Hỏi-1); khối «Khuôn» trên thẻ cổng và bước chụp trong `design-pass` của kit (KH2, KH3).
- Never: tự chụp bằng trình duyệt không đầu trong CI — thêm phụ thuộc cho một bước người đọc lúc rảnh.

## Đường đo

- Ngưỡng ô cơ hội «Ảnh màn mới cạnh màn mẫu có ở Cổng Phạm vi của vòng chạm giao diện; luật «màn đầu của nhóm mới tạo mục
  bản đồ» nằm trong vo-va-ia.md và skill quy-hang-ui; hồ sơ vòng ghi số tệp theo khuôn, số lần răng bắt, lệch lọt» — số
  từ `doi-chieu.mjs --dung` (số cặp đủ), `ban-do-khuon.mjs` (lệch ngoài bản đồ) và `khuon-so-do.json` · AC-1, AC-2, AC-3
  bảo đảm phần ảnh; AC-4, AC-5, AC-8 phần luật nhóm mới; AC-6, AC-7, AC-9 phần số đo.
- Vế «ảnh màn mới cạnh màn mẫu CÓ ở Cổng Phạm vi» chỉ đo được ở một vòng dựng màn: hàng này không dựng màn, nên nó chứng
  công cụ (AC-1, AC-2), màn mẫu chạy được (AC-3) và luật buộc gửi trang ghép kèm thẻ cổng (AC-8); lần đầu ngưỡng đo trên
  vòng thật là hàng 14 (Bảng hàng).

## Out of scope

- Khuôn và mục bản đồ cho nhóm chưa có màn (Bảng hàng, hồ sơ căn, Hôm nay…) — sinh cùng màn đầu tiên, từ hàng 14.
- Bước chụp trong chính skill `design-pass` và khối «Khuôn» trên thẻ cổng — việc của kit (KH2, KH3).
- Tự chụp bằng trình duyệt không đầu (Playwright) trong lệnh hay CI.
- Đường «chạy» (`data-khuon` trên phần tử gốc) cho kho không phải React.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Bất biến chạm: không — hàng thêm công cụ kiểm và tài liệu; không bảng, không API, không màn.
- Dãy A: dev 3472, Postgres 5552 (`quy-hang-db-A`).
- Giới hạn khai (AC-6): lần răng bắt trước khi commit (lint trong trình soạn, hook cuối lượt) không đếm được.

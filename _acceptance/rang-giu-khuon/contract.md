---
schema_version: 1
feature: Một màn của nhóm dựng ngoài khuôn làm bài kiểm của kho đỏ và gọi đúng tên tệp cùng khối cấm; chỉ sửa tài liệu hay hồ sơ thì bài kiểm im
slug: rang-giu-khuon
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci]
status: verified
design_doc: docs/superpowers/specs/2026-10-31-rang-giu-khuon-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-31T11:12:32Z
---

# Acceptance Contract: rang-giu-khuon

## Context

Hàng 59 của lộ trình (đợt `ban-do-khuon-3110`, mã QK2; dãy D, đợt nen-2), đứng trên hàng 58 (bản đồ khuôn). Thêm răng giữ
bản đồ: luật lint cấm nhập khối cấm theo vùng của từng nhóm, bài quét khuôn chạy trong `npm run lint`, và chế độ theo
diff cho bước chấm. Gộp Ngoài-5 của hàng 58 (khối cấm của ba nhóm màn chưa bị chặn) theo quyết định chủ kho.

Source input: `docs/plan/lo-trinh.json` hàng 59 · `_acceptance/rang-giu-khuon/opportunity.md` · Ngoài-5 ở
`_acceptance/ban-do-khuon-nhom-da-co/` · thiết kế `docs/superpowers/specs/2026-10-31-rang-giu-khuon-design.md`

## Criteria

- AC-1: Given bản sao cây kho, When thêm một tệp màn của nhóm nhập khối cấm của nhóm ấy — trang Cài đặt mới
  `settings/thu/page.tsx` nhập `Frame`, trang xác thực nhập `Card`, trang tạm nhập `Empty`, `quan-nguoi.tsx` nhập
  `Alert` — và chạy eslint, Then luật `quy-hang-ui/ban-do-khuon` báo đúng một lỗi ở dòng nhập mỗi ca, thông điệp nêu
  tệp, khối, nhóm, khuôn phải dùng và tệp bản đồ.
- AC-2: Given cùng bản sao, When chạy eslint trên tệp khuôn tự nhập khối của nó (`settings/khung.tsx` nhập `Frame`), tệp
  ngoại lệ đã khai (`settings/[section]/page.tsx`), tệp ngoài mọi nhóm, và tệp nhóm nhập khối không cấm, Then luật không
  báo lỗi nào.
- AC-3: Given một tệp màn nhập khối cấm dưới tên khác (`import { Frame as F }`), When chạy eslint, Then vẫn đúng một lỗi
  nêu tên gốc `Frame`.
- AC-4: Given bản đồ có ngoại lệ thiếu lý do, When chạy eslint trên một tệp của `apps/web/src` và chạy
  `node packages/ui-lint/kiem-chuan.mjs`, Then cả hai đỏ và nêu tệp bản đồ cùng trường `ngoai_le[0] thiếu ly_do`, dù
  không tệp màn nào lệch.
- AC-5: Given kiem-chuan (bước cuối của `npm run lint`), When cây sạch, Then in `khuôn: 4 nhóm · 0 lỗi đọc · 0 lệch` và
  thoát 0; When một màn của nhóm dựng lệch gốc (Người dùng trả `<main>`), Then thoát 1 và một dòng nêu tệp và nhóm.
- AC-6: Given `ban-do-khuon.mjs --base <ref>` trên bản sao có nợ cũ ở một tệp màn, When chỉ sửa `docs/` hay
  `_acceptance/`, Then im — thoát 0, dòng «khuôn: không tệp nào của nhóm đổi»; When sửa một tệp màn khác cho lệch, Then
  thoát 1 và chỉ nêu tệp ấy (nợ cũ không nêu); When thêm một tệp màn MỚI chưa theo dõi dựng lệch gốc, Then thoát 1 nêu
  tệp ấy; When sửa một dòng không lệch trong chính tệp có nợ cũ, Then thoát 0 và nợ ấy hiện với nhãn «nợ cũ»; When sửa
  `design/patterns/` cho hỏng, Then nêu lỗi đọc bản đồ.
- AC-7: Given cây thật và cấu hình eslint thật của kho, When chạy `npm run lint` và lint `apps/web/src` với chỉ thị
  trong mã bị bỏ qua, Then thoát 0, mức nợ giao diện 0, 0 lỗi `quy-hang-ui/ban-do-khuon` (không chỉ thị tắt nào đang che
  lệch), luật ở mức error cho một tệp mỗi nhóm; và một trang Cài đặt mới nhập `Frame` lint bằng cấu hình thật ra đúng
  một lỗi luật ấy mức error; skill `quy-hang-ui` liệt luật mới trong bảng luật.

## Coverage

Quét morphological-scan, preset test-matrix, cho «răng giữ bản đồ khuôn». Chân sản phẩm: trang tri thức đợt
[SUY-TỪ-REPO: docs/tri-thuc/wiki/dot/ban-do-khuon-3110.md], bản đồ hàng 58 [SUY-TỪ-REPO: design/patterns]. Chân
ngành: hai chiều của thước [NGÀNH: finding kit §11.5 — đỏ khi tiêm, im khi chỉ sửa docs, đối chứng dương]; cấm nhập
theo vùng [NGÀNH cận kề: luật no-restricted-imports của ESLint].

- Trục lớp răng: lint cấm nhập (AC-1, AC-2, AC-3) | bài quét trong lint (AC-5) | chế độ theo diff (AC-6) | đọc bản đồ
  (AC-4) [thước CE: ba lớp của thiết kế]
- Trục nhóm: bốn nhóm, mỗi nhóm một ca đỏ (AC-1) [thước CE: bốn tệp design/patterns]
- Trục chiều: đỏ khi tiêm (AC-1, AC-3, AC-5, AC-6) | im (AC-2, AC-6) | đối chứng dương cây thật (AC-7)
- Later: bắt khối đổi tên trong bài quét trạng thái.
- Never: tắt luật bằng chỉ thị để lint xanh — trái mức nợ 0.

## Đường đo

- Ngưỡng ô cơ hội «tiêm một trang Cài đặt gọi thẳng khối cấm → đỏ, gọi đúng tên tệp và khối; chỉ sửa docs/ hay
  _acceptance/ → im; mọi màn hiện có xanh; ngoại lệ thiếu lý do → đỏ ở bước đọc bản đồ» — số từ `npm run lint` và
  `ban-do-khuon.mjs --base` · AC-1 (đỏ, tên tệp và khối), AC-6 (im), AC-7 (màn hiện có xanh), AC-4 (ngoại lệ thiếu lý do).

## Out of scope

- Bắt khối báo nhập đổi tên trong bài quét trạng thái (Ngoài-4 hàng 58, đã ghi giới hạn).
- Ảnh màn mới cạnh màn mẫu, luật nhóm mới — hàng 60.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Bất biến chạm: không — hàng chỉ thêm công cụ kiểm.
- Dãy D: dev 3473, Postgres 5553 (`quy-hang-db-D`).
- Ngoài-1 (máy định tuyến 2026-10-31, đề xuất S4 known-limits): Khi chỉ sửa luật của một nhóm màn, bước chấm theo vòng có thể báo xanh dù một số màn cũ nay đã lệch luật mới. Lần chạy lint đầy đủ vẫn báo đỏ ở đó. — `packages/ui-lint/ban-do-khuon.mjs`
- Ngoài-2 (máy định tuyến 2026-10-31, đề xuất S4 known-limits): Một số kiểu lệch khuôn do chính vòng làm ra có thể bị gắn nhãn nợ cũ nên bước chấm theo vòng vẫn xanh. Lần chạy lint đầy đủ vẫn thấy lệch đó. — `packages/ui-lint/lib/ban-do.mjs`
- Ngoài-3 (máy định tuyến 2026-10-31, đề xuất S4 known-limits): Nếu chỉ xoá một dòng làm màn thiếu phần bắt buộc, bước chấm theo vòng có thể coi đó là nợ cũ và vẫn xanh. Lần lint đầy đủ vẫn bắt được. — `packages/ui-lint/ban-do-khuon.mjs`
- Ngoài-4 (máy định tuyến 2026-10-31, đề xuất S4 known-limits): Khi bản đồ khuôn đổi làm vài màn cũ lệch, bước chấm theo vòng không báo gì và ra xanh. Lần chạy lint đầy đủ vẫn báo đỏ. — `packages/ui-lint/ban-do-khuon.mjs`
- Ngoài-5 (máy định tuyến 2026-10-31, đề xuất S4 known-limits): Một số lệch do vòng hiện tại gây ra bị tính là nợ cũ nên bước chấm theo vòng vẫn xanh. Lint đầy đủ vẫn bắt được. — `packages/ui-lint/lib/ban-do.mjs`

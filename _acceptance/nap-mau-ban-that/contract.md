---
schema_version: 1
feature: Một nút chạy tay trên GitHub Actions nạp đủ dữ liệu mẫu (hàng sáu trạng thái, chủ nhà số mã hoá, lead có ca trùng, người phụ trách, tài khoản chủ kho) vào «[Mẫu] Sàn thử» trên bản thật, chạy lại không đổi gì, gỡ chỉ đúng sàn mẫu
slug: nap-mau-ban-that
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [db, ci]
status: approved
design_doc: docs/superpowers/specs/2026-11-01-nap-mau-ban-that-design.md
approved_by: Manh Phan
approved_at: 2026-11-01T07:33:51Z
---

# Acceptance Contract: nap-mau-ban-that

## Context

Hàng 87 của lộ trình (dãy D, đợt dau-chu-dong-vao), đứng trên hàng 5, 10, 11, 24, 62. Bản thật 01/11 có 2 sàn, 2 thành
viên, mọi bảng khác 0 dòng — chủ kho không thấy gì. ADR-0009: bản thật chỉ chứa dữ liệu mẫu tới khi pháp lý rà.
ADR-0013: số chủ nhà chỉ vào cơ sở dữ liệu dạng bản mã. Hạng **T3** (chạm `packages/db/**`, `.github/workflows/**`).
Bất biến chạm: (1) cách ly, (2) chủ nhà không rời công ty.

Source input: `docs/plan/lo-trinh.json` hàng 87 · `_acceptance/nap-mau-ban-that/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-11-01-nap-mau-ban-that-design.md`

## Criteria

- AC-1: Given Postgres đã áp mọi migration và có sẵn một sàn thật có hàng, chủ nhà, lead, thành viên, When chạy bộ nạp
  với khoá hợp lệ và một email chủ kho, Then sàn «[Mẫu] Sàn thử» có đúng 6 người mẫu với vai của gói, 2 khu và khu phụ
  trách của gói, 40 hàng với đúng số hàng từng trạng thái của gói (14 Active, 6 Incomplete, 5 Pending, 5 Closed, 5
  Hold, 5 Withdrawn), mỗi hàng đúng toà, mã căn, giá của gói, có sự kiện tạo và đầu chủ phụ trách theo gói, cả 40
  hàng có chủ nhà đúng tên theo gói (30 chủ nhà khác nhau), 12 lead đúng toà và mã căn của gói; lead L-01 có kết quả «căn đang có hàng mở», L-02 «số
  chủ đã có đầu chủ», các lead còn lại «mới» — do luật kiểm trùng tính, không ghi tay. (cross-layer)
- AC-2: Given sàn mẫu đã nạp, When đọc bảng chủ nhà và bảng lead bằng vai chủ, Then cột số rõ rỗng ở mọi dòng của sàn
  mẫu; giải bản mã bằng đúng khoá đã dùng với ngữ cảnh của dòng ra đúng số `0900 000 0xx` của gói; giải bằng khoá khác,
  hay chép bản mã sang dòng khác rồi giải, đều thất bại; dấu vết so trùng bằng dấu vết API tính cho cùng số và sàn.
- AC-3: Given khoá vắng, sai dạng hay là khoá dev, When chạy bộ nạp, Then lệnh thoát khác 0 trước khi ghi, số dòng mọi
  bảng không đổi, thông điệp nêu tên biến `OWNER_PHONE_KEY` và không chứa giá trị khoá.
- AC-4: Given sàn mẫu đã nạp, When chạy bộ nạp lần hai với cùng khoá và email, Then mọi bảng của cơ sở dữ liệu (kể cả bản
  mã, dấu vết, sự kiện, thời điểm) không đổi một dòng so với ảnh chụp sau lần một, và lệnh báo 0 hàng, 0 chủ nhà, 0 lead
  mới.
- AC-5: Given một email chủ kho, When nạp, Then: tài khoản chưa có thì được tạo; đã có (kể cả đang là thành viên một
  sàn thật) thì giữ nguyên tài khoản và dòng thành viên ở sàn khác, chỉ thêm dòng thành viên sàn mẫu với vai theo Hỏi-2;
  email sai dạng hay thuộc miền mẫu bị từ chối trước khi ghi; đầu ra lệnh không chứa email; không tệp nào của kho chứa
  email chủ kho.
- AC-6: Given sàn mẫu đã nạp cạnh một sàn thật, When chạy gỡ, Then sàn mẫu và mọi dòng của nó không còn, tài khoản miền
  mẫu không còn, tài khoản chủ kho còn cùng dòng thành viên ở sàn thật, và mọi bảng ngoài phần sàn mẫu không đổi một dòng
  so với ảnh chụp trước nạp. Sàn mẫu được nhận bằng tên đúng «[Mẫu] Sàn thử» CÙNG quản trị mẫu miền mẫu là thành viên
  (theo Hỏi-3): một sàn thật tự đặt tên ấy mà không có quản trị mẫu thì gỡ không xoá nó (đếm mọi bảng không đổi) và nạp
  không ghi vào nó (nạp dựng sàn mẫu riêng); có hai sàn mẫu khớp thì gỡ từ chối, không xoá dòng nào; không có sàn mẫu
  thì gỡ báo không có gì và không xoá dòng nào.
- AC-7: Given gói có một hàng hỏng ở cuối (vd trạng thái không có trong luật), When nạp, Then lệnh thoát khác 0 và không
  dòng nào của lần chạy ấy được ghi (sàn, tài khoản, hàng, chủ nhà, lead).
- AC-8: Given tệp `.github/workflows/nap-mau.yml`, When đọc tệp, Then nó chỉ chạy bằng `workflow_dispatch`, có tham số
  `viec` (`nap` | `go`), `email`, `xac_nhan`; job chạy ở environment `production` và bước đầu thoát khác 0 khi ref không
  phải `refs/heads/main`; gỡ thoát khác 0 khi `xac_nhan` khác đúng tên sàn mẫu; email được che trong log trước bước
  nạp; bí mật chỉ đi qua `env` và không bước nào in giá trị bí mật; job đặt `NODE_ENV=production`.
- AC-9: Given sàn mẫu đã nạp, When chạy bộ kiểm cách ly và một thành viên sàn thật đọc bảng hàng, chủ nhà, lead, sự kiện
  bằng vai `quy_hang_app`, Then bộ kiểm cách ly xanh và thành viên sàn thật thấy 0 dòng của sàn mẫu; mọi ca của bộ dữ
  liệu mẫu hàng 5, API và lõi vẫn xanh.
- AC-10: Given sàn mẫu đã nạp, When một thành viên sàn mẫu tra danh mục qua API (`createApi` dựng với khoá hợp lệ,
  `NODE_ENV=production`), Then đường tra trả 180 căn của «[Mẫu] Dự án căn hộ thử» và tra mã căn của một hàng mẫu ra
  đúng căn ấy — vế danh mục của ngưỡng ô cơ hội, không cần dòng nào ở vùng danh mục dùng chung. (cross-layer)

## Coverage

Quét theo khuôn entity-feature của morphological-scan cho thực thể «một lần bấm nút nạp/gỡ trên bản thật», làm tại chỗ
trên ô cơ hội và bộ nạp hàng 5 [SUY-TỪ-REPO: packages/db/seed/nap.mjs].

- Trục loại dữ liệu: người và vai (AC-1, AC-5) | khu, khu phụ trách (AC-1) | hàng sáu trạng thái, sự kiện, đầu chủ
  (AC-1) | chủ nhà (AC-1, AC-2) | lead và kiểm trùng (AC-1, AC-2) | danh mục — phục vụ qua đường tra mẫu, không ghi
  (AC-10; không ghi vào vùng dùng chung — Out of scope) [thước CE: phân bố trạng thái của `mau/du-lieu-mau.json`]
- Trục khoá: hợp lệ (AC-2) | vắng, sai dạng, khoá dev (AC-3)
- Trục lần chạy: lần đầu (AC-1) | lặp lại (AC-4) | hỏng giữa chừng (AC-7) | gỡ (AC-6)
- Trục sàn: sàn mẫu (AC-1…AC-7) | sàn thật cạnh bên (AC-1, AC-6, AC-9) | sàn thật trùng tên mẫu, hai sàn mẫu khớp (AC-6)
- Trục tài khoản chủ kho: chưa có | có, thuộc sàn thật | email miền mẫu, sai dạng (AC-5)
- Trục nút: sự kiện kích hoạt, nhánh, xác nhận gỡ, bí mật, log (AC-8)
- Later: ghi danh mục vào vùng dùng chung theo đường tra thật; nạp tự động sau deploy; nhiều bộ mẫu.
- Never: số chủ rõ trong cơ sở dữ liệu; câu xoá không neo id sàn mẫu hay miền mẫu; email chủ kho trong kho.

## Đường đo

- Ngưỡng ô cơ hội «sàn mẫu có đủ danh mục, chủ nhà, hàng, lead, khu; số chủ là bản mã giải được bằng khoá Production;
  chủ kho là thành viên; chạy lại không đổi gì; gỡ chỉ xoá sàn mẫu và tài khoản miền mẫu, sàn thật không đổi một dòng;
  bộ kiểm cách ly xanh» — số từ bộ kiểm `nap-ban-that.test.ts` trên Postgres dãy (đếm, ảnh chụp, giải mã) · AC-1, AC-2,
  AC-4, AC-5, AC-6, AC-9, AC-10 bảo đảm. Vế «trên bản thật» đo ở phiên nghiệm thu sau gộp (chủ kho bấm nút).

## Out of scope

- Ghi danh mục 180 căn vào vùng danh mục dùng chung — đường tra vẫn phục vụ danh mục mẫu ở mọi môi trường; ghi vào vùng
  dùng chung thì mọi sàn thật thấy danh mục mẫu và gỡ không xoá được.
- Đặt secret trên GitHub và bấm nút trên bản thật — việc của chủ kho sau gộp (Hỏi-1).
- Giao diện, đường API, migration mới.
- Đổi gói `du-lieu-mau.json`.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Dãy D chạy Postgres 5565 (`quy-hang-db-D`).
- AC-6 viết theo khuyến nghị của Hỏi-3 (nhận sàn mẫu bằng tên cộng quản trị mẫu).
- AC-5 viết theo khuyến nghị của Hỏi-2 (đủ mọi vai); chủ kho chọn «chỉ quản trị» thì AC-5 đổi vai, không thêm tiêu chí.
- AC-2 viết theo khuyến nghị của Hỏi-1 (mã hoá trên máy chạy job); chủ kho chọn lối API bản thật thì phạm vi đổi (đường
  API mới ngoài vùng) — phải duyệt lại Cổng Phạm vi.
- Bộ kiểm mới chạy bằng `node --import tsx --test` (bộ nạp dùng lại hàm ghi TypeScript của API) — thêm một dòng
  executor vào `_acceptance/config.yaml`.

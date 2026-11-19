---
schema_version: 1
feature: Chuyển kit nghiệm thu từ chợ cũ acceptance-gate-kit v2.39.0 sang chợ delivery-loop v3.0.0 — CI kéo kit từ kho mới theo thẻ, phiên bật sáu plugin chợ mới và tắt đích danh sáu plugin chợ cũ, tệp sống thôi gọi tên lệnh cũ, hồ sơ cần thì ghim lại; không đổi hành vi
slug: chuyen-cho-delivery-loop-3-0
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ci, config]
status: approved
design_doc: docs/superpowers/specs/2026-11-19-chuyen-cho-delivery-loop-3-0-design.md
approved_by: Phan Le Manh
approved_at: 2026-11-19T15:09:21Z
---

# Acceptance Contract: chuyen-cho-delivery-loop-3-0

## Context

Từ 18/11 nguồn của kit là kho `phanlemanh/delivery-loop`; kho cũ đóng băng ở `v2.39.0`. Kho này còn kéo kit cũ ở job
`gate` và luồng «Ghim lại hồ sơ cần bản thật», phiên còn bật sáu plugin chợ cũ. Đây là chặng II.2 của «chuyển nhà giai
đoạn 2» (chủ kho duyệt kế hoạch 19/11, «Tính, mở II.2» 19/11): một vòng, một PR, mốc cài `v3.0.0`, không ghép đổi hành vi.
Mẫu: Inventory, commit cài `47d52b06`. Hạng T3 vì chạm `.claude/settings.json` và `ghim-lai-ban-that.yml`.

Source input: lời giao của phiên giữ đợt 19/11 · `migration/KE-HOACH-GIAI-DOAN-2.md` mục 4 dòng II.2 và mục 9 (kho
delivery-loop, nhánh `chuyen-nha`) · `migration/chuyen-kho/README.md` (K1–K6) · thiết kế
`docs/superpowers/specs/2026-11-19-chuyen-cho-delivery-loop-3-0-design.md`

## Criteria

- AC-1: Given PR này, When đọc `ci.yml` và `ghim-lai-ban-that.yml`, Then mỗi tệp có đúng một dòng `KIT_TAG: v3.0.0`, lấy kit
  từ `https://github.com/phanlemanh/delivery-loop` theo thẻ, đặt `CLAUDE_PLUGIN_ROOT=$RUNNER_TEMP/kit/plugins/acceptance-gate`,
  và bước «Ghim lại» gọi làn ghim lại ở `$CLAUDE_PLUGIN_ROOT/../feature-loop/` (bố cục 3.0); không tệp nào dưới `.github/`
  còn chữ `acceptance-gate-kit`; lưới trước-gộp của kit 3.0.0 trên nhánh chỉ chặn vì hồ sơ của vòng (đo cùng AC-6).
- AC-2: Given `.claude/settings.json`, When đọc khoá chợ và plugin, Then chợ khai duy nhất là `delivery-loop` (github
  `phanlemanh/delivery-loop`, `ref` bằng `KIT_TAG` của `ci.yml`), sáu plugin `acceptance-gate`, `feature-loop`,
  `diagram-design`, `dispatch`, `roadmap`, `knowledge` `@delivery-loop` là `true`; mọi khoá khác của tệp (quyền, hook,
  plugin ngoài kit) giữ nguyên so với nhánh chính.
- AC-3: Given cùng tệp, When đọc khoá chợ cũ, Then có đúng sáu khoá `acceptance-gate`, `feature-loop`, `diagram-design`,
  `dieu-phoi`, `road-map`, `tri-thuc` `@acceptance-gate-kit` và cả sáu là `false`.
- AC-4: Given `packages/ui-lint/tim-kit.mjs`, When sổ cài có mục `acceptance-gate@delivery-loop`, Then lệnh in đường bản
  cài ấy; sổ chỉ có mục `acceptance-gate@acceptance-gate-kit` thì lệnh không in gì; trên máy làm vòng, bản tìm được là
  acceptance-gate 3.0.0 và có đủ script mà các lệnh executor của kho gọi.
- AC-5: Given tệp sống của kho (bỏ hồ sơ đã ký, tệp mang ngày, nhật ký, tài liệu thô, tệp sinh), When quét theo bảng tên
  lệnh cũ → mới của kit 3.0, Then không còn tên lệnh cũ nào và không mã sống nào giữ khoá `…@acceptance-gate-kit` ngoài
  `.claude/settings.json`; `AGENTS.md` nêu kho kit mới và thẻ đúng bằng `KIT_TAG` của `ci.yml`; Sổ quyết định của Tham
  chiếu có dòng 19/11 ghi việc chuyển nguồn kit.
- AC-6: Given merge-base với nhánh chính, When kit v2.39.0 và v3.0.0 cùng `--recheck-all`, Then cả hai 0 VIOLATION và
  cùng tập hồ sơ OK; và trên HEAD, kit v3.0.0 `--recheck-all` vẫn OK mọi hồ sơ ấy, dòng VIOLATION nếu có chỉ thuộc hồ sơ
  của vòng.
- AC-7: Given 36 hồ sơ ứng viên (đã thông cổng, có eval đọc vật vừa đổi), When làn ghim lại khô `--tung-ho-so` chạy trên
  HEAD bằng kit 3.0.0 và trên nhánh chính bằng kit CI 2.39.0, Then mọi ứng viên xanh trên HEAD trừ hai tập có tên: «đỏ cả
  hai bên» (để nguyên, liệt tên — Hỏi-2) và «đo diff của nhánh» (eval so diff hay lưới PR với nhánh chính; đỏ trên HEAD
  nhưng xanh trên bản sau gộp giả — bản sao của HEAD có nhánh chính trỏ về HEAD); hồ sơ phải sửa phép đo được ghim lại
  bằng làn máy tại HEAD — dòng ghim cuối có `sha` bằng `verified_commit`, mọi eval máy thoát 0, chữ ký người giữ nguyên
  (Hỏi-1); ba tập ấy trong mục «Ghim lại — kết quả» khớp tệp phân loại của lượt chạy trên đúng cây HEAD.
- AC-8: Given PR này, When so diff với nhánh chính, Then mọi tệp đổi thuộc danh sách viết trước của việc chuyển chợ
  (thiết kế mục 2, tệp vẽ lại, hồ sơ này), và ở hồ sơ ghim lại chỉ `run-log.jsonl`, `evidence-report.md` cùng các tệp đo
  nêu đích danh ở mục «Ghim lại — kết quả»; bộ kiểm của kho (`feature_loop.suite_keys`) xanh và `product-map --check` của
  kit 3.0.0 xanh.

## Coverage

- bỏ coverage-scan — phạm vi do kế hoạch đã duyệt chốt (năm phần của dòng II.2) và công cụ kiểm chuyển kho liệt sáu điểm
  K1–K6; trục được phủ: phía CI (AC-1) · phía phiên (AC-2) · tắt đích danh (AC-3) · tìm kit trên máy (AC-4) · tên cũ
  trong tệp sống (AC-5) · không đổi phán quyết (AC-6) · ghim lại (AC-7) · không đổi hành vi (AC-8). Dòng sổ «bỏ
  coverage-scan» trong `decisions.jsonl`.

## Đường đo

- bỏ đường-đo — việc vận hành kho, không có ô cơ hội và ngưỡng nghiệm thu.

## Ghim lại — kết quả

Đo trước Cổng Phạm vi (làn khô `--tung-ho-so`, bản sửa `7208c8a9` bằng kit 3.0.0 · nhánh chính `f1d123ee` bằng kit 2.39.0).
Phân loại cuối chạy lại trên HEAD và ghi `evidence/phan-loai-ghim.json`; dòng dưới cập nhật theo tệp ấy.

- ghim: `ghim-lai-ban-that-qua-ci` — tệp đo: `thu/kiem-nut.mjs` (E4 lấy kit từ kho cũ cứng, ghép `feature-loop/` theo bố cục cũ)
- ghim: `va-nut-ci-ag-root` — tệp đo: `thu/kiem-ag-root.mjs` (E2 đòi `CLAUDE_PLUGIN_ROOT=$RUNNER_TEMP/kit` đúng từng chữ; E1 đỏ vì dòng 86 của luồng)
- doi-nhanh: `va-bai-o-la-do-ngau-nhien` (E9 `pham-vi.mjs`)
- doi-nhanh: `va-thuoc-ci-ho-so-moi-truong-that` (E3 `--luoi` đòi lưới trước-gộp của cả PR thoát 0)
- doi-nhanh: `che-vung-anh` (E13 `ranh-gioi.mjs`)
- doi-nhanh: `sua-hang-loat` (E15 `ranh-gioi.mjs`)
- doi-nhanh: `va-che-vung-anh` (E10 `ranh-gioi.mjs`)
- doi-nhanh: `va-sua-tren-o` (E10 `ranh-gioi.mjs`)
- doi-nhanh: `va-thong-bao-lead` (E13 `ranh-gioi.mjs`)
- do-ca-hai: `bai-thu-dong-bo-mat-mang`
- do-ca-hai: `bat-rang-buoc-ban-ma`
- do-ca-hai: `cach-goi-rieng`
- do-ca-hai: `chu-san-du-vai`
- do-ca-hai: `chuan-hoa-moi-cua`
- do-ca-hai: `hom-nay-mot-danh-sach-viec`
- do-ca-hai: `luat-an-va-kiem-ro-ri`
- do-ca-hai: `luat-chia-lead`
- do-ca-hai: `luong-gui`
- do-ca-hai: `man-lien-he`
- do-ca-hai: `mau-nhap-va-bai`
- do-ca-hai: `moi-truong-that`
- do-ca-hai: `nang-kit-2-36-0`
- do-ca-hai: `nhap-tac-tu-ke-hoach`
- do-ca-hai: `pooler-che-do-giao-dich`
- do-ca-hai: `tang-5-giao-dien`
- do-ca-hai: `thue-phi`
- do-ca-hai: `trang-nhom-moi-gioi`
- do-ca-hai: `trang-thai-rieng`
- do-ca-hai: `truong-rieng-toi-thieu`
- do-ca-hai: `va-deploy-csdl-tam`
- do-ca-hai: `va-dinh-nghia-doc-lai`
- do-ca-hai: `va-pool-ket-noi`

23 hồ sơ «đỏ cả hai bên» đỏ đúng cùng các eval ở hai bên (phần lớn cần Postgres hay máy chủ đang chạy, `nang-kit-2-36-0` ghim cứng
thẻ 2.36.0). 4 hồ sơ xanh cả hai bên: `va-nut-ci-gitleaks`, `va-ci-secrets-quet-dung-lich-su`, `bai-thu-zalo`, `he-bo-cuc`.
Không hồ sơ nào xanh trên bản sửa mà đỏ trên nhánh chính.

## Out of scope

- Phép thử phiên thật (K6: phiên nạp đủ sáu plugin 3.0, 0 plugin chợ cũ) — máy chạy `chuyen-kho.mjs --phien` trên nhánh
  trước khi gộp và trên nhánh chính sau khi gộp, ghi vào mô tả PR; không phải eval vì tốn một lượt gọi model và chỉ đo
  được máy đang chạy.
- Cài đặt mức người dùng (`~/.claude/settings.json`, sổ cài plugin của máy), gỡ chợ cũ khỏi máy — việc của người, II.4.
- Bật khoá hay luật mới nào của kit 3.0 — mốc cài là `v3.0.0`, không ghép đổi hành vi.
- PR #192 — không chạm.
- Hồ sơ đỏ có từ trước vòng — nợ cũ, không sửa ở đây.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Không chạm bất biến nào của AGENTS.md: không mã sản phẩm, không cơ sở dữ liệu, không lớp `source`.
- Bản vá phần chung (K1–K3) lấy từ `chuyen-kho.mjs --soan`; công cụ không biết bước «Ghim lại» gọi
  `$CLAUDE_PLUGIN_ROOT/feature-loop/…` — dòng ấy sửa tay (AC-1), báo lại cho phiên giữ đợt.

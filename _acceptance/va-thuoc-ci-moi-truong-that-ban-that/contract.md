---
schema_version: 1
feature: "Thước của hồ sơ đã ký moi-truong-that được đưa về bước triển khai mới: bài kiểm CI đo deploy chờ bộ cách ly trên cơ sở dữ liệu tạm, áp migration rồi kiểm nhanh chỉ đọc rồi mới gọi Vercel, giữ đủ tám vế; eval chạy bộ cách ly trên bản thật khai không chạy, trỏ va-deploy-csdl-tam#AC-2; chủ kho tự ghim lại hồ sơ trên máy mình bằng một lệnh."
slug: va-thuoc-ci-moi-truong-that-ban-that
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci, config]
status: draft
design_doc: docs/superpowers/specs/2026-11-07-va-thuoc-ci-moi-truong-that-ban-that-design.md
---

# Acceptance Contract: va-thuoc-ci-moi-truong-that-ban-that

## Context

Phần còn lại của Ngoài-3 hàng `va-deploy-csdl-tam` (chủ kho «mở hợp đồng mới» 06/11), tách khỏi hàng
`va-thuoc-ci-ho-so-moi-truong-that` (PR #185) ngày 07/11. Chỉ chạm vật hồ sơ `_acceptance/moi-truong-that/` và bảng thay
trong thiết kế va-deploy-csdl-tam. Không chạm bất biến nào; máy không chạy gì lên bản thật.

Source input: hàng `va-thuoc-ci-moi-truong-that-ban-that` (`docs/plan/lo-trinh.json`) · ô `opportunity.md`

## Criteria

- **AC-1** — Thước CI của moi-truong-that đạt tám vế trên bước triển khai mới.
  Given `.github/workflows/ci.yml` và `apps/web/vercel.json` của cây,
  When chạy `_acceptance/moi-truong-that/thu/kiem-ci.mjs`,
  Then tám dòng ĐẠT và «KẾT: ĐẠT»: chỉ push main · chờ check, isolation, secrets, gate, ro-ri · chuỗi kết nối bản thật chỉ ở
  bước migrate và kiểm nhanh · migration → kiểm nhanh → deploy hook · không bộ kiểm ghi nào trên bản thật · ngoài ci-ok ·
  tắt tự deploy main · vùng sin1.

- **AC-2** — Thước đỏ khi bước triển khai lệch lại.
  Given năm bản sao ci.yml, mỗi bản sửa một chỗ (deploy chạy bộ kiểm cách ly; chạy bộ kiểm API; bỏ isolation khỏi needs;
  bỏ kiểm nhanh; chuỗi kết nối ở mức job),
  When chạy thước trên từng bản sao,
  Then thước thoát 1 với «HỎNG <vế>» đúng vế ghim của từng ca; bản sao không sửa thì xanh.

- **AC-3** — Eval chạy bộ cách ly trên bản thật khai không chạy, trỏ tiêu chí đã ký đo lại nó.
  Given `_acceptance/moi-truong-that/evals.yaml`,
  When bộ đọc của kit (`chungThayBoi`, `notRunConflicts`) đọc ô E3,
  Then E3 mang `status: not-run`, `superseded_by: va-deploy-csdl-tam#AC-2`, được nhận và không xung đột với báo cáo đã ký;
  con trỏ tới AC không có, thẻ trong thiết kế dính chữ, hay hồ sơ thay chưa ký thì đỏ đúng điều kiện.

## Coverage

Trục: thước {E7 kiem-ci, E3 cach_ly_that} × việc {sửa tám vế, khai thay bởi} × chiều {xanh trên vật lành, đỏ trên vật lệch}.
Thước CE: ADR-0009 «Sửa đổi 06/11 — bộ kiểm cách ly chạy trên cơ sở dữ liệu tạm»; luật eval thay bởi (GUIDE kit 2.24).

## Đường đo

- Ngưỡng ô cơ hội «thước ĐẠT tám vế, đỏ khi deploy chạy lại bộ kiểm ghi» → AC-1, AC-2. «Lưới trước gộp của moi-truong-that
  xanh sau khi chủ kho ghim lại» → đọc job `gate` của PR sau lệnh ghim lại của chủ kho (không phải AC máy: lệnh cần biến bản
  thật). Timebox chưa khai.

## Out of scope

- Sửa chữ AC-3, AC-7 trong hợp đồng đã ký của moi-truong-that — ADR-0009 «Sửa đổi 06/11» là nơi nói bước mới.
- Sửa executor `cach_ly_that` trong `_acceptance/config.yaml`; chạy bất cứ gì lên bản thật từ máy.

## Notes

- Ghim lại moi-truong-that là việc của chủ kho (lệnh ở thiết kế, mục 3). Trước lệnh ấy, lưới trước gộp báo moi-truong-that
  cũ và PR của hàng chờ.

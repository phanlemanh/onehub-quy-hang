---
schema_version: 2
feature_slug: loai-hinh-trong-cach-goi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 82586b82d139bcefaada34c2692d742d0b6c53c3
human_signoff:
---

# Evidence Report: loai-hinh-trong-cach-goi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3c | AC-3 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | script | PASS |
| E9 | AC-9 | ui-check | PASS |
| E10 | AC-1 | script | PASS |
| E11 | AC-4 | script | PASS |
| E12 | AC-5 | script | PASS |
| E13 | AC-6 | script | PASS |
| E14 | AC-1 | script | PASS |
| E15 | AC-4 | script | PASS |

## Evidence

Chạy lại ở round 2 (delta chạm paths của các eval này):

- eval: E4
  run_id: minted-loai-hinh-trong-cach-goi-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-09T01:39:34Z
  output: |
    ℹ duration_ms 4666.022708

- eval: E5
  run_id: minted-loai-hinh-trong-cach-goi-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-09T01:39:34Z
  output: |
    ℹ duration_ms 4666.022708

- eval: E6
  run_id: minted-loai-hinh-trong-cach-goi-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-09T01:39:34Z
  output: |
    ℹ duration_ms 4666.022708

- eval: E7b
  run_id: minted-loai-hinh-trong-cach-goi-E7b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-09T01:39:34Z
  output: |
    ℹ duration_ms 4666.022708

- eval: E10
  run_id: minted-loai-hinh-trong-cach-goi-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-09T01:39:34Z
  output: |
    kiểm kiểu mọi gói xanh

- eval: E11
  run_id: minted-loai-hinh-trong-cach-goi-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-09T01:39:34Z
  output: |
    14 tệp giao diện ngoài bản đồ

- eval: E15
  run_id: minted-loai-hinh-trong-cach-goi-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.floor
  verified_at: 2026-11-09T01:39:34Z
  output: |
    không mã màu thô trên tệp giao diện vòng chạm

- eval: E9
  run_id: minted-loai-hinh-trong-cach-goi-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T01:39:34Z
  screenshot: evidence/E9-cach-goi.png
  observed: |
    E9-cach-goi.png: admin Cách gọi screen, rows "Loại hình · Căn hộ" = "Căn cao tầng", "Loại hình · Nhà phố" = "Liền kề", Biệt thự/Đất placeholders default; toast "Đã lưu cách gọi".
    E9-bang-hang.png: Bảng hàng, Loại hình filter dropdown lists Mọi loại hình, Biệt thự, Căn cao tầng, Chưa rõ, Đất, Liền kề (no Nhà phố); column cells show "Liền kề".
    E9-ho-so.png: side profile of a nhà phố, header "... · Liền kề", THUỘC TÍNH CĂN row Loại hình = Liền kề. E9-toan-man.png: full-screen profile A-01.04, breadcrumb "Toà A · Căn cao tầng", Loại hình = Căn cao tầng.
    E9-hom-nay.png: Hôm nay with open profile column, Loại hình = Liền kề. E9-tra-ve.png: after reset, Bảng hàng column shows "Nhà phố" again, no "Liền kề". A Next dev "1 Issue" badge appears in some frames (dev overlay, not asserted). All match Expected.
  network_observed: n-a (driver)

Mang từ round 1 (delta không chạm paths của eval):

- eval: E1
  run_id: minted-loai-hinh-trong-cach-goi-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-09T01:30:13Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E1b
  run_id: minted-loai-hinh-trong-cach-goi-E1b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-09T01:30:13Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-loai-hinh-trong-cach-goi-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-09T01:30:13Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3c
  run_id: minted-loai-hinh-trong-cach-goi-E3c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-09T01:30:13Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-loai-hinh-trong-cach-goi-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-09T01:30:13Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3b
  run_id: minted-loai-hinh-trong-cach-goi-E3b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-09T01:30:13Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-loai-hinh-trong-cach-goi-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-09T01:30:13Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-loai-hinh-trong-cach-goi-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-09T01:30:13Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8b
  run_id: minted-loai-hinh-trong-cach-goi-E8b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-09T01:30:13Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-loai-hinh-trong-cach-goi-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-09T01:30:13Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-loai-hinh-trong-cach-goi-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-09T01:30:13Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E14
  run_id: minted-loai-hinh-trong-cach-goi-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-09T01:30:13Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-loai-hinh-trong-cach-goi-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-09T01:39:34Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-loai-hinh-trong-cach-goi-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-09T01:39:34Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-loai-hinh-trong-cach-goi-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-09T01:39:34Z

- cmd: npm run test:hooks
  run_id: minted-loai-hinh-trong-cach-goi-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-09T01:39:34Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-loai-hinh-trong-cach-goi-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-09T01:39:34Z

- cmd: npm run lint
  run_id: minted-loai-hinh-trong-cach-goi-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-09T01:39:34Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi).

Baseline khong do round nay: moi eval ghi baseline n-a. Danh sách eval không-phân-biệt (xanh cả trên HEAD lẫn baseline, theo lần đo round 1), cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý:

- npm test -w @quy-hang/core: E1, E3, E8
- npm test -w @quy-hang/web: E1b, E3b, E4, E5, E6, E7b
- db:migrate và db:test (cổng 5576): E2, E3c, E7
- npm run test:ro-ri: E8b
- npm run typecheck: E10
- design-floor-khuon --kiem: E11, E12, E13, E14
- design-floor-s4: E15

## Variance

none — mọi eval chạy một lần, xác định (runs 1), không có phương sai.

## Iterations

Round 1: REJECT — hai phát hiện trong hợp đồng AC-5 (đầu cột hồ sơ lấy loại hình bằng so tiêu đề dòng, tên trường Loại hình trùng tiêu đề dòng khác làm đầu cột sai). Trả về sửa; lượt sửa thêm ca kiểm và bằng chứng lượt 1.
Round 2: PASS — E4, E5, E6, E7b, E9, E10, E11, E15 và sáu lệnh suite chạy lại xanh; các eval còn lại mang từ round 1 vì delta không chạm paths của chúng.

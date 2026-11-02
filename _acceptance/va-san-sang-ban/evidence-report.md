---
schema_version: 2
feature_slug: va-san-sang-ban
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1140b9aa518b8e3f56b77040089e6a6e739548de
human_signoff: Manh Phan 2026-11-02
---

# Evidence Report: va-san-sang-ban

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-va-san-sang-ban-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T02:30:44Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 313.291292

- eval: E2
  run_id: minted-va-san-sang-ban-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T02:30:44Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 313.291292

- eval: E3
  run_id: minted-va-san-sang-ban-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T02:30:44Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 313.291292

- eval: E4
  run_id: minted-va-san-sang-ban-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T02:30:44Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 313.291292

- eval: E5
  run_id: minted-va-san-sang-ban-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T02:30:44Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 313.291292

- eval: E6
  run_id: minted-va-san-sang-ban-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T02:30:44Z
  screenshot: evidence/E6-1-thieu.png
  observed: |
    E6-1-thieu.png: cột hồ sơ A-01.01 (Chưa đủ để rao) có hộp «Còn thiếu:» gồm «Ảnh thật», «Pháp lý · điền ở Bảng hàng»; ô Pháp lý ghi «Chưa có · điền ở Bảng hàng». Khớp khung 1.
    E6-2-can-khac.png: chuyển sang A-01.02, không có «Còn thiếu:», không ô nào ghi «Chưa có» (đo bằng DOM). E6-3-quay-lai.png: chọn lại A-01.01, nút «Sẵn sàng bán» còn nguyên, không có «Còn thiếu:». Khớp khung 2 và 3.
    E6-4-dien-phap-ly.png: bấm lại rồi điền Pháp lý, hộp «Còn thiếu:» chỉ còn «Ảnh thật» và «Ảnh thật cập nhật khi bấm lại»; ô Pháp lý của cột và của dòng trong lưới đều ghi «pink_book» (giá trị thô chưa dịch nhãn, khác «[Mẫu] Sổ hồng» ở hàng mẫu). Khớp khung 4 về kết quả.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-san-sang-ban-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-02T02:30:44Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-san-sang-ban-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-02T02:30:44Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-san-sang-ban-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-02T02:30:44Z

- cmd: npm run test:hooks
  run_id: minted-va-san-sang-ban-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-02T02:30:44Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-san-sang-ban-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-02T02:30:44Z

- cmd: npm run typecheck
  run_id: minted-va-san-sang-ban-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-02T02:30:44Z

- cmd: npm run lint
  run_id: minted-va-san-sang-ban-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-02T02:30:44Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline): npm test -w @quy-hang/web, gồm E1, E2, E3, E4, E5. Cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý.

Baseline không đo: E6 (ui-check, không chạy được trên mã cũ).

## Variance

none — mọi eval chạy một lần, xác định, không có mục phương sai.

## Iterations

Round 1: mọi eval xanh (E1-E6), 7 lệnh suite xanh; chưa có vòng trả về triển khai.


### Re-pin lần 1 — 2026-11-02, do hoá cũ do gộp nhánh chính vào nhánh sau lượt chấm
run_id: repin-20261102T043453Z-92045
sha: 1140b9aa518b8e3f56b77040089e6a6e739548de · suites: 7 lệnh exit 0 · evals: 5/5 eval máy đạt kỳ vọng · ngoài làn máy: E6 · AC không có chốt máy: AC-6

---
schema_version: 2
feature_slug: nap-mau-co-anh
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 074e1531df16f6c5a6f48adcf746da2e080768ce
human_signoff:
---

# Evidence Report: nap-mau-co-anh

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS (carry-forward từ round 1) |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | judgment | PASS (đề xuất của hội đồng, chờ người chốt ở Cổng 2) |

Lệnh fail không gắn eval nào: không có. Mọi lệnh máy của round 2 chạy một lần và qua. Verdict tổng là PENDING-JUDGMENT vì E9 là mục judgment còn chờ người chốt (human_override để trống).

## Evidence

- eval: E1
  run_id: minted-nap-mau-co-anh-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nap_mau
  verified_at: 2026-11-02T07:35:51Z
  output: |
    Lệnh chung với E3, E4, E5, E6, E7 (bộ kiểm packages/db/seed/*.test.ts), chạy một lần và qua.
    ℹ duration_ms 17370.8835

- eval: E2
  run_id: minted-nap-mau-co-anh-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.du_lieu_mau_tsx
  verified_at: 2026-11-02T07:27:35Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-nap-mau-co-anh-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nap_mau
  verified_at: 2026-11-02T07:35:51Z
  output: |
    Lệnh chung với E1, E4, E5, E6, E7, chạy một lần và qua.
    ℹ duration_ms 17370.8835

- eval: E4
  run_id: minted-nap-mau-co-anh-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nap_mau
  verified_at: 2026-11-02T07:35:51Z
  output: |
    Lệnh chung với E1, E3, E5, E6, E7, chạy một lần và qua.
    ℹ duration_ms 17370.8835

- eval: E5
  run_id: minted-nap-mau-co-anh-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nap_mau
  verified_at: 2026-11-02T07:35:51Z
  output: |
    Lệnh chung với E1, E3, E4, E6, E7, chạy một lần và qua.
    ℹ duration_ms 17370.8835

- eval: E6
  run_id: minted-nap-mau-co-anh-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nap_mau
  verified_at: 2026-11-02T07:35:51Z
  output: |
    Lệnh chung với E1, E3, E4, E5, E7, chạy một lần và qua.
    ℹ duration_ms 17370.8835

- eval: E7
  run_id: minted-nap-mau-co-anh-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nap_mau
  verified_at: 2026-11-02T07:35:51Z
  output: |
    Lệnh chung với E1, E3, E4, E5, E6, chạy một lần và qua.
    ℹ duration_ms 17370.8835

- eval: E8
  run_id: minted-nap-mau-co-anh-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nap_mau_yml
  verified_at: 2026-11-02T07:35:51Z
  output: |
    ℹ duration_ms 314.1755

- eval: E9
  judged_by: judge panel đề xuất (3 góc nhìn, context sạch)
  verdict: PASS
  rationale: Đề xuất PASS khi đủ bốn vế (a), (b), (c), (d) và không có giá trị khoá. Cả ba góc nhìn đều thấy mục «Bản thật» của README nói đủ bốn ý và chỉ nêu tên biến.
  human_override:  # chi nguoi ghi

  Phiếu từng góc nhìn:
  - domain-correctness: PASS — README mục «Bản thật» nói đủ bốn ý. (a) Mỗi căn từng lên Đang bán có đúng một ảnh vẽ bằng mã, «không phải ảnh thật của ai». (b) Bước một lần thêm đủ ba secret ở environment `production` của GitHub, cùng giá trị Vercel Production. (c) Có câu «Thiếu secret kho ảnh thì nút dừng trước khi ghi với lời báo «kho ảnh: thiếu …»». (d) «Gỡ xoá cả byte ảnh mẫu trên kho». README chỉ nêu tên biến, không chứa giá trị khoá nào.
  - operational-feasibility: PASS — Mục «Bản thật» của README nói đủ bốn ý. (a) Mỗi căn mẫu từng lên Đang bán (Đang bán, Đã cọc, Đã bán, Tạm giữ) có đúng một ảnh vẽ bằng mã, không phải ảnh thật của ai. (b) Bước 1 thêm ba secret `STORAGE_S3_ACCESS_KEY`, `STORAGE_S3_SECRET_KEY`, `STORAGE_S3_ENDPOINT` ở environment `production` của GitHub, cùng giá trị Vercel Production. (c) Có câu nói thiếu secret kho ảnh thì nút dừng trước khi ghi, lời báo «kho ảnh: thiếu …». (d) Gỡ xoá cả byte ảnh mẫu trên kho, và README chỉ nêu tên biến, không có giá trị khoá nào.
  - spec-alignment: PASS — README.md (đoạn «Ảnh mẫu» và «Bản thật», bước 1) nói đủ cả bốn ý. (a) Mỗi căn từng lên Đang bán có đúng một ảnh vẽ bằng mã, không phải ảnh thật của ai. (b) Bước một lần thêm ba secret STORAGE_S3_ACCESS_KEY, STORAGE_S3_SECRET_KEY, STORAGE_S3_ENDPOINT ở environment production, cùng giá trị Vercel Production. (c) Thiếu secret kho ảnh thì nút dừng trước khi ghi, với lời báo «kho ảnh: thiếu …». (d) Gỡ xoá cả byte ảnh mẫu trên kho. Tệp chỉ có tên biến, không có giá trị khoá nào.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-nap-mau-co-anh-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-02T07:35:51Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-nap-mau-co-anh-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-02T07:35:51Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-nap-mau-co-anh-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-02T07:35:51Z

- cmd: npm run test:hooks
  run_id: minted-nap-mau-co-anh-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-02T07:35:51Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-nap-mau-co-anh-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-02T07:35:51Z

- cmd: npm run typecheck
  run_id: minted-nap-mau-co-anh-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-02T07:35:51Z

- cmd: npm run lint
  run_id: minted-nap-mau-co-anh-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-02T07:35:51Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval không phân biệt (xanh trên cả bản chính lẫn bản gốc diffBase, theo số đo round 1; chứng minh bộ kiểm chứ chưa chứng minh tính năng). Cần viết lại để khẳng định hành vi mới, hoặc xác nhận đó là hàng rào hồi quy có chủ ý:

- E2 (lệnh `node --env-file-if-exists=.env.local --import tsx --test "packages/db/seed/*.test.mjs"`): green trên bản gốc ở round 1.
- E8 (lệnh `node --test packages/db/seed/nap-mau-yml.test.mjs`): green trên bản gốc ở round 1.

Trường baseline của từng khối eval ở round 2 ghi n-a vì round này không đo lại. Sáu eval E1, E3, E4, E5, E6, E7 đều red trên bản gốc ở round 1 nên có phân biệt.

## Variance

none — mọi eval nhiều lần chạy đều đồng đều (không eval nào chạy nhiều hơn một lần).

## Iterations

Round 1: E1, E3, E4, E5, E6, E7 hỏng — ở đuôi kết quả, ca E6 và E7 dừng ở điều kiện đầu «Postgres dãy đang có sàn mẫu — gỡ trước khi chạy bộ kiểm» (còn sàn mẫu mã ea69bb7f-be0a-47c7-b589-45bb9a36450d); bốn eval còn lại chưa thấy lỗi riêng. Verdict REJECT, trả lại khâu thi công.
Round 2: commit 074e153 (hai tệp kiểm sàn mẫu nối đuôi bằng khoá tư vấn, ba chỗ chặt hơn theo lượt chấm r1). E1, E3, E4, E5, E6, E7, E8 và bảy lệnh suite đều qua; E2 mang sang từ round 1 vì delta không chạm paths của eval. E9 còn chờ người chốt ở Cổng 2 nên verdict là PENDING-JUDGMENT.

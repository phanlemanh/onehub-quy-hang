---
schema_version: 2
feature_slug: va-anh-ban-that
verdict: REJECT
failed_evals: ["E6"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 50d55eb1a67956b4f295dded0649e11de7a02d93
human_signoff:
---

# Evidence Report: va-anh-ban-that

Round 2. Lệnh ui-check:E6 không đạt và không gắn thêm eval nào ngoài E6.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E1c | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | ui-check | REJECT |

## Evidence

- eval: E1
  run_id: minted-va-anh-ban-that-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T13:14:32Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 4787.000125

- eval: E2
  run_id: minted-va-anh-ban-that-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T13:14:32Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 4787.000125

- eval: E3
  run_id: minted-va-anh-ban-that-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T13:14:32Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 4787.000125

- eval: E4
  run_id: minted-va-anh-ban-that-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T13:14:32Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 4787.000125

- eval: E1b
  run_id: minted-va-anh-ban-that-E1b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-11-01T13:14:32Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 60493.918209

- eval: E1c
  run_id: minted-va-anh-ban-that-E1c-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T13:14:32Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 230.882167

- eval: E5
  run_id: minted-va-anh-ban-that-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T13:14:32Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 230.882167

- eval: E6
  run_id: minted-va-anh-ban-that-E6-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T13:14:32Z
  screenshot: evidence/E6-step1.png
  observed: |
    E6-step1.png (read): unit page A-06.01 "Dang ban", Anh section, tab "Gui duoc (1)", one large noise image tile with "Bia" badge, caption "Anh that · 01/11/2026" and a "..." menu. Matches Expected step 1 (large image entered the Gui duoc tray).
    E6-step2.png (read, taken right after confirming Xoa with DELETE forced to 500): same page, tab "Gui duoc (1)", the noise image tile is still there, but there is NO error notice anywhere (no "Khong xoa anh duoc — thu lai" toast, no banner). Expected requires the notice to be seen; it is absent, so step 2 contradicts Expected.
  network_observed: clean
  output: |
    Frames: E6-step1.png, E6-step2.png; network: E6-network.txt (all in _acceptance/va-anh-ban-that/evidence/).
    Dung-h (port 3482, chrome-devtools, 1440x900), PNG 4,874,713 bytes tải qua ô "Chon anh" (không phải kéo thả thật).
    Bước 1 đạt: tab "Gui duoc (0)" thành "Gui duoc (1)"; ba lời gọi tải đều thành công; ô ảnh có nhãn "Bia".
    Bước 2 không đạt: xoá bị ép lỗi bằng initScript; ảnh vẫn còn (đúng) nhưng chữ "Khong xoa anh duoc — thu lai" KHÔNG hiện. DOM không có [data-sonner-toast] lẫn [data-sonner-toaster].
    Nguyên nhân (grep): muc-anh.tsx gọi toast.error trong lamViec, nhưng Toaster chỉ gắn ở inventory/cell-edit/tren-o.tsx, không có trên /units/[code] nên toast.error không có chỗ hiển thị.
    Lần thử đầu (đặt override sau khi tải trang) không chặn được, DELETE thật trả thành công và ảnh bị xoá; đã bỏ và làm lại bằng initScript.
    Ngoài lỗi cố ý đã chèn, không có lỗi mạng hay lỗi console.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-anh-ban-that-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-01T13:14:32Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-anh-ban-that-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-01T13:14:32Z

- cmd: npm run test:hooks
  run_id: minted-va-anh-ban-that-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-01T13:14:32Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-anh-ban-that-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-01T13:14:32Z

- cmd: npm run typecheck
  run_id: minted-va-anh-ban-that-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-01T13:14:32Z

- cmd: npm run lint
  run_id: minted-va-anh-ban-that-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-01T13:14:32Z

Lệnh không gắn eval mà không đạt: ui-check:E6 (thuộc E6, đã nêu ở trên).

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (đạt cả trên HEAD lẫn baseline; chứng minh harness chứ chưa chứng minh tính năng — nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- `npm run db:migrate && npm run db:test` — E1, E2, E3, E4
- `npm test -w @quy-hang/api` — E1b
- `npm test -w @quy-hang/web` — E1c, E5

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval xanh; verdict PASS.
Round 2: E6 failed — sau khi xoá lỗi, thông báo «Không xoá ảnh được — thử lại» không hiện vì Toaster không gắn trên trang /units/[code]; ảnh vẫn còn đúng. Returned to implementation.


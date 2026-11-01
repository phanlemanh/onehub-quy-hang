---
schema_version: 2
feature_slug: va-anh-ban-that
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8c30f150c07da2f36286f65fb8e1d6bcf2beb236
human_signoff:
---

# Evidence Report: va-anh-ban-that

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E1c | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-va-anh-ban-that-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T13:00:56Z
  output: |
    npm run db:migrate && npm run db:test chạy xong, bộ kiểm cách ly xanh (E1–E4 chung một lần chạy).

- eval: E1b
  run_id: minted-va-anh-ban-that-E1b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-11-01T13:00:56Z
  output: |
    npm test -w @quy-hang/api chạy xong, toàn bộ ca xanh.

- eval: E1c
  run_id: minted-va-anh-ban-that-E1c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T13:00:56Z
  output: |
    npm test -w @quy-hang/web chạy xong, toàn bộ ca xanh (E1c và E5 chung một lần chạy).

- eval: E2
  run_id: minted-va-anh-ban-that-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T13:00:56Z
  output: |
    Cùng lần chạy bộ kiểm cách ly với E1.

- eval: E3
  run_id: minted-va-anh-ban-that-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T13:00:56Z
  output: |
    Cùng lần chạy bộ kiểm cách ly với E1.

- eval: E4
  run_id: minted-va-anh-ban-that-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T13:00:56Z
  output: |
    Cùng lần chạy bộ kiểm cách ly với E1.

- eval: E5
  run_id: minted-va-anh-ban-that-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T13:00:56Z
  output: |
    Cùng lần chạy kiểm web với E1c.

- eval: E6
  run_id: minted-va-anh-ban-that-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T13:00:56Z
  screenshot: evidence/E6-step1.png
  observed: |
    E6-step1.png (trang /units/A-06.01, 1440x900, giao dien toi): muc ANH, tab «Gui duoc (1)» dang chon, «Tu co tu ma», «Noi bo (0)»; the anh ca nhieu mau (nhieu ngau nhien) voi nhan «Bia», chu «Anh that · 01/11/2026», nut «Chon anh». Khop Expected buoc 1: anh lon vao ngan Gui duoc. E6-step2.png (/inventory, cot ho so ben phai canh Bang hang): tab van «Gui duoc (1)», the anh nhieu mau van con nhan «Bia», o goc duoi phai toast do «Khong xoa anh duoc — thu lai». Khop Expected buoc 2: thong bao loi xoa va anh con.
  network_observed: clean
  output: |
    Chặn DELETE bằng initScript trình duyệt, giả lỗi 500; bấm Xoá khỏi căn, hộp xác nhận, Xoá; toast «Không xoá ảnh được — thử lại» có trong DOM; tab vẫn «Gửi được (1)», thẻ ảnh còn.
    Lưu ý thiết kế: trang riêng /units/A-06.01 không gắn Toaster nên không hiện thông báo lỗi ở đó; Toaster nằm ở cột hồ sơ trên /inventory. Luồng thật có thông báo nên assertion đạt.
    Lần chạy đầu DELETE chưa bị chặn nên ảnh bị xoá; đã dựng lại từ đầu, khung cuối là lần sạch. Console không có lỗi. Đã xoá ảnh tạm và tắt server dev.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-anh-ban-that-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-01T13:00:56Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-anh-ban-that-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-01T13:00:56Z

- cmd: npm run test:hooks
  run_id: minted-va-anh-ban-that-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-01T13:00:56Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-anh-ban-that-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-01T13:00:56Z

- cmd: npm run typecheck
  run_id: minted-va-anh-ban-that-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-01T13:00:56Z

- cmd: npm run lint
  run_id: minted-va-anh-ban-that-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-01T13:00:56Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline), cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý:
- npm test -w @quy-hang/api: E1b
- npm test -w @quy-hang/web: E1c, E5

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval xanh; verdict PASS.


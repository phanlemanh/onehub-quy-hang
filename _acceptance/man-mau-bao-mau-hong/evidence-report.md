---
schema_version: 2
feature_slug: man-mau-bao-mau-hong
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c33fc9b70432639972e9b849c11e55c3d9124424
human_signoff:
---

# Evidence Report: man-mau-bao-mau-hong

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E5c | AC-5 | test | PASS |
| E6 | AC-6 | script | PASS |
| E6b | AC-6 | test | PASS |
| E6c | AC-6 | script | PASS |
| E7 | AC-7 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-man-mau-bao-mau-hong-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-07T21:52:30Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 5931.530333

- eval: E2
  run_id: minted-man-mau-bao-mau-hong-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-07T21:52:30Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 5931.530333

- eval: E3
  run_id: minted-man-mau-bao-mau-hong-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-07T21:52:30Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 5931.530333

- eval: E4
  run_id: minted-man-mau-bao-mau-hong-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-07T21:52:30Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 5931.530333

- eval: E5b
  run_id: minted-man-mau-bao-mau-hong-E5b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-07T21:52:30Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 5931.530333

- eval: E6b
  run_id: minted-man-mau-bao-mau-hong-E6b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-07T21:52:30Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 5931.530333

- eval: E5
  run_id: minted-man-mau-bao-mau-hong-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T21:52:30Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 135651.247125

- eval: E5c
  run_id: minted-man-mau-bao-mau-hong-E5c-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T21:52:30Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 135651.247125

- eval: E6
  run_id: minted-man-mau-bao-mau-hong-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-07T21:52:30Z
  output: |
    npm run test:ro-ri
    ℹ duration_ms 1637.704167

- eval: E6c
  run_id: minted-man-mau-bao-mau-hong-E6c-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-07T21:52:30Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    6 tệp giao diện ngoài bản đồ

- eval: E7
  run_id: minted-man-mau-bao-mau-hong-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-07T21:52:30Z
  screenshot: evidence/E7-step1.png
  observed: |
    Đã mở và đọc cả 5 frame. step1.png (1280x800): tab Mẫu bảng hàng, đầu tab có khối báo «Mẫu đã lưu có 2 chỗ không đọc được» với hai gạch đầu dòng (Mẫu thứ 2 bị bỏ vì tên trùng; Mẫu thứ 3 bỏ cột Người giữ — cột này không ra ngoài được) và câu «Lần lưu kế sẽ bỏ hẳn những chỗ này; các mẫu khác giữ nguyên.»; bảng có đúng 2 mẫu [Tên] gửi đội và [Tên] gửi khách. step2.png: tab Mẫu bài, khối báo «1 chỗ không đọc được» với câu chung «Mẫu bài của một kênh không dùng được bị bỏ.»; khối Zalo còn lời mở đầu «Chào nhóm [Tên sàn]» và lời kết «Gọi em 0900 000 001»; Facebook trống, vì không có lời đã lưu nào cho Facebook. step3.png: sau Sửa mẫu đầu rồi Lưu, khối cảnh báo mất, chỉ còn thông báo xanh «Đã lưu mẫu»; bảng vẫn đủ 2 mẫu cùng tên. step4.png (chụp toàn trang, đã cuộn xuống): sau khi sửa lời Zalo rồi Lưu, xem trước Zalo hiện lời mới, ô Lời kết giữ nguyên; kiểm bằng DOM thì khối cảnh báo của tab đã mất (không còn chuỗi «không đọc được») và Facebook vẫn nguyên (rỗng, như trước). step5.png (375x812): khối báo 2 chỗ nằm gọn trong khung (left 21, right 354), câu xuống dòng, không tràn ngang.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-man-mau-bao-mau-hong-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-07T21:52:30Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-man-mau-bao-mau-hong-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-07T21:52:30Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-man-mau-bao-mau-hong-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-07T21:52:30Z

- cmd: npm run test:hooks
  run_id: minted-man-mau-bao-mau-hong-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-07T21:52:30Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-man-mau-bao-mau-hong-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-07T21:52:30Z

- cmd: npm run typecheck
  run_id: minted-man-mau-bao-mau-hong-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-07T21:52:30Z

- cmd: npm run lint
  run_id: minted-man-mau-bao-mau-hong-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-07T21:52:30Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Eval khong-phan-biet (xanh tren ca HEAD lan baseline, theo lan do round 1; nen viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y):
- npm test -w @quy-hang/web: E1, E2, E3, E4, E5b, E6b
- npm run db:migrate && npm run db:test: E5, E5c
- npm run test:ro-ri: E6
- design-floor-khuon.mjs --kiem --root .: E6c

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả eval đều đạt; không có eval nào hỏng.
Round 2: tất cả eval đều đạt sau khi siết bốn bài đo của màn; không có eval nào hỏng.

### Re-pin lần 1 — 2026-11-07, do gộp main
run_id: repin-20261107T225228Z-63182
sha: c33fc9b70432639972e9b849c11e55c3d9124424 · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E7 · AC không có chốt máy: AC-7 · suite chạy ở môi trường giống CI (biến rỗng: DATABASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, APP_URL)

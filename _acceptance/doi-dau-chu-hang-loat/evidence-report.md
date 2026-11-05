---
schema_version: 2
feature_slug: doi-dau-chu-hang-loat
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: df8a9658ddc066c38401cd2db2b0315c77bdd21a
human_signoff:
---

# Evidence Report: doi-dau-chu-hang-loat

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E1c | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E4c | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |
| E8b | AC-1 | script | PASS |
| E9 | AC-9 | ui-check | PASS |
| E9b | AC-4 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-doi-dau-chu-hang-loat-E1-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T05:09:36Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 699.2205

- eval: E1b
  run_id: minted-doi-dau-chu-hang-loat-E1b-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T05:09:36Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2763.629083

- eval: E4b
  run_id: minted-doi-dau-chu-hang-loat-E4b-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T05:09:36Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2763.629083

- eval: E1c
  run_id: minted-doi-dau-chu-hang-loat-E1c-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:09:36Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 70727.824875

- eval: E2
  run_id: minted-doi-dau-chu-hang-loat-E2-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:09:36Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 70727.824875

- eval: E3
  run_id: minted-doi-dau-chu-hang-loat-E3-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:09:36Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 70727.824875

- eval: E4
  run_id: minted-doi-dau-chu-hang-loat-E4-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:09:36Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 70727.824875

- eval: E5
  run_id: minted-doi-dau-chu-hang-loat-E5-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:09:36Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 70727.824875

- eval: E6
  run_id: minted-doi-dau-chu-hang-loat-E6-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:09:36Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 70727.824875

- eval: E7
  run_id: minted-doi-dau-chu-hang-loat-E7-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:09:36Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 70727.824875

- eval: E4c
  run_id: minted-doi-dau-chu-hang-loat-E4c-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web_db
  verified_at: 2026-11-05T05:09:36Z
  output: |
    npm run test:db -w @quy-hang/web
    ℹ duration_ms 9082.982583

- eval: E8
  run_id: minted-doi-dau-chu-hang-loat-E8-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.script.doi_dau_chu_tai_lieu
  verified_at: 2026-11-05T05:09:36Z
  output: |
    node --test "_acceptance/doi-dau-chu-hang-loat/thu/*.test.mjs"
    ℹ duration_ms 139.304083

- eval: E8b
  run_id: minted-doi-dau-chu-hang-loat-E8b-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T05:09:36Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    4 tệp giao diện ngoài bản đồ

- eval: E9
  run_id: minted-doi-dau-chu-hang-loat-E9-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T05:09:36Z
  screenshot: evidence/E9-hop-hoi.png
  observed: |
    E9-hop-hoi.png: bảng hàng 1440x900 mờ phía sau, hộp «Đổi đầu chủ 5 căn», mô tả «Mọi căn cùng chủ nhà đi theo · 2 liên hệ chủ nhà đổi người giữ», ô chọn [Mẫu] Đầu chủ 2, liệt kê đủ 5 căn (A-04.06, A-10.05, A-06.03, A-08.03, A-11.02) đều «đang giữ: [Mẫu] Đầu chủ 1», 3 căn cuối gắn «cùng chủ nhà»; nút Thôi / Đổi đầu chủ; không thấy tên hay số chủ nhà. E9-sau-doi.png: trang không tải lại, bảng hàng 26 căn, toast «Đã đổi đầu chủ 5 căn, 2 liên hệ» kèm nút «Hoàn tác»; chưa có cột Đầu chủ. E9-hoan-tac.png: toast «Đã trả lại người giữ cũ: 7 mục (căn và liên hệ)». E9-dau-chu.png: đầu chủ (DA) đăng nhập, tích 1 căn, thanh lệnh chỉ có «Đổi trạng thái», «Đánh dấu đã gọi», «Bỏ chọn», không có «Đổi đầu chủ». Tất cả khớp Expected.
  network_observed: n-a (driver)

- eval: E9b
  run_id: minted-doi-dau-chu-hang-loat-E9b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T05:09:36Z
  screenshot: evidence/E9b-step1.png
  observed: |
    E9b-step1.png (sau doi): bang hang 26 can, hop xac nhan dang mo mo/dong dan o sau lop phu, o goc duoi phai hien toast "Da doi dau chu 5 can, 2 lien he" kem nut "Hoan tac"; trang khong tai lai. E9b-step2.png (sau Hoan tac): bang hang sach, toast "Da tra lai nguoi giu cu: 7 muc (can va lien he)". Khong con hop. Frame khop voi so lieu Postgres ben duoi.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-doi-dau-chu-hang-loat-SUITE-npm_test_w_quy_hang_api-r4
  exit_code: 0
  verified_at: 2026-11-05T05:09:36Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-doi-dau-chu-hang-loat-SUITE-npm_test_w_quy_hang_connect-r4
  exit_code: 0
  verified_at: 2026-11-05T05:09:36Z

- cmd: npm run test:hooks
  run_id: minted-doi-dau-chu-hang-loat-SUITE-test_hooks-r4
  exit_code: 0
  verified_at: 2026-11-05T05:09:36Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-doi-dau-chu-hang-loat-SUITE-npm_test_w_quy_hang_ui_lint-r4
  exit_code: 0
  verified_at: 2026-11-05T05:09:36Z

- cmd: npm run typecheck
  run_id: minted-doi-dau-chu-hang-loat-SUITE-typecheck-r4
  exit_code: 0
  verified_at: 2026-11-05T05:09:36Z

- cmd: npm run lint
  run_id: minted-doi-dau-chu-hang-loat-SUITE-lint-r4
  exit_code: 0
  verified_at: 2026-11-05T05:09:36Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline), cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý:

- npm test -w @quy-hang/core: E1
- npm test -w @quy-hang/web: E1b, E4b
- npm run db:migrate && npm run db:test: E1c, E2, E3, E4, E5, E6, E7
- npm run test:db -w @quy-hang/web: E4c
- node --test "_acceptance/doi-dau-chu-hang-loat/thu/*.test.mjs": E8
- design-floor-khuon.mjs --kiem --root .: E8b

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lượt chấm đầu, đã trả về triển khai.
Round 2: lượt chấm 2, đã trả về triển khai (bài đo quét chủ nhà thật có đối chứng, đủ ba hàm × bốn vai).
Round 3: REJECT — lỗi kiểm kiểu ở test và ô không tải lại. Returned to implementation.
Round 4: tất cả eval PASS, không còn eval đỏ; verdict PASS.

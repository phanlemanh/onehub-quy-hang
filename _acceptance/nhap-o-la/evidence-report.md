---
schema_version: 2
feature_slug: nhap-o-la
verdict: REJECT
failed_evals: [E4c, E4b]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8dcf71390891bfd7b7bd100525d2c882c043e9ce
human_signoff:
---

# Evidence Report: nhap-o-la

Vòng 1. Hai eval trượt: E4c (bộ kiểm cơ sở dữ liệu của màn Nhập) và E4b (kiểm giao diện bằng ảnh). Ngoài ra bộ kiểm của gói ui-lint đỏ ở một lệnh suite không gắn eval nào.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | ui-check | FAIL |
| E4c | AC-4 | test | FAIL |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-nhap-o-la-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T06:01:44Z
  output: |
    npm test -w @quy-hang/core
    duration_ms 1130.93

- eval: E3
  run_id: minted-nhap-o-la-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T06:01:44Z
  output: |
    npm test -w @quy-hang/core
    duration_ms 1130.93

- eval: E8
  run_id: minted-nhap-o-la-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T06:01:44Z
  output: |
    npm test -w @quy-hang/core
    duration_ms 1130.93

- eval: E1b
  run_id: minted-nhap-o-la-E1b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-06T06:01:44Z
  output: |
    npm run test:ro-ri
    duration_ms 1121.87

- eval: E2b
  run_id: minted-nhap-o-la-E2b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-06T06:01:44Z
  output: |
    npm run test:ro-ri
    duration_ms 1121.87

- eval: E2
  run_id: minted-nhap-o-la-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-06T06:01:44Z
  output: |
    npm run db:migrate && npm run db:test (Postgres dãy G, cổng 5573)
    duration_ms 111114.33

- eval: E5b
  run_id: minted-nhap-o-la-E5b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-06T06:01:44Z
  output: |
    npm run db:migrate && npm run db:test (Postgres dãy G, cổng 5573)
    duration_ms 111114.33

- eval: E7
  run_id: minted-nhap-o-la-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-06T06:01:44Z
  output: |
    npm run db:migrate && npm run db:test (Postgres dãy G, cổng 5573)
    duration_ms 111114.33

- eval: E9
  run_id: minted-nhap-o-la-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-06T06:01:44Z
  output: |
    npm run db:migrate && npm run db:test (Postgres dãy G, cổng 5573)
    duration_ms 111114.33

- eval: E4
  run_id: minted-nhap-o-la-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T06:01:44Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 3729.90

- eval: E5
  run_id: minted-nhap-o-la-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T06:01:44Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 3729.90

- eval: E6
  run_id: minted-nhap-o-la-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T06:01:44Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 3729.90

- eval: E7b
  run_id: minted-nhap-o-la-E7b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T06:01:44Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 3729.90

- eval: E4c
  run_id: minted-nhap-o-la-E4c-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.test.web_db
  verified_at: 2026-11-06T06:01:44Z
  output: |
    npm run test:db -w @quy-hang/web
    o-la.db-test.mts trượt (1449 ms)
    Cả tám tệp db-test (sync và nhap) đều trượt, mỗi tệp khoảng 1,2 đến 1,4 giây
    npm báo lifecycle script test:db thất bại

- eval: E10
  run_id: minted-nhap-o-la-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-06T06:01:44Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    2 tệp giao diện ngoài bản đồ

- eval: E4b
  run_id: minted-nhap-o-la-E4b-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T06:01:44Z
  screenshot: evidence/E4b-co-de-xuat-1440.png
  observed: |
    co-de-xuat-1440: Bước 3 Xem trước. Cột Giá hiện "4.6–4.8 tỷ" với huy hiệu Cần người, rồi hàng «Máy đề xuất» 4,8 tỷ + nút Dùng + lý do hai dòng, lặp ở các dòng 2, 3, 4. Ô trạng thái dòng 4 "đang đàm phán" có «Cần người». Hàng «Máy đề xuất Đang giao dịch Dùng» mới lộ nửa dòng ở đáy ảnh. Ô «thu về 4.2» không nằm trong ảnh.
    co-de-xuat-375: cột Giá ở khổ hẹp, ba ô "4.6–4.8 tỷ" đều có huy hiệu «Máy đề xuất» 4,8 tỷ và nút Dùng nguyên vẹn (không bị cắt, trang không tràn ngang). Dòng lý do bị cắt ở mép phải của bảng. Không có ô trạng thái hay ô thu về 4.2 trong ảnh.
    da-dung-1440: banner "Đã đổi theo 1 ô cùng chữ", bộ đếm Giữ nguyên 5, Máy sửa 11, Cần người 4. Dòng 2 và 3 vẫn có đề xuất 4,8 tỷ. Hàng trạng thái dòng 4 hiện "Đang giao dịch" dạng chữ thường, không còn ô nhập hay huy hiệu, nhưng ảnh chụp ở mép dưới nên không đủ rõ.
    da-dung-375: banner "cùng chữ ... nhớ cách gọi này", Giữ nguyên 5, các ô dải vẫn có Máy đề xuất 4,8 tỷ và nút Dùng không bị cắt.
    tat-dinh-1440: banner "Máy không đề xuất lần này / Sửa tay lần này: AI đang lỗi, thử lại sau". Bảng chỉ có ô nhập "4.6–4.8 tỷ", "thu về 4.2", "đang đàm phán" với huy hiệu Cần người và lý do máy luật. Không có huy hiệu «Máy đề xuất».
    tat-dinh-375: cùng dòng «Sửa tay lần này: AI đang lỗi, thử lại sau», không có huy hiệu «Máy đề xuất», ô «thu về 4.2» hiện rõ.
    Kết luận: phần tắt AI đúng. Phần có đề xuất và phần đã dùng chỉ đúng một phần trên ảnh (ba loại ô không cùng xuất hiện, lý do bị cắt ở 375), nên chấm trượt.
  network_observed: n-a (driver)
  output: |
    Chạy dung-o-la.mjs (máy 3493 lên), chup-o-la.mjs --kho 1440 và --kho 375, rồi dung-o-la.mjs --tat.
    Theo JSON: soDeXuat=6, nút Dùng rộng 54, cao 28 (1440) và 44 (375), không tràn ngang; da-dung daBam=true; tat-dinh soDeXuat=0.
    Theo ảnh (trượt): ảnh chỉ chụp phần đầu bảng nên ô «thu về 4.2» và đề xuất «4,2 tỷ» không có trong ảnh nào; ô trạng thái chỉ lộ nửa dòng ở ảnh 1440; ở 375 lý do bị cắt mép phải; ảnh da-dung không cho thấy ô trạng thái về «Giữ nguyên».

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-nhap-o-la-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-06T06:01:44Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-nhap-o-la-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-06T06:01:44Z

- cmd: npm run test:hooks
  run_id: minted-nhap-o-la-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-06T06:01:44Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-nhap-o-la-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 1
  verified_at: 2026-11-06T06:01:44Z
  ghi chú: không gắn eval nào. Ca ban-do-khuon.test.mjs so bản đồ khuôn: nhóm trang-thai ra 141 chỗ theo khuôn, bản đồ kỳ vọng 139 chỗ.

- cmd: npm run typecheck
  run_id: minted-nhap-o-la-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-06T06:01:44Z

- cmd: npm run lint
  run_id: minted-nhap-o-la-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-06T06:01:44Z

## Known limits

## Ngoài hợp đồng

## Analyst

Lệnh fail không gắn eval: `npm test -w @quy-hang/ui-lint` (bản đồ khuôn lệch hai chỗ ở nhóm trang-thai: 141 so với 139 kỳ vọng). Hai lệnh fail còn lại gắn eval: `npm run test:db -w @quy-hang/web` (E4c) và ui-check của E4b.

Eval không phân biệt (xanh trên cả HEAD lẫn baseline, chứng minh khung chạy chứ chưa chứng minh tính năng; cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- `npm test -w @quy-hang/core`: E1, E3, E8
- `npm run test:ro-ri`: E1b, E2b
- `npm run db:migrate && npm run db:test` (Postgres dãy G): E2, E5b, E7, E9
- `npm test -w @quy-hang/web`: E4, E5, E6, E7b
- `design-floor-khuon.mjs --kiem`: E10

E4c đỏ trên baseline (có phân biệt). E4b baseline n-a.

## Variance

none — mọi eval chạy nhiều lần đều đồng đều (mọi eval chạy một lần, tất định).

## Iterations

Round 1: E4c, E4b failed — E4c: cả tám tệp db-test của web trượt cùng lúc (cả nhóm sync không thuộc tính năng), nên nguyên nhân chưa tách được giữa môi trường cơ sở dữ liệu và code; E4b: ảnh chỉ chụp đầu bảng nên không chứng minh đủ ba loại ô lạ có huy hiệu, đề xuất, lý do một dòng và nút «Dùng», lý do bị cắt ở khổ 375. Returned to implementation.

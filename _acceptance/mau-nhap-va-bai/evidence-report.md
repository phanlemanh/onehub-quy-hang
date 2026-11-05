---
schema_version: 2
feature_slug: mau-nhap-va-bai
verdict: REJECT
failed_evals: ["E1","E2","E3","E4","E5","E6","E7","E8","E6b","E9b"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4c7eb09b8b9653dabfbbfa28ce61c94f53763883
human_signoff:
---

# Evidence Report: mau-nhap-va-bai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | FAIL |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | FAIL |
| E3 | AC-3 | test | FAIL |
| E4 | AC-4 | test | FAIL |
| E5 | AC-5 | test | FAIL |
| E6 | AC-6 | test | FAIL |
| E6b | AC-6 | test | FAIL |
| E7 | AC-7 | test | FAIL |
| E8 | AC-8 | test | FAIL |
| E9 | AC-9 | ui-check | PASS |
| E9b | AC-9 | test | FAIL |
| E10 | AC-9 | script | PASS (đạt có giới hạn, xem Known limits) |
| E10e | AC-9 | script | PASS |
| E11 | AC-9 | script | PASS |

Lệnh fail không gắn eval riêng (mỗi lệnh gom nhiều eval):
- `npm run db:migrate && npm run db:test` (E1 đến E8): 440 ca đạt, 1 ca đỏ trong `packages/api/test-db/dong-duong-gui-ma/dong-duong-gui-ma.test.ts` («đường lõi mật khẩu đóng», assert «đường đăng ký tạo người»: thực tế 13, mong đợi 12). Ca đỏ nằm ngoài các ca đặc thù của mau-nhap-va-bai nhưng cùng lệnh nên cả cụm E1 đến E8 bị tính đỏ.
- `npm test -w @quy-hang/web` (E6b, E9b): bài `apps/web/src/app/(app)/settings/cai-dat.test.ts` ca «E5: đối chứng đỏ — bản sao users/page.tsx bỏ lời gọi → gọi tên tệp» đỏ vì `templates/page.tsx` xuất hiện thêm trong danh sách tệp bị gọi tên (thực tế `['templates/page.tsx','users/page.tsx']`, mong đợi `['users/page.tsx']`).

## Evidence

- eval: E1
  run_id: minted-mau-nhap-va-bai-E1-r2
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:27:48Z
  output: |
    tests 441, pass 440, fail 1.
    Ca đỏ: đường lõi mật khẩu đóng (dong-duong-gui-ma.test.ts): đường đăng ký tạo người, 13 khác 12.

- eval: E1b
  run_id: minted-mau-nhap-va-bai-E1b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T16:27:48Z
  output: |
    npm test -w @quy-hang/core xanh.

- eval: E2
  run_id: minted-mau-nhap-va-bai-E2-r2
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:27:48Z
  output: |
    Cùng lệnh với E1: 441 ca, 1 ca đỏ ngoài cụm mẫu nhập (dong-duong-gui-ma).

- eval: E3
  run_id: minted-mau-nhap-va-bai-E3-r2
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:27:48Z
  output: |
    Cùng lệnh với E1: 441 ca, 1 ca đỏ ngoài cụm mẫu nhập (dong-duong-gui-ma).

- eval: E4
  run_id: minted-mau-nhap-va-bai-E4-r2
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:27:48Z
  output: |
    Cùng lệnh với E1: 441 ca, 1 ca đỏ ngoài cụm mẫu nhập (dong-duong-gui-ma).

- eval: E5
  run_id: minted-mau-nhap-va-bai-E5-r2
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:27:48Z
  output: |
    Cùng lệnh với E1: 441 ca, 1 ca đỏ ngoài cụm mẫu nhập (dong-duong-gui-ma).

- eval: E6
  run_id: minted-mau-nhap-va-bai-E6-r2
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:27:48Z
  output: |
    Cùng lệnh với E1: 441 ca, 1 ca đỏ ngoài cụm mẫu nhập (dong-duong-gui-ma).

- eval: E6b
  run_id: minted-mau-nhap-va-bai-E6b-r2
  exit_code: 1
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T16:27:48Z
  output: |
    cai-dat.test.ts ca «E5: đối chứng đỏ — bản sao users/page.tsx bỏ lời gọi → gọi tên tệp» đỏ.
    Thực tế ['templates/page.tsx','users/page.tsx'], mong đợi ['users/page.tsx'].

- eval: E7
  run_id: minted-mau-nhap-va-bai-E7-r2
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:27:48Z
  output: |
    Cùng lệnh với E1: 441 ca, 1 ca đỏ ngoài cụm mẫu nhập (dong-duong-gui-ma).

- eval: E8
  run_id: minted-mau-nhap-va-bai-E8-r2
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:27:48Z
  output: |
    Cùng lệnh với E1: 441 ca, 1 ca đỏ ngoài cụm mẫu nhập (dong-duong-gui-ma).

- eval: E9
  run_id: minted-mau-nhap-va-bai-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T16:27:48Z
  screenshot: evidence/E9-step1.png
  observed: |
    step1.png: Khung Cai dat voi thanh ben Ca nhan / San [Mau] San thu, muc "Mau nhap" dang chon; breadcrumb "Cai dat > [Mau] San thu > Mau nhap", tieu de "Mau nhap", bang 12 dong voi tieu de cot "Tieu de trong file | Ghep vao | Quy doi | Nguon"; nguon "Lan nhap 05/11" cho 11 dong; dong tt -> Trang thai, "1 gia tri", "Sua boi [Mau] Quan tri san · 05/11"; moi dong co nut Sua/Xoa. Khop expected.
    step2.png: sau Luu hop sua dong, bang van 12 dong, dong tt "Trang thai | 1 gia tri | Sua boi [Mau] Quan tri san · 05/11". Khop expected ve nguon "Sua boi ...", nhung dong tt vua o trang thai Sua boi tu truoc nen frame khong tu minh chung minh doi gia tri; bang chung doi la API (Pending, at moi 16:30:19Z) va hop sua truoc do co "con hang -> Active" (da xem bang screenshot trung gian).
    step3.png: hop xac nhan nho giua man (nen mo): tieu de «Xoa «toa»?», noi dung «Lan nhap sau, cot «toa» se ghep lai tu dau.», nut Huy va Xoa. Khop expected.
    step4.png: bang con 11 dong, khong con dong toa (giua sdt chu va tt khong co toa); tt van o cuoi. Khop expected.
    step5.png: dau-chu-1: trang /settings/personal?chi-quan-tri=1, breadcrumb "Cai dat > Ca nhan", thanh ben chi co Ca nhan, banner «Muc nay chi quan tri san mo duoc», cac muc Ho so/San/Cai len man hinh chinh/... Khop expected.
  network_observed: clean

- eval: E9b
  run_id: minted-mau-nhap-va-bai-E9b-r2
  exit_code: 1
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T16:27:48Z
  output: |
    Cùng lệnh với E6b: bài cai-dat.test.ts đỏ ở ca đối chứng E5 (templates/page.tsx lọt vào danh sách tệp bị gọi tên).

- eval: E10
  run_id: minted-mau-nhap-va-bai-E10-r2
  exit_code: 1
  baseline: red
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T16:27:48Z
  output: |
    3 tệp giao diện ngoài bản đồ
    Mã thoát 1 là kết quả đã khai trước (đạt có giới hạn), chỉ chấp nhận cùng E10e.

- eval: E10e
  run_id: minted-mau-nhap-va-bai-E10e-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/mau-nhap-va-bai/kiem-khuon-e10.mjs
  verified_at: 2026-11-05T16:27:48Z
  output: |
    E10e: chỉ có dòng báo oan đã khai: lệch: apps/web/src/app/(app)/settings/templates/page.tsx · thuộc hai nhóm màn: cai-dat-san, trang-tam

- eval: E11
  run_id: minted-mau-nhap-va-bai-E11-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-05T16:27:48Z
  output: |
    design-floor-s4 không chặn tệp giao diện nào của vòng.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-mau-nhap-va-bai-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-05T16:27:48Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-mau-nhap-va-bai-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-05T16:27:48Z

- cmd: npm run test:hooks
  run_id: minted-mau-nhap-va-bai-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-05T16:27:48Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-mau-nhap-va-bai-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-05T16:27:48Z

- cmd: npm run typecheck
  run_id: minted-mau-nhap-va-bai-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-05T16:27:48Z

- cmd: npm run lint
  run_id: minted-mau-nhap-va-bai-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-05T16:27:48Z

## Known limits

- E10 (AC-9) dat-co-gioi-han: ma thoat 1 la ket qua DA KHAI TRUOC cua eval nay, khong phai mot luot truot. Lenh: R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-khuon.mjs" --kiem --root .

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline, chứng minh harness chứ không phải tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- `npm test -w @quy-hang/core`: E1b
- `R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-s4.mjs" --root .`: E11

Baseline khong do
- node _acceptance/mau-nhap-va-bai/kiem-khuon-e10.mjs: bo qua baseline: tep _acceptance/mau-nhap-va-bai/kiem-khuon-e10.mjs co o cay dang kiem nhung chua co o merge-base a2b11dc825360183ebd23e59d51a37a93233b2c9 — eval moi, chay tren code cu khong phan biet gi

Hội đồng judge: không có eval judgment nào ở hồ sơ này, không có panel cần chấm.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lịch sử round cũ nằm ở các bản trước của hồ sơ này, round này không chép lại chi tiết.
Round 2: E1, E2, E3, E4, E5, E6, E7, E8 (cùng lệnh `npm run db:migrate && npm run db:test`) đỏ vì ca «đường lõi mật khẩu đóng» ở dong-duong-gui-ma.test.ts lệch số người tạo (13 so với 12); E6b, E9b (cùng lệnh `npm test -w @quy-hang/web`) đỏ vì bài cai-dat.test.ts ca đối chứng E5 thấy thêm templates/page.tsx. Quay lại bước triển khai.

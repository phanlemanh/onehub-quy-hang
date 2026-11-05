---
schema_version: 2
feature_slug: man-lien-he
verdict: REJECT
failed_evals: ["E10d","E10b"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 71104e00840aca5b16daf5dd6663c057eefe6539
human_signoff:
---

# Evidence Report: man-lien-he

Round 1. Hai eval không đạt: E10d (bước chấm khuôn báo một tệp lệch của vòng) và E10b (hồ sơ người không tải được khi chạy màn thật). Mười ba eval còn lại đạt.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | ui-check | FAIL |
| E10c | AC-10 | test | PASS |
| E10d | AC-10 | script | FAIL |

## Evidence

- eval: E1
  run_id: minted-man-lien-he-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:58:39Z
  output: |
    Lệnh: npm run db:migrate && npm run db:test (một lần chạy, một lần đạt, không phương sai).
    ℹ duration_ms 99798.865917

- eval: E2
  run_id: minted-man-lien-he-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:58:39Z
  output: |
    Lệnh: npm run db:migrate && npm run db:test (chung một lần chạy với E1).
    ℹ duration_ms 99798.865917

- eval: E3
  run_id: minted-man-lien-he-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:58:39Z
  output: |
    Lệnh: npm run db:migrate && npm run db:test (chung một lần chạy với E1).
    ℹ duration_ms 99798.865917

- eval: E4
  run_id: minted-man-lien-he-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:58:39Z
  output: |
    Lệnh: npm run db:migrate && npm run db:test (chung một lần chạy với E1).
    ℹ duration_ms 99798.865917

- eval: E5
  run_id: minted-man-lien-he-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:58:39Z
  output: |
    Lệnh: npm run db:migrate && npm run db:test (chung một lần chạy với E1).
    ℹ duration_ms 99798.865917

- eval: E6b
  run_id: minted-man-lien-he-E6b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:58:39Z
  output: |
    Lệnh: npm run db:migrate && npm run db:test (chung một lần chạy với E1).
    ℹ duration_ms 99798.865917

- eval: E7
  run_id: minted-man-lien-he-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:58:39Z
  output: |
    Lệnh: npm run db:migrate && npm run db:test (chung một lần chạy với E1).
    ℹ duration_ms 99798.865917

- eval: E8
  run_id: minted-man-lien-he-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:58:39Z
  output: |
    Lệnh: npm run db:migrate && npm run db:test (chung một lần chạy với E1).
    ℹ duration_ms 99798.865917

- eval: E9
  run_id: minted-man-lien-he-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:58:39Z
  output: |
    Lệnh: npm run db:migrate && npm run db:test (chung một lần chạy với E1).
    ℹ duration_ms 99798.865917

- eval: E1b
  run_id: minted-man-lien-he-E1b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T04:58:39Z
  output: |
    Lệnh: npm test -w @quy-hang/core (một lần chạy, một lần đạt).
    ℹ duration_ms 971.470834

- eval: E6
  run_id: minted-man-lien-he-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T04:58:39Z
  output: |
    Lệnh: npm test -w @quy-hang/core (chung một lần chạy với E1b).
    ℹ duration_ms 971.470834

- eval: E10
  run_id: minted-man-lien-he-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T04:58:39Z
  output: |
    Lệnh: npm test -w @quy-hang/web (một lần chạy, một lần đạt).
    ℹ duration_ms 3666.772458

- eval: E10c
  run_id: minted-man-lien-he-E10c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-05T04:58:39Z
  output: |
    Lệnh: npm test -w @quy-hang/ui-lint (một lần chạy, một lần đạt).
    ℹ duration_ms 40758.9375

- eval: E10d
  run_id: minted-man-lien-he-E10d-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T04:58:39Z
  output: |
    Lệnh: design-floor-khuon.mjs --kiem --root . (một lần chạy, không đạt).
    lệch: apps/web/src/app/(app)/contacts/page.tsx · khuôn Placeholder · nhóm trang-tam
    8 tệp giao diện ngoài bản đồ
    Eval đòi bước chấm khuôn không in dòng «lệch:» nào cho tệp của vòng; tệp trang /contacts của vòng vẫn bị báo lệch.

- eval: E10b
  run_id: minted-man-lien-he-E10b-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T04:58:39Z
  screenshot: evidence/E10b-step1.png   # khung đầu; còn E10b-step2.png đến E10b-step6.png
  observed: |
    Đã mở từng frame bằng Read. step1 (1440, đăng nhập Đầu chủ 1): rail trái có 3 biểu tượng, biểu tượng thứ ba (Liên hệ) sáng; bảng có cột Tên, Loại, Người giữ, Cơ hội mở, Căn, có dòng Lead, đúng Expected. step2: gõ «Chủ nhà 02», chạm dòng, ngăn phải «Hồ sơ người» chỉ có «Chưa tải được — thử lại» và nút Thử lại; không có Số (che), Cơ hội (pha), Căn, Dòng thời gian, MÂU THUẪN Expected. step3: cùng ngăn lỗi, không có «Hiện số», không có nút Gọi, nên không đếm được số chạm từ nhà Liên hệ tới Gọi (đạt mốc nhiều nhất là 2 chạm: nhà Liên hệ, chạm dòng; rồi dừng ở lỗi). step4: gõ «0900 000 001» (số của Đầu chủ 2, mẫu CN-01) ra «Không tìm thấy «0900 000 001»», không có dòng «Đã có trong sàn — [Tên] đang giữ», MÂU THUẪN Expected. step5 (375): chạm dòng mở ngăn từ đáy (cao 121 px, bám đáy), scrollWidth = clientWidth = 375 nên không cuộn ngang, nhưng nội dung ngăn vẫn là lỗi «Chưa tải được». step6: Đầu khách có rail Hôm nay, Bảng hàng, Link đã gửi, Cài đặt, không có mục Liên hệ (innerText không chứa «Liên hệ»); vào thẳng /contacts chỉ thấy «Màn Liên hệ dành cho Đầu chủ và Trưởng nhóm», đạt.
  network_observed: app-fail
  output: |
    Máy chủ dev tự khởi động ở cổng 3491 (cơ sở dữ liệu dãy L, cổng 5571), sẵn sàng, đã tắt sau khi chạy.
    Đạt: trang /contacts của Đầu chủ hiện bảng 5 cột, rail có Liên hệ sáng; đường danh sách trả 26 dòng, tìm «Chủ nhà 02» trả 1 dòng.
    Không đạt: đường hồ sơ người lỗi máy chủ với cả 26 liên hệ. Nhật ký máy chủ: «bản mã số chủ không giải được» tại giaiMaSo (packages/api/src/owners/ma-hoa.ts:41), gọi từ readProfile (packages/api/src/contacts/read/store.ts:176). Hồ sơ không có Số (che), Cơ hội, Căn, Dòng thời gian, «Hiện số», nút Gọi; số chạm tới Gọi không đo được.
    Không đạt: tìm theo số 0900 000 001 (chủ do Đầu chủ 2 giữ) trả rỗng nên hiện «Không tìm thấy», không có «Đã có trong sàn — [Tên] đang giữ».
    Nguyên nhân gần: bản mã số trong contact_phones của dãy L không giải được bằng khoá của máy chủ dev; khởi động lại với OWNER_PHONE_KEY rỗng (khoá dev công khai) vẫn lỗi; chạy riêng giaiMaSo với khoá dev trên 40 dòng contact_phones: 0 giải được, 40 hỏng. Dấu vết băm số cũng không khớp nên tìm theo số trả rỗng. Chưa phân biệt được lỗi môi trường (khoá khác với lúc nạp mẫu) với lỗi sản phẩm; theo luật, nội dung frame mâu thuẫn Expected nên eval không đạt.
    Đạt (độc lập khoá): 375px không cuộn ngang, ngăn mở từ đáy; Đầu khách không có Liên hệ trên rail.
    Frame: evidence/E10b-step1.png đến E10b-step6.png; mạng: evidence/E10b-network.txt; console: evidence/E10b-console.txt.
    Việc cần người: xác định khoá OWNER_PHONE_KEY dùng khi nạp mẫu dãy L (hoặc nạp lại mẫu dãy L bằng khoá của máy chủ dev) rồi chạy lại E10b để loại nghi vấn môi trường.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-man-lien-he-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-05T04:58:39Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-man-lien-he-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-05T04:58:39Z

- cmd: npm run test:hooks
  run_id: minted-man-lien-he-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-05T04:58:39Z

- cmd: npm run typecheck
  run_id: minted-man-lien-he-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-05T04:58:39Z

- cmd: npm run lint
  run_id: minted-man-lien-he-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-05T04:58:39Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (đạt trên cả HEAD lẫn baseline diffBase — chứng minh harness chứ chưa chứng minh tính năng; cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý):

- npm run db:migrate && npm run db:test: E1, E2, E3, E4, E5, E6b, E7, E8, E9
- npm test -w @quy-hang/core: E1b, E6
- npm test -w @quy-hang/web: E10
- npm test -w @quy-hang/ui-lint: E10c

Baseline không đo: E10b (ui-check, baseline n-a, không chạy được trên mã cũ). Năm lệnh suite hồi quy cũng n-a vì không gắn eval; không phải mục cần xử lý.

Ghi chú về E10b: lỗi hồ sơ do bản mã số trong dữ liệu mẫu dãy L không giải được bằng khoá của máy chủ dev. Chưa xác định được đây là lỗi môi trường hay lỗi sản phẩm; cần người cho biết khoá nạp mẫu rồi chạy lại.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, xác định).

## Iterations

Round 1: E10d, E10b không đạt — E10d: tệp trang /contacts bị bước chấm khuôn báo lệch (khuôn Placeholder, nhóm trang-tam); E10b: hồ sơ người không tải được vì bản mã số không giải được trong môi trường chạy thử, kéo theo tìm theo số không ra người giữ khác. Trả về giai đoạn triển khai.

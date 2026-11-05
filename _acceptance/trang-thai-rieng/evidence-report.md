---
schema_version: 2
feature_slug: trang-thai-rieng
verdict: REJECT
failed_evals: ["E11","E13"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 86ca121bdbf678d3ba11fd99fb80c7b846b55196
human_signoff:
---

# Evidence Report: trang-thai-rieng

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E2c | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E3c | AC-3 | test | PASS |
| E3d | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS (carry-forward round 1) |
| E6b | AC-6 | test | PASS (carry-forward round 1) |
| E6c | AC-7 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E7c | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS (carry-forward round 1) |
| E10 | AC-10 | test | PASS (carry-forward round 1) |
| E10b | AC-10 | test | PASS |
| E11 | AC-1 | ui-check | FAIL |
| E12 | AC-3 | ui-check | PASS |
| E13 | AC-8 | ui-check | FAIL |
| E14 | AC-1 | script | PASS (đạt có giới hạn) |
| E14b | AC-1 | script | PASS |
| E15 | AC-7 | ui-check | PASS |

Lệnh fail không gắn eval: không có. Hai lệnh ui-check:E11 và ui-check:E13 thoát mã khác 0 và đều đã gắn eval tương ứng (E11, E13).

## Evidence

- eval: E1
  run_id: minted-trang-thai-rieng-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T23:12:06Z
  output: |
    ℹ duration_ms 87460.11875

- eval: E2b
  run_id: minted-trang-thai-rieng-E2b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T23:12:06Z
  output: |
    ℹ duration_ms 87460.11875

- eval: E3
  run_id: minted-trang-thai-rieng-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T23:12:06Z
  output: |
    ℹ duration_ms 87460.11875

- eval: E4
  run_id: minted-trang-thai-rieng-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T23:12:06Z
  output: |
    ℹ duration_ms 87460.11875

- eval: E5
  run_id: minted-trang-thai-rieng-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T23:12:06Z
  output: |
    ℹ duration_ms 87460.11875

- eval: E7b
  run_id: minted-trang-thai-rieng-E7b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T23:12:06Z
  output: |
    ℹ duration_ms 87460.11875

- eval: E8
  run_id: minted-trang-thai-rieng-E8-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T23:12:06Z
  output: |
    ℹ duration_ms 87460.11875

- eval: E9
  run_id: minted-trang-thai-rieng-E9-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T23:12:06Z
  output: |
    ℹ duration_ms 87460.11875

- eval: E3d
  run_id: minted-trang-thai-rieng-E3d-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T23:12:06Z
  output: |
    ℹ duration_ms 87460.11875

- eval: E6c
  run_id: minted-trang-thai-rieng-E6c-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T23:12:06Z
  output: |
    ℹ duration_ms 87460.11875

- eval: E7c
  run_id: minted-trang-thai-rieng-E7c-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T23:12:06Z
  output: |
    ℹ duration_ms 87460.11875

- eval: E2
  run_id: minted-trang-thai-rieng-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T23:12:06Z
  output: |
    ℹ duration_ms 966.841291

- eval: E3b
  run_id: minted-trang-thai-rieng-E3b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T23:12:06Z
  output: |
    ℹ duration_ms 966.841291

- eval: E10b
  run_id: minted-trang-thai-rieng-E10b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T23:12:06Z
  output: |
    ℹ duration_ms 966.841291

- eval: E2c
  run_id: minted-trang-thai-rieng-E2c-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T23:12:06Z
  output: |
    ℹ duration_ms 3585.087709

- eval: E3c
  run_id: minted-trang-thai-rieng-E3c-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T23:12:06Z
  output: |
    ℹ duration_ms 3585.087709

- eval: E4b
  run_id: minted-trang-thai-rieng-E4b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T23:12:06Z
  output: |
    ℹ duration_ms 3585.087709

- eval: E7
  run_id: minted-trang-thai-rieng-E7-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T23:12:06Z
  output: |
    ℹ duration_ms 3585.087709

- eval: E8b
  run_id: minted-trang-thai-rieng-E8b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T23:12:06Z
  output: |
    ℹ duration_ms 3585.087709

- eval: E5b
  run_id: minted-trang-thai-rieng-E5b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-05T23:12:06Z
  output: |
    ℹ duration_ms 1933.095625

- eval: E14
  run_id: minted-trang-thai-rieng-E14-r2
  exit_code: 1
  baseline: red
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T23:12:06Z
  output: |
    16 tệp giao diện ngoài bản đồ
  note: đạt có giới hạn — mã thoát 1 là kết quả đã khai trước của eval này, xem Known limits; E14b xanh bảo đảm mọi dòng lệch là dòng báo oan đã khai.

- eval: E14b
  run_id: minted-trang-thai-rieng-E14b-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/trang-thai-rieng/kiem-khuon-e14.mjs
  verified_at: 2026-11-05T23:12:06Z
  output: |
    E14b: chỉ có dòng báo oan đã khai (1): lệch: apps/web/src/app/(app)/settings/statuses/page.tsx · thuộc hai nhóm màn: cai-dat-san, trang-tam

- eval: E11
  run_id: minted-trang-thai-rieng-E11-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T23:12:06Z
  screenshot: evidence/E11-step1.png
  observed: |
    Frame step1 (1440): đủ cột nhà (thanh icon trái), cột thứ hai "Cài đặt" với mục "Trạng thái" sáng; breadcrumb "Cài đặt › Sàn [Mẫu] Sàn thử › Trạng thái"; sáu nhóm Chưa đủ để rao, Đang bán, Đang giao dịch, Đã bán, Tạm ngừng, Ngừng hẳn, mỗi nhóm huy hiệu màu riêng. KHÁC Expected: nhóm Đang giao dịch ĐÃ có sẵn nhãn riêng "Giữ chỗ" (1 căn đang mang) — dữ liệu dư từ lần chạy trước, bộ mẫu không sạch. Frame step2-literal-trung: gõ "Giữ chỗ" ở Đang giao dịch → ô viền đỏ, lỗi "Trùng tên nhãn «Giữ chỗ»" (đúng luật nhưng ngược Expected). Frame step2: để có luồng thêm/lưu, dùng tên "Giữ chỗ lần hai" (KHÔNG phải tên theo đề): Lưu → thẻ "Đã lưu trạng thái"; tải lại thì cả hai nhãn còn (đọc DOM). Frame step3: thêm "Đang bán" ở Tạm ngừng → ô viền đỏ, câu "Trùng tên trạng thái «Đang bán»"; nút Lưu disabled (đọc DOM, nút nằm dưới mép khung); đã gỡ dòng. Frame step4 (375): tiêu đề Trạng thái, các nhóm xếp dọc, thanh dưới "Cài đặt sàn/Tôi"; scrollWidth=clientWidth=375, không cuộn ngang.
  network_observed: clean
  note: truột vì tiền điều kiện dữ liệu — nhãn "Giữ chỗ" đã có sẵn trong DB dãy B nên bước thêm đúng tên theo đề không cho ra thẻ «Đã lưu trạng thái»; chức năng chống trùng chạy đúng.

- eval: E12
  run_id: minted-trang-thai-rieng-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T23:12:06Z
  screenshot: evidence/E12-step1.png
  observed: |
    E12-step1.png (1440): bảng hàng with the Trạng thái column in view; A-08.03 cell is focused and shows the green "Đang bán" badge. The editor popup lists Đang giao dịch (focused), Giữ chỗ, Giữ chỗ lần hai, Đã bán, Tạm ngừng, Ngừng hẳn, with the caption "Tính là vừa xác nhận với chủ nhà". Giữ chỗ follows Đang giao dịch directly. Matches Expected.
    E12-step2.png (1440): A-08.03 cell now shows a purple-tinted "Giữ chỗ" badge in the same style as the Đang giao dịch badges of A-13.01, A-13.03 and A-15.04. Toast "Đã đổi trạng thái A-08.03". The panel header badge reads "Đang giao dịch". Matches Expected (same color).
    E12-step3.png (1440): the Trạng thái filter shows "Đang giao dịch", counter 8 / 36 căn. Results: A-13.01 Đang giao dịch, A-08.03 Giữ chỗ, A-13.03, A-15.04, A-04.06 Giữ chỗ, B-10.01, B-14.02, B-08.04. A-08.03 stays in the results. Matches Expected.
    E12-step4.png (375): mobile Bảng hàng card list; the A-08.03 card (4,95 tỷ, 75 m², 2PN, Tây Bắc) has a "Giữ chỗ" badge on the photo, next to Đang giao dịch cards for A-13.03 and A-13.01. Matches Expected.
    E12-step5.png (1440, new context, quan-tri, avatar QU, Đã đồng bộ 06:18): the Trạng thái column shows A-08.03 as "Giữ chỗ" and A-04.06 as "Giữ chỗ" in the same purple style as Đang giao dịch. Matches Expected (label arrived through sync).
  network_observed: clean

- eval: E13
  run_id: minted-trang-thai-rieng-E13-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T23:12:06Z
  screenshot: evidence/E13-step1.png
  observed: |
    step1.png (1440x900): hộp «Gỡ nhãn «Giữ chỗ»?» với dòng «2 căn đang là «Giữ chỗ». Chuyển chúng sang:», lựa chọn «Đang giao dịch» và «Giữ chỗ lần hai», nút «Giữ nhãn» và «Gỡ và chuyển». Expected nói 1 căn nhưng màn hiện 2 căn (mâu thuẫn số lượng). Cả hai bộ phận trạng thái cũ «Giữ chỗ» và «Giữ chỗ lần hai» đang cùng nằm trong nhóm Đang giao dịch, nên danh sách lựa chọn có thêm «Giữ chỗ lần hai». step2.png: sau khi chọn «Đang giao dịch», «Gỡ và chuyển», Lưu, hiện thẻ «Đã lưu trạng thái – Bảng hàng và Hôm nay dùng nhãn mới từ lần mở kế»; nhóm Đang giao dịch chỉ còn «Giữ chỗ lần hai» (0 căn đang mang), không còn «Giữ chỗ». Khớp Expected. step3.png (/inventory, 29 căn): nhiều căn hiện «Đang giao dịch» (A-13.01, A-08.03, A-13.03, A-15.04, A-04.06...), không còn căn nào hiện «Giữ chỗ». Không xác định được riêng căn nào là căn vừa chuyển, và số căn chuyển là 2 chứ không phải 1.
  network_observed: clean
  note: trượt vì tiền điều kiện lệch (2 căn mang «Giữ chỗ» thay vì 1, còn nhãn dư «Giữ chỗ lần hai»); chức năng gỡ và chuyển chạy đúng.

- eval: E15
  run_id: minted-trang-thai-rieng-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T23:12:06Z
  screenshot: evidence/E15-step1.png
  observed: |
    E15-step1.png (1440x1000, doc truc tiep): trang Hom nay cua dau-chu-1, cuon toi cuoi. Nhom «Thieu thong tin 14» o tren (cac can 3/5). Duoi cung nhom «Moi doi 1» co mot dong: «A-11.02 · Toa A, 2PN · 68,5 m²», cot ly do «Dang ban → Giu cho — Truong nhom, hom nay», gia 3,08 ty · Bao phi, nut «Con · giu gia». Khop Expected. Assert DOM: innerText chua dung chuoi «Dang ban → Giu cho — Truong nhom, hom nay», va dong ay nam duoi tieu de nhom «Moi doi 1».
  network_observed: clean

- eval: E6
  run_id: minted-trang-thai-rieng-E6-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-05T22:54:59Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6b
  run_id: minted-trang-thai-rieng-E6b-r1
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-05T22:54:59Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9b
  run_id: minted-trang-thai-rieng-E9b-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-05T22:54:59Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-trang-thai-rieng-E10-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-05T22:54:59Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-trang-thai-rieng-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-05T23:12:06Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-trang-thai-rieng-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-05T23:12:06Z

- cmd: npm run test:hooks
  run_id: minted-trang-thai-rieng-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-05T23:12:06Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-trang-thai-rieng-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-05T23:12:06Z

- cmd: npm run typecheck
  run_id: minted-trang-thai-rieng-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-05T23:12:06Z

- cmd: npm run lint
  run_id: minted-trang-thai-rieng-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-05T23:12:06Z

## Known limits

- E14 (AC-1) dat-co-gioi-han: ma thoat 1 la ket qua DA KHAI TRUOC cua eval nay, khong phai mot luot truot. Lenh: R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-khuon.mjs" --kiem --root .

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (xanh trên cả HEAD lẫn baseline, chứng minh harness chứ không phải tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- npm test -w @quy-hang/core: E2, E3b, E10b
- npm test -w @quy-hang/web: E2c, E3c, E4b, E7, E8b
- npm run test:ro-ri: E5b

### Baseline khong do

- node _acceptance/trang-thai-rieng/kiem-khuon-e14.mjs: bo qua baseline: tep _acceptance/trang-thai-rieng/kiem-khuon-e14.mjs co o cay dang kiem nhung chua co o merge-base 24dbfb2de227ce73a8fc9aaf6306347a8c34cd8a — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1–E10b chạy lần đầu trên bản c74620d1; kết quả gốc nằm trong run-log (run_id đuôi r1), bốn eval E6, E6b, E9b, E10 được mang sang round 2.
Round 2: E11, E13 failed — cả hai trượt vì tiền điều kiện dữ liệu của DB dãy B không sạch (nhãn «Giữ chỗ» đã có sẵn, 2 căn mang nhãn thay vì 1, còn nhãn dư «Giữ chỗ lần hai»), còn chức năng chống trùng và gỡ-và-chuyển chạy đúng. Returned to implementation.

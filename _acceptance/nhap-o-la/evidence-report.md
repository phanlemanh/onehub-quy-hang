---
schema_version: 2
feature_slug: nhap-o-la
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 84c3edec98cbd88b76386ea31ca265173e45c579
human_signoff: Manh Phan 2026-11-06
---

# Evidence Report: nhap-o-la

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | ui-check | PASS |
| E4c | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS (carry-forward round 1) |
| E5b | AC-5 | test | PASS (carry-forward round 2) |
| E6 | AC-6 | test | PASS (carry-forward round 1) |
| E7 | AC-7 | test | PASS (carry-forward round 2) |
| E7b | AC-7 | test | PASS (carry-forward round 1) |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS (carry-forward round 2) |
| E10 | AC-4 | script | PASS (carry-forward round 2) |

## Evidence

- eval: E1
  run_id: minted-nhap-o-la-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-06T09:15:04Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1073.992375

- eval: E3
  run_id: minted-nhap-o-la-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-06T09:15:04Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1073.992375

- eval: E8
  run_id: minted-nhap-o-la-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-06T09:15:04Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1073.992375

- eval: E1b
  run_id: minted-nhap-o-la-E1b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-06T09:15:04Z
  output: |
    npm run test:ro-ri
    ℹ duration_ms 919.363709

- eval: E2b
  run_id: minted-nhap-o-la-E2b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-06T09:15:04Z
  output: |
    npm run test:ro-ri
    ℹ duration_ms 919.363709

- eval: E2
  run_id: minted-nhap-o-la-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-06T09:15:04Z
  output: |
    npm run db:migrate && npm run db:test (Postgres dãy G 5573)
    ℹ duration_ms 111046.061208

- eval: E4
  run_id: minted-nhap-o-la-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-06T09:15:04Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4005.054458

- eval: E4c
  run_id: minted-nhap-o-la-E4c-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-06T09:15:04Z
  output: |
    npm run test:db -w @quy-hang/web (Postgres dãy G 5573)
    ℹ duration_ms 12726.860583

- eval: E4b
  run_id: minted-nhap-o-la-E4b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T09:15:04Z
  screenshot: evidence/E4b-co-de-xuat-1440.png
  observed: |
    Đã mở và đọc: co-de-xuat-1440, co-de-xuat-375, da-dung-1440, da-dung-375, tat-dinh-1440, tat-dinh-375, o-trang-thai-375, da-dung-o-trang-thai-375, o-ve-tay-375, o-dai-375, o-trang-thai-1440, da-dung-o-trang-thai-1440. Chưa mở riêng o-dai-1440 và o-ve-tay-1440; hai ca này chỉ đối chiếu qua dòng JSON (huyHieu, deXuat, lyDo, nút, không cắt đều đạt).
    co-de-xuat-1440: Xem trước, ô «4.6–4.8 tỷ» và ô «đang đàm phán» đều có huy hiệu vàng «Cần người», huy hiệu tím «Máy đề xuất», chữ đề xuất «4,8 tỷ» / «Đang giao dịch», nút «Dùng» dưới ô nhập, và lý do một dòng (ở ô giá, lý do xuống 2 dòng trong khung, chưa bị cắt). Đếm 4/10/6/0. Ở khổ 1440 nút «Dùng» nằm cạnh chữ đề xuất.
    co-de-xuat-375: ảnh toàn trang chỉ thấy đầu bảng (cột ô lạ nằm ngoài khung nhìn, bảng cuộn ngang trong khung chứ trang không tràn). Ảnh cận o-dai-375, o-ve-tay-375 và o-trang-thai-375 cho thấy ô «thu về 4.2» có «Máy đề xuất» + «4,2 tỷ KBP» + «Dùng» + lý do xuống dòng; ô trạng thái có «Đang giao dịch» + «Dùng» + lý do; nút «Dùng» không bị cắt, chữ nằm đủ trong khung.
    da-dung-1440 và da-dung-375: có khối «Đã đổi theo 1 ô cùng chữ» kèm câu giải thích; đếm thành Giữ nguyên 5, Máy sửa 11, Cần người 4. Dòng 4 (A-0103) cột trạng thái hiện «Đang giao dịch» thuần, không huy hiệu, tức đã Giữ nguyên. da-dung-o-trang-thai-1440 và 375 khớp: ô trạng thái chỉ còn chữ «Đang giao dịch».
    tat-dinh-1440 và 375: khối «Máy không đề xuất lần này», dòng «Sửa tay lần này: AI đang lỗi, thử lại sau»; các ô «Cần người» không có huy hiệu «Máy đề xuất» nào, không có nút «Dùng».
    Kết luận: ảnh khớp Expected, không mâu thuẫn. Lưu ý nhỏ: ảnh toàn trang 375 co-de-xuat chỉ có cột đầu nên phần ô lạ phải xem qua các ảnh cận, và mã thoát của hai lệnh chụp bị lệnh tail che, nhưng cả hai đều in đủ ba ca và đủ ảnh.
  network_observed: n-a (driver)

- eval: E5
  run_id: minted-nhap-o-la-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-06T06:01:44Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5b
  run_id: minted-nhap-o-la-E5b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-06T07:34:12Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-nhap-o-la-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-06T06:01:44Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-nhap-o-la-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-06T07:34:12Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E7b
  run_id: minted-nhap-o-la-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-06T06:01:44Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-nhap-o-la-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-06T07:34:12Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-nhap-o-la-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-06T07:34:12Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-nhap-o-la-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-06T09:15:04Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-nhap-o-la-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-06T09:15:04Z

- cmd: npm run test:hooks
  run_id: minted-nhap-o-la-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-06T09:15:04Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-nhap-o-la-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-06T09:15:04Z

- cmd: npm run typecheck
  run_id: minted-nhap-o-la-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-06T09:15:04Z

- cmd: npm run lint
  run_id: minted-nhap-o-la-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-06T09:15:04Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 2 — baseline khong do lai round nay. Mọi eval ghi baseline n-a (round này không đo).

Eval không phân biệt (xanh trên cả HEAD lẫn baseline, theo round 2): 
- npm test -w @quy-hang/core: E1, E3, E8
- npm run test:ro-ri: E1b, E2b
- db:migrate và db:test: E2, E5b, E7, E9
- npm test -w @quy-hang/web: E4
- npm run test:db -w @quy-hang/web: E4c
- design-floor-khuon --kiem: E10

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, xác định).

## Iterations

Round 1: bước chạy đầu, các eval chạy lần đầu; sửa vòng 1 sau phản biện.
Round 2: E5b, E7, E9, E10 chạy lại; sửa vòng 2 sau phản biện.
Round 3: E1, E1b, E2, E2b, E3, E4, E4b, E4c, E8 chạy lại, các eval còn lại mang sang từ round trước; tất cả PASS.

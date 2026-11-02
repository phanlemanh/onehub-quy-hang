---
schema_version: 2
feature_slug: mo-so-lead
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8fdbf697a2207460eb65dd8678872f7aeae625f7
human_signoff: Manh Phan 2026-11-02
---

# Evidence Report: mo-so-lead

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-5 | ui-check | PASS |
| E7 | AC-6 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-mo-so-lead-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T07:48:44Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 29609.895542

- eval: E2
  run_id: minted-mo-so-lead-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T07:48:44Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 29609.895542

- eval: E3
  run_id: minted-mo-so-lead-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T07:41:23Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-mo-so-lead-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T07:48:44Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 29609.895542

- eval: E5
  run_id: minted-mo-so-lead-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T07:41:23Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-mo-so-lead-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T07:41:23Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval (khung chup va observed la cua luot goc)
  screenshot: evidence/E6-1-mo-so.png
  observed: |
    Đã mở từng frame bằng Read. Khung 1 (1440x900, E6-1-mo-so.png): nhóm «Lead mới» đếm 2, hai dòng lead. Dòng 1 «Toà A · A-09.05» nấc «Đã nhận» có nút Đã gọi, Trả lại · Số không liên lạc được và «Mở số». Dòng 2 «Toà A · chỉ biết toà» nấc «Đã gửi» có Nhận, Đã gọi, Trả lại và «Mở số». Chưa có số nào hiện. Khớp Expected. Khung 2 (E6-2-so-hien.png): sau khi bấm «Mở số» ở dòng 1, dòng hiện «0900 000 033» kèm nút «Gọi». a[href^="tel:"] có href tel:0900000033. Nhãn vẫn «Đã nhận», nút Đã gọi/Trả lại giữ nguyên, dòng vẫn ở «Lead mới». Dòng 2 vẫn là «Mở số». Khớp. Khung 3 (E6-3-dien-thoai.png, 375x812x3 mobile touch): sau khi tải lại và bấm «Mở số», bố cục xếp dọc. Số «0900 000 033» và nút «Gọi» nằm dưới tên lead, dưới cả các nút hành động. Đo toạ độ: tên y=329, số y=537, scrollWidth bằng viewport 375, không tràn ngang. Khớp. Khung 4 (E6-4-tai-lai.png, 1440x900): sau khi tải lại, cả hai dòng lại là «Mở số», không có số, 0 thẻ tel:. Khớp. Khung 5 (E6-5-sau-nhan.png): bấm «Nhận» ở dòng Đã gửi thì dòng đó thành «Đã nhận» và vẫn còn «Mở số». Bấm «Mở số» thì hiện «0900 000 039» kèm «Gọi», tel:0900000039. Khớp. Khung 6 (E6-6-mat-mang.png, Offline): bấm «Mở số» ở dòng 1 thì dưới nút hiện chữ đỏ «Mất mạng — chưa mở được số, thử lại khi có mạng.», nút «Mở số» vẫn enabled (disabled=false). Thanh trên hiện «Mất mạng · đang xem bản trên máy». Bỏ Offline, bấm lại thì số hiện (tel:0900000033 và tel:0900000039), dòng lỗi biến mất. Khớp. Khung 7 (E6-7-dang-mo.png, Slow 3G): chụp ngay sau khi bấm «Mở số» ở dòng 1. Đã gọi, Trả lại và Mở số của dòng đó đều mờ đi, DOM xác nhận button.disabled=true, chưa có số. Dòng 2 vẫn bình thường. Khớp (nút bị khoá lúc chờ). Dò lưu trữ: localStorage có 1 khoá «qh:danh-muc:v1:<mã sàn>». Không có sessionStorage hay Cache Storage. IndexedDB có 1 cơ sở «quy-hang-sync:<mã>» gồm store «ngan» với 1 bản ghi. Quét cả khoá lẫn giá trị bằng regex phủ 0900000xxx, 0900 000 xxx, +84900000xxx, 84900000xxx (đã tự kiểm regex bắt đúng bốn dạng mẫu) → 0 lần khớp. Không phát hiện mâu thuẫn nào với Expected.
  network_observed: clean

- eval: E7
  run_id: minted-mo-so-lead-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T07:41:23Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-mo-so-lead-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-02T07:48:44Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-mo-so-lead-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-02T07:48:44Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-mo-so-lead-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-02T07:48:44Z

- cmd: npm run test:hooks
  run_id: minted-mo-so-lead-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-02T07:48:44Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-mo-so-lead-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-02T07:48:44Z

- cmd: npm run typecheck
  run_id: minted-mo-so-lead-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-02T07:48:44Z

- cmd: npm run lint
  run_id: minted-mo-so-lead-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-02T07:48:44Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi); moi block eval ghi baseline: n-a.

Eval không phân biệt (xanh trên cả mã hiện tại lẫn mã cũ, theo bản đo ở round 1; cần viết lại để assert hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý):
- npm run db:migrate && npm run db:test: E1, E2, E3, E4
- npm test -w @quy-hang/web: E5, E7

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: 10 kết quả về đủ, PASS; một finding trong hợp đồng (AC-4, đối chứng dương cho vế danh sách lead giao) và ba finding ngoài hợp đồng. Trả về triển khai, sửa ở commit 09d8224.
Round 2: chạy lại E1, E2, E4 và toàn bộ lệnh suite trên commit 09d82242c60b0b22c0fbff6ad893f61425313bf5, đều xanh; E3, E5, E6, E7 mang sang từ round 1 vì delta không chạm paths của chúng. Ghi chú: mốc verified_at của các khối round 2 là mốc lúc soạn báo cáo, không phải mốc máy ghi trong nhật ký chạy.


### Re-pin lần 1 — 2026-11-02, do gộp nhánh chính sau lượt chấm
run_id: repin-20261102T093442Z-18041
sha: 2f1979393015e9a1cdd707ad401436cb8578763a · suites: 7 lệnh exit 0 · evals: 6/6 eval máy đạt kỳ vọng · ngoài làn máy: E6 · diff chạm vật đo ngoài làn máy: E6 — chưa chứng lại, đi vòng S4 delta

### Re-pin lần 2 — 2026-11-02, do gộp nhánh chính sau #85
run_id: repin-20261102T095546Z-22011
sha: 0fb6c1c26a011bd959f34e4bf1876ed3d6d1f2ec · suites: 7 lệnh exit 0 · evals: 6/6 eval máy đạt kỳ vọng · ngoài làn máy: E6 · diff chạm vật đo ngoài làn máy: E6 — chưa chứng lại, đi vòng S4 delta

### Re-pin lần 3 — 2026-11-02, do gộp nhánh chính sau #84
run_id: repin-20261102T100504Z-95143
sha: 8fdbf697a2207460eb65dd8678872f7aeae625f7 · suites: 7 lệnh exit 0 · evals: 6/6 eval máy đạt kỳ vọng · ngoài làn máy: E6 · diff chạm vật đo ngoài làn máy: E6 — chưa chứng lại, đi vòng S4 delta

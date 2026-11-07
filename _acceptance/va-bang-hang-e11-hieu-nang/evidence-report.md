---
schema_version: 2
feature_slug: va-bang-hang-e11-hieu-nang
verdict: REJECT
failed_evals: [E3]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8f36e01debc719ecafdb18bef0f3d2b546cec82e
human_signoff:
---

# Evidence Report: va-bang-hang-e11-hieu-nang

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | không đạt kỳ vọng khai báo (giới hạn đã khai không còn, xem Known limits) |
| E2b | AC-2 | script | PASS |
| E3 | AC-3 | ui-check | FAIL |
| E3b | AC-5 | test | PASS (carry-forward từ round 1) |
| E4 | AC-4 | script | PASS (carry-forward từ round 1) |
| E5 | AC-4 | script | PASS (carry-forward từ round 1) |
| E6 | AC-4 | script | PASS (carry-forward từ round 1) |
| E7 | AC-4 | script | PASS (carry-forward từ round 1) |

Lệnh fail không gắn eval: ui-check:E3 (gắn với E3, lệnh dừng không thành công).

## Evidence

- eval: E1
  run_id: minted-va-bang-hang-e11-hieu-nang-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: bash _acceptance/va-bang-hang-e11-hieu-nang/thu/kiem-e11.sh
  verified_at: 2026-11-07T16:27:39Z
  output: |
    E11 cặp ĐẠT

- eval: E2
  run_id: minted-va-bang-hang-e11-hieu-nang-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: E11_SHA=fbdad5ad519a5c154a0385f0c8d7f81ab4a59454 bash _acceptance/va-bang-hang-e11-hieu-nang/thu/kiem-e11.sh
  verified_at: 2026-11-07T16:27:39Z
  output: |
    E11 cặp ĐẠT
    (kỳ vọng khai báo là bản chậm phải ra đỏ; lần chạy này ra đạt, thước chưa phân biệt được bản chậm)

- eval: E2b
  run_id: minted-va-bang-hang-e11-hieu-nang-E2b-r2
  exit_code: 0
  baseline: n-a
  verifier: E11_SHA=028f56366fb9e425239b7642b861e7ec0e35c078 bash _acceptance/va-bang-hang-e11-hieu-nang/thu/kiem-e11.sh
  verified_at: 2026-11-07T16:27:39Z
  output: |
    E11 cặp ĐẠT

- eval: E3
  run_id: minted-va-bang-hang-e11-hieu-nang-E3-r2
  exit_code: 1
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-07T16:27:39Z
  screenshot: evidence/E3-1-tich.png
  observed: |
    E3-1-tich.png: ô đếm «5000 / 5000 căn», thanh hành động «1 căn đã chọn», các nút Đổi trạng thái, Đánh dấu đã gọi, Bỏ chọn. Hàng 1 (Toà A, A-11.01, 1PN) có ô tích đậm, các hàng khác trống. Có hộp đỏ «Chưa đọc được danh bạ thành viên» với nút Thử lại.
    E3-2-cuon-ve.png: lưới ở đầu danh sách sau khi cuộn xuống rồi về. Vẫn «5000 / 5000 căn» và «1 căn đã chọn», hàng 1 vẫn tích, các hàng khác trống. Giống E3-1.
    E3-3-bo-tich.png: không còn thanh hành động, chỉ còn «5000 / 5000 căn». Hàng 1 không tích, ô «Chọn hết» ở đầu cột trống. Hộp đỏ danh bạ vẫn còn.
    E3-4-chon-het.png: ô «Chọn hết» tích đậm, thanh hiện «5000 căn đã chọn». Hàng 1 đến 11 đều tích.
    E3-5-cuon-sau-chon-het.png: lưới ở hàng 396 đến 410 (mã dạng A-08.05-M3691), tất cả ô đang hiện đều tích. Thanh vẫn «5000 căn đã chọn», ô đếm «5000 / 5000 căn».
    Cả năm bước khớp Expected và mỗi ảnh đều thấy số trên thanh cùng N ở ô đếm. Eval không đạt chỉ vì NETWORK TRUTH: hai request của app (catalog và member-names) báo lỗi máy chủ.
  network_observed: app-fail
  ghi chú: năm bước nhìn đều đúng; eval không đạt vì request nội bộ của app lỗi (chi tiết thô trong evidence/E3-network.txt). Nhật ký máy chủ chỉ ra lỗi ở packages/api/src/catalog/doc-ca-danh-muc.ts:78, mỗi lần mất khoảng 10 giây. Máy chủ dev đã tắt và khoá đã nhả.

- eval: E3b
  run_id: minted-va-bang-hang-e11-hieu-nang-E3b-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-07T15:45:15Z
  carried_from_round: 1
  ghi chú: carry-forward từ round 1 — delta không chạm paths của eval

- eval: E4
  run_id: minted-va-bang-hang-e11-hieu-nang-E4-r1
  exit_code: 0
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-07T15:45:15Z
  carried_from_round: 1
  ghi chú: carry-forward từ round 1 — delta không chạm paths của eval

- eval: E5
  run_id: minted-va-bang-hang-e11-hieu-nang-E5-r1
  exit_code: 0
  verifier: config:executors.script.lint
  verified_at: 2026-11-07T15:45:15Z
  carried_from_round: 1
  ghi chú: carry-forward từ round 1 — delta không chạm paths của eval

- eval: E6
  run_id: minted-va-bang-hang-e11-hieu-nang-E6-r1
  exit_code: 0
  verifier: config:executors.design.khuon
  verified_at: 2026-11-07T15:45:15Z
  carried_from_round: 1
  ghi chú: carry-forward từ round 1 — delta không chạm paths của eval

- eval: E7
  run_id: minted-va-bang-hang-e11-hieu-nang-E7-r1
  exit_code: 0
  verifier: config:executors.design.floor
  verified_at: 2026-11-07T15:45:15Z
  carried_from_round: 1
  ghi chú: carry-forward từ round 1 — delta không chạm paths của eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-bang-hang-e11-hieu-nang-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-07T16:27:39Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-bang-hang-e11-hieu-nang-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-07T16:27:39Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-bang-hang-e11-hieu-nang-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-07T16:27:39Z

- cmd: npm run test:hooks
  run_id: minted-va-bang-hang-e11-hieu-nang-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-07T16:27:39Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-bang-hang-e11-hieu-nang-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-07T16:27:39Z

- cmd: npm run typecheck
  run_id: minted-va-bang-hang-e11-hieu-nang-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-07T16:27:39Z

- cmd: npm run lint
  run_id: minted-va-bang-hang-e11-hieu-nang-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-07T16:27:39Z

## Known limits

- E2 (AC-2): giới hạn đã khai không còn — evals.yaml khai mã 1, lần chạy này trả 0. Gỡ lỗi khai ở vòng sau.

## Ngoài hợp đồng

## Analyst

Baseline không đo:
- bash _acceptance/va-bang-hang-e11-hieu-nang/thu/kiem-e11.sh: bo qua baseline: tep _acceptance/va-bang-hang-e11-hieu-nang/thu/kiem-e11.sh co o cay dang kiem nhung chua co o merge-base fbdad5ad519a5c154a0385f0c8d7f81ab4a59454 — eval moi, chay tren code cu khong phan biet gi
- E11_SHA=fbdad5ad519a5c154a0385f0c8d7f81ab4a59454 bash _acceptance/va-bang-hang-e11-hieu-nang/thu/kiem-e11.sh: bo qua baseline: tep _acceptance/va-bang-hang-e11-hieu-nang/thu/kiem-e11.sh co o cay dang kiem nhung chua co o merge-base fbdad5ad519a5c154a0385f0c8d7f81ab4a59454 — eval moi, chay tren code cu khong phan biet gi
- E11_SHA=028f56366fb9e425239b7642b861e7ec0e35c078 bash _acceptance/va-bang-hang-e11-hieu-nang/thu/kiem-e11.sh: bo qua baseline: tep _acceptance/va-bang-hang-e11-hieu-nang/thu/kiem-e11.sh co o cay dang kiem nhung chua co o merge-base fbdad5ad519a5c154a0385f0c8d7f81ab4a59454 — eval moi, chay tren code cu khong phan biet gi

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: BLOCKED vì bộ đo (bộ đo không chạy được trong lượt chấm). Returned to implementation (commit sửa bộ đo chạy được).
Round 2: E3 failed — năm bước nhìn đúng nhưng hai request của app (catalog và member-names) lỗi máy chủ nên không đạt NETWORK TRUTH; E2 cũng không đạt kỳ vọng khai báo (giới hạn đã khai không còn). Returned to implementation.

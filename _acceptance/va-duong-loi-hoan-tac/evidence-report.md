---
schema_version: 2
feature_slug: va-duong-loi-hoan-tac
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d0220c8bf08554db0276d659434af8ef6c1bdf94
human_signoff:
---

# Evidence Report: va-duong-loi-hoan-tac

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-3 | ui-check | PASS |
| E7 | AC-6 | ui-check | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-7 | script | PASS |
| E10 | AC-7 | script | PASS |
| E11 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-duong-loi-hoan-tac-E1-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-04T02:49:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-va-duong-loi-hoan-tac-E2-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-04T02:49:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-va-duong-loi-hoan-tac-E3-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-04T02:49:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-va-duong-loi-hoan-tac-E4-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-04T02:49:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-va-duong-loi-hoan-tac-E5-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-04T02:49:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: E6-20261104-playwright-sach
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T04:44:43Z
  screenshot: evidence/E6-da-doi.png
  observed: |
    E6-da-doi.png: ô Mã căn lọc A-04.06, một hàng Toà A 3PN Đang bán; panel phải hiện giá «8 tỷ», thông báo góc dưới phải «Đã đổi giá A-04.06 / Tính là vừa xác nhận với chủ nhà» kèm nút «Hoàn tác». Khớp bước 1.
    E6-hong.png: chỉ báo trên cùng đổi thành «Lỗi kho trên máy · thay đổi chưa lưu được»; panel vẫn «8 tỷ»; thông báo lỗi «Không hoàn tác được: Máy chưa lưu được lần sửa — thử lại — giá A-04.06» có nút «Hoàn tác». Khớp Expected.
    E6-lai-nut.png: chỉ báo về «Đã đồng bộ»; panel giá «7,95 tỷ» (giá cũ); thông báo «Đã hoàn tác giá A-04.06», không nút. Khớp.
    E6-lai-phim.png (lượt b sau Ctrl+Z): căn B-09.01 Tạm ngưng, ô Mã căn có tiêu điểm, panel giá «2,82 tỷ», cột Giá trên lưới «2,82 tỷ»; thông báo «Đã hoàn tác giá B-09.01». Khớp giá cũ.
    Các lần Ctrl+Z thêm ở cả (a) và (b) không sinh thông báo mới và giá không đổi (xác nhận bằng DOM và API; ở ảnh E6-step4-ctrlz2.png). Không mâu thuẫn Expected.
  network_observed: clean

- eval: E7
  run_id: E7-va-duong-loi-hoan-tac-2026-11-04
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T04:44:43Z
  screenshot: evidence/E7-lo.png
  observed: |
    E7-lo.png (đã mở): lưới Toà B, 5 căn B-15.01, B-03.04, B-13.02, B-15.05, B-14.06 đều «Tạm ngưng» (badge cam), ô tích đã bỏ sau khi đổi, toast góc phải «Đã đổi trạng thái 5 căn» + nút «Hoàn tác». E7-mot-phan.png (đã mở): toast «Đã hoàn tác 3 căn · 2 căn chưa hoàn tác được», mô tả «B-03.04 (Máy chưa lưu được lần sửa — thử lại) · B-15.05 (Máy chưa lưu được lần sửa — thử lại)», nút «Hoàn tác»; lưới: B-15.01, B-13.02, B-14.06 «Đang bán», B-03.04 và B-15.05 vẫn «Tạm ngưng» và đang tích, header «2 căn đã chọn». E7-lai.png (đã mở): toast «Đã hoàn tác 2 căn» (không nút); B-03.04, B-15.05, B-13.02, B-14.06 «Đang bán» (B-15.01 «Đang bán» ở hàng 21), thanh đồng bộ «Đang gửi 1 thay đổi». Tất cả khớp Expected.
  network_observed: clean

- eval: E8
  run_id: minted-va-duong-loi-hoan-tac-E8-r1
  exit_code: 0
  verifier: config:executors.script.lint
  verified_at: 2026-11-04T02:49:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-va-duong-loi-hoan-tac-E9-r1
  exit_code: 0
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-04T02:49:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-va-duong-loi-hoan-tac-E10-r1
  exit_code: 0
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T02:49:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-va-duong-loi-hoan-tac-E11-r1
  exit_code: 0
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-04T02:49:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-duong-loi-hoan-tac-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-04T04:44:43Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-duong-loi-hoan-tac-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-04T04:44:43Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-duong-loi-hoan-tac-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-04T04:44:43Z

- cmd: npm run test:hooks
  run_id: minted-va-duong-loi-hoan-tac-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-04T04:44:43Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-duong-loi-hoan-tac-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-04T04:44:43Z

- cmd: npm run typecheck
  run_id: minted-va-duong-loi-hoan-tac-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-04T04:44:43Z

- cmd: npm run lint
  run_id: minted-va-duong-loi-hoan-tac-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-04T04:44:43Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E6, E7 failed — bai cham giao dien khong khop Expected. Returned to implementation.
Round 2: E6, E7 failed — nhat ky mang dung chung giua hai bai chay song song, ho so trinh duyet chua sach. Returned to implementation.
Round 3: tat ca eval PASS — E6, E7 chay lai tren trinh duyet sach; E1-E5, E8-E11 mang sang tu round 1.


### Re-pin lần 1 — 2026-11-04, do gộp nhánh chính vào nhánh trước khi gộp PR #110
run_id: repin-20261104T050319Z-63125
sha: d0220c8bf08554db0276d659434af8ef6c1bdf94 · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng · ngoài làn máy: E6, E7 · AC không có chốt máy: AC-6

---
schema_version: 2
feature_slug: va-cai-dat-mat-viec
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 744ef0681799d7526c4283e0d8fb9079cc777f2a
human_signoff: Manh Phan 2026-11-09
---

# Evidence Report: va-cai-dat-mat-viec

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | ui-check | PASS |
| E11 | AC-10 | script | PASS |
| E12 | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-cai-dat-mat-viec-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs
  verified_at: 2026-11-09T05:56:25Z
  output: |
    kiem-man.mjs chạy một lượt, mã thoát 0; dòng đo cuối: loiLabel 0, luuBamDuoc true ở khổ 375 và 1440.

- eval: E2
  run_id: minted-va-cai-dat-mat-viec-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs
  verified_at: 2026-11-09T05:56:25Z
  output: |
    kiem-man.mjs chạy một lượt, mã thoát 0; cùng lượt chạy với E1.

- eval: E3
  run_id: minted-va-cai-dat-mat-viec-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs
  verified_at: 2026-11-09T05:56:25Z
  output: |
    kiem-man.mjs chạy một lượt, mã thoát 0; cùng lượt chạy với E1.

- eval: E4
  run_id: minted-va-cai-dat-mat-viec-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs
  verified_at: 2026-11-09T05:56:25Z
  output: |
    kiem-man.mjs chạy một lượt, mã thoát 0; cùng lượt chạy với E1.

- eval: E5
  run_id: minted-va-cai-dat-mat-viec-E5-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-09T05:27:54Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5b
  run_id: minted-va-cai-dat-mat-viec-E5b-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs
  verified_at: 2026-11-09T05:56:25Z
  output: |
    kiem-man.mjs chạy một lượt, mã thoát 0; cùng lượt chạy với E1.

- eval: E6
  run_id: minted-va-cai-dat-mat-viec-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs
  verified_at: 2026-11-09T05:56:25Z
  output: |
    kiem-man.mjs chạy một lượt, mã thoát 0; cùng lượt chạy với E1.

- eval: E7
  run_id: minted-va-cai-dat-mat-viec-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs
  verified_at: 2026-11-09T05:56:25Z
  output: |
    kiem-man.mjs chạy một lượt, mã thoát 0; cùng lượt chạy với E1.

- eval: E8
  run_id: minted-va-cai-dat-mat-viec-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs
  verified_at: 2026-11-09T05:56:25Z
  output: |
    kiem-man.mjs chạy một lượt, mã thoát 0; cùng lượt chạy với E1.

- eval: E9
  run_id: minted-va-cai-dat-mat-viec-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs
  verified_at: 2026-11-09T05:56:25Z
  output: |
    {"375":{"loiLabel":0,"tenO":"Tỉ lệ môi giới (%)","dongChungDuong":true,"soHienDung":true,"luuBamDuoc":true},"1440":{"loiLabel":0,"tenO":"Tỉ lệ môi giới (%)","dongChungDuong":true,"soHienDung":true,"luuBamDuoc":true}}

- eval: E10
  run_id: minted-va-cai-dat-mat-viec-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs
  verified_at: 2026-11-09T05:56:25Z
  screenshot: evidence/E10-step2.png
  observed: |
    giu-nhan.png (1440x900): đủ vỏ (thanh trên, menu trái, breadcrumb, tiêu đề Trạng thái). Dưới trạng thái «Đang bán» còn nhãn riêng «Nhãn hai» ở ô nhập, kèm «1 căn đang mang» và nút xoá. Cuối trang chỉ lộ một mảnh nút trắng sáng ở mép dưới (có vẻ là nút Lưu ở dạng bật, nhưng bị cắt nên không đọc được chữ). Không chữ đè nhau. xoa-loi.png: hộp «Xoá «Cột sẽ xoá»?» còn mở, có câu lỗi đỏ «Chưa xoá được — dòng vẫn giữ nguyên, thử lại» đọc rõ, nằm giữa phần mô tả và hàng nút, nút Huỷ và Xoá nằm dưới, không đè. mau-375.png (375x812): bảng Mẫu nhập không cuộn ngang, Sửa và Xoá nằm trong màn ở từng hàng, mô tả ngắt dòng gọn; dòng chữ X dài ngắt dòng ở hàng cuối, bị thanh điều hướng dưới che phần cuối do đang cuộn, không đè cột nút. mau-375-hop.png: hộp xoá nằm gọn trong màn, tiêu đề và mô tả chữ X dài ngắt dòng, nút Xoá và Huỷ xếp dọc rõ ràng, không tràn. mau-1440.png (1440x900): bảng đủ năm cột (Tiêu đề trong file, Ghép vào, Quy đổi, Nguồn, cột nút Sửa/Xoá), đủ vỏ, chữ X dài ngắt dòng trong cột đầu, không đè sang cột khác, không tràn.
  network_observed: n-a (driver)

- eval: E11
  run_id: minted-va-cai-dat-mat-viec-E11-r1
  exit_code: 0
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-09T05:27:54Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-va-cai-dat-mat-viec-E12-r1
  exit_code: 0
  verifier: config:executors.design.khuon
  verified_at: 2026-11-09T05:27:54Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-cai-dat-mat-viec-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-09T05:56:25Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-cai-dat-mat-viec-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-09T05:56:25Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-cai-dat-mat-viec-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-09T05:56:25Z

- cmd: npm run test:hooks
  run_id: minted-va-cai-dat-mat-viec-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-09T05:56:25Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-cai-dat-mat-viec-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-09T05:56:25Z

- cmd: npm run typecheck
  run_id: minted-va-cai-dat-mat-viec-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-09T05:56:25Z

- cmd: npm run lint
  run_id: minted-va-cai-dat-mat-viec-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-09T05:56:25Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do
- node _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs: bo qua baseline: tep _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs co o cay dang kiem nhung chua co o merge-base 09724fe69e5811243ec24845b8a1cd5e48c21668 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lượt đầu đỏ do tắt máy dev chung; lệnh đo và bài nhìn được sửa cho chạy lần lượt, đo từng dòng theo giá trị riêng.
Round 2: E1-E4, E5b, E6-E10 chạy lại và đạt; E5, E11, E12 giữ nguyên từ round 1 (delta không chạm paths của chúng); các lệnh suite đều đạt.

### Re-pin lần 1 — 2026-11-09, do gộp main sau lượt chấm 2
run_id: repin-20261109T061315Z-92018
sha: 7317fd038234bf2f0187db181f5d50f93d8079a4 · suites: 7 lệnh exit 0 · evals: 12/12 eval máy đạt kỳ vọng · ngoài làn máy: E10 · suite chạy ở môi trường giống CI (biến rỗng: DATABASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, APP_URL)

### Re-pin lần 2 — 2026-11-09, do gộp main sau chữ ký
run_id: repin-20261109T071205Z-68842
sha: e1ec5be5f6ba3b2b325604a1629ceed69635fdfc · suites: 7 lệnh exit 0 · evals: 12/12 eval máy đạt kỳ vọng · ngoài làn máy: E10 · suite chạy ở môi trường giống CI (biến rỗng: DATABASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, APP_URL)

### Re-pin lần 3 — 2026-11-09, do gộp main khi tới lượt gộp, bản đồ khuôn đã ghim lại
run_id: repin-20261109T075753Z-14425
sha: 744ef0681799d7526c4283e0d8fb9079cc777f2a · suites: 7 lệnh exit 0 · evals: 12/12 eval máy đạt kỳ vọng · ngoài làn máy: E10 · suite chạy ở môi trường giống CI (biến rỗng: DATABASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, APP_URL)

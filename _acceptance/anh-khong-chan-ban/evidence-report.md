---
schema_version: 2
feature_slug: anh-khong-chan-ban
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6ec707acdf6b345f927fa16e98482c6435378424
human_signoff: Manh Phan 2026-11-07
---

# Evidence Report: anh-khong-chan-ban

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E6c | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | ui-check | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | script | PASS |
| E9c | AC-9 | test | PASS |
| E10 | AC-5 | script | PASS |

## Evidence

Round 3 chạy lại E5, E7, E8b. Các eval còn lại mang từ round 2 (carry-forward).

- eval: E5
  run_id: minted-anh-khong-chan-ban-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-07T07:55:11Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4401.6965

- eval: E7
  run_id: minted-anh-khong-chan-ban-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-07T07:55:11Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4401.6965

- eval: E8b
  run_id: minted-anh-khong-chan-ban-E8b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-07T07:55:11Z
  screenshot: evidence/E8b-step1.png
  observed: |
    Khổ 1440:
    - Cài đặt sàn › Trạng thái, nhóm «Lên Đang bán»: ô «Số ảnh thật tối thiểu để căn vào Đang bán» đang hiện 0. Câu nghĩa: «0 — căn lên Đang bán khi chưa có ảnh; ảnh hiện cần bổ sung. Đặt 1–20 thì căn phải đủ số ảnh thật mới lên.» Khớp expected.
    - Gõ 21: ô hiện 21 kèm khung đỏ «Cần số nguyên 0–20». Khớp.
    - Đầu chủ: trang cá nhân (/settings/personal) chỉ có mục Cá nhân và dòng «Mục này chỉ quản trị sàn mở được»; không có ô. Khớp.
    - Hôm nay (Đầu chủ): nhóm «Bổ sung ảnh» (1) với căn T-54167.01 và giá 3,20 tỷ. Có nhãn «Đổi giá, trạng thái · Mở hồ sơ» đè lên viền nút (xem ghi chú). Tạm chấp nhận.
    - Hồ sơ: T-54167.01 «Đang bán», dòng «Mức đủ thông tin · thiếu Ảnh thật» và 5/6. Khớp.
    - Bảng hàng: cột «Mức đủ» của căn hiện «5/6 · thiếu…» (JSON: 5/6 · thiếu ảnh thật). Khớp.
    Khổ 375:
    - Cài đặt: ô hiện 0 với câu nghĩa đủ, không tràn ngang.
    - Gõ 21: hiện lỗi «Cần số nguyên 0–20».
    - Đầu chủ: trang Cá nhân hiện «Mục này chỉ quản trị sàn mở được», không có ô.
    - Hôm nay: nhóm «Bổ sung ảnh» 1, dòng căn có nhãn «Đổi giá, trạng thái · Mở hồ sơ» nằm gọn trong nút.
    - Hồ sơ: ngăn hồ sơ hiện T-37209.01 «Đang bán», «thiếu Ảnh thật» 5/6.
    - Bảng hàng: thẻ căn T-37209.01 có ô ảnh trống bằng icon ảnh, không có cột Mức đủ (đúng khuôn thẻ điện thoại).
    Không có khung nào mâu thuẫn expected.
  network_observed: n-a (driver)

### Eval mang từ round trước (carry-forward)

- eval: E1
  run_id: minted-anh-khong-chan-ban-E1-r2
  exit_code: 0
  carried_from_round: 2
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-07T02:24:54Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-anh-khong-chan-ban-E2-r2
  exit_code: 0
  carried_from_round: 2
  baseline: n-a
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-07T02:24:54Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-anh-khong-chan-ban-E3-r2
  exit_code: 0
  carried_from_round: 2
  baseline: n-a
  verifier: config:executors.test.web_db
  verified_at: 2026-11-07T02:24:54Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-anh-khong-chan-ban-E4-r2
  exit_code: 0
  carried_from_round: 2
  baseline: n-a
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-07T02:24:54Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E5b
  run_id: minted-anh-khong-chan-ban-E5b-r2
  exit_code: 0
  carried_from_round: 2
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-07T02:24:54Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-anh-khong-chan-ban-E6-r2
  exit_code: 0
  carried_from_round: 2
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-07T02:24:54Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E6b
  run_id: minted-anh-khong-chan-ban-E6b-r2
  exit_code: 0
  carried_from_round: 2
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-07T02:24:54Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E6c
  run_id: minted-anh-khong-chan-ban-E6c-r2
  exit_code: 0
  carried_from_round: 2
  baseline: n-a
  verifier: config:executors.test.web_db
  verified_at: 2026-11-07T02:24:54Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-anh-khong-chan-ban-E8-r2
  exit_code: 0
  carried_from_round: 2
  baseline: n-a
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-07T02:24:54Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-anh-khong-chan-ban-E9-r2
  exit_code: 0
  carried_from_round: 2
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-07T02:24:54Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E9b
  run_id: minted-anh-khong-chan-ban-E9b-r2
  exit_code: 0
  carried_from_round: 2
  baseline: n-a
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-07T02:24:54Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E9c
  run_id: minted-anh-khong-chan-ban-E9c-r2
  exit_code: 0
  carried_from_round: 2
  baseline: n-a
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-07T02:24:54Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-anh-khong-chan-ban-E10-r2
  exit_code: 0
  carried_from_round: 2
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-07T02:24:54Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-anh-khong-chan-ban-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-07T07:55:11Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-anh-khong-chan-ban-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-07T07:55:11Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-anh-khong-chan-ban-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-07T07:55:11Z

- cmd: npm run test:hooks
  run_id: minted-anh-khong-chan-ban-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-07T07:55:11Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-anh-khong-chan-ban-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-07T07:55:11Z

- cmd: npm run typecheck
  run_id: minted-anh-khong-chan-ban-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-07T07:55:11Z

- cmd: npm run lint
  run_id: minted-anh-khong-chan-ban-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-07T07:55:11Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 2 — baseline khong do lai round nay

Eval không-phân-biệt (pass trên cả HEAD lẫn baseline ở lần đo round 2; hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/core: E1, E5b, E6
- npm run test:ro-ri: E9b
- bước chấm khuôn design-floor-khuon (--kiem): E10

Baseline khong do: round này không đo lại (evals.yaml không đổi từ lần baseline cuối, round 2); mọi field baseline ghi n-a.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lịch sử round này không có trong dữ liệu được giao cho bản báo cáo này.
Round 2: S4 lượt 2, hợp đồng verified; toàn bộ eval PASS.
Round 3: sửa nút «Sẵn sàng bán» xử số ảnh tối thiểu chưa đọc được như sàn đòi ảnh (commit 0126278f); chạy lại E5, E7, E8b cùng các lệnh suite, tất cả PASS; các eval còn lại mang từ round 2.

### Re-pin lần 1 — 2026-11-07, do hoá cũ do gộp main vào nhánh trước khi gộp
run_id: repin-20261107T094820Z-25392
sha: 6ec707acdf6b345f927fa16e98482c6435378424 · suites: 7 lệnh exit 0 · evals: 15/15 eval máy đạt kỳ vọng · ngoài làn máy: E8b · diff chạm vật đo ngoài làn máy: E8b — chưa chứng lại, đi vòng S4 delta

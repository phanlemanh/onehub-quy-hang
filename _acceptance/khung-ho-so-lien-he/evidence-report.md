---
schema_version: 2
feature_slug: khung-ho-so-lien-he
verdict: REJECT
failed_evals: ["E8"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e1eb1fc1b0a609906db35a3644303ae683d6befb
human_signoff:
---

# Evidence Report: khung-ho-so-lien-he

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | script | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | ui-check | FAIL |

## Evidence

- eval: E1
  run_id: minted-khung-ho-so-lien-he-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T01:09:23Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6709.868167

- eval: E2
  run_id: minted-khung-ho-so-lien-he-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T01:09:23Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6709.868167

- eval: E3
  run_id: minted-khung-ho-so-lien-he-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T01:09:23Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6709.868167

- eval: E4
  run_id: minted-khung-ho-so-lien-he-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T01:09:23Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6709.868167

- eval: E5
  run_id: minted-khung-ho-so-lien-he-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T01:09:23Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6709.868167

- eval: E6
  run_id: minted-khung-ho-so-lien-he-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-08T01:09:23Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 31786.967083

- eval: E6b
  run_id: minted-khung-ho-so-lien-he-E6b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-08T01:09:23Z
  output: |
    design-floor-khuon --kiem --root .
    7 tệp giao diện ngoài bản đồ

- eval: E7
  run_id: minted-khung-ho-so-lien-he-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T01:09:23Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6709.868167

- eval: E7b
  run_id: minted-khung-ho-so-lien-he-E7b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T01:09:23Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6709.868167

- eval: E8
  run_id: minted-khung-ho-so-lien-he-E8-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-08T01:09:23Z
  screenshot: evidence/E8-step1.png
  observed: |
    Frames đã mở bằng Read. E8-step1.png (1440 sáng): /contacts, hồ sơ "[Tên] chủ nhà" mở trong khung bên phải, viền bo cao hết cột, có nút X (aria "Đóng hồ sơ"); bảng đủ bốn cột Tên · Người giữ · Cơ hội mở · Căn (cột đầu nhãn "Tên", không phải "Người"), không cuộn ngang, dòng người ấy được tô xám nhạt. E8-step2.png (cao 380): hồ sơ đã cuộn riêng; tiêu đề khung "Liên hệ", ô tìm, hàng tên cột đứng yên khi cuộn danh sách (đã nhân dòng DOM lên 40 vì seed chỉ có 1 người; top không đổi). E8-step3.png: sau gõ "chủ" rồi Esc hồ sơ vẫn mở. E8-step4.png: /inventory, hồ sơ căn C-05.10 có khung, nút Mở toàn màn, nút Đóng như trước. E8-step7.png / E8-step7b.png: hộp chọn "Loại" đóng bằng Esc, hồ sơ giữ; sau Đóng bảng rộng 1125px hết vùng làm việc (ảnh step7b). E8-step8.png (375): ngăn hồ sơ dạng ngăn kéo dưới lên, tên + nút X, không tràn ngang (scrollWidth 375), không vỡ. Không lỗi console. BƯỚC 6 SAI: sau khi tải xong có một lượt đọc danh sách liên hệ từ máy khách.
  network_observed: app-fail
  output: |
    Server dùng chung 3491 (không tắt). Đăng nhập truong-nhom bằng mã dev. Chrome-devtools, theme sáng.
    Bước 1, 3, 4, 8: đạt. Bước 2, 5, 7: đạt có dè dặt (seed chỉ có 1 liên hệ, không có người mua, không có trường riêng).
    Bước 6 (CPU 4x + Slow 4G) SAI: sau khi tải xong, máy khách vẫn đọc lại danh sách liên hệ (initiator fetch, không thao tác), cả ở /contacts lẫn ?type=Buyer, dù HTML máy chủ đã chứa danh sách đầu. Trái tiêu chí không đọc lại sau khi tải xong. Lỗi là cứ chạy lại lần đầu ở vung.tsx useEffect (canDocLan không chặn, chưa tìm rõ nguyên nhân).
    Không có ảnh bước 5, 6 (assert bằng số liệu). Console error/warn: không có.
    Số liệu thô: _acceptance/khung-ho-so-lien-he/evidence/E8-network.txt

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-khung-ho-so-lien-he-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-08T01:09:23Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-khung-ho-so-lien-he-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-08T01:09:23Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-khung-ho-so-lien-he-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-08T01:09:23Z

- cmd: npm run test:hooks
  run_id: minted-khung-ho-so-lien-he-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-08T01:09:23Z

- cmd: npm run typecheck
  run_id: minted-khung-ho-so-lien-he-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-08T01:09:23Z

- cmd: npm run lint
  run_id: minted-khung-ho-so-lien-he-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-08T01:09:23Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả code mới lẫn baseline, chứng minh harness chứ chưa chứng minh tính năng; cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/web, phủ E1, E2, E3, E4, E5, E7, E7b
- npm test -w @quy-hang/ui-lint, phủ E6
- design-floor-khuon --kiem --root ., phủ E6b

Lệnh fail không gắn eval: ui-check:E8 (phủ E8, chính là eval đã hỏng ở trên).

## Variance

none — mọi eval chạy một lần, không có eval ngẫu nhiên.

## Iterations

Round 1: E8 failed — bước 6: sau khi tải xong, máy khách vẫn đọc lại danh sách liên hệ dù máy chủ đã trao trang đầu (canDocLan không chặn lượt đầu ở vung.tsx). Returned to implementation.

---
schema_version: 2
feature_slug: khung-ho-so-lien-he
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b1281aa1712d2b3dca910a324c45d0547e5a9680
human_signoff:
---

# Evidence Report: khung-ho-so-lien-he

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS (carry-forward từ round 1) |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | script | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-khung-ho-so-lien-he-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T01:19:07Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6716.356084

- eval: E2
  run_id: minted-khung-ho-so-lien-he-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T01:19:07Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6716.356084

- eval: E3
  run_id: minted-khung-ho-so-lien-he-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T01:19:07Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6716.356084

- eval: E4
  run_id: minted-khung-ho-so-lien-he-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T01:19:07Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6716.356084

- eval: E5
  run_id: minted-khung-ho-so-lien-he-E5-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-08T01:09:23Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-khung-ho-so-lien-he-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-08T01:19:07Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 32715.547208

- eval: E6b
  run_id: minted-khung-ho-so-lien-he-E6b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-08T01:19:07Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    7 tệp giao diện ngoài bản đồ

- eval: E7
  run_id: minted-khung-ho-so-lien-he-E7-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T01:19:07Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6716.356084

- eval: E7b
  run_id: minted-khung-ho-so-lien-he-E7b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T01:19:07Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6716.356084

- eval: E8
  run_id: minted-khung-ho-so-lien-he-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-08T01:19:07Z
  screenshot: evidence/E8v-step1.png
  observed: |
    Đã mở và đọc các frame ở thư mục evidence/ (đường dẫn tuyệt đối /Users/manhphan/dev/onehub-quy-hang/.claude/worktrees/epic-einstein-86dac8/_acceptance/khung-ho-so-lien-he/evidence/).
    - E8v-list.png (1440, chưa chạm): bảng hết bề ngang vùng làm việc, 4 cột Tên · Người giữ · Cơ hội mở · Căn, một dòng "[Tên] chủ nhà".
    - E8v-step1.png (1440 sau khi chạm dòng): bảng thu lại còn 4 cột đủ, không thanh cuộn ngang; dòng được tô xám nhạt; ngăn hồ sơ bên phải có viền bo, cao hết cột, đầu hồ sơ có nút X Đóng hồ sơ, phần Số, Cơ hội, Căn, Dòng thời gian.
    - E8v-step2.png (khung nhìn thấp, thêm 40 dòng nhân bản trong DOM): các dòng bảng cuộn đi, còn tiêu đề "Liên hệ", ô tìm và hàng tên cột vẫn đứng yên; ngăn hồ sơ cuộn riêng.
    - E8v-step3b.png: gõ "chu" vào ô tìm rồi Esc thì hồ sơ vẫn mở. E8v-step3a.png: sau bấm Đóng hồ sơ đã đóng.
    - E8v-step4.png (/inventory): hồ sơ căn C-05.10 trong khung bo, có nút mở toàn màn và nút X Đóng.
    - E8v-step7b.png/E8v-step7c.png: Esc đóng menu Tài khoản mà hồ sơ vẫn mở; sau Đóng hồ sơ bảng rộng hết vùng (bảng rộng 1125px, mép phải 1410 trên khung nhìn 1440).
    - E8v-step8.png (375): ngăn hồ sơ dạng ngăn kéo từ dưới lên, vừa chiều ngang, không tràn, nội dung đầy đủ. E8v-step8a.png: danh sách dạng thẻ.
    Khớp mô tả, không thấy lỗi bố cục.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-khung-ho-so-lien-he-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-08T01:19:07Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-khung-ho-so-lien-he-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-08T01:19:07Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-khung-ho-so-lien-he-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-08T01:19:07Z

- cmd: npm run test:hooks
  run_id: minted-khung-ho-so-lien-he-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-08T01:19:07Z

- cmd: npm run typecheck
  run_id: minted-khung-ho-so-lien-he-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-08T01:19:07Z

- cmd: npm run lint
  run_id: minted-khung-ho-so-lien-he-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-08T01:19:07Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả code mới lẫn baseline; chứng minh harness chứ chưa chứng minh feature — cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/web: E1, E2, E3, E4, E7, E7b
- npm test -w @quy-hang/ui-lint: E6
- design-floor-khuon.mjs --kiem --root .: E6b

Các lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E8 failed — bước 6: sau khi tải xong, máy khách vẫn đọc lại danh sách liên hệ dù máy chủ đã trao trang đầu (canDocLan không chặn lượt đầu ở vung.tsx). Returned to implementation.
Round 2: tất cả eval đạt; E5 carry-forward từ round 1 (delta không chạm paths của eval); E8 chạy lại trên bản thật, đạt.

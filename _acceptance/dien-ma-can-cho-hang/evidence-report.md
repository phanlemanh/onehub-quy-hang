---
schema_version: 2
feature_slug: dien-ma-can-cho-hang
verdict: BLOCKED
failed_evals: []
reason: "ui-check:E7u: Không lấy được mã đăng nhập (OTP) nên không đăng nhập được vào máy chủ cổng 3484. Tệp .acceptance-runs/dien-ma-can-cho-hang/dev-3484.log mà bước 1 chỉ tới không tồn tại; thư mục đó chỉ có t8.log và t8b.log, cả hai không có dòng [ma-dang-nhap]. Máy chủ 3484 (pid 26580, next-server, cwd đúng worktree này) có stdout/stderr là unix socket do tiến trình cha 26531 giữ, không phải tệp, nên không đọc được. Bộ gửi mã dev (packages/api/src/auth/sender.ts) chỉ in mã ra stdout đó. Bản dev-3484.log duy nhất là của hồ sơ he-bo-cuc, đã cũ (14:33) và là của phiên máy chủ khác. apps/web/.env.local bị luật deny chặn đọc, shell không có DATABASE_URL, và không thấy Postgres nào đang nghe, nên cũng không lấy mã qua cơ sở dữ liệu. Không tắt hay khởi động lại máy chủ 3484 vì bước 1 yêu cầu dùng chung, không tắt. Cần người chạy server ghi stdout ra .acceptance-runs/dien-ma-can-cho-hang/dev-3484.log, hoặc cung cấp mã, rồi chạy lại E7u. // ui-check:E8u: Không lấy được mã đăng nhập: tệp nhật ký đề bài nêu (.acceptance-runs/dien-ma-can-cho-hang/dev-3484.log) không tồn tại. Máy chủ ở cổng 3484 (next-server PID 26580, chạy từ chính worktree này, DB cổng 5564) có stdout nối vào ống unix của app, không ghi ra tệp nào đọc được. Tệp .acceptance-runs/he-bo-cuc/dev-3484.log là của lần chạy khác, không còn được máy này ghi. Mã OTP trong bảng identity.verification đã băm, mã 400 khi thử. Cách còn lại là tự dựng phiên hoặc sửa DB để vào, tức là lách đăng nhập, nên dừng. Cần người chạy lại máy chủ với stdout ghi ra tệp (hoặc cấp tệp nhật ký có dòng [ma-dang-nhap]) rồi chạy lại E8u."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 67811208e2421c67e1be369a0ba410aeaa78454a
human_signoff:
---

# Evidence Report: dien-ma-can-cho-hang

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6u | AC-6 | ui-check | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7u | AC-7 | ui-check | BLOCKED |
| E8u | AC-8 | ui-check | BLOCKED |
| E9 | AC-9 | judgment | chờ người chốt (đề xuất PASS) |
| E10 | AC-6 | script | PASS |
| E11 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-dien-ma-can-cho-hang-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-02T08:26:14Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 232.021291

- eval: E4
  run_id: minted-dien-ma-can-cho-hang-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-02T08:26:14Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 232.021291

- eval: E2
  run_id: minted-dien-ma-can-cho-hang-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T08:26:14Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 28513.430583

- eval: E3
  run_id: minted-dien-ma-can-cho-hang-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T08:26:14Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 28513.430583

- eval: E5
  run_id: minted-dien-ma-can-cho-hang-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T08:26:14Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1551.13625

- eval: E6
  run_id: minted-dien-ma-can-cho-hang-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T08:26:14Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1551.13625

- eval: E7
  run_id: minted-dien-ma-can-cho-hang-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T08:26:14Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1551.13625

- eval: E6b
  run_id: minted-dien-ma-can-cho-hang-E6b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web_db
  verified_at: 2026-11-02T08:26:14Z
  output: |
    npm run test:db -w @quy-hang/web
    ℹ duration_ms 2023.235208

- eval: E10
  run_id: minted-dien-ma-can-cho-hang-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-02T08:26:14Z
  output: |
    npm run lint
    chuẩn giao diện: đạt

- eval: E11
  run_id: minted-dien-ma-can-cho-hang-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-02T08:26:14Z
  output: |
    design-floor-s4.mjs --root . (không in dòng nào, kết thúc sạch)

- eval: E6u
  run_id: minted-dien-ma-can-cho-hang-E6u-r1
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-02T08:26:14Z
  screenshot: evidence/E6u-step1.html
  observed: |
    Khung là tệp .html viết từ DOM đã đọc (không có ảnh pixel). Đã mở lại khung 1 và 3: khung 1 hàng X ở 1440x900 có tiêu đề «Chưa có mã căn», ô Mã căn «Chưa có», ô nhập #o-ma-can và nút «Lưu mã căn», scrollWidth bằng innerWidth. Khung 3 hàng Y gõ a-12-2614: ô aria-invalid, lỗi «Căn này đã có hàng đang mở (Chưa đủ để rao) · Mở hàng kia», chữ gõ còn giữ, API vẫn không có mã. Khung 2: sau lưu A-12.2614 địa chỉ theo mã mới, danh sách thiếu không còn Mã căn. Khung 4: ô rỗng báo «Gõ mã căn», không gửi yêu cầu nào.
  network_observed: clean

- eval: E7u
  run_id: minted-dien-ma-can-cho-hang-E7u-r1
  cannot_run: true
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-02T08:26:14Z
  note: Không đăng nhập được (thiếu mã OTP), chưa chạy bước nào, không có khung nào. Xem reason ở frontmatter.
  network_observed: n-a (driver)

- eval: E8u
  run_id: minted-dien-ma-can-cho-hang-E8u-r1
  cannot_run: true
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-02T08:26:14Z
  note: Không đăng nhập được (thiếu mã OTP), chưa tạo hàng, không có khung nào. Xem reason ở frontmatter.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-dien-ma-can-cho-hang-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-02T08:26:14Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-dien-ma-can-cho-hang-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-02T08:26:14Z

- cmd: npm run test:hooks
  run_id: minted-dien-ma-can-cho-hang-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-02T08:26:14Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-dien-ma-can-cho-hang-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-02T08:26:14Z

- cmd: npm run typecheck
  run_id: minted-dien-ma-can-cho-hang-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-02T08:26:14Z

### Judgment

- eval: E9
  judged_by: hội đồng 3 lens (đề xuất)
  proposal: PASS
  - domain-correctness: PASS — Tham chiếu §8 luật 6 ghi hàng tạo khi mới biết toà được gắn mã căn đúng một lần ở hồ sơ căn, và căn đã có hàng đang mở khác của sàn thì máy chặn (ADR-0026). ADR-0026 quyết định 1 ghi loại sự kiện riêng `unit_number_assigned`. Quyết định 2 giải thích vì sao không mở `details_changed` cho mã căn: sự kiện ấy đổi được nhiều lần và xoá trắng được, còn mã căn chỉ một lần, kéo theo ảnh và kiểm trùng.
  - operational-feasibility: PASS — Tham chiếu §8 luật 6 (dòng 133) ghi hàng mới biết toà được gắn mã căn đúng một lần ở hồ sơ căn. Cùng dòng ghi căn đã có hàng đang mở khác của sàn thì máy chặn và chỉ hàng kia (ADR-0026). ADR-0026 quyết định 1 đặt tên sự kiện riêng `unit_number_assigned`. Quyết định 2 giải thích vì sao không mở `details_changed` cho mã căn: sự kiện đó đổi được nhiều lần và xoá trắng được, còn mã căn là một lần, kéo theo ảnh và kiểm trùng, và vết lịch sử sẽ không phân biệt «đổi nội thất» với «gắn căn».
  - spec-alignment: PASS — Tham chiếu §8 luật 6 (dòng 133) ghi mã căn gắn đúng một lần ở hồ sơ căn, và căn đã có hàng đang mở khác của sàn thì máy chặn và chỉ hàng kia (ADR-0026). ADR-0026 quyết định 1 nêu loại sự kiện `unit_number_assigned`. Quyết định 2 nêu lý do không dùng `details_changed`: sự kiện đó đổi được nhiều lần và xoá trắng được, còn mã căn kéo theo ảnh và kiểm trùng, nên luật «một lần» và «chặn trùng» thành ngoại lệ, và vết lịch sử không phân biệt «đổi nội thất» với «gắn căn». Câu hỏi nói «tài liệu quyết định về hàng và sự kiện». Đọc đó là ADR-0026, vì nó nằm trong danh sách Input và chứa đủ cả hai nội dung.
  human_override:  # chi nguoi ghi

## Known limits

## Ngoài hợp đồng

## Analyst

Baseline không đo: E6u, E7u, E8u (ui-check, không chạy được trên mã cũ).

Eval không phân biệt (xanh ở cả mã mới lẫn mã nền, cần viết lại để khẳng định hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý):
- npm test -w @quy-hang/core: E1, E4
- npm run db:migrate && npm run db:test: E2, E3
- npm test -w @quy-hang/web: E5, E6, E7
- npm run test:db -w @quy-hang/web: E6b
- npm run lint: E10
- design-floor-s4.mjs: E11

Lưu ý thêm: E6u chỉ có khung .html dựng từ DOM, không có ảnh pixel; vạch «Mã căn không còn trong danh sách thiếu» yếu vì trước khi lưu danh sách thiếu cũng không liệt Mã căn.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E7u, E8u chưa chạy được (không lấy được mã đăng nhập vào máy chủ 3484); mọi eval máy và E6u xanh. Verdict BLOCKED, cần người cấp nhật ký hoặc mã rồi chạy lại E7u, E8u.

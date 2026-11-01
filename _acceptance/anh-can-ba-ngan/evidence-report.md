---
schema_version: 2
feature_slug: anh-can-ba-ngan
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a869867534a7242670d346375ac5038dca20458b
human_signoff: Manh Phan 2026-11-01
---

# Evidence Report: anh-can-ba-ngan

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E6c | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | ui-check | PASS |
| E10b | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-anh-can-ba-ngan-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T08:53:48Z

- eval: E2
  run_id: minted-anh-can-ba-ngan-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-01T08:53:48Z

- eval: E3
  run_id: minted-anh-can-ba-ngan-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-01T08:53:48Z

- eval: E7
  run_id: minted-anh-can-ba-ngan-E7-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-01T08:53:48Z

- eval: E8
  run_id: minted-anh-can-ba-ngan-E8-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-01T08:53:48Z

- eval: E2b
  run_id: minted-anh-can-ba-ngan-E2b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T08:53:48Z

- eval: E5
  run_id: minted-anh-can-ba-ngan-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T08:53:48Z

- eval: E6
  run_id: minted-anh-can-ba-ngan-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T08:53:48Z

- eval: E6b
  run_id: minted-anh-can-ba-ngan-E6b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-11-01T08:53:48Z

- eval: E10b
  run_id: minted-anh-can-ba-ngan-E10b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-01T08:53:48Z

- eval: E10
  run_id: minted-anh-can-ba-ngan-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T08:53:48Z
  screenshot: evidence/E10-step1.png
  observed: |
    Đã mở và đối chiếu từng khung. Bước 1: cột hồ sơ A-06.01 mục Ảnh, thẻ «Gửi được (0)», chữ «Kéo ảnh từ Zalo vào đây, hoặc dán bằng ⌘V», khung trống «Chưa có ảnh gửi được / Thả ảnh vào khung này». Bước 2 (step2a-cho và step2: cả hai khung đều chụp sau khi ba bản nhẹ đã xong, khung ô chờ không bắt được vì tải nhanh, nhưng DOM sau thả có 3 ảnh): «Gửi được (3)», 3 thumbnail, ảnh đầu «Bìa», nhãn «Ảnh thật · 20/10/2026» trên JPEG có EXIF, hai ảnh PNG «Ảnh thật · 01/11/2026». Bước 3: thả tin-nhan.jpg: dải đỏ «tin-nhan.jpg — Không phải ảnh — Bỏ», vẫn 3 ảnh, không có POST. Bước 4: menu «Đưa lên đầu» rồi «Đặt làm ảnh bìa»: ảnh bep.png lên đầu mang «Bìa», EXIF-ảnh thứ hai; sau tải lại (step4b) thứ tự và «Bìa» giữ nguyên. Bước 5: thả «Sổ mẫu» lên tab Nội bộ: «Nội bộ (1)», 1 thumbnail mờ; step5-lon: hộp thoại bản lớn «Toà A A-06.01 · Ảnh thật · 01/11/2026» hiện ảnh (nền tối hồng, không thấy chữ «[Sổ mẫu]» rõ ở khung chụp); header của /original và /thumb: cache-control private, no-store. 5b: indexedDB 1 kho (quy-hang-sync, 1 mục), caches rỗng, service worker 0, localStorage/sessionStorage: 0 mục chứa a579d4c5 (id nội bộ); đối chứng dương: 3 id ảnh Gửi được có trong response danh sách mạng. 5c: «Chọn ảnh» + chọn ban-cong-tam.jpg: Gửi được (4). 5d: dán (ClipboardEvent giả có file ảnh, tiêu điểm ngoài ô nhập): Gửi được (5), 5 thumbnail. Bước 6: ngoại tuyến: chữ «Cần mạng để thêm ảnh», nút «Chọn ảnh» mờ/disabled, chữ kéo-dán biến mất. Bước 7: 390×844 (emulate viewport; cửa sổ thật chỉ thu được 500 nên dùng emulate): /units/A-06.01 hiện mục Ảnh lưới 2 cột 5 ảnh, scrollWidth=innerWidth=390. Bước 8: đầu khách: «Gửi được (5)» đủ 5 ảnh, 0 nút «Thao tác ảnh», không «Chọn ảnh»; tab «Nội bộ» có ổ khoá, không số đếm; mở ra: «Ngăn nội bộ / Chỉ người giữ căn và trưởng nhóm xem»; response danh sách: 5 ảnh shareable, noiBo:"an", suaDuoc:false, không có a579d4c5.
    Frames: E10-step1.png, E10-step2a-cho.png, E10-step2.png, E10-step3.png, E10-step4.png, E10-step4b-reload.png, E10-step5.png, E10-step5-lon.png, E10-step5c.png, E10-step5d.png, E10-step6.png, E10-step7.png, E10-step8.png, E10-step8b-noibo.png. Ghi chú: (a) bước 2 không bắt được khung ô chờ riêng; (b) kéo-thả chuột không dùng được nên dùng menu «Đưa lên đầu» như đề cho phép; (c) thả/dán dùng DataTransfer/ClipboardEvent giả; (d) «Đăng xuất» làm bằng POST /api/v1/auth/sign-out rồi đặt cookie dau-khach; (e) ảnh sổ không thấy rõ chữ «[Sổ mẫu]» ở bản lớn, nhưng đúng ngăn Nội bộ; (f) console: 0 lỗi; không request app nào lỗi khi online.
  network_observed: clean

### Eval mang từ vòng trước (carry-forward)

- eval: E1b
  run_id: minted-anh-can-ba-ngan-E1b-r1
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T08:40:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3b
  run_id: minted-anh-can-ba-ngan-E3b-r1
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T08:40:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-anh-can-ba-ngan-E4-r1
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T08:40:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5b
  run_id: minted-anh-can-ba-ngan-E5b-r1
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T08:40:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6c
  run_id: minted-anh-can-ba-ngan-E6c-r1
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T08:40:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-anh-can-ba-ngan-E9-r1
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T08:40:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/connect
  run_id: minted-anh-can-ba-ngan-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-01T08:53:48Z

- cmd: npm run test:hooks
  run_id: minted-anh-can-ba-ngan-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-01T08:53:48Z

- cmd: npm run typecheck
  run_id: minted-anh-can-ba-ngan-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-01T08:53:48Z

- cmd: npm run lint
  run_id: minted-anh-can-ba-ngan-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-01T08:53:48Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval green trên cả code mới lẫn baseline (không phân biệt — chứng minh harness, cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- npm test -w @quy-hang/web: E1
- npm test -w @quy-hang/core: E2, E3, E7, E8
- npm run db:migrate && npm run db:test: E2b, E5, E6
- npm test -w @quy-hang/api: E6b
- npm test -w @quy-hang/ui-lint: E10b

Eval carry-forward (E1b, E3b, E4, E5b, E6c, E9) không chạy lại ở vòng này nên không có số đo baseline vòng này. Eval giao diện E10 baseline n-a (không chạy được trên code cũ).

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (mọi eval vòng này chạy 1 lần, không có dao động).

## Iterations

Round 1: E10 không đạt và có 10 phát hiện của bước đo (E2, E5, E6, E8 và E1 có ca đo hàm phụ thay vì đầu ra); trả về triển khai, sửa ở commit c315989 và cd1ccf2.
Round 2: toàn bộ eval PASS (E1b, E3b, E4, E5b, E6c, E9 mang từ vòng 1); phát hiện ngoài hợp đồng chuyển người quyết ở Cổng 2.

### Re-pin lần 1 — 2026-11-01, do hoá cũ do gộp main sau chữ ký
run_id: repin-20261101T091431Z-10677
sha: a869867534a7242670d346375ac5038dca20458b · suites: 7 lệnh exit 0 · evals: 16/16 eval máy đạt kỳ vọng · ngoài làn máy: E10

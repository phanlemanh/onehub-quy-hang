---
schema_version: 2
feature_slug: luat-chia-lead
verdict: BLOCKED
failed_evals: []
reason: |
  E10b: Không chạy được E10b. Cổng 3460 chưa có server nên tôi tự bật `npm run dev`. Server lên nhưng mọi trang (/login, /inventory) trả 500 vì thiếu biến môi trường DATABASE_URL: log ghi "Thiếu DATABASE_URL — xem .env.example". Hai lần chạy chay-ui.mjs --e10 đều hết giờ chờ ở `document.readyState === "complete" && [data-slot=sidebar-inset]` vì trang không bao giờ render. Cơ sở dữ liệu của chỗ thử này cần cấp từ ngoài. Trên máy có các container Postgres của phiên khác (cổng 5565, 5577), tôi không dùng vì không phải của chỗ thử này. Server do tôi bật đã tắt.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 322c7cc2d68721bc26c067c1365f05772d0fb1d4
human_signoff:
---

# Evidence Report: luat-chia-lead

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS |
| E2a | AC-2 | ui-check | PASS |
| E2b | AC-2 | test | PASS (carried, round 1) |
| E3 | AC-3 | test | PASS (carried, round 1) |
| E4 | AC-4 | test | PASS (carried, round 1) |
| E5a | AC-5 | test | PASS (carried, round 1) |
| E5b | AC-5 | ui-check | PASS |
| E6a | AC-6 | ui-check | PASS |
| E6b | AC-6 | test | PASS (carried, round 1) |
| E7a | AC-7 | test | PASS (carried, round 1) |
| E7b | AC-7 | ui-check | PASS |
| E8 | AC-8 | test | PASS (carried, round 1) |
| E8b | AC-8 | test | PASS (carried, round 1) |
| E9 | AC-9 | test | PASS (carried, round 1) |
| E10a | AC-10 | test | PASS (carried, round 1) |
| E10b | AC-10 | ui-check | BLOCKED |
| E11 | AC-1 | script | PASS (đạt có giới hạn) |
| E13 | AC-1 | script | PASS (carried, round 1) |
| E12 | AC-1 | script | PASS (carried, round 1) |

## Evidence

- eval: E1
  run_id: minted-luat-chia-lead-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T17:19:33Z
  screenshot: evidence/E1-1440.png
  observed: |
    E1-1440.png (1440x900, admin session, page "Luật chia lead"): six rows in order. Cách chia lead không trùng = "Theo vùng, lần lượt" with source "Mặc định". Hạn nhận lead = 20 with source "Đã đổi · [Mẫu] Quản trị sàn · 06/11". Hạn gọi lần đầu = 30 "Mặc định". Báo lead quá hạn cho ai = "Trưởng nhóm" "Mặc định". Under the "Hàng đợi Hôm nay" group: «Cần gọi lại» sau số ngày chưa xác nhận = 14 "Mặc định", and «Nên gọi ép giá» sau số ngày = 10 "Mặc định". The Hoàn lại and Lưu buttons are disabled. E1-truoc.png (same layout, before setting 20): Hạn nhận lead = 15 with source "Mặc định", the other rows identical. This is the red-case baseline and the change to 20 with the "Đã đổi" source is visible between the two frames. Both frames match Expected.
  network_observed: n-a (driver)

- eval: E2a
  run_id: minted-luat-chia-lead-E2a-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T17:19:33Z
  screenshot: evidence/E2a-step1.png
  observed: |
    E2-sau-luu.png (E2a-step1): trang Luật chia lead, Cách chia = Kho chung, Hạn nhận lead = 25, ca hai dong ghi «Đã đổi · [Mẫu] Quản trị sàn · 06/11», Hạn gọi lần đầu 30 và Báo quá hạn = Trưởng nhóm nhan «Mặc định», Cần gọi lại 14; toast «Đã lưu · áp cho lead mới từ bây giờ»; nut Lưu bi mo (khong con thay doi). Khop Expected. E2-hoan-lai.png (E2a-step2): sau Hoan lai, Kho chung, 25, Hạn gọi lần đầu 30, Trưởng nhóm, Cần gọi lại 20 (da luu o ca e2-ngay, «Đã đổi · Quản trị sàn»), 10; cac o Hạn gọi lần đầu va Báo quá hạn tro ve Mặc định, khong con gia tri dang sua 55/«Trưởng nhóm và quản trị sàn». Khop Expected.
  network_observed: clean

- eval: E5b
  run_id: minted-luat-chia-lead-E5b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T17:19:33Z
  screenshot: evidence/E5b-step1.png
  observed: |
    E5-o-sai.png: Hạn nhận lead = 0, dòng ngay dưới ô báo đỏ «Số nguyên từ 1 tới 1440 phút»; nút Lưu ở đáy mờ (disabled). E5-400.png: Hạn nhận 15, Hạn gọi lần đầu giữ 40, dưới đúng ô đó chữ đỏ «Không nhỏ hơn hạn nhận lead (15 phút)» (lý do máy chủ trả). E5-403.png: banner đỏ đầu form «Chỉ quản trị sàn đổi được luật này», Hạn nhận lead vẫn 22. E5-mang.png: banner đỏ «Chưa lưu được — mất kết nối tới máy chủ» kèm nút «Thử lại», Hạn nhận lead vẫn 18 (giá trị vừa gõ). Tất cả khớp Expected.
  network_observed: clean

- eval: E6a
  run_id: minted-luat-chia-lead-E6a-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T17:19:33Z
  screenshot: evidence/E6a-step1.png
  observed: |
    E6a-step1.png (bản sao của E6-truong-nhom.png vừa được script ghi lại): phiên trưởng nhóm ở trang Cài đặt > Cá nhân. Cột mục lục bên trái chỉ có một mục «Cá nhân», không có mục chia lead. Trên đầu nội dung có khung chữ «Mục này chỉ quản trị sàn mở được». Dưới là thẻ «Tài khoản và máy». Khớp Expected. Chỉ có một khung hình, không có khung riêng cho phiên đầu chủ hay quản trị; hai phiên đó chỉ được xác nhận qua dòng JSON e6 của script.
  network_observed: n-a (driver)

- eval: E7b
  run_id: minted-luat-chia-lead-E7b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T17:19:33Z
  screenshot: evidence/E7b-step1.png
  observed: |
    step1 (E7-bo-nhom): man Luat chia lead; muc «Hang doi Hom nay» co khung «San dang dung bo nhom Hom nay rieng — nguong dat trong bo ay»; hai o «Can goi lai» (14) va «Nen goi ep gia» (10) bi lam mo (disabled), nut +/- mo. Khop Expected. step2 (E7-dong-hong): khung tren dau «Han nhan lead, Han goi lan dau dang chay theo mac dinh — gia tri da luu cua san khong hop le. Luu gia tri...» (cat bang dau ba cham tren anh; JSON day du); Han nhan 15, Han goi lan dau 30 mac dinh. Khop. step3 (E7-loi-tai): khung loi do «Chua tai duoc luat chia lead» kem nut «Thu lai», khong co dong nao; sau thu lai JSON bao du 6 dong. Khop.
  network_observed: n-a (driver)

- eval: E10b
  run_id: minted-luat-chia-lead-E10b-r2
  cannot_run: true
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T17:19:33Z
  network_observed: n-a (tool-error: dev server 500 vì thiếu DATABASE_URL, không đọc được network của luồng e10)
  output: |
    GET http://localhost:3460/ ban đầu: 000. Sau khi bật npm run dev: /inventory 500, /login 500. Lý do: Error: Thiếu DATABASE_URL. chay-ui.mjs --e10 lần 1 và lần 2: lỗi "hết giờ chờ ... sidebar-inset" ở cdp.mjs:134, không có dòng e10 nào để đối chiếu. Chưa kiểm được assertion nào: báo «Chưa đọc được danh bạ thành viên», nút «Thử lại», tên hiện sau thử lại, soLanGoiTrong10s = soLanGoiLucBao. Ba tệp evidence tên E10 (E10-loi.png, E10-sau-thu-lai.png, E10b-step1/2.png) và E10b-network.txt là bản cũ của lần chạy 05/11 22:50, không phải sản phẩm của lần này. Tôi không dùng chúng làm bằng chứng. Không có capture.ui trong config.

- eval: E11
  run_id: minted-luat-chia-lead-E11-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T17:19:33Z
  output: |
    8 tệp giao diện ngoài bản đồ
    (mã thoát 1 là kết quả đã khai trước của eval này — đạt có giới hạn, xem Known limits; E13 bảo đảm dòng lệch duy nhất là dòng báo oan)

- eval: E2b
  run_id: minted-luat-chia-lead-E2b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api_db
  verified_at: 2026-11-05T15:05:39Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-luat-chia-lead-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api_db
  verified_at: 2026-11-05T15:05:39Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-luat-chia-lead-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:05:39Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5a
  run_id: minted-luat-chia-lead-E5a-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:05:39Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6b
  run_id: minted-luat-chia-lead-E6b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api_db
  verified_at: 2026-11-05T15:05:39Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7a
  run_id: minted-luat-chia-lead-E7a-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:05:39Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-luat-chia-lead-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-05T15:05:39Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8b
  run_id: minted-luat-chia-lead-E8b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:05:39Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-luat-chia-lead-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:05:39Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10a
  run_id: minted-luat-chia-lead-E10a-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:05:39Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-luat-chia-lead-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/luat-chia-lead/thu/kiem-khuon-e11.mjs
  verified_at: 2026-11-05T15:05:39Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-luat-chia-lead-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-05T15:05:39Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-luat-chia-lead-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-05T17:19:33Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-luat-chia-lead-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-05T17:19:33Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-luat-chia-lead-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-05T17:19:33Z

- cmd: npm run test:hooks
  run_id: minted-luat-chia-lead-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-05T17:19:33Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-luat-chia-lead-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-05T17:19:33Z

- cmd: npm run typecheck
  run_id: minted-luat-chia-lead-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-05T17:19:33Z

- cmd: npm run lint
  run_id: minted-luat-chia-lead-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-05T17:19:33Z

## Known limits

- E11 (AC-1) dat-co-gioi-han: ma thoat 1 la ket qua DA KHAI TRUOC cua eval nay, khong phai mot luot truot. Lenh: R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-khuon.mjs" --kiem --root .

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval khong-phan-biet (pass tren ca HEAD lan baseline, round 1; can viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y):
- E2b, E3, E6b (lenh test:db -w @quy-hang/api)
- E4, E5a, E7a, E8b, E9, E10a (lenh npm test -w @quy-hang/web)
- E8 (lenh npm test -w @quy-hang/core)
- E12 (lenh design-floor-s4)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: các eval được chạy và ghi vào run-log; E1 trượt và E10b bị chặn do máy dev của chỗ thử tự tải lại (lịch sử commit b77a1afb), đã sửa chỗ thử (a82b6f0b).
Round 2: E1, E2a, E5b, E6a, E7b, E11 chạy lại và đạt; 12 eval khác mang từ round 1 (delta không chạm paths). E10b BLOCKED: dev server 500 vì thiếu DATABASE_URL, cần cấp cơ sở dữ liệu cho chỗ thử rồi chạy lại.

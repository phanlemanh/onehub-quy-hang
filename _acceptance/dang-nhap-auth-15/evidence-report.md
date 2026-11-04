---
schema_version: 2
feature_slug: dang-nhap-auth-15
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e69a93be821def0ef0e6189acfe27d8f499d812b
human_signoff:
---

# Evidence Report: dang-nhap-auth-15

Round 2. Round này chạy lại E7 và E9 (delta chạm paths của hai eval này); 12 eval còn lại giữ nguyên từ round 1 (carry-forward).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-6 | script | PASS |
| E8 | AC-6 | script | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-7 | script | PASS |
| E11 | AC-8 | ui-check | PASS |
| E12 | AC-6 | script | PASS |
| E13 | AC-7 | script | PASS |
| E14 | AC-9 | test | PASS |

## Evidence

- eval: E7
  run_id: minted-dang-nhap-auth-15-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint
  verified_at: 2026-11-04T08:46:56Z
  output: |
    chuẩn giao diện: đạt

- eval: E9
  run_id: minted-dang-nhap-auth-15-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-04T08:46:56Z
  output: |
    bộ kiểm ui-lint chạy xong, mọi ca qua (ca đếm chỗ TrangThai đã tính khối chưa xoá được ở may-bi-bao.tsx)

- eval: E1
  run_id: minted-dang-nhap-auth-15-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T07:35:19Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/E1-step1.png
  observed: |
    1440 (E1-step1.png = E1-1440.png): nền sáng. Đầu trang giữa: ô vuông bo góc màu tối (gần đen = màu chính) chứa biểu tượng hộp (Boxes) cạnh chữ «Quỹ hàng». Tiêu đề «Đăng nhập Quỹ hàng». Nhãn «Email», ô nhập có biểu tượng thư bên trái, placeholder ban@san.vn, lời dặn «Quỹ hàng gửi mã 6 số tới email này.» dưới ô, nút «Gửi mã» (kèm mũi tên) rộng bằng ô (cùng x 544–896). Chân trang: «Sàn của bạn dùng Quỹ hàng theo điều khoản trong hợp đồng đã ký.» Không viền/thẻ bao quanh form, không nút dịch vụ khác. 375 (E1-step2.png = E1-375.png): cùng bố cục một cột, dấu hiệu Boxes + «Quỹ hàng» ở đầu, ô và nút cùng rộng 327px (x 24–351), chân trang đúng câu chốt xuống dòng hai dòng, không cuộn ngang (scrollWidth 375).
  network_observed: no-app-traffic

- eval: E2
  run_id: minted-dang-nhap-auth-15-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T07:35:19Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/E2-ma-sai.png
  observed: |
    E2-ma-sai.png (375 rộng, sáng): dấu «Quỹ hàng» đầu trang; tiêu đề «Đăng nhập Quỹ hàng»; nhãn «Mã 6 số» và ô có biểu tượng chìa chứa 000000 đều đỏ; ngay dưới ô là lời dặn xám «Đã gửi mã tới dau-khach@mau.quy-hang.test», dưới nữa chữ đỏ «Mã không đúng. Thử lại.»; rồi nút «Vào →» đặc và nút «Đổi email»; chân trang điều khoản. Khớp Expected (lỗi ngay dưới ô mã, dưới lời dặn). E2-step3-doi-email.png: về bước Email: nhãn «Email», ô thư chứa dau-khach@mau.quy-hang.test, lời dặn «Quỹ hàng gửi mã 6 số tới email này.», nút «Gửi mã →»: khớp «Đổi email đưa về ô Email». E2-vao.png: URL /today, đầu trang «Hôm nay» cùng biểu tượng tìm kiếm/đám mây/chuông, thẻ «Màn này đang dựng», thanh dưới Hôm nay/Bảng hàng/Gửi/Tôi; không còn form đăng nhập. Tên «[Mẫu] Sàn thử» không hiện trên khung hình điện thoại (chỉ có trong header ẩn của vỏ máy tính), ghi nhận như lưu ý.
  network_observed: clean

- eval: E3
  run_id: E3-dang-nhap-auth-15
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T07:35:19Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/E3-chon-san.png
  observed: |
    E3-chon-san.png (1440x900, /select-company, hai-san@): dấu hiệu «Quỹ hàng» đầu trang, tiêu đề «Chọn sàn làm việc», hai nút «[Mẫu] Sàn thử» và «[Mẫu] Sàn thứ hai» (rộng 352px, bằng cột), nút «Đăng xuất» cùng rộng 352px, chân «Sàn của bạn dùng Quỹ hàng theo điều khoản trong hợp đồng đã ký.», không thẻ viền. E3-step2.png: sau khi bấm «[Mẫu] Sàn thứ hai» URL thành /settings/users, vỏ ứng dụng hiện «[Mẫu] Sàn thứ hai» ở góc trên trái, trang «Người của sàn [Mẫu] Sàn thứ hai»; /api/v1/me báo activeCompany là Sàn thứ hai. E3-chua-gan.png (/no-company, chua-gan@): dấu hiệu «Quỹ hàng», tiêu đề «Chưa thuộc sàn nào», câu «Tài khoản chua-gan@mau.quy-hang.test chưa thuộc sàn nào. Nhờ quản trị sàn mời bạn.», nút «Đăng xuất», chân điều khoản như trên. Bấm «Đăng xuất» thì về http://localhost:3492/login. Lưu ý: lần chạy đầu chụp step2 lúc dev server đang biên dịch (trang trắng ở URL /); chạy lại chờ 6 giây thì đủ vỏ, đã ghi đè E3-step2.png.
  network_observed: clean

- eval: E4
  run_id: minted-dang-nhap-auth-15-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T07:35:19Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-dang-nhap-auth-15-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dang_nhap_auth_15
  verified_at: 2026-11-04T07:35:19Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-dang-nhap-auth-15-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T07:35:19Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-dang-nhap-auth-15-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-04T07:35:19Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-dang-nhap-auth-15-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.giao_dien
  verified_at: 2026-11-04T07:35:19Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-dang-nhap-auth-15-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T07:35:19Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/E11-dang-nhap-1440-toi.png
  observed: |
    Đã mở từng ảnh bằng Read. (1) dang-nhap-1440-toi: nền gần đen, logo Quỹ hàng, tiêu đề «Đăng nhập Quỹ hàng» trắng, nhãn Email trắng, ô email có viền sáng và biểu tượng thư, lời dặn xám sáng, nút «Gửi mã» nền xám sáng chữ tối, chân điều khoản xám đọc được. (2) dang-nhap-toi 375: cùng bố cục một cột, ô có viền phân biệt nền, nút rộng trọn cột, chân điều khoản hai dòng đọc được, không cuộn ngang. (3) ma-loi-toi: nhãn «Mã 6 số» và mã 000000 màu đỏ-cam sáng, viền ô, dòng «Đã gửi mã tới telesales@…» xám, «Mã không đúng. Thử lại.» đỏ sáng đọc rõ dưới ô, nút Vào xám và «Đổi email» có viền, chân đọc được. (4) chon-san-toi: tiêu đề trắng, hai nút sàn và Đăng xuất có nền/viền hơi sáng hơn nền trang, chữ trắng đọc được. (5) chua-gan-toi: tiêu đề, đoạn văn trắng, nút Đăng xuất có viền, chân đọc được. Không có chữ tối trên nền tối; mọi scrollWidth ở 375 = 375. Khớp Expected.
  network_observed: clean

- eval: E12
  run_id: minted-dang-nhap-auth-15-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-04T07:35:19Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-dang-nhap-auth-15-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dang_nhap_auth_15
  verified_at: 2026-11-04T07:35:19Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E14
  run_id: minted-dang-nhap-auth-15-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T07:35:19Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-dang-nhap-auth-15-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-04T08:46:56Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-dang-nhap-auth-15-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-04T08:46:56Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-dang-nhap-auth-15-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-04T08:46:56Z

- cmd: npm run test:hooks
  run_id: minted-dang-nhap-auth-15-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-04T08:46:56Z

- cmd: npm run typecheck
  run_id: minted-dang-nhap-auth-15-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-04T08:46:56Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay. Mọi field baseline ở trên ghi n-a (round này không đo).

Eval không-phân-biệt (xanh cả hai phía ở lần đo baseline round 1; kiểm tra harness hoặc regression-guard có chủ ý):
- npm test -w @quy-hang/web: E4, E14
- node --test "_acceptance/dang-nhap-auth-15/thu/*.test.mjs": E5, E13
- design-floor-khuon.mjs --kiem --root .: E6
- npm run lint: E7
- npm run typecheck: E8
- node packages/ui-lint/kiem-chuan.mjs: E10
- design-floor-s4.mjs --root .: E12

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E9 failed — phép đếm chỗ TrangThai trong bộ kiểm ui-lint chưa tính khối «chưa xoá được» thêm ở may-bi-bao.tsx. Returned to implementation.
Round 2: E7 và E9 chạy lại, cùng qua; 12 eval còn lại carry-forward từ round 1. Tất cả PASS.


### Re-pin lần 1 — 2026-11-04, do gộp nhánh chính vào nhánh trước khi mở PR hàng 93
run_id: repin-20261104T090121Z-81487
sha: e69a93be821def0ef0e6189acfe27d8f499d812b · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E1, E2, E3, E11 · AC không có chốt máy: AC-1, AC-2, AC-3, AC-8

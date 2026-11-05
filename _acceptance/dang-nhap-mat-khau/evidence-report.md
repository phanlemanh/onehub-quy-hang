---
schema_version: 2
feature_slug: dang-nhap-mat-khau
verdict: REJECT
failed_evals: ["E16","E10","E14","E22"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: fa03f363308e3c5dcb9921c546e6ca9b75fc8d2b
human_signoff:
---

# Evidence Report: dang-nhap-mat-khau

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | ui-check | FAIL |
| E11 | AC-2 | test | PASS |
| E12 | AC-4 | test | PASS |
| E13 | AC-10 | test | PASS |
| E14 | AC-10 | ui-check | FAIL |
| E15 | AC-11 | script | PASS |
| E16 | AC-11 | script | FAIL |
| E17 | AC-11 | script | PASS |
| E18 | AC-11 | script | PASS |
| E19 | AC-11 | script | PASS |
| E20 | AC-11 | test | PASS |
| E21 | AC-1 | test | PASS |
| E22 | AC-9 | ui-check | FAIL |
| E23 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-dang-nhap-mat-khau-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T00:26:31Z
  output: |
    npm run db:migrate && npm run db:test (gộp với E2-E7, E9, E11, E21)
    duration_ms 105641.708166

- eval: E2
  run_id: minted-dang-nhap-mat-khau-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T00:26:31Z
  output: |
    npm run db:migrate && npm run db:test (gộp)
    duration_ms 105641.708166

- eval: E3
  run_id: minted-dang-nhap-mat-khau-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T00:26:31Z
  output: |
    npm run db:migrate && npm run db:test (gộp)
    duration_ms 105641.708166

- eval: E4
  run_id: minted-dang-nhap-mat-khau-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T00:26:31Z
  output: |
    npm run db:migrate && npm run db:test (gộp)
    duration_ms 105641.708166

- eval: E5
  run_id: minted-dang-nhap-mat-khau-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T00:26:31Z
  output: |
    npm run db:migrate && npm run db:test (gộp)
    duration_ms 105641.708166

- eval: E6
  run_id: minted-dang-nhap-mat-khau-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T00:26:31Z
  output: |
    npm run db:migrate && npm run db:test (gộp)
    duration_ms 105641.708166

- eval: E7
  run_id: minted-dang-nhap-mat-khau-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T00:26:31Z
  output: |
    npm run db:migrate && npm run db:test (gộp)
    duration_ms 105641.708166

- eval: E8
  run_id: minted-dang-nhap-mat-khau-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-11-05T00:26:31Z
  output: |
    npm test -w @quy-hang/api (gộp với E12)
    duration_ms 63198.844583

- eval: E9
  run_id: minted-dang-nhap-mat-khau-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T00:26:31Z
  output: |
    npm run db:migrate && npm run db:test (gộp)
    duration_ms 105641.708166

- eval: E10
  run_id: minted-dang-nhap-mat-khau-E10-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T00:26:31Z
  screenshot: evidence/E10-ST-dang-nhap-mat-khau-375.png
  observed: |
    Đã mở từng ảnh. 375: (1) email điền sẵn, ô mật khẩu rỗng có nút mắt, nút «Đăng nhập» đen, «Dùng mã qua email». (2) nhãn và viền đỏ, «Email hoặc mật khẩu không đúng» ngay dưới ô. (3) «Thử lại sau ít phút» dưới ô. (4) câu khoá ba dòng, đúng chữ. (5) «Mật khẩu tạm đã hết hạn — nhờ quản trị sàn cấp lại» hai dòng. (6) tiêu đề «Đặt mật khẩu mới», ô «Mật khẩu mới» có nút mắt, gợi ý «Ít nhất 8 ký tự — một câu ngắn có dấu là dễ nhớ», nút «Lưu và vào Quỹ hàng». (7) ô đỏ 7 chấm, «Cần ít nhất 8 ký tự» dưới gợi ý. (8) thẻ chỉ hiện «Phiên đặt mật khẩu đã hết — đăng nhập lại bằ…» bị cắt, nút «Về đăng nhập», chip «1 Issue» đỏ góc trái. (vào) /today trong vỏ, thanh dưới Hôm nay/Bảng hàng/Tôi. 1280: cùng nội dung các ô 1-7 căn giữa, câu khoá hai dòng, không tràn; ô 8 thẻ chỉ hiện «Phiên đặt mật khẩu đã hết — đăn…» cắt nặng hơn, có «1 Issue».
  network_observed: app-fail
  output: |
    16 ảnh ST đủ. Ô (1)-(7) và (9) đạt. Ô (8): câu «Phiên đặt mật khẩu đã hết — đăng nhập lại bằng mật khẩu tạm» bị cắt bằng dấu ba chấm ở cả 375 và 1280 (DOM đủ chữ, mắt không đọc trọn); chức năng bấm «Về đăng nhập» rồi đăng nhập lại về /dat-mat-khau đạt. Có chỉ báo dev «1 Issue» (lỗi console Base UI nativeButton ở nút «Về đăng nhập» là link). Mạng: một đường phụ trợ push của bản thử trả lỗi máy chủ sau khi vào /today (thiếu khoá push của môi trường thử); chi tiết ở evidence/E10-network.txt. Không ô nào tràn ngang.

- eval: E11
  run_id: minted-dang-nhap-mat-khau-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T00:26:31Z
  output: |
    npm run db:migrate && npm run db:test (gộp)
    duration_ms 105641.708166

- eval: E12
  run_id: minted-dang-nhap-mat-khau-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-11-05T00:26:31Z
  output: |
    npm test -w @quy-hang/api (gộp với E8)
    duration_ms 63198.844583

- eval: E13
  run_id: minted-dang-nhap-mat-khau-E13-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T00:26:31Z
  output: |
    npm test -w @quy-hang/web (gộp với E20)
    duration_ms 5561.538542

- eval: E14
  run_id: ui-E14
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T00:26:31Z
  screenshot: evidence/E14-loi.png
  observed: |
    E14-loi.png (375x812, /settings/personal, dau-chu-2): tab Tôi, dòng «Đăng xuất» hiện chữ đỏ «Chưa đăng xuất được» và nút «Thử lại»; URL vẫn /settings/personal. Khớp phần lỗi của Expected. E14-xong.png (sau gỡ chặn và bấm «Thử lại»): ẢNH GIỐNG HỆT E14-loi, vẫn «Chưa đăng xuất được» + «Thử lại», URL vẫn /settings/personal, KHÔNG về /login. Mâu thuẫn Expected (phải /login). E14-chon-san.png (hai-san, màn Chọn sàn): hiện «Chưa đăng xuất được» + «Thử lại» dưới nút Đăng xuất; khớp. Truy vết: không có request POST /api/v1/auth/sign-out nào, kể cả khi KHÔNG chặn mạng; trang báo lỗi vô điều kiện. Trong trang, `d={goi:fetch}; d.goi(...)` ném «TypeError: Illegal invocation»; mã dang-xuat-tren-may.ts gọi d.goi(...) với goi: fetch không bind (toi-that.tsx:120) nên luôn rơi vào nhánh «loi».
  network_observed: app-fail
  output: |
    Bước 1 (lỗi khi chặn) đạt; bước 2 (gỡ chặn rồi Thử lại phải về /login) không đạt: URL vẫn /settings/personal. Chạy riêng không chặn mạng: không có request đăng xuất nào được gửi, trang vẫn báo lỗi. Màn chọn sàn đạt về câu và nút. Đường thành công của đăng xuất hỏng. Frame: E14-loi.png, E14-xong.png, E14-chon-san.png; mạng ở evidence/E14-network.txt.

- eval: E15
  run_id: minted-dang-nhap-mat-khau-E15-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.dang_nhap_mat_khau
  verified_at: 2026-11-05T00:26:31Z
  output: |
    node --test _acceptance/dang-nhap-mat-khau/thu/*.test.mjs
    duration_ms 308.020625

- eval: E16
  run_id: minted-dang-nhap-mat-khau-E16-r1
  exit_code: 2
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-05T00:26:31Z
  output: |
    test-db/dang-nhap-mat-khau/nhat-ky.test.ts(18,39): error TS2322: Type 'Response | Promise<Response>' is not assignable to type 'Promise<Response>'.
    cùng lỗi ở các dòng 19, 21, 22, 23, 24, 25 của nhat-ky.test.ts
    workspace @quy-hang/api: tsc --noEmit -p . thất bại; connect, core, db qua

- eval: E17
  run_id: minted-dang-nhap-mat-khau-E17-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-05T00:26:31Z
  output: |
    chuẩn giao diện: đạt

- eval: E18
  run_id: minted-dang-nhap-mat-khau-E18-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.build
  verified_at: 2026-11-05T00:26:31Z
  output: |
    npm run build hoàn tất không lỗi

- eval: E19
  run_id: minted-dang-nhap-mat-khau-E19-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-05T00:26:31Z
  output: |
    npm run test:ro-ri
    duration_ms 1827.062583

- eval: E20
  run_id: minted-dang-nhap-mat-khau-E20-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T00:26:31Z
  output: |
    npm test -w @quy-hang/web (gộp với E13)
    duration_ms 5561.538542

- eval: E21
  run_id: minted-dang-nhap-mat-khau-E21-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T00:26:31Z
  output: |
    npm run db:migrate && npm run db:test (gộp)
    duration_ms 105641.708166

- eval: E22
  run_id: minted-dang-nhap-mat-khau-E22-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T00:26:31Z
  screenshot: evidence/E22-ST-cap-mat-khau-hoi-375.png
  observed: |
    Đã mở từng file frame bằng Read. Hộp hỏi cấp mật khẩu tạm có câu mật khẩu cũ thôi dùng và người bị đăng xuất ở mọi máy; hộp kết quả có mật khẩu 16 ký tự chia bốn nhóm, nút «Chép», câu trao tay và hạn 72 giờ, mở lại không còn mật khẩu cũ (đúng expected). Ô san-khac (375 và 1280): dòng báo «… còn ở sàn …» bị cắt bằng dấu ba chấm, cụm «tự đặt mật khẩu trong Cá nhân» không đọc được (lệch expected). Bốn ảnh dòng Mật khẩu và hai hộp doi/dat đạt; không hộp nào tràn ngang ở 375; ở 375 tiêu đề hộp kết quả chạm sát nút đóng X.
  network_observed: app-fail
  output: |
    16 ảnh đủ theo ma trận (1+1+1+3+2) x 2 khổ. Ô (3) san-khac: sau khi bấm cấp, API trả lỗi xung đột cho người ở sàn khác (expected không khai mã này), và thông điệp bị cắt bằng line-clamp-1 nên người dùng không đọc trọn câu. Các ô (1), (2), (4), (5) đạt. Mạng ở evidence/E22-network.txt.

- eval: E23
  run_id: minted-dang-nhap-mat-khau-E23-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T00:26:31Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    15 tệp giao diện ngoài bản đồ

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-dang-nhap-mat-khau-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-05T00:26:31Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-dang-nhap-mat-khau-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-05T00:26:31Z

- cmd: npm run test:hooks
  run_id: minted-dang-nhap-mat-khau-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-05T00:26:31Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-dang-nhap-mat-khau-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-05T00:26:31Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả code mới lẫn baseline — chứng minh harness, không chứng minh tính năng; cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm run db:migrate && npm run db:test: E1, E2, E3, E4, E5, E6, E7, E9, E11, E21
- npm test -w @quy-hang/api: E8, E12
- npm test -w @quy-hang/web: E13, E20
- node --test _acceptance/dang-nhap-mat-khau/thu/*.test.mjs: E15
- npm run lint: E17
- design-floor-khuon.mjs --kiem: E23

Ghi chú: E16 (typecheck) xanh ở baseline nhưng đỏ ở code mới, tức là hồi quy do chính tính năng gây ra (nhat-ky.test.ts). E18 và E19 đỏ ở baseline, có phân biệt.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E16, E10, E14, E22 failed — E16 sai kiểu trong nhat-ky.test.ts; E10 và E22 thông điệp lỗi bị cắt bằng dấu ba chấm (và lỗi mạng ở bản thử); E14 đường đăng xuất thành công không gửi request (fetch không bind). Returned to implementation.

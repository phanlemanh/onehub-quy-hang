---
schema_version: 2
feature_slug: dang-nhap-mat-khau
verdict: REJECT
failed_evals: ["E10","E14","E22"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f90ffa9ec71ab23ed480d2387e1c1fc7b5386e9f
human_signoff:
---

# Evidence Report: dang-nhap-mat-khau

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS (carry-forward từ round 2) |
| E2 | AC-2 | test | PASS (carry-forward từ round 2) |
| E3 | AC-3 | test | PASS (carry-forward từ round 2) |
| E4 | AC-4 | test | PASS (carry-forward từ round 2) |
| E5 | AC-5 | test | PASS (carry-forward từ round 2) |
| E6 | AC-6 | test | PASS (carry-forward từ round 2) |
| E7 | AC-7 | test | PASS (carry-forward từ round 2) |
| E8 | AC-8 | test | PASS (carry-forward từ round 1) |
| E9 | AC-8 | test | PASS (carry-forward từ round 1) |
| E10 | AC-9 | ui-check | FAIL |
| E11 | AC-2 | test | PASS (carry-forward từ round 1) |
| E12 | AC-4 | test | PASS (carry-forward từ round 1) |
| E13 | AC-10 | test | PASS (carry-forward từ round 2) |
| E14 | AC-10 | ui-check | FAIL |
| E15 | AC-11 | script | PASS (carry-forward từ round 1) |
| E16 | AC-11 | script | PASS (carry-forward từ round 2) |
| E17 | AC-11 | script | PASS (carry-forward từ round 2) |
| E18 | AC-11 | script | PASS (carry-forward từ round 2) |
| E19 | AC-11 | script | PASS (carry-forward từ round 1) |
| E20 | AC-11 | test | PASS (carry-forward từ round 2) |
| E21 | AC-1 | test | PASS (carry-forward từ round 2) |
| E22 | AC-9 | ui-check | FAIL |
| E23 | AC-9 | script | PASS (carry-forward từ round 2) |

Lệnh fail không gắn eval: không có. Ba lệnh ui-check (ui-check:E10, ui-check:E14, ui-check:E22) đều gắn đúng eval của mình.

## Evidence

- eval: E10
  run_id: minted-dang-nhap-mat-khau-E10-r3
  exit_code: 1
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-05T03:12:20Z
  screenshot: evidence/E10-ST-dang-nhap-mat-khau-375.png
  observed: |
    Đã mở bằng Read các ảnh 375 (cả 8 ô + E10-vao-375.png) và hai ảnh 1280 (het-phien, khoa); 6 ảnh 1280 còn lại đối chiếu qua text DOM giống hệt bản 375. (1) /login: ô email điền sẵn, ô mật khẩu có nút hiện/ẩn, nút «Đăng nhập», nút «Dùng mã qua email» (quay về mã). (2) «Email hoặc mật khẩu không đúng» đỏ ngay dưới ô mật khẩu. (3) «Thử lại sau ít phút» dưới ô mật khẩu. (4) «Mật khẩu đã bị khoá — đăng nhập bằng mã rồi đặt mật khẩu mới trong Cá nhân, hay nhờ quản trị sàn cấp lại» dưới ô, xuống dòng đủ chữ, không bị cắt. (5) «Mật khẩu tạm đã hết hạn — nhờ quản trị sàn cấp lại». (6) URL /dat-mat-khau, tiêu đề «Đặt mật khẩu mới», ô mật khẩu có nút hiện/ẩn, gợi ý «Ít nhất 8 ký tự — một câu ngắn có dấu là dễ nhớ», nút «Lưu và vào Quỹ hàng»; history.length=2, mọi mục location.href chỉ là /login, /login, /dat-mat-khau; HTML không chứa changeToken, URL/navs không chứa mật khẩu. (7) nhập «matkhau» → «Cần ít nhất 8 ký tự» đỏ dưới ô. (8) tải lại /dat-mat-khau: thẻ «Phiên đặt mật khẩu đã hết», mô tả «Đăng nhập lại bằng mật khẩu tạm.», nút «Về đăng nhập»; bấm → /login, gõ lại mật khẩu tạm → URL /dat-mat-khau với form đặt mật khẩu (ảnh E10-dang-nhap-lai-*). (9) 375: «ba con mèo ngủ trưa» + «Lưu và vào Quỹ hàng» → URL /today, trang «Hôm nay» trong vỏ (thanh dưới Hôm nay/Bảng hàng/Tôi). Không ô nào tràn ngang (scrollWidth - innerWidth = 0 ở mọi ô, cả 375). Về nội dung: tất cả khớp Expected. Nhưng network có lỗi app-scope máy chủ.
  network_observed: app-fail
  output: |
    Nội dung giao diện đạt ở cả 8 ô, hai khổ. Eval rớt vì luật mạng: yêu cầu lấy khoá thông báo đẩy (push/public-key) ở app-origin trả lỗi máy chủ hai lần sau khi vào /today (môi trường thử không có khoá push). Số liệu thô nằm ở evidence/E10-network.txt.
    Ảnh đã lưu: 16 ảnh E10-ST-*, E10-dang-nhap-lai-375/1280, E10-vao-375, E10-network.txt.

- eval: E14
  run_id: ui-E14-r3
  exit_code: 1
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-05T03:12:20Z
  screenshot: evidence/E14-loi.png
  observed: |
    E14-loi.png (375x812, dau-chu-2, /settings/personal, sign-out bị chặn): tab Tôi, dòng «Đăng xuất» có chữ đỏ «Chưa đăng xuất được» và nút «Thử lại». URL vẫn /settings/personal. Khớp Expected. E14-xong.png (sau gỡ chặn, bấm «Thử lại»): màn «Đăng nhập Quỹ hàng» (email, Gửi mã, Dùng mật khẩu). URL /login. Khớp Expected, và có request POST sign-out thật thành công, nên lỗi lượt 1 (fetch không bind) đã hết. E14-chon-san.png (hai-san, màn Chọn sàn, bị chặn): khung đỏ «Chưa đăng xuất được» kèm nút «Thử lại» dưới hai sàn, URL vẫn /select-company; không bị đưa về /login. Khớp Expected. Cả ba frame đều đạt về hành vi. Eval rớt chỉ vì luật network: yêu cầu lấy khoá thông báo đẩy ở app-origin trả lỗi máy chủ (chưa cấu hình thông báo; tab Tôi ghi «Thông báo chưa được cấu hình»). Yêu cầu này không liên quan đến đăng xuất.
  network_observed: app-fail
  output: |
    Chạy trên máy chủ 3460 (không phải 3492 như đề ghi; next dev chỉ cho một server mỗi thư mục). DB của 3460 là quy-hang-db-L (cổng 5563); thêm người mẫu hai-san bằng bản sao nguoi-mau.mjs trong scratchpad.
    Bước 1, 2, 3 và đối chứng đều đạt về hành vi. Eval rớt do luật mạng ở push/public-key (hai lần). Mọi yêu cầu khác đều đúng ý. Số liệu thô: evidence/E14-network.txt.
    Frame: E14-loi.png, E14-xong.png, E14-chon-san.png.

- eval: E22
  run_id: minted-dang-nhap-mat-khau-E22-r3
  exit_code: 1
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-05T03:12:20Z
  screenshot: evidence/E22-ST-cap-mat-khau-hoi-375.png
  observed: |
    Đã mở từng ảnh bằng Read.
    - cap-mat-khau-hoi-375 và 1280: hộp "Cấp mật khẩu tạm cho dau-chu-2@mau.quy-hang.test?", mô tả "Mật khẩu cũ thôi dùng và … bị đăng xuất ở mọi máy". Ở 375 hai nút xếp dọc (Cấp mật khẩu đỏ trên, Huỷ dưới), ở 1280 hai nút nằm cùng hàng. Không tràn ngang.
    - cap-mat-khau-ket-qua-375 và 1280: hộp "Mật khẩu tạm của dau-chu-2@…", dòng "Trao tận tay … Mật khẩu hết hạn sau 72 giờ, đóng hộp này là không xem lại được", mật khẩu dạng 292r-BEKA-Y8zV-QeeM (4 nhóm, 16 ký tự, chữ mono), nút «Chép» và «Xong», có nút đóng X. Sau khi đóng hộp rồi mở lại việc ở dòng ấy, hộp quay về câu hỏi, không hiện mật khẩu cũ.
    - cap-mat-khau-san-khac-375: hộp hỏi kèm khung thông báo có tiêu đề "hai-san@mau.quy-hang.test còn ở sàn…" bị cắt bằng dấu "…", mô tả "Người này tự đặt mật khẩu trong Cá nhân." xuống hai dòng đọc đủ. Tiêu đề bị cắt là LỖI so với expected. Ở 1280 cùng khung nhưng tiêu đề đọc trọn "…còn ở sàn khác", mô tả trọn, không tên sàn khác.
    - toi-mat-khau-dong-chua-dat/da-dat/da-khoa ở 375 và 1280: cùng trang Cá nhân, sáu nhóm Hồ sơ, Sàn, Cài lên màn hình chính, Thông báo lead, Máy đang đăng nhập, Đăng xuất. Dòng «Mật khẩu: Chưa đặt» / «Đã đặt» / «Đã khoá — đặt mật khẩu mới» nằm trong Hồ sơ, nút «Đặt mật khẩu» / «Đổi mật khẩu» / «Đặt mật khẩu». Ở 375 chữ "Đã khoá…" xuống hai dòng nhưng đọc đủ.
    - toi-mat-khau-hop-doi-375 và 1280: hộp "Đổi mật khẩu" với hai ô Mật khẩu hiện tại và Mật khẩu mới (có nút mắt), gợi ý "Ít nhất 8 ký tự…", nút Lưu và Huỷ. Hộp dat có một ô Mật khẩu mới. Cả hai nằm gọn trong khổ 375.
  network_observed: app-fail
  output: |
    Hai nguyên nhân rớt. (a) Ô (3) khổ 375: tiêu đề «… còn ở sàn…» bị cắt bằng dấu chấm lửng (line-clamp một dòng, nội dung cao hơn khung), trái với expected «đọc trọn không bị cắt»; ở 1280 thì đọc trọn. (b) Luật mạng: yêu cầu lấy khoá thông báo đẩy ở app-origin trả lỗi máy chủ trên mọi trang /settings/personal (20 lần); thêm hai lời gọi cấp mật khẩu tạm cho ca hai-san trả mã xung đột đúng thiết kế nhưng expected không khai mã đó.
    Các ô (1), (2), (4), (5) đạt. Đủ 16 ảnh chính, ảnh phụ E22-phu-*, mạng: evidence/E22-network.txt.

- eval: E1
  run_id: minted-dang-nhap-mat-khau-E1-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  output: carry-forward từ round 2 — delta không chạm paths của eval

- eval: E2
  run_id: minted-dang-nhap-mat-khau-E2-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  output: carry-forward từ round 2 — delta không chạm paths của eval

- eval: E3
  run_id: minted-dang-nhap-mat-khau-E3-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  output: carry-forward từ round 2 — delta không chạm paths của eval

- eval: E4
  run_id: minted-dang-nhap-mat-khau-E4-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  output: carry-forward từ round 2 — delta không chạm paths của eval

- eval: E5
  run_id: minted-dang-nhap-mat-khau-E5-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  output: carry-forward từ round 2 — delta không chạm paths của eval

- eval: E6
  run_id: minted-dang-nhap-mat-khau-E6-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  output: carry-forward từ round 2 — delta không chạm paths của eval

- eval: E7
  run_id: minted-dang-nhap-mat-khau-E7-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  output: carry-forward từ round 2 — delta không chạm paths của eval

- eval: E8
  run_id: minted-dang-nhap-mat-khau-E8-r1
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-11-05T00:26:31Z
  carried_from_round: 1
  output: carry-forward từ round 1 — delta không chạm paths của eval

- eval: E9
  run_id: minted-dang-nhap-mat-khau-E9-r1
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T00:26:31Z
  carried_from_round: 1
  output: carry-forward từ round 1 — delta không chạm paths của eval

- eval: E11
  run_id: minted-dang-nhap-mat-khau-E11-r1
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T00:26:31Z
  carried_from_round: 1
  output: carry-forward từ round 1 — delta không chạm paths của eval

- eval: E12
  run_id: minted-dang-nhap-mat-khau-E12-r1
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-11-05T00:26:31Z
  carried_from_round: 1
  output: carry-forward từ round 1 — delta không chạm paths của eval

- eval: E13
  run_id: minted-dang-nhap-mat-khau-E13-r2
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  output: carry-forward từ round 2 — delta không chạm paths của eval

- eval: E15
  run_id: minted-dang-nhap-mat-khau-E15-r1
  exit_code: 0
  verifier: config:executors.script.dang_nhap_mat_khau
  verified_at: 2026-11-05T00:26:31Z
  carried_from_round: 1
  output: carry-forward từ round 1 — delta không chạm paths của eval

- eval: E16
  run_id: minted-dang-nhap-mat-khau-E16-r2
  exit_code: 0
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  output: carry-forward từ round 2 — delta không chạm paths của eval

- eval: E17
  run_id: minted-dang-nhap-mat-khau-E17-r2
  exit_code: 0
  verifier: config:executors.script.lint
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  output: carry-forward từ round 2 — delta không chạm paths của eval

- eval: E18
  run_id: minted-dang-nhap-mat-khau-E18-r2
  exit_code: 0
  verifier: config:executors.script.build
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  output: carry-forward từ round 2 — delta không chạm paths của eval

- eval: E19
  run_id: minted-dang-nhap-mat-khau-E19-r1
  exit_code: 0
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-05T00:26:31Z
  carried_from_round: 1
  output: carry-forward từ round 1 — delta không chạm paths của eval

- eval: E20
  run_id: minted-dang-nhap-mat-khau-E20-r2
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  output: carry-forward từ round 2 — delta không chạm paths của eval

- eval: E21
  run_id: minted-dang-nhap-mat-khau-E21-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  output: carry-forward từ round 2 — delta không chạm paths của eval

- eval: E23
  run_id: minted-dang-nhap-mat-khau-E23-r2
  exit_code: 0
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  output: carry-forward từ round 2 — delta không chạm paths của eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-dang-nhap-mat-khau-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-05T03:12:20Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-dang-nhap-mat-khau-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-05T03:12:20Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-dang-nhap-mat-khau-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-05T03:12:20Z

- cmd: npm run test:hooks
  run_id: minted-dang-nhap-mat-khau-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-05T03:12:20Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-dang-nhap-mat-khau-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-05T03:12:20Z

- cmd: npm run typecheck
  run_id: minted-dang-nhap-mat-khau-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-05T03:12:20Z

- cmd: npm run lint
  run_id: minted-dang-nhap-mat-khau-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-05T03:12:20Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: REJECT — lượt chấm 1: đăng xuất, câu báo bị cắt và kiểm nhật ký chưa đạt; trả về cho bên làm.
Round 2: BLOCKED — hạ tầng (kết nối API) hỏng, máy xanh; chưa chấm được giao diện.
Round 3: E10, E14, E22 rớt — cả ba dính luật mạng (yêu cầu khoá thông báo đẩy ở app-origin trả lỗi máy chủ vì môi trường thử thiếu cấu hình push); riêng E22 còn tiêu đề «… còn ở sàn…» bị cắt ở khổ 375. Trả về cho bên làm.

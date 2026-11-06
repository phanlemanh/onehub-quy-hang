---
schema_version: 2
feature_slug: chup-anh-dien-thoai
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 85c4fad024e194820dc07ac542eb6c7625dfe76a
human_signoff:
---

# Evidence Report: chup-anh-dien-thoai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | script | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | ui-check | PASS |
| E13 | AC-1 | ui-check | PASS |
| E14 | AC-2 | ui-check | PASS |
| E15 | AC-4 | ui-check | PASS |
| E16 | AC-5 | ui-check | PASS |
| E17 | AC-5 | script | PASS |
| E18 | AC-3 | ui-check | PASS |
| E19 | AC-6 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-chup-anh-dien-thoai-E1-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T10:04:10Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2975.113666

- eval: E2
  run_id: minted-chup-anh-dien-thoai-E2-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T10:04:10Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2975.113666

- eval: E3
  run_id: minted-chup-anh-dien-thoai-E3-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T10:04:10Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2975.113666

- eval: E4
  run_id: minted-chup-anh-dien-thoai-E4-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T10:04:10Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2975.113666

- eval: E5
  run_id: minted-chup-anh-dien-thoai-E5-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-11-06T10:04:10Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 842.388584

- eval: E6
  run_id: minted-chup-anh-dien-thoai-E6-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T10:04:10Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 910.847375

- eval: E7
  run_id: minted-chup-anh-dien-thoai-E7-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T10:04:10Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2975.113666

- eval: E8
  run_id: minted-chup-anh-dien-thoai-E8-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T10:04:10Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2975.113666

- eval: E9
  run_id: minted-chup-anh-dien-thoai-E9-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T10:04:10Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2975.113666

- eval: E10
  run_id: minted-chup-anh-dien-thoai-E10-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-06T10:04:10Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    13 tệp giao diện ngoài bản đồ

- eval: E11
  run_id: minted-chup-anh-dien-thoai-E11-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-06T10:04:10Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 35604.433541

- eval: E12
  run_id: minted-chup-anh-dien-thoai-E12-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T10:04:10Z
  screenshot: evidence/E12-step1.png
  observed: |
    E12-truoc.png: 375x812, «Căn A-06.03», ảnh lớn màu hồng có nút «Chụp ảnh» góc trên phải và nhãn 1/1. Khớp.
    E12-chon-ngan.png: ngăn dưới «Chụp ảnh · A-06.03», hai nút «Gửi được» và «Nội bộ», dòng «Chọn ngăn trước khi chụp», nút «Mở máy ảnh» xám dính đáy. Khớp.
    E12-cho-mang.png: khối «Mất mạng — Ảnh chờ trên máy…», ba dòng «Chờ mạng — tự tải khi có mạng» (Gửi được, Gửi được, Nội bộ có khoá). Khớp.
    E12-da-tai.png: ba dòng huy hiệu xanh «Đã tải lên» (Gửi được, Gửi được, Nội bộ). Khớp.
    E12-anh-lon.png: ngăn đã đóng, ảnh lớn 1/4. Khớp về số lượng nhưng căn có sẵn 1 ảnh nên không phải 1/3.
    E12-dau-khach.png: đầu khách, ảnh lớn 1/13, không có nút «Chụp ảnh», có nút «Hỏi đầu chủ · [Mẫu] Đầu chủ 1». Khớp.
    E12-tai-lai.png: sau tải lại và mở lại ngăn, đúng 3 dòng «Chờ mạng — tự tải khi có mạng», nút «Mở máy ảnh» xám. Khớp.
  network_observed: clean

- eval: E13
  run_id: minted-chup-anh-dien-thoai-E13-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T10:04:10Z
  screenshot: evidence/E13-step1.html
  observed: |
    E13-step1.html (đã đọc) hiện kết quả chạy: số dòng trước 4/4; dau-khach gọi upload-url và POST photos đều bị từ chối với lỗi listing-agent-required, đếm sau vẫn 4/4; dau-chu-1 upload-url thành công và POST photos tạo ảnh mới trên Toà A / A-03.02, đếm sau 5/5; dòng KẾT: khách đổi=không (4/4 -> 4/4), dau-chu-1 +1 (4/4 -> 5/5). Khớp Expected.
  network_observed: n-a (driver)

- eval: E14
  run_id: minted-chup-anh-dien-thoai-E14-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T10:04:10Z
  screenshot: evidence/E14-db.txt
  observed: |
    E12-da-tai.png (read): a phone sheet titled "Chụp ảnh · A-06.03", "Toà A", with the Ảnh vào ngăn selector (Gửi được / Nội bộ). The list shows three uploaded rows: Gửi được "Đã tải lên", Gửi được "Đã tải lên", and Nội bộ (lock icon) "Đã tải lên". This matches Expected: 2 shareable + 1 internal on the same unit A-06.03, Toà A. E14-db.txt (read after writing) shows 3 unit_photos rows and 3 matching 'added' events in the window.
  network_observed: n-a (driver)

- eval: E15
  run_id: minted-chup-anh-dien-thoai-E15-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T10:04:10Z
  screenshot: evidence/E15-step1.png
  observed: |
    E15-step1.png (375x812, đã mở lại bằng Read): ngăn «Chụp ảnh · A-01.01 / Toà A», hai nút «Gửi được» và «Nội bộ» (ổ khoá), khối «Mất mạng — Ảnh chờ trên máy và tự tải lên khi có mạng.», ba dòng ảnh (Gửi được, Gửi được, Nội bộ có ổ khoá), mỗi dòng nhãn vàng «Chờ mạng — tự tải khi có mạng», nút «Mở máy ảnh» ở đáy. Khớp Expected (đang chặn mạng, ba ảnh chờ). E15-step2.png (đã mở lại bằng Read): cùng ngăn sau khi mở mạng và sau khi phản hồi POST đầu bị cắt, không còn khối «Mất mạng», ba dòng đều nhãn xanh «Đã tải lên». Khớp Expected. E15-db.txt (đã ghi): TRƯỚC 8 dòng còn sống của A-01.01, khi còn offline vẫn 8, SAU 11 (tăng đúng 3); ba mã mới (hai shareable, một internal); số mã có hơn một dòng là 0; ba sự kiện added, mỗi mã một; máy chủ ghi đủ ba lần cho POST /api/v1/units/photos (phản hồi đầu bị Fetch.failRequest sau khi máy chủ đã ghi).
  network_observed: clean

- eval: E16
  run_id: minted-chup-anh-dien-thoai-E16-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T10:04:10Z
  screenshot: evidence/E16-step2.png
  observed: |
    Tôi đã mở từng frame và đối chiếu với Expected. E16-step2.png (trang khách /s/ZMR0ymkzCi7n, 375x812, không đăng nhập): có tiêu đề «[Mẫu] Sàn thử», «[Mẫu] Đầu khách gửi bạn 1 căn», đúng một thẻ căn «Toà A · A-06.03» với một ảnh bìa màu hồng, giá 5,55 tỷ, nút Quan tâm; không có ảnh thứ hai. Phản hồi mạng của trang có đúng một ảnh là public/shares/.../photos/aea484d5 (bìa Gửi được). E16-step3.png (dau-khach, hồ sơ A-06.03): tiêu đề «Căn A-06.03», bộ đếm ảnh «1/15», chip Đang bán, «Hỏi đầu chủ · [Mẫu] Đầu chủ 1»; không có nút «Chụp ảnh», không có nhãn «Nội bộ». E16-step4.png (dau-chu-1, cùng hồ sơ): bộ đếm «1/22», có nút «Chụp ảnh» ở góc ảnh, nút «Ghi cuộc gọi»; văn bản trang có 7 thẻ «Nội bộ» (16/22 đến 22/22). Các frame khớp Expected, và dau-chu-1 là đối chứng dương cho bộ dò.
  network_observed: clean

- eval: E17
  run_id: minted-chup-anh-dien-thoai-E17-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-06T10:04:10Z
  output: |
    npm run test:ro-ri
    ℹ duration_ms 930.992208

- eval: E18
  run_id: minted-chup-anh-dien-thoai-E18-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T10:04:10Z
  screenshot: evidence/E18-step1.png
  observed: |
    E18-step1.png: ngăn «Chụp ảnh · A-13.01 / Toà A» mở trên nền hồ sơ mờ, ngăn Gửi được đang chọn, hai dòng ảnh Gửi được đều có nhãn vàng «Chờ mạng — tự tải khi có mạng». Khớp expected (2 ảnh chờ khi chặn mạng). E18-step2.png: màn Hôm nay (đường /today, tab Hôm nay sáng ở thanh dưới), biểu tượng mạng trên thanh đầu hiện trạng thái mất kết nối, ngăn đã đóng, không còn ở hồ sơ. Khớp (rời hồ sơ, chưa mở lại). E18-hom-nay.png: vẫn màn Hôm nay sau khi mở mạng và chờ 20s, biểu tượng mạng đã đổi sang trạng thái có mạng; trang không mở lại hồ sơ; DB đếm lúc này 3 (tăng 2). Khớp. E18-doichung-hom-nay.png (bản sao giữ hàng chờ theo thành phần): cùng màn Hôm nay sau 20s; DB đếm A-13.03 vẫn 1 (tăng 0). Khớp đối chứng +0. Frame bản sao step1/step2 lưu nhưng không mở riêng ngoài step2/hom-nay máy thật.
  network_observed: clean

- eval: E19
  run_id: minted-chup-anh-dien-thoai-E19-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T10:04:10Z
  screenshot: evidence/E19-step1.png
  observed: |
    E19-step1.png (375x812, can A-04.01): khay Chup anh mo, ngan Noi bo dang chon, hai dong anh: Gui duoc va Noi bo (co icon khoa), moi dong co nhan vang "Cho mang — tu tai khi co mang". Khop expected (2 anh cho, mot Noi bo).
    E19-con.png (= E19-step2.png) sau khi tai lai va mo lai ngan: van dung hai dong Gui duoc va Noi bo, ca hai "Cho mang — tu tai khi co mang". Chua chon ngan nen dong chu "Chon ngan truoc khi chup." va nut Mo may anh xam. Doi chung duong khop.
    E19-menu.png: menu Tai khoan o 1280x800 co muc Dang xuat (menuitem dem duoc 1); khong mau thuan.
    E19-dang-xuat.png (= E19-step3.png, 1280x800): trang Dang nhap Quy hang (/login) voi o Email va nut Gui ma; khong con khay anh. Khop; databases() do bang JS la [].
    E19-nguoi-b.png (= E19-step4.png, 375x812): nguoi B mo cung can A-04.01, khay Chup anh hien "Chua chụp ảnh nào cho căn này." va khong co dong anh cho nao. Khop expected; so dong [data-cho]=0, databases() chi co kho cua B.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/connect
  run_id: minted-chup-anh-dien-thoai-SUITE-npm_test_w_quy_hang_connect-r5
  exit_code: 0
  verified_at: 2026-11-06T10:04:10Z

- cmd: npm run test:hooks
  run_id: minted-chup-anh-dien-thoai-SUITE-test_hooks-r5
  exit_code: 0
  verified_at: 2026-11-06T10:04:10Z

- cmd: npm run typecheck
  run_id: minted-chup-anh-dien-thoai-SUITE-typecheck-r5
  exit_code: 0
  verified_at: 2026-11-06T10:04:10Z

- cmd: npm run lint
  run_id: minted-chup-anh-dien-thoai-SUITE-lint-r5
  exit_code: 0
  verified_at: 2026-11-06T10:04:10Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval xanh trên cả mã mới lẫn mã nền (baseline green), không phân biệt được tính năng — cần viết lại để khẳng định hành vi mới, hoặc xác nhận là lưới hồi quy có chủ ý:

- E1, E2, E3, E4, E7, E8, E9 (npm test -w @quy-hang/web)
- E5 (npm test -w @quy-hang/api)
- E6 (npm test -w @quy-hang/core)
- E10 (design-floor-khuon.mjs --kiem)
- E11 (npm test -w @quy-hang/ui-lint)
- E17 (npm run test:ro-ri)

Baseline không đo: E12, E13, E14, E15, E16, E18, E19 (eval giao diện, baseline n-a).

## Variance

none — mọi eval chạy một lần, xác định; không có phương sai.

## Iterations

Round 3: REJECT — E14 đếm 6 dòng, lỗi đo trong hợp đồng; sửa phép đo.
Round 4: PASS — máy thông, cửa veto mở.
Round 5: PASS — sau bản sửa 24fc0ecc (ảnh chờ chỉ lên đúng sàn lúc chụp); mọi eval xanh.


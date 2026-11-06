---
schema_version: 2
feature_slug: chup-anh-dien-thoai
verdict: REJECT
failed_evals: [E14]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b0d2ac9f51d2d1c35ad4973931012563c311152c
human_signoff:
---

# Evidence Report: chup-anh-dien-thoai

Vòng 3. Lệnh không gắn eval mà thất bại: ui-check:E14 (gắn với E14, đã ghi ở khối E14).

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
| E14 | AC-2 | ui-check | FAIL |
| E15 | AC-4 | ui-check | PASS |
| E16 | AC-5 | ui-check | PASS |
| E17 | AC-5 | script | PASS |
| E18 | AC-3 | ui-check | PASS |
| E19 | AC-6 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-chup-anh-dien-thoai-E1-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T06:40:32Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2440.191209

- eval: E2
  run_id: minted-chup-anh-dien-thoai-E2-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T06:40:32Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2440.191209

- eval: E3
  run_id: minted-chup-anh-dien-thoai-E3-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T06:40:32Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2440.191209

- eval: E4
  run_id: minted-chup-anh-dien-thoai-E4-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T06:40:32Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2440.191209

- eval: E5
  run_id: minted-chup-anh-dien-thoai-E5-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-11-06T06:40:32Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 985.623584

- eval: E6
  run_id: minted-chup-anh-dien-thoai-E6-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T06:40:32Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 788.97125

- eval: E7
  run_id: minted-chup-anh-dien-thoai-E7-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T06:40:32Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2440.191209

- eval: E8
  run_id: minted-chup-anh-dien-thoai-E8-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T06:40:32Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2440.191209

- eval: E9
  run_id: minted-chup-anh-dien-thoai-E9-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T06:40:32Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2440.191209

- eval: E10
  run_id: minted-chup-anh-dien-thoai-E10-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-06T06:40:32Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    13 tệp giao diện ngoài bản đồ

- eval: E11
  run_id: minted-chup-anh-dien-thoai-E11-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-06T06:40:32Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 37080.397416

- eval: E12
  run_id: minted-chup-anh-dien-thoai-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T06:40:32Z
  screenshot: evidence/E12-truoc.png
  observed: |
    Đã mở từng ảnh 375×812. (1) E12-truoc: ảnh lớn xám «Chưa có ảnh», nút «Chụp ảnh» góc trên phải, thẻ «Chưa đủ để rao», nút «Ghi cuộc gọi» dính đáy. (2) E12-chon-ngan: ngăn «Chụp ảnh · A-15.05 / Toà A» có hai nút «Gửi được» và «Nội bộ» (ổ khoá), «Chọn ngăn trước khi chụp.», «Mở máy ảnh» xám dính đáy. (3) E12-cho-mang: thanh «Đang xem bản đã tải — mất mạng», khối «Mất mạng — Ảnh chờ trên máy và tự tải lên khi có mạng lại.», ba dòng «Chờ mạng — tự tải khi có mạng» (Gửi được, Gửi được, Nội bộ có ổ khoá), huy hiệu 3 trên nút chụp. (4) E12-da-tai: ba dòng «Đã tải lên» (xanh), ảnh lớn phía sau đã có ảnh. (5) E12-anh-lon: ngăn đóng, ảnh lớn xanh lá/tím với bộ đếm «1/3» và nút «Chụp ảnh». (6) E12-dau-khach: trang «Không thấy căn — Mã A-15.05 không có trong hàng bạn thấy trên máy này», không có nút «Chụp ảnh» (căn Incomplete ngoài tầm đầu khách). (7) E12-dau-khach-A-04.01: căn Active cùng người giữ, ảnh «1/2», không nút «Chụp ảnh», có «Hỏi đầu chủ · [Mẫu] Đầu chủ 1». (8) E12-cho-mang-truoc-tai-lai: ngăn mở, ba dòng «Chờ mạng». (9) E12-tai-lai: sau tải lại, ngăn mở lại có đúng ba dòng «Chờ mạng — tự tải khi có mạng» (Gửi được, Gửi được, Nội bộ), «Mở máy ảnh» xám vì chưa chọn ngăn. (10) E12-tai-lai-da-tai: ba dòng «Đã tải lên». Khung hình khớp expected; hai chỗ lệch bước chữ (đầu khách không thấy căn A-15.05 nên bổ sung bằng A-04.01; tải lại chặn theo URL thay vì offline) đã ghi trong outputTail.
  network_observed: clean

- eval: E13
  run_id: minted-chup-anh-dien-thoai-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T06:40:32Z
  screenshot: evidence/E13-step1.html
  observed: |
    Da doc E13-step1.html: truoc 2/2; dau-khach: upload-url 403 listing-agent-required, photos 403 listing-agent-required, sau van 2/2; dau-dau-chu-1: upload-url 200, photos 201 (anh moi id ef9611df..., Toa A A-03.02), sau 3/3. Khop Expected. Dong KET: khach doi=khong.
  network_observed: n-a (driver)

- eval: E14
  run_id: minted-chup-anh-dien-thoai-E14-r3
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T06:40:32Z
  screenshot: evidence/E14-db.txt
  observed: |
    Không có frame ảnh hay html. Đã đọc kết quả truy vấn trong E14-db.txt. Bảng unit_photos của A-15.05 có 6 dòng: shareable ord 0 và 1, internal ord 0 lúc 06:43:13Z; shareable ord 2 và 3, internal ord 1 lúc 06:44:05Z. Bảng unit_photo_events có 6 sự kiện added (id 3795-3800), payload.compartment khớp ảnh: 4 shareable, 2 internal. Mâu thuẫn với expected «đúng ba dòng mới» vì tổng là 6.
  network_observed: n-a (driver)
  output: |
    PASS: building_name = 'Toà A' và unit_number = 'A-15.05' đúng căn ở cả 6 dòng.
    PASS: mỗi đợt nạp đúng 2 shareable + 1 internal (đợt 1 lúc 06:43:13Z, đợt 2 lúc 06:44:05Z).
    PASS: unit_photo_events có 6 sự kiện added, payload.compartment khớp, không ảnh nào bị gỡ.
    FAIL: «đúng ba dòng mới». Căn A-15.05 có 6 dòng còn hiệu lực (4 shareable + 2 internal). Đợt 2 là do kịch bản tải lại của E12 nạp thêm ba ảnh; hợp đồng E14 chỉ chấp nhận 3.
    Hợp đồng E14 mâu thuẫn với E12: cần sửa thành «6 dòng = 2 đợt × (2 shareable + 1 internal)» hoặc để E12 dùng căn riêng cho đợt tải lại.

- eval: E15
  run_id: minted-chup-anh-dien-thoai-E15-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T06:40:32Z
  screenshot: evidence/E15-step1.png
  observed: |
    E15-step1.png (375x812, đã mở xem): ngăn «Chụp ảnh · A-02.06 / Toà A», hai nút ngăn «Gửi được» và «Nội bộ», khối «Mất mạng — Ảnh chờ trên máy và tự tải lên khi có mạng», ba dòng: Gửi được, Gửi được, Nội bộ (có ổ khoá), mỗi dòng nhãn cam «Chờ mạng — tự tải khi có mạng»; nút «Mở máy ảnh» ở đáy. Khớp bước nạp ba ảnh khi chặn mạng. E15-step2.png (đã mở xem): cùng ngăn sau khi mở mạng, ba dòng Gửi được, Gửi được, Nội bộ đều nhãn xanh «Đã tải lên»; ảnh lớn phía sau đã hiện ảnh vừa tải. Khớp expected (ba ảnh da-tai). E15-db.txt: trước 0 dòng, lúc offline 0 dòng, sau 3 dòng (tăng 3), ba mã khác nhau (2 shareable, 1 internal), mã trùng 0, ba sự kiện added. Lưu ý trung thực: phản hồi 201 của POST /units/photos đầu bị Fetch.failRequest sau khi máy chủ đã ghi (ERR_FAILED); máy không gửi lại POST cho ảnh đó mà đối chiếu qua GET danh sách ảnh, rồi gửi hai ảnh còn lại — tổng ba POST, không dòng nào trùng. Kết quả cuối đúng expected.
  network_observed: clean

- eval: E16
  run_id: minted-chup-anh-dien-thoai-E16-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T06:40:32Z
  screenshot: evidence/E16-step2.png
  observed: |
    E16-step2.png (/s/eVmnDeC9fBxj, 375 wide, no login): header "[Mẫu] Sàn thử / [Mẫu] Đầu khách gửi bạn 1 căn", one blue-and-yellow cover image, "Toà A · A-04.01", "3,25 tỷ Bao phí", "Giá xác nhận 1 ngày trước", "Quan tâm" button. Exactly one image, with no gallery counter and no Nội bộ label. This matches Expected (one Gửi được cover, no Internal photo).
    E16-step3.png (dau-khach, /units/A-04.01 at 375x812): shows the same image, counter "1/2", status "Đang bán", the A-04.01 · Toà A profile, button "Hỏi đầu chủ · [Mẫu] Đầu chủ 1". No "Nội bộ" tab and no "Chụp ảnh" button, so the Internal photo is not shown. This matches Expected.
    E16-step4.png (dau-chu-1, same profile): same image with counter "1/3" and a "Chụp ảnh" button at the top right of the image, and the bottom button reads "Ghi cuộc gọi". Three photos, including the Internal one, are visible to the owner role. This is the positive control and matches Expected.
  network_observed: clean

- eval: E17
  run_id: minted-chup-anh-dien-thoai-E17-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-06T06:40:32Z
  output: |
    npm run test:ro-ri
    ℹ duration_ms 469.848875

- eval: E18
  run_id: e18-verifier-2026-11-06-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T06:40:32Z
  screenshot: evidence/E18-step1.png
  observed: |
    E18-step1.png: sheet "Chup anh - A-11.01 / Toa A" over a blurred profile at 375x812, "Gui duoc" selected, two rows each "Gui duoc" with an amber badge "Cho mang - tu tai khi co mang", and the "Mo may anh" button. This matches two photos queued offline. E18-step2.png: "Hom nay" screen (header, 24 viec, tab Hom nay active); the profile and sheet are gone; the header shows a struck-through cloud (offline); the red banner "Chua tai duoc lead giao cho ban" appears because /api/ is blocked. So the user left the profile and did not reopen it. E18-hom-nay.png: same /today screen 20s after the network was restored; the header icon is now a normal cloud (online) and the page is still /today, matching count +2 in E18-db.txt. E18-doichung-hom-nay.png: the control copy is also on /today after 20s with the same online icon, but its count stayed 3 -> 3 (+0). E18-doichung-step1/2 and E18c-step1 were saved but not opened. The lead banner persisting online in the real run is not part of this criterion.
  network_observed: clean

- eval: E19
  run_id: minted-chup-anh-dien-thoai-E19-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T06:40:32Z
  screenshot: evidence/E19-step1.png
  observed: |
    E19-step1.png (375px): ngan 'Chup anh · A-04.01 / Toa A', 2 dong, 'Gui duoc' va 'Noi bo' (co o khoa), moi dong the vang 'Cho mang — tu tai khi co mang'. E19-con.png: sau tai lai, ngan co dung 2 dong 'Cho mang' (Gui duoc, Noi bo). E19-menu.png: menu Tai khoan co muc Dang xuat (da chup, khong mo lai doc). E19-dang-xuat.png: trang 'Dang nhap Quy hang' (/login), form email, khong con du lieu nguoi dung. E19-nguoi-b.png: ngan cua nguoi B chi co 'Chua chup anh nao cho can nay.', khong co dong Cho mang. Khop Expected.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/connect
  run_id: minted-chup-anh-dien-thoai-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-06T06:40:32Z

- cmd: npm run test:hooks
  run_id: minted-chup-anh-dien-thoai-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-06T06:40:32Z

- cmd: npm run typecheck
  run_id: minted-chup-anh-dien-thoai-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-06T06:40:32Z

- cmd: npm run lint
  run_id: minted-chup-anh-dien-thoai-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-06T06:40:32Z

## Known limits

## Ngoài hợp đồng

## Analyst

Không phân biệt (xanh cả trên HEAD lẫn baseline, chứng minh harness chứ chưa chứng minh tính năng; cần viết lại để khẳng định hành vi mới hoặc xác nhận là regression-guard có chủ ý): E1, E2, E3, E4, E7, E8, E9 (npm test -w @quy-hang/web); E5 (npm test -w @quy-hang/api); E6 (npm test -w @quy-hang/core); E10 (design-floor-khuon); E11 (npm test -w @quy-hang/ui-lint); E17 (npm run test:ro-ri).

Baseline không đo: E12, E13, E14, E15, E16, E18, E19 (eval ui-check chạy trên chỗ thử sống, baseline n-a).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E15, E16 failed — hợp đồng sai ở năm chỗ. Returned to implementation.
Round 2: chấm lại — E12 theo luật mạng và hai lỗi trong hợp đồng. Returned to implementation.
Round 3: E14 failed — hợp đồng đòi đúng ba dòng mới nhưng căn A-15.05 có 6 dòng vì E12 nạp hai đợt ba ảnh trên cùng một căn; cần sửa hợp đồng E14 hoặc tách căn cho đợt tải lại. Returned to implementation.


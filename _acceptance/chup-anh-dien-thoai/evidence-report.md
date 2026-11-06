---
schema_version: 2
feature_slug: chup-anh-dien-thoai
verdict: REJECT
failed_evals: ["E15","E16"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b2323a50626791a0f7262183909a0138740efea3
human_signoff:
---

# Evidence Report: chup-anh-dien-thoai

Round 1. Hai eval ui-check trượt (E15, E16); mọi eval còn lại đạt. Lệnh fail không gắn eval: ui-check:E15 và ui-check:E16 (cùng hai eval trên, không có lệnh lạc).

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
| E15 | AC-4 | ui-check | FAIL |
| E16 | AC-5 | ui-check | FAIL |
| E17 | AC-5 | script | PASS |
| E18 | AC-3 | ui-check | PASS |
| E19 | AC-6 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-chup-anh-dien-thoai-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T23:51:54Z
  output: |
    npm test -w @quy-hang/web (chung với E2, E3, E4, E7, E8, E9)
    ℹ duration_ms 2756.503291

- eval: E2
  run_id: minted-chup-anh-dien-thoai-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T23:51:54Z
  output: |
    npm test -w @quy-hang/web (chung lần chạy với E1)
    ℹ duration_ms 2756.503291

- eval: E3
  run_id: minted-chup-anh-dien-thoai-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T23:51:54Z
  output: |
    npm test -w @quy-hang/web (chung lần chạy với E1)
    ℹ duration_ms 2756.503291

- eval: E4
  run_id: minted-chup-anh-dien-thoai-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T23:51:54Z
  output: |
    npm test -w @quy-hang/web (chung lần chạy với E1)
    ℹ duration_ms 2756.503291

- eval: E5
  run_id: minted-chup-anh-dien-thoai-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-11-05T23:51:54Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 60912.843542

- eval: E6
  run_id: minted-chup-anh-dien-thoai-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T23:51:54Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 951.4085

- eval: E7
  run_id: minted-chup-anh-dien-thoai-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T23:51:54Z
  output: |
    npm test -w @quy-hang/web (chung lần chạy với E1)
    ℹ duration_ms 2756.503291

- eval: E8
  run_id: minted-chup-anh-dien-thoai-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T23:51:54Z
  output: |
    npm test -w @quy-hang/web (chung lần chạy với E1)
    ℹ duration_ms 2756.503291

- eval: E9
  run_id: minted-chup-anh-dien-thoai-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T23:51:54Z
  output: |
    npm test -w @quy-hang/web (chung lần chạy với E1)
    ℹ duration_ms 2756.503291

- eval: E10
  run_id: minted-chup-anh-dien-thoai-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T23:51:54Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    12 tệp giao diện ngoài bản đồ

- eval: E11
  run_id: minted-chup-anh-dien-thoai-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-05T23:51:54Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 24751.665833

- eval: E12
  run_id: minted-chup-anh-dien-thoai-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T23:51:54Z
  screenshot: evidence/E12-truoc.png
  observed: |
    Tất cả khung đã mở bằng Read. E12-truoc.png (375x812, đầu chủ dau-chu-1, căn A-02.01 chưa có ảnh): ảnh lớn xám «Chưa có ảnh», nút «Chụp ảnh» ở góc trên phải ảnh lớn, nút «Ghi cuộc gọi» dính đáy. E12-chon-ngan.png: ngăn «Chụp ảnh · A-02.01 / Toà A», «Ảnh vào ngăn» với hai nút «Gửi được» và «Nội bộ», dòng «Chọn ngăn trước khi chụp.», «Mở máy ảnh» xám (tắt) dính đáy. E12-cho-mang.png: banner «Đang xem bản đã tải — mất mạng», khối «Mất mạng / Ảnh chờ trên máy và tự tải lên khi có mạng.», ba dòng: Gửi được, Gửi được, Nội bộ (có ổ khoá), mỗi dòng nhãn «Chờ mạng — tự tải khi có mạng»; «Mở máy ảnh» dính đáy. E12-da-tai.png: ba dòng đều «Đã tải lên», ảnh lớn phía sau đã hiện ảnh. E12-anh-lon.png: sau đóng ngăn, ảnh lớn là khối màu xanh lá/tím, chỉ số «1/3», nút «Chụp ảnh» còn trên ảnh. E12-dau-khach.png (đăng nhập dau-khach, cùng căn): ảnh lớn 1/6, nút dưới là «Hỏi đầu chủ · [Mẫu] Đầu chủ 1», KHÔNG có nút «Chụp ảnh» (DOM: 0 phần tử data-nut=chup-anh). E12-tai-lai.png: sau tải lại trang, mở lại ngăn: đúng ba dòng «Chờ mạng — tự tải khi có mạng», ảnh chờ còn từ IndexedDB. E12-tai-lai-da-tai.png: sau mở mạng, ba dòng «Đã tải lên». Mỗi cảnh một ảnh, khớp Expected. Lưu ý: ở bước tải lại, «chặn mạng» được mô phỏng bằng cách làm hỏng riêng các fetch POST/PUT tới /api/v1/units/photos, vì tải lại tài liệu khi offline thật không khả thi trên dev server; ở bước 2 dùng Network.emulateNetworkConditions offline thật.
  network_observed: clean

- eval: E13
  run_id: minted-chup-anh-dien-thoai-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T23:51:54Z
  screenshot: evidence/E13-step1.html
  observed: |
    E13-step1.html (đã mở bằng Read) là bản HTML bọc E13-mang.txt, chín dòng: căn Toà A / A-03.02; số dòng trước bằng 0; dau-khach upload-url và POST photos đều bị từ chối bằng listing-agent-required; số dòng sau dau-khach bằng 0; dau-chu-1 upload-url trả chỉ dẫn tải, POST photos tạo một ảnh Gửi được đúng căn; số dòng sau dau-chu-1 bằng 1. Khớp Expected. Điểm lệch nhỏ: lối upload-url của dau-chu-1 chỉ cấp chỉ dẫn tải và không ghi dòng, không vi phạm Expected.
  network_observed: n-a (driver)

- eval: E14
  run_id: minted-chup-anh-dien-thoai-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T23:51:54Z
  screenshot: evidence/E14-db.txt
  observed: |
    Đã đọc E14-db.txt (kết quả truy vấn). Căn mẫu A-02.01 (Toà A), lô mới nhất 2026-11-06 00:19:33Z có 3 dòng: hai Gửi được (thứ tự 6 và 7) và một Nội bộ (thứ tự 3); building_name, unit_number đúng. unit_photo_events có ba sự kiện added mang đúng compartment từng dòng. Khớp Expected. Căn còn ba lô 2+1 cũ từ các lần chạy E12 và design-pass trước nên tổng 12 dòng; kiểm «đúng ba dòng mới» đạt theo từng lần chạy và lần cuối, không đạt nếu đếm cả bảng.
  network_observed: n-a (driver)

- eval: E15
  run_id: minted-chup-anh-dien-thoai-E15-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T23:51:54Z
  screenshot: evidence/E15-step1.png
  observed: |
    E15-step1.png (375x812, căn A-03.01, khi còn offline): ngăn «Chụp ảnh · A-03.01 / Toà A» mở, khối «Mất mạng — ảnh chờ trên máy và tự tải lên khi có mạng», ba dòng đúng thứ tự Gửi được, Gửi được, Nội bộ (có ổ khoá), mỗi dòng «Chờ mạng»; nút «Mở máy ảnh» dính đáy. Khớp Expected. E15-step2.png (sau khi mở mạng và chặn phản hồi xác nhận đầu tiên): ba dòng đều thẻ xanh «Đã tải lên», ảnh lớn phía sau hiện ảnh vừa tải. E15-db.txt: trước 0 dòng, sau 3 dòng (2 Gửi được, 1 Nội bộ), ba mã khác nhau, không mã nào hai dòng, ba sự kiện added. Mọi khẳng định DB và giao diện đạt; eval trượt vì mạng: lúc gửi lại, lối upload-url trả mã 4xx (conflict) cho mã ảnh đã ghi trước đó mà Expected không khai, theo luật network truth thì tính trượt dù khung đẹp.
  network_observed: app-fail

- eval: E16
  run_id: minted-chup-anh-dien-thoai-E16-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T23:51:54Z
  screenshot: evidence/E16-step3.png
  observed: |
    E16-step3.png (dau-khach, 375x812, /units/A-02.01): header «Căn A-02.01», ảnh bìa khối màu xanh lá/tím với chỉ số «1/8», huy hiệu «Đang bán», giá 3,25 tỷ; không có nút «Chụp ảnh». Khớp mong đợi (đầu khách chỉ xem). E16-step4.png (dau-chu-1, cùng hồ sơ, đã mở ngăn): ngăn «Chụp ảnh · A-02.01 / Toà A» có hai nút ngăn và «Mở máy ảnh», nền hồ sơ có nút «Chụp ảnh». E16-step2.html (trang khách /s/W-6j3rapYRhf): chứa mã ảnh Gửi được de6f0d3b (ảnh bìa) và không chứa mã ảnh Nội bộ nào; không chứa hai mã Gửi được của lô E14 mới nhất vì trang chỉ dựng một ảnh bìa mỗi căn. Hai điểm lệch Expected: dau-chu-1 không tạo được link (vai chỉ listing_agent, API đòi buyer_agent hoặc team_lead) và trang khách không chứa mã Gửi được thuộc lô E14. Tính chất bảo mật giữ đúng (Nội bộ không ra ở phản hồi mạng, DOM, đường byte, trang khách; đối chứng dương bắt được mã Nội bộ ở phiên dau-chu-1), nhưng hai khẳng định theo chữ của Expected trượt.
  network_observed: clean

- eval: E17
  run_id: minted-chup-anh-dien-thoai-E17-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-05T23:51:54Z
  output: |
    npm run test:ro-ri
    ℹ duration_ms 2240.199541

- eval: E18
  run_id: minted-chup-anh-dien-thoai-E18-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T23:51:54Z
  screenshot: evidence/E18-step1.png
  observed: |
    E18-step1.png: 375x812, ngăn «Chụp ảnh · A-01.05 / Toà A» mở trên hồ sơ mờ mờ; chọn ngăn «Gửi được»; hai dòng ảnh nhỏ đều nhãn «Gửi được» và «Chờ mạng — tự tải khi có mạng»; nút «Mở máy ảnh». E18-step2.png: đã rời hồ sơ, màn «Hôm nay» (tab đang chọn), biểu tượng đám mây gạch chéo trên header (mất mạng). E18-hom-nay.png: cùng màn sau khi mở mạng, biểu tượng không còn gạch, vẫn ở /today, không mở lại hồ sơ; DB lúc đó 2 dòng. E18-doichung-hom-nay.png: bản đối chứng cùng màn nhưng DB đếm 0 dòng sau 20 giây. Số đếm trong E18-db.txt khớp Expected hai chiều.
  network_observed: clean

- eval: E19
  run_id: minted-chup-anh-dien-thoai-E19-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T23:51:54Z
  screenshot: evidence/E19-step1.png
  observed: |
    Khung 375x812, căn A-04.01 Đang bán, chưa có ảnh. E19-step1.png (dau-chu-1, chặn mạng, nạp 2 ảnh): ngăn «Chụp ảnh · A-04.01 / Toà A», hai dòng «Gửi được» và «Nội bộ» (có khoá) đều «Chờ mạng — tự tải khi có mạng»; nút «Chụp ảnh» có huy hiệu vàng. E19-con.png (sau tải lại, đăng nhập lại dau-chu-1): vẫn đúng 2 dòng chờ. E19-dang-xuat.png (sau Đăng xuất khi mạng còn chặn): ảnh lớn «Chưa có ảnh», nút «Chụp ảnh» không còn huy hiệu (kho đã xoá). E19-dang-xuat-xong.png: màn «Đăng nhập Quỹ hàng». E19-nguoi-b.png (truong-nhom, cùng căn): ngăn chỉ có «Chưa chụp ảnh nào cho căn này.», không ảnh chờ nào. Khớp Expected.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/connect
  run_id: minted-chup-anh-dien-thoai-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-05T23:51:54Z

- cmd: npm run test:hooks
  run_id: minted-chup-anh-dien-thoai-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-05T23:51:54Z

- cmd: npm run typecheck
  run_id: minted-chup-anh-dien-thoai-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-05T23:51:54Z

- cmd: npm run lint
  run_id: minted-chup-anh-dien-thoai-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-05T23:51:54Z

## Known limits

## Ngoài hợp đồng

## Analyst

Baseline không đo: E12, E13, E14, E15, E16, E18, E19 (ui-check chạy trên chỗ thử, không dựng lại được trên cây diffBase, baseline n-a).

Eval không phân biệt (xanh trên cả HEAD lẫn baseline, chứng minh bộ chạy chứ chưa chứng minh tính năng): E1, E2, E3, E4, E7, E8, E9 (cùng lệnh npm test -w @quy-hang/web), E5 (npm test -w @quy-hang/api), E6 (npm test -w @quy-hang/core), E10 (bước chấm khuôn design-floor), E11 (npm test -w @quy-hang/ui-lint), E17 (npm run test:ro-ri). Cần viết lại để khẳng định hành vi mới, hoặc xác nhận là lưới hồi quy có chủ ý.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E15, E16 failed. E15: lúc máy gửi lại, lối upload-url trả mã 4xx cho mã ảnh đã ghi, Expected không khai (mọi khẳng định DB và giao diện đều đạt). E16: eval ghi sai vai người tạo link (dau-chu-1 không phải buyer_agent) và sai mã đối chứng (trang khách chỉ dựng ảnh bìa); tính chất bảo mật giữ đúng. Returned to implementation.


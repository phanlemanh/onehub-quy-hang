---
schema_version: 2
feature_slug: cot-ho-so-can
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7eaea147e22d7705549d910420a83177e4bc83a0
human_signoff: Manh Phan 2026-11-01
---

# Evidence Report: cot-ho-so-can

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | ui-check | PASS |
| E9b | AC-9 | ui-check | PASS |
| E10 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-cot-ho-so-can-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T03:27:24Z
  output: |
    npm test -w @quy-hang/web: ca «đường của cột hồ sơ» ok; duration_ms 179.620667

- eval: E2
  run_id: minted-cot-ho-so-can-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T03:27:24Z
  output: |
    npm test -w @quy-hang/web: ca «thuộc tính căn tự điền» ok; duration_ms 179.620667

- eval: E3
  run_id: minted-cot-ho-so-can-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T03:27:24Z
  output: |
    npm test -w @quy-hang/web: ca «lần rao của căn» ok; duration_ms 179.620667

- eval: E4
  run_id: minted-cot-ho-so-can-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T03:27:24Z
  output: |
    npm test -w @quy-hang/web: ca «dòng lịch sử từ sự kiện» ok; duration_ms 179.620667

- eval: E5
  run_id: minted-cot-ho-so-can-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T03:27:24Z
  output: |
    npm test -w @quy-hang/web: ca «lịch sử khi mất mạng» ok; duration_ms 179.620667

- eval: E6
  run_id: minted-cot-ho-so-can-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T03:27:24Z
  output: |
    npm test -w @quy-hang/web: ca «báo sai thông tin căn» ok; duration_ms 179.620667

- eval: E7
  run_id: minted-cot-ho-so-can-E7-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T03:27:24Z
  output: |
    npm test -w @quy-hang/web: ca «tìm căn theo mã» ok; duration_ms 179.620667

- eval: E8
  run_id: minted-cot-ho-so-can-E8-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-01T03:27:24Z
  output: |
    npm run lint
    chuẩn giao diện: đạt

- eval: E8b
  run_id: minted-cot-ho-so-can-E8b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-01T03:27:24Z
  output: |
    npm test -w @quy-hang/ui-lint
    duration_ms 13104.031625

- eval: E10
  run_id: minted-cot-ho-so-can-E10-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-01T03:27:24Z
  output: |
    design-floor-s4.mjs --root . : không mã màu thô trên tệp giao diện vòng chạm

- eval: E9
  run_id: minted-cot-ho-so-can-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T03:27:24Z
  screenshot: evidence/E9-cot.png
  observed: |
    E9-cot.png: cot ho so ben phai bang, dau «A-06.01 Dang ban», 3,25 ty Bao phi, thanh muc du 3/5, THUOC TINH CAN 7 dong dung (1PN, 54,2 m2, 6, Dong Nam, Toa A, Khu, Can ho), nut Bao sai, LAN RAO DANG MO, CAC LAN RAO; dong A-06.01 (row 6) duoc danh dau trong bang. E9-bao-sai.png/E9-step5.png: hop thoai «Bao sai thong tin can A-06.01», truong Loai can, Gia tri dung 70,2 m2, nut «Chep va mo bang chia se» sang. E9-tai-lai.png: tai lai mo dung A-06.01. E9-step7.png: dau cot Ngung han 3,1 ty. E9-mat-mang-c.png: can A-04.06 voi «Lich su can mang de tai lan dau», Lan 1 Dang ban 8,06 ty, trang binh thuong. E9-mat-mang.png: A-06.01 mo lai khi offline (DOM lich su 6 dong + «dang xem ban tren may»). E9-ngoai-danh-muc.png: Z-99.99 «Chua co trong danh muc», khong nut Bao sai. E9-375.png: mot cot 375px, khong tran ngang, thuoc tinh/lan rao dang mo/cac lan rao. E9-nhieu-can.png va KHONG-CO theo DOM dung chu mong doi. Tat ca khop Expected.
  network_observed: clean
  output: |
    Doi chung PASS: dau cot truoc/sau bam can khac khac nhau (A-06.01 vs A-13.01, A-04.06).
    Frames da luu (evidence/): E9-step1.png, E9-cot.png, E9-step3-can-khac.png, E9-step3-cuon-day.png, E9-bao-sai.png, E9-step5.png, E9-step5-da-chep.png, E9-tai-lai.png, E9-step7.png, E9-mat-mang-c.png, E9-mat-mang.png, E9-ngoai-danh-muc.png, E9-375.png, E9-nhieu-can.png; network: E9-network.txt.
    Luu y: E9-bao-sai.png và E9-step5.png chụp lúc share native đang chờ (chưa thấy chữ báo); DOM «Da chep» ở lần bấm hai (E9-step5-da-chep.png).

- eval: E9b
  run_id: minted-cot-ho-so-can-E9b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T03:27:24Z
  screenshot: evidence/E9b-step1.html
  observed: |
    Đã mở file E9b-step1.html (bản fallback, không phải ảnh). Nội dung khớp DOM cột hồ sơ lúc chạy: A-06.01 Toà A, Đang bán, 3,25 tỷ, Bao phí, mức đủ 3/5. Có hai lần rao (Lần 2 Đang bán 3,25 tỷ, Lần 1 Ngừng hẳn 3,1 tỷ). Lịch sử có 6 dòng, mới nhất trên: Xác nhận, Đổi giá 3,4→3,25 tỷ, Đổi trạng thái →Đang bán, Đổi phần lần rao, Đổi giá —→3,4 tỷ, Tạo lần rao. Số liệu API khớp: 6 sự kiện (created, price_changed, details_changed, status_changed:Active, price_changed, owner_confirmed), listPrice 3250000000, standardStatus Active, filled 3/5. Thứ tự cột là ngược của API (mới nhất trên). Không có ảnh PNG: Playwright kẹt ở màn tải, còn screencapture ra ảnh đen; đã xoá ảnh đen để khỏi làm bằng chứng sai. Ảnh xem trực tiếp trong Browser pane thì thấy cột và hộp thoại «Báo sai thông tin căn A-06.01» đúng như trên.
  network_observed: clean
  output: |
    - ĐẠT: Báo sai, lần 2 (click DOM, không sinh focus): giữa marker2-truoc-bao-sai và marker2-sau-chia-se có 0 lời gọi /api. Nội dung soạn trong hộp thoại hiện đúng và có dòng «Máy này không chép hay chia sẻ được — chọn và chép tay» (môi trường tự động hoá, không có chữ «Đã chép»).
    - Network: không thấy request lỗi của app trong phiên này. Console không có lỗi app, chỉ 404 do marker tự gài.
    - Frame đã lưu: evidence/E9b-step1.html (fallback .html, không có capture.ui). Network: evidence/E9b-network.txt.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-cot-ho-so-can-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-01T03:27:24Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-cot-ho-so-can-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-01T03:27:24Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-cot-ho-so-can-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-01T03:27:24Z

- cmd: npm run test:hooks
  run_id: minted-cot-ho-so-can-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-01T03:27:24Z

- cmd: npm run typecheck
  run_id: minted-cot-ho-so-can-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-01T03:27:24Z

## Known limits

## Ngoài hợp đồng

## Analyst

Không có eval dạng judgment, nên không có panel chấm; không mục nào chờ human_override.

Eval không phân biệt (xanh ở cả code mới lẫn baseline): E1, E2, E3, E4, E5, E6, E7 (lệnh npm test -w @quy-hang/web); E8 (npm run lint); E8b (npm test -w @quy-hang/ui-lint); E10 (design-floor-s4). Cần viết lại để khẳng định hành vi mới, hoặc xác nhận là lớp chắn hồi quy có chủ ý. E9 và E9b: baseline n-a.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 2: mọi eval xanh (E1-E7, E8, E8b, E9, E9b, E10) và các lệnh suite xanh; commit được ghim 844809f. Lịch sử round trước nằm trong run-log.jsonl.

### Re-pin lần 1 — 2026-11-01, do hoá cũ do gộp main và chính commit chữ ký
run_id: repin-20261101T074712Z-61496
sha: c3c7d88cca32557036250c1747e056768d288722 · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E9, E9b · diff chạm vật đo ngoài làn máy: E9 — chưa chứng lại, đi vòng S4 delta

### Re-pin lần 2 — 2026-11-01, do san-sang-ban (hàng 23) chạm đường của hồ sơ: nút Sẵn sàng bán ở hồ sơ căn, bước tải ảnh thật trong dung-h
run_id: repin-20261101T163718Z-11972
sha: 7eaea147e22d7705549d910420a83177e4bc83a0 · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E9, E9b · diff chạm vật đo ngoài làn máy: E9, E9b — chưa chứng lại, đi vòng S4 delta

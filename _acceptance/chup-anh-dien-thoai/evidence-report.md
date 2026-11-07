---
schema_version: 2
feature_slug: chup-anh-dien-thoai
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2d16ce378514870478bd68c1f6b5c1ba9b1bb8bf
human_signoff: Manh Phan 2026-11-07
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
  run_id: minted-chup-anh-dien-thoai-E1-r7
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T14:40:58Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 2966.252625

- eval: E2
  run_id: minted-chup-anh-dien-thoai-E2-r7
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T14:40:58Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 2966.252625

- eval: E3
  run_id: minted-chup-anh-dien-thoai-E3-r7
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T14:40:58Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 2966.252625

- eval: E4
  run_id: minted-chup-anh-dien-thoai-E4-r7
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T14:40:58Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 2966.252625

- eval: E5
  run_id: minted-chup-anh-dien-thoai-E5-r7
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-11-06T14:40:58Z
  output: |
    npm test -w @quy-hang/api
    duration_ms 746.392334

- eval: E6
  run_id: minted-chup-anh-dien-thoai-E6-r7
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T14:40:58Z
  output: |
    npm test -w @quy-hang/core
    duration_ms 863.372792

- eval: E7
  run_id: minted-chup-anh-dien-thoai-E7-r7
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T14:40:58Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 2966.252625

- eval: E8
  run_id: minted-chup-anh-dien-thoai-E8-r7
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T14:40:58Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 2966.252625

- eval: E9
  run_id: minted-chup-anh-dien-thoai-E9-r7
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T14:40:58Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 2966.252625

- eval: E10
  run_id: minted-chup-anh-dien-thoai-E10-r7
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-06T14:40:58Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    13 tệp giao diện ngoài bản đồ

- eval: E11
  run_id: minted-chup-anh-dien-thoai-E11-r7
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-06T14:40:58Z
  output: |
    npm test -w @quy-hang/ui-lint
    duration_ms 38480.039542

- eval: E12
  run_id: minted-chup-anh-dien-thoai-E12-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T14:40:58Z
  screenshot: evidence/E12-truoc.png
  observed: |
    Đã mở từng frame ở 375x812. Đầu chủ (dau-chu-1): ảnh lớn có nút «Chụp ảnh»; ngăn «Chụp ảnh · A-01.05 / Toà A» có hai nút ngăn «Gửi được» và «Nội bộ» (khoá), «Mở máy ảnh» dính đáy và xám khi chưa chọn ngăn. Khi chặn mạng: khối «Mất mạng» và ba dòng «Chờ mạng — tự tải khi có mạng» (Gửi được, Gửi được, Nội bộ); mở mạng: ba dòng «Đã tải lên», đóng ngăn thì ảnh lớn 1/3.
    Đầu khách: không có nút «Chụp ảnh» (căn Đang bán A-04.06 hiện ảnh 1/1 và «Hỏi đầu chủ»; đầu chủ cùng căn có nút). Tải lại trang khi còn ảnh chờ: mở lại ngăn còn đúng ba dòng «Chờ mạng» từ kho IndexedDB, sau mở mạng thành «Đã tải lên». Lệch nhỏ đã ghi: căn A-01.05 không nằm trong hàng đầu khách nên chụp bổ sung căn khác; lúc tải lại không giả lập offline nên không có khối «Mất mạng».
  network_observed: clean

- eval: E13
  run_id: minted-chup-anh-dien-thoai-E13-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T14:40:58Z
  screenshot: evidence/E13-step1.html
  observed: |
    Đã mở E13-step1.html (không có frame ảnh). Đầu khách gọi xin link tải lên và ghi ảnh đều bị từ chối với lý do listing-agent-required, số dòng unit_photos của căn Toà A A-02.06 giữ nguyên 8/8. Đối chứng đầu chủ (dau-chu-1): cả hai lời gọi thành công, thêm đúng một dòng (ngăn Gửi được), số dòng thành 9/9. Khớp Expected.
  network_observed: n-a (driver)

- eval: E14
  run_id: minted-chup-anh-dien-thoai-E14-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T14:40:58Z
  screenshot: evidence/E14-db.txt
  observed: |
    Đã đọc E14-db.txt (không có frame ảnh). Căn Toà A A-03.04 có ba dòng unit_photos mới: hai shareable, một internal, đúng building_name và unit_number, không có removed_at. unit_photo_events có ba sự kiện added mang đúng compartment tương ứng, số sự kiện lệch compartment so với dòng ảnh bằng 0. Khớp Expected.
  network_observed: n-a (driver)

- eval: E15
  run_id: minted-chup-anh-dien-thoai-E15-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T14:40:58Z
  screenshot: evidence/E15-step1.png
  observed: |
    Đã mở E15-step1.png và E15-step2.png (375x812). Bước 1: ngăn «Chụp ảnh · A-10.05 / Toà A» với khối «Mất mạng» và ba dòng nhãn «Chờ mạng — tự tải khi có mạng» (Gửi được, Gửi được, Nội bộ). Bước 2: cả ba dòng thành «Đã tải lên». E15-db.txt: số dòng unit_photos của căn tăng đúng 3 (từ 1 lên 4), không mã nào hai dòng, hai Gửi được và một Nội bộ. Phản hồi của lời xác nhận ảnh đầu tiên bị cắt sau khi máy chủ đã ghi, máy gửi lại/đối chiếu và ảnh vẫn thành «Đã tải lên» mà không thêm dòng thứ hai. Không mâu thuẫn với Expected.
  network_observed: clean

- eval: E16
  run_id: minted-chup-anh-dien-thoai-E16-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T14:40:58Z
  screenshot: evidence/E16-step2.png
  observed: |
    Trang khách /s/6CA79Zbb81dN (không đăng nhập, 375x812): «Đầu khách gửi bạn 1 căn», một thẻ căn Toà A · A-10.05 với đúng một ảnh bìa, giá 6,97 tỷ, nút Quan tâm, không có ảnh hay chữ Nội bộ. E16-step3.png (đầu khách): hồ sơ căn, bộ đếm ảnh 1/3, không có nút Chụp ảnh, không thẻ Nội bộ. E16-step4.png (dau-chu-1): bộ đếm 1/4, có nút Chụp ảnh — thấy thêm đúng một ảnh Nội bộ. Bằng chứng mạng: đầu khách không nhận byte ảnh Nội bộ, đối chứng dương đầu chủ bắt được mã ảnh Nội bộ. Khớp Expected.
  network_observed: clean

- eval: E17
  run_id: minted-chup-anh-dien-thoai-E17-r7
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-06T14:40:58Z
  output: |
    npm run test:ro-ri
    duration_ms 811.537458

- eval: E18
  run_id: minted-chup-anh-dien-thoai-E18-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T14:40:58Z
  screenshot: evidence/E18-step1.png
  observed: |
    Đã mở E18-step1.png, E18-step2.png, E18-hom-nay.png, E18-doichung-step1.png, E18-doichung-hom-nay.png. Căn A-11.01 (375x812): ngăn «Chụp ảnh · A-11.01 / Toà A» có hai dòng Gửi được nhãn «Chờ mạng — tự tải khi có mạng»; sau khi đóng ngăn, hồ sơ «Chưa có ảnh» với nút «Chụp ảnh» mang huy hiệu 2; ở tab «Hôm nay» (không mở lại hồ sơ) sau khi mở mạng và chờ 20 giây, số dòng của căn tăng đúng 2. Căn đối chứng B-06.02 cùng cảnh giữ nguyên số dòng nên bộ đếm phân biệt được hai trường hợp. Không mở E18-doichung-step2.png và các frame E18-offline-*.
  network_observed: clean

- eval: E19
  run_id: minted-chup-anh-dien-thoai-E19-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T14:40:58Z
  screenshot: evidence/E19-step1.png
  observed: |
    E19-step1.png (375x812): ngăn «Chụp ảnh · A-04.06» có hai dòng ảnh Gửi được và Nội bộ (có ổ khoá), cùng nhãn chờ mạng. Sau tải lại và mở lại ngăn (E19-con.png) vẫn hai dòng chờ. Sau đăng xuất là màn «Đăng nhập Quỹ hàng» và danh sách kho IndexedDB rỗng (E19-idb.txt). Người B (truong-nhom) cùng Chrome mở cùng căn: ngăn chỉ có hai nút ngăn và dòng «Chưa chụp ảnh nào cho căn này.», không dòng chờ nào; số dòng unit_photos không đổi. Khớp Expected.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/connect
  run_id: minted-chup-anh-dien-thoai-SUITE-npm_test_w_quy_hang_connect-r7
  exit_code: 0
  verified_at: 2026-11-06T14:40:58Z

- cmd: npm run test:hooks
  run_id: minted-chup-anh-dien-thoai-SUITE-test_hooks-r7
  exit_code: 0
  verified_at: 2026-11-06T14:40:58Z

- cmd: npm run typecheck
  run_id: minted-chup-anh-dien-thoai-SUITE-typecheck-r7
  exit_code: 0
  verified_at: 2026-11-06T14:40:58Z

- cmd: npm run lint
  run_id: minted-chup-anh-dien-thoai-SUITE-lint-r7
  exit_code: 0
  verified_at: 2026-11-06T14:40:58Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline diffBase — chứng minh bộ kiểm, cần viết lại để khẳng định hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/web: E1, E2, E3, E4, E7, E8, E9
- npm test -w @quy-hang/api: E5
- npm test -w @quy-hang/core: E6
- design-floor-khuon.mjs --kiem --root .: E10
- npm test -w @quy-hang/ui-lint: E11
- npm run test:ro-ri: E17

Baseline không đo: E12, E13, E14, E15, E16, E18, E19 (eval ui-check, kết quả máy ghi n-a).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 7: mọi eval (E1–E19) và bốn lệnh suite đều PASS trên commit faab3891; không eval nào lỗi. Lịch sử các round trước xem run-log.jsonl.


### Re-pin lần 1 — 2026-11-07, do ghim lại sau khi gộp nhánh chính
run_id: repin-20261107T030752Z-79916
sha: 2d16ce378514870478bd68c1f6b5c1ba9b1bb8bf · suites: 7 lệnh exit 0 · evals: 12/12 eval máy đạt kỳ vọng · ngoài làn máy: E12, E13, E14, E15, E16, E18, E19 · diff chạm vật đo ngoài làn máy: E12, E13, E16, E19 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-10

---
schema_version: 2
feature_slug: thue-phi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4f7809c0808b762c6832bee16d644d6847d7770e
human_signoff:
---

# Evidence Report: thue-phi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS |
| E2a | AC-2 | ui-check | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | ui-check | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7a | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E7c | AC-7 | ui-check | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | ui-check | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-1 | script | PASS |
| E13 | AC-1 | script | PASS |
| E12 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-thue-phi-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T05:51:16Z
  screenshot: evidence/E1-1440.png
  observed: |
    E1-1440.png: trang Cài đặt > Thuế phí của sàn [Mẫu] Sàn thử, nền tối. Ba dòng theo thứ tự: Thuế thu nhập cá nhân (công tắc bật, «2% · theo luật», Mặc định, không ô sửa), Lệ phí trước bạ (công tắc bật, «0,5% · theo luật», Mặc định, không ô sửa), Môi giới (công tắc bật, ô số có nút −/+ hiện 1,5, dòng nguồn «Đã đổi · [Mẫu] Quản trị sàn · 06/11»). Chân: «Giá bao phí 3 tỷ → về tay 2,88 tỷ». E1-truoc.png: cùng màn trước khi đặt, dòng Môi giới ô sửa hiện 1, nguồn «Mặc định», chân «về tay 2,895 tỷ»; hai dòng thuế/lệ phí giống ảnh sau. Cả hai khớp Expected.
  network_observed: n-a (driver)

- eval: E2a
  run_id: minted-thue-phi-E2a-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T05:51:16Z
  screenshot: evidence/E2a-step1.png
  observed: |
    E2a-step1.png (bản chép của E2-sau-luu.png): màn Thuế phí của sàn [Mẫu] Sàn thử. Thuế TNCN bật (2%, theo luật), Lệ phí trước bạ TẮT (0,5%), Môi giới bật, ô nhập hiện 2. Mỗi dòng ghi "Đã đổi · [Mẫu] Quản trị sàn · 06/11". Dòng tính thử "Giá bao phí 3 tỷ → về tay 2,88 tỷ". Nút Lưu và Hoàn lại đã mờ (không còn thay đổi chưa lưu). Toast dưới màn: «Đã lưu · áp cho giá ghi từ bây giờ». Khớp Expected. E2a-step2.png (E2-sai.png): gõ Môi giới 6, câu lỗi đỏ ngay dưới ô Môi giới «Môi giới từ 0 tới 5%, bước 0,1», nút Lưu mờ (khoá), không toast. Khớp. E2a-step3.png (E2-sai-cong-tac.png): cả ba công tắc tắt, câu lỗi đỏ «Bao phí cần ít nhất một khoản» dưới khối công tắc/Môi giới, Lưu mờ (khoá). Khớp.
  network_observed: n-a (driver)

- eval: E2b
  run_id: minted-thue-phi-E2b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.api_db
  verified_at: 2026-11-06T05:51:16Z
  output: |
    ℹ duration_ms 116354.132334

- eval: E3
  run_id: minted-thue-phi-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.api_db
  verified_at: 2026-11-06T05:51:16Z
  output: |
    ℹ duration_ms 116354.132334

- eval: E3b
  run_id: minted-thue-phi-E3b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T05:51:16Z
  screenshot: evidence/E3b-step1.png
  observed: |
    E3b-step1.png (anh truong nhom, da mo bang Read): trang Cai dat > Ca nhan, tai khoan truong-nhom@mau.quy-hang.test, san [Mau] San thu; ngay duoi tieu de co khung thong bao «Muc nay chi quan tri san mo duoc»; menu ben trai chi co muc Ca nhan (khong co muc Thue phi). Khop Expected. Anh dau chu va quan tri khong luu thanh file, chi co bang chung o dong JSON e3.
  network_observed: n-a (driver)

- eval: E4
  run_id: minted-thue-phi-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.api_db
  verified_at: 2026-11-06T05:51:16Z
  output: |
    ℹ duration_ms 116354.132334

- eval: E5
  run_id: minted-thue-phi-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T05:51:16Z
  output: |
    ℹ duration_ms 114311.06725

- eval: E6
  run_id: minted-thue-phi-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T05:51:16Z
  output: |
    ℹ duration_ms 114311.06725

- eval: E7a
  run_id: minted-thue-phi-E7a-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.api_db
  verified_at: 2026-11-06T05:51:16Z
  output: |
    ℹ duration_ms 116354.132334

- eval: E7b
  run_id: minted-thue-phi-E7b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T05:51:16Z
  output: |
    ℹ duration_ms 3010.852916

- eval: E7c
  run_id: minted-thue-phi-E7c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T05:51:16Z
  screenshot: evidence/E7-ho-so.png
  observed: |
    E7-ho-so.png (= E7c-step1): ho so can A-49.01 (Toà A), gia lon "3 tỷ" kem the "Bao phí"; ngay duoi gia la dong phu "Tính theo định nghĩa ngày 06/11/2026: Thuế TNCN 2% · Trước bạ 0,5% · Môi giới 1% — về tay 2,895 tỷ", khop expected tung chu; thanh muc du thong tin 1/5 nam duoi dong phu. E7-khong-bao-phi.png (= E7c-step2): can A-49.02, gia "2,5 tỷ" kem the "Không bao phí"; ngay duoi gia di thang toi thanh muc du thong tin, KHONG co dong phu nao. Khop Expected.
  network_observed: n-a (driver)

- eval: E8
  run_id: minted-thue-phi-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T05:51:16Z
  output: |
    ℹ duration_ms 3010.852916

- eval: E8b
  run_id: minted-thue-phi-E8b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T05:51:16Z
  screenshot: evidence/E8-may-tinh.png
  observed: |
    E8-may-tinh.png: màn cuộc gọi lead, phần «Tính giá» của sàn [Mẫu] Sàn thử: Giá chủ báo «3 tỷ», Môi giới % «2», nút Bao phí được chọn; đúng hai dòng khoản: «Thuế thu nhập cá nhân 2%» 60.000.000 đ và «Môi giới 2%» 60.000.000 đ (không có lệ phí trước bạ); «Chủ nhận về tay» «2,88 tỷ», dưới là 2.880.000.000 đ, nhãn «Tỉ lệ của sàn». Khớp Expected. E8-mac-dinh.png: cùng ca sau khi đưa sàn về mặc định, tải lại: Giá «3 tỷ», Môi giới % «1»; ba dòng «Thuế thu nhập cá nhân 2%» 60.000.000 đ, «Lệ phí trước bạ 0,5%» 15.000.000 đ, «Môi giới 1%» 30.000.000 đ; về tay «2,895 tỷ» (2.895.000.000 đ). Khớp Expected.
  network_observed: n-a (driver)

- eval: E9
  run_id: minted-thue-phi-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T05:51:16Z
  output: |
    ℹ duration_ms 1599.02425

- eval: E10
  run_id: minted-thue-phi-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T05:51:16Z
  output: |
    ℹ duration_ms 1599.02425

- eval: E11
  run_id: minted-thue-phi-E11-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.design.khuon
  verified_at: 2026-11-06T05:51:16Z
  output: |
    11 tệp giao diện ngoài bản đồ

- eval: E13
  run_id: minted-thue-phi-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/thue-phi/thu/kiem-khuon-e11.mjs
  verified_at: 2026-11-06T05:51:16Z
  output: |
    E13: chỉ có dòng báo oan đã khai: lệch: apps/web/src/app/(app)/settings/fees/page.tsx · thuộc hai nhóm màn: cai-dat-san, trang-tam

- eval: E12
  run_id: minted-thue-phi-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.floor
  verified_at: 2026-11-06T05:51:16Z
  output: |
    (không có dòng cảnh báo)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-thue-phi-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-06T05:51:16Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-thue-phi-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-06T05:51:16Z

- cmd: npm run test:hooks
  run_id: minted-thue-phi-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-06T05:51:16Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-thue-phi-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-06T05:51:16Z

- cmd: npm run typecheck
  run_id: minted-thue-phi-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-06T05:51:16Z

- cmd: npm run lint
  run_id: minted-thue-phi-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-06T05:51:16Z

## Known limits

- E11 (AC-1) dat-co-gioi-han: ma thoat 1 la ket qua DA KHAI TRUOC cua eval nay, khong phai mot luot truot. Lenh: R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-khuon.mjs" --kiem --root .

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (xanh trên cả HEAD lẫn baseline; hoặc là harness, hoặc là regression-guard có chủ ý):

- npm run db:migrate && npm run db:test: E5, E6
- npm test -w @quy-hang/web: E7b, E8
- npm test -w @quy-hang/core: E9, E10
- design-floor-s4.mjs --root .: E12

### Baseline khong do

- node _acceptance/thue-phi/thu/kiem-khuon-e11.mjs: bo qua baseline: tep _acceptance/thue-phi/thu/kiem-khuon-e11.mjs co o cay dang kiem nhung chua co o merge-base b1c57654719f99e2adf50b1910ce3ced438472ef — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả eval xanh (E11 đạt có giới hạn, E13 xanh); không có eval trượt.

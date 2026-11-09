---
schema_version: 2
feature_slug: loai-hinh-trong-cach-goi
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1aad447d7b6f7da60bd3b9b5df453d091772e39c
human_signoff:
---

# Evidence Report: loai-hinh-trong-cach-goi

Vòng 1. Mọi eval của hợp đồng xanh, nhưng hai lệnh suite không gắn eval (kiểm của gói ui-lint và lint) đỏ vì bước chấm khuôn báo trang Bảng hàng sai gốc. Vì vậy kết luận REJECT.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E3c | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | script | PASS |
| E9 | AC-9 | ui-check | PASS |
| E10 | AC-1 | script | PASS |
| E11 | AC-4 | script | PASS |
| E12 | AC-5 | script | PASS |
| E13 | AC-6 | script | PASS |
| E14 | AC-1 | script | PASS |
| E15 | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-loai-hinh-trong-cach-goi-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-09T01:30:13Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 17673.445084

- eval: E3
  run_id: minted-loai-hinh-trong-cach-goi-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-09T01:30:13Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 17673.445084

- eval: E8
  run_id: minted-loai-hinh-trong-cach-goi-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-09T01:30:13Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 17673.445084

- eval: E1b
  run_id: minted-loai-hinh-trong-cach-goi-E1b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T01:30:13Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 5739.707875

- eval: E3b
  run_id: minted-loai-hinh-trong-cach-goi-E3b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T01:30:13Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 5739.707875

- eval: E4
  run_id: minted-loai-hinh-trong-cach-goi-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T01:30:13Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 5739.707875

- eval: E5
  run_id: minted-loai-hinh-trong-cach-goi-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T01:30:13Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 5739.707875

- eval: E6
  run_id: minted-loai-hinh-trong-cach-goi-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T01:30:13Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 5739.707875

- eval: E7b
  run_id: minted-loai-hinh-trong-cach-goi-E7b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T01:30:13Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 5739.707875

- eval: E2
  run_id: minted-loai-hinh-trong-cach-goi-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-09T01:30:13Z
  output: |
    lệnh: db:migrate rồi db:test trên Postgres cổng 5576
    ℹ duration_ms 161081.56375

- eval: E3c
  run_id: minted-loai-hinh-trong-cach-goi-E3c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-09T01:30:13Z
  output: |
    lệnh: db:migrate rồi db:test trên Postgres cổng 5576
    ℹ duration_ms 161081.56375

- eval: E7
  run_id: minted-loai-hinh-trong-cach-goi-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-09T01:30:13Z
  output: |
    lệnh: db:migrate rồi db:test trên Postgres cổng 5576
    ℹ duration_ms 161081.56375

- eval: E8b
  run_id: minted-loai-hinh-trong-cach-goi-E8b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-09T01:30:13Z
  output: |
    lệnh: npm run test:ro-ri
    ℹ duration_ms 1693.770125

- eval: E10
  run_id: minted-loai-hinh-trong-cach-goi-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-09T01:30:13Z
  output: |
    lệnh: npm run typecheck (kiểm kiểu mọi gói xong, không lỗi)

- eval: E11
  run_id: minted-loai-hinh-trong-cach-goi-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-09T01:30:13Z
  output: |
    lệnh: design-floor-khuon.mjs --kiem --root .
    13 tệp giao diện ngoài bản đồ

- eval: E12
  run_id: minted-loai-hinh-trong-cach-goi-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-09T01:30:13Z
  output: |
    lệnh: design-floor-khuon.mjs --kiem --root .
    13 tệp giao diện ngoài bản đồ

- eval: E13
  run_id: minted-loai-hinh-trong-cach-goi-E13-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-09T01:30:13Z
  output: |
    lệnh: design-floor-khuon.mjs --kiem --root .
    13 tệp giao diện ngoài bản đồ

- eval: E14
  run_id: minted-loai-hinh-trong-cach-goi-E14-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-09T01:30:13Z
  output: |
    lệnh: design-floor-khuon.mjs --kiem --root .
    13 tệp giao diện ngoài bản đồ

- eval: E15
  run_id: minted-loai-hinh-trong-cach-goi-E15-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.floor
  verified_at: 2026-11-09T01:30:13Z
  output: |
    lệnh: design-floor-s4.mjs --root .
    không in mã màu thô nào

- eval: E9
  run_id: minted-loai-hinh-trong-cach-goi-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T01:30:13Z
  screenshot: evidence/E9-cach-goi.png
  observed: |
    E9-cach-goi.png: màn Cách gọi (quản trị sàn) có hàng «Loại hình · Nhà phố» với ô nhập đã điền «Liền kề» và «Loại hình · Căn hộ» điền «Căn cao tầng», kèm nút Trả về mặc định; thông báo «Đã lưu cách gọi». Khớp bước 1.
    E9-bang-hang.png: Bảng hàng, cột Loại hình có ô «Liền kề» ở các dòng nhà phố; dropdown lọc Loại hình liệt kê Mọi loại hình, Biệt thự, Căn cao tầng, Chưa rõ, Đất, Liền kề; không có «Nhà phố». Khớp bước 2.
    E9-ho-so.png: cột hồ sơ cạnh bảng của căn nhà phố, tiêu đề «… Liền kề», mục THUỘC TÍNH CĂN dòng Loại hình = Liền kề. Khớp bước 3.
    E9-toan-man.png: hồ sơ toàn màn A-01.04, đầu trang «Toà A · Căn cao tầng», dòng Loại hình = Căn cao tầng (tên riêng thay «Căn hộ»). Khớp bước 4.
    E9-hom-nay.png: màn Hôm nay, cột hồ sơ bên phải của hàng đang mở hiện «… Liền kề» và Loại hình = Liền kề. Khớp bước 5.
    E9-tra-ve.png: sau Trả về mặc định, Bảng hàng hiện lại «Nhà phố» ở các dòng và không còn «Liền kề». Khớp bước 6. (Huy hiệu «1 Issue» của overlay Next dev ở góc ảnh, không liên quan tới assertion.)
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-loai-hinh-trong-cach-goi-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-09T01:30:13Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-loai-hinh-trong-cach-goi-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-09T01:30:13Z

- cmd: npm run test:hooks
  run_id: minted-loai-hinh-trong-cach-goi-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-09T01:30:13Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-loai-hinh-trong-cach-goi-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 1
  verified_at: 2026-11-09T01:30:13Z
  output: |
    Ca «cây lành in dòng tóm tắt, Người dùng trả <main> thì đỏ» trong tests/rang-giu-khuon.test.mjs đỏ.
    khuôn: apps/web/src/app/(app)/inventory/page.tsx: bang-hang — gốc là <TuVungProvider>, phải là <KhungBangHang> (khuôn của nhóm bang-hang)

- cmd: npm run lint
  run_id: minted-loai-hinh-trong-cach-goi-SUITE-lint-r1
  exit_code: 1
  verified_at: 2026-11-09T01:30:13Z
  output: |
    eslint: 0 lỗi, 3 cảnh báo (COT không dùng ở bang-hang.tsx:44; LoiTrenMay không dùng ở cell-edit/tren-o.tsx:20; useVirtualizer không memo được ở cards/bang-the.tsx:115).
    mức nợ giao diện: 0/0 · ngoại lệ có lý do: 12
    khuôn: apps/web/src/app/(app)/inventory/page.tsx: bang-hang — gốc là <TuVungProvider>, phải là <KhungBangHang> (khuôn của nhóm bang-hang)

## Known limits

## Ngoài hợp đồng

## Analyst

Hai lệnh suite không gắn eval đỏ (cùng một nguyên nhân): `npm test -w @quy-hang/ui-lint` và `npm run lint`. Bước chấm khuôn của lint và ca kiểm rang-giu-khuon đều báo trang `apps/web/src/app/(app)/inventory/page.tsx` có gốc là TuVungProvider, trong khi khuôn nhóm bang-hang đòi gốc là KhungBangHang. Đây là hồi quy do thay đổi bọc từ vựng; cần sửa rồi chạy lại.

Lưu ý: E11 đến E14 chạy bước chấm khuôn với cờ kiểm riêng và xanh, nhưng lint đỏ ở cùng loại kiểm khuôn. Hai lệnh đo khác phạm vi, nên cần người xem lại xem eval khuôn có bỏ sót đúng trang này không.

Eval không phân biệt (xanh trên cả HEAD lẫn baseline, chứng minh harness chứ chưa chứng minh tính năng; cần viết lại để assert hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý):
- npm test -w @quy-hang/core: E1, E3, E8
- npm test -w @quy-hang/web: E1b, E3b, E4, E5, E6, E7b
- db:migrate rồi db:test: E2, E3c, E7
- npm run test:ro-ri: E8b
- npm run typecheck: E10
- design-floor-khuon.mjs --kiem: E11, E12, E13, E14
- design-floor-s4.mjs: E15

Baseline không đo: E9 (ui-check, baseline n-a) và các lệnh suite (n-a).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không eval nào của hợp đồng đỏ; hai lệnh suite (kiểm gói ui-lint và lint) đỏ vì trang Bảng hàng của inventory có gốc TuVungProvider thay vì KhungBangHang. Trả về cho khâu triển khai.

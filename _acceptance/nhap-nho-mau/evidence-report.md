---
schema_version: 2
feature_slug: nhap-nho-mau
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 10a4f702d976a1a4667d6dc6a6cdb8002c0669d7
human_signoff:
---

# Evidence Report: nhap-nho-mau

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | ui-check | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | script | PASS |
| E10b | AC-10 | script | PASS |
| E11 | AC-11 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-nhap-nho-mau-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T12:37:54Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 984.222083

- eval: E2
  run_id: minted-nhap-nho-mau-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T12:37:54Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 984.222083

- eval: E3
  run_id: minted-nhap-nho-mau-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T12:37:54Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 984.222083

- eval: E11
  run_id: minted-nhap-nho-mau-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T12:37:54Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 984.222083

- eval: E4
  run_id: minted-nhap-nho-mau-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T12:37:54Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 63453.856875

- eval: E5
  run_id: minted-nhap-nho-mau-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web_db
  verified_at: 2026-11-04T12:37:54Z
  output: |
    npm run test:db -w @quy-hang/web
    ℹ duration_ms 9335.42725

- eval: E6
  run_id: minted-nhap-nho-mau-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T12:37:54Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2807.947833

- eval: E8
  run_id: minted-nhap-nho-mau-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T12:37:54Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2807.947833

- eval: E9
  run_id: minted-nhap-nho-mau-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T12:37:54Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2807.947833

- eval: E10
  run_id: minted-nhap-nho-mau-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint
  verified_at: 2026-11-04T12:37:54Z
  output: |
    npm run lint
    chuẩn giao diện: đạt

- eval: E10b
  run_id: minted-nhap-nho-mau-E10b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T12:37:54Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    1 tệp giao diện ngoài bản đồ

- eval: E7
  run_id: minted-nhap-nho-mau-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T12:37:54Z
  screenshot: evidence/E7-1-ghi-lan-dau-1440.png
  observed: |
    1440 ghi-lan-dau: bước Ghép cột của mau-b.xlsx (40 dòng), không có dải báo, không có nhãn «theo mẫu», mỗi cột chỉ ghi loại (Danh mục, Chưa rõ...). Đây là khung nền cho lần ghi đầu của sàn mới, đúng kỳ vọng.
    1440 nhap-lai: dải báo «Ghép theo mẫu đã nhớ — 16/16 cột». Mỗi cột hiện nhãn «· theo mẫu» (STT, Trạng thái, Dự án, Toà, Tầng, Mã căn, Diện tích...). Các cột trong ảnh ghép đúng đích. Cột đã đổi đích không thấy trong ảnh (dưới mép cuộn), chỉ có trong JSON.
    1440 mot-phan (ban-gia.xlsx): dải báo «Ghép theo mẫu đã nhớ — 2/5 cột». Chỉ Mã căn và Toà có nhãn «theo mẫu»; Giá (tỷ), Phí CN, TT không có nhãn.
    1440 loi-mau: dải báo «Không đọc được mẫu đã nhớ — Ghép theo từ điển như lần nhập đầu», bảng Ghép cột vẫn hiện, ghép theo từ điển, không có nhãn «theo mẫu».
    375: bốn khung có cùng nội dung ở khổ điện thoại. Dải báo xuống dòng gọn, không tràn ngang; bảng Ghép cột bị cắt ngang ở cột «Mẫu» (cột Trường của căn nằm ngoài khung nhìn, có cuộn ngang trong bảng); nhãn «theo mẫu» hiện ở khổ 375 như ở 1440 (nhap-lai 16/16, mot-phan 2/5 và cột lạ không có nhãn, loi-mau có dải báo lỗi).
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-nhap-nho-mau-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-04T12:37:54Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-nhap-nho-mau-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-04T12:37:54Z

- cmd: npm run test:hooks
  run_id: minted-nhap-nho-mau-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-04T12:37:54Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-nhap-nho-mau-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-04T12:37:54Z

- cmd: npm run typecheck
  run_id: minted-nhap-nho-mau-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-04T12:37:54Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Baseline khong do: moi eval may (E1, E2, E3, E4, E5, E6, E8, E9, E10, E10b, E11) va E7 ghi baseline n-a vi round nay khong do lai (evals.yaml khong doi tu lan baseline cuoi o round 1).

Eval KHONG-PHAN-BIET (pass tren ca HEAD lan baseline, carried tu round 1; nen viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y):
- npm test -w @quy-hang/core: E1, E2, E3, E11
- npm run db:migrate && npm run db:test: E4
- npm run test:db -w @quy-hang/web: E5
- npm test -w @quy-hang/web: E6, E8, E9
- npm run lint: E10
- design-floor-khuon.mjs --kiem --root .: E10b

Judge panels: khong eval nao thuoc loai judgment (moi eval la test, script hoac ui-check) nen khong co panel va khong co muc cho human_override.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lượt chấm 1 trả về cho khâu cài đặt — bảng quy đổi chỉ nhớ ở trường giá trị đóng, cổng thanh bước theo bước đã qua, phép đo E3/E6/E8 đỏ được (commit 10a4f702).
Round 2: toàn bộ eval PASS trên cây 10a4f702, không còn eval hỏng.

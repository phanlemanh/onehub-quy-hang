---
schema_version: 2
feature_slug: hom-nay-dau-chu-dien-thoai
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e98a3f654b2d9f8b8359485943895327d2209fab
human_signoff:
---

# Evidence Report: hom-nay-dau-chu-dien-thoai

Round 3. Mọi eval máy đều chạy xong; verdict REJECT do các phát hiện trong hợp đồng ở `review-findings.md` (mục «Trong hợp đồng», AC-1 và AC-5: bài đo E1 và E5/E6 đo bản sao của luật, không đo đường nối thật của màn).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | ui-check | PASS |
| E9 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-hom-nay-dau-chu-dien-thoai-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T11:12:31Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 2769.849541

- eval: E2
  run_id: minted-hom-nay-dau-chu-dien-thoai-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T11:12:31Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 2769.849541

- eval: E3
  run_id: minted-hom-nay-dau-chu-dien-thoai-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T11:12:31Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 2769.849541

- eval: E4
  run_id: minted-hom-nay-dau-chu-dien-thoai-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T11:12:31Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 2769.849541

- eval: E5
  run_id: minted-hom-nay-dau-chu-dien-thoai-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T11:12:31Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 2769.849541

- eval: E6
  run_id: minted-hom-nay-dau-chu-dien-thoai-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T11:12:31Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 2769.849541

- eval: E7
  run_id: minted-hom-nay-dau-chu-dien-thoai-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T11:12:31Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 2769.849541

- eval: E8
  run_id: minted-hom-nay-dau-chu-dien-thoai-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T11:12:31Z
  screenshot: evidence/E8-the.png
  observed: |
    E8-the.png (375 rong): thanh 'Hom nay', the 'Hom nay 25 viec' chia nhom Lead moi/Nen goi dieu chinh gia; moi the 2 dong (tieu de dam + dong phu) kem nut Goi va '...'; thay khoang 7 the trong khung, khong co bang. E8-goi.png: nen mo, ngan 'Ket qua cuoc goi' (Toa A · chi biet toa) o nua duoi voi 3 lua chon Da goi / Tra lai / Khong nghe may. E8-quay-lai.png: ngan van mo cung lead sau an/hien va tai lai. E8-da-goi.png: ngan dong, nhom Lead moi bien mat, 24 viec. E8-goi-can.png: ngan cho can A-04.01 voi Con · giu gia / Doi gia, trang thai / Khong nghe may. E8-giu-gia.png: A-04.01 roi khoi danh sach, con 23 viec, nhom 8. E8-may-tinh.png (1440): bang co cot Viec/Vi sao hom nay/Gia/Hanh dong voi sidebar, nhom va hang, 23 viec. Khop Expected.
  network_observed: n-a (driver)

- eval: E9
  run_id: minted-hom-nay-dau-chu-dien-thoai-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T11:12:31Z
  output: |
    8 tệp giao diện ngoài bản đồ

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-hom-nay-dau-chu-dien-thoai-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-05T11:12:31Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-hom-nay-dau-chu-dien-thoai-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-05T11:12:31Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-hom-nay-dau-chu-dien-thoai-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-05T11:12:31Z

- cmd: npm run test:hooks
  run_id: minted-hom-nay-dau-chu-dien-thoai-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-05T11:12:31Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-hom-nay-dau-chu-dien-thoai-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-05T11:12:31Z

- cmd: npm run typecheck
  run_id: minted-hom-nay-dau-chu-dien-thoai-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-05T11:12:31Z

- cmd: npm run lint
  run_id: minted-hom-nay-dau-chu-dien-thoai-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-05T11:12:31Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tư round 1 — baseline khong do lai round nay (evals.yaml không đổi từ lần đo baseline cuối).

Eval không-phân-biệt (xanh trên cả code hiện tại lẫn baseline, theo kết quả carried): E1, E2, E3, E4, E5, E6, E7 (lệnh `npm test -w @quy-hang/web`) và E9 (bước chấm khuôn). Cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý. Lưu ý thêm: các phát hiện trong hợp đồng cho thấy E1 và E5/E6 đo bản sao của luật chứ không đo đường nối thật của màn.

Lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lượt chấm đầu, quay lại triển khai — chạm «Gọi» hai lần chỉ được mở số một lần (sửa S4-r1).
Round 2: REJECT — «Trả lại» phải hỏi lại như máy tính, mọi chạm phải đi qua hàm thuần và bài đo gọi thật (sửa S4-r2).
Round 3: REJECT — bài đo E1 (rẽ khổ) đo hàm không nối vào màn, E5/E6 đo hàm giả thay cho cách nối thật; xem review-findings.md.


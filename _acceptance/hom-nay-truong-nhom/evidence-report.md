---
schema_version: 2
feature_slug: hom-nay-truong-nhom
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: af421c478deea0ee2c406d49f33fe98ef4e96c46
human_signoff:
---

# Evidence Report: hom-nay-truong-nhom

Lưu ý: không eval nào đỏ, nhưng hai lệnh suite không gắn eval đỏ nên verdict là REJECT: `npm test -w @quy-hang/ui-lint` (ca ở `packages/ui-lint/tests/rang-giu-khuon.test.mjs:164`) và `npm run lint` (hai lỗi `no-empty` ở `_acceptance/hom-nay-truong-nhom/thu/dung-d.mjs` dòng 32 và 88). Xem mục Lệnh suite bên dưới.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-5 | ui-check | PASS |
| E7 | AC-6 | ui-check | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-8 | ui-check | PASS |
| E11 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-hom-nay-truong-nhom-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T05:10:32Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 51001.948167

- eval: E2
  run_id: minted-hom-nay-truong-nhom-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T05:10:32Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 51001.948167

- eval: E3
  run_id: minted-hom-nay-truong-nhom-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T05:10:32Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 51001.948167

- eval: E4
  run_id: minted-hom-nay-truong-nhom-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-04T05:10:32Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 632.772

- eval: E5
  run_id: minted-hom-nay-truong-nhom-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T05:10:32Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 51001.948167

- eval: E6
  run_id: minted-hom-nay-truong-nhom-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T05:10:32Z
  screenshot: evidence/E6-truoc-1440.png
  observed: |
    E6-truoc-1440.png: man "Truong nhom", o "Lead qua han" = 5, "Ngoai le" = 3, "Hang cu" = 2; danh sach "Lead qua han va ngoai le" ghi "8 lead", co hai dong "Qua han nhan" (Toa A A-20.01), cac dong "Qua han goi", "Chua chia duoc", moi dong co nut "Giao lai". E6-sau-1440.png: o "Lead qua han" = 4, danh sach "7 lead", chi con MOT dong "Qua han nhan" (Toa A A-20.01) — mot dong qua han nhan da bien mat; Ngoai le 3, Hang cu 2 khong doi. Khop Expected: dong bien mat, o giam 1.
  network_observed: n-a (driver)
  output: |
    Step1 dung-d.mjs: OK (may dev 3476, hangDoi 8 muc: 2 accept_overdue, 3 first_call_overdue, 3 unrouted). Step2 chay-ui.mjs --e6 xong. Lead qua han truoc 5, sau 4 (giam 1); so nut Giao lai truoc 9, sau 8. Khung luu: E6-truoc-1440.png, E6-sau-1440.png. Da tat may dev.

- eval: E7
  run_id: minted-hom-nay-truong-nhom-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T05:10:32Z
  screenshot: evidence/E7-bang-dieu-khien-1440.png
  observed: |
    Ảnh 1440x900, bố cục Bảng điều khiển trang Trưởng nhóm: ba ô «Lead quá hạn» 6 (Giao lại), «Ngoại lệ» 4 (Chưa có người), «Hàng cũ» 2 (Toàn sàn). Bảng «Theo đầu chủ» hai dòng: Đầu chủ 1 tỉ lệ tươi 33% (1/3 căn, thanh đỏ ngắn, Cũ), Đầu chủ 2 100% (2/2 căn, thanh xanh đầy, Tươi). Cột bên phải «Lead quá hạn và ngoại lệ» 10 lead có nút «Giao lại», nhãn Quá hạn nhận/Quá hạn gọi. Không có chữ «Đang dựng».
  network_observed: n-a (driver)
  output: |
    Dựng dung-d.mjs: hangDoi = 2 accept_overdue + 4 first_call_overdue + 4 unrouted. Ô Lead quá hạn 6 = 2+4, Ngoại lệ 4 = unrouted 4; không có chữ Đang dựng; ảnh có bảng theo đầu chủ với thanh tỉ lệ. Đã tắt máy dev.

- eval: E8
  run_id: minted-hom-nay-truong-nhom-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T05:10:32Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1907.427584

- eval: E9
  run_id: minted-hom-nay-truong-nhom-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T05:10:32Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1907.427584

- eval: E10
  run_id: minted-hom-nay-truong-nhom-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T05:10:32Z
  screenshot: evidence/E10-dien-thoai-390.png
  observed: |
    Anh E10-dien-thoai-390.png (390x844, giao dien toi): header «Hom nay», the «Bat thong bao lead» voi nut Bat thong bao, mot the co dong chu «Hom nay cua truong nhom mo tren may tinh», thanh tab duoi (Hom nay, Bang hang, Gui, Toi). Khong co bang dieu khien, khong co khoi giao lai/lead qua han/ngoai le/hang cu. Khop Expected.
  network_observed: n-a (driver)
  output: |
    dung-d.mjs OK (3 lead moi, hangDoi 13 muc). chay-ui.mjs --e10 xong, anh E10-dien-thoai-390.png. Mo may tinh = true; khong co khoi giao lai, theo nguoi, toan san, placeholder; ba o vung = null. Da tat may dev. Luu y: lenh chay-ui khong in ma thoat ro, dong ket qua JSON khop expected.

- eval: E11
  run_id: minted-hom-nay-truong-nhom-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T05:10:32Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    11 tệp giao diện ngoài bản đồ

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-hom-nay-truong-nhom-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-04T05:10:32Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-hom-nay-truong-nhom-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-04T05:10:32Z

- cmd: npm run test:hooks
  run_id: minted-hom-nay-truong-nhom-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-04T05:10:32Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-hom-nay-truong-nhom-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 1
  verified_at: 2026-11-04T05:10:32Z
  output: |
    Ca đỏ ở packages/ui-lint/tests/rang-giu-khuon.test.mjs:164 (ERR_ASSERTION, actual false, expected true). Các dòng kiểm khác của bộ ui-lint in ra đạt (catalog 52 thành phần, khuôn 13 nhóm 0 lệch, chuẩn giao diện đạt).

- cmd: npm run typecheck
  run_id: minted-hom-nay-truong-nhom-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-04T05:10:32Z

- cmd: npm run lint
  run_id: minted-hom-nay-truong-nhom-SUITE-lint-r1
  exit_code: 1
  verified_at: 2026-11-04T05:10:32Z
  output: |
    eslint: 2 lỗi no-empty (Empty block statement) tại _acceptance/hom-nay-truong-nhom/thu/dung-d.mjs dòng 32 và 88; 2 cảnh báo (bang-the.tsx:106 incompatible-library, tren-o.tsx:20 LoiTrenMay không dùng).

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (đạt cả trên HEAD lẫn baseline): E1, E2, E3, E5 (npm run db:migrate && npm run db:test); E4 (npm test -w @quy-hang/core); E8, E9 (npm test -w @quy-hang/web); E11 (design-floor-khuon --kiem). Cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý.

Baseline không đo: E6, E7, E10 (ui-check, n-a).

Lệnh fail không gắn eval: `npm test -w @quy-hang/ui-lint` và `npm run lint`. Đây là lý do REJECT; cần sửa hai lỗi `no-empty` ở `_acceptance/hom-nay-truong-nhom/thu/dung-d.mjs` và ca `rang-giu-khuon` ở `packages/ui-lint/tests/rang-giu-khuon.test.mjs:164` rồi chạy lại.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không eval nào đỏ, nhưng hai lệnh suite (ui-lint test, lint) đỏ và không gắn eval. Quay lại triển khai.

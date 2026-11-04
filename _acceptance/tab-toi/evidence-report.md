---
schema_version: 2
feature_slug: tab-toi
verdict: REJECT
failed_evals: [E10]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 588e729b5973ab9f086adc7f31a60d1075a520cf
human_signoff:
---

# Evidence Report: tab-toi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | ui-check | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E7c | AC-7 | ui-check | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-1 | script | FAIL |
| E11 | AC-10 | test | PASS |
| E11b | AC-10 | test | PASS |

Eval hỏng: E10 (bước chấm khuôn giao diện in dòng «lệch:» cho một tệp mà hồ sơ chạm). Ba lệnh hỏng cần ghi rõ: lệnh chấm khuôn (gắn E10), `npm test -w @quy-hang/ui-lint` và `npm run lint` (hai lệnh sau không gắn eval nào, xem mục Lệnh suite).

## Evidence

- eval: E1
  run_id: minted-tab-toi-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T00:04:44Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1742.582875

- eval: E1b
  run_id: minted-tab-toi-E1b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T00:04:44Z
  screenshot: evidence/E1b-mot-may-390.png
  observed: |
    E1b-mot-may-390.png: khổ 390, tiêu đề Tôi, sáu dòng đúng thứ tự Hồ sơ, Sàn, Cài lên màn hình chính, Thông báo lead, Máy đang đăng nhập (iPhone · Safari · Máy này, «Chỉ có máy này», không nút Báo mất máy), Đăng xuất; thanh dưới có Hôm nay, Bảng hàng, Tôi với Tôi đang chọn. E1b-mot-may-1440.png: vỏ máy tính, cùng sáu dòng đúng thứ tự, «Chỉ có máy này», không nút báo mất. E1b-ba-may-1440.png: dòng máy liệt kê Máy tính · Chrome · Máy này, iPhone · Safari, Android · Chrome, có nút đỏ «Báo mất máy». E1b-hop-hoi-1440.png: hộp «Báo mất máy?» với «Đăng xuất mọi máy khác và xoá dữ liệu Quỹ hàng trên các máy ấy?», nút «Ở lại» và nút đỏ «Đăng xuất mọi máy khác». E1b-da-bao-1440.png: dòng «Đã đăng xuất 2 máy khác», danh sách chỉ còn Máy tính · Chrome · Máy này, không còn nút báo mất. E1b-man-bao-390.png: trang đăng nhập hiện «Máy này đã bị báo mất / Dữ liệu Quỹ hàng trên máy đã xoá», ô Email và nút Gửi mã.
  network_observed: n-a (driver)

- eval: E2
  run_id: minted-tab-toi-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T00:04:44Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1742.582875

- eval: E3
  run_id: minted-tab-toi-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T00:04:44Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1742.582875

- eval: E4
  run_id: minted-tab-toi-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T00:04:44Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1742.582875

- eval: E5
  run_id: minted-tab-toi-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T00:04:44Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 51167.547666

- eval: E5b
  run_id: minted-tab-toi-E5b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T00:04:44Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1742.582875

- eval: E6
  run_id: minted-tab-toi-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T00:04:44Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 51167.547666

- eval: E7
  run_id: minted-tab-toi-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T00:04:44Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 51167.547666

- eval: E7b
  run_id: minted-tab-toi-E7b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T00:04:44Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1742.582875

- eval: E7c
  run_id: minted-tab-toi-E7c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T00:04:44Z
  screenshot: evidence/E7c-b-truoc-390.png
  observed: |
    E7c-b-truoc-390.png: man Bang hang tren dien thoai 390 (nen toi), "Chua co can nao tren bang hang chung", co thanh tab Hom nay/Bang hang/Gui/Toi; chi la khung truoc khi bao mat, so lieu kho/hang doi nam o dong JSON (soCho=1, 2 kho X va Z). E7c-a-da-bao-1440.png: man Toi tren may tinh, muc "May dang dang nhap" ghi "Da dang xuat 1 may khac" va dong "May tinh - Chrome - May nay", co nut Dang xuat — khop expected. E7c-b-sau-390.png: man Dang nhap Quy hang co the "May nay da bi bao mat — Du lieu Quy hang tren may da xoa", o Email, nut Gui ma — khop /login?bi-bao-mat=1 voi loi da khai. E7c-c-sau-390.png: man Dang nhap Quy hang tron (chi Email + Gui ma), khong the bao mat — khop /login khong tham so cho doi chung; kho X van con theo JSON.
  network_observed: n-a (driver)

- eval: E8
  run_id: minted-tab-toi-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T00:04:44Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1742.582875

- eval: E9
  run_id: minted-tab-toi-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T00:04:44Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 51167.547666

- eval: E10
  run_id: minted-tab-toi-E10-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T00:04:44Z
  output: |
    bản đồ nhóm trang-tam đổi sau khi ghim — chấm theo bản ghim
    lệch: apps/web/src/app/(app)/proto/tab-toi/page.tsx · thuộc hai nhóm màn: toi, trang-tam
    nợ cũ: apps/web/src/app/(app)/me/page.tsx · thuộc hai nhóm màn: toi, trang-tam
    không đo được: apps/web/src/app/(auth)/login/may-bi-bao.tsx — thẻ mang spread
    14 tệp giao diện ngoài bản đồ

- eval: E11
  run_id: minted-tab-toi-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T00:04:44Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1742.582875

- eval: E11b
  run_id: minted-tab-toi-E11b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T00:04:44Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 51167.547666

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-tab-toi-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-04T00:04:44Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-tab-toi-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-04T00:04:44Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-tab-toi-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-04T00:04:44Z

- cmd: npm run test:hooks
  run_id: minted-tab-toi-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-04T00:04:44Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-tab-toi-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 1
  verified_at: 2026-11-04T00:04:44Z
  output: |
    khuôn: apps/web/src/app/(auth)/login/may-bi-bao.tsx: trang-thai — dòng 26: <TrangThai> thiếu khe «title»
    ca hỏng: «cây lành in dòng tóm tắt, Người dùng trả <main> thì đỏ» (tests/rang-giu-khuon.test.mjs)

- cmd: npm run typecheck
  run_id: minted-tab-toi-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-04T00:04:44Z

- cmd: npm run lint
  run_id: minted-tab-toi-SUITE-lint-r1
  exit_code: 1
  verified_at: 2026-11-04T00:04:44Z
  output: |
    eslint: 0 lỗi, 2 cảnh báo (bang-the.tsx, tren-o.tsx)
    mức nợ giao diện: 0/0 · ngoại lệ có lý do: 0
    khuôn: apps/web/src/app/(auth)/login/may-bi-bao.tsx: trang-thai — dòng 26: <TrangThai> thiếu khe «title»

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả code mới lẫn code cũ ở diffBase, chứng minh khung chạy chứ chưa chứng minh tính năng; cần viết lại để assert hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý):
- `npm test -w @quy-hang/web`: E1, E2, E3, E4, E7b, E8, E5b, E11
- `npm run db:migrate && npm run db:test`: E5, E6, E7, E9, E11b

Baseline không đo: E1b và E7c (eval ui-check, chạy trên máy chủ dev dựng riêng; chạy lại trên code cũ không có ý nghĩa vì màn Tôi chưa tồn tại).

Lệnh hỏng không gắn eval: `npm test -w @quy-hang/ui-lint` và `npm run lint`. Cả hai cùng chỉ ra một nguyên nhân với E10: tệp `apps/web/src/app/(auth)/login/may-bi-bao.tsx` dòng 26 dùng `<TrangThai>` thiếu khe «title» theo khuôn trang-thai.

## Variance

none — mọi eval đều chạy một lần, xác định, kết quả đồng nhất.

## Iterations

Round 1: E10 hỏng — bước chấm khuôn báo tệp màn Tôi bản thử (proto/tab-toi) và trang /me thuộc hai nhóm màn (toi, trang-tam), và `may-bi-bao.tsx` thiếu khe «title» của `<TrangThai>`; hai lệnh suite ui-lint và lint hỏng cùng nguyên nhân. Trả về bước cài đặt.

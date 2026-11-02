---
schema_version: 2
feature_slug: thong-bao-lead
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bd9f8213d92b9b0a02a11be65d80c8f1ea62ae50
human_signoff: Manh Phan 2026-11-02
---

# Evidence Report: thong-bao-lead

Round 2. Cả mười eval của hợp đồng và sáu lệnh suite đều chạy xanh trên cây bd9f821; lỗi lệnh suite lint ở round 1 đã hết.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | ui-check | PASS |
| E10 | AC-6 | ui-check | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-thong-bao-lead-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T05:27:06Z
  output: |
    Lệnh: npm run db:migrate && npm run db:test (gộp chung E1, E2, E3, E5, E8, E9; một lần chạy, một lần đạt)
    ℹ duration_ms 26706.067083

- eval: E2
  run_id: minted-thong-bao-lead-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T05:27:06Z
  output: |
    Lệnh: npm run db:migrate && npm run db:test (cùng lần chạy với E1)
    ℹ duration_ms 26706.067083

- eval: E3
  run_id: minted-thong-bao-lead-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T05:27:06Z
  output: |
    Lệnh: npm run db:migrate && npm run db:test (cùng lần chạy với E1)
    ℹ duration_ms 26706.067083

- eval: E4
  run_id: minted-thong-bao-lead-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-02T05:27:06Z
  output: |
    Lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 203.581583

- eval: E5
  run_id: minted-thong-bao-lead-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T05:27:06Z
  output: |
    Lệnh: npm run db:migrate && npm run db:test (cùng lần chạy với E1)
    ℹ duration_ms 26706.067083

- eval: E6
  run_id: minted-thong-bao-lead-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T05:27:06Z
  output: |
    Lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 403.761958

- eval: E7
  run_id: minted-thong-bao-lead-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T05:27:06Z
  screenshot: evidence/E7-dau-chu-chua-bat.png
  observed: |
    dau-chu-chua-bat.png (2880x1800, DPR2 do resize_page): header «[Mau] San thu», dai khung dau trang «Bat thong bao lead» / «Nhan thong bao khi lead ve ban, ke ca khi khong mo Quy hang.» + nut sang «Bat thong bao» co icon chuong; duoi la vung «Hom nay · 3 viec» (Lead moi 2, Thieu thong tin 1). Khop Expected. dau-chu-da-bat.png: khong dai; «Hom nay · 3 viec» dung ngay duoi thanh tren; khop. dau-chu-chua-cau-hinh.png: dai chu «Thong bao chua duoc cau hinh» / «May chu chua san sang gui thong bao lead.», khong nut; khop. dau-chu-tu-choi.png: mot dong chu xam nhat «Thong bao dang tat trong trinh duyet» nam tren vung Hom nay, khong khung, khong nut; khop. dau-chu-iphone.png (1125x2436, khung 375): tieu de «Hom nay», dai «Cai Quy hang len man hinh chinh de nhan thong...» voi danh sach 3 buoc dung loi Expected, khong nut trong dai; duoi la danh sach lead; thanh tab Hom nay/Bang hang/Toi. Khop. truong-nhom-chua-bat.png: dai «Bat thong bao lead» + nut «Bat thong bao» dung tren khung «Hom nay / Gio lam gi? / Man nay dang dung»; khop. truong-nhom-da-bat.png: chi con khung giu cho «Hom nay / Man nay dang dung», khong dai; khop. truong-nhom-chua-cau-hinh.png: dai «Thong bao chua duoc cau hinh» / «May chu chua san sang gui thong bao lead.», khong nut; khop. truong-nhom-tu-choi.png: dong «Thong bao dang tat trong trinh duyet» khong khung/nut; khop. truong-nhom-iphone.png: dai ba buoc cai (Chia se -> «Them vao MH chinh» -> mo tu man hinh chinh), khong nut, duoi la khung giu cho + tab Hom nay/Bang hang/Gui/Toi; khop. Khong frame nao mau thuan Expected.
  network_observed: clean
  output: |
    Mười frame đã lưu trong _acceptance/thong-bao-lead/evidence/: E7-{dau-chu,truong-nhom}-{chua-bat,da-bat,chua-cau-hinh,tu-choi,iphone}.png, kèm E7-network.txt (số liệu thô nằm ở tệp này).
    Request tới app origin đều thành công, console chỉ có info React DevTools và HMR, không lỗi.

- eval: E10
  run_id: minted-thong-bao-lead-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T05:27:06Z
  screenshot: evidence/E10-mo-lead.png
  observed: |
    E10-mo-lead.png: nhóm «Lead mới» (số 2) mở và «Thiếu thông tin» (1) cũng mở. Trang đã cuộn nhẹ (băng thông báo bị cắt ở trên). Dòng «Toà A · A-09.05 · Bán» (Đã nhận, 3,2 tỷ, Quá hạn gọi 9 phút) nằm trọn trong khung, nền sáng hơn dòng bên dưới, khớp data-state=selected. Khớp Expected.
    E10-mo-lead-trang-moi.png: trang mở mới từ URL có ?lead. Bố cục giống frame trước (chỉ khác đếm phút: quá hạn 10 phút). Nhóm «Lead mới» mở, dòng «Toà A · A-09.05» nằm trong khung và được tô nền như frame trước (DOM xác nhận selected, top 255.5). Khớp Expected.
    E10-khong-con.png: dòng thông báo «Lead này không còn ở Hôm nay của bạn» hiện ngay dưới tiêu đề «Hôm nay» (3 việc), trên nhóm «Lead mới». Không dòng nào được tô chọn (DOM xác nhận selected=0). Khớp Expected.
  network_observed: clean
  output: |
    Ba lần điều hướng giữ lại 150 request; ba document, các fetch /api/v1 và asset tĩnh đều thành công; console chỉ có 6 dòng info/log (gợi ý React DevTools, HMR), không error hay warn. Số liệu thô: evidence/E10-network.txt.

- eval: E8
  run_id: minted-thong-bao-lead-E8-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T05:27:06Z
  output: |
    Lệnh: npm run db:migrate && npm run db:test (cùng lần chạy với E1)
    ℹ duration_ms 26706.067083

- eval: E9
  run_id: minted-thong-bao-lead-E9-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T05:27:06Z
  output: |
    Lệnh: npm run db:migrate && npm run db:test (cùng lần chạy với E1)
    ℹ duration_ms 26706.067083

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-thong-bao-lead-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-02T05:27:06Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-thong-bao-lead-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-02T05:27:06Z

- cmd: npm run test:hooks
  run_id: minted-thong-bao-lead-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-02T05:27:06Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-thong-bao-lead-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-02T05:27:06Z

- cmd: npm run typecheck
  run_id: minted-thong-bao-lead-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-02T05:27:06Z

- cmd: npm run lint
  run_id: minted-thong-bao-lead-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-02T05:27:06Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả cây hiện tại lẫn cây baseline; chứng minh bộ chạy chứ chưa chứng minh tính năng, cần viết lại để khẳng định hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý):
- npm run db:migrate && npm run db:test: E1, E2, E3, E5, E8, E9
- npm test -w @quy-hang/core: E4
- npm test -w @quy-hang/web: E6

## Variance

none — mọi eval chạy một lần, xác định, kết quả đồng nhất.

## Iterations

Round 1: không eval nào của hợp đồng thất bại; lệnh suite `npm run lint` thất bại ở tệp công cụ chấm `.acceptance-runs/thong-bao-lead/acceptance-verify.js` (lỗi cú pháp, dòng 210), không gắn eval nào. Trả về triển khai.
Round 2: cả mười eval và sáu lệnh suite đều xanh trên bd9f821; verdict PASS.


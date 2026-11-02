---
schema_version: 2
feature_slug: he-bo-cuc
verdict: REJECT
failed_evals: ["E6"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bf10b05baad2f9d43f41e05792ca6e905a912793
human_signoff:
---

# Evidence Report: he-bo-cuc

Round 2. Mười sáu trên mười bảy eval đạt. Eval E6 (ui-check, AC-6) không đạt: ở khổ 375, bố cục «Luồng nhiều bước» hiện thẳng trong trang chứ không phải «ngăn toàn màn» như Expected. Mọi lệnh suite xanh. Lệnh ui-check:E6 là lệnh duy nhất kết thúc khác 0, và nó gắn eval E6; không có lệnh fail nào không gắn eval.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4c | AC-4 | test | PASS |
| E4u | AC-4 | ui-check | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | ui-check | FAIL |
| E7 | AC-7 | test | PASS |
| E7u | AC-7 | ui-check | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | script | PASS |
| E10 | AC-10 | test | PASS |
| E10u | AC-10 | ui-check | PASS |
| E11 | AC-2 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-he-bo-cuc-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-02T06:03:05Z
  output: |
    lệnh: npm test -w @quy-hang/ui-lint
    ℹ duration_ms 17121.056625

- eval: E1b
  run_id: minted-he-bo-cuc-E1b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.giao_dien
  verified_at: 2026-11-02T06:03:05Z
  output: |
    lệnh: node packages/ui-lint/kiem-chuan.mjs
    chuẩn giao diện: đạt

- eval: E2
  run_id: minted-he-bo-cuc-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T06:03:05Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 2088.010958

- eval: E3
  run_id: minted-he-bo-cuc-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T06:03:05Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 2088.010958

- eval: E4
  run_id: minted-he-bo-cuc-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T06:03:05Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 2088.010958

- eval: E4c
  run_id: minted-he-bo-cuc-E4c-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-02T06:03:05Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 202.851834

- eval: E4u
  run_id: minted-he-bo-cuc-E4u-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T06:03:05Z
  screenshot: evidence/E4u-truong-nhom.png
  observed: |
    Trưởng nhóm, /inventory, 1440x900: thanh trên bên phải có nút đen «+ Lead» liền kề nút mũi tên xuống (tách đôi kiểu ReUI), không có nút «Tạo ▾» riêng; bảng hàng có cột thứ hai mở sẵn. Bấm mũi tên mở popover đúng hai mục «Nhập Excel» và «Phát hàng» (E4u-step3-menu-open.png); bấm «Nhập Excel» đến /imports/new, thanh trên vẫn «+ Lead» và mũi tên (E4u-step3-after-nhap-excel.png).
    Đầu chủ, /today (E4u-dau-chu.png): thanh trên giống hệt, «+ Lead» và mũi tên. Khớp Expected lối ReUI; không mâu thuẫn.
  network_observed: clean

- eval: E5
  run_id: minted-he-bo-cuc-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T06:03:05Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 2088.010958

- eval: E6
  run_id: minted-he-bo-cuc-E6-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T06:03:05Z
  screenshot: evidence/E6-tran-375.png
  observed: |
    Đạt: Tràn 375 thành thẻ (E6-tran-375.png); Danh sách – chi tiết 375 mở tờ «Hồ sơ căn» từ đáy cao 716px và mở lại khi bấm thẻ khác (E6-danh-sach-chi-tiet-375.png, E6-ngan-375-mo-lai.png); 1440 ngăn nổi inset bên phải cách mép 16px, đè bảng, bấm dòng khác thì đổi hồ sơ không đóng (E6-ngan-1440.png, E6-ngan-1440-doi-dong.png); Hồ sơ một cột, Đọc và Dòng tin giữ hình, Bảng điều khiển báo «không có trên điện thoại»; 1024 cùng bố cục 1440 theo Hỏi-5; không bố cục nào cuộn ngang ở 375.
    Không đạt: E6-luong-nhieu-buoc-375.png chụp màn «Nhập Excel · Bước 2 / 4 · Ghép cột» hiện thẳng trong trang giữa thanh trên và thanh tab dưới, khung Ghép cột và Xem trước xếp dọc; không có ngăn hay tờ toàn màn, không phần tử role=dialog. Mâu thuẫn Expected «Luồng nhiều bước ngăn toàn màn».
  network_observed: clean
  output: |
    PASS  Không cuộn ngang ở 375, cả 7 bố cục (scrollWidth bằng innerWidth).
    PASS  Danh sách – chi tiết ở 375: ngăn từ đáy; ở 1440: ngăn nổi inset bên phải, đổi dòng không đóng.
    FAIL  Luồng nhiều bước ở 375 phải là «ngăn toàn màn»: thực tế hiện thẳng trong trang, không có ngăn. Số 0 phần tử role=dialog. Tệp ma-tran.ts ghi dien_thoai «ngăn toàn màn» nhưng bo-cuc.tsx nhánh luong-nhieu-buoc chỉ xếp lưới, không dùng NganNoi hay Drawer.
    PASS  1024 cùng bố cục với 1440 theo dòng sổ Hỏi-5.

- eval: E7
  run_id: minted-he-bo-cuc-E7-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T06:03:05Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 2088.010958

- eval: E7u
  run_id: minted-he-bo-cuc-E7u-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T06:03:05Z
  screenshot: evidence/E7u-trang.png
  observed: |
    E7u-trang.png: /mau/he-bo-cuc ở 1440, không bị đưa về /login; thanh chọn có 7 bố cục, 5 trạng thái, các nút khổ 1440, 1024, 375 và Mở riêng. Chờ tải là lưới khung chờ 5 cột x 9 hàng (45 phần tử), rỗng có biểu tượng kính lúp và nút «Bỏ lọc», lỗi có dải đỏ nhạt và nút «Thử lại», ngoại tuyến có dải đầu màn «Đang xem bản đã tải — mất mạng» với bảng 6 căn giữ nguyên. Hồ sơ ở 1024 một cột, không có cột thứ hai. Ghi chú nhỏ: ở khổ 1440 nội dung trong khung bị cắt mép phải (nút avatar chỉ thấy chữ «T»); không ảnh hưởng điều kiện đã nêu.
  network_observed: clean

- eval: E8
  run_id: minted-he-bo-cuc-E8-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-02T06:03:05Z
  output: |
    lệnh: npm test -w @quy-hang/ui-lint
    ℹ duration_ms 17121.056625

- eval: E9
  run_id: minted-he-bo-cuc-E9-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-02T06:03:05Z
  output: |
    lệnh: npm test -w @quy-hang/ui-lint
    ℹ duration_ms 17121.056625

- eval: E9b
  run_id: minted-he-bo-cuc-E9b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-02T06:03:05Z
  output: |
    lệnh: npm run lint
    chuẩn giao diện: đạt

- eval: E10
  run_id: minted-he-bo-cuc-E10-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-02T06:03:05Z
  output: |
    lệnh: npm test -w @quy-hang/ui-lint
    ℹ duration_ms 17121.056625

- eval: E10u
  run_id: minted-he-bo-cuc-E10u-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T06:03:05Z
  screenshot: evidence/E10u-nguoi-dung.png
  observed: |
    E10u-nguoi-dung.png (1440x900): vỏ Cài đặt sàn, đường dẫn «Cài đặt sàn > Người dùng», tiêu đề «Người dùng», nút «Mời người», hai tab «Thành viên 7» và «Vùng 2», ô «Tìm theo email», danh sách 7 người dạng hàng (avatar, email, huy hiệu vai, vùng, «Sửa», xoá); nội dung rộng 1135px trong cột 1167px, không max-width. Hộp «Mời người» và «Sửa» đều có ô chọn vai (Telesales, Đầu chủ, Đầu khách, Trưởng nhóm, Quản trị sàn) kèm vùng phụ trách.
    E10u-trang-tam.png: trang tạm «Cách gọi» cùng bố cục Đọc, nói «Dựng ở mục 45 của lộ trình». E10u-nguoi-dung-375.png: thẻ thành viên một cột, không cuộn ngang (scrollWidth bằng clientWidth, 375). Khớp Expected.
  network_observed: clean

- eval: E11
  run_id: minted-he-bo-cuc-E11-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-02T06:03:05Z
  output: |
    lệnh: node "$R/scripts/design-floor-s4.mjs" --root .
    (không có dòng lỗi; không mã màu thô trên tệp giao diện vòng chạm)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-he-bo-cuc-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-02T06:03:05Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-he-bo-cuc-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-02T06:03:05Z

- cmd: npm run test:hooks
  run_id: minted-he-bo-cuc-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-02T06:03:05Z

- cmd: npm run typecheck
  run_id: minted-he-bo-cuc-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-02T06:03:05Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (xanh trên cả mã hiện tại lẫn mã nền, nên chứng minh harness chứ chưa chứng minh tính năng; cần viết lại để assert hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý):

- npm test -w @quy-hang/ui-lint: E1, E8, E9, E10
- node packages/ui-lint/kiem-chuan.mjs: E1b
- npm test -w @quy-hang/web: E2, E3, E4, E5, E7
- npm test -w @quy-hang/core: E4c
- npm run lint: E9b
- design-floor-s4.mjs --root .: E11

Baseline không đo: E4u, E6, E7u, E10u (eval ui-check, baseline n-a).

## Variance

none — mọi eval đa lần chạy đều đồng nhất (mọi eval chạy một lần, tất định).

## Iterations

Round 1: E11 bị chặn (CLAUDE_PLUGIN_ROOT không đặt, lệnh không chạy tới bước kiểm); E4u thất bại — vỏ dựng nút chia «+ Lead ▾» chứ không phải lối «+ Tạo ▾» ở dòng sổ Hỏi-2 mới nhất, trưởng nhóm thiếu mục «Nhập Excel» so với Tham chiếu §9; E10u thất bại — màn Người dùng không có lời mời đang chờ và bố cục Đọc không giới hạn bề rộng đọc. Cần hợp đồng làm rõ hoặc sửa code, rồi chạy lại E11 với biến CLAUDE_PLUGIN_ROOT.
Round 2: E6 thất bại — ở khổ 375 bố cục «Luồng nhiều bước» hiện thẳng trong trang, không có ngăn toàn màn (bo-cuc.tsx nhánh luong-nhieu-buoc chỉ xếp lưới, trong khi ma-tran.ts khai «ngăn toàn màn»). E4u, E10u, E11 nay đạt. Trả lại cho bước làm.

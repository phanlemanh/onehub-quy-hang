---
schema_version: 2
feature_slug: phat-hang
verdict: BLOCKED
failed_evals: []
reason: "ui-check:E1b — Bước 2 (chay-ui.mjs --e1b) chết ở moBang: sau 240 giây không có nút «Xuất bảng hàng» trên /inventory, lặp lại hai lần. Trang kẹt ở khung xương kèm nhãn «Đang tải lần đầu». Không có ảnh E1b-* nào do kịch bản sinh ra, nên không đối chiếu được các mục của bước 3. Chưa tách được nguyên nhân: lỗi của app hay do nhiều trình khách cùng dùng máy dev 3494."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 629f34aa6b7d0ce237bec7e9b8aebca4fd1d3c46
human_signoff:
---

# Evidence Report: phat-hang

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | ui-check | BLOCKED |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | ui-check | PASS |
| E7 | AC-7 | script | PASS |
| E7b | AC-7 | ui-check | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | test | PASS |
| E8c | AC-8 | ui-check | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-phat-hang-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T05:41:10Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 2536.05775

- eval: E1b
  cannot_run: true
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T05:41:10Z
  screenshot: evidence/E1b-step1.png
  observed: |
    E1b-step1.png: nền tối, khung bàn làm việc «[Mẫu] Sàn thử». Tiêu đề «Bảng hàng — Có hàng gì, ở đâu?». Vùng bảng chỉ có các thanh xám xương, chip «Đang tải lần đầu» ở góc phải. Không có hàng, bộ lọc hay nút «Xuất bảng hàng». Ảnh này là ảnh gỡ lỗi, mâu thuẫn với Expected (bảng phải có hàng và nút xuất để tích hai căn).
  network_observed: n-a (driver)
  output: |
    Bước 1: máy dev 3494 chạy được; hàng mẫu đã có sẵn (API listings trả danh sách thật, /inventory trả trang khi có cookie).
    Bước 2, lần 1 và lần 2: chay-ui.mjs --e1b báo hết giờ chờ (240 giây) ở moBang khi chờ nút «Xuất bảng hàng». Chưa chụp được ảnh E1b-* nào của kịch bản.
    Gỡ lỗi riêng: sau 15 giây trình duyệt 1440x900 đã đăng nhập đầu chủ vẫn chỉ có khung xương và chip «Đang tải lần đầu».
    Log máy dev có hơn 71.000 dòng, các lời gọi manifest, inventory, catalog, listings, photos lặp liên tục; còn các Chrome khác dùng hồ sơ qh-e6-* và qh-b-chrome-* cùng máy. Hồ sơ qh-b-chrome-* do script gỡ lỗi để lại, tắt bị bộ phân quyền từ chối.
    Mã nguồn bang-hang.tsx có nút «Xuất bảng hàng» (hiện khi navigationFor(vai).actions gồm "export", ẩn dưới md). Do trang không tải xong nên chưa kiểm được nút có hiện hay không.
    Các assertion của bước 3 (hai căn đã tích, dòng «Cột không ra ngoài», Quay lại + Khách riêng, bỏ tích 33 căn, ba thẻ khoá, menu Tạo, khổ điện thoại) chưa kiểm được vì chưa có khung nào.
    Dọn dẹp: đã tắt máy chủ dev bằng dung-h.mjs --tat, không dùng pkill.

- eval: E2
  run_id: minted-phat-hang-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-04T05:41:10Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 882.217541

- eval: E3
  run_id: minted-phat-hang-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-04T05:41:10Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 882.217541

- eval: E4
  run_id: minted-phat-hang-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-04T05:41:10Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 882.217541

- eval: E5
  run_id: minted-phat-hang-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-04T05:41:10Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 882.217541

- eval: E6
  run_id: minted-phat-hang-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-04T05:41:10Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 882.217541

- eval: E6b
  run_id: minted-phat-hang-E6b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T05:41:10Z
  screenshot: evidence/E6b-12-can.png
  observed: |
    E6b-12-can.png (2572x780): ảnh bảng 12 dòng, cột Toà/Mã căn/Loại căn/Diện tích/Tầng/Hướng/Trạng thái/Giá/Phí/Nội thất/Pháp lý/Tài chính/Tình trạng sử dụng/Xác nhận; chữ tiếng Việt có dấu đọc đúng (Toà A, Tây Bắc, Đang giao dịch, Không còn bán, Bao phí / Không bao phí, 3,08 tỷ, [Mẫu] Sổ hồng). E6b-30-can.png (2572x1860): cùng khuôn, 30 dòng đủ, có dấu đúng. E6b-12-can.pdf: 1 trang, bảng 12 dòng cùng nội dung (xem qua Quick Look), mở được. E6b-tren-30-can.pdf: 2 trang, trang 1 là 25 dòng đầu của bảng cùng khuôn. E6b-0-pdf-buoc-1.png: hộp «Xuất bảng hàng», 33 căn; thẻ Ảnh (và Bài Zalo, Bài Facebook) ghi «Quá 30 căn — dùng Excel hay PDF»; PDF ghi «25 căn một trang». Khớp Expected.
  network_observed: n-a (driver)
  output: |
    Assertions: e6b-12-Ảnh-buoc-1 khoaAnh=false (daTich 12) PASS; e6b-12-PDF-buoc-1 khoaAnh=false PASS; e6b-30-Ảnh-buoc-1 daTich=30 khoaAnh=false PASS; e6b-0-PDF-buoc-1 soCan=33 khoaAnh=true PASS (thẻ Ảnh hiện lời «Quá 30 căn — dùng Excel hay PDF»; thẻ Bài Zalo/Facebook cũng khoá).
    Tải về: bang-hang-2026-11-04.png (12 căn, 30 căn), bang-hang-2026-11-04.pdf (12 căn, 33 căn) PASS. PDF 12 căn = 1 trang, PDF 33 căn = 2 trang.
    Lưu ý: ca trên ngưỡng chạy bằng 33 căn thay vì 31 căn (theo steps); PDF xem qua Quick Look trang 1 vì không có pdftoppm.
    Server đã tắt bằng --tat.

- eval: E7
  run_id: minted-phat-hang-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-04T05:41:10Z
  output: |
    lệnh: npm run test:ro-ri
    ℹ duration_ms 296.875792

- eval: E7b
  run_id: minted-phat-hang-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T05:41:10Z
  screenshot: evidence/E7b-bai-zalo-nhom-moi-gioi.txt
  observed: |
    Da mo (doc) 4 tep E7b-*.txt. Bai Zalo Nhom moi gioi: 18 dong, moi dong co ma can, toa, loai can, dien tich, tang, huong, trang thai, gia; khong ten chu nha, khong so 0900. Bai Zalo Khach rieng: 18 dong, khong co ma can. xlsx Nhom moi gioi: sheet "Bang hang" co cot "Ma can" va "Tang". xlsx Khach rieng: khong cot "Ma can", cot Tang la "—". Cac cot chi co nhan mau "[Mau] So hong", "[Mau] Chu dang o". Khop Expected. Luu y: gia day khong xuat hien o ban nao.
  network_observed: n-a (driver)
  output: |
    Assertion: e7b-Excel-Nhom moi gioi ro=[] soMaCan=18; e7b-Bai Zalo-Nhom moi gioi ro=[] soMaCan=18; e7b-Excel-Khach rieng ro=[] soMaCan=0; e7b-Bai Zalo-Khach rieng ro=[] soMaCan=0; e7b-chuoi-do soChuoiMoi=92.
    grep trên E7b-*.txt: không có "0900" và "Chu nha". Cột "Ma can" có ở xlsx/bài Nhóm môi giới, vắng ở bản Khách riêng.
    Evidence là bản lưu văn bản (không có ảnh, không có E7b-network.txt vì driver là script).
    Đã tắt server bằng dung-h.mjs --tat.

- eval: E8
  run_id: minted-phat-hang-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T05:41:10Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 100610.394416

- eval: E8b
  run_id: minted-phat-hang-E8b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T05:41:10Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 2536.05775

- eval: E8c
  run_id: minted-phat-hang-E8c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T05:41:10Z
  screenshot: evidence/E8c-sau-1440.png
  observed: |
    Đã mở E8c-sau-1440.png (frame duy nhất lưu): bàn làm việc «[Mẫu] Sàn thử», bảng hàng nhóm Toà → Loại căn, thanh công cụ hiện «33 / 33 căn», «3 căn đã chọn» (ba hàng đầu A-11.01, A-13.01, A-01.03 được tick), nút «Xuất bảng hàng». Hộp thoại đã đóng sau hai lần xuất; khớp bối cảnh 3 căn được chọn. Frame không tự chứng minh số dòng exports; số đó lấy từ dòng e8c-bang-exports của lệnh thử và đối chiếu lại bằng dung-h.mjs --lan-xuat.
  network_observed: n-a (driver)
  output: |
    Frame đã lưu: E8c-sau-1440.png (chỉ một frame, chụp bằng chay-ui.mjs; thư mục tai-ve-e8c chứa file Excel tải về). Không có frame theo từng bước.
    Driver là script node, không có công cụ đọc network nên không có E8c-network.txt.
    Dọn: dung-h.mjs --tat đã tắt máy dev.

- eval: E9
  run_id: minted-phat-hang-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-04T05:41:10Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 882.217541

- eval: E10
  run_id: minted-phat-hang-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T05:41:10Z
  output: |
    lệnh: node "$R/scripts/design-floor-khuon.mjs" --kiem --root .
    20 tệp giao diện ngoài bản đồ

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-phat-hang-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-04T05:41:10Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-phat-hang-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-04T05:41:10Z

- cmd: npm run test:hooks
  run_id: minted-phat-hang-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-04T05:41:10Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-phat-hang-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-04T05:41:10Z

- cmd: npm run typecheck
  run_id: minted-phat-hang-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-04T05:41:10Z

- cmd: npm run lint
  run_id: minted-phat-hang-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-04T05:41:10Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả code mới lẫn baseline; chứng minh harness, cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/web: E1, E8b
- npm test -w @quy-hang/core: E2, E3, E4, E5, E6, E9
- npm run db:migrate && npm run db:test: E8
- design-floor-khuon --kiem: E10

Baseline không đo: E1b, E6b, E7b, E8c (eval ui-check, tệp/ca mới trên diffBase, chạy trên code cũ không chứng minh gì).

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (mọi eval chạy một lần, tất định).

## Iterations

Round 1: E1b không chạy được (BLOCKED) — trang /inventory kẹt ở khung xương «Đang tải lần đầu» nên không có nút «Xuất bảng hàng»; chưa rõ lỗi của app hay do nhiều trình khách cùng dùng máy dev. Cần chạy lại E1b trên máy dev sạch (không còn Chrome khác dùng chung).

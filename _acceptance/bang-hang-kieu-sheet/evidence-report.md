---
schema_version: 2
feature_slug: bang-hang-kieu-sheet
verdict: BLOCKED
failed_evals: ["E3","E5","E9"]
reason: "Eval E11 (cmd: node _acceptance/bang-hang-kieu-sheet/thu/do-cuon.mjs) không khởi động được: trong lệnh, cả chuỗi nằm trong dấu nháy kép nên zsh coi là MỘT tên lệnh, báo không tìm thấy tệp và trả mã 127 trước khi node chạy. Script có thật (_acceptance/bang-hang-kieu-sheet/thu/do-cuon.mjs, 7555 byte, sửa 22:59 ngày 31/10). Không sửa lệnh (chỉ dẫn ghim nguyên văn), không chạy biến thể khác, nên không có kết quả của bộ đo cuộn. Cần người điều phối sửa dấu nháy trong lệnh (ví dụ node \"_acceptance/.../do-cuon.mjs\" hoặc bỏ nháy quanh toàn lệnh) rồi chạy lại. Không có run_id từ stdout; dùng mã đã ghi trong run-log."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 5ad92c1750bd643a3f0f17205ffb39c60f4ece84
human_signoff:
---

# Evidence Report: bang-hang-kieu-sheet

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | ui-check | FAIL |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-4 | ui-check | FAIL |
| E6 | AC-5 | ui-check | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-6 | ui-check | PASS |
| E9 | AC-7 | ui-check | FAIL |
| E10 | AC-8 | ui-check | PASS |
| E11 | AC-9 | script | BLOCKED |
| E12 | AC-10 | script | PASS |
| E13 | AC-10 | script | PASS |
| E14 | AC-10 | script | PASS |
| E15 | AC-10 | judgment | UNCERTAIN |

Ghi chú: mọi lệnh thất bại đều đã gán vào eval (ui-check:E3, ui-check:E5, ui-check:E9); không có lệnh thất bại nào không gắn eval. E11 không chạy được (xem reason), không phải kết quả đạt hay trượt của bộ đo cuộn.

## Evidence

- eval: E1
  run_id: minted-bang-hang-kieu-sheet-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-10-31T16:03:44Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 60636.384458

- eval: E2
  run_id: minted-bang-hang-kieu-sheet-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-10-31T16:03:44Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 119.166667

- eval: E3
  run_id: minted-bang-hang-kieu-sheet-E3-r1
  exit_code: 1
  baseline: n-a
  verifier: executors.ui-check (Playwright MCP, 1440x900)
  verified_at: 2026-10-31T16:03:44Z
  screenshot: evidence/E3-bang.png
  observed: |
    Đã mở từng ảnh. Lưới có đúng 16 tiêu đề đúng thứ tự (Toà … Ai thấy); chân bảng «33 / 33 căn» khớp số API và số dung-b.mjs in; Toà A 18 + Toà B 15 = 33; giá dạng «3,09 tỷ», trạng thái là Badge chữ tiếng Việt; ba cột ẩn xuất hiện sau khi bật qua menu Cột (19 cột); dau-chu-2 cũng thấy «33 / 33 căn».
    Bảng năm mã: bốn mã khớp đáp án API ở cả loại căn, diện tích, tầng, hướng; không có cặp mã trùng hai toà. Nội dung đều khớp Expected; eval trượt chỉ vì lớp sự thật mạng: một request tới localhost:3481 bị từ chối kết nối vì máy chủ dev dùng chung chết giữa chừng.
  network_observed: app-fail

- eval: E3b
  run_id: minted-bang-hang-kieu-sheet-E3b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-10-31T16:03:44Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 119.166667

- eval: E4
  run_id: minted-bang-hang-kieu-sheet-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-10-31T16:03:44Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 119.166667

- eval: E5
  run_id: minted-bang-hang-kieu-sheet-E5-r1
  exit_code: 1
  baseline: n-a
  verifier: executors.ui-check (Chrome headless CDP, bản build cổng 3491, 1440x900)
  verified_at: 2026-10-31T16:03:44Z
  screenshot: evidence/E5-hang-loc.png
  observed: |
    Hàng lọc hiện dưới tiêu đề, đủ 16 cột có ô lọc. Kiểu ô đúng cho Toà, Loại căn, Trạng thái, Phí, Ai thấy (chọn), Diện tích, Tầng, Giá, Mức đủ (số), các cột chữ còn lại; riêng Xác nhận là ô SỐ «<14 (ngày)» trong khi Expected nói kiểu chọn.
    Thêm lọc: Đang bán 14, thêm Giá ≤5 còn 8, thêm Mã căn «a-1» còn 2 căn (A-13.01, A-11.02) — chỉ hai mã vì dữ liệu mẫu, Expected nói ba. Xoá lọc về «33 / 33 căn»; «zzz» hiện «0 / 33 căn», «Không căn nào khớp bộ lọc» và nút «Xoá lọc».
  network_observed: n-a (driver)

- eval: E6
  run_id: E6-bang-hang-kieu-sheet-2026-10-31
  exit_code: 0
  baseline: n-a
  verifier: executors.ui-check
  verified_at: 2026-10-31T16:03:44Z
  screenshot: evidence/E6-mac-dinh.png
  observed: |
    Mặc định Nhóm Toà → Loại căn, tổng «33 / 33 căn»: Toà A 18 căn gồm 1PN 2, 2PN 10, 3PN 6; Toà B 15 căn gồm 1PN 2, 2PN 8, 3PN 5 — tổng nhóm con khớp nhóm cha.
    Gập Toà A ẩn mọi nhóm con và dòng căn; chọn Nhóm Toà chỉ còn một cấp; Không nhóm thì không hàng nhóm. Lọc Trạng thái Đang bán còn «14 / 33 căn»: Toà A 6 + Toà B 8 = 14, mọi dòng là Badge Đang bán.
  network_observed: clean

- eval: E7
  run_id: minted-bang-hang-kieu-sheet-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-10-31T16:03:44Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 119.166667

- eval: E8
  run_id: minted-bang-hang-kieu-sheet-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: executors.ui-check
  verified_at: 2026-10-31T16:03:44Z
  screenshot: evidence/E8-ten-rong.png
  observed: |
    Hộp «Lưu góc nhìn» với ô Tên viền đỏ và chữ báo «Đặt tên cho góc nhìn» ngay dưới ô, không lưu. Sau khi lưu, «2PN dưới 5 tỷ» hiện ở cột «Góc nhìn của tôi»; mở lại ra đúng bốn phần (Đang bán, ẩn Hướng, Giá tăng dần, Nhóm Toà, 14/33 căn); đối chứng lưới mặc định khác cả bốn phần.
    Có nhãn «Đã đổi» kèm Lưu đè / Lưu thành mới; đổi tên, hộp xác nhận xoá và mục biến mất đều khớp. dau-chu-2 chưa có góc nhìn; Sàn trống không có Thử-A, về Sàn thử thì hiện lại; id lạ hiện «Góc nhìn này không có trên máy này» kèm nút về Bảng hàng.
  network_observed: clean

- eval: E9
  run_id: minted-bang-hang-kieu-sheet-E9-r1
  exit_code: 1
  baseline: n-a
  verifier: executors.ui-check (Playwright MCP, bản build cổng 3491)
  verified_at: 2026-10-31T16:03:44Z
  screenshot: evidence/E9-step1.png
  observed: |
    Lưới bảng hàng với chỉ báo «Đã đồng bộ · 23:23», «33 / 33 căn». Dán/gõ vào ô Giá không đổi giá trị (vẫn «3,09 tỷ»), trong cửa sổ ghi chỉ có lượt kéo định kỳ GET, không phương thức khác; hàng đợi chờ rỗng; clipboard là 2 dòng × 3 ô tách tab đúng giá trị hiện.
    Lọc và nhóm vẫn chạy khi chặn mạng, nhóm loại căn Toà A giữ 1PN 2, 2PN 10, 3PN 6; sau khi xoá bản danh mục đã giữ thì mọi căn rơi vào «Chưa rõ». Phần trượt: tải lại trang lúc offline thật cho trang lỗi của trình duyệt vì kho không có service worker, nên không thu được nhóm sau tải lại offline theo đúng nghĩa Expected.
  network_observed: clean

- eval: E10
  run_id: E10-2026-10-31-cdp
  exit_code: 0
  baseline: n-a
  verifier: executors.ui-check (Chrome headless CDP)
  verified_at: 2026-10-31T16:03:44Z
  screenshot: evidence/E10-trong-toi.png
  observed: |
    Trống (tối và sáng): «Sàn chưa có hàng nào» kèm nút viền «Nhập Excel». Đang tải: thanh công cụ xám và 8 dòng xám đúng bố cục lưới, không chữ «Loading». Lỗi: Alert đỏ «Chưa tải được bảng hàng» kèm «Thử lại», bấm thì lưới hiện lại đủ «33 / 33 căn».
    Điện thoại 375x812: khối «Bảng hàng dạng thẻ trên điện thoại dựng ở mục 32», không tràn ngang. Không có nút chữ trong khối điện thoại nên không đo tương phản nút ở hai ô này.
  network_observed: unscoped-partial

- eval: E11
  run_id: minted-bang-hang-kieu-sheet-E11-r1
  exit_code: 1
  baseline: n-a
  verifier: executors.script (lệnh node _acceptance/bang-hang-kieu-sheet/thu/do-cuon.mjs)
  verified_at: 2026-10-31T16:03:44Z
  output: |
    BLOCKED, không chạy được: lệnh nằm trong dấu nháy kép nên zsh coi cả chuỗi là một tên lệnh.
    (eval):1: no such file or directory: node _acceptance/bang-hang-kieu-sheet/thu/do-cuon.mjs
    Script do-cuon.mjs có thật; chưa có kết quả đo cuộn.

- eval: E12
  run_id: minted-bang-hang-kieu-sheet-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-10-31T16:03:44Z
  output: |
    npm run typecheck hoàn tất, không lỗi kiểu.

- eval: E13
  run_id: minted-bang-hang-kieu-sheet-E13-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-10-31T16:03:44Z
  output: |
    npm run lint
    chuẩn giao diện: đạt

- eval: E14
  run_id: minted-bang-hang-kieu-sheet-E14-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-10-31T16:03:44Z
  output: |
    design-floor-s4 chạy xong, không mã màu thô trên tệp giao diện vòng chạm.

- eval: E15
  judged_by: judge panel (3 lens, fresh context) — ĐỀ XUẤT, người quyết ở Cổng 2
  verdict: UNCERTAIN
  rationale: Ba trong bốn ý đúng (bang-hang.md đủ chín khoá, vo-va-ia.md ghi phần chuyển thể, tham-chieu.md §12 có dòng 31/10). Ý (3) chưa chốt được vì Notes của contract không nêu tên thành phần cài thêm để đối chiếu với catalog.md.
  votes:
    - domain-correctness: UNCERTAIN — ba trong bốn ý đúng; ý (3) không đối chiếu được «các thành phần cài thêm» với catalog vì Notes của contract chỉ nói chung «tệp cài mới dưới components/reui, components/ui».
    - operational-feasibility: UNCERTAIN — ba tệp đúng; ý (3) chưa chốt vì Notes không liệt kê tên thành phần ngoài data-grid.
    - spec-alignment: PASS — bốn tệp đều đúng; catalog.md có dòng data-grid-editing-6 ở cả hai bảng, Notes không nêu thành phần nào cài thêm nên không có thành phần nào còn thiếu.
  required_evidence:
    - Danh sách tên các tệp thành phần mới cài ở hàng 14 dưới apps/web/src/components/ui và apps/web/src/components/reui (đưa vào Notes của _acceptance/bang-hang-kieu-sheet/contract.md) để đối chiếu từng tên với bảng «Thành phần đã cài» trong .agents/skills/quy-hang-ui/catalog.md.
    - Hoặc một câu trong chính câu hỏi E15 chốt «thành phần cài thêm» chỉ là data-grid; khi đó dòng data-grid ở catalog.md đủ để PASS.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-bang-hang-kieu-sheet-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-10-31T16:03:44Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-bang-hang-kieu-sheet-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-31T16:03:44Z

- cmd: npm run test:hooks
  run_id: minted-bang-hang-kieu-sheet-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-10-31T16:03:44Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-bang-hang-kieu-sheet-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-10-31T16:03:44Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả bản đang kiểm lẫn baseline; chứng minh harness hơn là tính năng — cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/api: E1
- npm test -w @quy-hang/web: E2, E3b, E4, E7
- npm run typecheck: E12
- npm run lint: E13
- R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-s4.mjs" --root .: E14

Baseline khong do
- "node _acceptance/bang-hang-kieu-sheet/thu/do-cuon.mjs": bo qua baseline: tep _acceptance/bang-hang-kieu-sheet/thu/do-cuon.mjs co o cay dang kiem nhung chua co o merge-base 27b59647d5dca68c76785e4808da2cf664d73771 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (mọi eval chạy một lần, không có phương sai)

## Iterations

Round 1: E3, E5, E9 trượt; E11 bị chặn. E3 trượt vì máy chủ dev dùng chung chết giữa lượt đo (kết nối bị từ chối ở request app) dù nội dung khớp; E5 trượt vì cột Xác nhận là ô số thay vì ô chọn và dữ liệu mẫu chỉ có hai mã thoả bộ ba lọc (Expected nói ba); E9 trượt vì tải lại trang lúc offline thật không có đường (không có service worker). E11: lệnh bị bọc dấu nháy kép nên không khởi động được; cần sửa lệnh rồi chạy lại. E15 còn UNCERTAIN chờ người. Trả về triển khai / người điều phối.

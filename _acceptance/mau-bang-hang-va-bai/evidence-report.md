---
schema_version: 2
feature_slug: mau-bang-hang-va-bai
verdict: REJECT
failed_evals: ["E10"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e7096db6f7d0f57c7d144c767571979679cdcdea
human_signoff:
---

# Evidence Report: mau-bang-hang-va-bai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E5c | AC-5 | test | PASS |
| E5d | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E7c | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | script | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | ui-check | FAIL |
| E10b | AC-10 | script | PASS |
| E10c | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-mau-bang-hang-va-bai-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T09:36:06Z
  output: |
    npm run db:migrate && npm run db:test — bộ kiểm cách ly xanh (một lần chạy, một lần đạt).

- eval: E2b
  run_id: minted-mau-bang-hang-va-bai-E2b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T09:36:06Z
  output: |
    npm run db:migrate && npm run db:test — bộ kiểm cách ly xanh.

- eval: E3
  run_id: minted-mau-bang-hang-va-bai-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T09:36:06Z
  output: |
    npm run db:migrate && npm run db:test — bộ kiểm cách ly xanh.

- eval: E4
  run_id: minted-mau-bang-hang-va-bai-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T09:36:06Z
  output: |
    npm run db:migrate && npm run db:test — bộ kiểm cách ly xanh.

- eval: E5d
  run_id: minted-mau-bang-hang-va-bai-E5d-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T09:36:06Z
  output: |
    npm run db:migrate && npm run db:test — bộ kiểm cách ly xanh.

- eval: E7b
  run_id: minted-mau-bang-hang-va-bai-E7b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T09:36:06Z
  output: |
    npm run db:migrate && npm run db:test — bộ kiểm cách ly xanh.

- eval: E8
  run_id: minted-mau-bang-hang-va-bai-E8-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T09:36:06Z
  output: |
    npm run db:migrate && npm run db:test — bộ kiểm cách ly xanh.

- eval: E9b
  run_id: minted-mau-bang-hang-va-bai-E9b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T09:36:06Z
  output: |
    npm run db:migrate && npm run db:test — bộ kiểm cách ly xanh.

- eval: E1b
  run_id: minted-mau-bang-hang-va-bai-E1b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T09:36:06Z
  output: |
    npm test -w @quy-hang/web — bộ kiểm web xanh.

- eval: E3b
  run_id: minted-mau-bang-hang-va-bai-E3b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T09:36:06Z
  output: |
    npm test -w @quy-hang/web — bộ kiểm web xanh.

- eval: E4b
  run_id: minted-mau-bang-hang-va-bai-E4b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T09:36:06Z
  output: |
    npm test -w @quy-hang/web — bộ kiểm web xanh.

- eval: E5b
  run_id: minted-mau-bang-hang-va-bai-E5b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T09:36:06Z
  output: |
    npm test -w @quy-hang/web — bộ kiểm web xanh.

- eval: E5c
  run_id: minted-mau-bang-hang-va-bai-E5c-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T09:36:06Z
  output: |
    npm test -w @quy-hang/web — bộ kiểm web xanh.

- eval: E7c
  run_id: minted-mau-bang-hang-va-bai-E7c-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T09:36:06Z
  output: |
    npm test -w @quy-hang/web — bộ kiểm web xanh.

- eval: E8b
  run_id: minted-mau-bang-hang-va-bai-E8b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T09:36:06Z
  output: |
    npm test -w @quy-hang/web — bộ kiểm web xanh.

- eval: E10c
  run_id: minted-mau-bang-hang-va-bai-E10c-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T09:36:06Z
  output: |
    npm test -w @quy-hang/web — bộ kiểm web xanh.

- eval: E2
  run_id: minted-mau-bang-hang-va-bai-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-07T09:36:06Z
  output: |
    npm test -w @quy-hang/core — bộ kiểm lõi xanh.

- eval: E5
  run_id: minted-mau-bang-hang-va-bai-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-07T09:36:06Z
  output: |
    npm test -w @quy-hang/core — bộ kiểm lõi xanh.

- eval: E6
  run_id: minted-mau-bang-hang-va-bai-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-07T09:36:06Z
  output: |
    npm test -w @quy-hang/core — bộ kiểm lõi xanh.

- eval: E7
  run_id: minted-mau-bang-hang-va-bai-E7-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-07T09:36:06Z
  output: |
    npm test -w @quy-hang/core — bộ kiểm lõi xanh.

- eval: E9
  run_id: minted-mau-bang-hang-va-bai-E9-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-07T09:36:06Z
  output: |
    npm run test:ro-ri — bộ kiểm rò rỉ xanh.

- eval: E10b
  run_id: minted-mau-bang-hang-va-bai-E10b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-07T09:36:06Z
  output: |
    design-floor-khuon --kiem: 16 tệp giao diện ngoài bản đồ (không lệch mới).

- eval: E10
  run_id: minted-mau-bang-hang-va-bai-E10-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-07T09:36:06Z
  screenshot: evidence/E10-step1.png
  observed: |
    step1: Cài đặt › Sàn › Mẫu, menu trái có «Mẫu», ba tab Mẫu nhập/Mẫu bảng hàng/Mẫu bài, tab Mẫu nhập hiện câu «Chưa có mẫu nào — mẫu tự nhớ sau lần nhập Excel đầu tiên của sàn.» (khớp). step3: banner «Đã lưu mẫu», nút Thêm mẫu, bảng một dòng «[Tên] gửi đội · 3 cột · Diện tích · Mã căn · Giá» (đúng thứ tự). step4: hộp Thêm mẫu mờ nền, ô tên «[Tên] gửi đội» còn nguyên, chữ đỏ «Tên đã có trong sàn» dưới danh sách cột, các cột không có Người giữ/Giá chốt (khớp). step5: tab Mẫu bài, Zalo với mở đầu «Chào cả nhà, quỹ hàng hôm nay:» 30/500, kết «Anh chị quan tâm nhắn em nhé.» 29/500, xem trước hai lời quanh dòng căn mẫu A-12.05 và A-08.02, nút Lưu (khớp). step6: hộp Xuất bảng hàng bước Xem trước, bảng 3 cột Diện tích, Mã căn, Giá với C-05.10/C-08.02/C-12.05 (khớp), nhưng góc dưới trái có huy hiệu đỏ «1 Issue» của Next dev. step7: màn Gửi căn, Nhóm môi giới, hai căn C-05.10 C-08.02 ảnh khối tím, Tin soạn sẵn mở đầu «Gửi các anh chị trong nhóm, / Chào cả nhà, quỹ hàng hôm nay: / Em gửi 2 căn…», ô tin đang focus (khớp). step8: tin soạn sẵn mang «Quỹ hàng CẬP NHẬT sáng nay:» (đọc bằng DOM, khớp). step9: hộp Xuất bảng hàng bước Mẫu, «Cột theo» chỉ một lựa chọn «Góc nhìn đang mở» có dấu tích, huy hiệu «1 Issue» vẫn hiện (khớp phần nội dung, mâu thuẫn Expected ở phần console). step10: Đầu chủ ở trang Cá nhân, banner «Mục này chỉ quản trị sàn mở được» (khớp). step11: 375px, một cột, khung không tràn, Mẫu bài hiện đủ Zalo mở đầu/kết/xem trước, nút Lưu và Về mặc định. Nội dung 11 bước khớp mô tả; console có lỗi hydration của Bảng hàng và một lần từ chối nghiệp vụ có chủ đích ở bước 4 nên không đạt Expected «không lỗi ứng dụng trên console».
  network_observed: app-fail
  output: |
    Driver playwright MCP, máy chủ http://localhost:3491 dùng chung. 11 bước kiểm theo DOM và chữ đều khớp.
    Hai điểm không đạt Expected «không lỗi ứng dụng trên console»:
    A. Lỗi hydration ở Bảng hàng (BangHang/DataGrid/FramePanel, thanh công cụ MenuTrigger và TrangThai), thấy khi mở /inventory ở bước 6 và 9; huy hiệu «1 Issue» hiện trong ảnh step6 và step9. Có thể chỉ là lỗi dev-mode nhưng vẫn là lỗi console của ứng dụng.
    B. Bước 4 (trùng tên mẫu) bị máy chủ từ chối nghiệp vụ có chủ đích («Tên đã có trong sàn»); Expected của eval không khai trường hợp này nên theo luật scoping tính là app-fail. Các request API còn lại đều thành công, không có lỗi máy chủ.
    Khung đã lưu và đã mở đọc: E10-step1 đến E10-step11 (.png), kèm E10-network.txt và E10-console-errors.txt trong evidence/.
    Dữ liệu tiền đề: dựng qua API, Đầu chủ tạo 3 căn C-05.10, C-08.02, C-12.05; Đầu khách để lại 3 căn nháp A-12.05, A-08.02, B-05.10 (rác dữ liệu dev). Vai Quản trị bị chuyển khỏi /inventory theo luật nên các bước Xuất/Gửi làm bằng Đầu chủ/Đầu khách.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-mau-bang-hang-va-bai-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-07T09:36:06Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-mau-bang-hang-va-bai-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-07T09:36:06Z

- cmd: npm run test:hooks
  run_id: minted-mau-bang-hang-va-bai-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-07T09:36:06Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-mau-bang-hang-va-bai-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-07T09:36:06Z

- cmd: npm run typecheck
  run_id: minted-mau-bang-hang-va-bai-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-07T09:36:06Z

- cmd: npm run lint
  run_id: minted-mau-bang-hang-va-bai-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-07T09:36:06Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline — chứng minh bộ kiểm chứ không chứng minh tính năng; cần viết lại để assert hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý):
- npm test -w @quy-hang/web: E1b, E3b, E4b, E5b, E5c, E7c, E8b, E10c
- npm test -w @quy-hang/core: E2, E5, E6, E7
- npm run test:ro-ri: E9
- design-floor-khuon --kiem: E10b

Lệnh thất bại không gắn eval nào ngoài danh sách trên: không có. Lệnh ui-check:E10 thất bại và gắn eval E10.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lịch sử round đầu không được truyền vào lượt soạn này; xem run-log.jsonl.
Round 2: E10 failed — màn Mẫu đủ 11 bước đúng mô tả, nhưng console có lỗi hydration ở Bảng hàng khi mở /inventory và bước 4 gây một từ chối nghiệp vụ ngoài Expected. Returned to implementation.

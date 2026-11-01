---
schema_version: 2
feature_slug: cot-ho-so-can
verdict: BLOCKED
failed_evals: ["E9"]
reason: "ui-check:E9b — Không chạy được các bước: sau DỰNG H (máy chủ dev cổng 3482, đăng nhập sẵn dau-chu-1, căn A = A-06.01 Toà A), trang /inventory?unit=A-06.01 không bao giờ qua «Đang tải lần đầu» nên lịch sử và cột hồ sơ không hiện. Lúc đầu trình duyệt tải lại liên tục (HMR «Compiled in 0-4ms», khoảng 190ms mỗi lần, hàng nghìn lượt gọi /api/v1/catalog). Sau khi chặn websocket thì vòng tải lại hết, nhưng trang vẫn kẹt «Đang tải lần đầu» 30 giây và không phát sinh lời gọi /api nào, rồi có lúc trống trắng. Không đo được số sự kiện, giá, trạng thái, mức đủ trên cột, cũng không thực hiện được bước báo sai. Nghi do máy chủ dev dùng chung với phiên khác nên bị dựng lại liên tục, nhưng chưa xác định được nguyên nhân. Không kết luận PASS hay FAIL của AC-9. Đã tắt máy chủ dev do mình dựng (PID 5266)."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d744645ed547748f131c9d2c782d4336b136515d
human_signoff:
---

# Evidence Report: cot-ho-so-can

Round 1. Có lệnh không gắn eval thất bại: ui-check:E9 (gắn E9). E9b không chạy được các bước nên báo BLOCKED.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | ui-check | FAIL |
| E9b | AC-9 | ui-check | BLOCKED |
| E10 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-cot-ho-so-can-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T03:06:56Z
  output: |
    ℹ duration_ms 173.493

- eval: E2
  run_id: minted-cot-ho-so-can-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T03:06:56Z
  output: |
    ℹ duration_ms 173.493

- eval: E3
  run_id: minted-cot-ho-so-can-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T03:06:56Z
  output: |
    ℹ duration_ms 173.493

- eval: E4
  run_id: minted-cot-ho-so-can-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T03:06:56Z
  output: |
    ℹ duration_ms 173.493

- eval: E5
  run_id: minted-cot-ho-so-can-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T03:06:56Z
  output: |
    ℹ duration_ms 173.493

- eval: E6
  run_id: minted-cot-ho-so-can-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T03:06:56Z
  output: |
    ℹ duration_ms 173.493

- eval: E7
  run_id: minted-cot-ho-so-can-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T03:06:56Z
  output: |
    ℹ duration_ms 173.493

- eval: E8
  run_id: minted-cot-ho-so-can-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-01T03:06:56Z
  output: |
    chuẩn giao diện: đạt

- eval: E8b
  run_id: minted-cot-ho-so-can-E8b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-01T03:06:56Z
  output: |
    ℹ duration_ms 11762.611

- eval: E9
  run_id: E9-2026-11-01
  exit_code: 1
  baseline: n-a
  verifier: ui-check (trình điều khiển chrome-devtools; evals.yaml không khai ref)
  verified_at: 2026-11-01T03:06:56Z
  screenshot: evidence/E9-cot.png
  observed: |
    E9-cot.png: cột hồ sơ bên phải bảng 1440x900, đầu cột «[Mẫu] Dự án căn hộ thử · Toà A · Căn hộ», A-06.01 huy hiệu Đang bán, 3,25 tỷ Bao phí, thanh mức đủ 3/5 «thiếu Nội thất, Tài chính»; Thuộc tính căn gồm 7 dòng đúng và nút «Báo sai thông tin căn»; dòng A-06.01 được tô sáng. Khớp expected. E9-step7.png (Lần 1, Ngừng hẳn, 3,1 tỷ), E9-ngoai-danh-muc.png, E9-375.png, E9-nhieu-can.png khớp expected. E9-mat-mang.png và E9-mat-mang-tai-lai.png là trang lỗi Chrome ERR_INTERNET_DISCONNECTED thay cho giao diện app, MÂU THUẪN expected (lịch sử A «đang xem bản trên máy», căn C «Lịch sử cần mạng để tải lần đầu»).
  network_observed: clean
  output: |
    PASS: cột phải, URL ?unit=A-06.01&toa=Toa+A&lan=<id>, 7 thuộc tính, lần rao đang mở 3,25 tỷ mức đủ 3/5, Các lần rao 2 dòng mới nhất trên, lịch sử 6 dòng có «Bạn» và «Trưởng nhóm».
    PASS: bấm căn khác đổi đầu cột A-06.01 sang A-13.01, cột không đóng, bảng cuộn được.
    PASS: nút chép và mở bảng chia sẻ tắt khi trống, bật khi gõ «70,2 m2»; navigator.share được gọi với nội dung đúng, không NotAllowedError (bộ nhớ tạm không đọc được).
    PASS: đóng cột bỏ unit/toa/lan; tải lại mở đúng A; bấm Lần 1 ra «Ngừng hẳn» 3,1 tỷ.
    FAIL: mất mạng — tải lại khi offline ra trang lỗi Chrome, không có «đang xem bản trên máy»; bấm căn C hay Lần 1 khi offline làm điều hướng toàn trang ra trang lỗi, không có chữ «Lịch sử cần mạng để tải lần đầu».
    PASS: căn ngoài danh mục «Chưa có trong danh mục», không nút Báo sai; 375 một cột không tràn ngang; «Nhiều căn» kèm hai toà; KHONG-CO báo không có trong Bảng hàng.
    Ghi chú: máy chủ dev chết giữa chừng do phiên khác tắt; dừng và tắt bằng --tat. Dump mạng: evidence/E9-network.txt.

- eval: E9b
  run_id: minted-cot-ho-so-can-E9b-r1
  exit_code: 1
  baseline: n-a
  verifier: ui-check (evals.yaml không khai ref)
  verified_at: 2026-11-01T03:06:56Z
  screenshot: evidence/E9b-step1.png
  observed: |
    E9b-step1.png (đã mở bằng Read): toàn trắng, không có giao diện nào. Không đối chiếu được với expected. Trước đó ảnh chụp từ trình duyệt khung (không lưu tệp) cho thấy các khối xám chờ tải và chữ «Đang tải lần đầu» ở thanh trên.
  network_observed: n-a (tool-error: trang không phát sinh lời gọi /api nào trong 30 giây; trước đó vòng tải lại HMR làm công cụ mất bộ đệm mạng)
  output: |
    Làm được: DỰNG H chạy được (căn A A-06.01 Toà A, hai lần rao, sáu dòng lịch sử). /api/v1/me trả dau-chu-1@mau.quy-hang.test (HTTP 200).
    Không làm được: bước 2 đến 4, vì trang kẹt «Đang tải lần đầu» và không có lời gọi /api nào. Không có assertion nào đạt.
    Nhật ký máy chủ lưu ở evidence/E9b-network.txt.

- eval: E10
  run_id: minted-cot-ho-so-can-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-01T03:06:56Z
  output: |
    sàn M1 đạt (không mã màu thô trên tệp giao diện vòng chạm)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-cot-ho-so-can-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-01T03:06:56Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-cot-ho-so-can-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-01T03:06:56Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-cot-ho-so-can-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-01T03:06:56Z

- cmd: npm run test:hooks
  run_id: minted-cot-ho-so-can-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-01T03:06:56Z

- cmd: npm run typecheck
  run_id: minted-cot-ho-so-can-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-01T03:06:56Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên nhánh lẫn baseline, chứng minh harness chứ chưa chứng minh tính năng; viết lại để assert hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý):
- npm test -w @quy-hang/web: E1, E2, E3, E4, E5, E6, E7
- npm run lint: E8
- npm test -w @quy-hang/ui-lint: E8b
- design-floor-s4: E10

Không có judgment item nên không có hội đồng chấm; không có mục nào chờ human_override.

## Variance

none — mọi eval chạy một lần, kết quả xác định.

## Iterations

Round 1: E9 thất bại — mất mạng: tải lại hay bấm căn khi offline ra trang lỗi Chrome, không có chữ «đang xem bản trên máy» hay «Lịch sử cần mạng để tải lần đầu»; E9b không chạy được các bước (trang kẹt «Đang tải lần đầu», không phát sinh lời gọi /api). Trả về triển khai.

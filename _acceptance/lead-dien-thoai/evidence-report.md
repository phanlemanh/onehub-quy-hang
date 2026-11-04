---
schema_version: 2
feature_slug: lead-dien-thoai
verdict: REJECT
failed_evals: ["E7a","E3","E4","E6"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ef722a83cdb696c71d94511cd3960acad230e26e
human_signoff:
---

# Evidence Report: lead-dien-thoai

Round 1. Bốn eval chưa đạt: E7a, E3, E4, E6. Mọi lệnh fail đều đã gắn vào eval (không có lệnh fail lẻ).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E7a | AC-7 | script | FAIL |
| E7b | AC-7 | test | PASS |
| E1 | AC-1 | ui-check | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-3 | ui-check | FAIL |
| E4 | AC-4 | ui-check | FAIL |
| E5 | AC-5 | ui-check | PASS |
| E6 | AC-6 | ui-check | FAIL |
| E9 | AC-9 | ui-check | PASS |
| E8 | AC-8 | ui-check | PASS |

## Evidence

- eval: E7a
  run_id: minted-lead-dien-thoai-E7a-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T09:54:20Z
  output: |
    sai: design/patterns/trang-tam.md: ngoai_le trỏ tệp không có: apps/web/src/app/(app)/proto/o-nhan-lead/page.tsx
    bản đồ nhóm lead-cua-toi đổi sau khi ghim — chấm theo bản ghim
    bản đồ nhóm o-nhan-lead đổi sau khi ghim — chấm theo bản ghim
    bản đồ nhóm trang-tam đổi sau khi ghim — chấm theo bản ghim
    nợ cũ: apps/web/src/app/(app)/leads/mine/page.tsx · thuộc hai nhóm màn: lead-cua-toi, trang-tam
    nợ cũ: apps/web/src/app/(app)/leads/new/page.tsx · thuộc hai nhóm màn: o-nhan-lead, trang-tam
    6 tệp giao diện ngoài bản đồ

- eval: E7b
  run_id: minted-lead-dien-thoai-E7b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-04T09:54:20Z
  output: |
    ℹ duration_ms 21109.012667

- eval: E1
  run_id: minted-lead-dien-thoai-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T09:54:20Z
  screenshot: evidence/E1-nhap-390.png
  observed: |
    E1-nhap-390.png (390x844, giao diện tối): tab Lead, tiêu đề «Ô nhận lead», hai tab «Nhập lead» (đang chọn) và «Lead đã nhập» cùng một tab Lead. Phần nhập là một cột năm mục, không cuộn ngang: Số chủ nhà, Căn hoặc toà, Nhu cầu, Giá, Thời gian muốn ra hàng.
    Nút «Gửi lead» nằm trong khung nhìn, bị thanh tab dưới che một phần; script báo nút bấm được. Khớp Expected.
  network_observed: n-a (driver)

- eval: E2
  run_id: minted-lead-dien-thoai-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T09:54:20Z
  screenshot: evidence/E2-step1.png
  observed: |
    E2-step1.png (390x844, ca thiếu số chủ nhà): ô «Số chủ nhà» trống, viền đỏ, dòng đỏ dưới ô «Cần số điện thoại Việt Nam 10 chữ số». Các ô khác đã điền (Giá 3.200.000.000, Bán, Toà A, Ngay), không ô nào khác báo lỗi. Khớp Expected; bốn ca còn lại không có ảnh, kết quả lấy từ dòng JSON của script.
  network_observed: n-a (driver)

- eval: E3
  run_id: minted-lead-dien-thoai-E3-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T09:54:20Z
  screenshot: evidence/E3-ket-qua-390.png
  observed: |
    E3-ket-qua-390.png (390x844): tab «Nhập lead» đang chọn, form TRỐNG; KHÔNG thấy kết quả kiểm trùng và KHÔNG thấy lối «Xem ở Lead đã nhập» trong khung, trái với tên và mục đích ảnh. E3-da-nhap-390.png: tab «Lead đã nhập», hàng đầu «Toà A · chỉ biết toà», Bán · 3,2 tỷ, nấc «Đã gửi». Các khẳng định bằng DOM đạt, nhưng ảnh kết quả không chứng minh được Expected.
  network_observed: n-a (driver)

- eval: E4
  run_id: minted-lead-dien-thoai-E4-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T09:54:20Z
  screenshot: evidence/E4-step1.png
  observed: |
    Đã mở từng ảnh bằng Read. Cả bốn ảnh: khổ 390, một cột, tab «Lead đã nhập», không thấy số chủ hay mã hàng. Ảnh 1 nấc «Đã gửi», ảnh 2 «Đã nhận», ảnh 3 «Đã gọi». Ảnh 4 (E4-step4) vẫn «Đã gọi», giống hệt ảnh 3, KHÔNG đổi sang «Lên bảng». Khác Expected ở nấc thứ tư; dòng e4 cũng thiếu khoá coMaHang.
  network_observed: n-a (driver)

- eval: E5
  run_id: minted-lead-dien-thoai-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T09:54:20Z
  screenshot: evidence/E5-mat-mang-390.png
  observed: |
    E5-mat-mang-390.png (390x844): banner «Đang xem bản đã tải — mất mạng», form giữ nguyên số chủ nhà 0900 000 042, Toà A, Bán, giá 3.200.000.000, Bao phí. Câu «Chưa gửi được» nằm ngoài khung nhìn nhưng có trong văn bản trang. E5-gui-lai-390.png: sau khi có mạng và bấm Gửi, form về trống, đúng một lead mới.
  network_observed: n-a (driver)

- eval: E6
  run_id: minted-lead-dien-thoai-E6-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T09:54:20Z
  screenshot: evidence/E6-tab-mat-mang-390.png
  observed: |
    E6-tab-mat-mang-390: dải mất mạng, khối đỏ «Không tải được lead đã nhập» kèm Thử lại, không có «Chưa có lead nào» (khớp). E6-tab-co-mang-390: dải tắt, 37 dòng (khớp). E6-trang-mat-mang-390: /leads/mine báo lỗi kèm Thử lại (khớp).
    E6-trang-co-mang-390: dải mất mạng đã tắt nhưng phần Lead đã nhập vẫn là khung chờ xương, soDong=0, mâu thuẫn Expected «Thử lại tải được danh sách».
  network_observed: n-a (driver)

- eval: E9
  run_id: minted-lead-dien-thoai-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T09:54:20Z
  screenshot: evidence/E9-dau-chu-390.png
  observed: |
    E9-dau-chu-390: đầu chủ thấy biểu mẫu đủ năm mục và nút «Gửi lead». E9-dau-khach-390: vai mua hàng thấy khối «Vai của bạn không nhập lead», không biểu mẫu, không tab. E9-telesales-moi-390: «Chưa có lead nào» kèm hướng dẫn «+ Lead». E9-dang-tai-390: khung chờ xám nhiều hàng, không khung trắng. Khớp Expected.
  network_observed: n-a (driver)

- eval: E8
  run_id: minted-lead-dien-thoai-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T09:54:20Z
  screenshot: evidence/E8-nhap-1440.png
  observed: |
    E8-nhap-1440.png (1440x900): trang «Ô nhận lead» không có tab, form hai cột đủ năm mục và nút Gửi lead, không cuộn ngang. E8-da-nhap-1440.png: «Lead đã nhập» là bảng ba cột Lead / Nắc / Giờ · đầu chủ, có nhãn Đã gửi, Đã gọi, Đã nhận, Chờ chia. Khớp Expected.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-lead-dien-thoai-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-04T09:54:20Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-lead-dien-thoai-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-04T09:54:20Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-lead-dien-thoai-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-04T09:54:20Z

- cmd: npm run test:hooks
  run_id: minted-lead-dien-thoai-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-04T09:54:20Z

- cmd: npm run typecheck
  run_id: minted-lead-dien-thoai-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-04T09:54:20Z

- cmd: npm run lint
  run_id: minted-lead-dien-thoai-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-04T09:54:20Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline): E7b (lệnh `npm test -w @quy-hang/ui-lint`). Cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý.

Ghi chú: E7a cũng xanh trên baseline nhưng đỏ trên HEAD (khuôn lệch sau khi ghim bản đồ nhóm, tệp ngoài bản đồ, ngoại lệ trỏ tệp không còn).

Không có mục judgment: không panel nào được đề xuất, không có human_override cần điền.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, deterministic).

## Iterations

Round 1: E7a, E3, E4, E6 failed — E7a: khuôn thiết kế lệch (ngoại lệ trang-tam trỏ proto/o-nhan-lead không còn, bản đồ nhóm đổi sau khi ghim, 6 tệp ngoài bản đồ); E3: ảnh kết quả không chứa khối kiểm trùng và lối «Xem ở Lead đã nhập»; E4: nấc «Lên bảng» không xuất hiện, thiếu khoá coMaHang; E6: /leads/mine sau Thử lại vẫn khung chờ, không có dòng. Returned to implementation.

---
schema_version: 2
feature_slug: mau-bang-hang-va-bai
verdict: REJECT
failed_evals: ["E10"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 90b8936be8b4e68a6ac81ef15cbe1c0c1d0daaa4
human_signoff:
---

# Evidence Report: mau-bang-hang-va-bai

Round 3. Lệnh fail không gắn eval nào ngoài eval đã nêu: ui-check:E10 (eval E10, lệnh trả mã lỗi). Các eval còn lại mang từ round 2 (carry-forward), không chạy lại vì delta không chạm đường dẫn của chúng.

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
| E10c | AC-10 | test | PASS |
| E10b | AC-10 | script | PASS |

## Evidence

- eval: E10
  run_id: minted-mau-bang-hang-va-bai-E10-r3
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-07T09:52:28Z
  screenshot: evidence/E10-step1.png
  observed: |
    Đã mở từng khung bằng Read. Các bước 1-11 đều đúng mô tả, nhưng console có lỗi hydration ngoài khung đã khai nên eval không đạt. Giao diện: step1 menu Cài đặt › Sàn có mục «Mẫu» (đang chọn); trang Mẫu có ba tab «Mẫu nhập · Mẫu bảng hàng · Mẫu bài», tab Mẫu nhập trống («Chưa có mẫu nào…»). step2 tab Mẫu bảng hàng: «Sàn chưa có mẫu bảng hàng — xuất đang theo góc nhìn đang mở.» và nút «Thêm mẫu». step3 sau khi lưu «[Tên] gửi đội» (Mã căn, Giá, Diện tích, đưa Diện tích lên đầu): thông báo «Đã lưu mẫu», danh sách hiện «3 cột · Diện tích · Mã căn · Giá». step4 (thêm mẫu trùng tên): hộp thoại giữ nguyên chữ «[Tên] gửi đội», dòng đỏ «Tên đã có trong sàn» dưới ô; danh sách cột chỉ gồm Toà, Mã căn, Loại căn, Diện tích, Tầng, Hướng, Trạng thái, Giá, Phí, Nội thất, Pháp lý, Tài chính, Tình trạng sử dụng, Xác nhận — không có «Người giữ», «Giá chốt». step5 tab Mẫu bài, khối Zalo: lời mở đầu «Lời mở đầu thử E10» và lời kết «Lời kết thử E10»; xem trước có hai lời quanh hai dòng căn mẫu; Lưu ra «Đã lưu». step6/6a/6b/6c (vai Đầu chủ): hộp Xuất bảng hàng có ô «Cột theo» với hai lựa chọn «Góc nhìn đang mở» và «[Tên] gửi đội»; chọn mẫu + Excel, bước Xem trước hiện đúng ba cột «Diện tích | Mã căn | Giá» (Diện tích hiện «—» vì dữ liệu thử không có diện tích) cho C-05.10, C-08.02, C-12.05; chọn Bài Zalo, xem trước hiện «Lời mở đầu thử E10», ba dòng căn, «Lời kết thử E10». Các khung step6* có huy hiệu đỏ «1 Issue» của Next (lỗi hydration). step7 (vai Đầu khách, màn Gửi, hai căn C-05.10 và C-08.02): ô Tin soạn sẵn gồm «Chào anh/chị ạ,» → lời mở đầu → «Em gửi 2 căn đang bán:» → hai dòng căn → «Xem ảnh và chi tiết: [link]» → lời kết; gõ thêm «Thêm chữ E10» được nhận vào ô (đọc qua DOM; khung chụp cắt ô ở mép dưới nên chữ thêm không hiện trên ảnh). step8/8a: sửa lời mở đầu Zalo thành «Lời mở đầu MỚI E10», lưu «Đã lưu»; mở lại màn Gửi tin mang «Lời mở đầu MỚI E10». step9/9a/9b: hộp xác nhận «Xoá mẫu «[Tên] gửi đội»?», xoá xong tab trở lại «Sàn chưa có mẫu bảng hàng…»; mở lại Xuất thì «Cột theo» chỉ còn «Góc nhìn đang mở». step10: vai Đầu chủ mở /settings/templates bị chuyển về /settings/personal?chi-quan-tri=1 kèm câu «Mục này chỉ quản trị sàn mở được». step11/11a/11b khổ 375px: màn Mẫu một cột, scrollWidth bằng clientWidth (375), không vỡ khung. Console: có đúng một lời 400 từ PUT /api/v1/company/templates/export ở bước 4 (khai); lỗi hydration #1 (BangHang recordCount=0 → TrangThai kind="empty") khớp khung đã khai; nhưng còn ba lỗi hydration khác ở Bảng hàng khi có dữ liệu (BangCoHoSo → BangHang → DataGrid recordCount=3/6 → FramePanel → thanh công cụ → MenuTrigger; máy chủ dựng «Đang tải», máy khách dựng nút) — khung này KHÔNG có trong Expected.
  network_observed: app-fail
  output: |
    Dev server http://localhost:3491 đã chạy sẵn, dùng chung, không tắt. Chụp bằng playwright, đã lưu 23 tệp E10-*. Đăng nhập bằng mã dev của sàn mẫu (quan-tri, dau-chu-1, dau-khach, truong-nhom).
    A1 menu có «Mẫu», 3 tab: PASS
    A2 trạng thái trống + nút «Thêm mẫu»: PASS
    A3 «Đã lưu mẫu», thứ tự Diện tích·Mã căn·Giá: PASS
    A4 «Tên đã có trong sàn», tên còn nguyên, không «Người giữ/Giá chốt»: PASS
    A5 Zalo xem trước có hai lời, Lưu «Đã lưu»: PASS
    A6 «Cột theo» có 2 mục; xem trước ba cột đúng thứ tự; Bài Zalo có lời mở đầu/kết: PASS
    A7 màn Gửi: lời mở đầu sau lời chào, lời kết sau dòng link, ô nhận chữ gõ thêm: PASS
    A8 sửa lời mở đầu rồi mở lại màn Gửi mang lời mới: PASS
    A9 xoá mẫu (có xác nhận), danh sách trống, Xuất chỉ còn «Góc nhìn đang mở»: PASS
    A10 Đầu chủ vào /settings/templates về /settings/personal có «Mục này chỉ quản trị sàn mở được»: PASS
    A11 khổ 375px một cột, không tràn ngang (375/375): PASS
    A12 console không lỗi ngoài hai điều đã khai: FAIL. Lời 400 PUT templates/export (khai) và hydration khung TrangThai empty (khai) là đúng, nhưng còn 3 lỗi Hydration failed khung khác (BangCoHoSo > BangHang > DataGrid recordCount=3/6 > FramePanel > toolbar > MenuTrigger) không được khai. Cùng nhóm nguyên nhân L-45 nhưng Expected viết rõ khung TrangThai empty và chốt mọi lỗi console khác là không đạt. Ghi chú: công cụ tổng hợp hiện 2 dòng 400 trong khi tệp console của trang quản trị ghi đúng 1 dòng; log máy chủ không đủ chi tiết để đối chiếu. Ngoài luồng chính: vai Trưởng nhóm ở màn Gửi gây GET /api/v1/prospects bị từ chối quyền (không tái hiện với Đầu khách).
    Khung đã lưu trong evidence/: E10-step1 … E10-step11b (png) và E10-network.txt. Các tệp E10-console-errors.txt cũ là của lượt trước, chưa ghi đè.
    Eval không đạt vì A12.

- eval: E1
  run_id: minted-mau-bang-hang-va-bai-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  output: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E1b
  run_id: minted-mau-bang-hang-va-bai-E1b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  output: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-mau-bang-hang-va-bai-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  output: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E2b
  run_id: minted-mau-bang-hang-va-bai-E2b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  output: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-mau-bang-hang-va-bai-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  output: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E3b
  run_id: minted-mau-bang-hang-va-bai-E3b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  output: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-mau-bang-hang-va-bai-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  output: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E4b
  run_id: minted-mau-bang-hang-va-bai-E4b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  output: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-mau-bang-hang-va-bai-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  output: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E5b
  run_id: minted-mau-bang-hang-va-bai-E5b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  output: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E5c
  run_id: minted-mau-bang-hang-va-bai-E5c-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  output: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E5d
  run_id: minted-mau-bang-hang-va-bai-E5d-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  output: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-mau-bang-hang-va-bai-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  output: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-mau-bang-hang-va-bai-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  output: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E7b
  run_id: minted-mau-bang-hang-va-bai-E7b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  output: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E7c
  run_id: minted-mau-bang-hang-va-bai-E7c-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  output: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-mau-bang-hang-va-bai-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  output: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E8b
  run_id: minted-mau-bang-hang-va-bai-E8b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  output: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-mau-bang-hang-va-bai-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  output: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E9b
  run_id: minted-mau-bang-hang-va-bai-E9b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  output: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10c
  run_id: minted-mau-bang-hang-va-bai-E10c-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  output: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10b
  run_id: minted-mau-bang-hang-va-bai-E10b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  output: carry-forward tu round 2 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-mau-bang-hang-va-bai-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-07T09:52:28Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-mau-bang-hang-va-bai-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-07T09:52:28Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-mau-bang-hang-va-bai-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-07T09:52:28Z

- cmd: npm run test:hooks
  run_id: minted-mau-bang-hang-va-bai-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-07T09:52:28Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-mau-bang-hang-va-bai-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-07T09:52:28Z

- cmd: npm run typecheck
  run_id: minted-mau-bang-hang-va-bai-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-07T09:52:28Z

- cmd: npm run lint
  run_id: minted-mau-bang-hang-va-bai-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-07T09:52:28Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lượt S4 đầu, chi tiết ở run-log.jsonl và lịch sử commit của nhánh.
Round 2: E10 REJECT — console có lỗi hydration của Bảng hàng ngoài khai báo, chờ L-45; Expected của E10 được bổ sung khai báo hai điều.
Round 3: E10 failed — A12, còn ba lỗi hydration khác ở Bảng hàng khi có dữ liệu (khung toolbar MenuTrigger, máy chủ dựng «Đang tải») không nằm trong khung đã khai. Các eval khác mang từ round 2, bảy lệnh suite đều xanh. Returned to implementation.

---
schema_version: 2
feature_slug: lam-lai-hom-nay-dau-chu
verdict: REJECT
failed_evals: ["E1"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b4e2b4043d138af2504c90a01e79d91f837c432c
human_signoff:
---

# Evidence Report: lam-lai-hom-nay-dau-chu

Vòng 2. Một eval hỏng: E1 (AC-1). Nút chính của năm dòng căn «Thiếu thông tin» vẫn là «Đổi giá, trạng thái · Mở hồ sơ», trong khi AC-3 xếp việc này vào ⋯. Lỗi này đã được ghi ở vòng 1 và chưa sửa.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | FAIL |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-5 | ui-check | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7a | AC-7 | script | PASS |
| E7b | AC-7 | test | PASS (mang từ vòng 1) |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-lam-lai-hom-nay-dau-chu-E1-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T00:17:48Z
  screenshot: evidence/E1-hom-nay-1440.png
  observed: |
    I opened E1-hom-nay-1440.png (1440 wide, dark theme). The page is Hôm nay with the "54 việc" counter. The header row shows four columns named Việc, Vì sao hôm nay, Giá, Hành động. Under the "Lead mới 46" group, each row has two tiers. The Việc column has "Toà A · A-20.01" over "Bán". The Vì sao column has a bold "Đã gửi · nhập 13:12" over a red "Quá hạn nhận 18 giờ 36 phút". The Giá column shows "3,2 tỷ, đã bao phí". The Hành động column has one outlined «Nhận» button of equal width plus a ⋯ button on every visible row. This matches Expected for the visible rows. The screenshot cuts off before the "Cần gọi lại" and "Thiếu thông tin" groups, so I read the label mismatch for those groups from the JSON dump of the e1 line, not from the image.
  network_observed: n-a (driver)
  output: |
    Dòng e1 (54 dòng): tieuDeCot đúng [Việc, Vì sao hôm nay, Giá, Hành động]; mỗi dòng hai tầng ở cột Việc; mỗi dòng đúng một nút ngoài ⋯; nút chính viền liền, rộng 144; 49 dòng có hạn hai tầng, 5 dòng không hạn một tầng; màu quá hạn = token destructive, dưới 15 phút = token warning.
    LỆCH: nhãn nút chính theo bảng AC-3. Dòng căn «Cần gọi lại» (3 dòng) hiện «Còn · giữ giá» (đúng). Năm dòng căn «Thiếu thông tin» hiện «Đổi giá, trạng thái · Mở hồ sơ», mà AC-3 xếp việc này vào ⋯. Dòng lead «Nhận» / «Đã gọi» đúng.
    Cùng lỗi với vòng 1 của S4 (evidence-report.md vòng trước, dòng 47), chưa sửa.

- eval: E2
  run_id: minted-lam-lai-hom-nay-dau-chu-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T00:17:48Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2206.431791

- eval: E3
  run_id: minted-lam-lai-hom-nay-dau-chu-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T00:17:48Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2206.431791

- eval: E4
  run_id: minted-lam-lai-hom-nay-dau-chu-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T00:17:48Z
  screenshot: evidence/E4-step1.png
  observed: |
    E4-step1.png (truoc, 1440x900, Hôm nay cua dau chu mau 1, nen toi): tieu de «Hôm nay», 57 viec, nhom «Lead mới 49»; dong dau «Toà A · A-20.01», trang thai «Đã gửi · nhập 13:12 / Quá hạn nhận 18 giờ 38 phút», nut chinh cot Hành động = «Nhận»; cac dong khac cung nut «Nhận». E4-step2.png (sau khi bam): cung man hinh, khong co hop thoai/dialog nao; dong dau doi thanh «Đã nhận · nhập 13:12 / Quá hạn gọi 18 giờ 23 phút» va nut chinh doi thanh «Đã gọi»; cac dong con lai van «Nhận». Khop Expected: nhan mot cham, khong hop thoai, nut chinh doi sang viec ke.
  network_observed: n-a (driver)
  output: |
    Dòng e4: nutTruoc «Nhận», coHopThoai false, nutSau «Đã gọi». Lead vừa bấm đọc lại qua API lead giao: stage accepted, acceptedAt khác null.

- eval: E5
  run_id: minted-lam-lai-hom-nay-dau-chu-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T00:17:48Z
  screenshot: evidence/E5-thu-gon-1440.png
  observed: |
    E5-thu-gon-1440.png: bảng "Hôm nay · 60 việc"; đầu nhóm "Lead mới" 52 có mũi tên đóng (>) và không hiện dòng nào dưới nó; "Cần gọi lại" 3 mở với 3 dòng; "Thiếu thông tin" 5 mở với 5 dòng. E5-mo-lai-1440.png: "Lead mới" 52 mở (mũi tên xuống), các dòng căn A-20.01, chỉ biết toà... hiện dưới đầu nhóm. Khớp Expected: nhóm theo bộ nhóm, đếm đúng, thu gọn và mở lại được.
  network_observed: n-a (driver)
  output: |
    Bấm lại: 60 = số ban đầu. Mã dòng trùng giữa các nhóm = 0.

- eval: E6
  run_id: minted-lam-lai-hom-nay-dau-chu-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T00:17:48Z
  screenshot: evidence/E6-step1.png
  observed: |
    step1 (loading, request held 3s): the "Hôm nay" card has a header and a skeleton of 5 column headings and 9 grey placeholder rows. There is no real data. This matches the loading state. step2 (head of floor 2, no tasks): the card shows "0 việc" and an empty state with an inbox icon, "Hôm nay không còn việc" and a "Mở Bảng hàng" button. There is no error banner and no table. This matches the empty state. step3 (lead request returned 500): the card shows "8 việc" and a red-tinted banner "Chưa tải được lead giao cho bạn / Các nhóm căn vẫn đọc từ máy." with a "Thử lại" button. Below it is the table with the 4 column headings Việc, Vì sao hôm nay, Giá, Hành động, and the groups "Cần gọi lại 3" and "Thiếu thông tin 5" still shown. This matches the error state, with a retry button and the rest of the table kept. step4 (offline): a banner at the top reads "Đang xem bản đã tải — mất mạng / Thay đổi được giữ trên máy và gửi đi khi có mạng lại.", above the notification strip and the table (63 việc, group "Lead mới 55"). This matches the offline banner. In step3 the "Hành động" column text is cramped (for example "Đổi giá, trạng thái · Mở hồ sơ" overlaps the ⋯ button) in the Thiếu thông tin rows. This is a cosmetic point outside AC-6's four checks, noted only. All four states match the Expected.
  network_observed: n-a (driver)
  output: |
    Các khẳng định đều đạt: dangTai.coKhungCho true; trong.coLoiBangHang true; loi.coThuLai true; matMang.coDai true; coMang.coDai false (dải tắt khi có mạng lại, không tải lại trang). Ca có mạng lại không có ảnh riêng, chỉ có dòng JSON.

- eval: E7a
  run_id: minted-lam-lai-hom-nay-dau-chu-E7a-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T00:17:48Z
  output: |
    5 tệp giao diện ngoài bản đồ

- eval: E7b
  run_id: minted-lam-lai-hom-nay-dau-chu-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-05T00:00:37Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-lam-lai-hom-nay-dau-chu-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T00:17:48Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2206.431791

- eval: E9
  run_id: minted-lam-lai-hom-nay-dau-chu-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T00:17:48Z
  screenshot: evidence/E9-step1.png
  observed: |
    E9-step1.png: trang Hôm nay của đầu chủ (63 việc, nhóm Lead mới). Dòng đầu có nút «Đã gọi» (lead đã nhận), trình đơn ⋯ đang mở với ba mục: «Ghi cuộc gọi», «Trả lại · Số không liên lạc được», «Mở số». E9-step2.png: nền mờ, hộp hỏi lại «Trả lại lead này?» có dòng «Lý do: Số không liên lạc được. Lead về telesales để sửa số và gửi lại.» và hai nút «Giữ lại», «Trả lại». Khớp Expected: trả lại luôn hỏi lại, ảnh trình đơn ⋯ và hộp hỏi lại đủ. Rời hàng đợi sau xác nhận và mở hồ sơ đúng căn được dòng JSON e9 chứng, không có ảnh riêng.
  network_observed: n-a (driver)
  output: |
    Hai khung đã lưu: E9-step1.png (trình đơn ⋯), E9-step2.png (hộp hỏi lại).

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-lam-lai-hom-nay-dau-chu-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-05T00:17:48Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-lam-lai-hom-nay-dau-chu-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-05T00:17:48Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-lam-lai-hom-nay-dau-chu-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-05T00:17:48Z

- cmd: npm run test:hooks
  run_id: minted-lam-lai-hom-nay-dau-chu-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-05T00:17:48Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-lam-lai-hom-nay-dau-chu-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-05T00:17:48Z

- cmd: npm run typecheck
  run_id: minted-lam-lai-hom-nay-dau-chu-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-05T00:17:48Z

- cmd: npm run lint
  run_id: minted-lam-lai-hom-nay-dau-chu-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-05T00:17:48Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Lệnh fail không gắn eval: ui-check:E1 (gắn E1, xem khối Evidence).

Eval không phân biệt (xanh trên cả bản mới lẫn bản cũ, chứng minh khung chạy chứ chưa chứng minh tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là hàng rào hồi quy có chủ ý):
- npm test -w @quy-hang/web: E2, E3, E8
- npm test -w @quy-hang/ui-lint: E7b

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E7a failed — nút chính của dòng căn «Thiếu thông tin» sai nhãn so với AC-3, chỗ thử E1 chưa in tên cột. Returned to implementation (commit b4e2b404).
Round 2: E1 failed — bốn cột, hai tầng, nút viền và màu hạn đã đúng; E7a nay xanh; còn lại nhãn nút chính của năm dòng căn «Thiếu thông tin» là «Đổi giá, trạng thái · Mở hồ sơ» thay vì «Còn · giữ giá», việc kia phải nằm trong ⋯. Returned to implementation.

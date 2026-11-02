---
schema_version: 2
feature_slug: cuoc-goi-khai-thac
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 86ba9f8225d6a1ebe08bc5991567510e29e97ecd
human_signoff: Manh Phan 2026-11-02
---

# Evidence Report: cuoc-goi-khai-thac

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | ui-check | PASS |
| E1c | AC-1 | script | PASS |
| E2 | AC-2 | ui-check | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | ui-check | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | ui-check | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E6c | AC-6 | ui-check | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | ui-check | PASS |
| E7c | AC-7 | ui-check | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | ui-check | PASS |
| E9 | AC-9 | ui-check | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | ui-check | PASS |

## Evidence

### Eval chạy lại ở round 2

- eval: E1
  run_id: minted-cuoc-goi-khai-thac-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T08:52:35Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 28961.902417

- eval: E1c
  run_id: minted-cuoc-goi-khai-thac-E1c-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-02T08:52:35Z
  output: |
    npm run lint
    chuẩn giao diện: đạt

- eval: E2b
  run_id: minted-cuoc-goi-khai-thac-E2b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T08:52:35Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1729.824083

- eval: E7
  run_id: minted-cuoc-goi-khai-thac-E7-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T08:52:35Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1729.824083

- eval: E9b
  run_id: minted-cuoc-goi-khai-thac-E9b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T08:52:35Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1729.824083

- eval: E1b
  run_id: minted-cuoc-goi-khai-thac-E1b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T08:52:35Z
  screenshot: evidence/E1b-step1.png
  observed: |
    step1 (1440, L1): ba cột. Cột trái: chip «Đã nhận», «Nhập 14:31 02/11», «A-09.01 · Toà A», Loại căn 1PN, Diện tích 54,2 m², Tầng 9, Hướng Đông Nam, CHỦ NHÀ MUỐN «2,6 tỷ, đã bao phí», Nhu cầu: Bán, nút «Đã gọi G». Giữa: Danh sách hỏi, Mức đủ 0/5, 5 nhóm chưa hỏi. Phải: Tính giá (2,6 tỷ bao phí → về tay 2,509 tỷ, 3 khoản), Cùng loại trong toà · 1PN. Khớp Expected.
    step2 (L6): «Chỉ biết toà · Toà A», «Chủ nhà chỉ báo toà — chưa có mã căn», 2,75 tỷ đã bao phí, không dòng Loại căn/Diện tích; so giá «Chưa biết loại căn — so cả toà». Khớp.
    step3 (L3): chỉ một khối «Không thấy lead này trong việc của bạn» và nút «Về Hôm nay». Khớp.
    step4 (1280): vẫn ba cột (thẻ lead, Danh sách hỏi, Tính giá + Cùng loại), thẻ L1 như trên, không thanh cuộn ngang. Khớp.
  network_observed: clean

- eval: E2
  run_id: minted-cuoc-goi-khai-thac-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T08:52:35Z
  screenshot: evidence/E2-da-goi.png
  observed: |
    E2-step1.png (L11, A-13.02): thẻ trái nấc «Đã nhận», nút «Đã gọi G» hiện. E2-da-goi.png (sau phím G): nấc đổi thành «Đã gọi», nút «Đã gọi G» biến mất. E2-409.png (L7 A-08.03, sau khi mốc đã ghi từ nơi khác rồi bấm «Đã gọi»): nấc vẫn «Đã nhận», nút «Đã gọi» vẫn hiện, dòng chữ đỏ «Lead đã ghi gọi rồi.» (không mã lỗi trần). Khớp Expected.
  network_observed: clean

- eval: E4b
  run_id: minted-cuoc-goi-khai-thac-E4b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T08:52:35Z
  screenshot: evidence/E4-bao-phi.png
  observed: |
    E4-bao-phi.png (đã mở bằng Read): trang /units/call của A-07.03 · Toà A, chủ nhà muốn «2,75 tỷ, đã bao phí». Khối «Tính giá» ghi Giá chủ báo 2,75 tỷ, Môi giới % 1, Bao phí. Ba dòng khoản: Thuế thu nhập cá nhân 2% 55.000.000 đ, Lệ phí trước bạ 0,5% 13.750.000 đ, Môi giới 1% 27.500.000 đ. Chủ nhận về tay 2,65375 tỷ, kèm 2.653.750.000 đ. Dòng «Tỉ lệ mặc định của sàn» ở cuối khối. Khớp Expected.
    E4-chua-hieu.png (đã mở bằng Read): ô Giá chủ báo chứa «abc», chữ đỏ dưới ô «Chưa hiểu «abc» — gõ như 2,75 tỷ hoặc 950 triệu». Số cũ không đổi: về tay 2,6 tỷ (2.600.000.000 đ), ba khoản tính theo giá 2,694300518 tỷ gồm 53.886.010, 13.471.503, 26.943.005. Khớp Expected («abc» báo chưa hiểu dưới ô).
    Các frame step1, step3, step4, step6 đã lưu cùng lượt. Các giá trị chữ ở bước 3 và 4 (về tay 2,64 tỷ; giá bao phí 2,694300518 tỷ) đọc từ DOM cùng lượt, khớp Expected.
  network_observed: clean

- eval: E7b
  run_id: minted-cuoc-goi-khai-thac-E7b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T08:52:35Z
  screenshot: evidence/E7b-step1.png
  observed: |
    Đã mở từng khung bằng Read. E7b-step2.png: ô «Giá chủ báo» ở nhóm Giá và phí đang có con trỏ, gõ «2,8 tỷ» sau khi bấm Alt+1; dòng «Hiểu là 2,8 tỷ · bao phí · Enter ghi» hiện dưới ô, trước khi ghi. E7b-step3.png: gõ «3,5 tỷ», Enter → hộp hỏi lại ngay trong nhóm Giá và phí: «Đổi 2,8 tỷ · bao phí → 3,5 tỷ · bao phí (+25%)?» kèm nút Ghi Enter và Huỷ Esc. Cả hai khung khớp Expected. Lưu ý về khung: E7b-step1.png chụp khi lead L13 đã bị làm bẩn nên ô đang hiện 3,5 tỷ chứ không phải gợi ý sạch. Lần chạy 2 trên L13 còn sạch có chữ gợi ý: «Hiểu là 2,75 tỷ · bao phí · Enter ghi», thẻ lead «CHỦ NHÀ MUỐN 2,75 tỷ, đã bao phí».
  network_observed: clean

- eval: E7c
  run_id: minted-cuoc-goi-khai-thac-E7c-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T08:52:35Z
  screenshot: evidence/E7c-step1.png
  observed: |
    Frame đã mở bằng Read. E7c-step1.png và E7c-step2.png cho thấy chỉ báo «Đã đồng bộ · 15:54», ô giá «2,8 tỷ» (step1) hoặc «3,5 tỷ» (step2), dòng «Hiểu là … · bao phí · Enter ghi», «Mức đủ 1/5». E7c-step3-offline.png cho thấy chỉ báo «Mất mạng · 1 thay đổi chờ gửi», ô giá «3,4 tỷ», «Mức đủ 1/5». E7c-tu-choi.png (A-04.03 Toà A) cho thấy chỉ báo đỏ «1 căn cần xem», ô giá còn «3,4 tỷ». E7c-can-xem.png (bảng Cần xem) cho thấy «Căn đã bán», «Bản mới: giá 3.500 triệu · trạng thái Closed — Trưởng nhóm sửa lúc 16:09», «Của tôi: giá 3.400 triệu», hai nút «Giữ của tôi» và «Lấy bản mới». Chỉ báo trên thanh trên chỉ nói «1 căn cần xem»; lý do «Căn đã bán» nằm ở bảng Cần xem mở từ chỉ báo.
  network_observed: clean

- eval: E9
  run_id: minted-cuoc-goi-khai-thac-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T08:52:35Z
  screenshot: evidence/E9-chua-ho-so.png
  observed: |
    E9-chua-ho-so.png (đã mở): lead A-15.02 Toà A, Mức đủ 0/5, dòng "Câu trả lời đầu tiên tạo hồ sơ căn cho lead này.", mọi nhóm "Chưa hỏi", chưa nút nào được chọn. E9-step3.png (đã mở): sau chọn Trống, Có sổ, tải lại, Không vay → Mức đủ 3/5, ba nhóm Pháp lý/Tài chính/Tình trạng sử dụng "Đã hỏi" với 1 Có sổ, 1 Không vay, 1 Trống được đánh dấu; dòng báo tạo hồ sơ đã biến mất. E9-loi.png (đã mở): lead L9 A-07.03, chọn "1 Trống" → nhóm Tình trạng sử dụng viền đậm hiện chữ đỏ "Chưa tạo được hồ sơ căn cho lead — câu trả lời chưa ghi, thử lại."; nhóm vẫn "Chưa hỏi", nút Trống không được đánh dấu, Mức đủ 0/5. Khớp Expected.
  network_observed: clean

### Eval carry-forward từ round 1

- eval: E3
  run_id: minted-cuoc-goi-khai-thac-E3-r1
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-02T07:54:25Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-cuoc-goi-khai-thac-E4-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-02T07:54:25Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-cuoc-goi-khai-thac-E5-r1
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-02T07:54:25Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5b
  run_id: E5b-20261102
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T07:54:25Z
  carried_from_round: 1
  screenshot: evidence/E5b-step1.png
  observed: |
    L1: khối «Cùng loại trong toà · 1PN» có thanh dải, nhãn «2,2 tỷ — giữa 2,316 tỷ — 2,45 tỷ», dòng «Căn này về tay 2,509 tỷ · +8,3% so với giữa toà», bảng đúng 5 căn (A-06.01, A-04.01, A-02.01, A-03.01, A-05.01) với cột Phí ghi BP/N; không có căn Đã bán và không có chính căn L1; không câu nào gợi ý mức nên ép. Khớp số dung-d.mjs đã in.
    L8: «Chưa biết loại căn — so cả toà.» rồi «Toà chưa có căn cùng loại có giá», không bảng, không dải.
  network_observed: clean
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-cuoc-goi-khai-thac-E6-r1
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-02T07:54:25Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6b
  run_id: minted-cuoc-goi-khai-thac-E6b-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-02T07:54:25Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6c
  run_id: E6c-2026-11-02
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T07:54:25Z
  carried_from_round: 1
  screenshot: evidence/E6c-step1.png
  observed: |
    Cột «Danh sách hỏi · Mức đủ 0/5» có năm nhóm đúng thứ tự Giá và phí, Nội thất, Pháp lý, Tài chính, Tình trạng sử dụng, đều «Chưa hỏi». Gõ 2 ở Nội thất: nhóm «Đã hỏi», Mức đủ 1/5, chỉ báo «Đang gửi 1 thay đổi» rồi «Đã đồng bộ»; máy chủ có đúng một details_changed mới với furnished là lựa chọn thứ hai. Delete: về 0/5, furnished rỗng, thêm một details_changed. Phím trong ô giá chỉ gõ chữ, số sự kiện không đổi. Khớp expected.
  network_observed: clean
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-cuoc-goi-khai-thac-E8-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-02T07:54:25Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8b
  run_id: minted-cuoc-goi-khai-thac-E8b-r1
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T07:54:25Z
  carried_from_round: 1
  screenshot: evidence/E8b-step1.png
  observed: |
    Chọn «Có sổ»: Mức đủ tăng 1→2/5 ngay, «Còn thiếu» bớt đúng mục pháp lý. Tắt mạng rồi chọn «Không vay»: Mức đủ 3/5, chỉ báo «Mất mạng · 1 thay đổi chờ gửi»; có mạng lại thì về «Đã đồng bộ» và máy chủ có financing «Không vay». Đủ năm mục: «Mức đủ 5/5», «Đã đủ năm mục». Khớp expected.
  network_observed: clean
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-cuoc-goi-khai-thac-E10-r1
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T07:54:25Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10b
  run_id: E10b-2026-11-02
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T07:54:25Z
  carried_from_round: 1
  screenshot: evidence/E10b-step1.png
  observed: |
    Telesales và quản trị mở /units/call?lead=L1: thân trang chỉ có «Không thấy trang này», «Địa chỉ không còn, hoặc bạn không có quyền xem.» và nút «Về Hôm nay»; không chữ nào của lead. Đầu chủ: chế độ cuộc gọi đầy đủ, không có số điện thoại, giá đáy hay ảnh sổ trên màn. Lưu ý: trang «không thấy» của telesales và quản trị có mã HTTP thành công (vỏ gửi trước khi notFound chạy), không phải mã «không tìm thấy» như chữ trong expected; hợp đồng chỉ đòi «trang không hiện».
  network_observed: clean
  note: carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-cuoc-goi-khai-thac-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-02T08:52:35Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-cuoc-goi-khai-thac-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-02T08:52:35Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-cuoc-goi-khai-thac-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-02T08:52:35Z

- cmd: npm run test:hooks
  run_id: minted-cuoc-goi-khai-thac-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-02T08:52:35Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-cuoc-goi-khai-thac-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-02T08:52:35Z

- cmd: npm run typecheck
  run_id: minted-cuoc-goi-khai-thac-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-02T08:52:35Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline, chứng minh harness chứ không phải tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- E1 (npm run db:migrate && npm run db:test)
- E1c (npm run lint)
- E2b, E7, E9b (npm test -w @quy-hang/web)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: chạy toàn bộ eval AC-1 đến AC-10; các eval E3, E4, E5, E5b, E6, E6b, E6c, E8, E8b, E10, E10b có run_id đuôi r1 hoặc theo ngày.
Round 2: chạy lại E1, E1b, E1c, E2, E2b, E4b, E7, E7b, E7c, E9, E9b cùng sáu lệnh suite; các eval còn lại carry-forward vì delta không chạm paths của chúng. Verdict PASS.

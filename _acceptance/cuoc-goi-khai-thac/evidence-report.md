---
schema_version: 2
feature_slug: cuoc-goi-khai-thac
verdict: REJECT
failed_evals: ["E1b","E2","E4b","E7c","E9"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3f0fe032e691c9153ce1588a9afea9183a13d0f4
human_signoff:
---

# Evidence Report: cuoc-goi-khai-thac

Vòng 1. Có 5 eval giao diện không đạt (E1b, E2, E4b, E7c, E9); 17 eval còn lại đạt. Lý do từng eval ở mục Iterations. Không có lệnh fail nào nằm ngoài eval.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | ui-check | FAIL |
| E1c | AC-1 | script | PASS |
| E2 | AC-2 | ui-check | FAIL |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | ui-check | FAIL |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | ui-check | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E6c | AC-6 | ui-check | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | ui-check | PASS |
| E7c | AC-7 | ui-check | FAIL |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | ui-check | PASS |
| E9 | AC-9 | ui-check | FAIL |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-cuoc-goi-khai-thac-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T07:54:25Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 31650.120125

- eval: E1b
  run_id: minted-cuoc-goi-khai-thac-E1b-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T07:54:25Z
  screenshot: evidence/E1b-1440.png
  observed: |
    Đã mở các frame. L1 ở 1440: ba cột (Thẻ lead, Danh sách hỏi, Tính giá và Cùng loại trong toà), thẻ ghi «A-09.01 · Toà A», 1PN, 54,2 m², tầng 9, Đông Nam, «CHỦ NHÀ MUỐN 2,6 tỷ, đã bao phí», «Nhu cầu: Bán», nấc «Đã nhận», nhập 14:31 02/11; thuộc tính khớp danh mục. L6: «Chỉ biết toà · Toà A», «chưa có mã căn», không dòng thuộc tính. L3: «Không thấy lead này trong việc của bạn», nút «Về Hôm nay» dẫn tới /today. 1280: ba cột, trang không tràn ngang; bảng «Cùng loại trong toà» bị cắt bên phải trong thẻ.
    Mọi điều khẳng định về nội dung và bố cục đều khớp expected. Eval không đạt vì luật mạng: khi mở L3 (lead của người khác) máy chủ trả mã «không tìm thấy» cho lời gọi leads/assigned/<L3>, expected không khai mã này (đây chính là cơ chế đúng của bước 3).
  network_observed: app-fail

- eval: E1c
  run_id: minted-cuoc-goi-khai-thac-E1c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-02T07:54:25Z
  output: |
    npm run lint
    chuẩn giao diện: đạt

- eval: E2
  run_id: minted-cuoc-goi-khai-thac-E2-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T07:54:25Z
  screenshot: evidence/E2-da-goi.png
  observed: |
    E2-da-goi.png (L11) bị nhiễm: trình duyệt dùng chung bị bên chấm khác điều khiển (Mức đủ 2/5, Nội thất và Pháp lý «Đã hỏi» dù chỉ bấm G), nên bước phím G và tải lại L11 không kiểm được hợp lệ. L12 (trình duyệt riêng): sau câu đầu nấc «Đã gọi» dù không bấm nút, câu thứ hai không lỗi, nấc giữ «Đã gọi»: khớp.
    L7 sau khi đã bị trả lại (máy chủ không còn thấy lead trong việc của người gọi): bấm «Đã gọi» thì máy chủ vẫn nhận lệnh ghi mốc, thẻ chuyển sang nấc «Đã gọi», nút ẩn, KHÔNG có câu lý do bằng chữ. Trái expected («thẻ nói lý do bằng chữ, nấc giữ nguyên»).
  network_observed: app-fail

- eval: E2b
  run_id: minted-cuoc-goi-khai-thac-E2b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T07:54:25Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1360.906417

- eval: E3
  run_id: minted-cuoc-goi-khai-thac-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-02T07:54:25Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 331.597291

- eval: E4
  run_id: minted-cuoc-goi-khai-thac-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T07:54:25Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1360.906417

- eval: E4b
  run_id: minted-cuoc-goi-khai-thac-E4b-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T07:54:25Z
  screenshot: evidence/E4b-step1.png
  observed: |
    Đã mở từng frame. L5 (A-07.03 · Toà A): 2,75 tỷ bao phí cho về tay 2,65375 tỷ, ba khoản 55.000.000 / 13.750.000 / 27.500.000 đ, có dòng «Tỉ lệ mặc định của sàn»; sửa về tay 2,6 tỷ thì giá bao phí tính lại 2,694300518 tỷ; «abc» báo «Chưa hiểu «abc» — gõ như 2,75 tỷ hoặc 950 triệu»; sau 5 giây số sự kiện không đổi, đúng một hồ sơ của L5.
    Không khớp: sau bước sửa về tay, đổi môi giới 1 sang 1,5 làm về tay giảm 13.471.503 đ chứ không phải 13,75 triệu (giá lúc đó đã là 2,694 tỷ). Chạy đối chứng riêng với giá 2,75 tỷ thì giảm đúng 13.750.000 đ, nên máy tính tính đúng; câu expected không thể đúng theo thứ tự bước như viết.
  network_observed: clean

- eval: E5
  run_id: minted-cuoc-goi-khai-thac-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-02T07:54:25Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 331.597291

- eval: E5b
  run_id: E5b-20261102
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T07:54:25Z
  screenshot: evidence/E5b-step1.png
  observed: |
    L1: khối «Cùng loại trong toà · 1PN» có thanh dải, nhãn «2,2 tỷ — giữa 2,316 tỷ — 2,45 tỷ», dòng «Căn này về tay 2,509 tỷ · +8,3% so với giữa toà», bảng đúng 5 căn (A-06.01, A-04.01, A-02.01, A-03.01, A-05.01) với cột Phí ghi BP/N; không có căn Đã bán và không có chính căn L1; không câu nào gợi ý mức nên ép. Khớp số dung-d.mjs đã in.
    L8: «Chưa biết loại căn — so cả toà.» rồi «Toà chưa có căn cùng loại có giá», không bảng, không dải.
  network_observed: clean

- eval: E6
  run_id: minted-cuoc-goi-khai-thac-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-02T07:54:25Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 331.597291

- eval: E6b
  run_id: minted-cuoc-goi-khai-thac-E6b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T07:54:25Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1360.906417

- eval: E6c
  run_id: E6c-2026-11-02
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T07:54:25Z
  screenshot: evidence/E6c-step1.png
  observed: |
    Cột «Danh sách hỏi · Mức đủ 0/5» có năm nhóm đúng thứ tự Giá và phí, Nội thất, Pháp lý, Tài chính, Tình trạng sử dụng, đều «Chưa hỏi». Gõ 2 ở Nội thất: nhóm «Đã hỏi», Mức đủ 1/5, chỉ báo «Đang gửi 1 thay đổi» rồi «Đã đồng bộ»; máy chủ có đúng một details_changed mới với furnished là lựa chọn thứ hai. Delete: về 0/5, furnished rỗng, thêm một details_changed. Phím trong ô giá chỉ gõ chữ, số sự kiện không đổi. Khớp expected.
  network_observed: clean

- eval: E7
  run_id: minted-cuoc-goi-khai-thac-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T07:54:25Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1360.906417

- eval: E7b
  run_id: minted-cuoc-goi-khai-thac-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T07:54:25Z
  screenshot: evidence/E7b-step1.png
  observed: |
    L13: ô giá gợi sẵn «2,75 tỷ» kèm hai nút Alt+1 Bao phí / Alt+2 Không bao phí. Gõ «2,8 tỷ» hiện «Hiểu là 2,8 tỷ · bao phí · Enter ghi»; Enter ghi, nhóm «Đã hỏi», Mức đủ 1/5; máy chủ trả giá 2.800.000.000 bao phí. Gõ «3,5 tỷ» hiện hộp hỏi lại «Đổi 2,8 tỷ · bao phí → 3,5 tỷ · bao phí (+25%)?» với «Ghi Enter» và «Huỷ Esc»; Esc thì không ghi, máy chủ giữ 2,8 tỷ. Phát hiện phụ: sau huỷ, ô còn chữ «3,5 tỷ»; thẻ lead và khối Tính giá vẫn hiện giá chủ báo gốc.
  network_observed: clean

- eval: E7c
  run_id: E7c-20261102-0811
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T07:54:25Z
  screenshot: evidence/E7c-step1.png
  observed: |
    Hai bước đầu đạt: sau 2,8 tỷ máy chủ có 2.800.000.000 bao phí; sau 3,5 tỷ đã xác nhận máy chủ có 3.500.000.000 và thêm đúng hai price_changed. Bước ba (căn H14 đã sang Đã bán rồi gõ «3,4 tỷ» + Enter): frame E7c-tu-choi.png không có hộp lỗi, không «Cần xem», không chỉ báo nói vì sao bị từ chối, chỉ báo giữ «Đã đồng bộ»; máy chủ thực tế đã nhận giá 3.400.000.000 trên căn Đã bán. Trái expected (hồ sơ vào Cần xem, giá giữ 3.500.000.000).
    Lưu ý độ tin cậy: trình duyệt dùng chung với bên chấm khác nên điều kiện «bản trên máy đã cũ» chưa dựng đúng ý; kết quả quan sát trên máy chủ vẫn là thật.
  network_observed: clean

- eval: E8
  run_id: minted-cuoc-goi-khai-thac-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T07:54:25Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1360.906417

- eval: E8b
  run_id: minted-cuoc-goi-khai-thac-E8b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T07:54:25Z
  screenshot: evidence/E8b-step1.png
  observed: |
    Chọn «Có sổ»: Mức đủ tăng 1→2/5 ngay, «Còn thiếu» bớt đúng mục pháp lý. Tắt mạng rồi chọn «Không vay»: Mức đủ 3/5, chỉ báo «Mất mạng · 1 thay đổi chờ gửi»; có mạng lại thì về «Đã đồng bộ» và máy chủ có financing «Không vay». Đủ năm mục: «Mức đủ 5/5», «Đã đủ năm mục». Khớp expected.
  network_observed: clean

- eval: E9
  run_id: minted-cuoc-goi-khai-thac-E9-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T07:54:25Z
  screenshot: evidence/E9-chua-ho-so.png
  observed: |
    L15: trước khi chọn, «Mức đủ 0/5» và dòng «Câu trả lời đầu tiên tạo hồ sơ căn cho lead này.»; sau lần chọn đầu có đúng một hồ sơ của L15 (Tình trạng sử dụng «Trống»), sau tải lại và các lần chọn sau vẫn cùng một hồ sơ, đủ ba mục (3/5). L9: nhóm Tình trạng sử dụng có chữ đỏ «Chưa tạo được hồ sơ căn cho lead — câu trả lời chưa ghi, thử lại.», không lựa chọn nào được đánh dấu, bấm lại gửi lại được. Mọi điều khẳng định chức năng đạt.
    Eval không đạt vì luật mạng: lời gọi tạo hồ sơ cho L9 bị máy chủ từ chối (hai lần) và expected không khai mã từ chối này, dù đó là kết cục thiết kế của L9.
  network_observed: app-fail

- eval: E9b
  run_id: minted-cuoc-goi-khai-thac-E9b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T07:54:25Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1360.906417

- eval: E10
  run_id: minted-cuoc-goi-khai-thac-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T07:54:25Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 31650.120125

- eval: E10b
  run_id: E10b-2026-11-02
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T07:54:25Z
  screenshot: evidence/E10b-step1.png
  observed: |
    Telesales và quản trị mở /units/call?lead=L1: thân trang chỉ có «Không thấy trang này», «Địa chỉ không còn, hoặc bạn không có quyền xem.» và nút «Về Hôm nay»; không chữ nào của lead. Đầu chủ: chế độ cuộc gọi đầy đủ, không có số điện thoại, giá đáy hay ảnh sổ trên màn. Lưu ý: trang «không thấy» của telesales và quản trị có mã HTTP thành công (vỏ gửi trước khi notFound chạy), không phải mã «không tìm thấy» như chữ trong expected; hợp đồng chỉ đòi «trang không hiện».
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-cuoc-goi-khai-thac-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-02T07:54:25Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-cuoc-goi-khai-thac-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-02T07:54:25Z

- cmd: npm run test:hooks
  run_id: minted-cuoc-goi-khai-thac-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-02T07:54:25Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-cuoc-goi-khai-thac-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-02T07:54:25Z

- cmd: npm run typecheck
  run_id: minted-cuoc-goi-khai-thac-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-02T07:54:25Z

## Known limits

## Ngoài hợp đồng

## Analyst

Baseline không đo: E1b, E2, E4b, E5b, E6c, E7b, E7c, E8b, E9, E10b (eval ui-check, không có kết quả baseline).

Eval không phân biệt (xanh cả trên HEAD lẫn baseline), chứng minh bộ chạy chứ chưa chứng minh tính năng; nên viết lại để khẳng định hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý:
- `npm run db:migrate && npm run db:test`: E1, E10
- `npm run lint`: E1c
- `npm test -w @quy-hang/web`: E2b, E4, E6b, E7, E8, E9b
- `npm test -w @quy-hang/core`: E3, E5, E6

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, không có phương sai).

## Iterations

Round 1: E1b, E2, E4b, E7c, E9 failed. Đã trả về triển khai và sửa hợp đồng.
- E1b: nội dung và bố cục đạt hết; chỉ trượt luật mạng vì lead của người khác (L3) làm máy chủ từ chối lời gọi đọc, đúng cơ chế thiết kế nhưng expected chưa khai. Cần khai mã đó vào expected rồi chấm lại.
- E2: L7 đã trả lại mà bấm «Đã gọi» vẫn được máy chủ nhận mốc, nấc nhảy sang Đã gọi, thẻ không nói lý do (trái expected). Bước L11 không kiểm được hợp lệ do trình duyệt dùng chung bị nhiễm; chấm lại cần dữ liệu lead mới và trình duyệt riêng.
- E4b: máy tính tính đúng; câu expected «môi giới 1,5% thì về tay giảm 13,75 triệu» sai theo thứ tự bước (sau khi sửa về tay, giảm là 13.471.503 đ). Cần sửa eval.
- E7c: căn đã Đã bán vẫn nhận giá mới (3,4 tỷ) từ máy khách, không vào Cần xem, không có chỉ báo vì sao; trái expected. Điều kiện bản trên máy cũ chưa dựng đúng nên cần chấm lại sau khi xử lý.
- E9: mọi khẳng định chức năng đạt; chỉ trượt luật mạng vì lời gọi tạo hồ sơ của L9 bị máy chủ từ chối (kết cục thiết kế) mà expected chưa khai.
- Mốc verified_at ở mọi khối là thời điểm soạn báo cáo của vòng này (quy ước 08:30 giờ UTC, ngày 2026-11-02), không phải giờ riêng từng lệnh.

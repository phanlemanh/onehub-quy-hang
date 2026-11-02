---
schema_version: 2
feature_slug: goi-ep-gia-dot-hai
verdict: BLOCKED
failed_evals: ["E1b","E2b","E3b","E5c"]
reason: |
  Hai eval ui-check chưa chạy được vì chưa đủ điều kiện đầu vào, nên không kết luận đạt hay hỏng.
  ui-check:E6 — P4 (2b2d64ff-b32f-427a-b713-be6bcb12d612, A-21.04, Đang bán, 20 ngày) KHÔNG có ở nhóm «Nên gọi điều chỉnh giá» trên /today của dau-chu-1. Nhóm chỉ có 1 dòng là P1 (A-21.01). P4 có listAgentKey = null, còn P1 có listAgentKey và đã gắn chủ nhà; căn chưa gán đầu chủ không vào hàng việc dù quá 10 ngày. Dữ liệu dựng của dung-d.mjs chưa khớp «target» của E6. Không chạy bước 2 và 3 để không ghi owner_confirmed lên căn không đủ điều kiện. Không sửa code hay dữ liệu.
  ui-check:E8 — đối chứng dương thất bại: ở /today của dau-chu-1 (bản dev cổng 3485) nhóm «Nên gọi điều chỉnh giá» chỉ có A-21.01 (P1). P8 = A-21.08 (id 1fb15181-f48a-4a3e-8b7a-592f4a34fb52) không có trong nhóm; chuỗi A-21.08 không xuất hiện ở nhóm nào của /today. Tiền đề «P8 ở nhóm ép giá» không đúng trên dữ liệu hiện có. Cần dựng lại dữ liệu P8 (dung-d.mjs --vong) hoặc xem lại luật xếp nhóm rồi chấm lại.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1a5361905f1dafc99ec066a2e215041fc1ecb5d9
human_signoff:
---

# Evidence Report: goi-ep-gia-dot-hai

Round 1. Tổng: 4 eval hỏng (E1b, E2b, E3b, E5c), 2 eval bị chặn không chạy được (E6, E8), 14 eval đạt. Mọi lệnh hỏng đều gắn với một eval; không có lệnh hỏng nào ngoài eval.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | ui-check | FAIL |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | ui-check | FAIL |
| E3 | AC-3 | test | PASS |
| E3a | AC-3 | test | PASS |
| E3b | AC-3 | ui-check | FAIL |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | ui-check | PASS |
| E5c | AC-5 | ui-check | FAIL |
| E6 | AC-6 | ui-check | BLOCKED |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | ui-check | PASS |
| E8 | AC-8 | ui-check | BLOCKED |
| E9 | AC-9 | script | PASS |
| E9a | AC-9 | test | PASS |
| E9b | AC-9 | ui-check | PASS |
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-goi-ep-gia-dot-hai-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T16:34:30Z
  output: |
    npm test -w @quy-hang/web — duration_ms 1313.649333
    __EXIT=0

- eval: E2
  run_id: minted-goi-ep-gia-dot-hai-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T16:34:30Z
  output: |
    npm test -w @quy-hang/web — duration_ms 1313.649333
    __EXIT=0

- eval: E3a
  run_id: minted-goi-ep-gia-dot-hai-E3a-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T16:34:30Z
  output: |
    npm test -w @quy-hang/web — duration_ms 1313.649333
    __EXIT=0

- eval: E4
  run_id: minted-goi-ep-gia-dot-hai-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T16:34:30Z
  output: |
    npm test -w @quy-hang/web — duration_ms 1313.649333
    __EXIT=0

- eval: E5
  run_id: minted-goi-ep-gia-dot-hai-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T16:34:30Z
  output: |
    npm test -w @quy-hang/web — duration_ms 1313.649333
    __EXIT=0

- eval: E7
  run_id: minted-goi-ep-gia-dot-hai-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T16:34:30Z
  output: |
    npm test -w @quy-hang/web — duration_ms 1313.649333
    __EXIT=0

- eval: E9a
  run_id: minted-goi-ep-gia-dot-hai-E9a-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T16:34:30Z
  output: |
    npm test -w @quy-hang/web — duration_ms 1313.649333
    __EXIT=0

- eval: E3
  run_id: minted-goi-ep-gia-dot-hai-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T16:34:30Z
  output: |
    npm run db:migrate && npm run db:test — duration_ms 37850.078125
    __EXIT=0

- eval: E10
  run_id: minted-goi-ep-gia-dot-hai-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T16:34:30Z
  output: |
    npm run db:migrate && npm run db:test — duration_ms 37850.078125
    __EXIT=0

- eval: E9
  run_id: minted-goi-ep-gia-dot-hai-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-02T16:34:30Z
  output: |
    chuẩn giao diện: đạt
    __EXIT=0

- eval: E1b
  run_id: minted-goi-ep-gia-dot-hai-E1b-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T16:34:30Z
  screenshot: evidence/E1b-1440.png
  observed: |
    E1b-1440.png: /today khổ 1440x900, nhóm «Lead mới 8» hiện; mỗi dòng lead có nút «Ghi cuộc gọi», «Đã gọi» (hoặc «Nhận»), «Trả lại · Số không liên lạc được», «Mở số»; không nút nào nhãn «Gọi» trơn (cần cuộn mới thấy nhóm ép giá, dòng P1 đã đo bằng DOM). E1b-step1.png (= /units/call?hang=P1): đầu màn «Nên gọi ép giá» + «Đang bán», «A-21.01 · Toà A · 2,8 tỷ · không bao phí», «Lên bảng 38 ngày · đổi giá gần nhất 23 ngày trước»; rồi một cột căn giữa: Kết quả cuộc gọi (H Hạ giá, G Giữ giá, B Đã cọc / bán…, K Không nghe máy), Lịch sử trả giá (Còn · giữ giá; Hạ 2,95 tỷ → 2,8 tỷ; Lên bảng 2,95 tỷ; Tạo hồ sơ), Giá đáy 2,7 tỷ thấp hơn giá về tay hiện tại 3,6%, rồi Danh sách hỏi. E1b-khong-thay.png / step2: khối báo «Không thấy căn này trong kho của bạn» và nút «Về Hôm nay». E1b-step3.png (?lead=L1): trang Gọi khai thác, thẻ lead «CHỦ NHÀ MUỐN 2,6 tỷ, đã bao phí», nút «Đã gọi G», Danh sách hỏi Mức đủ 0/5 — chế độ khai thác vẫn mở. Tất cả khớp Expected.
  network_observed: app-fail
  output: |
    Mọi assertion giao diện đều đạt (mở màn ép giá, nhãn nút «Ghi cuộc gọi», đầu màn khớp dung-d.mjs, mã không tồn tại, ?lead= vẫn mở khai thác).
    Eval hỏng vì mạng: có 404 x4 trên GET /api/v1/listings/00000000-0000-4000-8000-000000000000, do chính bước 2 chủ động gọi mã không tồn tại; expected của E1b không khai mã 404 nên theo luật scoping là app-fail. Còn lại app-origin đều thành công; favicon.ico là tệp tĩnh, chỉ ghi chú.
    Khuyến nghị: nếu 404 của mã không tồn tại là chủ đích thì sửa expected của E1b khai mã 404 để eval này xanh.

- eval: E2b
  run_id: E2b-20261102
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T16:34:30Z
  screenshot: evidence/E2b-step1.png
  observed: |
    Frame E2b-step1.png (= E2b-lich-su.png), /units/call?hang=P1 (A-21.01), phiên dau-chu-1: đầu màn «Lên bảng 38 ngày · đổi giá gần nhất 23 ngày trước». Khối «LỊCH SỬ TRẢ GIÁ» có 4 dòng, mới nhất trên: (1) «Còn · giữ giá · đã xác nhận với chủ» · Đầu chủ · 23:28 18/10; (2) «Hạ 2,95 tỷ → 2,8 tỷ · không bao phí · đã xác nhận với chủ» · 23:28 10/10; (3) «Lên bảng 2,95 tỷ · không bao phí · đã xác nhận với chủ» · 23:28 25/09; (4) «Tạo hồ sơ» · 23:28 23/09 (không nhãn xác nhận). Khớp dãy dung-d.mjs in, có ngày giờ, điều kiện phí, nhãn xác nhận đúng dòng. Dưới có «GIÁ ĐÁY CHỦ TỪNG NÓI · NỘI BỘ 2,7 tỷ». Phần 1 ĐẠT. Frame E2b-step2.png (= E2b-mat-mang.png): sau khi bật offline và tải lại trang, toàn khung là trang lỗi của Chrome «Press space to play … ERR_INTERNET_DISCONNECTED» — không có khối lịch sử, không có ứng dụng. Mâu thuẫn Expected «mất mạng vẫn hiện bản đã kéo» ở bước tải lại. Biến thể ngoài steps (E2b-offline-khong-tai-lai.png, bật offline không tải lại): khối lịch sử còn nguyên 4 dòng và chỉ báo «Đang xem bản đã tải — mất mạng». Nguyên nhân: apps/web/public/sw.js chỉ lo push, không cache trang nên tải lại cứng khi offline không dựng được trang.
  network_observed: clean
  output: |
    Assertion 1-5 đạt (lịch sử 4 dòng đúng thứ tự, có ngày giờ, điều kiện phí, nhãn «đã xác nhận với chủ»).
    Assertion 6 hỏng: offline rồi tải lại trang thì khối lịch sử không còn (hasHist=false), trang lỗi trình duyệt.
    Assertion 7 (ngoài steps) đạt: offline không tải lại thì lịch sử còn kèm chỉ báo mất mạng.

- eval: E3b
  run_id: E3b-20261102
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T16:34:30Z
  screenshot: evidence/E3b-gia-day.png
  observed: |
    E3b-step1.png / E3b-gia-day.png (dau-chu-1, P1 A-21.01): đầu màn «Lên bảng 38 ngày · đổi giá gần nhất 23 ngày trước». Dưới «Lịch sử trả giá» có khối «GIÁ ĐÁY CHỦ TỪNG NÓI · NỘI BỘ», «2,7 tỷ», «thấp hơn giá về tay hiện tại 3,6%». Khớp Expected. E3b-step2.png (dau-chu-1, P2 A-21.02): chỉ có «Lịch sử trả giá» (2 dòng), danh sách hỏi. Không có khối giá đáy và không có chữ «Chưa ghi giá đáy». Lệch Expected. Nguyên nhân: GET /listings/<P2>/owner trả visible false và listingAgentUserId null, vì dung-d.mjs chỉ tạo dòng chủ nhà cho P1, P2 không có dòng chủ nhà. Giao diện theo kind «an» nên không dựng khối. E3b-step3.png / E3b-khac.png (dau-chu-2, P1): không có khối giá đáy, lịch sử chỉ còn 4 dòng. Khớp Expected. Lời gọi /owner của dau-chu-2 trả thành công và không có chuỗi floorPrice.
  network_observed: clean
  output: |
    Assertion 1, 2, 4, 5, 6 đạt (P1 hiện 2,7 tỷ kèm 3,6%; chỉ lời gọi /owner mang floorPrice; dau-chu-2 không có khối; localStorage và IndexedDB không chứa giá đáy).
    Assertion 3 hỏng: P2 của dau-chu-1 không hiện «Chưa ghi giá đáy». Không có khối nào vì /owner của P2 báo visible false. Fixture không có chủ nhà cho P2, hoặc giao diện thiếu nhánh «chủ nhà có nhưng chưa ghi giá». Nhánh «Chưa ghi giá đáy» có trong gia-day.ts (ca E3a) nhưng không đạt được với dữ liệu dung-d.

- eval: E5b
  run_id: E5b-20261102T1654Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T16:34:30Z
  screenshot: evidence/E5b-step1.png
  observed: |
    E5b-step1.png (1440x900): sau H, ô «Giá mới» giữ «2,72 tỷ» có tiêu điểm; dòng dưới ghi «Hiểu là 2,72 tỷ · không bao phí · trước 2,8 tỷ · −3% · Enter ghi». Tiêu đề còn A-21.03 · Toà A · 2,8 tỷ · không bao phí, lịch sử chưa đổi. Khớp Expected.
    E5b-step1b-da-gui.png: sau Enter, tiêu đề 2,72 tỷ · không bao phí, khối ghi «Đã ghi: Hạ giá 2,72 tỷ · không bao phí»; dòng lịch sử trên cùng «Hạ 2,8 tỷ → 2,72 tỷ · không bao phí · đã xác nhận với chủ». Khớp.
    E5b-hoi-lai.png: gõ «2 tỷ» ra «Hiểu là 2 tỷ · không bao phí · trước 2,72 tỷ · −26%» kèm hỏi lại có giá cũ và mới, nút Ghi (Enter) và Huỷ (Esc), không gợi ý mức nào. E5b-step3-abc.png: «abc» báo đỏ «Chưa hiểu «abc»», lịch sử không thêm dòng. Khớp.
  network_observed: clean

- eval: E5c
  run_id: E5c-20261102-run2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T16:34:30Z
  screenshot: evidence/E5c-mat-mang.png
  observed: |
    E5c-mat-mang.png: offline, màn Gọi ép giá A-22.09 (P9 vòng 2) ở chế độ hàng. Ô nhập «2,75 tỷ», dòng «Hiểu là 2,75 tỷ · không bao phí · trước 2,75 tỷ · 0% · Enter ghi», khối kết quả «Đã ghi: Hạ giá 2,75 tỷ · không bao phí». Chỉ báo góc phải trên «Mất mạng · 1 thay đổi chờ gửi»; banner đầu trang «Đang xem bản đã tải — mất mạng». Lịch sử chưa có dòng hạ giá. Khớp Expected bước 1.
    E5c-tu-choi.png: sau khi trưởng nhóm chuyển Đã bán và bật mạng lại, chỉ báo góc phải đổi thành «1 căn cần xem» (đỏ). Nhãn «Đã bán», tiêu đề «A-22.09 · Toà A · 2,75 tỷ · không bao phí», lịch sử trên cùng «Đã bán 2,75 tỷ · đã xác nhận với chủ — Trưởng nhóm». Khối kết quả VẪN hiện «Hiểu là 2,7 tỷ · … −2%» và «Đã ghi: Hạ giá 2,7 tỷ · không bao phí», không có chữ nào nói lần hạ giá bị từ chối hay vì sao. Chỉ báo «1 căn cần xem» chỉ nói số lượng, không nói lý do; lý do «Căn đã bán» chỉ nằm trong bảng Cần xem. Mâu thuẫn một phần với Expected «chỉ báo nói vì sao».
  network_observed: clean
  output: |
    Bước 1 đạt: ghi trên máy khi offline, chỉ báo «Mất mạng · 1 thay đổi chờ gửi», máy chủ chưa nhận.
    Bước 2 đạt: có mạng lại thì chỉ báo thành «Đã đồng bộ», máy chủ nhận 2750000000, đúng một sự kiện price_changed mới.
    Bước 3 phần máy chủ đạt: máy chủ từ chối lần gửi với mã 409 như mong đợi, giữ 2750000000 và Closed, hồ sơ vào Cần xem.
    Bước 3 assertion «chỉ báo nói vì sao» hỏng: frame chỉ hiện «1 căn cần xem», khối kết quả vẫn báo «Đã ghi: Hạ giá 2,7 tỷ» sau khi máy chủ từ chối (đúng rủi ro gap-probe P1: đầu chủ tưởng giá đã xuống). Chưa mở bảng Cần xem.
    Lần chạy 1 (P9 0291d6c7…) giữ ở evidence/run1/; lần chạy 2 dùng P9 d48ebd0b-3c38-433e-9339-0616f905e47b.

- eval: E6
  run_id: minted-goi-ep-gia-dot-hai-E6-r1
  exit_code: 1
  cannot_run: true
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T16:34:30Z
  screenshot: evidence/E6-step1.png
  observed: |
    E6-step1.png (/today 1440x900, dark): đầu trang có thẻ «Bật thông báo lead», khung «Hôm nay · 17 việc», nhóm «Lead mới» (8) với các dòng A-09.01, A-13.03, A-06.03… cùng nút «Ghi cuộc gọi», «Đã gọi», «Mở số». Khung hình không cuộn tới nhóm «Nên gọi điều chỉnh giá», nên việc P4 vắng mặt ở nhóm này được xác lập từ innerText của trang chứ không phải từ ảnh. innerText cho thấy nhóm này có 1 dòng là A-21.01 (P1), không có A-21.04. Mâu thuẫn với điều kiện đầu vào của E6 (P4 phải ở nhóm ép giá), nên không thể kiểm Expected «đúng một owner_confirmed mới, P4 rời nhóm».
  network_observed: n-a (driver)
  output: |
    Dừng đúng theo bước 1 (đối chứng dương không đạt). Nhóm ép giá chỉ có A-21.01. P4 (listAgentKey null, 20 ngày, Đang bán) không ở nhóm ép giá, không ở «Cần gọi lại», không ở «Thiếu thông tin». Số sự kiện owner_confirmed của P4 trước thao tác: 0.
    Đối chiếu: P1 có listAgentKey; P2 và các căn Đang bán A-21.02, 03, 04, 08 đều chưa gán đầu chủ và đều không vào nhóm.
    Bước 2 và 3 không chạy. Không có E6-giu-gia.png, không có E6-network.txt (driver CDP tự viết).

- eval: E7b
  run_id: minted-goi-ep-gia-dot-hai-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T16:34:30Z
  screenshot: evidence/E7b-step1.png
  observed: |
    E7b-step1.png: màn «Gọi ép giá» A-21.05 · Toà A · 2,8 tỷ; huy hiệu «Đang giao dịch» (thay cho «Đang bán»); khối KẾT QUẢ CUỘC GỌI có «Đã ghi: Đã cọc»; lịch sử trên cùng «Đã cọc · đã xác nhận với chủ»; chỉ báo «Đã đồng bộ». E7b-thieu-gia.png: A-21.06 huy hiệu «Đang bán»; đã chọn «Sàn mình bán», ô «Giá chốt, vd 2,75 tỷ» rỗng + ô ngày 02/11/2026; dòng chữ đỏ «Cần giá chốt»; lịch sử chưa đổi. E7b-step2.png: ô giá chốt «2,75 tỷ», huy hiệu «Đã bán», «Đã ghi: Sàn mình bán», lịch sử «Đã bán 2,75 tỷ · đã xác nhận với chủ». E7b-step3.png: A-21.07 huy hiệu «Ngừng hẳn», «Đã ghi: Chủ bán nơi khác», lịch sử «Ngừng hẳn — chủ bán nơi khác». Tất cả khớp Expected.
  network_observed: clean

- eval: E8
  run_id: minted-goi-ep-gia-dot-hai-E8-r1
  exit_code: 1
  cannot_run: true
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T16:34:30Z
  screenshot: evidence/E8-step1.png
  observed: |
    E8-step1.png (/today, 1440x900): sidebar «HÔM NAY» có 5 nhóm (Lead mới, Nên gọi điều chỉnh giá, Cần gọi lại, Thiếu thông tin, Mới đổi). Phần chính hiện «Hôm nay · 17 việc», nhóm «Lead mới» (8) với các dòng A-09.01, A-13.03, A-06.03... đều có nút «Ghi cuộc gọi». Nhóm «Nên gọi điều chỉnh giá» nằm dưới, ngoài khung nhìn; text DOM cho thấy nhóm chỉ có A-21.01 và không có A-21.08, nên mâu thuẫn với tiền đề của E8. E8-step2-truoc-K.png: màn «Gọi ép giá» của A-21.08 · Toà A · 2,8 tỷ · không bao phí, badge «Nên gọi ép giá» + «Đang bán», «Lên bảng 20 ngày · chưa đổi giá lần nào», bốn nút kết quả H/G/B/K, K = «Không nghe máy». E8-step2.png (sau K): đã về /today, giao diện giống step1. E8-step3.png (sau 5 giây rồi mở lại /today): giống step1, nhóm ép giá vẫn không có P8.
  network_observed: clean
  output: |
    Bước 1 không đạt đối chứng dương: P8 (A-21.08) không ở nhóm «Nên gọi điều chỉnh giá» (nhóm chỉ có A-21.01). GET P8: version 4, 4 sự kiện (created, price_changed, details_changed, status_changed), Đang bán, lastConfirmedAt 2026-10-13T16:28:50Z.
    Bước 2 chạy để lấy dữ liệu tham khảo: mở /units/call?hang=P8 dựng được; phím K đưa về /today.
    Bước 3: sau 5 giây version và số sự kiện không đổi, thân JSON và text /today giống hệt bước 1. Các quan sát phụ phù hợp AC-8 nhưng không có giá trị chấm vì đối chứng dương không đạt.

- eval: E9b
  run_id: minted-goi-ep-gia-dot-hai-E9b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T16:34:30Z
  screenshot: evidence/E9b-ep-gia-1440.png
  observed: |
    E9b-ep-gia-1440.png: breadcrumb Hom nay > Goi ep gia; mot cot giua; dau man (nhan Nen goi ep gia, Dang ban, «A-21.01 · Toa A · 2,8 ty · khong bao phi», «Len bang 38 ngay · doi gia gan nhat 23 ngay truoc») roi KET QUA CUOC GOI (H Ha gia, G Giu gia, B Da coc/ban, K Khong nghe may) roi LICH SU TRA GIA (4 moc, moi nhat tren) roi GIA DAY CHU TUNG NOI 2,7 ty thap hon 3,6% roi Danh sach hoi (Muc du 3/5) — khop expected. E9b-khai-thac-1440.png: man bi cuon xuong, thay phan duoi the lead (Dien tich 54,2 m2, Tang 9, Huong Dong Nam, CHU NHA MUON 2,6 ty da bao phi, nut Da goi) roi Danh sach hoi (Muc du 0/5, 5 nhom hoi), cung cot giua; DOM xac nhan tiep Tinh gia roi Cung loai trong toa — khop. E9b-375.png: mot cot, dau man, Ket qua cuoc goi, Lich su tra gia, khong cuon ngang, thanh dieu huong day Hom nay/Bang hang/Toi — khop.
  network_observed: n-a (driver)
  output: |
    375: scrollWidth bằng innerWidth, các thẻ cùng lề trái 20 rộng 335, một cột: đạt.
    Cả hai màn có data-bo-cuc="ho-so"; cột nội dung ở 1440 lệch trái 480 rộng 736 (tâm khoảng 848, giữa vùng sau cột trái), đầu màn nằm trên cùng: đạt.
    Lưu ý: frame khai thác 1440 bị trang tự cuộn xuống, thứ tự lấy từ DOM.

- eval: E10b
  run_id: E10b-2026-11-02-dayD-3485
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T16:34:30Z
  screenshot: evidence/E10b-telesales.png
  observed: |
    Đã mở từng frame bằng Read. E10b-step1.png (= E10b-telesales.png, telesales, 1440x900): thanh trên [Mẫu] Sàn thử + Hôm nay + Lead, giữa trang chỉ có biểu tượng kính lúp, tiêu đề «Không thấy trang này», dòng «Địa chỉ không còn, hoặc bạn không có quyền xem.», nút «Về Hôm nay»; không có đầu màn căn, không có kết quả cuộc gọi. E10b-step2.png (quan-tri): cùng trang «Không thấy trang này», trong vỏ có thanh bên trái. E10b-step3.png (truong-nhom): cùng «Không thấy trang này» trong vỏ đầy đủ; không có nội dung cuộc gọi. E10b-step4.png (dau-chu-1): trang Gọi ép giá thật: huy hiệu «Nên gọi ép giá», «Đang bán», «A-21.01 · Toà A · 2,8 tỷ · không bao phí», «Lên bảng 38 ngày · đổi giá gần nhất 23 ngày trước», KẾT QUẢ CUỘC GỌI (H/G/B/K), LỊCH SỬ TRẢ GIÁ (4 mốc), «Giá đáy chủ từng nói · nội bộ 2,7 tỷ», «Danh sách hỏi». Màn đầu chủ không hiện số điện thoại hay ảnh sổ. Khớp Expected về nội dung hiển thị.
  network_observed: clean
  output: |
    Ghi chú cho người duyệt: tài liệu của 3 vai bị chặn trả trạng thái HTTP thành công của luồng Next (notFound() ném sau khi vỏ đã gửi), nhưng HTML mang marker NEXT_HTTP_ERROR_FALLBACK;404 và meta robots noindex; người dùng thấy đúng trang «không thấy». Hiểu «404» của Expected là trang không-thấy của app.
    dau-chu-1: 7 lời gọi /api/v1, tất cả thành công; ownerPhone, titleDeed, 0900 không có ở mọi thân và DOM; floorPrice chỉ có ở 2 lời gọi /owner, không có ở listings và catalog.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-goi-ep-gia-dot-hai-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-02T16:34:30Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-goi-ep-gia-dot-hai-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-02T16:34:30Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-goi-ep-gia-dot-hai-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-02T16:34:30Z

- cmd: npm run test:hooks
  run_id: minted-goi-ep-gia-dot-hai-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-02T16:34:30Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-goi-ep-gia-dot-hai-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-02T16:34:30Z

- cmd: npm run typecheck
  run_id: minted-goi-ep-gia-dot-hai-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-02T16:34:30Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả code mới lẫn code cũ diffBase — chứng minh bộ chạy, không chứng minh tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là lớp chắn hồi quy có chủ ý):
- npm test -w @quy-hang/web: E1, E2, E3a, E4, E5, E7, E9a
- npm run lint: E9

Baseline không đo: các eval ui-check (E1b, E2b, E3b, E5b, E5c, E6, E7b, E8, E9b, E10b) mang baseline n-a — chạy giao diện trên dãy D không có bản diffBase tương ứng.

Judge panels: không có eval dạng judgment nào trong hợp đồng này, nên không có panel và không có mục cần human_override.

## Variance

none — mọi eval chỉ chạy một lần, tất định; không có eval nhiều lượt.

## Iterations

Round 1: E1b, E2b, E3b, E5c hỏng; E6, E8 bị chặn vì dữ liệu dựng chưa khớp tiền đề. E1b: 404 chủ đích của mã không tồn tại bị tính app-fail vì expected không khai. E2b: tải lại khi offline không dựng được trang (sw.js không cache trang). E3b: căn P2 không có dòng chủ nhà nên không có khối «Chưa ghi giá đáy». E5c: chỉ báo chỉ nói «1 căn cần xem», không nói vì sao, và khối kết quả vẫn báo «Đã ghi». E6, E8: P4 và P8 chưa gán đầu chủ nên không vào nhóm ép giá. Trả về triển khai.

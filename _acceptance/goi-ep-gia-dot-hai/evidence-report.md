---
schema_version: 2
feature_slug: goi-ep-gia-dot-hai
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a56984665127916a78c90aeab45555b845053465
human_signoff:
---

# Evidence Report: goi-ep-gia-dot-hai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | ui-check | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | ui-check | PASS |
| E3 | AC-3 | test | PASS |
| E3a | AC-3 | test | PASS |
| E3b | AC-3 | ui-check | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | ui-check | PASS |
| E5c | AC-5 | ui-check | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | ui-check | PASS |
| E8 | AC-8 | ui-check | PASS |
| E9 | AC-9 | script | PASS |
| E9a | AC-9 | test | PASS |
| E9b | AC-9 | ui-check | PASS |
| E10 | AC-10 | test | PASS (carry-forward từ round 2) |
| E10b | AC-10 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-goi-ep-gia-dot-hai-E1-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T18:08:19Z
  output: |
    npm test -w @quy-hang/web: ca «ép giá: đầu màn» có mặt và ok
    ℹ duration_ms 1299.660334

- eval: E2
  run_id: minted-goi-ep-gia-dot-hai-E2-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T18:08:19Z
  output: |
    npm test -w @quy-hang/web: ca «lịch sử trả giá: ma trận sự kiện» có mặt và ok
    ℹ duration_ms 1299.660334

- eval: E3a
  run_id: minted-goi-ep-gia-dot-hai-E3a-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T18:08:19Z
  output: |
    npm test -w @quy-hang/web: ca «giá đáy: khối theo trả lời» có mặt và ok
    ℹ duration_ms 1299.660334

- eval: E4
  run_id: minted-goi-ep-gia-dot-hai-E4-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T18:08:19Z
  output: |
    npm test -w @quy-hang/web: ca «kết quả gọi: phím» có mặt và ok
    ℹ duration_ms 1299.660334

- eval: E5
  run_id: minted-goi-ep-gia-dot-hai-E5-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T18:08:19Z
  output: |
    npm test -w @quy-hang/web: ca «hạ giá: luật sửa giá» có mặt và ok
    ℹ duration_ms 1299.660334

- eval: E7
  run_id: minted-goi-ep-gia-dot-hai-E7-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T18:08:19Z
  output: |
    npm test -w @quy-hang/web: ca «đã cọc / bán: ba lối» có mặt và ok
    ℹ duration_ms 1299.660334

- eval: E9a
  run_id: minted-goi-ep-gia-dot-hai-E9a-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T18:08:19Z
  output: |
    npm test -w @quy-hang/web: mọi ca của hàng 28 trong units/call/*.test.ts có mặt và ok
    ℹ duration_ms 1299.660334

- eval: E3
  run_id: minted-goi-ep-gia-dot-hai-E3-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T18:08:19Z
  output: |
    npm run db:migrate && npm run db:test: ca «chủ nhà: giá đáy theo người xem» có mặt và ok
    ℹ duration_ms 38486.218458

- eval: E9
  run_id: minted-goi-ep-gia-dot-hai-E9-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint
  verified_at: 2026-11-02T18:08:19Z
  output: |
    npm run lint
    chuẩn giao diện: đạt

- eval: E10
  run_id: minted-goi-ep-gia-dot-hai-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T17:11:08Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E1b
  run_id: minted-goi-ep-gia-dot-hai-E1b-r6
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-02T18:08:19Z
  screenshot: evidence/E1b-1440.png
  observed: |
    E1b-1440.png (Hôm nay 1440x900, cuộn): cột trái Lead mới/Nên gọi điều chỉnh giá/Cần gọi lại/Thiếu thông tin/Mới đổi; danh sách các dòng căn Toà A, dòng A-21.01 · Toà A «Giá giữ 16 ngày · 2,80 tỷ · Không bao phí» với ba nút «Ghi cuộc gọi», «Còn · giữ giá», «Đổi giá, trạng thái…»; mọi dòng khác cùng ba nút, không nút nhãn «Gọi». E1b-step1.png: /units/call?hang=P1, nhãn nhóm «Nên gọi điều chỉnh giá» + «Đang bán», «A-21.01 · Toà A · 2,8 tỷ · không bao phí», «Lên bảng 38 ngày · đổi giá gần nhất 23 ngày trước», khối KẾT QUẢ CUỘC GỌI (Hạ giá/Giữ giá/Đã cọc / bán…/Không nghe máy), LỊCH SỬ TRẢ GIÁ 4 dòng (Còn · giữ giá; Hạ 2,95 tỷ → 2,8 tỷ; Lên bảng 2,95 tỷ; Tạo hồ sơ), giá đáy 2,7 tỷ thấp hơn 3,6%. E1b-khong-thay.png (=step2): ô báo «Không thấy căn này trong kho của bạn» và nút «Về Hôm nay», trang trống còn lại. E1b-step3.png: chế độ khai thác lead L1 — «CHỦ NHÀ MUỐN 2,6 tỷ, đã bao phí», «Nhu cầu: Bán», nút «Đã gọi G», khối «Quay số trên điện thoại», «Danh sách hỏi Mức đủ 0/5», ô Giá và phí «2,6 tỷ». Tất cả khớp Expected.
  network_observed: clean

- eval: E2b
  run_id: minted-goi-ep-gia-dot-hai-E2b-r6
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-02T18:08:19Z
  screenshot: evidence/E2b-step1.png
  observed: |
    E2b-step1.png (online, 1440x1000, da doc): dau man «Nen goi dieu chinh gia · Dang ban», «A-28.01 · Toa A · 2,8 ty · khong bao phi», «Len bang 38 ngay · doi gia gan nhat 23 ngay truoc»; khoi «LICH SU TRA GIA» dong theo thu tu moi nhat tren: «Con · giu gia · da xac nhan voi chu — Dau chu · 01:07 19/10», «Ha 2,95 ty -> 2,8 ty · khong bao phi · da xac nhan voi chu — Dau chu · 01:07 11/10», «Len bang 2,95 ty · khong bao phi · da xac nhan voi chu — 01:07 26/09», «Tao ho so — 01:07 24/09»; ben duoi «GIA DAY CHU TUNG NOI · NOI BO 2,7 ty». Chi bao dong bo «Da dong bo». Khop dung-d.mjs. E2b-step2.png (offline, khong tai lai, da doc): chi bao tren cung «Mat mang · dang xem ban tren may», banner «Dang xem ban da tai — mat mang / Thay doi duoc giu tren may va gui di khi co mang lai.»; khoi «LICH SU TRA GIA» van hien du 4 dong y het frame online (cung ngay gio, nhan da xac nhan voi chu). E2b-lich-su.png va E2b-mat-mang.png la ban trung cua hai frame tren.
  network_observed: clean

- eval: E3b
  run_id: minted-goi-ep-gia-dot-hai-E3b-r6
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-02T18:08:19Z
  screenshot: evidence/E3b-step1.png
  observed: |
    E3b-step1.png (dau-chu-1, P1 A-29.01): đầu màn «A-29.01 · Toà A · 2,8 tỷ · không bao phí», lịch sử trả giá 4 dòng, dưới có khối «GIÁ ĐÁY CHỦ TỪNG NÓI · NỘI BỘ» «2,7 tỷ» và «thấp hơn giá về tay hiện tại 3,6%» — khớp expected. E3b-step2.png (dau-chu-1, P2 A-29.02): khối cùng nhãn với «Chưa ghi giá đáy» — khớp. E3b-step3.png (dau-chu-2, P1): đầu màn A-29.01 cùng lịch sử trả giá, rồi chuyển thẳng sang «Danh sách hỏi», không có khối giá đáy — khớp. E3b-gia-day.png và E3b-khac.png là bản chụp trùng step1 và step3.
  network_observed: unscoped-partial

- eval: E5b
  run_id: E5b-vong8-P3-bcf205c0
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-02T18:08:19Z
  screenshot: evidence/E5b-step1.png
  observed: |
    E5b-step1.png: căn A-28.03 Toà A 2,8 tỷ không bao phí, chưa đổi giá lần nào. Ô Hạ giá chứa «2,72 tỷ», dòng «Hiểu là 2,72 tỷ · không bao phí · trước 2,8 tỷ · −3% · Enter ghi». Khớp expected. E5b-step1b-da-gui.png: đầu màn «2,72 tỷ · không bao phí», khung «Đã ghi: Hạ giá 2,72 tỷ · không bao phí», lịch sử có dòng «Hạ 2,8 tỷ → 2,72 tỷ · đã xác nhận với chủ», thanh trên «Đã đồng bộ · 01:10». E5b-hoi-lai.png (mở lại trang, H, «2 tỷ», Enter): «Hiểu là 2 tỷ · không bao phí · trước 2,72 tỷ · −26%» và hỏi «Đổi 2,72 tỷ · không bao phí → 2 tỷ · không bao phí (−26%)?» với nút Ghi Enter / Huỷ Esc. Khớp expected. E5b-step2-esc.png: khung hỏi lại biến mất, không có «Đã ghi», giá đầu màn vẫn 2,72 tỷ, lịch sử không thêm dòng. E5b-step3-abc.png (tải lại trang, H, «abc», Enter): chữ đỏ «Chưa hiểu «abc» — gõ như 2,75 tỷ hoặc 950 triệu», giá đầu màn 2,72 tỷ, lịch sử không thêm dòng. Không frame nào có chữ gợi ý mức nên hạ (chữ «gõ như 2,75 tỷ hoặc 950 triệu» là ví dụ cú pháp nhập, không phải khuyên mức hạ).
  network_observed: unscoped-partial

- eval: E5c
  run_id: E5c-r8-P9-c8d9021f
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-02T18:08:19Z
  screenshot: evidence/E5c-mat-mang.png
  observed: |
    E5c-mat-mang.png (đã đọc): màn ép giá hồ sơ A-28.09 · Toà A; chỉ báo đầu trang «Mất mạng · 1 thay đổi chờ gửi» (biểu tượng mất sóng); băng «Đang xem bản đã tải — mất mạng / Thay đổi được giữ trên máy và gửi đi khi có mạng lại»; tiêu đề căn đã đổi sang 2,75 tỷ · không bao phí; ô giá «2,75 tỷ», dòng hiểu «Hiểu là 2,75 tỷ · không bao phí … Enter ghi»; khối kết quả «Đã ghi: Hạ giá 2,75 tỷ · không bao phí» (ghi trên máy); lịch sử chưa có dòng hạ giá mới (chưa lên máy chủ). Khớp expected phần mất mạng. E5c-tu-choi.png (đã đọc): chỉ báo đầu trang «1 căn cần xem» (đỏ); thẻ trạng thái «Đã bán»; khối kết quả KHÔNG còn «Đã ghi» mà hiện «Lần ghi chưa lên máy chủ: căn đã bán / Thao tác của bạn đang chờ ở «Cần xem» — chọn giữ hay bỏ ở đó.» + nút «Mở Cần xem»; lịch sử có «Đã bán 2,75 tỷ · Trưởng nhóm» trên «Hạ 2,8 tỷ → 2,75 tỷ · Đầu chủ». Khớp expected phần từ chối. Các frame phụ E5c-step0-online/step1/step2/step3/step3a/step3b chưa Read từng tệp nhưng nội dung đã đối chiếu qua text DOM cùng lượt.
  network_observed: clean

- eval: E6
  run_id: minted-goi-ep-gia-dot-hai-E6-r6
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-02T18:08:19Z
  screenshot: evidence/E6-giu-gia.png
  observed: |
    E6-giu-gia.png: màn Gọi ép giá, đầu màn «A-28.04 · Toà A · 2,8 tỷ · không bao phí», nhãn «Nên gọi điều chỉnh giá» + «Đang bán»; trong KẾT QUẢ CUỘC GỌI «G Giữ giá» được chọn, dòng «Ghi «Còn · giữ giá» — tính là vừa xác nhận với chủ nhà.» và nút Ghi Enter, chưa có «Đã ghi». E6-step2-sau-gui.png: sau Enter hiện «Đã ghi: Còn · giữ giá», chỉ báo «Đã đồng bộ · 01:10», lịch sử có dòng mới trên cùng «Còn · giữ giá · đã xác nhận với chủ · 01:10 03/11». E6-step1.png (/today trước, 72 việc): khung nhìn đầu trang chỉ thấy nhóm Lead mới, nhóm ép giá nằm dưới màn nên P4 không thấy trong ảnh; bằng chứng P4 có ở Hôm nay là DOM (link hang=P4 có 1) và căn cùng bộ P5 nằm dưới tiêu đề «Nên gọi điều chỉnh giá» (42). E6-step3.png (/today sau, 71 việc): giảm một việc, link hang=P4 còn 0. Khớp Expected.
  network_observed: n-a (driver)

- eval: E7b
  run_id: E7b-v9-20261103-0113
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-02T18:08:19Z
  screenshot: evidence/E7b-step1.png
  observed: |
    Đã mở và đọc: E7b-step1.png (P5 = A-27.05 trong bản dựng v9 là A-29.05): đầu màn "A-29.05 · Toà A · 2,8 tỷ · không bao phí", nhãn "Đang bán"; khối KẾT QUẢ CUỘC GỌI có "B Đã cọc / bán…" đang mở, hàng con "1 Đã cọc" được chọn (viền sáng), nút "Ghi Enter" hiện, chưa có chữ "Đã ghi". E7b-thieu-gia.png (P6 = A-29.06): B+2 đã chọn "2 Sàn mình bán", hiện ô "Giá chốt, vd 2,75 tỷ" (rỗng, có focus) và ô ngày 03/11/2026, chữ đỏ "Cần giá chốt" dưới nút Ghi, chưa "Đã ghi", nhãn vẫn "Đang bán". E7b-step2.png: ô giá "2,75 tỷ", thông báo "Đã ghi: Sàn mình bán", nhãn đầu màn đổi "Đã bán", lịch sử có dòng mới "Đã bán 2,75 tỷ · đã xác nhận với chủ" 01:13 03/11. E7b-step3.png (P7 = A-29.07): "Đã ghi: Chủ bán nơi khác", nhãn "Ngừng hẳn", lịch sử "Ngừng hẳn — chủ bán nơi khác · đã xác nhận với chủ" 01:13 03/11. Khớp Expected.
  network_observed: clean

- eval: E8
  run_id: minted-goi-ep-gia-dot-hai-E8-r6
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-02T18:08:19Z
  screenshot: evidence/E8-step1.png
  observed: |
    E8-step1.png (/today?nhom=price_adjustment, trước K): màn Hôm nay tối, mục «Nên gọi điều chỉnh giá» đang chọn ở thanh trái; danh sách có dòng «A-28.08 · Toà A», «Giá giữ 20 ngày», «2,80 tỷ · Không bao phí», nút «Ghi cuộc gọi» và «Còn · giữ giá», «Đối giá, trạng thái…» — khớp P8 và nằm trong nhóm ép giá. E8-step3.png (/today sau K): cùng nhóm, dòng «A-28.08 · Toà A · Giá giữ 20 ngày · 2,80 tỷ · Không bao phí» vẫn còn với «Ghi cuộc gọi» / «Còn · giữ giá» — P8 vẫn ở nhóm ép giá. E8-step2.txt (bước K, Chrome riêng, không có khung ảnh): các dòng URL đều /today, trạng thái không đổi.
  network_observed: n-a (driver)

- eval: E9b
  run_id: minted-goi-ep-gia-dot-hai-E9b-r6
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-02T18:08:19Z
  screenshot: evidence/E9b-step1.png
  observed: |
    E9b-ep-gia-1440.png (1440 rộng, chụp cao 3000): thanh trên cùng, thanh bên trái, một cột giữa trong khung. Từ trên xuống: breadcrumb «Hôm nay › Gọi ép giá»; đầu màn có nhãn «Nên gọi điều chỉnh giá», «Đang bán», tiêu đề «A-21.01 · Toà A · 2,8 tỷ · không bao phí», «Lên bảng 38 ngày · đổi giá gần nhất 23 ngày trước»; KẾT QUẢ CUỘC GỌI (Hạ giá/Giữ giá/Đã cọc-bán/Không nghe máy); LỊCH SỬ TRẢ GIÁ (4 dòng: Còn·giữ giá, Hạ 2,95→2,8 tỷ, Lên bảng 2,95 tỷ, Tạo hồ sơ) ngay sau đó GIÁ ĐÁY CHỦ TỪNG NÓI · NỘI BỘ 2,7 tỷ; Danh sách hỏi (Mức đủ 3/5); Tính giá; Cùng loại trong toà (bảng so giá). Khớp expected.
    E9b-khai-thac-1440.png: breadcrumb «Hôm nay › Gọi khai thác»; thẻ lead (Đã nhận, A-09.01 · Toà A, 1PN, 54,2 m², chủ nhà muốn 2,6 tỷ đã bao phí, nút Đã gọi); khối nhỏ «Quay số trên điện thoại»; Danh sách hỏi (Mức đủ 0/5); Tính giá; Cùng loại trong toà · 1PN. Khớp thứ tự expected, một cột căn giữa.
    E9b-375.png: một cột tràn rộng 375, header «Cân call»/tiêu đề di động, thứ tự: đầu màn → Kết quả cuộc gọi → Lịch sử trả giá + Giá đáy → Danh sách hỏi → Tính giá → Cùng loại; không thấy cuộn ngang trang. Khớp expected.
  network_observed: n-a (driver)

- eval: E10b
  run_id: E10b-r6-2026-11-03-dayD-3485
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-02T18:08:19Z
  screenshot: evidence/E10b-step1.png
  observed: |
    Cả 4 frame đã mở bằng Read. step1 và E10b-telesales.png (telesales, giống hệt): vỏ chỉ có «[Mẫu] Sàn thử», «Hôm nay», «+ Lead», «Đã đồng bộ · 01:09», avatar TE. Thân trang là màn «Không thấy trang này / Địa chỉ không còn, hoặc bạn không có quyền xem.» kèm nút «Về Hôm nay», không có nội dung căn nào. step2 (quan-tri): vỏ có rail trái và avatar QU, cùng màn «Không thấy trang này». step3 (truong-nhom): vỏ đầy đủ có cột «Góc nhìn của đội/của tôi», ô tìm «Gõ mã căn…», avatar TR, thân trang vẫn là «Không thấy trang này». step4 (dau-chu-1, avatar DA): trang Gọi ép giá của căn A-29.01 hiện đủ, gồm thẻ «Nên gọi điều chỉnh giá / Đang bán», «Kết quả cuộc gọi» (Hạ giá, Giữ giá, Đã cọc/bán…, Không nghe máy), «Lịch sử trả giá» và khối «Giá đáy chủ từng nói · nội bộ 2,7 tỷ». Không thấy số điện thoại chủ hay ảnh sổ ở bất kỳ frame nào. Khớp Expected. Lưu ý: ba vai bị chặn nhận màn «Không thấy trang này» trong vỏ app, trạng thái tài liệu HTTP là 200 chứ không phải 404 thật; các vòng 1 đến 5 đã chấp nhận hiện tượng này (màn không-thấy là hiển thị 404 của app).
  network_observed: unscoped-partial

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-goi-ep-gia-dot-hai-SUITE-npm_test_w_quy_hang_core-r6
  exit_code: 0
  verified_at: 2026-11-02T18:08:19Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-goi-ep-gia-dot-hai-SUITE-npm_test_w_quy_hang_api-r6
  exit_code: 0
  verified_at: 2026-11-02T18:08:19Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-goi-ep-gia-dot-hai-SUITE-npm_test_w_quy_hang_connect-r6
  exit_code: 0
  verified_at: 2026-11-02T18:08:19Z

- cmd: npm run test:hooks
  run_id: minted-goi-ep-gia-dot-hai-SUITE-test_hooks-r6
  exit_code: 0
  verified_at: 2026-11-02T18:08:19Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-goi-ep-gia-dot-hai-SUITE-npm_test_w_quy_hang_ui_lint-r6
  exit_code: 0
  verified_at: 2026-11-02T18:08:19Z

- cmd: npm run typecheck
  run_id: minted-goi-ep-gia-dot-hai-SUITE-typecheck-r6
  exit_code: 0
  verified_at: 2026-11-02T18:08:19Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 5 — baseline khong do lai round nay

none — khong co eval nao duoc liet ke la khong-phan-biet (baseline round nay khong do lai; moi eval ghi baseline n-a).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 4: E8 REJECT do trình duyệt dùng chung; sửa thước, bước K chạy trên Chrome riêng.
Round 5: PASS; hợp đồng đã chấm.
Round 6: PASS sau gộp main (hàng 30 quay số); E10 carry-forward từ round 2, các eval còn lại chạy lại trên bản gộp.

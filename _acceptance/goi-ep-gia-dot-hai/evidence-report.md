---
schema_version: 2
feature_slug: goi-ep-gia-dot-hai
verdict: REJECT
failed_evals: ["E8"]
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3a641ba0e0bb43d309efb7fcda38edeaa3129b32
human_signoff:
---

# Evidence Report: goi-ep-gia-dot-hai

Round 4. Một eval chưa đạt: E8 (AC-8). Sau phím K trên màn gọi ép giá, trang sang căn kế tiếp trong hàng đợi ép giá thay vì về Hôm nay.

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
| E8 | AC-8 | ui-check | FAIL |
| E9 | AC-9 | script | PASS |
| E9a | AC-9 | test | PASS |
| E9b | AC-9 | ui-check | PASS |
| E10 | AC-10 | test | PASS (carry-forward từ round 2) |
| E10b | AC-10 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-goi-ep-gia-dot-hai-E1-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T17:46:07Z
  output: |
    npm test -w @quy-hang/web chạy một lượt, xanh; ca «ép giá: đầu màn» có mặt và ok.
    ℹ duration_ms 1062.929125

- eval: E1b
  run_id: minted-goi-ep-gia-dot-hai-E1b-r4
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-02T17:46:07Z
  screenshot: evidence/E1b-1440.png
  observed: |
    E1b-1440.png (da Read): /today khuon 1440x900, cuon toi nhom «Nen goi dieu chinh gia» (huy hieu 29); dong A-26.01 · Toa A, «Gia giu 15 ngay», «2,80 ty · Khong bao phi», nut «Ghi cuoc goi», «Con · giu gia», «Doi gia, trang thai…»; cac dong lead phia tren co «Ghi cuoc goi», «Da goi», «Tra lai · So khong lien lac duoc», «Mo so». E1b-step1.png: chi tiet Goi ep gia, chip «Nen goi dieu chinh gia», «Dang ban», tieu de «A-26.01 · Toa A · 2,8 ty · khong bao phi», dong phu «Len bang 38 ngay · doi gia gan nhat 23 ngay truoc»; khoi «KET QUA CUOC GOI» H/G/B/K; «LICH SU TRA GIA» 4 dong (Con · giu gia, Ha 2,95 ty → 2,8 ty, Len bang 2,95 ty, Tao ho so); «GIA DAY CHU TUNG NOI · NOI BO 2,7 ty». E1b-khong-thay.png (= step2): khoi bao «Khong thay can nay trong kho cua ban» va nut «Ve Hom nay». E1b-step3.png: Goi khai thac cua lead L1 (the A-09.01 · Toa A, «Da nhan», chu nha muon 2,6 ty da bao phi, «Da goi G», Danh sach hoi 0/5). Tat ca khop Expected.
  network_observed: clean

- eval: E2
  run_id: minted-goi-ep-gia-dot-hai-E2-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T17:46:07Z
  output: |
    npm test -w @quy-hang/web xanh; ca «lịch sử trả giá: ma trận sự kiện» có mặt và ok.

- eval: E2b
  run_id: E2b-20261103-0047
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-02T17:46:07Z
  screenshot: evidence/E2b-step1.png
  observed: |
    Frame E2b-step1.png (online, /units/call?hang=P1, P1 = A-26.01 từ dung-d lượt 6): khối «LỊCH SỬ TRẢ GIÁ» có 4 dòng, mới nhất ở trên, mỗi dòng có người và ngày giờ. (1) «Còn · giữ giá · đã xác nhận với chủ», Đầu chủ · 00:44 19/10. (2) «Hạ 2,95 tỷ → 2,8 tỷ · không bao phí · đã xác nhận với chủ», 00:44 11/10. (3) «Lên bảng 2,95 tỷ · không bao phí · đã xác nhận với chủ», 00:44 26/09. (4) «Tạo hồ sơ», 00:44 24/09, không có nhãn xác nhận. Khớp dãy dung-d.mjs in («Còn · giữ giá» · «Hạ 2,95→2,8» · «Lên bảng 2,95» · «Tạo hồ sơ»). Ngày khớp mốc 15/23/38/40 ngày trước 03/11. Phí hiện đủ ở các dòng giá, nhãn «đã xác nhận với chủ» chỉ ở ba dòng có dấu, đúng như dựng. Dưới khối có «GIÁ ĐÁY CHỦ TỪNG NÓI · NỘI BỘ 2,7 tỷ». Frame E2b-step2.png (offline bật bằng CDP, không tải lại, marker window.__m còn nguyên, navigator.onLine=false, chờ 12 giây): có biểu ngữ «Đang xem bản đã tải — mất mạng / Thay đổi được giữ trên máy và gửi đi khi có mạng lại.» Khối «LỊCH SỬ TRẢ GIÁ» vẫn hiện nguyên 4 dòng giống online (cùng nội dung, ngày giờ, nhãn xác nhận) và giá đáy 2,7 tỷ. Đối chiếu Expected: khớp ở cả hai bước.
  network_observed: clean

- eval: E3
  run_id: minted-goi-ep-gia-dot-hai-E3-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T17:46:07Z
  output: |
    npm run db:migrate && npm run db:test xanh; ca «chủ nhà: giá đáy theo người xem» có mặt và ok.
    ℹ duration_ms 36321.9225

- eval: E3a
  run_id: minted-goi-ep-gia-dot-hai-E3a-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T17:46:07Z
  output: |
    npm test -w @quy-hang/web xanh; ca «giá đáy: khối theo trả lời» có mặt và ok.

- eval: E3b
  run_id: minted-goi-ep-gia-dot-hai-E3b-r4
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-02T17:46:07Z
  screenshot: evidence/E3b-gia-day.png
  observed: |
    E3b-step1.png (dau-chu-1, P1): đầu màn «A-26.01 · Toà A · 2,8 tỷ · không bao phí», «Lên bảng 38 ngày · đổi giá gần nhất 23 ngày trước», lịch sử trả giá 4 dòng, dưới có khối «GIÁ ĐÁY CHỦ TỪNG NÓI · NỘI BỘ» «2,7 tỷ» và «thấp hơn giá về tay hiện tại 3,6%» — khớp expected. E3b-step2-P3.png (dau-chu-1, căn thay P2: A-26.03): cùng khối nhãn «GIÁ ĐÁY CHỦ TỪNG NÓI · NỘI BỘ» với chữ «Chưa ghi giá đáy» — khớp expected cho P2 (nhưng là căn thay thế). E3b-step3.png và E3b-khac.png (dau-chu-2, P1): đầu màn A-26.01 cùng lịch sử trả giá, rồi chuyển thẳng sang «Danh sách hỏi», không có khối giá đáy — khớp expected.
  network_observed: unscoped-partial

- eval: E4
  run_id: minted-goi-ep-gia-dot-hai-E4-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T17:46:07Z
  output: |
    npm test -w @quy-hang/web xanh; ca «kết quả gọi: phím» có mặt và ok.

- eval: E5
  run_id: minted-goi-ep-gia-dot-hai-E5-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T17:46:07Z
  output: |
    npm test -w @quy-hang/web xanh; ca «hạ giá: luật sửa giá» có mặt và ok.

- eval: E5b
  run_id: E5b-vong7-P3-7906f56a
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-02T17:46:07Z
  screenshot: evidence/E5b-step1.png
  observed: |
    step0: căn A-27.03 2,8 tỷ không bao phí, chưa đổi giá lần nào. step1: ô Hạ giá «2,72 tỷ», Alt+2 sáng, dòng «Hiểu là 2,72 tỷ · không bao phí · trước 2,8 tỷ · −3% · Enter ghi». step1b-da-gui: đầu màn «2,72 tỷ», khung «Đã ghi: Hạ giá 2,72 tỷ · không bao phí», lịch sử có dòng «Hạ 2,8 tỷ → 2,72 tỷ · đã xác nhận với chủ», thanh trên «Đã đồng bộ · 00:49». hoi-lai (mở lại trang, 2 tỷ): «Hiểu là 2 tỷ · không bao phí · trước 2,72 tỷ · −26%» và hỏi «Đổi 2,72 tỷ · không bao phí → 2 tỷ · không bao phí (−26%)?» với nút Ghi Enter / Huỷ Esc. step2-esc: khung hỏi lại biến mất, giá đầu màn vẫn 2,72 tỷ, không có dòng «Đã ghi». step3-abc: chữ đỏ «Chưa hiểu «abc» — gõ như 2,75 tỷ hoặc 950 triệu», giá đầu màn 2,72 tỷ, lịch sử không thêm dòng. Khớp Expected, không có chữ khuyên mức hạ.
  network_observed: unscoped-partial

- eval: E5c
  run_id: minted-goi-ep-gia-dot-hai-E5c-r4
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-02T17:46:07Z
  screenshot: evidence/E5c-mat-mang.png
  observed: |
    I read the two key frames and the step texts. E5c-mat-mang.png: the top-bar indicator reads «Mất mạng · 1 thay đổi chờ gửi». A banner says «Đang xem bản đã tải — mất mạng / Thay đổi được giữ trên máy và gửi đi khi có mạng lại». The Hạ giá input holds «2,75 tỷ». Under it: «Hiểu là 2,75 tỷ · không bao phí · trước 2,75 tỷ · 0% · Enter ghi». The result block reads «Đã ghi: Hạ giá 2,75 tỷ · không bao phí». The header still shows 2,75 tỷ, and the history has no new row yet, which fits the change being local only. E5c-tu-choi.png: the indicator is a red «1 căn cần xem». The listing shows the badge «Đã bán». A red result block reads «Lần ghi chưa lên máy chủ: căn đã bán / Thao tác của bạn đang chờ ở «Cần xem» — chọn giữ hay bỏ ở đó.», with an «Mở Cần xem» button. The line «Đã ghi» is replaced. The history shows «Đã bán 2,75 tỷ · Trưởng nhóm», then «Hạ 2,8 → 2,75 tỷ», then «Lên bảng 2,8 tỷ», then «Tạo hồ sơ». E5c-step2.png (online again): the indicator is «Đã đồng bộ» and the history gained «Hạ 2,8 tỷ → 2,75 tỷ». All frames match Expected.
  network_observed: clean

- eval: E6
  run_id: minted-goi-ep-gia-dot-hai-E6-r4
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-02T17:46:07Z
  screenshot: evidence/E6-giu-gia.png
  observed: |
    E6-step1-cuon.png (/today): cac dong A-26.02 · Toa A, «Gia giu 20 ngay», 2,80 ty · Khong bao phi, nut «Ghi cuoc goi» + «Con · giu gia», nam trong nhom ep gia, truoc tieu de «Can goi lai 5» (doi chung duong dat). E6-step2-chon.png (/units/call?hang=P2): nhan «Nen goi dieu chinh gia» + «Dang ban», «A-26.02 · Toa A · 2,8 ty · khong bao phi», «Len bang 20 ngay · chua doi gia lan nao»; «G Giu gia» duoc chon; dong «Ghi «Con · giu gia» — tinh la vua xac nhan voi chu nha»; lich su chi co «Len bang 2,8 ty» va «Tao ho so». E6-giu-gia.png / E6-step2.png (sau Enter): «Da ghi: Con · giu gia», chi bao «Da dong bo · 00:47», lich su co dong moi tren cung «Con · giu gia · da xac nhan voi chu · Dau chu · 00:47 03/11». E6-step3-cuon.png (/today sau G): A-26.02 · Toa A nam o nhom «Thieu thong tin» («Thieu: noi that, tai chinh»), khong con o nhom ep gia. Khop Expected.
  network_observed: n-a (driver)

- eval: E7
  run_id: minted-goi-ep-gia-dot-hai-E7-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T17:46:07Z
  output: |
    npm test -w @quy-hang/web xanh; ca «đã cọc / bán: ba lối» có mặt và ok.

- eval: E7b
  run_id: E7b-r4-20261103-0049
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-02T17:46:07Z
  screenshot: evidence/E7b-step1.png
  observed: |
    E7b-step1.png: man «Gọi ép giá» A-27.05 · Toà A · 2,8 tỷ · không bao phí, nhan «Đang bán»; khoi KET QUA CUOC GOI co «B Đã cọc / bán…» dang mo, hang con «1 Đã cọc» duoc chon, nut «Ghi Enter» hien (chua ghi). E7b-thieu-gia.png: A-27.06, B+2 da chon «Sàn mình bán», hien o «Giá chốt, vd 2,75 tỷ» (rong, co focus) va o ngay 03/11/2026, chu do «Cần giá chốt» duoi nut Ghi, chua co «Đã ghi». E7b-step2-sau-ghi.png: o gia chot «2,75 tỷ», thong bao «Đã ghi: Sàn mình bán», nhan dau man doi «Đã bán», lich su co dong moi «Đã bán 2,75 tỷ · đã xác nhận với chủ» 00:48 03/11. E7b-step3.png: A-27.07, «Đã ghi: Chủ bán nơi khác», nhan «Ngừng hẳn», lich su «Ngừng hẳn — chủ bán nơi khác» 00:49 03/11. Khop Expected: P5 Pending; P6 bao can gia chot roi Closed 2750000000 ngay 2026-11-03 (hom nay); P7 Withdrawn sold_elsewhere.
  network_observed: clean

- eval: E8
  run_id: E8-verify-20261103-r4
  exit_code: 1
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-02T17:46:07Z
  screenshot: evidence/E8-step1.png
  observed: |
    E8-step1.png: /today?nhom=price_adjustment (1440x900), mục trái «Nên gọi điều chỉnh giá» đang chọn, tiêu đề nhóm «Nên gọi điều chỉnh giá 29» và các dòng «Giá giữ 20 ngày · 2,80 tỷ · Không bao phí» (ảnh cuộn tới đầu nhóm; dòng A-26.08 nằm thấp hơn, xác nhận bằng văn bản DOM: P8 ở trong nhóm này, có «Ghi cuộc gọi» và «Còn · giữ giá»). E8-step2.png (sau khi bấm K trên P8): màn «Hôm nay > Gọi ép giá» nhưng đầu màn là «A-26.01 · Toà A · 2,8 tỷ · không bao phí, Lên bảng 38 ngày» (P1, không phải P8), thanh nút H G B K, hint «Ctrl+Enter về Hôm nay». URL là /units/call?hang=0dd344f4-... (P1), KHÔNG phải /today. Ảnh E8-step2-truoc-K.png là bản ngay trước K, đầu màn A-26.08 (P8). E8-step3.png: /today?nhom=price_adjustment, tiêu đề nhóm «Nên gọi điều chỉnh giá 28» (trước là 29), dòng A-26.05, A-26.01, A-23.06... Kiểm DOM: chuỗi «A-26.08 · Toà A» vẫn có trong nhóm. So với Expected: version/số sự kiện không đổi và P8 vẫn trong nhóm là ĐÚNG, nhưng «sau K trang về /today» là SAI (trang sang căn kế P1).
  network_observed: clean
  output: |
    Bước 1 đạt: P8 (A-26.08) nằm trong nhóm «Nên gọi điều chỉnh giá» (29 dòng); GET listing P8 trả 200, version 4, 4 sự kiện.
    Bước 2 không đạt: URL trước K = /units/call?hang=P8; sau phím K, sau 2,5 giây và sau thêm 5 giây URL = /units/call?hang=<P1>. Expected là /today; thực tế sang căn kế trong hàng đợi ép giá (còn 28 căn khác trong nhóm).
    Bước 3 đạt từng phần: GET lại sau chờ cho version 4 và 4 sự kiện (không đổi, không có POST nào); P8 vẫn nằm trong nhóm ở /today.
    Mạng: toàn bộ /api/v1 là GET, không lỗi; chỉ 2 RSC prefetch bị huỷ (ghi chú); console không lỗi hay cảnh báo.

- eval: E9
  run_id: minted-goi-ep-gia-dot-hai-E9-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint
  verified_at: 2026-11-02T17:46:07Z
  output: |
    npm run lint xanh.
    chuẩn giao diện: đạt

- eval: E9a
  run_id: minted-goi-ep-gia-dot-hai-E9a-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T17:46:07Z
  output: |
    npm test -w @quy-hang/web xanh; mọi ca hàng 28 trong apps/web/src/app/(app)/units/call/*.test.ts có mặt và ok.

- eval: E9b
  run_id: E9b
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-02T17:46:07Z
  screenshot: evidence/E9b-step1.png
  observed: |
    E9b-ep-gia-1440.png (đã Read): breadcrumb Hôm nay > Gọi ép giá; cột trung tâm rộng khoảng 768px căn giữa vùng nội dung bên phải thanh góc nhìn. Từ trên xuống: thẻ đầu màn (nhãn Nên gọi điều chỉnh giá, Đang bán, tiêu đề A-26.01 · Toà A · 2,8 tỷ · không bao phí, Lên bảng 38 ngày · đổi giá gần nhất 23 ngày trước); Kết quả cuộc gọi (H Hạ giá, G Giữ giá, B Đã cọc / bán…, K Không nghe máy); Lịch sử trả giá 4 mốc rồi Giá đáy chủ từng nói · nội bộ 2,7 tỷ trong cùng thẻ; Danh sách hỏi Mức đủ 3/5; Tính giá; Cùng loại trong toà (so giá, bảng). Khớp Expected. E9b-khai-thac-1440.png (đã Read): breadcrumb Hôm nay > Gọi khai thác; cùng cột căn giữa; thẻ lead (Đã nhận, Nhập 14:31 02/11, A-09.01 · Toà A, loại căn 1PN, 54,2 m², chủ nhà muốn 2,6 tỷ đã bao phí, nút Đã gọi G) → Danh sách hỏi 0/5 → Tính giá → Cùng loại trong toà · 1PN; không có khối kết quả gọi hay lịch sử. Khớp. E9b-375.png (đã Read): một cột full chiều rộng, thanh trên Căn call, Hôm nay, thẻ đầu màn → Kết quả cuộc gọi → Lịch sử trả giá + giá đáy 2,7 tỷ → Danh sách hỏi → Tính giá → Cùng loại trong toà, thanh nav dưới Hôm nay/Bảng hàng/Tôi; bảng so giá bị cắt cột phải trong thẻ nhưng trang không tràn. Khớp. Các frame step1/step2/1280 cùng bố cục (probe số đo xác nhận).
  network_observed: clean

- eval: E10
  run_id: minted-goi-ep-gia-dot-hai-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T17:11:08Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10b
  run_id: minted-goi-ep-gia-dot-hai-E10b-r4
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-02T17:46:07Z
  screenshot: evidence/E10b-step1.png
  observed: |
    Frames được mở bằng Read. step1 (telesales, cũng lưu thành E10b-telesales.png): thanh đầu có «[Mẫu] Sàn thử», «Hôm nay», «+ Lead», «Đã đồng bộ · 00:47», avatar TE. Thân trang là màn «Không thấy trang này / Địa chỉ không còn, hoặc bạn không có quyền xem.» và nút «Về Hôm nay». Không có nội dung căn nào. step2 (quan-tri): vỏ có rail trái, avatar QU, cùng màn «Không thấy trang này». step3 (truong-nhom): vỏ đầy đủ với cột «Góc nhìn của đội/của tôi» và «Độ tươi», thân trang vẫn là «Không thấy trang này». step4 (dau-chu-1): trang «Gọi ép giá» đầy đủ, A-26.01 · Toà A · 2,8 tỷ · không bao phí, nhãn «Nên gọi điều chỉnh giá», «Lịch sử trả giá», khối «Giá đáy chủ từng nói · nội bộ 2,7 tỷ». Không thấy số điện thoại chủ hay ảnh sổ trên màn. Khớp Expected về hiển thị; telesales, quản trị và trưởng nhóm đều nhận màn không thấy (notFound()), đầu chủ thì thấy trang.
  network_observed: unscoped-partial
  output: |
    Ghi chú: tài liệu HTML của trang không thấy vẫn trả mã HTTP thành công do Next stream notFound() sau vỏ layout; có meta robots noindex và chữ «Không thấy trang này». Eval tính «trang không thấy (404)» theo nghĩa màn không thấy, không theo mã HTTP thô. Nếu cần mã HTTP 404 thật thì đây là điểm lệch cần người quyết. Console không đọc được vì driver CDP tối giản.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-goi-ep-gia-dot-hai-SUITE-npm_test_w_quy_hang_core-r4
  exit_code: 0
  verified_at: 2026-11-02T17:46:07Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-goi-ep-gia-dot-hai-SUITE-npm_test_w_quy_hang_api-r4
  exit_code: 0
  verified_at: 2026-11-02T17:46:07Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-goi-ep-gia-dot-hai-SUITE-npm_test_w_quy_hang_connect-r4
  exit_code: 0
  verified_at: 2026-11-02T17:46:07Z

- cmd: npm run test:hooks
  run_id: minted-goi-ep-gia-dot-hai-SUITE-test_hooks-r4
  exit_code: 0
  verified_at: 2026-11-02T17:46:07Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-goi-ep-gia-dot-hai-SUITE-npm_test_w_quy_hang_ui_lint-r4
  exit_code: 0
  verified_at: 2026-11-02T17:46:07Z

- cmd: npm run typecheck
  run_id: minted-goi-ep-gia-dot-hai-SUITE-typecheck-r4
  exit_code: 0
  verified_at: 2026-11-02T17:46:07Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 2 — baseline khong do lai round nay. Field baseline cua moi eval la n-a (round nay khong do).

Eval không-phân-biệt (xanh trên cả HEAD lẫn baseline ở lần đo round 2; chứng minh harness hơn là tính năng — nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/web: E1, E2, E3a, E4, E5, E7, E9a
- npm run lint: E9

## Variance

none — every multi-run eval is uniform

## Iterations

Round 4: E8 failed — sau phím K trên màn gọi ép giá, trang chuyển sang căn kế trong hàng đợi (P1) thay vì về /today; các ý còn lại của AC-8 (phiên bản và số sự kiện không đổi, P8 vẫn trong nhóm) đạt. Returned to implementation. Lịch sử các round trước xem báo cáo cũ.

---
schema_version: 2
feature_slug: ho-so-can-dien-thoai
verdict: REJECT
failed_evals: ["E8","E9","E10"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 06d40367a1630ce8c6f1272704f868597b07eac2
human_signoff:
---

# Evidence Report: ho-so-can-dien-thoai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-3 | test | PASS |
| E2 | AC-4 | test | PASS |
| E3 | AC-5 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-1 | ui-check | PASS |
| E7 | AC-2 | ui-check | PASS |
| E8 | AC-3 | ui-check | FAIL |
| E9 | AC-4 | ui-check | FAIL |
| E10 | AC-6 | ui-check | FAIL |
| E11 | AC-7 | script | PASS |
| E12 | AC-8 | script | PASS |
| E13 | AC-8 | script | PASS |
| E14 | AC-8 | script | PASS |
| E15 | AC-8 | judgment | UNCERTAIN |

## Evidence

- eval: E1
  run_id: minted-ho-so-can-dien-thoai-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-04T00:39:51Z
  output: |
    ℹ duration_ms 636.2195
    __EXIT=0

- eval: E2
  run_id: minted-ho-so-can-dien-thoai-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-04T00:39:51Z
  output: |
    ℹ duration_ms 636.2195
    __EXIT=0

- eval: E3
  run_id: minted-ho-so-can-dien-thoai-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T00:39:51Z
  output: |
    ℹ duration_ms 77822.088291
    __EXIT=0

- eval: E4
  run_id: minted-ho-so-can-dien-thoai-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T00:39:51Z
  output: |
    ℹ duration_ms 77822.088291
    __EXIT=0

- eval: E5
  run_id: minted-ho-so-can-dien-thoai-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T00:39:51Z
  output: |
    ℹ duration_ms 2796.688208
    __EXIT=0

- eval: E6
  run_id: minted-ho-so-can-dien-thoai-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: scripts/verify-ui-check.sh
  verified_at: 2026-11-04T00:39:51Z
  screenshot: evidence/E6-step1.png
  observed: |
    E6-step1.png: /inventory khổ 375, nhóm Toà A (13 căn), thẻ A-04.06 hiện «8,06 tỷ», «Bao phí», 110,4 m², 3PN, Bắc. E6-ho-so.png (sau khi chạm thẻ, URL /inventory?unit=A-04.06&toa=Toà A&lan=...): hồ sơ toàn màn, tiêu đề «A-04.06», nhãn «Đang bán», «Xác nhận 1 ngày trước», giá «8,06 tỷ» cạnh nhãn «Bao phí», thanh mức đủ «3/5», mục ẢNH (Gửi được (3), Tự có từ mã, ảnh có nhãn Bìa). E6-toan-man.png (/units/A-04.06): trông giống hệt, tiêu đề «Căn A-04.06», cùng mã, giá, Bao phí, Xác nhận 1 ngày trước, mục ẢNH. Khung hình chỉ tới mục ẢNH; mục dưới đọc từ DOM của cả hai màn: THUỘC TÍNH CĂN (Loại căn 3PN, Diện tích 110,4 m², Tầng 4, Hướng Bắc, Toà A, Khu, Loại hình), LẦN RAO ĐANG MỞ, CÁC LẦN RAO (Lần 1, Đang bán, 8,06 tỷ), LỊCH SỬ. Khớp Expected.
  network_observed: clean

- eval: E7
  run_id: minted-ho-so-can-dien-thoai-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: scripts/verify-ui-check.sh
  verified_at: 2026-11-04T00:39:51Z
  screenshot: evidence/E7-step1.png
  observed: |
    Đã mở bằng Read cả hai ảnh. E7-step1.png (A-04.06, 375 rộng): mục ẢNH có hai thẻ ngăn «Gửi được (3)» và «Tự có từ mã»; không thẻ Nội bộ, không ổ khoá, không chữ «chỉ người giữ căn». Ba ảnh hiện, ảnh đầu có nhãn «Bìa», không nút thêm hay xoá hiển thị, không tay kéo. DOM: draggable=0, có một input file ẩn (hidden, không có nút gọi nó), các nút trong mục chỉ là hai thẻ ngăn và «Xem ảnh 1..3». Ảnh đầu hiện là 6fed0b5e-31d3-4dd1-89b2-4eae25be88db, đúng id bìa dung-b.mjs in (dù API trả displayOrder 0 là ảnh khác, UI đưa bìa lên đầu). E7-step2.png (A-06.03): thẻ «Gửi được (0)» và «Tự có từ mã», trạng thái trống «Chưa có ảnh gửi được», không ảnh nào, không thẻ Nội bộ, không ổ khoá. Khớp Expected (Hỏi-4 chọn bỏ thẻ Nội bộ).
  network_observed: clean

- eval: E8
  run_id: minted-ho-so-can-dien-thoai-E8-r1
  exit_code: 1
  baseline: n-a
  verifier: scripts/verify-ui-check.sh
  verified_at: 2026-11-04T00:39:51Z
  screenshot: evidence/E8-step1.png
  observed: |
    E8-giu-co-nut.png (dau-chu-1, 375x812, /units/A-11.03): đầu trang "Căn A-11.03", nhãn "Chưa đủ để rao", giá 2,75 tỷ, mức đủ thông tin 1/5, ngăn ảnh, "Báo sai thông tin căn". Nút «Sẵn sàng bán» không thấy trong ảnh chụp toàn trang. Nhưng DOM có 1 button khớp «Sẵn sàng bán» và văn bản trang có chữ đó. E8-ho-so.png (dau-khach, cùng căn): chỉ có "Không có căn này trong Bảng hàng / Mã «A-11.03» không có trong hàng bạn thấy trên máy này". Căn Private nên đầu khách không thấy hồ sơ, không có «Báo sai thông tin căn». Bước 3 và 4 không thể kết luận trên căn có đối chứng. E8-step1.png và E8-step3.png là bản sao của hai ảnh trên. Mẫu nguồn (truong-nhom) của A-11.03 và A-07.03 trả not-found nên không có đối chứng có mẫu nguồn khác rỗng.
  network_observed: clean

- eval: E9
  run_id: minted-ho-so-can-dien-thoai-E9-r1
  exit_code: 1
  baseline: n-a
  verifier: scripts/verify-ui-check.sh
  verified_at: 2026-11-04T00:39:51Z
  screenshot: evidence/E9-step1.png
  observed: |
    E9-nut.png / E9-step1.png (online, vua tai): man 375 hien dau trang Can A-04.06, the 8,06 ty, ngan ANH 3 anh. KHONG co nut Hoi dau chu trong khung nhin; nut o tren 1660px, ngoai man hinh, chi co thanh dieu huong day (Hom nay/Bang hang/Gui/Toi). E9-sau-cham.png / E9-step2.png: sau tap, trang tu cuon xuong cuoi; nut den "Hoi dau chu · [Mau] Dau chu 1" nam cuoi noi dung, tren thanh dieu huong, sau muc LICH SU (thuc chat nut chi nam cuoi trang chu khong dinh day). E9-step3.png (khong share): cung vi tri nut; toast da ghi nhan qua DOM "Da chep tin hoi". E9-ngoai-tuyen.png: bieu tuong may o header gach cheo, ghi "dang xem ban tren may" o LICH SU, nut doi thanh "Hoi dau chu" khong ten, nam cuoi noi dung. E9-chua-giu.png: dau trang can B-08.04 (Dang giao dich), nut khong thay trong anh (nam duoi mep). Mau thuan voi Expected: nut khong dinh day.
  network_observed: clean

- eval: E10
  run_id: E10-20261104
  exit_code: 1
  baseline: n-a
  verifier: scripts/verify-ui-check.sh
  verified_at: 2026-11-04T00:39:51Z
  screenshot: evidence/E10-giu-375.png
  observed: |
    Da mo tung frame bang Read. E10-giu-375.png (dau-chu-1, A-11.03 Chua du de rao, 1/5): ho so day du; ngan anh co 3 tab "Gui duoc (0) / Tu co tu ma / Noi bo (0)", nut "Chon anh" (them anh), vung tha anh; DOM co nut "San sang ban" (o cuoi ho so, duoi nep man hinh), KHONG co nut "Hoi dau chu". E10-giu-1440.png (cung can, cot phai trong /inventory?unit=A-11.03): cung bo cuc, DOM co "San sang ban", khong nut hoi. Phan giu PASS ca hai kho. E10-khong-giu.png (dau-chu-1, B-08.04, khong ai giu): chi co 2 ngan "Gui duoc (1) / Tu co tu ma", KHONG ngan Noi bo (khop Hoi-4), khong nut Chon anh, KHONG co nut "Hoi dau chu"; thay vao do DOM co chu "Can chua co dau chu giu". Mau thuan Expected "Dau chu khong giu: co nut hoi". E10-truong-nhom.png (truong-nhom, A-04.06 375): 3 ngan, nut Chon anh, 3 anh voi nut "Thao tac anh", khong nut Hoi dau chu: PASS. Bo sung: E10-bs-dau-chu-2-a0406.png (dau-chu-2, nguoi khong giu, tren A-04.06 do dau-chu-1 giu): co nut "Hoi dau chu · [Mau] Dau chu 1", khong ngan Noi bo.
  network_observed: clean

- eval: E11
  run_id: minted-ho-so-can-dien-thoai-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T00:39:51Z
  output: |
    12 tệp giao diện ngoài bản đồ
    __EXIT=0

- eval: E12
  run_id: minted-ho-so-can-dien-thoai-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-04T00:39:51Z
  output: |
    chuẩn giao diện: đạt
    __EXIT=0

- eval: E13
  run_id: minted-ho-so-can-dien-thoai-E13-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-04T00:39:51Z
  output: |
    __EXIT=0

- eval: E14
  run_id: minted-ho-so-can-dien-thoai-E14-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-04T00:39:51Z
  output: |
    __EXIT=0

- eval: E15
  judged_by: judge-subagent (fresh context)
  proposal: UNCERTAIN
  votes:
    - domain-correctness: UNCERTAIN — Câu 2 và 3 đều có. Nhãn «Hỏi đầu chủ» khớp ở tham-chieu.md (dòng 107, 372, 409), ở CONTEXT.md dòng 16 và ở lời Hỏi-2 trong decisions.jsonl; cả ba tệp không còn «Liên hệ đầu chủ». ho-so-can.md dòng 22-23 ghi hồ sơ Đầu khách hàng 33 là lớp phủ trên cùng khuôn, không phải khối đích riêng. Câu 1 đúng về nội dung nhưng sai ngày: dòng §12 về lớp phủ và nút mở bảng chia sẻ ghi ngày 04/11, còn các dòng 03/11 nói việc khác. Quyết định của chủ kho có giờ 2026-11-03T23:44Z, tức 04/11 theo giờ Việt Nam, nên lệch ngày có thể do múi giờ; bốn tệp không cho biết hợp đồng có chấp nhận lệch này hay không.
    - operational-feasibility: UNCERTAIN — Nội dung đạt cả ba câu, nhưng dòng §12 về lớp phủ và nút «Hỏi đầu chủ» mang ngày 04/11 (tham-chieu.md dòng 372), không phải 03/11 như câu (1) hỏi. Dòng 250 §9 còn ghi «phần chủ nhà thay bằng «Xin dẫn xem»», lệch với §4 dòng 107. Nhãn «Hỏi đầu chủ» nhất quán ở tham-chieu.md, CONTEXT.md dòng 16 và sổ quyết định Hỏi-2.
    - spec-alignment: PASS — (1) Có: dòng sổ §12 (tham-chieu.md dòng 372) ghi quyền là lớp phủ trên cùng màn hồ sơ căn và nút «Hỏi đầu chủ» dính đáy mở bảng chia sẻ của máy; ngày 04/11 coi là lệch ngày trong câu hỏi vì 23:44 UTC ngày 03/11 là 04/11 giờ Việt Nam. (2) Có: Hỏi-2 đổi nhãn thành «Hỏi đầu chủ», không còn «Liên hệ đầu chủ». (3) Có: ho-so-can.md ghi lớp phủ trên cùng khuôn, cụm «khối đích riêng» chỉ còn dạng phủ định.
  verdict: UNCERTAIN
  rationale: Hai trên ba góc nhìn chưa chắc vì dòng §12 mang ngày 04/11 thay vì 03/11 và dòng 250 §9 còn lời «Xin dẫn xem» lệch với §4; nội dung ba câu đều có.
  required_evidence:
    - Mục AC-8 trong _acceptance/ho-so-can-dien-thoai/contract.md: đòi dòng §12 mang ngày 03/11 đúng chữ, hay chỉ đòi dòng ghi lớp phủ và nút hỏi đầu chủ; hoặc xác nhận của chủ kho rằng dòng ngày 04/11 ở tham-chieu.md dòng 372 là dòng cần có.
    - docs/product/tham-chieu.md dòng 250 (bảng §9, hàng Hồ sơ căn · Đầu khách · điện thoại) được sửa cho khớp §4, hoặc ghi chú rằng hàng đó đã lỗi thời.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-ho-so-can-dien-thoai-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-04T00:39:51Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-ho-so-can-dien-thoai-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-04T00:39:51Z

- cmd: npm run test:hooks
  run_id: minted-ho-so-can-dien-thoai-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-04T00:39:51Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-ho-so-can-dien-thoai-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-04T00:39:51Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả code mới lẫn baseline): E1, E2 (npm test -w @quy-hang/core); E3, E4 (npm run db:migrate && npm run db:test); E5 (npm test -w @quy-hang/web); E11 (design-floor-khuon); E12 (npm run lint); E13 (npm run typecheck); E14 (design-floor-s4). Cả chín eval này có baseline green nên chứng minh bộ chạy chứ chưa chứng minh hành vi mới; cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý.

Baseline khong do: E6, E7, E8, E9, E10 (baseline n-a, eval ui-check không chạy được trên code cũ).

Lệnh fail không gắn eval: không có. Ba lệnh ui-check:E8, ui-check:E9, ui-check:E10 đều gắn eval tương ứng.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E8, E9, E10 failed — E8 thiếu căn có mẫu nguồn để đối chứng và đầu khách không mở được căn Private; E9 nút «Hỏi đầu chủ» không dính đáy vì nằm trong cha overflow hidden; E10 đầu chủ không giữ căn chưa ai giữ thấy «Căn chưa có đầu chủ giữ» thay vì nút hỏi (dữ liệu mẫu không có căn do người khác giữ). Returned to implementation.

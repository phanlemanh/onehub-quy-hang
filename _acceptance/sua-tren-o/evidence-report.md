---
schema_version: 2
feature_slug: sua-tren-o
verdict: REJECT
failed_evals: ["E4u","E7","E9"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: af15ea5f409675dbd0aed7115cec3930ded96cd7
human_signoff:
---

# Evidence Report: sua-tren-o

Round 1. Ba eval ui-check trượt: E4u, E7, E9. Mọi lệnh trượt đều gắn eval (không có lệnh trượt nằm ngoài eval).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | ui-check | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4u | AC-4 | ui-check | FAIL |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6u | AC-6 | ui-check | PASS |
| E7 | AC-7 | ui-check | FAIL |
| E8 | AC-8 | test | PASS |
| E8u | AC-8 | ui-check | PASS |
| E9 | AC-9 | ui-check | FAIL |
| E10 | AC-10 | script | PASS |
| E11 | AC-10 | script | PASS |
| E12 | AC-10 | script | PASS |
| E13 | AC-10 | judgment | UNCERTAIN |
| E14 | AC-10 | script | PASS |
| E15 | AC-9 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-sua-tren-o-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-01T02:20:49Z
  output: |
    npm test -w @quy-hang/core đạt; duration_ms 127.808792

- eval: E5
  run_id: minted-sua-tren-o-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-01T02:20:49Z
  output: |
    npm test -w @quy-hang/core đạt; duration_ms 127.808792

- eval: E2
  run_id: minted-sua-tren-o-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-01T02:20:49Z
  screenshot: evidence/E2-mo-sua.png
  observed: |
    E2-mo-sua.png: bảng 1 hàng B-03.04, Giá 5,35 tỷ; dưới ô Giá có trình sửa gồm ô gõ «5,35 tỷ», hai nút «Bao phí» / «Không bao phí» (nút «Không bao phí» đang chọn), dòng «Hiểu là: 5,35 tỷ, không bao phí», dòng nhỏ «Tính là vừa xác nhận với chủ nhà», không có nút «Lưu».
    E2-chua-hieu.png: ô gõ «abc» viền đỏ, dòng đỏ «Chưa hiểu «abc» — gõ như 4,65 tỷ hoặc 950 triệu», trình sửa vẫn mở, ô Giá phía sau vẫn 5,35 tỷ.
    E2-da-doi.png: ô Giá 5,89 tỷ, chân bảng «1 / 33 căn», thông báo «Đã đổi giá B-03.04 · Tính là vừa xác nhận với chủ nhà · Hoàn tác», không có hộp hỏi lại. Cột Xác nhận ngoài khung nhìn, đọc từ DOM: trước «1 ngày trước», sau «Hôm nay».
  network_observed: unscoped-partial
  output: |
    Request app tới 3481/api/v1 (catalog, listings, listings/<id>) đều thành công, không có lỗi do trang sinh ra. Config khai dev_server.url :3460 trong khi server thật ở 3481 nên ghi unscoped-partial. Dữ liệu để lại: B-03.04 giờ 5,89 tỷ, n=5; chạy lại cần dựng lại hàng.

- eval: E2b
  run_id: minted-sua-tren-o-E2b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T02:20:49Z
  output: |
    npm test -w @quy-hang/web đạt; duration_ms 145.522834

- eval: E3
  run_id: minted-sua-tren-o-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T02:20:49Z
  output: |
    npm test -w @quy-hang/web đạt; duration_ms 145.522834

- eval: E4
  run_id: minted-sua-tren-o-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T02:20:49Z
  output: |
    npm test -w @quy-hang/web đạt; duration_ms 145.522834

- eval: E4u
  run_id: minted-sua-tren-o-E4u-r1
  exit_code: 1
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-01T02:20:49Z
  screenshot: evidence/E4u-step1.png
  observed: |
    step1.png: bảng 1 hàng B-08.02, Đang bán, Giá 3,36 tỷ, Phí Bao phí, Nhóm = Không nhóm, đúng Expected. step2a-phi.png: trình sửa hai nút Bao phí / Không bao phí, khớp. step2.png: hộp hỏi lại «3,36 tỷ, Bao phí → 3,36 tỷ, Không bao phí» với nút Thôi và Đổi, khớp. step3.png: hộp «3,36 tỷ → 5,04 tỷ, Không bao phí / +50% so với giá cũ», ô Giá nền vẫn 3,36 tỷ, khớp.
    step4a.png: hàng A-11.01 Giá «—», nhấp đúp ô Phí chỉ hiện hai nút phí, không có ô gõ giá, MÂU THUẪN Expected (phải mở trình sửa Giá). step4.png: trình sửa Giá, ô gõ «3 tỷ» viền đỏ, dòng đỏ «Chọn Bao phí hay Không bao phí», khớp.
  network_observed: clean
  output: |
    Mục 1, 2, 3, 4b đạt. Mục 4a trượt: trên hàng chưa có giá (A-11.01, B-06.02, A-03.04 cùng kết quả) nhấp đúp ô Phí chỉ mở trình sửa Phí, expected là mở trình sửa Giá. Dữ liệu ghi: B-08.02 có thêm một sự kiện price_changed (Không bao phí).

- eval: E5 đã nêu ở trên. 

- eval: E6
  run_id: minted-sua-tren-o-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T02:20:49Z
  output: |
    npm test -w @quy-hang/web đạt; duration_ms 145.522834

- eval: E6u
  run_id: minted-sua-tren-o-E6u-r1
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-01T02:20:49Z
  screenshot: evidence/E6-nac.png
  observed: |
    E6-nac.png: hàng B-13.02, ô Trạng thái Đang bán mở popover 4 nút (Đang giao dịch, Đã bán, Tạm ngừng, Ngừng hẳn) kèm «Tính là vừa xác nhận với chủ nhà», khớp ADR-0008 cho Đang bán. E6u-step2.png: B-13.02 thành Tạm ngừng, thông báo «Đã đổi trạng thái B-13.02» có Hoàn tác, không hộp hỏi lại.
    E6-thieu.png: A-02.06 vẫn «Chưa đủ để rao», popover 3 nút, dòng đỏ «Chưa lên Đang bán được: thiếu pháp lý, tình trạng sử dụng». E6-da-ban.png và E6u-step4c.png: ô giá chốt «4,5 tỷ», ngày 01/11/2026, «Hiểu là: giá chốt 4,5 tỷ», «Không hoàn tác được». E6u-step4d.png: B-14.04 thành «Đã bán», thông báo «Không hoàn tác được».
  network_observed: n-a (driver)
  output: |
    Cả 4 mục đạt. Tác giả sự kiện của 2 hàng được ghi (B-13.02, B-14.04) là phiên dau-chu-1; A-02.06 không ghi. Dữ liệu đã đổi: B-13.02 nay Tạm ngừng, B-14.04 nay Đã bán.

- eval: E7
  run_id: minted-sua-tren-o-E7-r1
  exit_code: 1
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-01T02:20:49Z
  screenshot: evidence/E7-step1.png
  observed: |
    E7-step1.png: lọc Mã căn B-14.05 (1/33 căn), Nhóm Không nhóm, cuộn phải thấy cột Xác nhận «1 ngày trước», khớp expected khác «Hôm nay». E7-step2.png: sau Enter ô Giá «4,8 tỷ», thông báo «Đã đổi giá B-14.05 / Tính là vừa xác nhận với chủ nhà / Hoàn tác»; DOM cột Xác nhận đọc «Hôm nay». E7-step3b.png: A-13.01 badge «Tạm ngừng» và thông báo «Đã đổi trạng thái A-13.01». Các frame khớp expected.
  network_observed: app-fail
  output: |
    Các mục A1 đến A4 đạt (price_changed và status_changed đều confirmedWithOwner true, occurredAt hôm nay, tác giả là phiên đang dùng). Eval trượt vì mạng: bước kiểm theo steps gọi GET /api/v1/listings/<id>/events, route này không tồn tại nên trả lỗi 4xx từ origin của app. Nguyên nhân nằm ở steps/expected của eval (sự kiện thật nằm ở GET /listings/<id> trường events), không phải ở tính năng; đề xuất sửa steps. Số lỗi thô nằm trong evidence/E7-network.txt.

- eval: E8
  run_id: minted-sua-tren-o-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T02:20:49Z
  output: |
    npm test -w @quy-hang/web đạt; duration_ms 145.522834

- eval: E8u
  run_id: E8u-20261101-0942
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-01T02:20:49Z
  screenshot: evidence/E8u-step1.png
  observed: |
    E8u-step1.png: lọc B-14.06, một dòng Đang bán, 6,4 tỷ, Không bao phí, chân «1 / 33 căn». E8-thong-bao.png: ô Giá 7,04 tỷ, thông báo «Đã đổi giá B-14.06» kèm «Hoàn tác». E8u-step2.png: sau Hoàn tác ô về 6,4 tỷ, Không bao phí, thông báo «Đã hoàn tác giá B-14.06». E8u-step3.png: Cmd+Z đưa ô về 6,4 tỷ.
    E8-khong-hoan-tac.png: popover «Đang bán → Ngừng hẳn» có dòng đỏ «Không hoàn tác được», nút Thôi và Đổi. E8u-step4.png: ô Trạng thái nhãn đỏ «Ngừng hẳn», thông báo không có nút Hoàn tác. Khớp expected; có huy hiệu Next dev «1 Issue» ngoài expected.
  network_observed: n-a (driver)
  output: |
    Cả 5 mục đạt, mọi sự kiện của bài có tác giả là phiên dau-chu-1. Nhận xét phụ: ô chọn «Lý do ngừng» hiện giá trị thô owner_changed_mind thay vì nhãn «Chủ đổi ý». Dữ liệu: B-14.06 đã đổi sang Ngừng hẳn.

- eval: E9
  run_id: E9-20261101-0247
  exit_code: 1
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-01T02:20:49Z
  screenshot: evidence/E9-step1.png
  observed: |
    E9-step1.png: cột Giá hàng A-11.01 có popover sửa với ô gõ, hai nút Bao phí / Không bao phí, dòng «Tính là vừa xác nhận với chủ nhà», không nút Lưu, khớp. E9-step2.png (375x812): chỉ có tiêu đề «Bảng hàng» và thẻ, không lưới, không ô giá, khớp. E9-step3-offline.png: B-15.01 hiện 3,53 tỷ, trên cùng «Mất mạng · 1 thay đổi chờ gửi»; E9-step3-online.png: «Đã đồng bộ», khớp.
    E9-step4-A-sau-sua.png và E9-can-xem.png (đúng thứ tự đề bài): phiên dau-chu-1 hiện B-15.05 giá 7,11 tỷ, «Đã đồng bộ», KHÔNG có bảng «Cần xem», MÂU THUẪN Expected. E9-can-xem-lan2.png (biến thể): bảng «Cần xem» có «Bản mới: giá 7.470 triệu» và «Của tôi: giá 7.320 triệu», khớp nhưng chỉ ở kịch bản biến thể.
  network_observed: n-a (driver)
  output: |
    Bước 1 đạt 19/19 cột, bước 2 và bước 3 đạt. Bước 4 trượt theo đúng thứ tự đề bài: truong-nhom sửa B-15.05 từ 6,58 lên 6,91 tỷ; dau-chu-1 chưa tải lại, mở sửa sau và gõ 7,11 tỷ, Enter; giá 7,11 tỷ ghi đè 6,91 tỷ của phiên trước, không qua «Cần xem» và không có xung đột. Giá máy chủ là giá phiên sau, không đúng expected (phiên sau phải vào «Cần xem»). Biến thể (phiên sau mở trình sửa trước rồi phiên trước mới sửa) thì chạy đúng. Dữ liệu ghi: B-15.01 và B-15.05 là hàng riêng của E9.

- eval: E10
  run_id: minted-sua-tren-o-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-01T02:20:49Z
  output: |
    npm run typecheck đạt

- eval: E11
  run_id: minted-sua-tren-o-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-01T02:20:49Z
  output: |
    chuẩn giao diện: đạt

- eval: E12
  run_id: minted-sua-tren-o-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-01T02:20:49Z
  output: |
    design-floor-s4 đạt, không báo lệch

- eval: E13
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: UNCERTAIN
  rationale: Hai lens PASS, một lens UNCERTAIN. Đề xuất của panel là PASS nhưng chưa có người chốt.
  votes:
    - domain-correctness: PASS — vo-va-ia.md (dòng 103 và đoạn «Đã chuyển thể» dòng 125–133) không còn ghi «chỉ đọc» cho Bảng hàng; sửa trên ô ba cột Giá, Phí, Trạng thái là hàng 15 (01/11), dán, kéo điền, đổi hàng loạt để hàng 16. tham-chieu.md §12 dòng 01/11 (dòng 335) khớp các ý còn lại; chỗ «giới hạn bởi bảng chuyển trạng thái» không viết nguyên văn nhưng suy ra được.
    - operational-feasibility: PASS — khối đã chuyển thể không còn «chỉ đọc»; dòng 01/11 ở §12 khớp ý hỏi (Hiểu là, hỏi lại khi quá 20% hoặc đổi phí, hoàn tác là sự kiện bù, nấc trạng thái theo ADR-0008), đúng với ý «giới hạn bởi bảng chuyển trạng thái» dù không dùng đúng cụm.
    - spec-alignment: UNCERTAIN — phần (1) khớp; phần (2) khớp gần hết nhưng dòng 01/11 ở §12 không nói hoàn tác «giới hạn bởi bảng chuyển trạng thái», chỉ nói nấc hợp lệ theo ADR-0008 và «lần sửa không hoàn tác được thì nói trước khi ghi».
  required_evidence:
    - Một điều khoản nói rõ hoàn tác bị giới hạn bởi bảng chuyển trạng thái (contract.md của sua-tren-o hoặc ADR-0008), kèm đưa tệp đó vào inputs của eval; hoặc sửa dòng 01/11 ở §12 của docs/product/tham-chieu.md để ghi thẳng ràng buộc này rồi chấm lại.
  human_override:  # chi nguoi ghi

- eval: E14
  run_id: minted-sua-tren-o-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/sua-tren-o/thu/ranh-gioi.mjs
  verified_at: 2026-11-01T02:20:49Z
  output: |
    0 tệp ngoài ranh giới

- eval: E15
  run_id: minted-sua-tren-o-E15-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T02:20:49Z
  output: |
    npm test -w @quy-hang/web đạt; duration_ms 145.522834

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-sua-tren-o-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-01T02:20:49Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-sua-tren-o-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-01T02:20:49Z

- cmd: npm run test:hooks
  run_id: minted-sua-tren-o-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-01T02:20:49Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-sua-tren-o-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-01T02:20:49Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline, chứng minh khung chạy chứ chưa chứng minh tính năng; cần viết lại để assert hành vi mới hoặc xác nhận là lớp bảo vệ hồi quy có chủ ý):
- npm test -w @quy-hang/core: E1, E5
- npm test -w @quy-hang/web: E2b, E3, E4, E6, E8, E15
- npm run typecheck: E10
- npm run lint: E11
- design-floor-s4 (R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-s4.mjs" --root .): E12

Baseline khong do
- node _acceptance/sua-tren-o/thu/ranh-gioi.mjs: bo qua baseline: tep _acceptance/sua-tren-o/thu/ranh-gioi.mjs co o cay dang kiem nhung chua co o merge-base 4b2853b4288cdd6d98f32608c007d7000b3a2c4f — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E4u, E7, E9 failed — E4u: trên hàng chưa có giá, ô Phí không mở trình sửa Giá; E7: bước kiểm theo steps gọi route events không tồn tại nên mạng báo lỗi (mọi mục nội dung đạt; lỗi nằm ở steps của eval); E9: hai phiên theo đúng thứ tự đề bài, lần sửa của phiên sau ghi đè lặng giá phiên trước, không vào «Cần xem». Returned to implementation.

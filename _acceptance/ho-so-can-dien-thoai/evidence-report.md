---
schema_version: 2
feature_slug: ho-so-can-dien-thoai
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: fcec45d72c86dcd8794a35695a8b2e2d6edac45c
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
| E8 | AC-3 | ui-check | PASS |
| E9 | AC-4 | ui-check | PASS |
| E10 | AC-6 | ui-check | PASS |
| E11 | AC-7 | script | PASS |
| E12 | AC-8 | script | PASS |
| E13 | AC-8 | script | PASS |
| E14 | AC-8 | script | PASS |
| E15 | AC-8 | judgment | PASS |

## Evidence

- eval: E1
  run_id: minted-ho-so-can-dien-thoai-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T01:38:20Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 380.79525

- eval: E2
  run_id: minted-ho-so-can-dien-thoai-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T00:39:51Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-ho-so-can-dien-thoai-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T01:38:20Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 45063.419083

- eval: E4
  run_id: minted-ho-so-can-dien-thoai-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T01:38:20Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 45063.419083

- eval: E5
  run_id: minted-ho-so-can-dien-thoai-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T01:38:20Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1502.035041

- eval: E6
  run_id: minted-ho-so-can-dien-thoai-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T01:38:20Z
  screenshot: evidence/E6-ho-so.png
  observed: |
    E6-ho-so.png (375x812, chụp ở trạng thái hồ sơ đã cuộn xuống): thanh «Bảng hàng», ba ảnh (có nhãn Bìa, «Ảnh thật · 03/11/2026»), mục «THUỘC TÍNH CĂN» + «Báo sai thông tin căn» với Loại căn 3PN, Diện tích 110,4 m², Tầng 4, Hướng Bắc, Toà A, Khu; nút đáy «Hỏi đầu chủ · [Mẫu] Đầu chủ 1»; mục «LẦN RAO ĐANG MỞ» bắt đầu. Phần đầu (mã, giá) không nằm trong khung ảnh do đã cuộn, nhưng DOM xác nhận A-04.06, 8,06 tỷ, Bao phí, Xác nhận 1 ngày trước. E6-toan-man.png: đầu trang «Căn A-04.06», «[Mẫu] Dự án căn hộ thử · Toà A · Căn hộ», A-04.06 nhãn «Đang bán», «Xác nhận 1 ngày trước», «8,06 tỷ», nhãn «Bao phí», thanh mức đủ thông tin «3/5», mục ẢNH với tab «Gửi được (3)»/«Tự có từ mã», ba ảnh, nút đáy «Hỏi đầu chủ». Cả hai khớp Expected; mục thuộc tính và lần rao có trong DOM cả hai màn.
  network_observed: clean

- eval: E7
  run_id: minted-ho-so-can-dien-thoai-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T01:38:20Z
  screenshot: evidence/E7-step1.png
  observed: |
    E7-step1.png (A-04.06, 375x812, phiên dau-khach), đã mở bằng Read: mục «ẢNH» có đúng hai thẻ ngăn «Gửi được (3)» và «Tự có từ mã». Không có thẻ «Nội bộ», không ổ khoá, không chữ «chỉ người giữ căn». Ba ảnh hiện dạng lưới, ảnh đầu có nhãn «Bìa». Không nút thêm hay xoá, không tay kéo. Nút «Hỏi đầu chủ · [Mẫu] Đầu chủ 1» dính đáy. DOM: ảnh đầu là /units/photos/6fed0b5e-31d3-4dd1-89b2-4eae25be88db/thumb, đúng id bìa dung-b.mjs in. API trả displayOrder 0 là ảnh khác (03c3601c), isCover=true là 6fed0b5e, nên UI đưa bìa lên đầu. Nút trong mục chỉ gồm hai thẻ ngăn và «Xem ảnh 1..3». draggable=0, không svg nào trong mục, và có một input file ẩn (display none, width 0, không có nút gọi nó). E7-step2.png (A-06.03, chỉ ảnh Nội bộ), đã mở bằng Read: thẻ «Gửi được (0)» và «Tự có từ mã», trạng thái trống «Chưa có ảnh gửi được / Người giữ căn chưa thêm ảnh.», không ảnh nào, không thẻ Nội bộ, không ổ khoá. E7-anh.png và E7-chi-noi-bo.png là bản sao của hai frame này.
  network_observed: clean

- eval: E8
  run_id: ui-E8-ho-so-can-dien-thoai-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T01:38:20Z
  screenshot: evidence/E8-step1.png
  observed: |
    E8-giu-co-nut.png (dau-chu-1, 375x812, /units/B-09.01): dau trang «Căn B-09.01», nhan «Tạm ngừng», gia 2,82 tỷ, muc du thong tin 3/5. Co tab anh «Gửi được (1) / Tự có từ mã / Nội bộ (0)», o «Kéo ảnh từ Zalo vào đây», nut «Chọn ảnh», va «Báo sai thông tin căn». Nut «Sẵn sàng bán» nam duoi mep man hinh, khong thay trong frame nay; DOM xac nhan co button.
    E8-giu-co-nut-cuon.png (dau-chu-1, cung can, da cuon): thay ro nut «Sẵn sàng bán» o muc «LẦN RAO ĐANG MỞ», duoi «THUỘC TÍNH CĂN». Day la doi chung duong bang hinh.
    E8-ho-so.png (dau-khach, cung can): cung hinh dang dau trang (Tạm ngừng, 2,82 tỷ, 3/5). Tab anh chi con «Gửi được (1) / Tự có từ mã», khong co tab «Nội bộ» va khong co nut «Chọn ảnh». Co «Báo sai thông tin căn». Dai duoi dinh nut «Hỏi đầu chủ · [Mẫu] Đầu chủ 1». Khong co muc «Chủ nhà», khong ten, so hay gia day nao tren frame. Van ban DOM cua dau-khach (doc ngoai frame) cho thay muc «LẦN RAO ĐANG MỞ» chi doc (Nội thất, Pháp lý, Tài chính, Tình trạng sử dụng) va khong co nut «Sẵn sàng bán». Tat ca khop Expected.
  network_observed: clean

- eval: E9
  run_id: minted-ho-so-can-dien-thoai-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T01:38:20Z
  screenshot: evidence/E9-step1.png
  observed: |
    Frames saved, each opened with Read, at 375x812, session dau-khach. Evidence dir: /Users/manhphan/dev/onehub-quy-hang/.claude/worktrees/elated-bhabha-2c0741/_acceptance/ho-so-can-dien-thoai/evidence/. (1) E9-nut.png/E9-step1.png: hồ sơ A-04.06 hiện nút đen cuối màn «Hỏi đầu chủ · [Mẫu] Đầu chủ 1», nằm ngay trên thanh tab dưới (top 684, bottom 716). E9-step1b-cuon.png: sau khi cuộn hết, nút vẫn ở đáy (top 663) cạnh cuối nội dung Lịch sử, nên dính đáy. (2) E9-step2.png / E9-sau-cham.png: sau chạm, nút hiện xám nhạt (trạng thái nhấn); window.__chia = {title:"Hỏi về căn A-04.06 · Toà A", text:"Hỏi về căn A-04.06 · Toà A", url:"http://localhost:3492/inventory?unit=A-04.06&toa=To%C3%A0+A"}; không có request nào khi chạm. (3) E9-step3.png: navigator.share undefined, chạm → toast «Đã chép tin hỏi»; clipboard = «Hỏi về căn A-04.06 · Toà A\nhttp://localhost:3492/inventory?unit=A-04.06&toa=To%C3%A0+A» (khớp tin share); không request nào. (4) E9-step4.png / E9-ngoai-tuyen.png: chặn /api/**, tải lại; nút chỉ có chữ «Hỏi đầu chủ» (không tên), khu Ảnh hiện banner đỏ «Không tải được ảnh / Kiểm tra mạng rồi mở lại hồ sơ.» và toast «Mất mạng · đang xem bản trên máy»; chạm trong 874 ms, không treo, share vẫn được gọi với text «Hỏi về căn A-04.06 · Toà A», không request, không pageerror. Banner ảnh là của khu Ảnh do mất mạng, không phải lỗi của lần chạm. (5) GET /api/v1/listings có đúng 1 căn listAgentKey null: A-08.03 (d2cb83ca...). E9-chua-giu.png / E9-step5.png: nút mờ «Căn chưa có đầu chủ giữ», disabled, opacity 0.5; ngăn Gửi được (0).
  network_observed: clean

- eval: E10
  run_id: minted-ho-so-can-dien-thoai-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T01:38:20Z
  screenshot: evidence/E10-giu-375.png
  observed: |
    E10-giu-375.png (dau-chu-1, A-04.06, 375x812): the "Căn A-04.06" page shows the "Đang bán" badge and an "ẢNH" section. The tabs "Gửi được (3)", "Tự có từ mã" and "Nội bộ (0)" are visible, and the "Chọn ảnh" button is there. Three real photos are shown, the first marked "Bìa", each with a "..." menu. There is no "Hỏi đầu chủ" button, and no "Sẵn sàng bán" because the listing is Active. This matches the expected result.
    E10-giu-1440.png (/inventory?unit=A-04.06, 1440x900): the table is on the left and the detail pane for A-04.06 is on the right. It has the same three tabs, "Chọn ảnh" and the photos, with no Hỏi button. This matches the expected result.
    E10-khong-giu.png (dau-chu-1, A-03.01, 375): the tabs are only "Gửi được (1)" and "Tự có từ mã", with no Nội bộ. The photo is a broken image (404 thumbnail). There is no "Chọn ảnh". A pinned bottom button reads "Hỏi đầu chủ · [Mẫu] Đầu chủ 2". This matches the expected result, with Nội bộ absent per Hỏi-4.
    E10-truong-nhom.png (truong-nhom, A-04.06, 375): three tabs including "Nội bộ (0)", "Chọn ảnh", three photos, and no Hỏi button. The bottom nav has an extra "Gửi" item. This matches the expected result.
    E10-giu-bsh-375.png (extra, dau-chu-1, B-09.01 Hold): the Nội bộ tab and "Chọn ảnh" are present. "Sẵn sàng bán" is in the DOM below the fold, and there is no Hỏi button.
  network_observed: clean

- eval: E11
  run_id: minted-ho-so-can-dien-thoai-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T01:38:20Z
  output: |
    design-floor-khuon --kiem
    12 tệp giao diện ngoài bản đồ

- eval: E12
  run_id: minted-ho-so-can-dien-thoai-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint
  verified_at: 2026-11-04T01:38:20Z
  output: |
    npm run lint
    chuẩn giao diện: đạt

- eval: E13
  run_id: minted-ho-so-can-dien-thoai-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-04T01:38:20Z
  output: |
    npm run typecheck
    (không có lỗi kiểu ở mọi gói)

- eval: E14
  run_id: minted-ho-so-can-dien-thoai-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-04T01:38:20Z
  output: |
    design-floor-s4 --root .
    (không có mã màu thô trên tệp giao diện vòng chạm)

- eval: E15
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment), fresh context
  verdict: PASS
  rationale: Cả ba câu đều «có» với câu trích (tham-chieu.md §12 và dòng 107, 250, 372; CONTEXT.md dòng 16; ho-so-can.md dòng 22-23). Ghi chú: dòng sổ đề ngày 04/11 chứ không phải 03/11 như câu hỏi, nội dung đúng.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-ho-so-can-dien-thoai-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-04T01:38:20Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-ho-so-can-dien-thoai-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-04T01:38:20Z

- cmd: npm run test:hooks
  run_id: minted-ho-so-can-dien-thoai-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-04T01:38:20Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-ho-so-can-dien-thoai-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-04T01:38:20Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi). Field baseline cua tung eval ghi n-a.

Eval khong-phan-biet (pass tren ca HEAD lan baseline, chung minh harness chu khong phai feature; nen viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y):

- npm test -w @quy-hang/core: E1, E2
- npm run db:migrate && npm run db:test: E3, E4
- npm test -w @quy-hang/web: E5
- design-floor-khuon --kiem: E11
- npm run lint: E12
- npm run typecheck: E13
- design-floor-s4: E14

## Variance

none — every multi-run eval is uniform

## Judge panels (đề xuất)

Panel E15 đề xuất PASS; human_override để trống cho người quyết ở Gate 2.

- domain-correctness: PASS — (1) Có, nhưng ngày ghi là 04/11 chứ không phải 03/11; nội dung đúng. (2) Có: «Hỏi đầu chủ» khớp Hỏi-2, không còn «Liên hệ đầu chủ». (3) Có: ho-so-can.md dòng 22-23 phủ định «khối đích riêng».
- operational-feasibility: PASS — (1) Có, tham-chieu.md:372. (2) Có, tham-chieu.md:107, 250, 372 và CONTEXT.md:16 trùng nhãn Hỏi-2. (3) Có, ho-so-can.md:22-23.
- spec-alignment: PASS — (1) Có, dòng §12 ghi lớp phủ và bảng chia sẻ của máy (đề 04/11). (2) Có, grep «Liên hệ đầu chủ» ra 0 kết quả. (3) Có, «khối đích riêng» chỉ còn ở dạng phủ định.

## Iterations

Round 1: E8, E9, E10 failed — nút «Hỏi đầu chủ» chưa dính đáy, dữ liệu dựng cho S4 thiếu, đối chứng ảnh nội bộ và luật lớp phủ chưa đủ. Returned to implementation.
Round 2: toàn bộ eval PASS trên HEAD fcec45d7 sau bản sửa lượt 1; E2 mang từ round 1 (delta không chạm paths).

---
schema_version: 2
feature_slug: sua-tren-o
verdict: PENDING-JUDGMENT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4175185dbd7d71c5e8157b6e712e86acafe7d55b
human_signoff:
---

# Evidence Report: sua-tren-o

Round 2. Mọi eval máy và eval nhìn thật đạt. Còn một mục judgment (E13) chờ người chốt ở Cổng 2.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS (mang từ round 1) |
| E2 | AC-2 | ui-check | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4u | AC-4 | ui-check | PASS |
| E5 | AC-5 | test | PASS (mang từ round 1) |
| E6 | AC-6 | test | PASS |
| E6u | AC-6 | ui-check | PASS |
| E7 | AC-7 | ui-check | PASS |
| E8 | AC-8 | test | PASS |
| E8u | AC-8 | ui-check | PASS |
| E9 | AC-9 | ui-check | PASS |
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
  verifier: config:executors.test.core
  verified_at: 2026-11-01T02:20:49Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-sua-tren-o-E5-r1
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-01T02:20:49Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: e2-sua-tren-o-20261101
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T02:56:00Z
  screenshot: evidence/E2-v-step1.png
  observed: |
    Đã mở bằng Read ba frame chính. E2-v-mo-sua.png: bảng lọc còn 1 hàng B-03.04 (Toà B, 2PN, Đang bán, Giá 5,89 tỷ, Phí Không bao phí); popover dưới ô Giá có ô gõ «5,89 tỷ» viền sáng, hai nút «Bao phí» và «Không bao phí» (nút sau đang chọn), dòng «Hiểu là: 5,89 tỷ, không bao phí», dòng mờ «Tính là vừa xác nhận với chủ nhà», không nút Lưu. Khớp Expected.
    E2-v-chua-hieu.png: ô gõ «abc» viền đỏ, dòng đỏ «Chưa hiểu «abc» — gõ như 4,65 tỷ hoặc 950 triệu», ô Giá nền vẫn 5,89 tỷ. Khớp.
    E2-v-da-doi.png: popover đã đóng, ô Giá «6,48 tỷ», phí Không bao phí, chân bảng «1 / 33 căn», thông báo góc dưới phải «Đã đổi giá B-03.04 / Tính là vừa xác nhận với chủ nhà» kèm nút «Hoàn tác»; cột Xác nhận nằm ngoài khung nhìn nhưng DOM hàng ghi «Hôm nay». Khớp. Cả ba frame có huy hiệu Next dev «1 Issue» ở góc trái dưới (note-only).
  network_observed: clean

- eval: E2b
  run_id: minted-sua-tren-o-E2b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T02:56:00Z

- eval: E3
  run_id: minted-sua-tren-o-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T02:56:00Z

- eval: E4
  run_id: minted-sua-tren-o-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T02:56:00Z

- eval: E4u
  run_id: minted-sua-tren-o-E4u-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T02:56:00Z
  screenshot: evidence/E4u-step1.png
  observed: |
    E4u-step1.png: bang 1/33 can da loc Ma can=B-08.02, Nhom: Khong nhom, hang Toa B/2PN/68,5 m2/Dang ban, Gia 3,36 ty, Phi «Khong bao phi». E4-phi.png / E4u-step2a-phi.png: o Phi dang chon, popover duoi o voi hai nut «Bao phi» «Khong bao phi» + dong «Tinh la vua xac nhan voi chu nha». E4u-step2.png: hop hoi lai duoi o Phi «3,36 ty, Khong bao phi → 3,36 ty, Bao phi / Doi dieu kien phi / Hieu la: 3,36 ty, bao phi» voi nut Thoi, Doi (khop Expected).
    E4u-step3.png / E4-hoi-lai.png: hop duoi o Gia «3,36 ty, Bao phi → 5,04 ty, Bao phi / Doi +50% so voi gia cu / Hieu la: 5,04 ty, bao phi», nut Thoi/Doi (khop: gia cu → gia moi va +50%). E4u-step3b-sau-thoi.png: sau «Thoi» o Gia con «3,36 ty», hop hoi lai da dong.
    E4u-step4a.png: hang A-11.01 (Ngung han) Gia «—» Phi «—», nhap dup o Phi mo o nhap gia «4,65 ty hoac 950 trieu» + hai nut phi (trinh sua Gia). E4u-step4.png: o nhap «3 ty» vien do, dong do «Chon Bao phi hay Khong bao phi», o Gia van «—» (khop Expected). Tat ca khop Expected, khong mau thuan.
  network_observed: clean

- eval: E6
  run_id: minted-sua-tren-o-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T02:56:00Z

- eval: E6u
  run_id: E6u-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T02:56:00Z
  screenshot: evidence/E6-nac.png
  observed: |
    E6-nac.png (da doc): hang A-11.02 loc Ma can, o Trang thai «Dang ban» mo popover 4 nut Dang giao dich / Da ban / Tam ngung / Ngung han + dong «Tinh la vua xac nhan voi chu nha» — dung bang ADR-0008 cho Active. E6u-step2.png (da doc): o thanh «Tam ngung», goc phai thong bao «Da doi trang thai A-11.02» + nut Hoan tac, khong hop hoi lai.
    E6-thieu.png (da doc): A-02.06 van «Chua du de rao», popover 3 nut (Dang ban, Tam ngung, Ngung han) va dong do «Chua len Dang ban duoc: thieu phap ly, tinh trang su dung». E6-da-ban.png (da doc): A-10.05 Dang ban, nut Da ban dang chon, o «Gia chot, vd 4,5 ty», o ngay 01/11/2026, nut «Doi sang Da ban».
    E6u-step4d-hop.png (da doc): hop «Dang ban -> Da ban», «Hieu la: gia chot 4,5 ty», chu do «Khong hoan tac duoc», nut Thoi / Doi. Tat ca khop Expected.
  network_observed: clean

- eval: E7
  run_id: minted-sua-tren-o-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T02:56:00Z
  screenshot: evidence/E7r2-step1.png
  observed: |
    E7r2-step0.png: bang 33/33 can nhom Toa->Loai can; A-13.01 hien «Tam ngung» (da bi luot truoc doi). E7r2-step1.png: Nhom «Khong nhom», loc Ma can = A-04.06, 1/33 can: Toa A, 3PN, 110,4 m2, Dang ban, 8,06 ty, Bao phi (cot Xac nhan ngoai man hinh, doc qua API/DOM = «1 ngay truoc»). E7r2-step2a.png: o Gia mo trinh sua gom o go «8,06 ty», hai nut Bao phi / Khong bao phi (Bao phi dang chon), dong «Hieu la: 8,06 ty, bao phi», dong «Tinh la vua xac nhan voi chu nha», khong nut Luu.
    E7r2-step2b.png: o Gia hien 8,87 ty, goc phai duoi thong bao «Da doi gia A-04.06 / Tinh la vua xac nhan voi chu nha / Hoan tac» (khop expected). E7r2-step3a.png: loc A-08.03, o Trang thai mo cac nut Dang giao dich / Da ban / Tam ngung / Ngung han + dong «Tinh la vua xac nhan voi chu nha». E7r2-step3b.png: o Trang thai A-08.03 doi thanh «Tam ngung», thong bao «Da doi trang thai A-08.03 / Hoan tac». Khong frame nao mau thuan Expected.
  network_observed: clean

- eval: E8
  run_id: minted-sua-tren-o-E8-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T02:56:00Z

- eval: E8u
  run_id: minted-sua-tren-o-E8u-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T02:56:00Z
  screenshot: evidence/E8u-step1.png
  observed: |
    Đã mở và đọc từng frame. E8u-step1.png: lọc Mã căn = A-06.03, một dòng «Toà A · A-06.03 · 2PN · 75 m² · tầng 6 · Tây Bắc · Đang bán · 5,8 tỷ · Không bao phí», chân bảng 1 / 33 căn, nhóm «Không nhóm». Khớp bước 1.
    E8-thong-bao.png: ô Giá 6,38 tỷ (đã đổi), thông báo góc phải «Đã đổi giá A-06.03 / Tính là vừa xác nhận với chủ nhà» kèm nút «Hoàn tác». E8u-step2.png: sau khi bấm «Hoàn tác», ô Giá về 5,8 tỷ, phí «Không bao phí», thông báo «Đã hoàn tác giá A-06.03». E8u-step3.png: sau Cmd+Z, ô Giá 6,2 tỷ, thông báo «Đã hoàn tác giá A-06.03».
    E8-khong-hoan-tac.png: hộp hỏi lại dưới ô Trạng thái «Đang bán → Ngừng hẳn», dòng đỏ «Không hoàn tác được», nút Thôi và Đổi. E8u-step4b.png: ô Trạng thái nhãn đỏ «Ngừng hẳn», thông báo «Đã đổi trạng thái A-06.03 … Không hoàn tác được», không có nút «Hoàn tác». Không frame nào mâu thuẫn Expected.
  network_observed: n-a (driver)

- eval: E9
  run_id: minted-sua-tren-o-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T02:56:00Z
  screenshot: evidence/E9-step1.png
  observed: |
    Cột buildingName, unitNumber, unitType, livingArea, floor, directionFaces, furnished, legalStatus, financing, occupantType, confirmedAgeDays, completeness, visibility, closePrice, closeDate, withdrawnReason (đã mở bản chụp withdrawnReason, buildingName): lưới Không nhóm, ba cột ẩn đã bật; sau nhấp đúp + Enter không có hộp nổi nào, ô chọn dời xuống dòng 2. Cột standardStatus (đã mở): hộp nổi dưới ô Trạng thái «Ngừng hẳn là nấc cuối — mở lại là hàng mới.». Cột listPrice (đã mở): hộp nổi dưới ô Giá có ô gõ «4,65 tỷ hoặc 950 triệu», hai nút «Bao phí» «Không bao phí», chữ «Tính là vừa xác nhận với chủ nhà», không có nút Lưu; Phí mở cùng hộp này.
    E9-step2 và E9-step2-dup (đã mở): màn 375 chỉ có tiêu đề Bảng hàng và một thẻ «Bảng hàng dạng thẻ trên điện thoại dựng ở mục 32», không lưới, không ô giá; nhấp đúp không mở gì. E9-step3-2-offline (đã mở): đầu trang «Mất mạng · 1 thay đổi chờ gửi», ô Giá B-15.01 hiện 3,71 tỷ, góc phải dưới «Đã đổi giá B-15.01 · Tính là vừa xác nhận với chủ nhà · Hoàn tác».
    E9-can-xem (đã mở): ngăn phải «Căn cần xem» — «Toà B · B-15.05», «Bản mới: giá 8.230 triệu · trạng thái Active — Trưởng nhóm sửa lúc 10:03», «Của tôi: giá 8.620 triệu», nút «Giữ của tôi» và «Lấy bản mới» (hai lối). E9-can-xem-chip chưa mở lại từng pixel nhưng đã đọc DOM: chip đỏ «1 căn cần xem», ô Giá 7,84 thành 8,23 theo máy chủ. Khớp expected ở cả bốn bước.
  network_observed: n-a (driver)

- eval: E10
  run_id: minted-sua-tren-o-E10-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-01T02:56:00Z
  output: |
    (không in lỗi; kết thúc bình thường)

- eval: E11
  run_id: minted-sua-tren-o-E11-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-01T02:56:00Z
  output: |
    chuẩn giao diện: đạt

- eval: E12
  run_id: minted-sua-tren-o-E12-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-01T02:56:00Z
  output: |
    (không in gì; kết thúc bình thường)

- eval: E13
  judged_by: judge panel (đề xuất: domain-correctness, operational-feasibility, spec-alignment)
  verdict: UNCERTAIN
  rationale: Vế (1) đúng ở cả ba góc nhìn, vo-va-ia.md dòng 125-133 không còn «chỉ đọc», sửa ô ba cột Giá, Phí, Trạng thái là hàng 15, còn dán, kéo điền, đổi hàng loạt là hàng 16. Vế (2) có dòng 01/11 ở tham-chieu.md §12 (dòng 335) với «Hiểu là…», hỏi lại khi giá đổi quá 20% hoặc đổi điều kiện phí, hoàn tác là sự kiện bù; nhưng dòng đó không nói thẳng hoàn tác bị giới hạn bởi bảng chuyển trạng thái, chỉ nói nấc hợp lệ theo ADR-0008 và lần sửa không hoàn tác được thì nói trước khi ghi.
  votes:
    - domain-correctness: PASS — đọc vậy là đúng, nhưng không có câu nào nói thẳng ý hoàn tác giới hạn bởi bảng chuyển trạng thái; dòng 335 chỉ nói gián tiếp.
    - operational-feasibility: UNCERTAIN — câu «hoàn tác giới hạn bởi bảng chuyển trạng thái» không có chữ nào như vậy ở dòng 335; hai tệp không đủ để xác nhận ý này.
    - spec-alignment: UNCERTAIN — dòng 01/11 chỉ nói nấc trạng thái hợp lệ theo ADR-0008 và «lần sửa không hoàn tác được thì nói trước khi ghi»; hai tệp chưa đủ căn cứ chốt mệnh đề.
  required_evidence:
    - Một câu trong tham-chieu.md §12 (dòng 335 hoặc dòng khác) hoặc vo-va-ia.md nói thẳng hoàn tác trạng thái bị giới hạn bởi bảng chuyển trạng thái (ví dụ hoàn tác chỉ chạy khi nấc cũ vẫn là nấc hợp lệ từ trạng thái hiện tại). Tệp ở /Users/manhphan/dev/onehub-quy-hang/.claude/worktrees/modest-shtern-330841/docs/product/tham-chieu.md dòng 335.
    - Hoặc đổi câu hỏi E13 thành «hoàn tác là một sự kiện bù, lần không hoàn tác được thì nói trước khi ghi», đúng chữ dòng 335 (khi đó là PASS); hoặc thêm ADR-0008 vào danh sách input.
  human_override:  # chi nguoi ghi

- eval: E14
  run_id: minted-sua-tren-o-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script
  verified_at: 2026-11-01T02:56:00Z
  output: |
    0 tệp ngoài ranh giới

- eval: E15
  run_id: minted-sua-tren-o-E15-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T02:56:00Z

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-sua-tren-o-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-01T02:56:00Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-sua-tren-o-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-01T02:56:00Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-sua-tren-o-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-01T02:56:00Z

- cmd: npm run test:hooks
  run_id: minted-sua-tren-o-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-01T02:56:00Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-sua-tren-o-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-01T02:56:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline, chứng minh harness chứ chưa chứng minh tính năng; viết lại để assert hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý):

- npm test -w @quy-hang/web: E2b, E3, E4, E6, E8, E15
- npm run typecheck: E10
- npm run lint: E11
- R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-s4.mjs" --root .: E12

Baseline khong do:

- node _acceptance/sua-tren-o/thu/ranh-gioi.mjs: bo qua baseline: tep _acceptance/sua-tren-o/thu/ranh-gioi.mjs co o cay dang kiem nhung chua co o merge-base 4b2853b4288cdd6d98f32608c007d7000b3a2c4f — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E4u, E7, E9 không đạt — ô Phí của căn chưa có giá chưa mở trình sửa Giá, và lần sửa chưa mang phiên bản người đã thấy (nên có thể ghi đè lặng); bài E2, E7 đọc sự kiện chưa đúng đường. Trả về thi công.
Round 2: mọi eval máy và nhìn thật đạt sau sửa vòng 1 (commit 4175185); E13 còn UNCERTAIN chờ người chốt. Verdict PENDING-JUDGMENT.

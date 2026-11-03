---
schema_version: 2
feature_slug: bang-hang-dang-the
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c3c1fff1df0ac05ec5ef00aad717ad6553a6bd34
human_signoff:
---

# Evidence Report: bang-hang-dang-the

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-3 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-5 | test | PASS |
| E5 | AC-7 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-1 | ui-check | PASS |
| E8 | AC-3 | ui-check | PASS |
| E9 | AC-4 | ui-check | PASS |
| E10 | AC-5 | ui-check | PASS |
| E11 | AC-6 | ui-check | PASS |
| E12 | AC-7 | ui-check | PASS |
| E13 | AC-8 | ui-check | PASS |
| E14 | AC-9 | script | PASS |
| E15 | AC-9 | script | PASS |
| E16 | AC-9 | script | PASS |
| E17 | AC-9 | judgment | PASS |
| E18 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-bang-hang-dang-the-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-03T12:44:17Z
  output: |
    Lệnh: npm test -w @quy-hang/web (cover E1-E6, chạy một lần, không phương sai)
    ℹ duration_ms 1962.827208

- eval: E2
  run_id: minted-bang-hang-dang-the-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-03T12:44:17Z
  output: |
    Lệnh: npm test -w @quy-hang/web (chung lần chạy với E1)
    ℹ duration_ms 1962.827208

- eval: E3
  run_id: minted-bang-hang-dang-the-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-03T12:44:17Z
  output: |
    Lệnh: npm test -w @quy-hang/web (chung lần chạy với E1)
    ℹ duration_ms 1962.827208

- eval: E4
  run_id: minted-bang-hang-dang-the-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-03T12:44:17Z
  output: |
    Lệnh: npm test -w @quy-hang/web (chung lần chạy với E1)
    ℹ duration_ms 1962.827208

- eval: E5
  run_id: minted-bang-hang-dang-the-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-03T12:44:17Z
  output: |
    Lệnh: npm test -w @quy-hang/web (chung lần chạy với E1)
    ℹ duration_ms 1962.827208

- eval: E6
  run_id: minted-bang-hang-dang-the-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-03T12:44:17Z
  output: |
    Lệnh: npm test -w @quy-hang/web (chung lần chạy với E1)
    ℹ duration_ms 1962.827208

- eval: E7
  run_id: minted-bang-hang-dang-the-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-03T12:44:17Z
  screenshot: evidence/E7-the.png
  observed: |
    E7-the.png (375x812): header «Bảng hàng», «19 căn», nút Lọc/Chọn; dòng nhóm «11 căn · TOÀ B» (dòng nhóm «8 căn · TOÀ A» nằm dưới, thấy trong văn bản trang); không có chữ «dựng ở mục 32». Ba thẻ đầu đều có ô ảnh vuông bên trái (img tải được, rộng 112px, lệch trái 0): B-08.04 · 4,53 tỷ · «Bao phí» · Diện tích 82,3 m² / Phòng ngủ 2PN / Hướng Tây Nam; B-03.04 · 5,35 tỷ · «Không bao phí» · 82,3 m² / 2PN / Tây Nam; B-14.04 · 4,61 tỷ · «Bao phí» · 82,3 m² / 2PN / Tây Nam. E7-dang-giao-dich.png: thẻ B-08.04 có huy hiệu «Đang giao dịch» trên ảnh. E7-chon.png: thanh đầu «1 căn đã chọn» + nút «Bỏ chọn»; B-03.04 (Đang bán) có ô tích đã bật; thẻ B-08.04 hiện ô chọn nhưng disabled, không tích. E7-may-tinh.png (1440x900): lưới có hàng tiêu đề cột (Toà, Mã căn, Loại căn, Diện tích, Tầng, Hướng, Trạng thái, Giá, Phí…), nhóm Toà A/Toà B, huy hiệu Đang bán/Đang giao dịch/Đã bán/Tạm ngưng.
  network_observed: clean

- eval: E8
  run_id: minted-bang-hang-dang-the-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-03T12:44:17Z
  screenshot: evidence/E8-ngan.png
  observed: |
    Đã mở từng ảnh bằng Read. E8-ngan.png (375x812): ngăn «Lọc theo nhu cầu» mở từ dưới lên, năm mục theo thứ tự Giá (Từ–Đến tỷ) · Phòng ngủ (1PN 3, 2PN 11, 3PN 5) · Toà (Toà A 8, Toà B 11) · Diện tích (Từ–Đến m²) · Hướng (Bắc 2, Đông Bắc 4, Đông Nam 3, Nam 3, Tây Bắc 3, Tây Nam 4); nút «Xem 19 căn», «Xoá lọc». Thanh đầu trước lọc: 19 căn. E8-loc.png: thanh đầu «4 căn», nút «Lọc · 3», ba thẻ lọc «2–5 tỷ», «2PN», «Toà A», «Xoá lọc»; bốn thẻ trong nhóm TOÀ A: A-15.04 4,2 tỷ 2PN (Đang giao dịch), A-13.03 3,9 tỷ 2PN (Đang giao dịch), A-11.02 3,08 tỷ 2PN, A-08.03 4,95 tỷ 2PN (không ảnh, khung giữ chỗ). Mọi thẻ giá 2–5 tỷ, 2PN, Toà A. Nút: Giá 2–5 → «Xem 13 căn»; +2PN → «Xem 9 căn»; +Toà A → «Xem 4 căn» (19→13→9→4, giảm dần); dung-b.mjs in đáp án 4 căn, khớp. E8-step4-truoc-xem.png là khung phụ trước khi bấm Xem (chưa mở lại).
  network_observed: clean

- eval: E9
  run_id: minted-bang-hang-dang-the-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-03T12:44:17Z
  screenshot: evidence/E9-the-loc.png
  observed: |
    E9-the-loc.png: khung 375 toi, 'Bảng hàng', '4 căn', nut 'Lọc · 3', hang the loc '2–5 tỷ ×', 'Bắc ×', 'Đông Bắc ×', 'Xoá lọc'; ben duoi 1 can Toa A (A-11.02) + 3 can Toa B (B-13.02, B-08.02, B-14.02), deu 2PN, Dong Bac, gia 3,08–4,38 ty. Khop Expected. E9-step3.png: sau bam x Bac: 'Lọc · 2', the '2–5 tỷ ×' va 'Đông Bắc ×', 'Xoá lọc', van 4 can cung 4 the — khop (chi mat the Bac). E9-step4.png: sau Xoa loc: '19 căn', nut 'Lọc' khong so, khong the loc, danh sach Toa B 11 can B-08.04... — bang so luc chua loc, khop. E9-loc-rong.png: '0 căn', 'Lọc · 1', the 'Từ 900 tỷ ×' + 'Xoá lọc', giua man hinh bieu tuong + 'Không căn nào khớp nhu cầu' + nut 'Xoá lọc' — khop. E9-step6.png: sau bam nut 'Xoá lọc' o trang thai rong: '19 căn', danh sach day du (B-08.04, B-03.04, ...) — khop.
  network_observed: clean

- eval: E10
  run_id: E10-20261103
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-03T12:44:17Z
  screenshot: evidence/E10-step1.png
  observed: |
    Đã mở bằng Read các frame E10-giu-lau.png, E10-ba-the.png, E10-cham-that.png, E10-cham-that-ma.png. Khổ 375x812, giao diện tối, tab dưới Hôm nay/Bảng hàng/Gửi/Tôi. E10-giu-lau.png: thanh đầu «1 căn đã chọn» + nút «Bỏ chọn». Thẻ B-08.04 (Đang giao dịch) có ô chọn mờ, không tích. Thẻ B-03.04 (Đang bán thứ nhất) có dấu tích. Các thẻ Đang bán khác có ô trống. E10-ba-the.png: đã cuộn nên thanh đầu khuất, đọc qua DOM là «2 căn đã chọn»; hình có đúng 2 thẻ tích (B-03.04, B-15.05), B-14.04 (thẻ thứ hai) không tích. E10-cham-that.png: chạm thật 800 ms trên ảnh thẻ thứ nhất, thanh đầu «1 căn đã chọn» + «Bỏ chọn», B-03.04 tích, không có menu, hộp xem trước hay hộp thoại nào hiện. E10-cham-that-ma.png: chạm trên chữ mã căn thẻ thứ hai, chỉ B-14.04 tích, không menu hay hộp xem trước. Khớp Expected.
  network_observed: clean

- eval: E11
  run_id: minted-bang-hang-dang-the-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-03T12:44:17Z
  screenshot: evidence/E11-step1.png
  observed: |
    E11-step1.png: đã lọc, thẻ «Từ 2 tỷ» có ở thanh lọc, danh sách 19 căn. E11-step2.png: trong chế độ chọn, B-03.04 và B-14.04 có ô tích đã bật (2 căn đã chọn), B-08.04 Đang giao dịch ô trống, thẻ lọc «Từ 2 tỷ» còn, vẫn ở danh sách (không mở hồ sơ). E11-step3.png: đã cuộn, dòng nhóm «8 căn · TOÀ A», thẻ đầu A-15.04 (Đang giao dịch), kế A-04.06, A-13.01, A-13.03, A-11.02. E11-ho-so.png: hồ sơ A-13.01 · Đang bán · 3,09 tỷ · Bao phí, Toà A, [Mẫu] Dự án căn hộ thử; mục Ảnh có ba tab «Gửi được (1)», «Tự có từ mã», «Nội bộ» (có ổ khoá), ảnh bìa ở Gửi được; thuộc tính căn (loại căn, diện tích, tầng, hướng...); không có tên chủ nhà, số điện thoại, giá đáy hay ảnh sổ. E11-step5.png: tab Nội bộ chọn → hộp «Ngăn nội bộ — Chỉ người giữ căn và trưởng nhóm xem», không có ảnh. E11-lui.png: trở lại danh sách, dòng «8 căn · TOÀ A» ở trên, A-15.04 là thẻ đầu đang thấy, kế A-04.06, A-13.01, A-13.03, A-11.02 — giống E11-step3.png; (thẻ lọc nằm ngoài vùng cuộn nhưng DOM xác nhận «Từ 2 tỷ» còn). Khớp Expected.
  network_observed: clean

- eval: E12
  run_id: E12-ui-verify
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-03T12:44:17Z
  screenshot: evidence/E12-anh-bia.png
  observed: |
    E12-anh-bia.png (375x812, lọc Toà A, 8 căn): thẻ A-04.06 hiện ảnh thật (nền vàng-xanh có sọc xanh tím), thẻ A-15.04 cũng có ảnh; DOM thẻ A-04.06 có đúng 1 img, src /api/v1/units/photos/6fed0b5e-31d3-4dd1-89b2-4eae25be88db/thumb (đúng id ảnh bìa ngăn Gửi được do dung-b in, naturalWidth 160). E12-anh-trong.png: thẻ A-06.03 (chỉ ảnh Nội bộ) và A-08.03 (không ảnh) là ô xám trống có biểu tượng ảnh; DOM hai thẻ này 0 img, 1 svg. Các căn khác cùng khung có ảnh vẽ màu. E12-offline.png: sau khi tắt mạng (biểu tượng đám mây gạch ở thanh trên), cuộn vùng cuộn trong tới các thẻ Toà A chưa từng render ở lần tải này: toàn bộ ô ảnh là ô xám trống có biểu tượng, 0 img (kể cả A-04.06 và A-15.04 vốn có ảnh khi online). E12-offline-ho-so.png: chạm thẻ A-11.02 khi offline thì URL đổi thành /inventory?unit=A-11.02&toa=Toà A&lan=… và hồ sơ mở (Thuộc tính căn, Lần rao đang mở, Các lần rao, Lịch sử), có thông báo Lịch sử cần mạng để tải. Khớp Expected.
  network_observed: clean

- eval: E13
  run_id: minted-bang-hang-dang-the-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-03T12:44:17Z
  screenshot: evidence/E13-step1.png
  observed: |
    Đã mở bằng Read từng khung ở 375x812. THẺ-TỐI (E13-the-toi.png): nền đen, tiêu đề «Bảng hàng», «19 căn», nút Lọc và Chọn, dòng nhóm «11 căn — TOÀ B», thẻ đầu B-08.04 (4,53 tỷ, Bao phí, 82,3 m², 2PN, Tây Nam) có huy hiệu «Đang giao dịch», ảnh vẽ bằng mã; thẻ hiện đúng. ĐANG TẢI-TỐI (E13-dang-tai-toi.png, bắt được sau ~0,5 s dưới Slow 3G sau khi xoá IndexedDB): sáu hàng khung chờ hình dòng tin (vòng tròn + hai thanh xám, 18 ô xương), không có chữ nào ngoài tiêu đề «Bảng hàng», thanh dưới và biểu tượng đồng bộ; body không có chữ «Loading» (đã kiểm = false); vùng role=status aria-busy aria-label «Đang tải» có data-cho-tai-kieu=dong-tin. Khung chờ là hình DÒNG TIN (vòng tròn + 2 thanh), không phải hình thẻ ảnh vuông 112px, nên lệch với chữ «khung chờ hình thẻ» của Expected. TRỐNG-TỐI: «Chưa có căn nào trên bảng hàng chung», mô tả «Căn lên đây khi đầu chủ bấm «Sẵn sàng bán».», nút «Về Hôm nay» (đúng chữ Expected); góc dưới trái có chip «1 Issue» của Next dev overlay, do cảnh báo console Base UI: Button render Link thiếu nativeButton={false} ở BangThe (tệp bang-the.tsx, nút «Về Hôm nay»). LỖI-TỐI: khung đỏ nhạt, «Chưa tải được bảng hàng», mô tả «Cần mạng cho lần tải đầu trên máy này.», nút «Thử lại»; gỡ chặn và bấm Thử lại thì thẻ hiện lại (11 thẻ trong DOM; E13-loi-thu-lai-toi.png và E13-loi-thu-lai-sang.png). Bốn khung SÁNG (the, dang-tai, trong, loi) cùng nội dung và chữ, nền trắng, huy hiệu «Đang giao dịch» tím trên xanh lá; khung chờ sáng xám rất nhạt. NĂM NGHÌN-ĐẦU (E13-nam-nghin-dau.png): «2375 căn», nhóm «1000 căn — TOÀ A», thẻ A-06.03-M47…, A-04.06-M3726, A-15.04-M1378…; ô ảnh trống (biểu tượng ảnh) vì hàng đo cuộn nạp ảnh bằng SQL không có byte; [data-the-can] = 12. NĂM NGHÌN-CUỐI (E13-nam-nghin-cuoi.png): cuộn tới đáy 304.248 px, thẻ cuối B-15.05-M1079 (Toà B), 11 thẻ trong DOM. Đối chiếu Expected: khớp, trừ khung chờ (hình dòng tin, không phải hình thẻ).
  network_observed: clean

- eval: E14
  run_id: minted-bang-hang-dang-the-E14-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-03T12:44:17Z
  output: |
    Lệnh: npm run lint
    chuẩn giao diện: đạt

- eval: E15
  run_id: minted-bang-hang-dang-the-E15-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-03T12:44:17Z
  output: |
    Lệnh: npm run typecheck
    (không in lỗi nào, mọi gói qua)

- eval: E16
  run_id: minted-bang-hang-dang-the-E16-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-03T12:44:17Z
  output: |
    Lệnh: node "$R/scripts/design-floor-s4.mjs" --root .
    (không in dòng lỗi nào)

- eval: E17
  judged_by: judge panel (ba lăng kính, context sạch)
  verdict: PASS
  rationale: Ba lăng kính đồng thuận: cả bốn câu «có» kèm câu trích từ bốn tệp (bang-hang.md, vo-va-ia.md, catalog.md, tham-chieu.md §12); câu cũ «khối báo bảng thẻ» không còn. Riêng ngoai_le_han của khuôn bang-hang không có bản cũ để so, chỉ xác nhận còn nguyên ba mục.
  human_override:  # chi nguoi ghi

- eval: E18
  run_id: minted-bang-hang-dang-the-E18-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-03T12:44:17Z
  output: |
    Lệnh: node "$R/scripts/design-floor-khuon.mjs" --kiem --root .
    11 tệp giao diện ngoài bản đồ

### Judge panels (đề xuất)

- E17 — đề xuất: PASS
  - domain-correctness: PASS — cả bốn ý đều có trong bốn tệp; vo-va-ia.md không còn «khối báo bảng thẻ»; catalog.md có hai dòng đủ nhóm bang-hang; tham-chieu.md §12 có dòng 03/11. Không có bản cũ để so riêng ngoai_le_han.
  - operational-feasibility: PASS — bốn câu đều có, đọc từ bốn tệp (bang-hang.md dòng 21, vo-va-ia.md dòng 163-166, catalog.md dòng 93-94, tham-chieu.md dòng 368); ba mục ngoai_le_han không có bản cũ để đối chiếu nhưng không có dấu hiệu bị đổi.
  - spec-alignment: PASS — cả bốn câu đều có; câu (1) chỉ so được nhan_dien và ngoai_le với mô tả trong câu hỏi, ngoai_le_han chỉ xác nhận có mặt; câu cũ «là khối báo» không còn trong vo-va-ia.md.
  - human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-bang-hang-dang-the-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-03T12:44:17Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-bang-hang-dang-the-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-03T12:44:17Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-bang-hang-dang-the-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-03T12:44:17Z

- cmd: npm run test:hooks
  run_id: minted-bang-hang-dang-the-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-03T12:44:17Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-bang-hang-dang-the-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-03T12:44:17Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả code mới lẫn baseline; chứng minh harness chứ chưa chứng minh tính năng — nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- npm test -w @quy-hang/web: E1, E2, E3, E4, E5, E6
- npm run lint: E14
- npm run typecheck: E15
- node "$R/scripts/design-floor-s4.mjs" --root . : E16
- node "$R/scripts/design-floor-khuon.mjs" --kiem --root . : E18

Baseline không đo (n-a): E7, E8, E9, E10, E11, E12, E13 (eval ui-check, không chạy được trên baseline).

## Variance

none — mọi eval chạy một lần và xác định (runs 1), không có phương sai.

## Iterations

Round 1: mọi eval đạt (E1-E16, E18 máy; E17 hội đồng đề xuất PASS) — không có eval trượt.

### Re-pin lần 1 — 2026-11-03, do gộp main (PR #97, #98) sau lượt chấm
run_id: repin-20261103T141032Z-96991
sha: c3c1fff1df0ac05ec5ef00aad717ad6553a6bd34 · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E7, E8, E9, E10, E11, E12, E13, E17 · AC không có chốt máy: AC-6, AC-8

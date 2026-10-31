---
schema_version: 2
feature_slug: bang-hang-kieu-sheet
verdict: REJECT
failed_evals: [E11]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 19bd47cc294db2587839c51339ef31c3d84d1b47
human_signoff:
---

# Evidence Report: bang-hang-kieu-sheet

Round 2. Bài đo cuộn E11 trượt ngưỡng; các eval còn lại đạt hoặc carry-forward từ round 1.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | ui-check | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-4 | ui-check | PASS |
| E6 | AC-5 | ui-check | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-6 | ui-check | PASS |
| E9 | AC-7 | ui-check | PASS |
| E10 | AC-8 | ui-check | PASS |
| E11 | AC-9 | script | FAIL |
| E12 | AC-10 | script | PASS |
| E13 | AC-10 | script | PASS |
| E14 | AC-10 | script | PASS |
| E15 | AC-10 | judgment | UNCERTAIN |

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline):
- npm test -w @quy-hang/web: E3b

Baseline không đo
- node _acceptance/bang-hang-kieu-sheet/thu/do-cuon.mjs: bo qua baseline: tep _acceptance/bang-hang-kieu-sheet/thu/do-cuon.mjs co o cay dang kiem nhung chua co o merge-base 27b59647d5dca68c76785e4808da2cf664d73771 — eval moi, chay tren code cu khong phan biet gi

Lệnh trượt: node _acceptance/bang-hang-kieu-sheet/thu/do-cuon.mjs gắn với E11 (xem khối E11). Không có lệnh trượt nào không gắn eval.

## Evidence

- eval: E3
  run_id: minted-bang-hang-kieu-sheet-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T16:41:51Z
  screenshot: evidence/E3-bang.png
  observed: |
    E3-bang.png (dau-chu-1, 1440x900): 16 tiêu đề đúng thứ tự Toà, Mã căn, Loại căn, Diện tích, Tầng, Hướng, Trạng thái, Giá, Phí, Nội thất, Pháp lý, Tài chính, Tình trạng sử dụng, Xác nhận, Mức đủ, Ai thấy (đọc từ DOM; ảnh thấy tới Nội thất, phần còn lại cuộn ngang). Chân bảng «33 / 33 căn». 3 dòng đầu (nhóm Toà → Loại căn): A-11.01 Ngừng hẳn, giá «—»; A-13.01 Đang bán 3,09 tỷ; A-13.03 Đang giao dịch 3,9 tỷ. Giá dạng «x,xx tỷ»; trạng thái là Badge chữ Việt (Ngừng hẳn đỏ, Đang bán xanh, Đang giao dịch tím, Đã bán xám, Tạm ngừng vàng). Nhóm cấp một: Toà A 18 căn (1PN 2, 2PN 10, 3PN 6), Toà B 15 căn; 18+15=33=N. E3-cot-an.png: sau khi bật qua menu Cột (E3-menu-cot.png) có 19 tiêu đề, thêm Giá chốt, Ngày bán, Lý do ngừng ở cuối (trước đó 16, không có ba cột); hàng đã bán ghi giá chốt 4,65 tỷ, ngày 2026-10-20; A-11.01 lý do «Không liên lạc được». E3-dau-chu-2.png: dòng tổng «33 / 33 căn», nhóm Toà A 14 căn, Toà B 19 căn, dòng đầu A-13.01 (không thấy A-11.01 «Chỉ tôi»). E3-step5-loc-ma.png và E3-loc-*.png: Nhóm = Không nhóm, lọc Mã căn ra đúng 1 dòng «1 / 33 căn», Badge «Đang bán» xanh, giá 4,61 tỷ.
  network_observed: n-a (driver)

- eval: E3b
  run_id: minted-bang-hang-kieu-sheet-E3b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-10-31T16:41:51Z
  output: |
    ℹ duration_ms 368.758292

- eval: E5
  run_id: E5-20261101-0039
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T16:41:51Z
  screenshot: evidence/E5-hang-loc.png
  observed: |
    E5-hang-loc.png (1440x900, theme toi): bang 'Bang hang' dau-chu-1 sàn thu, '33 / 33 can', nut Loc dang bat, hang loc ngay duoi tieu de: Toa = chon 'Moi toa', Ma can = o chu 'Chua...', Loai can = chon 'Moi loai', Dien tich = o so '>60', Tang = '5-15', Huong = chu 'Chua...', Trang thai = chon 'Moi trang thai', Gia = so '<=5 (ty)', Phi = chon 'Moi dieu kien', Noi that = chu. Nhom Toa A 18 can -> 1PN 2 can, 2PN 10 can, 3PN 6 can. E5-hang-loc-phai.png (cuon phai): Noi that, Phap ly, Tai chinh, Tinh trang su dung = o chu 'Chua...'; Xac nhan = o so '<14 (ngay)'; Muc du = o so '>=3'; Ai thay = chon 'Moi nac'. Du 16 cot, khop Expected. E5-ba-loc.png: dau 'Loc 3', '2 / 33 can', o Ma can 'a-1', Trang thai chon 'Dang ban', Gia '<=5'; nhom Toa A 2 can: 1PN A-13.01 (Dong Nam, badge Dang ban, 3,09 ty, Bao phi) va 2PN A-11.02 (Dong Bac, Dang ban, 3,08 ty, Bao phi) - khop Expected (ma chua a-1, Dang ban, gia <=5 ty). E5-step4.png: sau 'Xoa moi o loc' hang loc tro ve placeholder, '33 / 33 can', danh sach day du 1PN/2PN... khop 'N / N can'. E5-loc-rong.png: o Ma can 'zzz', '0 / 33 can', khu vuc bang trong voi bieu tuong phieu loc, chu 'Khong can nao khop bo loc' va nut 'Xoa loc' - khop Expected.
  network_observed: clean

- eval: E9
  run_id: minted-bang-hang-kieu-sheet-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T16:41:51Z
  screenshot: evidence/E9-step1.png
  observed: |
    step1: luoi gom Toà A 18 can > 1PN 2 can, 2PN 10 can, 3PN 6 can; chi bao "Đã đồng bộ · 23:52"; 33 / 33 căn; nhom Toà → Loại căn. step2: o Gia A-13.01 duoc chon (khung vien) con nguyen "3,09 tỷ" sau go 123, Delete, dan 9; chi bao "Đã đồng bộ · 23:52" (khong doi). step3: Lọc 1 (Trạng thái = Đang bán), 14 / 33 căn, Nhóm: Toà (Toà A 6 căn, Toà B 8 căn), cot Giá co mui ten sap tang dan (3,08; 3,09; 4,95; 5,55...). step4: vung chon 2 hang x 3 o (Loại căn, Diện tích, Tầng cua A-11.02 va A-13.01) khung vien, gia tri 2PN 68,5 m² 11 / 1PN 54,2 m² 13 khop clipboard. E9-mat-mang: tieu de "Đã đồng bộ · 23:54" (chua co luot keo nao khi offline), Lọc 2, 7 / 33 căn, Nhóm Toà → Loại căn: Toà A 3 căn > 2PN 3 căn (A-11.02, A-08.03, A-06.03), Toà B 4 căn > 2PN 4 căn (B-08.02, B-13.02, B-14.04, B-03.04). step7: chi bao "Mất mạng · đang xem bản trên máy", 33 / 33 căn, Toà A 18 căn > 1PN 2 căn, 2PN 10 căn, 3PN 6 căn — giong luc co mang. step8: cung chi bao mat mang, Toà A 18 căn > "Chưa rõ 18 căn", moi hang cot Loại căn = "Chưa rõ", Diện tích/Tầng/Hướng = "—" — dung Expected (danh muc xoa -> Chưa rõ). Tat ca khop Expected.
  network_observed: clean

- eval: E11
  run_id: minted-bang-hang-kieu-sheet-E11-r2
  exit_code: 1
  baseline: n-a
  verifier: _acceptance/bang-hang-kieu-sheet/thu/do-cuon.mjs
  verified_at: 2026-10-31T16:41:51Z
  output: |
    lượt 1: hiệu chuẩn 16.7 ms · p95 50.1 ms · khung > 50 ms 7.09% · dòng cuối thấy 5000
    lượt 2: hiệu chuẩn 16.8 ms · p95 50.1 ms · khung > 50 ms 11.07% · dòng cuối thấy 5000
    lượt 3: hiệu chuẩn 16.8 ms · p95 50.1 ms · khung > 50 ms 9.31% · dòng cuối thấy 5000
    đối chứng bận 60 ms: p95 166.6 ms · khung > 50 ms 96.4%
    trung vị: {"p95":50.1,"ty_le_cham":0.0931,"dong_cuoi_thay":5000} → trượt: p95 50.1 ms > 33.4 ms; khung > 50 ms 0.0931 > 0.01

### Eval carry-forward từ round 1

- eval: E1
  run_id: minted-bang-hang-kieu-sheet-E1-r1
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-10-31T16:03:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-bang-hang-kieu-sheet-E2-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-10-31T16:03:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-bang-hang-kieu-sheet-E4-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-10-31T16:03:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: E6-bang-hang-kieu-sheet-2026-10-31
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T16:03:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/E6-mac-dinh.png
  observed: |
    Mặc định Nhóm Toà → Loại căn, tổng «33 / 33 căn»: Toà A 18 căn gồm 1PN 2, 2PN 10, 3PN 6; Toà B 15 căn gồm 1PN 2, 2PN 8, 3PN 5 — tổng nhóm con khớp nhóm cha.
    Gập Toà A ẩn mọi nhóm con và dòng căn; chọn Nhóm Toà chỉ còn một cấp; Không nhóm thì không hàng nhóm. Lọc Trạng thái Đang bán còn «14 / 33 căn»: Toà A 6 + Toà B 8 = 14, mọi dòng là Badge Đang bán.
  network_observed: clean

- eval: E7
  run_id: minted-bang-hang-kieu-sheet-E7-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-10-31T16:03:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-bang-hang-kieu-sheet-E8-r1
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T16:03:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/E8-ten-rong.png
  observed: |
    Hộp «Lưu góc nhìn» với ô Tên viền đỏ và chữ báo «Đặt tên cho góc nhìn» ngay dưới ô, không lưu. Sau khi lưu, «2PN dưới 5 tỷ» hiện ở cột «Góc nhìn của tôi»; mở lại ra đúng bốn phần (Đang bán, ẩn Hướng, Giá tăng dần, Nhóm Toà, 14/33 căn); đối chứng lưới mặc định khác cả bốn phần.
    Có nhãn «Đã đổi» kèm Lưu đè / Lưu thành mới; đổi tên, hộp xác nhận xoá và mục biến mất đều khớp. dau-chu-2 chưa có góc nhìn; Sàn trống không có Thử-A, về Sàn thử thì hiện lại; id lạ hiện «Góc nhìn này không có trên máy này» kèm nút về Bảng hàng.
  network_observed: clean

- eval: E10
  run_id: E10-2026-10-31-cdp
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T16:03:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/E10-trong-toi.png
  observed: |
    Trống (tối và sáng): «Sàn chưa có hàng nào» kèm nút viền «Nhập Excel». Đang tải: thanh công cụ xám và 8 dòng xám đúng bố cục lưới, không chữ «Loading». Lỗi: Alert đỏ «Chưa tải được bảng hàng» kèm «Thử lại», bấm thì lưới hiện lại đủ «33 / 33 căn».
    Điện thoại 375x812: khối «Bảng hàng dạng thẻ trên điện thoại dựng ở mục 32», không tràn ngang. Không có nút chữ trong khối điện thoại nên không đo tương phản nút ở hai ô này.
  network_observed: unscoped-partial

- eval: E12
  run_id: minted-bang-hang-kieu-sheet-E12-r1
  exit_code: 0
  verifier: config:executors.script.typecheck
  verified_at: 2026-10-31T16:03:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-bang-hang-kieu-sheet-E13-r1
  exit_code: 0
  verifier: config:executors.script.lint
  verified_at: 2026-10-31T16:03:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E14
  run_id: minted-bang-hang-kieu-sheet-E14-r1
  exit_code: 0
  verifier: config:executors.script.design_floor
  verified_at: 2026-10-31T16:03:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

### Judgment

Panel đề xuất: PASS. Phiếu từng lens:
- domain-correctness: PASS — Cả bốn tệp khớp (bang-hang.md đủ chín khoá, vo-va-ia.md, catalog.md, tham-chieu.md §12); chưa đọc tiêu đề hai bảng của catalog và chưa thấy chữ xác nhận «các thành phần ui khối kéo theo đã có sẵn».
- operational-feasibility: PASS — Cả bốn ý đúng với các tệp input; các thành phần ui khối cần đã có trong bảng catalog.
- spec-alignment: UNCERTAIN — Ý (1), (2), (4) khớp; ý (3) chỉ khớp một nửa vì không tệp nào nói các thành phần ui khối kéo theo đã có sẵn.

- eval: E15
  judged_by: judge-subagent (fresh context)
  verdict: UNCERTAIN
  rationale: Ý (3) về catalog chỉ khớp một nửa: có dòng khối và dòng data-grid, contract ghi cascader không cài, nhưng không tệp nào xác nhận thành phần ui khối kéo theo đã có sẵn; mệnh đề «chỉ cài đúng thư mục data-grid» chưa kiểm được.
  required_evidence:
    - Danh sách tệp hiện có dưới apps/web/src/components/ui (Glob apps/web/src/components/ui/*) so với các import của apps/web/src/components/reui/data-grid/*: nếu mọi thành phần ui khối cần đều đã có và không có tệp ui nào do hàng 14 thêm thì mục (3) PASS
    - Hoặc một câu trong catalog.md (bảng «Thành phần đã cài») hay contract.md Notes nói rõ hàng 14 không thêm tệp ui nào, chỉ thêm thư mục reui/data-grid
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-bang-hang-kieu-sheet-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-10-31T16:41:51Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-bang-hang-kieu-sheet-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-10-31T16:41:51Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-bang-hang-kieu-sheet-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-10-31T16:41:51Z

- cmd: npm run test:hooks
  run_id: minted-bang-hang-kieu-sheet-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-10-31T16:41:51Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-bang-hang-kieu-sheet-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-10-31T16:41:51Z

- cmd: npm run typecheck
  run_id: minted-bang-hang-kieu-sheet-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-10-31T16:41:51Z

- cmd: npm run lint
  run_id: minted-bang-hang-kieu-sheet-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-10-31T16:41:51Z

## Known limits

## Ngoài hợp đồng

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E4, E6, E7, E8, E10, E12, E13, E14 đạt; nay carry-forward.
Round 2: E11 trượt — trung vị p95 50.1 ms vượt ngưỡng 33.4 ms và tỷ lệ khung chậm 9.31% vượt 1%, dù đối chứng bận 60 ms trượt đúng (máy đo phân biệt được). Trả về giai đoạn cài đặt.

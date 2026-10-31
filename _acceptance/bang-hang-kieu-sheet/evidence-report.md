---
schema_version: 2
feature_slug: bang-hang-kieu-sheet
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 50ed75c1482bd307e78e5b0cf33c2c4b0749d2fd
human_signoff:
---

# Evidence Report: bang-hang-kieu-sheet

Round 4. Không eval nào trượt, nhưng lệnh suite `npm run lint` không qua và không gắn eval nào, nên kết luận là REJECT. Lỗi lint nằm ở ba chỗ trong tệp phụ của bài thử: `.acceptance-runs/e6/run.mjs` (hai biến khai báo mà không dùng) và `_acceptance/bang-hang-kieu-sheet/thu/dung-b.mjs` (một khối rỗng). E13 mang từ round 3 sang, chưa chạy lại ở round này, và lệnh lint chung hiện đang đỏ.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS (carry-forward từ round 1) |
| E2 | AC-2 | test | PASS (carry-forward từ round 3) |
| E3 | AC-3 | ui-check | PASS (carry-forward từ round 3) |
| E3b | AC-3 | test | PASS (carry-forward từ round 3) |
| E4 | AC-4 | test | PASS (carry-forward từ round 3) |
| E5 | AC-4 | ui-check | PASS (carry-forward từ round 3) |
| E6 | AC-5 | ui-check | PASS (carry-forward từ round 3) |
| E7 | AC-6 | test | PASS (carry-forward từ round 3) |
| E8 | AC-6 | ui-check | PASS |
| E9 | AC-7 | ui-check | PASS (carry-forward từ round 3) |
| E10 | AC-8 | ui-check | PASS (carry-forward từ round 3) |
| E11 | AC-9 | script | PASS (carry-forward từ round 3) |
| E12 | AC-10 | script | PASS (carry-forward từ round 3) |
| E13 | AC-10 | script | PASS (carry-forward từ round 3) |
| E14 | AC-10 | script | PASS (carry-forward từ round 3) |
| E15 | AC-10 | judgment | UNCERTAIN |

## Evidence

- eval: E8
  run_id: minted-bang-hang-kieu-sheet-E8-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T22:08:27Z
  screenshot: evidence/E8-ten-rong.png
  observed: |
    Đã mở bằng Read các frame chính, đối chiếu Expected: (1) E8-ten-rong.png: hộp «Lưu góc nhìn», ô Tên viền đỏ với placeholder «Ví dụ: 2PN dưới 5 tỷ» và dòng đỏ dưới ô «Đặt tên cho góc nhìn»; nền mờ là lưới đã lọc Đang bán, nhóm Toà; không lưu (đúng). (2) E8-cot.png: cột thứ hai mở, «GÓC NHÌN CỦA TÔI» có mục «2PN dưới 5 tỷ» (đang sáng); nút Góc nhìn đổi thành «2PN dưới 5 tỷ ▾»; lưới 14/33 căn, ô lọc Trạng thái «Đang bán», Giá có mũi tên tăng dần, Nhóm «Toà», tiêu đề cột không có Hướng (Toà, Mã căn, Loại căn, Diện tích, Tầng, Trạng thái, Giá, Phí…) (đúng). (3) E8-trung-ten.png: hộp với «2pn DƯỚI 5 TỶ», dòng đỏ «Đã có góc nhìn tên này» (đúng, trùng khác hoa thường). (4) E8-mo-lai.png: sau tải lại và bấm mục ở cột thứ hai, lưới 14/33, Trạng thái=Đang bán, Giá tăng dần, Nhóm=Toà, không cột Hướng — khớp cả bốn (địa chỉ /inventory/views/<id> đọc từ DOM; trước khi bấm lưới mặc định 33/33, có Hướng, không sắp, Nhóm Toà→Loại căn). (5) E8-da-doi.png: cạnh tên «2PN dưới 5 tỷ» có nhãn cam «Đã đổi», 33/33 căn, ô Trạng thái «Mọi trạng thái»; E8-da-doi-menu.png: menu mở ra gồm «Góc nhìn của tôi / 2PN dưới 5 tỷ», «Lưu đè», «Lưu thành góc nhìn mới…», «Đổi tên…», «Xoá góc nhìn…» (nút Lưu đè và Lưu thành mới nằm trong menu, không có nút rời). (6) E8-xoa-xac-nhan.png: hộp «Xoá góc nhìn «Đang bán toà»?», mô tả «Bảng hàng không đổi; chỉ mất cách xem đã lưu trên máy này.», nút Giữ lại / Xoá. (7) E8-san-trong.png: Sàn trống, cột thứ hai «Chưa có góc nhìn», nội dung «Góc nhìn này không có trên máy này / Về Bảng hàng» (không có Thử-A). (8) E8-ve-san-thu.png: Sàn thử, cột thứ hai có «Thử-A» đang sáng, nút Góc nhìn «Thử-A». (9) E8-khong-co.png: /inventory/views/khong-co hiện «Góc nhìn này không có trên máy này» và nút «Về Bảng hàng». Tất cả khớp Expected; không frame nào mâu thuẫn. Các ghi nhận dạng chữ (sau Lưu đè không còn lọc Trạng thái; dau-chu-2 không thấy «Thử»; khoá localStorage chứa user.id + activeCompany.id đúng /api/v1/me) lấy từ DOM/localStorage/API trong log chạy.
  network_observed: clean

### Eval mang từ round trước (carry-forward)

- eval: E1
  run_id: minted-bang-hang-kieu-sheet-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-10-31T16:03:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-bang-hang-kieu-sheet-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-10-31T18:22:36Z
  carried_from_round: 3
  # carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-bang-hang-kieu-sheet-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T18:22:36Z
  carried_from_round: 3
  # carry-forward tu round 3 — delta khong cham paths cua eval
  screenshot: evidence/E3-bang.png
  observed: |
    E3-bang.png (dau-chu-1, 1440x900, giao diện tối): mười sáu tiêu đề đúng thứ tự Toà, Mã căn, Loại căn, Diện tích, Tầng, Hướng, Trạng thái, Giá, Phí, Nội thất, Pháp lý, Tài chính, Tình trạng sử dụng, Xác nhận, Mức đủ, Ai thấy (đọc từ DOM; ảnh chỉ thấy tới Nội thất vì lưới chỉ vẽ cột đang thấy, các cột còn lại thấy ở khung cuộn phải). Chân bảng «33 / 33 căn». Ba dòng đầu: A-11.01 Ngừng hẳn, giá «—»; A-13.01 Đang bán, 3,09 tỷ; A-13.03 Đang giao dịch, 3,9 tỷ. Trạng thái là Badge có màu (đỏ, xanh lục, tím, xám, vàng) với chữ tiếng Việt. Giá dạng «4,65 tỷ», «3,83 tỷ». Nhóm cấp một (cuộn lưới đọc hết): Toà A 18 căn, Toà B 15 căn, 18+15=33=N; cấp hai 1PN/2PN/3PN.
    E3-menu-cot.png và E3-step3-menu.png: menu «Cột hiện trên bảng» liệt kê 16 cột đã tick và ba cột Giá chốt, Ngày bán, Lý do ngừng chưa tick, rồi ba mục này được tick sau khi bật. E3-cot-an.png (cuộn phải sau khi bật): có thêm ba tiêu đề Giá chốt, Ngày bán, Lý do ngừng sau Ai thấy, cùng Tình trạng sử dụng, Xác nhận, Mức đủ, Ai thấy; dòng A-01.03 Giá chốt 4,65 tỷ, Ngày bán 2026-10-20; A-11.01 Lý do ngừng «Không liên lạc được». Ba cột này không có ở danh sách 16 tiêu đề trước khi bật.
    E3-dau-chu-2.png: dau-chu-2 chân bảng «33 / 33 căn», nhóm Toà A 14 căn (khác dau-chu-1 ở chỗ phân bổ, tổng vẫn 33); dung-b.mjs in 33 cho dau-chu-2 nên khớp (bộ mẫu hiện không có chênh lệch số giữa hai người). Bốn ảnh E3-loc-*.png (Nhóm = Không nhóm, lọc Mã căn): A-01.03 Toà A 2PN 75 m² tầng 1 Tây Bắc, Đã bán 4,65 tỷ; A-04.06 Toà A 3PN 110,4 m² tầng 4 Bắc, Đang bán 8,06 tỷ; B-08.02 Toà B 2PN 68,5 m² tầng 8 Đông Bắc, Đang bán 3,36 tỷ; B-14.04 Toà B 2PN 82,3 m² tầng 14 Tây Nam, Đang bán 4,61 tỷ (đã xem ảnh B-14.04, khớp). Mỗi lần lọc chân bảng «1 / 33 căn».
  network_observed: clean

- eval: E3b
  run_id: minted-bang-hang-kieu-sheet-E3b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-10-31T18:22:36Z
  carried_from_round: 3
  # carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-bang-hang-kieu-sheet-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-10-31T18:22:36Z
  carried_from_round: 3
  # carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-bang-hang-kieu-sheet-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T18:22:36Z
  carried_from_round: 3
  # carry-forward tu round 3 — delta khong cham paths cua eval
  screenshot: evidence/E5-hang-loc.png
  observed: |
    E5-hang-loc.png: hàng lọc dưới tiêu đề, tổng «33 / 33 căn», nhóm «Toà → Loại căn». Ô lọc thấy được: Toà «Mọi toà» (chọn), Mã căn «Chứa…» (chữ), Loại căn «Mọi loại» (chọn), Diện tích «>60» và Tầng «5-15» (số), Hướng «Chứa…» (chữ), Trạng thái «Mọi trạng thái» (chọn), Giá «<=5 (tỷ)» (số), Phí «Mọi điều kiện» (chọn), Nội thất «Chứa…» (chữ). E5-hang-loc-phai.png (cuộn ngang): Nội thất, Pháp lý, Tài chính, Tình trạng sử dụng đều «Chứa…» (chữ), Xác nhận «<14 (ngày)» và Mức đủ «>=3» (số), Ai thấy «Mọi nấc» (chọn); đủ 16 cột có ô lọc.
    E5-ba-loc.png: nút Lọc huy hiệu 3, tổng «2 / 33 căn», Trạng thái «Đang bán», Giá «<=5», Mã căn «a-1»; còn hai dòng A-13.01 (1PN, Đang bán, 3,09 tỷ) và A-11.02 (2PN, Đang bán, 3,08 tỷ) dưới Toà A 2 căn. E5-step4.png: sau Xoá lọc trở lại «33 / 33 căn», mọi ô lọc về placeholder, đủ nhóm Toà A 18 căn. E5-loc-rong.png: «0 / 33 căn», Mã căn «zzz», Lọc huy hiệu 1, vùng giữa có biểu tượng phễu, chữ «Không căn nào khớp bộ lọc» và nút «Xoá lọc». Tất cả khớp Expected.
  network_observed: clean

- eval: E6
  run_id: E6-2026-11-01
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T18:22:36Z
  carried_from_round: 3
  # carry-forward tu round 3 — delta khong cham paths cua eval
  screenshot: evidence/E6-mac-dinh.png
  observed: |
    E6-mac-dinh.png (E6-step1.png la cung anh): 1440x900, dau-chu-1, /inventory. Dieu khien Nhom o goc phai tren ghi "Nhom: Toa -> Loai can". Hang nhom cap mot "Toa A 18 can", ben trong 3 hang cap hai thut vao "1PN 2 can", "2PN 10 can", "3PN 6 can"; 2+10+6 = 18. Thanh duoi "33 / 33 can".
    E6-gap-toa-a.png (E6-step2.png): sau khi gap Toa A, mui ten Toa A quay sang phai, chi con hang "Toa A 18 can" va "Toa B 15 can" + cac nhom con 1PN 2/2PN 8/3PN 5 va cac can B-xx cua Toa B; khong con dong nao cua Toa A - mo lai thi tro ve Toa A 18 voi 1PN 2/2PN 10/3PN 6.
    E6-toa.png (E6-step3.png): dieu khien "Nhom: Toa"; chi hang nhom "Toa A 18 can" (va Toa B 15 can khi cuon), cac can nam thang duoi, khong co hang loai can - mot cap nhom. E6-khong-nhom.png (E6-step4.png): "Nhom: Khong nhom"; khong co hang nhom nao (DOM: 0 hang nhom), chi dong can danh so 1..22 (virtual).
    E6-loc-dang-ban.png (E6-step5.png): "Nhom: Toa -> Loai can", Loc Trang thai = Dang ban, badge Loc 1, tong "14 / 33 can"; Toa A 6 can = 1PN 1 + 2PN 3 + 3PN 2 (=6); Toa B 8 can = 1PN 1 + 2PN 4 + 3PN 3 (=8); 6+8 = 14 = dong tong; cac dong can hien deu la "Dang ban". Tat ca khop Expected.
  network_observed: n-a (driver)

- eval: E7
  run_id: minted-bang-hang-kieu-sheet-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-10-31T18:22:36Z
  carried_from_round: 3
  # carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E9
  run_id: E9-20261101-0128
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T18:22:36Z
  carried_from_round: 3
  # carry-forward tu round 3 — delta khong cham paths cua eval
  screenshot: evidence/E9-step1.png
  observed: |
    Tôi mở từng frame bằng Read. E9-step1.png: lưới 1440x900 của Sàn thử, chỉ báo "Đã đồng bộ · 01:28", "33 / 33 căn", Nhóm "Toà → Loại căn", hàng nhóm Toà A 18 căn với 1PN 2 / 2PN 10 / 3PN 6, ô Giá A-13.01 là 3,09 tỷ. E9-step2.png: ô Giá của A-13.01 đang được chọn (có viền) và vẫn là "3,09 tỷ" sau gõ 123, Delete và dán 9; chỉ báo vẫn "Đã đồng bộ · 01:28". E9-step3.png: bộ lọc Trạng thái = "Đang bán" (14 / 33 căn, huy hiệu Lọc 1), Nhóm = Toà (Toà A 6 căn, Toà B 8 căn), cột Giá có mũi tên tăng dần và thứ tự 3,08 / 3,09 / 4,95 / 5,55 / 6,97 / 8,06 tỷ.
    E9-step4.png: vùng chọn có viền bao 2 hàng × 3 ô (Trạng thái, Giá, Phí): Đang bán, 3,08 tỷ, Bao phí / Đang bán, 3,09 tỷ, Bao phí. E9-mat-mang.png (cùng nội dung E9-step6.png): lúc offline, lọc Loại căn = 2PN cộng Trạng thái = Đang bán còn lại cho dòng tổng "7 / 33 căn", Nhóm Toà → Loại căn với Toà A 3 căn gồm 2PN 3 căn và Toà B 4 căn gồm 2PN 4 căn; lọc và nhóm vẫn chạy.
    E9-step7.png: sau khi chặn /api/v1/* và tải lại, chỉ báo "Mất mạng · đang xem bản trên máy", 33 / 33 căn, Toà A 18 căn với 1PN 2 / 2PN 10 / 3PN 6, trùng với lúc có mạng. E9-step8.png: sau khi xoá qh:danh-muc:v1:*, vẫn chặn API và tải lại, cột Loại căn toàn "Chưa rõ", Diện tích, Tầng, Hướng là "—", nhóm Toà A 18 căn chỉ còn "Chưa rõ 18 căn". Không có frame nào mâu thuẫn Expected.
  network_observed: clean

- eval: E10
  run_id: E10-2026-11-01-cdp-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T18:22:36Z
  carried_from_round: 3
  # carry-forward tu round 3 — delta khong cham paths cua eval
  screenshot: evidence/E10-step2.png
  observed: |
    step2 (trong-sang, 1440x900, trong@): header «[Mau] San trong», khung «Bang hang / Co hang gi, o dau?», ben duoi bieu tuong, chu dam «San chua co hang nao» va nut vien «Nhap Excel» chu xam; nen trang, dung Expected.
    step3 (dang-tai-sang): cung khung «Bang hang», ben trong 3 o xam o hang tren (2 ben trai, 1 ben phai) va 8 dong xam day ngang, khong chu «Loading»; chip header «Dang tai lan dau»; dung bo cuc luoi.
    step4 (loi-sang): chip «Mat mang · dang xem ban tren may»; hop do nhat «Chua tai duoc bang hang» kem nut «Thu lai»; dung Expected. step4b (sau Thu lai): luoi hien day, nhom Toa A -> 1PN/2PN/3PN, «33 / 33 can», chip «Da dong bo».
    step5 (dien-thoai-sang 375x812): thanh tren «Bang hang», khoi thong bao «Bang hang dang the tren dien thoai dung o muc 32», thanh tab duoi Hom nay/Bang hang/Toi; khong tran ngang.
    step6a-d (toi): cung bon trang thai tren nen den: trong hien «San chua co hang nao» + nut «Nhap Excel» xam sang; dang-tai co thanh va 8 dong xam toi; loi la hop do tham «Chua tai duoc bang hang» + «Thu lai»; dien-thoai hien khoi thong bao chu trang tren nen toi. Tat ca khop Expected; 8/8 o dat tuong phan >= 4.5:1.
  network_observed: clean

- eval: E11
  run_id: minted-bang-hang-kieu-sheet-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script
  verified_at: 2026-10-31T18:22:36Z
  carried_from_round: 3
  # carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-bang-hang-kieu-sheet-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.typecheck
  verified_at: 2026-10-31T18:22:36Z
  carried_from_round: 3
  # carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-bang-hang-kieu-sheet-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint
  verified_at: 2026-10-31T18:22:36Z
  carried_from_round: 3
  # carry-forward tu round 3 — delta khong cham paths cua eval. Lưu ý: lệnh lint chung chạy lại ở round 4 đang đỏ (xem khối suite bên dưới).

- eval: E14
  run_id: minted-bang-hang-kieu-sheet-E14-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.design_floor
  verified_at: 2026-10-31T18:22:36Z
  carried_from_round: 3
  # carry-forward tu round 3 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-bang-hang-kieu-sheet-SUITE-npm_test_w_quy_hang_core-r4
  exit_code: 0
  verified_at: 2026-10-31T22:08:27Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-bang-hang-kieu-sheet-SUITE-npm_test_w_quy_hang_api-r4
  exit_code: 0
  verified_at: 2026-10-31T22:08:27Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-bang-hang-kieu-sheet-SUITE-npm_test_w_quy_hang_connect-r4
  exit_code: 0
  verified_at: 2026-10-31T22:08:27Z

- cmd: npm run test:hooks
  run_id: minted-bang-hang-kieu-sheet-SUITE-test_hooks-r4
  exit_code: 0
  verified_at: 2026-10-31T22:08:27Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-bang-hang-kieu-sheet-SUITE-npm_test_w_quy_hang_ui_lint-r4
  exit_code: 0
  verified_at: 2026-10-31T22:08:27Z

- cmd: npm run typecheck
  run_id: minted-bang-hang-kieu-sheet-SUITE-typecheck-r4
  exit_code: 0
  verified_at: 2026-10-31T22:08:27Z

- cmd: npm run lint
  run_id: minted-bang-hang-kieu-sheet-SUITE-lint-r4
  exit_code: 1
  verified_at: 2026-10-31T22:08:27Z
  output: |
    eslint báo 3 lỗi, không gắn eval nào:
    .acceptance-runs/e6/run.mjs  dòng 9 'net' khai báo mà không dùng; dòng 14 'rows' khai báo mà không dùng (no-unused-vars)
    _acceptance/bang-hang-kieu-sheet/thu/dung-b.mjs  dòng 104 khối rỗng (no-empty)
    Các bước sau eslint (check-bare-disables, muc-no, kiem-chuan) không chạy vì eslint dừng trước.

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 2 — baseline khong do lai round nay

Eval không phân biệt được (pass trên cả code hiện tại lẫn baseline): E3b (`npm test -w @quy-hang/web`). Nên viết lại để assert hành vi mới, hoặc xác nhận đây là regression-guard có chủ ý. Baseline của mọi eval round này ghi n-a (không đo).

Lệnh không gắn eval và không qua: `npm run lint` (ba lỗi eslint ở tệp phụ của bài thử, nêu ở khối suite).

## Variance

none — every multi-run eval is uniform

## Judge

- eval: E15
  judged_by: hội đồng judge (panel giữ nguyên từ round 2 — inputs không đổi, không chấm lại; rationale xem round 2)
  proposal: PASS
  # panel giữ nguyên từ round 2
  - domain-correctness: PASS (r2)
  - operational-feasibility: PASS (r2)
  - spec-alignment: UNCERTAIN (r2)
  verdict: UNCERTAIN
  required_evidence:
    - Danh sách tệp hiện có dưới apps/web/src/components/ui (ví dụ Glob apps/web/src/components/ui/*) so với các import của apps/web/src/components/reui/data-grid/*: nếu mọi thành phần ui khối cần đều đã có và không có tệp ui nào do hàng 14 thêm thì mục (3) PASS
    - Hoặc một câu trong catalog.md (bảng «Thành phần đã cài») hay contract.md Notes nói rõ hàng 14 không thêm tệp ui nào, chỉ thêm thư mục reui/data-grid
  human_override:  # chi nguoi ghi

## Iterations

Round 2: E11 trượt ngưỡng cuộn 5.000 căn. Quay lại sửa hiệu năng (chỉ vẽ cột đang thấy).
Round 3: E8 trượt vì máy chủ thử dùng chung giữa các bài nhìn song song. Quay lại thêm khoá bật máy chủ thử.
Round 4: mọi eval chạy lại đều đạt (E8 đạt), nhưng lệnh suite lint đỏ với 3 lỗi ở tệp phụ của bài thử, không gắn eval nào. REJECT; quay lại sửa ba lỗi lint.

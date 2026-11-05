---
schema_version: 2
feature_slug: bang-hang-danh-sach-chi-tiet
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d783ab655d4a5f065562c768ce3ab82c3138e896
human_signoff: Manh Phan 2026-11-05
---

# Evidence Report: bang-hang-danh-sach-chi-tiet

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7a | AC-7 | test | PASS |
| E7b | AC-7 | ui-check | PASS |
| E7c | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |
| E9a | AC-9 | script | PASS |
| E9b | AC-9 | test | PASS |
| E9c | AC-9 | script | PASS |
| E10 | AC-10 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-bang-hang-danh-sach-chi-tiet-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T06:36:00Z
  screenshot: evidence/E1-1440.png
  observed: |
    Da mo bang Read ca hai frame. E1-1440.png (1440x900): vo gom thanh ben trai, thanh trai nho, thanh tren co o go ma can, +Lead, chip «Da dong bo · 13:38», chuong, avatar DA. Khung «Bang hang» o giua (x 280-973) co bang cuon; HO SO la cot ben phai NGOAI khung (x 990-1415), tieu de A-04.01, khong co lop phu/lam mo; mep tren cot ngang mep tren khung (y 75), mep duoi cot cham day vung lam viec (y ~891) cung day khung. Thanh tren khong bi che. E1-1280.png (1280x800): cung bo cuc, khung x 280-874, cot ho so x 891-1255, cung mep tren (75) va mep duoi (791); thanh tren day du, khong lop phu. Khop Expected. Luu y: o 1280 ben phai bang bi cat bot cot (cuon ngang trong khung, binh thuong); thanh tren khong co nut «dong bo» rieng ma la chip trang thai (khong phai nut) — cac nut thuc co (go ma can, +Lead, Viec tao khac, Thong bao, Tai khoan) deu elementFromPoint ra chinh no.
  network_observed: n-a (driver)

- eval: E2
  run_id: minted-bang-hang-danh-sach-chi-tiet-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T06:36:00Z
  screenshot: evidence/E2-keo-28.png
  observed: |
    Đã mở và đọc cả bốn ảnh mới (E2-keo-28.png, E2-keo-50.png ở 1440x900; E2-keo-28-1280.png, E2-keo-50-1280.png ở 1280x800). E2-keo-28.png: bảng trọn bên trái, đủ các cột Toà, Mã căn, Loại căn, Diện tích, Tầng, Hướng. Cột chi tiết bên phải hẹp (khoảng 28% vùng). Bốn nút Nhóm: Toà → Loại căn, Lọc, Cột, Xuất bảng hàng hiện đủ và không bị che. E2-keo-50.png: cột chi tiết rộng khoảng một nửa vùng, bảng bị ép lại còn Toà, Mã căn, Loại căn, cột Diện tích bị cắt. Bốn nút công cụ xuống dòng nhưng vẫn thấy rõ. E2-keo-28-1280.png: cột chi tiết hẹp, bảng thấy khoảng 6 cột, bốn nút còn thấy. E2-keo-50-1280.png: bảng thấy Toà, Mã căn, Loại căn (3 cột có phần bị cắt), cột chi tiết rộng nửa vùng. Số đo từ dòng e2: ở 1440 mở là 0.38 (425/1118), tiLeNhom 0.374; ở 1280 mở là 0.38 (364/958). Mọi ô bảng đều nằm bên trái cột (phải nhất 972 so với cột trái 990 ở 1440; 873 so với 891 ở 1280). Cả hai kích thước đều có bốn nút bấm được. soCotThay là 5 ở 1440 và 4 ở 1280. Kéo trái hết cỡ ra 0.5 (nhóm 0.493 / 0.491), kéo phải hết cỡ ra 0.28 (nhóm 0.276 / 0.275). Tất cả khớp Expected. Lưu ý ngoài assertion: ở 1280 driver ghi 1 lỗi trình duyệt "Hydration failed" mới trong log máy dev (loiTrinhDuyet=1); 1440 là 0.
  network_observed: n-a (driver)

- eval: E3
  run_id: minted-bang-hang-danh-sach-chi-tiet-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T06:36:00Z
  screenshot: evidence/E3-step1.png
  observed: |
    E3-step1.png (bảng đang mở căn A-04.02): bảng hàng lọc Toà A (huy hiệu Lọc 1, "54 / 70 căn"), nhóm "Toà → Loại căn". Bảng cuộn giữa danh sách, thấy dòng số 19 đến 33 của nhóm 2PN. Cột phụ bên phải mở hồ sơ A-04.02 (3,45 tỷ, Chưa đủ để rao). Dòng 20 (A-04.02) có khung chọn nổi ở ô Mã căn. Khớp Expected: lọc, nhóm, cuộn giữ; dòng đang mở có dấu.
    E3-step2.png (sau đổi sang A-12.03 rồi đóng hồ sơ): cột phụ đã biến mất, bảng giãn toàn bề rộng. Lọc vẫn Toà A (Lọc 1, 54 / 70 căn), nhóm vẫn "Toà → Loại căn", cuộn vẫn ở cùng vị trí (cùng dải dòng 19 đến 33, thấy tiêu đề nhóm 3PN ở dưới). Dòng 23 (A-12.03, Đang bán) giữ khung ô vừa mở trước khi đóng. Khớp Expected: lọc, nhóm, cuộn không đổi sau đóng.
  network_observed: n-a (driver)

- eval: E4
  run_id: minted-bang-hang-danh-sach-chi-tiet-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T06:36:00Z
  screenshot: evidence/E4-step1.png
  observed: |
    E4-step1.png / E4-1440.png (1440x900, nhanh kiem, ho so can A-03.01 dang mo): vo day du, panel ho so ben phai, bang hang trong khung co thanh cuon rieng, chan bang «70 / 70 căn» nam sat day cua so, khong co phan noi dung tran xuong duoi, khong thanh cuon trang. E4-step2.png / E4-1280.png (1280x800, ho so mo): bo cuc tuong tu, chan bang «70 / 70 căn» va nut «Căn chưa có đầu chủ giữ» deu thay nguyen trong khung, bang cuon ben trong. E4-main-1440.png (nhanh chinh, ho so mo): thay dung khac biet — bang va panel ho so dai xuong sat/duoi day cua so, chan bang «70 / 70 căn» khong thay (bi day ra ngoai), phan khung cuoi bi cat, khop vungLamViecDu=41 > 0 (trang cuon). Doi chieu Expected: trang khong cuon o hai kho, dong va mo, bang cuon trong khung — dung; chieu do (nhanh chinh cuon, ca duong cuon) — dung.
  network_observed: n-a (driver)

- eval: E6
  run_id: minted-bang-hang-danh-sach-chi-tiet-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T06:36:00Z
  screenshot: evidence/E6-step1.png
  observed: |
    E6-step1.png (bản sao E6-the-375.png, khổ 375x812, /inventory): tiêu đề "Bảng hàng", "7 căn", nút Lọc/Chọn, các thẻ căn xếp dọc theo nhóm "TOÀ B" (2 căn) và "TOÀ A" (5 căn): B-11.02, B-07.12, A-77.14, A-08.01, A-12.03... mỗi thẻ có ảnh trống, mã căn, giá, Diện tích/Phòng ngủ/Hướng; thanh dưới Hôm nay/Bảng hàng/Tôi. Là bảng thẻ, không có bảng nhiều cột, không thấy tay kéo chia cột. Khớp Expected. E6-step2.png (bản sao E6-ho-so-375.png, /inventory?unit=A-08.01): hồ sơ căn toàn màn: "A-08.01", nhãn "Đang bán", giá 3,5 tỷ, "Mức đủ thông tin 3/5", mục Ảnh, Thuộc tính căn; khung hồ sơ choán gần hết chiều rộng màn hình, lề trái khoảng 16px, không có danh sách hai bên, không có tay kéo. Khớp Expected. Ảnh hồ sơ nhánh này giống từng byte ảnh hồ sơ đo trên nhánh chính (cmp trùng).
  network_observed: n-a (driver)

- eval: E7b
  run_id: minted-bang-hang-danh-sach-chi-tiet-E7b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T06:36:00Z
  screenshot: evidence/E7b-step1.png
  observed: |
    Đã mở cả hai frame bằng Read. Frame 1 (E7-cot-dau-chu.png, bản sao E7b-step1.png), người xem dau-chu-2, 8 căn gom Toà → Loại căn: tiêu đề cột «Đầu chủ» có trên bảng; A-08.01 hiện «[Mẫu] Đầu chủ 1»; A-77.14, A-31.49, A-15.07 cũng «[Mẫu] Đầu chủ 1»; B-11.02 và B-07.12 «[Mẫu] Đầu chủ 2»; B-03.03 (căn chưa gán) hiện «—»; A-12.03 (gán cho người đã rời sàn) hiện «Đã rời sàn». Frame 2 (E7-sau-gan.png, bản sao E7b-step2.png), sau gán A-12.03 sang dau-chu-2 qua API và một lần đồng bộ: ô A-12.03 đổi thành «[Mẫu] Đầu chủ 2», các dòng khác giữ nguyên, bảng vẫn ở cùng vị trí cuộn và cùng trạng thái (không có dấu hiệu tải lại, đồng hồ «Đã đồng bộ 13:53» không đổi). Khớp Expected. Khung ẩn cột không được chụp; kết quả ẩn cột lấy từ dòng JSON e7 của script (anCotOTrinhDonCot=true).
  network_observed: n-a (driver)

- eval: E10
  run_id: minted-bang-hang-danh-sach-chi-tiet-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T06:36:00Z
  screenshot: evidence/E10-step1.png
  observed: |
    Da Read 3 frame that. E10-cho-tai.png (1440x900): man Bang hang, 54 / 70 can, chip Loc 1 va Nhom Toa -> Loai can giu nguyen, bang day dong (A-03.01 den A-02.03...), dong A-03.01 duoc chon; cot ho so ben phai hien dau cot A-03.01 «Chua du de rao», 3,1 ty, khoi Anh «Chua co anh gui duoc», «Thuoc tinh can» (1PN, 54,2 m2, tang 3...) — phan tren cot da co du lieu tu dong bang; khung cho tai KHONG nhin thay trong anh (nam o phan thap/duoi cot). E10-loi.png: bang van 54/70 can, loc giu, dong A-06.01 duoc chon, cot hien A-06.01 (2,5 ty, Thuoc tinh can); khong thay chu loi hay nut «Thu lai» trong vung nhin thay (nam duoi nep cuon, DOM xac nhan co). E10-thu-lai.png: bang 54/70 can van nguyen, dong A-08.01 duoc chon; cot cuon xuong cho thay Anh that 04/11/2026, Thuoc tinh can (tang 8), «Lan rao dang mo» (Phap ly pink_book...), «Cac lan rao» Lan 1 Dang ban 3,5 ty, Lich su — tuc ho so da ve day du, khong con chu loi. Ba anh khop phan «bang vo dung du dong va dung duoc» cua Expected; phan khung cho/chu loi chi duoc chung minh bang DOM, khong thay bang mat trong anh.
  network_observed: n-a (driver)

- eval: E5
  run_id: minted-bang-hang-danh-sach-chi-tiet-E5-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-05T05:49:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7a
  run_id: minted-bang-hang-danh-sach-chi-tiet-E7a-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-05T05:49:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7c
  run_id: minted-bang-hang-danh-sach-chi-tiet-E7c-r2
  exit_code: 0
  verifier: config:executors.test.api_db
  verified_at: 2026-11-05T06:11:05Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-bang-hang-danh-sach-chi-tiet-E8-r2
  exit_code: 0
  verifier: config:executors.script.bang_hang_dsct
  verified_at: 2026-11-05T06:11:05Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E9a
  run_id: minted-bang-hang-danh-sach-chi-tiet-E9a-r1
  exit_code: 0
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T05:49:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9b
  run_id: minted-bang-hang-danh-sach-chi-tiet-E9b-r1
  exit_code: 0
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-05T05:49:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9c
  run_id: minted-bang-hang-danh-sach-chi-tiet-E9c-r1
  exit_code: 0
  verifier: config:executors.script.bang_hang_dsct
  verified_at: 2026-11-05T05:49:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-bang-hang-danh-sach-chi-tiet-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-05T06:36:00Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-bang-hang-danh-sach-chi-tiet-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-05T06:36:00Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-bang-hang-danh-sach-chi-tiet-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-05T06:36:00Z

- cmd: npm run test:hooks
  run_id: minted-bang-hang-danh-sach-chi-tiet-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-05T06:36:00Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-bang-hang-danh-sach-chi-tiet-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-05T06:36:00Z

- cmd: npm run typecheck
  run_id: minted-bang-hang-danh-sach-chi-tiet-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-05T06:36:00Z

- cmd: npm run lint
  run_id: minted-bang-hang-danh-sach-chi-tiet-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-05T06:36:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không có eval nào được máy xác định là xanh cả hai phía.
Baseline không đo: mọi eval round 3 mang baseline n-a (máy không chạy được trên cây cũ); các eval mang theo từ round trước không có số liệu baseline.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: REJECT — Tham chiếu dẫn sai điều khoá (ghi K23, thực tế K26, AC-8) và E7c vướng hạ tầng cơ sở dữ liệu thử. Returned to implementation.
Round 2: REJECT — mọi eval máy xanh, nhưng review có hai mục trong hợp đồng: E4 (AC-4) chỉ đo một chiều, chưa có chiều đỏ; E6 (AC-6) không so bề rộng hồ sơ với nhánh chính. Chi tiết ở review-findings.md. Ghi chú: verified_at của eval round 2 là giờ xấp xỉ lúc soạn báo cáo, kết quả máy không kèm dấu thời gian riêng.
Round 3: PASS — E1, E2, E3, E4, E6, E7b, E10 chạy lại và xanh (E4 có chiều đỏ trên nhánh chính, E6 so bề rộng với nhánh chính); bảy lệnh suite xanh; E5, E7a, E7c, E8, E9a, E9b, E9c mang theo từ round trước. Ghi chú: verified_at của eval round 3 là giờ xấp xỉ, kết quả máy không kèm dấu thời gian riêng.

### Re-pin lần 1 — 2026-11-05, do gộp main trước khi gộp PR #127
run_id: repin-20261105T075006Z-53984
sha: d783ab655d4a5f065562c768ce3ab82c3138e896 · suites: 7 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng · ngoài làn máy: E1 (E1 không khai paths), E2 (E2 không khai paths), E3 (E3 không khai paths), E4 (E4 không khai paths), E6 (E6 không khai paths), E7b (E7b không khai paths), E10 (E10 không khai paths) · AC không có chốt máy: AC-1, AC-2, AC-3, AC-4, AC-6, AC-10

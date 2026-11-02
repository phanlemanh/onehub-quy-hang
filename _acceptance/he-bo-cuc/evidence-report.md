---
schema_version: 2
feature_slug: he-bo-cuc
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: dcae7ccbdaf09deaa6ef7494efe5e12350f4234a
human_signoff: Manh Phan 2026-11-02
---

# Evidence Report: he-bo-cuc

Round 2. Nội dung thay trọn round cũ; lịch sử round nằm ở mục Iterations.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4c | AC-4 | test | PASS |
| E4u | AC-4 | ui-check | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7 | AC-7 | test | PASS |
| E7u | AC-7 | ui-check | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | script | PASS |
| E10 | AC-10 | test | PASS |
| E10u | AC-10 | ui-check | PASS |
| E11 | AC-2 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-he-bo-cuc-E1-r1
  exit_code: 0
  carried_from_round: 1
  baseline: n-a
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-02T04:58:26Z
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E1b
  run_id: minted-he-bo-cuc-E1b-r1
  exit_code: 0
  carried_from_round: 1
  baseline: n-a
  verifier: config:executors.script.giao_dien
  verified_at: 2026-11-02T04:58:26Z
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-he-bo-cuc-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T06:14:26Z
  output: |
    ℹ duration_ms 1587.935292
    (lệnh npm test -w @quy-hang/web kết thúc sạch)

- eval: E3
  run_id: minted-he-bo-cuc-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T06:14:26Z
  output: |
    ℹ duration_ms 1587.935292
    (lệnh npm test -w @quy-hang/web kết thúc sạch)

- eval: E4
  run_id: minted-he-bo-cuc-E4-r1
  exit_code: 0
  carried_from_round: 1
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T04:58:26Z
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4c
  run_id: minted-he-bo-cuc-E4c-r1
  exit_code: 0
  carried_from_round: 1
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-02T04:58:26Z
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4u
  run_id: minted-he-bo-cuc-E4u-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T06:14:26Z
  screenshot: evidence/E4u-truong-nhom.png
  observed: |
    E4u-truong-nhom.png (/inventory, 1440x900, truong nhom): thanh tren co chon san «[Mau] San thu», o «Go ma can… ⌘K» o giua, nut den «+ Lead» dinh lien mui ten xo xuong ben canh (nhom nut), chip «Da dong dong bo · 13:20», chuong, avatar «TR»; ben duoi la Bang hang nhom theo Toa -> Loai can (14 can); man khong co nut tao rieng. Khop Expected (loi ReUI: nut chinh + mui ten). E4u-step2-menu-mo.png: menu tha xuong duoi mui ten co dung hai muc «Nhap Excel» va «Phat hang» (khong lap «+ Lead»). E4u-step3.png: sau khi bam «Nhap Excel» man «Nhap Excel» (duong dan Quy hang › Nhap Excel, «Man nay dang dung») tai /imports/new, thanh tren van «+ Lead» + mui ten. E4u-dau-chu.png (/today, dau chu-1): thanh tren y het: «+ Lead» + mui ten, chip dong bo, chuong, avatar «DA»; noi dung la hang doi Hom nay; E4u-step4-menu-mo.png menu mo cung hai muc Nhap Excel, Phat hang. Tat ca khop Expected va bang §9.
  network_observed: clean

- eval: E5
  run_id: minted-he-bo-cuc-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T06:14:26Z
  output: |
    ℹ duration_ms 1587.935292
    (lệnh npm test -w @quy-hang/web kết thúc sạch)

- eval: E6
  run_id: E6-he-bo-cuc-s4v2-verifier-2026-11-02
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T06:14:26Z
  screenshot: evidence/E6-tran-375.png
  observed: |
    Đã mở bằng Read từng frame vừa lưu và đối chiếu với Expected. Chỉ những tệp dưới đây được mở; ba tệp E6-ngan-1440-da-dong, E6-ngan-375-da-dong và E6-ngan-375-mac-dinh (tệp cuối trùng nội dung với E6-danh-sach-chi-tiet-375) không mở lại, kết luận về trạng thái «đã đóng» lấy từ số đo dlg=null.
    - E6-tran-375.png: tiêu đề «Bảng hàng», 6 thẻ dọc (A-06.01 · 3,10 tỷ … C-21.03 · 6,10 tỷ), chân «6 / 128 căn», thanh dưới 4 tab. Không có bảng, không cuộn ngang. Khớp «Tràn thành thẻ».
    - E6-danh-sach-chi-tiet-375.png: phía trên mờ, phía dưới là ngăn từ đáy tiêu đề «Hồ sơ căn» (A-06.01, Đang bán, 3,10 tỷ, thuộc tính căn, lịch sử, chân «Còn · giữ giá» và «Gửi khách»). Khớp «mở chi tiết trong ngăn từ đáy».
    - E6-doc-375.png: «Cài đặt sàn», một cột (ô tên gọi, công tắc, Tỷ/Triệu, Huỷ/Lưu). Giữ hình.
    - E6-ho-so-375.png: một cột, đầu hồ sơ A-06.01, giá 3,10 tỷ, thuộc tính căn, lần rao đang mở, lịch sử. Giữ một cột.
    - E6-bang-dieu-khien-375.png: «Tổng quan», thẻ «Bảng điều khiển không có trên điện thoại / Mở trên máy tính để xem đội.», phần còn lại trống. Khớp.
    - E6-luong-nhieu-buoc-375.png: «Nhập Excel», chip «Bước 2 / 4 · Ghép cột», nút X ở đầu, nút Lùi/Tiếp, khối Xem trước. Phủ kín khung, không còn thanh dưới. Khớp «ngăn toàn màn».
    - E6-dong-tin-375.png (xem kèm văn bản đo lúc chụp): «Đã gửi», Activity, các chip lọc, mốc TODAY, các thẻ hoạt động. Giữ hình dòng tin.
    - E6-tran-1440.png: vỏ đủ (thanh trái, cột điều hướng 200px), bảng 5 cột, không có ngăn. E6-tran-1024.png: cùng bố cục, bảng hẹp hơn.
    - E6-danh-sach-chi-tiet-1440.png: bảng bên trái bị ngăn «Hồ sơ căn» (inset, bo góc, cách mép khoảng 16px) đè từ bên phải, hàng A-06.01 được tô chọn, có nút mở toàn màn và đóng. Khớp «ngăn inset bên phải đè lên bảng».
    - E6-danh-sach-chi-tiet-1024.png: cùng bố cục, ngăn rộng 512 nằm bên phải, cột điều hướng 200px còn hiện, không có hình riêng. Khớp dòng sổ Hỏi-5.
    - E6-ngan-1440.png: ngăn hiện hồ sơ A-12.08 (4,25 tỷ) sau khi bấm dòng A-12.08, hàng đó được tô chọn.
    - E6-ngan-1440-dong-khac.png: ngăn vẫn mở, hồ sơ đổi sang C-08.11 (3,95 tỷ, Chờ duyệt, Toà C), hàng C-08.11 được tô. Khớp «bấm dòng khác vẫn đổi hồ sơ».
    - E6-ngan-375.png: ngăn từ đáy, hồ sơ A-12.08 (4,25 tỷ), nền phía trên mờ. Khớp «từ đáy ở 375».
    Ghi nhận phụ, không ảnh hưởng kết quả. Dữ liệu mẫu có tiêu đề hồ sơ luôn ghi «Toà A» dù dòng chọn thuộc Toà C (C-08.11); đó là dữ liệu mẫu, không thuộc tiêu chí AC-6. Huy hiệu «N» của công cụ dev Next.js đã được ẩn bằng CSS trong iframe khi chụp lượt này.
  network_observed: clean

- eval: E7
  run_id: minted-he-bo-cuc-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T06:14:26Z
  output: |
    ℹ duration_ms 1587.935292
    (lệnh npm test -w @quy-hang/web kết thúc sạch)

- eval: E7u
  run_id: minted-he-bo-cuc-E7u-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T06:14:26Z
  screenshot: evidence/E7u-trang.png
  observed: |
    E7u-trang.png: trang /mau/he-bo-cuc mở thẳng ở cổng 3494, tiêu đề «Hệ bố cục — trang mẫu sống», thanh chọn 3 hàng (7 bố cục: Tràn, Danh sách – chi tiết, Đọc, Hồ sơ, Bảng điều khiển, Luồng nhiều bbước, Dòng tin; 5 trạng thái; khổ 1440/1024/375/Mở riêng), bên dưới là khung bàn làm việc «[Mẫu] Sàn thử» với bảng 6/128 căn. Không bị đưa về /login. E7u-tran-mac-dinh.png: bảng Bảng hàng 6 hàng, huy hiệu Đang bán/Giữ chỗ/Chờ duyệt. E7u-tran-cho-tai.png: chỉ có khung (cột trái, thanh trên, breadcrumb) và lưới xương 5 cột x 8 hàng các thanh xám, không có bảng thật = chờ tải theo hình lưới, đúng. E7u-tran-rong.png: biểu tượng kính lúp, «Không căn nào khớp bộ lọc», «Bỏ bớt điều kiện lọc để thấy thêm căn.», nút «Bỏ lọc» = rỗng có hành động, đúng. E7u-tran-loi.png: dải đỏ nhạt «Không tải được danh sách / Kiểm tra mạng rồi thử lại.» kèm nút «Thử lại» = lỗi có thử lại, đúng. E7u-tran-ngoai-tuyen.png: dải đầu màn «Đang xem bản đã tải — mất mạng / Thay đổi được giữ trên máy và gửi đi khi có mạng lại.» nằm phía trên, bảng 6 căn vẫn nguyên bên dưới = ngoại tuyến giữ nội dung, đúng. E7u-ho-so-1024.png: bố cục Hồ sơ ở khổ 1024 (khung thu hẹp ~1024): căn A-06.01 Đang bán, 3,10 tỷ, thanh mức đủ thông tin 3/5, khối THUỘC TÍNH CĂN, LẦN RÀO ĐANG MỞ; một cột, không vỡ. Ghi chú: ở khổ 1440 khung xem thử bị cắt mép phải vì bằng đúng bề ngang cửa sổ chụp (1440), không phải lỗi đo được của trang; không có lỗi console.
  network_observed: clean

- eval: E8
  run_id: minted-he-bo-cuc-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-02T06:14:26Z
  output: |
    ℹ duration_ms 16410.855958
    (lệnh npm test -w @quy-hang/ui-lint kết thúc sạch)

- eval: E9
  run_id: minted-he-bo-cuc-E9-r1
  exit_code: 0
  carried_from_round: 1
  baseline: n-a
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-02T04:58:26Z
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9b
  run_id: minted-he-bo-cuc-E9b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint
  verified_at: 2026-11-02T06:14:26Z
  output: |
    chuẩn giao diện: đạt

- eval: E10
  run_id: minted-he-bo-cuc-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-02T06:14:26Z
  output: |
    ℹ duration_ms 16410.855958
    (lệnh npm test -w @quy-hang/ui-lint kết thúc sạch)

- eval: E10u
  run_id: minted-he-bo-cuc-E10u-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T06:14:26Z
  screenshot: evidence/E10u-step1.png
  observed: |
    E10u-nguoi-dung.png (1440): vo ung dung co thanh dieu huong "CAI DAT SAN" ben trai (Nguoi dung dang chon, Cach goi, Truong rieng, Trang thai, Luat chia lead, Thue phi, Mau nhap). Cot noi dung: breadcrumb "Cai dat san > Nguoi dung", tieu de "Nguoi dung", mo ta "Nguoi cua san [Mau] San thu", dong "7 thanh vien · 2 vung" va nut den "Moi nguoi" o phai. Hai tab "Thanh vien 7" (gach chan) va "Vung 2". O tim "Tim theo email". Khoi "Thanh vien - 7 nguoi trong san" gom cac dong: dau-chu-1 (Dau chu, Toa A), dau-chu-2 (Dau chu, Toa B), dau-khach (Dau khach, Chua giao vung), hai-vai (Dau chu + Telesales), quan-tri (chip "Ban", "Quan tri cuoi", Quan tri san), telesales, truong-nhom; moi dong co nut Sua va thung rac (dong cua chinh minh la icon thoat). Noi dung chiem het be rong cot (tu ~280 den ~1415), khong gioi han hep. Khong co dem ghe. Khop Expected.
    E10u-trang-tam.png (1440): cung vo, muc "Cach goi" dang chon; cung bo cuc Doc: breadcrumb, tieu de "Cach goi", mo ta "San goi ten truong va gia tri the nao?", mot the rong het be rong cot co icon bua, "Man nay dang dung", "Dung o muc 45 cua lo trinh." Khop Expected (trang tam noi muc lo trinh).
    E10u-nguoi-dung-375.png (375): header "Cai dat san", nut "< Cai dat san", tieu de "Nguoi dung", mo ta, "7 thanh vien · 2 vung", nut "Moi nguoi", tab Thanh vien 7 / Vung 2, o tim, danh sach the 1 cot (avatar, email, chip vai, vung, Sua, rac) vua khung, thanh tab duoi "Cai dat san | Toi"; khong thay phan nao bi cat ngang; do duoc scrollWidth = 375 = clientWidth => khong cuon ngang. Khop Expected.
    E10u-step4-hop-moi.png: hop thoai "Moi nguoi" co Email, Vai (5 checkbox chon duoc), Vung phu trach (Toa A, Toa B), nut Huy/Moi — vai chon duoc trong hop moi.
  network_observed: clean

- eval: E11
  run_id: minted-he-bo-cuc-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-02T06:14:26Z
  output: |
    design-floor-s4 không in dòng lỗi nào; lệnh kết thúc sạch, không có mã màu thô trên tệp giao diện vòng chạm.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-he-bo-cuc-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-02T06:14:26Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-he-bo-cuc-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-02T06:14:26Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-he-bo-cuc-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-02T06:14:26Z

- cmd: npm run test:hooks
  run_id: minted-he-bo-cuc-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-02T06:14:26Z

- cmd: npm run typecheck
  run_id: minted-he-bo-cuc-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-02T06:14:26Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 2 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi). Baseline khong do: moi eval ghi baseline n-a.

Eval khong-phan-biet (pass tren ca HEAD lan baseline cuoi, chung minh harness chu khong phai feature; viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y):
- npm test -w @quy-hang/ui-lint: E1, E8, E9, E10
- node packages/ui-lint/kiem-chuan.mjs: E1b
- npm test -w @quy-hang/web: E2, E3, E4, E5, E7
- npm test -w @quy-hang/core: E4c
- npm run lint: E9b
- design-floor-s4 (config:executors.script.design_floor): E11

## Variance

none — every multi-run eval is uniform (moi eval chay mot lan, deterministic, khong co pass_rate hon hop).

## Iterations

Round 1: E1, E1b, E4, E4c, E9 dat va duoc mang sang round 2 (carry-forward); chi tiet round 1 khong nam trong du lieu round nay.
Round 2 (luot dau): E6 chua dat — Luong nhieu buoc o 375 chua la ngan phu toan man; sua o commit 750e735, tra ve trien khai.
Round 2 (chay lai tren 77a20a0): moi eval dat, khong con eval nao rot.

### Re-pin lần 1 — 2026-11-02, do gộp main sau chữ ký (PR #78, #79)
run_id: repin-20261102T071743Z-57604
sha: dcae7ccbdaf09deaa6ef7494efe5e12350f4234a · suites: 7 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E4u, E6, E7u, E10u · diff chạm vật đo ngoài làn máy: E4u — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-6

---
schema_version: 2
feature_slug: bang-hang-danh-sach-chi-tiet
verdict: REJECT
failed_evals: [E7c]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 612ec09e9beac4b14260259da89386fef25fc704
human_signoff:
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
| E7c | AC-7 | test | FAIL |
| E8 | AC-8 | script | PASS |
| E9a | AC-9 | script | PASS |
| E9b | AC-9 | test | PASS |
| E9c | AC-9 | script | PASS |
| E10 | AC-10 | ui-check | PASS |

Lệnh fail không gắn eval: không có. Lệnh fail duy nhất (`npm run test:db -w @quy-hang/api`) đã gắn với E7c.

## Evidence

- eval: E1
  run_id: minted-bang-hang-danh-sach-chi-tiet-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T05:49:48Z
  screenshot: evidence/E1-1440.png
  observed: |
    E1-1440.png: vỏ tối; thanh trên (ô «Gõ mã căn…», «+ Lead», «Đã đồng bộ · 12:50», chuông, avatar DA) nguyên vẹn, không bị che, không lớp phủ. Khung «Bảng hàng» (70/70 căn, nhóm Toà → Loại căn) ở giữa; bên phải là cột hồ sơ căn A-04.01 («Chưa đủ để rao», 3,4 tỷ, mục Ảnh, Thuộc tính căn, nút «Căn chưa có đầu chủ giữ») nằm NGOÀI khung bảng, có khe hở giữa hai khối, mép trên cột ngang mép trên khung bảng (cùng y≈75) và mép dưới chạm đáy vùng làm việc (≈891 so với 892). Đúng Expected. E1-1280.png: cùng bố cục ở khổ 1280x800 — bảng co lại (cắt cột Diện tích), cột hồ sơ A-04.01 bên phải ngoài khung, mép trên ngang khung, mép dưới sát đáy vỏ, thanh trên đủ nút, không lớp phủ. Đúng Expected.
  network_observed: n-a (driver)
  output: |
    Khổ 1440x900: cot.top 75 vs khung.top 75 -> lệch 0 (<=2) PASS; cot.bottom 891 vs vungLamViec.bottom 892 -> lệch 1 (<=2) PASS; cot.left 990 >= khung.right 973 PASS; thanhTrenGiuNguyen=true PASS; nutThanhTren 5/5 ok, moiNutKhongBiChe=true PASS; coLopPhu=false PASS.
    Khổ 1280x800: cot.top 75 vs khung.top 75 -> 0 PASS; cot.bottom 791 vs vungLamViec.bottom 792 -> 1 PASS; cot.left 891 >= khung.right 874 PASS; thanhTrenGiuNguyen=true PASS; 5/5 nút ok PASS; coLopPhu=false PASS.
    Frame đã lưu: evidence/E1-1440.png, evidence/E1-1280.png (bản sao E1-step1.png, E1-step2.png). Network: driver CDP nội bộ, không đọc được network (ghi chú ở evidence/E1-network.txt). Không sửa code.

- eval: E2
  run_id: minted-bang-hang-danh-sach-chi-tiet-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T05:49:48Z
  screenshot: evidence/E2-step1.png
  observed: |
    E2-keo-28.png (1440x900, kéo hết sang phải): vùng bảng rộng ra đến khoảng x=280..1085, panel chi tiết căn A-06.01 hẹp ở bên phải (khoảng 28%, x~1103..1413). Bảng đầy đủ các cột Toà, Mã căn, Loại căn, Diện tích, Tầng, Hướng, không bị cắt; thanh công cụ phía trên bên trái thấy đủ 4 nút Nhóm: Toà → Loại căn, Lọc, Cột, Xuất bảng hàng. Khớp expected (dừng ở 28%).
    E2-keo-50.png (1440x900, kéo hết sang trái): panel chi tiết rộng ra khoảng nửa (x~858..1413), bảng thu hẹp bên trái (x~280..838), các cột Toà, Mã căn, Loại căn hiện rõ, cột Diện tích bị cắt ở mép phải (cuộn ngang); bảng vẫn trọn bên trái, không tràn sang panel; nút Nhóm, Lọc, Cột, Xuất hiện đủ, bấm được (xuống 2 hàng công cụ nhưng vẫn trong bảng). Khớp expected (dừng ở 50%).
    E2-keo-28-1280.png (1280x800): panel hẹp ~28%, bảng hiện Toà, Mã căn, Loại căn, Diện tích, Tầng (5 cột, cột Tầng bị cắt nhẹ ở mép); 4 nút công cụ hiện, thanh công cụ xuống dòng. E2-keo-50-1280.png: panel ~50%, bảng hiện Toà, Mã căn, Loại căn (cột Loại căn cắt sát mép), 4 nút công cụ hiện. Các ảnh khớp số đo JSON: tỉ lệ đúng 28%/50%, bảng trọn bên trái, không chồng panel.
  network_observed: n-a (driver)
  output: |
    Assertion (1440): rongCot=425, rongVung=1118, tỉ lệ 0.380 trong [0.37,0.39] PASS. moiOBenTrai=true PASS. nutCongCu Nhóm/Lọc/Cột/Xuất đều true (elementFromPoint tại tâm) PASS. keoTraiHetCo=0.5 trong [0.49,0.51] PASS. keoPhaiHetCo=0.28 trong [0.27,0.29] PASS.
    Assertion (1280): rongCot=364, rongVung=958, tỉ lệ 0.380 PASS. moiOBenTrai=true PASS. 4 nút đều true PASS. soCotThay=4 >= 4 PASS (1440 là 5). keoTraiHetCo=0.5 PASS. keoPhaiHetCo=0.28 PASS.
    Frame lưu: E2-step1.png (= E2-keo-28.png), E2-step2.png (= E2-keo-50.png), E2-keo-28-1280.png, E2-keo-50-1280.png, E2-network.txt.

- eval: E3
  run_id: minted-bang-hang-danh-sach-chi-tiet-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T05:49:48Z
  screenshot: evidence/E3-step1.png
  observed: |
    E3-step1.png (sau mở A-04.02): bảng Bảng hàng lọc Toà A, hiện "54 / 70 căn", nút Nhóm "Toà → Loại căn", Lọc có huy hiệu 1; bảng cuộn giữa (hàng số 19-33, nhóm 2PN, thấy đầu nhóm "3PN 15 căn" ở đây); cột phụ bên phải mở hồ sơ A-04.02 (nhãn "Chưa đủ để rao", 3,45 tỷ); hàng 20 A-04.02 có nền/viền đánh dấu đang chọn.
    E3-step2.png (sau đóng): cột phụ biến mất, bảng giãn rộng full chiều rộng, vẫn lọc Toà A (54 / 70 căn, Lọc 1), vẫn nhóm Toà → Loại căn, vẫn ở cùng vùng cuộn (hàng 19-33 của nhóm 2PN, "3PN 15 căn" ở cuối); không nhảy về đầu bảng. Khớp Expected: lọc, nhóm, cuộn giữ nguyên qua mở/đổi căn/đóng, bảng không dựng lại, dòng đang mở có dấu.
  network_observed: n-a (driver)
  output: |
    Chiều đỏ: chạy thêm --dung-lai (ra scratchpad, không đè lên evidence): conCungNut = false ở cả 3 bước, tổng conCungNut = false (giuLocNhomCuon vẫn true). PASS (cả đo đỏ đúng báo hỏng).
    Frame lưu: E3-mo.png, E3-dong.png (do script), bản sao E3-step1.png (= mở), E3-step2.png (= đóng); E3-network.txt.
    Network: driver là Chrome CDP riêng, không có đường đọc network; log máy dev không có dòng lỗi máy chủ.

- eval: E4
  run_id: minted-bang-hang-danh-sach-chi-tiet-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T05:49:48Z
  screenshot: evidence/E4-step1.png
  observed: |
    E4-step1.png (1440x900, hồ sơ đóng/mở): trang đầy khung nhìn, không thanh cuộn trang; bảng hàng bên trái cuộn trong khung (thanh cuộn dọc riêng của bảng, ghi 70/70 căn ở chân khung), panel hồ sơ A-03.01 mở bên phải. E4-step2.png (1280x800): cùng bố cục, trang vừa khung 800px, bảng cuộn trong khung với thanh cuộn nội bộ, hồ sơ A-03.01 mở bên phải, không thấy phần nào tràn ra dưới. Khớp Expected: trang không cuộn, bảng cuộn trong khung.
  network_observed: n-a (driver)
  output: |
    Assertion scrollHeight <= innerHeight: 4/4 pass. Assertion bảng cuộn trong khung: 4/4 pass.
    Chiều đo (--ban-goc trên worktree main, scrollHeight - innerHeight ~ 16): KHÔNG chạy — steps không cấp worktree main; không xác nhận được, ghi nhận chưa kiểm.
    Frames: E4-step1.png, E4-step2.png (bản sao E4-1440.png, E4-1280.png); E4-network.txt (driver CDP, không có network reader).

- eval: E5
  run_id: minted-bang-hang-danh-sach-chi-tiet-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T05:49:48Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3426.13675

- eval: E6
  run_id: minted-bang-hang-danh-sach-chi-tiet-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T05:49:48Z
  screenshot: evidence/E6-step1.png
  observed: |
    E6-step1.png (bản sao E6-the-375.png, khổ 375x812, /inventory): thanh trên «Bảng hàng», dòng «7 căn», các thẻ căn xếp dọc một cột (nhóm «2 căn · TOÀ B», «5 căn · TOÀ A»), mỗi thẻ có ô ảnh bên trái, mã căn (B-11.02, B-07.12, A-77.14, A-08.01, A-12.03), giá (3,5 tỷ, 3,2 tỷ), Diện tích, Phòng ngủ, Hướng. Có thanh tab dưới (Hôm nay, Bảng hàng, Tôi). Không có bảng lưới nhiều cột và không có tay kéo chia. E6-step2.png (bản sao E6-ho-so-375.png, /inventory?unit=A-08.01): hồ sơ căn A-08.01 «Đang bán» chiếm gần toàn màn, nút thu phóng và đóng, giá 3,5 tỷ, Mức đủ thông tin 3/5, phần Ảnh, Thuộc tính căn; không có cột chia đôi và không có tay kéo; khung hồ sơ cách lề trái 16px. Ghi chú nhỏ: ảnh trong hồ sơ hiện ảnh lỗi (chữ alt chồng lên nhãn «Bìa») ở dữ liệu thử, không thuộc điều kiện E6. Khớp Expected.
  network_observed: n-a (driver)
  output: |
    Assertion 5: hồ sơ soTayKeo = 0 -> PASS
    Assertion 6: đối chiếu với 'bề rộng đo trên nhánh chính': không có số đo nhánh chính riêng để đối, nhưng kiểm đúng công thức khung nhìn trừ lề hai bên (343) khớp; không có mâu thuẫn.
    Frames đã lưu: evidence/E6-the-375.png, E6-ho-so-375.png (do script), E6-step1.png, E6-step2.png (bản sao), E6-network.txt (ghi chú driver CDP không đọc được network).

- eval: E7a
  run_id: minted-bang-hang-danh-sach-chi-tiet-E7a-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T05:49:48Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3426.13675

- eval: E7b
  run_id: minted-bang-hang-danh-sach-chi-tiet-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T05:49:48Z
  screenshot: evidence/E7b-step1.png
  observed: |
    E7b-step1.png (E7-cot-dau-chu.png, 1440x900, giao diện tối, bảng Bảng hàng của [Mẫu] Sàn thử, đang xem bởi dau-chu-2, nhóm Toà → Loại căn): có cột «Đầu chủ» giữa «Xác nhận» và «Mức đủ». Hàng A-08.01 hiện «[Mẫu] Đầu chủ 1»; A-12.03 hiện «Đã rời sàn»; B-03.03 hiện «—»; các căn khác A-77.14, A-31.49, A-15.07 = Đầu chủ 1, B-11.02 và B-07.12 = Đầu chủ 2. E7b-step2.png (E7-sau-gan.png, cùng khung): hàng A-12.03 đổi từ «Đã rời sàn» thành «[Mẫu] Đầu chủ 2», các hàng khác không đổi, thanh trạng thái vẫn «Đã đồng bộ · 13:04» (trang không tải lại, cờ khongTaiLai=true). Cả hai đối chiếu Expected khớp. Khung ẩn cột không được chụp ảnh, chỉ có cờ anCotOTrinhDonCot=true trong dòng JSON.
  network_observed: n-a (driver)
  output: |
    Chuẩn bị: dev 3460 không chạy; chay-ui.mjs lần đầu hết giờ vì chỗ thử (3477) chưa lên, nên chạy dung-d.mjs (dùng Postgres dkn-D 5575 có sẵn, tự bật máy dev 3477) rồi chạy lại step 1. Dòng e7: ganQuaApi 200, sauGan «[Mẫu] Đầu chủ 2», khongTaiLai true, anCotOTrinhDonCot true.
    Assertion: (1) tiêu đề cột «Đầu chủ» có PASS; (2) ô căn đã gán A-08.01 = tên đầu chủ 1 PASS; (3) ô căn chưa gán B-03.03 = «—» PASS; (4) ô căn gán cho người đã rời sàn A-12.03 = «Đã rời sàn» PASS; (5) PATCH gán A-12.03 sang đầu chủ 2 qua /api/v1 trả 200 PASS; (6) sau kéo đồng bộ ô đổi thành tên đầu chủ 2 PASS; (7) không tải lại trang PASS; (8) ẩn cột ở trình đơn Cột thì tiêu đề «Đầu chủ» biến mất PASS.
    Đã tắt máy dev 3477 do mình bật; Postgres dkn-D và cổng 3460 không đụng vào. Network: E7b-network.txt.

- eval: E7c
  run_id: minted-bang-hang-danh-sach-chi-tiet-E7c-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.test.api_db
  verified_at: 2026-11-05T05:49:48Z
  output: |
    DATABASE_URL=${DATABASE_URL:-postgres://postgres:quyhang@localhost:5575/postgres} npm run test:db -w @quy-hang/api
    test at test-db/auth.test.ts:1:356
    ✖ packages/api/test-db/auth.test.ts (1.233667ms)
      error: relation "identity.password_failures" does not exist (code 42P01, routine parserOpenTable)
      tại TestContext.cleanup (packages/api/test-db/helpers.ts:49:3)
    npm error Lifecycle script `test:db` failed with error:
    npm error workspace @quy-hang/api@0.0.0
    Ghi chú người soạn: dòng lỗi cuối đuôi nằm ở auth.test.ts (bảng identity.password_failures chưa có trong cơ sở dữ liệu thử); đuôi đầu ra không cho thấy ca «tên thành viên: mọi vai của sàn đọc được, chỉ mã và tên» có chạy hay không. Bằng chứng không đủ để xác nhận AC-7 ở phía API.

- eval: E8
  run_id: minted-bang-hang-danh-sach-chi-tiet-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.bang_hang_dsct
  verified_at: 2026-11-05T05:49:48Z
  output: |
    node --test "_acceptance/bang-hang-danh-sach-chi-tiet/thu/*.test.mjs"
    ℹ duration_ms 349.924375

- eval: E9a
  run_id: minted-bang-hang-danh-sach-chi-tiet-E9a-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T05:49:48Z
  output: |
    node "$R/scripts/design-floor-khuon.mjs" --kiem --root .
    21 tệp giao diện ngoài bản đồ

- eval: E9b
  run_id: minted-bang-hang-danh-sach-chi-tiet-E9b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-05T05:49:48Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 24885.925084

- eval: E9c
  run_id: minted-bang-hang-danh-sach-chi-tiet-E9c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.bang_hang_dsct
  verified_at: 2026-11-05T05:49:48Z
  output: |
    node --test "_acceptance/bang-hang-danh-sach-chi-tiet/thu/*.test.mjs"
    ℹ duration_ms 349.924375

- eval: E10
  run_id: minted-bang-hang-danh-sach-chi-tiet-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T05:49:48Z
  screenshot: evidence/E10-step1.png
  observed: |
    E10-step1 (chờ tải): màn Bảng hàng 1440x900; thanh bảng còn 54 / 70 căn, nhóm Toà A → 1PN, nút Lọc có chỉ số 1 (lọc giữ), ô chọn A-03.01; cột hồ sơ bên phải có tiêu đề A-03.01, giá 3,1 tỷ, thanh tiến độ 1/5, khối Ảnh, Thuộc tính căn. Không thấy rõ khung chờ trong phần hiện (nằm dưới nếp cuộn); khung chờ được xác nhận bằng DOM. E10-step2 (lỗi): bảng vẫn 54 / 70 căn, Lọc 1, ô chọn đổi sang A-06.01, cột phải đổi sang A-06.01 (2,5 tỷ, Tầng 6); chữ lỗi và nút Thử lại không nằm trong vùng nhìn thấy của ảnh (xác nhận bằng DOM). E10-step3 (thử lại): bảng vẫn 54 / 70 căn, Lọc 1, ô chọn A-08.01, cột phải cuộn tới cuối với hồ sơ đầy đủ: Thuộc tính căn (Tầng 8), Lần rao đang mở, Các lần rao (Lần 1 Đang bán 3,5 tỷ), Lịch sử - không còn lỗi. Không frame nào mâu thuẫn Expected.
  network_observed: n-a (driver)
  output: |
    Frame đã lưu (evidence/): E10-step1.png (= E10-cho-tai.png), E10-step2.png (= E10-loi.png), E10-step3.png (= E10-thu-lai.png), E10-network.txt.
    Lưu ý: khung chờ và chữ lỗi được assert bằng DOM; trong ảnh 1 và 2 phần nhìn thấy của cột chưa hiện rõ khung chờ hay chữ lỗi (nằm dưới nếp cuộn), nên ảnh là bằng chứng cho "bảng còn đủ 54 dòng, lọc giữ, cột vẫn có tên căn"; khung chờ và lỗi dựa vào DOM.
    Network: driver là script CDP tự viết, không có đường đọc network; lỗi máy chủ và chậm 3s do lớp bọc fetch chủ động chèn (kịch bản E10).

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-bang-hang-danh-sach-chi-tiet-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-05T05:49:48Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-bang-hang-danh-sach-chi-tiet-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-05T05:49:48Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-bang-hang-danh-sach-chi-tiet-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-05T05:49:48Z

- cmd: npm run test:hooks
  run_id: minted-bang-hang-danh-sach-chi-tiet-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-05T05:49:48Z

- cmd: npm run typecheck
  run_id: minted-bang-hang-danh-sach-chi-tiet-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-05T05:49:48Z

- cmd: npm run lint
  run_id: minted-bang-hang-danh-sach-chi-tiet-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-05T05:49:48Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả nhánh lẫn baseline — chứng minh bộ đo chứ chưa chứng minh tính năng; cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- E5, E7a (lệnh `npm test -w @quy-hang/web`)
- E8, E9c (lệnh `node --test "_acceptance/bang-hang-danh-sach-chi-tiet/thu/*.test.mjs"`)
- E9a (lệnh chấm khuôn `design-floor-khuon.mjs --kiem`)
- E9b (lệnh `npm test -w @quy-hang/ui-lint`)

Baseline không đo: E1, E2, E3, E4, E6, E7b, E10 (eval ui-check chạy trên nhánh này, không đo trên baseline). Thêm: chiều đối chứng của E4 (`--ban-goc`) không chạy được, nên chưa có bằng chứng phép đo «trang không cuộn» đỏ khi trang thật sự cuộn.

E7c đỏ trên baseline (có phân biệt) nhưng cũng đỏ trên nhánh này, nên là lý do REJECT.

## Variance

none — mọi eval chạy một lần, xác định; không có eval nhiều lần.

## Iterations

Round 1: E7c failed — lệnh `npm run test:db -w @quy-hang/api` dừng ở lỗi thiếu bảng identity.password_failures trong cơ sở dữ liệu thử (test-db/auth.test.ts), ca «tên thành viên» của AC-7 chưa được xác nhận. Returned to implementation.

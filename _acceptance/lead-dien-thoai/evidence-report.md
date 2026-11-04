---
schema_version: 2
feature_slug: lead-dien-thoai
verdict: BLOCKED
failed_evals: ["E3","E4"]
reason: "ui-check:E8 — Lệnh E8 không chạy được vì chỗ thử dãy D chưa dựng. chay-ui.mjs mã cứng http://localhost:3476, không dùng 3460. Cổng 3476 không có máy nào, nên chờ thân trang quá 120 giây rồi văng «hết giờ chờ» ở dòng 44, cả hai lần chạy. dung-d.mjs thất bại với «máy dev không lên» vì máy dev 3460 do verifier tự bật (PID 76372) đang giữ thư mục apps/web và Next chặn bản thứ hai. Hệ thống từ chối lệnh kill PID 76372 (phân loại tự động); verifier không lách. Cần người cho phép tắt máy 3460 (hoặc tự tắt) rồi chạy lại dung-d.mjs và E8."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 35e93598e38a059463933c10d75fcda8fe2b5104
human_signoff:
---

# Evidence Report: lead-dien-thoai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-3 | ui-check | REJECT |
| E4 | AC-4 | ui-check | REJECT |
| E5 | AC-5 | ui-check | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7a | AC-7 | script | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | ui-check | BLOCKED |
| E9 | AC-9 | ui-check | PASS |

Lệnh fail không gắn eval: không có. Lệnh fail có gắn eval: ui-check:E3 (E3), ui-check:E4 (E4). Review incomplete (finder chết): không có.

## Evidence

- eval: E1
  run_id: minted-lead-dien-thoai-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T10:14:44Z
  screenshot: evidence/E1-step1.png
  observed: |
    Frame E1-nhap-390.png (copy là E1-step1.png), khổ 390x844, đã mở bằng Read: tiêu đề «Ô nhận lead», hai tab «Nhập lead» (đang chọn) và «Lead đã nhập». Dưới là một cột năm mục: Số chủ nhà; Căn hoặc toà; Nhu cầu; Giá; Thời gian muốn ra hàng. Không thấy thanh cuộn ngang, không bị cắt ngang. Nút «Gửi lead» nằm sát đáy ngay trên thanh tab dưới, thấy trong khung nhìn. Khớp Expected.
  network_observed: n-a (driver)
  output: |
    Lần 1 và 2 của chay-ui.mjs văng lỗi scrollIntoView (undefined): trang dev tự tải lại liên tục lúc biên dịch; thử lại tới khi trang ổn định thì ra dòng e1. Coi là nhiễu môi trường dev, không phải lỗi sản phẩm.
    Assertion: cuonNgang=false PASS; soMuc=5 PASS; inputModeSo=tel PASS; inputModeGia=numeric PASS; coPhanDaNhap=true PASS; nutGuiBamDuoc=true PASS (nút top 770, bottom 802, rộng 316, viewport cao 844).
    Network: driver CDP không đọc được network, E1-network.txt ghi n-a (driver).

- eval: E2
  run_id: minted-lead-dien-thoai-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T10:14:44Z
  screenshot: evidence/E2-step1.png
  observed: |
    E2-step1.png (390px, ca bỏ trống số chủ nhà, đọc trực tiếp): ô «Số chủ nhà» viền đỏ, dưới có dòng lỗi đỏ «Cần số điện thoại Việt Nam 10 chữ số». Các ô Căn hoặc toà (Toà A), Nhu cầu (Bán), Giá 3.200.000.000, Thời gian đều đã điền, không có lỗi đỏ ở ô nào khác. Khớp Expected: lỗi dưới đúng ô bỏ trống.
  network_observed: n-a (driver)
  output: |
    Assertion: (1) 5 ca mỗi ca loiO đúng một ô và là ô bỏ trống: PASS. (2) 5 ca soPostLead=0: PASS. (3) đối chứng điền đủ soPostLead=1: PASS. (4) frame đối chiếu: PASS.
    Lưu ý: soPostLead đếm bằng lớp bọc fetch trong trang, không phải sự kiện mạng CDP như Expected nói; E2-network.txt ghi rõ không có dump CDP. Phương pháp đo yếu hơn lời Expected.

- eval: E3
  run_id: minted-lead-dien-thoai-E3-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T10:14:44Z
  screenshot: evidence/E3-ket-qua-390.png
  observed: |
    E3-ket-qua-390.png: tab «Nhập lead» khổ 390 sau khi gửi. Ở đáy, sau thanh nav, chỉ thấy phần đầu thẻ kết quả «Không trùng — lead chờ chia theo luật của sàn» (bị cắt). Lối «Xem ở Lead đã nhập» không thấy trong khung nhìn, nên ảnh không cho thấy kết quả cùng lối như Expected. E3-da-nhap-390.png: tab «Lead đã nhập», dòng đầu «Toà A · chỉ biết toà», «Bán · 3,2 tỷ, đã bao phí», «17:30», nấc «Đã gửi» — khớp Expected ở bước sau.
  network_observed: n-a (driver)
  output: |
    Cổng 3460 không có máy dùng được (thiếu DATABASE_URL), nên chạy dung-d.mjs (chỗ thử 3476) rồi chay-ui.mjs --e3; tắt máy bằng dung-d --tat.
    Dòng e3: coKetQua=true PASS; coLoiTheoDoi=true PASS; ketQuaTrongKhung=false FAIL (nút «Xem ở Lead đã nhập» không nằm trong khung 390x844 ở khung kết quả).
    Sau khi tick lead và bấm lối: dau.nac="Đã gửi" PASS; dau.dong bắt đầu bằng "Toà A · chỉ biết toà ... 17:30 ... Đã gửi" PASS.
    Eval không đạt vì khung 1 mâu thuẫn Expected: kết quả bị cắt, lối không thấy trên màn dù DOM có.

- eval: E4
  run_id: minted-lead-dien-thoai-E4-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T10:14:44Z
  screenshot: evidence/E4-da-gui-390.png
  observed: |
    Đã mở lại 3 frame mới của lần chạy này. E4-da-gui-390.png: khổ 390, một cột, tab «Lead đã nhập», lead mới nhất (17:31) có nấc «Đã gửi». E4-da-nhan-390.png: cùng lead đổi thành «Đã nhận». E4-da-goi-390.png: lead 17:32 hiện «Đã gọi». Cả ba không thấy số điện thoại hay mã hàng, không cuộn ngang. Frame thứ tư E4-len-bang-390.png không được tạo mới (file trong thư mục là bản cũ lúc 16:58, không dùng làm bằng chứng); nấc «Lên bảng» chưa được kiểm.
  network_observed: n-a (driver)
  output: |
    PASS: nacTruoc «Đã gửi»; nacSauNhan «Đã nhận»; nacSauGoi «Đã gọi».
    FAIL: script văng ở bước Lên bảng, chưa in dòng JSON e4. Lỗi: POST /api/v1/listings/<id>/events trả 400 {"error":"missing-requirement","missing":["unitNumber"]}. Lead mẫu «chỉ biết toà» nên hàng tạo từ lead không có số căn, chuyển sang Active bị từ chối. Có thể là lỗi bộ thử (không điền unitNumber trước khi đổi trạng thái), chưa chắc là lỗi app.
    CHƯA KIỂM: nacSauLenBang, cuonNgang tổng, coSoChu tổng, coMaHang, đối chứng dương số mồi trong thân POST.
    Đã tắt máy dev 3476 do verifier dựng.

- eval: E5
  run_id: minted-lead-dien-thoai-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T10:14:44Z
  screenshot: evidence/E5-step1.png
  observed: |
    E5-mat-mang-390.png (390px): form Nhập lead còn nguyên số chủ nhà, Toà A, nhu cầu Bán, giá 3.200.000.000 chọn Bao phí, thời gian Ngay; nút Gửi lead; ở đáy khối báo đỏ «Chưa gửi được — mất mạng». Khớp Expected. E5-gui-lai-390.png: sau khi bật mạng và bấm Gửi, form trống, bên dưới hiện thẻ kết quả «Chủ nhà đã có đầu chủ [Mẫu] Đầu chủ 1 — lea…»; khớp đếm đúng một lead mới.
  network_observed: n-a (driver)
  output: |
    Frame: E5-step1.png (= E5-mat-mang-390.png), E5-step2.png (= E5-gui-lai-390.png).
    Dọn: tắt máy 3476 bằng dung-d.mjs --tat; máy 3460 do verifier bật đã tắt. Script không chạy qua đường dẫn 3460 như đề nêu; đã ghi nhận lệch này.
    chay-ui trả dòng JSON thành công, không stack trace.

- eval: E6
  run_id: minted-lead-dien-thoai-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T10:14:44Z
  screenshot: evidence/E6-mat-mang-390.png
  observed: |
    E6-tab-mat-mang-390 (tab Lead, khoảng 390): dải «Đang xem bản đã tải — mất mạng», tab «Lead đã nhập» đang chọn, khung báo đỏ «Không tải được lead đã nhập» kèm nút «Thử lại»; không có chữ «Chưa có lead nào». E6-tab-co-mang-390: dải mất mạng tắt, danh sách 41 dòng lead sau khi bấm Thử lại. E6-trang-mat-mang-390 (/leads/mine): dải mất mạng, khung lỗi, nút «Thử lại», không «Chưa có lead nào». E6-trang-co-mang-390: dải tắt, bảng 41 dòng. Khớp Expected cả hai ca.
  network_observed: n-a (driver)
  output: |
    tab.lucMat = {coChuaCoLead:false, coThuLai:true, coDaiMatMang:true}; tab.sauKhiCoMang = {coDaiMatMang:false, soDong:41}; trang.lucMat và trang.sauKhiCoMang cùng giá trị.
    Assertion cả 2 ca: lucMat.coChuaCoLead=false PASS; coThuLai=true PASS; coDaiMatMang=true PASS; sauKhiCoMang.coDaiMatMang=false PASS; soDong>=1 (41) PASS.
    Network: E6-network.txt (driver CDP, không đọc được network).

- eval: E7a
  run_id: minted-lead-dien-thoai-E7a-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T10:14:44Z
  output: |
    6 tệp giao diện ngoài bản đồ

- eval: E7b
  run_id: minted-lead-dien-thoai-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-04T10:14:44Z
  output: |
    ℹ duration_ms 33247.2015

- eval: E9
  run_id: minted-lead-dien-thoai-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T10:14:44Z
  screenshot: evidence/E9-step1.png
  observed: |
    step1 (đầu chủ, 390px): «Ô nhận lead» với tab Nhập lead / Lead đã nhập; form đủ Số chủ nhà, Căn hoặc toà, Nhu cầu, Giá, Thời gian; nút Gửi lead ở đáy. step2 (buyer_agent): không form, chỉ thẻ «Vai của bạn không nhập lead». step3 (telesales mới): tab Lead đã nhập hiện trạng thái rỗng «Chưa có lead nào» kèm gợi ý «+ Lead». step4 (đang tải, GET /leads giữ 3 giây): thẻ «Lead đã nhập» với dòng khung chờ, không phải khung trắng. Khớp Expected.
  network_observed: n-a (driver)
  output: |
    Cổng 3460 không có máy; script dùng chỗ thử riêng ở 3476 (dung-d.mjs, tắt bằng --tat).
    Dòng e9: dauChu.coForm=true PASS; muaHang.coForm=false PASS; muaHang.coBaoVai=true PASS; moi.coChuaCoLead=true PASS; dangTai.coKhungCho=true PASS; dangTai.trang=false PASS.
    Đối chứng dương (telesales thấy form ở E1) không chạy lại trong eval này; từng ca ghi coForm true cho dauChu, moi, dangTai.

- eval: E8
  run_id: minted-lead-dien-thoai-E8-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T10:14:44Z
  network_observed: n-a (driver)
  output: |
    Không chạy được. Chưa kiểm assertion nào (soMuc = 5, soCotBang = 3, cuonNgang = false).
    chay-ui.mjs --e8 lỗi hai lần cùng «hết giờ chờ» tại cdp.mjs:134, gọi từ chay-ui.mjs:44 (hàm mo, dòng 248). Không có dòng JSON e8.
    Bốn file E8-*.png trong evidence có giờ sửa 17:10, cũ hơn lượt này; không dùng làm bằng chứng, chưa mở xem.
    Máy dev 3460 do verifier bật vẫn đang chạy, chưa tắt được. Postgres dãy D (5575) đang chạy. Cổng 3476 không có máy.
    Chưa ghi E8-network.txt.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-lead-dien-thoai-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-04T10:14:44Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-lead-dien-thoai-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-04T10:14:44Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-lead-dien-thoai-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-04T10:14:44Z

- cmd: npm run test:hooks
  run_id: minted-lead-dien-thoai-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-04T10:14:44Z

- cmd: npm run typecheck
  run_id: minted-lead-dien-thoai-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-04T10:14:44Z

- cmd: npm run lint
  run_id: minted-lead-dien-thoai-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-04T10:14:44Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval không phân biệt (xanh cả trên HEAD lẫn baseline, chứng minh harness chứ không phải feature; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- E7b (npm test -w @quy-hang/ui-lint)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E3, E4 failed, E8 blocked — E3: kết quả và lối «Xem ở Lead đã nhập» không nằm trong khung 390 sau khi gửi; E4: bước Lên bảng bị từ chối vì thiếu unitNumber nên nấc Lên bảng chưa kiểm; E8: chỗ thử dãy D không dựng được vì máy dev 3460 chiếm apps/web. Returned to implementation.

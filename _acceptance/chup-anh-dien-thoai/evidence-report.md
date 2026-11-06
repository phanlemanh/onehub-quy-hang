---
schema_version: 2
feature_slug: chup-anh-dien-thoai
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1c79e6ae3ce0dbbc642282265ef4690c428b0785
human_signoff:
---

# Evidence Report: chup-anh-dien-thoai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | script | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | ui-check | PASS |
| E13 | AC-1 | ui-check | PASS |
| E14 | AC-2 | ui-check | PASS |
| E15 | AC-4 | ui-check | PASS |
| E16 | AC-5 | ui-check | PASS |
| E17 | AC-5 | script | PASS |
| E18 | AC-3 | ui-check | PASS |
| E19 | AC-6 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-chup-anh-dien-thoai-E1-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T07:51:51Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2987.839042

- eval: E2
  run_id: minted-chup-anh-dien-thoai-E2-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T07:51:51Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2987.839042

- eval: E3
  run_id: minted-chup-anh-dien-thoai-E3-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T07:51:51Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2987.839042

- eval: E4
  run_id: minted-chup-anh-dien-thoai-E4-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T07:51:51Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2987.839042

- eval: E5
  run_id: minted-chup-anh-dien-thoai-E5-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-11-06T07:51:51Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 991.837584

- eval: E6
  run_id: minted-chup-anh-dien-thoai-E6-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T07:51:51Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 993.937

- eval: E7
  run_id: minted-chup-anh-dien-thoai-E7-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T07:51:51Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2987.839042

- eval: E8
  run_id: minted-chup-anh-dien-thoai-E8-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T07:51:51Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2987.839042

- eval: E9
  run_id: minted-chup-anh-dien-thoai-E9-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T07:51:51Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2987.839042

- eval: E10
  run_id: minted-chup-anh-dien-thoai-E10-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-06T07:51:51Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    13 tệp giao diện ngoài bản đồ

- eval: E11
  run_id: minted-chup-anh-dien-thoai-E11-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-06T07:51:51Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 50846.494375

- eval: E12
  run_id: minted-chup-anh-dien-thoai-E12-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T07:51:51Z
  screenshot: evidence/E12-truoc.png
  observed: |
    E12-truoc.png: 375×812 «Căn A-01.06», ảnh lớn xám «Chưa có ảnh», nút «Chụp ảnh» góc phải trên ảnh. E12-chon-ngan.png: ngăn «Chụp ảnh · A-01.06 / Toà A», hai nút Gửi được và Nội bộ, «Mở máy ảnh» xám (tắt) dính đáy. E12-cho-mang.png: khối «Mất mạng», ba dòng Gửi được, Gửi được, Nội bộ (có khoá), mỗi dòng nhãn vàng «Chờ mạng — tự tải khi có mạng». E12-da-tai.png: ba dòng nhãn xanh «Đã tải lên». E12-anh-lon.png: ảnh lớn nhãn «1/3». E12-dau-khach.png: ảnh lớn «1/2», không có nút «Chụp ảnh». E12-tai-lai.png (A-04.02, sau tải lại): mở lại ngăn có đúng ba dòng «Chờ mạng — tự tải khi có mạng»; E12-tai-lai-da-tai.png: ba dòng «Đã tải lên». Tất cả khớp Expected; độ lệch: bước tải lại chạy trên căn A-04.02, các frame A-04.02 và dau-khach chụp ở chế độ tối. DB: A-01.06 thêm 3 dòng unit_photos (shareable, shareable, internal); A-04.02 tăng đúng 3.
  network_observed: clean

- eval: E13
  run_id: minted-chup-anh-dien-thoai-E13-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T07:51:51Z
  screenshot: evidence/E13-step1.html
  observed: |
    E13-step1.html (đã đọc bằng Read): trang HTML ghi kết quả assertion, gồm B1 trước 3/3; dau-khach upload-url bị từ chối listing-agent-required; dau-khach photos bị từ chối listing-agent-required; sau dau-khach vẫn 3/3; dau-chu-1 upload-url trả {"truc_tiep":false}; dau-chu-1 photos tạo ảnh mới Toà A/A-03.02; sau dau-chu-1 4/4; dòng KET: khách không đổi, dau-chu-1 tăng +1. Khớp Expected.
  network_observed: clean

- eval: E14
  run_id: minted-chup-anh-dien-thoai-E14-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T07:51:51Z
  screenshot: evidence/E14-db.txt
  observed: |
    Đã đọc tệp E14-db.txt (không có ảnh, driver là psql). Bảng unit_photos từ 07:58Z có 6 dòng: A-01.06 (shareable x2, internal x1) và A-04.02 (shareable x2, internal x1), building_name «Toà A». Mỗi căn đúng 2 shareable và 1 internal. unit_photo_events có 6 sự kiện added, compartment trong payload trùng compartment của ảnh, độ lệch 0. Khớp Expected: mỗi căn ba dòng mới, hai shareable, một internal, ba sự kiện added đúng ngăn.
  network_observed: n-a (driver)

- eval: E15
  run_id: minted-chup-anh-dien-thoai-E15-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T07:51:51Z
  screenshot: evidence/E15-step1.png
  observed: |
    E15-step1.png: ngăn «Chụp ảnh · A-01.01 / Toà A», hai nút ngăn «Gửi được» và «Nội bộ» (ổ khoá), khối «Mất mạng», ba dòng ảnh (Gửi được, Gửi được, Nội bộ có ổ khoá), mỗi dòng nhãn «Chờ mạng — tự tải khi có mạng», nút «Mở máy ảnh» ở đáy. E15-step2.png: cùng ngăn sau khi mở mạng, ba dòng đều nhãn xanh «Đã tải lên». E15-db.txt: trước 2 dòng, lúc offline vẫn 2, sau 5 (tăng đúng 3), ba mã mới khác nhau, mã có hơn một dòng bằng 0, ba sự kiện added. Lưu ý trung thực: phản hồi lời xác nhận đầu bị chặn sau khi máy chủ đã ghi; máy đối chiếu bằng GET danh sách ảnh rồi gửi hai ảnh còn lại, không gửi lại cùng lời xác nhận. Kết quả cuối đúng Expected.
  network_observed: clean

- eval: E16
  run_id: minted-chup-anh-dien-thoai-E16-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T07:51:51Z
  screenshot: evidence/E16-step2.png
  observed: |
    E16-step2.png (375 wide, /s/ojQtFO4VcHna, chưa đăng nhập): one green and purple cover image, "Toà A · A-01.06", "3,25 tỷ Bao phí", button "Quan tâm"; a single image, no gallery counter, no Nội bộ label. E16-step3.png (dau-khach, 375x812): image counter "1/2", no "Chụp ảnh" button and no Nội bộ tab. E16-step4.png (dau-chu-1, same profile): counter "1/3" (third is Nội bộ), "Chụp ảnh" button at top right of the image. The frames match Expected.
  network_observed: clean

- eval: E17
  run_id: minted-chup-anh-dien-thoai-E17-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-06T07:51:51Z
  output: |
    npm run test:ro-ri
    ℹ duration_ms 300.147709

- eval: E18
  run_id: minted-chup-anh-dien-thoai-E18-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T07:51:51Z
  screenshot: evidence/E18-step1.png
  observed: |
    E18-step1.png (375x812): ngăn «Chụp ảnh · A-01.08 / Tòa A» trên hồ sơ mờ; hai dòng đều «Gửi được» với nhãn «Chờ mạng — tự tải khi có mạng»; nút «Mở máy ảnh» ở đáy. E18-step2.png: màn «Hôm nay» (24 việc), hồ sơ và ngăn đã đóng, không mở lại hồ sơ. E18-hom-nay.png: vẫn ở /today sau 20 giây khi mở mạng; E18-db.txt: 2 dòng lên 4 dòng (+2) không tải lại. E18-doichung-hom-nay.png: bản đối chứng đếm 3 lên 3 (+0). Không mâu thuẫn Expected.
  network_observed: clean

- eval: E19
  run_id: minted-chup-anh-dien-thoai-E19-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T07:51:51Z
  screenshot: evidence/E19-step1.png
  observed: |
    E19-step1.png (375x812, tối): ngăn «Chụp ảnh · A-04.01 / Toà A» mở, hai dòng ảnh cùng nhãn vàng «Chờ mạng — tự tải khi có mạng»: «Gửi được» và «Nội bộ» (có ổ khoá). E19-con.png (sau tải lại, mở lại ngăn): vẫn 2 dòng chờ mạng (đối chứng dương). E19-dang-xuat.png (1280x800): trang đăng nhập Quỹ hàng với ô Email trống và nút «Gửi mã», đã đăng xuất thật. E19-nguoi-b.png: ngăn A-04.01 chỉ có chọn ngăn và câu «Chưa chụp ảnh nào cho căn này.», không có dòng chờ mạng nào. Khớp Expected. Các yêu cầu bị chặn trong lúc chặn mạng là do chính eval cố ý chèn, console sạch.
  network_observed: app-fail

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/connect
  run_id: minted-chup-anh-dien-thoai-SUITE-npm_test_w_quy_hang_connect-r4
  exit_code: 0
  verified_at: 2026-11-06T07:51:51Z

- cmd: npm run test:hooks
  run_id: minted-chup-anh-dien-thoai-SUITE-test_hooks-r4
  exit_code: 0
  verified_at: 2026-11-06T07:51:51Z

- cmd: npm run typecheck
  run_id: minted-chup-anh-dien-thoai-SUITE-typecheck-r4
  exit_code: 0
  verified_at: 2026-11-06T07:51:51Z

- cmd: npm run lint
  run_id: minted-chup-anh-dien-thoai-SUITE-lint-r4
  exit_code: 0
  verified_at: 2026-11-06T07:51:51Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (green trên cả HEAD lẫn baseline; chứng minh harness hoặc regression-guard có chủ ý, nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard):
- npm test -w @quy-hang/web: E1, E2, E3, E4, E7, E8, E9
- npm test -w @quy-hang/api: E5
- npm test -w @quy-hang/core: E6
- design-floor-khuon.mjs --kiem: E10
- npm test -w @quy-hang/ui-lint: E11
- npm run test:ro-ri: E17

Baseline không đo: E12, E13, E14, E15, E16, E18, E19 (ui-check, baseline n-a, chạy trên chỗ thử cần dữ liệu và trình duyệt, không dựng được trên mã cũ).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: REJECT — năm lỗi nằm trong hợp đồng; sửa ở commit 145215dc, trả về triển khai.
Round 2: REJECT — E12 theo luật mạng và hai lỗi trong hợp đồng; sửa ở commit b0d2ac9f, trả về triển khai.
Round 3: REJECT — E14 đếm 6 dòng trên một căn (lỗi đo trong hợp đồng); sửa ở commit 1c79e6ae, mỗi căn nay đúng 3 dòng.
Round 4: tất cả 19 eval và 4 lệnh suite đạt, verdict PASS.


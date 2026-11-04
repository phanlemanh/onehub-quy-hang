---
schema_version: 2
feature_slug: hom-nay-truong-nhom
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d125388a43f97b861df9d0eaa6e43f754760b0cd
human_signoff: Manh Phan 2026-11-04
---

# Evidence Report: hom-nay-truong-nhom

Round 3. Nội dung thay toàn bộ round cũ; lịch sử nằm ở mục Iterations.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-5 | ui-check | PASS |
| E7 | AC-6 | ui-check | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-8 | ui-check | PASS |
| E11 | AC-9 | script | PASS |

## Evidence

- eval: E6
  run_id: minted-hom-nay-truong-nhom-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T06:16:47Z
  screenshot: evidence/E6-truoc-1440.png
  observed: |
    E6-truoc-1440.png: trang Hôm nay > Trưởng nhóm của «[Mẫu] Sàn thử»; ô «Lead quá hạn» = 18 («quá hạn nhận hay gọi», nút Giao lại), Ngoại lệ 9, Hàng cũ 2; panel «Lead quá hạn và ngoại lệ» ghi 27 lead, nhiều dòng «Quá hạn nhận» (Toà A · A-20.01) và «Quá hạn gọi» (Toà B · B-20.02), mỗi dòng có nút «Giao lại»; bảng Theo đầu chủ có 2 đầu chủ. E6-sau-1440.png: cùng màn, ô «Lead quá hạn» = 17, Ngoại lệ 9, Hàng cũ 2; panel ghi 26 lead (giảm 1); các ô còn lại không đổi. Khớp Expected: dòng quá hạn biến mất và ô giảm 1.
  network_observed: n-a (driver)
  output: |
    e6-ket-qua: bấm=đã bấm; chọn=đã chọn một đầu chủ mẫu; không cần xác nhận thêm.
    Lead quá hạn trước 18, sau 17 (giảm 1); số giao lại trước 28, sau 27 (giảm 1).
    Frames: evidence/E6-truoc-1440.png, evidence/E6-sau-1440.png.

- eval: E7
  run_id: minted-hom-nay-truong-nhom-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T06:16:47Z
  screenshot: evidence/E7-bang-dieu-khien-1440.png
  observed: |
    Khung 1440x900, trưởng nhóm, breadcrumb «Hôm nay > Trưởng nhóm». Ba ô: «Lead quá hạn» 19 (quá hạn nhận hay gọi, nhãn Giao lại), «Ngoại lệ» 10 (lead chưa chia được, nhãn Chưa có người), «Hàng cũ» 2 (căn cần gọi lại, nhãn Toàn sàn). Bảng «Theo đầu chủ» có 2 đầu chủ: Đầu chủ 1 (3 căn mở, 33% tươi thanh đỏ, 1/3 căn, 2 cần gọi lại, Cũ) và Đầu chủ 2 (2 căn, 100% thanh xanh, 2/2, 0, Tươi). Bên phải «Lead quá hạn và ngoại lệ» 29 lead với nút Giao lại. Không có chữ «Đang dựng».
  network_observed: n-a (driver)
  output: |
    Dựng dãy D thành công: hàng đợi 29 dòng, quá hạn nhận 9 cộng quá hạn gọi 10 bằng 19; chưa chia được 10.
    Ô Lead quá hạn 19, Ngoại lệ 10, Hàng cũ 2; có Giao lại, có theo người, có toàn sàn, không có chữ Đang dựng.
    Đã tắt máy dev.

- eval: E10
  run_id: minted-hom-nay-truong-nhom-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T06:16:47Z
  screenshot: evidence/E10-dien-thoai-390.png
  observed: |
    E10-dien-thoai-390.png (390x844, giao diện tối): tiêu đề «Hôm nay», thẻ «Bật thông báo lead» (nút Bật thông báo), một thẻ dòng chữ «Hôm nay của trưởng nhóm mở trên máy tính», thanh dưới Hôm nay/Bảng hàng/Gửi/Tôi. Không có bảng điều khiển, không có mục Lead quá hạn/Ngoại lệ/Hàng cũ, không có khối giao lại hay theo người. Khớp Expected.
  network_observed: n-a (driver)
  output: |
    Dòng «mở trên máy tính» có mặt; không có nút Giao lại, không có khối theo người, không có khối toàn sàn.
    Các ô Lead quá hạn, Ngoại lệ, Hàng cũ đều vắng. Đã tắt máy dev.

- eval: E1
  run_id: minted-hom-nay-truong-nhom-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T05:10:32Z
  carried_from_round: 1
  output: |
    carry-forward từ round 1 — delta không chạm paths của eval

- eval: E2
  run_id: minted-hom-nay-truong-nhom-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T05:10:32Z
  carried_from_round: 1
  output: |
    carry-forward từ round 1 — delta không chạm paths của eval

- eval: E3
  run_id: minted-hom-nay-truong-nhom-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T05:10:32Z
  carried_from_round: 1
  output: |
    carry-forward từ round 1 — delta không chạm paths của eval

- eval: E4
  run_id: minted-hom-nay-truong-nhom-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T05:10:32Z
  carried_from_round: 1
  output: |
    carry-forward từ round 1 — delta không chạm paths của eval

- eval: E5
  run_id: minted-hom-nay-truong-nhom-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T05:10:32Z
  carried_from_round: 1
  output: |
    carry-forward từ round 1 — delta không chạm paths của eval

- eval: E8
  run_id: minted-hom-nay-truong-nhom-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T05:10:32Z
  carried_from_round: 1
  output: |
    carry-forward từ round 1 — delta không chạm paths của eval

- eval: E9
  run_id: minted-hom-nay-truong-nhom-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T05:10:32Z
  carried_from_round: 1
  output: |
    carry-forward từ round 1 — delta không chạm paths của eval

- eval: E11
  run_id: minted-hom-nay-truong-nhom-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T06:11:47Z
  carried_from_round: 2
  output: |
    carry-forward từ round 2 — delta không chạm paths của eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-hom-nay-truong-nhom-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-04T06:16:47Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-hom-nay-truong-nhom-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-04T06:16:47Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-hom-nay-truong-nhom-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-04T06:16:47Z

- cmd: npm run test:hooks
  run_id: minted-hom-nay-truong-nhom-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-04T06:16:47Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-hom-nay-truong-nhom-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-04T06:16:47Z

- cmd: npm run typecheck
  run_id: minted-hom-nay-truong-nhom-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-04T06:16:47Z

- cmd: npm run lint
  run_id: minted-hom-nay-truong-nhom-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-04T06:16:47Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — mọi eval nhiều lần chạy đều đồng đều (không eval nào có runs lớn hơn 1)

## Iterations

Round 1: E1-E5, E8, E9 chạy lần gốc (hồ sơ gốc); các eval này được mang tiếp sang các round sau.
Round 2: E6 failed — lệnh chụp không chọn được đầu chủ để giao lại; E11 xanh. Returned to implementation.
Round 3: lệnh chụp E6 sửa chọn đầu chủ còn chọn được; E6, E7, E10 và bảy lệnh suite chạy lại, xanh; E1-E5, E8, E9, E11 mang tiếp (delta không chạm paths). Verdict PASS.

### Re-pin lần 1 — 2026-11-04, do hoá cũ do gộp main (PR #112) sau chữ ký
run_id: repin-20261104T075507Z-43686
sha: d125388a43f97b861df9d0eaa6e43f754760b0cd · suites: 7 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng · ngoài làn máy: E6 (E6 không khai paths), E7 (E7 không khai paths), E10 (E10 không khai paths) · AC không có chốt máy: AC-6

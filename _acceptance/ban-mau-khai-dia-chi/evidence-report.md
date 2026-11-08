---
schema_version: 2
feature_slug: ban-mau-khai-dia-chi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d3603a1ab3b41432e81e8671a61a566c0344831f
human_signoff:
---

# Evidence Report: ban-mau-khai-dia-chi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | script | PASS |
| E10 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-ban-mau-khai-dia-chi-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-08T16:43:04Z
  screenshot: evidence/ban-mau-may-tinh-that.png
  observed: |
    E1-step2/ban-mau-may-tinh-that.png (/inventory, 1440x900 sang): thanh tren [Mau] San thu + o tim + +Lead + chuong + DA; cot bieu tuong 3 icon, icon Bang hang (o giua) dang sang; cot hai co "Goc nhin cua doi: Chua co goc nhin", "Goc nhin cua toi: Chua co goc nhin", "Luu goc nhin", "Do tuoi: Chua co so"; bang hang 1 can A-01.01. E1-step3/ban-mau-may-tinh-mau.png (/proto/nhanh-tuc-thi): cung thanh tren, cung icon Bang hang sang, cot hai y het; noi dung chinh la "Trang thu dong bo" (Toa A A-01.01, gia, trang thai). Khop Expected. E1-step4.png (/today?nhom=new_lead) la man that /today, cot hai co 6 muc, "Lead moi" sang. E1-step5.png (/mau/he-bo-cuc): trang mau song co khung xem nhung ben trong co thanh tren, icon Bang hang sang, cot hai "Goc nhin cua doi/toi" - khop Expected (nha sang va co cot hai). Chu y: o 2 anh dau 1 huy hieu loi dev "1 Issue" (Next dev overlay) khong anh huong.
  network_observed: clean
  output: |
    PASS /mau/he-bo-cuc: khung ngoai khong co shell, nhung khung iframe /mau/he-bo-cuc/xem co nha "Bang hang" aria-current=page, cot hai "Cot Bang hang" (nSecond=1), muc "Moi can" aria-current=page; screenshot thay ro.
    Khung da luu: ban-mau-may-tinh-that.png, ban-mau-may-tinh-mau.png, E1-step2.png, E1-step3.png, E1-step4.png, E1-step5.png, E1-network.txt.

- eval: E2
  run_id: minted-ban-mau-khai-dia-chi-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-08T16:43:04Z
  screenshot: evidence/ban-mau-dien-thoai-that.png
  observed: |
    Đã mở bằng Read cả hai ảnh ban-mau-dien-thoai-that.png và ban-mau-dien-thoai-mau.png; E2-step1.png và E2-step2.png được chụp ngay sau từng ảnh đó, cùng nội dung, không mở lại.
    - ban-mau-dien-thoai-that.png: đầu màn ghi "Bảng hàng" kèm các biểu tượng tìm, cộng, đồng bộ, chuông. Nội dung có "1 căn", nút Lọc và Chọn, nhóm "TOÀ A" và căn A-01.01 giá 3,5 tỷ. Tab dưới có ba mục Hôm nay, Bảng hàng, Tôi; "Bảng hàng" đậm và sáng, đúng một tab sáng. Không có chữ "Quỹ hàng".
    - ban-mau-dien-thoai-mau.png: đầu màn ghi "Bảng hàng" giống hệt, cùng các biểu tượng. Nội dung là "Trang thử đồng bộ" với căn Toà A · A-01.01, giá 3.500.000.000. Tab dưới "Bảng hàng" sáng, cùng vị trí và cùng cách hiện như ảnh thật. Không có chữ "Quỹ hàng".
    Kết luận: khớp Expected, hai đường cùng tiêu đề «Bảng hàng», cùng một tab sáng, không đường nào hiện «Quỹ hàng».
    Ghi chú ngoài phạm vi: huy hiệu "N" tròn đen ở góc dưới trái là nút dev overlay của Next, đè lên tab "Hôm nay".
  network_observed: unscoped-partial

- eval: E3
  run_id: minted-ban-mau-khai-dia-chi-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-08T16:43:04Z
  output: |
    ℹ duration_ms 37848.909292

- eval: E4
  run_id: minted-ban-mau-khai-dia-chi-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T16:43:04Z
  output: |
    ℹ duration_ms 9146.983792

- eval: E5
  run_id: minted-ban-mau-khai-dia-chi-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-08T16:43:04Z
  output: |
    typecheck hoàn tất, không lỗi kiểu

- eval: E5b
  run_id: minted-ban-mau-khai-dia-chi-E5b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script
  verified_at: 2026-11-08T16:43:04Z
  output: |
    không còn nhaMau

- eval: E6
  run_id: minted-ban-mau-khai-dia-chi-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-08T16:43:04Z
  output: |
    ℹ duration_ms 51870.899

- eval: E7
  run_id: minted-ban-mau-khai-dia-chi-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-08T16:43:04Z
  output: |
    ℹ duration_ms 51870.899

- eval: E8
  run_id: minted-ban-mau-khai-dia-chi-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-08T16:43:04Z
  output: |
    ℹ duration_ms 51870.899

- eval: E9
  run_id: minted-ban-mau-khai-dia-chi-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-08T16:43:04Z
  output: |
    chuẩn giao diện: đạt

- eval: E9b
  run_id: minted-ban-mau-khai-dia-chi-E9b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script
  verified_at: 2026-11-08T16:43:04Z
  output: |
    cấu hình nghiệm thu không đổi

- eval: E10
  run_id: minted-ban-mau-khai-dia-chi-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-08T16:43:04Z
  output: |
    7 tệp giao diện ngoài bản đồ

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-ban-mau-khai-dia-chi-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-08T16:43:04Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-ban-mau-khai-dia-chi-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-08T16:43:04Z

- cmd: npm run test:hooks
  run_id: minted-ban-mau-khai-dia-chi-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-08T16:43:04Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline, chứng minh harness hơn là feature; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- E3 (npm test -w @quy-hang/core)
- E4 (npm test -w @quy-hang/web)
- E5 (npm run typecheck)
- E6, E7, E8 (npm test -w @quy-hang/ui-lint)
- E9 (npm run lint)
- E9b (kiểm cấu hình nghiệm thu không đổi)
- E10 (lưới khuôn của kit)

E5b đỏ trên baseline (có phân biệt). E1 và E2 baseline n-a.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval đạt, không eval nào hỏng. Chuyển Cổng 2.

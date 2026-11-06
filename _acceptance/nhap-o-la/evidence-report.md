---
schema_version: 2
feature_slug: nhap-o-la
verdict: REJECT
failed_evals: ["E4b"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1aacf01501845647a2d5fbc0794bbd25c12e8752
human_signoff:
---

# Evidence Report: nhap-o-la

Round 2. Một eval không đạt: E4b (ui-check). Lệnh fail không gắn eval nào: không có (lệnh duy nhất fail là ui-check:E4b, đã gắn E4b). Review không thiếu finder nào.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | ui-check | FAIL |
| E4c | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS (carry-forward r1) |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS (carry-forward r1) |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS (carry-forward r1) |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-nhap-o-la-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T07:34:12Z
  output: |
    ℹ duration_ms 1260.743625
    __EXIT=0

- eval: E1b
  run_id: minted-nhap-o-la-E1b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-06T07:34:12Z
  output: |
    ℹ duration_ms 1653.629042
    __EXIT=0

- eval: E2
  run_id: minted-nhap-o-la-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-06T07:34:12Z
  output: |
    ℹ duration_ms 149874.413125
    __EXIT=0

- eval: E2b
  run_id: minted-nhap-o-la-E2b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-06T07:34:12Z
  output: |
    ℹ duration_ms 1653.629042
    __EXIT=0

- eval: E3
  run_id: minted-nhap-o-la-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T07:34:12Z
  output: |
    ℹ duration_ms 1260.743625
    __EXIT=0

- eval: E4
  run_id: minted-nhap-o-la-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T07:34:12Z
  output: |
    ℹ duration_ms 5627.09275
    __EXIT=0

- eval: E4b
  run_id: minted-nhap-o-la-E4b-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T07:34:12Z
  screenshot: evidence/E4b-co-de-xuat-1440.png
  observed: |
    Đã mở và xem sáu ảnh trực tiếp: co-de-xuat-1440, co-de-xuat-375, da-dung-1440, da-dung-375, tat-dinh-1440, tat-dinh-375. Cộng thêm o-dai-375, o-trang-thai-375, da-dung-o-trang-thai-1440 và da-dung-o-trang-thai-375. Các ảnh còn lại chỉ đối chiếu qua dòng JSON.
    co-de-xuat-1440: bước Xem trước, hàng 2 và 3 có ô giá «4.6–4.8 tỷ» kèm huy hiệu «Cần người», sau đó huy hiệu «Máy đề xuất», «4,8 tỷ», nút «Dùng» và lý do 2 dòng dưới ô nhập. Hàng 4 hiện «Máy đề xuất» + «Đang giao dịch» + «Dùng» ở ô trạng thái. Ảnh không thấy ô «thu về 4.2» vì nằm dưới khung.
    co-de-xuat-375: chỉ là đầu trang, chưa tới ô nào, nên không có huy hiệu. Ba ca o-dai, o-ve-tay, o-trang-thai ở 375 bù vào: huy hiệu «Máy đề xuất», chữ đề xuất, nút «Dùng» đứng riêng một dòng (không bị cắt), lý do 4–6 dòng ở cột hẹp. Ô trạng thái «đang đàm phán» bị cắt mép phải bởi khung cuộn ngang của bảng.
    da-dung-1440 và da-dung-375: bảng cuộn xuống giữa. Hàng A-0103 ở cột trạng thái là «Đang giao dịch» chữ trơn, không huy hiệu, không nút. Hàng A-0104 hiện «đang đàm phán → Pending» kèm huy hiệu «Máy sửa» và «kế hoạch đọc «đang đàm phán» là «Đang giao dịch»». Dòng «Đã đổi theo 1 ô cùng chữ» KHÔNG xuất hiện trong ảnh nào.
    tat-dinh-1440 và tat-dinh-375: khối «Máy không đề xuất lần này» với «Sửa tay lần này: AI đang lỗi, thử lại sau», các ô «Cần người» chỉ có ô nhập, không có huy hiệu «Máy đề xuất» nào. Khớp expected.
    Kết luận: toàn bộ expected khớp, trừ dòng «Đã đổi theo 1 ô cùng chữ» không hiện trong ảnh da-dung nên eval không đạt.
  network_observed: n-a (driver)
  ghi chú: lý do không đạt — dòng «Đã đổi theo 1 ô cùng chữ» có trong DOM nhưng không có trong ảnh da-dung nào (bốn ảnh da-dung và da-dung-o-trang-thai đều cuộn xuống giữa bảng, khối thông báo nằm phía trên khung chụp), trong khi expected đòi ảnh cho thấy dòng này. Lưu ý không tính là lỗi: lý do đề xuất xuống 2 dòng ở 1440 và 4–6 dòng ở 375; ở 375 ô trạng thái «đang đàm phán» bị cắt mép phải trong khung cuộn ngang riêng, trang không tràn ngang.
  output: |
    Chạy: dung-o-la.mjs, chup-o-la.mjs --kho 1440 và --kho 375, rồi dung-o-la.mjs --tat (đã tắt máy chủ thử, cổng 3493 không còn nghe).
    Assertion theo JSON, cả hai khổ: co-de-xuat có 6 đề xuất, thấy «4,8 tỷ», «4,2 tỷ KBP», «Đang giao dịch» đạt; ba ô có huy hiệu, chữ đề xuất, lý do, nút «Dùng» đạt; không tràn ngang ở mọi ca đạt; nút «Dùng» 54x28 ở 1440 và 54x44 ở 375, không bị cắt đạt.
    da-dung: daBam=true, đếm Giữ nguyên 4→5, Cần người 6→4 đạt. tat-dinh: dòng «Sửa tay lần này: AI đang lỗi, thử lại sau», không huy hiệu, 0 đề xuất đạt.
    Không đạt: dongDoiTheo=true trong DOM nhưng không có trong ảnh da-dung nào.
    Ghi chú mạng: evidence/E4b-network.txt (driver là script CDP, không đọc được trạng thái mạng).

- eval: E4c
  run_id: minted-nhap-o-la-E4c-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test
  verified_at: 2026-11-06T07:34:12Z
  output: |
    ℹ duration_ms 26186.715083
    __EXIT=0

- eval: E5
  run_id: minted-nhap-o-la-E5-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-06T06:01:44Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5b
  run_id: minted-nhap-o-la-E5b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-06T07:34:12Z
  output: |
    ℹ duration_ms 149874.413125
    __EXIT=0

- eval: E6
  run_id: minted-nhap-o-la-E6-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-06T06:01:44Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-nhap-o-la-E7-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-06T07:34:12Z
  output: |
    ℹ duration_ms 149874.413125
    __EXIT=0

- eval: E7b
  run_id: minted-nhap-o-la-E7b-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-06T06:01:44Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-nhap-o-la-E8-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T07:34:12Z
  output: |
    ℹ duration_ms 1260.743625
    __EXIT=0

- eval: E9
  run_id: minted-nhap-o-la-E9-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-06T07:34:12Z
  output: |
    ℹ duration_ms 149874.413125
    __EXIT=0

- eval: E10
  run_id: minted-nhap-o-la-E10-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-06T07:34:12Z
  output: |
    2 tệp giao diện ngoài bản đồ
    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-nhap-o-la-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-06T07:34:12Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-nhap-o-la-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-06T07:34:12Z

- cmd: npm run test:hooks
  run_id: minted-nhap-o-la-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-06T07:34:12Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-nhap-o-la-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-06T07:34:12Z

- cmd: npm run typecheck
  run_id: minted-nhap-o-la-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-06T07:34:12Z

- cmd: npm run lint
  run_id: minted-nhap-o-la-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-06T07:34:12Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả code mới lẫn baseline, chứng minh harness chứ chưa chứng minh tính năng; cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/core — E1, E3, E8
- npm run test:ro-ri — E1b, E2b
- db:migrate rồi db:test (Postgres cổng 5573) — E2, E5b, E7, E9
- npm test -w @quy-hang/web — E4
- npm run test:db -w @quy-hang/web — E4c
- design-floor-khuon --kiem — E10

Baseline không đo: E4b (eval ui-check mới, chạy trên code cũ không có nghĩa).

Ghi chú nội dung: một finding trong hợp đồng (AC-8) cho thấy chỉ tiêu «tự ghi = 0» của E8 dùng hàm nhận rỗng nên không đo đường nhận thật của màn; xem review-findings.md.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E4b, E4c và SUITE ui-lint không đạt ở lượt đầu; trả về triển khai (commit 1aacf015 sửa vòng 1).
Round 2: E4b không đạt — dòng «Đã đổi theo 1 ô cùng chữ» có trong DOM nhưng không hiện trong ảnh da-dung nào; các eval còn lại đạt (E5, E6, E7b mang từ round 1). Trả về triển khai.

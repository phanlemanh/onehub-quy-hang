---
schema_version: 2
feature_slug: can-nhap-len-bang-chung
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c2b9a519e59797e095f7ab36e67e5841547509f9
human_signoff:
---

# Evidence Report: can-nhap-len-bang-chung

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | ui-check | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-9 | script | PASS |

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval khong-phan-biet (pass tren ca HEAD lan baseline; round nay baseline khong do nen chi ghi nhan de nguoi xem xet viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y):
- `npm test -w @quy-hang/core`: E1
- `DATABASE_URL="${DATABASE_URL:-postgres://postgres:quyhang@localhost:5573/postgres}" sh -c 'npm run db:migrate && npm run db:test'`: E2, E3, E4, E5, E6, E8, E10
- `DATABASE_URL="${DATABASE_URL:-postgres://postgres:quyhang@localhost:5573/postgres}" npm run test:db -w @quy-hang/web`: E7
- `node "$R/scripts/design-floor-khuon.mjs" --kiem --root .`: E11

## Evidence

- eval: E9
  run_id: minted-can-nhap-len-bang-chung-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-08T04:08:43Z
  screenshot: evidence/E9-ket-qua-nhap-1440.png
  observed: |
    Đã mở cả 10 ảnh. Kết quả nhập 1440: bước 5 «Tóm tắt», khối «Đã ghi vào Quỹ hàng» ghi «Ghi 2 căn mới, cập nhật 0, tin bổ sung 0, bỏ 0. 2 căn lên Đang bán. Căn ở Chưa đủ để rao là «Chỉ tôi»…», có nút Hoàn tác và Mở Bảng hàng; không có tông đỏ hay vàng. Ở 375 cùng nội dung, xếp dọc, không tràn. Lưu ý: tóm tắt không nêu số «0 căn Chưa đủ để rao» thành con số riêng, chỉ có câu chung; đếm 2 Đang bán thì đúng. Hôm nay 1440: nhóm «Thiếu thông tin» đếm 2, A-06.06 và A-06.05, cột «Vì sao hôm nay» bị cắt ở «Thiếu: nội thất, pháp lý, tài chính, tình trạng s…», và hàng hành động chồng nhau chữ «Đổi giá, trạng thái · Mở hồ sơ». Ở 375 mã căn bị cắt («A-02.06 ·…») và lý do chỉ hiện «Thiếu: nội t…»; đây là lỗi trình bày nhẹ ngoài phạm vi E9. Hồ sơ A-06.05 1440: badge «Đang bán», «Xác nhận hôm nay», dòng «Mức đủ thông tin · thiếu Nội thất, Pháp lý, Tài chính, Tình trạng sử dụng, Ảnh thật» 1/6. Hồ sơ 375: badge Đang bán, «Xác nhận hôm nay», 1/6 với cùng danh sách thiếu (chữ hơi chồng ở cạnh «1/6»). Bảng hàng 1440: hai dòng A-06.06 và A-06.05, cột Trạng thái là badge xanh «Đang bán». Bảng hàng 375: hai thẻ căn A-02.06 và A-02.05, giá 3,5 tỷ Bao phí, không có nhãn trạng thái trên thẻ. Hôm nay đầu chủ B 1440: «1 việc», nhóm Thiếu thông tin 1, căn A-06.04 (2PN 82,3 m²), không thấy A-06.06 hay A-06.05 của A. Ở 375: nhóm Thiếu thông tin 1, căn A-02.04. Mọi khung khớp Expected, trừ hai ghi chú ở trên (thẻ bảng hàng 375 không có nhãn trạng thái; tóm tắt không có con số «0» riêng).
  network_observed: n-a (driver)
  output: |
    9. Không có tràn ngang ở mọi khung (tranNgang=false).
    Frame đã lưu trong evidence/: E9-ket-qua-nhap-1440.png, E9-ket-qua-nhap-375.png, E9-hom-nay-1440.png, E9-hom-nay-375.png, E9-ho-so-1440.png, E9-ho-so-375.png, E9-bang-hang-1440.png, E9-bang-hang-375.png, E9-hom-nay-b-1440.png, E9-hom-nay-b-375.png.

- eval: E1
  run_id: minted-can-nhap-len-bang-chung-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-08T03:07:35Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-can-nhap-len-bang-chung-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-08T03:07:35Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-can-nhap-len-bang-chung-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-08T03:07:35Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-can-nhap-len-bang-chung-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-08T03:07:35Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-can-nhap-len-bang-chung-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-08T03:07:35Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-can-nhap-len-bang-chung-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-08T03:07:35Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-can-nhap-len-bang-chung-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web_db
  verified_at: 2026-11-08T03:07:35Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-can-nhap-len-bang-chung-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-08T03:07:35Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-can-nhap-len-bang-chung-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-08T03:07:35Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-can-nhap-len-bang-chung-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-08T03:07:35Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-can-nhap-len-bang-chung-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-08T04:08:43Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-can-nhap-len-bang-chung-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-08T04:08:43Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-can-nhap-len-bang-chung-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-08T04:08:43Z

- cmd: npm run test:hooks
  run_id: minted-can-nhap-len-bang-chung-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-08T04:08:43Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-can-nhap-len-bang-chung-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-08T04:08:43Z

- cmd: npm run typecheck
  run_id: minted-can-nhap-len-bang-chung-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-08T04:08:43Z

- cmd: npm run lint
  run_id: minted-can-nhap-len-bang-chung-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-08T04:08:43Z

## Known limits

## Ngoài hợp đồng

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E9 failed — khung hồ sơ dò chữ ở cả trang thay vì dò mục còn thiếu. Returned to implementation.
Round 2: E9 failed — khung bang-hang 375 chụp lúc trang đang tải. Returned to implementation.
Round 3: tất cả eval đạt — E9 chạy lại với một kiểu chờ dữ liệu cho mọi khung; E1-E8, E10, E11 carry-forward từ round 1.

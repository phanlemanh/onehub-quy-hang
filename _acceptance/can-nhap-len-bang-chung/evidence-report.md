---
schema_version: 2
feature_slug: can-nhap-len-bang-chung
verdict: REJECT
failed_evals: ["E9"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a65ec2e174182868c83beb906d851a386d8b8e4e
human_signoff:
---

# Evidence Report: can-nhap-len-bang-chung

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS (carry-forward round 1) |
| E2 | AC-2 | test | PASS (carry-forward round 1) |
| E3 | AC-3 | test | PASS (carry-forward round 1) |
| E4 | AC-4 | test | PASS (carry-forward round 1) |
| E5 | AC-5 | test | PASS (carry-forward round 1) |
| E6 | AC-6 | test | PASS (carry-forward round 1) |
| E7 | AC-7 | test | PASS (carry-forward round 1) |
| E8 | AC-8 | test | PASS (carry-forward round 1) |
| E9 | AC-9 | ui-check | FAIL |
| E10 | AC-10 | test | PASS (carry-forward round 1) |
| E11 | AC-9 | script | PASS (carry-forward round 1) |

E9 trượt vì khung Bảng hàng ở 375 trái điều đã hứa: ảnh gần như trống, không có căn nào ở Đang bán. Các khung còn lại đều khớp. Chưa phân định được máy dev chậm hay màn lỗi thật.

## Evidence

- eval: E9
  run_id: minted-can-nhap-len-bang-chung-E9-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-08T03:45:13Z
  screenshot: evidence/E9-ket-qua-nhap-1440.png
  observed: |
    1440 (đã mở từng ảnh):
    - ket-qua-nhap: khối "Đã ghi vào Quỹ hàng" ghi "Ghi 2 căn mới, cập nhật 0, tin bổ sung 0, bỏ 0. 2 căn lên Đang bán...". Khối có tông thường, không đỏ, không cảnh báo. Không có dòng nào đếm "Chưa đủ để rao". Có nút "Hoàn tác lần nhập này" và "Mở Bảng hàng". Khớp expected.
    - hom-nay: nhóm "Thiếu thông tin" đếm 2, chứa A-05.05 và A-05.06 (dòng "Thiếu: nội thất, pháp lý, tài chính, tình trạng s…"). Khớp.
    - ho-so: A-05.05, badge xanh "Đang bán", "Xác nhận hôm nay". Dòng mức đủ ghi "thiếu Nội thất, Pháp lý, Tài chính, Tình trạng sử dụng, Ảnh thật", 1/6. Khớp.
    - bang-hang: lưới có 2 căn A-05.05 và A-05.06, cột Trạng thái là badge xanh "Đang bán". Khớp.
    - hom-nay-b (người giữ B): nhóm "Thiếu thông tin" đếm 1, chứa A-05.04, không thấy căn của A. Khớp.
    375 (đã mở từng ảnh):
    - ket-qua-nhap: cùng nội dung "2 căn lên Đang bán", không đỏ, không cảnh báo, vừa khổ, không tràn ngang. Khớp.
    - hom-nay: nhóm "Thiếu thông tin" đếm 2 với A-08.05 và A-08.06 dạng thẻ. Khớp.
    - ho-so: "Căn A-08.05", badge "Đang bán", dòng mức đủ liệt kê thiếu Nội thất, Pháp lý, Tài chính, Tình trạng sử dụng, Ảnh thật, 1/6. Khớp.
    - bang-hang: ảnh gần như trống, chỉ có tiêu đề "Bảng hàng", vòng quay tải trên thanh trên và thanh dưới. Không có căn A-08.05 hay A-08.06, không có trạng thái Đang bán. MÂU THUẪN với expected.
    - hom-nay-b: nhóm "Thiếu thông tin" đếm 1 với A-08.04. Khớp.
  network_observed: n-a (driver)
  output: |
    Dựng máy dev 3493 bằng dung.mjs: lên được. Tắt bằng --tat: đã tắt (PID 91546); cổng 3493 trả 000 sau đó.
    Chạy chup.mjs:
    - 1440 lần 1: hết giờ chờ A-07.05 ở Bảng hàng (log máy dev báo ChunkLoadError, "Manifest file is empty"). Chạy lại: đủ 5 dòng JSON.
    - 375 lần 1: hết giờ chờ "Thiếu thông tin" ở Hôm nay. Lần 2: đủ 5 dòng JSON. Lần 3 (xem khung Bảng hàng có lặp lại không): hết giờ chờ "Thiếu thông tin" ở Hôm nay.
    - Máy dev dãy G không ổn định, nhiều lần hết giờ chờ.
    Khung 1440: ket-qua-nhap, hom-nay, ho-so, bang-hang, hom-nay-b đều ĐẠT; tranNgang=false ở cả 5 khung.
    Khung 375 (lần chạy đủ JSON): ket-qua-nhap, hom-nay, ho-so, hom-nay-b ĐẠT. bang-hang TRƯỢT: JSON ghi coCan=false; ảnh E9-bang-hang-375.png trống, chỉ có tiêu đề và vòng quay tải. Expected nói Bảng hàng hiện căn ở Đang bán.
    Không đọc được network qua driver này, nên không có E9-network.txt.
    Ảnh đã lưu trong _acceptance/can-nhap-len-bang-chung/evidence/: E9-{ket-qua-nhap,hom-nay,ho-so,bang-hang,hom-nay-b}-{1440,375}.png.

- eval: E1
  run_id: minted-can-nhap-len-bang-chung-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-08T03:07:35Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-can-nhap-len-bang-chung-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-08T03:07:35Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-can-nhap-len-bang-chung-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-08T03:07:35Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-can-nhap-len-bang-chung-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-08T03:07:35Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-can-nhap-len-bang-chung-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-08T03:07:35Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-can-nhap-len-bang-chung-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-08T03:07:35Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-can-nhap-len-bang-chung-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: test
  verified_at: 2026-11-08T03:07:35Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-can-nhap-len-bang-chung-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-08T03:07:35Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-can-nhap-len-bang-chung-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-08T03:07:35Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-can-nhap-len-bang-chung-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-08T03:07:35Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-can-nhap-len-bang-chung-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-08T03:45:13Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-can-nhap-len-bang-chung-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-08T03:45:13Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-can-nhap-len-bang-chung-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-08T03:45:13Z

- cmd: npm run test:hooks
  run_id: minted-can-nhap-len-bang-chung-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-08T03:45:13Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-can-nhap-len-bang-chung-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-08T03:45:13Z

- cmd: npm run typecheck
  run_id: minted-can-nhap-len-bang-chung-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-08T03:45:13Z

- cmd: npm run lint
  run_id: minted-can-nhap-len-bang-chung-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-08T03:45:13Z

Lệnh fail không gắn eval: ui-check:E9 (gắn eval E9, đã nêu ở trên).

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi). Field baseline cua moi eval la n-a.

Eval không phân biệt (pass trên cả HEAD lẫn baseline; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/core — eval E1
- npm run db:migrate && npm run db:test (Postgres dãy G 5573) — evals E2, E3, E4, E5, E6, E8, E10
- npm run test:db -w @quy-hang/web (Postgres dãy G 5573) — eval E7
- design-floor-khuon.mjs --kiem --root . — eval E11

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E8, E10, E11 đạt (các eval này được mang sang round 2).
Round 2: E9 failed — khung Bảng hàng ở 375 trống, không hiện căn ở Đang bán; máy dev dãy G không ổn định (nhiều lần hết giờ chờ). Returned to implementation.

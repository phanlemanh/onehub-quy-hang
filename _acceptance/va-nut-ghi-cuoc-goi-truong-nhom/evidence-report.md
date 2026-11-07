---
schema_version: 2
feature_slug: va-nut-ghi-cuoc-goi-truong-nhom
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1069fdd1a7de8cc97a1dd5606e05083888d94ac0
human_signoff:
---

# Evidence Report: va-nut-ghi-cuoc-goi-truong-nhom

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-5 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-va-nut-ghi-cuoc-goi-truong-nhom-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-07T22:08:29Z
  output: |
    npm test -w @quy-hang/core đạt; ma trận 12 ô của lopPhuHoSo khớp «Bảng người xem».

- eval: E2
  run_id: minted-va-nut-ghi-cuoc-goi-truong-nhom-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T22:08:29Z
  output: |
    npm test -w @quy-hang/web đạt; nút chính theo cờ đúng 5 ca, quét mã nguồn units/ho-so/** sạch.

- eval: E3
  run_id: minted-va-nut-ghi-cuoc-goi-truong-nhom-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T22:08:29Z
  output: |
    npm test -w @quy-hang/web đạt; luật cửa màn ghi cuộc gọi khớp quan hệ nút ⇒ trang, 0 ca lệch.

- eval: E4
  run_id: minted-va-nut-ghi-cuoc-goi-truong-nhom-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-07T22:08:29Z
  screenshot: evidence/E4-1-truong-nhom.png
  observed: |
    E4-1-truong-nhom.png: tiêu đề "Căn A-04.06", ảnh, "Đang bán", 8,06 tỷ, Thuộc tính căn; không nút chính dính đáy (không Ghi cuộc gọi, không Hỏi đầu chủ); phần nguồn "Nội bộ" nằm dưới màn (xác nhận qua DOM, ảnh chỉ trong viewport). E4-2-dau-chu-sau-bam.png: màn "Ghi cuộc gọi" với huy hiệu "Nên gọi điều chỉnh giá", KẾT QUẢ CUỘC GỌI (Hạ giá, Giữ giá, Đã cọc/bán, Không nghe máy), lịch sử trả giá, "Giá đáy chủ từng nói · Nội bộ". E4-3-dau-khach.png: nút đen "Hỏi đầu chủ", không nút Ghi cuộc gọi. E4-4-truong-nhom-call-thang.png: "Không thấy trang này", nút "Về Hôm nay". E4-5-truong-nhom-co-vai-sau-bam.png: giống E4-2. Khớp Expected về hành vi; tiêu đề màn là "Ghi cuộc gọi", không phải nhãn «Gọi ép giá» như đề bài viết, chức năng ép giá hiện diện.
  network_observed: clean

- eval: E5
  run_id: minted-va-nut-ghi-cuoc-goi-truong-nhom-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-07T22:08:29Z
  output: |
    Bước chấm khuôn không in dòng «lệch:» nào cho nhóm ho-so-can; còn 4 tệp giao diện ngoài bản đồ.

- eval: E6
  run_id: minted-va-nut-ghi-cuoc-goi-truong-nhom-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-07T22:08:29Z
  output: |
    npm test -w @quy-hang/ui-lint đạt; bảng viết trước của bản đồ khuôn khớp.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-nut-ghi-cuoc-goi-truong-nhom-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-07T22:08:29Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-nut-ghi-cuoc-goi-truong-nhom-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-07T22:08:29Z

- cmd: npm run test:hooks
  run_id: minted-va-nut-ghi-cuoc-goi-truong-nhom-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-07T22:08:29Z

- cmd: npm run typecheck
  run_id: minted-va-nut-ghi-cuoc-goi-truong-nhom-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-07T22:08:29Z

- cmd: npm run lint
  run_id: minted-va-nut-ghi-cuoc-goi-truong-nhom-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-07T22:08:29Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên code cũ lẫn mới, chứng minh harness chứ chưa chứng minh feature; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/core: E1
- npm test -w @quy-hang/web: E2, E3
- bước chấm khuôn design-floor-khuon (--kiem): E5
- npm test -w @quy-hang/ui-lint: E6

Baseline không đo: E4 (n-a) — eval giao diện chạy trên chỗ thử, không chạy được trên code cũ.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả eval PASS; không có eval thất bại.


### Re-pin lần 1 — 2026-11-07, do ghim lại sau khi gộp nhánh chính
run_id: repin-20261107T235104Z-10697
sha: 1069fdd1a7de8cc97a1dd5606e05083888d94ac0 · suites: 7 lệnh exit 0 · evals: 5/5 eval máy đạt kỳ vọng · ngoài làn máy: E4 · AC không có chốt máy: AC-4 · suite chạy ở môi trường giống CI (biến rỗng: DATABASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, APP_URL)

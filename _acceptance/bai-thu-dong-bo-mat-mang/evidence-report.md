---
schema_version: 2
feature_slug: bai-thu-dong-bo-mat-mang
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 468831a51f167c6eda2deb3838e9b76bb21e9735
human_signoff:
---

# Evidence Report: bai-thu-dong-bo-mat-mang

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | ui-check | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | judgment | UNCERTAIN |

## Evidence

- eval: E1
  run_id: minted-bai-thu-dong-bo-mat-mang-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_dong_bo
  verified_at: 2026-10-30T11:22:39Z
  output: |
    node --test "_acceptance/bai-thu-dong-bo-mat-mang/thu/*.test.mjs"
    ℹ duration_ms 385.281792

- eval: E2
  run_id: minted-bai-thu-dong-bo-mat-mang-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_dong_bo
  verified_at: 2026-10-30T11:22:39Z
  output: |
    node --test "_acceptance/bai-thu-dong-bo-mat-mang/thu/*.test.mjs"
    ℹ duration_ms 385.281792

- eval: E3
  run_id: minted-bai-thu-dong-bo-mat-mang-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_dong_bo
  verified_at: 2026-10-30T11:22:39Z
  output: |
    node --test "_acceptance/bai-thu-dong-bo-mat-mang/thu/*.test.mjs"
    ℹ duration_ms 385.281792

- eval: E4
  run_id: minted-bai-thu-dong-bo-mat-mang-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_dong_bo
  verified_at: 2026-10-30T11:22:39Z
  output: |
    node --test "_acceptance/bai-thu-dong-bo-mat-mang/thu/*.test.mjs"
    ℹ duration_ms 385.281792

- eval: E5
  run_id: minted-bai-thu-dong-bo-mat-mang-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_dong_bo
  verified_at: 2026-10-30T11:22:39Z
  output: |
    node --test "_acceptance/bai-thu-dong-bo-mat-mang/thu/*.test.mjs"
    ℹ duration_ms 385.281792

- eval: E6
  run_id: minted-bai-thu-dong-bo-mat-mang-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_dong_bo
  verified_at: 2026-10-30T11:22:39Z
  output: |
    node --test "_acceptance/bai-thu-dong-bo-mat-mang/thu/*.test.mjs"
    ℹ duration_ms 385.281792

- eval: E7
  run_id: E7-2026-10-30-run3
  exit_code: 0
  baseline: n-a
  verifier: ui-check:E7
  verified_at: 2026-10-30T11:22:39Z
  screenshot: evidence/E7-step1.png
  observed: |
    E7-step1.png (đọc trực tiếp): khổ điện thoại, nút «Đầu chủ A1» đang chọn, dải xanh «Có mạng», «0 thay đổi đang chờ đẩy ... mốc kéo về: 4», bảng 4 căn A-01..A-04 giá 3200/4100/2800/5600, cột Số chủ 0900 000 001 và 0900 000 002 ở A-01/A-02 còn A-03/A-04 là «—». Khớp expected. E7-step2.png: dải đỏ «Mất mạng — thay đổi được giữ trên máy», «3 thay đổi đang chờ đẩy», A-01 «3230 (chờ)», số chủ vẫn hiện. Khớp expected. E7-step3.png: sau tải lại khi chặn API, «3 thay đổi đang chờ đẩy», dải «Có mạng» (navigator.onLine=true), bảng trống, dòng «Chưa đẩy được (Failed to fetch) — sẽ thử lại khi có mạng». Hàng đợi vẫn 3, khớp expected. E7-step4.png: dải «Có mạng», «0 thay đổi đang chờ đẩy ... mốc kéo về: 9», A-01 giá 3230 không còn chữ «(chờ)», số chủ vẫn hiện. Khớp expected. Có dòng chú thích lỗi cũ «Chưa đẩy được (Failed to fetch)» còn hiện ở bước 4, nhỏ, chưa xoá.
  network_observed: clean
  output: |
    GET /dem?nhat-ky=1 trả thành công. Sự kiện mạng: tat (so_cho 0) hai lần, bat (so_cho 3, ghi chú «sự kiện online»). Lô đẩy: client_seq 1,2,3 trạng thái da-ap, seq 7,8,9 tăng đúng thứ tự. Có thêm kéo sau lô.

- eval: E8
  run_id: minted-bai-thu-dong-bo-mat-mang-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_dong_bo
  verified_at: 2026-10-30T11:22:39Z
  output: |
    node --test "_acceptance/bai-thu-dong-bo-mat-mang/thu/*.test.mjs"
    ℹ duration_ms 385.281792

- eval: E9
  run_id: minted-bai-thu-dong-bo-mat-mang-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_dong_bo
  verified_at: 2026-10-30T11:22:39Z
  output: |
    node --test "_acceptance/bai-thu-dong-bo-mat-mang/thu/*.test.mjs"
    ℹ duration_ms 385.281792

- eval: E10
  judged_by: judge panel đề xuất (domain-correctness, operational-feasibility, spec-alignment) — fresh context
  verdict: UNCERTAIN
  rationale: ADR-0004 ở trạng thái «đề xuất — chờ chủ kho chốt», so đủ ba lối, nêu khuyến nghị, lối khác và giá. Lối tự làm mỏng giữ bất biến 1–2 nhờ luật theo dòng của Postgres, có 28 ca máy xanh trong ket-qua.md. Nhưng các ô hàng «Vận hành», «Kho trên máy», «Hàng đợi ghi» chưa ghi rõ là số đo hay hiểu biết từ tài liệu.
  votes:
    - domain-correctness: UNCERTAIN — hàng «Vận hành» và «Kho trên máy» không ghi từng ô là số đo hay hiểu biết từ tài liệu; ô «Có sẵn hàng đợi tải lên» của PowerSync cũng chưa ghi «chưa đo». Cả ba chỉ được phủ chung bằng một câu ở Bối cảnh, nên «mỗi điều ghi rõ» chưa rõ ràng.
    - operational-feasibility: UNCERTAIN — ở các dòng «Hàng đợi ghi», «Kho trên máy» và «Vận hành», ô của PowerSync và ElectricSQL không có nhãn; ô «Vận hành» của lối tự làm mỏng cũng không có nhãn. Có thể đọc là mặc định «tài liệu», nhưng ADR không nói vậy.
    - spec-alignment: FAIL — cả hàng «Vận hành» (ba lối) và các ô PowerSync/ElectricSQL ở hàng «Hàng đợi ghi» không có nhãn «Đo» hay «Chưa đo (tài liệu)».
  required_evidence:
    - Trong docs/adr/0004-bai-thu-dong-bo.md, bảng «So ba lối»: gắn nhãn «Đo (ket-qua.md)» hoặc «Chưa đo (tài liệu)» cho mọi ô của hàng «Hàng đợi ghi khi mất mạng», «Kho trên máy» và «Vận hành» (cả ba cột), kể cả ô «Có sẵn hàng đợi tải lên» của PowerSync.
    - Hoặc một câu ngay dưới bảng nói rõ mọi ô không ghi «Đo» đều là hiểu biết từ tài liệu công bố, chưa đo.
    - Với các ô «Đo» của lối tự làm mỏng, chỉ rõ mục tương ứng trong ket-qua.md (ví dụ «28 ca xanh», «iPhone giữ 5 thay đổi qua hơn 15 phút»).
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-bai-thu-dong-bo-mat-mang-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-10-30T11:22:39Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-bai-thu-dong-bo-mat-mang-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-10-30T11:22:39Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-bai-thu-dong-bo-mat-mang-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-30T11:22:39Z

- cmd: npm run test:hooks
  run_id: minted-bai-thu-dong-bo-mat-mang-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-10-30T11:22:39Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-bai-thu-dong-bo-mat-mang-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-10-30T11:22:39Z

- cmd: npm run typecheck
  run_id: minted-bai-thu-dong-bo-mat-mang-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-10-30T11:22:39Z

- cmd: npm run lint
  run_id: minted-bai-thu-dong-bo-mat-mang-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-10-30T11:22:39Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Baseline khong do:
- node --test "_acceptance/bai-thu-dong-bo-mat-mang/thu/*.test.mjs": BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Danh sách eval không-phân-biệt: không đo được ở round này (baseline bị chặn hạ tầng, mọi field baseline là n-a).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: verdict REJECT do máy tính sẵn; không eval nào được ghi là hỏng. E10 còn UNCERTAIN chờ người quyết ở Cổng 2.

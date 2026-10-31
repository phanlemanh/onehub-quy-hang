---
schema_version: 2
feature_slug: khu-va-loai-hinh
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c167fe21a614d34acd7185e7028bea3be591f449
human_signoff:
---

# Evidence Report: khu-va-loai-hinh

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS (carry-forward từ round 1) |
| E3 | AC-3 | test | PASS (carry-forward từ round 1) |
| E4 | AC-3 | test | PASS (carry-forward từ round 1) |
| E5 | AC-3 | test | PASS (carry-forward từ round 1) |
| E6 | AC-4 | test | PASS (carry-forward từ round 1) |
| E7 | AC-5 | test | PASS (carry-forward từ round 1) |
| E7b | AC-5 | test | PASS (carry-forward từ round 1) |
| E8 | AC-6 | test | PASS (carry-forward từ round 1) |
| E9 | AC-7 | test | PASS (carry-forward từ round 1) |
| E10 | AC-8 | judgment | đề xuất PASS — chờ người chốt |
| E11 | AC-9 | judgment | đề xuất PASS — chờ người chốt |

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval không-phân-biệt (xanh ở cả code mới lẫn baseline, chứng minh harness chứ không phải feature; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- `npm test -w @quy-hang/core` phủ các eval E1, E3, E6, E7, E8, E9

Baseline của từng eval ở round này ghi n-a (không đo lại).

## Evidence

- eval: E1
  run_id: minted-khu-va-loai-hinh-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T17:59:33Z
  output: |
    ℹ duration_ms 129.599792
    ca «đổi tên khu: không còn tên dự án trong vùng danh mục» chạy xong, ok

- eval: E2
  run_id: minted-khu-va-loai-hinh-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:50:13Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-khu-va-loai-hinh-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:50:13Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-khu-va-loai-hinh-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-10-31T15:50:13Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-khu-va-loai-hinh-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:50:13Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-khu-va-loai-hinh-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:50:13Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-khu-va-loai-hinh-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:50:13Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7b
  run_id: minted-khu-va-loai-hinh-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:50:13Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-khu-va-loai-hinh-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:50:13Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-khu-va-loai-hinh-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:50:13Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-khu-va-loai-hinh-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-10-31T17:59:33Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-khu-va-loai-hinh-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-10-31T17:59:33Z

- cmd: npm run test:hooks
  run_id: minted-khu-va-loai-hinh-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-10-31T17:59:33Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-khu-va-loai-hinh-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-10-31T17:59:33Z

- cmd: npm run typecheck
  run_id: minted-khu-va-loai-hinh-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-10-31T17:59:33Z

- cmd: npm run lint
  run_id: minted-khu-va-loai-hinh-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-10-31T17:59:33Z

### Judgment

- eval: E10
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  proposal: PASS
  - domain-correctness: PASS — Dòng gate1 d-20261031T155648Z-18 ghi chủ kho chọn nhãn nguyên văn «Khu» cho khu chứa căn, còn khu chia việc là «Vùng» / «Vùng phụ trách». CONTEXT.md dòng 13 gọi «Khu» kèm `subdivisionName` (RESO `SubdivisionName`) và đưa «Dự án» vào cột tên tránh dùng. Dòng 14 nói căn mang `propertyType` / `propertySubType` theo RESO. Tham chiếu dòng 63 dùng «khu (`SubdivisionName`)». Chữ «dự án» còn lại của Tham chiếu chỉ nằm ở các dòng sổ quyết định §12 (dòng 318–331), tức lịch sử, và dòng 331 ngày 31/10 ghi đúng quyết định đổi tên và loại hình.
  - operational-feasibility: PASS — Dòng gate1 d-...-18 trong sổ ghi chủ kho chọn nhãn «Khu» cho khu chứa căn (khu chia việc của sàn đổi thành «Vùng»). CONTEXT.md dòng 13 gọi «Khu» kèm `subdivisionName`/`subdivisionKey` (RESO `SubdivisionName`) và đặt «Dự án» vào cột không dùng. CONTEXT.md dòng 14 và Tham chiếu dòng 63 nêu căn mang loại hình RESO `propertyType`/`propertySubType`. Tham chiếu §12 dòng 331 (31/10) ghi quyết định đổi tên khu và loại hình. Chữ «dự án» còn lại ở Tham chiếu chỉ nằm trong các dòng lịch sử §12 (dòng 320, 329, 330) hoặc nghĩa khác (dự án Supabase, dòng 318). Không thấy chỗ nào dùng «dự án» làm tên khái niệm khu chứa căn.
  - spec-alignment: PASS — Dòng gate1 d-...-18 của sổ Hỏi-1 ghi nhãn chủ kho chọn: «Khu» cho khu chứa căn (khu chia việc là «Vùng» / «Vùng phụ trách»). CONTEXT.md dòng 13 gọi «Khu» kèm `subdivisionName` (RESO `SubdivisionName`) và đặt «Dự án» ở cột tên cần tránh; dòng 14 nêu căn mang loại hình `propertyType` / `propertySubType` theo RESO. Tham chiếu mục 4 (dòng 63) dùng «khu (`SubdivisionName`)» và căn mang loại hình RESO. §12 dòng 331 ngày 31/10 ghi quyết định đổi tên và loại hình. Mọi chữ «dự án» còn lại của Tham chiếu nằm ở các dòng lịch sử §12 (318–331), nên đúng ngoại lệ của câu hỏi.
  human_override:  # chi nguoi ghi

- eval: E11
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  proposal: PASS
  - domain-correctness: PASS — Dòng đầu ADR-0016 ghi trạng thái «chấp nhận» sau Cổng Phạm vi hàng 72 và mục «Hỏi chủ kho» ghi đúng câu trả lời Hỏi-1..3: Khu / Vùng phụ trách, đất bốn mục, khách riêng thấy tên đường và xã. Dòng sổ d-20261031T155648Z-18 (stage gate1, decided_by Manh Phan) khớp từng ý. Trong quan-nguoi.tsx, nhãn khu phụ trách là «Vùng phụ trách» ở cả hai ô chọn (dòng 137 và 198), tiêu đề mục là «Vùng» và nhãn ô là «Tên vùng», đúng Hỏi-1.
  - operational-feasibility: PASS — Dòng trạng thái của ADR-0016 ghi «chấp nhận» và nói chủ kho duyệt Hỏi-1..3 theo khuyến nghị ở Cổng Phạm vi hàng 72. Mục «Đã quyết 31/10» khớp từng ý với dòng sổ gate1 d-...-18: Khu / Vùng / Vùng phụ trách, đất bốn mục, khách riêng thấy tên đường và xã. Dòng seal gate 1 có trong sổ. Trong quan-nguoi.tsx, nhãn là «Vùng phụ trách» (dòng 137 và 198) và tiêu đề mục là «Vùng» (dòng 213). Tìm «Khu» với chữ K hoa chỉ ra tên kiểu và biến, không còn nhãn nào trên màn.
  - spec-alignment: PASS — ADR-0016 ghi trạng thái «chấp nhận» sau Cổng Phạm vi hàng 72, kèm câu trả lời Hỏi-1..3 theo khuyến nghị: «Khu», «Vùng»/«Vùng phụ trách», đất bốn mục, khách riêng thấy tên đường và xã. Các câu này khớp dòng sổ gate1 d-...-18 trong decisions.jsonl. Trên quan-nguoi.tsx, nhãn khu phụ trách là «Vùng phụ trách» (dòng 137 và 198). Các chữ còn lại (tiêu đề «Vùng», «Tên vùng», «Thêm vùng», lỗi tên trùng) cũng dùng «Vùng». Phần còn «Khu» chỉ là tên biến và kiểu trong code.
  human_override:  # chi nguoi ghi

## Known limits

## Ngoài hợp đồng

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval máy xanh; E10, E11 là mục judgment chờ người chốt; sáu mục ngoài hợp đồng ghi lại ở review-findings. Verdict PENDING-JUDGMENT.
Round 2: sửa nhãn màn Người dùng sang «Vùng» (commit c167fe2); chạy lại E1 và các lệnh suite, tất cả xanh; E2–E9 carry-forward từ round 1 vì delta không chạm paths của chúng; E10, E11 đề xuất PASS, chờ người chốt. Verdict PENDING-JUDGMENT.


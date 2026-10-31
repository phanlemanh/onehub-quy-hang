---
schema_version: 2
feature_slug: khu-va-loai-hinh
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 30f8dcca1077f22e5184f1a7d6e2e3ab605d4d71
human_signoff: Manh Phan 2026-11-01
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
| E10 | AC-8 | judgment | PASS (đề xuất của hội đồng, chờ người chốt) |
| E11 | AC-9 | judgment | PASS (đề xuất của hội đồng, chờ người chốt) |

Verdict tổng là PENDING-JUDGMENT vì hai mục judgment E10 và E11 chờ người chốt ở Gate 2.

## Evidence

- eval: E1
  run_id: minted-khu-va-loai-hinh-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T18:11:29Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 109.604917

- eval: E2
  run_id: minted-khu-va-loai-hinh-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:50:13Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-khu-va-loai-hinh-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:50:13Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-khu-va-loai-hinh-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-10-31T15:50:13Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-khu-va-loai-hinh-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:50:13Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-khu-va-loai-hinh-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:50:13Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-khu-va-loai-hinh-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:50:13Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7b
  run_id: minted-khu-va-loai-hinh-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:50:13Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-khu-va-loai-hinh-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:50:13Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-khu-va-loai-hinh-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:50:13Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-khu-va-loai-hinh-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-10-31T18:11:29Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-khu-va-loai-hinh-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-10-31T18:11:29Z

- cmd: npm run test:hooks
  run_id: minted-khu-va-loai-hinh-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-10-31T18:11:29Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-khu-va-loai-hinh-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-10-31T18:11:29Z

- cmd: npm run typecheck
  run_id: minted-khu-va-loai-hinh-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-10-31T18:11:29Z

- cmd: npm run lint
  run_id: minted-khu-va-loai-hinh-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-10-31T18:11:29Z

### Judgment

- eval: E10
  judged_by: hội đồng judge (fresh context), đề xuất PASS
  panel: domain-correctness, operational-feasibility, spec-alignment
  - domain-correctness: PASS — Dòng gate1 (d-20261031T155648Z-18) chốt nhãn «Khu». CONTEXT.md dòng 13 gọi khu chứa căn là «Khu» kèm `subdivisionName` và chỉ để «Dự án» ở cột tránh dùng; dòng 14 có «Loại hình». Tham chiếu dòng 332 ghi quyết định đổi tên và loại hình; các chữ «dự án» còn lại ở dòng 318–332 là lịch sử §12. Chỉ đọc nguyên văn dòng 332; dòng 318–331 chỉ thấy khớp chữ qua tìm kiếm.
  - operational-feasibility: PASS — Nhãn «Khu» khớp lựa chọn ở dòng gate1; CONTEXT.md dòng 13–14 đúng RESO; mọi chữ «dự án» ở Tham chiếu nằm trong dòng lịch sử §12.
  - spec-alignment: PASS — Dòng gate1 ghi chủ kho chọn «Khu»; CONTEXT.md đặt «Dự án» ở cột tránh dùng; chữ «dự án» còn lại chỉ ở các dòng lịch sử §12 (318 là Supabase, 320 và 330 là dòng cũ, 331 là lời trích).
  human_override: Manh Phan 2026-11-01 — Đạt

- eval: E11
  judged_by: hội đồng judge (fresh context), đề xuất PASS
  panel: domain-correctness, operational-feasibility, spec-alignment
  - domain-correctness: PASS — ADR-0016 ghi «chấp nhận» sau Cổng Phạm vi hàng 72 và lời chủ kho cho Hỏi-1..3 (Khu / Vùng phụ trách; đất bốn mục; khách riêng thấy tên đường và xã), khớp dòng gate1 d-...-18 do Manh Phan quyết. quan-nguoi.tsx dùng «Vùng phụ trách» ở dòng 137, 198 và «Vùng» ở dòng 213.
  - operational-feasibility: PASS — ADR-0016 khớp dòng sổ gate1 d-...-18 và các dòng S1 ở d-...-6, 7, 8; màn quan-nguoi.tsx dùng «Vùng phụ trách» ở dòng 137 và 198, nhãn «Vùng», «Tên vùng», đúng khuyến nghị Hỏi-1.
  - spec-alignment: PASS — ADR-0016 có mục «Đã quyết 31/10» cho Hỏi-1..3; dòng sổ gate1 d-20261031T155648Z-18 ghi đúng ba điều đó; quan-nguoi.tsx khớp Hỏi-1.
  human_override: Manh Phan 2026-11-01 — Đạt

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Baseline khong do: evals.yaml khong doi tu lan baseline cuoi (round 1), nen field baseline của từng eval ghi n-a.

Eval không phân biệt (xanh trên cả HEAD lẫn baseline, chứng minh harness chứ không phải feature; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý): lệnh `npm test -w @quy-hang/core` gắn các eval E1, E3, E6, E7, E8, E9.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: các eval E1–E9 chạy lần đầu, bằng chứng ghi tại run-log (E2–E9 sau đó được mang sang các round sau).
Round 3: chạy lại E1 và sáu lệnh suite, tất cả xanh; E2–E9 carry-forward từ round 1 vì delta không chạm paths của các eval này; E10 và E11 chờ người chốt ở Gate 2.


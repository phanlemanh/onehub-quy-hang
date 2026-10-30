---
schema_version: 2
feature_slug: bai-thu-dong-bo-mat-mang
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: be93b7303744d6cbf3bf3fcbf31d47c11df8d589
human_signoff: Manh Phan 2026-10-30
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
| E10 | AC-10 | judgment | PASS |

## Evidence

- eval: E1
  run_id: minted-bai-thu-dong-bo-mat-mang-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_dong_bo
  verified_at: 2026-10-30T15:31:41Z
  output: |
    node --test "_acceptance/bai-thu-dong-bo-mat-mang/thu/*.test.mjs"
    ca «AC-1 kéo theo sàn» xanh (chung một lần chạy với E2-E6, E8, E9)
    ℹ duration_ms 455.683542

- eval: E2
  run_id: minted-bai-thu-dong-bo-mat-mang-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_dong_bo
  verified_at: 2026-10-30T15:31:41Z
  output: |
    node --test "_acceptance/bai-thu-dong-bo-mat-mang/thu/*.test.mjs"
    ca «AC-2 số chủ theo vai» xanh (chung một lần chạy)
    ℹ duration_ms 455.683542

- eval: E3
  run_id: minted-bai-thu-dong-bo-mat-mang-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_dong_bo
  verified_at: 2026-10-30T15:31:41Z
  output: |
    node --test "_acceptance/bai-thu-dong-bo-mat-mang/thu/*.test.mjs"
    ca «AC-3 cách ly ở cơ sở dữ liệu» xanh (chung một lần chạy)
    ℹ duration_ms 455.683542

- eval: E4
  run_id: minted-bai-thu-dong-bo-mat-mang-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_dong_bo
  verified_at: 2026-10-30T15:31:41Z
  output: |
    node --test "_acceptance/bai-thu-dong-bo-mat-mang/thu/*.test.mjs"
    ca «AC-4 hàng đợi khi mất mạng» xanh (chung một lần chạy)
    ℹ duration_ms 455.683542

- eval: E5
  run_id: minted-bai-thu-dong-bo-mat-mang-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_dong_bo
  verified_at: 2026-10-30T15:31:41Z
  output: |
    node --test "_acceptance/bai-thu-dong-bo-mat-mang/thu/*.test.mjs"
    ca «AC-5 không trùng không mất» xanh (chung một lần chạy)
    ℹ duration_ms 455.683542

- eval: E6
  run_id: minted-bai-thu-dong-bo-mat-mang-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_dong_bo
  verified_at: 2026-10-30T15:31:41Z
  output: |
    node --test "_acceptance/bai-thu-dong-bo-mat-mang/thu/*.test.mjs"
    ca «AC-6 ghi sai sàn bị từ chối» xanh (chung một lần chạy)
    ℹ duration_ms 455.683542

- eval: E7
  run_id: minted-bai-thu-dong-bo-mat-mang-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-30T15:31:41Z
  screenshot: evidence/E7-step1.png
  observed: |
    step1: màn hình điện thoại, nút «Đầu chủ A1» đang chọn, thanh xanh «Có mạng», «0 thay đổi đang chờ đẩy lên máy chủ · mốc kéo về: 9», bảng Căn/Giá/Số chủ: Mẫu A-01 3230 0900 000 001, A-02 4100 0900 000 002, A-03 2800 —, A-04 5600 —, mỗi dòng có nút +10, khớp expected (bảng theo vai, số chủ, có mạng, 0 chờ). step2: thanh đỏ «Mất mạng — thay đổi được giữ trên máy», «3 thay đổi đang chờ đẩy», A-01 hiện 3260 (chờ), khớp. step3: sau tải lại thanh đỏ vẫn «Mất mạng», vẫn «3 thay đổi đang chờ đẩy», mốc kéo 0, bảng căn trống (kéo bị chặn), hàng đợi còn sau tải lại, khớp. step4: thanh xanh «Có mạng», «0 thay đổi đang chờ», mốc kéo về 12, A-01 = 3260 không còn «(chờ)», khớp.
  network_observed: clean

- eval: E8
  run_id: minted-bai-thu-dong-bo-mat-mang-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_dong_bo
  verified_at: 2026-10-30T15:31:41Z
  output: |
    node --test "_acceptance/bai-thu-dong-bo-mat-mang/thu/*.test.mjs"
    ca «AC-8 một lệnh» xanh (chung một lần chạy)
    ℹ duration_ms 455.683542

- eval: E9
  run_id: minted-bai-thu-dong-bo-mat-mang-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_dong_bo
  verified_at: 2026-10-30T15:31:41Z
  output: |
    node --test "_acceptance/bai-thu-dong-bo-mat-mang/thu/*.test.mjs"
    ca «AC-9 luật kết luận» và «AC-9 kết quả khớp nhật ký» xanh (chung một lần chạy)
    ℹ duration_ms 455.683542

- eval: E10
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: PASS
  rationale: ADR-0006 (số cũ 0004) ghi «đề xuất — chờ chủ kho chốt», so ba lối theo cách ly, số chủ, hàng đợi ghi và vận hành, mỗi ô gắn nhãn Đo hoặc Chưa đo. Ba lens cùng thấy khuyến nghị, lối khác và giá của từng lối được nêu đủ; vế mất mạng trên thiết bị được ghi thẳng là chưa đo.
  human_override:  # chi nguoi ghi

  Panel đề xuất (human_override để trống cho người quyết ở Cổng 2):
  - domain-correctness: PASS — ADR-0006 (số cũ 0004) ghi «đề xuất — chờ chủ kho chốt». Bảng so ba lối theo cách ly, số chủ, hàng đợi ghi, kho trên máy và vận hành, mỗi ô gắn nhãn Đo (trỏ ket-qua.md) hoặc Chưa đo (tài liệu/suy luận). Lối được khuyến nghị giữ bất biến 1–2 ở một chỗ là luật theo dòng của Postgres, và ket-qua.md ghi 34 ca máy xanh, gồm cả ca phá thử (tắt luật theo dòng thì lộ dòng sàn khác). ADR cũng nói rõ vế mất mạng trên thiết bị chưa đo được.
  - operational-feasibility: PASS — ADR-0006 (số cũ 0004) so đủ ba lối (tự làm mỏng, PowerSync, ElectricSQL) theo cách ly, hàng đợi ghi và vận hành. Mục «Bốn việc cần chốt» nêu khuyến nghị, lối khác và giá. Số đo máy gồm 34 ca xanh, vai `quy_hang_app` không vượt luật, tắt luật thì lộ dòng, và số chủ không đi qua sổ thay đổi. ADR nói thẳng vế mất mạng trên thiết bị chưa đo và vế 1 của phiên thật không đạt, nên không nói quá.
  - spec-alignment: PASS — Bảng so ba lối mang nhãn Đo / Chưa đo (tài liệu) / Chưa đo (suy luận). Mục «Bốn việc cần chốt» nêu khuyến nghị tự làm mỏng, lối khác PowerSync và giá của cả hai. Lối được khuyến nghị giữ bất biến 1–2 của AGENTS.md: luật theo dòng của Postgres đo bằng 34 ca máy, số chủ có luật riêng và không đi qua sổ thay đổi.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-bai-thu-dong-bo-mat-mang-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-10-30T15:31:41Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-bai-thu-dong-bo-mat-mang-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-10-30T15:31:41Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-bai-thu-dong-bo-mat-mang-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-10-30T15:31:41Z

- cmd: npm run test:hooks
  run_id: minted-bai-thu-dong-bo-mat-mang-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-10-30T15:31:41Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-bai-thu-dong-bo-mat-mang-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-10-30T15:31:41Z

- cmd: npm run typecheck
  run_id: minted-bai-thu-dong-bo-mat-mang-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-10-30T15:31:41Z

- cmd: npm run lint
  run_id: minted-bai-thu-dong-bo-mat-mang-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-10-30T15:31:41Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Baseline không đo:
- node --test "_acceptance/bai-thu-dong-bo-mat-mang/thu/*.test.mjs": BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Eval không-phân-biệt: không đo được ở round này vì baseline bị chặn hạ tầng; mọi field baseline là n-a. Danh sách eval green-on-both: không có mục nào được xác định.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lịch sử round 1 không được truyền vào bước soạn này; xem run-log.jsonl và review-findings của round đó.
Round 2: E1–E9 chạy xanh trên commit đã ghim, E10 do panel đề xuất PASS; chờ người ký ở Cổng 2.

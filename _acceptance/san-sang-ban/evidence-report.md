---
schema_version: 2
feature_slug: san-sang-ban
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 61365c6748f28bb8a926fdb296ed528854141376
human_signoff:
---

# Evidence Report: san-sang-ban

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-6 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | ui-check | PASS |
| E9 | AC-9 | judgment | PASS |
| E10 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-san-sang-ban-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-01T16:13:12Z
  output: |
    npm test -w @quy-hang/core — toàn bộ ca đạt, gồm ca «điều ảnh thật vào Đang bán».

- eval: E2
  run_id: minted-san-sang-ban-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T16:13:12Z
  output: |
    npm run db:migrate && npm run db:test — bộ kiểm trên Postgres thật đạt, gồm ca «máy chủ đòi ảnh thật».

- eval: E3
  run_id: minted-san-sang-ban-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T16:13:12Z
  output: |
    Cùng lần chạy db:test — ca «lên Toàn sàn sau Sẵn sàng bán» đạt.

- eval: E4
  run_id: minted-san-sang-ban-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T16:13:12Z
  output: |
    npm test -w @quy-hang/web — ca «khi nào có nút» đạt.

- eval: E5
  run_id: minted-san-sang-ban-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T16:13:12Z
  output: |
    npm test -w @quy-hang/web — ca «chỉ đúng chỗ thiếu» đạt.

- eval: E5b
  run_id: minted-san-sang-ban-E5b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T16:13:12Z
  output: |
    npm test -w @quy-hang/web — ca «đếm ảnh thật như máy chủ» đạt.

- eval: E6
  run_id: minted-san-sang-ban-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T16:13:12Z
  output: |
    npm test -w @quy-hang/web — ca «đủ thì gửi một lệnh» đạt.

- eval: E6b
  run_id: minted-san-sang-ban-E6b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web_db
  verified_at: 2026-11-01T16:13:12Z
  output: |
    npm run test:db -w @quy-hang/web — ca «nút tới API thật» đạt trên Postgres thật.

- eval: E7
  run_id: minted-san-sang-ban-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T16:13:12Z
  output: |
    npm test -w @quy-hang/web — ca «nhãn thiếu đủ điều» đạt.

- eval: E10
  run_id: minted-san-sang-ban-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T16:13:12Z
  output: |
    npm test -w @quy-hang/web — ca «ngoại tuyến không kiểm ảnh» đạt.

- eval: E8
  run_id: minted-san-sang-ban-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T16:13:12Z
  screenshot: evidence/E8-step1.png
  observed: |
    step1: hồ sơ A-07.01 "Chưa đủ để rao", 3,2 tỷ Bao phí; nút "Sẵn sàng bán" thấy được ở đầu mục LẦN RAO ĐANG MỞ (mép dưới khung); tab Gửi được (0). step2 (cuộn tới mục): nút + khung "Còn thiếu:" với đúng một dòng "Ảnh thật" (gạch chân, link); Pháp lý = [Mẫu] Sổ hồng, Tình trạng sử dụng = [Mẫu] Để trống; Các lần rao: Lần 1 Chưa đủ để rao. step3: sau khi có ảnh "Ảnh thật · 01/11/2026", mục LẦN RAO ĐANG MỞ không còn nút; Các lần rao: Lần 1 "Đang bán"; Lịch sử: "Đổi trạng thái · Chưa đủ để rao -> Đang bán". step4 (A-07.02): "Còn thiếu: Ảnh thật" dù căn có một ảnh nhãn "Ảnh mẫu" (thấy mờ ở mép trên khung); Lần 1 vẫn Chưa đủ để rao; mục Lịch sử hiện "Không tải được lịch sử · Thử lại" (blemish ngoài AC). step5 (A-07.03): khung Còn thiếu: "Ảnh thật" (link) và "Pháp lý · điền ở Bảng hàng"; hàng Pháp lý của Lần rao đang mở ghi "Chưa có · điền ở Bảng hàng"; Nội thất/Tài chính "—"; Lịch sử cũng "Không tải được lịch sử". step5b: sau bấm "Ảnh thật" màn cuộn tới mục ẢNH ở đầu khung (tab Gửi được (0), "Chưa có ảnh gửi được"), URL có #muc-anh. step6 (Đầu chủ mẫu 2, Bảng hàng 36/36 căn): dòng 3 Toà A / A-07.01 / 1PN / 54,2 m² / tầng 7 / trạng thái "Đang bán" / 3,2 tỷ / Bao phí hiện cho người khác. Tất cả khớp Expected.
  network_observed: clean

- eval: E9
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: PASS
  rationale: Cả ba góc nhìn cùng thấy Sổ điểm biến thiên có dòng #33 listing.ready_min_real_photos (int, mặc định 1, khoảng 1–20, Quản trị sàn, nguồn hàng 23), K7 trỏ sang #33, mục Đếm khớp số dòng, Đối chiếu ngành §7 có luật ảnh tối thiểu của bốn MLS kèm nguồn, ADR-0008 quyết định 4 khớp sổ.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-san-sang-ban-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-01T16:13:12Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-san-sang-ban-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-01T16:13:12Z

- cmd: npm run test:hooks
  run_id: minted-san-sang-ban-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-01T16:13:12Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-san-sang-ban-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-01T16:13:12Z

- cmd: npm run typecheck
  run_id: minted-san-sang-ban-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-01T16:13:12Z

- cmd: npm run lint
  run_id: minted-san-sang-ban-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-01T16:13:12Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval xanh trên cả mã cũ lẫn mã mới (không phân biệt, chứng minh harness chứ không chứng minh tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/core: E1
- npm test -w @quy-hang/web: E4, E5, E5b, E6, E7, E10

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval máy và ui-check đạt; E9 do hội đồng đề xuất PASS, ô human_override để trống cho người quyết ở Cổng 2.


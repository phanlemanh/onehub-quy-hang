---
schema_version: 2
feature_slug: san-sang-ban
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4f094bcd1c92603f13c470ed131236338a861b44
human_signoff: Manh Phan 2026-11-02
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

Vòng 2 chạy lại E5b, E6, E6b, E7 (delta chạm paths của các eval này). E1, E2, E3, E4, E5, E8, E10 mang từ vòng 1.

- eval: E5b
  run_id: minted-san-sang-ban-E5b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-01T16:22:18Z
  output: |
    npm test -w @quy-hang/web: đạt, duration_ms 225.770541

- eval: E6
  run_id: minted-san-sang-ban-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-01T16:22:18Z
  output: |
    npm test -w @quy-hang/web: đạt, duration_ms 225.770541

- eval: E7
  run_id: minted-san-sang-ban-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-01T16:22:18Z
  output: |
    npm test -w @quy-hang/web: đạt, duration_ms 225.770541

- eval: E6b
  run_id: minted-san-sang-ban-E6b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web_db
  verified_at: 2026-11-01T16:22:18Z
  output: |
    npm run test:db -w @quy-hang/web: đạt, duration_ms 1191.520083

- eval: E1
  run_id: minted-san-sang-ban-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-01T16:13:12Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-san-sang-ban-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T16:13:12Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-san-sang-ban-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T16:13:12Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-san-sang-ban-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-01T16:13:12Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-san-sang-ban-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-01T16:13:12Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-san-sang-ban-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T16:13:12Z
  carried_from_round: 1
  screenshot: evidence/E8-step1.png
  observed: |
    step1: hồ sơ A-07.01 "Chưa đủ để rao", 3,2 tỷ Bao phí; nút "Sẵn sàng bán" thấy được ở đầu mục LẦN RAO ĐANG MỞ (mép dưới khung); tab Gửi được (0). step2 (cuộn tới mục): nút + khung "Còn thiếu:" với đúng một dòng "Ảnh thật" (gạch chân, link); Pháp lý = [Mẫu] Sổ hồng, Tình trạng sử dụng = [Mẫu] Để trống; Các lần rao: Lần 1 Chưa đủ để rao. step3: sau khi có ảnh "Ảnh thật · 01/11/2026", mục LẦN RAO ĐANG MỞ không còn nút; Các lần rao: Lần 1 "Đang bán"; Lịch sử: "Đổi trạng thái · Chưa đủ để rao -> Đang bán". step4 (A-07.02): "Còn thiếu: Ảnh thật" dù căn có một ảnh nhãn "Ảnh mẫu" (thấy mờ ở mép trên khung); Lần 1 vẫn Chưa đủ để rao; mục Lịch sử hiện "Không tải được lịch sử · Thử lại" (blemish ngoài AC). step5 (A-07.03): khung Còn thiếu: "Ảnh thật" (link) và "Pháp lý · điền ở Bảng hàng"; hàng Pháp lý của Lần rao đang mở ghi "Chưa có · điền ở Bảng hàng"; Nội thất/Tài chính "—"; Lịch sử cũng "Không tải được lịch sử". step5b: sau bấm "Ảnh thật" màn cuộn tới mục ẢNH ở đầu khung (tab Gửi được (0), "Chưa có ảnh gửi được"), URL có #muc-anh. step6 (Đầu chủ mẫu 2, Bảng hàng 36/36 căn): dòng 3 Toà A / A-07.01 / 1PN / 54,2 m² / tầng 7 / trạng thái "Đang bán" / 3,2 tỷ / Bao phí hiện cho người khác. Tất cả khớp Expected.
  network_observed: clean

- eval: E10
  run_id: minted-san-sang-ban-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-01T16:13:12Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  judged_by: hội đồng 3 thấu kính (domain-correctness, operational-feasibility, spec-alignment)
  verdict: PASS
  rationale: Cả ba thấu kính đều PASS; sổ điểm biến thiên có dòng #33 listing.ready_min_real_photos (int, mặc định 1, khoảng 1–20), mục Đếm khớp số dòng, Đối chiếu ngành §7 có bốn MLS kèm nguồn, ADR-0008 khớp sổ.
  human_override:  # chi nguoi ghi

### Phiên hội đồng E9 (đề xuất PASS)

- domain-correctness: PASS — Sổ có dòng #33 `listing.ready_min_real_photos` kiểu `int`, mặc định 1, khoảng 1–20, Quản trị sàn, nguồn «Luật 17; hàng 23». K7 trỏ sang #33. Mục «Đếm» ghi 29 điểm phần A và 19 điều khoá phần C, đếm lại đúng (A1 4 dòng, A2 3, A3 5, A4 6, A5 6, A6 4, A7 1; K1–K19; 2 «Đề xuất», 27 «Mở», 6 `map`). Đối chiếu ngành §7 nêu luật ảnh tối thiểu của ValleyMLS, CRMLS, SmartMLS, OneKey MLS kèm nguồn. ADR-0008 quyết định 4 khớp sổ.
- operational-feasibility: PASS — Mục A7 là #33, K7 ghi số ảnh thật tối thiểu sàn nâng được ở #33. Mục «Đếm» khớp: phần A 29 điểm (27 Mở, 2 Đề xuất), phần B 5 ứng viên (#28–#32), phần C 19 điều khoá. Đối chiếu ngành §7 có hàng «MLS Mỹ — ảnh tối thiểu khi lên Active» với bốn MLS và đường dẫn nguồn. ADR-0008 ghi điều ảnh thật: mặc định 1, ngăn Gửi được, không ảnh mẫu, chưa xoá.
- spec-alignment: PASS — Sổ có đúng dòng #33; K7 trỏ sang #33; mục «Đếm» khớp số dòng (phần A 29 điểm, phần B 5 ứng viên, phần C K1–K19); Đối chiếu ngành §7 nêu bốn MLS kèm bốn đường dẫn nguồn; ADR-0008 ghi điều «ảnh thật» của hàng 23 với mặc định 1 và máy chủ đếm khi đổi sang Đang bán, không mâu thuẫn với sổ.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-san-sang-ban-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-01T16:22:18Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-san-sang-ban-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-01T16:22:18Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-san-sang-ban-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-01T16:22:18Z

- cmd: npm run test:hooks
  run_id: minted-san-sang-ban-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-01T16:22:18Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-san-sang-ban-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-01T16:22:18Z

- cmd: npm run typecheck
  run_id: minted-san-sang-ban-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-01T16:22:18Z

- cmd: npm run lint
  run_id: minted-san-sang-ban-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-01T16:22:18Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay. Mọi block eval ghi baseline n-a vì round này không đo.

Eval không phân biệt (pass trên cả HEAD lẫn baseline, chứng minh harness chứ không phải tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/core: E1
- npm test -w @quy-hang/web: E4, E5, E5b, E6, E7, E10

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval qua, vào chấm; phản biện nêu một lỗi trong hợp đồng (E7 đo chỉ dẫn thay vì chữ moTaLoi trả ra). Trả về thi công.
Round 2: E5b, E6, E6b, E7 chạy lại và qua (E7 nay đo câu báo thật, moTaLoi và lyDoTuChoi là hàm thuần); các eval còn lại mang từ vòng 1.


---
schema_version: 2
feature_slug: va-ho-so-lien-he
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6c5d4dbaa8b1de6e8064ac975f6ba22ddbe2158a
human_signoff:
---

# Evidence Report: va-ho-so-lien-he

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | judgment | PASS |
| E4 | AC-3 | script | PASS |
| E5 | AC-3 | script | PASS |
| E6 | AC-3 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-va-ho-so-lien-he-E1-r1
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T11:47:09Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-va-ho-so-lien-he-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T11:54:00Z
  output: |
    ℹ duration_ms 3107.895417

- eval: E3
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: PASS
  verified_at: 2026-11-05T11:54:00Z
  rationale: |
    Ba vế đúng trên ba tệp: them() lấy con trỏ chỉ qua conTroXemThem, khoá và tham số cùng nguồn, nối qua duocNoi bằng setDs((cu)=>...), JSX và chữ giống bản gốc.
  judges:
    - domain-correctness: PASS — them() lấy con trỏ chỉ qua conTroXemThem(trang, khoa, ds.kieu==="xong"); khoá dựng bằng khoaLoc({q, type: loai, status: dau, lan}) cùng lần vẽ với q.trim(), loai, dau của docDanhSach. Trang về chỉ nối khi duocNoi khớp lượt, khoá và con trỏ trang cuối hiện tại; bấm hai lần thì lần về sau bị bỏ. Nối dùng setDs((cu)=>…), setTrang đặt khoa của lượt đã được duocNoi xác nhận. JSX của KhungLienHe, HoSoNguoi, DanhSachLienHe, prop và chuỗi chữ giống bản gốc.
    - operational-feasibility: PASS — them() chỉ lấy con trỏ qua conTroXemThem; khoá dựng bằng khoaLoc từ q, loai, dau, lan cùng lần vẽ với docDanhSach. duocNoi so lượt, khoá và con trỏ gửi với tiepHienTai.current nên bấm hai lần thì trang về sau bị bỏ. Nối dùng setDs((cu) => ...). Hai chỗ đặt trang cuối đều mang khoá của lượt đọc sinh ra nó. JSX và chuỗi chữ giống hệt vung-goc.tsx.txt.
    - spec-alignment: PASS — them() chỉ lấy con trỏ qua conTroXemThem(trang, khoa, ...); khoá dựng bằng khoaLoc({q, type: loai, status: dau, lan}), docDanhSach dùng cùng nguồn. duocNoi so con trỏ lúc gửi với tiepHienTai.current, cập nhật ngay sau lần nối đầu nên trang về lần hai bị bỏ. Nối dùng setDs((cu) => ...). setTrang gán khoa từ guiLuc.khoa đã so với khoaHienTai.current. JSX, prop và chuỗi chữ giống hệt bản gốc.
  human_override:  # chi nguoi ghi

- eval: E4
  run_id: minted-va-ho-so-lien-he-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T11:54:00Z
  output: |
    2 tệp giao diện ngoài bản đồ

- eval: E5
  run_id: minted-va-ho-so-lien-he-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-05T11:54:00Z
  output: |
    sàn thiết kế M1 không chặn tệp giao diện nào

- eval: E6
  run_id: E6-ui-2026-11-05
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T11:54:00Z
  screenshot: evidence/E6-step1.png
  observed: |
    E6-step1.png: trang Liên hệ, mục «Chủ bán» đang chọn, tiêu đề «50+ liên hệ», các dòng là «[Tên] Thử xem thêm 29…17», cột Loại đều là «Chủ bán», người giữ [Mẫu] Đầu chủ 1. Nút «Xem thêm» nằm dưới danh sách, ngoài khung hình trên màn 1440x900 nhưng có trong DOM (đã chờ được). Khớp đối chứng.
    E6-step2.png: sau khi bấm «Xem thêm», danh sách cuộn xuống các dòng nối thêm ([Mẫu] Chủ nhà 03, 29, 06, 11, các dòng «[Chưa có tên] Lead»…), mọi dòng nhìn thấy đều mang nhãn «Chủ bán». Đếm bằng tiêu đề: 50+ thành 58 liên hệ, tức 50 thành 58 dòng. Khớp Expected bước 2.
    E6-step3.png: sau khi giữ phản hồi cursor 2 giây, chạm «Chủ cho thuê» rồi bấm Xem thêm cũ, chờ 3 giây: mục «Chủ cho thuê» được chọn, tiêu đề «0 liên hệ», trạng thái trống «Không tìm thấy «Chủ cho thuê»». Không có dòng nào, kể cả dòng chỉ mang nhãn Chủ bán. (a) Không có yêu cầu nào mang cursor Chủ bán kèm type=Landlord, hai yêu cầu cursor đều là type=Seller. (b) Không có dòng nào chỉ mang nhãn Chủ bán trên màn. Khớp Expected bước 3.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-ho-so-lien-he-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-05T11:54:00Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-ho-so-lien-he-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-05T11:54:00Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-ho-so-lien-he-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-05T11:54:00Z

- cmd: npm run test:hooks
  run_id: minted-va-ho-so-lien-he-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-05T11:54:00Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-ho-so-lien-he-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-05T11:54:00Z

- cmd: npm run typecheck
  run_id: minted-va-ho-so-lien-he-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-05T11:54:00Z

- cmd: npm run lint
  run_id: minted-va-ho-so-lien-he-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-05T11:54:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên nhánh lẫn baseline): E2 (npm test -w @quy-hang/web), E4 (design-floor-khuon), E5 (design-floor-s4). Cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: các eval chạy lần đầu, chưa đạt đủ — thợ sửa «Xem thêm» bấm hai lần chỉ nối trang một lần (S4 lượt 1, AC-2). Returned to implementation.
Round 2: E2, E4, E5, E6 và bảy lệnh suite xanh; E1 carry-forward từ round 1; E3 do hội đồng chấm, đạt.

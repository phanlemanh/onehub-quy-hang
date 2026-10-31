---
schema_version: 2
feature_slug: vo-ung-dung
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 5cc9200511140e505e7114698f075d7a02b0068d
human_signoff:
---

# Evidence Report: vo-ung-dung

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-6 | test | PASS |
| E3 | AC-2 | ui-check | PASS |
| E4 | AC-3 | ui-check | PASS |
| E5 | AC-4 | ui-check | PASS |
| E6 | AC-5 | ui-check | PASS |
| E7 | AC-6 | ui-check | PASS |
| E8 | AC-7 | ui-check | PASS |
| E9 | AC-8 | ui-check | PASS |
| E10 | AC-9 | script | PASS |
| E11 | AC-9 | script | PASS |
| E12 | AC-9 | script | PASS |
| E13 | AC-9 | ui-check | PASS |
| E14 | AC-10 | judgment | PASS |

## Evidence

Vòng 3 chạy lại E11 (lint) và sáu lệnh suite. Các eval còn lại mang từ vòng trước vì delta không chạm paths của chúng.

- eval: E11
  run_id: minted-vo-ung-dung-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint
  verified_at: 2026-10-31T00:05:12Z
  output: |
    chuẩn giao diện: đạt

- eval: E1
  run_id: minted-vo-ung-dung-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-30T23:42:13Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-vo-ung-dung-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-30T23:42:13Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-vo-ung-dung-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-10-30T23:57:15Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval
  screenshot: evidence/E3-dau-chu.png
  observed: |
    Đã mở từng ảnh bằng Read, khớp Expected. Đầu chủ: / sang /today, cột có «Hôm nay», «Bảng hàng»; thanh trên có tên sàn (chỉ là chữ), ô «Gõ mã căn…», «+ Lead», «Nhập Excel», «Phát hàng», chuông, tài khoản; không bộ chọn sàn. Menu tài khoản có tên sàn, «Sáng / tối», «Đăng xuất» (dòng «Sàn Sàn mẫu A» lặp chữ «Sàn», lỗi nhỏ về chữ).
    Đầu khách: Hôm nay·Bảng hàng·Đã gửi, không nút tạo nào. Trưởng nhóm: thêm «Đội», có «+ Lead», «Phát hàng», không «Nhập Excel». Quản trị sàn: / sang /settings/users, cột chỉ «Cài đặt sàn», thanh trên chỉ «Nhập Excel», chuông, tài khoản, không ô gõ mã căn. Ô gõ mã căn có ở Đầu chủ, Đầu khách, Trưởng nhóm, không có ở Quản trị sàn (khớp Tham chiếu §9). Bốn vai ra bốn danh sách nhà khác nhau (2/3/4/1 mục).
    Người hai sàn: vào /select-company; sau khi chọn Sàn mẫu A thì thanh trên có bộ chọn sàn, danh sách «Người của sàn Sàn mẫu A» có 9 email. Đổi sang Sàn mẫu B: tên sàn đổi, danh sách còn 2 email (đầu chủ sàn B và hai-san); tải lại vẫn sàn B và vẫn 2 email. Đối chứng dương đạt (9 người so với 2 người).
  network_observed: n-a (driver)

- eval: E4
  run_id: minted-vo-ung-dung-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-10-30T23:57:15Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval
  screenshot: evidence/E4-step1.png
  observed: |
    /today: chỉ thanh biểu tượng dọc bên trái, không có cột thứ hai, nội dung phủ hết chiều ngang. /inventory: mặc định gập; khi mở có «GÓC NHÌN CỦA ĐỘI», «GÓC NHÌN CỦA TÔI», «+ Lưu góc nhìn» và chân cột «Độ tươi». /shares: cột mở với «Link đã gửi» (đang chọn) và «Lịch xem». /settings: cột «CÀI ĐẶT SÀN» với 7 mục, có «Người dùng».
    Bảng nhớ: gập ở /shares rồi tải lại vẫn gập; người khác (Trưởng nhóm) trên cùng máy nhận mặc định gập ở /inventory dù người trước đã mở. Mọi frame khớp Expected, không mâu thuẫn.
  network_observed: clean

- eval: E5
  run_id: minted-vo-ung-dung-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-10-30T23:57:15Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval
  screenshot: evidence/E5-step1.png
  observed: |
    Telesales 1440x900 ở /today: không cột nhà; thanh trên có tên sàn, «Hôm nay», «+ Lead», chuông, avatar; không ô Gõ mã căn. Sau ba phím (Meta+K, Ctrl+K, «/») không hộp nào mở, URL không đổi. Điện thoại 375x812: ba tab «Hôm nay», «Lead», «Tôi», không tràn ngang.
    Đối chứng Đầu chủ: Meta+K mở hộp «Gõ mã căn hoặc tên nhà», ô nhập đang focus, chứng tỏ phép thử phím có hiệu lực. Khớp Expected.
  network_observed: clean

- eval: E6
  run_id: minted-vo-ung-dung-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-10-30T23:57:15Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval
  screenshot: evidence/E6-step1.png
  observed: |
    Điện thoại 375x812, không cột nhà, thanh trên có tên nhà, biểu tượng tìm và chuông, không tràn ngang. Tab: Đầu chủ Hôm nay·Bảng hàng·Tôi; Đầu khách và Trưởng nhóm Hôm nay·Bảng hàng·Gửi·Tôi (không Đội); Quản trị sàn Cài đặt sàn·Tôi, mỗi tab mở trang trong vỏ. Cùng địa chỉ /inventory ở 1440x900 mở vỏ máy tính. Ảnh Bảng hàng sau khi bấm tab chỉ kiểm bằng DOM (địa chỉ, aria-current), không mở lại bằng Read.
  network_observed: clean

- eval: E7
  run_id: minted-vo-ung-dung-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-10-30T23:57:15Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval
  screenshot: evidence/E7-hop.png
  observed: |
    Hộp giữa màn hình trên nền /today với ô «Gõ mã căn hoặc tên nhà», nút đóng, nhóm «Nhà» có «Hôm nay» và «Bảng hàng». Enter với mã đưa tới /units/MAU-A1205, trong vỏ, tiêu đề «Căn MAU-A1205». Gõ «Bảng hàng» sang /inventory; Esc đóng hộp, URL giữ nguyên. Điện thoại 375x812: hộp phủ toàn màn (0,0, 375x812). Khớp Expected.
  network_observed: clean

- eval: E8
  run_id: minted-vo-ung-dung-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-10-30T23:57:15Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval
  screenshot: evidence/E8-dang-nhap.png
  observed: |
    Trang đăng nhập (thẻ «Đăng nhập Quỹ hàng», ô Email, nút «Gửi mã»), trang khách (chuyển về đăng nhập) và «Chọn sàn làm việc» đều không có thanh trên, cột nhà hay tab dưới. Đầu chủ: / sang /today; chỉ Quản trị sàn: / sang /settings/users. Đối chứng /today có cột biểu tượng, thanh trên đầy đủ nút, nav của vỏ.
  network_observed: clean

- eval: E9
  run_id: minted-vo-ung-dung-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-10-30T23:57:15Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval
  screenshot: evidence/E9-giu-cho.png
  observed: |
    /team (1440x900): có vỏ, Frame «Đội» và Empty «Màn này đang dựng» với «Chưa xếp mục nào trong lộ trình.». /settings/users: có vỏ, cột «CÀI ĐẶT SÀN» 7 mục, danh sách 9 người kèm vai và nút Sửa/Bỏ. /me (375x812, Trưởng nhóm): Frame «Tôi», Empty «Dựng ở mục 38 của lộ trình», tab dưới có Tôi đang chọn. Khớp Expected.
  network_observed: clean

- eval: E10
  run_id: minted-vo-ung-dung-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.typecheck
  verified_at: 2026-10-30T23:57:15Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-vo-ung-dung-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.design_floor
  verified_at: 2026-10-30T23:57:15Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-vo-ung-dung-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-10-30T23:57:15Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval
  screenshot: evidence/E13-sang.png
  observed: |
    /shares 1440x900 chế độ sáng: nền trang và cột thứ hai sáng, mục «Link đã gửi» chữ đen trên ô xám nhạt. Chế độ tối: toàn bộ nền đen, bố cục y hệt bản sáng, chữ trắng trên ô xám đậm. Điện thoại 375x812 tối: tab «Gửi» đang mở rõ chữ trắng. Đối chứng tắt stylesheet: nền không đổi giữa hai chế độ (đo bằng getComputedStyle, tỷ lệ 9.4 ở cả hai). Hai ảnh đối chứng lưu nhưng không mở bằng Read.
  network_observed: no-app-traffic

### Judgment

Panel E14 giữ nguyên từ vòng 2 — inputs không đổi, không chấm lại; rationale xem vòng đó. Đề xuất panel: PASS. Mục này để người quyết ở Cổng 2.

- eval: E14
  judged_by: judge panel (fresh context), đề xuất PASS
  verdict: PASS
  rationale: panel giữ nguyên từ vòng 2, inputs không đổi, không chấm lại.
  votes:
    - domain-correctness: PASS (r2)
    - operational-feasibility: PASS (r2)
    - spec-alignment: PASS (r2)
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-vo-ung-dung-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-10-31T00:05:12Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-vo-ung-dung-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-10-31T00:05:12Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-vo-ung-dung-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-10-31T00:05:12Z

- cmd: npm run test:hooks
  run_id: minted-vo-ung-dung-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-10-31T00:05:12Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-vo-ung-dung-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-10-31T00:05:12Z

- cmd: npm run typecheck
  run_id: minted-vo-ung-dung-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-10-31T00:05:12Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Baseline khong do:
- npm run lint: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Eval không-phân-biệt: không đo được ở vòng này vì baseline bị chặn hạ tầng (mọi field baseline là n-a).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2 đạt lần đầu (mang sang các vòng sau).
Round 2: E11 không đạt — lint quét nhầm tệp nháp của máy. Trả về triển khai.
Round 3: E11 và sáu lệnh suite chạy lại, đều xanh; các eval còn lại mang từ vòng trước. Verdict PASS.

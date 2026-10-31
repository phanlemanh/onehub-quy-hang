---
schema_version: 2
feature_slug: ban-do-khuon-nhom-da-co
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2c07e3bea5b5beba413030ae238d82915bef0cef
human_signoff: Manh Phan 2026-10-31
---

# Evidence Report: ban-do-khuon-nhom-da-co

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | ui-check | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | ui-check | PASS |
| E8 | AC-8 | judgment | PASS |

## Evidence

- eval: E1
  run_id: minted-ban-do-khuon-nhom-da-co-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ui_lint
  verified_at: 2026-10-31T09:16:20Z
  output: |
    ℹ duration_ms 2213.236
    __EXIT=0

- eval: E2
  run_id: minted-ban-do-khuon-nhom-da-co-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ui_lint
  verified_at: 2026-10-31T09:16:20Z
  output: |
    ℹ duration_ms 2213.236
    __EXIT=0

- eval: E3
  run_id: minted-ban-do-khuon-nhom-da-co-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ui_lint
  verified_at: 2026-10-31T09:16:20Z
  output: |
    ℹ duration_ms 2213.236
    __EXIT=0

- eval: E4
  run_id: minted-ban-do-khuon-nhom-da-co-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ui_lint
  verified_at: 2026-10-31T09:16:20Z
  output: |
    ℹ duration_ms 2213.236
    __EXIT=0

- eval: E5
  run_id: minted-ban-do-khuon-nhom-da-co-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ui_lint
  verified_at: 2026-10-31T09:16:20Z
  output: |
    ℹ duration_ms 2213.236
    __EXIT=0

- eval: E6
  run_id: E6-20261031
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T09:07:51Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/E6-1440.png
  observed: |
    E6-1440.png (da Read): vo co sidebar trai 'CAI DAT SAN' (Nguoi dung duoc chon), thanh tren 'Sàn mẫu B'; vung noi dung co DUNG MOT khung (Frame) hep ~770px o goc trai: tieu de «Người dùng», mo ta «Người của sàn Sàn mẫu B», muc Thanh vien voi hai dong dau-chu-san-b@example.test (Dau chu; Sua, Bo) va hai-san@example.test (Quan tri san; Sua, Roi san), muc Khu voi o 'Ten khu' va nut 'Them khu'. Khung cao vua noi dung, phan con lai cua man trong, khong bi keo cao ca man. Khop Expected.
    E6-loi-sua.png (da Read): form 'Sua hai-san@example.test' mo duoi dong hai-san@, checkbox Dau chu da chon, Quan tri san bo chon; giua nhom Vai va nut Luu/Huy co khoi nen hong vien do voi chu «Sàn cần ít nhất một quản trị.»; DOM xac nhan role=alert data-slot=alert; thao tac sua bi tu choi. Khop Expected.
    E6-loi-roi.png (da Read): hop thoai 'Bỏ hai-san@example.test khỏi sàn?' noi len tren nen mo, trong hop thoai co cung khoi hong vien do chu «Sàn cần ít nhất một quản trị.» tren nut Huy / Bo khoi san; thao tac roi san bi tu choi. Khop Expected (cung khoi, cung chu).
    E6-375-toi.png (da Read): khung 375 rong giao dien toi, tieu de «Cài đặt sàn» + chuong, Frame 'Người dùng / Người của sàn Sàn mẫu B', hai dong email xuong dong nhung doc duoc, nut Sua/Bo/Roi san du, thanh tab duoi 'Cài đặt sàn' va 'Tôi'; khong tran ngang (scrollWidth=clientWidth=375); chu sang tren nen toi doc ro. Khop Expected.
    E6-khong-quyen.png (da Read): dau-chu@ o Sàn mẫu A: vo day du, mot khung 'Người dùng / Người của sàn Sàn mẫu A' voi mot khoi vien nhat chu «Chỉ quản trị sàn xem được trang này.»; DOM: role=status data-slot=alert. Khop Expected (mo ta ten san A thay vi B la dung vi dang o san A).
  network_observed: clean

- eval: E6b
  run_id: minted-ban-do-khuon-nhom-da-co-E6b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T09:07:51Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-ban-do-khuon-nhom-da-co-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T09:07:51Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/E7-login-1440-sáng.png
  observed: |
    I opened all 16 frames with Read.
    login 1440 sáng: a narrow centred frame (~384px) on a white page, with title «Đăng nhập Quỹ hàng», the line «Đã gửi mã tới quan-tri@example.test», the label «Mã 6 số», the input showing 000000 in red, and directly below it the red line «Mã không đúng. Thử lại.», then the buttons «Vào» and «Đổi email». The error is attached under the code field, as expected.
    login 1440 tối: same layout on near-black; error text is light red and readable.
    login 375 sáng / tối: the same frame fills the width with a 16px gutter (343px); error under the code field; no horizontal cut-off.
    chon-san, all 4: frame titled «Chọn sàn làm việc» listing «Sàn mẫu A» and «Sàn mẫu B», plus «Đăng xuất». Light and dark both clearly readable at both sizes.
    trang-tam 1440 sáng / tối: shell with «Sàn mẫu A» selector, «Nhập Excel», bell, avatar HA; content frame «Hôm nay» / «Giờ làm gì?» and an empty block with a hammer icon, «Màn này đang dựng», «Dựng ở mục 22 (máy tính), 39 (điện thoại) của lộ trình.» (one line).
    trang-tam 375 sáng / tối: mobile header «Hôm nay» with bell, the same frame, text wrapped onto two lines («Dựng ở mục 22 (máy tính),» / «39 (điện thoại) của lộ trình.»), bottom tabs «Cài đặt sàn» and «Tôi». Nothing cut off.
    chuong 1440 sáng / tối: a right-hand sheet titled «Thông báo» with a bell icon, «Chưa có thông báo», and «Lead mới, căn đổi giá và khách mở link sẽ báo ở đây.», the background blurred. Readable in both themes.
    chuong 375 sáng / tối: same sheet at ~280px wide, the sentence wrapped to two lines, with a close button.
    Every text string matches Expected exactly. No frame contradicts Expected. The only artefact is the Next.js dev badge (round "N") at bottom-left, a dev-server indicator rather than app UI.
  network_observed: unscoped-partial

- eval: E8
  judged_by: judge panel (fresh context) — đề xuất, người quyết ở Cổng 2
  verdict: PASS
  rationale: Ba góc nhìn đều cho PASS. Cả bốn tệp khuôn có «Dùng khi» và «Không dùng»; mỗi mã trong khoá `luat` có đúng một câu luật làm theo được; hai ngoại lệ duy nhất (cai-dat-san) đều có `ly_do`; vo-va-ia.md §2 trỏ sang `design/patterns/`, kể tên đủ bốn tệp và phân vai bản đồ máy đọc với bảng giải thích.
  panel_de_xuat:
    - domain-correctness: PASS — Cả bốn tệp đều có dòng «Dùng khi» và «Không dùng» riêng. Mỗi mã trong khoá `luat` (2, 2, 2 và 3 mã) có đúng một câu luật trong thân, đủ cụ thể để làm theo. `cai-dat-san.md` là tệp duy nhất có ngoại lệ, gồm hai tệp, và mỗi tệp có `ly_do` nêu được vì sao được miễn. `vo-va-ia.md` §2 trỏ sang `design/patterns/`, kể tên đủ bốn tệp, và phân vai rõ: bản đồ giữ khuôn máy đọc, bảng trong §2 giữ lời giải thích.
    - operational-feasibility: PASS — Cả bốn ý đều có. (1) Mỗi tệp trong 4 tệp khuôn có cặp «Dùng khi» và «Không dùng». (2) Mỗi mã trong khoá `luat` (2, 2, 2, 3 mã) có đúng một gạch đầu dòng trong mục «Luật», nêu hành động cụ thể. (3) Chỉ `cai-dat-san` khai ngoại lệ, và cả hai (`settings/page.tsx` chỉ chuyển hướng, `settings/[section]/page.tsx` là trang tạm cho mục chưa dựng) đều có `ly_do` đủ hiểu; ba tệp còn lại để `ngoai_le: []`. (4) `vo-va-ia.md` §2 trỏ sang `design/patterns/`, kể tên bốn tệp, nói tệp máy đọc giữ khuôn, màn mẫu, khe, khối cấm và ngoại lệ, còn bảng trong §2 giữ lời giải thích.
    - spec-alignment: PASS — Cả bốn tệp đều có dòng «Dùng khi» và «Không dùng» riêng. Mỗi mã trong khoá `luat` có đúng một gạch đầu dòng trong «## Luật», viết thành lệnh làm được (xac-thuc 2 mã, cai-dat-san 2, trang-tam 2, trang-thai 3). Hai ngoại lệ duy nhất, ở cai-dat-san, đều có `ly_do` đủ hiểu: một tệp chỉ chuyển hướng, một tệp là trang tạm cho mục chưa dựng. Ba tệp còn lại khai `ngoai_le: []`, nên không có ngoại lệ nào thiếu lý do. vo-va-ia.md §2 trỏ sang `design/patterns/`, kể tên bốn tệp, và nói bản đồ giữ khuôn máy đọc còn bảng giữ lời giải thích.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-ban-do-khuon-nhom-da-co-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-10-31T09:16:20Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-ban-do-khuon-nhom-da-co-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-10-31T09:16:20Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-ban-do-khuon-nhom-da-co-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-10-31T09:16:20Z

- cmd: npm run test:hooks
  run_id: minted-ban-do-khuon-nhom-da-co-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-10-31T09:16:20Z

- cmd: npm run typecheck
  run_id: minted-ban-do-khuon-nhom-da-co-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-10-31T09:16:20Z

- cmd: npm run lint
  run_id: minted-ban-do-khuon-nhom-da-co-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-10-31T09:16:20Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi). Field baseline cua tung eval ghi n-a.

Eval không-phân-biệt (pass trên cả HEAD lẫn baseline ở lần đo round 1 — chứng minh harness hơn là feature; nên viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý):

- `npm test -w @quy-hang/ui-lint` — E1, E2, E3, E4, E5
- `npm run db:migrate && npm run db:test` — E6b

Lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval đạt; một phát hiện trong hợp đồng (bộ kiểm trang bỏ qua lệnh trả có điều kiện nên gốc sai có thể lọt, AC-3) → trả về sửa.
Round 2: sửa bộ kiểm khuôn đi vào lệnh trả có điều kiện (commit 2c07e3b); E1-E5 và sáu lệnh suite chạy lại và đạt; E6, E6b, E7 giữ nguyên từ round 1 (delta không chạm paths); E8 panel giữ đề xuất PASS.

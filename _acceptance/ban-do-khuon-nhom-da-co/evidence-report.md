---
schema_version: 2
feature_slug: ban-do-khuon-nhom-da-co
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: dd43d7c559a7998fc470f50343454fa7efb2fa87
human_signoff:
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
  run_id: minted-ban-do-khuon-nhom-da-co-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-10-31T09:07:51Z
  output: |
    npm test -w @quy-hang/ui-lint chạy xanh (một lần chạy, một lần đạt); ca «bản đồ thật» và ma trận 4 nhóm × 9 khoá đều đạt.

- eval: E2
  run_id: minted-ban-do-khuon-nhom-da-co-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-10-31T09:07:51Z
  output: |
    npm test -w @quy-hang/ui-lint chạy xanh; mười ca làm hỏng đúng một chỗ đều ghim đúng thông điệp lỗi, đối chứng dương trên cùng thư mục tạm đạt.

- eval: E3
  run_id: minted-ban-do-khuon-nhom-da-co-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-10-31T09:07:51Z
  output: |
    npm test -w @quy-hang/ui-lint chạy xanh; cây thật 0 lệch, bảng tên tệp khớp, các ca đỏ trên bản sao đều bắt được.

- eval: E4
  run_id: minted-ban-do-khuon-nhom-da-co-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-10-31T09:07:51Z
  output: |
    npm test -w @quy-hang/ui-lint chạy xanh; cây thật 0 lệch với đúng 5 chỗ dựng TrangThai, ba ca im và ba ca đỏ đều đạt.

- eval: E5
  run_id: minted-ban-do-khuon-nhom-da-co-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-10-31T09:07:51Z
  output: |
    npm test -w @quy-hang/ui-lint chạy xanh; lệnh thật qua tiến trình con in đúng bốn dòng, bản sao có lệch báo một dòng lỗi, --json khớp dòng chữ.

- eval: E6
  run_id: E6-20261031
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T09:07:51Z
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
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T09:07:51Z
  output: |
    npm run db:migrate && npm run db:test chạy xanh; hai ca «quản trị cuối» bị từ chối last-admin và ca đối chứng «hai quản trị: gỡ một người được» đạt.

- eval: E7
  run_id: minted-ban-do-khuon-nhom-da-co-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T09:07:51Z
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

### Judgment

- eval: E8
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment), fresh context
  verdict: PASS
  votes:
    - domain-correctness: PASS — Cả bốn điều kiện đều đạt. (1) Cả bốn tệp có câu «Dùng khi» và «Không dùng» riêng. (2) Mọi mã trong khoá `luat` (2 + 2 + 2 + 3) có đúng một mục trong phần «## Luật» với câu luật làm theo được. (3) Chỉ `cai-dat-san.md` có ngoại lệ, gồm `settings/page.tsx` và `settings/[section]/page.tsx`, đều kèm lý do rõ trong frontmatter và nhắc lại ở thân; ba tệp còn lại để `ngoai_le: []`. (4) `vo-va-ia.md` §2 trỏ sang `design/patterns/`, kể tên đủ bốn tệp, nói tệp ở đó là bản máy đọc và bảng trong §2 giữ lời giải thích.
    - operational-feasibility: PASS — Cả bốn tệp đều có câu «Dùng khi» và «Không dùng». Mỗi mã trong khoá `luat` có đúng một gạch đầu dòng luật ở mục «## Luật», đọc là làm được: xac-thuc 2/2, cai-dat-san 2/2, trang-tam 2/2, trang-thai 3/3. `ngoai_le` rỗng ở ba tệp; hai ngoại lệ của cai-dat-san đều có `ly_do` đủ hiểu. §2 của vo-va-ia.md trỏ sang `design/patterns/`, nêu tên bốn tệp, và nói rõ «bản đồ giữ khuôn máy giữ». Một điểm hơi mơ hồ, không đủ để chấm hỏng: KH-tt-roi-nhom nói «đưa tệp ra khỏi `nhan_dien`», nhưng `nhan_dien` là glob phủ cả `(app)/**/page.tsx`, tệp không nói rõ cách loại một tệp khỏi glob ấy.
    - spec-alignment: PASS — Cả bốn tệp đều có dòng «Dùng khi» và «Không dùng». Mỗi mã trong khoá `luat` (2, 2, 2 và 3 mã) có đúng một câu luật trong thân, đủ cụ thể để làm theo. Hai ngoại lệ duy nhất, ở cai-dat-san, đều ghi lý do rõ. vo-va-ia.md §2 trỏ sang `design/patterns/`, kể tên đủ bốn tệp, và nói tệp ở `design/patterns/` giữ khuôn máy đọc còn bảng §2 giữ lời giải thích.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-ban-do-khuon-nhom-da-co-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-10-31T09:07:51Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-ban-do-khuon-nhom-da-co-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-10-31T09:07:51Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-ban-do-khuon-nhom-da-co-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-31T09:07:51Z

- cmd: npm run test:hooks
  run_id: minted-ban-do-khuon-nhom-da-co-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-10-31T09:07:51Z

- cmd: npm run typecheck
  run_id: minted-ban-do-khuon-nhom-da-co-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-10-31T09:07:51Z

- cmd: npm run lint
  run_id: minted-ban-do-khuon-nhom-da-co-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-10-31T09:07:51Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline, chứng minh harness chứ không phải tính năng mới; cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- E1, E2, E3, E4, E5 (lệnh `npm test -w @quy-hang/ui-lint`, baseline: green)
- E6b (lệnh `npm run db:migrate && npm run db:test`, baseline: green) — vốn là regression-guard có chủ ý: hàng này không đổi API, eval chỉ chứng lời từ chối màn E6 hiện là lời API thật trả.

Baseline không đo: E6 và E7 (eval ui-check, baseline: n-a — không chạy được trên cây cũ).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval đạt, phán quyết PASS; chưa có vòng nào bị trả về.

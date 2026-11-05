---
schema_version: 2
feature_slug: va-ho-so-lien-he
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 69c7b9ec91ce865c5086c9e9880135466855e0e7
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
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T11:47:09Z
  output: |
    npm run db:migrate && npm run db:test
    duration_ms 102922.192
    Ca «liên hệ: ma trận vai trên bốn đường đọc» chạy và ok.

- eval: E2
  run_id: minted-va-ho-so-lien-he-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T11:47:09Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 4119.209875
    Bốn ca trong xem-them.test.ts chạy và ok.

- eval: E3
  judged_by: judge-subagent (fresh context), ba góc nhìn
  verdict: PASS
  judges:
    - domain-correctness: PASS — (1) them() lấy con trỏ chỉ qua conTroXemThem(trang, khoa, ds.kieu === "xong"). khoa dựng bằng khoaLoc từ q, loai, dau và lan của cùng lần vẽ, và docDanhSach dùng q.trim(), loai, dau của cùng lần vẽ đó. (2) Trang về chỉ nối khi duocNoi trả đúng, so lượt và khoá lúc gửi với luotDs.current và khoaHienTai.current. Danh sách nối bằng setDs((cu) => ...) nên không dùng ds.ds trong closure. setTrang đặt khoa là guiLuc.khoa, và lượt đọc đầu đặt khoaLuot. (3) JSX của KhungLienHe, HoSoNguoi, DanhSachLienHe, các prop và mọi chuỗi chữ giống hệt vung-goc.tsx.txt. Chỉ khác import, trạng thái trang, ref khoaHienTai, khoá bộ lọc và them().
    - operational-feasibility: PASS — (1) them() lấy con trỏ chỉ qua conTroXemThem(trang, khoa, ds.kieu===&quot;xong&quot;). khoa dựng bằng khoaLoc từ q, loai, dau, lan của đúng lần vẽ mà docDanhSach dùng (q.trim(), loai, dau). (2) Trang về chỉ nối khi duocNoi(guiLuc, hiện tại) trả đúng, và nối bằng setDs((cu)=>…[...cu.ds,…]), không dùng ds.ds trong closure. setTrang luôn ghi khoa của lượt gửi (guiLuc.khoa), và trang đầu ghi khoaLuot tính từ cùng tham số với lệnh đọc. (3) So với bản gốc, JSX của KhungLienHe, HoSoNguoi, DanhSachLienHe cùng prop và mọi chuỗi chữ giữ nguyên. Chỉ khác ở them(), state cursor đổi thành trang, ref khoaHienTai, khoaLuot và import.
    - spec-alignment: PASS — (1) them() lấy con trỏ chỉ qua conTroXemThem(trang, khoa, ds.kieu==="xong"). khoa dựng bằng khoaLoc({q, type: loai, status: dau, lan}) trong cùng lần vẽ với q.trim(), loai và dau của docDanhSach. (2) Trang về chỉ nối khi duocNoi(guiLuc, {luot, khoa: khoaHienTai.current}) đúng, và nối bằng setDs((cu)=>...) chứ không dùng ds.ds trong closure. Trang cuối luôn là setTrang({khoa: khoaLuot hoặc guiLuc.khoa, tiep}). (3) JSX của KhungLienHe, HoSoNguoi, DanhSachLienHe cùng prop và mọi chuỗi chữ giống hệt vung-goc.tsx.txt. Khác biệt chỉ là import xem-them, state trang thay cursor, khoa/khoaHienTai/khoaLuot, effect ghi setTrang và them().
  verified_at: 2026-11-05T11:47:09Z
  human_override:  # chi nguoi ghi

- eval: E4
  run_id: minted-va-ho-so-lien-he-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T11:47:09Z
  output: |
    design-floor-khuon --kiem
    2 tệp giao diện ngoài bản đồ

- eval: E5
  run_id: minted-va-ho-so-lien-he-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-05T11:47:09Z
  output: |
    design-floor-s4 --root .
    Sàn thiết kế M1 không chặn tệp nào.

- eval: E6
  run_id: minted-va-ho-so-lien-he-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T11:47:09Z
  screenshot: evidence/E6-step1.png
  observed: |
    E6-step1.png: 1440 wide, /contacts?type=Seller, left menu highlights "Chủ bán", header "50+ liên hệ", every row labelled Chủ bán (e.g. "[Tên] Thử xem thêm 29" down to 17 visible), held by Đầu chủ 1. The Xem thêm button is below the fold (confirmed by DOM and wait). E6-step2.png: after clicking Xem thêm the list is longer (page scrolled down to the appended rows, e.g. "[Mẫu] Chủ nhà 03/29/06...", "[Chưa có tên] Lead" rows). Every visible row has the Chủ bán label and the "Chủ bán" filter stays highlighted; rows went from 50 to 58 (+8). So the page was appended with no filter change, which matches Expected for step 2. E6-step3.png: URL type=Landlord, "Chủ cho thuê" highlighted, "0 liên hệ", empty state "Không tìm thấy «Chủ cho thuê»". Network log: (a) no request carried a Seller cursor together with type=Landlord; the Seller-cursor requests all had type=Seller, and the Landlord request had no cursor. (b) No row on screen is labelled only Chủ bán; the list is empty. This matches Expected for step 3, with the caveat that the Landlord list is empty in this data.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-ho-so-lien-he-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-05T11:47:09Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-ho-so-lien-he-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-05T11:47:09Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-ho-so-lien-he-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-05T11:47:09Z

- cmd: npm run test:hooks
  run_id: minted-va-ho-so-lien-he-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-05T11:47:09Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-ho-so-lien-he-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-05T11:47:09Z

- cmd: npm run typecheck
  run_id: minted-va-ho-so-lien-he-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-05T11:47:09Z

- cmd: npm run lint
  run_id: minted-va-ho-so-lien-he-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-05T11:47:09Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả bản đang kiểm lẫn bản nền): E1 (npm run db:migrate && npm run db:test), E2 (npm test -w @quy-hang/web), E4 (design-floor-khuon --kiem), E5 (design-floor-s4). Cần viết lại để khẳng định hành vi mới, hoặc xác nhận đây là lưới hồi quy có chủ ý. E6 baseline: n-a.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval xanh; chưa có vòng sửa.

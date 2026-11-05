---
schema_version: 2
feature_slug: bang-hang-danh-sach-chi-tiet
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b4b0b05b2d6c7b618db7526ea533fe7a0584f2d0
human_signoff:
---

# Evidence Report: bang-hang-danh-sach-chi-tiet

Round 2. Nội dung thay trọn round cũ; lịch sử round nằm ở mục Iterations. Tám lệnh máy và bảy eval giao diện/test của round này đều xanh; kết luận REJECT đến từ hai mục trong hợp đồng của review-findings.md (AC-4 và AC-6: phép đo chỉ một chiều / không so với nhánh chính). Năm eval E5, E7a, E9a, E9b, E9c được mang từ round 1 (delta không chạm paths của chúng).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-5 | test | PASS (carried từ round 1) |
| E6 | AC-6 | ui-check | PASS |
| E7a | AC-7 | test | PASS (carried từ round 1) |
| E7b | AC-7 | ui-check | PASS |
| E7c | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |
| E9a | AC-9 | script | PASS (carried từ round 1) |
| E9b | AC-9 | test | PASS (carried từ round 1) |
| E9c | AC-9 | script | PASS (carried từ round 1) |
| E10 | AC-10 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-bang-hang-danh-sach-chi-tiet-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T06:11:05Z
  screenshot: evidence/E1-1440.png
  observed: |
    E1-1440.png: vỏ tối. Bên trái là thanh điều hướng và cột góc nhìn. Ở giữa là khung «Bảng hàng» với thanh công cụ (Góc nhìn, Nhóm, Lọc, Cột, Xuất bảng hàng) và bảng có các dòng A-03.01 đến A-02.04, đang nhóm theo Toà → Loại căn. Hồ sơ căn A-04.01 là cột riêng nằm bên phải, ngoài khung bảng, có khoảng hở giữa hai bên. Cột hồ sơ có đầu trang (mã căn, nhãn «Chưa đủ để rao»), giá 3,4 tỷ, phần Ảnh, phần Thuộc tính căn và nút «Căn chưa có đầu chủ giữ». Mép trên cột ngang mép trên khung bảng (y≈75). Mép dưới cột chạm đáy vùng làm việc của vỏ (y≈891). Thanh trên (ô gõ mã căn, +Lead, đồng bộ, chuông, tài khoản DA) nằm nguyên vị trí, không bị cột che, không có lớp phủ. E1-1280.png: cùng bố cục ở khổ hẹp hơn. Cột hồ sơ nằm bên phải ngoài khung bảng (khung bảng bị cắt cột Diện tích, có cuộn ngang trong khung), mép trên ngang khung (y≈75), mép dưới sát đáy vùng làm việc (y≈791). Thanh trên đủ nút, không bị che, không lớp phủ.
  network_observed: n-a (driver)

- eval: E2
  run_id: minted-bang-hang-danh-sach-chi-tiet-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T06:11:05Z
  screenshot: evidence/E2-step1.png
  observed: |
    E2-keo-28.png (1440x900): cot chi tiet ben phai hep (~28%, x 1103-1414), bang trai rong ~72% hien du cot Toa, Ma can, Loai can, Dien tich, Tang, Huong; thanh cong cu co du bon nut Nhom: Toa -> Loai can, Loc, Cot, Xuat bang hang, khong bi che. E2-keo-50.png: cot chi tiet rong ~50% (x ~857-1414), bang co hep lai chi con Toa, Ma can, Loai can, cat Dien tich do cuon ngang; thanh cong cu xuong hang thu hai nhung van du Nhom/Loc/Cot/Xuat. E2-keo-28-1280.png: panel chi tiet ~28% hep, bang hien den cot Tang (>=4 cot du lieu), bon nut nam tren mot hang bi xuong dong nhung thay het. E2-keo-50-1280.png: panel ~50%, bang trai thu hep con 3 cot, nut Xuat xuong hang ba, van thay du. Tat ca khop Expected (38% luc mo theo so do, bang tron ben trai, bon nut bam duoc, 1280 >= 4 cot, dung o 28% va 50%).
  network_observed: n-a (driver)

- eval: E3
  run_id: minted-bang-hang-danh-sach-chi-tiet-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T06:11:05Z
  screenshot: evidence/E3-step1.png
  observed: |
    E3-step1.png (sau khi mo A-04.02): bang hang khung 1440x900, thanh nhom "Nhom: Toa -> Loai can", nut "Loc 1", dem "54 / 70 can", hang loc cot Toa = "Toa A"; bang da cuon xuong giua (dong STT 19-33, nhom 2PN, co tiep nhom 3PN 15 can o duoi). Dong 20 (A-04.02) co o vien chon va nen sang nhe; cot phu ben phai mo ho so A-04.02 (Chua du de rao, 3,45 ty, thuoc tinh can). E3-step2.png (sau khi doi sang A-12.03 roi dong): cot phu da dong, bang gian ra toan chieu rong, van "Nhom: Toa -> Loai can", "Loc 1", "54 / 70 can", hang loc Toa A, cung dai dong STT 19-33 va cung vi tri cuon (A-12.03 o dong 23 la o dang chon); khong thay bang bi tai lai hay nhay ve dau. Hai frame khop Expected: loc, nhom, cuon giu nguyen qua mo/doi can/dong; dong dang mo co dau (data-state/aria-selected, do bang script) ; bang khong dung lai (conCungNut=true; ca do cho false).
  network_observed: n-a (driver)

- eval: E4
  run_id: minted-bang-hang-danh-sach-chi-tiet-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T06:11:05Z
  screenshot: evidence/E4-step1.png
  observed: |
    E4-step1.png (1440x900, hồ sơ mở): toàn bộ khung vừa viewport, không thanh cuộn của trang. Bảng hàng nằm trong khung riêng, thanh cuộn dọc ở mép phải bảng. Có 13 dòng từ A-03.01 đến A-02.04, nhóm Toà A → 1PN → 2PN, chân bảng «70 / 70 căn» dính đáy khung. Panel hồ sơ A-03.01 mở bên phải, có footer nút «Căn chưa có đầu chủ giữ» dính đáy khung. Khớp Expected. E4-step2.png (1280x800, hồ sơ mở): cùng bố cục, cũng vừa khung 800, bảng cuộn trong khung với 11 dòng thấy được, chân «70 / 70 căn» và footer panel dính đáy khung, không có phần nào tràn ra ngoài. Khớp Expected.
  network_observed: n-a (driver)

- eval: E6
  run_id: minted-bang-hang-danh-sach-chi-tiet-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T06:11:05Z
  screenshot: evidence/E6-step1.png
  observed: |
    E6-the-375.png / E6-step1.png (375x812, tối): header "Bảng hàng", "7 căn", nút Lọc/Chọn; danh sách thẻ căn xếp dọc, nhóm "TOÀ B (2 căn)" và "TOÀ A (5 căn)", mỗi thẻ có ô ảnh vuông bên trái (Item muted) + mã căn (B-11.02, B-07.12, A-77.14, A-08.01, A-12.03), giá "3,5 tỷ"/"3,2 tỷ" và Diện tích/Phòng ngủ/Hướng; thanh tab dưới Hôm nay/Bảng hàng/Tôi. Không có cột kéo chia hay bảng lưới. E6-ho-so-375.png / E6-step2.png: hồ sơ căn A-08.01 toàn màn, khung hồ sơ chiếm gần hết bề ngang (lề ~16px hai bên), tiêu đề "A-08.01", nhãn "Đang bán", giá "3,5 tỷ" + "Không bao phí", thanh mức đủ thông tin 3/5, mục Ảnh (tab Gửi được/Tự có từ mã/Nội bộ), "Thuộc tính căn"; không có tay kéo. Khớp Expected.
  network_observed: n-a (driver)

- eval: E7b
  run_id: minted-bang-hang-danh-sach-chi-tiet-E7b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T06:11:05Z
  screenshot: evidence/E7b-step1.png
  observed: |
    E7b-step1.png (đã mở bằng Read): màn Bảng hàng của sàn «[Mẫu] Sàn thử», người xem DA (dau-chu-2), 8 căn. Có cột «Đầu chủ». A-08.01 = «[Mẫu] Đầu chủ 1», A-12.03 = «Đã rời sàn», B-03.03 = «—» (căn Chỉ tôi), các căn khác là Đầu chủ 1 hoặc Đầu chủ 2. Khớp expected. E7b-step2.png (đã mở bằng Read): cùng màn sau khi gán qua API và một lần kéo đồng bộ, ô A-12.03 đổi thành «[Mẫu] Đầu chủ 2», các dòng khác giữ nguyên, thanh trạng thái vẫn «Đã đồng bộ · 13:21» và không có dấu hiệu tải lại. Khớp expected. Không có ảnh bước ẩn cột; kết quả bước đó chỉ lấy từ JSON của script.
  network_observed: n-a (driver)

- eval: E10
  run_id: minted-bang-hang-danh-sach-chi-tiet-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T06:11:05Z
  screenshot: evidence/E10-step1.png
  observed: |
    E10-cho-tai.png (cot ho so cuon toi cuoi): bang van 54 / 70 can, loc Toa A con 1 (chip Loc 1), dong A-03.01 duoc chon; cot phai co tieu de «THUOC TINH CAN», «LAN RAO DANG MO», «CAC LAN RAO» va muc «LICH SU» hien vong quay + chu «Dang tai lich su» (khung cho nam ngay trong cot ho so), nut duoi cung «Can chua co dau chu giu». Bang khong mat dong nao.
    E10-loi.png: dong A-06.01 duoc chon (khung vien o o Ma can), bang van 54 / 70 can, loc giu; cot phai o muc «LICH SU» hien chu «Khong tai duoc lich su» kem nut «Thu lai» ngay trong cot; cac muc khac (Thuoc tinh can: Tang 6, Lan rao) van hien.
    E10-thu-lai.png: sau khi tra binh thuong va bam «Thu lai» (dong A-08.01 duoc chon, Tang 8): muc LICH SU hien «Doi trang thai · Chua du de rao → Dang ban», khong con chu loi / nut Thu lai; bang van 54 / 70 can, loc giu.
    Khop Expected: cho tai va loi nam trong cot ho so, bang du dong va dung duoc, «Thu lai» dua ho so ve.
  network_observed: n-a (driver)

- eval: E7c
  run_id: minted-bang-hang-danh-sach-chi-tiet-E7c-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api_db
  verified_at: 2026-11-05T06:11:05Z
  output: |
    ℹ duration_ms 71317.190125

- eval: E8
  run_id: minted-bang-hang-danh-sach-chi-tiet-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bang_hang_dsct
  verified_at: 2026-11-05T06:11:05Z
  output: |
    ℹ duration_ms 139.54225

- eval: E5
  run_id: minted-bang-hang-danh-sach-chi-tiet-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T05:49:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7a
  run_id: minted-bang-hang-danh-sach-chi-tiet-E7a-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T05:49:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9a
  run_id: minted-bang-hang-danh-sach-chi-tiet-E9a-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T05:49:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9b
  run_id: minted-bang-hang-danh-sach-chi-tiet-E9b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-05T05:49:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9c
  run_id: minted-bang-hang-danh-sach-chi-tiet-E9c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bang_hang_dsct
  verified_at: 2026-11-05T05:49:48Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-bang-hang-danh-sach-chi-tiet-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-05T06:11:05Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-bang-hang-danh-sach-chi-tiet-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-05T06:11:05Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-bang-hang-danh-sach-chi-tiet-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-05T06:11:05Z

- cmd: npm run test:hooks
  run_id: minted-bang-hang-danh-sach-chi-tiet-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-05T06:11:05Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-bang-hang-danh-sach-chi-tiet-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-05T06:11:05Z

- cmd: npm run typecheck
  run_id: minted-bang-hang-danh-sach-chi-tiet-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-05T06:11:05Z

- cmd: npm run lint
  run_id: minted-bang-hang-danh-sach-chi-tiet-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-05T06:11:05Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi, round 1). Mọi block eval ghi baseline n-a.

Baseline khong do: toàn bộ round 2 (lý do: evals.yaml không đổi kể từ lần đo baseline cuối ở round 1).

Eval không-phân-biệt (pass trên cả HEAD lẫn baseline, chứng minh harness chứ không phải feature; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- `npm test -w @quy-hang/web` — E5, E7a
- `node --test "_acceptance/bang-hang-danh-sach-chi-tiet/thu/*.test.mjs"` — E8, E9c
- `R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-khuon.mjs" --kiem --root .` — E9a
- `npm test -w @quy-hang/ui-lint` — E9b

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, tất định)

## Iterations

Round 1: REJECT — Tham chiếu dẫn sai điều khoá (ghi K23, thực tế K26, AC-8) và E7c vướng hạ tầng cơ sở dữ liệu thử. Returned to implementation.
Round 2: REJECT — mọi eval máy xanh, nhưng review có hai mục trong hợp đồng: E4 (AC-4) chỉ đo một chiều, chưa có chiều đỏ; E6 (AC-6) không so bề rộng hồ sơ với nhánh chính. Chi tiết ở review-findings.md. Ghi chú: verified_at của eval round 2 là giờ xấp xỉ lúc soạn báo cáo, kết quả máy không kèm dấu thời gian riêng.

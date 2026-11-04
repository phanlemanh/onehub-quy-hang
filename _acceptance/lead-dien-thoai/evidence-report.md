---
schema_version: 2
feature_slug: lead-dien-thoai
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3fa054d73767a42c81f6226a058bcfee477095ec
human_signoff:
---

# Evidence Report: lead-dien-thoai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-5 | ui-check | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7a | AC-7 | script | PASS (carry-forward từ round 2) |
| E7b | AC-7 | test | PASS (carry-forward từ round 1) |
| E8 | AC-8 | ui-check | PASS |
| E9 | AC-9 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-lead-dien-thoai-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T12:25:51Z
  screenshot: evidence/E1-nhap-390.png
  observed: |
    E1-nhap-390.png (khung 390 rong): tieu de "O nhan lead", tab "Nhap lead" dang chon / "Lead da nhap" cung tab bar tren. Mot cot, nam muc: So chu nha (o 0900 000 000), Can hoac toa (o ma can + chon Toa), Nhu cau (Ban/Cho thue/Ca hai), Gia (o gia + Bao phi/Khong bao phi), Thoi gian muon ra hang (Ngay/Trong 1 thang/1-3 thang/Chua dinh). Khong thay cuon ngang. Nut "Gui lead" hien o mep duoi khung, mot phan sat thanh dieu huong day (Hom nay/Lead/Toi) nhung nam trong khung nhin. Khop Expected.
  network_observed: n-a (driver)

- eval: E2
  run_id: minted-lead-dien-thoai-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T12:25:51Z
  screenshot: evidence/E2-step1.png
  observed: |
    Da mo bang Read E2-step1.png va E2-thieu-so-390.png (cung noi dung, cung 52629 byte; E2-step1.png la ban sao cu, chi ca thieu-so la ghi moi 19:27). Man 390px "O nhan lead": truong "So chu nha" vien do, placeholder 0900 000 000, loi do ngay duoi "Can so dien thoai Viet Nam 10 chu so"; cac muc con lai (Can hoac toa, Nhu cau, Gia 3.200.000.000, Thoi gian) da dien, khong co loi. Khop Expected: loi dung duoi o bo trong. Cac ca thieu khac chi co dong JSON, khong co anh.
  network_observed: n-a (driver)

- eval: E3
  run_id: minted-lead-dien-thoai-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T12:25:51Z
  screenshot: evidence/E3-ket-qua-390.png
  observed: |
    E3-ket-qua-390.png (390 rộng): màn «Lead» tab Nhập lead, form năm mục (Số chủ nhà, Căn hoặc toà, Nhu cầu, Giá, Thời gian muốn ra hàng) với nút «Gửi lead»; ngay dưới là khối kết quả «Không trùng — lead chờ chia theo luật của sàn» và nút lối «Xem ở Lead đã nhập», nằm trọn trong khung. E3-da-nhap-390.png: sau khi bấm lối, tab «Lead đã nhập» mở, bảng Lead/Nấc; dòng đầu «Toà A · chỉ biết toà, Bán · 3,2 tỷ, đã bao phí, 19:29 · [Mẫu] Đầu chủ 1» với nhãn «Đã gửi» (tím). Khớp Expected.
  network_observed: n-a (driver)

- eval: E4
  run_id: minted-lead-dien-thoai-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T12:25:51Z
  screenshot: evidence/E4-da-gui-390.png
  observed: |
    Bon frame khung 390 da mo bang Read. Tat ca: tab "Lead da nhap" dang chon, mot cot, tieu de "Lead da nhap", cot Lead / Nac, khong cuon ngang, khong so chu va khong ma hang trong than trang. Dong dau (Toa A · A-77.14, 3,2 ty, [Mau] Dau chu 1): E4-da-gui-390.png nhan "Da gui" (tim), 19:29; E4-da-nhan-390.png nhan "Da nhan" (tim), 19:30; E4-da-goi-390.png nhan "Da goi" (xam), 19:30; E4-len-bang-390.png nhan "Len bang" (xanh), 19:30. Cac dong khac ben duoi (Da gui, Len bang cu) giu nguyen giua cac frame. Khop Expected: du bon nac doi theo dau chu.
  network_observed: n-a (driver)

- eval: E5
  run_id: minted-lead-dien-thoai-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T12:25:51Z
  screenshot: evidence/E5-mat-mang-390.png
  observed: |
    E5-mat-mang-390.png: man 390 trang Lead; cac o van giu 0900 000 030, Toà A, Nhu cầu Bán chon, Giá 3.200.000.000 + Bao phí chon, Thời gian Ngay chon; duoi nut «Gửi lead» co khoi do «Chưa gửi được — mất mạng. Năm mục vẫn còn trong các ô. Có mạng lại thì bấm «Gửi lead».» Khop Expected. E5-gui-lai-390.png: sau khi bam Gui co mang, form da xoa trong, hien «Không trùng — lead chờ chia theo luật của sàn» va nut «Xem ở Lead đã nhập»: gui thanh cong, khop (1 lead moi theo dem API).
  network_observed: n-a (driver)

- eval: E6
  run_id: minted-lead-dien-thoai-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T12:25:51Z
  screenshot: evidence/E6-step1.png
  observed: |
    step1 (tab Lead, 390, offline, đã bấm «Lead đã nhập»): dải «Đang xem bản đã tải — mất mạng», khối lỗi «Không tải được lead đã nhập» + nút «Thử lại»; không có «Chưa có lead nào». step2 (có mạng lại, sau Thử lại, không tải lại trang): dải mất mạng biến mất, bảng danh sách lead hiện các dòng (Toà A..., Chờ chia/Lên bảng/Đã gửi). step3 (/leads/mine offline): dải mất mạng + khối «Không tải được lead đã nhập» + «Thử lại», không «Chưa có lead nào». step4 (/leads/mine có mạng, sau Thử lại): dải tắt, bảng lead đầy đủ dòng. Khớp Expected.
  network_observed: n-a (driver)

- eval: E7a
  run_id: minted-lead-dien-thoai-E7a-r2
  exit_code: 0
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T11:02:38Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E7b
  run_id: minted-lead-dien-thoai-E7b-r1
  exit_code: 0
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-04T09:54:20Z
  carried_from_round: 1
  ghi chú: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-lead-dien-thoai-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T12:25:51Z
  screenshot: evidence/E9-step1.png
  observed: |
    step1 (đầu chủ, 390): tiêu đề «Ô nhận lead», tab «Nhập lead» đang chọn, form đủ: Số chủ nhà, Căn hoặc toà, Nhu cầu, Giá, Thời gian muốn ra hàng, nút «Gửi lead» ở mép dưới. Khớp expected (đầu chủ thấy ô nhập). step2 (người mua hàng): không có form, không có tab; chỉ một khối báo «Vai của bạn không biết nhập lead — Telesales, đầu chủ và trưởng nhóm nhập được lead». Khớp expected (khối báo vai, không biểu mẫu). step3 (telesales mới): tab «Lead đã nhập» chọn, thẻ trống có biểu tượng hộp thư, «Chưa có lead nào», hướng dẫn bấm «+ Lead». Khớp expected. step4 (đang tải, GET /leads giữ 3 giây): thẻ «Lead đã nhập» hiện khung chờ dạng skeleton gồm hàng tiêu đề và 8 hàng thanh xám, không trống trơn. Khớp expected (khung chờ, không khung trắng). Cả bốn ca ở khổ 390, thân trang có nội dung.
  network_observed: n-a (driver)

- eval: E8
  run_id: minted-lead-dien-thoai-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T12:25:51Z
  screenshot: evidence/E8-nhap-1440.png
  observed: |
    E8-nhap-1440.png (man Ô nhận lead, 1440): nam muc bat buoc hien du: So chu nha, Can hoac toa (o ma can + chon Toa), Nhu cau (Ban/Cho thue/Ca hai), Gia (o gia + Bao phi/Khong bao phi), Thoi gian muon ra hang (Ngay/Trong 1 thang/1-3 thang/Chua dinh); nut Gui lead; khong cuon ngang; trung Expected nam muc. E8-da-nhap-1440.png (Lead đã nhập): bang ba cot Lead, Nac, Gio · dau chu; cac hang co nhan Cho chia/Len bang/Da gui/Da goi; khong cuon ngang; trung Expected bang ba cot.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-lead-dien-thoai-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-04T12:25:51Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-lead-dien-thoai-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-04T12:25:51Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-lead-dien-thoai-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-04T12:25:51Z

- cmd: npm run test:hooks
  run_id: minted-lead-dien-thoai-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-04T12:25:51Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-lead-dien-thoai-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-04T12:25:51Z

- cmd: npm run typecheck
  run_id: minted-lead-dien-thoai-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-04T12:25:51Z

- cmd: npm run lint
  run_id: minted-lead-dien-thoai-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-04T12:25:51Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do: tat ca eval ui-check ghi baseline n-a (chua do tren code cu).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E3, E4 do (kem hạ tầng máy dev thừa) — chấm lại BLOCKED. Returned to implementation.
Round 2: BLOCKED hạ tầng — chỗ thử chưa tự dọn máy dev cùng worktree. Returned to implementation.
Round 3: mọi eval PASS (E7a, E7b carry-forward) — chỗ thử tự dọn máy dev cùng worktree; verdict PASS.

### Re-pin lần 1 — 2026-11-04, do gộp main sau máy thông
run_id: repin-20261104T124515Z-50261
sha: ea8791153c4d5845e10f8e3a5a8295edd03ad7e3 · suites: 7 lệnh exit 0 · evals: 2/2 eval máy đạt kỳ vọng · ngoài làn máy: E1 (E1 không khai paths), E2 (E2 không khai paths), E3 (E3 không khai paths), E4 (E4 không khai paths), E5 (E5 không khai paths), E6 (E6 không khai paths), E9 (E9 không khai paths), E8 (E8 không khai paths) · AC không có chốt máy: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-9, AC-8

### Re-pin lần 2 — 2026-11-04, do gộp main lần hai (luật 51)
run_id: repin-20261104T133555Z-71011
sha: 3fa054d73767a42c81f6226a058bcfee477095ec · suites: 7 lệnh exit 0 · evals: 2/2 eval máy đạt kỳ vọng · ngoài làn máy: E1 (E1 không khai paths), E2 (E2 không khai paths), E3 (E3 không khai paths), E4 (E4 không khai paths), E5 (E5 không khai paths), E6 (E6 không khai paths), E9 (E9 không khai paths), E8 (E8 không khai paths) · AC không có chốt máy: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-9, AC-8

## Kiểm tay trên điện thoại (chủ kho, luật đợt 16 — D-15)

Thử trên bản xem trước của PR #117: https://onehub-quy-hang-git-claude-lea-b18446-phanlemanh-8330s-projects.vercel.app
(địa chỉ bám nhánh `claude/lead-dien-thoai`, luôn là bản mới nhất của PR). Mở bằng điện thoại thật, đăng nhập tài khoản
telesales của sàn mẫu. Vấp gì thì ghi vào câu ký; không chặn gộp.

- [ ] Trên bản xem trước của PR #117 (https://onehub-quy-hang-git-claude-lea-b18446-phanlemanh-8330s-projects.vercel.app), đăng nhập telesales mẫu, tab Lead → «Nhập lead», nhập một lead đủ năm mục, bấm Gửi: thấy kết quả và nút «Xem ở Lead đã nhập».
- [ ] Bỏ trống một mục, bấm Gửi: thấy lỗi ngay dưới đúng ô đó.
- [ ] Bật chế độ máy bay, bấm Gửi: thấy «Chưa gửi được — mất mạng», năm mục còn nguyên; tắt chế độ máy bay, bấm Gửi lại.
- [ ] Mở «Lead đã nhập»: thấy lead vừa nhập và nấc của nó.

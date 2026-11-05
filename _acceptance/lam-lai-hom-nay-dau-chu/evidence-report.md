---
schema_version: 2
feature_slug: lam-lai-hom-nay-dau-chu
verdict: REJECT
failed_evals: ["E7a","E1"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4b219f0059445b06f4b323bbc156e0ed1afe4222
human_signoff:
---

# Evidence Report: lam-lai-hom-nay-dau-chu

Round 1. Hai eval trượt (E7a, E1); các eval còn lại xanh.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | FAIL |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-5 | ui-check | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7a | AC-7 | script | FAIL |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-lam-lai-hom-nay-dau-chu-E1-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T00:00:37Z
  screenshot: evidence/E1-hom-nay-1440.png
  observed: |
    Frame duy nhất E1-hom-nay-1440.png (đã mở bằng Read): bàn làm việc tối, thẻ «Bật thông báo lead», khối «Hôm nay · 34 việc», nhóm «Lead mới 26». Mỗi dòng có hai tầng ở cột Việc (tên căn đậm, «Bán» nhạt) và hai tầng ở cột Vì sao (dòng trên chữ đậm «Đã gửi · nhập hh:mm», dòng dưới đỏ «Quá hạn nhận …»), cột Giá «3,2 tỷ, đã bao phí», một nút viền «Nhận» cùng bề rộng và một nút ⋯. NHƯNG ảnh không có hàng tiêu đề nào: không thấy chữ «Việc», «Vì sao hôm nay», «Giá», «Hành động» ở đầu bảng. Mâu thuẫn với Expected «bốn cột đúng tên».
  network_observed: n-a (driver)
  output: |
    Chạy dung-d.mjs (máy dev thử cổng 3476) rồi chay-ui.mjs --e1 --ra evidence; máy thử đã tắt sau khi chạy.
    Đạt: 34 dòng, mỗi dòng 4 ô; một nút ngoài ở cả 34 dòng (cộng một nút ⋯); viền solid, bề rộng 144 duy nhất; hai tầng ở cột Việc; chữ đậm 600 ở mọi dòng; màu quá hạn khớp token destructive; màu «còn 10 phút» khớp token warning.
    Trượt 1: tieuDeCot không có trong đầu ra; khối solution-agents-2 dựng với renderHeader={false}, ảnh xác nhận không có hàng tiêu đề, không so được với [Việc, Vì sao hôm nay, Giá, Hành động].
    Trượt 2: nhãn nút chính của 4 dòng căn là «Đổi giá, trạng thái · Mở hồ sơ», không khớp bảng AC-3 (căn phải «Còn · giữ giá»). Dòng lead «Nhận» và «Đã gọi» khớp.
    Ghi chú: dòng «Hạn nhận còn 15 phút» cũng tô màu warning trong khi AC-2 nói đúng 15 phút là thường.

- eval: E2
  run_id: minted-lam-lai-hom-nay-dau-chu-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T00:00:37Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3752.802708

- eval: E3
  run_id: minted-lam-lai-hom-nay-dau-chu-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T00:00:37Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3752.802708

- eval: E4
  run_id: minted-lam-lai-hom-nay-dau-chu-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T00:00:37Z
  screenshot: evidence/E4-truoc-1440.png
  observed: |
    E4-truoc-1440.png: trang Hôm nay của đầu chủ, 38 việc, nhóm «Lead mới» 30. Dòng đầu (Toà A · A-20.01, Bán) hiện «Đã gửi · nhập 12:12 / Quá hạn nhận 19 giờ 21 phút», nút chính «Nhận». E4-sau-1440.png: cùng dòng đầu đổi thành «Đã nhận · nhập 12:12 / Quá hạn gọi 19 giờ 6 phút», nút chính đổi thành «Đã gọi»; không có hộp thoại/modal nào trên màn; các dòng khác vẫn «Nhận». Khớp Expected (nhận một chạm, không hộp thoại, nút đổi sang việc kế).
  network_observed: n-a (driver)
  output: |
    chay-ui.mjs --e4 trên máy thử cổng 3476 (dựng bằng dung-d.mjs, đã tắt sau khi xong).
    nutTruoc «Nhận», coHopThoai false, nutSau «Đã gọi»; GET /api/v1/leads/assigned cho lead vừa bấm có stage accepted và acceptedAt khác null.

- eval: E5
  run_id: minted-lam-lai-hom-nay-dau-chu-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T00:00:37Z
  screenshot: evidence/E5-thu-gon-1440.png
  observed: |
    E5-thu-gon-1440.png: trang Hom nay "42 viec"; dau nhom "Lead moi 34" dang thu gon (mui ten phai, khong dong nao duoi), "Can goi lai 3" mo voi 3 dong, "Thieu thong tin 5" mo voi 5 dong. E5-mo-lai-1440.png: "Lead moi 34" mo, hien cac dong lead (Toa A - A-20.01, Da gui/Da nhan, Nhan/Da goi...). Khop Expected.
  network_observed: n-a (driver)
  output: |
    chay-ui.mjs --e5 trên máy thử cổng 3476 (dung-d.mjs, đã tắt sau khi chạy).
    Thứ tự nhóm khớp thứ tự nhóm có việc trong cấu hình hàng đợi; đếm 34/3/5, tổng 42 bằng số dòng; bấm đầu nhóm đầu: số dòng giảm 34 (còn 8), bấm lại: về 42; không căn nào ở hai nhóm.

- eval: E6
  run_id: minted-lam-lai-hom-nay-dau-chu-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T00:00:37Z
  screenshot: evidence/E6-step1.png
  observed: |
    step1 (dang tai): trang Hom nay voi tieu de "Hom nay" va luoi khung cho xam (skeleton) 5 cot x 9 dong, chua co dong lead nao. step2 (trong, dau chu 2 khong viec): "0 viec", bieu tuong hop thu, "Hom nay khong con viec" va nut/lien ket "Mo Bang hang" (href /inventory). step3 (loi): "8 viec" cung khoi do "Chua tai duoc lead giao cho ban / Cac nhom can van doc tu may" kem nut "Thu lai", cac nhom Can goi lai/Thieu thong tin van hien tu may. step4 (mat mang): dai tren cung "Dang xem ban da tai — mat mang / Thay doi duoc giu tren may va gui di khi co mang lai", danh sach 46 viec van hien. Sau khi co mang lai dai tat. Khop Expected, moi ca co anh.
  network_observed: n-a (driver)
  output: |
    chay-ui.mjs --e6 trên máy thử cổng 3476 (đã tắt sau khi chạy).
    dangTai.coKhungCho true; trong.coLoiBangHang true; loi.coThuLai true; matMang.coDai true; coMang.coDai false (không tải lại trang).

- eval: E7a
  run_id: minted-lam-lai-hom-nay-dau-chu-E7a-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T00:00:37Z
  output: |
    sai: design/patterns/trang-tam.md: ngoai_le trỏ tệp không có: apps/web/src/app/(app)/proto/hom-nay-dau-chu/page.tsx
    sai: design/patterns/trang-tam.md: ngoai_le trỏ tệp không có: apps/web/src/app/(app)/proto/o-nhan-lead/page.tsx
    bản đồ nhóm cai-dat-san, hom-nay-dau-chu, lead-cua-toi, o-nhan-lead, toi, trang-tam đổi sau khi ghim — chấm theo bản ghim
    5 tệp giao diện ngoài bản đồ

- eval: E7b
  run_id: minted-lam-lai-hom-nay-dau-chu-E7b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-05T00:00:37Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 24990.045792

- eval: E8
  run_id: minted-lam-lai-hom-nay-dau-chu-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T00:00:37Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3752.802708

- eval: E9
  run_id: minted-lam-lai-hom-nay-dau-chu-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T00:00:37Z
  screenshot: evidence/E9-step1.png
  observed: |
    E9-step1.png (= E9-menu-1440.png): man Hom nay 1440, dong dau co nhan "Da nhan", nut "Da goi"; menu ⋯ mo ra ba muc "Ghi cuoc goi", "Tra lai · So khong lien lac duoc", "Mo so". E9-step2.png (= E9-hoi-lai-1440.png): hop thoai nen mo "Tra lai lead nay?" voi "Ly do: So khong lien lac duoc. Lead ve telesales de sua so va gui lai." va hai nut "Giu lai" / "Tra lai". Khop Expected (tra lai luon hoi lai; co anh trinh don ⋯ va hop hoi lai).
  network_observed: n-a (driver)
  output: |
    chay-ui.mjs --e9 trên máy thử cổng 3476 (đã tắt sau khi chạy).
    Hộp hỏi lại có mặt; bấm Giữ lại thì lead còn; xác nhận thì lead rời hàng đợi và GET /api/v1/leads/assigned không còn mã lead; Mở hồ sơ dẫn tới địa chỉ chứa mã căn của dòng.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-lam-lai-hom-nay-dau-chu-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-05T00:00:37Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-lam-lai-hom-nay-dau-chu-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-05T00:00:37Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-lam-lai-hom-nay-dau-chu-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-05T00:00:37Z

- cmd: npm run test:hooks
  run_id: minted-lam-lai-hom-nay-dau-chu-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-05T00:00:37Z

- cmd: npm run typecheck
  run_id: minted-lam-lai-hom-nay-dau-chu-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-05T00:00:37Z

- cmd: npm run lint
  run_id: minted-lam-lai-hom-nay-dau-chu-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-05T00:00:37Z

Lệnh trượt không gắn eval: không có. Hai lệnh trượt (chấm khuôn thiết kế và ui-check E1) đều đã gắn với E7a và E1.

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline), chỉ chứng minh bộ đo chứ không chứng minh tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý:
- E2, E3, E8 (lệnh npm test -w @quy-hang/web)
- E7b (lệnh npm test -w @quy-hang/ui-lint)

Baseline không đo: E1, E4, E5, E6, E9 là eval giao diện mới, chạy trên mã cũ không có nghĩa. Lệnh suite không liệt kê.

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (mọi eval chỉ chạy một lần, xác định)

## Iterations

Round 1: E7a, E1 trượt. E7a: bản đồ nhóm đổi sau khi ghim, hai ngoại lệ trong trang-tam.md trỏ tệp proto đã xoá, 5 tệp giao diện ngoài bản đồ. E1: bảng tắt hàng tiêu đề nên không có tên bốn cột, và nhãn nút chính của dòng căn lệch bảng AC-3. Trả về giai đoạn hiện thực.

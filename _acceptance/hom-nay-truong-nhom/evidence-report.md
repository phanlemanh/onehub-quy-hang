---
schema_version: 2
feature_slug: hom-nay-truong-nhom
verdict: REJECT
failed_evals: [E6]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: eda5d9f1b9524de346873c77556326b7c9c1fe4f
human_signoff:
---

# Evidence Report: hom-nay-truong-nhom

Round 2. Nội dung thay toàn bộ round cũ; lịch sử các round nằm ở mục Iterations. Lệnh fail không gắn eval: ui-check:E6 (thuộc E6, đã liệt kê ở failed_evals).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS (carry-forward round 1) |
| E2 | AC-2 | test | PASS (carry-forward round 1) |
| E3 | AC-3 | test | PASS (carry-forward round 1) |
| E4 | AC-4 | test | PASS (carry-forward round 1) |
| E5 | AC-5 | test | PASS (carry-forward round 1) |
| E6 | AC-5 | ui-check | FAIL |
| E7 | AC-6 | ui-check | PASS |
| E8 | AC-7 | test | PASS (carry-forward round 1) |
| E9 | AC-8 | test | PASS (carry-forward round 1) |
| E10 | AC-8 | ui-check | PASS |
| E11 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-hom-nay-truong-nhom-E1-r1
  exit_code: 0
  carried_from_round: 1
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T05:10:32Z
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-hom-nay-truong-nhom-E2-r1
  exit_code: 0
  carried_from_round: 1
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T05:10:32Z
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-hom-nay-truong-nhom-E3-r1
  exit_code: 0
  carried_from_round: 1
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T05:10:32Z
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-hom-nay-truong-nhom-E4-r1
  exit_code: 0
  carried_from_round: 1
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T05:10:32Z
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-hom-nay-truong-nhom-E5-r1
  exit_code: 0
  carried_from_round: 1
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T05:10:32Z
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-hom-nay-truong-nhom-E6-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T06:11:47Z
  screenshot: evidence/E6-truoc-1440.png
  observed: |
    E6-truoc-1440.png: ban lam viec Hom nay > Truong nhom, o "Lead qua han" = 12 voi nut "Giao lai", danh sach ben phai co cac dong "Qua han nhan"/"Qua han goi" moi dong co nut "Giao lai". E6-sau-1440.png: trang bi cuon xuong, o "Lead qua han" khong con hien trong khung; danh sach van con y nguyen cac dong "Qua han nhan" (Toa A A-20.01 x3) va "Qua han goi"; popover "Giao cho" dang mo o goc duoi phai voi [Mau] Dau chu 1 (4 lead) va [Mau] Dau chu 2 (8 lead) nhung chua duoc chon; khung hinh bi vo/loi bo cuc. Khong co dong nao bien mat, so lieu khong doi (12 -> 12; 19 -> 19). Mau thuan Expected (dong bien mat, o giam 1).
  network_observed: n-a (driver)
  output: |
    dung-d.mjs: OK (may dev 3476, hangDoi 18 dong). chay-ui.mjs --e6: bam=da-bam; chon="khong-thay-muc:[Mẫu] Đầu chủ 1 4 lead|[Mẫu] Đầu chủ 2 8 lead" (khong bat dau bang "da-chon:") => FAIL; xn=khong-can-xac-nhan; leadQuaHanTruoc=12, leadQuaHanSau=12 (can giam 1) => FAIL; soGiaoLaiTruoc=19, soGiaoLaiSau=19 (can giam 1) => FAIL. Frames: E6-truoc-1440.png, E6-sau-1440.png. Da tat may dev bang dung-d.mjs --tat. Network: driver la script Chrome headless, khong doc duoc network (ghi chu E6-network.txt).

- eval: E7
  run_id: minted-hom-nay-truong-nhom-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T06:11:47Z
  screenshot: evidence/E7-bang-dieu-khien-1440.png
  observed: |
    Frame 1440x900 Trưởng nhóm, bố cục Bảng điều khiển: breadcrumb Hôm nay > Trưởng nhóm; ba ô: «Lead quá hạn» 14 (nhãn Giao lại), «Ngoại lệ» 7 (Chưa có người), «Hàng cũ» 2 (Toàn sàn); bảng «Theo đầu chủ» với 2 đầu chủ, cột Tỉ lệ tươi có thanh: 33% (1/3 căn, đỏ, trạng thái Cũ) và 100% (2/2, xanh, Tươi); hàng đợi «Lead quá hạn và ngoại lệ» 21 lead có nút Giao lại. Không có chữ «Đang dựng».
  network_observed: n-a (driver)
  output: |
    Assertions: (1) dung-d.mjs dựng OK, máy dev 3476, hangDoi in ra. Đếm: accept_overdue=7, first_call_overdue=7 => Lead quá hạn=14; unrouted=7 => Ngoại lệ=7. (2) chay-ui --e7 in: ô {Lead quá hạn:14, Ngoại lệ:7, Hàng cũ:2}, coGiaoLai=true, coTheoNguoi=true, coToanSan=true, coPlaceholder=false. Ba ô có số; khớp hangDoi (PASS). (3) Ảnh: bảng theo đầu chủ có thanh tỉ lệ tươi (33% đỏ, 100% xanh) (PASS). Frames: evidence/E7-bang-dieu-khien-1440.png, evidence/E7-step1.png (bản sao). Đã tắt dung-d --tat. Network: driver Playwright script, không đọc network; ghi chú vào E7-network.txt. Lưu ý: kiểm số ô đối chiếu hangDoi từ lượt dựng (nguồn tương đương lead-queue), không gọi riêng GET API.

- eval: E8
  run_id: minted-hom-nay-truong-nhom-E8-r1
  exit_code: 0
  carried_from_round: 1
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T05:10:32Z
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-hom-nay-truong-nhom-E9-r1
  exit_code: 0
  carried_from_round: 1
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T05:10:32Z
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-hom-nay-truong-nhom-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T06:11:47Z
  screenshot: evidence/E10-dien-thoai-390.png
  observed: |
    E10-dien-thoai-390.png (390x844, giao dien toi): tieu de «Hôm nay», the «Bật thông báo lead» voi nut «Bật thông báo», ngay duoi la mot the co dong «Hôm nay của trưởng nhóm mở trên máy tính». Khong co bang dieu khien, khong co bang giao lai/lead qua han/ngoai le/hang cu; thanh tab duoi Hôm nay/Bảng hàng/Gửi/Tôi. Khop Expected.
  network_observed: n-a (driver)
  output: |
    Step1 dung-d.mjs: may dev 3476 + Postgres 5575 len, 3 lead moi. Step2 chay-ui.mjs --e10 (kho 390x844): moMayTinh=true, coGiaoLai=false, coTheoNguoi=false, coToanSan=false, coPlaceholder=false, soGiaoLai=0. Frame luu: evidence/E10-dien-thoai-390.png. Da tat may dev bang dung-d.mjs --tat. Driver la script, khong doc duoc network. Ghi chu: may dev cua script la 3476, khong phai 3460 neu de bai ghi.

- eval: E11
  run_id: minted-hom-nay-truong-nhom-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T06:11:47Z
  output: |
    11 tệp giao diện ngoài bản đồ

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-hom-nay-truong-nhom-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-04T06:11:47Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-hom-nay-truong-nhom-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-04T06:11:47Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-hom-nay-truong-nhom-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-04T06:11:47Z

- cmd: npm run test:hooks
  run_id: minted-hom-nay-truong-nhom-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-04T06:11:47Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-hom-nay-truong-nhom-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-04T06:11:47Z

- cmd: npm run typecheck
  run_id: minted-hom-nay-truong-nhom-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-04T06:11:47Z

- cmd: npm run lint
  run_id: minted-hom-nay-truong-nhom-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-04T06:11:47Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay. Moi block eval ghi baseline n-a.

Eval khong-phan-biet (pass tren ca HEAD lan baseline, chung minh harness chu khong phai feature; nen viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y):
- npm run db:migrate && npm run db:test: E1, E2, E3, E5
- npm test -w @quy-hang/core: E4
- npm test -w @quy-hang/web: E8, E9
- design-floor-khuon.mjs --kiem --root .: E11

## Variance

none — khong eval nao co runs lon hon 1; moi eval la deterministic.

## Iterations

Round 1: E1, E2, E3, E4, E5, E8, E9 dat (verified_at 2026-11-04T05:10:32Z); cac eval con lai chua co ket qua dat trong hoi so nay.
Round 2: E6 failed — bam «Giao lai» roi popover «Giao cho» mo nhung khong chon duoc dau chu nao (khong-thay-muc), nen dong khong bien mat, ô «Lead quá hạn» giu 12 -> 12 va so nut Giao lai giu 19 -> 19. E7, E10, E11 dat; E1-E5, E8, E9 carry-forward tu round 1. Returned to implementation.

---
schema_version: 2
feature_slug: va-he-bo-cuc
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bbe249d4d4b1590e20bc7087eedf477dde1f8d32
human_signoff:
---

# Evidence Report: va-he-bo-cuc

Lưu ý vòng 1: mọi eval của hợp đồng đều xanh, nhưng lệnh suite `npm test -w @quy-hang/ui-lint` (không gắn eval nào) chạy đỏ nên verdict là REJECT. Xem `### Lệnh suite (hồi quy)` và `## Iterations`.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-5 | test | PASS |
| E4 | AC-6 | test | PASS |
| E5 | AC-4 | test | PASS |
| E11 | AC-3 | test | PASS |
| E6u | AC-1 | ui-check | PASS |
| E10u | AC-3 | ui-check | PASS |
| E7u | AC-4 | ui-check | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-he-bo-cuc-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T09:25:59Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1379.645

- eval: E2
  run_id: minted-va-he-bo-cuc-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T09:25:59Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1379.645

- eval: E3
  run_id: minted-va-he-bo-cuc-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T09:25:59Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1379.645

- eval: E4
  run_id: minted-va-he-bo-cuc-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T09:25:59Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1379.645

- eval: E5
  run_id: minted-va-he-bo-cuc-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T09:25:59Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1379.645

- eval: E11
  run_id: minted-va-he-bo-cuc-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T09:25:59Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1379.645

- eval: E8
  run_id: minted-va-he-bo-cuc-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-02T09:25:59Z
  output: |
    npm run lint
    chuẩn giao diện: đạt

- eval: E9
  run_id: minted-va-he-bo-cuc-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-02T09:25:59Z
  output: |
    node design-floor-s4.mjs --root .
    (không có mã màu thô trên tệp giao diện vòng chạm)

- eval: E6u
  run_id: minted-va-he-bo-cuc-E6u-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T09:25:59Z
  screenshot: evidence/E6u-step1.png
  observed: |
    E6u-truoc.png (1440x900): cot hai 'HOM NAY' co nam muc (Lead moi, Nen goi dieu chinh gia, Can goi lai, Thieu thong tin, Moi doi), khong muc nao to sang; luoi 'Hom nay 15 viec' chi co mot dong nhom 'Thieu thong tin 15' dang gap (mui ten >), khong dong bao. E6u-new_lead.png: muc 'Lead moi' to sang (aria-current), luoi hien dung mot dong bao 'Hom nay khong co viec o <Lead moi>' phia tren dong nhom 'Thieu thong tin 15' van gap. E6u-missing_info.png: muc 'Thieu thong tin' to sang, nhom mo (mui ten xuong) liet ke cac can A-13.01... , dong nhom nam o top khung nhin, nen nhom hoi xam (da chon), khong dong bao. E6u-tai-lai.png (tai lai tai ?nhom=missing_info): giong het anh missing_info, muc 'Thieu thong tin' sang, nhom mo, khong dong bao. E6u-1024.png (1024x768): bo cuc mot cot trong luoi, cot hai van hien, muc 'Thieu thong tin' sang, nhom mo, dong nhom o top khung, khong dong bao. Doi chieu Expected: khop (dia chi /today?nhom=<ma>, dung mot aria-current, nhom co viec mo + chon + trong khung nhin + 0 bao, tai lai nhu bam, 1024 nhu 1440).
  network_observed: clean

- eval: E10u
  run_id: minted-va-he-bo-cuc-E10u-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T09:25:59Z
  screenshot: evidence/E10u-step1.png
  observed: |
    I opened each saved frame with Read and compared it against Expected.
    - E10u-step1.png (bare /today, dau-chu-1, 1440x900): The second column lists 5 entries, none highlighted. The grid "Hôm nay · 15 việc" shows ONE group, "Thiếu thông tin 15", with rows such as A-13.01 · Toà A. An unrelated banner "Bật thông báo lead" sits above it. There is no "Hôm nay không có việc" line. Groups on the grid = {missing_info}, so the empty groups are new_lead, price_adjustment, call_back and recent_change. I chose new_lead ("Lead mới").
    - E10u-trong.png (after clicking "Lead mới"): The "Lead mới" entry is highlighted. Directly under the "Hôm nay · 15 việc" header, one line reads «Hôm nay không có việc ở «Lead mới»». The "Thiếu thông tin 15" group and its rows stay below it unchanged. Only this one nhóm line is present.
    - E10u-sang-co-viec.png (after clicking "Thiếu thông tin"): "Thiếu thông tin" is highlighted and "Lead mới" is not. There is no "không có việc" line, and the grid is the same 15-row group.
    - E10u-dang-tai.png (right after reload at ?nhom=new_lead): The page shows a skeleton under the "Hôm nay" title, with "Lead mới" highlighted. There is no notice line, no banner and no group.
    - E10u-sau-tai.png (3s later): The "Lead mới" line is back, identical to E10u-trong.png, with one nhóm line and the group retained.
    - E10u-step2.png, step3.png and step4.png are copies of trong, sang-co-viec and dang-tai.
    All frames match Expected.
  network_observed: clean

- eval: E7u
  run_id: minted-va-he-bo-cuc-E7u-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T09:25:59Z
  screenshot: evidence/E7u-telesales-tran.png
  observed: |
    Da mo tung frame bang Read. (1) E7u-telesales-tran.png (telesales, /today): vo mot nha, KHONG co cot thu hai va khong co thanh rail; thanh tren co link «Hom nay», «+ Lead»; than man la bang «Lead da nhap» (cac hang Toa A... Cho chia). Khong co dong bao. (2) E7u-telesales-nhom.png (mo thang /today?nhom=new_lead): location.href = http://localhost:3482/today?nhom=new_lead; dau man dung MOT dong bao «Hang doi «Lead moi» chi co o Hom nay cua dau chu» (role=status, so dong bao = 1); khong co cot nen khong co muc aria-current trong cot (aria-current chi o link «Hom nay» tren thanh); phan than duoi dong bao la cung bang «Lead da nhap», cung cac hang va cung thu tu nhu ban tran, chi bi day xuong do dong bao. (3) E7u-truong-nhom-tran.png (truong nhom, /today): CO cot thu hai «Hom nay» voi dung nam muc (Lead moi, Nen goi dieu chinh gia, Can goi lai, Thieu thong tin, Moi doi); khong muc nao aria-current; than: the «Bat thong bao lead» + «Man nay dang dung». Khong dong bao. (4) E7u-truong-nhom-nhom.png (bam «Lead moi» o cot): location.href = http://localhost:3482/today?nhom=new_lead; muc «Lead moi» mang aria-current=page va sang len trong cot; dau man dung MOT dong bao «Hang doi «Lead moi» chi co o Hom nay cua dau chu» (so dong bao = 1); phan con lai (the «Bat thong bao lead» + «Man nay dang dung») giong het ban tran cua cung vai. Khop Expected cho loi bao ro. LUU Y lech gia dinh buoc: cot thu hai co o truong nhom, KHONG co o telesales (dung nhu steps noi) — nhung vi vay loi «an» (cot khong co muc hang doi, dong «Hang doi co o Hom nay cua dau chu») khong the hien o hai vai nay nen khong duoc kiem trong eval nay; buoc mo thang cho telesales cho ket qua dong bao dung nhu loi bao ro.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-he-bo-cuc-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-02T09:25:59Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-he-bo-cuc-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-02T09:25:59Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-he-bo-cuc-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-02T09:25:59Z

- cmd: npm run test:hooks
  run_id: minted-va-he-bo-cuc-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-02T09:25:59Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-he-bo-cuc-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 1
  verified_at: 2026-11-02T09:25:59Z

- cmd: npm run typecheck
  run_id: minted-va-he-bo-cuc-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-02T09:25:59Z

Ghi chú lệnh suite đỏ (không gắn eval nào): bài `tests/ban-do-khuon.test.mjs` (dòng 330) so sánh danh sách khuôn và thấy dòng `trang-thai` thực tế là «49 chỗ theo khuôn · 0 ngoại lệ · 0 lệch» trong khi bài mong «47 chỗ theo khuôn · 0 ngoại lệ · 0 lệch». Các dòng khuôn khác khớp. Số chỗ theo khuôn của nhóm `trang-thai` tăng thêm hai so với con số bài đang giữ.

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline — chứng minh harness chứ chưa chứng minh tính năng; cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý):
- `npm test -w @quy-hang/web` — E1, E2, E3, E4, E5, E11 (baseline: green)
- `npm run lint` — E8 (baseline: green)
- `design-floor-s4.mjs --root .` — E9 (baseline: green)

Baseline không đo: E6u, E10u, E7u (eval ui-check, baseline n-a — không có phép đo baseline cho eval nhìn giao diện).

Lệnh fail không gắn eval: `npm test -w @quy-hang/ui-lint` (xem ghi chú dưới `### Lệnh suite (hồi quy)`).

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, tất định, không có pass_rate hỗn hợp).

## Iterations

Round 1: không eval nào của hợp đồng đỏ (E1–E5, E11, E6u, E10u, E7u, E8, E9 đều xanh), nhưng lệnh suite `npm test -w @quy-hang/ui-lint` đỏ — bài bản đồ khuôn đếm nhóm `trang-thai` là 49 chỗ trong khi bài mong 47. Returned to implementation.

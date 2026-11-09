---
schema_version: 2
feature_slug: hom-nay-chiu-loi-tung-phan
verdict: REJECT
failed_evals: [E10d]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4328e3c64eb547fed981212817d4fbec61609e28
human_signoff:
---

# Evidence Report: hom-nay-chiu-loi-tung-phan

Vòng 1. Một eval hỏng: E10d (lỗi từng phần ở Hôm nay không hiện khối lỗi cho nhóm Lead). Các eval còn lại đạt.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | ui-check | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | ui-check | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | ui-check | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | ui-check | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | ui-check | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | ui-check | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | ui-check | PASS |
| E8 | AC-8 | ui-check | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | ui-check | PASS |
| E10 | AC-10 | judgment | PASS (đề xuất của hội đồng, chờ người chốt; mâu thuẫn với E10d) |
| E10b | AC-10 | script | PASS |
| E10c | AC-10 | script | PASS |
| E10d | AC-10 | ui-check | FAIL |

Lệnh fail không gắn eval: ui-check:E10d (thuộc E10d, ghi ở khối bên dưới).

## Evidence

- eval: E1
  run_id: minted-hom-nay-chiu-loi-tung-phan-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:15:34Z
  output: |
    npm test -w @quy-hang/web, duration_ms 5269.04; ca «nguồn bộ nhóm theo vai» có mặt và ok

- eval: E2
  run_id: minted-hom-nay-chiu-loi-tung-phan-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:15:34Z
  output: |
    npm test -w @quy-hang/web, duration_ms 5269.04; ca «đọc kết quả có thử lại» có mặt và ok

- eval: E3
  run_id: minted-hom-nay-chiu-loi-tung-phan-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:15:34Z
  output: |
    npm test -w @quy-hang/web, duration_ms 5269.04

- eval: E4
  run_id: minted-hom-nay-chiu-loi-tung-phan-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:15:34Z
  output: |
    npm test -w @quy-hang/web, duration_ms 5269.04

- eval: E5
  run_id: minted-hom-nay-chiu-loi-tung-phan-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:15:34Z
  output: |
    npm test -w @quy-hang/web, duration_ms 5269.04

- eval: E6
  run_id: minted-hom-nay-chiu-loi-tung-phan-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:15:34Z
  output: |
    npm test -w @quy-hang/web, duration_ms 5269.04

- eval: E7
  run_id: minted-hom-nay-chiu-loi-tung-phan-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:15:34Z
  output: |
    npm test -w @quy-hang/web, duration_ms 5269.04

- eval: E9
  run_id: minted-hom-nay-chiu-loi-tung-phan-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:15:34Z
  output: |
    npm test -w @quy-hang/web, duration_ms 5269.04; ca «đọc tin» có mặt và ok

- eval: E10b
  run_id: minted-hom-nay-chiu-loi-tung-phan-E10b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-09T10:15:34Z
  output: |
    design-floor-khuon --kiem: 18 tệp giao diện ngoài bản đồ

- eval: E10c
  run_id: minted-hom-nay-chiu-loi-tung-phan-E10c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.floor
  verified_at: 2026-11-09T10:15:34Z
  output: |
    design-floor-s4: không mã màu thô trên tệp giao diện vòng chạm

- eval: E1b
  run_id: minted-hom-nay-chiu-loi-tung-phan-E1b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T10:15:34Z
  screenshot: evidence/E1b-step2-truong-nhom.png
  observed: |
    Frame step2 truong-nhom (doc that): trang Hôm nay, 12 việc · 7 quá hạn, banner Bật thông báo lead, bang nhom Lead quá hạn 7 va Chưa chia được 5; KHONG co dong chu nao ve bộ mặc định/bộ nhóm giua banner va bang. Step3 telesales (doc text, anh khong mo rieng tung cai): 4 việc, nhom Lead bị trả lại, khong co chuoi do. Step4 dau-khach: 11 việc, Khách phản ứng/Vừa đổi/Căn mới khớp, khong co chuoi do. Frame step5 dau-chu (doc that): ngay tren bang co dong «Đang dùng bộ mặc định — chưa tải được bộ nhóm của sàn», phia duoi la nhom Lead mới 3 va Thiếu thông tin 15 hien binh thuong (loi tung phan, phan con lai van tai). Khop Expected: ba vai dau khong co cau, dau-chu co cau «Đang dùng bộ mặc định».
  network_observed: clean

- eval: E2b
  run_id: minted-hom-nay-chiu-loi-tung-phan-E2b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T10:15:34Z
  screenshot: evidence/E2b-step3.png
  observed: |
    step3 (/team, lead-queue loi 2 lan): khong co banner loi; the «Lead qua han» hien so 7, «Ngoai le» 6, «Hang cu» 0, bang Theo dau chu co 2 hang. step4 (/team, listing-agents loi 2 lan): giong y het, bang co ten «[Mau] Dau chu 1» va «[Mau] Dau chu 2», khong cau «bo nhom». step5 (/today truong-nhom, listing-agents loi 2 lan): «13 viec · 7 qua han», nhom Lead qua han 7 dong, moi dong nut «Giao lai» day du; khong banner loi. step6 (/today dau-chu, settings/queue loi 2 lan): «18 viec · 3 qua han», nhom Lead moi co nut «Nhan», Thieu thong tin 15, khong banner. step7 (doi chung, lead-queue 500 mai): banner do «Khong tai duoc lead qua han / Bang theo dau chu van doc tu may. / Thu lai», o Lead qua han va Ngoai le hien «—» — dung nhu doi chung duong. Tat ca khop Expected.
  network_observed: clean
  ghi chú: đối chứng dương chạm sát ngưỡng 2 giây (alert đầu sau lời gọi hỏng đầu khoảng 2015 ms).

- eval: E3b
  run_id: minted-hom-nay-chiu-loi-tung-phan-E3b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T10:15:34Z
  screenshot: evidence/E3b-step1.png
  observed: |
    Đã mở E3b-step1.png, E3b-step3.png, E3b-step5.png bằng Read; E3b-step2.png và E3b-step4.png chỉ khẳng định qua đọc DOM. E3b-step1.png (listing-agents lỗi): banner hồng "Chưa tải được danh sách đầu chủ" kèm "Các nhóm còn lại vẫn đúng." và một nút "Thử lại"; bảng Hôm nay 14 việc, các nút "Giao lại" xám (tắt). E3b-step3.png (cả hai lỗi): một banner "Chưa tải được lead quá hạn" với một "Thử lại", không bảng. E3b-step5.png (sau sự kiện online, không bấm): hết banner, bảng trở lại, nút "Giao lại" đậm và bấm được. Khớp Expected. Ca đỏ trên 5d55d0cc không chạy.
  network_observed: n-a (driver)

- eval: E4b
  run_id: minted-hom-nay-chiu-loi-tung-phan-E4b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T10:15:34Z
  screenshot: evidence/E4b-step2.png
  observed: |
    step2 (ca1, 1440): thanh do nhat "Khong tai duoc ten dau chu / So can trong bang van dung." voi nut "Thu lai" cung hang ben phai; 3 the 7/8/0 ben duoi; bang 2 dong deu o tron "—" + "Chua ro ten", khong chuoi hex. step3/step4: 1 alert voi cau cua hang doi, so the Lead qua han/Ngoai le la "—". step5 (ca4 sau Thu lai): khong con alert; the 7/8/0; bang co o tron "1","2" va ten "[Mau] Dau chu 1/2" that. step6 (375): trang /team chi hien "Bang dieu khien khong co tren dien thoai - Mo tren may tinh de xem doi", khong tran ngang, khong co alert nen khong do duoc nut-vs-chu tren man nay (da do thay o /today 375: nut xuong hang duoi cau, khong de chu, khong tran).
  network_observed: clean

- eval: E5b
  run_id: minted-hom-nay-chiu-loi-tung-phan-E5b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T10:15:34Z
  screenshot: evidence/E5b-step1.png
  observed: |
    Đã mở từng frame bằng Read, trang Đội /team, vai truong-nhom, khổ 1440. E5b-step1.png (onLine false, cắt mạng /api/v1/team/**): thấy khối «Đang xem bản đã tải — mất mạng», khối «Đang mất mạng» kèm «Máy sẽ tự đọc lại khi có mạng.», ô Lead quá hạn hiện «—» và nhãn «Chờ có mạng»; không có chữ «giao lại». E5b-step2.png (bỏ chặn, onLine true, phát sự kiện online, chờ 5 giây): hết «Đang mất mạng», ô Lead quá hạn hiện 7, Ngoại lệ 8, bảng đầu chủ có tên; cờ window.__onl còn nguyên nên trang không tải lại. E5b-step3a.png (cắt mạng mọi lần, chờ 9 giây): một khối đỏ «Không tải được lead quá hạn» với một nút «Thử lại», không có «Đang mất mạng». E5b-step3b.png (bỏ chặn, bấm «Thử lại»): hết lỗi, Lead quá hạn 7, Ngoại lệ 8. Khớp Expected.
  network_observed: clean

- eval: E6b
  run_id: minted-hom-nay-chiu-loi-tung-phan-E6b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T10:15:34Z
  screenshot: evidence/E6b-step2.png
  observed: |
    Frame E6b-step2.png (truong-nhom, lead-queue 500): cột thứ hai có «Tất cả việc», «Lead quá hạn», «Chưa chia được», KHÔNG có số nào cạnh «Tất cả việc»; thân trang có thẻ lỗi «Chưa tải được lead quá hạn — Các nhóm còn lại vẫn đúng» + nút «Thử lại», không ghi 0. Khớp Expected ca 1. Frame E6b-step3.png (dau-chu, leads/assigned 500): «Tất cả việc 15», «Lead mới» KHÔNG có số, các nhóm khác có số; thẻ lỗi «Chưa tải được lead giao cho bạn», bảng vẫn liệt kê 15 căn thiếu thông tin. Khớp Expected ca 2. Frame E6b-step4.png (truong-nhom, không lỗi, đối chứng): «Tất cả việc 15», «Lead quá hạn 7», «Chưa chia được 8», không thẻ lỗi. Khớp Expected ca 3.
  network_observed: app-fail
  ghi chú: các lỗi ở app-origin đều do chính bài chèn có chủ đích; máy ghi app-fail theo luật từ vựng nhưng mọi assertion giao diện đạt, nên eval tính là đạt.

- eval: E7b
  run_id: E7b-20261109
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T10:15:34Z
  screenshot: evidence/E7b-step1.png
  observed: |
    Frame step1: vai truong-nhom, 1440, mất mạng. Thân màn có đúng một thẻ «Chưa đọc được việc của bạn» kèm «Máy sẽ tự đọc lại khi có mạng.»; có banner «Đang xem bản đã tải — mất mạng» và thẻ bật thông báo. Không có «không còn việc», không bảng. Cột trái «Tất cả việc / Lead quá hạn / Chưa chia được» không có số. Khớp Expected. Frame step2: sau bỏ chặn và phát online, banner mất mạng và câu lỗi biến mất; tiêu đề «16 việc · 7 quá hạn», cột hiện 16/7/9, bảng có nhóm Lead quá hạn 7 và Chưa chia được 9, mỗi dòng có nút «Giao lại». Khớp Expected.
  network_observed: clean

- eval: E8
  run_id: minted-hom-nay-chiu-loi-tung-phan-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T10:15:34Z
  screenshot: evidence/E8-step1.png
  observed: |
    E8-step1.png (1440, truong-nhom, assign bị chặn): hàng đầu "Toà A · A-05.06" vẫn ở bảng Lead quá hạn (7), nút Giao lại còn, ngay dưới nút có câu đỏ "Chưa giao được — thử lại." nằm trong dòng; 17 nút Giao lại, không dòng nào rời. E8-step2.png (bỏ chặn, giao lại đúng dòng đó): câu hết, dòng A-05.06 rời hàng đợi, 17 -> 16 việc, quá hạn 7 -> 6. E8-step3.png (375, ngăn đáy, assign lỗi): thẻ đầu "Toà A · chỉ biết toà" còn, câu đỏ "Chưa giao được — thử lại." nằm trong thẻ dưới dòng quá hạn. Khớp Expected. Ca đỏ trên 5d55d0cc không chạy.
  network_observed: clean

- eval: E9b
  run_id: minted-hom-nay-chiu-loi-tung-phan-E9b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T10:15:34Z
  screenshot: evidence/E9b-step1.png
  observed: |
    step1.png: trang Đã gửi / Tin của khách; banner mất mạng của vỏ; ngay dưới khối lỗi hồng «Chưa tải được — thử lại» có đúng một nút «Thử lại»; không khung chờ. step2.png: sau khi bỏ chặn và bấm Thử lại: không còn khối lỗi, dòng thời gian «HÔM NAY 23», thẻ Căn mới Toà A · A-08.03, các thẻ Vừa đổi A-10.05. step4.png: (lỗi hai lần rồi thật, không bấm) cùng danh sách tin, không khối lỗi, không khung chờ. step5a.png: khối lỗi có một nút Thử lại, không skeleton. step5b.png: sau sự kiện online không bấm gì, khối lỗi biến mất, danh sách tin hiện lại. Khớp Expected.
  network_observed: clean

- eval: E10d
  run_id: minted-hom-nay-chiu-loi-tung-phan-E10d-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T10:15:34Z
  screenshot: evidence/E10d-step2.png
  observed: |
    step2 (du-vai, 1440): trang Hôm nay '22 việc', biểu ngữ 'Đang xem bản đã tải — mất mạng', danh sách chỉ có nhóm Thiếu thông tin 15, Lead bị trả lại 2, Khách phản ứng 2, Vừa đổi... Các mục Lead quá hạn, Chưa chia được, Lead mới ở thanh trái không có số. KHÔNG có câu 'Chưa tải được...', KHÔNG có nút Thử lại, mâu thuẫn Expected. step3 (dau-chu, nhom=new_lead): '15 việc', cùng biểu ngữ mất mạng, danh sách Thiếu thông tin; không khối lỗi, không Thử lại, mâu thuẫn Expected. step5 (375): giống step3 ở khổ điện thoại, không tràn ngang nhưng không có khối lỗi. step4a (telesales /leads/mine): khối đỏ 'Không tải được lead đã nhập' + một nút Thử lại, đúng Expected. step4b: sau online, bảng lead đã nhập hiện đủ dòng, đúng Expected.
  network_observed: app-fail
  output: |
    Bước 2 (du-vai, lead-queue và leads/assigned lỗi mọi lần, 9 giây): số câu 'Chưa tải được...' = 0, 'Thử lại' = 0; không có 'Chưa tải được lead giao cho bạn'. Mong đợi hai câu lỗi, mỗi câu một Thử lại. Không đạt.
    Bước 3 (dau-chu /today?nhom=new_lead, leads/assigned lỗi): không có khối lỗi, 'Thử lại' = 0, chỉ có biểu ngữ mất mạng và danh sách Thiếu thông tin. Không đạt.
    Bước 4 (telesales /leads/mine, GET /api/v1/leads lỗi): đúng 1 'Thử lại'; bỏ chặn + online + 4 giây thì danh sách hiện, 'Thử lại' = 0. Đạt.
    Bước 5 (375): không tràn ngang (375 bằng 375) nhưng không có khối lỗi/Thử lại. Phần lỗi không đạt.
    Kết luận: lỗi từng phần chỉ hiện ở /leads/mine; ở /today nhóm Lead (lead quá hạn, chưa chia được, lead mới, lead giao cho bạn) bị lẳng lặng bỏ khỏi danh sách, thay bằng biểu ngữ mất mạng, không báo lỗi riêng.

### Phán quyết judgment

- eval: E10
  judged_by: hội đồng judge (fresh context), đề xuất PASS
  panel:
    - domain-correctness: PASS — BaoLoiVung dựng trên TrangThai kind="error" với đúng một nút «Thử lại»; bốn màn báo lỗi đọc bằng BaoLoiVung; hom-nay.tsx đọc qua docCoThuLai/docKetQuaCoThuLai; dashboard.tsx đọc hàng đợi và đầu chủ qua docCaHai, đọc lại bằng useKhiCoMangLai, cờ ngoaiTuyen từ useNgoaiTuyen; vung.tsx đọc qua docTinDauKhach; lead-da-nhap.tsx đọc lại bằng useKhiCoMangLai khi leads là null.
    - operational-feasibility: PASS — cả bốn vế thấy trong mã; trong các file này không còn TrangThai kind="error" tự ghép nút; cờ mất mạng đến từ useNgoaiTuyen, không lấy từ kết quả lời gọi.
    - spec-alignment: PASS — BaoLoiVung có đúng một nút «Thử lại» nhận từ onThuLai; TrangThai chỉ còn dùng cho notice và empty; hom-nay.tsx và dashboard.tsx đọc có thử lại; vung.tsx và lead-da-nhap.tsx đọc lại khi có mạng.
  lưu ý của người viết báo cáo: hội đồng chỉ soi mã, còn E10d chạy trên màn thật cho thấy nhóm Lead ở /today không hiện khối lỗi riêng. Hai kết quả mâu thuẫn nhau, người quyết xem ở Cổng 2.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-hom-nay-chiu-loi-tung-phan-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-09T10:15:34Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-hom-nay-chiu-loi-tung-phan-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-09T10:15:34Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-hom-nay-chiu-loi-tung-phan-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-09T10:15:34Z

- cmd: npm run test:hooks
  run_id: minted-hom-nay-chiu-loi-tung-phan-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-09T10:15:34Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-hom-nay-chiu-loi-tung-phan-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-09T10:15:34Z

- cmd: npm run typecheck
  run_id: minted-hom-nay-chiu-loi-tung-phan-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-09T10:15:34Z

- cmd: npm run lint
  run_id: minted-hom-nay-chiu-loi-tung-phan-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-09T10:15:34Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline, chứng minh harness hơn là tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- npm test -w @quy-hang/web, phủ E1, E2, E3, E4, E5, E6, E7, E9
- design-floor-khuon --kiem, phủ E10b
- design-floor-s4, phủ E10c

Baseline các eval ui-check: n-a, vì chạy trên cây đang chấm; ca «đỏ trên 5d55d0cc» không được chạy (không có bản đó để so).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E10d failed — ở /today, khi lead-queue và leads/assigned lỗi, nhóm Lead bị bỏ khỏi danh sách chỉ kèm biểu ngữ mất mạng, không có khối lỗi riêng và không có «Thử lại». Returned to implementation.

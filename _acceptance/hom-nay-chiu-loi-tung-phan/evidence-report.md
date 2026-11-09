---
schema_version: 2
feature_slug: hom-nay-chiu-loi-tung-phan
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c3a875874179d387245824a4699fb67ef6ca2301
human_signoff: Manh Phan 2026-11-09
---

# Evidence Report: hom-nay-chiu-loi-tung-phan

Round 2. Round 1 nằm ở mục Iterations. Các eval không bị delta chạm được mang sang từ round 1 (ghi `carried_from_round: 1`).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS (carry-forward r1) |
| E1b | AC-1 | ui-check | PASS (carry-forward r1) |
| E2 | AC-2 | test | PASS (carry-forward r1) |
| E2b | AC-2 | ui-check | PASS |
| E3 | AC-3 | test | PASS (carry-forward r1) |
| E3b | AC-3 | ui-check | PASS (carry-forward r1) |
| E4 | AC-4 | test | PASS (carry-forward r1) |
| E4b | AC-4 | ui-check | PASS |
| E5 | AC-5 | test | PASS (carry-forward r1) |
| E5b | AC-5 | ui-check | PASS |
| E6 | AC-6 | test | PASS (carry-forward r1) |
| E6b | AC-6 | ui-check | PASS (carry-forward r1) |
| E7 | AC-7 | test | PASS (carry-forward r1) |
| E7b | AC-7 | ui-check | PASS (carry-forward r1) |
| E8 | AC-8 | ui-check | PASS (carry-forward r1) |
| E9 | AC-9 | test | PASS (carry-forward r1) |
| E9b | AC-9 | ui-check | PASS (carry-forward r1) |
| E10 | AC-10 | judgment | PASS |
| E10b | AC-10 | script | PASS |
| E10c | AC-10 | script | PASS |
| E10d | AC-10 | ui-check | PASS |

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline), chứng minh khung chứ không phải tính năng; giữ như regression-guard có chủ ý hoặc viết lại để khẳng định hành vi mới:
- E10b (lệnh `design-floor-khuon.mjs --kiem`): regression-guard có chủ ý cho khuôn nhóm trang-thai.
- E10c (lệnh `design-floor-s4.mjs`): regression-guard có chủ ý cho mã màu thô.

## Evidence

- eval: E1
  run_id: minted-hom-nay-chiu-loi-tung-phan-E1-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:15:34Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E1b
  run_id: minted-hom-nay-chiu-loi-tung-phan-E1b-r1
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T10:15:34Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/E1b-step2-truong-nhom.png
  observed: |
    Frame step2 truong-nhom (doc that): trang Hôm nay, 12 việc · 7 quá hạn, banner Bật thông báo lead, bang nhom Lead quá hạn 7 va Chưa chia được 5; KHONG co dong chu nao ve bộ mặc định/bộ nhóm giua banner va bang. Step3 telesales (doc text, anh khong mo rieng tung cai): 4 việc, nhom Lead bị trả lại, khong co chuoi do. Step4 dau-khach: 11 việc, Khách phản ứng/Vừa đổi/Căn mới khớp, khong co chuoi do. Frame step5 dau-chu (doc that): ngay tren bang co dong «Đang dùng bộ mặc định — chưa tải được bộ nhóm của sàn», phia duoi la nhom Lead mới 3 va Thiếu thông tin 15 hien binh thuong (loi tung phan, phan con lai van tai). Khop Expected: ba vai dau khong co cau, dau-chu co cau «Đang dùng bộ mặc định».
  network_observed: clean

- eval: E2
  run_id: minted-hom-nay-chiu-loi-tung-phan-E2-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:15:34Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2b
  run_id: minted-hom-nay-chiu-loi-tung-phan-E2b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T10:52:35Z
  screenshot: evidence/E2b-step3.png
  observed: |
    E2b-step3.png (ca1, /team, vai truong-nhom): trang Tổng quan, ba ô Lead quá hạn = 3 (nút «Giao lại»), Ngoại lệ = 4, Hàng cũ = 0; không có banner lỗi; bảng theo đầu chủ có «[Mẫu] Đầu chủ 1/2». Khớp Expected. E2b-step4.png (ca2, /team): ô Lead quá hạn = 4, tên đầu chủ «[Mẫu] Đầu chủ 1/2» đủ, không có câu «bộ nhóm» hay banner lỗi. Khớp. E2b-step5.png (ca3, /today truong-nhom): 12 việc, 8 hàng «Lead quá hạn», cột Hành động có nút «Giao lại» bấm được; không có câu lỗi. Khớp. E2b-step6.png (ca4, /today dau-chu): 18 việc, nhóm Lead mới (nút Nhận) và Thiếu thông tin (nút Mở hồ sơ), không có câu lỗi. Khớp. E2b-step7.png (đối chứng dương): banner đỏ «Không tải được lead quá hạn / Bảng theo đầu chủ vẫn đọc từ máy / Thử lại», hai ô Lead quá hạn và Ngoại lệ hiện «—», bảng vẫn có dữ liệu. Khớp: lỗi thật vẫn hiện sau độ trễ.
  network_observed: clean

- eval: E3
  run_id: minted-hom-nay-chiu-loi-tung-phan-E3-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:15:34Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3b
  run_id: minted-hom-nay-chiu-loi-tung-phan-E3b-r1
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T10:15:34Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/E3b-step1.png
  observed: |
    Đã mở E3b-step1.png, E3b-step3.png, E3b-step5.png bằng Read; E3b-step2.png và E3b-step4.png chỉ khẳng định qua đọc DOM. E3b-step1.png (listing-agents lỗi): banner hồng "Chưa tải được danh sách đầu chủ" kèm "Các nhóm còn lại vẫn đúng." và một nút "Thử lại"; bảng Hôm nay 14 việc, các nút "Giao lại" xám (tắt). E3b-step3.png (cả hai lỗi): một banner "Chưa tải được lead quá hạn" với một "Thử lại", không bảng. E3b-step5.png (sau sự kiện online, không bấm): hết banner, bảng trở lại, nút "Giao lại" đậm và bấm được. Khớp Expected. Ca đỏ trên 5d55d0cc không chạy.
  network_observed: n-a (driver)

- eval: E4
  run_id: minted-hom-nay-chiu-loi-tung-phan-E4-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:15:34Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4b
  run_id: minted-hom-nay-chiu-loi-tung-phan-E4b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T10:52:35Z
  screenshot: evidence/E4b-step2.png
  observed: |
    step2 (ca 1, 1440): khối hồng phía trên «Không tải được tên đầu chủ / Số căn trong bảng vẫn đúng.» với nút «Thử lại» ở góc phải cùng hàng. Ba thẻ số: 8, 5, 0. Bảng Theo đầu chủ hai dòng, ô tròn «—», tên «Chưa rõ tên». Không thấy chuỗi hex. step3 (ca 2): khối hồng «Không tải được lead quá hạn / Bảng theo đầu chủ vẫn đọc từ máy.» và «Thử lại». Hai thẻ đầu là «—», thẻ Hàng cũ là 0. Bảng có ô tròn «1», «2» và tên «[Mẫu] Đầu chủ 1/2». step4 (ca 3): khối hồng «Không tải được lead quá hạn…» với «Thử lại»; thẻ «—», «—», 0; bảng «Chưa rõ tên» với ô tròn «—». step5 (sau Thử lại): hết khối lỗi, thẻ 8, 5, 0, bảng tên thật «[Mẫu] Đầu chủ 1/2» và ô tròn 1, 2. step6 (ca 1, 375): màn điện thoại chỉ có thông báo «Bảng điều khiển không có trên điện thoại / Mở trên máy tính để xem đội.», không thấy alert hay nút Thử lại, không tràn ngang, thanh dưới bình thường. Khớp Expected ở ca 1 đến 4 và ở 1440; phần 375 không có khối alert để đo.
  network_observed: clean

- eval: E5
  run_id: minted-hom-nay-chiu-loi-tung-phan-E5-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:15:34Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5b
  run_id: E5b-20261109
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T10:52:35Z
  screenshot: evidence/E5b-step1.png
  observed: |
    E5b-step1.png: the Đội > Tổng quan page, offline. A shell banner reads "Đang xem bản đã tải — mất mạng". Below it is the team banner "Đang mất mạng / Máy sẽ tự đọc lại khi có mạng.". The Lead quá hạn card shows "—" with the badge "Chờ có mạng", and Ngoại lệ shows "—". Hàng cũ shows 0 and the table shows 2 rows of "Chưa rõ tên". There is no "giao lại" text. Matches expected.
    E5b-step2.png: the same page after the online event. Both offline banners are gone. Lead quá hạn shows 8 (badge "Giao lại"), Ngoại lệ shows 6, and the table shows "[Mẫu] Đầu chủ 1" and "[Mẫu] Đầu chủ 2". There is no "Đang mất mạng", and the page did not reload. Matches expected.
    E5b-step3a.png: online with the team API cut. One red alert card reads "Không tải được lead quá hạn / Bảng theo đầu chủ vẫn đọc từ máy." with a single "Thử lại" button. Lead quá hạn and Ngoại lệ show "—". There is no "Đang mất mạng". Matches expected.
    E5b-step3b.png: after unblocking and clicking "Thử lại". The alert is gone, Lead quá hạn shows 8, Ngoại lệ shows 6, and the table shows the named agents. Matches expected.
  network_observed: clean

- eval: E6
  run_id: minted-hom-nay-chiu-loi-tung-phan-E6-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:15:34Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6b
  run_id: minted-hom-nay-chiu-loi-tung-phan-E6b-r1
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T10:15:34Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/E6b-step2.png
  observed: |
    Frame E6b-step2.png (truong-nhom, lead-queue 500): cột thứ hai có «Tất cả việc», «Lead quá hạn», «Chưa chia được», KHÔNG có số nào cạnh «Tất cả việc»; thân trang có thẻ lỗi «Chưa tải được lead quá hạn — Các nhóm còn lại vẫn đúng» + nút «Thử lại», không ghi 0. Khớp Expected ca 1. Frame E6b-step3.png (dau-chu, leads/assigned 500): «Tất cả việc 15», «Lead mới» KHÔNG có số, các nhóm khác có số; thẻ lỗi «Chưa tải được lead giao cho bạn», bảng vẫn liệt kê 15 căn thiếu thông tin. Khớp Expected ca 2. Frame E6b-step4.png (truong-nhom, không lỗi, đối chứng): «Tất cả việc 15», «Lead quá hạn 7», «Chưa chia được 8», không thẻ lỗi. Khớp Expected ca 3.
  network_observed: app-fail

- eval: E7
  run_id: minted-hom-nay-chiu-loi-tung-phan-E7-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:15:34Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7b
  run_id: E7b-20261109
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T10:15:34Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/E7b-step1.png
  observed: |
    Frame step1: vai truong-nhom, 1440, mất mạng. Thân màn có đúng một thẻ «Chưa đọc được việc của bạn» kèm «Máy sẽ tự đọc lại khi có mạng.»; có banner «Đang xem bản đã tải — mất mạng» và thẻ bật thông báo. Không có «không còn việc», không bảng. Cột trái «Tất cả việc / Lead quá hạn / Chưa chia được» không có số. Khớp Expected. Frame step2: sau bỏ chặn và phát online, banner mất mạng và câu lỗi biến mất; tiêu đề «16 việc · 7 quá hạn», cột hiện 16/7/9, bảng có nhóm Lead quá hạn 7 và Chưa chia được 9, mỗi dòng có nút «Giao lại». Khớp Expected.
  network_observed: clean

- eval: E8
  run_id: minted-hom-nay-chiu-loi-tung-phan-E8-r1
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T10:15:34Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/E8-step1.png
  observed: |
    E8-step1.png (1440, truong-nhom, assign bị chặn): hàng đầu "Toà A · A-05.06" vẫn ở bảng Lead quá hạn (7), nút Giao lại còn, ngay dưới nút có câu đỏ "Chưa giao được — thử lại." nằm trong dòng; 17 nút Giao lại, không dòng nào rời. E8-step2.png (bỏ chặn, giao lại đúng dòng đó): câu hết, dòng A-05.06 rời hàng đợi, 17 -> 16 việc, quá hạn 7 -> 6. E8-step3.png (375, ngăn đáy, assign lỗi): thẻ đầu "Toà A · chỉ biết toà" còn, câu đỏ "Chưa giao được — thử lại." nằm trong thẻ dưới dòng quá hạn. Khớp Expected. Ca đỏ trên 5d55d0cc không chạy.
  network_observed: clean

- eval: E9
  run_id: minted-hom-nay-chiu-loi-tung-phan-E9-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:15:34Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9b
  run_id: minted-hom-nay-chiu-loi-tung-phan-E9b-r1
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T10:15:34Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/E9b-step1.png
  observed: |
    step1.png: trang Đã gửi / Tin của khách; banner mất mạng của vỏ; ngay dưới khối lỗi hồng «Chưa tải được — thử lại» có đúng một nút «Thử lại»; không khung chờ. step2.png: sau khi bỏ chặn và bấm Thử lại: không còn khối lỗi, dòng thời gian «HÔM NAY 23», thẻ Căn mới Toà A · A-08.03, các thẻ Vừa đổi A-10.05. step4.png: (lỗi hai lần rồi thật, không bấm) cùng danh sách tin, không khối lỗi, không khung chờ. step5a.png: khối lỗi có một nút Thử lại, không skeleton. step5b.png: sau sự kiện online không bấm gì, khối lỗi biến mất, danh sách tin hiện lại. Khớp Expected.
  network_observed: clean

- eval: E10
  judged_by: judge panel (fresh context, ba lăng kính)
  verdict: PASS
  judges:
    - domain-correctness: PASS — (1) trang-thai.tsx xuất BaoLoiVung dựng trên TrangThai kind="error", nhận onThuLai và tự dựng đúng một nút «Thử lại». (2) Cả bốn màn dùng BaoLoiVung cho lỗi đọc. Các TrangThai còn lại trong bốn màn chỉ là notice hoặc empty, không có kind=error kèm nút tự ghép. (3) hom-nay.tsx đọc đầu chủ của sàn và bộ nhóm qua docKetQuaCoThuLai/docCoThuLai. dashboard.tsx đọc cả hai nguồn qua docKetQuaCoThuLai, gọi useKhiCoMangLai(docLai), và matMang lấy từ useNgoaiTuyen (theo trình duyệt) nên không còn cờ lấy từ lời gọi. (4) vung.tsx đọc qua docTinDauKhach, lead-da-nhap.tsx đọc lại bằng useKhiCoMangLai khi leads === null.
    - operational-feasibility: PASS — (1) trang-thai.tsx xuất BaoLoiVung dựng trên TrangThai kind="error", nhận onThuLai và tự dựng đúng một Button «Thử lại». (2) hom-nay, dashboard, dong-tin và lead-da-nhap đều báo lỗi đọc bằng BaoLoiVung. TrangThai trong bốn tệp đó chỉ còn dùng kind notice hoặc empty. (3) hom-nay đọc đầu chủ và bộ nhóm qua docCoThuLai/docKetQuaCoThuLai. dashboard đọc cả hai nguồn qua docKetQuaCoThuLai trong docCaHai và gọi useKhiCoMangLai(docLai). Cờ mất mạng của dashboard lấy từ useNgoaiTuyen (trình duyệt), không lấy từ lời gọi. (4) vung.tsx đọc qua docTinDauKhach và đọc lại khi có mạng trở lại lúc đang lỗi. lead-da-nhap.tsx cũng đọc lại khi có mạng trở lại lúc leads===null.
    - spec-alignment: PASS — Cả bốn ý đều khớp với mã trong các tệp được giao. (1) `BaoLoiVung` dựng trên `TrangThai kind="error"`, nhận `onThuLai` và tự dựng đúng một nút «Thử lại». (2) Bốn màn báo lỗi đọc bằng `BaoLoiVung`. Ở các màn đó `TrangThai` chỉ còn dùng cho `notice` và `empty`, không còn `kind="error"` kèm nút tự ghép. (3) `hom-nay.tsx` đọc bộ nhóm, lead và danh sách đầu chủ qua `docCoThuLai` / `docKetQuaCoThuLai`. `dashboard.tsx` đọc cả hai nguồn qua `docKetQuaCoThuLai` trong `docCaHai` và đọc lại bằng `useKhiCoMangLai(docLai)`. Cờ mất mạng của `dashboard.tsx` lấy từ `useNgoaiTuyen()`, theo trình duyệt, không suy từ lời gọi thất bại. (4) `vung.tsx` đọc qua `docTinDauKhach`, và `lead-da-nhap.tsx` đọc lại khi mạng trở lại bằng `useKhiCoMangLai`.
  verified_at: 2026-11-09T10:52:35Z
  human_override:  # chi nguoi ghi

- eval: E10b
  run_id: minted-hom-nay-chiu-loi-tung-phan-E10b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-09T10:52:35Z
  output: |
    18 tệp giao diện ngoài bản đồ

- eval: E10c
  run_id: minted-hom-nay-chiu-loi-tung-phan-E10c-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.design.floor
  verified_at: 2026-11-09T10:52:35Z
  output: |
    (không in dòng nào)

- eval: E10d
  run_id: E10d-20261109
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T10:52:35Z
  screenshot: evidence/E10d-step1.png
  observed: |
    step1 (1440, du-vai): trang Hôm nay 37 việc, hai khối nền hồng xếp dọc, "Chưa tải được lead quá hạn" và "Chưa tải được lead giao cho bạn", mỗi khối có phụ đề "Các nhóm còn lại vẫn đúng." và một nút "Thử lại" bên phải; bảng "Thiếu thông tin 15" và thanh nhóm bên trái (Lead bị trả lại 7, Khách phản ứng 7...) vẫn hiện; không có chữ "không có việc". step2 (dau-chu, nhóm Lead mới): một khối hồng "Chưa tải được lead giao cho bạn" + một "Thử lại", bảng Thiếu thông tin 15 vẫn hiện, không câu "không có việc". step3 (telesales /leads/mine lỗi): tiêu đề Lead đã nhập, một khối hồng "Không tải được lead đã nhập / Mạng hay máy chủ không trả lời. Lead đã gửi vẫn còn nguyên." với đúng một "Thử lại", không bảng. step4 (sau online): bảng Lead đã nhập có các hàng (Toà Z chờ chia, Toà A A-13.04 Trả lại...), không khối lỗi, không "Thử lại". step5 (375, du-vai): hai khối lỗi hồng xếp dọc, mỗi khối nút "Thử lại" dưới câu, bảng Thiếu thông tin bên dưới, không cuộn ngang (scrollWidth 375 = clientWidth 375). Tất cả khớp Expected.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-hom-nay-chiu-loi-tung-phan-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-09T10:52:35Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-hom-nay-chiu-loi-tung-phan-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-09T10:52:35Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-hom-nay-chiu-loi-tung-phan-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-09T10:52:35Z

- cmd: npm run test:hooks
  run_id: minted-hom-nay-chiu-loi-tung-phan-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-09T10:52:35Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-hom-nay-chiu-loi-tung-phan-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-09T10:52:35Z

- cmd: npm run typecheck
  run_id: minted-hom-nay-chiu-loi-tung-phan-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-09T10:52:35Z

- cmd: npm run lint
  run_id: minted-hom-nay-chiu-loi-tung-phan-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-09T10:52:35Z

## Known limits

## Ngoài hợp đồng

## Variance

none — mọi eval nhiều lượt đều đồng đều (không eval nào có runs lớn hơn 1).

## Iterations

Round 1: E10d không đạt và có một phát hiện trong hợp đồng ở AC-5 (Đội không đọc lại khi có mạng nếu màn đang có số) — sửa ở commit 3cb2bd63 (`useKhiCoMangLai(docLai)`) và thêm bước vào E10d. Trả về triển khai.
Round 2: E2b, E4b, E5b, E10b, E10c, E10d và các lệnh suite chạy lại trên c3a87587 và đạt; các eval còn lại mang sang từ round 1 vì delta không chạm paths của chúng. Phán quyết PASS.

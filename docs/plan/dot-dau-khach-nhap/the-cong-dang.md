# Thẻ Cổng Đáng — 22 hàng đợt dau-khach-nhap

**Đã quyết** — Manh Phan, 02/11, nguyên văn: «Tôi đồng ý build tất cả» (22 hàng). Đã chép vào ô cơ hội từng hàng
(`decision: build`, `stage: decided`): mười lăm ô ở PR này, bảy ô (31, 64–67, 88, 89) trên nhánh PR #61.

**Hai hàng thêm 02/11 sau PR #88 — đã quyết** — Manh Phan, 02/11, nguyên văn: «Build cả hai» (92, 93), bảng cuối thẻ.

**Hai hàng vá máy chủ thêm 03/11 — đã quyết** — Manh Phan, nguyên văn: «hai lỗi máy chủ: mở hai hàng vá ở đợt kế»
(giám sát đợt `dau-chu-dong-vao` ghi 2026-11-02T21:21Z, tức sáng 03/11 giờ Việt Nam), bảng cuối thẻ.

**Hàng vá thứ ba thêm 03/11 — đã quyết** — Manh Phan, nguyên văn: «tiêu đề Căn call: mở hàng vá ở đợt kế» (ghi
2026-11-02T21:27Z), cùng bảng cuối thẻ.

Mở 02/11. Một lần ngồi, 22 quyết định: mỗi hàng có đáng dựng không. Cột «Quyết» chép đúng chữ người gõ — máy không tự
điền. Mỗi hàng nhận một trong bốn chữ: `build` (dựng) · `iterate` (làm lại ý trước khi dựng) · `park` (gác, chưa làm) ·
`kill` (bỏ).

Bảy hàng — 31, 64, 65, 66, 67, 88, 89 — có ô ở PR #61 (nháp, đang chờ cùng chữ này). Thẻ gom chúng vào đây để quyết một
lần; máy chép chữ vào ô của chúng trên nhánh PR #61, mười lăm ô còn lại ở PR này. Hai PR gộp trước khi mở đợt (lý do ở
`README.md`).

Hàng T3 (31, 65, 66, 82, 86, 89) vẫn cần chữ ký riêng ở Cổng Phạm vi và Cổng Bằng chứng về sau; hàng T2 cần chữ ký ở hai
cổng ấy như mọi hàng. Giờ máy là dự báo của kit (`du-bao.json` từng ô). Chưa có ngày đích: hai tuần thử chưa có ngày.

Hàng không `build` thì không vào đợt, và hàng đứng sau nó cũng không chạy được (cột «Đứng trên»). Gói không cần sửa sau
khi quyết: bộ phát lịch chỉ giao hàng có ô `build`.

## Khuyến nghị: dựng cả 22

Căn cứ đã kiểm 02/11:

- **Mọi hàng các hàng này đứng trên mà nằm ngoài đợt đều đã ký** trên `main` — 3, 5, 7, 8, 9, 11, 12, 13, 14, 15, 16,
  17, 18, 22, 23, 25, 26, 27, 53, 85 đều `signed-off`. Không hàng nào chờ 28, 29, 30 của đợt đang chạy.
- **Đây là phần bản đầu còn thiếu để chạy hai tuần thử.** Sau đợt dau-chu-dong-vao, các màn P0 chưa có của §10 là nửa
  đầu khách (bảng thẻ, hồ sơ điện thoại, Gửi, trang khách, Đã gửi, Hôm nay đầu khách) và Nhập Excel; số đo của §11 chưa
  đọc được từ đâu. Đợt này phủ đủ ba phần ấy (31–38, 64–65, 52). Gác một hàng là gác chuỗi sau nó: gác 86 hay 31 thì cả
  Gửi → trang khách → Đã gửi → Hôm nay đầu khách dừng; gác 64 thì cả nhập dừng.
- **Bảy hàng ở PR #61 là chữ của chính chủ kho** (88, 89 từ các cổng hàng 16) hay đã cắt ở bản phạm vi nhập chủ kho duyệt
  31/10 («Duyệt, cắt lượt»).
- **Phần không phải P0 không kéo dài đợt**: 81, 82 (nền Cài đặt sàn) và bốn hàng P1 (39, 42, 43, 51) nằm ngoài đường găng,
  lấp chỗ trống của dãy; mô phỏng của kit cho năm dãy xong trong năm lượt, bằng đường găng 86 → 34 → 35 → 36 → 37.
  Gác chúng thì đợt không ngắn đi — chỉ bớt giờ máy (mỗi hàng T2 0,99–6,53 giờ, 82 là T3 2,02–8,85 giờ).

| # | Người dùng được gì | Đứng trên | Dãy | Hạng · giờ máy | Khuyến nghị — căn cứ | Quyết |
|---|---|---|---|---|---|---|
| 31 | Mọi cửa ra lấy dữ liệu từ một bộ luật ẩn ở lõi, và bộ kiểm rò rỉ chứng không trường nội bộ nào có trong trang khách, kể cả trong mã nguồn trang;… | 11, 18, 85 | H | T3 · 3,84–10,43 h | `build` — bất biến 4, kiểm bắt buộc trước phát hành; 34, 35, 36, 43 đứng trên; T3 — mọi cửa ra (ô ở PR #61) | `build` |
| 32 | Đầu khách mở Bảng hàng trên điện thoại, lọc theo nhu cầu khách thành thẻ, giữ lâu một thẻ để chọn nhiều căn | 13, 23, 53 | B | T2 · 0,99–6,53 h | `build` — P0 (M4, §10); 33 và 34 đứng trên; đường găng | `build` |
| 33 | Đầu khách mở hồ sơ căn trên điện thoại và thấy giá, ảnh gửi được, lần xác nhận gần nhất; phần chủ nhà thay bằng «Liên hệ đầu chủ» | 17, 32 | B | T2 · 0,99–6,53 h | `build` — P0 (M3, §10); 40, 41 của đợt sau đứng trên | `build` |
| 34 | Đầu khách chọn căn, xem trước đúng trang khách sẽ thấy, rồi mở bảng chia sẻ của điện thoại với link, ảnh và tin soạn sẵn; người tự bấm gửi trong Zalo | 3, 31, 32, 86 | L | T2 · 0,99–6,53 h | `build` — P0 (G1–G3, §10); đường găng; giữ bất biến 3 (chỉ mở bảng chia sẻ) | `build` |
| 35 | Khách mở link từ Zalo và thấy bộ căn mang tên sàn, giá sống kèm «giá xác nhận X ngày trước», căn đã cọc tự mờ, chạm «Quan tâm» được | 34 | L | T2 · 0,99–6,53 h | `build` — P0 (T1–T3, §10); link sống là lõi của khối «phát»; đường găng | `build` |
| 36 | Đầu khách mở Đã gửi và thấy từng link: lượt khách mở, căn được quan tâm, căn vừa đổi kèm «Gợi ý căn thay»; tắt được link | 35 | L | T2 · 0,99–6,53 h | `build` — P0 (G4, §10); «số link khách mở, số lượt quan tâm» của §11 đọc ở đây | `build` |
| 37 | Đầu khách mở Hôm nay trên điện thoại và thấy khách vừa phản ứng, căn đã gửi vừa đổi, căn mới lên bảng khớp các bộ đã gửi | 36 | L | T2 · 0,99–6,53 h | `build` — P0 (M6, §10); cuối đường găng | `build` |
| 38 | Người dùng điện thoại cài Quỹ hàng lên màn hình chính, bật thông báo; đăng xuất hay báo mất máy thì dữ liệu trên máy bị xoá sạch | 13, 26, 53 | H | T2 · 0,99–6,53 h | `build` — luật 32; cài lên màn hình chính và xoá sạch khi đăng xuất là điều kiện cho mọi màn điện thoại; 39 đứng trên | `build` |
| 39 | Đầu chủ mở Hôm nay trên điện thoại, gọi lại một chạm và ghi kết quả bằng một tay | 22, 38 | H | T2 · 0,99–6,53 h | `build` — P1 (M1); lấp chỗ dãy H; số đo thao tác theo thiết bị | `build` |
| 42 | Trưởng nhóm mở Hôm nay và thấy lead quá hạn để chia lại, hàng cũ theo từng đầu chủ, và ngoại lệ máy không tự quyết được | 22, 25 | D | T2 · 0,99–6,53 h | `build` — P1 (TN1); lấp chỗ dãy D; lead quá hạn đã báo trưởng nhóm từ hàng 25 mà chưa có màn chia lại | `build` |
| 43 | Đầu chủ phát góc nhìn đang lọc ra ảnh, PDF hay Excel theo mẫu, kèm bài chép theo kênh; không cột nội bộ nào ra ngoài | 14, 31 | H | T2 · 0,99–6,53 h | `build` — P1 (D) nhưng «số lần phát bảng hàng» của §11 chỉ đo được khi có nó | `build` |
| 51 | Telesales nhập lead trên điện thoại: thiếu một mục thì chưa gửi được, gửi xong theo dõi được bốn nấc | 27 | D | T2 · 0,99–6,53 h | `build` — P1 (L4, L5); lấp chỗ dãy D | `build` |
| 52 | Số đo của hai tuần thử đọc được từ sự kiện của sàn thử: tỉ lệ xác nhận, mức đủ, mã tự điền, lead đến cuộc gọi đầu, lần phát, lượt mở, thao tác theo… | 8, 13 | D | T2 · 0,99–6,53 h | `build` — không có nó thì hai tuần thử không đọc được số nào; rẻ (T2), không phụ thuộc trong đợt | `build` |
| 64 | Lõi đọc một bảng hàng bẩn và nói được từng cột là gì, từng ô ra giá trị chuẩn nào hay vì sao không đọc được — không cần AI — trên bộ file thử có… | 5, 9 | G | T2 · 0,99–6,52 h | `build` — nền của nhập (ND1); số nền không AI quyết Cổng Đáng của 68, 69, 71 (ô ở PR #61) | `build` |
| 65 | Đầu chủ thả file bảng hàng cũ, thấy từng ô sẽ ghi gì — giữ nguyên, máy sửa, cần người, chặn — sửa rồi bấm ghi; căn đã có hàng mở thành tin bổ sung,… | 64, 5, 8, 9, 11, 12, 15, 85 | G | T3 · 3,84–10,43 h | `build` — P0 (N1, N2); T3 — ghi qua lệnh lõi, chủ nhà vào lớp nguồn (ô ở PR #61) | `build` |
| 66 | Đầu chủ hoàn tác cả một lần nhập; căn đã có người sửa sau đó được liệt kê, không bị gỡ | 65 | G | T3 · 3,84–10,43 h | `build` — nhập thật mà không hoàn tác được thì một file sai làm bẩn cả bảng; T3 (ô ở PR #61) | `build` |
| 67 | Đầu chủ nhập lại file cùng mẫu và thấy máy ghép sẵn như lần trước, kể cả cách gọi riêng của sàn | 65, 5 | G | T2 · 0,99–6,52 h | `build` — đội nhập lại cùng mẫu mỗi tuần; rẻ (T2) (ô ở PR #61) | `build` |
| 81 | Mọi điểm sàn chỉnh được khai ở một sổ của lõi — khoá, kiểu, mặc định, khoảng cho phép, ai đổi, áp cho mới hay tính lại, lớp dữ liệu — và luật của… | 8 | D | T2 · 0,99–6,53 h | `build` — ADR-0018 đã chốt 01/11; mặc định giữ đúng số cũ; 82 đứng trên; ngoài đường găng | `build` |
| 82 | Mỗi sàn giữ cấu hình riêng: đổi một điểm qua một lệnh API thành sự kiện chỉ thêm ghi người và vai, sàn chưa đổi thì nhận mặc định của sổ, đối tượng… | 81, 7, 25 | D | T3 · 2,02–8,85 h | `build` — mở đường cho Cài đặt sàn (45–49) và chuẩn hoá (70) ở đợt sau; T3; ngoài đường găng | `build` |
| 86 | Đầu khách lưu khách là một liên hệ loại Người mua hoặc Người thuê, gắn nhu cầu, Lần gửi và lịch xem vào liên hệ ấy; một khách hai số vẫn là một… | 85 | L | T3 · 2,02–8,85 h | `build` — 34 đứng trên (Lần gửi gắn vào khách); đầu đường găng; T3 — liên hệ, lớp nguồn | `build` |
| 88 | Đầu chủ hoàn tác một lần sửa hay một lô mà máy không ghi được: thông báo nói đúng căn nào chưa trả về và vì sao, lần hoàn tác chưa xong vẫn bấm lại… | 16 | B | T2 · 0,99–6,52 h | `build` — chữ của chủ kho ở Cổng Bằng chứng hàng 16 («mở hợp đồng mới») (ô ở PR #61) | `build` |
| 89 | Trưởng nhóm tích nhiều căn trên Bảng hàng rồi đổi đầu chủ một lần: chọn từ danh sách thành viên mang vai Đầu chủ của sàn, hộp hỏi kể đủ căn và… | 16, 85 | B | T3 · 3,84–10,43 h | `build` — chủ kho duyệt tách ở Cổng Phạm vi hàng 16 (Hỏi-1); T3 — đổi người giữ liên hệ chủ nhà (ô ở PR #61) | `build` |

Thứ tự trong bảng là thứ tự số hàng; thứ tự ưu tiên khi các dãy tranh lượt chấm ở `README.md` (đường găng trước).

Ngoài thẻ, không vào đợt: Cài đặt sàn 45–50, nhập có AI và chuẩn hoá 68–71, mọi loại hình 73–80, P1 còn lại 40, 41, 44
(lý do ở `README.md`).

## Trả lời

Một dòng, chép rồi thay `___`:

```text
31 ___ · 32 ___ · 33 ___ · 34 ___ · 35 ___ · 36 ___ · 37 ___ · 38 ___ · 39 ___ · 42 ___ · 43 ___ · 51 ___ · 52 ___ · 64 ___ · 65 ___ · 66 ___ · 67 ___ · 81 ___ · 82 ___ · 86 ___ · 88 ___ · 89 ___
```

Mọi hàng cùng một chữ thì viết gọn được: `tất cả ___`, kèm hàng khác chữ nếu có (ví dụ `tất cả ___ · 51 ___`).

Máy chép đúng chữ người gõ vào ô cơ hội của từng hàng (`decision`, `decided_by`, `decided_at`, `stage: decided`), như đã
làm với ba đợt trước.

## Hai hàng thêm 02/11 — đã quyết `build`

Sau PR #88 (chủ kho chọn lại khối đích bằng khoá ReUI Pro), hai màn đã ký phải làm lại theo khối mới. Hai ô ở PR này
(`_acceptance/lam-lai-hom-nay-dau-chu/`, `_acceptance/dang-nhap-auth-15/`), đã chép quyết (`decision: build`, `stage: decided`).

| # | Người dùng được gì | Đứng trên | Dãy | Hạng · giờ máy | Khuyến nghị — căn cứ | Quyết |
|---|---|---|---|---|---|---|
| 92 | Đầu chủ đọc mỗi việc của Hôm nay trên một dòng — tên căn, «Vì sao hôm nay» hai tầng với hạn tô màu, giá — và làm việc đầu của nhóm bằng đúng một nút; việc còn lại trong ⋯ | 22, 91 | H | T2 · 0,99–6,53 h | `build` — chủ kho chọn 14A sau khi chỉ ra nút rối và lý do khó đọc; màn đầu chủ mở mỗi ngày trong hai tuần thử; 39 dựng trên khuôn của nó; lấp lượt 2 của dãy H, không kéo dài đợt | `build` |
| 93 | Người trong sàn đăng nhập trên thẻ theo `auth-15`: chỉ mã một lần qua email, không nút Google, Apple, GitHub; chọn sàn và chưa gắn sàn cùng khuôn | 6, 91 | B | T2 · 0,99–6,53 h | `build` — màn đăng nhập đang là bản ghép tạm, dòng «Chỗ hở» quá hạn từ 30/10; chủ kho chọn `auth-15` 02/11; chỉ đổi giao diện, lấp lượt 5 của dãy B | `build` |

## Ba hàng vá thêm 03/11 — đã quyết `build`

Dãy D báo khi làm hàng 28 (đợt `dau-chu-dong-vao`, 02/11): hai lỗi ở máy chủ và tiêu đề «Căn call» của màn ghi cuộc
gọi, ngoài hợp đồng của 28. Chủ kho chọn mở ba hàng vá ở đợt này. Ba ô ở PR này (`_acceptance/va-moc-goi-dau-lead-tra-lai/`,
`_acceptance/va-doi-gia-can-da-ban/`, `_acceptance/va-tieu-de-goi/`), đã chép quyết (`decision: build`, `stage:
decided`). Hàng vá lấy slug làm mã.

| # | Người dùng được gì | Đứng trên | Dãy | Hạng · giờ máy | Khuyến nghị — căn cứ | Quyết |
|---|---|---|---|---|---|---|
| `va-moc-goi-dau-lead-tra-lai` | Lead đã trả lại không còn nhận mốc gọi đầu của người giữ cũ — luật chia và hạn của trưởng nhóm đọc đúng người đang giữ | 25, 27 | D | T3 · 1,2–8,85 h | `build` — lỗi ghi sai dữ liệu ở máy chủ, giao diện không chặn được; một hàm cơ sở dữ liệu thay bằng migration mới; lượt 3 của dãy D | `build` |
| `va-doi-gia-can-da-ban` | Căn Đã bán không đổi giá được nữa, kể cả từ máy có bản cũ; lệnh bị từ chối hiện ở «Cần xem» với lý do rõ | 8, 13 | G | T2 · 0,99–6,53 h | `build` — luật trạng thái của hàng 8 chỉ chặn ở ô, máy chủ vẫn nhận; vá ở lõi; lượt 3 của dãy G | `build` |
| `va-tieu-de-goi` | Trên điện thoại, đầu trang màn ghi cuộc gọi đọc «Ghi cuộc gọi», không còn «Căn call»; trang một căn vẫn hiện mã căn | 28, 29 | B | T2 · 0,99–6,53 h | `build` — chữ sai ở đầu màn đầu chủ dùng mỗi ngày; một hàm ở vỏ cộng bài kiểm; lượt 3 của dãy B | `build` |

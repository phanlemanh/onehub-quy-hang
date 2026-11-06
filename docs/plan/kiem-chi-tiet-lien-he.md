# Kiểm màn chi tiết liên hệ — 06/11/2026

Chủ kho báo hồ sơ một liên hệ (nhà Liên hệ) lỗi giao diện và hỏi màn này có dùng lại khuôn của hồ sơ căn không. Bản này
chỉ đọc và chụp: bản thật `quyhang.onehub.center`, sàn «[Mẫu] Sàn thử», trình duyệt ego lite, ở 1440 và 375, sáng và tối.
Mã đọc ở `main` @ `1d682ade`.

## Trả lời ngắn

**Chậm** chủ yếu do chuỗi chờ phía trình duyệt, không do máy chủ: bảng chỉ được hỏi sau khi màn dựng xong và chờ thêm 0,25
giây; trên máy và mạng chậm bảng hiện sau khoảng 4,4 giây (mục «Tốc độ tải»).

**Dùng lại một nửa.** Màn Liên hệ đi chung hệ bố cục với Bảng hàng (bố cục «Danh sách – chi tiết», cột kéo chia 38 %) và
dùng chung các mảnh ruột hồ sơ (đầu hồ sơ, mục có tiêu đề in hoa, cặp nhãn – giá trị). Nhưng nó **bỏ cái khung** mà hồ sơ
căn có: hồ sơ căn nằm trong một khung có viền, cuộn riêng, có nút «Mở toàn màn» và «Đóng»; hồ sơ liên hệ đặt ruột trần
thẳng vào cột. Phần lớn lỗi nhìn thấy đến từ chỗ thiếu khung này và từ bảng bên trái chưa được chỉnh cho khi cột mở.

## Ảnh

| Ảnh | Nói gì |
| --- | --- |
| [Hồ sơ liên hệ, 1440 sáng](kiem-chi-tiet-lien-he/1-ho-so-1440-sang.png) · [tối](kiem-chi-tiet-lien-he/1-ho-so-1440-toi.png) | Cột hồ sơ không viền, không nút đóng; bảng mất hai cột Cơ hội mở, Căn |
| [Hồ sơ căn cạnh Bảng hàng, 1440 sáng](kiem-chi-tiet-lien-he/6-so-sanh-ho-so-can-1440-sang.png) | Khuôn đúng để so: khung có viền, nút mở toàn màn và đóng, thân cuộn riêng |
| [Danh sách, 1440 sáng](kiem-chi-tiet-lien-he/0-danh-sach-1440-sang.png) | Khi chưa mở hồ sơ: đủ năm cột |
| [Cuộn bảng, 1440 sáng](kiem-chi-tiet-lien-he/2-cuon-bang-1440-sang.png) | Cuộn xuống thì tiêu đề khung, ô tìm và hàng tên cột trôi mất |
| [Hồ sơ lead, 1440 sáng](kiem-chi-tiet-lien-he/5-ho-so-lead-1440-sang.png) | Danh sách ngắn: thanh cuộn ngang mới lộ ở đáy bảng |
| [Danh sách, 375 sáng](kiem-chi-tiet-lien-he/3-danh-sach-375-sang.png) · [tối](kiem-chi-tiet-lien-he/3-danh-sach-375-toi.png) | Thẻ một cột đọc được; thanh đáy không có nút Liên hệ |
| [Hồ sơ, 375 sáng](kiem-chi-tiet-lien-he/4-ho-so-375-sang.png) · [tối](kiem-chi-tiet-lien-he/4-ho-so-375-toi.png) | Ngăn từ đáy: tên người hiện hai lần liền nhau |

Sáng và tối đều đủ tương phản; không thấy chữ cắt hay tràn ngang cả trang.

## Bảng lỗi

| # | Lỗi nhìn thấy | Khổ | Mức | Do đâu |
| --- | --- | --- | --- | --- |
| 1 | Cột hồ sơ không có khung: không viền, không nền, lệch họ khung với bảng bên trái (bảng có khung, hồ sơ thì không) | 1440 | cao | **Khuôn riêng lệch.** Hồ sơ căn bọc ruột trong khung cột của mình (`KhungHoSoCan cotPhu`); liên hệ đưa ruột trần (`ThanHoSo`) vào cột phụ |
| 2 | Trên máy tính **không có cách đóng hồ sơ**: không nút «Đóng», phím Esc không đóng | 1440 | cao | **Khuôn riêng lệch.** Nút đóng của hồ sơ căn nằm trong đầu hồ sơ của nó; liên hệ không truyền nút vào đầu hồ sơ, và hàm đóng chỉ nối cho ngăn điện thoại |
| 3 | Mở hồ sơ thì bảng mất hai cột Cơ hội mở và Căn; thanh cuộn ngang chỉ hiện ở đáy bảng, danh sách dài thì không thấy | 1440 | cao | **Vá tại chỗ.** Năm cột cộng lại 870 px cố định, phần bảng còn 693 px khi cột 38 % mở |
| 4 | Cuộn bảng thì tiêu đề khung, ô tìm và hàng tên cột trôi đi (Bảng hàng giữ chúng đứng yên, chỉ thân bảng cuộn) | 1440 | trung bình | **Dùng sai cách đặt khối.** Khung bảng cao theo nội dung và cả khung cuộn trong cột; Bảng hàng cho khung cao hết vùng làm việc, lưới cuộn bên trong nên tên cột dính đầu |
| 5 | Dòng đang mở hồ sơ không được tô | 1440 | trung bình | **Vá tại chỗ.** Danh sách nhận người đang chọn nhưng không dùng tới |
| 6 | Loại liên hệ hiện hai lần trên cùng dòng (dưới tên và ở cột Loại) | 1440 | thấp | **Vá tại chỗ.** Cột Loại thừa khi ô tên đã mang loại; bỏ nó cũng gỡ được một phần lỗi 3 |
| 7 | Ngăn hồ sơ trên điện thoại: tên người hiện hai lần (tên ngăn và đầu hồ sơ) | 375 | thấp | **Khuôn riêng lệch.** Hồ sơ căn trên điện thoại có thân riêng (`product-detail-5`); liên hệ đổ nguyên thân cột máy tính vào ngăn có tiêu đề |
| 8 | Dòng thời gian là danh sách chữ trơn, khác dòng thời gian của hồ sơ căn; sự kiện của căn không nói căn nào | cả hai | thấp | **Khuôn riêng lệch + thiếu dữ liệu.** Hồ sơ căn dùng khối dòng thời gian của ReUI; dữ liệu sự kiện chưa mang tên căn |
| 9 | Căn trong hồ sơ không bấm được để mở hồ sơ căn (Cơ hội thì bấm được) | cả hai | thấp | **Vá tại chỗ** |

Trạng thái [đang tải](kiem-chi-tiet-lien-he/7-dang-tai-1440-sang.png) (giả mạng chậm) và [lỗi](kiem-chi-tiet-lien-he/8-loi-1440-sang.png)
(chặn lời gọi hồ sơ ở trình duyệt) của hồ sơ đúng luật của nhóm: khung chờ theo hình hồ sơ, lỗi có «Thử lại». Cả hai cũng
nằm trần trong cột như hồ sơ (lỗi 1). Giữa lượt kiểm, sàn đang mở trên trình duyệt từng bị đổi sang «OneHub» (không phải do
phiên này); đã chuyển về «[Mẫu] Sàn thử» để chụp tiếp.

Ngoài phạm vi, ghi để giám sát xét: thanh đáy điện thoại (Hôm nay · Bảng hàng · Gửi · Tôi) không có lối vào Liên hệ, dù
bản đồ khối ghi «Liên hệ (máy tính, điện thoại đọc)».

## So khuôn

| Câu hỏi | Trả lời |
| --- | --- |
| Có dùng chung hệ bố cục (ADR-0024) không? | **Có.** `KhungLienHe` dựng `BoCuc kieu="danh-sach-chi-tiet"` có `chiTiet`, nên được cột kéo chia `CotKeoChia` (app-shell-11, 38 %, kéo 28–50 %) như Bảng hàng; điện thoại mở ngăn từ đáy `NganNoi` |
| Có dùng chung khung hồ sơ không? | **Không.** Hồ sơ căn: `KhungHoSoCan cotPhu` = một `Frame dense` cao hết cột, thân cuộn riêng (`units/ho-so/khung.tsx`). Liên hệ: `HoSoNguoi` trả `ThanHoSo` trần vào `cotPhu` (`contacts/vung.tsx`, `contacts/ho-so.tsx`). Khối chung còn có sẵn `KhungHoSo cot` ở `components/khoi/solution-crm-4/ho-so.tsx` (trang mẫu sống dùng) mà liên hệ cũng không gọi |
| Có dùng chung ruột `solution-crm-4` không? | **Có, nhưng là bản sao thứ hai.** Liên hệ dùng `DauHoSo`, `MucHoSo`, `CapGiaTri`, `ThanHoSo` của khối chung. Hồ sơ căn **không** dùng khối chung đó — nó có mảnh riêng (`units/ho-so/than-chung.tsx`: `Muc`, `CapGiaTri`) và đầu hồ sơ riêng có nút trong `than-cot.tsx`. Chú thích của khối chung nói «hồ sơ căn, liên hệ, lead dựng từ các mảnh này» — chưa đúng với hồ sơ căn |
| `product-detail-5`? | Chỉ hồ sơ căn trên điện thoại (`units/ho-so/dien-thoai/`). Liên hệ trên điện thoại không có thân riêng |
| Chỗ tự dựng riêng ở liên hệ | Dòng số (che, Hiện số → Gọi), dòng cơ hội có nhãn pha, dòng thời gian chữ trơn (`contacts/ho-so.tsx`); lưới chuyển thể `solution-crm-3` (`contacts/danh-sach.tsx`) với bề rộng cột cố định và khung cao theo nội dung |
| Khối đích đã chốt | `docs/design/vo-va-ia.md` dòng Liên hệ (hàng 103; hàng 85 là lõi và API, không có dòng giao diện): **lối Lai** — lưới `solution-crm-3` + hồ sơ người `solution-crm-4` «theo mảnh hồ sơ căn», bố cục Danh sách – chi tiết. Khuôn nhóm `design/patterns/lien-he.md`, luật KH-lh-danh-sach-chi-tiet: hồ sơ dùng mảnh của solution-crm-4 «trong ngăn cạnh bảng; không Card». Luật **không nói** hồ sơ phải nằm trong một Frame, khác KH-hs-mot-khung của hồ sơ căn |
| Lint `quy-hang-ui` có bắt được không? | **Không.** ESLint trên `contacts/` và khối `solution-crm-4`: 0 lỗi. Bài quét khuôn: `lien-he: 1 tệp theo khuôn · 0 lệch`. Lý do: luật chỉ cấm khối (`Card`), và khe bắt buộc của nhóm chỉ có `children`; không luật nào đòi cột phụ có khung, không luật nào đo bề rộng bảng khi cột mở hay bắt prop nhận mà không dùng |

## Tốc độ tải

Chủ kho báo thêm: tải rất chậm. Đo trên bản thật, cùng sàn, máy Mac, mạng văn phòng, đo bằng đồng hồ trong trang (không
tính độ trễ của công cụ bấm), máy chủ đang ấm.

| Việc | Mạng tốt | 4G chậm + máy chậm 4 lần |
| --- | --- | --- |
| Mở màn Liên hệ (tải cả trang) tới lúc bảng hiện | 1,0 – 1,4 s | **4,3 – 4,4 s** |
| Từ Bảng hàng bấm sang Liên hệ tới lúc bảng hiện | 0,8 – 1,0 s | chưa đo |
| Bấm một người tới lúc hồ sơ hiện | 0,22 – 0,34 s | chưa đo |
| Một lời gọi máy chủ: kiểm sống · đọc phiên · danh sách · hồ sơ | ~0,10 · 0,13–0,16 · 0,17–0,21 · 0,16–0,24 s | — |

**Máy chủ không phải chỗ chậm chính.** Một lần đọc danh sách chỉ hơn lần «kiểm sống» trống khoảng 0,07 giây; máy chủ và cơ sở
dữ liệu cùng ở Singapore. Thời gian nằm ở **chuỗi chờ nối đuôi** trước khi màn chịu hỏi dữ liệu:

1. Trình duyệt tải trang và khoảng 420 KB mã (đã nén) rồi dựng màn. Máy chậm mất khoảng 2,7 s ở bước này.
2. Màn **chờ thêm 0,25 giây** rồi mới hỏi danh sách. Khoảng chờ này để đợi người gõ xong ô tìm, nhưng nó áp cả lúc mới mở
   màn và lúc bấm bộ lọc ở cột thứ hai, khi chẳng ai gõ gì (`contacts/vung.tsx`, hẹn giờ 250 ms ở mọi lần đọc).
3. Lúc đó mới gọi máy chủ (0,17 s ở mạng tốt). Trên máy chậm, lời gọi danh sách bắt đầu ở giây thứ 4.

Trong khi trang **đã chạy ở máy chủ** để đọc phiên người dùng (`contacts/page.tsx`), nó không lấy luôn trang đầu của danh
sách, nên trình duyệt phải đi thêm một vòng sau khi dựng xong. Lần chuyển nhà đầu tiên còn bắn bốn lượt đọc trang trùng nhau.

Ở máy chủ, mỗi lời gọi đi khoảng chín lượt hỏi cơ sở dữ liệu nối tiếp nhau (đọc phiên, chọn sàn, mở giao dịch, đặt vai,
truy vấn, đóng, đọc tên người giữ), trên kho kết nối chỉ **2 chỗ** mỗi phiên bản máy chủ (vá sự cố cạn kết nối 06/11). Một
người dùng ấm thì nhanh; lúc nhiều người cùng mở hay máy chủ vừa nguội thì các lời gọi xếp hàng. **Chưa đo được** trường hợp
này: nhật ký máy chủ trên Vercel không ghi thời gian xử lý. PR #162 (kết nối qua pooler chế độ giao dịch, đang mở) chạm đúng
chỗ này.

**Vá tốc độ, theo thứ tự lợi:**

- Bỏ khoảng chờ 0,25 s khi mở màn và khi đổi bộ lọc; chỉ chờ khi đang gõ ô tìm. Một dòng; được 0,25 s mỗi lần.
- Lấy trang đầu danh sách ngay ở máy chủ, cùng lượt đọc phiên, trao sẵn cho màn. Bảng hiện cùng lúc với trang, bỏ một
  vòng đi về: được khoảng 0,4 s ở mạng tốt, hơn 1 s ở máy chậm.
- Sau đó mới xét gói mã của màn (420 KB) và kho kết nối, khi có số đo lúc đông người.

## Kết luận và đề xuất

**Nên chuyển phần hồ sơ sang khung chung, vá tại chỗ phần bảng.** Không cần dựng lại màn.

- Lỗi 1, 2, 7 cùng một gốc (thiếu khung). Sửa đúng gốc là đưa khung cột của hồ sơ căn lên khối chung `solution-crm-4`
  (`KhungHoSo` thêm kiểu cột kéo chia: một Frame cao hết cột, thân cuộn, đầu hồ sơ nhận nút «Đóng»), để hồ sơ căn và liên
  hệ cùng gọi; ghi luật «một khung» vào `lien-he.md` như KH-hs-mot-khung, và thêm khe cột phụ vào bài quét khuôn để lần sau
  máy bắt được. Vá riêng trong `contacts/` thì nhanh hơn nhưng giữ nguyên hai bản sao đang trôi nhau.
- Lỗi 3–6, 9 vá tại chỗ trong `contacts/danh-sach.tsx`: bỏ cột Loại, cho cột tên co giãn, khung bảng cao hết vùng làm việc
  để tên cột dính đầu như Bảng hàng, tô dòng đang chọn, Esc đóng.
- Lỗi 8: đổi sang khối dòng thời gian như hồ sơ căn; tên căn trong sự kiện cần API trả thêm — tách nếu chạm API.
- Tốc độ: hai vá đầu ở mục «Tốc độ tải» đi cùng hàng vá này (cùng tệp `contacts/vung.tsx`, `contacts/page.tsx`).
- **Độ lớn:** nhỏ – vừa, khoảng một ngày máy (thêm nửa ngày cho phần tốc độ); T2 (giao diện, không chạm cơ sở dữ liệu). Chạm `contacts/` (bốn tệp),
  `components/khoi/solution-crm-4/ho-so.tsx`, `units/ho-so/khung.tsx` (nếu gom khung), `design/patterns/lien-he.md`, bài
  quét khuôn. Đổi khung chung chạm cả hồ sơ căn nên cần chụp lại cặp ảnh hồ sơ căn.
- **Hàng lộ trình chạm vùng này:** không hàng nào đang chạy. Hàng 103 `man-lien-he` đã ký; hàng vá `va-ho-so-lien-he` đã
  gộp (#136, hồ sơ còn ghi máy đã qua, chờ ký). Đợt dau-khach-nhap có hàng 86 `lien-he-khach` (khách của Đầu khách thành
  liên hệ) — chỉ chạm lõi và API, nhưng sẽ đổ thêm Người mua, Người thuê vào màn này; vá trước hàng 86 thì đỡ phải chụp lại.

**Câu giao đề xuất cho hàng vá:** «Hồ sơ liên hệ nằm trong cùng khung cột của hồ sơ căn (một khung có viền, cuộn riêng, có
nút Đóng và Esc), bảng liên hệ giữ đủ cột và tên cột đứng yên khi hồ sơ mở, dòng đang mở được tô, bảng hiện cùng lúc với
trang mà không chờ thêm — và lưới khuôn bắt được khi cột phụ thiếu khung.»

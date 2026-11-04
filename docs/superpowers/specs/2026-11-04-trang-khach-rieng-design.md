# Trang khách (hàng 35) — thiết kế

Ngày: 2026-11-04 · Hạng T3 (migration) · Dãy L · Ô cơ hội: `_acceptance/trang-khach-rieng/opportunity.md` (build, 02/11).

Câu giao: Khách mở link từ Zalo và thấy bộ căn mang tên sàn, giá sống kèm «giá xác nhận X ngày trước», căn đã cọc tự
mờ, chạm «Quan tâm» được.

## Đứng trên gì

- **Hàng 34 (Luồng Gửi, đã gộp)** — một lần bấm Gửi tạo một Lần gửi (`shares`: `code` 12 ký tự, người nhận `client` hay
  `agents`, căn theo `share_listings.position`) và link `<gốc>/s/<mã>`. Thành phần `TrangKhach` (`shares/new/trang-khach.tsx`)
  dựng trang chỉ từ `CanRaNgoai`; chú thích của nó chờ hàng 35 dựng `/s/<mã>` trên cùng thành phần.
- **Hàng 31 (luật ẩn)** — `banRaNgoai` là đường duy nhất dựng dữ liệu ra ngoài; cửa `gui_link`, tiền tố trang `/s/` đã
  đăng ký; rào `timCuaRaThieuKiem` đòi trang dưới `/s/` có bài `*.ro-ri.test.ts`. Nhánh «rào route API công khai» bị thu
  khỏi hàng 31 (H-5) và giao cho hàng này (luật đợt 39). Trạng thái ra: Đang bán có giá; Đang giao dịch (đã cọc) có giá,
  mờ; Tạm ngưng «tạm ngưng» không giá; Đã bán, Ngừng hẳn, Chưa đủ để rao «không còn» không giá.
- **Hàng 52 (số đo hai tuần thử)** — hai số đo `customer_link_opens` («số link khách mở») và `customer_interest` («số lượt
  quan tâm») đang báo «chưa có sự kiện … (trang khách, hàng 35)». Luật đợt 35: hàng này ghi đúng hai sự kiện ấy.
- **Hàng 3 (bài thử Zalo)** — Zalo tự tải trang để lấy ảnh xem trước; lượt ấy không phải khách mở (luật đợt 21).

## Luồng

1. Khách chạm link trong Zalo → trình duyệt trong Zalo mở `/s/<mã>` (không đăng nhập, không vỏ).
2. Máy chủ của trang gọi `GET /api/v1/public/shares/{code}`: API tìm Lần gửi theo mã bằng một hàm nhỏ của cơ sở dữ liệu
   (trả sàn, người gửi, người nhận, link còn bật), rồi đọc các căn **trong phiên của chính người gửi** (luật theo dòng
   vẫn áp) và dựng mỗi căn bằng `banRaNgoai(can, { cua: "gui_link", nguoiNhan, cauHinh, today })`. Trả về chỉ bản ra.
3. Trang hiện: đầu trang «<tên sàn> · <người gửi> gửi», bộ căn theo thứ tự gửi; mỗi căn ảnh bìa, tên căn theo người nhận
   (khách riêng: toà + nấc tầng, không mã), thông số, giá + «giá xác nhận X ngày trước»; căn đã cọc mờ đi kèm nhãn;
   căn tạm ngưng / không còn mờ, không giá. Chạm một căn mở chi tiết (ảnh, thông số đủ của bản ra).
4. Trang tải xong ở trình duyệt → gửi một lượt **mở** (`POST /api/v1/public/shares/{code}/events`, `type: link_opened`) kèm mã
   máy ngẫu nhiên lưu ở máy khách. Zalo lấy ảnh xem trước không chạy mã trang nên không thành lượt mở.
5. Khách chạm «Quan tâm» ở một căn → một sự kiện `interest` cho căn ấy; nút thành «Đã báo quan tâm». Không hỏi số, không
   form.
6. Link đã tắt (`disabled_at`), mã không có, hay người gửi không còn thuộc sàn → trang «Link không còn mở được — hỏi lại
   người gửi», không lộ sàn hay căn (Hỏi-5, Hỏi-6).

## Quyết định máy (căn cứ ở sổ quyết định)

- Dữ liệu ra dựng ở API bằng `banRaNgoai` của lõi; trang chỉ nhận `CanRaNgoai[]` — bất biến 4, luật đợt 19.
- Đọc căn trong phiên người gửi (luật theo dòng của người gửi), không viết hàm đọc vượt luật cho từng bảng — chỉ một hàm
  «mã → sàn, người gửi» chạy quyền chủ; bất biến 1 giữ nguyên, phần đọc vượt luật hẹp nhất có thể.
- Lượt mở đếm bằng lời gọi từ trình duyệt sau khi trang chạy — kết luận hàng 3, luật đợt 21.
- Ảnh trang khách qua route công khai theo mã: chỉ ảnh nằm trong bản ra của chính Lần gửi ấy.
- Rào route công khai: bài kiểm đọc danh sách route đã đăng ký trên app API; route dưới `/api/v1/public/` nào không có
  bài kiểm rò rỉ nêu đúng đường của nó thì CI đỏ, nêu route — luật đợt 39.
- Trang và route công khai không lưu đệm (`no-store`, `force-dynamic`) — giá và trạng thái sống (Luật sản phẩm 26).
- Đường `/s/` mở không phiên ở bộ chặn đăng nhập của web (`apps/web/src/proxy.ts`) — trang khách là link công khai
  (Tham chiếu: «Trang khách và đăng nhập không có vỏ … không đăng nhập»); bộ chặn trước nay đưa mọi trang chưa phiên về
  `/login`.
- Nhóm môi giới mở link của họ cũng thấy trang (bản ra `nhom_moi_gioi`, có mã căn); mức chia là hàng khác.

## Đối chiếu ngành (ADR-0022)

| Năng lực | RESO | KW Command | BoldTrail | Ta làm | Ta cứng — họ cấu hình |
|---|---|---|---|---|---|
| Trang bộ căn gửi khách | `ContactListings` ([dd.reso.org](https://dd.reso.org/DD2.0/ContactListings/)) | Collection — danh sách căn tuyển tay ([nguồn](https://answers.kw.com/hc/en-us/articles/360057912834-Saved-Search-vs-Collection)) | Chọn listing rồi gửi email hay tin nhắn ([nguồn](https://help.insiderealestate.com/en/articles/3424538-boldtrail-how-to-email-listings-to-your-contacts)) | Một link sống `/s/<mã>`, không đăng nhập | Không |
| Khách báo thích từng căn | `ContactListings`: Favorite · Possibility · Discard ([dd.reso.org](https://dd.reso.org/DD2.0/ContactListings/)) | chưa kiểm | chưa kiểm | Một nút «Quan tâm» mỗi căn | **Có** — một mức (Hỏi-3) |
| Biết khách đã xem | `ContactListings`: đã xem chưa ([dd.reso.org](https://dd.reso.org/DD2.0/ContactListings/)) | chưa kiểm | Theo dõi mở bằng pixel ([nguồn](https://help.insiderealestate.com/en/articles/3424538-boldtrail-how-to-email-listings-to-your-contacts)) | Lượt mở đếm từ trình duyệt sau khi trang chạy | Không |
| Giá và trạng thái sống | `StandardStatus` | chưa kiểm | chưa kiểm | Đọc lúc mở, không đệm | Không |

## Hỏi chủ kho (Cổng Phạm vi)

- **Hỏi-1 — Lối giao diện (trang ba lối, ADR-0019).** Màn đầu của nhóm mới «trang khách». Khuyến nghị: lối ReUI —
  `wishlist-3` cho danh sách + `product-detail-5` cho chi tiết (khối đích ở `vo-va-ia.md` §2), bỏ giỏ. Lối khác: Trong
  kho (dùng nguyên `TrangKhach` đang có của xem trước — rẻ nhất, thẻ đơn sơ) · Vẽ mới.
- **Hỏi-2 — Số điện thoại người gửi trên trang** (hàng 31 đẩy sang đây). Khuyến nghị: bản đầu không hiện số — khách mở từ
  Zalo nên đã có đường nhắn người gửi; tên người gửi vẫn ở đầu trang. Lối khác: hiện số và nút gọi — cần nguồn số công
  việc của người gửi (chưa có trường), và là dữ liệu cá nhân của nhân viên ra ngoài.
- **Hỏi-3 — «Quan tâm» một mức.** Khuyến nghị: một nút mỗi căn, chạm một lần là ghi; chạm lại không ghi thêm (một máy một
  lượt mỗi căn); không có «Bỏ quan tâm», không thu số khách. Lối khác: ba mức như RESO (thích · có thể · bỏ) — khách phải
  hiểu ba nút, người gửi thêm việc đọc.
- **Hỏi-5 — Link đã tắt và mã không có hiện gì.** Khuyến nghị: cùng một câu «Link không còn mở được — hỏi lại người
  gửi», không tên sàn, không căn — người gửi tắt link là thu lại cả bộ; khách hỏi lại qua Zalo. Lối khác: link đã tắt
  hiện «<tên sàn> đã tắt link này — hỏi lại <người gửi>» (khách biết hỏi ai, nhưng link tắt vẫn lộ ai gửi).
- **Hỏi-6 — Người gửi đã rời sàn hay bị khoá.** Route đọc căn trong phiên của người gửi. Khuyến nghị: link của người
  không còn thuộc sàn coi như đã tắt (Hỏi-5) — không đọc thay bằng danh tính khác. Lối khác: giữ link sống bằng quyền
  đọc của trưởng nhóm — khách cũ không mất link, nhưng là một danh tính đọc thay mà luật theo dòng không cấp cho link.
- **Hỏi-4 — Căn không còn bán trên trang.** Khuyến nghị: giữ chỗ cũ trong bộ, mờ đi, nhãn «Đã có người đặt cọc» / «Tạm
  ngưng» / «Không còn», không giá với hai nhãn sau, không nút Quan tâm — khách hiểu vì sao căn đã nghe bị mất. Lối khác:
  giấu hẳn căn — trang gọn hơn nhưng khách tưởng người gửi sửa bộ.

## Ngoài vòng

- Người gửi tắt link (nút ở Đã gửi, hàng 36); trang tôn trọng `disabled_at` có sẵn.
- Báo người gửi khi khách mở hay quan tâm (Hôm nay của đầu khách 37, Đã gửi 36) — hàng này chỉ ghi sự kiện.
- Nối hai số đo `customer_link_opens`, `customer_interest` vào `packages/core/src/metrics` — đọc theo tên sự kiện của hàng
  này, việc của giám sát (luật đợt 35).
- Mức chia trên trang nhóm môi giới (hàng 44); số điện thoại người gửi (Hỏi-2).
- Chặn lạm dụng lượt gọi công khai theo địa chỉ máy — sau bản đầu; bản đầu chặn trùng theo mã máy và kiểm mã link.
- Đọc cấu hình trang khách của sàn từ `company_settings` khi Cài đặt sàn có (45–49); bản đầu dùng mặc định của lõi.

## Bất biến chạm

1 (cách ly): bảng sự kiện mới bật luật theo dòng; hàm «mã → sàn» chạy quyền chủ nhưng chỉ trả sàn, người gửi, người
nhận, cờ bật. 2 (chủ nhà không rời công ty): route công khai dựng từ `banRaNgoai`, không trường lớp `source` nào; bài rò
rỉ của route. 3 (người bấm gửi): trang không gửi gì thay ai. 4 (phần nội bộ không ra): trang và route có bài rò rỉ.

## Đặc tả UX

<!-- UX-SPEC:START -->
### Khuôn IA đã chọn + căn cứ
Danh sách → chi tiết trên điện thoại (họ card, không vỏ): đầu trang mảnh tên sàn + người gửi, bộ căn xếp dọc, chạm mở
chi tiết. Căn cứ: dòng «Trang khách» ở `docs/design/vo-va-ia.md` §2 (khối đích `wishlist-3` + `product-detail-5`) và
Tham chiếu «Trang khách luôn điện thoại trước».

### Màn và trạng thái
| Trạng thái | Thấy gì |
|---|---|
| Bộ căn | Đầu trang «<sàn> · <người gửi> gửi», n căn theo thứ tự gửi |
| Căn đang bán | Ảnh bìa, tên căn theo người nhận, thông số, giá, «giá xác nhận X ngày trước», nút «Quan tâm» |
| Căn đã cọc | Thẻ mờ, nhãn «Đã có người đặt cọc», giá vẫn hiện, không nút Quan tâm |
| Căn tạm ngưng / không còn | Thẻ mờ, nhãn «Tạm ngưng» / «Không còn», không giá, không nút |
| Đã báo quan tâm | Nút thành «Đã báo quan tâm», không bấm lại được |
| Chi tiết một căn | Ảnh (lướt), thông số đủ của bản ra, giá, nút Quan tâm |
| Link tắt / mã sai | «Link không còn mở được — hỏi lại người gửi», không tên sàn |
| Mất mạng khi bấm Quan tâm | «Chưa gửi được — thử lại», nút giữ nguyên |

### Thẻ việc
Khách · điện thoại · mở từ Zalo → hiểu ngay ai gửi, căn nào còn, giá bao nhiêu, mới xác nhận lúc nào, và báo «Quan
tâm» một chạm.
<!-- UX-SPEC:END -->

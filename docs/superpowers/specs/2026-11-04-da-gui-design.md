# Đã gửi (hàng 36) — thiết kế

Ngày: 2026-11-04 · Hạng T3 (migration) · Dãy L · Ô cơ hội: `_acceptance/da-gui/opportunity.md` (build, 02/11).

Câu giao: Đầu khách mở Đã gửi và thấy từng link: lượt khách mở, căn được quan tâm, căn vừa đổi kèm «Gợi ý căn thay»;
tắt được link.

## Đứng trên gì

- **Hàng 34 (Luồng Gửi)** — mỗi lần bấm Gửi tạo một Lần gửi (`shares`, `share_listings` theo `position`), người nhận
  khách riêng (gắn nhu cầu khách) hay nhóm môi giới; `shares.disabled_at` đã có cột, chưa có đường ghi.
- **Hàng 35 (Trang khách)** — `share_events` ghi `link_opened` (một máy một ngày) và `interest` (một máy một căn), luật đọc
  theo luật của `shares`; trang tôn trọng `disabled_at` và người gửi rời sàn (Hỏi-5, Hỏi-6 hàng 35).
- **Tham chiếu** — Đã gửi: đầu khách «Có», trưởng nhóm «Có, cả nhóm» (bảng vai §9); nhà Đã gửi trả lời «khách đang phản
  ứng ra sao?»; người gửi tắt được link, link không tự hết hạn ở bản đầu (§12, 29/10).
- **Luật đợt 49** — bốn mục chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng hàng 35 gộp vào hợp đồng này (nguồn
  «Ngoài-1/4/5/8 hàng 35»).

## Luồng

1. Đầu khách mở nhà Đã gửi (`/shares`, điện thoại là tab Gửi): danh sách Lần gửi của mình, mới trước; trưởng nhóm thấy
   Lần gửi của cả đội. Mỗi Lần gửi một thẻ: bìa bốn ảnh căn, người nhận («[Tên khách]» hay «Nhóm môi giới»), số căn,
   lượt mở · quan tâm, giờ mở gần nhất, nhãn «Đã tắt» khi link đã tắt.
2. Chạm thẻ → chi tiết Lần gửi: mỗi căn một dòng theo thứ tự gửi — số lượt quan tâm; nhãn «Vừa đổi» khi giá hay trạng
   thái đổi sau lúc gửi (giá cũ → mới, «Đã có người đặt cọc», «Không còn»); căn vừa đổi có «Gợi ý căn thay» — tối đa ba
   căn đang bán khác (Hỏi-3) mở thẳng luồng Gửi với căn ấy.
3. Nút «Tắt link» (người gửi; Hỏi-2) → hỏi xác nhận → link tắt: trang khách hiện «Link không còn mở được», thẻ mang nhãn
   «Đã tắt». Bản đầu không bật lại (link mới thì gửi lại).
4. Bốn mục từ hàng 35 (luật đợt 49): nút «Quan tâm» không vỡ khi trình duyệt chặn lưu trữ; lỗi máy chủ của trang khách
   hiện «Chưa mở được — thử lại sau» thay vì «link không còn mở được»; rào route công khai chạy bài rò rỉ trên đầu ra thật
   của route, không dò chuỗi đường trong tệp.

## Quyết định máy (căn cứ ở sổ quyết định)

- Đọc qua API `GET /api/v1/shares` và `GET /api/v1/shares/{id}` dưới phiên người xem — luật đọc của `shares` (người gửi,
  trưởng nhóm) đã đúng bảng vai §9, không thêm luật đọc.
- Tắt link chỉ qua hàm `app.disable_share` của migration mới (bảng `shares` không có grant update) — bất biến 1.
- Lượt mở, quan tâm đếm từ `share_events` (hàng 35), không đếm lại ở giao diện.
- «Vừa đổi» suy từ `listing_events` sau `shares.created_at` (giá và trạng thái), không thêm sự kiện.
- Đã gửi là màn trong vỏ, đọc thông tin nội bộ của sàn (không phải cửa ra) — không đi qua `banRaNgoai`; số khách không hiện
  (chỉ tên hiển thị của nhu cầu khách).

## Đối chiếu ngành (ADR-0022)

| Năng lực | RESO | KW Command | BoldTrail | Ta làm | Ta cứng — họ cấu hình |
|---|---|---|---|---|---|
| Theo dõi khách đã xem | `ContactListings`: đã xem chưa ([dd.reso.org](https://dd.reso.org/DD2.0/ContactListings/)) | chưa kiểm | Theo dõi mở bằng pixel ([nguồn](https://help.insiderealestate.com/en/articles/3424538-boldtrail-how-to-email-listings-to-your-contacts)) | Lượt mở · giờ mở gần nhất mỗi link | Không |
| Phản ứng từng căn | `ContactListings`: Favorite · Possibility · Discard ([dd.reso.org](https://dd.reso.org/DD2.0/ContactListings/)) | chưa kiểm | chưa kiểm | Số lượt «Quan tâm» mỗi căn | Không |
| Căn thay khi căn cũ hết | chưa kiểm | chưa kiểm | chưa kiểm | «Gợi ý căn thay» theo luật dựng sẵn | **Có** — luật gợi ý (Hỏi-3) |
| Thu hồi link | chưa kiểm | chưa kiểm | chưa kiểm | «Tắt link», không bật lại | **Có** — ai tắt được (Hỏi-2) |

## Hỏi chủ kho (Cổng Phạm vi)

- **Hỏi-1 — Lối giao diện (trang ba lối, ADR-0019).** Màn đầu của nhóm «Đã gửi». Khuyến nghị: ReUI `wishlist-4` (thẻ bìa
  bốn ảnh, khối đích ở `vo-va-ia.md` §2). Lối khác: Trong kho (danh sách dòng `Item`) · Vẽ mới (bảng `list-11`).
- **Hỏi-2 — Ai tắt được link.** Khuyến nghị: người gửi và trưởng nhóm (trưởng nhóm thấy cả đội nên cần thu link khi đầu
  khách nghỉ). Lối khác: chỉ người gửi — link của người đã nghỉ đã tự tắt theo Hỏi-6 hàng 35, nhưng link sai của đầu
  khách còn làm thì trưởng nhóm không thu được.
- **Hỏi-3 — Luật «Gợi ý căn thay».** Khuyến nghị: tối đa ba căn Đang bán chưa có trong link, cùng số phòng ngủ, giá trong
  ±15% giá gửi, ưu tiên cùng toà rồi giá gần nhất — đặt ở một chỗ có tên trong lõi, là mặc định dựng sẵn (sàn chỉnh khi có
  Cài đặt sàn). Lối khác: theo nhu cầu khách đã lưu (tiêu chí của nhu cầu khách) — nhóm môi giới không có nhu cầu khách.
- **Hỏi-4 — Tắt link có bật lại được không.** Khuyến nghị: bản đầu không bật lại (gửi link mới); khó đảo cho khách đang
  giữ link. Lối khác: cho bật lại — thêm một đường ghi và một trạng thái.

## Ngoài vòng

- Báo đầu khách khi khách mở hay quan tâm (Hôm nay của đầu khách, hàng 37).
- Lịch xem, xin dẫn xem (P1, chờ phỏng vấn).
- Sửa bộ căn của một link đã gửi (gửi link mới).
- Nối hai số đo `customer_link_opens`, `customer_interest` vào bảng số đo (giám sát, luật đợt 35).

## Bất biến chạm

1 (cách ly): hàm tắt link kiểm sàn và vai; bộ kiểm cách ly có ca. 2: Đã gửi không đọc lớp `source`; không số khách.
3: không gửi gì thay ai — «Gợi ý căn thay» chỉ mở luồng Gửi. 4: trang khách (sửa Ngoài-4) vẫn dựng từ bản ra; rào route
công khai (Ngoài-8) đo đầu ra thật.

## Đặc tả UX

<!-- UX-SPEC:START -->
### Khuôn IA đã chọn + căn cứ
Danh sách → chi tiết (bố cục «Danh sách → chi tiết» của ADR-0024): lưới thẻ Lần gửi, chạm mở chi tiết các căn. Căn cứ:
dòng «Đã gửi» ở `docs/design/vo-va-ia.md` §2 (khối đích `wishlist-4`, «bấm thẻ mở dòng phản ứng»).

### Màn và trạng thái
| Trạng thái | Thấy gì |
|---|---|
| Danh sách | Thẻ mỗi link: bìa bốn ảnh, người nhận, số căn, lượt mở · quan tâm, giờ mở gần nhất |
| Chưa gửi link nào | «Chưa gửi link nào» + nút «Gửi căn» về Bảng hàng thẻ |
| Đang tải / lỗi tải | Khung xương / «Chưa tải được — thử lại» |
| Link đã tắt | Nhãn «Đã tắt» trên thẻ và chi tiết, không nút tắt |
| Chi tiết | Mỗi căn: số lượt quan tâm, nhãn «Vừa đổi» (giá cũ → mới, trạng thái mới), «Gợi ý căn thay» |
| Tắt link | Hỏi xác nhận → «Đã tắt link» |
| Vai không xem được | Câu báo «Đầu khách và trưởng nhóm xem được Đã gửi» |

### Thẻ việc
Đầu khách · điện thoại · sau khi gửi → biết khách nào đã mở, thích căn nào, căn nào vừa đổi và gửi căn thay ngay.
<!-- UX-SPEC:END -->

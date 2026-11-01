# Cột hồ sơ căn (hàng 17) — thiết kế

Ngày 01/11/2026 · dãy H, đợt `dau-chu-dong-vao` · hồ sơ `_acceptance/cot-ho-so-can/` · mã phạm vi D4, D5.

## Việc

Đầu chủ trên máy tính bấm một dòng của Bảng hàng và thấy hồ sơ căn mở thành **cột phải cạnh bảng**, bảng vẫn dùng được
(Tham chiếu §9: «Hồ sơ căn mở thành cột phải cạnh bảng, bảng vẫn dùng được; mở toàn màn khi cần»). Cột cho thấy:

1. **Thuộc tính căn tự điền** từ danh mục (loại căn, diện tích, tầng, hướng, toà, khu, loại hình) — khoá, không sửa.
2. **Lần rao**: phần lần rao đang mở (giá + phí, nội thất, pháp lý, tài chính, tình trạng sử dụng, mức đủ n/5) và mọi lần
   rao của cùng căn trên máy.
3. **Lịch sử**: giá và trạng thái — ai sửa, khi nào, từ gì sang gì — tính từ sự kiện của hàng (ADR-0008).
4. **«Báo sai thông tin căn»**: thuộc tính sai thì báo, sàn không tự sửa danh mục (Tham chiếu §4, Kiến trúc §7).

Đường: `/inventory?unit=<mã căn>` (Bảng hàng kèm hồ sơ đang mở) và `/units/<mã căn>` (toàn màn) — Tham chiếu §routes. Bấm
dòng từ bảng luôn đặt thêm `toa=<toà>` và `lan=<lần rao của dòng>`: link chép không lệch khi danh mục thêm toà trùng mã
sau này; `?unit=` không kèm toà (gõ tay, link cũ) mà mã trùng hai toà thì liệt «Nhiều căn». Tham chiếu §12 thêm một
dòng ghi dạng URL này trong cùng PR (thêm dòng, không sửa dòng §routes).

## Dữ liệu — không đổi máy chủ

Mọi thứ cột cần đã có:

- Hàng và phần lần rao: kho trên máy (bộ đồng bộ hàng 13).
- Thuộc tính căn: danh mục đã giữ trên máy, ghép theo **toà + mã căn** như Bảng hàng (`ghep-danh-muc.ts`, hàng 63).
- Lịch sử: `useHoSoHang(id)` kéo `GET /api/v1/listings/{id}` (kèm sự kiện) và giữ trong kho trên máy — mất mạng thì xem
  bản đã tải.
- Người sửa (Hỏi-3): sự kiện mang `actorUserId` + `actorRoles`; khuyến nghị ghi «Bạn» khi là mình, còn lại tên vai
  («Trưởng nhóm», «Đầu chủ»…) như bảng Cần xem của hàng 61 — hai đầu chủ khác nhau cùng hiện «Đầu chủ». Lối khác: API
  sự kiện trả kèm tên hiển thị của người làm (đổi gói api, vẫn T2, khoảng một giờ máy; mọi vai thấy tên đồng nghiệp đã
  sửa hàng mình đọc được).
- Lần rao của cùng căn: mọi hàng trên máy cùng toà + mã căn, mới nhất trên. Lần rao đang xem: `lan` của URL nếu thuộc
  căn; vắng thì lần rao đang mở; không còn lần mở thì lần mới nhất. Bấm một lần rao trong danh sách đổi `lan`; phần lần
  rao và lịch sử theo lần rao đang xem.

Không migration, không API mới, không đổi lõi ⇒ T2.

## Báo sai thông tin căn (Hỏi-1)

Kiến trúc §7: báo sai về đội vận hành; đường tới hàng đợi duyệt của Invest là «Sau, cần quyết định riêng», thoả thuận
chiều ngược đang tắt. **Khuyến nghị**: bảng soạn (thuộc tính sai · giá trị đúng · ghi chú) → **«Chép và mở bảng chia
sẻ»** — nội dung báo dựng sẵn (mã căn, toà, khu, thuộc tính, giá trị đang hiện, giá trị đúng, ghi chú), mở bảng chia sẻ
của thiết bị, người bấm gửi tới đội vận hành qua kênh sàn đang dùng; không có bảng chia sẻ thì chép vào bộ nhớ tạm và báo
«Đã chép». Hợp bất biến 3 (người bấm gửi), không thêm bảng. **Lối khác**: lưu báo sai trên máy chủ ngay hàng này — bảng
mới + API, hàng thành T3, cần số migration và chữ ký T3. Nhận báo trên máy chủ là một hàng riêng sau.

## Ba lối (ADR-0019 — màn đầu của nhóm Hồ sơ căn)

Trang ba lối: `_acceptance/cot-ho-so-can/ba-loi/index.html` (ảnh 1440 và 375, cùng dữ liệu mẫu; bản bấm được
`/proto/cot-ho-so-can?loi=…`).

| Lối | Dựng | Động cơ | Đánh đổi |
| --- | --- | --- | --- |
| Trong kho | Khuôn Cài đặt sàn: Frame xếp chồng, mỗi mục một FramePanel có tiêu đề | Đã có trong kho, quen mắt | Bốn khung chồng ăn chỗ; lịch sử rơi xuống đáy, phải cuộn mới thấy |
| **ReUI** (khuyên) | `solution-crm-4` chuyển thành cột: giá + mức đủ đầu cột, trường chính, dòng thời gian | Khối đích đã chọn ở `vo-va-ia.md` §2; giá và mức đủ thấy đầu tiên; một cuộn đọc hết | Khối gốc là ngăn phủ — phải đổi thành cột chia đôi; dài hơn Vẽ mới |
| Vẽ mới | Ghép Frame + Tabs: Căn · Lần rao · Lịch sử | Gọn nhất, không cuộn | Lịch sử và lần rao nằm sau một chạm; là ghép (bậc 6) — phải ghi «Chỗ hở» |

Máy khuyên **ReUI**: đúng khối đích đã chốt theo lô, không rơi bậc, và đầu chủ gọi chủ nhà cần thấy giá + lịch sử trả
giá cùng lúc — tab giấu đúng thứ cần nhìn.

## Khuôn nhóm (luật đợt 18)

Màn đầu của nhóm **Hồ sơ căn**: thêm `design/patterns/ho-so-can.md` và khuôn `KhungHoSoCan`; `/units/[code]/page.tsx` rời
trang tạm. Bảng hàng (nhóm `bang-hang`) chỉ thêm chỗ cắm cột phải — sửa tệp của hàng 14 qua yêu cầu `cham-tep` H-2.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Bảng hàng → bấm một dòng → URL thêm `?unit=<mã>`, cột phải mở, dòng đánh dấu → đọc thuộc tính, lần rao, lịch sử (điểm ra: «Đóng» bỏ `?unit`; «Mở toàn màn» sang `/units/<mã>`)
- Biên: bấm dòng khác → cột đổi căn, không đóng; mã trùng hai toà → «Nhiều căn» kèm tên toà để chọn (hàng 63); căn ngoài danh mục → thuộc tính «Chưa có trong danh mục», không nút Báo sai; mất mạng → lịch sử đã tải kèm «đang xem bản trên máy»
- Lỗi & quay lại: mã không có trên máy (gõ tay URL, hàng «Chỉ tôi» của người khác) → «Không có căn này trong Bảng hàng» + nút Đóng về Bảng hàng; bảng chia sẻ của thiết bị vắng → chép vào bộ nhớ tạm, báo «Đã chép»

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Bảng hàng + cột hồ sơ (`/inventory?unit=`) | Đọc hồ sơ một căn mà không rời bảng | Bấm dòng / Đóng, Mở toàn màn |
| Hồ sơ căn toàn màn (`/units/<mã>`) | Đọc hồ sơ một căn khi cần cả bề ngang | Gõ mã căn, Mở toàn màn / Bảng hàng |
| Bảng soạn «Báo sai thông tin căn» | Soạn một lời báo thuộc tính sai rồi chia sẻ | Nút Báo sai / Huỷ, Chép và mở bảng chia sẻ |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-hoso-dang-tai | Cột hồ sơ | Khung xương của cột | Chờ |
| ST-hoso-khong-co | Cột hồ sơ / toàn màn | «Không có căn này trong Bảng hàng» | Đóng |
| ST-hoso-nhieu-can | Cột hồ sơ / toàn màn | «Nhiều căn» + mỗi toà một nút | Chọn toà |
| ST-hoso-ngoai-danh-muc | Cột hồ sơ | Thuộc tính «Chưa có trong danh mục», không nút Báo sai | Đọc phần lần rao |
| ST-hoso-lich-su-can-mang | Cột hồ sơ | «Lịch sử cần mạng để tải lần đầu» | Chờ có mạng |
| ST-hoso-tren-may | Cột hồ sơ | Lịch sử đã tải + «đang xem bản trên máy» | Đọc |
| ST-hoso-lan-da-ngung | Cột hồ sơ | Phần lần rao và lịch sử của lần rao đã ngừng, đầu phần «Ngừng bán» | Bấm lần rao đang mở |
| ST-baosai-thieu | Bảng soạn | Nút chia sẻ tắt tới khi có giá trị đúng | Gõ giá trị đúng |
| ST-baosai-da-chep | Bảng soạn | «Đã chép» | Dán vào kênh của sàn |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Chia đôi bằng `resizable`: cột phải mặc định 38%, tối thiểu 28%; bảng vẫn cuộn, lọc, bấm dòng.
- Dưới `md`: Bảng hàng hiện khối báo của khuôn `bang-hang`; `/units/<mã>` một cột toàn bề ngang.
- Giá và trạng thái hiện bản trên máy (đã gồm thao tác chờ gửi), như Bảng hàng.
- Bảng soạn: giá trị đúng bắt buộc, 1–200 ký tự; ghi chú tuỳ chọn, tối đa 500 ký tự.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `solution-crm-4` (lối ReUI) | dùng (chuyển thể) | Khối đích đã chọn ở `vo-va-ia.md` §2 |
| `resizable`, `Frame`, `Badge`, `timeline`, `Progress`, `Dialog`, `Field` | dùng | Đã cài |
| `KhungHoSoCan` | tạo | Khuôn nhóm Hồ sơ căn (luật đợt 18) |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: Tham chiếu §9 «Hồ sơ căn mở thành cột phải cạnh bảng, bảng vẫn dùng được; mở toàn màn khi cần» — một khuôn duy nhất khả dĩ, không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài phạm vi

Sửa trên cột (hàng 15, 19), ảnh căn (hàng 18), phần chủ nhà (hàng 62), bản điện thoại (hàng 33), chế độ cuộc gọi
(hàng 28), tên người sửa (cần quyền đọc thành viên), nhận báo sai trên máy chủ.

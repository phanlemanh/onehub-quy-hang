# ADR-0010: Lớp trường nguồn — chủ nhà, đầu chủ giữ căn, mở số

Ngày: 2026-10-31 · Trạng thái: **accepted** (Manh Phan duyệt Cổng Phạm vi hồ sơ `lop-truong-nguon` 31/10, Hỏi-1..3 theo
khuyến nghị; duyệt kế hoạch 31/10) · Liên quan: Tham chiếu §2, §6; Kiến trúc §1, §5; bất biến 2; ADR-0008, ADR-0009;
hàng 11 của lộ trình

## Bối cảnh

Tham chiếu §6: «chủ nhà, số điện thoại, giá đáy, ảnh sổ chỉ đầu chủ giữ căn và trưởng nhóm thấy; không bao giờ ra ngoài
sàn. Mỗi lần mở số chủ là một sự kiện», và «quản trị sàn không tự động thấy chủ nhà». Kiến trúc §1, §5: chủ nhà ở bảng
riêng có luật chặt hơn, không là cột của hàng; mở số qua một hàm duy nhất có ghi sự kiện. ADR-0008 để gán đầu chủ cho
hàng sang hàng chủ nhà.

## Quyết định

1. **Ai thấy nguồn** — đầu chủ giữ căn còn vai Đầu chủ, và trưởng nhóm. Tới khi có nhóm, trưởng nhóm thấy chủ nhà của cả
   sàn (Hỏi-2). Quản trị sàn, đầu khách, telesales, đầu chủ khác không thấy. Luật nằm ở hai chỗ cùng nghĩa —
   `canSeeSource` (`packages/core/src/access`) và `app.can_see_source` (migration 006) — và được đo bằng CÙNG một bảng
   12 ô viết tay (`packages/core/src/access/bang-xem-nguon.json`). Nguồn chỉ thấy trên hàng người xem đọc được: hàng
   «Chỉ tôi» của người khác (hàng 12) thì bốn lời gọi chủ nhà trả 404 như hàng không có — xét bằng `canRead` của lõi ở
   API, cùng tầng với trục ai thấy hàng (chưa ở cơ sở dữ liệu).
2. **Đầu chủ giữ căn** (Hỏi-3) — đầu chủ ghi chủ nhà đầu tiên cho hàng chưa có người giữ thì giữ căn; trưởng nhóm gán,
   gán lại; đầu chủ không tự chuyển căn; người không có vai Đầu chủ ghi chủ nhà trên hàng chưa có người giữ bị từ chối.
   Mỗi lần gán là một dòng chỉ thêm (`listing_agent_assignments`); người giữ là dòng mới nhất. Không thành sự kiện của
   hàng vì `seq` của sự kiện là phiên bản hàng (ADR-0008).
3. **Chủ nhà** (`listing_owners`): tên, số (chuẩn hoá 10 chữ số bắt đầu bằng 0), giá đáy. Cột số **không cấp quyền đọc**
   cho vai API, kể cả với đầu chủ giữ căn. Hồ sơ chủ nhà trả cho người thấy nguồn: tên, giá đáy, cờ «có số» — không số
   nào. Người không thấy nhận cờ không thấy và đầu chủ giữ căn, để màn hiện «Liên hệ đầu chủ».
4. **Mở số** — cửa duy nhất là `app.reveal_owner_phone`: xét quyền, ghi một dòng `owner_phone_reveals` (người, vai lúc
   mở, lúc mở), rồi trả số. Bảng sự kiện mở số chỉ thêm; vai API không thêm thẳng được. Mở số không đổi phiên bản hàng.
5. **Chặn thêm ở sự kiện của hàng** — ràng buộc `listing_events_no_source` từ chối payload mang khoá nguồn ở cấp đầu.
6. Bốn lời gọi ở `packages/api/src/owners/`: `GET`/`PUT /api/v1/listings/{listingId}/owner`,
   `POST …/owner/phone-reveal`, `PUT …/listing-agent`. Hai mã lỗi mới: `listing-agent-required` (403), `owner-not-set`
   (404). Lõi xuất qua lối con `@quy-hang/core/access`.

## Ngoài quyết định này

Mã hoá số chủ ở mức trường (Hỏi-1 — hàng sau, **phải xong trước dữ liệu thật**); ảnh sổ; nhóm và trục «Chỉ tôi → Nhóm →
Toàn sàn» (hàng 12); telesales nhập số ở lead, kiểm trùng chủ nhà; lịch sử giá đáy; số chủ trên máy (hàng 13); mọi màn.

## Hệ quả

- Mã hoá số chủ chỉ đổi thân `app.reveal_owner_phone` và cột `owner_phone`; khoá `OWNER_PHONE_KEY` (ADR-0009 §9) sinh ở
  hàng đó.
- Màn hồ sơ căn đọc `GET …/owner` và gọi «Mở số»; lịch sử của hàng và lịch sử giữ căn, mở số nằm ở ba bảng.

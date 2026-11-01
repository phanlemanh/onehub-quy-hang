# Hôm nay của đầu chủ — thiết kế

Hàng 22 `hom-nay-dau-chu` (dãy G, D10 · phác thảo 1). Căn cứ: Tham chiếu §8 luật 18, 20, §10 (mở app vào Hôm nay, hàng
đợi của đầu chủ); `docs/architecture/so-diem-bien-thien.md` #4, #5, K8; ADR-0019 (màn đầu nhóm mới → trang ba lối),
ADR-0020 (bốn nấc lead), ADR-0021 (liên hệ, «Lên bảng» là dữ kiện). Ô cơ hội: Cổng Đáng build (Manh Phan 31/10). Đứng
trên 15 (bảng hàng), 17 (cột hồ sơ căn).

## 1. Vấn đề

Đầu chủ mở app vào `/today` nhưng chỉ thấy chỗ tạm. Việc của họ — nhận và gọi lead mới, gọi lại căn chưa xác nhận, gọi ép
giá, bổ sung thông tin — nằm rải trong bảng hàng (cột Xác nhận lọc &lt;14) và chưa có chỗ nào cho lead được giao: API chỉ trả
lead mình nhập, không trả lead giao cho mình; nút Nhận · Đã gọi · Trả lại có ở API mà không có màn.

## 2. Đối chiếu ngành (luật thường trực 01/11)

| Đối tượng ở Quỹ hàng | RESO DD 2.0 | Ngành môi giới | Ghi chú |
| --- | --- | --- | --- |
| Đầu chủ giữ căn | Property `ListAgentKey` / Member | Listing agent (KW: listing specialist) | Bảng `listing_agent_assignments`; API trả thêm `listAgentKey` |
| Căn đang bán | Property `StandardStatus` = Active | Active listing | Khớp |
| Mốc đổi giá | Property `PriceChangeTimestamp` | Price reduction | Trường mới của bản xem, tính từ sự kiện `price_changed` |
| Mốc đổi trạng thái | Property `StatusChangeTimestamp` | — | Tính từ `status_changed` |
| Xác nhận với chủ nhà | (không có) — gần `ModificationTimestamp` | KW «listing check-in» | Đặc trưng Việt Nam: `lastConfirmedAt` (đã có) |
| Lead giao cho tôi | Contacts `ContactType` = Seller, `OwnerMemberKey` | KW opportunity · seller lead | ADR-0021: lead gắn liên hệ |
| Gọi ép giá | (không có) | KW «price adjustment conversation» | Đặc trưng nghề; mốc tính là câu hỏi (Hỏi-1) |

Không lệch với `CONTEXT.md` ngoài chỗ «ép giá» chưa có định nghĩa mốc tính — đưa thành Hỏi-1.

## 3. Cách làm

### 3.1 Hàng đợi (lõi thuần, `packages/core/src/today/`)

`hangDoi(can, nguoi, caiDat, bayGio) → "ep-gia" | "goi-lai" | "thieu-tin" | "moi-doi" | null` cho căn mình giữ
(`listAgentKey` = mình), nấc khác Đã bán, Ngừng bán. Mỗi căn ra đúng một giá trị — thứ tự thắng (Hỏi-2):

1. **Nên gọi ép giá** — căn Đang bán, quá `price_negotiation_after_days` ngày kể từ mốc ép giá. Hỏi-1 chốt mốc: khuyên
   lấy lần muộn hơn giữa đổi giá gần nhất (chưa đổi thì lúc lên Đang bán) và xác nhận với chủ nhà gần nhất — bấm «Còn ·
   giữ giá» đặt lại đồng hồ, căn quay lại nhóm sau 10 ngày là «đợt hai»; hệ quả: căn Đang bán luôn tới ép giá (10) trước
   gọi lại (14), nên Cần gọi lại thực tế là nhóm của căn Đã cọc, Chưa đủ để rao.
2. **Cần gọi lại** — chưa xác nhận với chủ nhà trong `call_back_after_days` ngày (hay chưa từng).
3. **Thiếu thông tin** — mức đủ chưa đủ (`completeness.missing` khác rỗng).
4. **Mới đổi** — giá hay trạng thái đổi từ 0 giờ hôm qua (giờ Việt Nam, tính theo UTC+7 cố định, không theo múi giờ
   của máy) bởi người khác mình.

Ngưỡng là mặc định của sàn đặt tên ở `packages/core/src/today/mac-dinh.ts` (`QUEUE_DEFAULTS`: 14, 10, comment «mặc định của
sàn»), đọc đè từ `company_settings` khoá `queue.call_back_after_days` (7–30), `queue.price_negotiation_after_days` (7–14)
như mẫu `readLeadRoutingSettings`. Ngoài khoảng thì dùng mặc định. Màn sửa ngưỡng là hàng 48.

**Lead mới** là hàng đợi riêng của lead, không phải căn: lead giao cho mình (`matched_agent_user_id`), nấc Đã gửi hay Đã
nhận (chưa gọi lần đầu), chưa trả lại, chưa bỏ.

### 3.2 API (`packages/api`)

- `GET /api/v1/listings` thêm vào bản xem: `listAgentKey` (người giữ, `null` khi chưa ai giữ), `priceChangeTimestamp`,
  `statusChangeTimestamp` (ISO, từ sự kiện; `null` khi chưa có) và hai bản ghi lần đổi cuối `lastPriceChange`,
  `lastStatusChange` = `{ at, byUserId, byRoles, from, to }` (giá cũ → mới, nấc cũ → mới; vai lấy từ `actorRoles` của sự
  kiện). Mới đổi xét riêng từng bản ghi, nên hai người đổi hai thứ thì mỗi lần đổi được xét. Không cột mới, không
  migration: tính khi đọc từ bảng sự kiện và bảng gán người giữ. Bộ đồng bộ kéo về giữ nguyên các trường ấy vào kho trên
  máy, lưới chặn nguồn vẫn chạy trên toàn thân.
- `GET /api/v1/leads/assigned` — lead giao cho mình đang ở hàng đợi Lead mới: toà, căn, nhu cầu, giá đọc thành câu, giờ
  nhập, nấc, hạn nhận và hạn gọi (từ cài đặt chia lead). Không có số chủ.
- `GET /api/v1/company/settings/queue` — hai ngưỡng đang áp (đã đọc đè).

### 3.3 Màn `/today` cho vai Đầu chủ

- Trang theo vai: telesales giữ vùng Lead đã nhập (hàng 27); người có vai Đầu chủ thấy Hôm nay của đầu chủ; vai khác giữ
  chỗ tạm. Người vừa telesales vừa đầu chủ thấy cả hai, đầu chủ trước.
- Căn đọc từ kho trên máy (bộ đồng bộ, nhanh tức thì); lead và ngưỡng đọc qua API.
- Năm nhóm theo thứ tự Lead mới · Nên gọi ép giá · Cần gọi lại · Thiếu thông tin · Mới đổi, mỗi nhóm đếm số; nhóm rỗng
  không hiện. Mỗi dòng: mã căn (hay toà, căn của lead), lý do vào hàng đợi bằng chữ («Chưa xác nhận 16 ngày», «Giá giữ 12
  ngày», «Thiếu: pháp lý, tài chính», «Giá 3,10 → 2,95 tỷ — Trưởng nhóm, hôm qua»), giá kèm điều kiện phí.
- **Kết quả gọi một chạm** — dòng căn: «Còn · giữ giá» (sự kiện `owner_confirmed` ghi trên máy trước, căn rời hàng đợi
  ngay; không hoàn tác — như bảng hàng); «Đổi giá, trạng thái…» mở cột hồ sơ căn (hàng 17). Dòng lead: «Nhận» (khi chưa
  nhận), «Đã gọi», «Trả lại · Số không liên lạc được».
- Trống: «Hôm nay không còn việc» kèm một hành động (mở Bảng hàng). Đang tải: `Skeleton` đúng bố cục. Lỗi: thử lại. Trống,
  lỗi qua `TrangThai`.
- Khối, bố cục: theo lối được duyệt ở trang ba lối (§4).

### 3.4 Bản đồ khuôn

Nhóm mới `hom-nay-dau-chu` ở `design/patterns/` với khuôn của lối đã duyệt, màn mẫu `/today` (đăng nhập Đầu chủ), trạng
thái mặc định · trống · đang tải · lỗi. `today/page.tsx` rời ngoại lệ chỗ tạm của `trang-tam`; ngoại lệ của `lead-cua-toi`
sửa câu lý do (vai khác giờ là Hôm nay của đầu chủ).

## 4. Ba lối (ADR-0019 — màn đầu của nhóm mới)

Bản mẫu ở `/proto/hom-nay-dau-chu?loi=…` (chỉ máy dev, không lối vào), cùng bộ dữ liệu mẫu ca nhiều việc:

- **Trong kho** — khuôn `KhungLeadCuaToi` (`list-11` đã chuyển thể): Frame stacked, mỗi hàng đợi một khối danh sách.
- **ReUI** — `data-grid-grouping-1` (khối đích ở `vo-va-ia.md` §2): bảng nhóm theo hàng đợi, dòng gập được, nút làm ngay ở
  cuối dòng; thành phần `data-grid` đã cài.
- **Vẽ mới** — ghép `Tabs` (một tab một hàng đợi kèm số) + `Item` hai dòng + nút.

Trang `_acceptance/hom-nay-dau-chu/ba-loi/index.html` dựng bằng `doi-chieu.mjs --dung-ba-loi`, gửi kèm thẻ Cổng Phạm vi.

## 5. Ngoài phạm vi

- Mở số của lead cho đầu chủ (Hỏi-3) — API chưa có lối đọc số lead cho người được giao.
- «Chưa gọi được» (không nghe máy) — chưa có sự kiện; căn ở lại hàng đợi.
- Hàng đợi Xin dẫn xem (chờ điều kiện ở lộ trình), Hôm nay của đầu chủ trên điện thoại (hàng riêng, M1), màn sửa ngưỡng
  (hàng 48), đổi đầu chủ hàng loạt (hàng 89), vá đường lỗi hoàn tác (hàng 88).
- Tạo hàng từ lead (đã có API; màn ở hàng khác).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở app → `/today` (Đầu chủ) → đọc nhóm đầu có việc → gọi chủ nhà ngoài app → bấm «Còn · giữ giá» (căn rời
  hàng đợi) hay mở hồ sơ để đổi giá, trạng thái (điểm ra: hàng đợi ngắn đi; hết việc thì trống).
- Biên: không căn nào mình giữ và không lead → trống; căn ở hai điều kiện → chỉ hiện ở nhóm thắng; người vừa telesales
  vừa đầu chủ → hai vùng.
- Lỗi & quay lại: tải lead lỗi hay mất mạng → nhóm Lead mới báo nguyên nhân, nút thử lại; căn vẫn đọc từ kho trên máy;
  Nhận / Đã gọi / Trả lại lỗi (409) → dòng báo nguyên nhân, dòng giữ nguyên.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hôm nay (đầu chủ) | Cho biết giờ gọi ai, vì sao, và ghi kết quả một chạm | Mở app / cột hồ sơ căn, Bảng hàng |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-today-mac-dinh | Hôm nay | Năm nhóm có số, dòng có lý do bằng chữ, giá kèm phí, nút | Còn · giữ giá; mở hồ sơ; Nhận / Đã gọi / Trả lại |
| ST-today-trong | Hôm nay | «Hôm nay không còn việc» | Mở Bảng hàng |
| ST-today-dang-tai | Hôm nay | Skeleton đúng bố cục nhóm | Chờ |
| ST-today-loi | Hôm nay | Lỗi tải lead hay ngưỡng, nói nguyên nhân | Thử lại |
| ST-today-mat-mang | Hôm nay | Căn từ kho trên máy; nhóm Lead mới «cần mạng» | «Còn · giữ giá» vẫn ghi trên máy |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Bấm «Còn · giữ giá» thì dòng rời nhóm ngay, số nhóm giảm; không hoàn tác (như bảng hàng — sự kiện không đảo được).
- 1440 là khổ chính; 375 một cột, nút xuống dưới dòng.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Lối được duyệt ở trang ba lối | dùng | ADR-0019: chủ sản phẩm chọn ở Cổng Phạm vi |
| `TrangThai`, `Skeleton`, `Badge`, `Button` | dùng | Thành phần nền đã cài |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: hàng đợi việc nhóm theo loại, mở chi tiết ở cột hồ sơ căn (hàng 17) — khuôn của khối đích `data-grid-grouping-1`
(§2); luồng hiển nhiên, không tra thêm.
<!-- UX-SPEC-TEMPLATE>>> -->

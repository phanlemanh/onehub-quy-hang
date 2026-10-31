# Trục ai thấy hàng — thiết kế

Ngày 31/10/2026 · Hàng 12 của lộ trình (nền, dãy A, đợt nen-2) · Hồ sơ `_acceptance/truc-ai-thay-hang/` · **T3** (hạng
của hàng lộ trình — quyền đọc dữ liệu trong sàn) · đứng trên hàng 8 (lõi hàng và sự kiện, ADR-0008).

Câu giao: **Đầu chủ để lead và hàng chưa khoá nguồn ở «Chỉ tôi»; hàng lên «Toàn sàn» thì cả sàn mới thấy.** Ngưỡng ở
ô cơ hội (Cổng Đáng `build`, Manh Phan 30/10): lead và hàng chưa khoá nguồn ở «Chỉ tôi» chỉ người tạo đọc được qua API;
lên «Toàn sàn» thì mọi người trong sàn đọc được, sàn khác vẫn không.

## 1. Bài toán

Tham chiếu §6 trục 1: «Chỉ tôi → Nhóm → Toàn sàn. Lead và hàng chưa khoá nguồn mặc định «Chỉ tôi»; «Sẵn sàng bán» đưa
lên «Toàn sàn».» Hàng 8 dựng lõi hàng nhưng để mọi thành viên sàn đọc và gửi lệnh vào mọi hàng (Hỏi-2 của hàng 8, chờ
trục này). Hôm nay một telesales hay đầu chủ khác trong sàn gọi `GET /api/v1/listings` là thấy cả lead người khác đang
khai thác — đúng chỗ Sheet và nhóm Zalo làm lộ nguồn.

Hàng này dựng trục ở lõi và gắn vào bốn đường của API hàng. Chưa có màn.

## 2. Mô hình

### Hai nấc, tính ra từ sự kiện — không cột mới

| Nấc (nhãn) | Tên code | Khi nào | Ai đọc được |
|---|---|---|---|
| Chỉ tôi | `Private` | Từ lúc tạo, tới trước lần đầu hàng vào `Active` (Đang bán — «Sẵn sàng bán») | Chỉ người tạo hàng (người của sự kiện `created`) |
| Toàn sàn | `Company` | Từ lần đầu hàng vào `Active`, và giữ từ đó về sau (Hỏi-1) | Mọi thành viên của sàn |

- Nấc là **hàm thuần của dãy sự kiện** ở `packages/core/src/visibility/`, như độ tươi và mức đủ (Kiến trúc §1: số trên
  màn là bản tính ra từ sự kiện). Không thêm cột, không migration: người tạo là `actor_user_id` của sự kiện `seq = 1`;
  «đã từng Đang bán» đọc từ các sự kiện `status_changed`.
- Một luật, hai lối vào: `factsFromEvents(events)` gom «dữ kiện» (người tạo, các trạng thái từng tới) từ dãy sự kiện;
  danh sách hàng gom cùng dữ kiện ấy bằng một câu SQL. `visibilityOf(facts)` và `canRead(viewer, facts)` chỉ nhìn dữ kiện
  — luật nằm đúng một chỗ trong lõi, câu SQL chỉ chở dữ kiện, không chứa luật (ca kiểm so hai lối vào trên cùng hàng).
- Vai không mở «Chỉ tôi»: quản trị sàn, trưởng nhóm đều không đọc hàng «Chỉ tôi» của người khác ở bản này (Tham chiếu
  §6: quyền cấu hình tách khỏi quyền xem nguồn; trưởng nhóm thấy hàng của nhóm là nấc «Nhóm», để sau).

### Bốn đường API hàng (gốc `/api/v1`)

| Đường | Đổi gì |
|---|---|
| `GET /listings` | Chỉ trả hàng người gọi đọc được; mỗi hàng kèm `visibility` |
| `GET /listings/{listingId}` | Hàng «Chỉ tôi» của người khác trả **404 `not-found`** — y hệt mã hàng không có hay của sàn khác |
| `POST /listings/{listingId}/events` | Như trên: không đọc được thì **404**, không ghi gì — không đổi được hàng mình không thấy |
| `POST /listings` | Không đổi luật; trả về kèm `visibility: "Private"` |

- Cùng một câu trả lời 404 cho «không có», «sàn khác», «Chỉ tôi của người khác» — không đường nào để dò ra hàng tồn tại.
- Lệnh vào hàng «Chỉ tôi» của người khác bị chặn trước mọi xét khác (phiên bản, khuôn payload) để mã lỗi không lộ gì.
- Hàng «Toàn sàn»: mọi thành viên vẫn gửi được lệnh như hàng 8 — Hỏi-2 dưới.
- Bảng bốn đường là bảng viết trước: ca kiểm đọc tài liệu OpenAPI thật, đường mới chạm hàng mà chưa vào bảng thì đỏ
  (AC-10) — giá của việc chặn ở API được canh bằng máy.

### Chặn ở đâu

Chặn ở lõi + API (luật trong `packages/core`, API áp trên mọi đường hàng), **không** ở luật theo dòng của cơ sở dữ liệu:
ranh giới của hàng này cấm migration (đợt nen-2), và nấc tính từ sự kiện nên không có cột để luật theo dòng đọc. Cách ly
giữa **công ty** vẫn ở cơ sở dữ liệu như cũ (bất biến 1, không đổi). Giá của lựa chọn: một đường đọc mới đi thẳng vào
bảng mà không qua hàm của lõi sẽ không bị chặn — hàng 13 (đồng bộ, kéo qua API) phải đọc qua cùng hàm `canRead`. Ghi ở
sổ quyết định; nâng xuống luật theo dòng là việc của hàng sau khi trục có cột thật (ví dụ khi thêm «Nhóm»).

## 3. Không làm ở hàng này

- Nấc «Nhóm» và trưởng nhóm thấy hàng của nhóm — cần khái niệm nhóm; ngưỡng đã ký chỉ nói «người tạo».
- Người đổi nấc bằng tay (đẩy lên «Toàn sàn» sớm, hay hạ xuống) — cần loại sự kiện mới ở lõi hàng.
- Gán đầu chủ, chuyển lead từ telesales sang đầu chủ — hàng chia lead; tới đó «người tạo» mới đổi thành «người giữ».
- Trục 2 (hàng ra ngoài bằng cửa nào), lớp trường chủ nhà (hàng 11), mọi màn.

## 4. Câu cần người

- **Hỏi-1 — hàng đã lên «Toàn sàn» rồi tạm ngừng hay quay về: có hạ về «Chỉ tôi» không?** Khuyến nghị: **không hạ —
  một lần lên là giữ**. Lý do: đầu khách có thể đã gửi căn cho khách bằng link sống; hạ xuống làm hàng biến khỏi «Đã
  gửi» của họ. Lối khác: hạ về «Chỉ tôi» khi hàng rời Đang bán (Tạm ngừng) — giá: đầu khách mất dấu căn đang theo, và
  trục đổi qua lại theo trạng thái, khó giải thích.

- **Hỏi-2 — ai được gửi lệnh (đổi giá, đổi trạng thái) vào hàng «Toàn sàn» của người khác?** Khuyến nghị: **giữ như
  hàng 8 — mọi thành viên sàn** ở hàng này; siết quyền ghi theo vai (chỉ đầu chủ giữ căn, trưởng nhóm) làm ở hàng quyền
  theo vai, cùng lúc gán đầu chủ. Lý do: hàng này trả lời «ai thấy», không phải «ai sửa»; siết ghi bây giờ phải chọn ai
  là «người giữ» khi chưa có gán đầu chủ. Lối khác: chỉ người tạo ghi được cả ở «Toàn sàn» — giá: đầu khách không ghi được
  «Đã cọc» thắng ngay (luật 10) cho căn mình bán, phải nhắn người tạo.

## Đặc tả UX

Bỏ — hàng không chạm màn (sổ quyết định, dòng «bỏ đặc-tả-UX»).

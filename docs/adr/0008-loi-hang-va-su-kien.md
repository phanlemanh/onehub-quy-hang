# ADR-0008: Lõi hàng và sự kiện

Ngày: 2026-10-31 · Trạng thái: **accepted** (Manh Phan duyệt Cổng Phạm vi hồ sơ `loi-hang-va-su-kien` 30/10, Hỏi-1..4
theo khuyến nghị; duyệt kế hoạch 31/10) · Liên quan: Tham chiếu §4, §5, §7, luật 8–10, 15–18; Kiến trúc §1; ADR-0005,
ADR-0006, ADR-0007; hàng 8 của lộ trình

## Bối cảnh

Tham chiếu §4 chốt «Sự kiện: chỉ thêm, không sửa; ghi người và vai lúc làm» và «độ tươi, mức đủ thông tin và lịch sử
trả giá đều tính từ sự kiện». Kiến trúc §1: «bảng sự kiện chỉ ghi thêm; số trên màn là bản tính ra từ sự kiện». Mọi màn
sau đọc cùng một hàng, nên lõi này phải có trước màn.

## Quyết định

1. **Hai bảng** (migration 004). `listing_events` là nguồn sự thật, chỉ thêm: trigger từ chối sửa, xoá, truncate ở mọi
   vai kể cả chủ bảng; ngoại lệ duy nhất là xoá dây chuyền khi gỡ cả sàn. `listings` là bản tính: mọi cột tính lại được
   từ sự kiện bằng `foldListing` — xoá trắng bảng rồi gấp lại ra đúng bảng cũ. Cả hai bật và ép luật theo dòng; sự kiện
   chỉ ghi được dưới tên người đang làm.
2. **Một đường ghi.** `POST /api/v1/listings` (tạo) và `POST /api/v1/listings/{listingId}/events` (mọi thay đổi) là
   đường ghi duy nhất; câu ghi vào hai bảng chỉ nằm ở `packages/api/src/listings/`. Kiểm thử quét mã nguồn và quét hàm
   trong cơ sở dữ liệu giữ điều đó.
3. **Năm loại sự kiện** — `created`, `details_changed`, `price_changed`, `status_changed`, `owner_confirmed` — mỗi loại
   một khuôn payload chặt: khoá lạ ở bất kỳ cấp nào bị từ chối, nên thông tin chủ nhà (lớp `source`) không có đường vào.
   Khuôn viết tay trong lõi, không thêm thư viện.
4. **Sáu trạng thái chuẩn** theo RESO `StandardStatus`: `Incomplete`, `Active`, `Pending`, `Closed`, `Hold`,
   `Withdrawn`. Bảng chuyển 12 lối (Hỏi-3): `Incomplete` → `Active`/`Hold`/`Withdrawn`; `Active` →
   `Pending`/`Closed`/`Hold`/`Withdrawn`; `Pending` → `Active`/`Closed`/`Withdrawn`; `Hold` → `Active`/`Withdrawn`;
   `Closed`, `Withdrawn` là nấc cuối. Vào `Closed` bắt buộc giá chốt (`ClosePrice`, `CloseDate`); vào `Withdrawn` bắt
   buộc một trong ba lý do; vào `Active` cần giá kèm điều kiện phí, pháp lý, tình trạng sử dụng (Hỏi-1 — điều «ảnh thật»
   thêm khi có kho ảnh; «giá về tay» thay cho «giá kèm điều kiện phí» khi có phần tính giá).
5. **Độ tươi** = lần xác nhận gần nhất với chủ nhà; đổi giá, đổi trạng thái mặc định tính là xác nhận (luật 9), «Còn /
   giữ giá» luôn là xác nhận, lệnh tắt được cờ. Lõi không đọc đồng hồ; mốc «cần gọi lại» mặc định 14 ngày.
   **Mức đủ** = năm mục ngang nhau (Hỏi-4): giá kèm điều kiện phí, nội thất, pháp lý, tài chính, tình trạng sử dụng.
6. **Hai người cùng sửa**: lệnh mang `expectedVersion`; cũ thì 409 `version-conflict`. Sang `Pending` hay `Closed` thắng
   ngay nhưng vẫn xét bảng chuyển trên trạng thái hiện tại. Khoá theo hàng trong giao dịch; khoá chính
   `(company_id, listing_id, seq)` chặn trùng `seq`.
7. **Mọi thành viên của sàn gửi được lệnh** ở bản này (Hỏi-2); sự kiện ghi người và vai lúc làm.
8. Lõi xuất qua lối con `@quy-hang/core/listing`. Mã lỗi mới vào `API_ERRORS`: `version-conflict`,
   `invalid-transition`, `missing-requirement`, `invalid-payload`.

## Ngoài quyết định này

Chủ nhà, số chủ, giá đáy, mở số; gán đầu chủ cho hàng (đi cùng hàng chủ nhà); kiểm trùng «một hàng đang mở trên một
căn»; quyền theo vai và trục «Chỉ tôi → Nhóm → Toàn sàn»; hoàn tác; nhãn trạng thái riêng của sàn; ảnh; gắn mã căn danh
mục; mọi màn.

## Hệ quả

- Màn bảng hàng, hồ sơ căn, Hôm nay, màn cuộc gọi đọc `GET /api/v1/listings` và gửi lệnh qua một đường.
- Đổi luật chuyển, độ tươi hay mức đủ là sửa lõi rồi gấp lại bảng hàng từ sự kiện — sự kiện không bao giờ đổi.

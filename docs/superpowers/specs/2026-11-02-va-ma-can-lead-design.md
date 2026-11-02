# Vá mã căn của lead (va-ma-can-lead)

02/11/2026 · dãy G · sinh từ Ngoài-1 và Ngoài-2 của hồ sơ `va-dien-ma-can-cho-hang` (chủ kho chọn «mở hợp đồng mới» ở Cổng
Bằng chứng, `d-20261102T154054Z-13`, `-14`).

## Bài toán

PR #89 đặt luật «mã căn có ít nhất một chữ hay số» (`kiemMaCan`, `packages/core/src/listing/gan-ma-can.ts`) cho khuôn
`created` và `unit_number_assigned` của hàng. Lead chưa theo luật ấy:

- `validateLeadInput` (`packages/core/src/dedupe/index.ts`) kiểm `unitNumber` chỉ là chữ 1–200 ký tự — `POST /api/v1/leads`
  với «---» trả 201 và ghi lead. Bảng `leads` (migration 007) chỉ đòi `length(btrim(unit_number)) between 1 and 200`.
- `createListingFromLead` (`packages/api/src/leads/store.ts`) truyền nguyên `lead.unit_number` vào `createListing`; khuôn
  `created` từ chối, lỗi bị ném thành `RefusalAfterWrite` — lần bấm nào cũng hỏng, không có đường sửa mã ở lead. Màn chế
  độ cuộc gọi tự tạo hàng từ lead (hàng 28, Hỏi-5) đi cùng đường này.
- `resubmitLead` dựng lead mới từ `cu.unit_number` qua `createLead` → `validateLeadInput`: khi lõi siết, lead cũ mang mã rác
  bị trả lại thì gửi lại cũng hỏng, và người gửi lại không sửa được mã (thân chỉ mang số điện thoại).

## Hướng

1. **Lõi — ô nhận lead theo cùng luật.** `validateLeadInput`: `unitNumber` qua kiểm chữ mà `kiemMaCan` báo → một lỗi ở
   `unitNumber` mang đúng câu «Mã căn cần ít nhất một chữ (A–Z) hoặc số (0–9)» (`LY_DO_MA_CAN_KHONG_CHU_SO`). Không chép
   luật: gọi hàm của lõi hàng.
2. **Lead cũ mang mã rác — không kẹt.** Hai đường dựng lại từ bản ghi lead cũ bỏ mã căn mà `kiemMaCan` báo:
   - tạo hàng từ lead → hàng **chưa có mã căn** (như lead chỉ biết toà); đầu chủ gắn mã sau ở hồ sơ căn (ADR-0026);
   - gửi lại lead đã trả → lead mới **không mang mã căn**, chỉ toà.
   Mã hợp lệ đi nguyên như cũ. Bản ghi lead cũ không bị sửa.
3. **Web.** Ô nhận lead (`apps/web/src/app/(app)/leads/new/o-lead.tsx`) lấy mã căn từ tra danh mục (`docMa` → `canDoc`), nên
   không đưa được mã gõ tay toàn dấu; lỗi `unitNumber` ở đó hiện bằng câu riêng của màn. Không đổi màn ở vòng này.

## Ngoài phạm vi

- Dọn bản ghi lead cũ đang mang mã rác (sửa cột `unit_number`) — đổi dữ liệu thật, cần migration; hai đường dựng lại đã
  bỏ qua mã rác nên lead không kẹt.
- Câu báo trên ô nhận lead của web — màn chỉ gửi mã đọc từ danh mục.
- Ràng buộc ở cơ sở dữ liệu cho `leads.unit_number` — chạm `packages/db` (T3); lõi đã chặn ở đường ghi duy nhất.

## Đối chiếu ngành

| Năng lực | RESO | Sản phẩm khác | Ta làm | Ta viết cứng — họ cho cấu hình |
| --- | --- | --- | --- | --- |
| Khuôn mã căn ở lead | `UnitNumber` chuỗi tự do (DD 2.0) | kvCORE, Lofty: chưa kiểm | cùng luật với hàng: ít nhất một chữ hay số | không — luật nền để so căn (`app.unit_key`) |

## Kiểm thử

- Lõi: ma trận viết trước 10 mã (3 hợp lệ, 7 toàn dấu) qua `validateLeadInput` — mỗi mã toàn dấu đúng một lỗi ở
  `unitNumber` mang câu báo; lead không mã căn vẫn hợp lệ.
- API (Postgres dãy): nhập lead «---» → 400, không lead mới; «A-12.05» → 201. Lead mang mã rác chèn thẳng bằng kết nối chủ
  (như dữ liệu trước luật) → tạo hàng 201, hàng chưa mã, gắn mã sau được; trả lại rồi gửi lại → 201, lead mới không mã.
  Đối chứng cùng đường với mã hợp lệ: hàng và lead mới mang mã.

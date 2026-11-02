# Vá Điền mã căn — mã căn phải có chữ hay số (va-dien-ma-can-cho-hang)

02/11/2026 · dãy G · sinh từ Ngoài-2 và Ngoài-4 của hồ sơ `dien-ma-can-cho-hang` (chủ kho chọn «mở hợp đồng mới» ở Cổng
Bằng chứng, `d-20261102T085031Z-16`, `-18`).

## Bài toán

Khuôn của lõi nhận mã căn là «chữ 1–200 ký tự sau khi bỏ khoảng trắng» (`chu` trong `packages/core/src/listing/events.ts`).
Cơ sở dữ liệu so căn bằng `app.unit_key` (migration 007): bỏ mọi ký tự ngoài `0-9A-Za-z`, rỗng thì trả NULL. Mã toàn dấu
như «---», «.», «/» qua được khuôn nhưng `app.unit_key` ra NULL, nên:

- kiểm trùng hàng đang mở (`hangMoCungCan`, so `app.unit_key = app.unit_key`) không bao giờ khớp — bỏ qua im;
- hàng mang mã ấy bị khoá (ADR-0026: gắn một lần), không gắn lại được, không tải ảnh được (`unit_photos` đòi
  `app.unit_key(unit_number) is not null`).

Ô «Mã căn» trên web chỉ cắt khoảng trắng; lỗi khuôn đi qua `moTaLoi` thành câu chung «Lần sửa không hợp lệ».

## Hướng

1. **Lõi — một luật «mã căn có ít nhất một chữ hay số»** theo đúng tập ký tự của `app.unit_key` (`0-9A-Za-z`), một hàm có
   tên `kiemMaCan(chu)` trong `gan-ma-can.ts` trả `null` hay câu báo «Mã căn cần ít nhất một chữ (A–Z) hoặc số (0–9)».
   Khuôn của `unit_number_assigned.unitNumber` và `created.unitNumber` cùng dùng luật này — hai đường đưa mã căn vào hàng.
   Không theo chữ có dấu tiếng Việt: `app.unit_key` bỏ chúng, nên «Đ» một mình vẫn ra NULL.
2. **Máy chủ** — không đổi mã: lệnh đi qua `validatePayload` của lõi, mã toàn dấu bị từ chối 400 `invalid-payload` nêu
   trường `unitNumber` và câu báo; không sự kiện nào ghi, hàng vẫn chưa mã, gắn lại mã đúng được.
3. **Web** — `dungLenhGanMa` (`apps/web/src/app/(app)/units/ho-so/ho-so.ts`) gọi `kiemMaCan` trước khi dựng lệnh: mã toàn
   dấu trả câu báo ấy tại ô, không vào hàng đợi.

## Ngoài phạm vi

- Dọn hàng đã mang mã rác: tính năng gắn mã vừa ra (PR #85), chưa có bản thật dùng.
- Mã căn ở lead (ô nhận lead) — migration 007, 009 đã chặn `app.unit_key(p_unit) is null`.

## Đối chiếu ngành

| Năng lực | RESO | Sản phẩm khác | Ta làm | Ta viết cứng — họ cho cấu hình |
| --- | --- | --- | --- | --- |
| Khuôn mã căn | `UnitNumber` là chuỗi tự do (DD 2.0) | kvCORE, Lofty: chưa kiểm khuôn số căn | đòi ít nhất một chữ hay số, theo cách so căn của kho | không — luật nền tảng để so căn (`app.unit_key`), không phải tuỳ sàn |

## Kiểm thử

- Lõi: ma trận viết trước cho hai khuôn (`created`, `unit_number_assigned`): hợp lệ «A-12.05», «a 02.06», «12»; từ chối
  «---», «.», «/ /», «Đ» — mỗi ca đúng một lỗi ở `unitNumber` mang câu báo.
- API (Postgres dãy): gắn «---» → 400 nêu `unitNumber`, không sự kiện mới; gắn lại «A-12.05» → 200.
- Web: `dungLenhGanMa(hàng chưa mã, "---")` → câu báo, không lệnh.
- Xem bằng mắt (máy dev G): gõ «---» ở ô Mã căn → lời báo tại ô, hàng vẫn chưa mã.

# Vá nạp mẫu bản thật: căn mẫu Đang bán có ảnh thật — thiết kế

Hàng `nap-mau-co-anh` (dãy H, sau 23). Hồ sơ: `_acceptance/nap-mau-co-anh/`.

## Vì sao

Hàng 23 (`san-sang-ban`) thêm luật lõi: vào Đang bán cần ít nhất một ảnh thật của căn (ngăn Gửi được, không ảnh mẫu,
chưa xoá). Bộ nạp mẫu bản thật (`packages/db/seed/nap-ban-that.ts`, hàng 87) đưa 29 hàng lên Đang bán (14 Đang bán, 5
Đã cọc, 5 Đã bán, 5 Tạm giữ) mà không thêm ảnh, nên trên sàn mới nút «Nạp dữ liệu mẫu» dừng ở hàng Đang bán đầu tiên và
rút lại cả lần chạy. Hàng 23 ghi điều này là hạn chế đã biết và để lại cho hàng này (sổ `san-sang-ban`
d-20261101T155806Z-15). Công cụ dựng dev của hàng 17 đã được hàng 23 vá (d-20261101T155806Z-14) — không chạm ở đây.

## Cách làm

1. **Ảnh vẽ bằng mã** — tệp mới `packages/db/seed/anh-mau.mjs`: hàm thuần sinh một PNG 640×480 (bản gốc) và 160×120 (bản
   nhẹ) gồm khối màu theo thứ tự hàng, không chữ, không dữ liệu thật. Cùng thứ tự ra cùng từng byte.
2. **Bộ nạp thêm ảnh trước lệnh lên Đang bán** — trong `napBanThat`, với mỗi hàng MỚI tạo có trạng thái khác Chưa đủ và
   Ngừng hẳn: sau `details_changed`, gọi `addPhoto` của API ảnh (đường ghi duy nhất, hàng 18) dưới vai `quy_hang_app`
   bằng đầu chủ của hàng, ngăn `shareable`, rồi mới `status_changed → Active`. Hàng đã có (chạy lại) không thêm ảnh —
   chạy lại không đổi gì như cũ.
3. **Kho byte chọn như API** — `napBanThat` nhận `kho` trong `opts`; dòng lệnh chọn bằng `chonKhoAnh(process.env)`: đủ
   ba khoá `STORAGE_S3_*` → Supabase Storage; không khoá ngoài bản thật → bảng `unit_photo_files`; bản thật
   (`NODE_ENV=production`) thiếu khoá → thoát mã 1 TRƯỚC khi mở kết nối, lời báo nêu ba biến thiếu, không câu nào chạm
   cơ sở dữ liệu (Hỏi-1).
4. **Hỏng giữa chừng không để lại byte mồ côi** — Storage không nằm trong giao dịch: bộ nạp bọc kho bằng một lớp ghi sổ —
   mỗi lệnh `ghi` của kho ghi `(companyId, photoId)` vào sổ của lần chạy TRƯỚC khi chuyển xuống kho thật, nên ảnh mà
   `addPhoto` ném giữa chừng (byte đã tải, dòng chưa ghi) vẫn có trong sổ. Lần chạy ném lỗi thì xoá từng mã trong sổ khỏi
   kho (cố gắng hết, lỗi xoá không che lỗi gốc) rồi mới rollback. Mọi mã trong sổ mang mã sàn mẫu vì bộ nạp chỉ gọi
   `addPhoto` với sàn ấy.
5. **Gỡ xoá cả byte** — `goBanThat` nhận `kho`; trước khi xoá sàn mẫu, đọc mã mọi ảnh của ĐÚNG sàn mẫu (câu lọc
   `company_id = <sàn mẫu>` trên kết nối vai chủ, sàn mẫu đã xác định bằng `timSanMau` — tên cùng quản trị mẫu) và xoá
   byte qua `kho.xoa(<sàn mẫu>, <mã>)` (Storage: hai đối tượng dưới tiền tố mã sàn mẫu; Postgres: dòng
   `unit_photo_files` — cascade cũng xoá, gọi vẫn vô hại). Đây là lệnh xoá trên Storage bản thật, không đảo được — Hỏi-2.
6. **Nút trên GitHub** (`.github/workflows/nap-mau.yml`, ngoài vùng hàng — đã xin giám sát, yêu cầu H-11): bước «Chạy bộ
   nạp» nhận `STORAGE_S3_ACCESS_KEY`, `STORAGE_S3_SECRET_KEY`, `STORAGE_S3_ENDPOINT` từ secret của environment
   `production`, chỉ ở bước ấy như `OWNER_PHONE_KEY`. Bài kiểm `nap-mau-yml.test.mjs` thêm ca cho ba biến.
7. **README** của `packages/db/seed/` ghi ảnh mẫu và bước một lần: thêm ba secret ở environment `production` (cùng giá trị
   Vercel Production). Việc thêm secret là của chủ kho — máy không có giá trị (ra khỏi kho).

## Lựa chọn đã loại

- Luôn ghi byte vào Postgres: không cần secret, nhưng bản thật đọc ảnh từ Storage nên 29 căn mẫu hiện ô ảnh vỡ — lối khác
  của Hỏi-1.
- Đánh dấu ảnh vẽ là «ảnh mẫu» (`is_sample`): luật lõi không đếm ảnh mẫu, hàng vẫn không lên Đang bán.
- Hạ luật ảnh thật cho sàn mẫu: phạm luật lõi của hàng 23 (ảnh thật là luật cho MỌI lối vào Đang bán) — chết.
- Ghi thẳng `unit_photos` bằng SQL vai chủ: bỏ qua đường ghi duy nhất (sự kiện `added`, luật ai thêm được) — chết theo
  AGENTS.md «API: đường ghi duy nhất».

## Không làm

- Không đổi gói `mau/du-lieu-mau.json` hay bộ sinh (`sinh.mjs`): ảnh suy tất định từ thứ tự hàng.
- Không thêm ảnh cho sàn mẫu đã nạp trước hàng 23 (hàng đã có thì bỏ qua); sàn ấy gỡ rồi nạp lại là có ảnh.
- Không ảnh ngăn Nội bộ, không ảnh bìa riêng (ảnh đầu tự là ảnh đầu ngăn).
- Không đụng giao diện: không màn nào đổi.

## Đối chiếu ngành (ADR-0022)

Không áp: hàng là công cụ nạp dữ liệu mẫu, không thêm năng lực, đối tượng nghiệp vụ hay danh sách cố định nào cho sàn.
Luật ảnh thật và số ảnh tối thiểu của sàn đã đối chiếu ở hàng 23 (Đối chiếu ngành §7); bộ nạp chỉ tuân theo nó.

## Đặc tả UX

Bỏ — hàng không chạm giao diện (sổ quyết định, dòng «bỏ đặc-tả-UX»).

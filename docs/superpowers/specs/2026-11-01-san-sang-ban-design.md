# Sẵn sàng bán — thiết kế (hàng 23, dãy H)

Câu giao: «Đầu chủ bấm «Sẵn sàng bán» và căn lên bảng hàng chung ngay khi máy kiểm đủ giá về tay, ảnh thật, pháp lý,
tình trạng sử dụng; thiếu thì chỉ đúng chỗ thiếu». Luật 17 (Tham chiếu §8): một chạm, không qua người duyệt. Đứng trên
hàng 12 (trục ai thấy hàng — lần đầu Đang bán thì lên «Toàn sàn») và hàng 18 (ảnh căn ba ngăn).

## Hiện trạng

- Lõi đã chặn lối vào Đang bán (`packages/core/src/listing/status.ts`, `missingFor('Active')`): giá, điều kiện phí,
  pháp lý, tình trạng sử dụng. ADR-0008 quyết định 4: «điều ảnh thật thêm khi có kho ảnh; giá về tay thay cho giá kèm
  điều kiện phí khi có phần tính giá». Kho ảnh có từ hàng 18; phần tính giá là hàng 28, chưa có.
- API đổi trạng thái: `POST /api/v1/listings/{id}/events` (`status_changed`), ngữ cảnh kiểm = trạng thái gấp từ sự kiện
  + payload; thiếu → 400 `missing-requirement` kèm `missing[]`. Chưa đọc ảnh.
- Lối lên Đang bán trên web: trình sửa ô Trạng thái và sửa hàng loạt ở Bảng hàng (kiểm trên máy bằng `missingFor`).
- Hồ sơ căn (`units/ho-so/cot-ho-so.tsx`, khối `solution-crm-4`) chỉ đọc: trạng thái là nhãn, chưa có nút.

## 1. Ảnh thật là điều của lõi (căn cứ ADR-0008)

- `Requirement` thêm `realPhoto`; `TransitionContext` thêm `realPhotoCount?: number`.
- `missingFor('Active')` đòi `realPhotoCount ≥ 1` khi ngữ cảnh có số đếm. Ảnh thật = ảnh của căn (toà + mã) ở ngăn
  Gửi được, không đánh dấu «Ảnh mẫu», chưa xoá (Tham chiếu §5 luật 27–28, `nhanAnh` của hàng 18).
- **API luôn đưa số đếm**: khi lệnh là `status_changed` sang `Active`, `applyCommand` đếm ảnh thật của căn trong cùng
  giao dịch (vai `quy_hang_app`, luật theo dòng của `unit_photos`) rồi mới `checkTransition`. Mọi lối vào Đang bán đi
  qua đây — nút mới, sửa ô, sửa hàng loạt, đồng bộ — nên không lối nào lách được.
- Máy của đầu chủ không giữ ảnh (hàng 18, Hỏi-5). Hỏi-2: Bảng hàng (sửa ô, sửa hàng loạt) khuyến nghị không kiểm ảnh trên
  máy (không có số đếm); máy chủ từ chối và lỗi về danh sách «Cần xem» với chữ «thiếu ảnh thật». Lối khác: Bảng hàng đọc
  số ảnh qua API khi có mạng — báo ngay nhưng thêm một lời gọi mỗi hàng. Nút «Sẵn sàng bán» có số đếm (đọc danh sách ảnh
  của căn, đếm bằng đúng định nghĩa của máy chủ) nên báo ngay; máy chủ vẫn từ chối được (ảnh vừa bị xoá ở máy khác) — khi
  ấy bộ đồng bộ trả hàng về trạng thái cũ và «Cần xem» ghi lý do, như mọi lệnh bị từ chối.
- **Số ảnh tối thiểu là điểm cấu hình của sàn** (Hỏi-1, ADR-0018): khoá `listing.ready_min_real_photos`, kiểu `int`,
  mặc định 1, khoảng 1–20, Quản trị sàn đổi, ở bảng `company_settings` (khoá vắng → mặc định của lõi). Sàn nâng được,
  không bỏ được — giữ nghĩa «Đang bán» của điều khoá K7 (Sổ điểm biến thiên) và đúng chiều «chỉ thêm, không bớt» của
  ứng viên B#28. API đọc khoá trong cùng giao dịch đổi trạng thái; ngữ cảnh lõi mang `minRealPhotos`. Hàng này chỉ
  đọc khoá; màn chỉnh cấu hình là hàng màn sau (cột «Màn» của sổ).
- Giá về tay: giữ «giá kèm điều kiện phí» thay chỗ tới hàng 28 (ADR-0008); nhãn thiếu ghi «giá về tay (giá + điều kiện
  phí)».

## 2. Nút «Sẵn sàng bán» ở hồ sơ căn

- Đặt ở đầu mục «Lần rao đang mở» của hồ sơ căn, khi lần rao đang mở ở «Chưa đủ để rao» hoặc «Tạm ngừng» (hai trạng
  thái có lối vào Đang bán mà không phải khách bỏ cọc). Người sửa được hàng mới thấy nút (cùng luật sửa của hàng 12).
- Bấm → máy kiểm bằng luật lõi với ngữ cảnh là hàng trên máy + số ảnh thật đọc từ API ảnh:
  - Đủ → gửi lệnh đổi trạng thái sang Đang bán qua đúng đường lệnh của trình sửa ô (`dungLenhTrangThai`, hàng đợi đồng
    bộ); nhãn trạng thái đổi «Đang bán»; hàng lên «Toàn sàn» (hàng 12, gấp từ sự kiện).
  - Thiếu → danh sách «Còn thiếu» ngay dưới nút, mỗi điều một dòng đúng tên; dòng «Ảnh thật» nhảy tới mục Ảnh; dòng giá,
    pháp lý, tình trạng sử dụng đánh dấu «Chưa có» đúng ô của mục «Lần rao đang mở» và ghi «điền ở Bảng hàng».
- Mã giao diện ở `apps/web/src/app/(app)/units/ready/` (vùng của hàng): hàm kiểm thuần `kiemSanSang` + thành phần nút.
  Thành phần: `Button` và danh sách của bộ thành phần đã cài (thang dùng lại bậc 5–6), không khối mới, không «Chỗ hở».

## Đối chiếu ngành

| Năng lực | RESO | CRM Mỹ | Meey CRM | Ta làm | Ta viết cứng — họ cho cấu hình |
|---|---|---|---|---|---|
| Điều kiện lên bảng (vào `Active`) | `StandardStatus` `Active`; Data Dictionary không định điều kiện vào ([dd.reso.org](https://dd.reso.org/)) | chưa kiểm | chưa kiểm ([meeycrm.com](https://meeycrm.com/)) | Bốn điều của lõi: giá về tay, ảnh thật, pháp lý, tình trạng sử dụng | Ba điều giữ cứng (điều khoá K7: nghĩa «Đang bán» trên trang khách); số ảnh tối thiểu cho sàn cấu hình — Hỏi-1 |
| Ảnh tối thiểu khi lên `Active` | `Media` không định số tối thiểu | MLS Mỹ mỗi nơi một luật: ValleyMLS đòi một ảnh mặt trước trước khi hàng Active ([ValleyMLS Rules](https://www.scribd.com/document/473759807/ValleyMLS-Rules-Regs)); CRMLS phạt khi thiếu ảnh ngoài nhà ([CRMLS](https://blog.crmls.org/?p=283)); SmartMLS cho 48 giờ ([SmartMLS](https://matrix.smartmls.com/hc/en-us/articles/13118343449371-Photos-required-on-listings)); OneKey 24 giờ ([OneKey MLS](https://support.onekeymls.com/hc/en-us/articles/43263101370388-Photograph-Required-for-All-Listings)) | chưa kiểm | Mặc định 1 ảnh thật trước khi lên bảng, sàn nâng được | Cấu hình theo sàn (`listing.ready_min_real_photos`), không hạn giờ — hạn giờ là ứng viên khi sàn xin |

## 3. Ranh giới mã

- `packages/core/src/listing/status.ts` (+ test) — điều `realPhoto`, đọc cấu hình `listing.ready_min_real_photos`.
- `packages/api/src/listings/store.ts` — đếm ảnh thật trước khi kiểm; `packages/api/test-db/san-thu.ts` và các bài tạo
  hàng Đang bán qua API thêm một ảnh thật.
- `apps/web/src/app/(app)/inventory/cell-edit/lenh.ts` — nhãn thiếu `realPhoto`.
- `apps/web/src/app/(app)/units/ready/` (mới), `units/ho-so/cot-ho-so.tsx` — gắn nút.
- `docs/product/tham-chieu.md` §12 — một dòng sổ quyết định; `docs/adr/0008-loi-hang-va-su-kien.md` — điều ảnh thật đã thêm;
  `docs/architecture/so-diem-bien-thien.md` — điểm mới `listing.ready_min_real_photos`, K7 trỏ sang; `docs/product/doi-chieu-nganh.md`
  §7 — luật ảnh tối thiểu của MLS.

## Đặc tả UX

<!-- ux-spec:start -->
### Khuôn IA đã chọn + căn cứ

Không đổi bố cục hồ sơ căn (khối `solution-crm-4`, `vo-va-ia.md` dòng hồ sơ căn — số hàng 23 đã có trong dòng ấy).
Nút đặt ở đầu mục «Lần rao đang mở», danh sách thiếu ngay dưới nút.

### Màn và trạng thái

| Trạng thái | Thấy gì |
|---|---|
| Lần rao ở Chưa đủ để rao / Tạm ngừng, người sửa được | Nút «Sẵn sàng bán» |
| Đã Đang bán, Đang giao dịch, hay người không sửa được | Không có nút; nhãn trạng thái như cũ |
| Bấm, còn thiếu | «Còn thiếu:» + mỗi điều một dòng (Giá về tay · Ảnh thật · Pháp lý · Tình trạng sử dụng); «Ảnh thật» là liên kết tới mục Ảnh; ô thiếu trong mục «Lần rao đang mở» ghi «Chưa có» |
| Bấm, đủ | Nhãn đổi «Đang bán», nút ẩn |
| Ngoại tuyến | Nút mờ, chữ «Cần mạng để kiểm ảnh» |
<!-- ux-spec:end -->

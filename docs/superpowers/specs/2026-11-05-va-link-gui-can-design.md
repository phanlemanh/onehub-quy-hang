# Vá nút «Gửi căn» — thiết kế

Hàng `va-link-gui-can` của lộ trình, vá hàng 36 (`da-gui`) và hàng 37 (`hom-nay-dau-khach`). Thấy tình cờ ở lần rà soát
tạo · xem · sửa · gỡ và phân quyền (`docs/plan/ra-soat-crud-phan-quyen.md` mục 5).

## Vấn đề

Ở trạng thái trống của «Đã gửi» (`apps/web/src/app/(app)/shares/danh-sach.tsx`) và của dòng tin Đầu khách ở Hôm nay
(`apps/web/src/app/(app)/today/buyer/dong-tin.tsx`), nút «Gửi căn» trỏ `/inventory/cards`. Đó là thư mục mã của bảng thẻ
(hàng 32), không có `page.tsx`, nên bấm ra «Không thấy trang này» (HTTP 404). Đã thấy trên bản chạy: vai Đầu khách mẫu,
khổ 375×812, cả hai nút. Hai bài kiểm cũ (`da-gui.test.ts`, `dau-khach.test.ts`) còn ghim đúng đích sai nên không bắt.

Bảng thẻ hiện ở chính `/inventory` dưới khổ `md` (Tham chiếu §12, 03/11: «cùng địa chỉ `/inventory` … dưới `md` là thẻ»);
trên máy tính cùng địa chỉ là bảng hàng. Thiết kế hàng 36 ghi nút «về Bảng hàng thẻ», hàng 37 ghi «mở Bảng hàng để chọn
căn gửi».

## Cách làm

- Hai nút trỏ `/inventory`. Không thêm tham số: luồng gửi bắt đầu bằng giữ lâu một thẻ hay nút «Chọn» trên bảng thẻ
  (hàng 32, 34), không có chế độ mở sẵn nào để trỏ tới.
- Sửa hai bài kiểm cũ cho khớp đích mới.
- Bài kiểm mới `apps/web/src/app/link-noi-bo.test.ts`: dựng tập đường thật từ cây `src/app` (mọi `page.tsx`, `route.ts`;
  bỏ nhóm `(x)`; khớp `[x]`, `[...x]`, `[[...x]]`), quét mọi đường tĩnh trong mã giao diện (`href="/…"`, `href={"/…"}`,
  `` href={`/…`} ``, `href: "/…"`, `redirect(…)`, `router.push/replace(…)`; `${…}` là một đoạn động; bỏ truy vấn, neo,
  `/api/`, `//`) và đòi mọi đường có trang. Kèm ma trận khớp viết trước, ca riêng cho hai nút, và chiều đỏ trên một mẫu mã
  trỏ `/inventory/cards`. Trên cây trước khi sửa, bài đỏ đúng hai dòng — hai nút này — và không dòng nào khác.

Không đổi: chữ, kiểu nút, bố cục của hai trạng thái trống; bảng thẻ; tuyến trang; Tham chiếu (bảng tuyến đã đúng).

Đối chiếu ngành (ADR-0022): không áp — vòng không thêm đối tượng, danh sách hay luật nghiệp vụ nào; chỉ sửa đích của một
link về màn đã chốt.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Đầu khách chưa gửi link nào mở «Đã gửi» (hay Hôm nay không có gì mới trong 7 ngày) → bấm «Gửi căn» → Bảng
  hàng mở (điện thoại: dạng thẻ) → giữ lâu một thẻ để chọn căn gửi (hàng 32, 34).
- Biên: Bảng hàng chưa có căn nào → bảng thẻ hiện trạng thái trống của nó («Chưa có căn nào trên bảng hàng chung»), vẫn
  là màn có thật.
- Lỗi & quay lại: không còn trang «Không thấy trang này»; lùi lại về đúng màn vừa rời.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Đã gửi (`/shares`) | xem các link đã gửi | thanh dưới / Bảng hàng (khi trống) |
| Hôm nay — Đầu khách (`/today`) | thấy khách vừa phản ứng | thanh dưới / Bảng hàng (khi trống) |
| Bảng hàng (`/inventory`) | chọn căn để gửi | hai nút trên / màn gửi |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-dg-trong | Đã gửi | «Chưa gửi link nào» + nút «Gửi căn» mở `/inventory` | chọn căn gửi |
| ST-hndk-trong | Hôm nay — Đầu khách | «Chưa có gì mới trong 7 ngày» + nút «Gửi căn» mở `/inventory` | chọn căn gửi |
| ST-bang-the | Bảng hàng (điện thoại) | bảng thẻ (hay trống của bảng thẻ khi chưa có căn) | giữ lâu một thẻ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Cùng một địa chỉ cho mọi khổ: dưới `md` là bảng thẻ, từ `md` là bảng hàng — `inventory/page.tsx` quyết theo khổ.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Button` + `TrangThai` | dùng | giữ nguyên, chỉ đổi đích của link |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: không đổi IA — chỉ sửa đích của nút sẵn có về đúng màn mà thiết kế hàng 36, 37 đã chọn; luồng hiển nhiên.
### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Đầu khách |
| Việc chính | từ một màn trống, đi chọn căn để gửi khách |
| Tần suất | ít — lúc mới dùng hay tuần vắng |
| Số bản ghi | một |
| Thiết bị | điện thoại |
<!-- UX-SPEC-TEMPLATE>>> -->

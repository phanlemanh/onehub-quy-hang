# Review findings: cach-goi-rieng (round 1)

## Trong hợp đồng

- **Saved views of Bảng hàng (/inventory/views/<id>) never get the company's labels**
  AC: AC-4
  file: `apps/web/src/app/(app)/inventory/views/[id]/page.tsx:14`
  severity: medium
  source: conventions
  detail: This change makes the grid, the phone cards, the filter options, the cell editors and the export dialog read the company's labels through `useTuVung()`. The default value of that context is `TU_VUNG_RONG`. Only `inventory/page.tsx` was updated to call `GET /api/v1/company/labels` and wrap the screen in `<TuVungProvider>`. The saved-view page is the same Bảng hàng ("cùng bảng, áp cách xem đã lưu"), but it still renders `<BangHang>` and `<BangTheDienThoai>` with no provider. So when a company has set «Phí CN»/«BP», opening a saved view shows the built-in names again: column headers, fee cells, filter options, sort order by displayed text, and the export (phát hàng) opened from that view, because `moXuat.tuVung = tv` is empty. That breaks AC-4/AC-6 («đầu chủ mở Bảng hàng … tiêu đề cột phí là «Phí CN»», export uses the company's names) on a route that belongs to Bảng hàng. Fix: give this page the same server-side read and `TuVungProvider` wrapping as `inventory/page.tsx`, and add a test or eval for the saved-view route.

- **doiNhan compares JSON.stringify output against jsonb read back from the database. jsonb reorders keys, so a field with two or more custom value names is rewritten and logged on every save**
  AC: AC-2
  file: `packages/core/src/labels/index.ts:196`
  severity: medium
  source: bugs
  detail: `doiNhan` decides whether a key changed with `cu.get(r.key) !== JSON.stringify(r.value)`. The old value comes from `company_settings.value`, which is jsonb. Postgres jsonb does not keep key order: it sorts keys by length, then bytewise. The new map built in `dungDongNhan` follows the order of the request body, which is the order of `bangNhan`/TAP_DONG (included, excluded / sold_elsewhere, owner_changed_mind, unreachable). Example: feeInclusion {included:'BP', excluded:'KBP'} comes back from the DB as {"excluded":…,"included":…}. That string never equals the new one, even when nothing changed. Result: whenever a field has two or more custom value names, every press of «Lưu» upserts the `labels.value.<field>` row and trigger 026 writes one more audit event. This breaks the stated rule «khoá giữ nguyên không ghi lại (không thổi phồng nhật ký)». The DB test (packages/api/test-db/cach-goi-rieng/nhan.test.ts) only uses maps with one key, so it misses this. Fix: compare with key-order-independent deep equality, or sort keys before stringify.

- **The saved-view page /inventory/views/[id] has no TuVungProvider, so the grid, phone cards and Phát hàng show default names instead of the company's custom names**
  AC: AC-4
  file: `apps/web/src/app/(app)/inventory/views/[id]/page.tsx:15`
  severity: medium
  source: bugs
  detail: This round, `inventory/page.tsx` reads `GET /api/v1/company/labels` and wraps BangCoHoSo/BangTheDienThoai in `TuVungProvider`. The saved-view page still renders `<BangHang>` and `<BangTheDienThoai>` directly, with no provider. `useTuVung()` there returns the default `TU_VUNG_RONG`. On a saved view, everything uses the built-in labels: column headers (`nhanCot`), fee and withdrawal-reason cells, filter options, sorting, the cell editor, and the Phát hàng dialog (`moHopXuat` passes `tuVung: tv`, which is empty). So the same company sees «Phí CN»/«BP» on /inventory but «Phí»/«Bao phí» on /inventory/views/<id>, and exports from a saved view also come out with default names. There is no error and nothing is reported.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Withdrawal-reason picker in the cell editor still shows built-in names while the grid shows the company's names**
  Người dùng thấy gì: Khi sàn đặt tên riêng cho lý do ngừng, ô trong bảng hiện tên riêng nhưng danh sách chọn lý do vẫn hiện tên mặc định, nên cùng một lý do có hai tên khác nhau trên cùng màn.
  Căn cứ: Chỉ lệch chữ hiện, không mất hay lộ dữ liệu, giá trị lưu vẫn đúng; người dùng vẫn chọn được đúng lý do và sửa sau rẻ.
  file: `apps/web/src/app/(app)/inventory/cell-edit/tren-o.tsx`
  severity: low
  Đề xuất: known-limits

- **Withdrawal-reason picker in the status editor (and the bulk bar) ignores custom names, so the cell and the picker show different words**
  Người dùng thấy gì: Danh sách chọn lý do ngừng, ở ô sửa và ở thanh thao tác hàng loạt, vẫn hiện tên mặc định dù bảng đã hiện tên riêng của sàn, nên người dùng thấy hai cách gọi cho một lý do.
  Căn cứ: Chỉ là chữ hiện lệch nhau, dữ liệu không mất hay lộ; người dùng vẫn thao tác đúng và sửa sau rẻ.
  file: `apps/web/src/app/(app)/inventory/cell-edit/tren-o.tsx`
  severity: low
  Đề xuất: known-limits

- **Duplicate-name check only compares labels that differ from the default, so one value can be renamed to another value's default name**
  Người dùng thấy gì: Quản trị sàn có thể đặt cho một giá trị đúng tên mặc định của giá trị kia, khiến hai giá trị hiện cùng một chữ trên bảng, bộ lọc, bản phát hàng và trang khách, khó phân biệt.
  Căn cứ: Gây nhầm lẫn khi đọc và lọc nhưng không mất dữ liệu, quản trị tự đổi tên lại được; sửa cần chốt luật trùng tên nên đáng làm riêng.
  file: `packages/core/src/labels/index.ts`
  severity: low
  Đề xuất: new-contract

- **Hình dạng 1 — đo mã nguồn của hộp thoại thay vì đầu ra; đường nối từ Bảng hàng vào hộp thoại không được đo**
  Người dùng thấy gì: Bài kiểm tra bản phát hàng dùng tên riêng chỉ đọc chữ trong mã, nên nếu sau này ai làm mất đoạn nối đó, bản phát hàng quay về tên mặc định mà bài kiểm tra vẫn báo xanh.
  Căn cứ: Không ảnh hưởng người dùng hiện tại, chỉ làm lưới an toàn lỏng hơn; có thể bù sau bằng bài kiểm chạy thật.
  file: `apps/web/src/app/(app)/inventory/phat-hang/tu-vung.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — chỉ kiểm chuỗi `chanMucSan(` đứng trước chuỗi API trong mã nguồn, không kiểm trang có thật sự chặn**
  Người dùng thấy gì: Bài kiểm tra việc chặn người không phải quản trị vào màn Cách gọi chỉ xem có lời gọi chặn trong mã, nên nếu việc chuyển hướng bị gỡ mà lời gọi còn, bài kiểm tra vẫn xanh.
  Căn cứ: Hiện trang vẫn chặn đúng nên người dùng không bị ảnh hưởng; rủi ro chỉ là bỏ sót lỗi trong tương lai.
  file: `apps/web/src/app/(app)/settings/labels/cach-goi.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — hồ sơ hứa «năm dòng mẫu» nhưng phép đo chỉ có một dòng**
  Người dùng thấy gì: Bài kiểm tra sàn chưa đặt tên riêng chỉ thử một dòng mẫu thay vì năm, nên một vài giá trị như Không bao phí chưa được kiểm trực tiếp.
  Căn cứ: Rủi ro rất thấp vì hành vi mặc định là đường đi đơn giản và đã được kiểm ở các ca khác; thêm dòng mẫu không đáng mở việc riêng.
  file: `apps/web/src/app/(app)/inventory/tu-vung.test.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

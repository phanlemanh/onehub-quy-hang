# Review findings: va-loi-doc-can-ngoai-khu (round 2)

## Trong hợp đồng

- **Hình dạng 5 — Tuyên quét LỚP «bản giữ hỏng» theo các nhánh của docBanGiuNgoaiKhu nhưng chỉ có một điểm-case JSON cắt cụt, nhánh lọc dòng sai không được chạy**
  file: `apps/web/src/app/(app)/inventory/loi-doc-can-ngoai-khu.test.ts:99`
  severity: medium
  AC: AC-1
  source: measurement
  detail: Mục Coverage Trục B của contract.md lấy thước là «các nhánh của docBanGiuNgoaiKhu», và AC-1 hứa cả trường hợp «bản giữ hỏng». Hàm này có một nhánh riêng cho mảng đọc được nhưng có dòng sai: `v.filter(laCanNgoaiKhu)` (danh-muc.ts:37). Bảng năm ca ở dòng 97-103 chỉ có một ca hỏng là chuỗi JSON cắt cụt (dòng 99), đi vào nhánh catch. Bốn ca còn lại là vắng, `[]`, `[NK[0]]` và `NK`, đều chỉ chứa dòng hợp lệ, nên filter luôn trả nguyên mảng. loai-hinh.test.ts:133-146 cũng chỉ dùng dữ liệu hợp lệ. `assert.equal(chay, 5)` chỉ ghim độ dài bảng đã liệt kê, không ghim bảng phủ đủ các nhánh mà thước đã khai. Bỏ `.filter(laCanNgoaiKhu)` thì E3 vẫn xanh, trong khi bản giữ `[null]` sẽ làm `chiMuc` ném lỗi ở `c.id` (ghep-danh-muc.ts, `new Map(... .map((c) => [c.id, c]))`), đúng kịch bản «bản giữ hỏng làm bảng sập» mà gap-probe P1 nêu. Thiếu ca mảng có phần tử sai, ví dụ `[null]` hoặc `[{"id":1}]`, kèm kết quả mong đợi viết trước.

- **Hình dạng 5 — Ma trận «thân sai khuôn» chưa đủ: ba trường × {thiếu, sai kiểu} là sáu phần tử, bảng chỉ có bốn**
  file: `apps/web/src/app/(app)/inventory/loi-doc-can-ngoai-khu.test.ts:52`
  severity: low
  AC: AC-1
  source: measurement
  detail: AC-1 hứa cả lớp «trả thân không đúng khuôn», Coverage Trục A lấy thước là khuôn đã khai của GET /api/v1/off-compound-units (`id`, `propertySubType`, `unparsedAddress` đều z.string(), routes.ts:54), và commit efa00e50 ghi «phủ đủ khuôn căn ngoài khu». Bảng có ca thiếu cho cả ba trường (dòng 49-51) nhưng ca sai kiểu chỉ có `unparsedAddress: 12` (dòng 52). Không có ca `id` sai kiểu hay `propertySubType` sai kiểu. `assert.equal(chay, 13)` ở dòng 59 chỉ ghim độ dài bảng, không ghim tích trường × lỗi. Đổi `typeof v.id === "string"` thành `v.id != null` trong laCanNgoaiKhu thì E1 vẫn xanh, và tương tự với propertySubType. Khi đó `id` là số sẽ thành { kind: xong } nhưng không khớp `offCompoundUnitId` kiểu chữ, nên hàng lại hiện «Chưa rõ» không báo. Vòng trước đã nêu lỗ này ở mức thiếu trường, bản sửa mới lấp một trong ba ca sai kiểu.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 4 — Assertion âm tính trên hàm giả viết ngay trong bài, không bao giờ đỏ được (r1 · tệp đã đổi)**
  Người dùng thấy gì: Một dòng kiểm trong bộ test không có tác dụng thật, nhưng người dùng không gặp ảnh hưởng nào vì việc báo lỗi đã được các dòng kiểm khác bảo vệ.
  Căn cứ: Không ảnh hưởng người dùng và không làm mất hay lộ dữ liệu; chỉ là một dòng kiểm thừa, các dòng kiểm kế bên đã bắt đúng lỗi nên sửa không đáng công.
  file: `apps/web/src/app/(app)/inventory/loi-doc-can-ngoai-khu.test.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

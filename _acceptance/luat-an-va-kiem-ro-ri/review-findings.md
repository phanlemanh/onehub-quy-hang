# Review findings: luat-an-va-kiem-ro-ri (round 2)

## Trong hợp đồng

- **Rào cửa ra bỏ sót route API công khai viết theo khuôn BASE + template literal, khuôn chiếm đa số trong packages/api**
  AC: AC-9
  file: `packages/core/src/redaction/rao-cua-ra.ts:21`
  severity: high
  source: conventions
  detail: `duongApiKhai` chỉ bắt chuỗi literal mở đầu bằng `/api/v1/`, đứng ngay sau `path:` hoặc `.get(`/`.post(`... Nhưng khuôn chuẩn của kho là khai `const BASE = "/api/v1/<nhánh>"` rồi viết ``path: `${BASE}/...` `` hoặc `path: BASE`. Kho có tám tệp đi theo khuôn này: app.ts, thanh-vien.ts, leads/listings/contacts/catalog/owners/photos routes.ts. Riêng today/routes.ts viết path literal. app.ts còn dựng BASE bằng `/api/${API_VERSION}`, nên trong mã không có chữ `v1` literal. Chạy thử: `duongApiKhai('const BASE = "/api/v1/public/shares"; createRoute({ path: `${BASE}/{code}` }); createRoute({ path: BASE })')` trả về `[]`. Hệ quả: một route `/api/v1/public/...` hay `/api/v1/s/...` viết đúng khuôn của kho sẽ lọt rào mà không cần tệp `*.ro-ri.test.ts`, tức bất biến 4 (mỗi cửa ra có bài kiểm rò rỉ) bị lách. Lỗi lượt 1 chỉ được sửa cho khuôn literal ít gặp. Ca thử trong cua-ra.test.ts (`ROUTE_CONG_KHAI`) cũng chỉ dùng path literal nên không lộ ra lỗ này. Hướng sửa: giải hằng `const X = "..."` và template `${X}` trong tệp trước khi so tiền tố, hoặc đổi sang soi tuyến đã đăng ký trên app OpenAPI lúc chạy. Thêm ô ma trận cho khuôn BASE.

- **Rào cửa ra bỏ sót route API viết theo khuôn chung của kho (`const BASE` + `path: ${BASE}/…`): không báo, không lỗi**
  AC: AC-9
  file: `packages/core/src/redaction/rao-cua-ra.ts:21`
  severity: high
  source: bugs
  detail: `duongApiKhai` chỉ bắt chuỗi literal bắt đầu bằng `/api/v1/` đứng ngay sau `path:` hay `.get(`. Khuôn route chủ đạo của kho là khai `const BASE = "/api/v1/..."` rồi viết `path: BASE` hoặc ``path: `${BASE}/{id}` ``. Bằng chứng: leads/routes.ts:33,87,105; listings/routes.ts:18,73,89; contacts, catalog, owners, photos, thanh-vien.ts và app.ts (``BASE = `/api/${API_VERSION}` ``). Chỉ today/routes.ts viết literal. Gặp ``path: `${BASE}/{code}` `` thì chuỗi bắt đầu bằng `$`, còn `path: BASE` là tên biến, nên regex không khớp; dòng `const BASE = "/api/v1/public/shares"` cũng không khớp vì không đứng sau `path:`. Vì vậy một route công khai mới ở `packages/api/src/public/routes.ts` viết đúng khuôn của kho và thiếu tệp `*.ro-ri.test.ts` sẽ làm `timCuaRaThieuKiem` trả `[]`: rào báo đạt trong khi cửa ra chưa được kiểm (sai im lặng). Bản cũ quét theo cây thư mục `packages/api/src/public` nên vẫn bắt được trường hợp này. Bài kiểm cua-ra.test.ts chỉ dùng mồi literal nên không lộ ra. Gợi ý: giải hằng `BASE`/template trước khi so, hoặc giữ thêm cách quét theo thư mục `public/` làm lưới đỡ.

- **Hình dạng 2 — fixture viết tay đúng khuôn của bên đọc: route API công khai ở E9 khai path bằng chuỗi literal, trong khi kho thật khai qua hằng BASE**
  AC: AC-9
  file: `packages/core/src/redaction/cua-ra.test.ts:24`
  severity: high
  source: measurement
  detail: Fixture `ROUTE_CONG_KHAI` (dòng 24) viết đường bằng chuỗi literal `path: "/api/v1/public/shares/{code}"`. Ba ô mới của ma trận 12 ô dùng fixture này hoặc khuôn literal tương tự: «route API công khai khuôn Hono của kho không tệp kiểm», «route API công khai có tệp kiểm đạt» và «route API nội bộ ... `createRoute({ path: "/api/v1/listings" })`». Ô thứ hai trong `E9 URL bỏ nhóm route` gọi `duongApiKhai` cũng chỉ đưa vào chuỗi literal. Đây đúng là khuôn regex của bên đọc `duongApiKhai` nhận: dấu nháy rồi `/api/v1/` ngay sau `path:` hoặc `.get(`. Phần lớn kho khai route theo kiểu khác: `const BASE = "/api/v1/..."` rồi `path: BASE` hoặc ``path: `${BASE}/...` ``. Kiểu này có ở listings/routes.ts:18,73,89; leads, contacts, catalog, owners, photos, thanh-vien.ts và app.ts:32. Chạy thử regex trên ``path: `${BASE}/{code}` `` và `path: BASE`: cả hai trả `[]`. Một cửa ra công khai viết theo khuôn chủ đạo của kho vẫn lọt rào và không bị đòi bài kiểm rò rỉ, trong khi ô ma trận tên «khuôn Hono của kho» vẫn xanh. Fixture không lấy từ cách các tệp `routes.ts` thật khai đường (round-trip từ phía viết), nên phép đo chỉ chứng minh regex đọc được khuôn tác giả tự viết. Lỗi lượt 1 vì vậy chưa thật sự được đo lại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Gốc nhánh API dời lên `packages/api/src`: một tệp kiểm ở gốc src miễn kiểm cho mọi route cửa ra**
  Người dùng thấy gì: Một bài kiểm rò rỉ đặt ở thư mục gốc của API có thể khiến mọi cửa ra mới được coi là đã kiểm dù chưa có bài kiểm riêng. Cửa ra mới có thể lọt mà không ai bị nhắc viết bài kiểm.
  Căn cứ: Hậu quả là rào lỏng hơn dự định nhưng chỉ xảy ra khi có người cố ý đặt tệp kiểm ở chỗ đó, không làm lộ dữ liệu ngay, và sửa sau không đắt.
  file: `packages/core/src/redaction/rao-cua-ra.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét LỚP dạng mã hoá nhưng ma trận đếm tay 16, thiếu phần tử «ket_hop» của chính bảng dạng (r1)**
  Người dùng thấy gì: Bài kiểm chưa thử trường hợp văn bản bị mã hoá chồng nhiều lớp, nên nếu phần xử lý đó hỏng thì bài kiểm vẫn báo xanh. Các dạng mã hoá đơn lẻ vẫn được kiểm đủ.
  Căn cứ: Chưa có dữ liệu nào bị lộ, chỉ là một đường kiểm chưa được đo; thêm ca kiểm sau này rẻ và không ảnh hưởng người dùng hiện tại.
  file: `packages/core/src/redaction/khong-ro.test.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

## Trong hợp đồng

- **Opening an import checks the plan against headers only, so a phone column the header doesn't reveal can save its value map (raw owner numbers) in imports.plan**
  AC: AC-7
  file: `packages/api/src/imports/store.ts:81`
  severity: high
  source: conventions
  detail: openImport calls validatePlan(input.plan, bangTu(input.headers, [])) with zero rows. classifyColumns (core/import/classify.ts:42-45) marks a column as source-class in two ways: by cell values (share of cells with a phone, email or ID number) or by header. With no rows, the value check never runs. A column with an unknown header (e.g. 'LH') whose cells are phone numbers is not classed as source. The new check 'cột lớp nguồn không mang bảng quy đổi' (plan.ts:348-350) therefore lets through a valueMap such as {"0900 000 001": ...}. Line 96 then writes the plan verbatim as JSON into imports.plan. Each later batch re-checks the plan against real rows and would refuse it, but the plan is already stored and committed. The result is raw owner numbers saved in plain text in a company_internal table. Elsewhere phones are kept only encrypted with a fingerprint. This contradicts the migration comment in 024 ('không ô nguyên văn nào của file vào đây ... lõi chặn bảng quy đổi của cột lớp nguồn') and the card's AC-2 claim that the saved plan is also checked. The core test luat-38.test.ts only covers tables that have rows, so it misses the API path. Fix direction: at open time, refuse any valueMap whose keys look like personal data (detectPersonal on the keys), or require sample rows in OpenBody to validate against.
  rationale: AC-7 đòi không kế hoạch đã lưu nào mang số chủ ở dạng rõ; finding cho thấy kế hoạch lưu lúc mở có thể chứa số thật.

- **Hình dạng 4 (assertion âm tính một mình): «thân trả không chứa id H3 / user id người giữ» không bao giờ đỏ được**
  AC: AC-6
  file: `packages/api/test-db/imports/lan-nhap.test.ts:198`
  severity: medium
  source: measurement
  detail: Ca «lần nhập: căn có hàng mở» có dòng `for (const lo of [h3, s.dauChuB.userId]) assert.ok(!than.includes(lo), ...)`. Store chỉ gắn listingId cho dòng create/update (packages/api/src/imports/store.ts:171, 225, 348: `(c.action === "create" || c.action === "update") && ... { listingId }`). Dòng supplement không bao giờ mang listingId, và thân trả không có trường user id nào. Vì vậy cả hai phép kiểm âm này đúng bất kể nhánh «không đọc được» có tồn tại hay không. Chiều đỏ mà E6 tuyên bố («bỏ nhánh không-đọc-được → ca đỏ vì thân trả chứa id H3») không thể xảy ra qua phép kiểm này. Không có đối chứng dương nào, ví dụ một dòng mà thân trả CÓ chứa id hàng H1 để chứng tỏ phép dò bắt được. Ca vẫn bắt được lỗi thật, nhưng là nhờ phép so `reason === LY_DO_DONG_NHAP.khongDoc`, không nhờ phép kiểm không-rò-rỉ.
  rationale: AC-6 đòi thân trả không mang mã hàng, tên hay người giữ; phép kiểm không-rò-rỉ của ca này luôn xanh nên không chứng minh được tiêu chí.

- **Hình dạng 4 (assertion âm tính một mình): ca «thân trả không mang nguồn» thiếu đối chứng dương trong cùng ca**
  AC: AC-7
  file: `packages/api/test-db/imports/lan-nhap.test.ts:233`
  severity: medium
  source: measurement
  detail: Ca «lần nhập: thân trả không mang nguồn» chỉ khẳng định `!t.includes(lo)` với 0900000001, «0900 000 001», «[Tên]» trên các thân trả, imports.plan và import_rows. Ca không khẳng định rằng lần ghi thật đã đưa chủ nhà và số tới listing_owners. Nếu đường nhập bỏ qua hẳn cột chủ nhà và số chủ, mọi phép kiểm âm vẫn xanh. E7 trong evals.yaml ghi rõ ca này phải có «đối chứng dương: listing_owners.owner_name của hàng bằng «[Tên]»». Đối chứng đó chỉ có ở ca khác («chủ nhà qua cửa chủ nhà»), chạy trên lần nhập và dữ liệu khác, nên không ghim được rằng chính lần nhập ở ca này có chở nguồn.
  rationale: AC-7 đòi chủ nhà và số thực sự vào qua cửa chủ nhà; ca này chỉ kiểm vế âm nên không ghim được vế dương.

- **Hình dạng 4 (assertion âm tính một mình): «update imports của B ảnh hưởng 0 dòng» không có đối chứng update của A**
  AC: AC-3
  file: `packages/db/tests/isolation.test.mjs:2209`
  severity: low
  source: measurement
  detail: `assert.equal((await c.query("update imports set status = 'committed' where id = $1", [IMPORT_B])).rowCount, 0, ...)` chỉ kiểm vế âm. Không có câu update tương ứng trên IMPORT_A ra rowCount 1. Nếu luật cho phép update bị cấu hình chặn mọi dòng, kể cả của chính sàn, phép kiểm vẫn xanh và không phân biệt được cách ly với cấm sửa toàn bộ. Các phép select và insert listing_events trong cùng ca có đối chứng dương; riêng phép update thì không.
  rationale: AC-3 đòi sàn A không ghi được lần nhập của sàn B nhưng vẫn là cách ly; phép kiểm không phân biệt cách ly với cấm sửa toàn bộ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The public listing command route now takes owner_confirmed.confirmedAt without the 2-year floor that only the import path applies**
  Người dùng thấy gì: Người dùng gửi lệnh xác nhận trực tiếp có thể đặt ngày xác nhận rất cũ, khiến căn trông cũ hơn thực tế. Đường nhập file vẫn áp mốc hai năm nên hai cửa xử lý khác nhau.
  Căn cứ: Chỉ làm căn trông kém tươi hơn, không mất hay lộ dữ liệu, và người dùng tự xác nhận lại để sửa được.
  file: `packages/core/src/listing/events.ts`
  severity: low
  Đề xuất: known-limits

- **Plan is checked at open with no rows, then re-checked per batch using that batch's cell values, so the same plan can pass one batch and be refused for another**
  Người dùng thấy gì: Một lần nhập nhiều gói có thể đang ghi thì một gói cuối bị từ chối vì ô ghi chú có số điện thoại, dù các gói trước đã ghi xong. Người nhập phải xử lý phần còn lại.
  Căn cứ: Không mất hay lộ dữ liệu, gói bị từ chối có thông báo rõ và gửi lại sau khi chỉnh được; chỉ gây phiền ở trường hợp hiếm.
  file: `packages/core/src/import/plan.ts`
  severity: medium
  Đề xuất: known-limits

- **'Today' is taken in UTC, so a confirmation dated today in Vietnam between 00:00 and 07:00 is refused as a future date**
  Người dùng thấy gì: Trong khoảng 0 giờ đến 7 giờ sáng giờ Việt Nam, ngày xác nhận là hôm nay bị coi là ngày tương lai và bị bỏ qua. Căn vẫn được nhập nhưng chưa được tính là đã xác nhận.
  Căn cứ: Chỉ xảy ra vài giờ đầu ngày, không mất dữ liệu, và nhập lại sau 7 giờ là xong.
  file: `packages/api/src/imports/store.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

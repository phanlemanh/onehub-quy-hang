# Review findings — va-lead-da-nhap-than-hong

## Trong hợp đồng

- **Kiểm phần tử chỉ xét 3 trường, phần tử sai khuôn vẫn lọt tới màn và có đường làm vỡ trang (AC-2)**
  file: `apps/web/src/app/(app)/leads/mine/nguon-that.tsx:9`
  severity: medium
  source: conventions
  AC: AC-2
  detail: Chú thích của `laLead` nói màn dựng từng dòng từ các trường được kiểm và thiếu thì cả lần đọc là hỏng. Thực tế `laLead` chỉ xét `id`, `buildingName`, `stage`, còn `DongLead` trong `lead-da-nhap.tsx` đọc thêm `need`, `listPrice`, `feeInclusion` và các mốc giờ. Đây là ranh giới nhận dữ liệu của chính hàng vá này, và AC-2 đòi phần tử không phải một lead thì báo lỗi, trang không vỡ.
  Hai đường lọt: (1) Vỡ lúc dựng: phần tử `{id:"a",buildingName:"b",stage:"sent",createdAt:"x"}` qua được kiểm. `docMoc` gọi `ngay.format(new Date("x"))` và ném `RangeError: Invalid time value` (đã chạy thử lời gọi format với ngày hỏng) ngay trong lúc render. Kết quả đúng loại lỗi mà AC-2 và E2b cấm. (2) Màn hiện rác, không có khối báo lỗi: `{id,buildingName,stage:"sent"}` cho ra `undefined · NaN triệu, chưa bao phí`. `stage` là chuỗi lạ thì `LEAD_STAGE_LABELS[stage]` và `BADGE[stage]` đều `undefined`, thành nhãn nấc rỗng, dù lõi đã có sẵn `LEAD_STAGES` và `LEAD_SIDE_STATES` để kiểm.
  Bộ kiểm chỉ có `[null]` và `[{"a":1}]`, nên E2 và E2b xanh mà không phủ các đường này. Nên kiểm `stage` theo danh sách của lõi, kiểm kiểu `need`/`listPrice` và tính hợp lệ của các mốc giờ; hoặc sửa chú thích và ghi rõ phần còn hở vào hồ sơ.

- **Điều kiện «là một lead» quá nông: phần tử sai khuôn vẫn lọt tới màn, hiện chữ rác hoặc làm vỡ trang**
  file: `apps/web/src/app/(app)/leads/mine/nguon-that.tsx:9`
  severity: medium
  source: bugs
  AC: AC-2
  detail: `laLead` chỉ kiểm `id`, `buildingName`, `stage` là chuỗi, trong khi `DongLead` còn dựng từ `need`, `listPrice`, `feeInclusion`, các mốc giờ và tra `stage` vào bảng nhãn. Chú thích ngay trên hàm («Màn dựng từng dòng từ các trường này; thiếu thì cả lần đọc là hỏng, không để lọt tới màn») vì vậy không đúng, và AC-2 («danh sách có phần tử không phải một lead» thì báo lỗi, trang không vỡ) còn hở ở ba ca đọc được từ mã. (1) `[{"id":"1","buildingName":"A","stage":"sent"}]` qua cửa, `cauPhu` in «undefined · NaN triệu, chưa bao phí»: đã chạy thử `Intl.NumberFormat.format(NaN)` ra «NaN», không ném. Đây là lỗi im lặng: người dùng thấy dòng rác, không có khối báo lỗi. (2) Thêm `"createdAt":"khong-phai-ngay"` với stage `sent`: `docMoc` gọi `ngay.format(new Date(...))` ném `RangeError: Invalid time value` (đã chạy thử) ngay lúc dựng, đúng kiểu vỡ trang mà AC-2 cấm. (3) `stage` là chuỗi lạ: `LEAD_STAGE_LABELS[l.stage]` và `BADGE[l.stage]` ra undefined, huy hiệu nấc trống. Năm dòng của E2 không có phần tử nào có đủ ba trường này, nên bộ kiểm vẫn xanh. Hướng sửa: kiểm `stage` thuộc `LEAD_STAGES`/`LEAD_SIDE_STATES`, `need` thuộc `NEED_LABELS`, `listPrice` là số hữu hạn, và mọi mốc là null hoặc ngày đọc được; `createdAt` phải là ngày đọc được.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Fixture «lead đủ trường» thực ra thiếu nửa số khoá và nấc sai, ép kiểu che mất**
  Người dùng thấy gì: Dữ liệu mẫu trong bài kiểm không giống một lead thật, nên bài kiểm chứng minh yếu hơn mô tả. Người dùng không gặp lỗi nào ở màn hình.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; chỉ làm bằng chứng kiểm thử kém chặt, ghi lại rồi sửa sau khi siết cửa kiểm là rẻ.
  file: `apps/web/src/app/(app)/leads/mine/nguon-that.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Lead mẫu của ca «phản hồi đúng» không đủ trường như E4 khai, và mang trạng thái sai**
  Người dùng thấy gì: Lead mẫu trong bài kiểm thiếu nhiều trường so với lead thật, nên bài kiểm chưa chứng minh trọn một lead thật đi qua được. Người dùng không thấy lỗi.
  Căn cứ: Chỉ là độ chặt của bằng chứng kiểm thử, không làm hỏng màn hình hay mất dữ liệu; sửa sau rẻ và không gấp.
  file: `apps/web/src/app/(app)/leads/mine/nguon-that.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5: tuyên quét lớp «phần tử sai khuôn» nhưng chỉ có điểm-case, thiếu ma trận toàn phần theo từng trường và vị trí phần tử**
  Người dùng thấy gì: Bộ kiểm chưa thử đủ các kiểu phần tử sai nên có thể bỏ sót lỗi sau này. Người dùng không thấy gì khác đi hôm nay.
  Căn cứ: Là chỗ hở của lưới an toàn chứ không phải lỗi người dùng đang gặp; ghi lại để bù khi mở rộng kiểm thử, không làm mất dữ liệu.
  file: `apps/web/src/app/(app)/leads/mine/nguon-that.test.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

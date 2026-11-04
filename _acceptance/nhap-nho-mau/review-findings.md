# Review findings: nhap-nho-mau (round 1)

## Trong hợp đồng

- **Bộ nhớ mẫu vẫn giữ bảng quy đổi của cột tên người không thuộc lớp nguồn (listAgentName) và của mọi trường không phải giá trị đóng**
  AC: AC-3
  file: `packages/core/src/import/memory/mau.ts:47`
  severity: medium
  source: conventions
  detail: Đầu tệp hứa «Bộ nhớ không bao giờ giữ giá trị của cột nguồn hay cột tên người». Nhưng `nhoBangQuyDoi` chỉ loại `FIELD_CLASS[target] === "source"`. Vì thế `taoMau` vẫn giữ và GET /api/v1/imports/templates vẫn trả `valueMap` cho `listAgentName` (Đầu chủ, là tên người, lớp company_internal), `privateRemarks`, `listPrice`, `floor`... Chỉ phía web chặn được việc học, qua `hocCachGoi`/`TRUONG_CACH_GOI` trong trang-thai.ts. Ở ranh giới hệ thống thì không có rào: POST /imports nhận `plan` là `z.record(z.unknown())`, và `validatePlan` chỉ chặn bảng quy đổi trên cột nguồn hoặc khoá có dáng số điện thoại, email, số giấy tờ. Một kế hoạch do bên gọi API tự dựng, có `valueMap` trên listAgentName như {"[Tên]": "[Tên]"}, sẽ được lưu, rồi được bộ nhớ mẫu nhớ và phát lại cho mọi người có vai nhập của sàn ở các lần nhập sau. Bài kiểm «mẫu không mang giá trị nguồn, tên người» (mau.test.ts:123, test-db mau.test.ts:86-87) chỉ thử ownerName và ownerPhone, cả hai thuộc lớp nguồn, nên không bắt được trường hợp này. Hướng sửa: `nhoBangQuyDoi` dùng cùng luật với `hocCachGoi` (đích thuộc TRUONG_CACH_GOI), hoặc ít nhất loại listAgentName; đồng thời thêm ca kiểm cho listAgentName.

- **Hình 5 — ma trận giả: chiều «bước đích» không được chạy (E8)**
  AC: AC-8
  file: `apps/web/src/lib/nhap/nho-mau.test.ts:74`
  severity: high
  source: measurement
  detail: E8 hứa một ma trận 3 trạng thái chạy × 2 bước đích, tức 6 assert. Nhưng vòng `for (const dich of [1, 2])` gọi `coTheChonBuoc(chay)`, mà hàm này (trang-thai.ts:147) chỉ nhận ba cờ chạy, không nhận bước. Biến `dich` chỉ xuất hiện trong chuỗi thông báo. Vậy 6 assert thực chất là 3 phép kiểm khác nhau, mỗi phép chạy hai lần. Phép đếm `so === 8` chỉ đếm số vòng lặp nên không thể đỏ. Đối chứng dương `sangBuoc(s, 2).buoc === 2` gọi thẳng `sangBuoc`, không đi qua cổng `coTheChonBuoc`, nên không chứng được «trạng thái sau khi chọn đúng bước ấy». Chiều bước đích mà ma trận tuyên bố không được đo.

- **Hình 4 — khẳng định âm không có đối chứng dương: ma trận «bốn lớp cột không học» đúng vì một lý do khác lớp cột (E6)**
  AC: AC-6
  file: `apps/web/src/lib/nhap/nho-mau.test.ts:46`
  severity: high
  source: measurement
  detail: `hocCachGoi` chỉ cho học khi qua cả hai cổng: lớp cột nằm trong LOP_HOC_DUOC và đích nằm trong TRUONG_CACH_GOI (standardStatus, feeInclusion, directionFaces, buildingName, subdivisionName). Bốn dòng của KHONG_HOC rơi vào các đích sau: «SĐT chủ» → ownerPhone, «Tên chủ» → ownerName (headers.ts:32), «Mô tả» → chữ tự do, «Nhãn» → chưa rõ. Không đích nào nằm trong TRUONG_CACH_GOI, nên `plan deepEqual plan trước` giữ xanh kể cả khi bỏ hẳn cổng lớp cột. Chú thích ở dòng «nguồn» viết «chỉ lớp cột chặn việc học», nhưng điều đó sai theo code. Không có ca dương nào cho một cột có đích danh sách đóng nằm ở lớp không học. Vì thế ma trận không đo được việc chặn theo lớp, và chiều đỏ đã khai («gấp vào valueMap cả cột tên người») sẽ không làm ca đỏ.

- **Hình 4 — khẳng định âm trống: «SĐT chủ», «Giá đáy» không mang valueMap vì đầu vào vốn không có (E3)**
  AC: AC-3
  file: `packages/core/src/import/memory/mau.test.ts:137`
  severity: medium
  source: measurement
  detail: Vòng `for (const h of ["SĐT chủ", "Tên chủ", "Giá đáy"]) assert.ok(!("valueMap" in c))` kiểm ba cột không mang bảng quy đổi. Nhưng kế hoạch đầu vào chỉ được chèn valueMap ở «Trạng thái» và «Tên chủ». «SĐT chủ» và «Giá đáy» đi thẳng từ planFromDictionary, vốn không có valueMap, nên hai assert ấy không thể đỏ dù có bỏ bộ lọc `nhoBangQuyDoi` cho lớp nguồn. Lời hứa «mẫu không mang giá trị nguồn» ở lõi vì thế chỉ thật sự được đo trên một cột lớp nguồn là «Tên chủ». Đường số chủ có bảng quy đổi chỉ được phủ ở bộ kiểm API (mau.test.ts), không ở ca của lõi mà E3 trỏ tới.

- **Hình 1 — đo chữ trong mã nguồn thay vì hành vi: ca kiểm nối của E8 grep màn**
  AC: AC-8
  file: `apps/web/src/lib/nhap/nho-mau.test.ts:83`
  severity: low
  source: measurement
  detail: Ca kiểm nối dùng `assert.match(man, /onChonBuoc=\{\(so\) => coTheChonBuoc\(/)` trên văn bản của man-nhap.tsx. Phép này chỉ chứng có một chuỗi đúng dáng, không chứng thanh bước bị khoá khi đang chạy. Ví dụ: truyền sai cờ vào `coTheChonBuoc` (dangXemThu luôn false), hay dùng `||` thay `&&`, thì regex vẫn khớp. Đây là đo chỉ dẫn trong mã nguồn thay vì đầu ra của màn. Evals đã khai ca này, nhưng nó không đủ làm bằng chứng cho lời hứa khoá thanh bước.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **apMau chỉ gỡ trùng đích khi cột theo mẫu đứng SAU cột từ điển; cột mẫu đứng trước thì hai cột cùng một trường chuẩn**
  Người dùng thấy gì: Khi một cột theo mẫu đứng trước một cột ghép theo từ điển mà cả hai trỏ vào cùng một trường, máy ghép cả hai và chỉ một cột được dùng, giá trị cột kia mất mà không báo.
  Căn cứ: Có thể mất dữ liệu âm thầm nhưng chỉ ở tình huống hiếm và người xem lại bước ghép cột vẫn thấy hai cột trùng để tự sửa.
  file: `packages/core/src/import/memory/mau.ts`
  severity: medium
  Đề xuất: known-limits

- **Chọn tệp trước khi đọc xong mẫu thì ghép theo từ điển mà không báo, và không ghép lại khi mẫu về**
  Người dùng thấy gì: Nếu người dùng chọn tệp quá nhanh, trước khi máy đọc xong mẫu đã nhớ, màn ghép cột như chưa có mẫu và không báo gì, người dùng phải ghép lại bằng tay.
  Căn cứ: Chỉ mất công ghép lại, không mất hay lộ dữ liệu, người dùng tự khắc phục bằng cách chọn lại tệp sau vài giây.
  file: `apps/web/src/app/(app)/imports/new/man-nhap.tsx`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

# Review findings: anh-can-ba-ngan (round 1)

## Trong hợp đồng

- **Hình dạng 4 (khẳng định âm một mình): «kho trên máy không nhận khoá nào» đo một Map không nối vào đâu**
  file: `apps/web/src/app/(app)/units/photos/tai-len.test.ts:54`
  severity: high
  AC: AC-2
  source: measurement
  detail: Dòng 54 tạo `const kho = new Map()`, dòng 59 `assert.equal(kho.size, 0)`. Map này không được truyền vào guiLuot, nguonApi hay fetchGia, nên phép kiểm luôn xanh dù code có ghi vào IndexedDB hay không. E2b hứa «kho trên máy giả (IndexedDB giả) không nhận khoá nào» khi mất mạng, nhưng không có kho giả nào được cắm vào đường ghi, và không có đối chứng dương cho thấy kho này bắt được một lần ghi. Phép kiểm này rỗng.

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): ô doc_gui_duoc của E5 ở lõi chỉ đọc lại tệp mẫu**
  file: `packages/core/src/photos/photos.test.ts:134`
  severity: high
  AC: AC-9
  source: measurement
  detail: `assert.equal(true, c.doc_gui_duoc, ...)` so một hằng với giá trị trong bang-xem-noi-bo.json; không gọi hàm nào của lõi. Vòng lặp vẫn cộng `o++` để đủ «40 ô», nhưng 8 trong 40 ô chỉ đo tệp mẫu, không đo đầu ra của lõi. Bốn ô còn lại của mỗi người (dòng 130) đều so với cùng một giá trị `thay = canSeeUnitInternal(...)`, nên lõi chỉ thật sự được đo 8 lần (một lần mỗi người), không phải 40 ô độc lập như E5 tuyên bố.

- **Hình dạng 3 (kiểm chuỗi có mặt thay vì quan hệ): E8 «đúng toà và mã» chỉ kiểm hàm trả lại đúng đầu vào**
  file: `packages/core/src/photos/photos.test.ts:115`
  severity: high
  AC: AC-8
  source: measurement
  detail: `assert.deepEqual(anhDanhMuc({ buildingName: "Toà A", unitNumber: "A-01.01", media }), media)` chỉ xác nhận hàm trả lại mảng media của chính dòng vừa đưa vào (anhDanhMuc là `dong?.media ?? []`). Lời hứa của E8 là quan hệ: ảnh phải thuộc đúng toà VÀ đúng mã, và chiều đỏ là «trả ảnh của mã trùng ở toà khác thì ca đỏ, thông điệp nêu toà». Test không có dòng nào cùng mã khác toà, không so buildingName/unitNumber của ảnh trả ra với căn được hỏi. Vì vậy chiều đỏ đã khai không thể làm test đỏ.

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E6 phía web dò chữ «units/photos» trong mã nguồn thay vì đọc hằng số của bộ đồng bộ**
  file: `apps/web/src/app/(app)/units/photos/muc-anh.test.ts:21`
  severity: medium
  AC: AC-6
  source: measurement
  detail: `if (/units\/photos/.test(readFileSync(join(sync, ten), "utf8")))` dò một chuỗi trong văn bản nguồn của lib/sync. E6 hứa «danh sách bảng của bộ đồng bộ không có bảng ảnh (đọc từ chính hằng số của bộ đồng bộ, không chép tay)». Test không nạp hằng số hay hành vi kéo nào: một đường ghép chuỗi (ví dụ `/api/v1/units/${'photos'}`) hoặc một kho IndexedDB mới tên `unit_photos` đều lọt qua phép dò. Test đo chữ trong tệp, không đo bộ đồng bộ thật sự kéo gì về.

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): «thả lên thẻ Nội bộ → ngăn internal» do chính test gán ngăn**
  file: `apps/web/src/app/(app)/units/photos/tai-len.test.ts:37`
  severity: low
  AC: AC-1
  source: measurement
  detail: Test tự gọi `nguon.them(t, "internal")` rồi kiểm `body.get("compartment") === "internal"`. Như vậy nó chỉ đo việc truyền thẳng tham số do test đưa vào; logic ánh xạ «thả lên thẻ Nội bộ» sang ngăn internal ở giao diện (muc-anh.tsx) không được chạy. E1 hứa ánh xạ từ đích thả sang ngăn, nhưng phép kiểm đo đầu vào chính nó đưa vào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đường ảnh không khai qua createRoute nên vắng khỏi OpenAPI, kiểm đầu vào tự viết thay vì zod**
  Người dùng thấy gì: Bên ngoài đọc tài liệu API sẽ không thấy các đường ảnh; chức năng ảnh trên màn vẫn chạy bình thường.
  Căn cứ: Không ảnh hưởng người dùng đầu chủ hiện tại, chỉ bất tiện cho bên tích hợp sau này; bổ sung về sau còn rẻ.
  file: `packages/api/src/photos/routes.ts`
  severity: medium
  Đề xuất: known-limits

- **Tên trong API là tiếng Việt (toa, ma, anh, noiBo «thay»/«an», suaDuoc), trái luật «API tiếng Anh» và RESO-first**
  Người dùng thấy gì: Người dùng không thấy gì khác; chỉ là tên trường kỹ thuật chưa theo chuẩn chung, sẽ đổi chung với đợt đổi tên API.
  Căn cứ: Không mất dữ liệu và không đổi hành vi nhìn thấy; đã có việc riêng lo đổi tên, nên ghi nhận là đủ.
  file: `packages/api/src/photos/routes.ts`
  severity: medium
  Đề xuất: known-limits

- **Gửi bản gốc tới 10 MB qua hàm Vercel sẽ vượt trần thân yêu cầu 4,5 MB ở bản thật**
  Người dùng thấy gì: Ở bản chạy thật, ảnh điện thoại nặng khoảng 4,5 đến 10 MB có thể không tải lên được và người dùng chỉ thấy «Không gửi được — thử lại».
  Căn cứ: Hậu quả khá nặng vì ảnh cỡ thường gặp bị hỏng lặp lại dù thử lại; không mất dữ liệu có sẵn, nhưng cách sửa đổi đường tải lên nên làm thành việc riêng.
  file: `packages/api/src/photos/routes.ts`
  severity: medium
  Đề xuất: new-contract

- **Byte ở Storage được ghi và xoá bên trong giao dịch Postgres chưa commit, nên dòng ảnh và byte có thể lệch nhau**
  Người dùng thấy gì: Hiếm khi lỗi xảy ra đúng lúc, có thể còn sót một ảnh không ai xem được trên kho lưu, hoặc một ảnh còn hiện nhưng mất nội dung.
  Căn cứ: Chỉ xảy ra khi hệ thống lỗi giữa lúc ghi, rất hiếm; người dùng có thể tải lại ảnh, nhưng ảnh sót không lộ ra ngoài vì kho riêng tư.
  file: `packages/api/src/photos/store.ts`
  severity: low
  Đề xuất: known-limits

- **Chuyển hướng 302 tới link ký 60 giây lại được cho phép giữ đệm 300 giây**
  Người dùng thấy gì: Ở bản chạy thật, mở lại hồ sơ sau hơn một phút có thể thấy ảnh bị vỡ cho tới khi hết thời gian giữ đệm.
  Căn cứ: Ảnh chỉ hiện vỡ tạm thời và tải lại sau vài phút là hết, không lộ hay mất dữ liệu; nhưng dễ gặp ở bản thật nên nên xếp việc sửa riêng.
  file: `packages/api/src/photos/routes.ts`
  severity: medium
  Đề xuất: new-contract

- **Ghi và xoá byte ở S3 nằm ngoài giao dịch: để lại byte mồ côi (kể cả giấy tờ nội bộ) hoặc dòng ảnh mất byte**
  Người dùng thấy gì: Khi lỗi giữa chừng ở bản thật, có thể còn sót file ảnh sổ trên kho lưu không còn dòng nào trỏ tới, hoặc một ảnh còn hiện mà mất nội dung.
  Căn cứ: Chỉ xảy ra khi lỗi hiếm và kho vẫn riêng tư nên không lộ ra ngoài; nên ghi vào danh sách hạn chế đã biết và dọn về sau.
  file: `packages/api/src/photos/store.ts`
  severity: medium
  Đề xuất: known-limits

- **Lỗi của mọi thao tác sửa hay xoá ảnh bị nuốt, người dùng không thấy báo gì**
  Người dùng thấy gì: Khi thao tác sửa hoặc xoá ảnh thất bại, người dùng không thấy lời báo nào và ảnh lặng lẽ trở về như cũ nên không biết vì sao.
  Căn cứ: Không mất dữ liệu và bấm lại được, nhưng người dùng dễ bối rối; sửa cần thiết kế thông báo nên làm riêng.
  file: `apps/web/src/app/(app)/units/photos/muc-anh.tsx`
  severity: low
  Đề xuất: new-contract

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

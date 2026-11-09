# Review findings: token-may-ket-noi (round 2)

## Trong hợp đồng

- **Hình 4, assertion âm tính một mình: ba đường danh tính ngoài OpenAPI chỉ so mã HTTP, không có đối chứng dương trên đường thật**
  file: `packages/api/test-db/token-may/pham-vi.test.ts:130`
  severity: medium
  AC: AC-4
  source: measurement
  detail: Dòng 130-132 chỉ assert `lech(kqDanhTinh)` rỗng, tức mã khi không header bằng mã khi có Bearer. Với better-auth 1.7.14, `get-session` không có cookie trả 200 với thân null (session.mjs dòng 47; session.test.ts:119 của kho cũng đọc null từ đường này). `sign-out` không cookie đi thẳng tới `ctx.json(signOutResponse())` (sign-out.mjs dòng 93), đọc mã thì là 200. Nếu Bearer được nhận làm người, `get-session` vẫn 200 nhưng thân mang phiên, nên `lech` vẫn rỗng và phép đo xanh. Hai trong ba đường vì vậy không phân biệt được có danh tính hay không. Lưới «phải dừng ở lớp danh tính» ở dòng 118-122 chỉ áp cho `kqKhac`, không áp cho `kqDanhTinh`. Chiều đỏ ở dòng 137-141 dùng route giả `/me-gia` trả 401/200, nên chỉ chứng minh bộ so hoạt động, không chứng minh trên ba đường này. Cần so cả thân phản hồi (get-session phải null khi có Bearer). Cùng hình dạng ở dòng 98: `POST /api/v1/jobs/lead-tick` là route còn lại đọc Bearer, nhưng `deps` trong chung.ts không có `jobSecret` nên cả hai chiều dừng ở 503 (jobs/routes.ts dòng 32), chưa tới bước so khoá; ô này trong phép quét không đo gì.

- **Hình 4, assertion âm tính một mình: ô «chữ hoa» của ma trận tra theo băm không có dòng nào để khớp nhầm**
  file: `packages/db/tests/token-may.test.mjs:87`
  severity: medium
  AC: AC-5
  source: measurement
  detail: Ô `{ ten: "chữ hoa", hash: bam("a").toUpperCase(), ra: [] }` mong 0 dòng, nhưng trong giao dịch này chỉ có hai token băm `bam("3")` và `bam("4")` (dòng 78-79); không có dòng `bam("a")`. Nếu hàm `app.machine_token_by_hash` bị đổi thành so `lower(p_hash)` hoặc so không phân biệt hoa thường, ô vẫn trả 0 dòng và vẫn xanh. Vì vậy ô không thể đỏ với đúng lỗi nó được đặt ra để bắt. Hai ô «63 hex» và «có dấu» lấy từ `bam("3")` còn chữ hoa thì đổi sang ký tự khác (chữ số không có dạng hoa), nên mất liên hệ với dòng có thật. Cần chèn một token có băm chứa chữ cái thường, assert băm thường ra 1 dòng, rồi mới assert bản viết hoa của chính băm đó ra 0 dòng.

- **Hình 4, đối chứng dương không đại diện: máy quét console ép đối số bằng String nên không thấy token nằm trong object**
  file: `packages/api/test-db/token-may/nhat-ky.test.ts:107`
  severity: medium
  AC: AC-8
  source: measurement
  detail: Bộ bắt console ghi `a.map(String).join(" ")`. Với `console.error("lỗi", { authorization: token })`, chuỗi ghi lại là `lỗi [object Object]`; với đối tượng Error, String chỉ giữ tên và message, bỏ stack, cause và các trường riêng. Console thật in những phần này qua util.inspect, nên `assert.deepEqual(quet([token, bam]), [])` ở dòng 126 xanh dù token đã bị log trong object. Đối chứng dương ở dòng 128-129 chỉ log token dưới dạng chuỗi trần (`console.error("bản thử", token)`), đúng dạng duy nhất máy quét thấy, nên không lộ điểm mù này. Lời hứa E9 là «không chuỗi ghi lại nào chứa token rõ hay băm». Cần dùng `util.format(...a)` hoặc `util.inspect`, và thêm đối chứng log token trong object.

- **Hình 4, assertion một mình không có đối chứng: ca «ghi nhật ký từ chối lỗi» không chứng minh lỗi tiêm đã xảy ra**
  file: `packages/api/test-db/token-may/nhat-ky.test.ts:94`
  severity: low
  AC: AC-7
  source: measurement
  detail: Ca ở dòng 94-101 gắn `truocGhiNhatKy: loiThu` rồi chỉ assert 403 và thân `agreement-inactive`. Đường từ chối cho ra đúng hai giá trị này dù móc có chạy hay không, nên nếu lời gọi móc hoặc cả bước ghi nhật ký từ chối bị gỡ khỏi `ghiRieng` thì ca vẫn xanh. Ca không có cờ đã chạy kiểu `daChay` như ca «tắt giữa lúc kiểm và ghi» (cua-nhan.test.ts:155), cũng không assert `dongNhatKy(s.tokenId)` rỗng. Thêm assert số dòng nhật ký bằng 0 sẽ chứng minh nhánh ghi lỗi thật sự được đi qua.

- **Hình 5, số đếm của phép quét lớp là hằng đúng: soCot lấy từ danh sách chứ không đếm cột đã quét**
  file: `packages/api/test-db/token-may/quan-ly.test.ts:62`
  severity: low
  AC: AC-1
  source: measurement
  detail: `quetCot` trả `soCot: cot.length` (dòng 29), tức độ dài của `danhSachCot()`, không phải bộ đếm tăng trong vòng lặp. Dòng 62 `assert.equal(quet.soCot, (await danhSachCot()).length)` vì thế so cùng một truy vấn với chính nó và không thể đỏ. Nếu vòng quét bị đổi sang bỏ qua một số cột (ví dụ chỉ quét cột text) hoặc thoát sớm, assert vẫn xanh. E1 ghi rõ «đếm số cột quét bằng số cột information_schema báo», và mẫu số assert bằng số phần tử đòi bộ đếm phải tăng theo từng lần quét thật. Các ma trận khác trong bộ này đều dùng `soLan += 1` trong vòng lặp; riêng phép quét cột thì không.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Lỗi 500 ở đường token bị bỏ mất nội dung, nhật ký máy chủ chỉ còn mã lỗi hoặc «khong-ma»**
  Người dùng thấy gì: Khi máy bên kia nhận lỗi 500 hàng loạt, người vận hành chỉ thấy mã lỗi chung chung nên khó truy ra nguyên nhân. Khách và dữ liệu không bị ảnh hưởng.
  Căn cứ: Chỉ làm chậm việc tìm nguyên nhân khi sự cố, không mất hay lộ dữ liệu, và sửa sau vẫn rẻ nên ghi vào hạn chế đã biết.
  file: `packages/api/src/catalog/feeds-token.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

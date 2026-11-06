# Review findings: chup-anh-dien-thoai (round 3)

## Trong hợp đồng

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): lệnh đăng ký dừng hàng chờ thật chỉ được kiểm bằng cách tìm chữ**
  AC: AC-6
  file: `apps/web/src/app/(app)/units/photos/hang-cho-anh.test.ts:546`
  severity: high
  source: measurement
  detail: Ghi chú phía trên LOI_XOA nói hàng chờ dừng là nhờ lệnh đăng ký ở `xoaKhoCuaNguoi`, «không nhờ thứ tự do bài kiểm tự đặt». Nhưng `lechLoiXoa(true)` tự đăng ký một hàm viết trong bài kiểm: `datTruocKhiXoaKho(dangKy ? async (u) => (u === "u-chu" ? h.dung() : undefined) : ...)`. Nó không bao giờ chạy lệnh đăng ký thật ở hang-cho-may.ts:67 (`datTruocKhiXoaKho((u) => dungHangCho(u))`). Chỗ duy nhất chạm tới lệnh đăng ký thật là `assert.match(doc("./hang-cho-may.ts"), /datTruocKhiXoaKho\(/)`, tức là kiểm xem chuỗi đó có trong mã nguồn hay không. Nếu lệnh thật bị đổi thành `datTruocKhiXoaKho(async () => {})`, gọi sai người, hoặc nằm trong một nhánh không bao giờ chạy, thì cả ba bài E7 vẫn xanh. Lời hứa «xoá kho thì hàng chờ của app dừng trước» không được đo trên đường chạy thật.
  rationale: AC-6 đòi đăng xuất hay máy bị báo mất thì mọi ảnh chờ bị xoá cùng kho đồng bộ; lệnh dừng hàng chờ thật khi xoá kho không được đo trên đường chạy thật nên lời hứa của AC-6 không được chứng minh.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 5 (tuyên quét cả lớp nhưng chỉ có vài điểm): 'mọi chỗ xoá kho' chỉ là danh sách ba tệp gõ tay**
  Người dùng thấy gì: Hiện mọi chỗ xoá dữ liệu trên máy đều đã được kiểm. Nếu sau này có người thêm một chỗ xoá mới mà quên đi qua đường chung, ảnh chờ của người trước có thể còn sót trên máy dùng chung mà không ai báo.
  Căn cứ: Chưa có lỗi nào xảy ra với người dùng hôm nay, rủi ro chỉ đến khi có thay đổi sau này, và việc ghi lại hạn chế này rẻ hơn nhiều so với dựng thêm bộ quét.
  file: `apps/web/src/app/(app)/units/photos/hang-cho-anh.test.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).


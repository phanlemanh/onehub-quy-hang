# Review findings: da-gui (round 2)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 2 — Fixture VIẾT TAY đúng khuôn bên đọc: bài kiểm hồi quy «giá lúc gửi» chỉ đưa vào danh sách sự kiện tự dựng, đã chia sẵn trước/sau lúc gửi, không đi qua đường ghi rồi đọc lại bằng readShare**
  Người dùng thấy gì: Nếu sau này ai đó vô tình làm hỏng cách tính giá lúc gửi của căn chưa có giá khi gửi, bộ kiểm hiện tại vẫn báo xanh. Khi đó đầu khách có thể thấy giá cũ sai trên thẻ «Vừa đổi» mà không có cảnh báo nào.
  Căn cứ: Hành vi hiện tại đã đúng và chỉ là lưới bảo vệ về sau còn hở ở một ca hiếm (căn chưa có giá lúc gửi), không mất dữ liệu; bổ sung bài kiểm sau này vẫn rẻ và không cần sửa người dùng.
  file: `packages/core/src/sharing/goi-y.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Route Đã gửi bỏ qua mẫu OpenAPI (createRoute + zod) mà các route /api/v1/shares cùng cụm đang dùng (r1)**
  Người dùng thấy gì: Các route của màn Đã gửi chưa được liệt kê trong tài liệu API cho bên ngoài. Người dùng màn hình không thấy khác biệt nào.
  Căn cứ: Không ảnh hưởng người dùng hiện tại và không làm mất hay lộ dữ liệu; chỉ là tài liệu thiếu, bổ sung sau với chi phí thấp.
  file: `packages/api/src/da-gui/routes.ts`
  severity: medium
  Đề xuất: known-limits

- **Ngăn chi tiết Lần gửi trống im lặng khi tải lỗi (và trong lúc đang tải) (r1)**
  Người dùng thấy gì: Khi mở chi tiết một link mà tải lỗi hoặc còn đang tải, đầu khách chỉ thấy một ngăn trống, không biết là lỗi hay đang chờ và không có nút thử lại.
  Căn cứ: Không mất dữ liệu và đóng mở lại hay tải lại trang là xong, nhưng người dùng dễ tưởng link không có gì; sửa khá rẻ.
  file: `apps/web/src/app/(app)/shares/man-da-gui.tsx`
  severity: medium
  Đề xuất: new-contract

- **Assertion âm-tính-một-mình: kiểm «không có tên chủ nhà» dò một chuỗi mà fixture không bao giờ ghi (r1)**
  Người dùng thấy gì: Một bài kiểm bảo vệ việc không lộ tên chủ nhà trên màn Đã gửi thực ra không thể báo đỏ, nên nếu sau này tên chủ lọt ra thì bài kiểm này sẽ không bắt được.
  Căn cứ: Hiện chưa có rò rỉ thật, các bài quét khác vẫn còn; nhưng lưới an toàn yếu đi nên nên ghi lại và vá khi có dịp, sửa rẻ.
  file: `packages/api/test-db/da-gui.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: «thân chi tiết không mang giá đáy» không kiểm rằng giá đáy đã thật sự được ghi (r1)**
  Người dùng thấy gì: Bài kiểm xác nhận giá đáy không lộ ra có thể vẫn xanh dù giá đáy chưa hề được lưu, nên chưa chắc đã chứng minh được điều nó định chứng minh.
  Căn cứ: Không ảnh hưởng người dùng trực tiếp, chỉ làm bằng chứng kiểm yếu đi; ghi lại và siết sau, sửa rẻ.
  file: `packages/api/test-db/da-gui.test.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

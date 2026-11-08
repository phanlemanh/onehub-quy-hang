# Review findings: va-nut-ghi-cuoc-goi-truong-nhom (round 1)

## Trong hợp đồng

(không có finding nào map vào AC)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Trang quay số /units/call/dial vẫn tự đọc tên vai, không đi qua cửa chung moDuocManCuocGoi/vaoManCuocGoi mới tạo**
  Người dùng thấy gì: Trang quay số vẫn tự kiểm vai riêng. Hôm nay người dùng không thấy khác gì, nhưng nếu sau này luật vào màn ghi cuộc gọi đổi thì hai trang có thể mở cho hai nhóm người khác nhau.
  Căn cứ: Chưa có hậu quả nào với người dùng hôm nay, không mất dữ liệu, và chỉ cần để ý khi luật vào màn ghi cuộc gọi được đổi sau này.
  file: `apps/web/src/app/(app)/units/call/dial/page.tsx`
  severity: low
  Đề xuất: known-limits

- **Bộ quét E2 yếu hơn điều evals.yaml mô tả: chỉ bắt chuỗi tên vai, không bắt chỗ đọc danh sách vai**
  Người dùng thấy gì: Hồ sơ căn trên điện thoại hiện đúng, nhưng phép kiểm tự động chưa chắc bắt được nếu sau này ai đó lại viết cách đọc vai theo kiểu khác, nên nút có thể lệch mà không ai báo.
  Căn cứ: Người dùng chưa gặp lỗi nào, không mất dữ liệu, và việc chỉnh lại câu mô tả hay siết phép kiểm sau này đều rẻ.
  file: `apps/web/src/app/(app)/units/ho-so/dien-thoai/ho-so-dien-thoai.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — chỉ kiểm chuỗi có mặt, trong khi lời hứa là quan hệ giữa hàm cửa và notFound() của trang**
  Người dùng thấy gì: Màn ghi cuộc gọi hiện chặn đúng người, nhưng phép kiểm tự động chưa đảm bảo bắt được nếu sau này điều kiện chặn bị viết ngược, khi đó nút và trang có thể lại lệch nhau.
  Căn cứ: Hành vi hôm nay đúng nên người dùng không bị ảnh hưởng, không mất dữ liệu, và lỗi nếu xảy ra sau này sẽ lộ ngay khi bấm nút nên tự phát hiện được.
  file: `apps/web/src/app/(app)/units/call/cua.test.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).


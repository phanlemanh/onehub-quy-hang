# Review findings: ghi-thiet-bi-va-mat-mang

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **A rejected offline session stays in the outbox and is resent on every sync pass**
  Người dùng thấy gì: Nếu đồng hồ điện thoại bị chỉnh lùi đúng lúc đang mất mạng, lượt mất mạng đó bị máy chủ từ chối mãi và cứ được gửi lại sau mỗi nhịp. Người dùng không thấy gì khác lạ, chỉ là số đo mất mạng thiếu một lượt.
  Căn cứ: Hậu quả nhẹ: hiếm khi xảy ra, người dùng không bị mất việc hay lộ dữ liệu, chỉ thiếu một lượt trong số đo thử; sửa có thể để sau khi thấy dữ liệu thật.
  file: `apps/web/src/lib/sync/dong-bo.ts`
  severity: low
  Đề xuất: known-limits

- **Hộp gửi lượt mất mạng giữ mãi lượt bị máy chủ từ chối vĩnh viễn (4xx), gửi lại ở mọi nhịp mà không báo**
  Người dùng thấy gì: Một lượt mất mạng có giờ kết thúc sớm hơn giờ bắt đầu (do đồng hồ máy lệch) sẽ không bao giờ được ghi nhận và cứ gửi lại âm thầm. Số đo mất mạng trên điện thoại có thể thiếu lượt đó mà không ai biết.
  Căn cứ: Không mất dữ liệu của người dùng và chỉ xảy ra khi đồng hồ máy bị chỉnh lùi, nên ảnh hưởng nhẹ và chỉ lệch nhẹ số đo hai tuần thử.
  file: `apps/web/src/lib/sync/dong-bo.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — assertion âm tính không ghim thông điệp: khoá lạ «offline» chỉ được kiểm bằng mã 400**
  Người dùng thấy gì: Bài thử chỉ xác nhận lệnh lạ bị từ chối, chưa xác nhận lý do từ chối đúng như dự kiến. Người dùng không gặp gì khác đi; chỉ có rủi ro bài thử xanh khi lý do từ chối là khác.
  Căn cứ: Không ảnh hưởng người dùng, chỉ là độ chặt của bài kiểm; việc từ chối chính nó đã được kiểm nên chi phí sửa không đáng.
  file: `packages/api/test-db/thiet-bi-mat-mang.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 — bên ghi đầu thiết bị viết tay trong bài xuyên lớp E10, không đi qua bên ghi thật taoGoiFetch**
  Người dùng thấy gì: Nếu sau này code thật của điện thoại ngừng gửi hoặc gửi sai loại thiết bị, bài thử xuyên suốt vẫn xanh và số đo thao tác theo thiết bị có thể lệch mà không ai hay. Hiện tại tính năng chạy đúng, chỉ là lưới an toàn chưa khép kín.
  Căn cứ: Hiện không ảnh hưởng người dùng vì từng đoạn đã được kiểm riêng; rủi ro chỉ là bắt lỗi chậm về sau, và có thể vá bằng một bài thử bổ sung.
  file: `apps/web/src/lib/sync/test-db/thiet-bi-mat-mang.db-test.mts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

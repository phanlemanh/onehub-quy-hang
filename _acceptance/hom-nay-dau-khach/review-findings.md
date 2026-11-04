# Review findings: hom-nay-dau-khach (round 1)

## Trong hợp đồng

- **Hình dạng 4 — phép kiểm âm tính đứng một mình: kiểm «không có tên chủ nhà» dò một chuỗi chưa bao giờ được cài và không có đối chứng dương**
  AC: AC-1
  file: `packages/api/test-db/hom-nay-dau-khach.test.ts:119`
  severity: high
  source: measurement
  detail: Dòng `assert.ok(!than.includes("[Tên] Chủ"), "thân mang tên chủ nhà")` dò chuỗi «[Tên] Chủ». Nhưng bộ dựng sàn thử không cài tên ấy cho chủ nhà: hàm `hangCoChu` (packages/api/test-db/san-thu.ts:112) gửi `ownerName: "[Tên]"`, và ca AC-3 cũng PUT owner với `ownerName: "[Tên]"`. Vì vậy phép kiểm này luôn qua, kể cả khi API trả ownerName nguyên văn trong thân. Đối chứng dương duy nhất của ca là `doSo(`ghi ${so[0]}`)`, chỉ chứng minh máy dò bắt được số khách. Không có đối chứng nào cho tên chủ. Mảng `so` cũng chỉ gom số khách từ `lanGui`, còn số chủ nhà do `soMoi` sinh trong `hangCoChu` không được đưa vào mảng này. Trong khi đó evals.yaml E1 hứa thân trả «không có tên chủ nhà đã cài (đối chứng dương: máy dò bắt số và tên chủ đã cài khi chèn vào một chuỗi mẫu)». Phần về tên chủ của lời hứa này không được đo: phép kiểm âm tính không ghim vào giá trị đã cài và không có đối chứng dương. Rò khoá ownerName bị KHOA_CAM bắt riêng, nhưng nếu giá trị tên chủ lọt ra dưới một khoá khác thì không phép kiểm nào bắt được.
  rationale: AC-1 đòi thân API không mang trường lớp source (tên chủ nhà thuộc lớp này), mà phép kiểm của điều đó không ghim vào giá trị đã cài nên không chứng minh được vế này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Vùng Đầu khách có thể kẹt ở trạng thái đang tải mãi khi body trả về không đọc được**
  Người dùng thấy gì: Hiếm khi mạng hoặc máy chủ trung gian trả về nội dung hỏng, vùng Đầu khách ở Hôm nay sẽ hiện khung chờ mãi, không báo lỗi và không có nút thử lại. Người dùng phải tự tải lại trang.
  Căn cứ: Chỉ xảy ra trong tình huống hiếm, không mất dữ liệu, người dùng tự khắc phục được bằng cách tải lại trang, và hậu quả nhẹ.
  file: `apps/web/src/app/(app)/today/buyer/vung.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

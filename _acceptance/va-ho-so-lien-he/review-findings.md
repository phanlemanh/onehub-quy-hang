## Trong hợp đồng

- **Bấm «Xem thêm» hai lần nhanh nay làm lặp cùng một trang trong danh sách (lỗi mới do bản vá)**
  AC: AC-2
  file: `apps/web/src/app/(app)/contacts/vung.tsx:96`
  severity: medium
  source: bugs
  detail: Hàm them() không có cờ đang tải, và nút «Xem thêm» (danh-sach.tsx:226-230) không bị khoá khi yêu cầu còn đang chạy. Bấm hai lần trước khi trang thứ hai về thì có hai lời gọi docDanhSach cùng con trỏ `trang.tiep`, cùng `luotDs` và cùng `khoa`, nên duocNoi() cho qua cả hai. Bản vá đổi việc nối sang dạng hàm `setDs((cu) => ... [...cu.ds, ...kq.items])`, nên lần về thứ hai nối thêm đúng các mục đó vào danh sách đã nối. Kết quả: cùng các dòng hiện hai lần (khoá React bị trùng ở LuoiLienHe/TheLienHe), và bộ đếm «N+ liên hệ» sai. Code cũ dùng `[...ds.ds, ...kq.items]` từ closure, nên hai lần về cho ra cùng một mảng và không lặp. Lối sửa: thêm cờ đang tải (ref) trong them(), hoặc bỏ qua khi trang.tiep đã khác con trỏ lúc gửi, hoặc lọc trùng theo id khi nối.
  rationale: AC-2 đòi khi không đổi bộ lọc thì «Xem thêm» gửi đúng con trỏ và nối trang «như trước»; bấm đúp trước đây không lặp dòng, nay lặp, nên hành vi cũ bị lùi.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

(không có mục nào)

## Chưa adversarial-verify (refuter chết)

(không có mục nào)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

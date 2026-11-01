# Review findings: va-sua-tren-o (round 2)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **A failed undo still marks the edit as undone, so retrying shows «Đã hoàn tác rồi» although nothing was written**
  Người dùng thấy gì: Khi máy chưa lưu được lần hoàn tác và báo thử lại, bấm Hoàn tác lần nữa lại báo «Đã hoàn tác rồi» dù giá chưa được trả về. Người dùng phải tự sửa lại giá bằng tay.
  Căn cứ: Hiếm gặp (chỉ khi máy lỗi lưu hoặc luật từ chối), không mất dữ liệu và người dùng tự sửa lại giá được; sửa nằm cùng nhóm đường lỗi hợp đồng đã hoãn sang hàng sau.
  file: `apps/web/src/app/(app)/inventory/cell-edit/tren-o.tsx`
  severity: medium
  Đề xuất: known-limits

- **Ctrl/Cmd+Z typed in a column filter box undoes the last cell edit and writes an event (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi đang gõ trong ô lọc cột mà bấm Ctrl/Cmd+Z để hoàn tác chữ, hệ thống lại hoàn tác lần sửa giá hoặc trạng thái gần nhất của một căn và ghi thay đổi thật. Người dùng không định làm vậy.
  Căn cứ: Làm đổi dữ liệu căn ngoài ý muốn nhưng người dùng có thể bấm hoàn tác lại, và tình huống chỉ xảy ra khi gõ lọc ngay sau lần sửa; sửa rẻ nên nên làm ở một việc riêng.
  file: `apps/web/src/app/(app)/inventory/cell-edit/tren-o.tsx`
  severity: medium
  Đề xuất: new-contract

- **Edit and undo write paths swallow unexpected errors after the editor has closed (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu việc lưu hoặc hoàn tác gặp lỗi bất ngờ, ô sửa đã đóng và không có thông báo lỗi nào. Người dùng tưởng đã lưu hoặc đã hoàn tác trong khi chưa.
  Căn cứ: Chỉ xảy ra với lỗi hiếm ngoài các lỗi thường đã được xử lý, và người dùng thấy giá cũ khi tải lại rồi thử lại, nên không mất dữ liệu.
  file: `apps/web/src/app/(app)/inventory/cell-edit/tren-o.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận 'mọi chỗ hiện giá' không phủ hết phần tử): thiếu dòng «Hiểu là» của kết quả dựng lệnh, đang hiện trong hộp hỏi lại (r1)**
  Người dùng thấy gì: Một chỗ hiện giá trong hộp hỏi lại chưa có bài kiểm riêng cho giá lẻ. Hiện nó vẫn hiển thị đúng, nhưng sau này sửa nhầm thì bài kiểm không bắt được.
  Căn cứ: Người dùng hôm nay không bị ảnh hưởng; rủi ro chỉ là bỏ sót lỗi giá lẻ về sau, và bổ sung bài kiểm là việc rẻ có thể làm lúc khác.
  file: `apps/web/src/app/(app)/inventory/cell-edit/lenh.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính một mình): đối chứng đỏ E3 tự so với chính nó, không cho thấy bài kiểm thật hoá đỏ (r1)**
  Người dùng thấy gì: Bài kiểm chứng minh việc gõ chữ vô nghĩa không sinh lệnh có phần đối chứng chưa đủ mạnh. Người dùng không thấy khác biệt, chỉ là bài kiểm có thể không báo đỏ khi lẽ ra phải báo.
  Căn cứ: Không ảnh hưởng người dùng hay dữ liệu; phần kiểm chính vẫn đúng nên chấp nhận và ghi lại là đủ.
  file: `apps/web/src/app/(app)/inventory/cell-edit/lenh.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

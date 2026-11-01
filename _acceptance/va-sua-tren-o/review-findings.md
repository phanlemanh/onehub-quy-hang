# Review findings: va-sua-tren-o (round 1)

## Trong hợp đồng

- **Hoàn tác không truyền phiên bản đã xét (coSo) khi ghi lệnh bù, nên vẫn có thể ghi đè lặng một lần sửa mới hơn**
  AC: AC-5
  file: `apps/web/src/app/(app)/inventory/cell-edit/tren-o.tsx:67`
  severity: low
  source: conventions
  detail: `xetHoanTac` chỉ so phiên bản trên máy với `phienBanSau` lúc bấm, bằng `docPhienBan` đọc đồng bộ. Sau đó `hoanTac` gọi `sua(g.id, g.lenh.type, g.lenh.payload)` mà không truyền `coSo`. Trong `apTrenMay`, `expectedVersion` vì thế lấy theo `hienTai.version` của kho ở thời điểm `docKho` (bất đồng bộ) trả về, chứ không lấy phiên bản đã xét. Nếu một lần kéo về đổi phiên bản căn trong khoảng giữa lúc xét và lúc ghi, lệnh bù mang phiên bản mới và máy chủ nhận nó, thành ra ghi đè lặng đúng lần sửa sau mà AC-5 của va-sua-tren-o hứa không đè lên (DA_SUA_SAU). Cơ chế chặn đã có sẵn trong cùng thay đổi: `coSo` được thêm vào `apTrenMay`, `dong-bo.sua` và `useSuaHang` cho đúng mục đích này. Đường ghi thường đã dùng (`ghi(..., phien.coSo)`), còn đường hoàn tác thì chưa. Truyền `g.phienBanSau` làm `coSo` thì một lần sửa chen vào sẽ thành xung đột và vào «Cần xem», như lần ghi thường. Khoảng hở hẹp (chỉ một lần đọc kho), nên mức thấp.
  rationale: AC-5 và mục Never cấm hoàn tác ghi đè lần sửa sau của căn; finding nói đường hoàn tác vẫn có khe để lần sửa chen vào bị đè.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Ctrl/Cmd+Z typed in a column filter box undoes the last cell edit and writes an event**
  Người dùng thấy gì: Khi đang gõ trong ô lọc cột mà bấm Ctrl/Cmd+Z để hoàn tác chữ, hệ thống lại hoàn tác lần sửa giá hoặc trạng thái gần nhất của một căn và ghi thay đổi thật. Người dùng không định làm vậy.
  Căn cứ: Làm đổi dữ liệu căn ngoài ý muốn nhưng người dùng có thể bấm hoàn tác lại, và tình huống chỉ xảy ra khi gõ lọc ngay sau lần sửa; sửa rẻ nên nên làm ở một việc riêng.
  file: `apps/web/src/app/(app)/inventory/cell-edit/tren-o.tsx`
  severity: medium
  Đề xuất: new-contract

- **Edit and undo write paths swallow unexpected errors after the editor has closed**
  Người dùng thấy gì: Nếu việc lưu hoặc hoàn tác gặp lỗi bất ngờ, ô sửa đã đóng và không có thông báo lỗi nào. Người dùng tưởng đã lưu hoặc đã hoàn tác trong khi chưa.
  Căn cứ: Chỉ xảy ra với lỗi hiếm ngoài các lỗi thường đã được xử lý, và người dùng thấy giá cũ khi tải lại rồi thử lại, nên không mất dữ liệu.
  file: `apps/web/src/app/(app)/inventory/cell-edit/tren-o.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận 'mọi chỗ hiện giá' không phủ hết phần tử): thiếu dòng «Hiểu là» của kết quả dựng lệnh, đang hiện trong hộp hỏi lại**
  Người dùng thấy gì: Một chỗ hiện giá trong hộp hỏi lại chưa có bài kiểm riêng cho giá lẻ. Hiện nó vẫn hiển thị đúng, nhưng sau này sửa nhầm thì bài kiểm không bắt được.
  Căn cứ: Người dùng hôm nay không bị ảnh hưởng; rủi ro chỉ là bỏ sót lỗi giá lẻ về sau, và bổ sung bài kiểm là việc rẻ có thể làm lúc khác.
  file: `apps/web/src/app/(app)/inventory/cell-edit/lenh.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính một mình): đối chứng đỏ E3 tự so với chính nó, không cho thấy bài kiểm thật hoá đỏ**
  Người dùng thấy gì: Bài kiểm chứng minh việc gõ chữ vô nghĩa không sinh lệnh có phần đối chứng chưa đủ mạnh. Người dùng không thấy khác biệt, chỉ là bài kiểm có thể không báo đỏ khi lẽ ra phải báo.
  Căn cứ: Không ảnh hưởng người dùng hay dữ liệu; phần kiểm chính vẫn đúng nên chấp nhận và ghi lại là đủ.
  file: `apps/web/src/app/(app)/inventory/cell-edit/lenh.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

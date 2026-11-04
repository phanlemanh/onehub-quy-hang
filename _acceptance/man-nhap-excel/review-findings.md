## Trong hợp đồng

- **Bản xem thử cũ được gắn vào trạng thái đã đổi: nút Ghi mở trên dữ liệu chưa xem thử**
  AC: AC-4
  file: `apps/web/src/app/(app)/imports/new/man-nhap.tsx:101`
  severity: high
  source: bugs
  detail: xemThu() chạy bất đồng bộ với ảnh chụp `t`. Trong lúc nó chạy, nút «Lùi» vẫn hiện (chỉ ẩn khi dangGhi) và các bước trước vẫn bấm chọn được, nên người dùng có thể lùi lại để đổi đích cột, sửa ô hay bỏ dòng. Mỗi thao tác này đặt xemThu=null. Khi lời gọi xong, `setS((cu) => daXemThu(cu, kq))` gắn kết quả của trạng thái CŨ vào trạng thái MỚI mà không kiểm hai trạng thái còn khớp nhau. Hệ quả: coTheGhi bật và bước 5 hiện tổng kết cũ. Khi ghi, batDauGhi lại gửi goiDong(s) của trạng thái mới tới importId đã mở bằng kế hoạch và danh sách căn cũ. Điều này phá đúng bất biến mà trang-thai.ts tự nêu: «nút ghi chỉ mở trên đúng các dòng đã xem thử». Bấm «Xem thử lại» hai lần liền cũng đua nhau theo cùng cách. Cách sửa: chỉ nhận kết quả khi `cu.ong === t.ong && cu.bo === t.bo && cu.dauChu === t.dauChu`, hoặc dùng một mã thế hệ.
  rationale: AC-4 đòi sau mọi thay đổi nút ghi khoá tới khi xem thử lại; đua trạng thái làm nút ghi mở trên dữ liệu chưa xem thử.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **GET /imports/agents trả email đầu chủ cho cả người không phải quản trị (trường name thực chất là email)**
  Người dùng thấy gì: Một đầu chủ khi chọn người nhập hộ có thể thấy địa chỉ email của các đầu chủ khác trong cùng sàn, trong khi trước đây chỉ quản trị sàn thấy.
  Căn cứ: Chỉ lộ trong nội bộ một sàn và chỉ cho người có vai nhập, nên hậu quả vừa phải; không mất dữ liệu nhưng đã lộ thì không thu hồi được.
  file: `packages/api/src/imports/routes.ts`
  severity: medium
  Đề xuất: known-limits

- **Truy vấn bảng tài khoản viết thẳng trong route, không qua hàm dùng chung ở accounts.ts**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào; chỉ khiến việc bảo trì về sau khó theo dõi hơn một chút.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; chi phí dọn sau rẻ nhưng lợi ích cũng rất nhỏ.
  file: `packages/api/src/imports/routes.ts`
  severity: low
  Đề xuất: wont-fix

- **Chú thích của writeBatch giờ nằm trơ, không gắn vào hàm nào**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng; chỉ là phần giải thích trong mã bị đặt sai chỗ.
  Căn cứ: Hoàn toàn không tác động tới người dùng hay dữ liệu, chỉ gây nhầm lẫn nhỏ cho người đọc mã.
  file: `packages/api/src/imports/store.ts`
  severity: low
  Đề xuất: wont-fix

- **Lỗi tải danh sách đầu chủ bị nuốt: Trưởng nhóm kẹt ở bước 1 mà không có thông báo**
  Người dùng thấy gì: Nếu mạng chập chờn lúc mở màn, Trưởng nhóm thấy nút Tiếp tắt mà không có lời báo lỗi hay cách thử lại, phải tự tải lại trang.
  Căn cứ: Không mất dữ liệu và người dùng tự gỡ được bằng cách tải lại trang, nhưng gây bối rối vì không có thông báo.
  file: `apps/web/src/app/(app)/imports/new/man-nhap.tsx`
  severity: medium
  Đề xuất: known-limits

- **nap() không có try/finally: nếu đọc tệp ném lỗi thì vòng quay kẹt và ô chọn tệp khoá mãi**
  Người dùng thấy gì: Với tệp lạ hoặc khi tải thành phần đọc tệp bị hỏng, màn có thể quay mãi «Đang đọc tệp» và không cho chọn tệp khác cho tới khi tải lại trang.
  Căn cứ: Ít gặp, không mất dữ liệu và tải lại trang là xong; sửa không đắt nhưng chưa nằm trong tiêu chí đã chốt.
  file: `apps/web/src/app/(app)/imports/new/man-nhap.tsx`
  severity: medium
  Đề xuất: known-limits

- **goi(): phản hồi 2xx mà thân không phải JSON thì ném ra ngoài, làm màn kẹt ở trạng thái đang chạy**
  Người dùng thấy gì: Nếu máy chủ trả phản hồi bất thường, màn có thể treo ở trạng thái đang hỏi hoặc đang ghi và nút ghi khoá cho tới khi tải lại trang.
  Căn cứ: Rất hiếm xảy ra; gói đã ghi không nhân đôi khi gửi lại nên tải lại và thử lại là an toàn.
  file: `apps/web/src/lib/nhap/goi-api.ts`
  severity: low
  Đề xuất: known-limits

- **Lỗi tải danh mục rơi im lặng về chế độ không có danh mục: màn và máy chủ ra số khác nhau**
  Người dùng thấy gì: Nếu danh mục không tải được, các dấu ô và số đếm ở bước ghép có thể lệch với kết quả xem thử của máy chủ mà người dùng không được báo.
  Căn cứ: Bước xem thử trên máy chủ vẫn cho số đúng trước khi ghi nên không ghi sai dữ liệu; chỉ gây khó hiểu và người dùng tự thử lại được.
  file: `apps/web/src/app/(app)/imports/new/man-nhap.tsx`
  severity: low
  Đề xuất: known-limits

- **Shape 3 (asserts a value is present when the promise is a relation between values): the duplicate-row check only looks for 'skip' and never checks the reason «trùng dòng n»**
  Người dùng thấy gì: Bài kiểm có thể không phát hiện nếu dòng trùng bị bỏ vì lý do khác với lý do trùng, nên lỗi hiển thị lý do có thể lọt qua.
  Căn cứ: Không ảnh hưởng người dùng trực tiếp ngay hôm nay, chỉ giảm độ chắc của lưới kiểm; bổ sung sau rẻ.
  file: `apps/web/src/lib/nhap/test-db/nhap.db-test.mts`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative-only assertion): after editing the cell, the test only checks the mark is no longer needs_person and never pins the resulting mark**
  Người dùng thấy gì: Bài kiểm có thể không bắt được trường hợp ô sau khi sửa bị đánh dấu sai sang loại khác, nên lỗi dấu ô có thể lọt qua.
  Căn cứ: Chỉ làm lưới kiểm lỏng hơn, không gây mất dữ liệu; thêm kiểm sau rất rẻ.
  file: `apps/web/src/lib/nhap/trang-thai.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 (claims a class but tests one point): «vai khác không gọi API nhập» covers only buyer_agent**
  Người dùng thấy gì: Bài kiểm chỉ thử một vai không có quyền nên một vai khác có thể được vào nhầm mà không bị bắt.
  Căn cứ: Chỉ giảm độ chắc của lưới kiểm; quyền thực tế vẫn do máy chủ chặn, thêm các vai vào bài kiểm rất rẻ.
  file: `apps/web/src/lib/nhap/trang-thai.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 (claims a class but tests one point): «cột nguồn sang trường ngoài lớp nguồn bị chặn» tries only 3 wrong targets**
  Người dùng thấy gì: Bài kiểm chỉ thử vài đích sai nên có đích khác cho phép chuyển cột chủ nhà ra ngoài mà không bị bắt.
  Căn cứ: Chỉ là lưới kiểm chưa phủ hết; luật chặn nằm ở lõi dùng chung nên rủi ro thật thấp và bổ sung kiểm rẻ.
  file: `apps/web/src/lib/nhap/duong-ong.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative-only assertion): «bỏ dòng gửi skip» checks skip:true only when row 3 happens to be in the payload**
  Người dùng thấy gì: Bài kiểm có thể vẫn qua dù dòng bị bỏ không còn được gửi kèm dấu bỏ, nên lỗi bỏ dòng có thể lọt qua.
  Căn cứ: Chỉ làm lưới kiểm lỏng hơn, không ảnh hưởng người dùng trực tiếp; thêm một dòng kiểm là đủ.
  file: `apps/web/src/lib/nhap/trang-thai.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

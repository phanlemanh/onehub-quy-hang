# Review findings: hom-nay-truong-nhom (round 3)

## Trong hợp đồng

Không có finding.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình 1 — đo khả năng của hàm thuần thay vì đầu ra của màn: ô «Hàng cũ» theo cấu hình 20 ngày (r2)**
  Người dùng thấy gì: Nếu sàn đổi số ngày coi là hàng cũ, bài kiểm vẫn xanh dù ô «Hàng cũ» trên màn trưởng nhóm có thể vẫn đếm theo số ngày mặc định. Trưởng nhóm có thể thấy con số không khớp với cấu hình của sàn mà không ai được báo.
  Căn cứ: Chỉ ảnh hưởng một con số hiển thị, không mất hay lộ dữ liệu, trưởng nhóm tự nhận ra được khi đối chiếu; sửa sau rẻ vì chỉ là nối cấu hình và thêm bài kiểm.
  file: `apps/web/src/app/(app)/today/truong-nhom.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình 2 — cầu nối nguồn sang trạng thái viết tay trong test, không đi qua bộ nối của màn (r2)**
  Người dùng thấy gì: Nếu phần nối giữa kết quả tải và trạng thái màn bị sai, màn có thể báo lỗi thay vì «mất mạng» (hoặc ngược lại) mà bài kiểm vẫn xanh. Trưởng nhóm khi mất mạng có thể thấy thông báo không đúng hoặc nút giao không tắt.
  Căn cứ: Hậu quả nhẹ, chỉ sai chữ báo trạng thái, không mất hay lộ dữ liệu; tải lại là hết; bổ sung bài kiểm qua màn thật sau này không đắt.
  file: `apps/web/src/app/(app)/today/truong-nhom.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 — assert âm vắng «[Tên]» trên hàng đợi vô nghĩa: lead không mang tên mồi, còn đối chứng dương đọc một vật khác (r2)**
  Người dùng thấy gì: Bài kiểm khẳng định danh sách lead quá hạn không lộ tên chủ nhà, nhưng lead trong bài kiểm không hề có tên đó nên khẳng định này luôn đúng. Nếu sau này có thay đổi làm lộ tên chủ nhà ra danh sách, bài kiểm sẽ không bắt được.
  Căn cứ: Hiện chưa có dấu hiệu lộ thật, chỉ là lưới an toàn yếu cho thông tin chủ nhà vốn nhạy cảm; sửa rẻ nhưng nên làm sớm vì lỗi lộ nếu xảy ra sẽ khó thu hồi.
  file: `packages/api/test-db/hom-nay-truong-nhom.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Khối dashboard-6 vẫn giữ <main mx-auto max-w-7xl> ở gốc: lồng thẻ main trong main và lệch với bố cục Tràn (r1)**
  Người dùng thấy gì: Trên màn hình rộng, vùng của trưởng nhóm bị thu hẹp và căn giữa nên lệch mép với các dải bên dưới. Người dùng dùng đọc màn hình có thể nghe vùng nội dung chính bị khai báo hai lần.
  Căn cứ: Chỉ ảnh hưởng nhẹ về hình thức và khả năng tiếp cận, không mất hay lộ dữ liệu, mọi chức năng vẫn dùng được và sửa sau rẻ.
  file: `apps/web/src/components/khoi/dashboard-6/coverage-dashboard.tsx`
  severity: medium
  Đề xuất: known-limits

- **Có mạng lại thì màn vẫn kẹt ở «Đang mất mạng», nút Giao lại vẫn tắt, không có nút thử lại (r1)**
  Người dùng thấy gì: Sau khi mạng trở lại, màn của trưởng nhóm vẫn báo đang mất mạng và các nút Giao lại vẫn tắt. Phải tải lại trang mới giao được.
  Căn cứ: Không mất dữ liệu và người dùng tự gỡ được bằng cách tải lại trang, nhưng gây vướng đúng lúc cần chia lại lead gấp nên nên ghi rõ để sửa ở lượt sau.
  file: `apps/web/src/app/(app)/today/truong-nhom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Lần đầu tải gặp mất mạng thì hàng đợi báo «Không lead nào quá hạn» dù chưa đọc được gì (r1)**
  Người dùng thấy gì: Nếu mở màn lúc mạng đang chập chờn, trưởng nhóm có thể thấy câu «Không lead nào quá hạn» dù máy chưa đọc được gì, trong khi các ô số hiện dấu gạch. Họ có thể tưởng không có việc cần chia lại.
  Căn cứ: Câu báo sai có thể khiến bỏ sót lead quá hạn, nhưng các ô số bên cạnh đã báo chưa biết và tải lại trang là hết, không mất dữ liệu.
  file: `apps/web/src/app/(app)/today/truong-nhom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Tên đầu chủ rỗng hiện thành ô trống ở bảng theo người và ở dòng hàng đợi (r1)**
  Người dùng thấy gì: Đầu chủ chưa nhập tên sẽ hiện thành ô trống trong bảng theo đầu chủ và ở dòng lead quá hạn, thay vì mã ngắn như ở ô chọn Giao lại. Trưởng nhóm khó biết đó là ai.
  Căn cứ: Chỉ gặp với tài khoản chưa có tên, không mất dữ liệu, ô chọn Giao lại vẫn cho nhận ra người nên hậu quả nhẹ và sửa rẻ.
  file: `packages/api/src/team/routes.ts`
  severity: low
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình (hình 4): mồi tên «[Tên]» không nằm trên lead nào trong hàng đợi, nên kiểm vắng tên luôn đạt (r1)**
  Người dùng thấy gì: Bài kiểm chưa chứng minh được rằng tên chủ nhà không lọt vào hàng đợi của trưởng nhóm, nên nếu sau này có lỗi rò tên thì bài kiểm sẽ không báo. Hiện chưa có dấu hiệu tên bị lộ.
  Căn cứ: Chưa có người dùng nào bị ảnh hưởng, nhưng thông tin chủ nhà là dữ liệu nhạy cảm nên nên ghi lại để củng cố bài kiểm sau; sửa bài kiểm rẻ.
  file: `packages/api/test-db/hom-nay-truong-nhom.test.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

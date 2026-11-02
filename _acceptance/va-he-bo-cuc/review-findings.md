# Review findings: va-he-bo-cuc (round 3)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Khi lead tải lỗi, ?nhom=new_lead vẫn báo chắc chắn «Hôm nay không có việc ở «Lead mới»» dù chưa biết có lead hay không**
  Người dùng thấy gì: Khi danh sách lead giao cho bạn tải lỗi (mất mạng, máy chủ trục trặc), bấm mục «Lead mới» ở cột bên vẫn hiện «Hôm nay không có việc ở «Lead mới»» cạnh dòng báo lỗi tải. Trang nói là không có việc trong khi thật ra chưa biết.
  Căn cứ: Hậu quả nhẹ: dòng báo sai chỉ xuất hiện lúc đang có lỗi tải, ngay cạnh dòng báo lỗi nên người dùng vẫn biết là chưa tải được, không mất dữ liệu, tải lại là hết.
  file: `apps/web/src/app/(app)/today/hom-nay-dau-chu.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình 1 — đo bản sao trong ca thay vì đầu ra: luật «đầu chủ kiêm telesales thì không báo» chỉ chạy trên hàm tự viết của test, không chạm page.tsx**
  Người dùng thấy gì: Người dùng không gặp lỗi nào hôm nay: người kiêm đầu chủ vẫn được xử như đầu chủ. Nhưng nếu sau này ai đó đổi cách nhận biết vai, bài kiểm vẫn xanh và có thể để lọt một người kiêm đầu chủ bị báo sai là «chỉ có ở Hôm nay của đầu chủ».
  Căn cứ: Hiện chưa có người dùng nào bị ảnh hưởng; đây chỉ là lưới an toàn còn lỏng cho thay đổi tương lai, có thể bổ sung khi chạm vào phần nhận biết vai.
  file: `apps/web/src/app/(app)/today/mo-nhom.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 — tuyên quét lớp mà chỉ có một điểm: moNhom «mở đúng khoá nhom:<mã>» chỉ thử call_back**
  Người dùng thấy gì: Chỉ một trong năm hàng đợi được kiểm tự động về việc mở đúng nhóm khi bấm; bốn hàng đợi còn lại nếu sau này hỏng thì bài kiểm không tự báo. Hiện chưa thấy hàng đợi nào bấm sai.
  Căn cứ: Hiện chưa thấy hàng đợi nào bấm sai nên người dùng không bị ảnh hưởng; rủi ro chỉ là một hỏng hóc tương lai có thể lọt qua bài kiểm, bổ sung bài kiểm sau là rẻ.
  file: `apps/web/src/app/(app)/today/mo-nhom.test.ts`
  severity: low
  Đề xuất: known-limits

- **Lead list fails to load, but opening the «Lead mới» queue from the column says there is no work (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi danh sách lead giao cho bạn tải lỗi (mất mạng, máy chủ trục trặc), bấm mục «Lead mới» ở cột bên vẫn hiện «Hôm nay không có việc ở «Lead mới»» cạnh dòng báo lỗi tải. Trang nói là không có việc trong khi thật ra chưa biết.
  Căn cứ: Chỉ xảy ra khi tải lead đã lỗi và có sẵn dòng báo lỗi bên cạnh; không mất hay lộ dữ liệu, người dùng tải lại trang là thấy đúng, và sửa nhẹ nên ghi lại hạn chế để xử sau.
  file: `apps/web/src/app/(app)/today/hom-nay-dau-chu.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): trục vai của E5 đo một bản sao luật vai viết trong ca, không đo nhánh của page.tsx (r1)**
  Người dùng thấy gì: Người dùng không gặp lỗi nào hôm nay: người kiêm đầu chủ vẫn được xử như đầu chủ. Nhưng nếu sau này ai đó đổi cách nhận biết vai, bài kiểm vẫn xanh và có thể để lọt một người kiêm đầu chủ bị báo sai là «chỉ có ở Hôm nay của đầu chủ».
  Căn cứ: Không ảnh hưởng người dùng ở bản này và không mất dữ liệu; rủi ro chỉ nằm ở lần sửa sau có thể không bị bài kiểm bắt, nên ghi lại hạn chế là đủ.
  file: `apps/web/src/app/(app)/today/mo-nhom.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): E1 hứa moNhom mở đúng khoá ở mọi ô «có việc», nhưng chỉ đo một mã (r1)**
  Người dùng thấy gì: Chỉ một trong năm hàng đợi được kiểm tự động về việc mở đúng nhóm khi bấm; bốn hàng đợi còn lại nếu sau này hỏng thì bài kiểm không tự báo. Hiện chưa thấy hàng đợi nào bấm sai.
  Căn cứ: Không có lỗi người dùng nào được chỉ ra và năm hàng đợi dùng chung một đường mở; thiếu bài kiểm chỉ là rủi ro về sau, có thể bổ sung lúc nào cũng được.
  file: `apps/web/src/app/(app)/today/mo-nhom.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

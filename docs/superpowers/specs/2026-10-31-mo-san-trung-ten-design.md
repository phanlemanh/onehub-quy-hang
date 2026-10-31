# Mở sàn trùng tên — thiết kế

Hàng 56 của lộ trình (nền, dãy X, đợt nen-2, T3), đứng trên hàng 6 (đăng nhập theo sàn). Mở từ Cổng Bằng chứng hàng 6,
mục Ngoài-7 và Ngoài-15 — chủ kho chọn «mở hợp đồng mới» ngày 30/10. Chạm bất biến 1 (cách ly giữa công ty).

## Vấn đề

Công cụ vận hành mở sàn (`packages/db/scripts/mo-san.mjs`, hàm `moSan`) tìm sàn theo TÊN: `select id from companies
where name = $1`. Đội vận hành mở sàn cho một công ty mới mà tên trùng một sàn đang chạy (hai công ty «[Tên sàn]» ở hai
thành phố) thì công cụ không tạo sàn mới — nó gắn email quản trị của công ty mới vào SÀN CŨ, mang vai quản trị sàn. Người
ấy đăng nhập là thấy toàn bộ dữ liệu của công ty khác: phạm bất biến 1 mà không có lỗi nào báo.

## Cách làm

Danh tính của một lần mở sàn là cặp (tên sàn, email quản trị đầu tiên), không phải tên:

1. Trong MỌI sàn mang tên ấy (không chỉ sàn đầu tiên), có sàn mà email này là QUẢN TRỊ sàn → đó là lần chạy lại: trả sàn
   ấy, không tạo gì (giữ «chạy lại không tạo trùng», cả khi email viết hoa hay có khoảng trắng). Email chỉ là thành viên
   thường (được quản trị mời ở hàng 7) thì không tính là chạy lại.
2. Ngược lại → luôn tạo sàn mới, kể cả khi đã có sàn khác cùng tên. Công cụ dòng lệnh in thêm một dòng «đã có N sàn khác
   cùng tên — đây là sàn mới <mã>» để đội vận hành thấy.
3. Muốn gắn thêm người vào một sàn đang có thì không dùng công cụ này: quản trị sàn mời người (hàng 7).

Hàm trả thêm `daCo: number` — số sàn khác cùng tên đã có trước lần mở này — và `chayLai: boolean`. Dòng lệnh in
«chạy lại — sàn có sẵn <mã>» khi chạy lại, «đã có N sàn khác cùng tên — đây là sàn mới <mã>» khi mở trùng tên.

Lối khác (câu Hỏi-1 ở Cổng Phạm vi): từ chối khi trùng tên và đòi cờ `--san-moi` hay `--san <mã>` tường minh. An toàn hơn
một nấc nhưng bắt người vận hành chọn mỗi lần trùng, và đổi cách gọi của dữ liệu mẫu, bài thử vai.

## Phép đo

- `packages/db/tests/mo-san.test.mjs`: hai lần mở cùng tên, khác email → hai sàn khác mã, người thứ hai là quản trị sàn
  mới và không là thành viên sàn cũ; chạy lại đúng lệnh → cùng sàn (các ca cũ giữ nguyên).
- `packages/db/tests/isolation.test.mjs` (chỉ thêm ca): hai sàn cùng tên mở bằng `moSan` thật, mỗi sàn có dữ liệu; dưới
  vai của API, người mới đặt sàn mới hay đặt sàn CŨ đều không thấy dòng nào của sàn cũ ở mọi bảng có cột `company_id` mà
  sàn cũ thật sự có dòng (đếm bằng vai chủ trước), và không thấy dòng `companies` của sàn cũ; đối chứng dương: quản trị sàn
  cũ thấy dòng của sàn cũ.

## Không làm

- Không thêm ràng buộc duy nhất cho tên sàn (hai công ty thật có thể trùng tên).
- Không đổi màn hay API: mở sàn vẫn là việc của đội vận hành.
- Không gộp hay dọn các sàn đã lỡ gộp người (chưa có dữ liệu thật — Tham chiếu: chỉ dữ liệu mẫu).

## Đặc tả UX

Bỏ — công cụ dòng lệnh của đội vận hành, không chạm màn.

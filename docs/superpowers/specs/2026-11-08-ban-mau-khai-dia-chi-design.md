# Bản mẫu khai địa chỉ màn thật — thiết kế

Hàng `ban-mau-khai-dia-chi` (dãy D, T2). Căn cứ: `docs/plan/ra-soat-ban-mau.md` §3, chủ kho «Duyệt, mở hàng» 05/11.

## Vấn đề

Bản mẫu chạy ở `/proto/<tên>`. Vỏ suy nhà từ đầu đường, nên ở đó không sáng nhà, không có cột thứ hai, tiêu đề điện thoại
là «Quỹ hàng», không tab nào sáng. Ảnh trình chủ kho thiếu vỏ (14 hồ sơ). Luật đợt 73 đang chữa tạm bằng cách đặt bản mẫu
dưới nhà, nhưng mục sáng của cột thứ hai vẫn tắt và trang lại khớp hai nhóm khuôn.

## Cách làm

**Trang khai, vỏ đọc.** Trang bản mẫu đặt `<KhaiDiaChi duong="/settings/labels" />`. Vỏ giữ địa chỉ khai trong một ngữ cảnh;
mọi chỗ vỏ từng đọc đường thật (nhà, tiêu đề điện thoại, tab dưới, mục sáng cột thứ hai) đọc qua một hàm thuần
`duongCuaVo` ở `packages/core/src/navigation.ts`.

- `duongCuaVo` chỉ nhận địa chỉ khai khi đường đang chạy thuộc khu `/proto/` hoặc vỏ đang ở trang mẫu sống. Màn thật không
  thể bị đổi địa chỉ, kể cả khi lỡ đặt `KhaiDiaChi` vào màn thật.
- Địa chỉ không thuộc nhà nào thì vỏ giữ đường thật.
- Địa chỉ mang được tham số (`/today?nhom=…`): mục sáng đọc tham số của địa chỉ khai, không đọc `?loi=` của trang ba lối.
- Prop `nhaMau` của trang mẫu sống (hàng 91) nâng thành `diaChiMau`, một cơ chế cho cả hai.

**Vì sao khai ở trang.** Bảng chung làm mọi hàng chạm một tệp và gỡ bản mẫu không còn là xoá một thư mục. Tệp địa chỉ theo từng
thư mục mà vỏ đọc ở máy chủ không dùng được: layout của Next không nhận đường của trang con, muốn có phải thêm middleware gắn
đường vào header, ngoài vùng của hàng, rồi vẫn phải nạp động tệp theo tên. Đổi lại, vỏ chỉ biết địa chỉ sau khi trang chạy ở
trình duyệt, nên HTML máy chủ của khu bản mẫu chưa có cột; ảnh chụp sau khi trang chạy thì đủ. Màn thật không đổi.

**Bộ quét bản đồ khuôn.** Khoá tuỳ chọn mới `tru_nhan_dien` của tệp nhóm: Trang tạm khai trừ `apps/web/src/app/(app)/proto/**`,
ba dòng ngoại lệ proto của Trang tạm bỏ đi. Bộ quét «màn ngoài bản đồ» bỏ qua khu bản mẫu. Luật mới: mọi `page.tsx` trong
khu phải có `KhaiDiaChi` với `duong` là chuỗi cố định, thuộc một nhà; đọc bảng nhà từ `homeOfPath` của `navigation.ts`, không
chép danh sách. Sai thì `npm run lint` đỏ, nêu tệp. Kit 2.37.0 chưa biết khoá mới: lưới khuôn của kit báo lệch ở khu bản mẫu thì
đi theo luật đợt 33 (ghi báo oan, báo giám sát), không giữ lại ngoại lệ.

**Sổ design-pass.** Khu bản mẫu có `proto/<slug>` mà hồ sơ `<slug>` đang mở có `design-pass.md` thì sổ phải chứa địa chỉ khai.
Hồ sơ đã ký không xét lại.

Ba trang đang có khai địa chỉ: `nhanh-tuc-thi` → `/inventory`, `cot-ho-so-can` và `anh-can-ba-ngan` → `/units/A-01.02`.

## Không làm

Không đổi `_acceptance/config.yaml` (`proto_route` giữ nguyên). Không chụp lại ảnh của hồ sơ đã ký. Không đổi điều hướng của
màn thật. Không sửa kit. Câu hỏi nhà của Nhập Excel, Ô nhận lead là chuyện màn thật.

## Dựng trên giao diện

Không có màn hay khối mới; `KhaiDiaChi` không vẽ gì. Không có lựa chọn nhìn để trình, nên không có design-pass; chấm bằng ảnh
so bản mẫu với màn thật cùng địa chỉ.

## Đối chiếu ngành

Không phải đối tượng nghiệp vụ: công cụ dựng bản mẫu nội bộ, không có khái niệm tương ứng trong RESO.

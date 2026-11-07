# Chặn trùng tên giá trị — thiết kế

Hàng lộ trình `chan-trung-ten-gia-tri` (dãy B, đợt dau-khach-nhap). Nguồn: Ngoài-1 và Ngoài-3 của hàng 45 `cach-goi-rieng`
— chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 05/11; Cổng Đáng: build (chủ kho, 07/11).

## Vấn đề

Màn Cách gọi (Cài đặt › Sàn › Cách gọi) cho quản trị đặt tên riêng cho từng giá trị chuẩn của tập đóng — hôm nay hai tập:
«Điều kiện phí» (`included` «Bao phí», `excluded` «Không bao phí») và «Lý do ngừng» (ba giá trị). Kiểm trùng hiện tại
(`dungDongNhan`, `packages/core/src/labels/index.ts`) chỉ so các tên riêng với nhau. Giá trị anh em chưa đổi tên thì
hiện tên mặc định, và tên mặc định ấy không được so. Hậu quả: quản trị đặt tên riêng của `excluded` là «Bao phí» thì
bảng hàng, ô lọc và trang khách hiện hai lựa chọn khác nghĩa cùng chữ «Bao phí» — khách đọc căn không bao phí thành
bao phí.

## Luật mới

Trong MỘT tập đóng, **tên đang hiện** của mỗi giá trị sau khi lưu = tên riêng gửi lên, vắng thì tên mặc định. Tên riêng
gửi lên của một giá trị bị chặn khi trùng (bỏ hoa thường và dấu cách thừa — cùng cách so nhãn trạng thái hàng 46,
Hỏi-7 đã duyệt) với:

1. tên đang hiện của giá trị khác cùng tập (riêng, hay mặc định khi giá trị kia chưa đặt), hoặc
2. tên mặc định của giá trị khác cùng tập, kể cả khi giá trị kia đã đổi tên — chặn đổi chéo «Bao phí» ↔ «Không bao
   phí» (**Hỏi-1**, khuyến nghị; như Hỏi-7 hàng 46).

Vi phạm → máy chủ từ chối cả bộ (400, nguyên khối như cũ); câu lỗi nêu tên mặc định của giá trị kia:
`Trùng tên của «<tên mặc định của giá trị kia>»`.

- Một hàm lõi `trungTenGiaTri(truong, tenRieng)` trả, với mỗi giá trị có tên riêng bị trùng, giá trị anh em nó trùng;
  `dungDongNhan` (máy chủ) và màn Cách gọi cùng gọi nó — màn khoá «Lưu» đúng khi máy chủ sẽ từ chối.
- Gõ đúng tên mặc định của chính giá trị ấy vẫn là «dùng mặc định» (như cũ).
- Hai tập khác nhau được trùng chữ (mỗi tập là một ô lọc riêng).
- Dữ liệu đã lưu trùng từ trước (**Hỏi-2**, khuyến nghị): màn hiện lỗi ở ô ngay khi mở và khoá «Lưu»; máy chủ chặn cả
  lượt lưu tới khi quản trị sửa ô trùng.

## Đối chiếu ngành

| Năng lực | RESO | Follow Up Boss | KW Command | Ta làm | Ta cứng — họ cấu hình? |
|---|---|---|---|---|---|
| Tên hiện của giá trị trong một danh sách có nghĩa chung | `MlsStatus` neo vào đúng một `StandardStatus`; mỗi lookup là một giá trị có tên riêng trong danh sách ([MlsStatus](https://dd.reso.org/DD2.0/Property/MlsStatus/)) — luật trùng tên chưa kiểm | Stage tự đặt — có chặn trùng tên hay không: chưa kiểm | Nhãn cố định — không áp | Chặn trùng tên đang hiện trong cùng tập; sàn vẫn tự đặt tên | Không: luật trùng giữ nghĩa phân biệt được của một tập (lý do «nghĩa chuẩn để so»), không phải danh sách sàn muốn cấu hình — không thành Hỏi |

## Màn Cách gọi

Không đổi bố cục. Ô có chữ bị chặn theo luật trên → `FieldError` sẵn có của ô hiện «Trùng tên của «<tên mặc định của
giá trị kia>»», nút «Lưu» khoá — tính cả lúc mở màn từ dữ liệu đã lưu. Cả hai ô cùng có chữ trùng nhau thì cả hai
hiện lỗi. Ô trống (dùng mặc định) không hiện lỗi — lỗi nằm ở ô có chữ, là ô quản trị đang sửa.

## Ngoài phạm vi

- Tên trường trùng nhau (hai cột cùng tên) — câu giao chỉ nói giá trị.
- Nhãn trạng thái (hàng 46 đã có kiểm trùng riêng).
- Tự sửa dữ liệu đã lưu trùng từ trước.

## Đặc tả UX

Bỏ: chỉ thêm một câu lỗi vào ô sẵn có — không màn, vùng, luồng hay trạng thái mới (sổ quyết định, dòng «bỏ
đặc-tả-UX»).

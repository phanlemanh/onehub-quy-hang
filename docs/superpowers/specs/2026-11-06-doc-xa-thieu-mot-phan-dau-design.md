# Thiết kế — Đọc tên xã gõ thiếu một phần dấu (hàng doc-xa-thieu-mot-phan-dau)

Ngày 06/11/2026 · dãy X · T2 · lõi thuần (`packages/core/src/address/`).

## Vấn đề

Hàng danh-muc-xa-day-du nạp đủ 3.321 xã và đổi bộ so tên xã sang hai đường (quyết định S3
`d-20261106T043914Z-19`): người gõ có chữ â ă ê ô ơ ư đ thì so **giữ chữ** (bỏ dấu thanh, giữ mũ/móc/đ); người gõ không
có chữ nào như vậy thì so **bỏ dấu**. Đường giữ chữ đòi tên trùng nguyên văn, nên người gõ thiếu một phần — «Phường Tan
Định» (thiếu mũ ở «â»), «Phường Đong Ba» (thiếu mũ ở «ô») — không ra phường và còn bị báo «chưa có trong danh mục». Đây là
Ngoài-1 của hàng trước; chủ kho chọn «mở hợp đồng mới» (`d-20261106T070204Z-21`).

Lối «giữ chữ không khớp thì lui về so bỏ dấu» dựng lại đúng lỗi mà quyết định S3 vừa đóng: «Phường Tân Định, Tỉnh Bắc
Ninh» khớp nhầm «Tân Dĩnh». Danh mục cả nước có 39 cặp tên xã cùng dạng bỏ dấu mà khác chữ mũ/móc/đ, 37 cặp nằm ở hai tỉnh
khác nhau (đếm 06/11).

## Cách làm — so tương thích dấu

Chữ người gõ là một **mẫu**: chữ nào người gõ CÓ mũ/móc/đ thì chữ ấy phải trùng đúng; chữ nào người gõ để gốc (a, o, u,
e, d) thì nhận chữ gốc lẫn mọi chữ mang mũ/móc/đ cùng gốc. Dấu thanh bỏ ở cả hai bên như hôm nay.

- «Tan Định» ↔ «Tân Định»: t·a·n so «tân» — «a» để gốc nhận «â»; «đ» trùng «đ» → khớp.
- «Tân Định» ↔ «Tân Dĩnh»: người gõ «đ», danh mục «d» → không khớp. Lỗi cũ không quay lại.
- «Tơn Định» ↔ «Tân Định»: người gõ «ơ», danh mục «â» → không khớp. Gõ sai chữ mũ thì vẫn không nới.
- Người gõ không có chữ mũ/móc/đ nào → mẫu nhận mọi chữ → đúng bằng so bỏ dấu hôm nay. Người gõ đủ dấu → chỉ tên trùng
  nguyên văn (và tên khác chỉ ở chữ người gõ để gốc). Hai đường cũ là hai ca biên của luật mới, không phải nhánh riêng.

**Tên trùng nguyên văn thắng.** Sau khi lọc theo tỉnh, ứng viên nào có dạng giữ chữ trùng nguyên văn dạng giữ chữ người
gõ thì chỉ giữ các ứng viên ấy; các ứng viên chỉ-tương-thích bị loại. Không có luật này, người gõ đúng tên chính thức
«Văn Lang» (Phú Thọ) lại bị hỏi chọn giữa Văn Lang và Văn Lăng — lùi so với hàng trước. Với luật này, gõ đủ dấu cho đúng
kết quả của bộ đọc hàng trước.

**Chiều của luật.** Luật có chiều: chữ người gõ để gốc nhận chữ có mũ/móc/đ, không ngược lại. «Phường Tân Dĩnh, Thành phố
Hồ Chí Minh» (bỏ dấu thanh: «Tân Dinh», «d» để gốc) tương thích với «Tân Định» của TP.HCM và ra Tân Định — đó đúng là gõ
thiếu dấu một tên của tỉnh đã chọn, cùng nghĩa với «Tan Dinh, TP.HCM» mà bộ đọc đã đọc ra Tân Định từ hàng 75. Chiều
ngược — «Tân Định» kèm tỉnh của «Tân Dĩnh» — không khớp. Trong 74 cặp có thứ tự khác tỉnh của danh mục: 44 cặp chữ người
gõ trái danh mục (không khớp), 30 cặp chỉ thiếu dấu (ra xã của tỉnh đã chọn).

Cài đặt: tra ứng viên bằng khoá bỏ dấu (chỉ mục `xaBo`, `cuBo` có sẵn), rồi lọc ứng viên bằng phép so tương thích từng
chữ trên dạng giữ chữ. Không thêm chỉ mục, không đổi khoá địa chỉ (`khoaDiaChi` dùng mã tỉnh, mã xã — không dùng tên).

Nhiều ứng viên còn lại sau lọc trong cùng tỉnh → «cần người chọn» với đúng các ứng viên ấy, như luật hiện có. Không
đoán.

Công tắc thử: `LuatDoc` có sẵn hai công tắc cho bộ kiểm dựng lại hành vi cũ khi phá thử. Thêm công tắc `soDau` bốn giá
trị — `giu` (hành vi hàng trước), `tuong-thich` (hành vi mới, mặc định của `docDiaChi`), `lui-bo-dau` (lối lui về so bỏ
dấu, chỉ để phá thử chứng rằng bộ kiểm khớp nhầm bắt được nó), `tuong-thich-tron` (tương thích mà không ưu tiên tên
trùng nguyên văn, chỉ để phá thử). Tệp `doc-dia-chi-loi.ts` vẫn không xuất qua `index.ts`.

## Đối chiếu ngành

RESO Data Dictionary không có cấp xã; tên xã (`wardName`) là đặc trưng Việt Nam như hàng 75. Không có danh sách cố định
nào mới — luật so là luật đọc của lõi (nghĩa chuẩn của danh mục), không phải dữ liệu của sàn; không dòng «ta cứng — họ
cấu hình».

So tên có dấu theo «mẫu tương thích» là cách các bộ chuẩn hoá địa chỉ xử lý chữ có biến thể (USPS CASS chuẩn hoá về dạng
chính thức nhưng không nới khi chữ người gõ mâu thuẫn với dạng chính thức; libpostal tách chuẩn hoá ký tự khỏi so khớp và
giữ nhiều ứng viên khi mơ hồ). Ở đây danh mục là chuẩn; chữ người gõ chỉ được thiếu, không được trái.

## Vùng và việc không làm

- Vùng: `packages/core/src/address/**` và hồ sơ.
- Không suy tỉnh từ tên phường (giữ `d-20261105T122556Z-9`, nhắc lại ở `d-20261106T034915Z-9`).
- Không sửa lỗi gõ sai chữ (đ thành d, ơ thành â): chữ trái danh mục vẫn ra «chưa có trong danh mục» — chiều an toàn.
- Không đổi đọc tên tỉnh, tên huyện cũ (đã so bỏ dấu, không có lỗi này).

## Đặc tả UX

Bỏ — hàng là lõi thuần, không màn, không surface web-UI (cùng lý do `dia-chi-chuan#d-20261105T115755Z-7`).

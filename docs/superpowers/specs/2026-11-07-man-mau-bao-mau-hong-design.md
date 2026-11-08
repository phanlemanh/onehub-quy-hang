# Màn Mẫu báo mẫu hỏng — thiết kế

Hàng `man-mau-bao-mau-hong` (lộ trình), mở từ Ngoài-9 của `mau-bang-hang-va-bai` (#191): chủ kho chọn «mở hợp đồng mới»
ở Cổng Bằng chứng 07/11 (sổ `d-20261107T114018Z-46`). Hạng T2: chỉ web, không migration, không đổi API.

## Vấn đề

`GET /api/v1/company/templates/export` và `/posts` đọc khoan dung: dòng lưu hỏng (ghi thẳng vào cơ sở dữ liệu, bản cũ,
cột nội bộ, tên trùng, quá 20 mẫu, kênh lạ…) bị bỏ khỏi `templates` và mỗi chỗ bỏ một dòng trong `errors`. Màn Mẫu
(`apps/web/src/app/(app)/settings/templates/page.tsx`) vứt `errors`. Quản trị thấy danh sách thiếu mà không biết vì sao,
và lần lưu kế ghi nguyên khối từ danh sách đã lọc — chỗ hỏng mất hẳn mà không ai được báo.

## Cách làm

- **Trang chuyển `errors` xuống hai tab.** `page.tsx` giữ `errors` của hai lần đọc; `TrangThaiMauSan` thêm `baoHong:
  string[]` (lời cho người) ở trạng thái `xong`.
- **Lời cho người, ở web.** Hàm thuần `loiMauHong(errors, loai)` trong `settings/templates/mau-san.ts` đổi mỗi dòng lõi
  sang một câu: chỉ số → «Mẫu thứ n đã lưu», khoá cột → nhãn cột (`COT_BANG_HANG`), khoá kênh → «Zalo»/«Facebook»; phần
  lý do theo `lyDoChoNguoi` sẵn có. Không câu nào mang khoá kỹ thuật (`export.templates[1]`, `holderName`…). Dòng không
  nhận ra khuôn → câu chung «Một chỗ trong mẫu đã lưu không đọc được».
- **Một khối báo đầu tab.** `TrangThai kind="notice"` (khuôn `trang-thai`), tiêu đề «Mẫu đã lưu có N chỗ không đọc
  được», mô tả là danh sách câu, kèm câu «Lần lưu kế sẽ bỏ hẳn những chỗ này; các mẫu khác giữ nguyên» (Hỏi-1). Không
  chỗ hỏng → không khối.
- **Lưu không đổi đường.** Thân `PUT` vẫn dựng từ danh sách đã đọc; sau khi lưu, trang làm mới, đọc lại — khối tự mất khi
  hết chỗ hỏng.

## Câu hỏi cho chủ kho

- **Hỏi-1 · Lưu khi còn chỗ hỏng.** Khuyến nghị: báo trước bằng khối đầu tab, lưu vẫn bỏ chỗ hỏng như hiện nay. Lối khác:
  (b) máy chủ giữ nguyên chỗ hỏng khi lưu (ghép dòng thô vào lần ghi) — chỗ hỏng nằm mãi, mọi lần đọc còn báo; (c) chặn
  lưu tới khi Quản trị bấm «Bỏ chỗ hỏng» trong một hộp xác nhận — thêm một bước cho mọi lần sửa. Khó đảo: với lối
  khuyến nghị, lần lưu đầu trên bản thật ghi đè chỗ hỏng — mất vĩnh viễn.
- **Hỏi-2 · Lời báo dựng ở đâu.** Khuyến nghị: ở web, từ `errors` sẵn có (API giữ nguyên, hạng T2); bài E3 ghim mọi dạng
  lỗi lõi phát ra phải được nhận ra. Lối khác: thêm trường lỗi có cấu trúc vào đáp GET — bền hơn, đổi API.
- **Hỏi-3 · Duyệt khối báo.** Khuyến nghị: bằng chữ ở Cổng Phạm vi, nhìn màn thật ở Cổng Bằng chứng (E7), như hàng 50.
  Lối khác: dựng bản bấm được (design-pass) trước Cổng Phạm vi.

## Đối chiếu ngành

Vòng chỉ báo trạng thái dữ liệu đã có; không thêm tập đóng, không giữ cứng điều gì mới — không có dòng «ta cứng — họ cấu
hình».

| Năng lực | RESO | Follow Up Boss | KW Command | Ta làm | Ta cứng — họ cấu hình |
|---|---|---|---|---|---|
| Báo mẫu đã lưu hỏng | không có đối tượng mẫu | chưa kiểm | chưa kiểm | khối báo đầu tab, lời thường | không |

## Tệp chạm

`apps/web/src/app/(app)/settings/templates/` — `page.tsx`, `mau-san.ts`, `vung-mau-bang.tsx`, `vung-mau-bai.tsx`, bài kiểm
thuần và `*.ro-ri.test.ts`. Bài nạp mẫu hỏng cho lượt nhìn màn: `_acceptance/man-mau-bao-mau-hong/thu/nap-mau-hong.mjs`.

## Màn

Không đổi bố cục: thêm đúng một khối `TrangThai kind="notice"` ở đầu tab Mẫu bảng hàng và tab Mẫu bài, theo khuôn
`trang-thai` và `cai-dat-san`. Duyệt bằng chữ ở Cổng Phạm vi, nhìn màn thật ở Cổng Bằng chứng (như hàng 50, Hỏi-1..5).

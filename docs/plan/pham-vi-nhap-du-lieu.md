# Bản phạm vi — nhập dữ liệu có tác tử (31/10) — ĐỀ XUẤT

Nguồn: [ADR-0011](../adr/0011-nhap-du-lieu-tac-tu.md) (trạng thái «đề xuất») và [Nhập dữ liệu](../architecture/nhap-du-lieu.md).
Chủ kho 31/10: nâng nhập dữ liệu thành giai đoạn trọng tâm, có tác tử AI dùng mô hình mạnh. **Chưa duyệt** — chủ kho
duyệt ADR-0011 thì chạy `/acceptance-gate:cat-luot` trên bản này; phiên thiết kế không sửa `lo-trinh.json`.

Thay hàng **20** `nhap-excel-ghep-cot` (phủ `D8`) và **21** `nhap-excel-nho-mau` (phủ `D9`). Lý do tách: hàng 20 hiện
gộp đọc file, ghép, xem trước, kiểm trùng và ghi trong một vòng T3; thêm tác tử, cửa chặn dữ liệu cá nhân và hoàn tác bằng
sự kiện bù thì quá cỡ một vòng, và luật «đo trước khi dựng» (Kiến trúc §0) đòi số nền tất định có trước tác tử.

<!-- <<<PHAM-VI-MA -->
```
dot: nhap-du-lieu-3110
dang: chuoi
nguon: docs/adr/0011-nhap-du-lieu-tac-tu.md

- `ND1` — lõi nhập tất định và bộ thử: phân loại cột, thực đơn phép biến đổi, áp kế hoạch, file bẩn có đáp án, số nền không AI
- `ND2` — đầu chủ thả file, xem trước từng ô, kiểm trùng, ghi qua lệnh; ngày xác nhận theo file
- `ND3` — hoàn tác cả lần nhập bằng sự kiện bù
- `ND4` — nhập lại cùng mẫu thì máy ghép sẵn: mẫu file và từ điển giá trị của sàn
- `ND5` — tác tử lập kế hoạch sau thoả thuận Xử lý bằng AI, cửa chặn nguồn, sổ và trần chi phí
- `ND6` — ô lạ còn lại có đề xuất của máy, người chọn
```
<!-- PHAM-VI-MA>>> -->

## Hàng đề xuất

| Mã | Câu giao (người dùng thấy gì) | Vai | Hạng | Đứng trên | Vùng | Bật khi |
| --- | --- | --- | --- | --- | --- | --- |
| ND1 `nhap-loi-tat-dinh` | Lõi đọc một bảng hàng bẩn và nói được từng cột là gì, từng ô đọc ra giá trị chuẩn nào hay vì sao không đọc được — không cần AI — kèm bộ file thử có đáp án | nền | T2 | 5, 9 | `packages/core/src/import/**`, `packages/core/test/import/**` | Hai file mẫu ghép 100%; số nền của bốn số đo trên file bẩn ghi vào hồ sơ; hồ sơ cột dựng ra không chứa giá trị nguồn nào trên `ban-nguon-giau` |
| ND2 `nhap-excel-xem-truoc-ghi` | Đầu chủ thả file bảng hàng cũ, thấy từng ô sẽ ghi gì (giữ nguyên · máy sửa · cần người · chặn), sửa rồi bấm ghi; căn trùng được hỏi; độ tươi theo ngày trong file | Đầu chủ, Trưởng nhóm (ADR-0011 quyết định 11, chờ chủ kho) | T3 | ND1, 8, 9, 11, 12, 15 | `apps/web/src/app/imports/**`, `packages/api/src/imports/**`, migration | 3.000 dòng xem trước không đứng màn; ghi xong số căn khớp đầu trang; mọi dòng đi qua lệnh của lõi hàng (kiểm thử một cửa xanh); không cột nào mất |
| ND3 `nhap-hoan-tac` | Đầu chủ hoàn tác cả một lần nhập; căn đã có người sửa sau đó được liệt kê, không bị gỡ | Đầu chủ | T3 | ND2 | `packages/core/src/listing/**`, `packages/api/src/imports/**`, migration | Nhập rồi hoàn tác: bảng hàng gấp lại đúng như trước; sự kiện vẫn chỉ thêm |
| ND4 `nhap-nho-mau` | Đầu chủ nhập lại file cùng mẫu và thấy máy ghép sẵn như lần trước, kể cả cách gọi riêng của sàn | Đầu chủ | T2 | ND2 | `packages/core/src/import/memory/**`, `apps/web/src/app/imports/templates/**`, migration | File cùng mẫu lần hai: 0 ô hỏi lại điều đã trả lời; tỉ lệ hỏi người ≤ 2% |
| ND5 `nhap-tac-tu-ke-hoach` (chỉ mở khi số nền ND1 hụt ngưỡng) | Quản trị sàn bật «Xử lý bằng AI»; đầu chủ thả file mẫu lạ và máy ghép gần hết, mỗi đề xuất kèm lý do; tắt hay hết trần thì vẫn nhập như ND2 | Đầu chủ, Quản trị sàn | T3 | ND1, ND2 | `packages/api/src/imports/ai/**`, `packages/core/src/agreements.ts`, migration | Rò nguồn ra AI = 0 (kiểm bắt buộc); vượt số nền của ND1 ở ghép cột và hỏi người, lỗi lọt không tăng; chi phí ≤ 1,5 USD một lần nhập mẫu mới |
| ND6 `nhap-o-la` | Ô máy không đọc được (giá dải, «thu về 4.2», trạng thái lạ) có đề xuất kèm lý do; đầu chủ chọn một chạm | Đầu chủ | T2 | ND5 | `packages/api/src/imports/ai/**` | Lỗi được sửa ≥ 80% trên bộ thử; không ô nào ghi khi người chưa chọn |

Hàng chờ điều kiện:

| Mã | Câu giao | Lý do chờ | Mở lại khi |
| --- | --- | --- | --- |
| H4 `nhap-google-sheets` | Đầu chủ chọn file Google Sheets ngay trong Quỹ hàng (Picker, quyền `drive.file`) và nhập lại một chạm | Bản đầu nhận file tải về là đủ; Picker cần dự án Google Cloud, màn đồng ý OAuth | Hai tuần thử cho thấy bước tải về là vướng, hoặc sàn ngoài đội dùng Sheets là chính |

Sửa kèm:

- Hàng **50** `mau-nhap-va-bai`: `dung_tren` đổi `21` → `ND4`.
- Hàng **45** `cach-goi-rieng` và ND4 cùng dùng từ điển giá trị của sàn: hàng nào vào trước tạo bảng, hàng sau dùng lại —
  ghi vào ô cơ hội của cả hai.
- Hàng **52** `so-do-hai-tuan-thu`: thêm số đo «tỉ lệ ô cần người mỗi lần nhập» và «chi phí AI mỗi sàn».

## Phủ

| Cũ | Mới |
| --- | --- |
| 20 (`D8`): thả file, ghép cột và giá trị, xem trước, không bỏ cột | ND1 (ghép, đọc giá trị) + ND2 (thả file, xem trước, ghi) |
| 21 (`D9`): nhớ mẫu | ND4 |
| 21 (`D9`): ngày xác nhận theo file | ND2 |
| 21 (`D9`): hoàn tác cả lần nhập | ND3 |
| Mới — tác tử | ND5, ND6 |

## Ra khỏi kho — việc của người

- **Tài khoản Claude API của OneHub** (tốn tiền): không gian làm việc riêng cho Quỹ hàng, trần chi tiêu, khoá đặt vào
  Vercel (Sensitive). Cần trước khi ND5 chạy bộ thử có tác tử; ND1–ND4 không cần.
- **Người pháp lý rà** bốn câu ở [Nhập dữ liệu §11](../architecture/nhap-du-lieu.md#11-an-toàn-và-pháp-lý), cùng đợt rà
  Kiến trúc §8 — trước khi ND5 chạm dữ liệu thật; trên dữ liệu mẫu thì dựng và đo được trước.
- **Vercel Pro** trước sàn trả tiền đầu tiên (điều khoản Hobby là phi thương mại; ghi chú phiên môi trường thật 31/10).

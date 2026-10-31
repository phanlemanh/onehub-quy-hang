# Bản phạm vi — mọi loại hình bất động sản (31/10)

Nguồn: [ADR-0016](../adr/0016-moi-loai-hinh.md) (trạng thái «đề xuất»). Chủ kho, Cổng Phạm vi hàng 24, 31/10: các
loại hình ngoài căn hộ là nợ phải giải, «nếu không giải thì sẽ không thể triển khai được»; giao giám sát đưa vào hạng
mục và lập lộ trình bổ sung. Cùng ngày: bỏ chữ «dự án», gọi theo RESO. Trang tri thức của đợt:
`docs/tri-thuc/wiki/dot/moi-loai-hinh-3110.md`.

<!-- <<<PHAM-VI-MA -->
```
dot: moi-loai-hinh-3110
dang: chuoi
nguon: wiki/dot/moi-loai-hinh-3110.md#ccc48fc8fec00f5ce684d6e9f4d9a9c953db1b21

- `LH1` — đổi «dự án» thành khu SubdivisionName ở lõi, API, dữ liệu mẫu, Tham chiếu, CONTEXT; mỗi căn mang PropertyType và PropertySubType theo RESO
- `LH2` — bộ trường theo loại hình là dữ liệu của lõi: trường dùng được, trường cần khi Sẵn sàng bán, mục của mức đủ
- `LH3` — khu thấp tầng trong danh mục: khu → dãy → lô, cách đọc mã lô, gõ mã lô ra thuộc tính lô
- `LH4` — địa chỉ Việt Nam chuẩn hoá và khoá địa chỉ; tên phường cũ trước 1/7/2025 ra phường mới; không dịch vụ ngoài
- `LH5` — hàng tạo được trên căn ngoài khu của sàn định danh bằng địa chỉ; sự kiện tạo hàng không còn bắt buộc toà
- `LH6` — kiểm trùng căn ngoài khu theo khoá địa chỉ: khớp đúng là đã có hàng mở, khác dạng viết là có thể trùng
- `LH7` — ô nhận lead nhận loại hình, mã lô hoặc địa chỉ; lead ngoài khu được mới biết đường và phường
- `LH8` — nhập file bảng hàng thấp tầng: cột loại hình, mã lô, địa chỉ, diện tích đất, mặt tiền, số tầng
- `LH9` — bảng hàng và hồ sơ căn hiện đúng trường theo loại hình, lọc và nhóm theo loại hình
- `LH10` — luật ẩn theo loại hình: khách riêng không thấy số nhà, mã lô, toạ độ; nhóm môi giới thấy đủ
- `LH11` — danh mục Invest mang khu thấp tầng và loại hình từng căn
- `LH12` — số thửa, tờ bản đồ làm khoá trùng thứ hai, ở lớp nguồn
- `LH13` — hàng thương mại (văn phòng, mặt bằng) và hàng cho thuê
```
<!-- PHAM-VI-MA>>> -->

## Hàng

| Mã | Hàng | Câu giao (tóm) | Hạng | Đứng trên | Chặn |
| --- | --- | --- | --- | --- | --- |
| LH1, LH2 | 72 `khu-va-loai-hinh` | Lõi, API, tài liệu gọi khu là SubdivisionName; căn mang loại hình; bộ trường theo loại hình | T3 | 9, 63 | Nên gộp trước khi hàng 10, 24 mở Cổng Phạm vi |
| — | 73 `du-lieu-mau-thap-tang` | Dữ liệu mẫu thứ hai: một khu thấp tầng, nhà và đất ngoài khu, file bảng hàng thấp tầng bẩn có đáp án | T3 | 72, 5 | — |
| LH3 | 74 `go-ma-lo` | Đầu chủ gõ mã lô và thấy thuộc tính lô tự điền | T2 | 72, 73 | — |
| LH4 | 75 `dia-chi-chuan` | Lõi đọc địa chỉ gõ kiểu nào cũng được ra địa chỉ chuẩn và khoá | T2 | 73 | — |
| LH5 | 76 `can-ngoai-khu` | Hàng tạo được trên lô và trên căn ngoài khu; bảng căn ngoài khu có luật cách ly | T3 | 72, 75, 8 | — |
| LH6, LH7 | 77 `lead-moi-loai-hinh` | Telesales nhập lead nhà phố, biệt thự, đất và thấy kết quả kiểm trùng như căn hộ | T3 | 24, 73, 74, 76 | — |
| LH8 | 78 `nhap-file-thap-tang` | Đầu chủ thả file bảng hàng thấp tầng và thấy máy đọc đúng cột theo loại hình | T2 | 65, 73, 75, 76 | — |
| LH9 | 79 `bang-hang-theo-loai-hinh` | Bảng hàng và hồ sơ hiện đúng trường theo loại hình | T2 | 14, 17, 73, 76 | — |
| LH10 | 80 `luat-an-theo-loai-hinh` | Khách riêng không thấy số nhà, mã lô, toạ độ | T3 | 31, 35, 73, 76 | — |

Hàng 73 do phiên cắt tạo (bước 2b luật 5): các hàng đo trên căn thấp tầng và căn ngoài khu cần dữ liệu giả có nhãn mà
hàng 5 (một khu căn hộ) không có. Tên đường trong dữ liệu mẫu là «Đường Mẫu N», số nhà sinh; tên tỉnh, xã lấy từ danh
mục đơn vị hành chính (dữ liệu công) — không địa chỉ thật của ai.

**Không hàng nào chặn hai tuần thử**: hai tuần thử là một khu căn hộ (Tham chiếu §1). Chín hàng chặn việc mở Quỹ hàng
cho sàn có bảng hàng thấp tầng hay nhà lẻ — sàn thứ hai trong ghi chép 28/10 là một sàn như vậy. Nếu khu thử có cả thấp
tầng (Hỏi-4 của ADR-0016), 72, 73, 74, 76, 77, 79, 80 thành điều kiện của hai tuần thử.

## Phụ thuộc với đợt dau-chu-dong-vao đang chạy

- **Hàng 63** (dãy D, PR #42) sửa `packages/core/src/catalog/lookup.ts` — hàng 72 đổi tên trên chính tệp ấy, nên đứng
  trên 63.
- **Hàng 10** (dãy D, kế tiếp): ADR-0016 quyết định 9 là khuyến nghị cho thiết kế của hàng 10 (tên khu RESO, mỗi căn
  mang `propertySubType`); không hàng nào của đợt này sửa `packages/connect`. Phần thấp tầng trong khuôn chờ ở `LH11`.
- **Hàng 24** (dãy L): hàng 77 đứng trên 24 — mở rộng ô nhận lead và bộ kiểm trùng 24 dựng, không làm song song trong
  cùng vùng `packages/core/src/dedupe/**`.

## Chờ điều kiện

- `LH11` → mục chờ H5 — Invest chưa có danh bạ thấp tầng; mở lại khi Invest khai danh bạ thấp tầng trong khuôn phiên bản 1 và hàng 10
  đã giao.
- `LH12` → mục chờ H6 — khoá địa chỉ cộng kiểm theo chủ nhà là đủ cho bản đầu; số thửa nằm trên sổ, thêm là thêm một trường lớp nguồn.
  Mở lại khi hai tuần thử hay sàn thứ hai cho thấy trùng lọt qua khoá địa chỉ.
- `LH13` → mục chờ H7 — chưa sàn nào trong ghi chép bán hàng thương mại hay cho thuê. Mở lại khi có sàn dùng thử cần.

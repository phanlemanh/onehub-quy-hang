# Khoá máy cấp: số điện thoại dính dấu tách — thiết kế

Ngày: 2026-11-09 · Hàng `va-khuon-doan-sdt-ranh-gioi` · Dãy G · Hạng **T3** (`packages/connect/**`). Nguồn: Ngoài-1 của
hàng `va-khuon-xac-nhan-bao-sai-quet-ro-ri` (chủ kho chọn «mở hợp đồng mới» khi ký 09/11, sổ d-20261108T222856Z-14).

Chưa có đường chảy thật, Invest chưa ghim khuôn (onehub-invest#296 chờ hàng này). Không màn hình, không migration, không
đổi hình khuôn v1: chỉ thêm giá trị bị từ chối.

## 1. Lỗ

`MAU_DOAN_SDT` chỉ nhận ranh giới đoạn là đầu chuỗi, cuối chuỗi, `:` hay `_`, trong khi khoá toà và UPI còn cho phép `-` và
`.`. Nên `bld-0900000071`, `toa-090-000-0071`, `urn:onehub:upi:mau-0900000071` qua cả hàm dựng lẫn khuôn.

## 2. Luật mới

Một hằng duy nhất, hàm dựng và khuôn cùng dùng như hiện tại:

```
MAU_DOAN_SDT = /(?<![A-Za-z0-9])\d(?:[.\-_:]*\d){8,10}(?![A-Za-z0-9])|(?<!\d)(?=\d+[.\-_:]+\d)\d(?:[.\-_:]*\d){8,10}(?!\d)/
```

Đọc bằng lời, một dãy 9–11 chữ số giữa các chữ số có thể có dấu tách bị chặn khi: hai đầu dãy không dính chữ hay số; hoặc
trong dãy có ít nhất một dấu tách, dù hai đầu dính chữ. `/` không có trong biểu thức vì khoá toà và UPI vốn không nhận `/`.

| Khoá | Kết quả | Vì sao |
|---|---|---|
| `bld-0900000071`, `toa-090-000-0071`, `bld.0900000071-A` | chặn | hai đầu không dính chữ hay số (Hỏi-2) |
| `090:000:0071`, `090--000--0071` | chặn | mọi dấu tách khoá cho phép (Hỏi-1) |
| `12-0900000071`, `toa-123-456789012` | chặn | có một đoạn đứng riêng đủ 9–11 chữ số (Hỏi-3) |
| `toa090-000-0071`, `x090:000:0071`, `toa-090-000-0071x` | chặn | có dấu tách, dù dính chữ (Hỏi-4) |
| `x0900000071`, `0900000071x` | qua | số liền không dấu tách dính chữ — phần dư đã chọn ở hàng trước |
| `bld_01234567890123456789012345` (ULID toàn số) | qua | 26 chữ số liền |
| `bld_01JC8R4ZQK0123456789ABCDEF` | qua | số liền không dấu tách dính chữ |
| `bld_012345678901`, `toa-1234-56789012` | qua | không có đoạn nào đứng riêng đủ 9–11 chữ số |

UPI thật có `:`, nên đã soi: `urn:onehub:upi:1:VN:VN-01:bld_…` chỉ có dãy số ngắn, liền sau là chữ.

Lỗi của hàm dựng nói rõ nguyên nhân («Khoá toà sai dạng: có đoạn dáng số điện thoại.»), khuôn cũng vậy, để phép đo phân biệt
bị chặn vì số điện thoại với bị chặn vì hình khoá.

## 3. Đo

Ma trận toàn phần, không chọn ca: 7 dấu nối × 5 ranh giới trước × 5 ranh giới sau = 175 khoá, đo trên hai nút khuôn và năm
đường hàm dựng. Mỗi ô có đối chứng ghép cặp: cùng hình, cùng dấu nối, 8 chữ số thì qua. Ma trận hàm dựng phủ cả nhánh UPI của
thuộc tính căn, chỗ lượt chấm trước chỉ ra chưa có phép đo.

## 4. Ngoài phạm vi

Siết khuôn chiều vào · số liền không dấu tách dính chữ (`x0900000071`, đã chọn giữ) · mã người gõ (luật `MAU_DANG_SDT` không đổi).

## 5. Câu hỏi cho Cổng Phạm vi

Bốn câu cùng một luật, đều khó đảo vì thuộc khuôn Invest sẽ ghim.

- **Hỏi-1 — dấu nối ngoài câu giao.** Khuyến: phủ mọi dấu tách mà khoá cho phép, gồm `:` và dấu lặp. Lối khác: chỉ gạch và
  chấm — `090:000:0071`, `090--000--0071` còn lọt.
- **Hỏi-2 — ranh giới hai đầu.** Khuyến: mọi ký tự không phải chữ hay số. Lối khác: chỉ thêm gạch và chấm vào ranh giới hiện
  có — cùng kết quả với bộ ký tự khoá cho phép hôm nay, nhưng nới bộ ký tự sau này thì lỗ mở lại.
- **Hỏi-3 — đoạn đứng riêng trong dãy dài.** Khuyến: chặn khi có một đoạn đứng riêng đủ 9–11 chữ số, nên `12-0900000071` bị
  chặn. Giá: khoá toàn số ghép bằng dấu tách có đoạn như vậy bị từ chối; hai dạng khoá thật không có dạng này. Lối khác: xét độ
  dài cả dãy — `12-0900000071` lọt.
- **Hỏi-4 — dính chữ mà có dấu tách.** Khuyến: chặn, vì `toa090-000-0071` vẫn là số điện thoại; phần dư chỉ còn số liền dính
  chữ. Giá: khoá có dãy số nối bằng dấu tách dính chữ bị từ chối. Lối khác: giữ qua như số liền — dạng ấy lọt.

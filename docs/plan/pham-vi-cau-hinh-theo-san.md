# Bản phạm vi — cấu hình theo sàn (01/11)

Nguồn: [ADR-0018](../adr/0018-cau-hinh-theo-san.md) (trạng thái «đề xuất») · sổ:
[Sổ điểm biến thiên](../architecture/so-diem-bien-thien.md). Chủ kho 31/10–1/11: Quỹ hàng phục vụ nhiều sàn với cách
làm khác nhau, nên thiết kế như một công ty SaaS; chọn mở phiên thiết kế. Trang tri thức của đợt:
`docs/tri-thuc/wiki/dot/cau-hinh-theo-san-0111.md`.

<!-- <<<PHAM-VI-MA -->
```
dot: cau-hinh-theo-san-0111
dang: chuoi
nguon: wiki/dot/cau-hinh-theo-san-0111.md#1c5cf2675135487835527ef0631137a34455d447

- `CH1` — sổ điểm biến thiên ở lõi: khoá, kiểu, mặc định, khoảng cho phép, vai được đổi, cấp ghi đè, hiệu lực, lớp dữ liệu; sổ ở tài liệu và sổ ở mã khớp nhau
- `CH2` — luật của lõi nhận cấu hình làm tham số; hằng số đã có (gọi lại 14 ngày, hỏi lại khi đổi giá quá 20%, hạn lead 15 và 30 phút) đọc mặc định từ sổ
- `CH3` — bảng cấu hình theo sàn: sự kiện chỉ thêm và bản hiện hành, luật theo dòng, không bao giờ lớp nguồn; sàn chưa đổi thì nhận mặc định của sổ
- `CH4` — lệnh API đọc và đổi cấu hình: giá trị kiểm theo khuôn và khoảng của sổ, vai theo sổ, mỗi lần đổi ghi người và vai
- `CH5` — điểm chỉ áp cho mới: đối tượng mang số cấu hình lúc tạo, đổi sau không sửa số đã lưu
- `CH6` — bảng quyết định ở một điểm đã biết: dữ kiện và phép so cố định, khớp dòng đầu, dòng cuối là mặc định
- `CH7` — sàn thêm điều kiện riêng cho Sẵn sàng bán, chỉ thêm, không bớt điều kiện của lõi
- `CH8` — ngưỡng nên gọi ép giá khác theo loại căn hay mức giá
- `CH9` — trường riêng kiểu chữ, số, ngày
- `CH10` — quản trị sàn xem nhật ký cấu hình và trả một điểm về giá trị cũ
- `CH11` — sao cấu hình của một sàn mẫu khi mở sàn mới
- `CH12` — đối tượng do sàn tự tạo, trường công thức, luồng việc tự vẽ, kịch bản do sàn viết
- `CH13` — gửi định nghĩa trường riêng và nhãn riêng của sàn cho tác tử AI nhập dữ liệu
```
<!-- PHAM-VI-MA>>> -->

## Hàng

| Mã | Hàng | Câu giao (tóm) | Hạng | Đứng trên | Chặn |
| --- | --- | --- | --- | --- | --- |
| CH1, CH2 | 81 `so-diem-bien-thien` | Mọi điểm sàn chỉnh được khai ở một sổ của lõi; luật nhận cấu hình làm tham số | T2 | 8 | 45–50 (qua 82) |
| CH3, CH4, CH5 | 82 `cau-hinh-theo-san` | Mỗi sàn giữ cấu hình trong cơ sở dữ liệu, đổi qua một lệnh thành sự kiện; mặc định khi chưa đổi; đối tượng cũ giữ số cũ | T3 | 81, 7, 25 | 45, 46, 48, 49 |

Đổi `dung_tren` của hàng đã có: 45 `cach-goi-rieng` thêm 82 · 46 `trang-thai-rieng` thêm 82 · 47 `truong-rieng-toi-thieu`
thêm 81 (giới hạn và khuôn trường riêng ở sổ; định nghĩa trường riêng có bảng riêng của 47) · 48 `luat-chia-lead` thêm
82 · 49 `thue-phi` thêm 82 · 50 `mau-nhap-va-bai` thêm 81 (chỗ điền của mẫu chỉ lấy trường luật ẩn cho phép; mẫu có bảng
riêng).

Hai hàng, không một: 81 là lõi thuần, kiểm không cần cơ sở dữ liệu; 82 chạm cơ sở dữ liệu và quyền (T3) — luật cắt 3
tách lớp khó đảo. 82 đứng trên 25 vì ca «mới và cũ» đo trên lead thật của 25: hạn ghi vào lead lúc chia.

**Không hàng nào chặn hai tuần thử**: bản đầu chạy bằng mặc định dựng sẵn (Tham chiếu §10, dòng Cài đặt sàn P1). Hai hàng
chặn Cài đặt sàn 45–50.

## Phụ thuộc với đợt dau-chu-dong-vao đang chạy

- **Hàng 25** (dãy L) dựng thực đơn chia lead, bảng `company_settings` và bốn khoá `lead_routing.*` (mặc định ở
  `packages/core/src/routing/index.ts`, `DEFAULT_LEAD_ROUTING`); lead mang dấu cách chia và hai hạn từ nhịp đầu. 81 đưa bốn
  khoá vào sổ chung sau khi 25 gộp; 82 thêm nhật ký sự kiện và mở bảng cho mọi khoá — không đổi khoá, không đổi bảng.
- **Hàng 22, 23** (dãy G, H) sắp dựng ngưỡng ép giá 10 ngày và điều kiện Sẵn sàng bán — nên khai một chỗ ở lõi như hàng
  25; 81 gom về sổ khi mở. Không hàng nào của đợt này sửa vùng mã của dãy đang chạy lúc cắt.
- Vùng của 81 (`packages/core/src/config/**`) mới hoàn toàn; 82 thêm `packages/api/src/settings/**`.

## Chờ điều kiện

- H8 (CH6) — chia lead đã là thực đơn năm chiến lược (hàng 25 dựng, hàng 48 màn; chủ kho 1/11); bảng quyết định mở lại
  khi sàn thật cần điều kiện mà thực đơn không nói được (chiến lược khác theo loại hình, khoảng giá), hay một điểm khác
  có hai sàn thật khác hình luật.
- H9 (CH7) — mở lại khi hai sàn thật xin điều kiện Sẵn sàng bán khác nhau.
- H10 (CH8) — Tham chiếu §13 «hỏi ở buổi phỏng vấn sau»; mở lại khi phỏng vấn trả lời có.
- H11 (CH9) — Tham chiếu §7 «để sau»; mở lại khi hai sàn thật xin.
- H12 (CH10) — nhật ký đã ghi ở 82; mở lại khi quản trị sàn thật hỏi ai đổi lúc nào hay cần trả về.
- H13 (CH11) — mới có một sàn; mở lại khi đội vận hành mở sàn thứ hai thật.
- H14 (CH12) — ADR-0018 quyết định 7; mở lại khi số đo từ hai sàn thật cho thấy ba lớp §7 cộng ba bậc luật không đủ.
- H15 (CH13) — ADR-0018 mục «Chi phí»; mở lại khi bộ thử hàng 64 cho thấy ghép tất định trường riêng hụt ngưỡng và chủ
  kho mở thêm lớp cho thoả thuận AI.

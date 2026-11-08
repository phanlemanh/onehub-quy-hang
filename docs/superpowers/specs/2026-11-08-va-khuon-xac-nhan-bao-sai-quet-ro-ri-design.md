# Vá khuôn xác nhận: UPI ở báo sai, phép quét rò rỉ đỏ được, quét cả lớp chuỗi — thiết kế

Ngày: 2026-11-08 · Hàng `va-khuon-xac-nhan-bao-sai-quet-ro-ri` · Dãy G · Hạng **T3** (`packages/connect/**`). Nguồn:
Ngoài-5, Ngoài-7, Ngoài-8 của hàng 95 (chủ kho chọn «mở hợp đồng mới» khi ký, sổ `khuon-xac-nhan-danh-muc`
d-20261108T113141Z-37, -39, -40) · ADR-0027 · `review-findings.md` của hàng 95.

Chưa có đường chảy thật (hộp thư đi là hàng 97), nên đây là lúc rẻ nhất để làm chắc. Không màn hình, không migration,
không đổi hình khuôn v1 mà Invest sẽ ghim: chỉ siết thêm giá trị bị từ chối.

## 1. Ngoài-5 — báo sai kiểm dạng UPI

`dungBaoSai` chỉ tra UPI trong danh mục; `dungThuocTinhCan` đã kiểm `MAU_UPI`. Khuôn chiều vào v1 chỉ kiểm tiền tố, nên
danh mục có thể có UPI mang `/`, khoảng trắng, `#`. Khi đó sàn thấy báo sai được nhận, còn bên nhận từ chối. Sửa: `dungBaoSai`
kiểm `MAU_UPI` như `dungThuocTinhCan`. **Không** siết khuôn chiều vào (`catalog-feed.ts`): ngoài vùng, khuôn v1 đã ghim.
Lời hứa là quan hệ: mọi sự kiện hàm dựng trả `ok: true` đều qua được khuôn — đo trên ma trận danh mục lạ. Hậu quả cần biết: sàn gặp căn UPI lạ thì báo sai bị từ chối với lý do «UPI ngoài dạng», và chỉ Invest sửa được nguồn (Hỏi-2).

## 2. Ngoài-7 — phép quét rò rỉ phải đỏ được

Phép quét cũ dựng sự kiện từ đầu vào không có mồi, nên không thể đỏ. Sửa hai vế:

- **Một hàm quét, hai đường mồi** (danh mục · đầu vào). **Đường danh mục:** danh mục đưa vào mang thêm mọi mồi ngoài lớp danh mục (khoá chủ nhà, số, giá đáy, giá chốt,
  trạng thái… gắn trên căn và toà), hàm dựng vẫn `ok: true`, và `timRoRi` trên sự kiện ra rỗng; danh sách khoá mồi ghim trước, đếm khớp. **Đường đầu vào:** đầu vào mang mồi thì hàm dựng từ chối nêu khoá lạ.
- **Đối chứng trên chính đường dựng:** bài kiểm chép `dung.ts` sang thư mục tạm (đổi đường nhập thành tuyệt đối), cấy
  lỗi rò theo ma trận viết trước, nạp bản cấy, chạy đúng phép quét ấy: phải đỏ và gọi tên trường rò. Mỗi phép cấy ghim
  chuỗi neo trong mã nguồn; neo mất là ca đỏ, không phải phép cấy lặng lẽ thành vô tác dụng. Không ghi tệp nào trong cây.

## 3. Ngoài-8 — quét cả lớp chuỗi đo hành vi

Phép quét cũ chỉ đo «có regex». Sửa: đi hết cây khuôn, với **mọi** nút chuỗi chạy ma trận mồi viết trước (câu có khoảng
trắng, số liền, số nối bằng `.`, `-`, `_`, `/`, số cách khoảng trắng, `+84…`; UPI thì bọc tiền tố) qua chính nút ấy — phải từ chối hết, và một giá
trị đúng dạng của nút ấy phải qua. Cùng ma trận cho mọi chuỗi đầu vào của hàm dựng.

Lỗ thật phép quét sẽ bắt: mã căn `090.000.0071` lọt (`\d{8,}` chỉ bắt số liền), khoá toà và UPI nhận số điện thoại trần.

**Hai luật theo nguồn của chuỗi:**

| Loại | Trường | Luật |
|---|---|---|
| Người gõ | `unitNumber`, `correctValue` dạng mã căn | Cấm mọi dãy từ 9 chữ số nối nhau (cho phép một dấu `.-_/` giữa hai chữ số), giữ luật 8 số liền |
| Máy cấp | `buildingKey`, `upi` | Cấm khi **cả một đoạn** (phân cách bằng `:` hoặc `_`) gồm 9–11 chữ số, có thể nối bằng `.-/` (Hỏi-1) |

Vì sao không dùng một luật: khoá thật của Invest là `bld_<ULID>` và `urn:onehub:upi:1:VN:<tỉnh>:<khoá toà>`. ULID có 26 ký
tự, xác suất chứa 9 chữ số liền cỡ 1/2000 — luật chung sẽ làm một căn thật không báo sai được, không ai giải thích nổi.

Hằng mới ở `dang-dong.ts` (`MAU_DANG_SDT`, `MAU_DOAN_SDT`), khuôn nhập từ đó. Hàm dựng kiểm dạng **trước** khi tra danh mục, lỗi dạng có thông điệp riêng với lỗi «không có trong danh mục». Phần dư đã biết: số nhúng liền chữ trong một đoạn khoá máy cấp (`x0900000071`) vẫn qua khuôn; hàm dựng vẫn đòi khoá ấy có trong danh mục dùng chung.

## 4. Ngoài phạm vi

Siết khuôn chiều vào · Ngoài-1 (thoả thuận đúng sàn, hàng 97) · Ngoài-2 (chép hằng) · Ngoài-6 (ngày không có thật).

## 5. Câu hỏi cho Cổng Phạm vi

- **Hỏi-1 — luật cho khoá máy cấp (khó đảo: thuộc khuôn Invest ghim).** Khuyến: cấm khi cả một đoạn là 9–11 chữ số; khoá `bld_0900000071` bị chặn, còn `x0900000071` lọt (phần dư, hàm dựng vẫn đòi có trong danh mục). Lối khác: ghim đúng dạng `bld_<26 ký tự ULID>` và UPI `urn:onehub:upi:1:VN:<tỉnh>:<khoá toà>` — chặn hết, nhưng khoá mẫu (`A`, `urn:onehub:upi:mau:…`) và mọi khoá sàn khác dạng bị từ chối, phải đổi bộ dữ liệu mẫu.
- **Hỏi-2 — căn UPI lạ (khó đảo: khuôn chiều vào đã ghim).** Khuyến: giữ khuôn chiều vào, căn UPI lạ không báo sai được, sàn thấy lý do; Invest sửa nguồn. Lối khác: siết luôn khuôn chiều vào để UPI lạ không vào danh mục — phải phối hợp Invest đổi khuôn đang ghim.

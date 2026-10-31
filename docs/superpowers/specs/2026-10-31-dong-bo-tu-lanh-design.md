# Đồng bộ tự lành — thiết kế (hàng 61)

Hàng 61 của lộ trình, dãy H đợt `dau-chu-dong-vao`, đứng trên hàng 13 (`nhanh-tuc-thi`, ADR-0006 bài thử đồng bộ). Gom
sáu mục ngoài hợp đồng chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng hàng 13: Ngoài-3/13/25 (lỗi tạm thời của máy
chủ đẩy thao tác sang Cần xem), Ngoài-4 (chỉ báo kéo về nói «Mất mạng» cho mọi lỗi), Ngoài-6/16 (sửa căn đang Cần xem làm
kẹt hay đảo thứ tự). Luật đợt 21: không đổi bộ đồng bộ (vẫn kéo qua API, hàng đợi IndexedDB, nhịp thử), không đổi luật
Cần xem với lỗi 4xx thật.

## Vấn đề

1. **Phân loại trả lời của máy chủ.** `gui.ts` chỉ biết hai loại: ném lỗi (mất mạng) và «không phải 200» → đối chiếu
   lịch sử → Cần xem. Máy chủ trả 5xx (đang triển khai, trục trặc) hay 401 (hết phiên) thì thao tác hợp lệ cũng rời hàng
   đợi sang Cần xem; với 401 lần đối chiếu cũng 401 nên lý do thành «căn không còn đọc được» và chỉ còn «Bỏ thay đổi».
2. **Chỉ báo kéo về.** `dong-bo.ts` bọc lần kéo trong một `catch` duy nhất → `lastAttempt: "mang"` cho mọi lỗi: hết
   phiên, lưới chặn nguồn từ chối bản kéo, kho IndexedDB lỗi đều hiện «Mất mạng».
3. **Sửa căn đang Cần xem.** Thao tác mới vào hàng đợi nhưng bị bỏ qua khi gửi (căn đang Cần xem). «Giữ của tôi» xếp lại
   thao tác cũ SAU thao tác mới (sửa cũ đè sửa mới); «Lấy bản mới», «Bỏ thay đổi» để thao tác mới nằm lại với phiên bản
   kỳ vọng có thể đã cũ.

## Thiết kế

### Ba loại trả lời (gui.ts)

| Trả lời | Loại | Làm gì |
|---|---|---|
| ném lỗi | mất mạng | dừng cả lô, giữ hàng đợi (như cũ) |
| 401 | hết phiên | dừng cả lô (mọi lời gọi sau cũng 401), giữ hàng đợi |
| 5xx | máy chủ trục trặc | dừng chuỗi của căn đó, giữ thao tác của căn; căn khác gửi tiếp |
| 200 | nhận | như cũ |
| 4xx khác (400, 403, 404, 409…) | từ chối thật | đối chiếu lịch sử → đã áp trước, hay Cần xem (như cũ) |

Lần đối chiếu (`GET` lịch sử căn) cũng phân loại như vậy: 401/5xx/ném lỗi → giữ thao tác trong hàng đợi, không kết luận;
chỉ 403/404 mới thành «căn không còn đọc được». Thao tác 5xx mà máy chủ thật ra đã ghi (phản hồi lỗi sau khi ghi) → lần gửi
lại nhận 409, đối chiếu tìm thấy sự kiện của chính người này → «đã áp trước» — cơ chế chống trùng của hàng 13 dùng lại.

Một căn trả 5xx mãi (lỗi riêng căn) thì nằm lại hàng đợi, chỉ báo nói «Máy chủ trục trặc»; trần số lần thử nằm ngoài
phạm vi.

### Lần thử gần nhất (types.ts, trang-thai.ts)

`Ngan.lastAttempt` mở rộng: `"ok" | "mang" | "phien" | "may-chu" | "tu-choi" | null` — ghi cả khi gửi lẫn khi kéo. Lỗi kho
trên máy KHÔNG ghi được vào kho, nên bộ đồng bộ giữ cờ `loiKho` trong bộ nhớ và đưa vào chỉ báo.

Kéo về: ném lỗi → `mang`; 401 → `phien`; 5xx → `may-chu`; lưới chặn nguồn từ chối hay 4xx khác → `tu-choi`. Đọc hay ghi kho
lỗi (ở bất kỳ bước nào của lượt) → `loiKho = true`, lượt dừng êm (không ném ra ngoài); lần ghi kho thành công kế tiếp xoá cờ.
Kho IndexedDB mở hỏng thì lần sau mở lại (không giữ mãi lời hứa đã hỏng).

Chỉ báo, theo thứ tự ưu tiên (Cần xem vẫn thắng mọi trạng thái — luật hàng 13):

| Khi | Chữ |
|---|---|
| có căn Cần xem | `N căn cần xem` (như cũ) |
| lỗi kho trên máy | `Lỗi kho trên máy · thay đổi chưa lưu được` |
| đang gửi | `Đang gửi N thay đổi` (như cũ) |
| `mang` | `Mất mạng · N thay đổi chờ gửi` / `Mất mạng · đang xem bản trên máy` (như cũ) |
| `phien` | `Hết phiên · đăng nhập lại để gửi N thay đổi` / `Hết phiên · đăng nhập lại để tải bản mới` |
| `may-chu` | `Máy chủ trục trặc · N thay đổi chờ gửi lại` / `Máy chủ trục trặc · đang xem bản trên máy` |
| `tu-choi` | `Bản tải về bị từ chối · đang xem bản trên máy` |

Hết phiên: chỉ báo là liên kết tới `/login` — đăng nhập lại không xoá kho (chỉ đăng xuất xoá), nên vỏ dựng lại bộ đồng bộ
và lượt đầu gửi hàng đợi. Nhịp thử giữ chu kỳ 15 giây khi lần cuối không «ok».

### Sửa căn đang Cần xem (ap-tren-may.ts, gui.ts, xu-ly-can-xem.ts)

Luật: **giá cuối là lần sửa sau cùng, chọn lối nào cũng vậy.** Thao tác mới trên căn đang Cần xem vẫn vào hàng đợi
(dựa trên bản máy chủ mới mà bảng Cần xem đang hiện) và được GIỮ — không gửi — tới khi người chọn lối:

- **Giữ của tôi**: xếp lại thao tác cũ (của Cần xem) rồi tới thao tác mới, đúng thứ tự thời gian, nối chuỗi lại từ phiên
  bản máy chủ mới; gửi cả dãy.
- **Lấy bản mới** · **Bỏ thay đổi** · **Sửa lại**: bỏ thao tác cũ; thao tác mới nối chuỗi lại trên bản máy chủ mới rồi
  gửi.
- Thao tác nào không áp được trên bản mới (luật lõi) thì thao tác ấy và các thao tác sau của căn về Cần xem «từ chối» như
  luật hàng 13.

Bảng Cần xem thêm một dòng khi căn có thao tác mới đang giữ: «Sửa thêm sau đó: … — gửi sau khi bạn chọn».

## Đặc tả UX

<!-- ux-spec:start -->
- Mặt chạm: chỉ báo đồng bộ trên thanh trên (máy tính và điện thoại, khối đã duyệt ở hàng 13) và bảng Cần xem (Sheet).
  Không màn mới, không khối mới — chỉ đổi chữ, biểu tượng lucide và một liên kết.
- Trạng thái: bảng chữ ở mục «Lần thử gần nhất»; mỗi trạng thái chữ đầy đủ ở nhãn trợ năng, điện thoại hiện biểu tượng +
  số như cũ.
- Khuôn IA đã chọn + căn cứ: giữ khuôn của hàng 13 (chỉ báo một dòng chữ trên thanh trên, bảng Cần xem dạng Sheet) — luồng
  hiển nhiên, không tra mẫu.
- Hết phiên: chỉ báo là liên kết «đăng nhập lại» (`/login`); các trạng thái khác giữ Badge tĩnh `role="status"`.
- Biểu tượng lucide mỗi trạng thái (điện thoại chỉ hiện biểu tượng + số, nên năm nguyên nhân phải đôi một khác nhau):
  mất mạng `CloudOff` (như cũ) · hết phiên `LogIn` · máy chủ trục trặc `ServerCrash` · bản tải về bị từ chối `ShieldAlert` ·
  lỗi kho trên máy `HardDriveDownload`. Biến thể Badge: lỗi kho `destructive`, bốn trạng thái kia `secondary` như «Mất mạng».
- Bậc thang dùng lại (`.claude/rules/giao-dien.md`): bậc 2 — khối đã chuyển thể ở hàng 13 (Badge chỉ báo, Sheet Cần xem);
  chỉ đổi chữ, biểu tượng và prop `render` của Button sang `Link` cho «Hết phiên».
<!-- ux-spec:end -->

## Ngoài phạm vi

- Trần số lần thử, lùi dần khi một căn trả 5xx mãi.
- Chuyển các mục Cần xem đã sinh bởi 5xx/401 ở bản cũ về hàng đợi (hai tuần thử chưa bắt đầu, kho trên máy chưa có dữ
  liệu thật).
- 408/429: hiện xếp vào «4xx khác» theo câu chữ của hàng; API hiện không trả hai mã này trên đường sự kiện căn.
- Kênh thời gian thực, mở app khi mất mạng hẳn (như hàng 13).

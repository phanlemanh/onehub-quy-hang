# Đổi nhãn tại chỗ qua phép so phiên bản — thiết kế (doi-nhan-so-phien-ban)

Hàng không mã của lộ trình, mở từ Ngoài-5 và Ngoài-7 của hàng 46 trang-thai-rieng (PR #153). Chủ kho chọn «mở hợp đồng
mới» ở Cổng Bằng chứng 06/11 (`_acceptance/trang-thai-rieng/decisions.jsonl` d-20261106T050934Z-34, -36).

## Lỗi hôm nay

`applyCommand` (`packages/api/src/listings/store.ts`) bỏ phép so phiên bản cho MỌI lệnh `status_changed` có đích Đang giao
dịch (`Pending`) hay Đã bán (`Closed`) — luật 10 «Đã bán và Đã cọc thắng ngay». Từ hàng 46, cùng loại lệnh ấy còn chở
đổi nhãn tại chỗ (đích bằng trạng thái đang có, khác nhãn). Hệ quả:

1. **Ngoài-5 — đè âm thầm.** Hai người cùng đổi nhãn một căn Đang giao dịch (hay Đã bán) từ cùng một bản: lệnh sau thắng
   ngay, đè nhãn của lệnh trước, không ai được báo.
2. **Ngoài-7 — kéo ngược trạng thái.** Máy A soạn lệnh đổi nhãn khi căn đang Đang giao dịch; trước khi lệnh tới máy chủ,
   khách bỏ cọc và căn về Đang bán. Lệnh cũ tới, máy chủ thấy Đang bán → Đang giao dịch là một lối chuyển hợp lệ và
   «thắng ngay» — căn bị kéo về Đang giao dịch, lên Bảng hàng và trang khách sai.

## Luật mới (lõi)

«Thắng ngay» là lệnh **đưa** căn vào Đang giao dịch hay Đã bán — đúng câu đã chốt ở hàng loi-hang-va-su-kien («phiên bản
cũ trả 409, riêng **sang** Đang giao dịch hay Đã bán thắng ngay»). Một lệnh được thắng ngay khi và chỉ khi:

- đích thuộc `WINS_IMMEDIATELY` (Pending, Closed); và
- **bản gốc** của lệnh — trạng thái của căn ở phiên bản lệnh dựa vào (`expectedVersion`) — chưa ở đích; và
- **bản hiện tại** của căn chưa ở đích.

Mọi lệnh khác đi qua phép so phiên bản như mọi lệnh: lệch phiên bản → 409 `version-conflict`, máy đưa căn vào «Cần xem».

Hàm lõi mới, `packages/core/src/listing/thang-ngay.ts`:

```ts
export function thangNgay(to: unknown, goc: StandardStatus | null, hienTai: StandardStatus): boolean;
export function trangThaiGoc(events: readonly ListingEvent[], expectedVersion: unknown): StandardStatus | null;
export function suKienThangNgay(events: readonly ListingEvent[], e: ListingEvent): boolean;
```

- `trangThaiGoc`: `expectedVersion` là số nguyên trong `[1, phiên bản cuối]` → gấp các sự kiện `seq ≤ expectedVersion`
  bằng `foldListing`, trả trạng thái ấy; ngoài khoảng, vắng hay không phải số nguyên → `null` (không biết bản gốc — chỉ
  xét bản hiện tại).
- `suKienThangNgay`: một sự kiện đã ghi là «thắng ngay» khi nó là `status_changed` có đích thuộc `WINS_IMMEDIATELY` và
  trạng thái ngay trước nó (gấp các sự kiện `seq < e.seq`) khác đích — tức nó thật sự đưa căn vào trạng thái ấy. Bộ đồng
  bộ dùng hàm này khi đối chiếu một lệnh bị từ chối.

## Máy chủ

`applyCommand` thay dòng

```ts
const thangNgay = type === "status_changed" && WINS_IMMEDIATELY.includes(payload.to as never);
```

bằng lời gọi `thangNgay(payload.to, trangThaiGoc(events, cmd.expectedVersion), foldListing(events).standardStatus)` (chỉ
với `status_changed`). Thứ tự các phép xét khác không đổi: quyền đưa lên Đang bán, «đã có mã», «đã bán không đổi giá» vẫn
xét trước phép so phiên bản.

Hệ quả có chủ ý:

- Lệnh đổi nhãn tại chỗ không mang `expectedVersion` (khuôn API cho phép vắng) bị 409 — đúng như mọi lệnh không thắng ngay
  hôm nay (`if (!thangNgay && cmd.expectedVersion !== version) return versionConflict`: đổi giá, đổi chi tiết… vắng phiên
  bản đều 409). Lối nhập file gửi đúng phiên bản hiện tại nên không đổi hành vi.
- **Vế «bản hiện tại chưa ở đích»** chặn ca hai người cùng đưa một căn Đang bán vào Đang giao dịch (hay Đã bán) từ cùng
  một bản. Hôm nay lệnh sau KHÔNG thắng: không nhãn thì bảng chuyển từ chối «Pending không chuyển sang Pending» (400), máy
  đưa vào «Cần xem» lý do «đã cọc»; nhưng có nhãn khác thì lõi coi là đổi nhãn tại chỗ và lệnh sau âm thầm đè nhãn — một
  biến thể của Ngoài-5. Sau vòng này cả hai dạng là 409; «Cần xem» vẫn ra «đã cọc» / «đã bán» (sự kiện của người trước là
  thắng ngay thật), giá chốt của người trước giữ nguyên. Người dùng không thấy khác ngoài việc nhãn hết bị đè.

## Bộ đồng bộ (Cần xem)

`doiChieu` (`apps/web/src/lib/sync/gui.ts`) hôm nay tìm sự kiện «thắng» bằng `e.payload.to === "Pending" || "Closed"`. Sau
luật mới, lần đổi nhãn đã thắng của người khác cũng khớp phép ấy, nên lệnh đổi nhãn đụng nhau sẽ vào «Cần xem» với lý do
«đã cọc» / «đã bán» — sai sự thật. Đổi phép tìm sang `suKienThangNgay` của lõi: đổi nhãn đụng nhau vào «Cần xem» với lý do
«đụng nhau»; căn bị người khác đưa vào Đang giao dịch / Đã bán vẫn ra «đã cọc» / «đã bán» như cũ.

## Không đổi

- Tham chiếu luật 10 giữ nguyên chữ: «thắng ngay» vẫn là của lệnh đưa căn vào Đã cọc / Đã bán; vòng này chỉ làm máy chủ
  đúng câu ấy.
- Gỡ nhãn hàng loạt của quản trị (`thayNhanCan`, cửa hẹp migration 049) không qua phép so phiên bản theo thiết kế của hàng
  46: hàm khoá theo hàng và bỏ qua căn đã rời nhãn.
- Màn: không màn mới, không chữ mới — «Cần xem» và lý do «đụng nhau» đã có.

## Đối chiếu ngành

Vòng này không thêm danh sách hay luật mới: nó thu một ngoại lệ đã có (luật 10) về đúng nghĩa đã chốt. Không có dòng «ta
viết cứng — họ cho cấu hình» nên không mở câu hỏi nào ở Cổng Phạm vi.

| Năng lực | RESO | KW Command | Lofty | Ta làm gì | Ta cứng — họ cấu hình |
| --- | --- | --- | --- | --- | --- |
| Hai người cùng sửa một listing | Web API trên OData; OData có cập nhật có điều kiện theo ETag — RESO có bắt buộc hay không: chưa kiểm | chưa kiểm | chưa kiểm | Mọi lệnh mang phiên bản; lệch → 409, máy đưa căn vào «Cần xem» | không |
| Trạng thái thắng lệnh cũ | không có khái niệm tương ứng (chưa kiểm) | chưa kiểm | chưa kiểm | Chỉ lệnh **đưa** căn vào Đã cọc / Đã bán thắng ngay (luật 10); đổi nhãn tại chỗ qua phép so | không — luật sản phẩm đã chốt, vòng này không đổi nghĩa |

Nhãn trạng thái neo vào `StandardStatus` theo mẫu RESO `MlsStatus` (`docs/product/doi-chieu-nganh.md` §6) — vòng này giữ
nguyên mẫu ấy.

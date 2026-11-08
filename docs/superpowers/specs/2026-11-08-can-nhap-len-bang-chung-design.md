# Căn nhập lên bảng chung — thiết kế (hàng `can-nhap-len-bang-chung`, T3)

Ngày: 08/11/2026 · Dãy G · Cổng Đáng: chủ kho «Làm (build)» 07/11 23:25Z (phiên G).

## Vấn đề

Sàn mới chuyển nhà từ Sheet bằng cửa nhập file. Hai cột hay thiếu trong Sheet là pháp lý và tình trạng sử dụng; cửa nhập
lại chưa đọc hai cột ấy (hàng `chuan-hoa-moi-cua` cố ý không làm), nên mọi căn file ghi «còn hàng» đều nằm lại Chưa đủ để
rao — bảng hàng chung rỗng sau lần chuyển nhà. Hàng `anh-khong-chan-ban` đã gỡ cổng ảnh; hàng này gỡ nốt hai điều kiện
pháp lý, tình trạng sử dụng **chỉ ở cửa nhập** (Tham chiếu §12, dòng 06/11 «Căn chuyển từ Sheet lên bảng chung ngay»,
chủ kho «Có, lên luôn»).

## Điều đang đúng mà hàng này giữ

- Giá kèm điều kiện phí vẫn là điều kiện ở mọi cửa, cả cửa nhập (luật 7, 12). Mã căn, ảnh theo số tối thiểu của sàn giữ
  nguyên.
- «Sẵn sàng bán», ô Trạng thái (có mạng, ghi lúc mất mạng), sửa hàng loạt, lead vẫn đòi pháp lý, tình trạng sử dụng.
- Một đường ghi: cửa nhập vẫn đi qua `applyCommand` và luật trạng thái của lõi (ADR-0008), không ghi trạng thái thẳng.

## Cách làm

1. **Lõi — luật trạng thái biết cửa vào.** `TransitionContext` thêm khoá `cuaVao?: "nhap"`. `missingFor("Active", ctx)`
   bỏ `legalStatus`, `occupantType` khi `cuaVao === "nhap"`; mọi điều kiện khác giữ nguyên. Vắng khoá = như hôm nay.
2. **Máy chủ — chỉ máy chủ đặt cửa vào.** `applyCommand` đặt `cuaVao: "nhap"` khi lệnh mang `importId` (chỉ đường ghi của
   lần nhập có; khuôn lệnh công khai `POST /listings/{id}/events` là `.strict()` nên người gọi ngoài không gửi được
   `importId`). Không thêm trường mới vào khuôn lệnh công khai.
3. **Cửa nhập — dòng tạo mới «còn hàng».** Dòng `create` có trạng thái file Đang bán (hay Đã cọc — đi Đang bán rồi Đang
   giao dịch như hôm nay) lên Đang bán dù thiếu pháp lý, tình trạng sử dụng. Lý do dòng ghi rõ phần còn thiếu bằng nhãn
   của lõi: «Đang bán — còn thiếu pháp lý, tình trạng sử dụng». Thiếu giá hay điều kiện phí, mã căn, ảnh dưới tối thiểu
   thì dòng vẫn ở Chưa đủ để rao với lý do như hôm nay.
4. **Mức đủ và Hôm nay — không thêm gì mới.** Mức đủ đã có mục pháp lý, tình trạng sử dụng; nhóm mặc định «Thiếu thông
   tin» (`missing_info`) đã nhận mọi căn mình giữ còn mục thiếu ở bốn trạng thái mở. Căn nhập lên Đang bán thiếu pháp lý
   vì thế tự vào «Thiếu thông tin» của đầu chủ giữ căn (người file ghi, hay người nhập). Hàng này đo điều đó, không dựng
   lại.
5. **Hoàn tác lần nhập** gỡ căn tạo mới (kết cục `go`) như hôm nay — căn Đang bán từ lần nhập cũng rời bảng chung.

## Ranh giới

Vùng: `packages/core/src/listing/**`, `packages/api/src/imports/**`, `packages/api/src/listings/**` (đặt cửa vào),
`_acceptance/can-nhap-len-bang-chung/**`, `docs/product/tham-chieu.md` (một dòng). Không migration, không đổi giao diện:
Hôm nay, hồ sơ căn, Bảng hàng đọc mức đủ của lõi sẵn có.

## Không làm (Later / Never)

- Đọc cột pháp lý, tình trạng sử dụng từ file (Later — cần tập giá trị chuẩn và từ điển; `chuan-hoa-moi-cua` đã gác).
- Đổi trạng thái căn có sẵn qua dòng `update` (Hỏi-1 — khuyến nghị không, cửa nhập hôm nay không đổi trạng thái căn có sẵn).
- Điểm biến thiên cho sàn chọn «cửa nhập vẫn đòi pháp lý» (Later — chưa có sàn đòi; thêm khi có).
- Nhóm Hôm nay riêng cho căn nhập thiếu pháp lý (Never ở vòng này — «Thiếu thông tin» đã là việc ấy).

## Đối chiếu ngành

Nguồn: `docs/product/doi-chieu-nganh.md` §6, §7, §11.

| Năng lực | RESO | Sản phẩm A | Sản phẩm B | Ta làm | Ta cứng — họ cấu hình |
| --- | --- | --- | --- | --- | --- |
| Điều kiện để hàng vào `Active` | `StandardStatus` không gắn điều kiện theo cửa vào; trường bắt buộc do từng MLS đặt | MLS Mỹ: mỗi MLS một luật, SmartMLS cho 48 giờ bổ sung ảnh sau khi Active (§7) | Lofty, KW: manual listing — người chọn trạng thái, điều kiện **chưa kiểm** (§6) | Cửa nhập bỏ pháp lý, tình trạng sử dụng; cửa khác giữ | **Có** — MLS đặt luật theo nơi; ta viết cứng «chỉ cửa nhập» → Hỏi-2 |
| Bản ghi đã có khi nhập lại | — | Follow Up Boss giữ người giữ và giai đoạn của liên hệ đã có (§11) | Lofty giữ người giữ và giai đoạn, chủ tài khoản chỉnh cách đè (§11) | Dòng `update` không đổi trạng thái (Hỏi-1) | **Có** — Lofty cho chỉnh cách đè; ta giữ một cách → nằm trong Hỏi-1 |
| Việc bổ sung thông tin thiếu | — | SmartMLS: hạn 48 giờ bổ sung ảnh (§7) | Lofty, BoldTrail: **chưa kiểm** | Nhóm «Thiếu thông tin» của Hôm nay (sàn bật, tắt, xếp được — hàng 22) | Không — nhóm đã là dữ liệu của sàn |

## Hỏi chủ kho

- **Hỏi-2 — Sàn có được bật lại «cửa nhập vẫn đòi pháp lý, tình trạng sử dụng» không.** Ngành để nơi đặt luật (MLS) chọn
  điều kiện; ta viết cứng «chỉ cửa nhập bỏ hai điều kiện» và không lý do nào trong bốn lý do giữ cứng áp được. Khuyến
  nghị: vòng này không thêm cài đặt; ghi một dòng ứng viên ở Sổ điểm biến thiên «cửa nhập đòi pháp lý — mặc định tắt», dựng
  khi có sàn đòi. Lối khác: dựng ngay một ô ở Cài đặt sàn › Trạng thái — giá: thêm một tiêu chí, một màn và một lượt chấm
  giao diện cho điều chưa sàn nào hỏi.

- **Hỏi-1 — Căn đã có trong kho mà file ghi «còn hàng».** Khuyến nghị: chỉ căn tạo mới lên Đang bán; căn có sẵn giữ trạng
  thái của nó (dòng `update` không đổi trạng thái, như hôm nay). Lối khác: dòng `update` cũng đưa căn Chưa đủ để rao lên
  Đang bán — giá: lần nhập lại đè trạng thái người đang giữ căn chỉnh tay, và hoàn tác dòng `update` phải trả trạng thái
  (hôm nay chỉ trả giá).

# Thiếu ảnh không chặn bán — thiết kế (hàng `anh-khong-chan-ban`)

Ngày 2026-11-07 · hạng T3 · dãy G · ô cơ hội `_acceptance/anh-khong-chan-ban/opportunity.md` (Cổng Đáng: build, chủ kho
06/11). Căn cứ: Tham chiếu §12 dòng 06/11 «Thiếu ảnh không chặn bán» và luật 17 đã đổi; `docs/plan/audit-san-moi-day-0.md`
§8, §9.2 dòng 2b, §9.3 mục 2.

## Vấn đề

Luật 17 cũ đòi ít nhất một ảnh thật trước khi căn vào Đang bán (`packages/core/src/listing/status.ts:103`, số tối thiểu
`listing.ready_min_real_photos`, mặc định 1, khoảng 1–20 ở `packages/core/src/config/so.ts:118`). Sheet của sàn không có
ảnh, nên lần chuyển nhà nào cũng thành một bảng hàng chung rỗng: căn nhập nằm ở Chưa đủ để rao, chỉ người nhập và đầu chủ
giữ căn thấy (`packages/core/src/visibility/index.ts`), đầu khách không gửi được căn nào.

## Điều đã có (không đổi)

- Một đường kiểm duy nhất ở máy chủ: `applyCommand` → `nguCanhAnh` đếm ảnh thật (ngăn Gửi được, không ảnh mẫu, chưa gỡ)
  → `checkTransition` (`packages/api/src/listings/store.ts:257-264, 323-332`). Ba cửa — nút «Sẵn sàng bán», ô Trạng thái và
  sửa hàng loạt ở Bảng hàng, nhập file (`packages/api/src/imports/store.ts:380-391`) — đều đi qua đường này.
- Không có ràng buộc cơ sở dữ liệu nào chặn Đang bán theo ảnh; số tối thiểu là một dòng `company_settings` đọc qua
  `docCauHinhSanSang` — không cần migration.
- Trang khách đã có ô trống khi căn không ảnh (`apps/web/src/app/s/[code]/the-can.tsx:25-36`, `chi-tiet.tsx:22-38`).

## Thiết kế

1. **Số ảnh tối thiểu: mặc định 0, khoảng 0–20.** Đổi dòng 33 của sổ điểm biến thiên (`so.ts`) và bản sao ở
   `hang-so.ts`. Luật trong `missingFor` giữ nguyên: số ảnh < tối thiểu thì thiếu «ảnh thật»; tối thiểu 0 thì không bao
   giờ thiếu. Sàn đặt 1–20 → luật cũ áp lại y như hôm nay, ở cả ba cửa. Không đổi đường kiểm ở máy chủ.
2. **Bản xem hàng mang số ảnh thật.** `GET /api/v1/listings` và `/{id}` thêm `photosCount` (tên RESO `PhotosCount`) — số ảnh
   thật gửi được của căn, cùng định nghĩa với `nguCanhAnh` (một hàm đếm dùng chung, đếm theo lô cho danh sách). Không
   trường nguồn nào ra kèm.
3. **Ảnh là một mục của mức đủ.** `completeness(s, anh?)` nhận thêm `{ photosCount }`; có thì thêm mục `photos` (đủ khi
   ≥ 1 ảnh thật) và tổng thành 6. Năm mục mô tả căn (`COMPLETENESS_ITEMS`) giữ nguyên — đó là danh sách hỏi của màn cuộc
   gọi (`danh-sach-hoi.ts`), ảnh không hỏi được qua điện thoại. Bản xem hàng tính mức đủ có ảnh; Bảng hàng (cột «Mức
   đủ»), hồ sơ căn và màn cuộc gọi hiện mục «Ảnh thật» khi thiếu — đó là «dấu thiếu ảnh ở Bảng hàng» của câu giao.
4. **Việc «Bổ sung ảnh» ở Hôm nay.** Điều kiện mới `missing_photo` trong bộ từ vựng đóng của hàng đợi
   (`today/kieu.ts`, `kiem.ts`, `hang-doi.ts`), và nhóm mặc định `add_photos` «Bổ sung ảnh» (`mac-dinh.ts`) cho căn đang
   mở (Chưa đủ để rao, Đang bán, Giữ chỗ, Đang giao dịch) có 0 ảnh thật, hành động «Mở hồ sơ». Hôm nay của đầu chủ đã chỉ
   lấy căn mình giữ. Nhóm «Thiếu thông tin» vẫn đọc năm mục mô tả — một căn thiếu ảnh không hiện hai lần vì cùng lý do.
5. **Nút «Sẵn sàng bán» ở hồ sơ căn đọc số tối thiểu của sàn** thay hằng mặc định của lõi (`units/ready/san-sang.ts:45`),
   để bảng «Còn thiếu» trên máy khớp lời máy chủ. Mặc định 0: căn đủ điều kiện khác thì lên ngay, kể cả khi mất mạng không
   đếm được ảnh (máy chủ vẫn là bên quyết).
6. **Ô «Số ảnh thật tối thiểu» ở Cài đặt sàn › Trạng thái** (khuôn `cai-dat-san`, `MucCaiDat`): quản trị sàn đặt 0–20,
   lưu qua lối chung `PATCH /api/v1/company/settings` (đã kiểm khoảng theo sổ). Một câu nói nghĩa: «0 — căn lên Đang bán
   khi chưa có ảnh; ảnh hiện là việc cần bổ sung».
7. **Nhập file**: không đổi mã — căn «còn hàng» đủ giá kèm điều kiện phí, pháp lý, tình trạng sử dụng mà 0 ảnh giờ vào
   Đang bán vì tối thiểu là 0. Lý do dòng bị hạ còn mang mã thô (`realPhoto`) khi sàn đặt tối thiểu ≥ 1 → đổi sang nhãn
   («ảnh thật»). Phần pháp lý, tình trạng sử dụng ở cửa nhập là hàng `can-nhap-len-bang-chung`, không thuộc hàng này.

## Không làm

- Không đổi luật cửa nhập về pháp lý, tình trạng sử dụng (hàng `can-nhap-len-bang-chung`, đứng sau hàng này).
- Không tự thêm nhóm «Bổ sung ảnh» vào bộ nhóm Hôm nay mà sàn đã lưu riêng (Hỏi-3).
- Không đổi số đo «mức đủ cao nhất» (`metrics/hang.ts:68`) — vẫn năm mục mô tả (Hỏi-2).
- Không đổi màn tải ảnh, không thêm ảnh mẫu, không đổi trang khách ngoài bài kiểm ca 0 ảnh.

## Đặc tả UX

Thay đổi nằm trong khuôn đã có: một mục mới trong danh sách «Còn thiếu» và cột «Mức đủ», một nhóm mới trong Hôm nay của đầu
chủ (khuôn `hom-nay-dau-chu`), một ô số trong mục «Trạng thái» của Cài đặt sàn (khuôn `cai-dat-san`, `MucCaiDat`). Không
dựng màn mới, không đổi bố cục.

| Chỗ | Trạng thái | Thấy gì |
| --- | --- | --- |
| Hồ sơ căn, «Sẵn sàng bán» | sàn tối thiểu 0, căn 0 ảnh, đủ điều kiện khác | Nút bấm được; sau khi lên, mục «Ảnh thật» vẫn ở danh sách mức đủ |
| Hồ sơ căn, «Sẵn sàng bán» | sàn tối thiểu 2, căn 1 ảnh | «Còn thiếu: Ảnh thật» như hôm nay |
| Bảng hàng, cột Mức đủ | căn 0 ảnh | «5/6», lọc «thiếu ảnh thật» theo mục |
| Hôm nay đầu chủ | có căn mở 0 ảnh | Nhóm «Bổ sung ảnh» liệt kê căn, nút «Mở hồ sơ» |
| Cài đặt sàn › Trạng thái | quản trị | Ô «Số ảnh thật tối thiểu để căn vào Đang bán», 0–20, mặc định 0 |
| Trang khách | căn 0 ảnh | Ô ảnh trống có icon, không lỗi |

Khổ 1440 và 375 cho Hôm nay, Cài đặt; ảnh màn chạy thật ở Cổng Bằng chứng.

## Đối chiếu ngành

Theo `.claude/rules/thiet-ke-doi-chieu.md`; cột sản phẩm lấy từ `docs/product/doi-chieu-nganh.md` (dòng 6 «Listing, trạng
thái», dòng 7 «Ảnh»). Trang Đối chiếu ngành chưa ghi sản phẩm nào chặn hay không chặn trạng thái theo ảnh — ô ấy «chưa kiểm»,
không suy.

| Năng lực | RESO | KW Command | Lofty | Ta định làm | Ta cứng — họ cấu hình? |
| --- | --- | --- | --- | --- | --- |
| Cổng ảnh để vào Đang bán | `Property.PhotosCount` là số đếm của tin, `StandardStatus` không ràng theo nó ([dd.reso.org Property](https://dd.reso.org/DD2.0/Property/)) | Internal Listing — có buộc ảnh không: chưa kiểm | Manual Listing — có buộc ảnh không: chưa kiểm | Số tối thiểu là dữ liệu của sàn, mặc định 0, 0–20 | Không — đã là dữ liệu của sàn |
| Ảnh trong mức hoàn thiện hồ sơ | `PhotosCount` | chưa kiểm | chưa kiểm | Mục `photos` cố định trong mức đủ (đủ khi ≥ 1 ảnh thật) | Ta cứng mục ảnh; họ: chưa kiểm → Hỏi-1 |
| Việc nhắc bổ sung ảnh | — | SmartView: **Người** tạo | Hàng đợi **Lai**: mặc định khoá + của đội | Một điều kiện đóng `missing_photo` + nhóm mặc định trong bộ nhóm Hôm nay sàn sửa được | Không — nhóm là dữ liệu của sàn (bộ nhóm hàng 22) |

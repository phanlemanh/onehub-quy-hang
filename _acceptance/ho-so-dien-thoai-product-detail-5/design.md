# Hồ sơ căn trên điện thoại theo product-detail-5 — thiết kế

Hàng `ho-so-dien-thoai-product-detail-5` (dãy H, đợt `dau-khach-nhap`), T2. Ô cơ hội: `opportunity.md` (chủ kho «Ghi
build» 05/11; căn cứ Hỏi-3 Cổng Phạm vi hàng 33 và lời «Mở cả 10 hàng»). Khối đích: `docs/design/vo-va-ia.md` §2 dòng
«Hồ sơ căn, điện thoại» (M3 · 33, 40–41) — `product-detail-5`, giữ ở Hỏi-3 hàng 33 («lùi về thời điểm, không về khối»).

## 1. Cái đã có, cái còn thiếu

- Hồ sơ căn một căn là `CotHoSo` (`apps/web/src/app/(app)/units/ho-so/cot-ho-so.tsx`), khuôn `KhungHoSoCan` (nhóm
  `ho-so-can`, `design/patterns/ho-so-can.md`). Khối đang dựng là `solution-crm-4` chuyển thành cột (hàng 17). Cùng một thân
  chạy ở bốn chỗ: cột kéo chia cạnh Bảng hàng (máy tính), cột phải của Hôm nay (máy tính), toàn màn `/units/<mã>`, và trong
  Bảng hàng thẻ trên điện thoại (`KhungHoSoCan nhung`, `bang-co-ho-so.tsx`).
- Trên điện thoại thân ấy là một cột chữ dài: đầu (mã căn) → Giá và mức đủ → Ảnh → Thuộc tính căn → Lần rao → Các lần rao
  → Lịch sử → nút «Hỏi đầu chủ» dính đáy (lớp phủ hàng 33). Ảnh nằm thứ ba, giá là chữ trong khối đầu.
- Thiếu: bố cục điện thoại theo khối đích `product-detail-5` — ảnh lớn đầu màn, tên + thông số chính, hộp giá, một nút
  chính dính đáy. Bản chuyển thể `product-detail-5` đã có cho trang khách (`apps/web/src/app/s/[code]/chi-tiet.tsx`, dòng
  `@reui/product-detail-5` ở `catalog.md`) — dùng lại cách chuyển thể ấy, không cài khối mới.
- Hàng 40 (đổi giá nhanh sau cuộc gọi) và 41 (chụp ảnh khi đi xem nhà) dựng TRÊN bố cục này; hàng này chỉ dựng bố cục và
  chừa chỗ, không làm hai việc ấy.

## 2. Luồng

Người mở một căn trên điện thoại (từ Bảng hàng thẻ, gõ mã căn, liên kết `/units/<mã>`):

1. Màn đầu tiên (375×812, không cuộn) thấy: ảnh lớn của căn (lướt ngang có điểm dừng), mã căn · toà + trạng thái, hàng
   thông số chính Diện tích · Phòng ngủ · Hướng, hộp giá (giá rao, phí, «xác nhận X ngày trước»).
2. Cuộn xuống: mức đủ, Thuộc tính căn (chữ khoá, «Báo sai»), Lần rao đang xem/đang mở, Các lần rao (chọn lần rao), Lịch sử.
3. Nút chính dính đáy theo lớp phủ quyền: người không thấy nguồn (đầu khách) → «Hỏi đầu chủ» (mở bảng chia sẻ của máy —
   bất biến 3); người thấy nguồn (đầu chủ giữ căn, trưởng nhóm) → «Ghi cuộc gọi» (`/units/call?hang=<id>`).

Máy tính (từ 768 px) giữ nguyên mọi chỗ đang chạy.

## 3. Phạm vi mã

- Mới: `apps/web/src/app/(app)/units/ho-so/dien-thoai/**` — thân điện thoại của hồ sơ (dựng từ cùng dữ liệu `CotHoSo` đọc).
- Sửa: `apps/web/src/app/(app)/units/ho-so/cot-ho-so.tsx` (rẽ khổ: điện thoại → thân mới), `units/ho-so/khung.tsx`
  (biến thể khung điện thoại nếu cần), `design/patterns/ho-so-can.md` (nhóm, luật, nhận diện).
- Rẽ khổ dùng chung hàm của Hôm nay điện thoại (`apps/web/src/app/(app)/today/mobile/kho.ts`, `useDienThoai`) — chỉ
  nhập, không sửa: một mốc 768 px cho cả kho.
- Trang ba lối `apps/web/src/app/(app)/proto/ho-so-dien-thoai/**` (gỡ khi màn thật qua Cổng Bằng chứng, luật 45).
- Không chạm `packages/**`, không migration. Thân điện thoại đọc đúng nguồn của thân cột (kho trên máy, API ảnh) — không thêm đường đọc hay truyền bản ghi chưa qua luật ẩn. Ẩn phần nguồn vẫn do lõi (`lopPhuHoSo`, `@quy-hang/core/access`) và API
  quyết (bất biến 2, 4) — màn chỉ đọc cờ.

## 4. Lựa chọn máy đã quyết

- Dùng lại bản chuyển thể `product-detail-5` của trang khách thay vì cài lại khối Pro (thang dùng lại bậc 2).
- Một mốc khổ cho cả kho: nhập `useDienThoai` của Hôm nay điện thoại, không viết mốc thứ ba (bài học lượt chấm 3 hàng 39).
- Hàng 40, 41 ngoài phạm vi (lộ trình tách hàng riêng).

Câu chỉ người có (lên thẻ Cổng Phạm vi): Hỏi-1 lối dựng (ba lối, ADR-0019); Hỏi-2 nhãn nút chính dính đáy (`vo-va-ia.md`
ghi «Xin dẫn xem», Cổng Phạm vi hàng 33 chốt «Hỏi đầu chủ»).

## 5. Đối chiếu ngành

RESO: thông số chính theo `LivingArea`, `BedroomsTotal`, `DirectionFaces` (đặt tên Việt ở giao diện, `CONTEXT.md`). Sản
phẩm: trang chi tiết tin rao của Batdongsan.com.vn và Zillow trên điện thoại cùng mở bằng ảnh lớn lướt ngang → giá + thông
số chính → mô tả → một nút liên hệ dính đáy; Quỹ hàng giữ đúng thứ tự ấy, thay «liên hệ người bán» bằng nút theo vai.

## 6. Đặc tả UX

<!-- ux-spec:start -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Bảng hàng thẻ / gõ mã căn / `/units/<mã>` → màn đầu thấy ảnh, tên, thông số, giá → cuộn xem thuộc tính, lần
  rao, lịch sử → chạm nút dính đáy (điểm ra: bảng chia sẻ của máy, hoặc màn ghi cuộc gọi).
- Biên: căn chưa có ảnh (khung ảnh trống có lời) · căn chưa có mã (đầu «Chưa có mã căn», ô gắn mã) · mã có ở hai toà ·
  người không thấy nguồn (không Nội bộ, không ổ khoá).
- Lỗi & quay lại: không thấy căn → «Không thấy căn» + về Bảng hàng; tải lỗi → «Thử lại»; mất mạng → xem bản đã có trong kho trên máy (hồ sơ đọc bộ đồng bộ hàng 13 và danh mục giữ trên máy — luật KH-hs-tren-may; thân điện thoại đọc cùng nguồn với thân cột, không thêm đường đọc).

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hồ sơ căn, điện thoại | Xem nhanh một căn và làm việc kế với nó | Bảng hàng thẻ, gõ mã, liên kết / Hỏi đầu chủ, Ghi cuộc gọi |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-hoso-dang-tai | Hồ sơ căn, điện thoại | Khung chờ (`ChoTai`) đúng dáng ảnh + tên + hộp giá | chờ |
| ST-hoso-khong-thay | Hồ sơ căn, điện thoại | «Không thấy căn» (`TrangThai`) | về Bảng hàng |
| ST-hoso-loi | Hồ sơ căn, điện thoại | Lời lỗi + «Thử lại» | thử lại |
| ST-hoso-mat-mang | Hồ sơ căn, điện thoại | Bản đã tải trên máy, ghi giờ đồng bộ | xem tiếp |
| ST-hoso-chua-anh | Hồ sơ căn, điện thoại | Khung ảnh trống «Chưa có ảnh» | xem tiếp |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Dưới 768 px dựng thân điện thoại; từ 768 px giữ thân cột như hôm nay (một mốc của kho, `useDienThoai`).
- Ảnh lướt ngang bằng cuộn có điểm dừng; nút chính dính đáy khung nhìn khi cuộn, vùng chạm từ 44 px, kín bề ngang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Bản chuyển thể `product-detail-5` (trang khách) | ghép | Cùng khối đích, đã chuyển thể và duyệt ở hàng 35 |
| `KhungHoSoCan`, `Frame`, `Badge`, `ChoTai`, `TrangThai` | dùng | Khuôn và thành phần đã cài của nhóm `ho-so-can` |
| `NutHoiDauChu`, `MucAnhCan`, `NutBaoSai`, `OMaCan` | dùng | Mục và nút sẵn có của hồ sơ, giữ nguyên hành vi |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: khối đích `product-detail-5` (vo-va-ia.md §2) là trang chi tiết một cột; bố cục «Hồ sơ» của ADR-0024 trên điện
thoại là một cột; luồng hiển nhiên, không tra thêm.

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Đầu khách, đầu chủ, trưởng nhóm |
| Việc chính | Xem nhanh một căn trên điện thoại và làm việc kế với nó (hỏi đầu chủ hay ghi cuộc gọi) |
| Tần suất | mỗi ngày nhiều lần |
| Số bản ghi | một |
| Thiết bị | điện thoại |
<!-- ux-spec:end -->

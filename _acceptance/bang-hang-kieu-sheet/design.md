# Thiết kế — Bảng hàng kiểu Sheet (hàng 14)

Nguồn đã chốt, không bàn lại: Tham chiếu §9 (Bảng hàng trên máy tính là bảng kiểu Sheet; cột thứ hai là góc nhìn; đường
`/inventory`, `/inventory/views/<id>`), §4 dòng «Góc nhìn», §12 dòng 31/10 «Bộ đồng bộ trên máy»; ADR-0002 và
`docs/design/vo-va-ia.md` §2 (khối đích `data-grid-editing-6`, nhóm dòng lấy từ `data-grid-grouping-2`); ADR-0004 (lưới
`@reui/data-grid`, chạy lại máy đo trên màn thật trước Cổng Bằng chứng). Hàng này dựng phần ĐỌC của Bảng hàng: thấy, lọc,
nhóm, lưu góc nhìn. Sửa trên ô là hàng 15, đổi hàng loạt là hàng 16, hồ sơ căn cột phải là hàng 17, bảng dạng thẻ trên
điện thoại là hàng 32.

## Cách dựng

1. **Dữ liệu đọc từ kho trên máy**, không gọi mạng khi lọc hay nhóm: `useDanhSachHang()` của bộ đồng bộ (hàng 13) trả
   hàng đã áp thay đổi chờ. Không trường nguồn nào đi qua đây (API không chở) — bảng không có cột chủ nhà.
2. **Loại căn, diện tích, tầng, hướng lấy từ danh mục.** Bảng `listings` không có các trường này; danh mục có
   (`bedroomsTotal`, `livingArea`, `floor`, `directionFaces`). Thêm một tuyến đọc `GET /api/v1/catalog` ở tệp mới
   `packages/api/src/catalog/doc-ca-danh-muc.ts` (giám sát duyệt yêu cầu B-1: không chạm `routes.ts` của dãy D; cùng
   tham số danh mục để hàng 10 thay gói mẫu một chỗ; một dòng đăng ký ở `app.ts`). Web tải danh mục một lần mỗi phiên,
   giữ bản cuối ở bộ nhớ trình duyệt theo sàn để bảng vẫn nhóm được khi mất mạng; ghép theo toà + mã căn bằng một hàm
   thuần `ghepDanhMuc` (kiểm bằng `node:test`). Căn không có trong danh mục → loại căn «Chưa rõ», các cột danh mục để trống.
   Nhãn loại căn: `0` → «Studio», `n` → «nPN» (cách gọi của Sheet đầu chủ ở mẫu A của hàng 5).
3. **Lưới: cài nguyên bản khối Pro `data-grid-editing-6`** (giám sát duyệt B-2), chuyển thể chỉ đổi dữ liệu, chữ, prop:
   - Cột theo RESO và nhãn `CONTEXT.md`: Toà · Mã căn · Loại căn · Diện tích · Tầng · Hướng · Trạng thái · Giá · Phí ·
     Nội thất · Pháp lý · Tài chính · Tình trạng sử dụng · Xác nhận (độ tươi) · Mức đủ · Ai thấy; ẩn mặc định, bật trong
     menu cột: Giá chốt · Ngày bán · Lý do ngừng. Trạng thái bằng `Badge` biến thể `-light`; giá hiển thị «4,65 tỷ».
   - **Hàng lọc theo cột** của khối giữ: mỗi cột một ô lọc đúng kiểu — chữ (chứa), chọn nhiều (Toà, Loại căn, Trạng thái,
     Phí, Ai thấy, Xác nhận), số theo luật (Giá, Diện tích, Tầng, Mức đủ). Các ô lọc AND với nhau; nút «Xoá lọc».
   - **Nhóm**: điều khiển «Nhóm» trên thanh công cụ — Toà → Loại căn (mặc định) · Toà · Không nhóm. Hàng nhóm theo cách
     của `data-grid-grouping-2`: gập/mở, số căn của nhóm; nhóm con lồng trong nhóm toà. Dòng tổng ở chân bảng: số căn sau
     lọc trên tổng số căn.
   - **Chỉ đọc ở hàng này**: tắt sửa ô, dán, xoá, kéo điền, hoàn tác của khối; giữ chọn ô và chép (Ctrl/Cmd+C ra TSV) vì
     người dùng Sheet chép sang Zalo/Excel. Sửa là hàng 15.
   - Sắp xếp bấm tiêu đề; cuộn ảo dòng (`DataGridTableVirtual`) như bài thử 5.000 dòng.
4. **Góc nhìn = bộ lọc + cột hiện và thứ tự + sắp xếp + cách nhóm, có tên.** Lưu trên máy theo người và sàn (bộ nhớ trình
   duyệt, khoá `qh:goc-nhin:v1:<người>:<sàn>`), không qua máy chủ — lưu ở máy chủ cần bảng mới (migration), ngoài vùng
   của hàng và không có số giữ chỗ (luật đợt 24). Góc nhìn của đội để một hàng sau (yêu cầu `hang-moi`). Góc nhìn chứa
   điều kiện lọc của trường không nguồn nên không cần xoá khi đăng xuất. Lối vào:
   - Nút «Góc nhìn ▾» đầu thanh công cụ: danh sách góc nhìn của tôi · «Lưu góc nhìn…» (hộp đặt tên) · khi đang mở một góc
     nhìn và đã đổi: «Lưu đè», «Lưu thành góc nhìn mới» · «Đổi tên», «Xoá» (hộp xác nhận).
   - Cột thứ hai của vỏ: «Góc nhìn của tôi» liệt kê góc nhìn đã lưu, bấm mở `/inventory/views/<id>`; «+ Lưu góc nhìn» mở
     cùng hộp đặt tên; «Góc nhìn của đội» ghi «Chưa có». Thay đổi ở bảng hiện ngay ở cột (cùng một kho, nghe sự kiện).
   - `/inventory/views/<id>` dựng cùng bảng với góc nhìn đã áp; id không có trên máy này → khối báo nói góc nhìn không có
     trên máy này, kèm lối về Bảng hàng.
5. **Khuôn nhóm màn mới `bang-hang`** (luật đợt 18, `vo-va-ia.md` §2 «Nhóm mới»): `design/patterns/bang-hang.md` đủ chín
   khoá, khuôn `KhungBangHang` ở `apps/web/src/app/(app)/inventory/khung.tsx` (một `Frame` lấp cột nội dung, thanh công cụ,
   lưới); `/inventory` rời nhóm trang tạm cùng PR (KH-tt-roi-nhom, B-2 duyệt).
6. **Điện thoại**: dưới `md`, `/inventory` hiện khối báo «Bảng hàng dạng thẻ trên điện thoại dựng ở mục 32» thay vì nhồi
   lưới 19 cột vào 375px (Tham chiếu §9: «trên điện thoại là thẻ»).

## Chỗ máy tự quyết (căn cứ ở `decisions.jsonl`)

Chỉ đọc (sửa là hàng 15) · góc nhìn trên máy, của đội để sau · loại căn từ danh mục qua tuyến đọc mới · cột và cột ẩn
mặc định · nhóm mặc định Toà → Loại căn · điện thoại hiện khối báo · khuôn nhóm mới.

## Câu chỉ người trả lời (Cổng Phạm vi)

- **Hỏi-1 — cờ kiểu chặt.** Bản cài `data-grid` nguyên bản đỏ đúng một dòng dưới `noUncheckedIndexedAccess`
  (`data-grid-cell-selection.tsx:1387`). Khuyến nghị: giữ cờ cho cả web, sửa dòng ấy kèm chú thích, ghi ở `catalog.md`
  (lần nâng ReUI sau áp lại). Lối khác: tắt cờ cho riêng `apps/web` — bản cài nguyên vẹn, toàn web mất kiểm chỉ số mảng.
  Nháp đang theo khuyến nghị.
- **Hỏi-2 — nhãn loại căn và lựa chọn nhóm.** Khuyến nghị: «nPN» theo tiêu đề «PN» của Sheet đầu chủ (mẫu A hàng 5),
  «Studio» cho 0 phòng ngủ, «Chưa rõ» cho căn ngoài danh mục; điều khiển Nhóm có Toà → Loại căn · Toà · Không nhóm.
  Lối khác: viết đủ «n phòng ngủ». Nháp đang theo khuyến nghị.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: cột nhà «Bảng hàng» → bảng hiện mọi căn nhóm Toà → Loại căn → gõ ô lọc «Giá ≤ 5 tỷ», chọn Trạng thái «Đang
  bán» → «Góc nhìn ▾» → «Lưu góc nhìn…» → đặt tên «2PN dưới 5 tỷ» (điểm ra: góc nhìn hiện ở cột thứ hai và menu; lần sau
  một chạm mở `/inventory/views/<id>`).
- Biên: chưa có hàng nào (sàn mới) · lọc ra 0 căn · căn không có trong danh mục · danh mục chưa tải được (mất mạng lần đầu)
  · id góc nhìn không có trên máy này · tên góc nhìn trùng hay rỗng · khổ điện thoại.
- Lỗi & quay lại: kéo hàng lần đầu thất bại → khối lỗi có «Thử lại»; lọc ra 0 → «Xoá lọc» trả về toàn bộ; hộp đặt tên
  rỗng → báo dưới ô, không lưu.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Bảng hàng `/inventory` | thấy và lọc toàn bộ hàng của sàn như một Sheet | cột nhà, tab Bảng hàng / góc nhìn đã lưu |
| Góc nhìn `/inventory/views/<id>` | mở lại một cách xem đã lưu | cột thứ hai, menu Góc nhìn / Bảng hàng |
| Hộp «Lưu góc nhìn» | đặt tên cho cách xem hiện tại | menu Góc nhìn, «+ Lưu góc nhìn» / góc nhìn vừa lưu |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-bang-dang-tai | Bảng hàng | `Skeleton` đúng bố cục lưới (thanh công cụ + 8 dòng) khi kho trên máy chưa từng kéo | chờ |
| ST-bang-trong | Bảng hàng | «Sàn chưa có hàng nào» + nút «Nhập Excel» | nhập file |
| ST-bang-loi | Bảng hàng | khối lỗi «Chưa tải được bảng hàng» + «Thử lại» (chỉ khi chưa từng có bản trên máy) | thử lại |
| ST-bang-loc-rong | Bảng hàng | «Không căn nào khớp bộ lọc» + «Xoá lọc» | xoá lọc |
| ST-bang-day | Bảng hàng | lưới nhóm Toà → Loại căn, dòng tổng «n / N căn» | lọc, nhóm, lưu |
| ST-bang-chua-ro-loai | Bảng hàng | nhóm «Chưa rõ» cho căn ngoài danh mục hay khi danh mục chưa tải | — |
| ST-goc-nhin-da-doi | Bảng hàng | nhãn «Đã đổi» cạnh tên góc nhìn + «Lưu đè» | lưu đè / lưu mới |
| ST-goc-nhin-khong-co | Góc nhìn | khối báo «Góc nhìn này không có trên máy này» + «Về Bảng hàng» | về bảng |
| ST-bang-dien-thoai | Bảng hàng | khối báo «Bảng hàng dạng thẻ trên điện thoại dựng ở mục 32» | — |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Tên góc nhìn 1–60 ký tự, không trùng tên khác của tôi ở sàn này (không phân biệt hoa thường); Enter lưu, Esc đóng.
- Phím: mũi tên đi ô, Ctrl/Cmd+C chép vùng chọn; không phím nào sửa dữ liệu ở hàng này.
- Từ `md` trở lên: lưới; dưới `md`: khối báo.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `data-grid-editing-6` | dùng (chuyển thể dữ liệu, chữ, prop) | khối đích của `vo-va-ia.md` §2, đã đo ở ADR-0004 |
| nhóm dòng của `data-grid-grouping-2` | ghép (lấy cách nhóm vào lưới trên) | khối đích ghi rõ «hàng nhóm toà → loại căn lấy từ grouping-2» |
| `Dialog`, `AlertDialog`, `DropdownMenu` | dùng | hộp đặt tên, xác nhận xoá, menu Góc nhìn |
| `TrangThai` | dùng | trống, lỗi, báo theo khuôn trạng thái |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: hiển nhiên từ Tham chiếu §9 — bảng ăn gần hết bề ngang, hồ sơ căn mở thành cột phải (hàng 17); góc nhìn ở cột
thứ hai thay tab của Sheet. Không tra thêm.
<!-- UX-SPEC-TEMPLATE>>> -->

## Đo

- ADR-0004 «Hệ quả»: chạy lại máy đo cuộn trên màn thật (lưới có nhóm, cột ghim) — ghi số vào hồ sơ; trượt ngưỡng thì mở
  lại câu hỏi Glide, không tự đổi lưới.
- Số đo hai tuần thử (Tham chiếu §11: số ngày Sheet cũ không được sửa) là của phiên nghiệm thu, không phải của vòng này.

# Thiết kế: va-bang-hang-cuon-so-lon — Bảng hàng sàn 5.000 căn không sập

Hàng vá khẩn dãy D (đợt `dau-khach-nhap`), giám sát mở 06/11, D-23 «duyet». Câu giao ở hàng
`va-bang-hang-cuon-so-lon` của `docs/plan/lo-trinh.json`.

## Vấn đề

Lượt ghim lại của #165 (06/11) chạy E11 của `bang-hang-kieu-sheet` (đo cuộn 5.000 căn) trên bộ thử dãy B và thấy
`/inventory` của sàn đo cuộn hiện màn lỗi «Không mở được màn này»; console: `Minified React error #185` (vòng cập nhật
vô hạn) với vết `resizeItem → measureElement → onChange` của bộ cuộn ảo. Tái hiện ở 1366×768 và 1920×1080; sàn 33 căn
không sập.

**Chia đôi** (bản dev, bộ thử dãy B, bài dò mở Bảng hàng sàn 5.000 căn) giữa `028f5636` (E11 xanh lần cuối) và
`555fd831`: commit đầu tiên hỏng là `f5c7b81e` «bảng thẻ điện thoại trong khe của Bảng hàng». Phiên bản
`@tanstack/react-virtual` (3.14.24) và React (19.3.0) không đổi giữa hai mốc.

**Cơ chế.** `KhungBangHang` gắn khe điện thoại (`BangTheDienThoai` → `BangThe`) ở MỌI khổ, chỉ ẩn bằng CSS trên máy
tính. `BangThe` dựng bộ cuộn ảo trên vùng cuộn chung ĐANG HIỆN của trang (cao ~700). Mỗi dòng nằm trong khe ẩn đo ra cao
0 (`getBoundingClientRect` của phần tử dưới `display: none`), nên mọi dòng sau nó cũng lọt khung nhìn; bộ cuộn dựng thêm
dòng, đo tiếp ra 0, báo đổi, dựng lại — với 5.000 căn (2.375 lên thẻ) số lần cập nhật đồng bộ vượt giới hạn của React.

## Cách sửa (chỉ trong `inventory/cards/`)

- `cards/do-the.ts` (mới): `doCaoThe(el, uocLuong)` — dòng không có hình chiếu nào (`getClientRects().length === 0`, tức
  khe hay tổ tiên đang `display: none`) thì trả chiều cao ước lượng như thể chưa đo; dòng đang hiển thị trả chiều cao thật.
  `uocLuongDong(kind)` gom ước lượng 56/128 đang viết tại chỗ.
- `cards/bang-the.tsx`: `useVirtualizer` nhận `measureElement` gọi `doCaoThe` với ước lượng của đúng dòng
  (`data-index`). Không đổi `KhungBangHang`, `bang-hang.tsx`, data-grid hay thư viện.
- Khe hiện ra (điện thoại, hay đóng hồ sơ) thì dòng có hình chiếu và được đo thật như cũ — hiệu ứng `ao.measure()` sẵn có
  khi `an` đổi vẫn chạy.

## Đo

- `_acceptance/va-bang-hang-cuon-so-lon/thu/kiem-cuon.mjs`: build (ADR-0004), `next start` 3491 trên bộ thử dãy B, mở
  `/inventory` bằng phiên do-cuon ở từng khổ; khổ ≥ 768 đòi «/ 5000 căn», khổ điện thoại đòi «<N> căn» với N = số căn
  Đang bán + Đang giao dịch đếm từ API cùng lượt; mọi khổ: không màn lỗi, không lỗi console `#185`. Đối chứng dương: API
  trả đủ 5.000 căn. Chiều đỏ đo tay 06/11 trên `bang-the.tsx` của main: hai khổ máy tính đỏ đủ ba thông điệp ghim.
- `cards/do-the.test.ts`: bộ cuộn ảo thật (`Virtualizer` của `@tanstack/react-virtual`), 5.000 dòng, vùng cuộn hiện cao
  700, mọi dòng ẩn: đo bằng `doCaoThe` thì số dòng dựng ≤ 25 và đứng yên qua 40 khung; đối chứng đo 0 (hành vi cũ) thì
  số dòng phình ≥ 100 và còn tăng ở 80 khung. Phá thử tay: bỏ nhánh ẩn của `doCaoThe` → bài khoá vòng đỏ «dòng ẩn phải trả
  ước lượng, không trả 0».
- E11 của `bang-hang-kieu-sheet` (`do-cuon.mjs`) là thước hiệu năng cuộn đã ký — chạy lại nguyên văn.

## Đối chiếu ngành

Không áp: vòng không thêm đối tượng, trường hay điểm cấu hình nào — chỉ sửa cách bảng thẻ đo dòng khi bị ẩn.

## Ngoài vòng

- Không gắn khe điện thoại theo khổ (bỏ gắn trên máy tính) — `KhungBangHang` ngoài vùng của hàng, và #175 đang giữ
  `bang-hang.tsx`; cách sửa ở phép đo đủ chặn vòng mà không đổi cấu trúc khung.
- Bộ thử dãy B gieo ảnh thật (`dung-b.mjs`) sửa ở #165, không ở hàng này — lượt chấm dùng bộ thử đã dựng sẵn.

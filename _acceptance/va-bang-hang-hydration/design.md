# Thiết kế: va-bang-hang-hydration — Bảng hàng mở không báo lỗi hydration

Hàng vá dãy D (đợt `dau-khach-nhap`), giám sát mở từ yêu cầu L-46 (dãy L gặp ở bài nhìn E10 của `mau-bang-hang-va-bai`).

## Vấn đề

Mở Bảng hàng trên bản dev, console có lỗi «Hydration failed because the server rendered HTML didn't match the client»
(bốn khung ở `_acceptance/mau-bang-hang-va-bai/evidence/E10-console-errors.txt`): máy chủ dựng khung đang tải
(`ChoTai kieu="tran"`), còn lượt hydrat đầu của máy khách dựng trạng thái trống «Sàn chưa có hàng nào» hoặc thanh công cụ
có dữ liệu. React vứt cây máy chủ và dựng lại từ đầu; mọi bài nhìn mở Bảng hàng thấy lỗi console, phải loại tay.

## Nguyên nhân

`useDanhSachTrenMay()` (ở `inventory/bang-hang.tsx` và bản riêng ở `inventory/cards/bang-the.tsx`) đọc thẳng kho trên máy
(`bd.ngan()`, `bd.danhSach()`) ngay trong lượt dựng. Trên máy chủ kho chưa có gì (`listings === null` → «đang tải»); trên
máy khách kho đã nạp từ bộ nhớ trình duyệt trước khi hydrat (`listings` là mảng → trống hay có hàng). `useSyncExternalStore`
có snapshot máy chủ `() => 0`, nhưng giá trị đọc thật đi đường `bd.ngan()` bên cạnh, không qua snapshot — nên lượt hydrat
không giống lượt máy chủ.

## Cách sửa

Theo nếp đã có ở `units/call/push/ep-gia.tsx`: một cờ `oMay = useSyncExternalStore(khongDangKy, () => true, () => false)` —
máy chủ và lượt hydrat đầu thấy `false`, lượt dựng sau thấy `true`. Hai hook `useDanhSachTrenMay` trả «chưa kéo»
(`daKeo: false`, danh sách rỗng ổn định) khi `oMay` còn `false`, nên lượt hydrat dựng đúng khung đang tải như máy chủ; ngay
lượt kế dữ liệu trên máy hiện ra. Không đổi giao diện, chữ hay luồng — chỉ đổi lúc đọc kho.

## Thước

`_acceptance/va-bang-hang-hydration/thu/kiem-hydration.mjs`: bản dev của cây (React chỉ báo lệch ở bản dev), Chrome không
đầu, bốn ca — khổ máy tính và điện thoại × lần mở đầu và lần mở lại (kho trên máy đã có hàng, đúng ca bốn khung lỗi) — đếm
lỗi hydration trong console và ngoại lệ, kèm đối chứng dương «trang hiện hàng». Chiều đỏ: cùng lệnh trên nhánh chính trước
vòng phải đỏ.

## Không đổi

Giao diện, chữ, hành vi của Bảng hàng và danh sách thẻ; bộ đồng bộ (`lib/sync`); các chỗ khác đọc kho trên máy.

## Đặc tả UX

Bỏ — vòng không đổi bề mặt nào người dùng thấy (xem dòng sổ «bỏ đặc-tả-UX»).

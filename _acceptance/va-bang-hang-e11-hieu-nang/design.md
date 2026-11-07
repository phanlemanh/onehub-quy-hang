# Thiết kế: va-bang-hang-e11-hieu-nang — Bảng hàng cuộn mượt lại sau ô tích từng dòng

Hàng vá dãy D (đợt `dau-khach-nhap`), giám sát mở ở D-24 và chốt thiết kế + thước ngày 07/11.

## Vấn đề

Bài đo cuộn E11 của Bảng hàng (`bang-hang-kieu-sheet`: khung > 50 ms ≤ 1% trên 5.000 căn) trượt trên nhánh chính. Đo xen
kẽ từng cặp cùng tải (bản tốt `028f5636` ↔ bản xét) rồi chia đôi 131 commit first-parent tìm ra:

| Commit | Tỉ số khung > 50 ms (xét/tốt), 3 cặp | Kết luận |
|---|---|---|
| #59 `ac503a7d` | 2,04 · 1,02 · 0,77 → 1,02 | tốt |
| #60 `600365a5` (sửa hàng loạt, ô tích từng dòng) | 1,90 · 1,98 · 2,67 → 1,98 | chậm |
| nhánh chính `e85dd84c` | ~1,9 | chậm |

Số liệu: `.acceptance-runs/va-bang-hang-e11-hieu-nang/cap.tsv`, `chia-doi-2.log`.

## Nguyên nhân

Lưới ReUI (`data-grid-table.tsx`) vẽ lại mọi dòng đang hiện khi khoảng cuộn đổi — `MemoizedDataGridTableBodyRows` chỉ
bỏ qua lúc kéo cột hay kéo chọn ô — và hàm `cell` của cột chạy lại cho từng ô. Trước #60 ô «Dòng» chỉ là một `<span>`
số thứ tự; #60 đặt vào đó `OTich`, một `Checkbox` Base UI (nhiều hook, ô nhập ẩn, chỉ báo) — nên mỗi khung cuộn phải
dựng lại một Checkbox cho mỗi dòng đang hiện.

## Cách sửa

Giữ ô tích như cũ (cùng thành phần `Checkbox` đã cài, cùng nhãn, cùng hành vi), nhưng bọc `OTich` bằng `React.memo`:
props chỉ có `id`, nên khi cuộn lại các dòng đang hiện thì ô tích không vẽ lại; nó chỉ vẽ lại khi ngữ cảnh chọn
(`TichContext`) đổi — tức lúc người tích, bỏ tích hay «chọn hết». Dòng mới hiện vào khung vẫn dựng ô tích của nó (không
tránh được với lưới cuộn ảo) và đọc đúng trạng thái tích từ ngữ cảnh.

Nếu memo một mình chưa đưa tỉ số về ≤ 1,2, lối kế (theo thứ tự): tách trạng thái chọn khỏi ngữ cảnh chung thành kho đăng
ký theo từng mã căn (`useSyncExternalStore` với bộ chọn theo `id`) để một lần tích chỉ vẽ lại đúng một ô; rồi mới tới
thay phần tử nặng — vẫn qua thành phần đã cài, không tự vẽ ô tích.

## Thước

Thước do giám sát chốt: đo xen kẽ cùng tải, 3 cặp, **trung vị tỉ số (xét/tốt) ≤ 1,2 và trung vị khung > 50 ms của bản
xét ≤ 1%** — lệnh `_acceptance/va-bang-hang-e11-hieu-nang/thu/kiem-e11.sh`. Không nới ngưỡng E11. Đối chứng: cùng lệnh
trên `fbdad5ad` (nhánh chính trước vòng) phải đỏ.

## Không đổi

Giao diện, chữ, hành vi tích/bỏ tích/chọn hết, thanh hành động và hộp hỏi lại của sửa hàng loạt; thành phần cài nguyên
bản dưới `components/ui`, `components/reui`.

## Đặc tả UX

Bỏ — vòng không đổi bề mặt nào người dùng thấy (xem dòng sổ «bỏ đặc-tả-UX»).

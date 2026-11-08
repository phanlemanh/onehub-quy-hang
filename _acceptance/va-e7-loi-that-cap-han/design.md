# Thiết kế: va-e7-loi-that-cap-han — khung 3 của E7 dựng lỗi bằng phản hồi của máy chủ

Hàng vá dãy D (đợt `dau-khach-nhap`), từ Ngoài-1 của `luat-chia-lead-cap-han-hong` (PR #156): chủ kho chọn «mở hợp đồng mới»
ở Cổng Bằng chứng 06/11.

## Vấn đề

Phép nhìn E7 của `luat-chia-lead-cap-han-hong` (`thu/chay-ui.mjs`) có khung 3 «phản hồi 200 còn lỗi → màn báo chưa áp»: lớp bọc
fetch trả một phản hồi 200 giả với câu lỗi GÕ TAY đúng khuôn bên đọc. Màn nhận ra lỗi của khoá vừa lưu bằng cách dò tên khoá
trong `errors` (`luat.ts`: `ban.errors.some((e) => e.includes(k))`). Câu gõ tay luôn chứa tên khoá, nên nếu máy chủ đổi câu
lỗi (bỏ tên khoá) thì màn hỏng mà phép nhìn vẫn xanh.

## Ràng buộc đã kiểm

Từ 06/11 (Hỏi-1 của `luat-chia-lead-cap-han-hong`), lưu một nửa cặp hạn hỏng thì máy chủ ghi luôn nửa kia bằng giá trị đang
áp (`packages/api/src/settings/store.ts`), nên không lần lưu thật nào trả 200 còn lỗi ở khoá vừa lưu — nhánh «chưa áp» của
màn là đường phòng thủ. Đo 08/11: lưu thật Hạn gọi lần đầu 45 khi Hạn nhận 60 có từ trước → 200, `errors: []`, toast
«Đã lưu».

## Cách làm

Khung 3 vẫn thay phản hồi PATCH, nhưng thân lấy NGUYÊN từ GET thật của máy chủ khi cặp đang hỏng (Hạn nhận 60 chèn như dòng
có từ trước): `items` và `errors` đều do máy chủ viết, không còn chữ gõ tay. Lớp bọc ghi thêm phản hồi thật của các khung
khác (status + thân) để chẩn đoán.

Chỗ thử 5575/postgres có thể mất hết hàng (bộ test của gói api dọn bảng trên chính cơ sở dữ liệu ấy): `dung-d.mjs` của hàng 48
tự nạp một căn Đang bán ở Toà A qua API bằng phiên đầu chủ 1 khi thiếu (giám sát duyệt D-30).

## Thước

`thu/kiem-e7.mjs`: chạy phép nhìn rồi chấm khung 3 (báo «chưa áp» nêu «Hạn gọi lần đầu», không «Đã lưu»; GET thật có lỗi) với
đối chứng khung 1 có «Đã lưu». `--doi-cau`: chấm một bản sao cây mà câu lỗi cặp của máy chủ bỏ tên khoá — phải đỏ.

## Không đổi

Mã sản phẩm (màn, API, lõi); khung 1 và 2 của E7.

## Đặc tả UX

Bỏ — vòng chỉ đổi công cụ đo (xem dòng sổ «bỏ đặc-tả-UX»).

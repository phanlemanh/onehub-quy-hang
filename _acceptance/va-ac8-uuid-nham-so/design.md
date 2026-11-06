# Thiết kế: va-ac8-uuid-nham-so — AC-8 không bắt nhầm số trong UUID

Hàng vá dãy D (đợt `dau-khach-nhap`), giám sát xếp làm trước (D-24). Câu giao ở hàng `va-ac8-uuid-nham-so` của
`docs/plan/lo-trinh.json`. Hạng T3 theo `risk_tiers.t3_paths` (`packages/db/**`) — lộ trình ghi T2.

## Vấn đề

Bài «AC-8 không dữ liệu thật» (`packages/db/tests/du-lieu-mau-thap-tang.test.mjs`) quét mọi chuỗi của bộ mẫu và của các
dòng cơ sở dữ liệu vừa nạp, đòi không có số điện thoại nào ngoài dạng mẫu `0900 000 0xx`. Hàm `quetSo` dò ứng viên số
(`UNG_VIEN_SO`) TRƯỚC khi gỡ các đoạn được phép (`CHO_PHEP`: UUID, ngày, mốc giờ…). UUID của dòng cơ sở dữ liệu sinh ngẫu
nhiên; khi một đoạn của nó mở bằng `0` và đủ chữ số (ví dụ `14a1928b-9906-4b2b-af5e-03408001142f`), dãy `03408001142`
bị bắt dở thành số, rồi UUID bị cắt nên không khớp mẫu được phép và phép đếm chữ số còn lại cũng đỏ. CI `isolation` của
#151 và #165 đỏ vì thế (06/11: «số không đúng dạng mẫu: cơ sở dữ liệu.user[0].id «03408001142»»); chạy lại thì xanh.

## Cách sửa (chỉ trong tệp kiểm)

- Gỡ `CHO_PHEP` TRƯỚC khi dò ứng viên số.
- `UNG_VIEN_SO` giữ nguyên. Bản đầu có thêm chặn hai bên (không dính chữ hay chữ số); phản biện cho thấy gỡ chặn ấy mọi
  phép đo vẫn xanh, tức nó không đo được và không cần — bỏ, để lời hợp đồng nói đúng một cơ chế: gỡ trước, dò sau.
- Thêm ca `AC-8 dò số` (không cần cơ sở dữ liệu) với ma trận viết trước `DO_SO_SACH` (6 chuỗi không được báo, gồm UUID
  của sự cố viết thường và viết hoa) và `DO_SO_BAN` (6 chuỗi phải báo: số thật dạng thường, quốc tế, liền có dấu chấm sau,
  gạch ngang, dính chữ, và dãy số đứng riêng); ca ghim kích thước hai ma trận, kèm đối chứng dương: số mẫu đúng dạng được đếm.
- Không đổi bộ dữ liệu mẫu, `SO_MAU`, `CHO_PHEP` hay phần còn lại của AC-8. Phá thử sẵn có của AC-8 («Gọi 0912 345 678»,
  «+84 912 345 678» cài vào bộ mẫu) giữ nguyên và phải còn đỏ — tức «một số điện thoại thật cài vào bộ mẫu vẫn bị bắt».
  Ô ngưỡng của hàng viết «cài một số dạng 0900 000 0xx thì bài đỏ»; `0900 000 0xx` chính là dạng mẫu được phép, nên vòng
  đọc theo câu giao: số THẬT cài vào bộ mẫu bị bắt.

## Đo

`_acceptance/va-ac8-uuid-nham-so/thu/kiem-ac8.mjs`: `--lap N` chạy ca AC-8 cần cơ sở dữ liệu N lần trên một cơ sở dữ
liệu tạm (UUID mới mỗi lần), đòi 0 lần đỏ và đối chứng dương ca ấy thật sự chạy cả N lần; `--doi-chung-do <sha>` ghép ma
trận và ca «AC-8 dò số» của cây vào bản tệp kiểm của nhánh chính tại `<sha>` rồi đòi ca ấy ĐỎ đúng «nhận nhầm số trong
«14a1928b-…»»; `--bat-bien <sha>` đòi `packages/db/seed/` không đổi tệp nào và `SO_MAU`, `CHO_PHEP` giữ nguyên;
`--tron` còn đếm phần tử hai ma trận. Mọi chế độ cần cơ sở dữ liệu từ chối máy chủ không phải máy cục bộ (thoát 2). Chạy thử
06/11: chiều đỏ đúng; 25/25 lần xanh.

## Đối chiếu ngành

Không áp: vòng không thêm đối tượng, trường hay cấu hình — chỉ sửa phép dò của một bài kiểm.

## Ngoài vòng

- Bộ dữ liệu mẫu, `SO_MAU`, luật nhãn mẫu — không đổi.
- Các tệp kiểm khác của `packages/db/tests/`.

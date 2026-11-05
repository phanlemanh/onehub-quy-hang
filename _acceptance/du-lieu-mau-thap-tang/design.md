# Thiết kế — Bộ dữ liệu mẫu thấp tầng (hàng 73)

Ngày 05/11/2026 · dãy X đợt dau-khach-nhap · hạng T3 (vùng `packages/db/**`) · Cổng Đáng: chủ kho «build» 05/11.

## Vấn đề

Bộ mẫu hàng 5 chỉ có một khu căn hộ (toà · tầng · trục). Các hàng 74–80 (gõ mã lô, địa chỉ chuẩn, căn ngoài khu, lead
mọi loại hình, nhập file thấp tầng, bảng hàng theo loại hình, luật ẩn theo loại hình) cần dữ liệu giả có nhãn cho căn
thấp tầng trong khu và nhà, đất ngoài khu — kèm đáp án để đo. ADR-0016 quyết định 3 và 5 đặt hình: trong khu không toà
thì khu → dãy → lô; ngoài khu định danh bằng địa chỉ chuẩn.

## Vật sinh ra

Một lệnh `node packages/db/seed/sinh-thap-tang.mjs` (tất định, một hạt giống, `--kiem` so với tệp trong kho) ghi vào
`packages/db/seed/mau-thap-tang/`:

| Tệp | Là gì |
| --- | --- |
| `du-lieu-mau-thap-tang.json` | Danh mục khu thấp tầng (khu → dãy → lô), căn ngoài khu có địa chỉ, chủ nhà, hàng, lead, người mẫu |
| `bang-hang-thap-tang.xlsx` | File bảng hàng thấp tầng bẩn, kiểu sàn ghi tay |
| `dap-an-thap-tang.json` | Đáp án: của file bẩn (dòng tiêu đề, đích từng cột, giá trị đúng từng ô, lỗi cấy) và của bộ địa chỉ thử |

Danh mục đơn vị hành chính trích ở `packages/db/seed/don-vi-hanh-chinh-mau.mjs`: một tỉnh (Thành phố Hồ Chí Minh), bốn
phường mới (Sài Gòn, Tân Định, Bến Thành, Cầu Ông Lãnh), mười phường cũ của Quận 1 cũ kèm phường mới nhận chúng — ba
phường cũ bị tách (Đa Kao, Nguyễn Thái Bình, Cầu Ông Lãnh). Nguồn: Nghị quyết 1685/NQ-UBTVQH15 ngày 16/6/2025, đọc qua
trang Wikipedia tiếng Việt «Quận 1» ngày 05/11/2026. Danh mục đầy đủ (34 tỉnh, 3.321 xã, mã đơn vị) là việc của hàng 75
ở `packages/core/src/address/**`; hàng 75 đối chiếu bảng trích này với danh mục của nó.

### Khu thấp tầng

«[Mẫu] Khu thấp tầng thử», năm dãy: LK1, LK2 (liền kề → `Townhouse`), SH1 (shophouse → `Townhouse`, nhãn riêng của sàn),
BT1 (biệt thự → `Single Family Residence`), DN1 (đất nền → `Unimproved Land`). Mã lô `<dãy>-<lô hai chữ số>` ở
`unitNumber`, UPI `urn:onehub:upi:mau:<mã lô>`. Trường mỗi lô đúng bảng loại hình của lõi (`PROPERTY_SUBTYPE_FIELDS`);
trường không dùng là `null`. Cấp hai mang `blockKey` / `blockName` theo ADR-0016 quyết định 3 và 9 — khuôn `CatalogFeed`
chưa có cấp dãy (mục chờ LH11), nên bộ mẫu giữ hình khu → dãy → lô riêng; từng lô vẫn qua khuôn `CatalogUnit`.

### Ngoài khu

Căn ngoài khu `NK-nn`: nhà phố, nhà riêng (biệt thự), đất lẻ ở các phường mới của bảng trích. Địa chỉ chuẩn theo
ADR-0016 quyết định 5: `stateOrProvince`, `wardName`, `streetName` = «Đường Mẫu N», `streetNumber` = số nhà sinh — mặt
đường (`45`, `45A`) hay hẻm nhiều cấp (`45/12`, `45/12/3`). Không hai căn cùng địa chỉ chuẩn.

### Bộ địa chỉ thử có đáp án

Mỗi căn ngoài khu có vài cách viết. Kiểu viết là ma trận viết trước: tên phường mới; tên phường cũ gộp trọn (Bến Nghé →
Sài Gòn); tên phường cũ bị tách (đáp án «cần người chọn» kèm đúng các phường mới nhận nó); ba kiểu hẻm («45/12/3»,
«số 3 hẻm 45/12», «số 3 HXH 45/12» — giữ đủ cấp hẻm); viết tắt và không dấu («P.», «Q.1», «TP.HCM», «Duong Mau 2»); thiếu số nhà (đáp án nói
thiếu `streetNumber`). Cặp gần trùng — hai căn khác nhau cùng đường, số khác nhau một cấp hẻm hay một chữ cái — có
đáp án khác nhau.

### File bẩn

Một sheet, hai dòng đầu là tiêu đề sàn và dòng trống, tiêu đề cột ở dòng ba. Cột viết kiểu sàn: loại hình bằng nhãn riêng
(«Liền kề», «Shophouse», «Biệt thự», «Đất nền», «Nhà phố», «Căn hộ»), mã lô nhiều dạng («LK1-01», «lk1 01»), ô địa chỉ cho
nhà ngoài khu (lấy từ bộ địa chỉ thử), diện tích đất «5x20» hay «100m2», số tầng «1 trệt 3 lầu», giá «12,5 tỷ» hay số đồng
hay «Thỏa thuận», số điện thoại chấm, cách, «+84». Đủ bốn loại hình: thêm vài dòng căn hộ trên danh mục hàng 5. Đáp án
theo khuôn bộ thử của hàng 64 (dòng tiêu đề · đích từng cột · giá trị đúng từng ô · lỗi cấy mang nhãn), đích là tên trường
RESO; giá trị đúng lấy từ bộ dữ liệu, không từ bộ ghi file.

### Hàng, chủ nhà, lead, người

Hàng phủ sáu trạng thái và bốn loại hình (căn hộ trên căn của danh mục hàng 5 chưa có hàng mở ở hàng 5). Hai đầu chủ mẫu
mới với vùng phụ trách «Khu thấp tầng» và «Nhà ngoài khu»; chủ nhiều căn một đầu chủ. Số điện thoại tiếp sau dải hàng 5
dùng (0900 000 043 trở đi), không trùng trừ ca trùng cố ý. Lead viết trước theo ca: biết lô · chỉ biết dãy · ngoài khu
đủ địa chỉ · ngoài khu thiếu số nhà · trùng lô đang có hàng mở · trùng nhà ngoài khu đang có hàng mở viết lệch · trùng số
chủ nhà đã có.

### Nạp và xoá

`nap-thap-tang.mjs --nap` ghi phần ghi được vào bảng hiện có — hai đầu chủ, hai vùng phụ trách, phân vùng — vào chính
«[Mẫu] Sàn thử» (tạo nếu chưa có). Lô, căn ngoài khu, hàng, chủ nhà, lead nằm trong tệp, chờ hàng 76 (căn ngoài khu,
`listings.building_name` bỏ `not null`). Xoá bằng lệnh xoá sẵn có của hàng 5 (`nap.mjs --xoa`): một lệnh gỡ cả hai bộ.
Chung một sàn vì kiểm trùng và luật một hàng mở mỗi căn chỉ chạy trong một công ty: hàng căn hộ của bộ này nằm trên
danh mục hàng 5 và có lead trùng số chủ nhà của bộ khác — tách sàn thì các ca ấy hết nghĩa. Đổi lại: không gỡ riêng được
phần thấp tầng. Bộ nạp bản thật (`nap-ban-that.ts`, nút trên bản thật) không đổi.

## Kiểm

Một tệp `packages/db/tests/du-lieu-mau-thap-tang.test.mjs`, chạy trong `npm run db:test` (job `isolation` của CI). Mỗi
phép đo có đối chứng dương trên vật lành và phá thử trên bản sao, đỏ với thông điệp ghim — như bộ kiểm hàng 5. Tệp Excel
đọc lại bằng `doc-xlsx.py` (thư viện chuẩn Python), không bằng mã ghi.

## Không làm

Danh mục đơn vị hành chính đầy đủ và bộ đọc địa chỉ (hàng 75); đọc mã lô (74); bảng căn ngoài khu và hàng thấp tầng trong
cơ sở dữ liệu (76); sửa khuôn `CatalogFeed` cho cấp dãy (LH11); nạp thấp tầng lên bản thật.

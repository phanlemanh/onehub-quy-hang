# Thiết kế — Địa chỉ chuẩn và khoá địa chỉ (hàng 75)

Ngày 05/11/2026 · dãy X đợt dau-khach-nhap · hạng T2 (vùng `packages/core/src/address/**`) · Cổng Đáng: chủ kho «Build
tất cả.» 05/11.

## Vấn đề

ADR-0016 quyết định 5: nhà, đất ngoài khu không có danh mục — định danh bằng **địa chỉ chuẩn**, kiểm trùng bằng **khoá
địa chỉ**. Từ 1/7/2025 địa giới còn hai cấp (tỉnh, xã), nên bảng hàng của sàn còn đầy tên phường cũ và tên quận đã bỏ.
Hàng 76 (căn ngoài khu), 77 (lead mọi loại hình), 78 (nhập file thấp tầng) và kiểm trùng ngoài khu (LH6) đều đứng trên một
bộ đọc địa chỉ ở lõi. Hàng này dựng bộ đọc ấy: thuần, tất định, không gọi dịch vụ ngoài.

## Vật sinh ra

Mọi tệp nằm ở `packages/core/src/address/`:

| Tệp | Là gì |
| --- | --- |
| `danh-muc.ts` | Danh mục đơn vị hành chính: khuôn dữ liệu + dữ liệu, ghi nguồn và ngày đọc, khai rõ phạm vi đã chép |
| `chuan-hoa.ts` | Bỏ dấu, chuẩn hoá tên đường, chuẩn hoá số nhà (hẻm, ngõ, ngách, kiệt thành dãy số từ đường chính vào) |
| `doc-dia-chi.ts` | `docDiaChi(chu, danhMuc?)` — đọc chữ người gõ ra địa chỉ chuẩn, khoá, phần thiếu, việc cần người chọn |
| `index.ts` | Cửa xuất của vùng (gói chưa mở đường `@quy-hang/core/address`; hàng 76 mở khi có người dùng đầu tiên) |
| `*.test.ts` | Bộ kiểm, mỗi ca mang tên «AC-n …», chạy trong `npm test -w @quy-hang/core` |

Không bảng, không migration, không màn, không đổi `packages/core/src/index.ts` hay `package.json` của gói.

### Kết quả đọc

`docDiaChi` trả một đối tượng, tên trường theo RESO và ADR-0016 quyết định 5:

| Trường | Nghĩa |
| --- | --- |
| `unparsedAddress` | Chữ người gõ, giữ nguyên từng ký tự (RESO `UnparsedAddress`) |
| `stateOrProvince` | `{ ma, ten }` của tỉnh, thành trong danh mục, hay `null` (RESO `StateOrProvince`) |
| `wardName` | `{ ma, ten, tuTenCu? }` của xã, phường, đặc khu mới; hay `{ canNguoiChon: true, tenCu?, chu, ungVien: [{ ma, ten, maTinh, tenTinh }] }`; hay `null` |
| `streetName` | Tên đường như người gõ, đã gọn khoảng trắng (RESO `StreetName`) |
| `streetNumber` | Số nhà chuẩn: dãy số từ đường chính vào, `45/12/3`, chữ cái hoa `45A` (RESO `StreetNumber`) |
| `thieu` | Các phần chưa đọc được: `stateOrProvince`, `wardName`, `streetName`, `streetNumber` |
| `chuaCoTrongDanhMuc` | Tên tỉnh hay xã đọc được mà danh mục không có, kèm chữ đã đọc |
| `khoa` | Khoá địa chỉ, chỉ có khi đủ bốn phần và không còn việc cần người chọn; còn lại `null` |
| `trangThai` | `thieu` khi `thieu` khác rỗng (thắng mọi trạng thái khác) · `can-nguoi-chon` khi đủ phần mà xã cần chọn · `chuan` khi có khoá |

**Khoá địa chỉ** đúng công thức ADR-0016: `mã tỉnh | mã xã | tên đường chuẩn hoá | số nhà chuẩn hoá`, ví dụ
`79|26740|mau 1|45/12/3`. Tên đường chuẩn hoá: bỏ dấu, chữ thường, bỏ chữ «đường», «phố» ở đầu, gọn khoảng trắng. Mã là mã
đơn vị hành chính chính thức, nên đổi tên hiển thị không đổi khoá.

Tên đường giữ chữ người gõ vì lõi không có danh mục đường: «Duong Mau 1» không dựng lại được dấu. Hai cách viết vẫn ra
một khoá vì khoá dùng dạng bỏ dấu. Danh mục đường theo xã (để hiện tên có dấu, bắt sai chính tả) là việc sau.

### Luật đọc

1. Tách chữ theo dấu phẩy thành đoạn; đọc từ cuối lên: tỉnh, rồi quận/huyện cũ (nếu có), rồi xã, phường, phần còn lại là
   số nhà và đường. Chuỗi không dấu phẩy thì dò tỉnh ở đuôi chuỗi.
2. **Tỉnh**: khớp nguyên đoạn với tên trong danh mục — tên chính thức, tên bỏ «Tỉnh»/«Thành phố», «TP <tên>», và tên gọi
   khác danh mục khai (TP.HCM, TPHCM, TP HCM, HCM). «Sài Gòn» không phải tên gọi khác của thành phố vì nay là tên phường.
3. **Quận, huyện, thị xã cũ** (`Quận 1`, `Q.1`, `Q1`, `Huyện …`): địa giới hai cấp không còn cấp này, nên có nó nghĩa là
   người viết theo địa giới cũ → tên phường đứng cạnh đọc là **phường cũ** trước.
4. **Xã, phường** (`Phường`, `P.`, `P`, `Xã`, `X.`, `Đặc khu`, `Thị trấn`, `TT`): tìm trong tỉnh đã đọc.
   - Có quận cũ: tìm phường cũ cùng tên (và cùng quận khi danh mục ghi quận). Phường cũ vào trọn một xã mới → xã mới, kèm
     `tuTenCu`. Phường cũ bị tách vào từ hai xã mới → **cần người chọn**, ứng viên đúng các xã mới nhận nó; không đoán.
     Không có phường cũ cùng tên → thử xã mới cùng tên.
   - Không quận cũ: tìm xã mới cùng tên trước; không có thì phường cũ (cùng luật vào trọn / bị tách). Tên phường cũ trùng ở
     nhiều quận mà chữ không nói quận → cần người chọn, ứng viên là hợp các xã mới nhận chúng.
   - Không có trong danh mục → `thieu` chứa `wardName`, `chuaCoTrongDanhMuc` ghi chữ đã đọc.
5. **Thiếu tỉnh** → `thieu` chứa `stateOrProvince`; lõi không suy tỉnh từ tên phường (danh mục chép một phần thì «tên
   phường duy nhất» là sai), xã đọc được thành cần người chọn với ứng viên mang `maTinh`, `tenTinh`. Luật này xét lại khi
   danh mục cấp xã đủ (lúc ấy tên xã duy nhất cả nước mới thật là duy nhất). Tỉnh có trong chữ thì xã chỉ tìm trong tỉnh ấy:
   «Phường Tân Định, Tỉnh Bắc Ninh» ra xã «chưa có trong danh mục», không gán sang Tân Định của TP.HCM.
6. **Số nhà**: `45`, `45A`, `45/12/3` đứng đầu; «số 3 hẻm 45/12», «số 3, HXH 45/12», «số 3 kiệt 45/12» → `45/12/3`; kiểu Hà
   Nội «số 3 ngách 12 ngõ 45» → `45/12/3` (ngõ, rồi ngách, rồi số). Hẻm không kèm số nhà là địa chỉ của hẻm, không phải
   của nhà → `thieu` chứa `streetNumber`.
7. Phần còn lại sau khi bỏ số nhà là tên đường; rỗng → `thieu` chứa `streetName`.

### Danh mục đơn vị hành chính

Khuôn: `tinh` (mã hai chữ số, tên chính thức, loại, tên gọi khác) · `xa` (mã năm chữ số, mã tỉnh, tên, loại) · `xaCu`
(tên, loại, quận/huyện cũ, mã tỉnh, `vao` = mã các xã mới nhận nó) · `nguon` (văn bản, nơi đọc, ngày đọc) · `phamVi` (câu nói
rõ đã chép những gì). Bộ đọc chỉ dùng dữ liệu, không có tên đơn vị nào trong mã — thêm dữ liệu là thêm dòng.

Dữ liệu chép trong vòng này (khuyến nghị ở Hỏi-1 dưới):

- **34 tỉnh, thành đủ**, mã và tên theo Quyết định 19/2025/QĐ-TTg (Phụ lục I), đọc qua trang thuviennhadat.vn ngày
  05/11/2026.
- **Cấp xã: phần trích TP.HCM của hàng 73** — bốn phường mới Sài Gòn (26740), Tân Định (26737), Bến Thành (26743), Cầu Ông
  Lãnh (26758) và mười phường cũ Quận 1 kèm phường mới nhận chúng, theo Nghị quyết 1685/NQ-UBTVQH15; mã đọc ở hộp thông tin
  trang Wikipedia tiếng Việt từng phường (trang ấy dẫn danh mục của Tổng cục Thống kê), ngày 05/11/2026. Phần nhận của
  từng phường cũ khớp đúng bảng trích hàng 73.
- Bộ kiểm đối chiếu bảng trích của hàng 73 (`packages/db/seed/don-vi-hanh-chinh-mau.mjs`) với danh mục lõi: mọi tên tỉnh,
  phường mới, phường cũ ở bảng trích có trong lõi và tập phường mới nhận khớp nhau — lệch thì đỏ.

**Hỏi-1 — danh mục cấp xã đầy đủ (3.321 xã, bảng tên cũ → tên mới cả nước).** ADR-0016 quyết định 5 và Cổng Bằng chứng hàng
73 («việc bị hoãn … đi ở hàng 74, 75, 76») đặt danh mục đầy đủ ở hàng này. Máy không có bản máy-đọc-được của Phụ lục II Quyết
định 19/2025 và của 34 nghị quyết sắp xếp cấp xã; lấy về là tải tệp từ ngoài, chọn nguồn nào tin được là việc của người.
Khuyến nghị: vòng này giao bộ đọc + khuôn + 34 tỉnh + phần trích TP.HCM; danh mục cấp xã đầy đủ thành một hàng dữ liệu
riêng ngay sau, chủ kho chọn nguồn và cho phép tải. Đổi lại: tới khi hàng ấy xong, địa chỉ thật ngoài bốn phường trích ra
«chưa có trong danh mục» (không sai, không có khoá). Lối khác: tải đủ ngay trong vòng này — vòng dài thêm, cần anh chỉ nguồn
và cho phép tải ngay ở cổng này.

**Hỏi-2 — nguồn mã đơn vị hành chính của vòng này.** Mã là một phần của khoá; hàng 76 lưu khoá thì đổi mã là dựng lại
khoá. Mã 34 tỉnh đọc ở trang thuviennhadat.vn chép Phụ lục I Quyết định 19/2025; mã bốn phường đọc ở Wikipedia tiếng Việt
(trang dẫn danh mục Tổng cục Thống kê) — chưa đối chiếu văn bản gốc. Khuyến nghị: dùng hai nguồn ấy cho vòng này, ghi rõ «chưa
đối chiếu Phụ lục II» trong danh mục, và hàng danh mục đầy đủ (Hỏi-1) đối chiếu lại mọi mã trước khi hàng 76 lưu khoá. Lối
khác: anh chỉ một nguồn chính thức (tệp Phụ lục II, trang Tổng cục Thống kê) để máy đối chiếu ngay trong vòng này.

Tên tỉnh cũ (63 → 34) không chép vòng này: không có xã nào của tỉnh cũ để đọc tiếp, và đi cùng danh mục cấp xã đầy đủ.

## Đối chiếu ngành (ADR-0022)

| | Quỹ hàng (hàng 75) | RESO DD 2.1 | Google Address Validation | Cổng tin đăng trong nước (batdongsan, Chợ Tốt) |
| --- | --- | --- | --- | --- |
| Phần địa chỉ | tỉnh · xã · đường · số nhà | `StateOrProvince` · `City` · `StreetName` · `StreetNumber` · `UnparsedAddress` | thành phần có nhãn | chọn tỉnh → quận → phường, gõ đường |
| Chữ gốc | giữ ở `unparsedAddress` | `UnparsedAddress` | giữ đầu vào | không |
| Phần thiếu | `thieu` theo phần | — | `missingComponentTypes` | bắt chọn đủ |
| Không chắc | cần người chọn, có ứng viên | — | `unconfirmedComponentTypes`, đề nghị sửa | — |
| Tên cũ → mới | phường cũ → xã mới, tách thì hỏi | — | không biết phường cũ | danh sách chọn cập nhật theo đợt |
| Khoá trùng | mã tỉnh + mã xã + đường + số | — | `placeId` (dịch vụ ngoài) | không |

Lấy từ Google: báo **từng phần** thiếu và không chắc thay vì một cờ «sai»; không lấy dịch vụ ngoài (ADR-0016 quyết định 5,
bất biến 2 với địa chỉ của lead). Lấy từ RESO: tên trường và giữ chữ gốc. `City` của RESO không khớp cấp nào của địa giới hai
cấp nên dùng `wardName` (đặc trưng Việt Nam, ADR-0016).

## Kiểm

Bộ kiểm trong `packages/core/src/address/*.test.ts`, chạy trong `npm test -w @quy-hang/core` (suite của mọi lượt S4 và job
`check` của CI). Đo trên bộ địa chỉ thử có đáp án của hàng 73 (`packages/db/seed/mau-thap-tang/dap-an-thap-tang.json`, 86
cách viết của 14 căn) và căn ngoài khu của bộ ấy, cộng các ma trận viết trước trong tệp kiểm. Mỗi phép đo là một hàm kiểm
thuần trả danh sách lỗi: đối chứng dương trên vật lành ra rỗng, phá thử trên bản sao ra đúng thông điệp ghim.

## Không làm

Danh mục cấp xã đầy đủ và tên tỉnh cũ (Hỏi-1); danh mục đường theo xã; bảng căn ngoài khu và lưu khoá (hàng 76); kiểm trùng
theo khoá (LH6); đọc địa chỉ trong ô nhận lead và nhập file (hàng 77, 78); toạ độ (ADR-0016 quyết định 5 — chỉ khi người
ghim); mở đường `@quy-hang/core/address` trong `package.json` (hàng 76, khi có người dùng).

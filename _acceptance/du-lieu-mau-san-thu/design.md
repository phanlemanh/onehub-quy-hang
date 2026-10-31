# Thiết kế: dữ liệu mẫu của sàn thử

Hàng 5 của lộ trình (`docs/plan/lo-trinh.json`), ô cơ hội `_acceptance/du-lieu-mau-san-thu/opportunity.md` (Cổng Đáng:
build, Manh Phan 30/10). Ngưỡng sống: sinh lại hai lần ra cùng dữ liệu; không tên hay số điện thoại thật; mọi bản ghi mang
nhãn mẫu và xoá được một lần.

## Người dùng thấy gì khác

Đội dựng tính năng có một sàn thử dựng sẵn bằng một lệnh: một dự án căn hộ hai toà, người mẫu đủ năm vai, chủ nhà và lead
giả, cùng hai file bảng hàng Excel mẫu để thử nhập Excel. Chạy lại ra đúng dữ liệu cũ; xoá bằng một lệnh, chỉ mất dữ liệu
mẫu.

## Hình dạng

Mã ở `packages/db/seed/` (vùng của hàng). Không migration mới: hàng này không tạo bảng.

| Tệp | Làm gì |
| --- | --- |
| `du-lieu-mau.mjs` | Hàm thuần `sinhDuLieuMau({ hatGiong })` dựng toàn bộ bộ dữ liệu từ một hạt giống cố định (bộ sinh số giả ngẫu nhiên tự viết, không phụ thuộc đồng hồ hay `Math.random`) |
| `mau-file.mjs` | Hai mẫu file bảng hàng: mẫu A «Sheet đầu chủ» (tiêu đề viết tắt, giá tỷ, `BP`/`KBP`), mẫu B «file đầy đủ» (tiêu đề đủ chữ, giá đồng, «Đã gồm phí»/«Chưa gồm phí», cột khác thứ tự) |
| `xlsx.mjs` | Ghi và đọc `.xlsx` tối thiểu (zip lưu không nén, giờ cố định) — không thêm phụ thuộc vì `package-lock.json` ngoài ranh giới; đọc lại dùng cho bài kiểm |
| `sinh.mjs` | Lệnh ghi `packages/db/seed/mau/du-lieu-mau.json`, `mau-a.xlsx`, `mau-b.xlsx`; `--kiem` so tệp trong kho với đầu ra sinh lại |
| `nap.mjs` | Lệnh nạp (`--nap`) và xoá (`--xoa`) phần ghi được vào cơ sở dữ liệu hiện có, chạy trên kết nối chủ như `mo-san.mjs` |
| `du-lieu-mau.test.mjs` | Bài kiểm tám tiêu chí |

### Bộ dữ liệu

- **Sàn thử** «[Mẫu] Sàn thử».
- **Người mẫu** sáu người, một người một vai, quản trị thêm một: Telesales, Đầu chủ 1, Đầu chủ 2, Đầu khách, Trưởng nhóm,
  Quản trị sàn. Tên «[Mẫu] Đầu chủ 1»…, email `<vai>@mau.quy-hang.test` (miền `.test` dành riêng, không gửi được thư).
- **Danh mục** một dự án «[Mẫu] Dự án căn hộ thử», hai toà A và B, mỗi toà 15 tầng × 6 trục = 180 căn. Mã căn `A-12.05`
  (toà-tầng.trục); diện tích, phòng ngủ, hướng theo trục. Đúng khuôn `CatalogFeed` phiên bản 0 của `packages/connect`.
- **Chủ nhà** 30 người «[Mẫu] Chủ nhà 01…30», số `0900 000 001`…`0900 000 030`; vài chủ có hai căn.
- **Hàng** 40 lần chào bán trên 40 căn, phủ đủ sáu trạng thái chuẩn (Tham chiếu §5), giá kèm điều kiện phí, đầu chủ, chủ
  nhà; mỗi căn tối đa một hàng đang mở; một chủ nhiều căn thì một đầu chủ (Tham chiếu §4).
- **Lead** 12 lead, số `0900 000 031`…; vài lead mới biết toà; có ca trùng để thử kiểm trùng sau này: lead trên căn đã có
  hàng mở, lead mang số của chủ nhà đã có.
- Mọi bản ghi mang `nhan: "Mẫu"`; tên người và sàn mở đầu bằng «[Mẫu]».

### Phần vào cơ sở dữ liệu

Chỉ những bảng đã có: `companies` (sàn thử), `identity."user"` (người mẫu), `company_members` (vai), `company_zones` (toà A,
B), `member_zones` (đầu chủ phụ trách toà). Danh mục, hàng, chủ nhà, lead nằm trong `du-lieu-mau.json` và được nạp khi
hàng 8 (lõi hàng), 9–10 (danh mục), 11 (lớp nguồn), 24 (ô nhận lead) dựng bảng — mỗi hàng ấy đọc tệp này.

Nhận ra bản ghi mẫu trong cơ sở dữ liệu: tên sàn đúng «[Mẫu] Sàn thử», email kết thúc `@mau.quy-hang.test`. Xoá: một giao
dịch xoá sàn thử (dây chuyền xoá thành viên, khu, khu phụ trách) rồi xoá các tài khoản mẫu không còn thuộc sàn nào; không
câu xoá nào không mang một trong hai điều kiện ấy.

## Lựa chọn và căn cứ

- Không bảng mới, không migration: ranh giới của hàng cấm `packages/db/migrations/**`; bảng hàng, lead, chủ nhà là việc của
  các hàng 8, 11, 24.
- Hai mẫu file soạn từ từ vựng Tham chiếu §4, §7 («Phí CN» là điều kiện phí, «BP» là Bao phí) vì kho chưa có file bảng hàng
  thật — câu Hỏi-1 cho chủ kho.
- Ghi `.xlsx` bằng tay thay thư viện: thêm thư viện phải sửa `package-lock.json` (ngoài ranh giới); tệp tối thiểu đủ cho
  nhập Excel đọc.
- Lệnh xoá chỉ chạm bản ghi mang nhãn mẫu — câu Hỏi-2 cho chủ kho vì là xoá dữ liệu.

## Không gian đã quét

| Trục | Giá trị | Tiêu chí |
| --- | --- | --- |
| Loại bản ghi | sàn · người · danh mục · chủ nhà · hàng · lead · dòng file A · dòng file B · dòng cơ sở dữ liệu | AC-2, AC-3 |
| Tính chất của ngưỡng | tất định · không dữ liệu thật · nhãn mẫu · xoá được một lần | AC-1, AC-2, AC-3, AC-8 |
| Luật của khuôn | khuôn danh mục · sáu trạng thái · một hàng mở mỗi căn · một chủ một đầu chủ · ca trùng của lead | AC-4, AC-5 |
| Đích | tệp trong kho · cơ sở dữ liệu | AC-1, AC-6, AC-7, AC-8 |

Hoãn: ảnh mẫu (hàng 18), dữ liệu thị trường và tin rao ngoài (Invest), dự án thật (chủ kho chọn sau), nạp danh mục, hàng,
lead vào bảng (chờ các hàng dựng bảng).

## Hỏi chủ kho

- Hỏi-1: có file bảng hàng thật để rút tiêu đề cột không? Khuyến nghị: máy soạn hai mẫu từ Tham chiếu, chủ kho thay tiêu
  đề sau (sinh lại tất định nên đổi rẻ). Lối khác: chờ file thật — hàng 5 đứng chờ.
- Hỏi-2: lệnh xoá dữ liệu mẫu. Khuyến nghị: xoá chỉ bản ghi mang nhãn mẫu (tên sàn, miền email), chạy trên Postgres của
  dãy hay máy; chưa có môi trường thật nên chưa có chặn riêng cho môi trường thật. Lối khác: không có lệnh xoá, dọn bằng
  dựng lại cơ sở dữ liệu — giá: không đạt ngưỡng «xoá được một lần».

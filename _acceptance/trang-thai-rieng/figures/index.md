# Hình tại điểm quyết định — trang-thai-rieng

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 nhãn ở company_settings + cột listings.status_label + khoá `label` của sự kiện | 4 bước nối tiếp (màn → định nghĩa nhãn → sự kiện của căn → bản hàng) + 2 nhánh (trong sàn / ra ngoài) | `luong-nhan-trang-thai.html` |
| Hỏi-2 trang khách hiện trạng thái chuẩn | chung hình với Hỏi-1 (nhánh ra ngoài) | `luong-nhan-trang-thai.html` |
| Hỏi-3 gỡ nhãn đang dùng hỏi nhãn thay cùng neo | 4 bước nối tiếp (gỡ → hỏi → chọn → mỗi căn một sự kiện) + 2 nhánh (còn căn mang / không căn nào) | `go-nhan-dang-dung.html` |
| Hỏi-4 lọc theo trạng thái chuẩn | dưới ngưỡng: 1 bước | — |
| Hỏi-5 neo cố định sau khi tạo | dưới ngưỡng: 1 bước, rẽ về Hỏi-3 | — |
| Hỏi-6 trần 3 nhãn mỗi neo | dưới ngưỡng: một con số | — |

## Đề bài `luong-nhan-trang-thai`

- Loại hình: sơ đồ luồng dữ liệu trái → phải, hai nhánh.
- Nút: Màn Trạng thái (quản trị sàn) → PUT /company/statuses → company_settings (khoá labels.status.<mã> = {label, anchor},
  nhật ký, luật dòng theo sàn) · Bảng hàng trình sửa ô (đầu chủ) → POST /listings/{id}/events `status_changed {to, label}` →
  listing_events → bản hàng listings (standard_status + status_label) → nhánh TRONG SÀN: Bảng hàng máy tính + thẻ điện thoại,
  Hôm nay (chữ «Giữ chỗ», màu của Đang giao dịch) · nhánh RA NGOÀI: lõi banRaNgoai (chỉ availability của trạng thái chuẩn) →
  trang /s/<mã>, bản phát hàng («đang giao dịch», không chữ nhãn).
- Nhãn bằng chữ: «Sàn B không thấy» trên cạnh company_settings; «đếm, lọc theo sáu trạng thái chuẩn» trên nhánh trong sàn;
  «không có trạng thái thứ bảy» ở bản hàng.
- AC liên quan: AC-1, AC-3, AC-5, AC-6, AC-7, AC-9.

## Đề bài `go-nhan-dang-dung`

- Loại hình: lưu đồ trên → dưới, một điểm rẽ.
- Nút: Quản trị bấm gỡ «Giữ chỗ» → rẽ «còn căn mang?» → KHÔNG: gỡ thẳng, Lưu ghi value null (một sự kiện nhật ký) · CÓ: hộp
  «[n] căn đang là «Giữ chỗ». Chuyển chúng sang:» với lựa chọn nhãn mặc định «Đang giao dịch» và nhãn khác cùng neo → chọn →
  Lưu → PUT kèm replace → mỗi căn một sự kiện status_changed {to: Đang giao dịch, label: nhãn thay} ghi tên quản trị → căn vẫn
  Đang giao dịch. Nhánh phụ: PUT gỡ không replace → 409 nêu số căn.
- Nhãn bằng chữ: «không đổi trạng thái chuẩn», «không sửa thẳng bản hàng».
- AC liên quan: AC-8.

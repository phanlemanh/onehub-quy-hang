# Hình tại điểm quyết định — nap-mau-ban-that

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — khoá mã hoá đi đâu | hai nhánh rẽ (job mã hoá với secret GitHub · nạp qua API bản thật) | `hoi-1-khoa.html` |
| Hỏi-2 — vai chủ kho trong sàn mẫu | dưới ngưỡng: một lựa chọn vai, không có luồng | — |
| Hỏi-3 — nhận sàn mẫu trước khi gỡ | ba bước nối tiếp (tìm theo tên → lọc quản trị mẫu → đếm 0/1/≥2) | `hoi-3-go.html` |

## Đề bài hình

- `hoi-1-khoa`: sơ đồ luồng hai nhánh. Nhánh A (máy khuyên): chủ kho chép khoá từ trình quản lý mật khẩu → secret
  GitHub environment production (chỉ nhánh main) → job «Nạp dữ liệu mẫu» mã hoá trên máy chạy job → cơ sở dữ liệu thật
  chỉ nhận bản mã. Nhánh B: khoá ở lại Vercel → job gọi một đường ghi mẫu mới trên bản thật bằng JOB_SECRET (secret
  GitHub mới) → máy chủ Vercel mã hoá → cơ sở dữ liệu. Nhãn bằng chữ; AC-2, AC-3, AC-8.
- `hoi-3-go`: lưu đồ nút gỡ. Tìm sàn tên «[Mẫu] Sàn thử» → giữ sàn có quản trị mẫu `quan-tri@mau.quy-hang.test` là
  thành viên → đếm: 0 → «không có gì để gỡ», không xoá; 1 → xoá sàn ấy theo id + tài khoản miền mẫu; ≥2 → từ chối,
  không xoá. Nhánh phụ: sàn thật trùng tên không quản trị mẫu → bị loại ở bước lọc, không đổi một dòng. AC-6.

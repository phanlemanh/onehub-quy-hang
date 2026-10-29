---
paths:
  - "apps/**"
  - "packages/**"
  - "docs/**"
---

# Luật dữ liệu cá nhân và bí mật

- Không tên, số điện thoại, địa chỉ thật của chủ nhà, khách hay môi giới trong mã, test, fixture, tài liệu. Dùng `[Tên]`,
  `0900 000 0xx`, `[Tên sàn]`.
- Khoá và chuỗi kết nối chỉ ở `.env.local` (git bỏ qua; hook chặn agent ghi). Biến mới khai ở `.env.example`.
- Dữ liệu ra ngoài công ty (trang khách, kết nối, xuất file) dựng từ luật ẩn và trần lớp dữ liệu ở `packages/core`,
  không ẩn ở giao diện. Lớp `source` không bao giờ ra ngoài.
- Không gửi tin qua Zalo cá nhân, không đăng vào nhóm, không tự trả lời — chỉ mở bảng chia sẻ của thiết bị.

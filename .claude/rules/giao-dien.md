---
paths:
  - "apps/web/**"
---

# Luật giao diện: chọn trên kho trước, tự viết sau cùng

Mạnh 30/10: ReUI (tài khoản Pro) đủ khối để chọn; việc của agent là chọn và chuyển thể, không thiết kế lại.
Vỏ, IA và khối đích của từng màn: `docs/design/vo-va-ia.md` (ADR-0002).

- **Thang dùng lại** — mỗi ô của màn, đọc từ trên xuống, dừng ở bậc đầu tiên đứng được:
  1. Ô này có cần không? Không cần thì bỏ.
  2. Khối đã chọn cho màn ở `docs/design/vo-va-ia.md` (cột «Khối đích»), hay khối đã chuyển thể trong kho.
  3. Khối ReUI khác phủ trọn ô — tìm bằng MCP `reui` (`compose_page`, `search` với `surface: "frame"`).
  4. Ví dụ `c-*` miễn phí đã ghép sẵn.
  5. Thành phần ReUI (`data-grid`, `filters`, `frame`, `badge`…) hay shadcn/ui đúng tên, kể cả biến thể qua prop.
  6. Ghép từ các thành phần đã có.
  7. Tự viết — chỉ khi sáu bậc trên đều không đứng được; ghi lý do và thêm dòng «Chỗ hở» trong `vo-va-ia.md`.
- **Chuyển thể chỉ đổi dữ liệu, chữ và prop**; giữ cấu trúc và lớp của khối. Không đổi bo góc, bóng, chiều cao, khoảng
  đệm của thành phần — style đã cài giữ chúng.
- **Một họ khung mỗi màn**: màn vận hành dùng Frame; trang khách dùng card. Không Card trong Frame hay ngược lại.
- **Style `base-nova`** (Base UI), icon `lucide`, nền neutral — như onehub-invest. Lỗi TS kiểu `render does not exist`
  là đang cài nhầm biến thể Radix.
- Chọn khối mới cho một màn → sửa cột «Khối đích» và bảng khối đã chuyển thể trong cùng PR.

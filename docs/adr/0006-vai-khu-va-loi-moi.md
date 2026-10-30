# ADR-0006: Vai, khu phụ trách và lời mời vào sàn

Ngày: 2026-10-30 · Trạng thái: **accepted** (Manh Phan duyệt Cổng Phạm vi hồ sơ `moi-nguoi-vai-khu` 30/10, cả năm
khuyến nghị) · Liên quan: ADR-0005 (đăng nhập theo sàn), Tham chiếu §2, §6, §9, hàng 7 của lộ trình

## Bối cảnh

ADR-0005 nối người với sàn qua `company_members`, nhưng chỉ đội vận hành gắn được người và chưa ai có vai. Màn S6
(Cài đặt sàn → Người dùng) cần quản trị sàn tự quản người; vai và khu là nền quyền cho mọi màn sau.

## Quyết định

1. **Năm vai cố định**, lưu thành mảng trên thành viên: `telesales`, `listing_agent` (đầu chủ), `buyer_agent` (đầu
   khách), `team_lead` (trưởng nhóm), `company_admin` (quản trị sàn). Một người giữ nhiều vai. Sàn không thêm vai.
2. **Mời là vào sàn ngay**, không có bước nhận lời — chưa có email thật để gửi lời mời; quản trị tự báo người được mời.
3. **Quản trị sàn được tạo tài khoản cho email mới và gắn người đang ở sàn khác.** Câu trả lời khi mời giống hệt nhau
   dù email đã có tài khoản hay chưa, để không ai dò được ai đang dùng Quỹ hàng.
4. **Khu là tên do sàn tự đặt** (`company_zones`); gắn vào toà / phân khu của danh mục ở hàng nạp danh mục. Khu phụ
   trách (`member_zones`) dùng khoá ngoại đôi giữ khu và thành viên cùng một sàn.
5. **Chỉ quản trị sàn** xem và sửa người của sàn, tạo khu. Luật theo dòng chặn ghi cho người không phải quản trị;
   API kiểm trước để trả mã rõ. Vai đọc lại mỗi lời gọi, không lưu trong phiên.
6. **Sàn luôn còn ít nhất một quản trị** — trigger có khoá theo sàn ở cơ sở dữ liệu.
7. **Màn Người dùng ghép từ thành phần đã cài**; khối Pro `solution-users-8` khi chủ kho thêm khoá ReUI.

## Hệ quả

- Công cụ mở sàn gắn người đầu tiên với vai quản trị sàn.
- Quyền chi tiết của từng vai ở từng màn làm cùng màn đó; lịch sử ai sửa gì theo sự kiện của hàng 8.

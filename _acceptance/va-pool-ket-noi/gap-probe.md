---
slug: va-pool-ket-noi
at: 2026-11-06T02:16:00Z
verdict: findings
p0: 0
p1: 5
p2: 0
---

# Phản biện context sạch — va-pool-ket-noi

Một tác tử tươi đọc đúng design doc, contract, evals, sổ quyết định và tệp bài học từ hồ sơ trước (claim-scan).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract + evals | «Thử lại» chỉ đo chiều âm (vẫn lỗi); chiều cơ sở dữ liệu hồi thì hiện màn không có ca đo | reset() gọi trước refresh hay ngoài startTransition: yêu cầu vẫn tới máy chủ, ranh giới vẽ lỗi cũ, E3 vẫn xanh vì cơ sở dữ liệu đang sập | đối chứng dương: bật lại cơ sở dữ liệu, bấm Thử lại, assert màn hiện và không tải lại cả trang | fixed: chỗ thử thu/dung-su-co.mjs (Postgres riêng sau công tắc mạng cổng 5599, phiên thật); AC-3 và E3 thêm bước mở công tắc → Thử lại → Hôm nay hiện, dấu window.__dauThuLai còn nguyên |
| P1 | contract + evals | Trục B năm nơi, chỉ vỏ và đăng nhập được quan sát; thước grep không có eval | một nơi gọi còn .catch(() => null) hay tự đọc /api/v1/me rồi chuyển về /login; E1 E3 vẫn xanh | thêm bước mở / và chọn sàn; eval ghim tập nơi gọi có chiều đỏ | fixed: E3 mở thêm / và /select-company; AC-6 + E10 (thu/noi-goi.test.mjs) ghim ba nơi đọc thẳng /api/v1/me, chỉ đăng nhập bắt LoiDocPhien, cấm .catch sau readMe; phá-thử trên select-company đỏ đúng tên tệp |
| P1 | contract + evals | AC-4 nói «chỉ lớp web» trong khi Notes kê .claude/launch.json, package-lock.json và config.yaml phải đổi; E4 không ghi danh sách cho phép | danh sách rộng để lọt sửa rào hay ngưỡng cổng; danh sách hẹp đỏ oan | ghi danh sách đích danh; assert config.yaml chỉ thêm khoá executor; chiều đỏ .claude/hooks và ngưỡng config | fixed: AC-4 và E4 ghi danh sách đích danh; ca mới loiConfig cho config.yaml (một dòng thêm va_pool_ket_noi); chiều đỏ gọi tên .claude/hooks/… và hồ sơ khác |
| P1 | design + evals | 3 × 5 = 15 là chạm trần; E2 đo hằng tổng ≤ 5 thay vì quan hệ | phiên bản thứ tư hay bản xem trước dùng chung DATABASE_URL vượt trần, EMAXCONNSESSION quay lại; E2 vẫn xanh | sửa số; assert bất đẳng thức chặt có số phiên bản và khách khác | fixed: pool ứng dụng 3 → 2 (tối đa 4 mỗi phiên bản); hằng SO_PHIEN_BAN_DU_KIEN 3, KHACH_KHAC 2, TRAN_POOLER 15; E2 assert 3 × 4 + 2 = 14 < 15 có thông điệp đỏ ghim; design nêu bản xem trước dùng chung và khoảng dư mỏng; dòng sổ d-2 thay bằng dòng mới |
| P1 | design (sổ d-5, d-7) | Lối chết của d-5, d-7 là cân nhắc lợi hại, không phải ràng buộc | chủ kho ký vì tưởng không còn lựa chọn | thay dòng sổ với nguồn đúng, hoặc thành câu hỏi | fixed: d-5 thay bằng dòng descope «giữ nguyên hành vi cũ của màn đăng nhập trong phạm vi bản vá» kèm revisit; d-7 thay bằng dòng nguồn mục-tiêu trích .claude/rules/giao-dien.md («Màn đi khuôn sẵn thì `skipped` hợp lệ») và ảnh màn thật đính ở contract |

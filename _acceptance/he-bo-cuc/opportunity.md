---
schema_version: 1
slug: he-bo-cuc
feature: Mọi màn sau đăng nhập chọn một trong bảy bố cục có tên của hệ bố cục — Tràn, Danh sách – chi tiết, Đọc, Hồ sơ hai cột, Bảng điều khiển, Luồng nhiều bước, Dòng tin — với sáu vùng chuẩn (đầu màn, thanh công cụ, thân, cột phụ, chân, ngăn nổi), chờ tải theo hình của bố cục, rỗng · lỗi · ngoại tuyến một luật chung, ba khổ 1440 · 1024 · 375 và một menu Tạo trên vỏ; trang mẫu sống bày mọi bố cục × trạng thái × khổ không cần cơ sở dữ liệu hay đăng nhập, ảnh chụp từ nó là ảnh chuẩn để đối chiếu màn mới
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-01T21:50:35Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 91
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 91 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Mọi màn sau đăng nhập chọn một trong bảy bố cục có tên của hệ bố cục — Tràn, Danh sách – chi tiết, Đọc, Hồ sơ hai cột, Bảng điều khiển, Luồng nhiều bước, Dòng tin — với sáu vùng chuẩn (đầu màn, thanh công cụ, thân, cột phụ, chân, ngăn nổi), chờ tải theo hình của bố cục, rỗng · lỗi · ngoại tuyến một luật chung, ba khổ 1440 · 1024 · 375 và một menu Tạo trên vỏ; trang mẫu sống bày mọi bố cục × trạng thái × khổ không cần cơ sở dữ liệu hay đăng nhập, ảnh chụp từ nó là ảnh chuẩn để đối chiếu màn mới

Vì sao: ADR-0024: so với Verve CRM (cùng họ khối ReUI) Quỹ hàng thiếu tầng bố cục giữa thang dùng lại và khuôn nhóm màn — ba chỗ chờ tải viết tay, hai kiểu căn lề, nút tạo ở hai nơi, hồ sơ toàn màn không lối về, năm kích thước tuỳ ý, ảnh đối chiếu cần Postgres và đăng nhập; chủ kho 02/11 «Duyệt hướng chung»

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Một màn dưới (app) không khai bố cục, đặt max-w hay h-[…] tay, dựng Skeleton ngoài khuôn hay gọi thẳng Sheet → npm run lint đỏ; trang mẫu sống mở không có Postgres, không đăng nhập, đủ bảy bố cục × chờ tải · rỗng · lỗi · ngoại tuyến × ba khổ; vòng giao diện so màn mới với ảnh chuẩn của bố cục nó dùng; MCP reui và shadcn chạy từ .mcp.json của kho; Cài đặt sàn (kèm Người dùng theo solution-users-8) và trang tạm đã chuyển, TrangThai chuyển thể empty-state, màn của hàng đang chạy mang ngoại lệ có hạn; skill quy-hang-ui có bảng «Bản đồ hệ thiết kế» mỗi tệp một dòng (lớp, việc, đường dẫn), docs/README.md trỏ sang bảng, một tệp hệ thiết kế thiếu dòng → kiểm chuẩn đỏ» chưa?
- Kết quả nào là SỐNG: [đề xuất] Một màn dưới (app) không khai bố cục, đặt max-w hay h-[…] tay, dựng Skeleton ngoài khuôn hay gọi thẳng Sheet → npm run lint đỏ; trang mẫu sống mở không có Postgres, không đăng nhập, đủ bảy bố cục × chờ tải · rỗng · lỗi · ngoại tuyến × ba khổ; vòng giao diện so màn mới với ảnh chuẩn của bố cục nó dùng; MCP reui và shadcn chạy từ .mcp.json của kho; Cài đặt sàn (kèm Người dùng theo solution-users-8) và trang tạm đã chuyển, TrangThai chuyển thể empty-state, màn của hàng đang chạy mang ngoại lệ có hạn; skill quy-hang-ui có bảng «Bản đồ hệ thiết kế» mỗi tệp một dòng (lớp, việc, đường dẫn), docs/README.md trỏ sang bảng, một tệp hệ thiết kế thiếu dòng → kiểm chuẩn đỏ
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Một màn dưới (app) không khai bố cục, đặt max-w hay h-[…] tay, dựng Skeleton ngoài khuôn hay gọi thẳng Sheet → npm run lint đỏ; trang mẫu sống mở không có Postgres, không đăng nhập, đủ bảy bố cục × chờ tải · rỗng · lỗi · ngoại tuyến × ba khổ; vòng giao diện so màn mới với ảnh chuẩn của bố cục nó dùng; MCP reui và shadcn chạy từ .mcp.json của kho; Cài đặt sàn (kèm Người dùng theo solution-users-8) và trang tạm đã chuyển, TrangThai chuyển thể empty-state, màn của hàng đang chạy mang ngoại lệ có hạn; skill quy-hang-ui có bảng «Bản đồ hệ thiết kế» mỗi tệp một dòng (lớp, việc, đường dẫn), docs/README.md trỏ sang bảng, một tệp hệ thiết kế thiếu dòng → kiểm chuẩn đỏ» khi hết timebox
- Timebox: [đề xuất] một lượt của đợt kế — giờ máy dự báo 1–6,5 giờ (`du-bao.json`)

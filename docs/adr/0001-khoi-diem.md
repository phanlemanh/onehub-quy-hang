# ADR-0001: Khởi điểm của kho Quỹ hàng

Ngày: 2026-10-29 · Trạng thái: **accepted** (Mạnh: «Chốt, viết ADR», «Tạo kho, dựng khung») · Gốc: ADR-0017 của
`onehub-invest` (Quỹ hàng là sản phẩm SaaS riêng; Invest cấp dữ liệu qua một kết nối một chiều có thoả thuận)

## Bối cảnh

ADR-0017 của onehub-invest chốt: Quỹ hàng là ứng dụng riêng, kho riêng tư, cơ sở dữ liệu riêng; nguyên tắc SaaS — cơ
chế ở kiến trúc, mỗi kết nối là một thoả thuận bật / tắt trong trần của lớp dữ liệu; một API cho mọi bề mặt; Invest đẩy
danh mục và số thị trường sang theo khuôn có phiên bản. Chi tiết stack để kho này chốt sau ba bài thử.

## Quyết định

1. **Một kho, một app**, nhiều gói mã dùng chung (npm workspaces, Node 24). Gói không phải dịch vụ; tách dịch vụ khi
   có bên thứ hai cần nhịp hay tải riêng.
2. **Kế thừa nguyên văn từ ADR-0017**: năm tầng (bất biến · kiến trúc · cấu hình công ty · thoả thuận · vận hành), lớp
   dữ liệu có trần, thoả thuận là đối tượng của hệ thống. Lớp và trần là mã ở `packages/core/src/data-classes.ts`;
   thoả thuận ở `packages/core/src/agreements.ts`.
3. **Cách ly**: Postgres riêng; mỗi bảng của công ty bật và ép luật theo dòng theo `app.current_company_id()` (đọc từ
   `set local app.company_id` mà API đặt trong mỗi giao dịch); API chạy bằng vai `quy_hang_app` không phải chủ bảng.
   Không đặt công ty thì không thấy gì. Bộ kiểm cách ly chạy trên Postgres thật trong CI.
4. **Trần «nguồn» khoá ở hai chỗ**: trong lõi (trả `never_leaves_company`) và trong cơ sở dữ liệu (ràng buộc từ chối
   thoả thuận có lớp `source`).
5. **API**: Hono + `@hono/zod-openapi` (cùng data-api của Invest), REST có mô tả OpenAPI, gắn vào app Next.js dưới
   `/api/v1`.
6. **Web**: Next.js 16 + React 19, cùng phiên bản onehub-invest. UI theo ReUI trên shadcn/ui, cài khi dựng màn đầu.
7. **Khuôn cấp vào `.strict()`**: khoá lạ bị từ chối — lưới chặn ở cửa nhận, bổ sung cho bộ soát ở cửa ra của Invest.
   Khuôn danh mục đang ở phiên bản 0 (nháp); Invest chỉ ghim khi lên phiên bản 1.

## Chưa chốt — sau ba bài thử

- Lưới bảng hàng: lưới dữ liệu ReUI (TanStack Table + Virtual) hay lưới vẽ canvas — bài thử 5.000 dòng × 20 cột.
- Bộ đồng bộ xuống máy: PowerSync, ElectricSQL hay tự làm mỏng — bài thử rút mạng năm phút.
- Trang khách: ảnh xem trước của link trên Zalo, lọc lượt Zalo tự lấy ảnh — bài thử với Zalo thật.
- Đăng nhập: better-auth có tổ chức là hướng khởi điểm; cách đăng nhập (email hay số điện thoại) chốt khi có sàn ngoài.
- Nơi chạy: Vercel và Supabase vùng Singapore là hướng khởi điểm; chưa tạo dự án.

## Hệ quả

- Bảng mới của công ty phải có luật theo dòng và một ca trong bộ kiểm cách ly cùng migration.
- Kết nối mới là một loại kết nối hoặc một thoả thuận mới, không phải đoạn code riêng cho một bên.

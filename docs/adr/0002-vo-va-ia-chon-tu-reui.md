# ADR-0002: Vỏ ứng dụng và IA chọn từ kho ReUI

Ngày: 2026-10-30 · Trạng thái: **accepted** khi PR gộp (Mạnh: «không phải tạo ra mà lựa chọn trên ReUI… ưu tiên lựa chọn
trên kho (reui) trước») · Liên quan: ADR-0001 mục 6, Tham chiếu §9–§10, `docs/design/vo-va-ia.md`

## Bối cảnh

Trước khi mở phiên làm màn đầu tiên, cần chốt vỏ ứng dụng (khung chung mọi màn) và cách xếp nhà (IA). Mỗi phiên tự dựng
khung thì khung lệch nhau và hàng đổi khung làm gãy mọi màn trong khu. ReUI bản Pro có 36 vỏ, khoảng 670 khối và 27
thành phần — đủ để chọn thay vì thiết kế. OneHub Invest đã đi đường này: thang dùng lại bảy bậc, danh mục khối đã chuyển
thể, bản đồ route → khối đích.

## Quyết định

1. **Chọn trên kho trước, tự viết sau cùng.** Mỗi ô của màn đi thang ở `.claude/rules/giao-dien.md`: khối đã chọn →
   khối ReUI khác → ví dụ `c-*` → thành phần → ghép → tự viết. Chuyển thể chỉ đổi dữ liệu, chữ, prop. Luật này ở
   `AGENTS.md`, áp mọi agent.
2. **Vỏ máy tính: `app-shell-8`** — cột biểu tượng cho năm nhà, cột thứ hai đổi theo nhà (chỗ của góc nhìn đã lưu và
   mục cài đặt), thanh trên có chọn sàn / dự án, ô «Gõ mã căn» ở giữa, «+ Lead». Bản đối chiếu vùng ↔ thành phần ở
   `docs/design/vo-va-ia.md` mục 1.
3. **Vỏ điện thoại: ghép** — ReUI không có thanh tab dưới. Dưới `md` ẩn cột, hiện thanh trên mảnh và bốn tab dưới ghép
   từ `Button` dẫn đường; ngăn là `Drawer`. Một mã, hai vỏ theo bề rộng.
4. **Một địa chỉ cho một thứ; màn tự đổi theo thiết bị và vai** (Tham chiếu §9). Không có route riêng cho điện thoại.
5. **Khối đích từng màn** của bản đầu chốt ở `docs/design/vo-va-ia.md` mục 2, cùng chỗ hở (mục 3) và danh sách tránh
   (mục 4). Style `base-nova`, icon lucide, họ Frame cho màn vận hành, card cho trang khách — như Invest.
6. **Vỏ là một hàng riêng trên lộ trình** (hàng 53, đứng trên hàng 4 chuẩn giao diện và hàng 7 vai), dựng trước màn đầu
   tiên; các hàng mở màn đầu của mỗi vỏ (14, 24, 32, 38) đứng trên nó.

## Hệ quả

- Lưới bảng hàng vẫn chờ bài thử hàng 1: nếu lưới ReUI không đạt 5.000 dòng thì khối đích của Bảng hàng đổi sang lưới
  vẽ canvas, các khối khác giữ.
- Đăng nhập: khối `auth-15` giả định đăng nhập bằng email; hàng 6 chốt cách đăng nhập, có thể đổi khối.
- Khối đã chuyển thể được ghi vào skill giao diện của kho mà hàng 4 dựng; tới lúc đó `vo-va-ia.md` là danh mục.
- Cài khối Pro cần `REUI_LICENSE_KEY` trong `.env.local` của máy làm và secret CI nếu CI cài lại — người đặt, agent không
  ghi `.env*`.

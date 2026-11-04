---
schema_version: 1
slug: cai-dat-hop-nhat
feature: "Mọi người dùng có một khu Cài đặt duy nhất: nhóm «Cá nhân» (hồ sơ, cài lên màn hình chính, thông báo, máy đang đăng nhập, đăng xuất — ai cũng thấy) và nhóm «Sàn [Tên]» (người dùng, cách gọi, trường, luật chia lead — chỉ quản trị); hai đường vào: menu tài khoản hay tab Tôi trên điện thoại vào «Cá nhân», biểu tượng Cài đặt trên cột nhà vào mục đầu theo quyền; nội dung đứng cạnh cột mục lục nên không trải hết bề rộng màn."
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: cai-dat-hop-nhat
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng cai-dat-hop-nhat của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Mọi người dùng có một khu Cài đặt duy nhất: nhóm «Cá nhân» (hồ sơ, cài lên màn hình chính, thông báo, máy đang đăng nhập, đăng xuất — ai cũng thấy) và nhóm «Sàn [Tên]» (người dùng, cách gọi, trường, luật chia lead — chỉ quản trị); hai đường vào: menu tài khoản hay tab Tôi trên điện thoại vào «Cá nhân», biểu tượng Cài đặt trên cột nhà vào mục đầu theo quyền; nội dung đứng cạnh cột mục lục nên không trải hết bề rộng màn.

Vì sao: chủ kho đồng ý ở phiên H ngày 04/11, khi xem Cổng Bằng chứng hàng 38 (tab Tôi). Trên máy tính, màn Tôi trải hết bề rộng: nhãn bên trái, nút bên phải cách nhau khoảng 1.140px. Tôi/Cá nhân nên là một phần của Cài đặt, một chỗ, hai đường vào, phân theo quyền (giám sát ghi hàng, H-13).

Ai gặp: mọi vai. Đầu chủ và đầu khách tìm cài đặt cá nhân (thông báo, máy đang đăng nhập) ở hai nơi khác nhau giữa điện thoại và máy tính; quản trị có thêm Cài đặt sàn ở một nhà riêng.

Dùng lại: nội dung màn Tôi hàng 38 (`apps/web/src/app/(app)/me`) làm nhóm «Cá nhân»; tab Tôi trên điện thoại giữ nguyên.

Lưu ý: giao diện ghi rõ nhóm nào áp cho cả tài khoản (xuyên sàn, ví dụ báo mất máy đăng xuất ở mọi sàn) và nhóm nào chỉ cho sàn đang làm.

Hàng này đổi ba quyết định đã niêm, mỗi quyết định sửa bằng mục sửa đổi, không viết đè:
- Vỏ ứng dụng 31/10: Cài đặt sàn là nhà riêng của quản trị → mọi vai có một khu Cài đặt, mục sàn chỉ hiện cho quản trị.
- Tham chiếu §9, bảng vai thấy nhà nào → mọi vai thấy biểu tượng Cài đặt.
- ADR-0024: bố cục Đọc không giới hạn bề rộng → nội dung Cài đặt đứng cạnh cột mục lục, có bề rộng đọc (cách B «Đọc hẹp» 48rem).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] người dùng tìm được cài đặt mình cần ở một chỗ, từ đường vào nào cũng tới, không phải hỏi «cài đặt ở đâu» không?
- Kết quả nào là SỐNG: [đề xuất] trong phiên nghiệm thu, mỗi người dự (ít nhất một đầu chủ, một quản trị) tới đúng mục cài đặt được giao trong tối đa hai lần bấm từ cả hai đường vào; trên máy tính nhãn và nút của một dòng nằm trong một tầm mắt (khối nội dung không rộng quá 48rem).
- Kết quả nào là CHẾT: [đề xuất] có người dự không tìm ra mục cài đặt cá nhân hay mục sàn sau ba lần bấm, hoặc vai không phải quản trị nhìn thấy mục cài đặt sàn.
- Timebox: [đề xuất] một vòng làm, đo ở phiên nghiệm thu ngay sau khi gộp.

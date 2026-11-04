---
schema_version: 1
slug: dang-nhap-mat-khau
feature: Người trong sàn đăng nhập được bằng email và mật khẩu tạm do sàn cấp, đổi mật khẩu ở lần đầu; mã 6 số qua email vẫn là cửa thứ nhất, đường quên mật khẩu qua thư vẫn đóng; đăng xuất mà máy chủ lỗi hay mất mạng thì báo «Chưa đăng xuất được» và cho thử lại.
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-04T16:02:07Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: dang-nhap-mat-khau
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng dang-nhap-mat-khau của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Người trong sàn đăng nhập được bằng email và mật khẩu tạm do sàn cấp, đổi mật khẩu ở lần đầu; mã 6 số qua email vẫn là cửa thứ nhất, đường quên mật khẩu qua thư vẫn đóng; đăng xuất mà máy chủ lỗi hay mất mạng thì báo «Chưa đăng xuất được» và cho thử lại.

Vì sao: Thư mã 6 số có thể chưa tới người thật (Resend chưa xác minh tên miền gửi, ADR-0009; thư rác, hộp thư công ty
chặn), và telesales, cộng tác viên thường không dùng email công ty — không có lối dự phòng thì người không vào được Quỹ
hàng. Chủ kho chọn lối A ở phiên đánh giá 04/11 (`docs/plan/danh-gia-dang-nhap-tai-khoan.md`, luật 52 của đợt): sàn cấp
mật khẩu tạm, email làm tên đăng nhập, đổi ở lần đầu; quên thì quản trị cấp lại, không qua thư. Giám sát gộp thêm luật 55
(Ngoài-1 của cai-dat-hop-nhat): đăng xuất mà máy chủ lỗi hay mất mạng thì báo «Chưa đăng xuất được» và cho thử lại.
Hạng T3 (danh tính, schema `identity`, rào gửi mã, bộ kiểm cách ly), migration giữ chỗ 034.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: người trong sàn có vào được Quỹ hàng khi thư mã không tới không, mà không mở
  thêm lối nào để quản trị sàn này chiếm tài khoản ở sàn khác?
- Kết quả nào là SỐNG: trong phiên nghiệm thu, một quản trị cấp mật khẩu tạm cho một người chỉ thuộc sàn mình;
  người ấy đăng nhập bằng email và mật khẩu tạm, đặt mật khẩu mới rồi vào vỏ, không cần thư; mã 6 số vẫn dùng được; quản
  trị không cấp được mật khẩu cho người cũng thuộc sàn khác; đăng xuất lúc mất mạng báo «Chưa đăng xuất được».
- Kết quả nào là CHẾT: người không nhận được thư mã vẫn không vào được, hoặc quản trị sàn A đặt được mật khẩu
  cho người thuộc sàn B, hoặc mật khẩu (tạm hay tự đặt) xuất hiện ở nhật ký, sự kiện hay trang nào.
- Timebox: một vòng T3, đo ở phiên nghiệm thu ngay sau khi gộp.

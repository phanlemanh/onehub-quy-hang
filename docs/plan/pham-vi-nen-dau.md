# Bản phạm vi — việc phát sinh khi đóng đợt nen-dau

Nguồn: trang tri thức của đợt (lúc đóng đợt 31/10, kèm trích đoạn phiên giám sát). Một hàng phát sinh đã làm và ký
trong đợt, cộng ba lỗ chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng của hàng 6 và hàng 8. Ba việc mới chờ Cổng Đáng,
không vào gói đợt nen-2. Không đưa lớp phủ ưu tiên.

<!-- <<<PHAM-VI-MA -->
```
dot: nen-dau
dang: lan-va
nguon: wiki/dot/nen-dau.md#015b66d24d60d7679bc3960ebb29146fdd9b4a09

- `ND1` — đổi đường API, mã lỗi và đường màn đăng nhập sang tiếng Anh, giữ nguyên hành vi và chữ trên màn (hàng phát sinh, đã ký)
- `ND2` — mọi đường gửi mã đăng nhập qua cùng giới hạn 5 lần / 15 phút; tắt đường quên mật khẩu của plugin (Ngoài-6, Ngoài-10 hàng 6)
- `ND3` — mở sàn cho công ty mới trùng tên thành một sàn riêng, không gộp vào sàn cũ (Ngoài-7, Ngoài-15 hàng 6)
- `ND4` — chốt bán với ngày bán không có thật thì báo rõ ngày sai, không trả lỗi hệ thống (Ngoài-2 hàng 8)
```
<!-- PHAM-VI-MA>>> -->

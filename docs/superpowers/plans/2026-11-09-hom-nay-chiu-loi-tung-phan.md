# Hôm nay chịu lỗi từng phần — kế hoạch

**Thiết kế:** `_acceptance/hom-nay-chiu-loi-tung-phan/design.md` · T2, một người làm tuần tự: các việc cùng chạm `hom-nay.tsx`, `gop-viec.ts` hay khối chung nên không việc nào độc lập.

| Việc | Tệp | Phục vụ | `independent` | Kiểm |
|---|---|---|---|---|
| Khối báo lỗi chung | `components/trang-thai.tsx`, `design/patterns/trang-thai.md` | E10, E10b | false | kiểm kiểu, lint |
| Đọc có thử lại, nghe mạng trở lại | `today/viec/doc-nguon.ts`, `today/viec/mang.ts`, `doc-nguon.test.ts` | E2 | false | `npm test -w @quy-hang/web`, ca «đọc kết quả có thử lại» |
| Luật thuần của Hôm nay | `today/viec/gop-viec.ts`, `gop-viec.test.ts`, `kho-so.ts`, `kho-so.test.ts` | E1, E3, E6, E7 | false | bốn ca bảng viết trước, mỗi bảng phá thử một lần |
| Nối dây Hôm nay | `today/hom-nay.tsx`, `today/viec/giao-lai.tsx` | E1b, E2b, E3b, E6b, E7b, E8, E10d | false | kiểm kiểu, lint, nhìn màn |
| Đội | `team/trang-thai.ts`, `trang-thai.test.ts`, `team/dashboard.tsx` | E2b, E4, E4b, E5, E5b | false | hai ca bảng, nhìn màn |
| Tin ở Đã gửi, Lead đã nhập | `shares/tin/*`, `leads/mine/lead-da-nhap.tsx` | E9, E9b, E10, E10d | false | ca «đọc tin», nhìn màn |

Không đổi Tham chiếu: hàng đưa các màn về đúng mẫu «Lỗi» đã chốt ở ADR-0024 (sửa đổi 09/11), không đổi điều đang đúng của sản phẩm.

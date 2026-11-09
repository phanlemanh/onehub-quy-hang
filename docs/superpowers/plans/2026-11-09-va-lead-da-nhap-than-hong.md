# Lead đã nhập không treo khi nội dung hỏng — kế hoạch

**Thiết kế:** `_acceptance/va-lead-da-nhap-than-hong/design.md` · T2, một việc.

| Việc | Tệp | Phục vụ | `independent` | Kiểm |
|---|---|---|---|---|
| Đọc danh sách qua hàm chung, kiểm từng phần tử | `leads/mine/nguon-that.tsx`, `nguon-that.test.ts` | E1, E2, E4, E1b, E2b, E3b, E4b | false | `npm test -w @quy-hang/web`, đỏ trên bản cũ rồi xanh, phá thử từng ca |

Không đổi Tham chiếu: hàng đưa màn về đúng mẫu «Lỗi» đã chốt.

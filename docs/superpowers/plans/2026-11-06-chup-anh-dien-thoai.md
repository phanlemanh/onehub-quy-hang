# Kế hoạch thi công — chup-anh-dien-thoai (hàng 41, T2)

Hợp đồng: `_acceptance/chup-anh-dien-thoai/contract.md` (duyệt 06/11). Cổng Phạm vi chốt: Hỏi-1 cho ảnh chờ trên máy kèm rào;
Hỏi-2 (b) không đặt ngăn mặc định. Verify mỗi việc theo quy ước kho (`npm run typecheck`, test của gói chạm tới).

| # | Việc | Tệp | Verify | Phục vụ | independent |
|---|---|---|---|---|---|
| 1 | API nhận mã ảnh của máy khách ở cả hai bản kho (`photoId` ở upload-url và POST kèm bản gốc), 409 khi mã đã có | `packages/api/src/photos/{routes,store}.ts`, `store.test.ts` (mới, tx giả) | `npm test -w @quy-hang/api` | E5 | true |
| 2 | Hàng chờ thật: mã ảnh tạo lúc chụp, ngày chụp chốt lúc chụp, kho ảnh chờ (giao diện chung, bản IndexedDB riêng theo người), 401 giữ chờ, 409 đối chiếu danh sách, lỗi một ảnh không chặn ảnh sau, xoá bản trên máy khi máy chủ xác nhận | `units/photos/{hang-cho-anh,kho-anh-cho,nguon-api}.ts`, `hang-cho-anh.test.ts` | `npm test -w @quy-hang/web` | E2 (phần hàng chờ), E3, E4, E7, E8 | false (sau 1 về khuôn lời gửi) |
| 3 | Ngăn chụp: không mặc định ngăn (Hỏi-2 b), «Mở máy ảnh» tắt tới khi chọn; hàng chờ một bản cho cả app theo người, khởi động ở vỏ; xoá kho ảnh chờ khi đăng xuất và máy bị báo mất | `units/ho-so/dien-thoai/chup-anh.tsx`, `units/photos/hang-cho-may.ts` (mới), `lib/sync/{react.tsx,may-bi-bao.ts,kho-indexeddb.ts}` | test web + typecheck | E1, E2, E7 | false (sau 2) |
| 4 | Ảnh lớn và mục Ảnh đọc lại khi hàng chờ báo ảnh của căn đã tải, giữ ảnh cũ trong lúc đọc | `units/ho-so/dien-thoai/anh-lon.tsx`, `units/photos/muc-anh.tsx` | test web | E9 | false (sau 3) |
| 5 | Khuôn và lint: bảng viết trước nhóm `ho-so-can`, luật KH-hs-anh-noi-bo theo Hỏi-1 | `design/patterns/ho-so-can.md`, `packages/ui-lint/tests/ban-do-khuon.test.mjs` | `npm test -w @quy-hang/ui-lint`, lưới khuôn | E10, E11 | true |
| 6 | Tham chiếu §12: lùi một phần quyết định 01/11 (ảnh chờ trên máy, ngăn mặc định) | `docs/product/tham-chieu.md` | đọc lại | luật đợt 6 | true |
| 7 | Chỗ thử cho eval nhìn: kịch bản chụp trên chỗ thử dãy H | `_acceptance/chup-anh-dien-thoai/thu/*` | chạy tay một lần | E12–E19 | false (sau 3, 4) |

Thứ tự: 1 → 2 → 3 → 4 → 5 → 6 → 7, tuần tự trong phiên (các việc độc lập nhỏ, không đáng tách worktree).

Lựa chọn chịu lực: hàng chờ ảnh KHÔNG đi qua bộ đồng bộ (luật khuôn KH-hs-anh-noi-bo, ảnh là byte); chỉ mượn nhịp thử mạng
`taoNhip` và các chỗ xoá kho. Kho ảnh chờ là cơ sở dữ liệu IndexedDB riêng `quy-hang-anh-cho:<người>`, xoá cùng kho đồng bộ.

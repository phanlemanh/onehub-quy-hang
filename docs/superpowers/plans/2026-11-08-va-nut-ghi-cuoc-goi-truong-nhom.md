# Kế hoạch — va-nut-ghi-cuoc-goi-truong-nhom

Hợp đồng: `_acceptance/va-nut-ghi-cuoc-goi-truong-nhom/contract.md` (duyệt 08/11, Hỏi-1 = không nút chính).

| # | Việc | Tệp | Kiểm | Phục vụ | independent |
|---|---|---|---|---|---|
| 1 | Luật `vaoManCuocGoi` và cờ `ghiCuocGoi` của lớp phủ hồ sơ; ma trận 12 ô + chiều đỏ | `packages/core/src/access/lop-phu-ho-so.ts`, `.test.ts` | `npm test -w @quy-hang/core` | E1 | false |
| 2 | Nút chính đọc `ghiCuocGoi`; trưởng nhóm thuần không nút; 5 ca + chiều đỏ + quét tên vai | `apps/web/src/app/(app)/units/ho-so/mo-hinh.ts`, `dien-thoai/ho-so-dien-thoai.test.ts` | `npm test -w @quy-hang/web` | E2 | false |
| 3 | Cửa màn ghi cuộc gọi đọc luật của lõi qua `call/cua.ts`; quan hệ nút ⇒ trang | `apps/web/src/app/(app)/units/call/{cua.ts,cua.test.ts,page.tsx}` | `npm test -w @quy-hang/web` | E3 | false |
| 4 | Kiểm kiểu, lint, khuôn, bộ kiểm giao diện | — | `npm run typecheck && npm run lint` · khuôn · ui-lint | E5, E6 | false |

Các việc nối tiếp nhau (2, 3 đọc cờ của 1) nên chạy tuần tự trong vòng chính.

# Kế hoạch thi công — go-ma-lo (hàng 74)

T2 (không Gate 1.5) · Cổng Phạm vi duyệt 05/11 (Hỏi-1 theo khuyến nghị). Verify mỗi task: `npm test -w @quy-hang/core`,
`npm test -w @quy-hang/api`, `npm run typecheck`, `npm run lint`.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Danh mục lõi có cấp dãy cho khu thấp tầng | `packages/core/src/catalog/types.ts` | AC-1 (tự điền đúng lô) |
| Mã lô gõ kiểu nào cũng đọc ra mã chuẩn | `packages/core/src/catalog/lot-code.ts` | AC-2, AC-5, AC-8 (đọc mã) |
| Tra mã lô ra thuộc tính, báo chưa có, không chọn hộ | `packages/core/src/catalog/lot-lookup.ts` | AC-1, AC-3, AC-4, AC-6, AC-7 |
| Bộ kiểm lõi trên bộ thử hàng 73 | `packages/core/src/catalog/lot-lookup.test.ts` | AC-1..AC-8 |
| Đường tra lô ở API, cùng cửa vào đường tra căn | `packages/api/src/catalog/{cua-vao,lots,routes}.ts` | AC-9 (đường API) |
| Bộ kiểm đường lô và danh sách đường OpenAPI | `packages/api/src/catalog/lots.test.ts`, `packages/api/src/app.test.ts` (một dòng, yêu cầu X-5) | AC-9 |

Thứ tự tuần tự: khuôn → cách đọc → bộ tra → bộ kiểm lõi → đường API → bộ kiểm API.

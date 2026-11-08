# Kế hoạch: ban-mau-khai-dia-chi

| Việc | Tệp | Kiểm từng việc | Phục vụ | Độc lập |
|---|---|---|---|---|
| Hàm `duongCuaVo` và ca kiểm | `packages/core/src/navigation.ts`, `navigation.test.ts` | `npm test -w @quy-hang/core` | E3 | không |
| Ngữ cảnh địa chỉ, `KhaiDiaChi`, nối vỏ, `diaChiMau` | `apps/web/src/components/shell/**`, `apps/web/src/app/mau/he-bo-cuc/trang-mau.tsx` | `npm run typecheck`, `npm test -w @quy-hang/web` | E1, E2, E4, E5, E5b | không |
| Bộ quét, Trang tạm, ba trang bản mẫu | `packages/ui-lint/**`, `design/patterns/trang-tam.md`, `apps/web/src/app/(app)/proto/**` | `npm test -w @quy-hang/ui-lint`, `npm run lint` | E6–E10 | không |

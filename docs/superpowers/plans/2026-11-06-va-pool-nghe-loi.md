# Kế hoạch — va-pool-nghe-loi

Thiết kế: `docs/superpowers/specs/2026-11-06-va-pool-nghe-loi-design.md` · hợp đồng: `_acceptance/va-pool-nghe-loi/contract.md`.

| Task | Files | Kiểm từng task | Phục vụ | independent |
|---|---|---|---|---|
| T1 · Pool nghe lỗi và trình chặn trên kết nối mới | `apps/web/src/lib/api.ts` | `npm test -w @quy-hang/web` + phá-thử bỏ trình nghe / ghi cấu hình | E1, E2 | false |
| T2 · Bài kiểm đơn vị bốn pool | `apps/web/src/lib/api.test.ts` | như T1 | E1, E2 | false |
| T3 · Bài thử thật cắt kết nối (rảnh, đã mượn) trên chỗ thử | `_acceptance/va-pool-nghe-loi/thu/cat-ket-noi.test.mjs`, `con-giu-pool.mts` | `node --import tsx --test …/cat-ket-noi.test.mjs` + phá-thử tắt hai trình nghe | E3, E8 | false |
| T4 · Phạm vi và nơi dựng pool | `thu/pham-vi.test.mjs`, `thu/noi-dung-pool.test.mjs`, `_acceptance/config.yaml` | `node --test` hai tệp | E4, E9 | false |
| T5 · Tham chiếu và kiểm kho | `docs/product/tham-chieu.md` | `npm run typecheck && npm run lint && npm test && npm run build` | E5–E7 | false |

Tuần tự: T3, T4 đo vật của T1; cùng tệp `api.ts`.

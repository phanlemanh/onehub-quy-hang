# Kế hoạch — va-pool-ket-noi

Thiết kế: `docs/superpowers/specs/2026-11-06-va-pool-ket-noi-design.md` · hợp đồng: `_acceptance/va-pool-ket-noi/contract.md`.
Bản vá sự cố: mã viết trước hồ sơ (PR #155 mở lúc sự cố), các task dưới ghi lại đúng thứ tự đã làm và lệnh kiểm từng task.

| Task | Files | Kiểm từng task | Phục vụ | independent |
|---|---|---|---|---|
| T1 · Pool nhỏ, nhả sớm, gắn attachDatabasePool | `apps/web/src/lib/api.ts`, `apps/web/package.json`, `package-lock.json` | `npm test -w @quy-hang/web` (ca cỡ pool, ca dungPools) + phá-thử max 10 / bỏ attach | E2 | false |
| T2 · Phân loại /me: 5xx ném LoiDocPhien | `apps/web/src/lib/api.ts`, `apps/web/src/lib/api.test.ts` | `npm test -w @quy-hang/web` (ca 5xx, ca 401/200) + phá-thử bỏ dòng 5xx | E1 | false |
| T3 · Ranh giới lỗi «Thử lại» dựng lại máy chủ; màn đăng nhập giữ ô nhập | `apps/web/src/app/error.tsx`, `apps/web/src/app/(app)/error.tsx`, `apps/web/src/app/(auth)/login/page.tsx` | máy dev `web-su-co-pool` + chỗ thử `dung-su-co.mjs`: tắt → trang lỗi, mở → Thử lại → Hôm nay | E3 | false |
| T4 · Chỗ thử và bài kiểm hồ sơ | `_acceptance/va-pool-ket-noi/thu/*`, `.claude/launch.json`, `apps/web/next.config.ts`, `_acceptance/config.yaml` | `node --test "_acceptance/va-pool-ket-noi/thu/*.test.mjs"` + phá-thử select-company `.catch` | E4, E10 | false |
| T5 · Kiểm kho | — | `npm run typecheck && npm run lint && npm test && npm run test:hooks && npm run build` | E5–E9 | false |

Không task nào độc lập — cùng chạm `api.ts` hay phụ thuộc kết quả của task trước; chạy tuần tự.

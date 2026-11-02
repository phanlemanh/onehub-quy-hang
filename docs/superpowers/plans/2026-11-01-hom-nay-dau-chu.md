# Hôm nay của đầu chủ — kế hoạch thi công

**Spec:** `docs/superpowers/specs/2026-11-01-hom-nay-dau-chu-design.md` · **Hợp đồng:** `_acceptance/hom-nay-dau-chu/contract.md`.

## Hợp đồng giao diện giữa các task

- Lõi `@quy-hang/core/today`: `BO_NHOM_MAC_DINH`, `boMacDinh`, `docBoNhom(rows) → { bo, nguon, loi }`, `kiemBoNhom(raw)`,
  `nhomCuaCan`, `nhomCuaLead`, `chiaNhom`, `dungVoiCan`, kiểu `Nhom`, `BoNhom`, `DuKienCan`, `LanDoi`.
- `GET /api/v1/listings` (và `/{id}`) thêm: `listAgentKey`, `priceChangeTimestamp`, `statusChangeTimestamp`,
  `lastPriceChange`, `lastStatusChange` = `{ at, byUserId, byRoles, from, to } | null`.
- `GET /api/v1/leads/assigned` → mảng `{ id, buildingName, unitNumber, need, priceText, createdAt, stage, acceptedAt,
  acceptDueAt, callDueAt }`; 403 khi không vai `listing_agent`.
- `GET /api/v1/company/settings/queue` → `{ groups, source: "default" | "company", errors }`; `PUT` thân `{ groups }`, chỉ
  `company_admin`, sai → 400 `{ error, details: [{ path, reason }] }`.

## Task

1. **Lõi** (`packages/core/src/today/`) — phục vụ E1–E4 — xong.
2. **API** (`packages/api/src/today/`, `listings/`, `leads/`, `test-db/hom-nay.test.ts`) — E3b, E4b, E5, E6. independent của 3.
3. **Màn và đồng bộ** (`apps/web/src/app/(app)/today/`, `lib/sync/`, `design/patterns/hom-nay-dau-chu.md`, thử ui-lint
   hàng 22, `thu/dung-g.mjs`) — E2 (web), E5b, E7–E11. Dùng hợp đồng giao diện, không chờ 2.
4. **Tài liệu** — Tham chiếu (Hỏi-5 nhãn, §12), `vo-va-ia.md` §2, `catalog.md` khối đã chuyển thể.
